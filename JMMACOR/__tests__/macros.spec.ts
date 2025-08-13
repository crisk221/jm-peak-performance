import { test, expect } from '@playwright/test';
import {
  bmrMifflinStJeor,
  bmrHarrisBenedict,
  bmrKatchMcArdle,
  activityFactor,
  goalDeltaKcal,
  tdee,
  targetCalories,
  calcMacrosFromPercents,
  scaleCustomGramsToEnergy,
  kcalToKJ,
  round,
  feetInchesToCm,
} from '../src/lib/macros';

test.describe('BMR Calculations', () => {
  test('Mifflin-St Jeor BMR for male', () => {
    const result = bmrMifflinStJeor({
      sex: 'male',
      age: 25,
      heightCm: 183,
      weightKg: 100,
    });
    // Expected: 10*100 + 6.25*183 + 5 - 5*25 = 1000 + 1143.75 + 5 - 125 = 2023.75
    expect(Math.abs(result - 2023.75)).toBeLessThan(1);
  });

  test('Mifflin-St Jeor BMR for female', () => {
    const result = bmrMifflinStJeor({
      sex: 'female',
      age: 25,
      heightCm: 170,
      weightKg: 65,
    });
    // Expected: 10*65 + 6.25*170 - 161 - 5*25 = 650 + 1062.5 - 161 - 125 = 1426.5
    expect(Math.abs(result - 1426.5)).toBeLessThan(1);
  });

  test('Harris-Benedict BMR for male', () => {
    const result = bmrHarrisBenedict({
      sex: 'male',
      age: 25,
      heightCm: 183,
      weightKg: 100,
    });
    // Expected: 88.362 + (13.397 * 100) + (4.799 * 183) - (5.677 * 25)
    const expected = 88.362 + (13.397 * 100) + (4.799 * 183) - (5.677 * 25);
    expect(Math.abs(result - expected)).toBeLessThan(1);
  });

  test('Harris-Benedict BMR for female', () => {
    const result = bmrHarrisBenedict({
      sex: 'female',
      age: 25,
      heightCm: 170,
      weightKg: 65,
    });
    // Expected: 447.593 + (9.247 * 65) + (3.098 * 170) - (4.330 * 25)
    const expected = 447.593 + (9.247 * 65) + (3.098 * 170) - (4.330 * 25);
    expect(Math.abs(result - expected)).toBeLessThan(1);
  });

  test('Katch-McArdle BMR', () => {
    const result = bmrKatchMcArdle({
      bodyFatPct: 15,
      weightKg: 80,
    });
    // Expected: 370 + (21.6 * (80 * (1 - 0.15))) = 370 + (21.6 * 68) = 370 + 1468.8 = 1838.8
    expect(Math.abs(result - 1838.8)).toBeLessThan(1);
  });
});

test.describe('Activity Factors', () => {
  test('BMR activity factor', () => {
    expect(activityFactor('Basal Metabolic Rate (BMR)')).toBe(1.0);
  });

  test('Sedentary activity factor', () => {
    expect(activityFactor('Sedentary: little or no exercise')).toBe(1.2);
  });

  test('Light activity factor', () => {
    expect(activityFactor('Light: exercise 1-3 times/week')).toBe(1.375);
  });

  test('Moderate activity factor', () => {
    expect(activityFactor('Moderate: exercise 4-5 times/week')).toBe(1.55);
  });

  test('Active activity factor', () => {
    expect(activityFactor('Active: daily exercise or intense exercise 3-4 times/week')).toBe(1.725);
  });

  test('Very Active activity factor', () => {
    expect(activityFactor('Very Active: intense exercise 6-7 times/week')).toBe(1.9);
  });

  test('Extra Active activity factor', () => {
    expect(activityFactor('Extra Active: very intense exercise daily, or physical job')).toBe(1.95);
  });

  test('Unknown activity defaults to sedentary', () => {
    expect(activityFactor('Unknown Activity')).toBe(1.2);
  });
});

test.describe('Goal Delta Calculations', () => {
  test('Maintain weight', () => {
    expect(goalDeltaKcal('Maintain Weight')).toBe(0);
  });

  test('Mild weight loss', () => {
    expect(goalDeltaKcal('Mild weight loss of 0.25 kg per week')).toBe(-250);
  });

  test('Weight loss', () => {
    expect(goalDeltaKcal('Weight loss of 0.5 kg per week')).toBe(-500);
  });

  test('Extreme weight loss', () => {
    expect(goalDeltaKcal('Extreme weight loss of 1 kg per week')).toBe(-1000);
  });

  test('Mild weight gain', () => {
    expect(goalDeltaKcal('Mild weight gain of 0.25 kg per week')).toBe(250);
  });

  test('Weight gain', () => {
    expect(goalDeltaKcal('Weight gain of 0.5 kg per week')).toBe(500);
  });

  test('Extreme weight gain', () => {
    expect(goalDeltaKcal('Extreme weight gain of 1 kg per week')).toBe(1000);
  });

  test('Unknown goal defaults to maintain', () => {
    expect(goalDeltaKcal('Unknown Goal')).toBe(0);
  });
});

