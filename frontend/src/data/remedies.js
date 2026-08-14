/**
 * Comprehensive Crop Disease Remedies, Treatments & Management Knowledge Base
 * Covers all 38 supported crop disease classes with Organic, Chemical, and Preventative recommendations.
 */

export const CROP_REMEDIES = {
  // Tomato Diseases
  'Tomato___Late_blight': {
    crop: 'Tomato',
    disease: 'Late Blight',
    pathogenType: 'Oomycete (Phytophthora infestans)',
    severity: 'High',
    immediateActions: [
      'Immediately isolate infected plants and prune affected leaves/stems during dry weather.',
      'Seal and dispose of infected foliage in bags — do not add to compost heaps.',
      'Sterilize pruning shears with 70% isopropyl alcohol or 10% bleach between plants.',
    ],
    organic: [
      {
        title: 'Copper Fungicide / Bordeaux Mixture',
        application: 'Spray liquid copper octanoate or 1% Bordeaux mixture at first sign of disease. Reapply every 7-10 days after rainfall.',
        notes: 'Eco-friendly and approved for organic gardening; acts as a protective barrier on foliage.',
      },
      {
        title: 'Bacillus subtilis Bio-Fungicide (Serenade)',
        application: 'Apply 10-15 ml per liter of water as a preventative foliar spray in the early morning.',
        notes: 'Beneficial bacteria that colonize leaf surfaces and outcompete fungal pathogens.',
      },
      {
        title: 'Baking Soda & Neem Foliar Spray',
        application: 'Mix 1 tbsp baking soda, 1 tsp cold-pressed neem oil, and 1/2 tsp mild liquid soap in 4 liters of water. Spray top and bottom of leaves.',
        notes: 'Alters leaf pH to inhibit spore germination and repels insect vectors.',
      },
    ],
    chemical: [
      {
        name: 'Chlorothalonil 75% WP (Bravo / Daconil)',
        dosage: '2.0 - 2.5 g per liter of water',
        safety: 'Broad-spectrum protective fungicide. Wear PPE. Do not apply within 7 days of harvest.',
      },
      {
        name: 'Mancozeb 75% WP (Dithane M-45)',
        dosage: '2.5 g per liter of water',
        safety: 'Contact fungicide. Ensure thorough coverage of both leaf surfaces.',
      },
      {
        name: 'Metalaxyl + Mancozeb (Ridomil Gold MZ)',
        dosage: '2.0 g per liter of water',
        safety: 'Systemic curative + contact protection. Apply immediately when outbreak is active.',
      },
      {
        name: 'Cymoxanil + Mancozeb (Curzate)',
        dosage: '2.0 g per liter of water',
        safety: 'Locally systemic fungicide with kick-back action within 48 hours of infection.',
      },
    ],
    prevention: [
      {
        title: 'Drip Irrigation & Soil Mulch',
        description: 'Always water at the base of plants. Use straw or black plastic mulch to prevent soil spores splashing onto lower leaves.',
      },
      {
        title: 'Wide Spacing & Airflow',
        description: 'Space plants 24–36 inches apart and stake or cage vines to promote rapid leaf drying after dew or rain.',
      },
      {
        title: 'Crop Rotation & Separation',
        description: 'Never plant tomatoes directly adjacent to or following potatoes. Rotate Solanaceae crops on a 3-year cycle.',
      },
    ],
  },

  'Tomato___Early_blight': {
    crop: 'Tomato',
    disease: 'Early Blight',
    pathogenType: 'Fungus (Alternaria solani)',
    severity: 'Medium',
    immediateActions: [
      'Prune all bottom leaves within 12 inches of the soil level (bottom-pruning).',
      'Remove and discard spotted leaves showing concentric bullseye rings.',
      'Avoid handling plants when wet with morning dew.',
    ],
    organic: [
      {
        title: 'Neem Oil Spray (3000 ppm)',
        application: 'Mix 5 ml cold-pressed neem oil + 2 ml mild soap in 1 liter of water. Spray weekly.',
        notes: 'Botanical anti-fungal that disrupts fungal cell membranes and stops spore germination.',
      },
      {
        title: 'Trichoderma viride Bio-Control',
        application: 'Apply 5-10 g/liter as root drench or foliar spray to strengthen plant defenses.',
        notes: 'Bio-fungicide that parasitizes Alternaria mycelium in soil and foliage.',
      },
    ],
    chemical: [
      {
        name: 'Azoxystrobin 23% SC (Amistar)',
        dosage: '1.0 ml per liter of water',
        safety: 'Translaminar systemic fungicide. Rotate with contact fungicides to prevent resistance.',
      },
      {
        name: 'Chlorothalonil 75% WP',
        dosage: '2.0 g per liter of water',
        safety: 'Apply every 7-10 days as soon as lower leaves show symptoms.',
      },
    ],
    prevention: [
      {
        title: 'Heavy Mulching',
        description: 'Apply a 2-3 inch organic mulch layer (straw, dry grass) to prevent soil-borne Alternaria spores from splashing onto foliage.',
      },
      {
        title: 'Morning Watering',
        description: 'Irrigate early in the morning so foliage dries quickly under sunlight.',
      },
    ],
  },

  'Tomato___Bacterial_spot': {
    crop: 'Tomato',
    disease: 'Bacterial Spot',
    pathogenType: 'Bacterium (Xanthomonas spp.)',
    severity: 'High',
    immediateActions: [
      'Avoid overhead watering immediately — moisture spreads bacteria rapidly.',
      'Prune symptomatic branches only during hot, dry afternoon hours.',
      'Sanitize tools with 70% alcohol after each plant.',
    ],
    organic: [
      {
        title: 'Copper Hydroxide Spray (Kocide)',
        application: '2 g per liter of water applied every 7-10 days.',
        notes: 'Controls bacterial populations on leaf surfaces. Approved for organic production.',
      },
      {
        title: 'Pseudomonas fluorescens Bio-Bactericide',
        application: '5 g per liter as foliar spray in the evening.',
        notes: 'Produces antagonistic metabolites that suppress Xanthomonas bacteria.',
      },
    ],
    chemical: [
      {
        name: 'Copper Oxychloride 50% WP + Streptocycline',
        dosage: '2.5 g Copper Oxychloride + 0.1 g Streptocycline per liter of water',
        safety: 'Standard agricultural bactericide tank mix. Observe 5-day pre-harvest interval.',
      },
      {
        name: 'Kasugamycin 3% SL',
        dosage: '2.0 ml per liter of water',
        safety: 'Targeted antibiotic bactericide. Highly effective for persistent spots.',
      },
    ],
    prevention: [
      {
        title: 'Certified Disease-Free Seed',
        description: 'Use hot-water treated or certified disease-free seeds and certified nursery transplants.',
      },
      {
        title: 'Avoid Working in Wet Fields',
        description: 'Never cultivate, prune, or harvest when vines are wet to prevent mechanical transmission.',
      },
    ],
  },

  'Tomato___Leaf_Mold': {
    crop: 'Tomato',
    disease: 'Leaf Mold',
    pathogenType: 'Fungus (Passalora fulva)',
    severity: 'Medium',
    immediateActions: [
      'Increase greenhouse or garden ventilation immediately to lower relative humidity below 85%.',
      'Remove severely yellowed lower leaves.',
    ],
    organic: [
      {
        title: 'Potassium Bicarbonate (MilStop / Armicarb)',
        application: '3-4 g per liter of water with a natural wetting agent.',
        notes: 'Instantly dehydrates fungal spores and creates an inhospitable leaf surface.',
      },
      {
        title: 'Sulfur-based Bio Spray',
        application: '2 g wettable sulfur per liter (do not apply when temperatures exceed 32°C).',
        notes: 'Prevents mold spread on leaf undersides.',
      },
    ],
    chemical: [
      {
        name: 'Difenoconazole 25% EC (Score)',
        dosage: '0.5 - 1.0 ml per liter of water',
        safety: 'Systemic triazole fungicide. Excellent curative and preventative action.',
      },
    ],
    prevention: [
      {
        title: 'Humidity Management',
        description: 'Ensure cross-ventilation in polytunnels/greenhouses; avoid overcrowding plants.',
      },
    ],
  },

  'Tomato___Septoria_leaf_spot': {
    crop: 'Tomato',
    disease: 'Septoria Leaf Spot',
    pathogenType: 'Fungus (Septoria lycopersici)',
    severity: 'Medium',
    immediateActions: [
      'Strip infected lower leaves showing tiny dark spots with white/gray centers.',
      'Clean fallen debris beneath plants to eliminate overwintering fungal bodies.',
    ],
    organic: [
      {
        title: 'Copper Octanoate (Liquid Copper)',
        application: 'Spray at 10-day intervals at 2.5 ml per liter.',
        notes: 'Gentle on foliage while providing reliable protection against Septoria.',
      },
    ],
    chemical: [
      {
        name: 'Chlorothalonil 75% WP or Mancozeb 75% WP',
        dosage: '2.0 g per liter of water',
        safety: 'Apply every 7 to 10 days until new foliage grows healthy.',
      },
    ],
    prevention: [
      {
        title: 'Foliar Distance from Soil',
        description: 'Keep the bottom 12-18 inches of stems clear of leaves through regular pruning.',
      },
    ],
  },

  'Tomato___Spider_mites_Two-spotted_spider_mite': {
    crop: 'Tomato',
    disease: 'Spider Mites Infestation',
    pathogenType: 'Pest / Acari (Tetranychus urticae)',
    severity: 'High',
    immediateActions: [
      'Spray high-pressure water streams on leaf undersides to knock down mite colonies and webbing.',
      'Prune and discard heavily webbed terminal shoots.',
    ],
    organic: [
      {
        title: 'Insecticidal Soap / Horticultural Oil',
        application: 'Apply potassium salts of fatty acids (2%) thoroughly coating leaf undersides.',
        notes: 'Suffocates mites and their eggs without leaving toxic residues.',
      },
      {
        title: 'Neem Oil EC (10,000 ppm)',
        application: 'Mix 3-5 ml per liter of water and spray every 4-5 days for 2 weeks.',
        notes: 'Disrupts mite hormonal cycle and prevents egg hatching.',
      },
      {
        title: 'Beneficial Predatory Mites (Phytoseiulus persimilis)',
        application: 'Release predatory mites into greenhouse or canopy.',
        notes: 'Natural biological predators that feed voraciously on two-spotted spider mites.',
      },
    ],
    chemical: [
      {
        name: 'Abamectin 1.9% EC (Vertimec)',
        dosage: '0.5 - 0.75 ml per liter of water',
        safety: 'Selective translaminar miticide. High efficacy against resistant mite strains.',
      },
      {
        name: 'Spiromesifen 22.9% SC (Oberon)',
        dosage: '1.0 ml per liter of water',
        safety: 'Lipid synthesis inhibitor with great activity against mite nymphs and adults.',
      },
    ],
    prevention: [
      {
        title: 'Avoid Dry Dusty Environments',
        description: 'Keep paths moistened; mites thrive in hot, dry, dusty conditions.',
      },
    ],
  },

  'Tomato___Target_Spot': {
    crop: 'Tomato',
    disease: 'Target Spot',
    pathogenType: 'Fungus (Corynespora cassiicola)',
    severity: 'Medium',
    immediateActions: [
      'Prune infected leaves with target-like brown lesions.',
      'Ensure proper drainage and eliminate standing water.',
    ],
    organic: [
      {
        title: 'Copper Hydroxide + Neem Bio-Mix',
        application: 'Spray copper hydroxide (2 g/L) alternated with neem oil (5 ml/L) weekly.',
        notes: 'Protects foliage and prevents fungal spread.',
      },
    ],
    chemical: [
      {
        name: 'Pyraclostrobin + Boscalid (Cabrio Duo)',
        dosage: '1.5 g per liter of water',
        safety: 'Dual-mode systemic fungicide with strong curative and residual activity.',
      },
    ],
    prevention: [
      {
        title: 'Canopy Thinning',
        description: 'Prune excess suckers to improve sunlight penetration and air circulation.',
      },
    ],
  },

  'Tomato___Tomato_Yellow_Leaf_Curl_Virus': {
    crop: 'Tomato',
    disease: 'Tomato Yellow Leaf Curl Virus (TYLCV)',
    pathogenType: 'Virus (Geminivirus / Begomovirus) via Whiteflies',
    severity: 'High',
    immediateActions: [
      'Uproot and immediately bag virus-infected plants — no chemical can cure the plant once infected.',
      'Install yellow sticky traps (1 trap every 10-15 sq. meters) to monitor and capture whiteflies.',
    ],
    organic: [
      {
        title: 'Whitefly Bio-Control with Beauveria bassiana',
        application: 'Foliar spray of entomopathogenic fungus Beauveria bassiana (5 g/L) in late evening.',
        notes: 'Infects and eliminates whitefly populations naturally.',
      },
      {
        title: 'Neem Oil + Castor Oil Barrier',
        application: 'Spray 5 ml neem oil per liter every 5 days to repel feeding whiteflies.',
        notes: 'Prevents vector insects from feeding on young apical leaves.',
      },
    ],
    chemical: [
      {
        name: 'Imidacloprid 17.8% SL or Thiamethoxam 25% WG',
        dosage: '0.5 ml Imidacloprid OR 0.3 g Thiamethoxam per liter of water',
        safety: 'Systemic insecticide to eliminate whitefly vectors. Avoid spraying during bee pollination hours.',
      },
      {
        name: 'Acetamiprid 20% SP',
        dosage: '0.4 g per liter of water',
        safety: 'Fast knockdown of sucking pests including whitefly nymphs.',
      },
    ],
    prevention: [
      {
        title: 'Fine Insect Netting (50-mesh)',
        description: 'Cover seedlings and nursery beds with 50-mesh nylon insect netting to exclude whiteflies completely.',
      },
      {
        title: 'Resistant Cultivars',
        description: 'Plant TYLCV-resistant tomato hybrids (e.g., Tyking, Mountain Gem, Abhinav).',
      },
    ],
  },

  'Tomato___Tomato_mosaic_virus': {
    crop: 'Tomato',
    disease: 'Tomato Mosaic Virus (ToMV)',
    pathogenType: 'Virus (Tobamovirus)',
    severity: 'High',
    immediateActions: [
      'Remove and burn infected plants immediately (do not compost).',
      'Wash hands thoroughly with soap/milk before touching any healthy plants.',
      'Do not allow tobacco users to handle plants without washing hands (tobacco transmits tobamoviruses).',
    ],
    organic: [
      {
        title: 'Skim Milk Solution Wash',
        application: 'Dip hands and pruning tools in 20% skim milk or non-fat dry milk solution before pruning.',
        notes: 'Milk proteins inactivate the virus coat protein and prevent mechanical transmission.',
      },
    ],
    chemical: [
      {
        name: 'No chemical cure available for viral infections',
        dosage: 'Focus on sanitation and vector control',
        safety: 'Use TSP (Trisodium Phosphate 10%) or 10% household bleach to sanitize pots, stakes, and trellises.',
      },
    ],
    prevention: [
      {
        title: 'Resistant Seeds & Sanitation',
        description: 'Purchase certified TMV/ToMV-resistant seed stock. Clean all equipment between seasons.',
      },
    ],
  },

  'Tomato___healthy': {
    crop: 'Tomato',
    disease: 'Healthy Crop',
    pathogenType: 'None',
    severity: 'None',
    immediateActions: [
      'No disease treatment needed! Continue standard good agricultural practices.',
    ],
    organic: [
      {
        title: 'Compost Tea & Seaweed Extract',
        application: 'Apply seaweed liquid fertilizer (3 ml/L) every 14 days as foliar nutrition.',
        notes: 'Boosts plant immunity, leaf chlorophyll, and flowering vigor.',
      },
    ],
    chemical: [
      {
        name: 'Balanced N-P-K (19-19-19) Foliar Nutrition',
        dosage: '3.0 - 5.0 g per liter of water every 15 days during active growth',
        safety: 'Provides balanced macro-nutrients for high fruit setting.',
      },
    ],
    prevention: [
      {
        title: 'Regular Scouting',
        description: 'Inspect leaf undersides weekly for early signs of pests or fungal spots.',
      },
      {
        title: 'Deep Consistent Watering',
        description: 'Water evenly at soil level to prevent blossom end rot and fruit splitting.',
      },
    ],
  },

  // Potato Diseases
  'Potato___Late_blight': {
    crop: 'Potato',
    disease: 'Late Blight',
    pathogenType: 'Oomycete (Phytophthora infestans)',
    severity: 'High',
    immediateActions: [
      'If disease is widespread before harvest, destroy top foliage (defoliate/vine-kill) 2 weeks before digging to prevent tuber infection.',
      'Harvest only during dry weather; discard all soft or discolored tubers immediately.',
    ],
    organic: [
      {
        title: 'Copper Oxychloride / Bordeaux 1%',
        application: 'Apply 3 g/L preventatively when night humidity exceeds 90% with moderate temperatures.',
        notes: 'Protective copper shield on stems and foliage.',
      },
    ],
    chemical: [
      {
        name: 'Dimethomorph 50% WP (Acrobat)',
        dosage: '1.0 g per liter of water',
        safety: 'Translaminar anti-oomycete fungicide. Stops sporulation and protects new shoots.',
      },
      {
        name: 'Mancozeb 75% WP + Cymoxanil 8% (Curzate M8)',
        dosage: '2.5 g per liter of water',
        safety: 'Curative + preventative combination. Spray within 24-48 hours of suspected infection.',
      },
    ],
    prevention: [
      {
        title: 'High Hilling / Soil Mounding',
        description: 'Keep a generous mound of soil over developing tubers so rain does not wash fungal spores down to potatoes.',
      },
    ],
  },

  'Potato___Early_blight': {
    crop: 'Potato',
    disease: 'Early Blight',
    pathogenType: 'Fungus (Alternaria solani)',
    severity: 'Medium',
    immediateActions: [
      'Prune and destroy infected lower foliage showing brown target spots.',
    ],
    organic: [
      {
        title: 'Neem & Bio-Fungicide (Trichoderma harzianum)',
        application: 'Soil application of Trichoderma (2.5 kg/acre) mixed with farmyard manure.',
        notes: 'Suppresses soil inoculum and promotes root vigor.',
      },
    ],
    chemical: [
      {
        name: 'Azoxystrobin 18.2% + Difenoconazole 11.4% SC (Amistar Top)',
        dosage: '1.0 ml per liter of water',
        safety: 'High-performance dual systemic fungicide for complete blight control.',
      },
      {
        name: 'Mancozeb 75% WP',
        dosage: '2.5 g per liter of water',
        safety: 'Standard protective spray every 10 days.',
      },
    ],
    prevention: [
      {
        title: 'Balanced Potassium & Nitrogen',
        description: 'Avoid nitrogen deficiency or excessive stress during tuber initiation to maintain leaf vigor.',
      },
    ],
  },

  'Potato___healthy': {
    crop: 'Potato',
    disease: 'Healthy Crop',
    pathogenType: 'None',
    severity: 'None',
    immediateActions: [
      'Crop is healthy. Keep tubers well-covered with soil.',
    ],
    organic: [
      {
        title: 'Neem Cake Soil Conditioning',
        application: 'Incorporate neem cake (100 kg/acre) during second hilling.',
        notes: 'Provides slow-release nitrogen and deters soil nematodes and grubs.',
      },
    ],
    chemical: [
      {
        name: 'Micronutrient Mix (Zinc + Boron + Magnesium)',
        dosage: '2.0 g per liter foliar spray during vegetative phase',
        safety: 'Promotes uniform tuber enlargement and healthy skin development.',
      },
    ],
    prevention: [
      {
        title: 'Proper Storage',
        description: 'Cure harvested potatoes in a cool (15°C), dark, ventilated area for 10 days before cold storage.',
      },
    ],
  },

  // Corn (Maize) Diseases
  'Corn_(maize)___Common_rust': {
    crop: 'Corn',
    disease: 'Common Rust',
    pathogenType: 'Fungus (Puccinia sorghi)',
    severity: 'Medium',
    immediateActions: [
      'Scout fields to determine rust threshold; if upper leaves near ear are infected before blister stage, spray immediately.',
    ],
    organic: [
      {
        title: 'Sulfur 80% WDG Foliar Spray',
        application: '3 g per liter of water applied in early morning.',
        notes: 'Natural mineral fungicide with broad anti-rust properties.',
      },
    ],
    chemical: [
      {
        name: 'Propiconazole 25% EC (Tilt)',
        dosage: '1.0 ml per liter of water',
        safety: 'Systemic triazole fungicide with strong curative effect against corn rust pustules.',
      },
      {
        name: 'Azoxystrobin 23% SC',
        dosage: '1.0 ml per liter of water',
        safety: 'Protects flag leaf and ear leaves from secondary spore spread.',
      },
    ],
    prevention: [
      {
        title: 'Resistant Hybrids',
        description: 'Select corn varieties carrying Rp rust-resistance genes for subsequent seasons.',
      },
    ],
  },

  'Corn_(maize)___Northern_Leaf_Blight': {
    crop: 'Corn',
    disease: 'Northern Corn Leaf Blight',
    pathogenType: 'Fungus (Exserohilum turcicum)',
    severity: 'High',
    immediateActions: [
      'Inspect cigar-shaped grayish-green lesions on middle and upper canopy.',
    ],
    organic: [
      {
        title: 'Bio-Fungicide (Bacillus pumilus)',
        application: '10 ml/L foliar spray before tasseling.',
        notes: 'Inhibits mycelial growth of leaf blight pathogens.',
      },
    ],
    chemical: [
      {
        name: 'Pyraclostrobin 20% WG (Headline)',
        dosage: '1.0 g per liter of water',
        safety: 'Strobilurin fungicide providing plant health benefits and prolonged blight control.',
      },
    ],
    prevention: [
      {
        title: 'Tillage & Crop Residue Management',
        description: 'Deep plow corn stubble after harvest to bury fungal residue and accelerate decomposition.',
      },
    ],
  },

  'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot': {
    crop: 'Corn',
    disease: 'Gray Leaf Spot',
    pathogenType: 'Fungus (Cercospora zeae-maydis)',
    severity: 'Medium',
    immediateActions: [
      'Monitor lower leaves for rectangular lesions bordered by leaf veins.',
    ],
    organic: [
      {
        title: 'Potassium Silicate Spray',
        application: '2 ml per liter of water as foliar spray.',
        notes: 'Deposits silica in leaf epidermal cells, making physical fungal penetration difficult.',
      },
    ],
    chemical: [
      {
        name: 'Tebuconazole 25.9% EC (Folicur)',
        dosage: '1.0 ml per liter of water',
        safety: 'Systemic triazole; apply when lesions appear on the third leaf below the ear.',
      },
    ],
    prevention: [
      {
        title: '2-Year Crop Rotation',
        description: 'Rotate with non-host crops such as soybean, alfalfa, or cotton.',
      },
    ],
  },

  'Corn_(maize)___healthy': {
    crop: 'Corn',
    disease: 'Healthy Crop',
    pathogenType: 'None',
    severity: 'None',
    immediateActions: ['No treatments needed.'],
    organic: [{ title: 'Humic Acid + Zinc Root Treatment', application: '5 ml/L at knee-high stage', notes: 'Stimulates root expansion and cob weight.' }],
    chemical: [{ name: 'Urea (46% N) Side Dressing', dosage: 'Apply split dose at V6 (knee-high) and VT (tasseling)', safety: 'Ensure adequate soil moisture when applying.' }],
    prevention: [{ title: 'Adequate Moisture during Silking', description: 'Irrigate during tassel and silk development to ensure full kernel set.' }],
  },

  // Apple Diseases
  'Apple___Apple_scab': {
    crop: 'Apple',
    disease: 'Apple Scab',
    pathogenType: 'Fungus (Venturia inaequalis)',
    severity: 'High',
    immediateActions: [
      'Rake and shred or compost fallen apple leaves in autumn to eliminate primary ascospore reserves.',
      'Prune inner orchard canopy to accelerate leaf drying.',
    ],
    organic: [
      {
        title: 'Lime Sulfur / Wettable Sulfur',
        application: 'Apply lime sulfur at green tip stage and wettable sulfur (3 g/L) through petal fall.',
        notes: 'Traditional organic orchard protectant.',
      },
      {
        title: 'Copper Octanoate (Soap)',
        application: 'Spray during bud break before pink bud stage.',
        notes: 'Prevents initial primary scab spore germination on tender cluster leaves.',
      },
    ],
    chemical: [
      {
        name: 'Difenoconazole 25% EC (Score)',
        dosage: '0.3 ml per liter of water',
        safety: 'Potent curative anti-scab fungicide with 72-96 hour reach-back activity.',
      },
      {
        name: 'Captan 50% WP',
        dosage: '2.5 g per liter of water',
        safety: 'Standard protective contact fungicide with low risk of fungal resistance.',
      },
    ],
    prevention: [
      {
        title: 'Urea Spray on Fallen Leaves',
        description: 'Spray 5% urea solution onto orchard floor in autumn to speed leaf breakdown and destroy fungal overwintering bodies.',
      },
    ],
  },

  'Apple___Black_rot': {
    crop: 'Apple',
    disease: 'Black Rot (Frogeye Leaf Spot)',
    pathogenType: 'Fungus (Botryosphaeria obtusa)',
    severity: 'High',
    immediateActions: [
      'Prune out dead wood, cankers, and fire-blighted twigs which serve as fungal reservoir.',
      'Remove and destroy all mummified fruits clinging to branches.',
    ],
    organic: [
      {
        title: 'Liquid Copper Spray',
        application: 'Apply at delayed dormant and pink cluster stages at 3 ml/L.',
        notes: 'Protects bark wounds and blossom clusters.',
      },
    ],
    chemical: [
      {
        name: 'Thiophanate-Methyl 70% WP (Topsin-M)',
        dosage: '1.0 g per liter of water',
        safety: 'Systemic benzimidazole fungicide. Apply from pink bud stage through fruit development.',
      },
    ],
    prevention: [
      {
        title: 'Sanitation & Pruning Hygiene',
        description: 'Make clean pruning cuts outside the branch collar and paint large wounds with tree seal.',
      },
    ],
  },

  'Apple___Cedar_apple_rust': {
    crop: 'Apple',
    disease: 'Cedar Apple Rust',
    pathogenType: 'Fungus (Gymnosporangium juniperi-virginianae)',
    severity: 'Medium',
    immediateActions: [
      'Inspect nearby Eastern Red Cedar or Juniper trees within several hundred meters and prune out galls if possible.',
    ],
    organic: [
      {
        title: 'Sulfur Fungicide',
        application: 'Apply sulfur (3 g/L) starting at pink bud stage and repeat every 7 days through petal fall.',
        notes: 'Organic preventive barrier against airborne rust basidiospores.',
      },
    ],
    chemical: [
      {
        name: 'Myclobutanil 10% WP (Rally / Eagle)',
        dosage: '0.5 g per liter of water',
        safety: 'Highly selective and effective against cedar apple rust on apple foliage.',
      },
    ],
    prevention: [
      {
        title: 'Resistant Varieties',
        description: 'Choose rust-immune apple cultivars (e.g., Liberty, Freedom, Enterprise, Redfree).',
      },
    ],
  },

  'Apple___healthy': {
    crop: 'Apple',
    disease: 'Healthy Orchard',
    pathogenType: 'None',
    severity: 'None',
    immediateActions: ['Orchard is healthy. Maintain tree vigor and dormant sprays.'],
    organic: [{ title: 'Dormant Horticultural Oil', application: 'Apply 2% dormant oil in late winter', notes: 'Smothers overwintering scale insects, mite eggs, and aphid eggs.' }],
    chemical: [{ name: 'Calcium Chloride Foliar Spray', dosage: '3 g/L during fruit growth', safety: 'Prevents bitter pit and improves fruit storage life.' }],
    prevention: [{ title: 'Annual Pruning', description: 'Open up the central canopy to allow 100% sunlight penetration and fast airflow.' }],
  },

  // Grape Diseases
  'Grape___Black_rot': {
    crop: 'Grape',
    disease: 'Black Rot',
    pathogenType: 'Fungus (Guignardia bidwellii)',
    severity: 'High',
    immediateActions: [
      'Prune and destroy shriveled black mummified berries from vines and ground.',
    ],
    organic: [
      {
        title: 'Bordeaux Mixture 1% / Copper Soap',
        application: 'Spray every 10-14 days starting from 3-inch shoot growth until veraison.',
        notes: 'Protects young developing grape clusters.',
      },
    ],
    chemical: [
      {
        name: 'Mancozeb 75% WP + Myclobutanil',
        dosage: '2.0 g Mancozeb + 0.4 g Myclobutanil per liter of water',
        safety: 'Standard dual protection for high-value vineyards.',
      },
    ],
    prevention: [
      {
        title: 'Canopy Trellising',
        description: 'Trellis vines properly (e.g. VSP system) to ensure rapid cluster drying after morning dew.',
      },
    ],
  },

  'Grape___Esca_(Black_Measles)': {
    crop: 'Grape',
    disease: 'Esca (Black Measles / Vine Decline)',
    pathogenType: 'Fungal Complex (Phaeoacremonium & Fomitiporia spp.)',
    severity: 'High',
    immediateActions: [
      'Mark symptomatic vines during summer with ribbon; prune diseased vines separately in winter.',
      'Cut back trunk to clean healthy wood if symptoms are localized.',
    ],
    organic: [
      {
        title: 'Trichoderma Wound Protectant Paste',
        application: 'Paint Trichoderma paste directly onto all winter pruning wounds within 24 hours of cutting.',
        notes: 'Colonizes wounds to block entry of wood-decay Esca fungal spores.',
      },
    ],
    chemical: [
      {
        name: 'Wound Sealant Fungicide (Thiophanate-Methyl paste)',
        dosage: 'Direct wound application',
        safety: 'Apply to all cuts larger than 2 cm.',
      },
    ],
    prevention: [
      {
        title: 'Late Winter Pruning',
        description: 'Delay pruning until late winter (just before bud break) when vine sap flow pushes outwards and wounds heal fastest.',
      },
    ],
  },

  'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)': {
    crop: 'Grape',
    disease: 'Leaf Blight (Isariopsis Spot)',
    pathogenType: 'Fungus (Pseudocercospora vitis)',
    severity: 'Medium',
    immediateActions: ['Remove heavily spotted leaves before early autumn defoliation.'],
    organic: [{ title: 'Copper Hydroxide Spray', application: '2 g per liter post-harvest and pre-bloom.', notes: 'Prevents spore germination on foliage.' }],
    chemical: [{ name: 'Carbendazim 50% WP (Bavistin)', dosage: '1.0 g per liter of water', safety: 'Systemic broad spectrum fungicide.' }],
    prevention: [{ title: 'Post-Harvest Foliar Cleanliness', description: 'Spray protective fungicide after harvest to keep leaves green and active for carbohydrate storage.' }],
  },

  'Grape___healthy': {
    crop: 'Grape',
    disease: 'Healthy Vineyard',
    pathogenType: 'None',
    severity: 'None',
    immediateActions: ['Vines are healthy.'],
    organic: [{ title: 'Seaweed Extract & Bio-Potash', application: '3 ml/L during berry sizing', notes: 'Improves brix sweetness and uniform bunch development.' }],
    chemical: [{ name: 'Potassium Nitrate (13-0-45)', dosage: '4 g/L during berry enlargement', safety: 'Promotes sugar accumulation and bunch weight.' }],
    prevention: [{ title: 'Canopy Leaf Pulling', description: 'Remove 2-3 leaves around fruit zone after fruit set to maximize sunlight and fungicide coverage.' }],
  },

  // Citrus / Orange
  'Orange___Haunglongbing_(Citrus_greening)': {
    crop: 'Orange',
    disease: 'Citrus Greening (Huanglongbing / HLB)',
    pathogenType: 'Bacterium (Candidatus Liberibacter asiaticus) via Asian Citrus Psyllid',
    severity: 'Critical (No Known Cure)',
    immediateActions: [
      'Confirm diagnosis; severely infected declining trees must be removed and stump treated to prevent psyllid vector feeding.',
      'Control Asian Citrus Psyllid (ACP) populations immediately across the entire grove.',
    ],
    organic: [
      {
        title: 'Citrus Foliar Nutrition Therapy',
        application: 'Intense micronutrient foliar spray (Zinc, Manganese, Boron, Iron, Magnesium + Potassium phosphite) every 30 days.',
        notes: 'Helps infected trees maintain productive canopy and root system longer.',
      },
      {
        title: 'Petroleum Horticultural Oil (1.5%)',
        application: 'Spray new flushes to deter psyllids from egg-laying.',
        notes: 'Organic deterrent for insect vector.',
      },
    ],
    chemical: [
      {
        name: 'Imidacloprid / Thiamethoxam Systemic Drench',
        dosage: 'Soil drench around root zone according to tree age',
        safety: 'Protects young flush growth from psyllid vector feeding for up to 90 days.',
      },
      {
        name: 'Dimethoate 30% EC or Chlorpyrifos 20% EC',
        dosage: '1.5 ml per liter foliar spray during feather flush',
        safety: 'Fast knockdown of adult psyllids. Wear safety gear.',
      },
    ],
    prevention: [
      {
        title: 'Certified Disease-Free Nursery Trees',
        description: 'Plant only certified pathogen-tested budwood and rootstock from screened greenhouse nurseries.',
      },
    ],
  },

  // Pepper (Bell Pepper)
  'Pepper,_bell___Bacterial_spot': {
    crop: 'Bell Pepper',
    disease: 'Bacterial Spot',
    pathogenType: 'Bacterium (Xanthomonas campestris pv. vesicatoria)',
    severity: 'High',
    immediateActions: [
      'Eliminate overhead irrigation and avoid entering field while plants are wet.',
      'Prune and destroy infected leaves showing water-soaked lesions.',
    ],
    organic: [
      {
        title: 'Copper Octanoate / Copper Hydroxide',
        application: '2 g per liter of water every 7-10 days.',
        notes: 'Bacteriostatic mineral protection.',
      },
    ],
    chemical: [
      {
        name: 'Copper Oxychloride 50% WP + Streptomycin Sulphate',
        dosage: '2.5 g Copper Oxychloride + 100 mg Streptocycline per liter',
        safety: 'Standard combination bactericide spray for solanaceous vegetables.',
      },
    ],
    prevention: [
      {
        title: 'Hot Water Seed Treatment',
        description: 'Soak seeds at 50°C for 25 minutes before sowing to eradicate seed-borne bacterial pathogens.',
      },
    ],
  },

  'Pepper,_bell___healthy': {
    crop: 'Bell Pepper',
    disease: 'Healthy Crop',
    pathogenType: 'None',
    severity: 'None',
    immediateActions: ['Plants are healthy.'],
    organic: [{ title: 'Fish Amino Acid / Panchagavya', application: '30 ml per liter as foliar spray every 15 days', notes: 'Enhances vegetative branching and fruit glossiness.' }],
    chemical: [{ name: 'Calcium Nitrate + Boron', dosage: '2.5 g/L during flowering', safety: 'Prevents blossom end rot and improves pepper wall thickness.' }],
    prevention: [{ title: 'Staking & Trellising', description: 'Support heavy pepper branches to prevent lodging and fruit contact with damp ground.' }],
  },

  // Peach
  'Peach___Bacterial_spot': {
    crop: 'Peach',
    disease: 'Bacterial Spot',
    pathogenType: 'Bacterium (Xanthomonas arboricola pv. pruni)',
    severity: 'High',
    immediateActions: ['Prune cankered shoots during dormant season.'],
    organic: [{ title: 'Dormant Copper Spray', application: 'Spray copper hydroxide (3 g/L) during leaf drop in autumn and before bud swell in spring.', notes: 'Suppresses overwintering bacterial populations.' }],
    chemical: [{ name: 'Oxytetracycline (Mycoshield)', dosage: '1.5 g per liter of water', safety: 'Specific agricultural bactericide during bloom to early fruit formation.' }],
    prevention: [{ title: 'Windbreaks', description: 'Plant windbreaks around orchards; wind-driven sand and soil create micro-wounds that invite bacteria.' }],
  },

  'Peach___healthy': {
    crop: 'Peach',
    disease: 'Healthy Orchard',
    pathogenType: 'None',
    severity: 'None',
    immediateActions: ['Peach trees are healthy.'],
    organic: [{ title: 'Dormant Oil + Lime Sulfur', application: 'Single winter application', notes: 'Controls scale, peach leaf curl, and mite eggs.' }],
    chemical: [{ name: 'Potassium Sulfate (0-0-50)', dosage: '50-100 g per tree in early spring', safety: 'Boosts fruit sweetness, color, and tree winter hardiness.' }],
    prevention: [{ title: 'Fruit Thinning', description: 'Thin peaches to 6 inches apart for optimal fruit size and to prevent branch breakage.' }],
  },

  // Cherry
  'Cherry_(including_sour)___Powdery_mildew': {
    crop: 'Cherry',
    disease: 'Powdery Mildew',
    pathogenType: 'Fungus (Podosphaera clandestina)',
    severity: 'Medium',
    immediateActions: ['Prune infected shoot tips showing white powdery felt.'],
    organic: [
      { title: 'Potassium Bicarbonate / Kaligreen', application: '3 g/L spray at first sign of white mold.', notes: 'Eradicates existing powdery mildew mycelium on contact.' },
      { title: 'Neem Oil 0.5%', application: '5 ml/L applied every 10 days.', notes: 'Prevents spore germination and repels pest mites.' }
    ],
    chemical: [
      { name: 'Myclobutanil 10% WP or Hexaconazole 5% EC', dosage: '1.0 ml/g per liter of water', safety: 'Curative triazole fungicide. Rotate classes to prevent resistance.' }
    ],
    prevention: [{ title: 'Open Canopy Pruning', description: 'Maintain an open vase or central leader canopy with high sunlight penetration.' }],
  },

  'Cherry_(including_sour)___healthy': {
    crop: 'Cherry',
    disease: 'Healthy Orchard',
    pathogenType: 'None',
    severity: 'None',
    immediateActions: ['Trees are healthy.'],
    organic: [{ title: 'Bird Netting & Compost Mulch', application: 'Cover tree with protective netting as fruit colors', notes: 'Protects cherry harvest from avian damage.' }],
    chemical: [{ name: 'Chelated Micronutrient Spray', dosage: '1.5 g/L post bloom', safety: 'Maintains dark green leaf health.' }],
    prevention: [{ title: 'Proper Pruning Timing', description: 'Prune sweet cherries in dry summer weather (not winter) to prevent silver leaf and bacterial canker infections.' }],
  },

  // Strawberry
  'Strawberry___Leaf_scorch': {
    crop: 'Strawberry',
    disease: 'Leaf Scorch',
    pathogenType: 'Fungus (Diplocarpon earlianum)',
    severity: 'Medium',
    immediateActions: [
      'Pick off and destroy purple-blotched older leaves after harvesting.',
      'Mow and renovate June-bearing strawberry beds post-harvest.',
    ],
    organic: [
      { title: 'Liquid Copper / Bio-Fungicide (Bacillus subtilis)', application: 'Spray at 2.5 ml/L starting at early spring green-up.', notes: 'Suppresses leaf scorch and common leaf spot.' }
    ],
    chemical: [
      { name: 'Captan 50% WP or Azoxystrobin', dosage: '2.0 g Captan per liter of water', safety: 'Apply preventatively prior to flowering.' }
    ],
    prevention: [
      { title: 'Clean Straw Mulch', description: 'Keep berries and foliage elevated on clean wheat straw or black plastic mulch away from damp soil.' }
    ],
  },

  'Strawberry___healthy': {
    crop: 'Strawberry',
    disease: 'Healthy Strawberry Bed',
    pathogenType: 'None',
    severity: 'None',
    immediateActions: ['Plants are healthy.'],
    organic: [{ title: 'Neem Cake & Vermicompost', application: '50 g per plant root zone', notes: 'Enhances runner development and berry sweetness.' }],
    chemical: [{ name: 'Water-Soluble 19-19-19 Fertilizer', dosage: '2 g/L via drip irrigation weekly', safety: 'Maintains vigorous flower clusters and heavy cropping.' }],
    prevention: [{ title: 'Runner Management', description: 'Trim excess runners so mother plants focus energy into plump fruit production.' }],
  },

  // Squash
  'Squash___Powdery_mildew': {
    crop: 'Squash / Cucurbits',
    disease: 'Powdery Mildew',
    pathogenType: 'Fungus (Podosphaera xanthii)',
    severity: 'Medium',
    immediateActions: ['Remove heavily infected white-powdered lower leaves to allow sunlight into the center crown.'],
    organic: [
      { title: 'Milk & Water Solution (40:60)', application: 'Mix 400 ml fresh cow milk with 600 ml water. Spray in bright sunlight weekly.', notes: 'Milk proteins react with sunlight to generate natural antiseptic free radicals that kill powdery mildew.' },
      { title: 'Baking Soda + Horticultural Oil', application: '1 tbsp baking soda + 1 tsp vegetable oil + 1 tsp liquid soap in 4L water.', notes: 'Alkaline pH eliminates fungal spores.' }
    ],
    chemical: [
      { name: 'Hexaconazole 5% SC (Contaf)', dosage: '1.5 ml per liter of water', safety: 'Systemic triazole with quick curative action on cucurbit leaves.' },
      { name: 'Azoxystrobin + Difenoconazole', dosage: '1.0 ml per liter', safety: 'Dual broad spectrum protection.' }
    ],
    prevention: [{ title: 'Drip Irrigation', description: 'Keep cucurbit foliage completely dry by watering strictly at root base.' }],
  },

  // Blueberry
  'Blueberry___healthy': {
    crop: 'Blueberry',
    disease: 'Healthy Bush',
    pathogenType: 'None',
    severity: 'None',
    immediateActions: ['Bushes are healthy.'],
    organic: [{ title: 'Pine Bark Mulch & Elemental Sulfur', application: 'Top-dress with 3 inches of pine bark mulch', notes: 'Maintains required acidic soil pH between 4.5 and 5.2.' }],
    chemical: [{ name: 'Ammonium Sulfate (21-0-0)', dosage: '20 g per bush in spring', safety: 'Acidifying nitrogen source ideal for ericaceous plants.' }],
    prevention: [{ title: 'Consistent Soil Moisture', description: 'Blueberries have shallow fibrous roots; ensure regular, acid-friendly watering.' }],
  },

  // Soybean
  'Soybean___healthy': {
    crop: 'Soybean',
    disease: 'Healthy Crop',
    pathogenType: 'None',
    severity: 'None',
    immediateActions: ['Crop is healthy.'],
    organic: [{ title: 'Rhizobium Inoculation & PSB', application: 'Seed treatment before sowing', notes: 'Promotes robust nitrogen-fixing root nodules.' }],
    chemical: [{ name: 'Molybdenum & Boron Micronutrient Spray', dosage: '1.0 g/L at early pod fill', safety: 'Maximizes pod filling and seed protein.' }],
    prevention: [{ title: 'Scouting for Pod Borers', description: 'Monitor foliage weekly during R3-R5 stages for pest caterpillars and rust.' }],
  },
}

