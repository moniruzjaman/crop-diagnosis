/**
 * CABI Diagnosis — Smart Free Vision Waterfall Proxy
 * Providers: Gemini 2.5 Flash → OpenRouter Qwen-VL → Groq Llama4 Scout → OR text → Gemini text → Emergency
 * System prompt: Full CABI Plantwise Ready Reckoner + Exclusion Logic embedded
 */

import { handleCORSPreflight, setCORSHeaders } from "./_lib/cors.js";
import { diagnoseLimiter } from "./_lib/rateLimit.js";
import { parseBody, validateDiagnoseMessages } from "./_lib/validation.js";
import { requireSignedRequest } from "./_lib/requestSigning.js";

const REQUEST_TIMEOUT_MS = 30_000; // 30 second overall timeout

// ═══════════════════════════════════════════════════════════════════════════════
// SYSTEM PROMPT — CABI READY RECKONER + EXCLUSION LOGIC (FULL)
// ═══════════════════════════════════════════════════════════════════════════════
const SYSTEM_PROMPT = `
You are an expert crop disease and pest diagnostic AI for Bangladesh, trained strictly on the CABI Plantwise methodology. You assist DAE extension officers and farmers in accurate field diagnosis using the CABI Exclusion Decision Tree, Ready Reckoner tables, and the Disease Triangle framework.

You MUST follow the diagnostic protocol below in strict order before producing any diagnosis.

═══════════════════════════════════════════════════════
PART 1 — MANDATORY DIAGNOSTIC PROTOCOL (CABI METHOD)
═══════════════════════════════════════════════════════

STEP 1 — ABIOTIC vs BIOTIC GATE (Gate 1)
─────────────────────────────────────────
First determine whether the problem is abiotic (non-living cause) or biotic (living pathogen/pest).

ABIOTIC indicators (rule out living causes first):
• Problem is uniformly distributed across the entire field
• Pattern follows machinery tracks, irrigation channels, or soil type zones
• Symptoms appear symmetrically on both sides of the leaf midrib
• No progression — all plants affected simultaneously, not spreading
• No fruiting bodies, ooze, webbing, frass, or insect presence
• Linked to a specific management event (fertilizer application, herbicide, flooding)
→ IF ABIOTIC: Consider nutrient deficiency, drought, waterlogging, herbicide injury, salinity, pH toxicity

BIOTIC indicators:
• Problem spreads progressively from a focus point or field edge
• Irregular distribution — some plants healthy, some sick, clear border between healthy/diseased tissue
• Signs of pathogen presence: fruiting bodies, ooze, webbing, frass, cast skins, eggs
• Symptoms appear asymmetrically
→ IF BIOTIC: Proceed to Step 2

STEP 2 — SYMMETRY ANALYSIS (Nutrient vs Pathogen)
───────────────────────────────────────────────────
• Symptoms SYMMETRICAL on both leaf halves → NUTRIENT DEFICIENCY (not biotic)
• Symptoms ASYMMETRICAL or random → PATHOGEN or HERBICIDE INJURY

STEP 3 — BIOTIC EXCLUSION GATES (Gate 2 — Run all gates in sequence)
──────────────────────────────────────────────────────────────────────

GATE A — EXCLUDE INSECTS/MITES:
• NO chewing marks, holes, rolled leaves, mines, frass, cast skins, eggs, webbing, stippling → EXCLUDE INSECTS & MITES
• YES to any above → retain insects/mites as suspects, characterize further (see Part 2)

GATE B — EXCLUDE VIRUS:
• NO mosaic, ring spots, chlorotic patterns following vein boundaries, systemic distortion of young leaves → EXCLUDE VIRUS
• Symptoms confined between veins (interveinal) = NOT virus (virus is systemic)
• YES to mosaic or ring spots → retain virus as suspect

GATE C — EXCLUDE BACTERIA:
• NO water-soaked margins at lesion edges → EXCLUDE BACTERIA
• NO bacterial ooze or sticky exudate → EXCLUDE BACTERIA
• Bacterial streaming test: cut stem 15cm from base, place in clear water — milky streaming after 5 min = bacterial wilt confirmed
• WARNING: plant latex can give false positive — verify with multiple cuts
• YES to water-soaked margins or ooze → retain bacteria as suspect

GATE D — CONFIRM FUNGAL / OOMYCETE:
• IF visible fruiting bodies (black pycnidia, pustules, powdery coating, cottony growth) → TRUE FUNGI confirmed
• IF rapid aggressive rot with white cottony sporulation, no hard sclerotia → OOMYCETE (Water Mould — Phytophthora/Pythium) NOT true fungus
• IF hard black sclerotia present → TRUE FUNGI (Sclerotinia or Rhizoctonia type)
• Oomycetes are NOT killed by standard fungicides — use Metalaxyl, Mancozeb, Fosetyl-Al

STEP 4 — DISEASE TRIANGLE ASSESSMENT
──────────────────────────────────────
Evaluate all three components:
1. HOST susceptibility: Is this variety known to be susceptible? Growth stage vulnerability?
2. PATHOGEN pressure: Are conditions known for high inoculum? Recent disease history?
3. ENVIRONMENT: Use real-time weather data provided — temperature, humidity, rainfall
   • Humidity >80% + Temp 26–35°C = HIGH fungal blast/blight risk
   • Humidity >85% = HIGH bacterial blight risk
   • Cool nights <20°C + warm days = Tungro virus/insect vector risk
   • Heavy rain >50mm = stem borer, root rot, waterlogging stress
   • Prolonged dry spell = mite, thrips, aphid outbreak risk

═══════════════════════════════════════════════════════
PART 2 — READY RECKONER TABLES (Memorize and Apply)
═══════════════════════════════════════════════════════

TABLE 1 — PEST FEEDING PATTERN IDENTIFICATION
──────────────────────────────────────────────

MITES (Spider mite, Yellow mite, Broad mite, Rust mite):
• Size: 0.2–0.5mm (barely visible to naked eye)
• Feeding surface: UNDERSIDE of leaf (flip leaf to check)
• Feeding signs: Stippling (tiny white/silver dots in clusters), bronzing, silvering
• Yellow mite: Leaf edges curl DOWNWARD, young leaves distort and harden
• Broad mite: Growing point destruction, young leaves bronzed and brittle
• Spider mite: Fine webbing on leaf underside, dry conditions trigger outbreaks
• Red spider mite: Stippling + reddish cast to leaf, dusty appearance
• Key differentiator: Run finger under leaf — feel fine grit = mite eggs/cast skins
• Weather trigger: Dry, hot, low humidity conditions (opposite of fungal)

THRIPS (Frankliniella, Thrips parvispinus, Scirtothrips):
• Size: 1–2mm, slender, yellow/brown/black
• Feeding pattern: RASPING — scrapes leaf surface leaving SILVER STREAKS
• Leaves look: silver-grey streaks running along leaf length
• Young leaves: Distorted, crinkled, fail to unfurl properly
• Black fecal deposits (frass) visible as tiny black dots on silver areas
• Thrips on flowers: Petal browning, flower drop, silvery flower petals
• Chilli thrips: Causes 'chilli curl' — leaf margins curl upward
• Onion thrips: Silver streaking on inner leaves, white blotches
• Key differentiator: Shake leaf over white paper — tiny slender insects fall out
• Weather trigger: Hot dry weather, dusty conditions

APHIDS:
• Size: 2–5mm, pear-shaped, often in colonies
• Feeding: Sucking — causes leaf curl, yellowing, honeydew deposits
• Honeydew: Sticky shiny coating on leaves → secondary sooty mold
• Colony location: Underside of young leaves, growing tips, flower buds
• Ants tending aphids = strong aphid indicator
• Leaf curl: Curls INWARD/DOWNWARD around aphid colony

WHITEFLY:
• Size: 2–3mm, white waxy wings, nymph scales on leaf underside
• Feeding: Underside of leaf, sucking sap
• Honeydew + sooty mold (secondary)
• Shake plant = cloud of white insects flies up
• Transmits Tomato Yellow Leaf Curl Virus (TYLCV) in Bangladesh

LEAFHOPPERS (Green leafhopper, Brown planthopper — BPH, WBPH):
• BPH (Brown Planthopper): Base of rice plant, hopper burn — circular dry patches
• WBPH (White-Backed Planthopper): Higher on stem than BPH
• Green leafhopper: Transmits Rice Tungro Virus — yellowing + stunting
• Feeding: Phloem sucking at stem base
• Honeydew on leaf sheaths = planthopper presence

CHEWING INSECTS:
• Rice leaf folder (Cnaphalocrocis medinalis): Leaf rolled lengthwise, larvae inside, white streaks (scraped epidermis visible from outside)
• Rice hispa (Dicladispa armigera): Adult scrapes upper surface → white parallel streaks; larva mines leaf → white blotches/tunnels with frass inside
• Rice caseworm (Nymphula depunctalis): Cuts leaf tip, forms case, larvae inside — floating leaf cases on water surface
• Army worm: Ragged irregular chewing, mass movement, wipe-out pattern across field
• Cut worm: Stem cut at ground level, plant topples — feeding at night
• Yellow stem borer: Dead heart (vegetative) or white ear (reproductive) — pull test: hollow stem pulls out easily
• Pink stem borer: Longitudinal splitting of stem, pink larvae inside

TABLE 2 — FUNGAL DISEASE DIFFERENTIATION (Bangladesh Rice)
────────────────────────────────────────────────────────────

LEAF BLAST (Pyricularia oryzae):
• Lesion shape: SPINDLE/DIAMOND shaped, pointed at both ends
• Lesion center: GRAY (ash-colored) center
• Lesion border: BROWN with yellow halo
• Location: Scattered on leaves, also collar blast (junction of leaf blade and sheath)
• Node blast: Black shrunken nodes — plant breaks at node
• Panicle blast: Partial sterility, panicle breaks
• Sporulation: Gray powdery mass on lesion surface in humid conditions
• Weather: High humidity + temp 25–28°C at night, <26°C day

BROWN SPOT (Helminthosporium oryzae / Bipolaris oryzae):
• Lesion shape: OVAL to CIRCULAR, larger than blast
• Lesion color: BROWN with YELLOW HALO (wider halo than blast)
• Lesion size: 0.5–1.0cm (much larger than blast lesions)
• Distribution: Scattered throughout leaf, no specific pattern
• Linked to: POTASSIUM deficiency, poor soil nutrition
• Sporulation: Olive/dark brown sporulation in center

SHEATH BLIGHT (Rhizoctonia solani):
• Location: SHEATH (not leaf blade initially) — oval/irregular lesions
• Lesion center: WHITE/GRAY with irregular brown border
• Lesion margin: Wavy, irregular, like irregular blotches
• Progression: Moves UP from lower sheath → upper sheath → leaf blade
• High density planting = HIGH risk
• Hard SCLEROTIA (mustard-seed-sized black/brown bodies) in lesion = confirmatory sign
• Weather: High humidity, waterlogged fields

SHEATH ROT (Sarocladium oryzae):
• Location: FLAG LEAF SHEATH — irregular brown lesions with gray center
• Panicle: Partial emergence, grains shrivelled, white or brown panicle
• Cottony white mycelium inside sheath
• Linked to: Thrips/stem borer injury that opens entry points

BACTERIAL LEAF BLIGHT — BLB (Xanthomonas oryzae pv. oryzae):
• Lesion type: WATER-SOAKED margins that turn YELLOW then white/straw
• Pattern: Starts from LEAF TIP or MARGINS, progresses inward
• Leaf looks: Dried/bleached from tip, wavy lesion margin
• Kresek phase: Young plants wilt and die (bacterial wilt of seedling)
• Bacterial ooze test: Cut affected leaf in water — milky ooze in 5 min
• Weather: High humidity, flood, wind damage

NARROW BROWN SPOT (Cercospora janseana):
• Lesion: VERY NARROW, linear, dark brown, running parallel to veins
• No halo, much narrower than brown spot
• Late season, booting/heading stage

TABLE 3 — NUTRIENT DEFICIENCY DIFFERENTIATION
───────────────────────────────────────────────

NITROGEN (N):
• Symptom: Uniform yellowing starting from OLDER (lower) leaves upward
• Pattern: SYMMETRICAL on both leaf halves
• Color: Pale green to yellow, tip yellowing
• Entire plant stunted, thin tillers
• Linked to: Waterlogging (denitrification), low organic matter soil

PHOSPHORUS (P):
• Older leaves: Purple/reddish coloration (anthocyanin accumulation)
• Plant stunted, dark green young leaves
• Delayed maturity, poor root development
• Cool soils worsen P deficiency

POTASSIUM (K):
• Older leaves: Tip and margin SCORCH (brown, crispy edges)
• Leaf tip burns from TIP inward
• Associated with: Brown spot disease susceptibility
• Lodging susceptibility in rice

ZINC (Zn) — Very common in Bangladesh rice:
• Young leaves: Mid-vein area becomes WHITE/PALE (whitish striping)
• Leaves show reddish-brown rust-colored spots on white/pale background
• Stunted tillering, new leaves show white streaks along midrib
• Especially in flooded paddies, alkaline soils
• BRRI term: "Khaira" disease of rice

IRON (Fe) — Toxicity common in Bangladesh wetlands:
• Young leaves: Yellowing with brown specks/spots (bronzing)
• Interveinal chlorosis on young leaves
• Iron toxicity (excess Fe in waterlogged soil): Bronzing from leaf tip

SULPHUR (S):
• Young leaves turn PALE YELLOW/CREAM (uniform yellowing of NEW leaves)
• Unlike N (old leaves first), S affects YOUNG leaves first
• Veins may remain slightly greener than interveinal areas

MAGNESIUM (Mg):
• INTERVEINAL chlorosis — veins stay green, areas between veins yellow
• Starts on OLDER leaves
• Classic "tiger stripe" pattern in severe cases

SILICON (Si) — Bangladesh specific:
• Erect leaves become droopy, whitish tip lesions
• Reduced resistance to blast and BLB

TABLE 4 — OOMYCETE vs TRUE FUNGUS (Critical for Treatment)
────────────────────────────────────────────────────────────

TRUE FUNGUS:
• Hard fruiting bodies (pycnidia, acervuli, sclerotia)
• Powdery/rust pustules
• Treat with: Propiconazole, Tricyclazole, Carbendazim, Iprodione, Tebuconazole
• FRAC rotation mandatory to prevent resistance

OOMYCETE (Pythium, Phytophthora — NOT a true fungus):
• White cottony sporulation, no hard structures
• Aggressive rapid rotting (damping off, late blight)
• Standard fungicides INEFFECTIVE
• Treat with: Metalaxyl, Mancozeb, Fosetyl-Al, Cymoxanil+Mancozeb
• Critical: misidentifying as true fungus = treatment failure

TABLE 5 — VIRUS DIFFERENTIATION
──────────────────────────────────

RICE TUNGRO (RTV — transmitted by Green Leafhopper):
• Yellow-orange discoloration of younger leaves
• Stunting, reduced tillering
• Infected plant: partial sterility
• Linked to: Green leafhopper infestation
• No chemical cure — control vector (leafhopper)

TOMATO YELLOW LEAF CURL VIRUS (TYLCV — Whitefly transmitted):
• Leaf curling upward, yellowing of leaf margins
• Interveinal chlorosis on young leaves
• Stunted plants
• Control: Whitefly management (reflective mulch, sticky traps, insecticide)

MOSAIC VIRUSES (multiple crops):
• Mosaic/mottle pattern — irregular light/dark green patches
• Young leaves most affected
• No cure — remove infected plants, control vectors

═══════════════════════════════════════════════════════
PART 3 — THE BIG 5 RECOMMENDATION FRAMEWORK
═══════════════════════════════════════════════════════

ALL recommendations MUST pass through these 5 filters:

1. ECONOMIC: Is the damage loss > cost of control?
   If NO → recommend "Do Nothing / Monitor" as the optimal output
   Economic Threshold: <5% leaf area damaged for most insects = no action needed

2. EFFECTIVE: Is the recommended method scientifically proven for this pathogen in Bangladesh?

3. SAFE — PLANTWISE RED LIST (NEVER recommend these):
   BANNED: Aldrin, Dieldrin, Endrin, Chlordane, Monocrotophos, Methamidophos,
   Carbofuran (granule/liquid), Endosulfan, Parathion, Methyl-parathion,
   Phorate, Aldicarb, Phosphamidon, Triazophos on rice during flowering

4. PRACTICAL: Suitable for smallholder farmers with limited equipment

5. LOCALLY AVAILABLE: Only recommend products available in Bangladesh markets

═══════════════════════════════════════════════════════
PART 4 — RESISTANCE MANAGEMENT (FRAC/IRAC)
═══════════════════════════════════════════════════════

FUNGICIDE RESISTANCE:
• Never repeat same FRAC group consecutively
• SDHI (Group 7) + SBI (Group 3) — HIGH resistance risk, rotate strictly
• Multisite (FRAC M3 Mancozeb, M1 Copper) — LOW resistance risk, safe to repeat
• Biological priming: Trichoderma, Chitosan Oligosaccharide (COS) — activates plant SAR/ISR immunity

INSECTICIDE RESISTANCE:
• Rotate IRAC groups: Neonicotinoids (Group 4) → Organophosphate (Group 1B) → Pyrethroid (Group 3A)
• Never use same group >2 consecutive sprays

═══════════════════════════════════════════════════════
PART 5 — VISUAL ANALYSIS PROTOCOL (When image provided)
═══════════════════════════════════════════════════════════

When an image is provided, systematically examine:

1. DISTRIBUTION: Whole field pattern visible? Uniform or focal?
2. LEAF SURFACE: Upper vs lower surface affected?
3. LESION MORPHOLOGY: Shape (spindle/circular/linear/irregular), size, color, border, center
4. SIGNS: Fruiting bodies, webbing, stippling, frass, ooze, powdery coating
5. PLANT PART: Leaf blade, sheath, stem, node, panicle, root
6. PROGRESSION: Tip-down, margin-in, base-up, systemic
7. ASSOCIATED SYMPTOMS: Stunting, wilting, lodging, head sterility

ACCURACY vs PRECISION PRINCIPLE:
• It is SAFER to correctly identify the GROUP (fungal disease, sucking pest) than to wrongly name a specific species
• State confidence level: High / Medium / Low
• If uncertain between two diagnoses, list BOTH with differential features to look for

═══════════════════════════════════════════════════════
PART 6 — MANDATORY OUTPUT FORMAT
═══════════════════════════════════════════════════════

You MUST output EXACTLY in this format. Do not deviate.
Bangla section first (default for farmers), English section second (for extension officers).

---BANGLA_SECTION---
## ১. CABI বর্জন পদ্ধতি অনুযায়ী বিশ্লেষণ
**অ্যাবায়োটিক নাকি বায়োটিক:** [বিশ্লেষণ]
**বর্জন গেট ফলাফল:** [কোন কারণগুলো বাদ দেওয়া হয়েছে এবং কেন]

## ২. সম্ভাব্য রোগ / পোকার নাম
**প্রাথমিক সন্দেহ:** [নাম — বাংলা ও বৈজ্ঞানিক]
**বিকল্প সন্দেহ (যদি থাকে):** [নাম]
**আস্থার মাত্রা:** [উচ্চ / মাঝারি / কম]

## ৩. রোগ ত্রিভুজ মূল্যায়ন
**পোষক (Host):** [জাতের সংবেদনশীলতা, বৃদ্ধির পর্যায়]
**জীবাণু (Pathogen):** [ইনোকুলাম চাপ, ছড়ানোর ধরন]
**পরিবেশ (Environment):** [আবহাওয়া ডেটার ভিত্তিতে বিশ্লেষণ]

## ৪. মাঠে নিশ্চিতকরণের পদ্ধতি
[কীভাবে মাঠে নিশ্চিত করবেন — ব্যাকটেরিয়াল স্ট্রিমিং টেস্ট / পাতা উল্টানো / সাদা কাগজ পরীক্ষা ইত্যাদি]

## ৫. তীব্রতা ও অর্থনৈতিক গুরুত্ব
**ক্ষয়ক্ষতির মাত্রা:** [%]
**অর্থনৈতিক থ্রেশহোল্ড:** [ব্যবস্থা নেওয়া প্রয়োজন কিনা]

## ৬. সমন্বিত বালাই ব্যবস্থাপনা (IPM)
**কৃষি ব্যবস্থাপনা (সর্বোচ্চ অগ্রাধিকার):**
[বিস্তারিত]
**জৈবিক নিয়ন্ত্রণ:**
[Trichoderma, COS, জৈব বালাইনাশক]
**রাসায়নিক (শেষ উপায় — FRAC/IRAC গ্রুপ উল্লেখসহ):**
[শুধুমাত্র যদি অর্থনৈতিক থ্রেশহোল্ড অতিক্রম করে]

## ৭. প্রতিরোধ — পরবর্তী মৌসুম
[বিস্তারিত]

## ৮. কখন DAE কর্মকর্তার পরামর্শ নেবেন
[নির্দিষ্ট পরিস্থিতি]
---END_BANGLA---

---ENGLISH_SECTION---
## 1. CABI Exclusion Analysis
**Abiotic vs Biotic:** [analysis]
**Exclusion Gates:** [which causes excluded and why]

## 2. Probable Diagnosis
**Primary suspect:** [name — common & scientific]
**Differential diagnosis:** [alternative if applicable]
**Confidence level:** [High / Medium / Low]

## 3. Disease Triangle Assessment
**Host:** [variety susceptibility, growth stage]
**Pathogen:** [inoculum pressure, spread pattern]
**Environment:** [weather-based analysis]

## 4. Field Confirmation Method
[Specific field tests: bacterial streaming, leaf flip, white paper shake test, etc.]

## 5. Severity & Economic Importance
**Damage level:** [%]
**Economic threshold:** [action justified or not]

## 6. IPM Recommendations
**Cultural control (highest priority):**
[details]
**Biological control:**
[Trichoderma, COS, biopesticides]
**Chemical — last resort (with FRAC/IRAC group):**
[only if economic threshold exceeded — Bangladesh-available products only]

## 7. Prevention — Next Season
[details]

## 8. When to Consult DAE
[specific situations]
---END_ENGLISH---

CRITICAL RULES:
- NEVER recommend Plantwise Red List pesticides under any circumstance
- ALWAYS state confidence level
- ALWAYS show your exclusion reasoning (which gates ruled out which causes)
- ALWAYS factor real-time weather data into Disease Triangle
- If damage is below economic threshold, explicitly recommend "Do Nothing — Monitor"
- Accuracy (correct group) > Precision (specific species) when uncertain

STRUCTURED OUTPUT REQUIREMENT:
At the very end of your response, after ---END_ENGLISH---, include ONE JSON block using EXACTLY this format.
Fill every field. Use only valid JSON (double quotes, no comments, no trailing commas).

---JSON_SUMMARY---
{
  "disease_name": "Rice Leaf Blast",
  "disease_name_bn": "ধানের পাতা ব্লাস্ট",
  "confidence": "high",
  "confidence_pct": 85,
  "severity": "moderate",
  "urgency": "within_3_days",
  "biotic_abiotic": "biotic",
  "cause_type": "fungal",
  "etl_exceeded": true,
  "action_required": true,
  "gate_results": {
    "a_insects": "excluded",
    "a_reason": "No chewing marks, frass, webbing or insect presence observed",
    "b_virus": "excluded",
    "b_reason": "No mosaic, ring spots, or vein-bounded chlorosis",
    "c_bacteria": "excluded",
    "c_reason": "No water-soaked margins or bacterial ooze at lesion edges",
    "d_fungi": "confirmed",
    "d_reason": "Spindle-shaped gray-centered lesions with brown borders confirm Pyricularia oryzae"
  },
  "top_candidates": [
    {
      "rank": 1,
      "name_bn": "ব্লাস্ট",
      "name_en": "Leaf Blast",
      "scientific_name": "Pyricularia oryzae",
      "confidence_pct": 85,
      "key_feature": "Spindle/diamond lesions, gray ash-colored center, brown border with yellow halo"
    },
    {
      "rank": 2,
      "name_bn": "বাদামি দাগ",
      "name_en": "Brown Spot",
      "scientific_name": "Bipolaris oryzae",
      "confidence_pct": 12,
      "key_feature": "Oval circular lesions, wider yellow halo, often linked to K-deficiency"
    }
  ],
  "disease_triangle": {
    "host_score": 7,
    "pathogen_score": 8,
    "environment_score": 9,
    "host_note": "Susceptible variety at tillering stage — high vulnerability window",
    "pathogen_note": "High inoculum pressure; district has blast history from previous seasons",
    "environment_note": "Humidity 87%, night temperature 24°C — ideal blast infection conditions"
  },
  "field_confirmation": {
    "test_bn": "পাতায় মাকু/হীরা আকৃতির ছাই রঙের দাগ খুঁজুন",
    "steps_bn": [
      "পাতার উপরিভাগে মাকু বা হীরা আকৃতির দাগ খুঁজুন",
      "দাগের কেন্দ্র ছাই/ধূসর রঙের কিনা যাচাই করুন",
      "আর্দ্র সকালে সূক্ষ্ম ধূসর ছত্রাক স্পোর দেখুন",
      "কলার ব্লাস্টের জন্য পাতা ও কান্ডের সংযোগস্থল পরীক্ষা করুন"
    ]
  },
  "ipm_recommendations": [
    {
      "priority": 1,
      "type": "cultural",
      "action_bn": "আক্রান্ত জমির পানি সরিয়ে জমি সাময়িক শুকিয়ে নিন",
      "timing": "এখনই"
    },
    {
      "priority": 2,
      "type": "chemical",
      "action_bn": "ট্রাইসাইক্লাজোল (ব্রিকোল/ট্রুপার) ০.৭ গ্রাম/লিটার পানিতে মিশিয়ে স্প্রে করুন",
      "timing": "৩ দিনের মধ্যে"
    },
    {
      "priority": 3,
      "type": "biological",
      "action_bn": "ট্রাইকোডার্মা ভিরিডি বা কাইটোসান অলিগোস্যাকারাইড (COS) প্রয়োগ করুন",
      "timing": "প্রতিরোধ হিসেবে"
    },
    {
      "priority": 4,
      "type": "monitoring",
      "action_bn": "৭ দিন পর পুনরায় মূল্যায়ন করুন; নতুন দাগ দেখা গেলে FRAC গ্রুপ বদলান",
      "timing": "৭ দিন পর"
    }
  ],
  "chemical_options": [
    {
      "name_bn": "ট্রাইসাইক্লাজোল",
      "trade_name": "ব্রিকোল / ট্রুপার",
      "frac_irac_group": "FRAC 29",
      "dose": "০.৭ গ্রাম/লিটার",
      "phi_days": 14
    },
    {
      "name_bn": "প্রোপিকোনাজোল",
      "trade_name": "টিল্ট / নাটিভো",
      "frac_irac_group": "FRAC 3",
      "dose": "১ মিলি/লিটার",
      "phi_days": 14
    }
  ],
  "prevention_bn": "ব্লাস্ট-প্রতিরোধী জাত ব্যবহার করুন (BRRI dhan28/29/47)। বীজ শোধন করুন। নাইট্রোজেন সার ভাগে ভাগে দিন।",
  "dae_consult_bn": "৭ দিনে আক্রমণ না কমলে বা নতুন জমিতে ছড়িয়ে পড়লে DAE কর্মকর্তাকে জানান।",
  "key_recommendations": [
    "জমি সাময়িক শুকিয়ে নিন",
    "ট্রাইসাইক্লাজোল স্প্রে করুন (FRAC 29)",
    "পরবর্তী মৌসুমে প্রতিরোধী জাত ব্যবহার করুন"
  ]
}
---END_JSON---

CRITICAL JSON RULES:
- The JSON block is MANDATORY in every response — never omit it
- All "confidence_pct" values must be integers 0–100; all candidates must sum to ≤100
- "urgency" must be exactly one of: "immediate" | "within_3_days" | "within_week" | "monitor"
- "gate_results" keys: a_insects / b_virus / c_bacteria / d_fungi — values: "excluded" | "retained" | "uncertain"
- "type" in ipm_recommendations: "cultural" | "biological" | "chemical" | "monitoring"
- "phi_days" is integer days before harvest; set 0 if not applicable
- Provide at least 2 top_candidates (rank 1 = primary, rank 2 = differential)
- If abiotic, set all gate results to "excluded" and explain in top_candidates
- Accuracy over precision: if uncertain between two diagnoses, lower confidence_pct and show both candidates
`.trim();

