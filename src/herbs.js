'use strict';

/**
 * Herb reference data.
 *
 * range.min / range.max: daily dose in mg.
 * status:
 *   'provided'     - dose taken from the project's eye health reference table
 *   'needs_review' - dose is a general working range; verify against the sources before use
 * sources: keys into SOURCES below.
 * flags: conditions that should prompt a clinician check (used by --conditions).
 */

const SOURCES = Object.freeze({
  woodside: {
    title: 'Woodside: Herbs and Medicinal Plants (list provided by project owner)',
    url: null,
  },
  projectTable: {
    title: 'Eye health reference table (project owner)',
    url: null,
  },
  whoVol3: {
    title: 'WHO Monographs on Selected Medicinal Plants, Vol. 3 (2007)',
    url: 'https://apps.who.int/iris/bitstream/handle/10665/42052/9789241547024_eng.pdf?sequence=3&isAllowed=y',
  },
  nccih: {
    title: 'NCCIH Herbs at a Glance',
    url: 'https://nccih.nih.gov/health/herbsataglance',
  },
  emaEchinacea2007: {
    title: 'EMA HMPC meeting report, March 2007 (echinacea draft)',
    url: 'https://ema.europa.eu/en/documents/committee-report/committee-herbal-medicinal-products-hmpc-meeting-report-7-8-march-2007_en.pdf',
  },
  emaGinger2011: {
    title: 'EMA HMPC meeting report, July 2011 (ginger draft)',
    url: 'https://www.ema.europa.eu/documents/committee-report/committee-herbal-medicinal-products-hmpc-meeting-report-11-12-july-2011_en.pdf',
  },
  emaRhodiola2011: {
    title: 'EMA HMPC meeting report, September 2011',
    url: 'https://www.ema.europa.eu/en/documents/committee-report/committee-herbal-medicinal-products-hmpc-meeting-report-12-13-september-2011_en.pdf',
  },
  emaGinkgo2014: {
    title: 'EMA HMPC meeting report, January 2014 (ginkgo leaf draft)',
    url: 'https://www.ema.europa.eu/en/documents/committee-report/hmpc-meeting-report-community-herbal-monographs-guidelines-and-other-activities-27-28-january-2014_en.pdf',
  },
  emaGinsengEleuthero2014: {
    title: 'EMA HMPC meeting report, March 2014 (ginseng and eleuthero)',
    url: 'https://www.ema.europa.eu/system/files/documents/committee-report/wc500164759_en.pdf',
  },
  emaChamomile2014: {
    title: 'EMA HMPC meeting report, June/July 2014 (chamomile flower)',
    url: 'https://www.ema.europa.eu/en/documents/committee-report/hmpc-meeting-report-community-herbal-monographs-guidelines-and-other-activities-30-june-1-july-2014_en.pdf',
  },
  emaCommunity2010: {
    title: 'EMA HMPC community monographs list (2010: harpagophytum, turmeric, peppermint oil)',
    url: 'https://www.ema.europa.eu/system/files/documents/committee-report/wc500005966_en.pdf',
  },
});

