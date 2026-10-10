'use strict';

/**
 * Loads HERB-derived evidence and traditional-use data (built by the importer
 * scripts in the herbal-mix project). Missing files give null results, so the
 * app still works without them.
 *
 * Nothing here changes dose data. These are context only.
 */

const fs = require('fs');
const path = require('path');

function loadJson(name) {
  const file = path.join(__dirname, 'data', name);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

const EVIDENCE = loadJson('herb_evidence.json');
const TRADITIONAL = loadJson('herb_traditional.json');

/** Evidence counts for a herb, or null if HERB has no record of it. */
function getEvidence(herbId) {
  const e = EVIDENCE && EVIDENCE.herbs[herbId];
  if (!e) return null;
  return {
    papersTotal: e.papers_total,
    clinicalPapers: e.clinical_papers,
    transcriptomicDatasets: e.transcriptomic_datasets,
    recentClinical: (e.recent_clinical || []).slice(0, 3).map((p) => ({
      title: p.title,
      journal: p.journal,
      year: p.year,
      doi: p.doi ? p.doi.trim() : null,
      pubmedId: p.pubmed_id,
    })),
    keyCompound: e.key_compound
      ? {
          label: e.key_compound.label,
          distinctPapers: e.key_compound.distinct_papers,
          note: e.key_compound.note,
        }
      : null,
    source: EVIDENCE.source_url,
  };
}

/** Traditional Chinese medicine description from HERB, or null. */
function getTraditional(herbId) {
  const t = TRADITIONAL && TRADITIONAL.herbs[herbId];
  if (!t || !t.records.length) return null;
  const r = t.records[0];
  return {
    match: t.match,
    note: t.note,
    recordCount: t.records.length,
    cnName: r.cn_name,
    usePart: r.use_part,
    function: r.function,
    indication: r.indication,
    toxicity: r.toxicity,
    source: TRADITIONAL.source_url,
  };
}

/** Count of HERB disease records matching an ailment's name pattern, or null. */
function getAilmentEvidence(ailmentId) {
  const a = EVIDENCE && EVIDENCE.ailments && EVIDENCE.ailments[ailmentId];
  if (!a) return null;
  return { diseaseMatches: a.disease_matches, note: a.note };
}

module.exports = { getEvidence, getTraditional, getAilmentEvidence };