// ─── Helpers ──────────────────────────────────────────────────────────────────
function stripImages(messages) {
  return messages.map((m) => ({
    ...m,
    content: Array.isArray(m.content)
      ? m.content.filter((b) => b.type !== "image")
      : m.content,
  }));
}

function toOpenAIMessages(messages) {
  return messages.map((m) => {
    if (typeof m.content === "string") return { role: m.role, content: m.content };
    if (Array.isArray(m.content)) {
      return {
        role: m.role,
        content: m.content.map((b) => {
          if (b.type === "text") return { type: "text", text: b.text };
          if (b.type === "image" && b.source?.type === "base64") {
            return {
              type: "image_url",
              image_url: { url: `data:${b.source.media_type || "image/jpeg"};base64,${b.source.data}` },
            };
          }
          return null;
        }).filter(Boolean),
      };
    }
    return m;
  });
}

function compressMessages(messages, maxBase64Chars = 1_000_000) {
  return messages.map((m) => {
    if (!Array.isArray(m.content)) return m;
    return {
      ...m,
      content: m.content.map((b) => {
        if (b.type === "image" && b.source?.data?.length > maxBase64Chars) {
          return { ...b, source: { ...b.source, data: b.source.data.slice(0, maxBase64Chars) } };
        }
        return b;
      }),
    };
  });
}

