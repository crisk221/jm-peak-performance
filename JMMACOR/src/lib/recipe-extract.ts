import * as cheerio from "cheerio";

export type ExtractedIngredient = {
  raw: string; // e.g., "1 cup rolled oats"
  qty?: number | undefined; // 1
  unit?: string | undefined; // "cup"
  name?: string | undefined; // "rolled oats"
  note?: string | undefined; // "gluten-free" etc.
};

export type ExtractedRecipe = {
  sourceUrl: string;
  title?: string | undefined;
  image?: string | undefined;
  cuisine?: string | undefined;
  totalTimeMins?: number | undefined; // from totalTime / prepTime + cookTime
  servings?: number | undefined; // from recipeYield
  ingredients: ExtractedIngredient[];
  steps: string[]; // Step 1..N
  nutrition?:
    | { kcal?: number; proteinG?: number; carbsG?: number; fatG?: number }
    | undefined;
  warnings: string[]; // any parse issues
};

// Helper functions
function findRecipeObject(json: any): any {
  if (!json) return null;

  // Direct recipe object
  if (json["@type"] === "Recipe") return json;

  // Array of objects
  if (Array.isArray(json)) {
    for (const item of json) {
      const found = findRecipeObject(item);
      if (found) return found;
    }
  }

  // Graph structure
  if (json["@graph"]) {
    return findRecipeObject(json["@graph"]);
  }

  // Nested objects
  if (typeof json === "object") {
    for (const key in json) {
      if (key !== "@context" && typeof json[key] === "object") {
        const found = findRecipeObject(json[key]);
        if (found) return found;
      }
    }
  }

  return null;
}

function parseISO8601DurationToMinutes(duration: string): number | undefined {
  if (!duration || typeof duration !== "string") return undefined;

  // PT45M or P0DT0H45M0S format
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return undefined;

  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);

  return hours * 60 + minutes;
}

function parseYieldToNumber(yieldValue: any): number | undefined {
  if (typeof yieldValue === "number") return yieldValue;
  if (typeof yieldValue !== "string") return undefined;

  // "Serves 4", "4 servings", "4", "4-6 servings"
  const match = yieldValue.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : undefined;
}

function splitInstructions(instructions: any): string[] {
  if (!instructions) return [];

  if (Array.isArray(instructions)) {
    return instructions
      .map((step) => {
        // HowToStep object
        if (typeof step === "object" && step.text) {
          return step.text.trim();
        }
        // String
        if (typeof step === "string") {
          return step.trim();
        }
        return String(step).trim();
      })
      .filter(Boolean);
  }

  if (typeof instructions === "string") {
    // Split by sentences or numbered steps
    return instructions
      .split(/\d+\.\s*|\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 5); // Filter out very short fragments
  }

  return [];
}

function convertUnicodeFractions(text: string): string {
  return text
    .replace(/¼/g, "0.25")
    .replace(/½/g, "0.5")
    .replace(/¾/g, "0.75")
    .replace(/⅓/g, "0.33")
    .replace(/⅔/g, "0.67")
    .replace(/⅛/g, "0.125")
    .replace(/⅜/g, "0.375")
    .replace(/⅝/g, "0.625")
    .replace(/⅞/g, "0.875");
}

function parseIngredientLine(raw: string): ExtractedIngredient {
  const cleaned = convertUnicodeFractions(raw.trim());

  // Regex to capture: qty + unit + name (+ optional note in parentheses)
  const match = cleaned.match(
    /^(\d+(?:[\/\.\s]\d+)?)\s*([a-zA-Z]+)?\s*(.+?)(?:\s*\(([^)]+)\))?$/,
  );

  if (!match) {
    // If no qty found, treat entire string as name
    return {
      raw,
      name: cleaned,
      qty: undefined,
      unit: undefined,
      note: undefined,
    };
  }

  const [, qtyStr, unit, nameAndNote, note] = match;

  // Parse quantity (handle fractions like "1 1/2")
  let qty: number | undefined;
  try {
    if (qtyStr.includes("/")) {
      const parts = qtyStr.split(/\s+/);
      let total = 0;
      for (const part of parts) {
        if (part.includes("/")) {
          const [num, den] = part.split("/");
          total += parseInt(num, 10) / parseInt(den, 10);
        } else {
          total += parseFloat(part);
        }
      }
      qty = total;
    } else {
      qty = parseFloat(qtyStr);
    }
  } catch {
    qty = undefined;
  }

  return {
    raw,
    qty: isNaN(qty!) ? undefined : qty,
    unit: unit?.toLowerCase(),
    name: nameAndNote?.trim(),
    note: note?.trim(),
  };
}

