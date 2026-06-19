// @ts-check
/* ============================================================
   EcoGenie — AI Sustainability Coach (CarbonGPT)
   Keyword-based chat system with contextual responses
   ============================================================ */

const AICoach = (() => {
  const responses = EcoData.carbonGPTResponses;
  const tips = EcoData.tips;

  /* ── Keyword Mapping ── */
  const topicKeywords = {
    transport: ['car', 'drive', 'driving', 'bus', 'train', 'metro', 'bike', 'bicycle', 'cycling', 'walk', 'walking', 'flight', 'fly', 'flying', 'commute', 'commuting', 'transport', 'transportation', 'vehicle', 'ev', 'electric car', 'carpool', 'rideshare', 'motorcycle', 'scooter', 'uber', 'taxi'],
    food: ['food', 'eat', 'eating', 'diet', 'meal', 'meat', 'beef', 'chicken', 'vegan', 'vegetarian', 'plant-based', 'cooking', 'recipe', 'grocery', 'produce', 'organic', 'dairy', 'milk', 'cheese', 'fish', 'seafood', 'restaurant', 'lunch', 'dinner', 'breakfast', 'snack'],
    energy: ['energy', 'electricity', 'power', 'solar', 'renewable', 'light', 'bulb', 'led', 'ac', 'air conditioning', 'heating', 'thermostat', 'appliance', 'dryer', 'washing', 'laundry', 'insulation', 'bills', 'kwh', 'watt'],
    water: ['water', 'shower', 'bath', 'tap', 'faucet', 'irrigation', 'rain', 'rainwater', 'flush', 'toilet', 'pool', 'drinking water', 'hot water'],
    waste: ['waste', 'trash', 'garbage', 'recycle', 'recycling', 'compost', 'composting', 'landfill', 'plastic', 'packaging', 'zero waste', 'reduce', 'reuse', 'single-use', 'disposable', 'bin'],
    shopping: ['shopping', 'buy', 'purchase', 'clothes', 'clothing', 'fashion', 'electronics', 'gadget', 'phone', 'laptop', 'furniture', 'secondhand', 'thrift', 'online shopping', 'amazon', 'retail', 'mall'],
    travel: ['travel', 'vacation', 'holiday', 'trip', 'tourism', 'hotel', 'airbnb', 'cruise', 'destination', 'abroad', 'international'],
    home: ['home', 'house', 'apartment', 'living', 'room', 'kitchen', 'garden', 'yard', 'roof', 'window', 'door', 'insulate', 'renovation', 'furniture'],
    offset: ['offset', 'carbon offset', 'tree', 'plant tree', 'reforestation', 'carbon credit', 'neutral', 'net zero', 'negative'],
    motivation: ['motivat', 'inspire', 'why', 'worth it', 'matter', 'difference', 'impact', 'help', 'hopeless', 'depressed', 'give up', 'can i really', 'does it', 'point'],
    general: ['carbon', 'co2', 'emission', 'footprint', 'climate', 'global warming', 'greenhouse', 'environment', 'sustainable', 'sustainability', 'eco', 'green', 'planet', 'earth']
  };

  /* ── Detect Topic ── */
  function detectTopic(message) {
    const lowerMsg = message.toLowerCase();

    // Check greetings
    const greetings = ['hello', 'hi', 'hey', 'good morning', 'good evening', 'howdy', 'greetings', 'sup', 'what\'s up'];
    if (greetings.some(g => lowerMsg.includes(g)) && lowerMsg.length < 30) {
      return 'greetings';
    }

    // Score each topic
    const scores = {};
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      scores[topic] = 0;
      keywords.forEach(kw => {
        if (lowerMsg.includes(kw)) {
          scores[topic] += kw.split(' ').length; // Multi-word keywords score higher
        }
      });
    }

    const bestTopic = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    if (bestTopic[1] > 0) {
      return bestTopic[0];
    }

    return 'fallback';
  }

  /* ── Get Response ── */
  function getResponse(topic, userProfile = null) {
    const topicResponses = responses[topic] || responses.fallback;
    let baseResponse = topicResponses[Math.floor(Math.random() * topicResponses.length)];

    if (userProfile && userProfile.preferences) {
      const prefs = userProfile.preferences;
      if (topic === 'transport' && prefs.transportMode && prefs.dailyCommute !== undefined) {
        const factorMap = {
          car_petrol: 0.21,
          car_diesel: 0.17,
          car_electric: 0.05,
          bus: 0.089,
          train: 0.041,
          metro: 0.033,
          motorcycle: 0.113,
          bicycle: 0.0,
          walking: 0.0
        };
        const factor = factorMap[prefs.transportMode] || 0.21;
        const dailyEmissions = factor * prefs.dailyCommute;
        const annualEmissions = dailyEmissions * 365;

        let commuteTip = '';
        if (prefs.transportMode.includes('car')) {
          commuteTip = `Since you commute **${prefs.dailyCommute} km** by **${prefs.transportMode.replace('_', ' ')}**, this trip generates **${annualEmissions.toFixed(0)} kg CO₂** annually. Consider switching to metro or bike occasionally to save carbon!`;
        } else if (prefs.transportMode === 'bicycle' || prefs.transportMode === 'walking') {
          commuteTip = `Incredible! Since you commute **${prefs.dailyCommute} km** by **${prefs.transportMode}**, you generate **0 kg CO₂**! Keep walking/cycling and setting a wonderful example!`;
        } else {
          commuteTip = `Since you commute **${prefs.dailyCommute} km** via **${prefs.transportMode}**, your annual commute footprint is **${annualEmissions.toFixed(0)} kg CO₂**. Good job choosing public transit over personal petrol cars!`;
        }
        
        baseResponse += `\n\n🎯 **Coach Personalized Insight:**\n${commuteTip}`;
      } else if (topic === 'food' && prefs.dietType) {
        const dietDescriptions = {
          meat_heavy: "heavy meat consumption (which has the highest food carbon footprint)",
          regular: "mixed diet with regular meat consumption",
          occasional: "occasional meat consumption (a great step towards reducing emissions)",
          pescatarian: "pescatarian diet (replacing red meat with fish)",
          vegetarian: "vegetarian diet (fully meat-free, which reduces food emissions by up to 50%)",
          vegan: "100% plant-based vegan diet (which has the absolute lowest carbon footprint!)"
        };
        const desc = dietDescriptions[prefs.dietType] || prefs.dietType;
        baseResponse += `\n\n🎯 **Coach Personalized Insight:**\nYour current diet profile is **${desc}**. If you're looking to reduce your footprint further, try replacing dairy or high-impact cheese meals with plant-based alternatives!`;
      }
    }

    return baseResponse;
  }

  /* ── Process Chat Message ── */
  function processChat(message, userProfile = null) {
    const topic = detectTopic(message);
    const response = getResponse(topic, userProfile);
    return {
      topic,
      response,
      suggestedFollowups: getSuggestedFollowups(topic)
    };
  }

  /* ── Suggested Follow-up Questions ── */
  function getSuggestedFollowups(topic) {
    const followups = {
      greetings: ['How can I reduce my carbon footprint?', 'What\'s my eco score?', 'Give me tips for today'],
      transport: ['How much CO₂ does flying produce?', 'Should I get an electric car?', 'Tips for green commuting'],
      food: ['What\'s the most eco-friendly diet?', 'How much CO₂ does beef produce?', 'Easy low-carbon recipes'],
      energy: ['How much can solar panels save?', 'Best ways to reduce electricity', 'Smart home eco tips'],
      water: ['How to reduce water usage?', 'Impact of hot vs cold water', 'Water-saving devices'],
      waste: ['How to start composting?', 'Recycling tips', 'Zero waste lifestyle basics'],
      shopping: ['Sustainable fashion tips', 'Best eco-friendly products', 'Secondhand shopping guide'],
      travel: ['Green travel alternatives', 'How to offset flights', 'Best eco travel destinations'],
      home: ['Home energy audit guide', 'Best insulation options', 'Eco-friendly renovations'],
      offset: ['Best carbon offset programs', 'How many trees offset my carbon?', 'What is carbon neutral?'],
      motivation: ['Show me my progress', 'Success stories from others', 'What are the biggest impacts?'],
      general: ['What\'s the global average?', 'How is CO₂ measured?', 'Paris Agreement targets'],
      fallback: ['Tell me about transport emissions', 'Food and carbon footprint', 'Energy saving tips']
    };
    return followups[topic] || followups.fallback;
  }

  /* ── Generate Recommendations ── */
  function generateRecommendations(userProfile, emissions) {
    const recommendations = [];
    const breakdown = emissions.breakdown || {};

    // Transport recommendations
    if (breakdown.transport > 3) {
      recommendations.push({
        category: 'transport',
        icon: '🚲',
        title: 'Switch to Green Commuting',
        description: 'Your transport emissions are high. Try cycling, walking, or public transit for short trips.',
        impact: 'Save up to 2.1 kg CO₂ per 10 km trip',
        priority: 'high'
      });
    }

    // Energy recommendations
    if (breakdown.energy > 3) {
      recommendations.push({
        category: 'energy',
        icon: '💡',
        title: 'Optimize Home Energy',
        description: 'Switch to LED bulbs, unplug standby devices, and adjust your thermostat by 2°C.',
        impact: 'Save up to 30% on energy emissions',
        priority: 'high'
      });
    }

    // Food recommendations
    if (breakdown.food > 4) {
      recommendations.push({
        category: 'food',
        icon: '🥗',
        title: 'More Plant-Based Meals',
        description: 'Replace 2 meat meals per week with plant-based alternatives.',
        impact: 'Save up to 135 kg CO₂ per year',
        priority: 'high'
      });
    }

    // Shopping recommendations
    if (breakdown.shopping > 2) {
      recommendations.push({
        category: 'shopping',
        icon: '🛍️',
        title: 'Shop Sustainably',
        description: 'Buy secondhand, choose quality over quantity, and repair instead of replacing.',
        impact: 'Reduce shopping emissions by 60%',
        priority: 'medium'
      });
    }

    // Waste recommendations
    if (breakdown.waste > 0.5) {
      recommendations.push({
        category: 'waste',
        icon: '♻️',
        title: 'Start Recycling & Composting',
        description: 'Separate recyclables and compost kitchen scraps to reduce landfill emissions.',
        impact: 'Save up to 0.56 kg CO₂ per kg of waste',
        priority: 'medium'
      });
    }

    // Water recommendations
    if (breakdown.water > 0.3) {
      recommendations.push({
        category: 'water',
        icon: '💧',
        title: 'Reduce Hot Water Usage',
        description: 'Take shorter showers and use cold water for laundry when possible.',
        impact: 'Save water heating energy by 40%',
        priority: 'low'
      });
    }

    // Always add some general recommendations
    recommendations.push({
      category: 'general',
      icon: '📊',
      title: 'Track Daily Activities',
      description: 'Log your activities daily to identify patterns and track your improvement over time.',
      impact: 'Awareness leads to 15-20% natural reduction',
      priority: 'medium'
    });

    return recommendations.sort((a, b) => {
      const p = { high: 0, medium: 1, low: 2 };
      return p[a.priority] - p[b.priority];
    });
  }

  /* ── Generate Daily Tasks ── */
  function generateDailyTasks(userProfile) {
    const allTasks = [
      { id: 't1', name: 'Walk or bike for one trip today', category: 'transport', xp: 50, icon: '🚲' },
      { id: 't2', name: 'Eat a plant-based lunch', category: 'food', xp: 40, icon: '🥗' },
      { id: 't3', name: 'Unplug devices not in use', category: 'energy', xp: 30, icon: '🔌' },
      { id: 't4', name: 'Take a shorter shower (under 5 min)', category: 'water', xp: 30, icon: '🚿' },
      { id: 't5', name: 'Bring a reusable bag shopping', category: 'waste', xp: 25, icon: '♻️' },
      { id: 't6', name: 'Use public transport for one trip', category: 'transport', xp: 45, icon: '🚌' },
      { id: 't7', name: 'Cook a meal from local ingredients', category: 'food', xp: 35, icon: '🌽' },
      { id: 't8', name: 'Turn off lights in empty rooms', category: 'energy', xp: 20, icon: '💡' },
      { id: 't9', name: 'Carry a reusable water bottle', category: 'waste', xp: 25, icon: '🍶' },
      { id: 't10', name: 'Log your carbon activities', category: 'general', xp: 30, icon: '📊' },
      { id: 't11', name: 'Share an eco tip with a friend', category: 'general', xp: 35, icon: '💚' },
      { id: 't12', name: 'Use natural light instead of lamps', category: 'energy', xp: 20, icon: '☀️' },
      { id: 't13', name: 'Air-dry your laundry', category: 'energy', xp: 40, icon: '👕' },
      { id: 't14', name: 'Pack a zero-waste lunch', category: 'waste', xp: 35, icon: '🍱' },
      { id: 't15', name: 'Drink water instead of bottled beverages', category: 'food', xp: 20, icon: '💧' },
      { id: 't16', name: 'Research a sustainable product swap', category: 'shopping', xp: 25, icon: '🔍' },
      { id: 't17', name: 'Walk 10,000 steps today', category: 'transport', xp: 40, icon: '🚶' },
      { id: 't18', name: 'Use a fan instead of AC for an hour', category: 'energy', xp: 35, icon: '🌀' },
      { id: 't19', name: 'Sort and recycle properly', category: 'waste', xp: 30, icon: '🗑️' },
      { id: 't20', name: 'Have a meat-free dinner', category: 'food', xp: 40, icon: '🥦' }
    ];

    // Select 4-5 random tasks, trying to cover different categories
    const categories = ['transport', 'food', 'energy', 'waste', 'general'];
    const selectedTasks = [];
    const usedCategories = new Set();

    // First, one from each category
    categories.forEach(cat => {
      const catTasks = allTasks.filter(t => t.category === cat && !selectedTasks.includes(t));
      if (catTasks.length > 0) {
        const task = catTasks[Math.floor(Math.random() * catTasks.length)];
        selectedTasks.push({ ...task, completed: false });
        usedCategories.add(cat);
      }
    });

    // Limit to 5
    return selectedTasks.slice(0, 5);
  }

  /* ── Generate Weekly Challenge ── */
  function generateWeeklyChallenge(userHistory) {
    const challenges = EcoData.challenges;
    const availableChallenges = challenges.filter(c => c.progress === 0);
    return availableChallenges[Math.floor(Math.random() * availableChallenges.length)] || challenges[0];
  }

  /* ── Predict Future Emissions ── */
  function predictFutureEmissions(history) {
    // Simple linear prediction based on trend
    if (!history || history.length < 3) {
      return Array.from({ length: 6 }, (_, i) => ({
        month: `Month ${i + 1}`,
        predicted: 350 - (i * 15) + (Math.random() * 20 - 10),
        target: 208 // 2500 kg/year / 12
      }));
    }

    const recentTrend = history.slice(-6);
    const avgChange = recentTrend.reduce((sum, v, i, arr) => {
      if (i === 0) return 0;
      return sum + (v - arr[i - 1]);
    }, 0) / (recentTrend.length - 1);

    const lastValue = history[history.length - 1];
    return Array.from({ length: 6 }, (_, i) => ({
      month: `Month ${i + 1}`,
      predicted: Math.max(0, lastValue + avgChange * (i + 1) + (Math.random() * 10 - 5)),
      target: 208
    }));
  }

  /* ── Detect Wasteful Habits ── */
  function detectWastefulHabits(activities) {
    const habits = [];

    if (activities.transport) {
      const carTrips = activities.transport.filter(t =>
        t.mode === 'car_petrol' || t.mode === 'car_diesel'
      );
      const shortCarTrips = carTrips.filter(t => t.distanceKm < 5);
      if (shortCarTrips.length > 0) {
        habits.push({
          category: 'transport',
          icon: '🚗',
          habit: 'Short Car Trips',
          description: `You made ${shortCarTrips.length} car trip(s) under 5 km. These could be walked or biked!`,
          savingPotential: shortCarTrips.reduce((s, t) => s + t.distanceKm * 0.21, 0).toFixed(1) + ' kg CO₂',
          severity: 'high'
        });
      }
    }

    if (activities.food) {
      const meatMeals = activities.food.filter(f => ['beef', 'lamb', 'pork'].includes(f.type));
      if (meatMeals.length > 4) {
        habits.push({
          category: 'food',
          icon: '🥩',
          habit: 'High Meat Consumption',
          description: `You consumed red meat ${meatMeals.length} times this week. Try replacing some with plant-based options.`,
          savingPotential: (meatMeals.reduce((s, m) => s + m.kg * 20, 0)).toFixed(1) + ' kg CO₂',
          severity: 'high'
        });
      }
    }

    if (activities.electricity && activities.electricity.kwh > 15) {
      habits.push({
        category: 'energy',
        icon: '⚡',
        habit: 'High Electricity Usage',
        description: 'Your daily electricity usage is above average. Check for vampire loads and inefficient appliances.',
        savingPotential: (activities.electricity.kwh * 0.42 * 0.2).toFixed(1) + ' kg CO₂',
        severity: 'medium'
      });
    }

    return habits;
  }

  /* ── Generate Sustainability Roadmap ── */
  function generateSustainabilityRoadmap(currentAnnual, targetAnnual) {
    const reduction = currentAnnual - targetAnnual;
    const milestones = [];

    if (reduction <= 0) {
      milestones.push({
        month: 0,
        title: 'Already at Target! 🎉',
        description: 'You\'re already below your target. Keep up the great work!',
        target: targetAnnual,
        actions: ['Maintain current habits', 'Help others reduce their footprint']
      });
      return milestones;
    }

    const steps = [
      { month: 1, title: 'Quick Wins', percent: 10, actions: ['Switch to LED bulbs', 'Start recycling', 'Reduce shower time'] },
      { month: 2, title: 'Transport Shift', percent: 25, actions: ['Bike/walk for short trips', 'Use public transit twice a week', 'Start carpooling'] },
      { month: 3, title: 'Food Transformation', percent: 40, actions: ['2 meatless days per week', 'Buy local produce', 'Reduce food waste by 30%'] },
      { month: 4, title: 'Energy Optimization', percent: 55, actions: ['Smart thermostat setup', 'Unplug idle electronics', 'Switch to green energy'] },
      { month: 6, title: 'Lifestyle Changes', percent: 70, actions: ['Secondhand shopping', 'Minimize flights', 'Start composting'] },
      { month: 9, title: 'Advanced Steps', percent: 85, actions: ['Home insulation upgrade', 'Consider EV', 'Full zero-waste kitchen'] },
      { month: 12, title: 'Target Achieved! 🎯', percent: 100, actions: ['Carbon neutral lifestyle', 'Offset remaining emissions', 'Mentor others'] }
    ];

    steps.forEach(step => {
      milestones.push({
        month: step.month,
        title: step.title,
        description: `Reduce emissions by ${step.percent}% (${(reduction * step.percent / 100).toFixed(0)} kg CO₂)`,
        target: currentAnnual - (reduction * step.percent / 100),
        actions: step.actions
      });
    });

    return milestones;
  }

  /* ── Get Random Tip ── */
  function getRandomTip(category = null) {
    let filtered = tips;
    if (category) {
      filtered = tips.filter(t => t.category === category);
    }
    return filtered[Math.floor(Math.random() * filtered.length)];
  }

  /**
   * Public API for the AI Sustainability Coach (CarbonGPT).
   */
  return {
    /**
     * Processes a user chat message and returns a contextual response.
     * @param {string} message - The user's input message.
     * @returns {{topic: string, response: string, suggestedFollowups: string[]}} The coach's response.
     */
    processChat,
    /**
     * Generates priority-sorted carbon reduction recommendations based on user emissions.
     * @param {Object} userProfile - The user's preferences and profile.
     * @param {Object} emissions - The calculated emissions breakdown.
     * @returns {Array<Object>} List of recommendation objects.
     */
    generateRecommendations,
    /**
     * Generates a list of 5 randomized daily tasks covering different categories.
     * @param {Object} userProfile - The user's profile.
     * @returns {Array<Object>} List of daily task objects.
     */
    generateDailyTasks,
    /**
     * Selects a weekly challenge for the user.
     * @param {Array<Object>} userHistory - The user's historical records.
     * @returns {Object} Challenge object.
     */
    generateWeeklyChallenge,
    /**
     * Simulates future emissions forecast points.
     * @param {Array<number>} history - The user's monthly emissions history.
     * @returns {Array<Object>} Forecast data points.
     */
    predictFutureEmissions,
    /**
     * Detects wasteful user habits based on log activity.
     * @param {Object} activities - User logged activities.
     * @returns {Array<Object>} Detected wasteful habit objects.
     */
    detectWastefulHabits,
    /**
     * Creates a milestones roadmap to reach target emissions reduction.
     * @param {number} currentAnnual - Current annual emissions in kg CO2.
     * @param {number} targetAnnual - Target annual emissions in kg CO2.
     * @returns {Array<Object>} Milestone steps.
     */
    generateSustainabilityRoadmap,
    /**
     * Retrieves a random tip, optionally filtered by category.
     * @param {string|null} [category=null] - The tip category.
     * @returns {Object} Tip object.
     */
    getRandomTip,
    /**
     * Helper to detect the topic of a user message.
     * @param {string} message - User message.
     * @returns {string} Detected topic name.
     */
    detectTopic,
    /**
     * Retrieves suggested follow-up questions for a topic.
     * @param {string} topic - Topic name.
     * @returns {Array<string>} List of follow-up questions.
     */
    getSuggestedFollowups
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AICoach;
}

