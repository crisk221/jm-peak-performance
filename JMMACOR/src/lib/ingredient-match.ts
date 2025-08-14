import { prisma } from "./prisma";

export type MatchSuggestion = {
  ingredientId: string;
  name: string;
  score: number;
};

export async function suggestMatches(
  query: string,
): Promise<MatchSuggestion[]> {
  if (!query || query.length < 2) return [];

  // Tokenize the query to search for individual words
  const tokens = query
    .toLowerCase()
    .replace(/[^\w\s]/g, " ") // Remove punctuation
    .split(/\s+/)
    .filter((token) => token.length > 1);

  if (tokens.length === 0) return [];

  try {
    // Search for ingredients that contain any of the tokens
    const ingredients = await prisma.ingredient.findMany({
      where: {
        OR: tokens.map((token) => ({
          name: {
            contains: token,
          },
        })),
      },
      take: 20, // Get more results to score them
    });

    // Score matches based on how many tokens match and position
    const scored = ingredients.map((ingredient) => {
      const nameLower = ingredient.name.toLowerCase();
      let score = 0;

      // Exact match gets highest score
      if (nameLower === query.toLowerCase()) {
        score = 100;
      } else if (nameLower.includes(query.toLowerCase())) {
        score = 80;
      } else {
        // Score based on matching tokens
        let matchingTokens = 0;
        for (const token of tokens) {
          if (nameLower.includes(token)) {
            matchingTokens++;
            // Bonus if token appears at start of word
            if (
              nameLower.startsWith(token) ||
              nameLower.includes(" " + token)
            ) {
              score += 10;
            } else {
              score += 5;
            }
          }
        }

        // Bonus for matching more tokens
        score += (matchingTokens / tokens.length) * 20;
      }

      return {
        ingredientId: ingredient.id,
        name: ingredient.name,
        score,
      };
    });

    // Sort by score and return top 5
    return scored
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  } catch (error) {
    console.error("Error searching ingredients:", error);
    return [];
  }
}

export function estimateGrams(
  qty?: number,
  unit?: string,
  name?: string,
): { grams?: number; approx?: boolean } {
  if (!qty || qty <= 0) return {};
  if (!unit) return {};

  const unitLower = unit.toLowerCase();

  // Direct gram measurements
  if (unitLower === "g" || unitLower === "gram" || unitLower === "grams") {
    return { grams: qty };
  }

  // Milliliters (assume water-like density)
  if (
    unitLower === "ml" ||
    unitLower === "milliliter" ||
    unitLower === "milliliters"
  ) {
    return { grams: qty, approx: true };
  }

  // Tablespoons
  if (
    unitLower === "tbsp" ||
    unitLower === "tablespoon" ||
    unitLower === "tablespoons"
  ) {
    // Default to 15g, but adjust for specific ingredients
    let gramsPerTbsp = 15;

    if (name) {
      const nameLower = name.toLowerCase();
      if (nameLower.includes("oil") || nameLower.includes("butter")) {
        gramsPerTbsp = 14; // Fats are slightly lighter
      } else if (nameLower.includes("flour")) {
        gramsPerTbsp = 8; // Flour is lighter
      } else if (nameLower.includes("sugar") || nameLower.includes("honey")) {
        gramsPerTbsp = 20; // Sugar/honey is heavier
      }
    }

    return { grams: qty * gramsPerTbsp, approx: true };
  }

  // Teaspoons
  if (
    unitLower === "tsp" ||
    unitLower === "teaspoon" ||
    unitLower === "teaspoons"
  ) {
    let gramsPerTsp = 5;

    if (name) {
      const nameLower = name.toLowerCase();
      if (nameLower.includes("oil")) {
        gramsPerTsp = 4.5;
      } else if (nameLower.includes("salt")) {
        gramsPerTsp = 6;
      } else if (nameLower.includes("sugar")) {
        gramsPerTsp = 7;
      }
    }

    return { grams: qty * gramsPerTsp, approx: true };
  }

  // Cups (very approximate - depends heavily on ingredient)
  if (unitLower === "cup" || unitLower === "cups") {
    let gramsPerCup = 240; // Default to water/milk

    if (name) {
      const nameLower = name.toLowerCase();
      if (nameLower.includes("flour")) {
        gramsPerCup = 125;
      } else if (nameLower.includes("sugar")) {
        gramsPerCup = 200;
      } else if (nameLower.includes("rice")) {
        gramsPerCup = 185;
      } else if (nameLower.includes("oats")) {
        gramsPerCup = 80;
      } else if (nameLower.includes("nuts") || nameLower.includes("almond")) {
        gramsPerCup = 140;
      }
    }

    return { grams: qty * gramsPerCup, approx: true };
  }

  // Ounces (fluid)
  if (
    unitLower === "fl oz" ||
    unitLower === "fluid ounce" ||
    unitLower === "fluid ounces"
  ) {
    return { grams: qty * 30, approx: true }; // 1 fl oz ≈ 30ml ≈ 30g for water
  }

  // Weight ounces
  if (unitLower === "oz" || unitLower === "ounce" || unitLower === "ounces") {
    return { grams: qty * 28.35, approx: true }; // 1 oz = 28.35g
  }

  // Pounds
  if (
    unitLower === "lb" ||
    unitLower === "lbs" ||
    unitLower === "pound" ||
    unitLower === "pounds"
  ) {
    return { grams: qty * 453.592, approx: true }; // 1 lb = 453.592g
  }

  // Items/pieces (very rough estimates)
  if (
    unitLower === "piece" ||
    unitLower === "pieces" ||
    unitLower === "item" ||
    unitLower === "items"
  ) {
    if (name) {
      const nameLower = name.toLowerCase();
      if (nameLower.includes("egg")) {
        return { grams: qty * 50, approx: true }; // Medium egg ≈ 50g
      } else if (nameLower.includes("banana")) {
        return { grams: qty * 120, approx: true }; // Medium banana ≈ 120g
      } else if (nameLower.includes("apple")) {
        return { grams: qty * 180, approx: true }; // Medium apple ≈ 180g
      }
    }
  }

  // If we can't estimate, return empty
  return {};
}
