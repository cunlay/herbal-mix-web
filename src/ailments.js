'use strict';

/**
 * Ailments, the herbs recommended for each, and optional profiles (scenarios).
 * A profile replaces the standard herb list for a specific goal.
 * Every herb id must exist in herbs.js.
 */

const GENERAL_DISCLAIMER =
  'Educational use only, not medical advice. Check with a doctor or pharmacist before taking ' +
  'herbs, especially if you take prescription medication or are pregnant or breastfeeding.';

const AILMENTS = Object.freeze({
  eye_health: {
    id: 'eye_health',
    name: 'Eye health',
    summary: 'Supports macular pigment, retinal circulation and visual comfort.',
    herbs: [
      { herb: 'bilberry', role: 'Anthocyanins for capillary and retinal support' },
      { herb: 'saffron', role: 'Carotenoids for macular health' },
      { herb: 'ginkgo', role: 'Microcirculation to the eye' },
      { herb: 'shatavari', role: 'Traditional support for eye and overall vitality' },
      { herb: 'fennel', role: 'Traditional eye-soothing support' },
    ],
    profiles: {
      antioxidant_focus: {
        label: 'Antioxidant and macular focus (no traditional-only herbs)',
        herbs: [
          { herb: 'bilberry', role: 'Anthocyanins for capillary and retinal support' },
          { herb: 'saffron', role: 'Carotenoids for macular health' },
          { herb: 'ginkgo', role: 'Microcirculation to the eye' },
        ],
      },
    },
    disclaimer:
      'Glaucoma, macular degeneration and diabetic retinopathy need diagnosis and treatment from an ' +
      'eye care professional. ' + GENERAL_DISCLAIMER,
  },

  digestive_comfort: {
    id: 'digestive_comfort',
    name: 'Digestive comfort',
    summary: 'Eases nausea, bloating and cramping from everyday digestive upset.',
    herbs: [
      { herb: 'ginger', role: 'Soothes nausea and supports stomach emptying' },
      { herb: 'peppermint', role: 'Relaxes gut muscle to ease cramping' },
      { herb: 'chamomile', role: 'Gentle calming support for the gut' },
      { herb: 'fennel', role: 'Eases gas and bloating' },
    ],
    profiles: {
      gas_bloating: {
        label: 'Gas and bloating',
        herbs: [
          { herb: 'peppermint', role: 'Relaxes gut muscle to ease cramping' },
          { herb: 'fennel', role: 'Eases gas and bloating' },
        ],
      },
    },
    disclaimer:
      'Persistent, severe or unexplained digestive symptoms, blood in stool, or weight loss need ' +
      'medical assessment. ' + GENERAL_DISCLAIMER,
  },

  sleep_support: {
    id: 'sleep_support',
    name: 'Sleep and calm',
    summary: 'Supports relaxation and falling asleep at bedtime.',
    herbs: [
      { herb: 'passionflower', role: 'Calming support for restlessness' },
      { herb: 'chamomile', role: 'Gentle evening relaxation' },
    ],
    profiles: {},
    disclaimer:
      'Chronic insomnia, sleep apnea or low mood should be evaluated by a clinician. ' + GENERAL_DISCLAIMER,
  },

  immune_support: {
    id: 'immune_support',
    name: 'Immune support',
    summary: 'Supports general immune function during seasonal illness.',
    herbs: [
      { herb: 'echinacea', role: 'Traditional support during seasonal colds' },
      { herb: 'eleuthero', role: 'Adaptogenic support for stress and recovery' },
    ],
    profiles: {},
    disclaimer:
      'Fever, breathlessness or symptoms lasting more than a few days need medical care. ' +
      'People with autoimmune disease or on immune-suppressing drugs should consult a clinician first. ' +
      GENERAL_DISCLAIMER,
  },

  joint_comfort: {
    id: 'joint_comfort',
    name: 'Joint comfort',
    summary: 'Supports mild, everyday joint stiffness and discomfort.',
    herbs: [
      { herb: 'turmeric', role: 'Curcumin for inflammation-related discomfort' },
      { herb: 'ginger', role: 'Supports comfort in mild joint stiffness' },
      { herb: 'harpagophytum', role: 'Traditional support for joint and back pain' },
    ],
    profiles: {},
    disclaimer:
      'Joint swelling, redness, or pain that wakes you at night needs medical assessment. ' +
      GENERAL_DISCLAIMER,
  },
  anxiety_stress: {
    id: 'anxiety_stress',
    name: 'Anxiety and stress',
    summary: 'Supports calm and relaxation during everyday stress and nervous tension.',
    herbs: [
      { herb: 'passionflower', role: 'Calming support for nervous tension' },
      { herb: 'chamomile', role: 'Gentle calming support in the evening' },
    ],
    profiles: {},
    disclaimer:
      'Persistent anxiety, panic attacks or low mood need assessment by a clinician. ' +
      'Passionflower can add to the effect of sedatives and sleep medication. ' + GENERAL_DISCLAIMER,
  },

  nausea: {
    id: 'nausea',
    name: 'Nausea',
    summary: 'Eases mild queasiness, such as an upset stomach or nausea from travel.',
    herbs: [
      { herb: 'ginger', role: 'Traditional support for mild nausea' },
      { herb: 'chamomile', role: 'Traditional support for stomach upset' },
    ],
    profiles: {},
    disclaimer:
      'Vomiting that will not stop, blood in vomit, severe abdominal pain, nausea in pregnancy, ' +
      'or nausea after surgery or chemotherapy needs medical care. ' + GENERAL_DISCLAIMER,
  },

  irritable_bowel: {
    id: 'irritable_bowel',
    name: 'Irritable bowel symptoms',
    summary: 'Supports cramping, bloating and gut discomfort linked to irritable bowel symptoms.',
    herbs: [
      { herb: 'peppermint', role: 'Relaxes gut muscle to ease cramping' },
      { herb: 'chamomile', role: 'Gentle calming support for the gut' },
      { herb: 'fennel', role: 'Eases gas and bloating' },
    ],
    profiles: {},
    disclaimer:
      'Irritable bowel symptoms need a diagnosis. Blood in stool, weight loss, fever, or new symptoms ' +
      'after age 50 need prompt medical review. Peppermint can worsen heartburn. ' + GENERAL_DISCLAIMER,
  },

  menstrual_discomfort: {
    id: 'menstrual_discomfort',
    name: 'Menstrual discomfort',
    summary: 'Supports cramping and discomfort during menstruation.',
    herbs: [
      { herb: 'ginger', role: 'Traditional support for menstrual cramps' },
      { herb: 'chamomile', role: 'Calming support for cramping' },
      { herb: 'fennel', role: 'Traditional support for cramping' },
      { herb: 'shatavari', role: 'Traditional women\'s health support' },
    ],
    profiles: {},
    disclaimer:
      'Heavy bleeding, severe or new pain, irregular cycles, or pain that does not respond to usual care ' +
      'need medical assessment. Fennel and shatavari are hormone-active; avoid them during pregnancy and ' +
      'with hormone-sensitive conditions. ' + GENERAL_DISCLAIMER,
  },
});

module.exports = { AILMENTS };
