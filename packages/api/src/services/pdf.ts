import { prisma } from "@jmpp/db";

export async function renderRecipePdf(
  recipeId: string,
  coachId: string,
): Promise<Buffer> {
  // Dynamic import of playwright to avoid bundling issues
  const { chromium } = await import("playwright");

  // Load recipe with all related data
  const recipe = await prisma.recipe.findFirst({
    where: {
      id: recipeId,
      authorId: coachId, // Ensure coach can only export their own recipes
    },
    include: {
      ingredients: {
        include: {
          ingredient: true,
        },
        orderBy: { createdAt: "asc" },
      },
      utensils: {
        include: {
          utensil: true,
        },
        orderBy: { utensil: { name: "asc" } },
      },
      tags: {
        include: {
          tag: true,
        },
        orderBy: { tag: { name: "asc" } },
      },
      author: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!recipe) {
    throw new Error("Recipe not found or access denied");
  }

  // Generate HTML content with inline CSS
  const html = generateRecipeHTML(recipe);

  // Launch browser and generate PDF
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: "networkidle" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    margin: {
      top: "16mm",
      right: "12mm",
      bottom: "16mm",
      left: "12mm",
    },
    printBackground: true,
  });

  await browser.close();

  return pdfBuffer;
}

function generateRecipeHTML(recipe: any): string {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return "#16a34a"; // green-600
      case "MEDIUM":
        return "#d97706"; // amber-600
      case "HARD":
        return "#dc2626"; // red-600
      default:
        return "#6b7280"; // gray-500
    }
  };

  const getMealTypeIcon = (mealType: string) => {
    switch (mealType) {
      case "BREAKFAST":
        return "🌅";
      case "LUNCH":
        return "🌞";
      case "DINNER":
        return "🌙";
      case "SNACK":
        return "🍎";
      default:
        return "🍽️";
    }
  };

  const getUnitLabel = (unit: string) => {
    switch (unit) {
      case "GRAMS":
        return "g";
      case "KILOGRAMS":
        return "kg";
      case "MILLILITERS":
        return "ml";
      case "LITERS":
        return "l";
      case "CUPS":
        return "cup";
      case "TABLESPOONS":
        return "tbsp";
      case "TEASPOONS":
        return "tsp";
      case "PIECES":
        return "pc";
      default:
        return unit.toLowerCase();
    }
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${recipe.title} - Recipe</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      background: white;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 0 20px;
    }
    
    .header {
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    
    .app-name {
      font-size: 18px;
      font-weight: 600;
      color: #2563eb;
      margin-bottom: 10px;
    }
    
    .recipe-title {
      font-size: 32px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .meta-row {
      display: flex;
      gap: 24px;
      font-size: 14px;
      color: #6b7280;
      flex-wrap: wrap;
    }
    
    .meta-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .meta-label {
      font-weight: 600;
    }
    
    .difficulty-badge {
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      color: white;
    }
    
    .description {
      font-size: 16px;
      color: #4b5563;
      margin: 20px 0;
      font-style: italic;
    }
    
    .section {
      margin: 32px 0;
      page-break-inside: avoid;
    }
    
    .section-title {
      font-size: 20px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 16px;
      border-bottom: 1px solid #d1d5db;
      padding-bottom: 8px;
    }
    
    .ingredients-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    
    .ingredients-table th {
      background-color: #f9fafb;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #e5e7eb;
    }
    
    .ingredients-table td {
      padding: 10px 12px;
      border-bottom: 1px solid #f3f4f6;
    }
    
    .ingredients-table tr:nth-child(even) {
      background-color: #f9fafb;
    }
    
    .quantity-cell {
      text-align: right;
      font-weight: 600;
      color: #374151;
    }
    
    .note-text {
      font-size: 12px;
      color: #6b7280;
      font-style: italic;
    }
    
    .instructions {
      counter-reset: step-counter;
    }
    
    .instruction-step {
      counter-increment: step-counter;
      margin-bottom: 16px;
      padding: 16px;
      background-color: #f9fafb;
      border-left: 4px solid #2563eb;
      border-radius: 4px;
      position: relative;
    }
    
    .instruction-step::before {
      content: counter(step-counter);
      position: absolute;
      left: -12px;
      top: 16px;
      background-color: #2563eb;
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
    }
    
    .instruction-text {
      margin-left: 20px;
      white-space: pre-wrap;
    }
    
    .tags-utensils {
      display: flex;
      gap: 32px;
      flex-wrap: wrap;
    }
    
    .tags-utensils-item {
      flex: 1;
      min-width: 200px;
    }
    
    .tag-list, .utensil-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .tag, .utensil {
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
    }
    
    .tag {
      background-color: #f3f4f6;
      color: #374151;
    }
    
    .utensil {
      background-color: #dbeafe;
      color: #1d4ed8;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
    }
    
    @media print {
      .section {
        page-break-inside: avoid;
      }
      
      .ingredients-table {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="app-name">JM Peak Performance</div>
      <h1 class="recipe-title">
        <span>${getMealTypeIcon(recipe.mealType)}</span>
        ${recipe.title}
      </h1>
      <div class="meta-row">
        <div class="meta-item">
          <span class="meta-label">Servings:</span>
          <span>${recipe.servings}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Time:</span>
          <span>${recipe.timeMinutes} minutes</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Meal Type:</span>
          <span>${recipe.mealType.toLowerCase()}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Difficulty:</span>
          <span class="difficulty-badge" style="background-color: ${getDifficultyColor(recipe.difficulty)}">
            ${recipe.difficulty.toLowerCase()}
          </span>
        </div>
      </div>
      ${recipe.description ? `<div class="description">${recipe.description}</div>` : ""}
    </div>

    <!-- Ingredients Section -->
    <div class="section">
      <h2 class="section-title">Ingredients</h2>
      ${
        recipe.ingredients && recipe.ingredients.length > 0
          ? `
        <table class="ingredients-table">
          <thead>
            <tr>
              <th>Ingredient</th>
              <th>Quantity</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            ${recipe.ingredients
              .map(
                (ri: any) => `
              <tr>
                <td>${ri.ingredient.name}</td>
                <td class="quantity-cell">${ri.quantity} ${getUnitLabel(ri.unit)}</td>
                <td>${ri.note ? `<span class="note-text">${ri.note}</span>` : "-"}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      `
          : "<p>No ingredients specified</p>"
      }
    </div>

    <!-- Instructions Section -->
    <div class="section">
      <h2 class="section-title">Instructions</h2>
      <div class="instructions">
        ${recipe.instructions
          .split("\n\n")
          .map(
            (step: string, index: number) => `
          <div class="instruction-step">
            <div class="instruction-text">${step.trim()}</div>
          </div>
        `,
          )
          .join("")}
      </div>
    </div>

    <!-- Utensils and Tags Section -->
    <div class="section">
      <div class="tags-utensils">
        <div class="tags-utensils-item">
          <h3 class="section-title">Required Utensils</h3>
          ${
            recipe.utensils && recipe.utensils.length > 0
              ? `
            <div class="utensil-list">
              ${recipe.utensils
                .map(
                  (ru: any) => `
                <span class="utensil">${ru.utensil.name}</span>
              `,
                )
                .join("")}
            </div>
          `
              : "<p>No specific utensils required</p>"
          }
        </div>
        
        <div class="tags-utensils-item">
          <h3 class="section-title">Tags</h3>
          ${
            recipe.tags && recipe.tags.length > 0
              ? `
            <div class="tag-list">
              ${recipe.tags
                .map(
                  (rt: any) => `
                <span class="tag">${rt.tag.name}</span>
              `,
                )
                .join("")}
            </div>
          `
              : "<p>No tags assigned</p>"
          }
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>Recipe by ${recipe.author.name || "JM Peak Performance"}</p>
      <p>Generated on ${new Date().toLocaleDateString()}</p>
    </div>
  </div>
</body>
</html>`;
}
