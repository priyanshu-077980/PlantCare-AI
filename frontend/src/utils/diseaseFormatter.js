/**
 * Formats backend class names (e.g., "Tomato___Tomato_Early_blight" or "Apple___Apple_scab")
 * into human-readable plant and condition names, with actionable agricultural insights.
 */

// Agricultural advisory guidelines database
const ADVISORY_DATABASE = {
  healthy: {
    status: 'Healthy',
    category: 'Optimal Health',
    severity: 'None',
    description: 'Vigorous crop canopy with no evident pathogen activity, necrosis, or foliar lesions.',
    treatments: [
      'Maintain standard drip or furrow irrigation schedule avoiding foliage wetting.',
      'Continue balanced macronutrient and micronutrient fertigation program.',
      'Conduct routine bi-weekly field scouting for early pest or pathogen vectors.',
      'Ensure proper crop spacing to promote continuous canopy ventilation.'
    ]
  },
  early_blight: {
    status: 'Diseased',
    category: 'Fungal Infection (Alternaria spp.)',
    severity: 'Moderate to High',
    description: 'Characterized by concentric ring lesions ("target-board" spots) on mature leaves, eventually leading to chlorosis and defoliation.',
    treatments: [
      'Immediately prune and destroy heavily infected lower leaves.',
      'Avoid overhead sprinkler irrigation; water at soil line early in the day.',
      'Apply preventative copper-based fungicides or bio-fungicide (Bacillus subtilis).',
      'Rotate crops with non-solanaceous species for a minimum of 2-3 seasons.'
    ]
  },
  late_blight: {
    status: 'Diseased',
    category: 'Oomycete Infection (Phytophthora infestans)',
    severity: 'Critical / High Risk',
    description: 'Rapidly spreading water-soaked dark lesions with pale fungal halo underneath under cool, humid conditions.',
    treatments: [
      'Apply systemic oomycide fungicides (such as Chlorothalonil or Mancozeb) immediately.',
      'Remove and safely bag infected plants to prevent airborne spore dissemination.',
      'Drastically reduce field humidity by opening greenhouse vents or clearing weed canopies.',
      'Sanitize all pruning tools in 10% bleach solution between crop rows.'
    ]
  },
  scab: {
    status: 'Diseased',
    category: 'Fungal Pathogen (Venturia spp.)',
    severity: 'Moderate',
    description: 'Olive-green to velvety brown velvety lesions on foliage and corky surface lesions on developing fruit.',
    treatments: [
      'Rake and compost or destroy fallen leaf litter beneath trees to eliminate overwintering spores.',
      'Apply sulfur or systemic sterol-inhibitor sprays during spring bud-break.',
      'Thin inner branches to allow maximum sunlight penetration and rapid leaf drying.'
    ]
  },
  rust: {
    status: 'Diseased',
    category: 'Basidiomycete Fungus (Puccinia spp.)',
    severity: 'Moderate',
    description: 'Orange, yellow, or reddish-brown powdery spore pustules primarily on leaf undersides.',
    treatments: [
      'Prune severely infected leaves at earliest detection.',
      'Apply protective triazole or azoxystrobin fungicides.',
      'Ensure adequate potassium nutrition to fortify plant cell wall resistance.'
    ]
  },
  black_rot: {
    status: 'Diseased',
    category: 'Fungal / Bacterial Complex',
    severity: 'High',
    description: 'Dark necrotic rings expanding along leaf margins with premature fruit mummification.',
    treatments: [
      'Remove all mummified fruits and dead wood during dormant pruning.',
      'Apply captan or myclobutanil fungicides during new spring growth.',
      'Ensure proper drainage to prevent water stagnation around roots.'
    ]
  },
  powdery_mildew: {
    status: 'Diseased',
    category: 'Erysiphales Fungus',
    severity: 'Mild to Moderate',
    description: 'White talcum-powder like superficial fungal mycelium coating upper leaf surfaces.',
    treatments: [
      'Apply potassium bicarbonate or horticultural neem oil spray during early signs.',
      'Increase air circulation around dense plant stands.',
      'Avoid excess nitrogen fertilizer which stimulates vulnerable tender growth.'
    ]
  },
  bacterial_spot: {
    status: 'Diseased',
    category: 'Bacterial Infection (Xanthomonas spp.)',
    severity: 'High',
    description: 'Small angular dark brown water-soaked specks surrounded by yellowish halos.',
    treatments: [
      'Spray fixed-copper bactericide mixed with mancozeb for improved control.',
      'Refrain from touching or working among crops while foliage is wet.',
      'Use certified disease-free pathogen-tested seeds and transplants.'
    ]
  },
  default_disease: {
    status: 'Diseased',
    category: 'Foliar Pathogen',
    severity: 'Attention Required',
    description: 'Visible foliar symptoms indicating active pathogen stress, chlorosis, or vascular impairment.',
    treatments: [
      'Isolate affected plants or prune symptomatic foliage to arrest pathogen progression.',
      'Inspect underside of leaves with 10x hand lens for insect vectors or fungal spores.',
      'Adjust irrigation to avoid wet foliage and improve ambient air circulation.',
      'Consult local agricultural extension advisor for targeted chemical / biological treatment.'
    ]
  }
};

/**
 * Parses raw backend class names like "Tomato___Tomato_Early_blight"
 */
export function formatClassName(rawName) {
  if (!rawName) return { plant: 'Unknown Plant', condition: 'Unknown Condition', isHealthy: false };

  // Split on triple underscore
  const parts = rawName.split('___');
  let rawPlant = parts[0] || rawName;
  let rawCondition = parts[1] || parts[0];

  // Clean plant name
  let plant = rawPlant
    .replace(/_/g, ' ')
    .replace(/bell/i, 'Bell')
    .trim();
  // Capitalize properly
  plant = plant.charAt(0).toUpperCase() + plant.slice(1);

  // If plant name repeated in condition (e.g. Tomato_Early_blight)
  if (parts[1]) {
    let cond = parts[1];
    // Remove duplicate plant prefix in condition if present
    const prefixRegex = new RegExp(`^${rawPlant}[_\\s]*`, 'i');
    cond = cond.replace(prefixRegex, '');
    rawCondition = cond;
  }

  // Check if healthy
  const isHealthy = /healthy/i.test(rawName);

  // Clean condition name
  let condition = rawCondition
    .replace(/_/g, ' ')
    .trim();

  // Standardize capitalization
  condition = condition
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  if (isHealthy) {
    condition = 'Healthy & Vigorous';
  } else if (!condition) {
    condition = 'General Pathology';
  }

  // Retrieve advisory
  let advisoryKey = 'default_disease';
  if (isHealthy) {
    advisoryKey = 'healthy';
  } else {
    const lower = rawName.toLowerCase();
    if (lower.includes('early_blight') || lower.includes('early blight')) advisoryKey = 'early_blight';
    else if (lower.includes('late_blight') || lower.includes('late blight')) advisoryKey = 'late_blight';
    else if (lower.includes('scab')) advisoryKey = 'scab';
    else if (lower.includes('rust')) advisoryKey = 'rust';
    else if (lower.includes('black_rot') || lower.includes('black rot')) advisoryKey = 'black_rot';
    else if (lower.includes('mildew')) advisoryKey = 'powdery_mildew';
    else if (lower.includes('bacterial') || lower.includes('blight')) advisoryKey = 'bacterial_spot';
  }

  const advisory = ADVISORY_DATABASE[advisoryKey] || ADVISORY_DATABASE.default_disease;

  return {
    plant,
    condition,
    isHealthy,
    rawName,
    advisory
  };
}

