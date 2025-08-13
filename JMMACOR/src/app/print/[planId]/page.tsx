export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { getPlan } from '@/app/actions/plan';
import { computeShoppingList, formatAmount } from '@/lib/shopping-list';
import { appSettings } from '@/lib/app-settings';

type PageProps = { params: Promise<{ planId: string }> };

export default async function PrintPage({ params }: PageProps) {
  const { planId } = await params;
  
  const plan = await getPlan(planId);
  
  if (!plan) {
    return <div>Plan not found</div>;
  }

  // Calculate day totals
  const dayTotals = plan.meals.reduce(
    (totals: { kcal: number; protein: number; carbs: number; fat: number }, meal: any) => ({
      kcal: totals.kcal + meal.kcal,
      protein: totals.protein + meal.protein,
      carbs: totals.carbs + meal.carbs,
      fat: totals.fat + meal.fat,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const shoppingList = await computeShoppingList(planId);

  // kJ conversion (1 kcal = 4.184 kJ)
  const kcalToKJ = (kcal: number) => Math.round(kcal * 4.184);

  const printStyles = `
    @media print {
      body { 
        margin: 0;
        font-size: 12pt;
        line-height: 1.4;
        color: #000;
      }
      .print-container { 
        max-width: none;
        margin: 0;
        padding: 0.75in;
      }
      .avoid-break { 
        page-break-inside: avoid;
        break-inside: avoid;
      }
      .new-page { 
        page-break-before: always;
        break-before: page;
      }
      .meal-card {
        page-break-inside: avoid;
        break-inside: avoid;
      }
      .recipe-info {
        page-break-inside: avoid;
        break-inside: avoid;
      }
      .shopping-item {
        page-break-inside: avoid;
        break-inside: avoid;
      }
      .grid { display: grid; }
      .grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
      .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
      .gap-4 { gap: 1rem; }
      .gap-2 { gap: 0.5rem; }
    }
    
    @media screen {
      .print-container {
        max-width: 8.5in;
        margin: 0 auto;
        padding: 1in;
        background: white;
        min-height: 11in;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
      }
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />
      <div className="print-container">
        {/* Header */}
        <div className="avoid-break" style={{ marginBottom: '2rem' }}>
          {/* Brand Header */}
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '1rem',
            borderBottom: '1px solid #e5e7eb',
            paddingBottom: '1rem'
          }}>
            {appSettings.logoUrl ? (
              <img 
                src={appSettings.logoUrl} 
                alt={appSettings.brandName}
                style={{ height: '40px', margin: '0 auto' }}
              />
            ) : (
              <h2 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                color: '#2563eb',
                margin: '0'
              }}>
                {appSettings.brandName}
              </h2>
            )}
          </div>
          
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            textAlign: 'center', 
            marginBottom: '1rem' 
          }}>
            Meal Plan for {plan.client.fullName}
          </h1>
          <p style={{ 
            textAlign: 'center', 
            color: '#666', 
            marginBottom: '1.5rem' 
          }}>
            Prepared for: {plan.client.fullName} | Date: {new Date().toLocaleDateString()}
            {plan.formula && ` | Formula: ${plan.formula}`}
          </p>
        </div>

        {/* Daily Nutrition Summary */}
        <div className="avoid-break" style={{ marginBottom: '2rem' }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600', 
            marginBottom: '1rem',
            paddingBottom: '0.5rem',
            borderBottom: '1px solid #000'
          }}>
            Daily Nutrition Summary
          </h2>
          
          <div className="grid grid-cols-4 gap-4" style={{ marginBottom: '1rem' }}>
            <div style={{ 
              textAlign: 'center', 
              padding: '1rem', 
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}>
              <div style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold', 
                color: '#2563eb' 
              }}>
                {Math.round(dayTotals.kcal)}
                {appSettings.defaultShowKJ && (
                  <div style={{ fontSize: '0.875rem', fontWeight: 'normal' }}>
                    ({kcalToKJ(dayTotals.kcal)} kJ)
                  </div>
                )}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#666' }}>Calories</div>
            </div>
            <div style={{ 
              textAlign: 'center', 
              padding: '1rem', 
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}>
              <div style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold', 
                color: '#2563eb' 
              }}>
                {Math.round(dayTotals.protein)}g
              </div>
              <div style={{ fontSize: '0.875rem', color: '#666' }}>Protein</div>
            </div>
            <div style={{ 
              textAlign: 'center', 
              padding: '1rem', 
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}>
              <div style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold', 
                color: '#2563eb' 
              }}>
                {Math.round(dayTotals.carbs)}g
              </div>
              <div style={{ fontSize: '0.875rem', color: '#666' }}>Carbs</div>
            </div>
            <div style={{ 
              textAlign: 'center', 
              padding: '1rem', 
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}>
              <div style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold', 
                color: '#2563eb' 
              }}>
                {Math.round(dayTotals.fat)}g
              </div>
              <div style={{ fontSize: '0.875rem', color: '#666' }}>Fat</div>
            </div>
          </div>
          
          <p style={{ fontSize: '0.875rem', color: '#666' }}>
            <strong>Targets:</strong> {Math.round(plan.kcalTarget)} cal, {Math.round(plan.proteinG)}g protein, {Math.round(plan.carbsG)}g carbs, {Math.round(plan.fatG)}g fat
          </p>
        </div>

        {/* Meals */}
        <div className="avoid-break" style={{ marginBottom: '2rem' }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600', 
            marginBottom: '1rem',
            paddingBottom: '0.5rem',
            borderBottom: '1px solid #000'
          }}>
            Meal Plan
          </h2>
          
          {plan.meals.map((meal: any) => (
            <div key={meal.id} className="meal-card avoid-break" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                marginBottom: '0.5rem' 
              }}>
                {meal.slot}
              </h3>
              
              {meal.recipe ? (
                <div className="recipe-info" style={{ 
                  background: '#f8f9fa', 
                  padding: '1rem', 
                  borderRadius: '4px',
                  borderLeft: '4px solid #2563eb'
                }}>
                  <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                    {meal.recipe.name} ({meal.servings} serving{meal.servings !== 1 ? 's' : ''})
                  </p>
                  <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    <strong>Nutrition per serving:</strong> {Math.round(meal.kcal / meal.servings)} cal, {Math.round(meal.protein / meal.servings)}g protein, {Math.round(meal.carbs / meal.servings)}g carbs, {Math.round(meal.fat / meal.servings)}g fat
                  </p>
                  {meal.recipe.cuisine && (
                    <p style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                      <strong>Cuisine:</strong> {meal.recipe.cuisine}
                    </p>
                  )}
                  {meal.recipe.difficulty && (
                    <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                      <strong>Difficulty:</strong> {meal.recipe.difficulty}
                    </p>
                  )}
                  
                <h4 style={{ 
                  fontWeight: '600', 
                  marginTop: '1rem', 
                  marginBottom: '0.5rem' 
                }}>
                  Ingredients ({meal.servings} serving{meal.servings !== 1 ? 's' : ''})
                </h4>
                <ul style={{ 
                  fontSize: '0.875rem',
                  paddingLeft: '1.5rem',
                  margin: '0'
                }}>
                  {(meal.recipe.ingredients || []).map((ri: any) => (
                    <li key={ri.id}>
                      {formatAmount(ri.gramsPerBase * meal.servings)} {ri.ingredient.name}
                    </li>
                  ))}
                </ul>                  <div style={{ 
                    marginTop: '1rem', 
                    padding: '0.75rem', 
                    background: 'white',
                    borderRadius: '4px'
                  }}>
                    <h4 style={{ 
                      fontWeight: '600', 
                      marginTop: '0', 
                      marginBottom: '0.5rem' 
                    }}>
                      Instructions
                    </h4>
                    <ol style={{ 
                      fontSize: '0.875rem',
                      paddingLeft: '1.5rem',
                      margin: '0'
                    }}>
                      {meal.recipe.instructions.split('\n').filter((step: string) => step.trim()).map((step: string, index: number) => (
                        <li key={index} style={{ marginBottom: '0.25rem' }}>
                          {step.trim()}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              ) : (
                <div className="recipe-info" style={{ 
                  background: '#f8f9fa', 
                  padding: '1rem', 
                  borderRadius: '4px',
                  borderLeft: '4px solid #ccc'
                }}>
                  <p style={{ color: '#666', fontStyle: 'italic' }}>No recipe assigned</p>
                  <p style={{ fontSize: '0.875rem' }}>
                    {Math.round(meal.kcal)} cal, {Math.round(meal.protein)}g protein, {Math.round(meal.carbs)}g carbs, {Math.round(meal.fat)}g fat
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Shopping List */}
        <div className="new-page">
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600', 
            marginBottom: '1rem',
            paddingBottom: '0.5rem',
            borderBottom: '1px solid #000'
          }}>
            Shopping List
          </h2>
          
          <div className="grid grid-cols-3 gap-2">
            {shoppingList.map((item) => (
              <div key={item.ingredient} className="shopping-item" style={{ 
                padding: '0.5rem', 
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                fontSize: '0.875rem'
              }}>
                <div style={{ fontWeight: '600' }}>{item.displayAmount}</div>
                <div>{item.ingredient}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ 
          marginTop: '2rem',
          paddingTop: '1rem',
          borderTop: '1px solid #e5e7eb',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: '#666'
        }}>
          {appSettings.footerNote}
        </div>
      </div>
    </>
  );
}
