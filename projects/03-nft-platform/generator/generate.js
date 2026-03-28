import sharp from "sharp";
import { mkdirSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = resolve(__dirname, "..", "assets");
const COLLECTION_NAME = "Cool Cats";
const COLLECTION_SYMBOL = "CCAT";
const TOTAL_SUPPLY = 10;
const IMAGE_SIZE = 512;

// ---------------------------------------------------------------------------
// Trait definitions — each trait has a name and a set of possible values
// ---------------------------------------------------------------------------

const traits = {
  background: [
    { value: "Sunset", color: "#FF6B6B" },
    { value: "Ocean", color: "#4ECDC4" },
    { value: "Lavender", color: "#A78BFA" },
    { value: "Mint", color: "#6EE7B7" },
    { value: "Peach", color: "#FBBF24" },
    { value: "Sky", color: "#7DD3FC" },
    { value: "Rose", color: "#FB7185" },
    { value: "Lime", color: "#BEF264" },
    { value: "Coral", color: "#F97316" },
    { value: "Ice", color: "#E0F2FE" },
  ],
  fur: [
    { value: "Orange", color: "#F97316", dark: "#EA580C" },
    { value: "Black", color: "#374151", dark: "#1F2937" },
    { value: "White", color: "#F3F4F6", dark: "#D1D5DB" },
    { value: "Gray", color: "#9CA3AF", dark: "#6B7280" },
    { value: "Calico", color: "#FB923C", dark: "#C2410C" },
    { value: "Siamese", color: "#FDE68A", dark: "#D97706" },
    { value: "Tuxedo", color: "#1F2937", dark: "#111827" },
    { value: "Ginger", color: "#DC2626", dark: "#991B1B" },
  ],
  eyes: [
    { value: "Green", color: "#22C55E", pupil: "#15803D" },
    { value: "Blue", color: "#3B82F6", pupil: "#1D4ED8" },
    { value: "Gold", color: "#EAB308", pupil: "#A16207" },
    { value: "Amber", color: "#F59E0B", pupil: "#B45309" },
    { value: "Violet", color: "#8B5CF6", pupil: "#6D28D9" },
    { value: "Heterochromia", color: "#3B82F6", pupil: "#1D4ED8", color2: "#22C55E", pupil2: "#15803D" },
  ],
  expression: [
    { value: "Happy", mouth: "smile" },
    { value: "Cool", mouth: "smirk" },
    { value: "Surprised", mouth: "open" },
    { value: "Sleepy", mouth: "flat" },
    { value: "Cheeky", mouth: "tongue" },
  ],
  accessory: [
    { value: "None" },
    { value: "Crown", type: "crown" },
    { value: "Beanie", type: "beanie" },
    { value: "Bow Tie", type: "bowtie" },
    { value: "Sunglasses", type: "sunglasses" },
    { value: "Wizard Hat", type: "wizardhat" },
  ],
};

// ---------------------------------------------------------------------------
// SVG building blocks
// ---------------------------------------------------------------------------

function buildCatSvg(bg, fur, eyes, expression, accessory) {
  const eyeColorR = eyes.color2 ?? eyes.color;
  const eyePupilR = eyes.pupil2 ?? eyes.pupil;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${IMAGE_SIZE}" height="${IMAGE_SIZE}" viewBox="0 0 512 512">
  <!-- Background -->
  <rect width="512" height="512" fill="${bg.color}" rx="24"/>

  <!-- Body (oval) -->
  <ellipse cx="256" cy="420" rx="120" ry="80" fill="${fur.color}"/>

  <!-- Head -->
  <ellipse cx="256" cy="260" rx="140" ry="130" fill="${fur.color}"/>

  <!-- Left ear -->
  <polygon points="148,180 108,80 188,150" fill="${fur.color}"/>
  <polygon points="152,172 122,100 180,155" fill="#FFB6C1"/>

  <!-- Right ear -->
  <polygon points="364,180 404,80 324,150" fill="${fur.color}"/>
  <polygon points="360,172 390,100 332,155" fill="#FFB6C1"/>

  <!-- Fur pattern for special types -->
  ${fur.value === "Tuxedo" ? `<ellipse cx="256" cy="290" rx="80" ry="70" fill="#F3F4F6"/>` : ""}
  ${fur.value === "Calico" ? `
    <circle cx="210" cy="240" r="30" fill="#1F2937" opacity="0.6"/>
    <circle cx="300" cy="280" r="25" fill="#FDE68A" opacity="0.6"/>
  ` : ""}
  ${fur.value === "Siamese" ? `
    <ellipse cx="256" cy="300" rx="60" ry="40" fill="#92400E" opacity="0.4"/>
  ` : ""}

  <!-- Left eye -->
  <ellipse cx="210" cy="240" rx="28" ry="30" fill="white"/>
  <ellipse cx="210" cy="240" rx="18" ry="22" fill="${eyes.color}"/>
  <ellipse cx="210" cy="240" rx="10" ry="14" fill="${eyes.pupil}"/>
  <ellipse cx="205" cy="232" rx="5" ry="6" fill="white" opacity="0.8"/>
  ${expression.value === "Sleepy" ? `<rect x="180" y="225" width="60" height="15" fill="${fur.color}" rx="4"/>` : ""}

  <!-- Right eye -->
  <ellipse cx="302" cy="240" rx="28" ry="30" fill="white"/>
  <ellipse cx="302" cy="240" rx="18" ry="22" fill="${eyeColorR}"/>
  <ellipse cx="302" cy="240" rx="10" ry="14" fill="${eyePupilR}"/>
  <ellipse cx="297" cy="232" rx="5" ry="6" fill="white" opacity="0.8"/>
  ${expression.value === "Sleepy" ? `<rect x="272" y="225" width="60" height="15" fill="${fur.color}" rx="4"/>` : ""}

  <!-- Nose -->
  <polygon points="256,278 248,290 264,290" fill="#FFB6C1"/>

  <!-- Whiskers -->
  <line x1="140" y1="280" x2="220" y2="285" stroke="${fur.dark}" stroke-width="2" opacity="0.5"/>
  <line x1="140" y1="295" x2="220" y2="292" stroke="${fur.dark}" stroke-width="2" opacity="0.5"/>
  <line x1="292" y1="285" x2="372" y2="280" stroke="${fur.dark}" stroke-width="2" opacity="0.5"/>
  <line x1="292" y1="292" x2="372" y2="295" stroke="${fur.dark}" stroke-width="2" opacity="0.5"/>

  <!-- Mouth / Expression -->
  ${renderMouth(expression)}

  <!-- Accessory -->
  ${renderAccessory(accessory, fur)}
</svg>`;
}

function renderMouth(expression) {
  switch (expression.mouth) {
    case "smile":
      return `<path d="M240,305 Q256,325 272,305" fill="none" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>`;
    case "smirk":
      return `<path d="M240,308 Q260,318 275,305" fill="none" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>`;
    case "open":
      return `<ellipse cx="256" cy="312" rx="12" ry="10" fill="#374151"/>
              <ellipse cx="256" cy="308" rx="8" ry="5" fill="#FB7185"/>`;
    case "flat":
      return `<line x1="240" y1="310" x2="272" y2="310" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>`;
    case "tongue":
      return `<path d="M240,305 Q256,322 272,305" fill="none" stroke="#374151" stroke-width="2.5" stroke-linecap="round"/>
              <ellipse cx="256" cy="320" rx="8" ry="10" fill="#FB7185"/>`;
    default:
      return "";
  }
}

function renderAccessory(accessory, fur) {
  switch (accessory.type) {
    case "crown":
      return `<polygon points="210,140 220,100 240,130 256,90 272,130 292,100 302,140" fill="#EAB308"/>
              <circle cx="235" cy="125" r="4" fill="#EF4444"/>
              <circle cx="256" cy="108" r="4" fill="#3B82F6"/>
              <circle cx="277" cy="125" r="4" fill="#22C55E"/>`;
    case "beanie":
      return `<ellipse cx="256" cy="155" rx="130" ry="50" fill="#EF4444"/>
              <rect x="126" y="150" width="260" height="25" fill="#EF4444" rx="4"/>
              <rect x="126" y="168" width="260" height="8" fill="#1F2937"/>
              <circle cx="256" cy="110" r="10" fill="#EF4444"/>`;
    case "bowtie":
      return `<polygon points="230,360 256,375 230,390" fill="#EF4444"/>
              <polygon points="282,360 256,375 282,390" fill="#EF4444"/>
              <circle cx="256" cy="375" r="6" fill="#B91C1C"/>`;
    case "sunglasses":
      return `<rect x="175" y="225" width="70" height="35" rx="8" fill="#1F2937" opacity="0.9"/>
              <rect x="267" y="225" width="70" height="35" rx="8" fill="#1F2937" opacity="0.9"/>
              <line x1="245" y1="242" x2="267" y2="242" stroke="#1F2937" stroke-width="3"/>
              <line x1="175" y1="242" x2="148" y2="230" stroke="#1F2937" stroke-width="3"/>
              <line x1="337" y1="242" x2="364" y2="230" stroke="#1F2937" stroke-width="3"/>
              <!-- Lens shine -->
              <rect x="182" y="230" width="15" height="5" rx="2" fill="white" opacity="0.2"/>
              <rect x="274" y="230" width="15" height="5" rx="2" fill="white" opacity="0.2"/>`;
    case "wizardhat":
      return `<polygon points="180,170 256,40 332,170" fill="#6D28D9"/>
              <rect x="170" y="160" width="172" height="18" fill="#6D28D9" rx="4"/>
              <circle cx="256" cy="70" r="8" fill="#EAB308"/>
              <text x="220" y="145" font-size="18" fill="#EAB308" font-family="serif">★ ★ ★</text>`;
    default:
      return "";
  }
}

// ---------------------------------------------------------------------------
// Random trait selection with uniqueness tracking
// ---------------------------------------------------------------------------

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateUniqueTraitSets(count) {
  const seen = new Set();
  const results = [];

  while (results.length < count) {
    const set = {
      background: pickRandom(traits.background),
      fur: pickRandom(traits.fur),
      eyes: pickRandom(traits.eyes),
      expression: pickRandom(traits.expression),
      accessory: pickRandom(traits.accessory),
    };

    const key = `${set.background.value}-${set.fur.value}-${set.eyes.value}-${set.expression.value}-${set.accessory.value}`;
    if (!seen.has(key)) {
      seen.add(key);
      results.push(set);
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Main generation
// ---------------------------------------------------------------------------

async function main() {
  mkdirSync(ASSETS_DIR, { recursive: true });

  console.log(`\n🐱 Generating ${TOTAL_SUPPLY} Cool Cats...\n`);

  const traitSets = generateUniqueTraitSets(TOTAL_SUPPLY);

  for (let i = 0; i < traitSets.length; i++) {
    const t = traitSets[i];
    const svg = buildCatSvg(t.background, t.fur, t.eyes, t.expression, t.accessory);

    // Convert SVG to PNG
    const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
    const pngPath = resolve(ASSETS_DIR, `${i}.png`);
    writeFileSync(pngPath, pngBuffer);

    // Create metadata JSON
    const metadata = {
      name: `Cool Cat #${i}`,
      symbol: COLLECTION_SYMBOL,
      description: `A unique cat from the ${COLLECTION_NAME} collection. Each Cool Cat has randomly generated traits making it one of a kind.`,
      image: `${i}.png`,
      attributes: [
        { trait_type: "Background", value: t.background.value },
        { trait_type: "Fur", value: t.fur.value },
        { trait_type: "Eyes", value: t.eyes.value },
        { trait_type: "Expression", value: t.expression.value },
        { trait_type: "Accessory", value: t.accessory.value },
      ],
      properties: {
        files: [{ uri: `${i}.png`, type: "image/png" }],
      },
    };

    const jsonPath = resolve(ASSETS_DIR, `${i}.json`);
    writeFileSync(jsonPath, JSON.stringify(metadata, null, 2));

    const traitStr = [t.fur.value, t.eyes.value + " eyes", t.expression.value, t.accessory.value !== "None" ? t.accessory.value : ""].filter(Boolean).join(", ");
    console.log(`  ✅ Cat #${i}: ${traitStr}`);
  }

  // Collection asset
  const collectionSvg = buildCatSvg(
    { color: "#1E1B4B" },
    { value: "Orange", color: "#F97316", dark: "#EA580C" },
    { value: "Gold", color: "#EAB308", pupil: "#A16207" },
    { value: "Happy", mouth: "smile" },
    { value: "Crown", type: "crown" }
  );

  const collectionPng = await sharp(Buffer.from(collectionSvg)).png().toBuffer();
  writeFileSync(resolve(ASSETS_DIR, "collection.png"), collectionPng);

  const collectionMetadata = {
    name: COLLECTION_NAME,
    symbol: COLLECTION_SYMBOL,
    description: "A collection of 10 unique, randomly generated cats living on the Solana blockchain. Each Cool Cat has unique traits — fur color, eyes, expression, and accessories.",
    image: "collection.png",
    properties: {
      files: [{ uri: "collection.png", type: "image/png" }],
    },
  };
  writeFileSync(resolve(ASSETS_DIR, "collection.json"), JSON.stringify(collectionMetadata, null, 2));

  console.log(`\n  ✅ Collection cover image generated`);
  console.log(`\n🎉 Done! ${TOTAL_SUPPLY} cats + collection asset saved to assets/\n`);
}

main().catch(console.error);
