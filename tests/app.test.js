// Mock window location hash and scrollTo
delete window.location;
window.location = { hash: '' };
window.scrollTo = jest.fn();

// Mock global modules
if (typeof EcoData === 'undefined') {
  global.EcoData = require('../js/data.js');
}
if (typeof CarbonCalculator === 'undefined') {
  global.CarbonCalculator = require('../js/carbon-calculator.js');
}
if (typeof Gamification === 'undefined') {
  global.Gamification = require('../js/gamification.js');
}
if (typeof AICoach === 'undefined') {
  global.AICoach = require('../js/ai-coach.js');
}
if (typeof Community === 'undefined') {
  global.Community = require('../js/community.js');
}
if (typeof EcoCharts === 'undefined') {
  global.EcoCharts = require('../js/charts.js');
}
if (typeof Simulator === 'undefined') {
  global.Simulator = require('../js/simulator.js');
}

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve([])
  })
);

// Require app.js
const App = require('../js/app.js');

describe('App Controller (SPA Router & Core Flows)', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    jest.spyOn(Storage.prototype, 'setItem');
    document.body.innerHTML = `
      <div id="app"></div>
      <div id="toast-container"></div>
      <div id="modal-overlay"></div>
      <div class="sidebar"></div>
      <div class="sidebar-overlay"></div>
    `;
    window.location.hash = '';
  });

  test('should initialize and load landing page by default', () => {
    App.init();
    expect(document.getElementById('page-container-landing')).not.toBeNull();
  });

  test('should navigate to login page', () => {
    App.init();
    App.navigate('login');
    // Manually trigger route handler as hashchange event is simulated
    window.location.hash = '#login';
    // Trigger route logic manually since hashchange listener in JSDOM environment does not always dispatch automatically
    App.init();
    expect(document.getElementById('page-container-login')).not.toBeNull();
  });

  test('should show toast notifications', () => {
    App.init();
    App.showToast('Test Message', 'success', 'Test Title');
    const toastContainer = document.getElementById('toast-container');
    expect(toastContainer.innerHTML).toContain('Test Message');
    expect(toastContainer.innerHTML).toContain('Test Title');
  });

  test('should handle user registration and login redirection', () => {
    App.init();
    
    // Set up registration form inputs in DOM
    const appEl = document.getElementById('app');
    App.navigate('register');
    App.init();
    
    document.getElementById('app').innerHTML = `
      <input id="reg-name" value="Jane Doe">
      <input id="reg-email" value="jane@example.com">
      <input id="reg-password" value="password123">
    `;

    // Trigger register handler
    App.handleRegister();
    expect(Storage.prototype.setItem).toHaveBeenCalled();
  });

  test('should handle quick log actions', () => {
    App.init();
    App.quickLog('transport');
    const modal = document.querySelector('.modal');
    expect(modal).not.toBeNull();
  });
});
