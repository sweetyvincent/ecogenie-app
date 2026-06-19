const localStorageMock = {
  store: {},
  getItem: jest.fn(key => localStorageMock.store[key] || null),
  setItem: jest.fn((key, val) => { localStorageMock.store[key] = val; }),
  removeItem: jest.fn(key => { delete localStorageMock.store[key]; }),
  clear: jest.fn(() => { localStorageMock.store = {}; })
};
global.localStorage = localStorageMock;

if (typeof EcoData === 'undefined' && typeof require !== 'undefined') {
  global.EcoData = require('../js/data.js');
}

let Gamification = require('../js/gamification.js');

describe('Gamification Level System', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.resetModules();
    Gamification = require('../js/gamification.js');
    Gamification.reset();
  });

  test('should start at level 1 with 0 XP', () => {
    const state = Gamification.getState();
    expect(state.level).toBe(1);
    expect(state.xp).toBe(0);
    expect(state.points).toBe(0);
  });

  test('should calculate correct level for given XP', () => {
    expect(Gamification.getLevel(0)).toBe(1);
    expect(Gamification.getLevel(99)).toBe(1);
    expect(Gamification.getLevel(100)).toBe(2);
    expect(Gamification.getLevel(215)).toBe(3);
  });

  test('should return level progress percentage', () => {
    const progress = Gamification.getLevelProgress(50);
    expect(progress.level).toBe(1);
    expect(progress.currentXp).toBe(50);
    expect(progress.xpForNext).toBe(100);
    expect(progress.progress).toBe(50);
  });

  test('should cap at level 50', () => {
    expect(Gamification.getLevel(10000000)).toBe(50);
  });

  test('should return correct level title', () => {
    expect(Gamification.getLevelTitle(1)).toBe('Eco Seed');
    expect(Gamification.getLevelTitle(2)).toBe('Eco Seed');
    expect(Gamification.getLevelTitle(3)).toBe('Eco Sprout');
  });
});

describe('Gamification Points', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.resetModules();
    Gamification = require('../js/gamification.js');
    Gamification.reset();
  });

  test('should add points and XP', () => {
    const res = Gamification.addPoints(50, 'Test reward');
    expect(res.pointsEarned).toBe(50);
    expect(res.totalPoints).toBe(50);
    expect(res.totalXp).toBe(50);
    expect(res.level).toBe(1);
    expect(res.leveledUp).toBe(false);
  });

  test('should detect level up', () => {
    const res = Gamification.addPoints(100, 'Test reward');
    expect(res.leveledUp).toBe(true);
    expect(res.level).toBe(2);
    expect(res.levelTitle).toBe('Eco Seed');
  });
});

describe('Gamification Streak', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.resetModules();
    Gamification = require('../js/gamification.js');
    Gamification.reset();
  });

  test('should start streak at 1 on first log', () => {
    const streak = Gamification.updateStreak();
    expect(streak).toBe(1);
  });

  test('should not increment on same day', () => {
    Gamification.updateStreak();
    const streak = Gamification.updateStreak();
    expect(streak).toBe(1);
  });

  test('should maintain streak on consecutive days', () => {
    // First log
    Gamification.updateStreak();
    
    // Stub today back to yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    Gamification.setState({ lastLogDate: yesterday.toDateString() });
    
    const streak = Gamification.updateStreak();
    expect(streak).toBe(2);
  });

  test('should reset streak after gap', () => {
    Gamification.updateStreak();
    
    // Stub last log to 3 days ago
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    Gamification.setState({ lastLogDate: threeDaysAgo.toDateString() });
    
    const streak = Gamification.updateStreak();
    expect(streak).toBe(1);
  });
});

describe('Gamification Achievements', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.resetModules();
    Gamification = require('../js/gamification.js');
    Gamification.reset();
  });

  test('should unlock first_log after first activity', () => {
    Gamification.logActivity('bicycle');
    const state = Gamification.getState();
    const achievement = state.achievements.find(a => a.id === 'first_log');
    expect(achievement.unlocked).toBe(true);
  });

  test('should not double-unlock achievements', () => {
    Gamification.logActivity('bicycle');
    
    // Call unlock check again, should not unlock/add points again
    const stateBefore = Gamification.getState();
    const newlyUnlocked = Gamification.checkAchievements();
    const stateAfter = Gamification.getState();
    
    expect(newlyUnlocked.length).toBe(0);
    expect(stateAfter.points).toBe(stateBefore.points);
  });
});