const CURATED_HERBS = Object.freeze({
  // ---- Eye health (from the project's reference table) ----
  bilberry: {
    id: 'bilberry',
    name: 'Bilberry',
    latin: 'Vaccinium myrtillus',
    form: '25% standardized extract',
    range: { min: 240, max: 480 },
    basis: 'Clinical studies',
    status: 'provided',
    sources: ['projectTable'],
    flags: ['blood_thinners', 'diabetes'],
    cautions: [
      'May add to the effect of blood thinners.',
      'May lower blood sugar; use caution with diabetes medication.',
    ],
  },
  saffron: {
    id: 'saffron',
    name: 'Saffron',
    latin: 'Crocus sativus',
    form: 'Stigma extract or powder',
    range: { min: 20, max: 30 },
    basis: 'Clinical studies (macular health)',
    status: 'provided',
    sources: ['projectTable'],
    flags: ['pregnancy'],
    cautions: [
      'Doses far above the studied range can be toxic.',
      'Avoid medicinal amounts during pregnancy.',
    ],
  },
  ginkgo: {
    id: 'ginkgo',
    name: 'Ginkgo',
    latin: 'Ginkgo biloba',
    form: 'Standardized extract (EGb 761 equivalent)',
    range: { min: 120, max: 120 },
    basis: 'Standardized extract dose',
    status: 'provided',
    sources: ['projectTable', 'emaGinkgo2014', 'nccih'],
    flags: ['blood_thinners', 'seizures', 'antidepressants', 'surgery'],
    cautions: [
      'Increases bleeding risk with anticoagulant or antiplatelet drugs.',
      'Can interact with some antidepressants and seizure medications.',
    ],
  },
  shatavari: {
    id: 'shatavari',
    name: 'Shatavari',
    latin: 'Asparagus racemosus',
    form: 'Root powder',
    range: { min: 500, max: 2000 },
    basis: 'Ayurvedic typical use',
    status: 'provided',
    sources: ['projectTable'],
    flags: ['hormone_sensitive', 'pregnancy'],
    cautions: [
      'May have estrogen-like activity; avoid with hormone-sensitive conditions unless advised.',
    ],
  },
  fennel: {
    id: 'fennel',
    name: 'Fennel',
    latin: 'Foeniculum vulgare',
    form: 'Seed powder or extract',
    range: { min: 500, max: 1000 },
    basis: 'Traditional use',
    status: 'provided',
    sources: ['projectTable'],
    flags: ['pregnancy', 'hormone_sensitive'],
    cautions: [
      'Avoid medicinal amounts during pregnancy.',
      'May cause allergy in people sensitive to carrot-family plants.',
    ],
  },

  // ---- Digestive comfort ----
  ginger: {
    id: 'ginger',
    name: 'Ginger',
    latin: 'Zingiber officinale',
    form: 'Dried rhizome powder',
    range: { min: 500, max: 1000 },
    basis: 'Traditional use (EMA draft monograph)',
    status: 'needs_review',
    sources: ['emaGinger2011'],
    flags: ['blood_thinners', 'gallstones'],
    cautions: [
      'May increase bleeding risk with anticoagulant or antiplatelet drugs.',
      'Can aggravate gallstones; ask a doctor first if you have them.',
    ],
  },
  peppermint: {
    id: 'peppermint',
    name: 'Peppermint oil',
    latin: 'Mentha x piperita',
    form: 'Enteric-coated essential oil',
    range: { min: 180, max: 540 },
    basis: 'Clinical studies (digestive symptoms)',
    status: 'needs_review',
    sources: ['emaCommunity2010'],
    flags: ['gerd'],
    cautions: [
      'Can worsen heartburn and reflux (use enteric-coated capsules).',
      'Not suitable for young children.',
    ],
  },
  chamomile: {
    id: 'chamomile',
    name: 'Chamomile',
    latin: 'Matricaria chamomilla',
    form: 'Dried flower',
    range: { min: 1000, max: 3000 },
    basis: 'Traditional use (EMA monograph)',
    status: 'needs_review',
    sources: ['emaChamomile2014'],
    flags: ['ragweed_allergy'],
    cautions: [
      'Can cause allergic reactions in people sensitive to the daisy family (ragweed, chrysanthemum).',
    ],
  },

  // ---- Sleep and calm ----
  passionflower: {
    id: 'passionflower',
    name: 'Passionflower',
    latin: 'Passiflora incarnata',
    form: 'Dried herb',
    range: { min: 500, max: 2000 },
    basis: 'Traditional use (EMA revised monograph)',
    status: 'needs_review',
    sources: ['emaGinsengEleuthero2014'],
    flags: ['sedatives', 'pregnancy'],
    cautions: [
      'May add to the drowsiness of sedatives and sleep medication.',
      'Avoid medicinal amounts during pregnancy.',
    ],
  },

  // ---- Immune support ----
  echinacea: {
    id: 'echinacea',
    name: 'Echinacea',
    latin: 'Echinacea purpurea',
    form: 'Dried herb',
    range: { min: 900, max: 1800 },
    basis: 'Traditional use (EMA draft monograph)',
    status: 'needs_review',
    sources: ['emaEchinacea2007', 'nccih'],
    flags: ['autoimmune'],
    cautions: [
      'Use with caution in autoimmune conditions; the evidence on immune stimulation is mixed.',
    ],
  },
  eleuthero: {
    id: 'eleuthero',
    name: 'Eleuthero',
    latin: 'Eleutherococcus senticosus',
    form: 'Root extract',
    range: { min: 300, max: 600 },
    basis: 'Traditional use (EMA revised monograph)',
    status: 'needs_review',
    sources: ['emaGinsengEleuthero2014'],
    flags: ['hypertension', 'pregnancy'],
    cautions: [
      'May affect blood pressure; use caution with hypertension.',
      'Avoid medicinal amounts during pregnancy.',
    ],
  },

  // ---- Joint comfort ----
  turmeric: {
    id: 'turmeric',
    name: 'Turmeric',
    latin: 'Curcuma longa',
    form: 'Curcumin extract (95%)',
    range: { min: 500, max: 1000 },
    basis: 'Clinical studies (EMA community list)',
    status: 'needs_review',
    sources: ['emaCommunity2010', 'nccih'],
    flags: ['blood_thinners', 'gallstones'],
    cautions: [
      'May increase bleeding risk with anticoagulant or antiplatelet drugs.',
      'Can aggravate gallstones.',
    ],
  },
  harpagophytum: {
    id: 'harpagophytum',
    name: 'Devil\'s claw',
    latin: 'Harpagophytum procumbens',
    form: 'Dried root',
    range: { min: 600, max: 1200 },
    basis: 'Traditional use (EMA community monograph)',
    status: 'needs_review',
    sources: ['emaCommunity2010'],
    flags: ['peptic_ulcer', 'gallstones', 'pregnancy'],
    cautions: [
      'Can worsen peptic ulcers and gallstone problems.',
      'Avoid during pregnancy.',
    ],
  },
});

