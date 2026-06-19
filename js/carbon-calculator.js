// @ts-check
/* ============================================================
   EcoGenie — Carbon Calculator Engine
   Comprehensive emission calculation functions
   ============================================================ */

if (typeof EcoData === 'undefined' && typeof require !== 'undefined') {
  global.EcoData = require('./data.js');
}

const CarbonCalculator = (() => {
  const factors = EcoData.emissionFactors;
  const averages = EcoData.averages;

  /* ── Transport ── */
  function calculateTransport(mode, distanceKm) {
    const factor = factors.transport[mode];
    if (factor === undefined) {
      console.warn(`Unknown transport mode: ${mode}`);
      return 0;
    }
    return distanceKm * factor;
  }

  /* ── Electricity ── */
  function calculateElectricity(kwhUsed, source = 'perKwh') {
    const factor = factors.electricity[source] || factors.electricity.perKwh;
    return kwhUsed * factor;
  }

  /* ── Water ── */
  function calculateWater(liters, isHot = false) {
    const factor = isHot ? factors.water.hotWaterPerLiter : factors.water.perLiter;
    return liters * factor;
  }

  /* ── Food ── */
  function calculateFood(foodItems) {
    // foodItems: [{ type: 'beef', kg: 0.5 }, ...]
    let total = 0;
    foodItems.forEach(item => {
      const factor = factors.food[item.type];
      if (factor) {
        total += item.kg * factor;
      }
    });
    return total;
  }

  /* ── Shopping ── */
  function calculateShopping(items) {
    // items: [{ type: 'clothing', quantity: 2 }, ...]
    let total = 0;
    items.forEach(item => {
      const factor = factors.shopping[item.type];
      if (factor) {
        total += item.quantity * factor;
      }
    });
    return total;
  }

  /* ── Waste ── */
  function calculateWaste(kgWaste, method = 'landfill') {
    const factor = factors.waste[method] || factors.waste.landfill;
    return kgWaste * factor;
  }

  /* ── Home Activities ── */
  function calculateHome(activity, hours) {
    const factor = factors.home[activity];
    if (factor) {
      return hours * factor;
    }
    return 0;
  }

  /* ── Calculate Total ── */
  function calculateTotal(allActivities) {
    /*
      allActivities: {
        transport: [{ mode, distanceKm }],
        electricity: { kwh, source },
        water: { liters, isHot },
        food: [{ type, kg }],
        shopping: [{ type, quantity }],
        waste: { kg, method },
        home: [{ activity, hours }]
      }
    */
    const breakdown = {
      transport: 0,
      energy: 0,
      water: 0,
      food: 0,
      shopping: 0,
      waste: 0
    };

    if (allActivities.transport) {
      allActivities.transport.forEach(t => {
        breakdown.transport += calculateTransport(t.mode, t.distanceKm);
      });
    }

    if (allActivities.electricity) {
      breakdown.energy += calculateElectricity(
        allActivities.electricity.kwh,
        allActivities.electricity.source
      );
    }

    if (allActivities.home) {
      allActivities.home.forEach(h => {
        breakdown.energy += calculateHome(h.activity, h.hours);
      });
    }

    if (allActivities.water) {
      breakdown.water += calculateWater(
        allActivities.water.liters,
        allActivities.water.isHot
      );
    }

    if (allActivities.food) {
      breakdown.food += calculateFood(allActivities.food);
    }

    if (allActivities.shopping) {
      breakdown.shopping += calculateShopping(allActivities.shopping);
    }

    if (allActivities.waste) {
      breakdown.waste += calculateWaste(
        allActivities.waste.kg,
        allActivities.waste.method
      );
    }

    const daily = Object.values(breakdown).reduce((a, b) => a + b, 0);
    return {
      daily: daily,
      weekly: daily * 7,
      monthly: daily * 30.44,
      annual: daily * 365.25,
      breakdown: breakdown
    };
  }

  /* ── Eco Score ── */
  function getEcoScore(annualKg) {
    // Lower emissions = higher score
    // Global average: ~4700 kg/year
    // Target: 2500 kg/year
    const maxEmission = 10000; // Score 0 at 10+ tons
    const targetEmission = 1000; // Score 100 at < 1 ton

    let score = Math.round(100 * (1 - (annualKg - targetEmission) / (maxEmission - targetEmission)));
    score = Math.max(0, Math.min(100, score));

    let rating, label, color, description;
    if (score >= 80) {
      rating = 'A'; label = 'Excellent'; color = '#10b981';
      description = 'Outstanding! You\'re well below average emissions.';
    } else if (score >= 60) {
      rating = 'B'; label = 'Good'; color = '#14b8a6';
      description = 'Great job! You\'re below average emissions.';
    } else if (score >= 40) {
      rating = 'C'; label = 'Average'; color = '#f59e0b';
      description = 'Around the global average. Room for improvement!';
    } else if (score >= 20) {
      rating = 'D'; label = 'Below Average'; color = '#f97316';
      description = 'Above average emissions. Let\'s work on reducing them.';
    } else {
      rating = 'F'; label = 'Needs Work'; color = '#ef4444';
      description = 'High emissions detected. Small changes can make a big difference!';
    }

    return { score, rating, label, color, description };
  }

  /* ── Compare to Average ── */
  function compareToAverage(annualKg) {
    const globalAvg = averages.global_annual_per_capita;
    const diff = annualKg - globalAvg;
    const percentDiff = ((diff / globalAvg) * 100).toFixed(1);
    const percentile = Math.round(Math.max(0, Math.min(100,
      100 * (1 - annualKg / (averages.us_annual * 1.2))
    )));

    let comparison;
    if (diff < -1000) comparison = 'Significantly below average';
    else if (diff < 0) comparison = 'Below average';
    else if (diff < 1000) comparison = 'Near average';
    else if (diff < 3000) comparison = 'Above average';
    else comparison = 'Significantly above average';

    const savingsPotential = Math.max(0, annualKg - averages.target_2030);

    return {
      percentile,
      comparison,
      percentDiff: parseFloat(percentDiff),
      savingsPotential,
      globalAverage: globalAvg,
      target2030: averages.target_2030,
      target2050: averages.target_2050
    };
  }

  /* ── Trees Equivalent ── */
  function treesEquivalent(kgCO2) {
    const treesAbsorptionPerYear = 22; // kg CO₂ per tree per year
    return Math.ceil(kgCO2 / treesAbsorptionPerYear);
  }

  /* ── Money Estimate ── */
  function moneyEstimate(activities) {
    let savings = 0;
    // Transport savings
    if (activities.transport) {
      activities.transport.forEach(t => {
        if (t.mode === 'car_petrol' || t.mode === 'car_diesel') {
          const fuelCostPerKm = 0.12; // USD
          const altCost = 0.03; // public transit per km
          savings += t.distanceKm * (fuelCostPerKm - altCost);
        }
      });
    }
    // Energy savings potential
    if (activities.electricity) {
      const electricityCostPerKwh = 0.15; // USD
      const savablePortion = 0.2; // 20% typically savable
      savings += activities.electricity.kwh * electricityCostPerKwh * savablePortion;
    }
    // Food savings
    if (activities.food) {
      activities.food.forEach(f => {
        if (['beef', 'lamb'].includes(f.type)) {
          savings += f.kg * 8; // Potential savings switching to plant-based
        }
      });
    }
    return {
      daily: savings,
      weekly: savings * 7,
      monthly: savings * 30.44,
      annual: savings * 365.25
    };
  }

  /* ── Generate Sample Data ── */
  function generateSampleData() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return {
      weeklyData: days.map(d => ({
        label: d,
        value: 8 + Math.random() * 12
      })),
      monthlyData: months.map(m => ({
        label: m,
        value: 250 + Math.random() * 200
      })),
      categoryBreakdown: [
        { label: 'Transport', value: 3.8 + Math.random() * 2, color: '#3b82f6' },
        { label: 'Energy', value: 2.5 + Math.random() * 2, color: '#f59e0b' },
        { label: 'Food', value: 3.0 + Math.random() * 2, color: '#10b981' },
        { label: 'Shopping', value: 1.5 + Math.random() * 1, color: '#8b5cf6' },
        { label: 'Waste', value: 0.5 + Math.random() * 0.5, color: '#ef4444' },
        { label: 'Water', value: 0.2 + Math.random() * 0.3, color: '#06b6d4' }
      ],
      trendData: Array.from({ length: 30 }, (_, i) => ({
        label: `Day ${i + 1}`,
        value: 12 - (i * 0.1) + (Math.random() * 3 - 1.5)
      })),
      sparkData: Array.from({ length: 14 }, () => 5 + Math.random() * 10)
    };
  }

  /**
   * Public API for the Carbon Calculator Engine.
   */
  return {
    /**
     * Calculates carbon emissions for transport mode.
     * @param {string} mode - Transport mode type.
     * @param {number} distanceKm - Distance traveled in km.
     * @returns {number} Emissions in kg CO2.
     */
    calculateTransport,
    /**
     * Calculates electricity emissions.
     * @param {number} kwhUsed - Power usage in kWh.
     * @param {string} [source='perKwh'] - Energy source type.
     * @returns {number} Emissions in kg CO2.
     */
    calculateElectricity,
    /**
     * Calculates water consumption emissions.
     * @param {number} liters - Liters of water used.
     * @param {boolean} [isHot=false] - Whether hot water was used.
     * @returns {number} Emissions in kg CO2.
     */
    calculateWater,
    /**
     * Calculates food consumption emissions.
     * @param {Array<Object>} foodItems - Array of food item inputs.
     * @returns {number} Emissions in kg CO2.
     */
    calculateFood,
    /**
     * Calculates shopping emissions.
     * @param {Array<Object>} items - Array of shopping item inputs.
     * @returns {number} Emissions in kg CO2.
     */
    calculateShopping,
    /**
     * Calculates waste management emissions.
     * @param {number} kg - Weight in kg.
     * @param {string} method - Disposal method ('landfill' or 'recycled').
     * @returns {number} Emissions in kg CO2.
     */
    calculateWaste,
    /**
     * Calculates home heating/utilities emissions.
     * @param {Object} input - Home utility inputs.
     * @returns {number} Emissions in kg CO2.
     */
    calculateHome,
    /**
     * Calculates total daily/weekly/annual carbon footprint.
     * @param {Object} inputs - User input breakdown.
     * @returns {Object} Comprehensive emissions summary.
     */
    calculateTotal,
    /**
     * Computes the eco score rating bracket.
     * @param {number} annualCo2 - Annual emissions in kg CO2.
     * @returns {Object} Eco rating object.
     */
    getEcoScore,
    /**
     * Compares user emissions to regional averages.
     * @param {number} annualCo2 - Annual emissions in kg CO2.
     * @returns {Object} Comparison metrics.
     */
    compareToAverage,
    /**
     * Computes annual tree offset equivalent.
     * @param {number} co2Saved - CO2 saved in kg.
     * @returns {number} Trees equivalent.
     */
    treesEquivalent,
    /**
     * Estimates cost savings for carbon-reducing actions.
     * @param {Object} profile - User commuting/utility profile.
     * @returns {Object} Calculated money savings.
     */
    moneyEstimate,
    /**
     * Generates sample mock data for graphs.
     * @returns {Array<Object>} Sample dataset.
     */
    generateSampleData
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CarbonCalculator;
}
