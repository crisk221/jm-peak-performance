export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { getPlan } from '@/app/actions/plan';
import { computeShoppingList, formatAmount } from '@/lib/shopping-list';

type PageProps = { params: { planId: string } };

export default async function PrintPage({ params }: PageProps) {
  const { planId } = params;
  
  const plan = await getPlan(planId);
  
  if (!plan) {
    return <div>Plan not found</div>;
  }

  // Calculate day totals
  const dayTotals = plan.meals.reduce(
    (totals, meal) => ({
      kcal: totals.kcal + meal.kcal,
      protein: totals.protein + meal.protein,
      carbs: totals.carbs + meal.carbs,
      fat: totals.fat + meal.fat,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const shoppingList = await computeShoppingList(planId);

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
          
          {plan.meals.map((meal) => (
            <div key={meal.id} className="avoid-break" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                marginBottom: '0.5rem' 
              }}>
                {meal.slot}
              </h3>
              
              {meal.recipe ? (
                <div style={{ 
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
                  
                  <div style={{ 
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
                      {meal.recipe.instructions.split('\n').filter(step => step.trim()).map((step, index) => (
                        <li key={index} style={{ marginBottom: '0.25rem' }}>
                          {step.trim()}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              ) : (
                <div style={{ 
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
              <div key={item.ingredient} style={{ 
                padding: '0.5rem', 
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                fontSize: '0.875rem'
              }}>
                <div style={{ fontWeight: '600' }}>{formatAmount(item.totalGrams)}</div>
                <div>{item.ingredient}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