const OPENROUTER_VISION_MODELS = [
  "qwen/qwen2.5-vl-72b-instruct:free",
  "meta-llama/llama-3.2-11b-vision-instruct:free",
];

const OPENROUTER_TEXT_MODELS = [
  "qwen/qwen2.5-72b-instruct:free",
  "meta-llama/llama-3.2-11b-vision-instruct:free",
];

function extractPlainUserText(messages) {
  return messages
    .flatMap((m) => {
      if (!Array.isArray(m.content)) return typeof m.content === "string" ? [m.content] : [];
      return m.content.filter((b) => b.type === "text" && b.text).map((b) => b.text);
    })
    .join("\n");
}

// ─── Structured JSON extraction ────────────────────────────────────
function extractStructuredJson(text) {
  try {
    const marker = "---JSON_SUMMARY---";
    const endMarker = "---END_JSON---";
    const startIdx = text.indexOf(marker);
    const endIdx = text.indexOf(endMarker);
    if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) return null;
    const jsonStr = text.slice(startIdx + marker.length, endIdx).trim();
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

function stripStructuredJson(text) {
  const marker = "---JSON_SUMMARY---";
  const endMarker = "---END_JSON---";
  const startIdx = text.indexOf(marker);
  const endIdx = text.indexOf(endMarker);
  if (startIdx === -1 || endIdx === -1) return text;
  return text.slice(0, startIdx).trim() + text.slice(endIdx + endMarker.length).trim();
}

function buildEmergencyDiagnosis(messages, imageAttached) {
  const text = extractPlainUserText(messages);
  const lower = text.toLowerCase();

  const suspects = [];
  if (/yellow|হলুদ|chlorosis/.test(lower)) suspects.push("পুষ্টি ঘাটতি / nutrient deficiency");
  if (/spot|দাগ|blast|blight|lesion/.test(lower)) suspects.push("ছত্রাক বা ব্যাকটেরিয়া / fungal or bacterial disease");
  if (/curl|কুঁক|মোড়া|mosaic|virus/.test(lower)) suspects.push("ভাইরাস বা থ্রিপস-এফিড / virus or sucking pest damage");
  if (/hole|ছিদ্র|chew|roll|frass|web|mite|aphid|thrips|insect|পোকা/.test(lower)) suspects.push("পোকার আক্রমণ / insect or mite attack");
  if (/wilt|মরে|শুক|rot|পচা/.test(lower)) suspects.push("উইল্ট বা রুট/স্টেম রট / wilt or root-stem rot");

  const primary = suspects[0] || "ছবি ও বর্ণনার ভিত্তিতে রোগ/পোকার একটি প্রাথমিক সন্দেহ";
  const differentials = suspects.slice(1, 3);
  const imageNote = imageAttached
    ? "ছবি যুক্ত আছে, তাই এটি একটি প্রাথমিক মাঠ-স্তরের জরুরি বিশ্লেষণ।"
    : "এই বিশ্লেষণটি মূলত আপনার বর্ণনার ভিত্তিতে করা হয়েছে।";

  return `---BANGLA_SECTION---
## ১. প্রাথমিক CABI বিশ্লেষণ
**অবস্থা:** জরুরি বিকল্প বিশ্লেষণ
**মন্তব্য:** ${imageNote}

## ২. সম্ভাব্য কারণ
**প্রাথমিক সন্দেহ:** ${primary}
**বিকল্প সন্দেহ:** ${differentials.length ? differentials.join(" ; ") : "মাঠে দেখে নিশ্চিত করা দরকার"}
**আস্থার মাত্রা:** কম থেকে মাঝারি

## ৩. এখনই যা করবেন
- আক্রান্ত গাছ/পাতা আলাদা করে দেখুন
- পাতার উল্টোপাশে পোকা, ডিম, জাল, মধুরস বা কালো ফোঁটা আছে কি না দেখুন
- দাগ পানিভেজা কিনারা থেকে শুরু হলে ব্যাকটেরিয়া সন্দেহ করুন
- দাগ হীরার মতো বা বাদামি গোল হলে ছত্রাক সন্দেহ করুন
- উপসর্গ দুই পাশ সমান হলে পুষ্টি ঘাটতি আগে বিবেচনা করুন

## ৪. কৃষক-নিরাপদ তাৎক্ষণিক পরামর্শ
- এখনই অপ্রয়োজনীয় কীটনাশক/ফাঙ্গিসাইড স্প্রে করবেন না
- আক্রান্ত অংশের পরিষ্কার ছবি আবার নিন: পুরো গাছ, পাতার সামনে, পাতার পেছন, কান্ডের গোড়া
- জমিতে পানি, সার, আগাছা ও সাম্প্রতিক স্প্রের ইতিহাস লিখে রাখুন
- ক্ষতি দ্রুত বাড়লে নিকটস্থ DAE কর্মকর্তাকে দেখান
---END_BANGLA---

---ENGLISH_SECTION---
## 1. Provisional CABI Analysis
**Status:** Emergency fallback assessment
**Note:** ${imageAttached ? "An image was attached, but this is still a provisional field-safe analysis." : "This assessment is mainly based on the user description."}

## 2. Most Likely Cause
**Primary suspect:** ${primary}
**Differentials:** ${differentials.length ? differentials.join(" ; ") : "Needs field confirmation"}
**Confidence:** Low to Medium

## 3. Immediate Safe Actions
- Inspect the underside of leaves for insects, mites, eggs, webbing, honeydew, or black frass
- If lesions are water-soaked from the tip/margin, consider bacterial causes
- If lesions are spindle, circular, or dry brown spots, consider fungal causes
- If symptoms are symmetrical on both leaf halves, consider nutrient deficiency first
- Avoid unnecessary pesticide spraying until the cause is narrowed

## 4. Next Step
Capture clearer photos of the whole plant, front and back of leaves, and stem base, then retry or consult a local DAE officer if spread is rapid.
---END_ENGLISH---`;
}

// ─── Provider: Google Gemini 2.5 Flash ─────────────────────────────────────
async function tryGemini(messages, withVision = true, systemPrompt = SYSTEM_PROMPT) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const src = withVision ? compressMessages(messages) : stripImages(messages);
  const lastMsg = src[src.length - 1];
  const content = Array.isArray(lastMsg.content)
    ? lastMsg.content
    : [{ type: "text", text: lastMsg.content }];

  const parts = [];
  for (const block of content) {
    if (block.type === "image" && block.source?.type === "base64") {
      parts.push({ inlineData: { mimeType: block.source.media_type || "image/jpeg", data: block.source.data } });
    } else if (block.type === "text") {
      parts.push({ text: block.text });
    }
  }

  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: "user", parts }],
    generationConfig: { maxOutputTokens: 3000, temperature: 0.3 },
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `Gemini HTTP ${res.status}`);

  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("\n") || "No response.";
  return { text, provider: withVision ? "Google Gemini 2.5 Flash 👁️" : "Google Gemini 2.5 Flash (text)" };
}

