if (typeof EcoData === 'undefined' && typeof require !== 'undefined') {
  global.EcoData = require('../js/data.js');
}
if (typeof CarbonCalculator === 'undefined' && typeof require !== 'undefined') {
  global.CarbonCalculator = require('../js/carbon-calculator.js');
}

const Simulator = require('../js/simulator.js');

describe('Simulator Pre-built Scenarios', () => {
  test('should return all 10 scenarios', () => {
    const list = Simulator.getAllScenarios();
    expect(list.length).toBe(10);
  });

  test('should find scenario by id', () => {
    const s = Simulator.getScenario('drive-to-bike');
    expect(s).toBeDefined();
    expect(s.title).toBe('Drive → Bike');
  });

  test('should return null for unknown scenario id', () => {
    const s = Simulator.getScenario('unknown-id');
    expect(s).toBeUndefined(); // scenarios.find returns undefined if not found
  });
});

describe('Simulator Simulation', () => {
  test('should calculate carbon savings for drive-to-bike scenario', () => {
    const result = Simulator.simulate('drive-to-bike');
    expect(result).toBeDefined();
    expect(result.carbonSaved.perUnit).toBeCloseTo(0.21 * 10 - 0);
  });

  test('should calculate annual savings correctly for daily frequency', () => {
    const result = Simulator.simulate('drive-to-bike');
    // daily commute = 10km. car_petrol = 0.21 co2/km. bicycle = 0.
    // carbonSavedPerUnit = 2.1 - 0 = 2.1
    // annualCarbonSaved = 2.1 * 365.25 = 767.025
    expect(result.carbonSaved.annual).toBeCloseTo(2.1 * 365.25);
  });

  test('should calculate money savings', () => {
    const result = Simulator.simulate('drive-to-bike');
    expect(result.moneySaved.perUnit).toBe(1.20);
    expect(result.moneySaved.annual).toBeCloseTo(1.20 * 365.25);
  });

  test('should calculate trees equivalent', () => {
    const result = Simulator.simulate('drive-to-bike');
    const expectedTrees = Math.ceil((2.1 * 365.25) / 22);
    expect(result.treesEquivalent).toBe(expectedTrees);
  });

  test('should calculate percent reduction', () => {
    const result = Simulator.simulate('drive-to-bike');
    expect(result.percentReduction).toBe(100.0);
  });

  test('should handle monthly frequency scenarios correctly', () => {
    const result = Simulator.simulate('flight-to-train');
    // flight distance = 500. flight_domestic = 0.255. train = 0.041.
    // co2PerTrip: flight = 127.5, train = 20.5
    // diff = 107
    // monthly frequency multiplier = 12
    expect(result.carbonSaved.annual).toBeCloseTo(107 * 12);
  });
});

describe('Simulator Custom Simulation', () => {
  test('should simulate custom transport comparison', () => {
    const current = { type: 'transport', mode: 'car_petrol', distance: 10 };
    const alternative = { type: 'transport', mode: 'bicycle', distance: 10 };
    const result = Simulator.customSimulate(current, alternative);
    expect(result.currentCO2).toBeCloseTo(2.1);
    expect(result.alternativeCO2).toBe(0);
    expect(result.carbonSaved).toBeCloseTo(2.1);
    expect(result.percentReduction).toBe('100.0');
  });

  test('should simulate custom food comparison', () => {
    const current = { type: 'food', food: 'beef', kg: 0.5 };
    const alternative = { type: 'food', food: 'chicken', kg: 0.5 };
    const result = Simulator.customSimulate(current, alternative);
    // beef = 27 * 0.5 = 13.5
    // chicken = 6.9 * 0.5 = 3.45
    expect(result.currentCO2).toBeCloseTo(13.5);
    expect(result.alternativeCO2).toBeCloseTo(3.45);
    expect(result.carbonSaved).toBeCloseTo(10.05);
  });

  test('should handle zero-emission alternatives', () => {
    const current = { type: 'transport', mode: 'car_petrol', distance: 10 };
    const alternative = { type: 'transport', mode: 'walking', distance: 10 };
    const result = Simulator.customSimulate(current, alternative);
    expect(result.alternativeCO2).toBe(0);
    expect(result.carbonSaved).toBeCloseTo(2.1);
  });
});

describe('Simulator Render', () => {
  test('should generate HTML for scenario card', () => {
    const html = Simulator.renderScenarioCard('drive-to-bike');
    expect(html).toContain('class="glass-card scenario-card"');
    expect(html).toContain('Drive → Bike');
  });

  test('should return empty string for unknown scenario', () => {
    const html = Simulator.renderScenarioCard('unknown-scenario');
    expect(html).toBe('');
  });
});
