'use strict';

const els = {
  form: document.getElementById('builder-form'),
  ailment: document.getElementById('ailment'),
  profile: document.getElementById('profile'),
  dose: document.getElementById('dose'),
  servings: document.getElementById('servings'),
  capsule: document.getElementById('capsule'),
  conditions: document.getElementById('conditions'),
  error: document.getElementById('error'),
  results: document.getElementById('results'),
  resultTitle: document.getElementById('result-title'),
  resultSummary: document.getElementById('result-summary'),
  print: document.getElementById('print'),
  cards: document.getElementById('cards'),
  alerts: document.getElementById('alerts'),
  ingredients: document.getElementById('ingredients'),
  reviewNote: document.getElementById('review-note'),
  cautions: document.getElementById('cautions'),
  sources: document.getElementById('sources'),
  disclaimer: document.getElementById('disclaimer'),
  evidenceNote: document.getElementById('evidence-note'),
  evidenceList: document.getElementById('evidence-list'),
};

let ailments = [];

/** Creates an element. Text is always set with textContent, never innerHTML. */
function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null) continue;
    if (key === 'text') node.textContent = value;
    else if (key === 'class') node.className = value;
    else node.setAttribute(key, value);
  }
  for (const child of children) {
    if (child) node.append(child);
  }
  return node;
}

function clear(node) {
  node.replaceChildren();
}

async function getJson(url) {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
  return body;
}

function showError(message) {
  els.error.textContent = message;
  els.error.hidden = false;
}

function clearError() {
  els.error.hidden = true;
  els.error.textContent = '';
}

function fillProfiles(ailmentId) {
  const ailment = ailments.find((a) => a.id === ailmentId);
  clear(els.profile);
  els.profile.append(el('option', { value: 'standard', text: 'Standard' }));
  if (ailment) {
    for (const p of ailment.profiles) {
      els.profile.append(el('option', { value: p.id, text: p.label }));
    }
  }
  els.profile.disabled = !ailment || ailment.profiles.length === 0;
}

function renderSummaryCards(r) {
  clear(els.cards);
  const items = [
    ['Daily serving', `${r.dailyServing.totalMg} mg`],
    [
      'Capsules per day',
      `${r.dailyServing.capsulesPerDay} × ${r.dailyServing.capsuleMg} mg (about ${r.dailyServing.mgPerCapsule} mg blend each)`,
    ],
    ['Total blend', `${r.totalBlend.grams} g`],
    ['Supply', `${r.totalBlend.servings} days`],
  ];
  for (const [label, value] of items) {
    els.cards.append(
      el('div', { class: 'card' },
        el('span', { class: 'card-label', text: label }),
        el('strong', { class: 'card-value', text: value }))
    );
  }
}

function renderAlerts(r) {
  clear(els.alerts);
  if (!r.alerts.length) return;
  els.alerts.append(
    el('div', { class: 'alert', role: 'alert' },
      el('strong', { text: 'Check with a clinician before taking this blend' }),
      el('ul', {}, ...r.alerts.map((a) => el('li', { text: a.message }))))
  );
}

function renderTable(r) {
  clear(els.ingredients);
  const headers = ['Herb', 'Daily dose', 'Blend %', 'Per capsule', 'Batch', 'Basis'];
  const thead = el('thead', {}, el('tr', {}, ...headers.map((h) => el('th', { text: h }))));
  const tbody = el('tbody');

  for (const i of r.ingredients) {
    const nameCell = el('td', {},
      el('strong', { text: i.name }),
      i.status === 'needs_review'
        ? el('span', { class: 'flag', title: 'Working range. Verify against the cited source before use.', text: ' *' })
        : null,
      el('div', { class: 'latin', text: i.latin }));

    tbody.append(el('tr', {},
      nameCell,
      el('td', { text: `${i.dailyDoseMg} mg` }),
      el('td', { text: `${i.blendPercent}%` }),
      el('td', { text: `${i.perCapsuleMg} mg` }),
      el('td', { text: `${(i.batchMg / 1000).toFixed(2)} g` }),
      el('td', { text: i.basis })));
  }
  els.ingredients.append(thead, tbody);

  if (r.reviewNeeded.length) {
    els.reviewNote.hidden = false;
    els.reviewNote.textContent =
      `* Dose for ${r.reviewNeeded.join(', ')} is a working range. Verify it against the cited source before use.`;
  } else {
    els.reviewNote.hidden = true;
  }
}

function renderLists(r) {
  clear(els.cautions);
  for (const c of r.cautions) els.cautions.append(el('li', { text: c }));

  clear(els.sources);
  for (const s of r.sources) {
    const item = s.url
      ? el('a', { href: s.url, target: '_blank', rel: 'noopener noreferrer', text: s.title })
      : el('span', { text: s.title });
    els.sources.append(el('li', {}, item));
  }

  els.disclaimer.textContent = r.disclaimer;
}

