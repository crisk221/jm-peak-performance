import { prisma } from "@jmpp/db";

export async function renderMealPlanPdf(
  planId: string,
  coachId: string,
): Promise<Buffer> {
  // Dynamic import of playwright to avoid bundling issues
  const { chromium } = await import("playwright");

  // Load meal plan with all related data
  const mealPlan = await prisma.mealPlan.findFirst({
    where: {
      id: planId,
      coachId, // Ensure coach can only export their own meal plans
    },
    include: {
      client: true,
      items: {
        include: {
          recipe: {
            include: {
              ingredients: {
                include: {
                  ingredient: true,
                },
                orderBy: { createdAt: "asc" },
              },
            },
          },
        },
        orderBy: [
          { dayNumber: "asc" },
          { mealNumber: "asc" },
        ],
      },
    },
  });

  if (!mealPlan) {
    throw new Error("Meal plan not found");
  }

  // Group items by day
  const dayGroups: { [key: number]: typeof mealPlan.items } = {};
  mealPlan.items.forEach((item: any) => {
    if (!dayGroups[item.dayNumber]) {
      dayGroups[item.dayNumber] = [];
    }
    dayGroups[item.dayNumber].push(item);
  });

  // Calculate daily totals
  const dailyTotals = Object.entries(dayGroups).map(([dayNumber, items]) => {
    const totals = items.reduce((acc: any, item: any) => ({
      kcal: acc.kcal + item.recipe.kcalPerServing * item.servings,
      protein: acc.protein + item.recipe.proteinPerServing * item.servings,
      carbs: acc.carbs + item.recipe.carbsPerServing * item.servings,
      fat: acc.fat + item.recipe.fatPerServing * item.servings,
    }), { kcal: 0, protein: 0, carbs: 0, fat: 0 });

    return {
      day: parseInt(dayNumber),
      ...totals,
    };
  });

  // Generate shopping list (simplified)
  const shoppingList: { [key: string]: { quantity: number; unit: string } } = {};
  mealPlan.items.forEach((item: any) => {
    item.recipe.ingredients.forEach((recipeIngredient: any) => {
      const key = recipeIngredient.ingredient.name;
      const quantity = recipeIngredient.quantity * item.servings;
      
      if (shoppingList[key]) {
        shoppingList[key].quantity += quantity;
      } else {
        shoppingList[key] = {
          quantity,
          unit: recipeIngredient.unit || 'units',
        };
      }
    });
  });

  // Format dates
  const startDate = new Date(mealPlan.startDate);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + mealPlan.days - 1);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatShortDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Build HTML content
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Meal Plan - ${mealPlan.client.name}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          line-height: 1.6;
          color: #333;
          font-size: 12px;
        }
        
        .container {
          max-width: 100%;
          margin: 0 auto;
          padding: 20px;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #2563eb;
          padding-bottom: 20px;
        }
        
        .brand {
          color: #2563eb;
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        
        .title {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .subtitle {
          font-size: 14px;
          color: #666;
        }
        
        .section {
          margin-bottom: 25px;
          page-break-inside: avoid;
        }
        
        .section-title {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 15px;
          color: #1f2937;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 5px;
        }
        
        .overview-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .info-card {
          background: #f9fafb;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }
        
        .info-label {
          font-weight: bold;
          color: #374151;
          margin-bottom: 5px;
        }
        
        .info-value {
          font-size: 14px;
          color: #6b7280;
        }
        
        .targets-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        
        .targets-table th,
        .targets-table td {
          padding: 8px 12px;
          text-align: center;
          border: 1px solid #d1d5db;
        }
        
        .targets-table th {
          background-color: #f3f4f6;
          font-weight: bold;
          color: #374151;
        }
        
        .targets-table .day-cell {
          font-weight: bold;
          background-color: #fef3c7;
        }
        
        .delta-positive {
          color: #059669;
        }
        
        .delta-negative {
          color: #dc2626;
        }
        
        .day-section {
          margin-bottom: 25px;
          page-break-inside: avoid;
        }
        
        .day-header {
          background: #2563eb;
          color: white;
          padding: 10px;
          font-weight: bold;
          font-size: 14px;
          border-radius: 6px 6px 0 0;
        }
        
        .day-content {
          border: 1px solid #d1d5db;
          border-top: none;
          border-radius: 0 0 6px 6px;
        }
        
        .meal-item {
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 15px;
          align-items: center;
        }
        
        .meal-item:last-child {
          border-bottom: none;
        }
        
        .meal-number {
          background: #3b82f6;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: bold;
          min-width: 60px;
          text-align: center;
        }
        
        .meal-info {
          flex: 1;
        }
        
        .meal-title {
          font-weight: bold;
          margin-bottom: 3px;
        }
        
        .meal-details {
          font-size: 10px;
          color: #6b7280;
        }
        
        .meal-macros {
          font-size: 10px;
          text-align: right;
          color: #374151;
        }
        
        .shopping-section {
          margin-top: 30px;
          page-break-before: always;
        }
        
        .shopping-list {
          columns: 2;
          column-gap: 30px;
        }
        
        .shopping-item {
          padding: 5px 0;
          border-bottom: 1px solid #f3f4f6;
          break-inside: avoid;
        }
        
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 10px;
          color: #6b7280;
          border-top: 1px solid #e5e7eb;
          padding-top: 20px;
        }
        
        @media print {
          body { font-size: 11px; }
          .container { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <div class="brand">JM Peak Performance</div>
          <div class="title">Meal Plan for ${mealPlan.client.name}</div>
          <div class="subtitle">
            ${formatShortDate(startDate)} - ${formatShortDate(endDate)} (${mealPlan.days} days)
          </div>
        </div>
        
        <!-- Overview -->
        <div class="section">
          <div class="section-title">Plan Overview</div>
          <div class="overview-grid">
            <div class="info-card">
              <div class="info-label">Client</div>
              <div class="info-value">${mealPlan.client.name}</div>
            </div>
            <div class="info-card">
              <div class="info-label">Duration</div>
              <div class="info-value">${mealPlan.days} days</div>
            </div>
            <div class="info-card">
              <div class="info-label">Average Daily Calories</div>
              <div class="info-value">${mealPlan.kcal} kcal</div>
            </div>
            <div class="info-card">
              <div class="info-label">Generated</div>
              <div class="info-value">${formatShortDate(mealPlan.createdAt)}</div>
            </div>
          </div>
        </div>
        
        <!-- Targets vs Actuals -->
        <div class="section">
          <div class="section-title">Daily Targets vs Actuals</div>
          <table class="targets-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Calories</th>
                <th>Target</th>
                <th>Δ</th>
                <th>Protein (g)</th>
                <th>Target</th>
                <th>Δ</th>
                <th>Carbs (g)</th>
                <th>Target</th>
                <th>Δ</th>
                <th>Fat (g)</th>
                <th>Target</th>
                <th>Δ</th>
              </tr>
            </thead>
            <tbody>
              ${dailyTotals.map(day => {
                const kcalDelta = Math.round(day.kcal - mealPlan.client.kcalTarget);
                const proteinDelta = Math.round(day.protein - mealPlan.client.proteinTarget);
                const carbsDelta = Math.round(day.carbs - mealPlan.client.carbsTarget);
                const fatDelta = Math.round(day.fat - mealPlan.client.fatTarget);
                
                return `
                  <tr>
                    <td class="day-cell">${day.day}</td>
                    <td>${Math.round(day.kcal)}</td>
                    <td>${mealPlan.client.kcalTarget}</td>
                    <td class="${kcalDelta >= 0 ? 'delta-positive' : 'delta-negative'}">
                      ${kcalDelta >= 0 ? '+' : ''}${kcalDelta}
                    </td>
                    <td>${Math.round(day.protein)}</td>
                    <td>${mealPlan.client.proteinTarget}</td>
                    <td class="${proteinDelta >= 0 ? 'delta-positive' : 'delta-negative'}">
                      ${proteinDelta >= 0 ? '+' : ''}${proteinDelta}
                    </td>
                    <td>${Math.round(day.carbs)}</td>
                    <td>${mealPlan.client.carbsTarget}</td>
                    <td class="${carbsDelta >= 0 ? 'delta-positive' : 'delta-negative'}">
                      ${carbsDelta >= 0 ? '+' : ''}${carbsDelta}
                    </td>
                    <td>${Math.round(day.fat)}</td>
                    <td>${mealPlan.client.fatTarget}</td>
                    <td class="${fatDelta >= 0 ? 'delta-positive' : 'delta-negative'}">
                      ${fatDelta >= 0 ? '+' : ''}${fatDelta}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
        
        <!-- Daily Meal Plans -->
        <div class="section">
          <div class="section-title">Daily Meal Plans</div>
          ${Object.entries(dayGroups)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([dayNumber, items]) => {
              const dayDate = new Date(startDate);
              dayDate.setDate(startDate.getDate() + parseInt(dayNumber) - 1);
              
              return `
                <div class="day-section">
                  <div class="day-header">
                    Day ${dayNumber} - ${formatDate(dayDate)}
                  </div>
                  <div class="day-content">
                    ${items
                      .sort((a: any, b: any) => a.mealNumber - b.mealNumber)
                      .map((item: any) => `
                        <div class="meal-item">
                          <div class="meal-number">Meal ${item.mealNumber}</div>
                          <div class="meal-info">
                            <div class="meal-title">${item.recipe.title}</div>
                            <div class="meal-details">${item.servings} serving${item.servings !== 1 ? 's' : ''}</div>
                          </div>
                          <div class="meal-macros">
                            ${Math.round(item.recipe.kcalPerServing * item.servings)} kcal<br>
                            ${Math.round(item.recipe.proteinPerServing * item.servings)}g protein<br>
                            ${Math.round(item.recipe.carbsPerServing * item.servings)}g carbs<br>
                            ${Math.round(item.recipe.fatPerServing * item.servings)}g fat
                          </div>
                        </div>
                      `).join('')}
                  </div>
                </div>
              `;
            }).join('')}
        </div>
        
        <!-- Shopping List -->
        ${Object.keys(shoppingList).length > 0 ? `
          <div class="shopping-section">
            <div class="section-title">Shopping List</div>
            <div class="shopping-list">
              ${Object.entries(shoppingList)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([name, data]) => `
                  <div class="shopping-item">
                    <strong>${name}</strong><br>
                    ${data.quantity.toFixed(1)} ${data.unit}
                  </div>
                `).join('')}
            </div>
          </div>
        ` : ''}
        
        <!-- Footer -->
        <div class="footer">
          Generated by JM Peak Performance on ${new Date().toLocaleDateString('en-US')}
        </div>
      </div>
    </body>
    </html>
  `;

  // Launch browser and generate PDF
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.setContent(html, { waitUntil: 'networkidle' });
  
  const pdfBuffer = await page.pdf({
    format: 'A4',
    margin: {
      top: '16mm',
      bottom: '16mm',
      left: '12mm',
      right: '12mm',
    },
    printBackground: true,
  });
  
  await browser.close();
  
  return pdfBuffer;
}
