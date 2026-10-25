const IMAGE_BASE = 'https://img.spoonacular.com/recipes';

// Spoonacular costruisce le immagini con id, misura e formato.
// Nei risultati di ricerca arriva la 312x231, troppo piccola per gli schermi di oggi.
export function recipeImage(id, imageType, size = '556x370') {
  if (!id || !imageType) return null;
  return `${IMAGE_BASE}/${id}-${size}.${imageType}`;
}

export function toRecipeCard(raw) {
  return {
    id: raw.id,
    title: raw.title,
    image: recipeImage(raw.id, raw.imageType) ?? raw.image ?? null,
  };
}

// Frasi del riassunto che non servono a chi cucina: punteggi, prezzi
// e link ad altre ricette del sito di Spoonacular
const NOISE = /spoonacular score|similar recipes|if you like this recipe|found this recipe|per serving|costs \$|takes roughly/i;

export function cleanSummary(html = '') {
  const text = new DOMParser().parseFromString(html, 'text/html').body.textContent ?? '';

  return text
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => sentence && !NOISE.test(sentence))
    .join(' ')
    .trim();
}

// Nelle quantità di Spoonacular l'unità "servings" vuol dire "quanto basta".
// Senza unità invece può essere un conteggio ("2 eggplants") oppure ancora un
// "quanto basta": lo considero un numero solo se la ricetta originale ne riporta uno.
function isMeasurable(raw, amount, unit) {
  if (!Number.isFinite(amount) || /^servings?$/i.test(unit)) return false;
  if (unit) return true;
  return /^\s*[\d½¼¾⅓⅔⅛]/.test(raw.original ?? '');
}

function toIngredient(raw, index) {
  const metric = raw.measures?.metric ?? {};
  const unit = metric.unitShort ?? '';
  const measurable = isMeasurable(raw, metric.amount, unit);

  return {
    // lo stesso ingrediente può comparire due volte, l'indice rende la chiave unica
    key: `${raw.id ?? 'x'}-${index}`,
    name: raw.nameClean || raw.name || raw.original,
    original: raw.original,
    amount: measurable ? metric.amount : null,
    unit: measurable ? unit : '',
  };
}

function toSteps(raw) {
  const blocks = raw.analyzedInstructions ?? [];
  const steps = blocks.flatMap((block) => block.steps ?? []);

  return steps.map((step, index) => ({ number: index + 1, text: step.step.trim() }));
}

export function toRecipeDetail(raw) {
  const badges = [
    raw.vegan && 'Vegana',
    raw.glutenFree && 'Senza glutine',
    raw.dairyFree && 'Senza latticini',
  ].filter(Boolean);

  return {
    id: raw.id,
    title: raw.title,
    image: recipeImage(raw.id, raw.imageType, '636x393') ?? raw.image ?? null,
    isVegetarian: raw.vegetarian === true,
    badges,
    readyInMinutes: raw.readyInMinutes ?? null,
    servings: raw.servings || 1,
    summary: cleanSummary(raw.summary),
    ingredients: (raw.extendedIngredients ?? []).map(toIngredient),
    steps: toSteps(raw),
    sourceName: raw.sourceName ?? '',
    sourceUrl: raw.sourceUrl ?? '',
  };
}