/**
 * Smart fallback parser for any raw class or readable disease string
 */
export function getRemediesForPrediction(rawClass, diseaseName = '', cropName = '') {
  // 1. Direct match by rawClass
  if (rawClass && CROP_REMEDIES[rawClass]) {
    return CROP_REMEDIES[rawClass]
  }

  // 2. Try normalized key matching
  const key = Object.keys(CROP_REMEDIES).find(
    (k) => k.toLowerCase() === (rawClass || '').toLowerCase()
  )
  if (key) return CROP_REMEDIES[key]

  const lowerClass = (rawClass || diseaseName || '').toLowerCase()
  const cleanCrop = cropName || (rawClass ? rawClass.split('___')[0].replace(/_/g, ' ') : 'Crop')

  // Check if healthy
  if (lowerClass.includes('healthy')) {
    return {
      crop: cleanCrop,
      disease: 'Healthy Condition',
      pathogenType: 'None',
      severity: 'None',
      immediateActions: [
        'Crop shows no visual signs of active disease.',
        'Maintain balanced watering, sunlight, and regular scouting schedule.',
      ],
      organic: [
        {
          title: 'Bio-Fertilizer & Compost Care',
          application: 'Apply organic compost tea or seaweed extract (3-5 ml/L) every 14 days.',
          notes: 'Promotes beneficial microbial rhizosphere activity and vigorous foliage.',
        },
      ],
      chemical: [
        {
          name: 'Balanced NPK Foliar Nutrition (19-19-19)',
          dosage: '3.0 g per liter of water',
          safety: 'Apply every 2-3 weeks during vegetative & flowering stages for top yields.',
        },
      ],
      prevention: [
        {
          title: 'Scout Regularly',
          description: 'Examine both sides of leaves weekly to spot any pests or early fungal lesions early.',
        },
      ],
    }
  }

  // Generic Fallback based on disease category keywords
  if (lowerClass.includes('blight')) {
    return {
      crop: cleanCrop,
      disease: diseaseName || 'Blight Infection',
      pathogenType: 'Fungal / Oomycete Pathogen',
      severity: 'High',
      immediateActions: [
        'Prune off all diseased, water-soaked foliage immediately.',
        'Dispose of infected tissue in sealed trash bags — never compost.',
        'Stop overhead watering and ensure soil drainage.',
      ],
      organic: [
        {
          title: 'Copper Fungicide / Bordeaux Mixture 1%',
          application: 'Spray 2.5 g/L on entire canopy, repeating every 7-10 days.',
          notes: 'Standard organic preventative and anti-sporulant.',
        },
        {
          title: 'Trichoderma viride Bio-Control',
          application: 'Apply 5-10 g/L as root drench and foliar spray.',
          notes: 'Natural bio-agent that suppresses pathogenic mycelium.',
        },
      ],
      chemical: [
        {
          name: 'Chlorothalonil 75% WP or Mancozeb 75% WP',
          dosage: '2.0 - 2.5 g per liter of water',
          safety: 'Contact protective fungicide. Ensure thorough leaf coverage.',
        },
        {
          name: 'Metalaxyl 8% + Mancozeb 64% WP (Ridomil MZ)',
          dosage: '2.0 g per liter of water',
          safety: 'Systemic curative spray. Apply early in disease cycle.',
        },
      ],
      prevention: [
        {
          title: 'Drip Irrigation & Mulch',
          description: 'Water at soil level only and mulch to stop soil spore splash.',
        },
      ],
    }
  }

  if (lowerClass.includes('rust')) {
    return {
      crop: cleanCrop,
      disease: diseaseName || 'Rust Infection',
      pathogenType: 'Fungus (Pucciniales)',
      severity: 'Medium',
      immediateActions: [
        'Prune heavily rusted leaves showing powdery orange-brown pustules.',
        'Avoid wetting leaves during late afternoon or evening.',
      ],
      organic: [
        {
          title: 'Wettable Sulfur (80% WDG)',
          application: 'Apply 3 g per liter of water in early morning.',
          notes: 'Effective natural anti-rust protectant.',
        },
      ],
      chemical: [
        {
          name: 'Propiconazole 25% EC or Tebuconazole 25.9% EC',
          dosage: '1.0 ml per liter of water',
          safety: 'Systemic triazole with quick curative action on rust pustules.',
        },
      ],
      prevention: [
        {
          title: 'Air Circulation & Spacing',
          description: 'Maintain wide plant spacing so wind dries canopy moisture rapidly.',
        },
      ],
    }
  }

  if (lowerClass.includes('mildew') || lowerClass.includes('mold') || lowerClass.includes('spot') || lowerClass.includes('rot')) {
    return {
      crop: cleanCrop,
      disease: diseaseName || 'Fungal Spot / Mildew',
      pathogenType: 'Fungal Pathogen',
      severity: 'Medium',
      immediateActions: [
        'Prune symptomatic leaves with disinfected shears.',
        'Increase ventilation and improve sunlight exposure.',
      ],
      organic: [
        {
          title: 'Neem Oil Spray (3000 ppm) + Baking Soda',
          application: 'Mix 5 ml cold-pressed neem oil + 1 tsp baking soda + 1/2 tsp soap in 1L water.',
          notes: 'Dual organic action against spore development.',
        },
        {
          title: 'Potassium Bicarbonate',
          application: '3 g per liter with organic surfactant.',
          notes: 'Safe organic contact eradicant for foliar molds.',
        },
      ],
      chemical: [
        {
          name: 'Azoxystrobin 23% SC or Difenoconazole 25% EC',
          dosage: '1.0 ml per liter of water',
          safety: 'Broad-spectrum translaminar systemic fungicide.',
        },
        {
          name: 'Copper Oxychloride 50% WP',
          dosage: '2.5 g per liter of water',
          safety: 'Protective mineral spray.',
        },
      ],
      prevention: [
        {
          title: 'Crop Rotation & Hygiene',
          description: 'Rotate crop beds annually and clear crop residue after harvest.',
        },
      ],
    }
  }

  if (lowerClass.includes('bacterial')) {
    return {
      crop: cleanCrop,
      disease: diseaseName || 'Bacterial Infection',
      pathogenType: 'Bacterium',
      severity: 'High',
      immediateActions: [
        'Immediately discontinue overhead irrigation.',
        'Do not work in fields or prune when plants are wet.',
        'Sterilize pruning shears between each plant with rubbing alcohol.',
      ],
      organic: [
        {
          title: 'Copper Hydroxide / Copper Soap',
          application: '2 g per liter applied every 7 days.',
          notes: 'Bacteriostatic protective barrier on plant tissue.',
        },
      ],
      chemical: [
        {
          name: 'Copper Oxychloride + Streptocycline',
          dosage: '2.5 g Copper Oxychloride + 100 mg Streptocycline per liter',
          safety: 'Combined protective and antibiotic bactericide.',
        },
      ],
      prevention: [
        {
          title: 'Disease-Free Seed & Sanitation',
          description: 'Use certified pathogen-free seeds and sanitize all tools and stakes.',
        },
      ],
    }
  }

  if (lowerClass.includes('virus') || lowerClass.includes('mosaic') || lowerClass.includes('curl')) {
    return {
      crop: cleanCrop,
      disease: diseaseName || 'Viral Infection',
      pathogenType: 'Plant Virus (Vector transmitted)',
      severity: 'High',
      immediateActions: [
        'Uproot and destroy infected plants immediately — viruses cannot be cured once inside the vascular system.',
        'Install yellow sticky traps to capture insect vectors (whiteflies, aphids, thrips).',
      ],
      organic: [
        {
          title: 'Neem Oil + Insecticidal Soap',
          application: '5 ml neem oil + 2 ml mild soap per liter every 5 days.',
          notes: 'Eliminates vector insects to stop virus transmission.',
        },
      ],
      chemical: [
        {
          name: 'Imidacloprid 17.8% SL or Acetamiprid 20% SP',
          dosage: '0.5 ml / 0.4 g per liter of water',
          safety: 'Systemic insecticide targeting vector insect populations.',
        },
      ],
      prevention: [
        {
          title: 'Vector Exclusion & Resistant Varieties',
          description: 'Use insect-proof netting in nurseries and plant virus-resistant hybrids.',
        },
      ],
    }
  }

  // Default universal agricultural advisory
  return {
    crop: cleanCrop,
    disease: diseaseName || 'Crop Disease',
    pathogenType: 'General Plant Issue',
    severity: 'Medium',
    immediateActions: [
      'Isolate symptomatic plants and prune damaged leaf tissue.',
      'Sanitize garden tools and avoid handling wet foliage.',
    ],
    organic: [
      {
        title: 'Cold-Pressed Neem Oil (3000 ppm)',
        application: 'Mix 5 ml neem oil + 2 ml organic surfactant in 1 liter of water and spray weekly.',
        notes: 'Broad-spectrum organic protection against pests and fungi.',
      },
    ],
    chemical: [
      {
        name: 'Broad-Spectrum Protective Fungicide (Mancozeb 75% WP)',
        dosage: '2.5 g per liter of water',
        safety: 'Spray evenly on all foliar surfaces. Follow safety label instructions.',
      },
    ],
    prevention: [
      {
        title: 'Proper Airflow & Soil Moisture',
        description: 'Provide proper plant spacing, water at ground level, and practice regular crop rotation.',
      },
    ],
  }
}