test.describe('TDEE and Target Calories', () => {
  test('TDEE calculation', () => {
    const bmr = 2000;
    const activity = 'Active: daily exercise or intense exercise 3-4 times/week';
    const result = tdee(bmr, activity);
    expect(result).toBe(2000 * 1.725); // 3450
  });

  test('Target calories with weight loss', () => {
    const tdeeValue = 3000;
    const goal = 'Weight loss of 0.5 kg per week';
    const result = targetCalories(tdeeValue, goal);
    expect(result).toBe(2500); // 3000 - 500
  });

  test('Target calories with extreme loss capped', () => {
    const tdeeValue = 1500; // Low TDEE
    const goal = 'Extreme weight loss of 1 kg per week';
    const result = targetCalories(tdeeValue, goal);
    expect(result).toBe(500); // Clamped to TDEE - 1000
  });

  test('Target calories with extreme gain capped', () => {
    const tdeeValue = 2000;
    const goal = 'Extreme weight gain of 1 kg per week';
    const result = targetCalories(tdeeValue, goal);
    expect(result).toBe(3000); // Clamped to TDEE + 1000
  });
});

test.describe('Macro Calculations', () => {
  test('Balanced macro split', () => {
    const result = calcMacrosFromPercents({
      kcal: 2000,
      pctCarb: 50,
      pctProt: 25,
      pctFat: 25,
    });
    
    expect(result.carbs).toBe(250); // (2000 * 0.5) / 4
    expect(result.protein).toBe(125); // (2000 * 0.25) / 4
    expect(result.fat).toBe(56); // (2000 * 0.25) / 9, rounded
  });

  test('Low carb macro split', () => {
    const result = calcMacrosFromPercents({
      kcal: 2000,
      pctCarb: 25,
      pctProt: 40,
      pctFat: 35,
    });
    
    expect(result.carbs).toBe(125); // (2000 * 0.25) / 4
    expect(result.protein).toBe(200); // (2000 * 0.4) / 4
    expect(result.fat).toBe(78); // (2000 * 0.35) / 9, rounded
  });

  test('Macro energy sums back to target within tolerance', () => {
    const kcal = 2500;
    const result = calcMacrosFromPercents({
      kcal,
      pctCarb: 50,
      pctProt: 25,
      pctFat: 25,
    });
    
    const calculatedKcal = result.protein * 4 + result.carbs * 4 + result.fat * 9;
    const tolerance = kcal * 0.02; // 2% tolerance
    expect(Math.abs(calculatedKcal - kcal)).toBeLessThanOrEqual(tolerance);
  });
});

test.describe('Custom Macro Scaling', () => {
  test('Scale custom grams to target energy', () => {
    const result = scaleCustomGramsToEnergy({
      kcalTarget: 2000,
      grams: { p: 100, c: 200, f: 50 }, // Current: 100*4 + 200*4 + 50*9 = 1650 kcal
    });
    
    // Scale factor: 2000 / 1650 ≈ 1.21
    const scaleFactor = 2000 / 1650;
    expect(Math.abs(result.p - (100 * scaleFactor))).toBeLessThan(1);
    expect(Math.abs(result.c - (200 * scaleFactor))).toBeLessThan(1);
    expect(Math.abs(result.f - (50 * scaleFactor))).toBeLessThan(1);
  });

  test('Handle zero grams with balanced fallback', () => {
    const result = scaleCustomGramsToEnergy({
      kcalTarget: 2000,
      grams: { p: 0, c: 0, f: 0 },
    });
    
    // Should fall back to balanced 50/25/25
    expect(result.c).toBe(250); // (2000 * 0.5) / 4
    expect(result.p).toBe(125); // (2000 * 0.25) / 4
    expect(result.f).toBe(56); // (2000 * 0.25) / 9, rounded
  });
});