// ---- Woodside catalog: names only, no dose data yet ----
// Status 'catalog_only'. The blend engine refuses these until a dose range
// and sources are added. Spellings are kept as listed in the source document.
const CATALOG_NAMES = [
  ['achillea_millefolium', 'Yarrow', 'Achillea millefolium'],
  ['adhatoda', 'Adhatoda', null],
  ['aloe_vera', 'Aloe vera', 'Aloe vera'],
  ['amaranth', 'Amaranth', null],
  ['anise', 'Anise', null],
  ['artemisia', 'Artemisia', null],
  ['artichoke', 'Artichoke', null],
  ['arugula', 'Arugula', null],
  ['asparagus_officinalis', 'Asparagus Officinalis', 'Asparagus officinalis'],
  ['avocado', 'Avocado', null],
  ['balsam', 'Balsam', null],
  ['bamboo', 'Bamboo', null],
  ['basil', 'Basil', null],
  ['bay_leaf', 'Bay leaf', null],
  ['banana', 'Banana', null],
  ['betel', 'Betel', null],
  ['borage', 'Borage', null],
  ['brahmi', 'Brahmi', null],
  ['bryophyllum', 'Bryophyllum', null],
  ['carom', 'Carom', null],
  ['catnip', 'Catnip', null],
  ['calendula', 'Calendula', null],
  ['caraway', 'Caraway', null],
  ['cardamom', 'Cardamom', null],
  ['celery', 'Celery', null],
  ['chards', 'Chards', null],
  ['chickweed', 'Chickweed', null],
  ['chives', 'Chives', null],
  ['cinnamon', 'Cinnamon', null],
  ['cineraria', 'Cineraria (Dusty Miller)', 'Cineraria'],
  ['coriander', 'Coriander', null],
  ['costus_igneous', 'Costus Igneous', null],
  ['cress', 'Cress', null],
  ['cumin', 'Cumin', null],
  ['curry_leaf', 'Curry Leaf', null],
  ['dandelion', 'Dandelion', null],
  ['dill', 'Dill', null],
  ['elder', 'Elder', null],
  ['eupatorium', 'Eupatorium', null],
  ['evening_primrose', 'Evening Primrose', null],
  ['feaverfew', 'Feaverfew', null],
  ['fenugreek', 'Fenugreek', null],
  ['galangal', 'Galangal', null],
  ['garlic', 'Garlic', null],
  ['garlic_chive', 'Garlic Chive', null],
  ['golden_rods', 'Golden Rods', null],
  ['hyssop', 'Hyssop', null],
  ['lantana', 'Lantana', null],
  ['lavender', 'Lavender', null],
  ['lemon_balm', 'Lemon Balm', null],
  ['lemon_grass', 'Lemon Grass', null],
  ['marjoram', 'Marjoram', null],
  ['mint', 'Mint', null],
  ['nasturtium', 'Nasturtium', null],
  ['nigella', 'Nigella', null],
  ['oregano', 'Oregano', null],
  ['ocimum_basilicum_red_rubin', "Ocimum basilicum 'Red Rubin'", "Ocimum basilicum 'Red Rubin'"],
  ['parsley', 'Parsley', null],
  ['pepper', 'Pepper', null],
  ['pepino', 'Pepino', null],
  ['pine', 'Pine', null],
  ['plectranthus_amboinicus', 'Plectranthus amboinicus', 'Plectranthus amboinicus'],
  ['portulaca_oleracea', 'Portulaca oleracea', 'Portulaca oleracea'],
  ['pyrethrum', 'Pyrethrum', null],
  ['rhubarb', 'Rhubarb', null],
  ['rose', 'Rose', null],
  ['rosemary', 'Rosemary', null],
  ['rue', 'Rue', null],
  ['russelia', 'Russelia', null],
  ['sage', 'Sage', 'Salvia officinalis'],
  ['santolina_chamaecyparissus', 'Santolina Chamaecyparissus', 'Santolina chamaecyparissus'],
  ['spearmint', 'Spearmint', null],
  ['stevia', 'Stevia', null],
  ['tarragon', 'Tarragon', null],
  ['tea_tree', 'Tea tree', null],
  ['thyme', 'Thyme', null],
  ['vervain', 'Vervain', null],
  ['verbascum_thapsus', 'Verbascum Thapsus (Mullein)', 'Verbascum thapsus'],
  ['vetiver', 'Vetiver', null],
  ['vinca_minor', 'Vinca Minor', 'Vinca minor'],
  ['viola_odorata', 'Viola Odorata', 'Viola odorata'],
  ['water_cress', 'Water Cress', null],
  ['wheat_grass', 'Wheat grass', null],
];

const CATALOG_HERBS = Object.fromEntries(
  CATALOG_NAMES.map(([id, name, latin]) => [
    id,
    {
      id,
      name,
      latin,
      form: null,
      range: null,
      basis: 'No dose data yet',
      status: 'catalog_only',
      sources: ['woodside'],
      flags: [],
      cautions: [],
    },
  ])
);

module.exports = {
  HERBS: Object.freeze({ ...CURATED_HERBS, ...CATALOG_HERBS }),
  SOURCES,
};

