/* ============================================================
   EcoGenie — Carbon Calculator Engine Unit Tests
   ============================================================ */

const CarbonCalculator = require('../js/carbon-calculator.js');

describe('CarbonCalculator Transport Emissions', () => {
  test('should calculate emissions for petrol car correctly', () => {
    // 10 km * 0.21 kg CO2/km = 2.1 kg CO2
    const emissions = CarbonCalculator.calculateTransport('car_petrol', 10);
    expect(emissions).toBeCloseTo(2.1);
  });

  test('should calculate emissions for diesel car correctly', () => {
    // 10 km * 0.17 kg CO2/km = 1.7 kg CO2
    const emissions = CarbonCalculator.calculateTransport('car_diesel', 10);
    expect(emissions).toBeCloseTo(1.7);
  });

  test('should return 0 emissions for bicycle and walking', () => {
    expect(CarbonCalculator.calculateTransport('bicycle', 15)).toBe(0);
    expect(CarbonCalculator.calculateTransport('walking', 5)).toBe(0);
  });

  test('should return 0 for unknown transport mode and log warning', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const emissions = CarbonCalculator.calculateTransport('spaceship', 100);
    expect(emissions).toBe(0);
    expect(consoleSpy).toHaveBeenCalledWith('Unknown transport mode: spaceship');
    consoleSpy.mockRestore();
  });
});

describe('CarbonCalculator Utility Emissions', () => {
  test('should calculate electricity emissions correctly', () => {
    // 100 kWh * 0.42 kg CO2/kWh = 42 kg CO2
    const emissions = CarbonCalculator.calculateElectricity(100);
    expect(emissions).toBeCloseTo(42);
  });

  test('should calculate electricity emissions with specific solar source correctly', () => {
    // 100 kWh * 0.05 kg CO2/kWh = 5 kg CO2
    const emissions = CarbonCalculator.calculateElectricity(100, 'solar');
    expect(emissions).toBeCloseTo(5);
  });

  test('should calculate water emissions correctly (cold water)', () => {
    // 1000 Liters * 0.000298 kg CO2/Liter = 0.298 kg CO2
    const emissions = CarbonCalculator.calculateWater(1000, false);
    expect(emissions).toBeCloseTo(0.298);
  });

  test('should calculate hot water emissions correctly', () => {
    // 100 Liters * 0.0032 kg CO2/Liter = 0.32 kg CO2
    const emissions = CarbonCalculator.calculateWater(100, true);
    expect(emissions).toBeCloseTo(0.32);
  });
});

describe('CarbonCalculator Food, Shopping & Waste', () => {
  test('should calculate food emissions correctly', () => {
    const foodItems = [
      { type: 'beef', kg: 0.5 },       // 0.5 * 27.0 = 13.5
      { type: 'vegetables', kg: 2.0 }  // 2.0 * 2.0 = 4.0
    ];
    const emissions = CarbonCalculator.calculateFood(foodItems);
    expect(emissions).toBeCloseTo(17.5);
  });

  test('should calculate shopping emissions correctly', () => {
    const shoppingItems = [
      { type: 'clothing', quantity: 2 },    // 2 * 10 = 20
      { type: 'electronics', quantity: 1 }  // 1 * 50 = 50
    ];
    const emissions = CarbonCalculator.calculateShopping(shoppingItems);
    expect(emissions).toBe(70);
  });

  test('should calculate waste emissions correctly', () => {
    // 10 kg landfill waste * 0.58 kg CO2/kg = 5.8 kg CO2
    const emissions = CarbonCalculator.calculateWaste(10, 'landfill');
    expect(emissions).toBeCloseTo(5.8);
  });
});

describe('CarbonCalculator Aggregate Calculations', () => {
  test('should calculate daily and annual emissions correctly from a combined profile', () => {
    const profile = {
      transport: [
        { mode: 'car_petrol', distanceKm: 20 }, // 20 * 0.21 = 4.2
        { mode: 'train', distanceKm: 50 }       // 50 * 0.041 = 2.05
      ],
      electricity: { kwh: 10, source: 'perKwh' }, // 10 * 0.42 = 4.2
      water: { liters: 200, isHot: false },       // 200 * 0.000298 = 0.0596
      food: [
        { type: 'chicken', kg: 0.3 },    // 0.3 * 6.9 = 2.07
        { type: 'vegetables', kg: 1.0 }  // 1.0 * 2.0 = 2.00
      ],
      shopping: [
        { type: 'clothing', quantity: 1 } // 10
      ],
      waste: { kg: 5, method: 'landfill' } // 5 * 0.58 = 2.9
    };

    const result = CarbonCalculator.calculateTotal(profile);

    // Total daily = 4.2 + 2.05 + 4.2 + 0.0596 + 2.07 + 2.00 + 10 + 2.9 = 27.4796 kg
    expect(result.daily).toBeCloseTo(27.4796);
    expect(result.weekly).toBeCloseTo(27.4796 * 7);
    expect(result.annual).toBeCloseTo(27.4796 * 365.25);
  });
});

describe('Eco Score, Benchmarks, Trees and Money', () => {
  test('should map eco score rating bracket correctly', () => {
    // Under 1 ton (1000 kg) should be score 100 (A)
    const result1 = CarbonCalculator.getEcoScore(800);
    expect(result1.score).toBe(100);
    expect(result1.rating).toBe('A');

    // Over 10 tons (10000 kg) should be score 0 (F)
    const result2 = CarbonCalculator.getEcoScore(12000);
    expect(result2.score).toBe(0);
    expect(result2.rating).toBe('F');

    // Average rating
    const result3 = CarbonCalculator.getEcoScore(4700);
    expect(result3.score).toBeGreaterThan(0);
    expect(result3.score).toBeLessThan(100);
  });

  test('should calculate trees equivalent correctly', () => {
    // 22 kg CO2 requires 1 tree absorption per year. So 44 kg requires 2 trees
    expect(CarbonCalculator.treesEquivalent(44)).toBe(2);
    expect(CarbonCalculator.treesEquivalent(10)).toBe(1);
    expect(CarbonCalculator.treesEquivalent(0)).toBe(0);
  });

  test('should estimate cost savings correctly', () => {
    const profile = {
      transport: [
        { mode: 'car_petrol', distanceKm: 100 } // savings = 100 * (0.12 - 0.03) = $9.00
      ],
      electricity: { kwh: 100 } // savings = 100 * 0.15 * 0.2 = $3.00
    };
    const savings = CarbonCalculator.moneyEstimate(profile);
    expect(savings.daily).toBe(12);
  });
});
