'use strict';

const { HERBS, SOURCES } = require('./herbs');
const { AILMENTS } = require('./ailments');
const { getEvidence, getTraditional, getAilmentEvidence } = require('./evidence');

const DOSE_LEVELS = ['low', 'mid', 'high'];
const DEFAULTS = Object.freeze({ dose: 'low', servings: 30, capsuleMg: 500, profile: 'standard', conditions: [] });

const round = (n, places = 0) => {
  const f = 10 ** places;
  return Math.round(n * f) / f;
};

/** Picks a dose from the reference range: low = min, high = max, mid = midpoint. */
function doseFor(range, level) {
  if (level === 'low') return range.min;
  if (level === 'high') return range.max;
  return round((range.min + range.max) / 2);
}

/** Applies defaults, ignoring options that were not supplied. */
function resolveOptions(options) {
  const opts = { ...DEFAULTS, conditions: [...DEFAULTS.conditions] };
  for (const [key, value] of Object.entries(options)) {
    if (value !== undefined && value !== null && value !== '') opts[key] = value;
  }
  if (typeof opts.conditions === 'string') {
    opts.conditions = opts.conditions.split(',').map((c) => c.trim()).filter(Boolean);
  }
  return opts;
}

/** Chooses the herb list: the standard list, or a named profile (scenario) for the ailment. */
function resolveHerbList(ailment, profileId) {
  if (profileId === 'standard') return { id: 'standard', label: 'Standard', herbs: ailment.herbs };
  const profile = ailment.profiles[profileId];
  if (!profile) {
    const options = ['standard', ...Object.keys(ailment.profiles)].join(', ');
    throw new Error(`Unknown profile "${profileId}" for ${ailment.id}. Options: ${options}`);
  }
  return { id: profileId, label: profile.label, herbs: profile.herbs };
}

/**
 * Builds a herbal blend for an ailment and profile.
 *
 * Blend percentage is each herb's share of the daily serving, so percentages
 * always match the doses. Batch values scale that serving across the requested
 * number of servings. `conditions` (e.g. ['blood_thinners']) produce alerts
 * for any herb flagged with that condition.
 */
function buildBlend(ailmentId, options = {}) {
  const ailment = AILMENTS[ailmentId];
  if (!ailment) {
    throw new Error(`Unknown ailment "${ailmentId}". Try one of: ${Object.keys(AILMENTS).join(', ')}`);
  }

  const opts = resolveOptions(options);
  if (!DOSE_LEVELS.includes(opts.dose)) {
    throw new Error(`dose must be one of: ${DOSE_LEVELS.join(', ')}`);
  }
  const servings = Number(opts.servings);
  if (!Number.isInteger(servings) || servings < 1) {
    throw new Error('servings must be a whole number of 1 or more');
  }
  const capsuleMg = Number(opts.capsuleMg);
  if (!(capsuleMg > 0)) {
    throw new Error('capsuleMg must be greater than 0');
  }

  const herbList = resolveHerbList(ailment, opts.profile);

  const items = herbList.herbs.map(({ herb: herbId, role }) => {
    const herb = HERBS[herbId];
    if (!herb) throw new Error(`Ailment "${ailment.id}" references unknown herb "${herbId}"`);
    if (!herb.range) throw new Error(`"${herb.name}" has no dose data yet and cannot be used in a blend`);
    return { herb, role, dailyMg: doseFor(herb.range, opts.dose) };
  });

  const dailyTotalMg = items.reduce((sum, item) => sum + item.dailyMg, 0);
  const capsulesPerDay = Math.ceil(dailyTotalMg / capsuleMg);
  const mgPerCapsule = round(dailyTotalMg / capsulesPerDay, 1);
  const batchTotalMg = dailyTotalMg * servings;

  const ingredients = items.map(({ herb, role, dailyMg }) => {
    const share = dailyMg / dailyTotalMg;
    const { min, max } = herb.range;
    return {
      id: herb.id,
      name: herb.name,
      latin: herb.latin,
      form: herb.form,
      role,
      dailyDoseMg: dailyMg,
      referenceRangeMg: min === max ? `${min}` : `${min}-${max}`,
      basis: herb.basis,
      status: herb.status,
      blendPercent: round(share * 100, 1),
      perCapsuleMg: round(share * mgPerCapsule, 1),
      batchMg: dailyMg * servings,
      cautions: herb.cautions,
      evidence: getEvidence(herb.id),
      traditional: getTraditional(herb.id),
    };
  });

  const alerts = [];
  for (const item of items) {
    for (const condition of opts.conditions) {
      if (item.herb.flags.includes(condition)) {
        alerts.push({
          herb: item.herb.name,
          condition,
          message: `${item.herb.name} is flagged for "${condition.replace(/_/g, ' ')}". Review with a clinician before use.`,
        });
      }
    }
  }

  const sourceKeys = [...new Set(items.flatMap((item) => item.herb.sources))];
  const sources = sourceKeys.map((key) => SOURCES[key]);

  return {
    ailment: { id: ailment.id, name: ailment.name, summary: ailment.summary },
    profile: { id: herbList.id, label: herbList.label },
    dose: opts.dose,
    dailyServing: { totalMg: dailyTotalMg, capsuleMg, capsulesPerDay, mgPerCapsule },
    totalBlend: { servings, mg: batchTotalMg, grams: round(batchTotalMg / 1000, 2) },
    ingredients,
    alerts,
    cautions: [...new Set(items.flatMap((item) => item.herb.cautions))],
    reviewNeeded: items.filter((i) => i.herb.status === 'needs_review').map((i) => i.herb.name),
    sources,
    ailmentEvidence: getAilmentEvidence(ailment.id),
    disclaimer: ailment.disclaimer,
  };
}

/** Lists all herbs with ranges and status, for the herbs command and the API. */
function listHerbs() {
  return Object.values(HERBS).map((h) => ({
    id: h.id,
    name: h.name,
    latin: h.latin,
    form: h.form,
    dailyRangeMg: h.range ? `${h.range.min}-${h.range.max}` : 'no data',
    status: h.status,
    flags: h.flags,
  }));
}

module.exports = { buildBlend, doseFor, listHerbs, DOSE_LEVELS };
