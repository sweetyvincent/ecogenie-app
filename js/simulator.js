// @ts-check
/* ============================================================
   EcoGenie — Carbon Reduction Simulator
   Interactive what-if scenario comparisons
   ============================================================ */

const Simulator = (() => {
  const factors = EcoData.emissionFactors;

  /* ── Pre-built Scenarios ── */
  const scenarios = [
    {
      id: 'drive-to-bike',
      title: 'Drive → Bike',
      icon: '🚲',
      description: 'Switch your daily commute from car to bicycle',
      current: { label: 'Car (petrol)', mode: 'car_petrol', distanceKm: 10, frequency: 'daily', co2PerTrip: 0.21 * 10 },
      alternative: { label: 'Bicycle', mode: 'bicycle', distanceKm: 10, frequency: 'daily', co2PerTrip: 0 },
      moneySavedPerTrip: 1.20,
      healthBenefit: 'Burns ~300 calories per 30-min ride'
    },
    {
      id: 'drive-to-transit',
      title: 'Drive → Public Transit',
      icon: '🚌',
      description: 'Take the bus or train instead of driving alone',
      current: { label: 'Car (petrol)', mode: 'car_petrol', distanceKm: 15, frequency: 'daily', co2PerTrip: 0.21 * 15 },
      alternative: { label: 'Bus/Train', mode: 'bus', distanceKm: 15, frequency: 'daily', co2PerTrip: 0.089 * 15 },
      moneySavedPerTrip: 0.95,
      healthBenefit: 'Reduced stress, time for reading'
    },
    {
      id: 'meat-to-veg',
      title: 'Meat → Vegetarian',
      icon: '🥗',
      description: 'Replace beef meals with plant-based alternatives',
      current: { label: 'Beef meal', type: 'beef', kgPerMeal: 0.25, frequency: 'daily', co2PerTrip: 27 * 0.25 },
      alternative: { label: 'Vegetarian meal', type: 'legumes', kgPerMeal: 0.3, frequency: 'daily', co2PerTrip: 0.9 * 0.3 },
      moneySavedPerTrip: 3.50,
      healthBenefit: 'Lower cholesterol, more fiber'
    },
    {
      id: 'hot-to-cold-shower',
      title: 'Hot → Cold Shower',
      icon: '🚿',
      description: 'Switch from long hot showers to shorter cool ones',
      current: { label: 'Hot shower (10 min)', liters: 90, frequency: 'daily', co2PerTrip: 90 * 0.0032 },
      alternative: { label: 'Cool shower (5 min)', liters: 35, frequency: 'daily', co2PerTrip: 35 * 0.000298 },
      moneySavedPerTrip: 0.45,
      healthBenefit: 'Boosts immunity, improves circulation'
    },
    {
      id: 'ac-to-fan',
      title: 'AC → Fan / Ventilation',
      icon: '🌀',
      description: 'Use ceiling fans and natural ventilation instead of AC',
      current: { label: 'Air Conditioning (4h)', hours: 4, frequency: 'daily', co2PerTrip: 1.5 * 4 },
      alternative: { label: 'Ceiling Fan (4h)', hours: 4, frequency: 'daily', co2PerTrip: 0.03 * 4 },
      moneySavedPerTrip: 0.85,
      healthBenefit: 'Less dry skin, better natural acclimatization'
    },
    {
      id: 'new-to-secondhand',
      title: 'New → Secondhand Clothes',
      icon: '👗',
      description: 'Buy pre-owned clothing instead of new fast fashion',
      current: { label: 'New clothing (1 item)', type: 'clothing', frequency: 'monthly', co2PerTrip: 10 },
      alternative: { label: 'Secondhand (1 item)', type: 'clothing', frequency: 'monthly', co2PerTrip: 1.8 },
      moneySavedPerTrip: 25.00,
      healthBenefit: 'Unique style, supports circular economy'
    },
    {
      id: 'plastic-to-reusable',
      title: 'Plastic → Reusable',
      icon: '🍶',
      description: 'Replace single-use plastics with reusable alternatives',
      current: { label: 'Plastic bottles & bags', frequency: 'daily', co2PerTrip: 0.08 },
      alternative: { label: 'Reusable bottle & bag', frequency: 'daily', co2PerTrip: 0.001 },
      moneySavedPerTrip: 0.60,
      healthBenefit: 'Less microplastics, cleaner oceans'
    },
    {
      id: 'dryer-to-air-dry',
      title: 'Dryer → Air Dry',
      icon: '👕',
      description: 'Air-dry your laundry instead of using an electric dryer',
      current: { label: 'Electric Dryer (1 load)', frequency: 'weekly', co2PerTrip: 2.4 },
      alternative: { label: 'Air Drying', frequency: 'weekly', co2PerTrip: 0 },
      moneySavedPerTrip: 0.72,
      healthBenefit: 'Clothes last longer, fresh scent'
    },
    {
      id: 'flight-to-train',
      title: 'Fly → Train',
      icon: '🚄',
      description: 'Take the train instead of a domestic flight',
      current: { label: 'Domestic Flight', distance: 500, frequency: 'monthly', co2PerTrip: 0.255 * 500 },
      alternative: { label: 'Train', distance: 500, frequency: 'monthly', co2PerTrip: 0.041 * 500 },
      moneySavedPerTrip: 50.00,
      healthBenefit: 'Less jet lag, scenic route, more comfort'
    },
    {
      id: 'incandescent-to-led',
      title: 'Incandescent → LED',
      icon: '💡',
      description: 'Replace traditional light bulbs with LED bulbs',
      current: { label: 'Incandescent (5h/day)', hours: 5, frequency: 'daily', co2PerTrip: 0.03 * 5 },
      alternative: { label: 'LED bulbs (5h/day)', hours: 5, frequency: 'daily', co2PerTrip: 0.005 * 5 },
      moneySavedPerTrip: 0.15,
      healthBenefit: 'Longer lasting, less heat, better light quality'
    }
  ];

  /* ── Simulate a Scenario ── */
  function simulate(scenarioId) {
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (!scenario) return null;

    const currentCO2 = scenario.current.co2PerTrip;
    const altCO2 = scenario.alternative.co2PerTrip;
    const carbonSavedPerUnit = currentCO2 - altCO2;

    let multiplier;
    switch (scenario.current.frequency || scenario.alternative.frequency) {
      case 'daily': multiplier = 365.25; break;
      case 'weekly': multiplier = 52.18; break;
      case 'monthly': multiplier = 12; break;
      default: multiplier = 365.25;
    }

    const annualCarbonSaved = carbonSavedPerUnit * multiplier;
    const annualMoneySaved = (scenario.moneySavedPerTrip || 0) * multiplier;
    const treesEquivalent = Math.ceil(annualCarbonSaved / 22);
    const percentReduction = currentCO2 > 0 ? ((carbonSavedPerUnit / currentCO2) * 100).toFixed(1) : 0;

    return {
      scenario,
      carbonSaved: {
        perUnit: carbonSavedPerUnit,
        weekly: carbonSavedPerUnit * (multiplier === 365.25 ? 7 : multiplier === 52.18 ? 1 : 7 / 30),
        monthly: carbonSavedPerUnit * (multiplier / 12),
        annual: annualCarbonSaved
      },
      moneySaved: {
        perUnit: scenario.moneySavedPerTrip || 0,
        annual: annualMoneySaved
      },
      treesEquivalent,
      percentReduction: parseFloat(percentReduction),
      healthBenefit: scenario.healthBenefit
    };
  }

  /* ── Custom Simulation ── */
  function customSimulate(currentActivity, alternativeActivity) {
    let currentCO2 = 0;
    let altCO2 = 0;

    if (currentActivity.type === 'transport') {
      currentCO2 = CarbonCalculator.calculateTransport(currentActivity.mode, currentActivity.distance);
      altCO2 = CarbonCalculator.calculateTransport(alternativeActivity.mode, alternativeActivity.distance);
    } else if (currentActivity.type === 'food') {
      currentCO2 = CarbonCalculator.calculateFood([{ type: currentActivity.food, kg: currentActivity.kg }]);
      altCO2 = CarbonCalculator.calculateFood([{ type: alternativeActivity.food, kg: alternativeActivity.kg }]);
    } else if (currentActivity.type === 'energy') {
      currentCO2 = CarbonCalculator.calculateElectricity(currentActivity.kwh);
      altCO2 = CarbonCalculator.calculateElectricity(alternativeActivity.kwh);
    }

    const saved = currentCO2 - altCO2;
    return {
      currentCO2,
      alternativeCO2: altCO2,
      carbonSaved: saved,
      percentReduction: currentCO2 > 0 ? ((saved / currentCO2) * 100).toFixed(1) : 0,
      treesEquivalent: Math.ceil(saved * 365 / 22)
    };
  }

  /* ── Get All Scenarios ── */
  function getAllScenarios() {
    return scenarios;
  }

  /* ── Get Scenario by ID ── */
  function getScenario(id) {
    return scenarios.find(s => s.id === id);
  }

  /* ── Render Scenario Card HTML ── */
  function renderScenarioCard(scenarioId) {
    const result = simulate(scenarioId);
    if (!result) return '';

    const { scenario, carbonSaved, moneySaved, treesEquivalent, percentReduction } = result;

    return `
      <div class="glass-card scenario-card" tabindex="0" data-scenario="${scenarioId}">
        <div class="scenario-header">
          <span class="scenario-icon">${scenario.icon}</span>
          <div>
            <h4>${scenario.title}</h4>
            <p class="text-muted fs-sm">${scenario.description}</p>
          </div>
        </div>
        <div class="scenario-comparison">
          <div class="scenario-item before">
            <div class="item-label">Current</div>
            <div class="item-value">${scenario.current.co2PerTrip.toFixed(1)} kg</div>
            <div class="fs-xs text-muted">${scenario.current.label}</div>
          </div>
          <span class="scenario-arrow">→</span>
          <div class="scenario-item after">
            <div class="item-label">Alternative</div>
            <div class="item-value">${scenario.alternative.co2PerTrip.toFixed(1)} kg</div>
            <div class="fs-xs text-muted">${scenario.alternative.label}</div>
          </div>
        </div>
        <div class="scenario-stats">
          <div class="scenario-stat">
            <div class="stat-num">${carbonSaved.annual.toFixed(0)}</div>
            <div class="stat-lbl">kg CO₂/year</div>
          </div>
          <div class="scenario-stat">
            <div class="stat-num">$${moneySaved.annual.toFixed(0)}</div>
            <div class="stat-lbl">saved/year</div>
          </div>
          <div class="scenario-stat">
            <div class="stat-num">${treesEquivalent}</div>
            <div class="stat-lbl">trees 🌳</div>
          </div>
        </div>
        <div class="mt-md text-center">
          <span class="badge badge-success">-${percentReduction}% CO₂</span>
        </div>
      </div>
    `;
  }

  /**
   * Public API for the Carbon Reduction Simulator.
   */
  return {
    /**
     * Simulates emissions savings for a pre-built scenario.
     * @param {string} scenarioId - The ID of the scenario.
     * @returns {Object|null} Simulated results including carbon/money savings.
     */
    simulate,
    /**
     * Runs a custom what-if comparison between a current and alternative activity.
     * @param {Object} currentActivity - The current baseline activity.
     * @param {Object} alternativeActivity - The proposed alternative activity.
     * @returns {Object} Custom simulation results.
     */
    customSimulate,
    /**
     * Retrieves all pre-built scenarios.
     * @returns {Array<Object>} List of scenarios.
     */
    getAllScenarios,
    /**
     * Retrieves a single scenario by its ID.
     * @param {string} id - The scenario ID.
     * @returns {Object|undefined} The scenario object.
     */
    getScenario,
    /**
     * Renders a scenario comparison card as HTML.
     * @param {string} scenarioId - The scenario ID.
     * @returns {string} HTML representation of the scenario card.
     */
    renderScenarioCard,
    /**
     * Raw array of pre-built scenarios.
     * @type {Array<Object>}
     */
    scenarios
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Simulator;
}

