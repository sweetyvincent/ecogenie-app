// @ts-check
/* ============================================================
   EcoGenie — Community Module
   Social feed, groups, challenges, interactions
   ============================================================ */

const Community = (() => {
  const STORAGE_KEY = 'ecogenie_community';

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      likedPosts: [],
      joinedGroups: [],
      joinedChallenges: []
    };
  }

  function saveState(st) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(st)); } catch (e) {}
  }

  let communityState = loadState();

  /* ── Render Community Feed ── */
  function renderCommunityFeed(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const posts = EcoData.communityPosts;

    container.innerHTML = posts.map(post => {
      const isLiked = communityState.likedPosts.includes(post.id);
      const likeCount = isLiked ? post.likes + 1 : post.likes;

      return `
        <div class="glass-card post-card no-hover" data-post-id="${post.id}">
          <div class="post-header">
            <div class="post-avatar">${post.avatar}</div>
            <div class="flex-1">
              <div class="post-author">${post.author}
                <span class="badge badge-primary ml-auto" style="margin-left:8px;">${post.badge}</span>
              </div>
              <div class="post-time">${post.time}</div>
            </div>
          </div>
          <div class="post-content">${post.content}</div>
          <div class="post-actions">
            <div class="post-action ${isLiked ? 'liked' : ''}" onclick="Community.likePost(${post.id})" data-post-action="like">
              <svg viewBox="0 0 24 24" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              <span>${likeCount}</span>
            </div>
            <div class="post-action" onclick="Community.commentPost(${post.id})">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span>${post.comments}</span>
            </div>
            <div class="post-action" onclick="Community.sharePost(${post.id})">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              <span>Share</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  /* ── Like Post ── */
  function likePost(postId) {
    const idx = communityState.likedPosts.indexOf(postId);
    if (idx > -1) {
      communityState.likedPosts.splice(idx, 1);
    } else {
      communityState.likedPosts.push(postId);
      Gamification.addPoints(5, 'Liked a post');
    }
    saveState(communityState);

    // Re-render the post's like button with animation
    const postCard = document.querySelector(`[data-post-id="${postId}"]`);
    if (postCard) {
      const likeBtn = postCard.querySelector('[data-post-action="like"]');
      if (likeBtn) {
        likeBtn.style.transform = 'scale(1.3)';
        setTimeout(() => { likeBtn.style.transform = 'scale(1)'; }, 200);
      }
    }

    // Re-render feed
    const feedContainer = document.getElementById('community-feed');
    if (feedContainer) renderCommunityFeed('community-feed');
  }

  /* ── Comment Post ── */
  function commentPost(postId) {
    if (typeof App !== 'undefined' && App.showToast) {
      App.showToast('Comments coming soon!', 'info', 'Feature Preview');
    }
  }

  /* ── Share Post ── */
  function sharePost(postId) {
    Gamification.trackShare();
    if (typeof App !== 'undefined' && App.showToast) {
      App.showToast('Post shared to your feed! +5 XP', 'success', 'Shared!');
    }
    Gamification.addPoints(5, 'Shared a post');
  }

  /* ── Share Achievement ── */
  function shareAchievement(achievement) {
    Gamification.trackShare();
    if (typeof App !== 'undefined' && App.showToast) {
      App.showToast(`Achievement "${achievement.name}" shared! +10 XP`, 'success', 'Achievement Shared!');
    }
    Gamification.addPoints(10, 'Shared achievement');
  }

  /* ── Render Groups ── */
  function renderGroups(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const groups = EcoData.groups;

    container.innerHTML = groups.map(group => {
      const isJoined = communityState.joinedGroups.includes(group.id);
      return `
        <div class="glass-card group-card">
          <div class="group-icon">${group.icon}</div>
          <div class="group-name">${group.name}</div>
          <p class="fs-sm text-muted mb-md">${group.description}</p>
          <div class="group-members">${group.members.toLocaleString()} members</div>
          <button class="btn ${isJoined ? 'btn-secondary' : 'btn-primary'} btn-sm btn-block"
            onclick="Community.toggleGroup('${group.id}')">
            ${isJoined ? '✓ Joined' : 'Join Group'}
          </button>
        </div>
      `;
    }).join('');
  }

  /* ── Toggle Group ── */
  function toggleGroup(groupId) {
    const idx = communityState.joinedGroups.indexOf(groupId);
    if (idx > -1) {
      communityState.joinedGroups.splice(idx, 1);
    } else {
      communityState.joinedGroups.push(groupId);
      Gamification.addPoints(20, 'Joined a group');
      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast('Joined group! +20 XP', 'success', 'Welcome!');
      }
    }
    saveState(communityState);
    renderGroups('community-groups');
  }

  /* ── Render Challenges ── */
  function renderChallenges(containerId, limit = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let challenges = EcoData.challenges;
    if (limit) challenges = challenges.slice(0, limit);

    container.innerHTML = challenges.map(ch => {
      const isJoined = communityState.joinedChallenges.includes(ch.id);
      const progress = isJoined ? Math.min(Math.floor(Math.random() * ch.target), ch.target) : 0;
      const progressPct = (progress / ch.target) * 100;

      const difficultyColor = {
        'Easy': 'badge-success',
        'Medium': 'badge-warning',
        'Hard': 'badge-error',
        'Expert': 'badge-info'
      }[ch.difficulty] || 'badge-primary';

      return `
        <div class="glass-card challenge-card">
          <span class="badge ${difficultyColor} challenge-badge">${ch.difficulty}</span>
          <div class="challenge-icon">${ch.icon}</div>
          <h4>${ch.title}</h4>
          <p class="challenge-desc">${ch.description}</p>
          <div class="challenge-progress">
            <div class="progress-info">
              <span class="progress-label">${isJoined ? `${progress}/${ch.target} days` : 'Not started'}</span>
              <span class="progress-value">${isJoined ? progressPct.toFixed(0) + '%' : ''}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width:${isJoined ? progressPct : 0}%"></div>
            </div>
          </div>
          <div class="challenge-meta">
            <span>👥 ${ch.participants.toLocaleString()} joined</span>
            <span class="challenge-reward">🏆 ${ch.reward} pts</span>
          </div>
          <button class="btn ${isJoined ? 'btn-secondary' : 'btn-primary'} btn-sm btn-block mt-md"
            onclick="Community.toggleChallenge('${ch.id}')">
            ${isJoined ? '✓ Joined' : 'Join Challenge'}
          </button>
        </div>
      `;
    }).join('');
  }

  /* ── Toggle Challenge ── */
  function toggleChallenge(challengeId) {
    const idx = communityState.joinedChallenges.indexOf(challengeId);
    if (idx > -1) {
      communityState.joinedChallenges.splice(idx, 1);
    } else {
      communityState.joinedChallenges.push(challengeId);
      Gamification.addPoints(30, 'Joined a challenge');
      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast('Challenge accepted! +30 XP 🎯', 'success', 'Let\'s Go!');
      }
    }
    saveState(communityState);
    const chContainer = document.getElementById('challenges-grid');
    if (chContainer) renderChallenges('challenges-grid');
    const chPage = document.getElementById('challenges-page-grid');
    if (chPage) renderChallenges('challenges-page-grid');
  }

  /* ── Render Competitions ── */
  function renderCompetitions(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const competitions = [
      { title: '🏆 Weekly Carbon Reduction', description: 'Reduce the most carbon this week', prize: '2000 pts', endDate: 'Ends in 3 days', participants: 456 },
      { title: '🚲 Bike-tober Challenge', description: 'Most km cycled this month', prize: '5000 pts', endDate: 'Ends in 12 days', participants: 789 },
      { title: '🥗 Plant Power Month', description: 'Most plant-based meals logged', prize: '3000 pts', endDate: 'Ends in 18 days', participants: 1234 }
    ];

    container.innerHTML = competitions.map(comp => `
      <div class="glass-card p-lg mb-md">
        <div class="d-flex justify-between items-center mb-md">
          <h4>${comp.title}</h4>
          <span class="badge badge-warning">${comp.prize}</span>
        </div>
        <p class="fs-sm text-muted mb-md">${comp.description}</p>
        <div class="d-flex justify-between items-center text-muted fs-sm">
          <span>👥 ${comp.participants} competing</span>
          <span>⏳ ${comp.endDate}</span>
        </div>
      </div>
    `).join('');
  }

  return {
    renderCommunityFeed,
    renderGroups,
    renderChallenges,
    renderCompetitions,
    likePost,
    commentPost,
    sharePost,
    shareAchievement,
    toggleGroup,
    toggleChallenge
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Community;
}