// ─── Provider 2: Groq Llama 4 Scout ──────────────────────────────────────────
async function tryGroq(messages, systemPrompt = SYSTEM_PROMPT) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not set");

  const body = {
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    max_tokens: 3000,
    temperature: 0.3,
    messages: [{ role: "system", content: systemPrompt }, ...toOpenAIMessages(compressMessages(messages))],
  };

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `Groq HTTP ${res.status}`);
  return { text: data?.choices?.[0]?.message?.content || "No response.", provider: "Groq Llama 4 Scout ⚡" };
}

// ─── Provider: OpenRouter (used for both vision and text fallbacks) ──────────
async function tryOpenRouter(messages, modelId, systemPrompt = SYSTEM_PROMPT, extraBody = {}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY not set");

  const body = {
    model: modelId,
    max_tokens: 3000,
    messages: [{ role: "system", content: systemPrompt }, ...toOpenAIMessages(compressMessages(messages))],
    ...extraBody,
  };

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://cabi-diagnosis.vercel.app",
      "X-Title": "CABI Bangladesh Crop Diagnosis",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data?.error?.message || `OpenRouter HTTP ${res.status}`);

  const resolvedModel = (data?.model || modelId).split("/").pop().replace(":free", "");
  const providerName = data?.provider ? ` via ${data.provider}` : "";
  return { text: data?.choices?.[0]?.message?.content || "No response.", provider: `OpenRouter / ${resolvedModel}${providerName}` };
}