test.describe('Helper Functions', () => {
  test('Convert kcal to kJ', () => {
    expect(Math.abs(kcalToKJ(100) - 418.4)).toBeLessThan(1);
    expect(Math.abs(kcalToKJ(2000) - 8368)).toBeLessThan(1);
  });

  test('Round to specified decimal places', () => {
    expect(round(3.14159)).toBe(3);
    expect(round(3.14159, 2)).toBe(3.14);
    expect(round(3.14159, 4)).toBe(3.1416);
  });

  test('Convert feet and inches to cm', () => {
    expect(feetInchesToCm(6, 0)).toBe(183); // 6 feet = 72 inches = 182.88 cm ≈ 183
    expect(feetInchesToCm(5, 8)).toBe(173); // 5'8" = 68 inches = 172.72 cm ≈ 173
    expect(feetInchesToCm(5, 0)).toBe(152); // 5 feet = 60 inches = 152.4 cm ≈ 152
  });
});

test.describe('End-to-End Calculation', () => {
  test('Sample user: Male, 25, 183cm, 100kg, Extra Active, Extreme Loss', () => {
    // User details
    const user = {
      sex: 'male' as const,
      age: 25,
      heightCm: 183,
      weightKg: 100,
    };
    const activity = 'Extra Active: very intense exercise daily, or physical job';
    const goal = 'Extreme weight loss of 1 kg per week';

    // Calculate BMR using Mifflin
    const bmr = bmrMifflinStJeor(user);
    
    // Calculate TDEE
    const tdeeValue = tdee(bmr, activity);
    
    // Calculate target calories
    const target = targetCalories(tdeeValue, goal);
    
    // Expected values (allow ±1-2% tolerance)
    const expectedBMR = 2023.75;
    const expectedTDEE = expectedBMR * 1.95; // 3946.31
    const expectedTarget = expectedTDEE - 1000; // 2946.31, rounded to 2946

    expect(Math.abs(bmr - expectedBMR)).toBeLessThan(1);
    expect(Math.abs(tdeeValue - expectedTDEE)).toBeLessThan(1);
    expect(Math.abs(target - Math.round(expectedTarget))).toBeLessThanOrEqual(2);
    
    // Verify target is within reasonable bounds
    expect(target).toBeGreaterThan(1200);
    expect(target).toBeLessThan(5000);
  });
});

test.describe('Macro Preset Calculations', () => {
  test('calcMacrosFromPercents should return integers and sum within tolerance', () => {
    const targetKcal = 2000;
    
    // Test balanced preset (40% carbs, 30% protein, 30% fat)
    const balanced = calcMacrosFromPercents({ 
      kcal: targetKcal, 
      pctCarb: 40, 
      pctProt: 30, 
      pctFat: 30 
    });
    
    // Check that values are integers
    expect(Number.isInteger(balanced.protein)).toBe(true);
    expect(Number.isInteger(balanced.carbs)).toBe(true);
    expect(Number.isInteger(balanced.fat)).toBe(true);
    
    // Check calculations (protein: 4 kcal/g, carbs: 4 kcal/g, fat: 9 kcal/g)
    expect(balanced.protein).toBe(Math.round((targetKcal * 0.30) / 4)); // 150g
    expect(balanced.carbs).toBe(Math.round((targetKcal * 0.40) / 4));   // 200g
    expect(balanced.fat).toBe(Math.round((targetKcal * 0.30) / 9));     // 67g
    
    // Verify total calories are within ±2% of target
    const totalKcal = (balanced.protein * 4) + (balanced.carbs * 4) + (balanced.fat * 9);
    const percentDiff = Math.abs(totalKcal - targetKcal) / targetKcal * 100;
    expect(percentDiff).toBeLessThanOrEqual(2);
  });

  test('should handle extreme macro distributions', () => {
    const targetKcal = 2200;
    
    // High protein diet
    const highProtein = calcMacrosFromPercents({ 
      kcal: targetKcal, 
      pctCarb: 20, 
      pctProt: 60, 
      pctFat: 20 
    });
    expect(Number.isInteger(highProtein.protein)).toBe(true);
    expect(Number.isInteger(highProtein.carbs)).toBe(true);
    expect(Number.isInteger(highProtein.fat)).toBe(true);
    
    // Total should still be within tolerance
    const totalKcal = (highProtein.protein * 4) + (highProtein.carbs * 4) + (highProtein.fat * 9);
    const percentDiff = Math.abs(totalKcal - targetKcal) / targetKcal * 100;
    expect(percentDiff).toBeLessThanOrEqual(2);
    
    // Low-carb diet
    const lowCarb = calcMacrosFromPercents({ 
      kcal: targetKcal, 
      pctCarb: 10, 
      pctProt: 30, 
      pctFat: 60 
    });
    const lowCarbTotal = (lowCarb.protein * 4) + (lowCarb.carbs * 4) + (lowCarb.fat * 9);
    const lowCarbDiff = Math.abs(lowCarbTotal - targetKcal) / targetKcal * 100;
    expect(lowCarbDiff).toBeLessThanOrEqual(2);
  });
});
