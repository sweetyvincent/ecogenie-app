const localStorageMock = {
  store: {},
  getItem: jest.fn(key => localStorageMock.store[key] || null),
  setItem: jest.fn((key, val) => { localStorageMock.store[key] = val; }),
  removeItem: jest.fn(key => { delete localStorageMock.store[key]; }),
  clear: jest.fn(() => { localStorageMock.store = {}; })
};
global.localStorage = localStorageMock;

// Mock Gamification
global.Gamification = {
  addPoints: jest.fn(),
  trackShare: jest.fn()
};

// Mock App
global.App = {
  showToast: jest.fn()
};

if (typeof EcoData === 'undefined' && typeof require !== 'undefined') {
  global.EcoData = require('../js/data.js');
}

const Community = require('../js/community.js');

describe('Community Module', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    document.body.innerHTML = '';
  });

  test('should load default liked posts, joined groups, and challenges', () => {
    const feedContainer = document.createElement('div');
    feedContainer.id = 'community-feed';
    document.body.appendChild(feedContainer);
    
    Community.renderCommunityFeed('community-feed');
    expect(feedContainer.innerHTML).toContain('post-card');
  });

  test('should toggle liked post state and award points', () => {
    const postContainer = document.createElement('div');
    postContainer.id = 'community-feed';
    document.body.appendChild(postContainer);

    Community.renderCommunityFeed('community-feed');

    const firstPostId = EcoData.communityPosts[0].id;
    Community.likePost(firstPostId);

    expect(Gamification.addPoints).toHaveBeenCalledWith(5, 'Liked a post');
  });

  test('should trigger comment preview toast', () => {
    Community.commentPost(1);
    expect(App.showToast).toHaveBeenCalledWith('Comments coming soon!', 'info', 'Feature Preview');
  });

  test('should track share post and award points', () => {
    Community.sharePost(1);
    expect(Gamification.trackShare).toHaveBeenCalled();
    expect(Gamification.addPoints).toHaveBeenCalledWith(5, 'Shared a post');
    expect(App.showToast).toHaveBeenCalledWith('Post shared to your feed! +5 XP', 'success', 'Shared!');
  });

  test('should share achievement and award points', () => {
    Community.shareAchievement({ name: 'First Steps' });
    expect(Gamification.trackShare).toHaveBeenCalled();
    expect(Gamification.addPoints).toHaveBeenCalledWith(10, 'Shared achievement');
  });

  test('should toggle group joining status', () => {
    const groupContainer = document.createElement('div');
    groupContainer.id = 'community-groups';
    document.body.appendChild(groupContainer);

    Community.renderGroups('community-groups');

    const firstGroupId = EcoData.groups[0].id;
    Community.toggleGroup(firstGroupId);

    expect(Gamification.addPoints).toHaveBeenCalledWith(20, 'Joined a group');
    expect(App.showToast).toHaveBeenCalledWith('Joined group! +20 XP', 'success', 'Welcome!');
  });

  test('should toggle challenge accepting status', () => {
    const challengeContainer = document.createElement('div');
    challengeContainer.id = 'challenges-grid';
    document.body.appendChild(challengeContainer);

    Community.renderChallenges('challenges-grid');

    const firstChallengeId = EcoData.challenges[0].id;
    Community.toggleChallenge(firstChallengeId);

    expect(Gamification.addPoints).toHaveBeenCalledWith(30, 'Joined a challenge');
    expect(App.showToast).toHaveBeenCalledWith("Challenge accepted! +30 XP 🎯", "success", "Let's Go!");
  });
});