function extractNutritionFromJsonLd(recipe: any): ExtractedRecipe["nutrition"] {
  const nutrition = recipe.nutrition;
  if (!nutrition) return undefined;

  const result: any = {};

  // Handle different nutrition formats
  if (nutrition.calories) {
    result.kcal = parseFloat(String(nutrition.calories).replace(/\D/g, ""));
  }
  if (nutrition.proteinContent) {
    result.proteinG = parseFloat(
      String(nutrition.proteinContent).replace(/[^\d.]/g, ""),
    );
  }
  if (nutrition.carbohydrateContent) {
    result.carbsG = parseFloat(
      String(nutrition.carbohydrateContent).replace(/[^\d.]/g, ""),
    );
  }
  if (nutrition.fatContent) {
    result.fatG = parseFloat(
      String(nutrition.fatContent).replace(/[^\d.]/g, ""),
    );
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

export async function extractFromHtml(
  html: string,
  url: string,
): Promise<ExtractedRecipe> {
  const $ = cheerio.load(html);
  const warnings: string[] = [];

  let recipe: any = null;

  // Try JSON-LD first
  $('script[type="application/ld+json"]').each((_, element) => {
    try {
      const jsonText = $(element).html();
      if (jsonText) {
        const json = JSON.parse(jsonText);
        const found = findRecipeObject(json);
        if (found && !recipe) {
          recipe = found;
        }
      }
    } catch (error) {
      warnings.push("Failed to parse JSON-LD script");
    }
  });

  // Fallback to microdata
  if (!recipe) {
    const recipeElement = $('[itemtype*="Recipe"]').first();
    if (recipeElement.length) {
      recipe = {
        name: recipeElement.find('[itemprop="name"]').first().text().trim(),
        recipeIngredient: recipeElement
          .find('[itemprop="recipeIngredient"]')
          .map((_, el) => $(el).text().trim())
          .get(),
        recipeInstructions: recipeElement
          .find('[itemprop="recipeInstructions"]')
          .map((_, el) => $(el).text().trim())
          .get(),
        recipeYield: recipeElement
          .find('[itemprop="recipeYield"]')
          .first()
          .text()
          .trim(),
        totalTime: recipeElement
          .find('[itemprop="totalTime"]')
          .first()
          .attr("datetime"),
        recipeCuisine: recipeElement
          .find('[itemprop="recipeCuisine"]')
          .first()
          .text()
          .trim(),
        image: recipeElement.find('[itemprop="image"]').first().attr("src"),
      };
      warnings.push("Used microdata fallback - data may be incomplete");
    }
  }

  if (!recipe) {
    warnings.push("No structured recipe data found on page");
    return {
      sourceUrl: url,
      ingredients: [],
      steps: [],
      warnings: [...warnings, "Could not extract recipe from this page"],
    };
  }

  // Extract and normalize data
  const title = recipe.name || recipe.headline || undefined;
  const image = recipe.image?.url || recipe.image || undefined;
  const cuisine = recipe.recipeCuisine || undefined;

  // Calculate total time
  let totalTimeMins: number | undefined;
  if (recipe.totalTime) {
    totalTimeMins = parseISO8601DurationToMinutes(recipe.totalTime);
  } else if (recipe.prepTime && recipe.cookTime) {
    const prep = parseISO8601DurationToMinutes(recipe.prepTime) || 0;
    const cook = parseISO8601DurationToMinutes(recipe.cookTime) || 0;
    totalTimeMins = prep + cook;
  }

  // Parse servings
  const servings = parseYieldToNumber(recipe.recipeYield || recipe.yield);

  // Parse ingredients
  const ingredientLines = recipe.recipeIngredient || [];
  const ingredients: ExtractedIngredient[] = ingredientLines.map(
    (line: string) => parseIngredientLine(line),
  );

  // Parse instructions
  const steps = splitInstructions(recipe.recipeInstructions);

  // Extract nutrition
  const nutrition = extractNutritionFromJsonLd(recipe);

  return {
    sourceUrl: url,
    title,
    image,
    cuisine,
    totalTimeMins,
    servings,
    ingredients,
    steps,
    nutrition,
    warnings,
  };
}
