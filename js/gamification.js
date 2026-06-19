// @ts-check
/* ============================================================
   EcoGenie — Gamification System
   Points, levels, streaks, achievements, XP, leaderboard
   ============================================================ */

const Gamification = (() => {
  const STORAGE_KEY = 'ecogenie_gamification';

  /* ── Default State ── */
  function getDefaultState() {
    return {
      points: 0,
      xp: 0,
      level: 1,
      streak: 0,
      lastLogDate: null,
      totalLogs: 0,
      achievements: EcoData.achievements.map(a => ({ ...a })),
      completedChallenges: 0,
      greenTransportCount: 0,
      plantMeals: 0,
      shares: 0,
      chats: 0,
      simulations: 0,
      analyticsViews: 0
    };
  }

  /* ── Load/Save State ── */
  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with defaults to handle new fields
        return { ...getDefaultState(), ...parsed };
      }
    } catch (e) {
      console.warn('Failed to load gamification state:', e);
    }
    return getDefaultState();
  }

  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save gamification state:', e);
    }
  }

  let state = loadState();

  /* ── Level System ── */
  function getLevel(xp) {
    let level = 1;
    let totalXpNeeded = 0;
    while (level < 50) {
      const xpForNext = EcoData.xpPerLevel(level);
      if (xp < totalXpNeeded + xpForNext) break;
      totalXpNeeded += xpForNext;
      level++;
    }
    return level;
  }

  function getLevelProgress(xp) {
    let level = 1;
    let totalXpSpent = 0;
    while (level < 50) {
      const xpForNext = EcoData.xpPerLevel(level);
      if (xp < totalXpSpent + xpForNext) {
        return {
          level,
          currentXp: xp - totalXpSpent,
          xpForNext,
          progress: ((xp - totalXpSpent) / xpForNext) * 100
        };
      }
      totalXpSpent += xpForNext;
      level++;
    }
    return { level: 50, currentXp: 0, xpForNext: 0, progress: 100 };
  }

  function getLevelTitle(level) {
    return EcoData.levelTitles[level] || 'Eco Transcendent';
  }

  /* ── Points ── */
  function addPoints(amount, reason = '') {
    state.points += amount;
    state.xp += amount;
    const newLevel = getLevel(state.xp);
    const leveledUp = newLevel > state.level;
    state.level = newLevel;
    saveState(state);

    return {
      pointsEarned: amount,
      totalPoints: state.points,
      totalXp: state.xp,
      level: state.level,
      leveledUp,
      levelTitle: getLevelTitle(state.level),
      reason
    };
  }

  /* ── Streak ── */
  function updateStreak() {
    const today = new Date().toDateString();
    const lastLog = state.lastLogDate;

    if (lastLog === today) {
      return state.streak; // Already logged today
    }

    if (lastLog) {
      const lastDate = new Date(lastLog);
      const todayDate = new Date(today);
      const diffDays = Math.round((todayDate - lastDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        state.streak += 1; // Continue streak
      } else if (diffDays > 1) {
        state.streak = 1; // Reset streak
      }
    } else {
      state.streak = 1; // First log
    }

    state.lastLogDate = today;
    state.totalLogs += 1;
    saveState(state);
    return state.streak;
  }

  /* ── Log Activity ── */
  function logActivity(type = 'general') {
    updateStreak();

    let xpEarned = 30; // Base XP for logging

    // Bonus for green activities
    if (['bicycle', 'walking', 'train', 'metro', 'bus'].includes(type)) {
      state.greenTransportCount += 1;
      xpEarned += 20;
    }

    if (['legumes', 'vegetables', 'fruits', 'tofu'].includes(type)) {
      state.plantMeals += 1;
      xpEarned += 15;
    }

    const result = addPoints(xpEarned, `Logged ${type} activity`);
    checkAchievements();
    return result;
  }

  /* ── Check Achievements ── */
  function checkAchievements() {
    const newlyUnlocked = [];

    state.achievements.forEach(a => {
      if (a.unlocked) return;

      let unlock = false;
      switch (a.id) {
        case 'first_log': unlock = state.totalLogs >= 1; break;
        case 'week_streak': unlock = state.streak >= 7; break;
        case 'month_streak': unlock = state.streak >= 30; break;
        case 'hundred_days': unlock = state.streak >= 100; break;
        case 'green_commuter': unlock = state.greenTransportCount >= 5; break;
        case 'plant_power': unlock = state.plantMeals >= 10; break;
        case 'social_butterfly': unlock = state.shares >= 5; break;
        case 'challenge_champ': unlock = state.completedChallenges >= 3; break;
        case 'first_challenge': unlock = state.completedChallenges >= 1; break;
        case 'level_10': unlock = state.level >= 10; break;
        case 'level_25': unlock = state.level >= 25; break;
        case 'gpt_chat': unlock = state.chats >= 10; break;
        case 'simulator_pro': unlock = state.simulations >= 10; break;
        case 'data_nerd': unlock = state.analyticsViews >= 20; break;
        default: break;
      }

      if (unlock) {
        a.unlocked = true;
        addPoints(a.xp, `Achievement: ${a.name}`);
        newlyUnlocked.push(a);
      }
    });

    saveState(state);
    return newlyUnlocked;
  }

  /* ── Track Actions ── */
  function trackChat() { state.chats += 1; saveState(state); checkAchievements(); }
  function trackShare() { state.shares += 1; saveState(state); checkAchievements(); }
  function trackSimulation() { state.simulations += 1; saveState(state); checkAchievements(); }
  function trackAnalyticsView() { state.analyticsViews += 1; saveState(state); checkAchievements(); }
  function trackChallengeComplete() { state.completedChallenges += 1; saveState(state); checkAchievements(); }

  /* ── Render Achievement Cards ── */
  function renderAchievements(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const unlockedFirst = [...state.achievements].sort((a, b) => {
      if (a.unlocked && !b.unlocked) return -1;
      if (!a.unlocked && b.unlocked) return 1;
      return 0;
    });

    container.innerHTML = unlockedFirst.map(a => `
      <div class="glass-card achievement-card ${a.unlocked ? '' : 'locked'}">
        ${!a.unlocked ? '' : '<div class="shimmer-effect"></div>'}
        <div class="achievement-icon">${a.icon}</div>
        <div class="achievement-name">${a.name}</div>
        <div class="achievement-desc">${a.description}</div>
        ${a.unlocked ? `<div class="badge badge-success mt-sm">+${a.xp} XP</div>` : '<div class="badge badge-primary mt-sm">🔒 Locked</div>'}
      </div>
    `).join('');
  }

  /* ── Render Leaderboard ── */
  function renderLeaderboard(containerId, limit = 10) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const leaders = EcoData.leaderboard.slice(0, limit);

    // Add current user
    const userEntry = {
      rank: Math.min(leaders.length + 1, 15),
      name: 'You',
      avatar: '🌟',
      points: state.points,
      level: state.level,
      title: getLevelTitle(state.level),
      streak: state.streak,
      isUser: true
    };

    // Insert user at appropriate position
    let allEntries = [...leaders];
    let userInserted = false;
    for (let i = 0; i < allEntries.length; i++) {
      if (state.points > allEntries[i].points) {
        allEntries.splice(i, 0, userEntry);
        userInserted = true;
        break;
      }
    }
    if (!userInserted) allEntries.push(userEntry);

    // Update ranks
    allEntries.forEach((e, i) => e.rank = i + 1);
    allEntries = allEntries.slice(0, limit);

    container.innerHTML = allEntries.map(entry => {
      const topClass = entry.rank === 1 ? 'top-1' : entry.rank === 2 ? 'top-2' : entry.rank === 3 ? 'top-3' : '';
      const medal = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank;
      return `
        <div class="leaderboard-item ${topClass} ${entry.isUser ? 'accent-border' : ''}" style="${entry.isUser ? 'border: 1px solid var(--primary); background: rgba(13,148,136,0.1);' : ''}">
          <div class="leaderboard-rank">${medal}</div>
          <div class="leaderboard-avatar">${entry.isUser ? '🌟' : entry.avatar}</div>
          <div class="leaderboard-info">
            <div class="leaderboard-name">${entry.name} ${entry.isUser ? '(You)' : ''}</div>
            <div class="leaderboard-score">Level ${entry.level} · ${entry.title}</div>
          </div>
          <div class="leaderboard-points">${entry.points.toLocaleString()} pts</div>
        </div>
      `;
    }).join('');
  }

  /* ── Get State ── */
  function getState() {
    return { ...state };
  }

  /* ── Reset ── */
  function reset() {
    state = getDefaultState();
    saveState(state);
  }

  /* ── Set State ── */
  function setState(newState) {
    state = { ...state, ...newState };
    saveState(state);
  }

  /* ── Render Level Badge ── */
  function renderLevelBadge() {
    const progress = getLevelProgress(state.xp);
    const title = getLevelTitle(state.level);
    return `
      <div class="d-flex items-center gap-md">
        <div style="width:48px;height:48px;border-radius:50%;background:var(--gradient-primary);display:flex;align-items:center;justify-content:center;font-size:1.3rem;font-weight:800;color:white;">${state.level}</div>
        <div class="flex-1">
          <div class="fw-600 fs-sm">${title}</div>
          <div class="progress-bar sm mt-xs">
            <div class="progress-fill" style="width:${progress.progress}%"></div>
          </div>
          <div class="fs-xs text-muted mt-xs">${progress.currentXp} / ${progress.xpForNext} XP</div>
        </div>
      </div>
    `;
  }

  /**
   * Public API for the Gamification System.
   */
  return {
    /**
     * Loads the gamification state from localStorage.
     * @returns {Object} Loaded state.
     */
    loadState,
    /**
     * Adds points and XP to the user state, handling level ups.
     * @param {number} amount - XP/Points to add.
     * @param {string} [reason=''] - Logged reason.
     * @returns {Object} Updated level/points result.
     */
    addPoints,
    /**
     * Updates daily login streak information.
     * @returns {number} The current streak count.
     */
    updateStreak,
    /**
     * Logs a carbon action, awarding XP and checking achievements.
     * @param {string} [type='general'] - Type of activity logged.
     * @returns {Object} Points addition result.
     */
    logActivity,
    /**
     * Scans and unlocks newly completed achievements.
     * @returns {Array<Object>} List of newly unlocked achievement badges.
     */
    checkAchievements,
    /**
     * Tracks a chat with the AI coach.
     */
    trackChat,
    /**
     * Tracks sharing an activity.
     */
    trackShare,
    /**
     * Tracks running a simulation.
     */
    trackSimulation,
    /**
     * Tracks viewing the analytics tab.
     */
    trackAnalyticsView,
    /**
     * Tracks completing a challenge.
     */
    trackChallengeComplete,
    /**
     * Renders achievements HTML grid.
     * @returns {string} Achievements HTML.
     */
    renderAchievements,
    /**
     * Renders leaderboard HTML table.
     * @returns {string} Leaderboard HTML.
     */
    renderLeaderboard,
    /**
     * Renders user level badge and progress bar.
     * @returns {string} Level badge HTML.
     */
    renderLevelBadge,
    /**
     * Calculates the level associated with given XP.
     * @param {number} xp - XP points.
     * @returns {number} The computed level (1-50).
     */
    getLevel,
    /**
     * Gets progress stats to reach the next level.
     * @param {number} xp - Current XP.
     * @returns {Object} Progress statistics.
     */
    getLevelProgress,
    /**
     * Returns the title corresponding to user level.
     * @param {number} level - User level.
     * @returns {string} Level title.
     */
    getLevelTitle,
    /**
     * Returns a copy of the current state.
     * @returns {Object} State copy.
     */
    getState,
    /**
     * Sets/updates the gamification state.
     * @param {Object} newState - New state fields to merge.
     */
    setState,
    /**
     * Resets the gamification state to default.
     */
    reset
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Gamification;
}