function render(r) {
  els.results.hidden = false;
  els.resultTitle.textContent = `${r.ailment.name} blend`;
  els.resultSummary.textContent =
    `${r.ailment.summary} Profile: ${r.profile.label}. Dose level: ${r.dose}.`;
  renderSummaryCards(r);
  renderAlerts(r);
  renderTable(r);
  renderLists(r);
  renderEvidence(r);
  els.results.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/** Only http(s) links are built, from a DOI that has been URL-encoded. */
function doiUrl(doi) {
  return doi ? `https://doi.org/${encodeURIComponent(doi)}` : null;
}

function evidenceCard(ingredient) {
  const ev = ingredient.evidence;
  const tr = ingredient.traditional;
  const children = [el('h4', { text: ingredient.name })];

  if (ev) {
    children.push(el('p', {
      class: 'ev-line',
      text: `Papers in HERB: ${ev.papersTotal} · Clinical: ${ev.clinicalPapers} · Transcriptomic datasets: ${ev.transcriptomicDatasets}`,
    }));
    if (ev.keyCompound) {
      children.push(el('p', {
        class: 'ev-line',
        text: `Key compound (${ev.keyCompound.label}): ${ev.keyCompound.distinctPapers} papers, matched by name`,
      }));
    }
    if (ev.recentClinical.length) {
      children.push(el('p', { class: 'ev-line', text: 'Recent clinical papers:' }));
      children.push(el('ul', { class: 'list' }, ...ev.recentClinical.map((p) => {
        const label = `${p.title} (${p.year}, ${p.journal})`;
        const url = doiUrl(p.doi);
        return el('li', {}, url
          ? el('a', { href: url, target: '_blank', rel: 'noopener noreferrer', text: label })
          : el('span', { text: label }));
      })));
    }
  } else {
    children.push(el('p', { class: 'ev-line muted', text: 'No HERB paper records for this herb.' }));
  }

  if (tr) {
    const cnLine = `Traditional Chinese name: ${tr.cnName || 'n/a'}` +
      (tr.recordCount > 1 ? ` (${tr.recordCount} HERB records; check which applies)` : '');
    children.push(el('p', { class: 'ev-line', text: cnLine }));
    if (tr.usePart) children.push(el('p', { class: 'ev-line', text: `Part used (HERB): ${tr.usePart}` }));
    if (tr.function) children.push(el('p', { class: 'ev-line', text: `Traditional function: ${tr.function}` }));
    if (tr.indication) children.push(el('p', { class: 'ev-line', text: `Traditional indications: ${tr.indication}` }));
    if (tr.toxicity) children.push(el('p', { class: 'ev-line', text: `Toxicity (HERB): ${tr.toxicity}` }));
    if (tr.note) children.push(el('p', { class: 'ev-line muted', text: tr.note }));
  }

  return el('div', { class: 'evidence-card' }, ...children);
}

function renderEvidence(r) {
  clear(els.evidenceList);
  if (r.ailmentEvidence) {
    els.evidenceNote.textContent =
      `HERB disease records matching this concern: ${r.ailmentEvidence.diseaseMatches} (name-pattern match, not a curated mapping). ` +
      'Paper and compound counts come from the HERB v2 database. Traditional descriptions are from Chinese medicine and are not clinical evidence.';
  } else {
    els.evidenceNote.textContent = 'Traditional descriptions are from Chinese medicine and are not clinical evidence.';
  }
  for (const ingredient of r.ingredients) {
    els.evidenceList.append(evidenceCard(ingredient));
  }
}

async function onSubmit(event) {
  event.preventDefault();
  clearError();

  const servings = Number(els.servings.value);
  if (!Number.isInteger(servings) || servings < 1 || servings > 365) {
    showError('Days of supply must be a whole number from 1 to 365.');
    return;
  }

  const checked = [...els.conditions.querySelectorAll('input:checked')].map((input) => input.value);
  const params = new URLSearchParams({
    ailment: els.ailment.value,
    profile: els.profile.value,
    dose: els.dose.value,
    servings: String(servings),
    capsule: els.capsule.value,
  });
  if (checked.length) params.set('conditions', checked.join(','));

  try {
    render(await getJson(`/api/blend?${params.toString()}`));
  } catch (err) {
    els.results.hidden = true;
    showError(err.message);
  }
}

async function init() {
  try {
    const [ailmentList, conditionList] = await Promise.all([
      getJson('/api/ailments'),
      getJson('/api/conditions'),
    ]);
    ailments = ailmentList;

    for (const a of ailments) {
      els.ailment.append(el('option', { value: a.id, text: a.name }));
    }
    if (ailments.length) fillProfiles(ailments[0].id);

    for (const c of conditionList) {
      els.conditions.append(
        el('label', { class: 'check' },
          el('input', { type: 'checkbox', value: c.id }),
          el('span', { text: c.label }))
      );
    }
  } catch (err) {
    showError(`Could not load options: ${err.message}`);
  }
}

els.ailment.addEventListener('change', () => fillProfiles(els.ailment.value));
els.form.addEventListener('submit', onSubmit);
els.print.addEventListener('click', () => window.print());

init();
