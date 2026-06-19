if (typeof EcoData === 'undefined' && typeof require !== 'undefined') {
  global.EcoData = require('../js/data.js');
}

const AICoach = require('../js/ai-coach.js');

describe('AICoach Topic Detection', () => {
  test('should detect transport topic from car-related messages', () => {
    expect(AICoach.detectTopic('I drive a petrol car to work')).toBe('transport');
    expect(AICoach.detectTopic('commute by bike')).toBe('transport');
  });

  test('should detect food topic from diet-related messages', () => {
    expect(AICoach.detectTopic('I want to eat vegan beef chicken')).toBe('food');
    expect(AICoach.detectTopic('plant-based meals are great')).toBe('food');
  });

  test('should detect energy topic from electricity messages', () => {
    expect(AICoach.detectTopic('how much solar energy or electricity kwh do I use?')).toBe('energy');
  });

  test('should detect greetings for short hello messages', () => {
    expect(AICoach.detectTopic('hello')).toBe('greetings');
    expect(AICoach.detectTopic('hi')).toBe('greetings');
  });

  test('should return fallback for unrelated messages', () => {
    expect(AICoach.detectTopic('completely unrelated random sentence here')).toBe('fallback');
  });

  test('should score multi-word keywords higher', () => {
    expect(AICoach.detectTopic('electric car')).toBe('transport');
  });
});

describe('AICoach Chat Processing', () => {
  test('should return response with topic and suggestions', () => {
    const result = AICoach.processChat('tell me about driving a car');
    expect(result).toHaveProperty('topic', 'transport');
    expect(result).toHaveProperty('response');
    expect(result.suggestedFollowups.length).toBeGreaterThan(0);
  });

  test('should return suggested followups matching the topic', () => {
    const result = AICoach.processChat('I want to change my diet');
    expect(result.topic).toBe('food');
    expect(result.suggestedFollowups).toContain('What\'s the most eco-friendly diet?');
  });
});

describe('AICoach Recommendations', () => {
  test('should generate transport recommendations when transport emissions > 3', () => {
    const emissions = { breakdown: { transport: 4.0 } };
    const recs = AICoach.generateRecommendations({}, emissions);
    const transportRec = recs.find(r => r.category === 'transport');
    expect(transportRec).toBeDefined();
    expect(transportRec.priority).toBe('high');
  });

  test('should generate food recommendations when food emissions > 4', () => {
    const emissions = { breakdown: { food: 5.0 } };
    const recs = AICoach.generateRecommendations({}, emissions);
    const foodRec = recs.find(r => r.category === 'food');
    expect(foodRec).toBeDefined();
    expect(foodRec.priority).toBe('high');
  });

  test('should always include general tracking recommendation', () => {
    const recs = AICoach.generateRecommendations({}, { breakdown: {} });
    const generalRec = recs.find(r => r.category === 'general');
    expect(generalRec).toBeDefined();
  });

  test('should sort recommendations by priority (high first)', () => {
    const emissions = { breakdown: { transport: 4.0, water: 0.5 } };
    const recs = AICoach.generateRecommendations({}, emissions);
    const indexOfTransport = recs.findIndex(r => r.category === 'transport');
    const indexOfWater = recs.findIndex(r => r.category === 'water');
    expect(indexOfTransport).toBeLessThan(indexOfWater);
  });
});

describe('AICoach Daily Tasks', () => {
  test('should generate exactly 5 tasks', () => {
    const tasks = AICoach.generateDailyTasks({});
    expect(tasks.length).toBe(5);
  });

  test('should cover different categories', () => {
    const tasks = AICoach.generateDailyTasks({});
    const categories = tasks.map(t => t.category);
    const uniqueCategories = new Set(categories);
    expect(uniqueCategories.size).toBe(5);
  });

  test('should include task properties (id, name, xp, icon)', () => {
    const tasks = AICoach.generateDailyTasks({});
    tasks.forEach(t => {
      expect(t).toHaveProperty('id');
      expect(t).toHaveProperty('name');
      expect(t).toHaveProperty('xp');
      expect(t).toHaveProperty('icon');
      expect(t).toHaveProperty('completed', false);
    });
  });
});

describe('AICoach Wasteful Habits', () => {
  test('should detect short car trips under 5km', () => {
    const activities = {
      transport: [
        { mode: 'car_petrol', distanceKm: 3 }
      ]
    };
    const habits = AICoach.detectWastefulHabits(activities);
    const transportHabit = habits.find(h => h.category === 'transport');
    expect(transportHabit).toBeDefined();
    expect(transportHabit.habit).toBe('Short Car Trips');
  });

  test('should detect high meat consumption', () => {
    const activities = {
      food: [
        { type: 'beef', kg: 0.5 },
        { type: 'lamb', kg: 0.5 },
        { type: 'pork', kg: 0.5 },
        { type: 'beef', kg: 0.5 },
        { type: 'beef', kg: 0.5 }
      ]
    };
    const habits = AICoach.detectWastefulHabits(activities);
    const foodHabit = habits.find(h => h.category === 'food');
    expect(foodHabit).toBeDefined();
    expect(foodHabit.habit).toBe('High Meat Consumption');
  });

  test('should detect high electricity usage', () => {
    const activities = {
      electricity: { kwh: 20 }
    };
    const habits = AICoach.detectWastefulHabits(activities);
    const energyHabit = habits.find(h => h.category === 'energy');
    expect(energyHabit).toBeDefined();
    expect(energyHabit.habit).toBe('High Electricity Usage');
  });

  test('should return empty array when no wasteful habits', () => {
    const activities = {
      transport: [{ mode: 'bicycle', distanceKm: 10 }],
      food: [{ type: 'vegetables', kg: 1.0 }],
      electricity: { kwh: 8 }
    };
    const habits = AICoach.detectWastefulHabits(activities);
    expect(habits.length).toBe(0);
  });
});