// ─── Main Handler ─────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  // CORS
  if (handleCORSPreflight(req, res, "POST, OPTIONS")) return;
  setCORSHeaders(req, res, "POST, OPTIONS");

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Verify request signature (prevents external API abuse)
  if (requireSignedRequest(req, res)) return;

  // Rate limiting
  if (diagnoseLimiter(req, res)) return;

  // Parse body
  const body = parseBody(req);
  if (!body) return res.status(400).json({ error: "Invalid JSON body" });

  // Validate and sanitize messages
  const { messages: rawMessages, systemPrompt: customPrompt } = body || {};
  const systemPrompt = customPrompt && typeof customPrompt === "string" && customPrompt.length <= 5000
    ? customPrompt
    : SYSTEM_PROMPT;

  const validation = validateDiagnoseMessages(rawMessages || []);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }
  const messages = validation.messages;
  const imageAttached = validation.imageCount > 0;

  // Overall timeout wrapper — suppresses unhandled rejections from the losing promise
  const withTimeout = (promise, label) => {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error(`${label} timed out`)), REQUEST_TIMEOUT_MS);
    });
    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
  };

  const attempts = [];

  // ═══════════════════════════════════════════════════════════════════════════
  // WATERFALL: Gemini 2.5 Flash → OpenRouter Qwen-VL → Groq Llama4 → OR text → Gemini text → Emergency
  // Gemini is primary because it has the best free vision quality for agriculture.
  // ═══════════════════════════════════════════════════════════════════════════

  // ─── 1. Gemini 2.5 Flash (best free vision model — primary) ────────────
  try {
    const r = await withTimeout(tryGemini(messages, imageAttached, systemPrompt), "Gemini 2.5 Flash");
    const structured = extractStructuredJson(r.text);
    const cleanText = structured ? stripStructuredJson(r.text) : r.text;
    return res.status(200).json({ content: [{ type: "text", text: cleanText }], structured, provider: r.provider, attempts });
  } catch (e) { attempts.push(`Gemini 2.5 Flash: ${e.message}`); }

  // ─── 2. OpenRouter Qwen-VL smart route (vision or text) ────────────────
  try {
    const primaryModel = imageAttached ? OPENROUTER_VISION_MODELS[0] : OPENROUTER_TEXT_MODELS[0];
    const fallbackModels = imageAttached ? OPENROUTER_VISION_MODELS.slice(1) : OPENROUTER_TEXT_MODELS.slice(1);
    const r = await withTimeout(
      tryOpenRouter(messages, primaryModel, systemPrompt, {
        models: fallbackModels,
        route: "fallback",
        provider: { allow_fallbacks: true, sort: "throughput" },
      }),
      "OpenRouter"
    );
    const structured = extractStructuredJson(r.text);
    const cleanText = structured ? stripStructuredJson(r.text) : r.text;
    return res.status(200).json({ content: [{ type: "text", text: cleanText }], structured, provider: r.provider, attempts });
  } catch (e) { attempts.push(`OpenRouter smart route: ${e.message}`); }

  // ─── 3. Groq Llama 4 Scout (fast text, no vision) ──────────────────────
  try {
    const r = await withTimeout(tryGroq(messages, systemPrompt), "Groq");
    const structured = extractStructuredJson(r.text);
    const cleanText = structured ? stripStructuredJson(r.text) : r.text;
    return res.status(200).json({ content: [{ type: "text", text: cleanText }], structured, provider: r.provider, attempts });
  } catch (e) { attempts.push(`Groq: ${e.message}`); }

  // ─── 4. OpenRouter text-only fallback ───────────────────────────────────
  try {
    const r = await withTimeout(
      tryOpenRouter(messages, OPENROUTER_TEXT_MODELS[0], systemPrompt, {
        models: OPENROUTER_TEXT_MODELS.slice(1),
        route: "fallback",
        provider: { allow_fallbacks: true, sort: "throughput" },
      }),
      "OpenRouter text"
    );
    const note = imageAttached
      ? "\n\n---\nProvisional response: this answer was generated from the text description after the vision path fell back."
      : "";
    const structured = extractStructuredJson(r.text);
    const cleanText = structured ? stripStructuredJson(r.text) : r.text;
    return res.status(200).json({ content: [{ type: "text", text: cleanText + note }], structured, provider: r.provider, attempts });
  } catch (e) { attempts.push(`OpenRouter text: ${e.message}`); }

  // ─── 5. Gemini text-only fallback (always try, even without images) ───
  try {
    const r = await withTimeout(tryGemini(messages, false, systemPrompt), "Gemini text");
    const note = imageAttached
      ? "\n\n---\n⚠️ ছবি বিশ্লেষণ এই মুহূর্তে সম্ভব হয়নি। বর্ণনার ভিত্তিতে রোগ নির্ণয় করা হয়েছে।\n*(Image analysis unavailable. Diagnosis based on description only.)*"
      : "";
    const structured = extractStructuredJson(r.text);
    const cleanText = structured ? stripStructuredJson(r.text) : r.text;
    return res.status(200).json({ content: [{ type: "text", text: cleanText + note }], structured, provider: r.provider, attempts });
  } catch (e) { attempts.push(`Gemini text: ${e.message}`); }

  // ─── 6. Emergency offline-style fallback ────────────────────────────────
  const fallbackText = buildEmergencyDiagnosis(messages, imageAttached);
  const emergencyStructured = {
    disease_name: "Unknown — emergency fallback",
    disease_name_bn: "অজানা — জরুরি বিকল্প বিশ্লেষণ",
    confidence: "low",
    confidence_pct: 20,
    severity: "moderate",
    urgency: "within_3_days",
    biotic_abiotic: "uncertain",
    cause_type: "other",
    etl_exceeded: false,
    action_required: true,
    gate_results: {
      a_insects: "uncertain", a_reason: "Could not determine — please inspect plant",
      b_virus: "uncertain", b_reason: "Could not determine — check for mosaic patterns",
      c_bacteria: "uncertain", c_reason: "Could not determine — check for water-soaked margins",
      d_fungi: "uncertain", d_reason: "Could not determine — check for fruiting bodies",
    },
    top_candidates: [
      { rank: 1, name_bn: "অজানা (সম্ভাব্য ছত্রাক/পোকা)", name_en: "Unknown (possible fungal/pest)", scientific_name: "N/A", confidence_pct: 20, key_feature: "Cannot determine without clearer description or image" },
      { rank: 2, name_bn: "পুষ্টি ঘাটতি", name_en: "Nutrient Deficiency", scientific_name: "N/A", confidence_pct: 15, key_feature: "Symmetric symptoms on leaf halves suggest possible abiotic cause" },
    ],
    disease_triangle: {
      host_score: 5, pathogen_score: 5, environment_score: 5,
      host_note: "Cannot assess without crop/variety information",
      pathogen_note: "Cannot assess without symptom detail",
      environment_note: "Cannot assess without weather data",
    },
    field_confirmation: {
      test_bn: "নিচের ধাপে মাঠে পরীক্ষা করুন",
      steps_bn: [
        "পাতার উল্টোপাশে পোকা, ডিম, জাল বা কালো দানা আছে কি না দেখুন",
        "দাগ পানিভেজা কিনারা থেকে শুরু হলে ব্যাকটেরিয়া সন্দেহ করুন",
        "দাগ মাকু বা হীরা আকৃতির হলে ব্লাস্ট সন্দেহ করুন",
        "উপসর্গ দুই পাশ সমান হলে পুষ্টি ঘাটতি বিবেচনা করুন",
      ],
    },
    ipm_recommendations: [
      { priority: 1, type: "monitoring", action_bn: "পাতার সামনে-পেছন, কান্ডের গোড়া ও শিকড়ের ছবি তুলুন", timing: "এখনই" },
      { priority: 2, type: "cultural", action_bn: "আক্রান্ত অংশ আলাদা করে রাখুন — ছড়িয়ে পড়া ঠেকান", timing: "এখনই" },
      { priority: 3, type: "monitoring", action_bn: "কোনো কীটনাশক প্রয়োগের আগে কারণ নিশ্চিত করুন", timing: "নিশ্চিত হওয়ার পর" },
    ],
    chemical_options: [],
    prevention_bn: "কারণ নিশ্চিত না হওয়া পর্যন্ত রাসায়নিক প্রয়োগ থেকে বিরত থাকুন।",
    dae_consult_bn: "দ্রুত ক্ষয়ক্ষতি বাড়লে বা কারণ বোঝা না গেলে অবশ্যই স্থানীয় DAE কর্মকর্তার সাথে যোগাযোগ করুন।",
    key_recommendations: [
      "পাতার উল্টোপাশে পোকা/ডিম দেখুন",
      "দাগ পানিভেজা কিনারা হলে ব্যাকটেরিয়া সন্দেহ করুন",
      "DAE কর্মকর্তাকে দেখান",
    ],
  };
  return res.status(200).json({
    content: [{ type: "text", text: fallbackText }],
    structured: emergencyStructured,
    provider: "Emergency CABI fallback",
    attempts,
  });
}
