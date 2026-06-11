/* ============================================================
   EcoGenie — Main Application Controller
   SPA Router, State Management, Page Rendering, UI Systems
   ============================================================ */

const App = (() => {
  const STORAGE_KEY = 'ecogenie_app';
  let currentPage = '';
  let chatHistory = [];
  let dailyTasks = [];

  /* ── Default User Profile ── */
  function getDefaultProfile() {
    return {
      name: '',
      email: '',
      isOnboarded: false,
      isLoggedIn: false,
      joinDate: new Date().toISOString(),
      preferences: {
        transportMode: 'car_petrol',
        dailyCommute: 10,
        dietType: 'mixed',
        homeSize: 'medium',
        electricityKwh: 10,
        waterLiters: 150,
        shoppingFrequency: 'moderate'
      },
      emissions: null,
      history: []
    };
  }

  /* ── State Management ── */
  let profile = loadProfile();

  function loadProfile() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return { ...getDefaultProfile(), ...JSON.parse(saved) };
    } catch (e) {}
    return getDefaultProfile();
  }

  function saveProfile() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(profile)); } catch (e) {}
  }

  /* ── Toast Notification System ── */
  function showToast(message, type = 'info', title = '') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = {
      success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
      error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
      warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <div class="toast-icon">${icons[type] || icons.info}</div>
      <div class="toast-content">
        ${title ? `<div class="toast-title">${title}</div>` : ''}
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" onclick="this.parentElement.classList.add('exit');setTimeout(()=>this.parentElement.remove(),300)">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('exit');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  /* ── Modal System ── */
  function showModal(title, content, actions = '') {
    const overlay = document.getElementById('modal-overlay');
    if (!overlay) return;

    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3>${title}</h3>
          <button class="modal-close" onclick="App.closeModal()">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-body">${content}</div>
        ${actions ? `<div class="modal-footer">${actions}</div>` : ''}
      </div>
    `;

    overlay.classList.add('active');
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
  }

  function closeModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.classList.remove('active');
  }

  /* ── SPA Router ── */
  function navigate(page) {
    window.location.hash = page;
  }

  function handleRoute() {
    const hash = window.location.hash.slice(1) || 'landing';
    renderPage(hash);
  }

  function renderPage(page) {
    const app = document.getElementById('app');
    if (!app) return;

    // Remove old page classes
    document.body.classList.remove('landing-active', 'auth-active');

    // Handle auth-protected pages
    if (!profile.isLoggedIn && !['landing', 'login', 'register'].includes(page)) {
      navigate('landing');
      return;
    }

    if (profile.isLoggedIn && !profile.isOnboarded && page !== 'onboarding') {
      navigate('onboarding');
      return;
    }

    currentPage = page;
    app.innerHTML = '';

    // Update nav active state
    document.querySelectorAll('.nav-item, .bottom-nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.page === page);
    });

    // Toggle sidebar/nav visibility
    if (['landing', 'login', 'register'].includes(page)) {
      document.body.classList.add(page === 'landing' ? 'landing-active' : 'auth-active');
    }

    const pageRenderers = {
      landing: renderLanding,
      login: renderLogin,
      register: renderRegister,
      onboarding: renderOnboarding,
      dashboard: renderDashboard,
      analytics: renderAnalytics,
      chat: renderChat,
      simulator: renderSimulator,
      challenges: renderChallenges,
      community: renderCommunity,
      rewards: renderRewards,
      settings: renderSettings
    };

    const renderer = pageRenderers[page];
    if (renderer) {
      renderer(app);
    } else {
      app.innerHTML = '<div class="page-container"><div class="empty-state"><div class="empty-icon">🔍</div><h3>Page Not Found</h3><p>The page you\'re looking for doesn\'t exist.</p></div></div>';
    }

    // Scroll to top
    window.scrollTo(0, 0);
  }

  /* ═══════════════════════════════
     PAGE RENDERERS
     ═══════════════════════════════ */

  /* ── Landing Page ── */
  function renderLanding(app) {
    app.innerHTML = `
      <div class="landing-page">
        <div class="landing-hero">
          <canvas class="particle-canvas" id="particle-canvas"></canvas>
          <div class="hero-content">
            <div class="hero-badge"><span class="dot"></span> AI-Powered Sustainability</div>
            <h1 class="hero-title">
              Reduce Your<br>
              <span class="gradient-text">Carbon Footprint</span>
            </h1>
            <p class="hero-description">
              Track, analyze, and reduce your environmental impact with AI-powered insights, gamified challenges, and a supportive community.
            </p>
            <div class="hero-actions">
              <button class="btn btn-primary btn-lg" onclick="App.navigate('register')">
                Get Started Free
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
              <button class="btn btn-secondary btn-lg" onclick="App.navigate('login')">Sign In</button>
            </div>
            <div class="hero-stats">
              <div class="hero-stat">
                <div class="stat-number counter" data-target="50000">50K+</div>
                <div class="stat-label">Active Users</div>
              </div>
              <div class="hero-stat">
                <div class="stat-number counter" data-target="2400000">2.4M</div>
                <div class="stat-label">kg CO₂ Saved</div>
              </div>
              <div class="hero-stat">
                <div class="stat-number counter" data-target="109000">109K</div>
                <div class="stat-label">Trees Equivalent</div>
              </div>
            </div>
          </div>
        </div>

        <div class="landing-features" id="features">
          <div class="section-header">
            <h2>Everything You Need to Go <span class="gradient-text">Green</span></h2>
            <p>Powerful tools to understand and reduce your environmental impact</p>
          </div>
          <div class="features-grid">
            <div class="glass-card feature-card">
              <div class="feature-icon"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="white" stroke-width="2"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg></div>
              <h3>Smart Tracking</h3>
              <p>Log activities and get instant carbon footprint calculations across all life categories.</p>
            </div>
            <div class="glass-card feature-card">
              <div class="feature-icon"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="white" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
              <h3>AI Coach</h3>
              <p>Chat with CarbonGPT for personalized tips, roadmaps, and sustainability guidance.</p>
            </div>
            <div class="glass-card feature-card">
              <div class="feature-icon"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="white" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>
              <h3>Gamified Experience</h3>
              <p>Earn points, unlock achievements, level up, and compete with others on the leaderboard.</p>
            </div>
            <div class="glass-card feature-card">
              <div class="feature-icon"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></div>
              <h3>Community</h3>
              <p>Join groups, share achievements, and participate in community challenges together.</p>
            </div>
            <div class="glass-card feature-card">
              <div class="feature-icon"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="white" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg></div>
              <h3>What-If Simulator</h3>
              <p>See the impact of lifestyle changes before making them with interactive comparisons.</p>
            </div>
            <div class="glass-card feature-card">
              <div class="feature-icon"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="white" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
              <h3>Impact Rewards</h3>
              <p>Redeem points for eco-products, plant real trees, and earn exclusive badges.</p>
            </div>
          </div>
        </div>

        <div class="landing-testimonials">
          <div class="section-header">
            <h2>Loved by <span class="gradient-text">Eco Warriors</span></h2>
            <p>Join thousands who are making a difference every day</p>
          </div>
          <div class="testimonials-grid">
            <div class="glass-card testimonial-card">
              <div class="stars">⭐⭐⭐⭐⭐</div>
              <div class="quote">"EcoGenie transformed my daily habits. I reduced my carbon footprint by 40% in just 3 months. The AI coach is like having a sustainability consultant in my pocket!"</div>
              <div class="author">
                <div class="author-avatar">AS</div>
                <div><div class="author-name">Anika Sharma</div><div class="author-role">Level 32 · Earth Guardian</div></div>
              </div>
            </div>
            <div class="glass-card testimonial-card">
              <div class="stars">⭐⭐⭐⭐⭐</div>
              <div class="quote">"The gamification makes it so addictive! I'm on a 65-day streak and competing with friends. Never thought saving the planet could be this fun."</div>
              <div class="author">
                <div class="author-avatar">MC</div>
                <div><div class="author-name">Marcus Chen</div><div class="author-role">Level 30 · Earth Guardian</div></div>
              </div>
            </div>
            <div class="glass-card testimonial-card">
              <div class="stars">⭐⭐⭐⭐⭐</div>
              <div class="quote">"The what-if simulator helped me realize that small changes in my diet have a massive impact. Data-driven sustainability is the way to go!"</div>
              <div class="author">
                <div class="author-avatar">PP</div>
                <div><div class="author-name">Priya Patel</div><div class="author-role">Level 29 · Climate Champion</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Initialize particle animation
    setTimeout(() => initParticles(), 100);
  }

  /* ── Particle Animation ── */
  function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const count = Math.min(60, Math.floor(window.innerWidth / 20));

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.1
      });
    }

    function animate() {
      if (currentPage !== 'landing') return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(13, 148, 136, ${p.opacity})`;
        ctx.fill();
      });

      // Draw connections
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach(b => {
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(13, 148, 136, ${0.1 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    }

    animate();
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  }

  /* ── Login Page ── */
  function renderLogin(app) {
    app.innerHTML = `
      <div class="auth-page">
        <div class="glass-card auth-card">
          <div class="text-center mb-lg">
            <div style="font-size:2rem;margin-bottom:8px;">🌍</div>
            <h2>Welcome Back</h2>
            <p class="auth-subtitle">Sign in to continue your eco journey</p>
          </div>
          <div class="social-login">
            <button class="social-btn">🌐 Continue with Google</button>
            <button class="social-btn">🍎 Continue with Apple</button>
          </div>
          <div class="divider">or</div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" class="form-input" id="login-email" placeholder="your@email.com" value="demo@ecogenie.app">
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" class="form-input" id="login-password" placeholder="••••••••" value="demo123">
          </div>
          <button class="btn btn-primary btn-block btn-lg" onclick="App.handleLogin()">Sign In</button>
          <div class="auth-footer">
            Don't have an account? <a href="#register">Sign Up</a>
          </div>
        </div>
      </div>
    `;
  }

  /* ── Register Page ── */
  function renderRegister(app) {
    app.innerHTML = `
      <div class="auth-page">
        <div class="glass-card auth-card">
          <div class="text-center mb-lg">
            <div style="font-size:2rem;margin-bottom:8px;">🌱</div>
            <h2>Join EcoGenie</h2>
            <p class="auth-subtitle">Start your sustainability journey today</p>
          </div>
          <div class="social-login">
            <button class="social-btn">🌐 Continue with Google</button>
            <button class="social-btn">🍎 Continue with Apple</button>
          </div>
          <div class="divider">or</div>
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" class="form-input" id="reg-name" placeholder="Your name">
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" class="form-input" id="reg-email" placeholder="your@email.com">
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" class="form-input" id="reg-password" placeholder="Create a password">
          </div>
          <button class="btn btn-primary btn-block btn-lg" onclick="App.handleRegister()">Create Account</button>
          <div class="auth-footer">
            Already have an account? <a href="#login">Sign In</a>
          </div>
        </div>
      </div>
    `;
  }

  function handleLogin() {
    profile.isLoggedIn = true;
    profile.name = profile.name || 'Eco Explorer';
    profile.email = document.getElementById('login-email')?.value || 'demo@ecogenie.app';
    saveProfile();
    showToast('Welcome back! 🌿', 'success', 'Login Successful');
    if (!profile.isOnboarded) {
      navigate('onboarding');
    } else {
      navigate('dashboard');
    }
    updateSidebarUser();
  }

  function handleRegister() {
    const name = document.getElementById('reg-name')?.value || 'Eco Explorer';
    const email = document.getElementById('reg-email')?.value || '';
    profile.isLoggedIn = true;
    profile.name = name;
    profile.email = email;
    saveProfile();
    showToast('Welcome to EcoGenie! 🌱', 'success', 'Account Created');
    navigate('onboarding');
    updateSidebarUser();
  }

  /* ── Onboarding ── */
  let onboardingStep = 1;

  function renderOnboarding(app) {
    onboardingStep = 1;
    renderOnboardingStep(app);
  }

  function renderOnboardingStep(app) {
    const steps = [
      {
        title: 'Welcome! Let\'s Get to Know You',
        description: 'Tell us a bit about yourself to personalize your experience.',
        content: `
          <div class="form-group">
            <label class="form-label">Your Name</label>
            <input type="text" class="form-input" id="ob-name" placeholder="Enter your name" value="${profile.name || ''}">
          </div>
          <div class="form-group">
            <label class="form-label">Where are you located?</label>
            <select class="form-input" id="ob-location">
              <option value="global">Global Average</option>
              <option value="us">United States</option>
              <option value="eu">European Union</option>
              <option value="india">India</option>
              <option value="china">China</option>
            </select>
          </div>
        `
      },
      {
        title: 'How Do You Get Around?',
        description: 'Your daily commute is often the biggest factor.',
        content: `
          <div class="option-grid" id="transport-options">
            ${['🚗 Car (Petrol)', '🚗 Car (Diesel)', '⚡ Electric Car', '🚌 Bus', '🚆 Train', '🚇 Metro', '🚲 Bicycle', '🚶 Walking', '🏍️ Motorcycle'].map((opt, i) =>
              `<div class="option-card" data-value="${['car_petrol','car_diesel','car_electric','bus','train','metro','bicycle','walking','motorcycle'][i]}" onclick="App.selectOption(this, 'transport-options')">
                <div class="option-icon">${opt.split(' ')[0]}</div>
                <div class="option-label">${opt.split(' ').slice(1).join(' ')}</div>
              </div>`
            ).join('')}
          </div>
          <div class="form-group mt-lg">
            <label class="form-label">Daily commute distance (km)</label>
            <input type="number" class="form-input" id="ob-commute" placeholder="e.g., 15" value="10">
          </div>
        `
      },
      {
        title: 'Your Home Energy',
        description: 'Let\'s understand your home energy usage.',
        content: `
          <div class="form-group">
            <label class="form-label">Daily electricity usage (kWh)</label>
            <input type="number" class="form-input" id="ob-electricity" placeholder="e.g., 10" value="10">
            <div class="form-helper">Average household: 8-12 kWh/day</div>
          </div>
          <div class="form-group">
            <label class="form-label">Daily water usage (liters)</label>
            <input type="number" class="form-input" id="ob-water" placeholder="e.g., 150" value="150">
            <div class="form-helper">Average person: 100-200 liters/day</div>
          </div>
          <div class="option-grid" id="energy-source">
            ${['☀️ Solar', '💨 Wind', '🔌 Grid (Mixed)', '🏭 Coal', '⚛️ Nuclear'].map((opt, i) =>
              `<div class="option-card ${i === 2 ? 'selected' : ''}" data-value="${['solar','wind','perKwh','coal','nuclear'][i]}" onclick="App.selectOption(this, 'energy-source')">
                <div class="option-icon">${opt.split(' ')[0]}</div>
                <div class="option-label">${opt.split(' ').slice(1).join(' ')}</div>
              </div>`
            ).join('')}
          </div>
        `
      },
      {
        title: 'Your Diet',
        description: 'Food choices have a surprisingly large impact on carbon emissions.',
        content: `
          <div class="option-grid" id="diet-options">
            ${['🥩 Meat Heavy', '🍖 Regular Meat', '🍗 Occasional Meat', '🐟 Pescatarian', '🥗 Vegetarian', '🌱 Vegan'].map((opt, i) =>
              `<div class="option-card" data-value="${['meat_heavy','regular','occasional','pescatarian','vegetarian','vegan'][i]}" onclick="App.selectOption(this, 'diet-options')">
                <div class="option-icon">${opt.split(' ')[0]}</div>
                <div class="option-label">${opt.split(' ').slice(1).join(' ')}</div>
              </div>`
            ).join('')}
          </div>
        `
      },
      {
        title: 'Shopping & Lifestyle',
        description: 'Almost done! Tell us about your shopping habits.',
        content: `
          <div class="option-grid" id="shopping-options">
            ${['🛍️ Frequent Shopper', '🛒 Moderate', '♻️ Minimal/Secondhand', '📦 Online Only'].map((opt, i) =>
              `<div class="option-card" data-value="${['frequent','moderate','minimal','online'][i]}" onclick="App.selectOption(this, 'shopping-options')">
                <div class="option-icon">${opt.split(' ')[0]}</div>
                <div class="option-label">${opt.split(' ').slice(1).join(' ')}</div>
              </div>`
            ).join('')}
          </div>
          <div class="form-group mt-lg">
            <label class="form-label">Waste management</label>
            <select class="form-input" id="ob-waste">
              <option value="landfill">Mostly landfill</option>
              <option value="recycled">I recycle regularly</option>
              <option value="composted">I recycle & compost</option>
            </select>
          </div>
        `
      }
    ];

    const step = steps[onboardingStep - 1];

    app.innerHTML = `
      <div class="onboarding-page">
        <div class="glass-card onboarding-card no-hover">
          <div class="stepper">
            ${steps.map((_, i) => `
              <div class="stepper-step">
                <div class="stepper-dot ${i + 1 < onboardingStep ? 'completed' : ''} ${i + 1 === onboardingStep ? 'active' : ''}">${i + 1 < onboardingStep ? '✓' : i + 1}</div>
                ${i < steps.length - 1 ? `<div class="stepper-line ${i + 1 < onboardingStep ? 'active' : ''}"></div>` : ''}
              </div>
            `).join('')}
          </div>
          <div class="onboarding-step">
            <h3>${step.title}</h3>
            <p class="step-description">${step.description}</p>
            ${step.content}
          </div>
          <div class="onboarding-actions">
            ${onboardingStep > 1 ? '<button class="btn btn-ghost" onclick="App.prevOnboarding()">← Back</button>' : '<div></div>'}
            ${onboardingStep < steps.length
              ? '<button class="btn btn-primary" onclick="App.nextOnboarding()">Next →</button>'
              : '<button class="btn btn-primary" onclick="App.completeOnboarding()">Complete Setup 🎉</button>'}
          </div>
        </div>
      </div>
    `;
  }

  function selectOption(el, groupId) {
    const group = document.getElementById(groupId);
    if (!group) {
      // Try parent
      el.closest('.option-grid')?.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
    } else {
      group.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
    }
    el.classList.add('selected');
  }

  function nextOnboarding() {
    saveOnboardingStep();
    onboardingStep++;
    renderOnboardingStep(document.getElementById('app'));
  }

  function prevOnboarding() {
    onboardingStep--;
    renderOnboardingStep(document.getElementById('app'));
  }

  function saveOnboardingStep() {
    if (onboardingStep === 1) {
      profile.name = document.getElementById('ob-name')?.value || profile.name;
    } else if (onboardingStep === 2) {
      const selected = document.querySelector('#transport-options .option-card.selected');
      if (selected) profile.preferences.transportMode = selected.dataset.value;
      profile.preferences.dailyCommute = parseFloat(document.getElementById('ob-commute')?.value) || 10;
    } else if (onboardingStep === 3) {
      profile.preferences.electricityKwh = parseFloat(document.getElementById('ob-electricity')?.value) || 10;
      profile.preferences.waterLiters = parseFloat(document.getElementById('ob-water')?.value) || 150;
    } else if (onboardingStep === 4) {
      const selected = document.querySelector('#diet-options .option-card.selected');
      if (selected) profile.preferences.dietType = selected.dataset.value;
    }
    saveProfile();
  }

  function completeOnboarding() {
    saveOnboardingStep();
    profile.isOnboarded = true;

    // Calculate initial emissions
    profile.emissions = calculateUserEmissions();
    saveProfile();

    // Award first achievement
    Gamification.logActivity('general');

    showToast('Welcome aboard! Your eco journey begins now! 🌍', 'success', 'Setup Complete');
    navigate('dashboard');
    updateSidebarUser();
  }

  /* ── Calculate User Emissions ── */
  function calculateUserEmissions() {
    const p = profile.preferences;
    const dietFactors = {
      meat_heavy: [{ type: 'beef', kg: 0.2 }, { type: 'chicken', kg: 0.15 }, { type: 'dairy', kg: 0.3 }],
      regular: [{ type: 'beef', kg: 0.1 }, { type: 'chicken', kg: 0.15 }, { type: 'vegetables', kg: 0.3 }],
      occasional: [{ type: 'chicken', kg: 0.1 }, { type: 'fish', kg: 0.1 }, { type: 'vegetables', kg: 0.4 }],
      pescatarian: [{ type: 'fish', kg: 0.15 }, { type: 'vegetables', kg: 0.4 }, { type: 'legumes', kg: 0.2 }],
      vegetarian: [{ type: 'dairy', kg: 0.2 }, { type: 'vegetables', kg: 0.4 }, { type: 'legumes', kg: 0.3 }],
      vegan: [{ type: 'vegetables', kg: 0.4 }, { type: 'legumes', kg: 0.3 }, { type: 'fruits', kg: 0.2 }]
    };

    const shoppingFactors = {
      frequent: [{ type: 'clothing', quantity: 0.2 }, { type: 'electronics', quantity: 0.03 }],
      moderate: [{ type: 'clothing', quantity: 0.1 }, { type: 'groceries', quantity: 0.3 }],
      minimal: [{ type: 'groceries', quantity: 0.2 }],
      online: [{ type: 'clothing', quantity: 0.15 }, { type: 'electronics', quantity: 0.02 }]
    };

    return CarbonCalculator.calculateTotal({
      transport: [{ mode: p.transportMode, distanceKm: p.dailyCommute }],
      electricity: { kwh: p.electricityKwh, source: 'perKwh' },
      water: { liters: p.waterLiters, isHot: false },
      food: dietFactors[p.dietType] || dietFactors.regular,
      shopping: shoppingFactors[p.shoppingFrequency] || shoppingFactors.moderate,
      waste: { kg: 0.74, method: 'landfill' }
    });
  }

  /* ── Dashboard ── */
  function renderDashboard(app) {
    const emissions = profile.emissions || calculateUserEmissions();
    const ecoScore = CarbonCalculator.getEcoScore(emissions.annual);
    const comparison = CarbonCalculator.compareToAverage(emissions.annual);
    const gamState = Gamification.getState();
    const sampleData = CarbonCalculator.generateSampleData();
    dailyTasks = dailyTasks.length ? dailyTasks : AICoach.generateDailyTasks(profile);

    app.innerHTML = `
      <div class="page-container page-enter">
        <div class="page-header">
          <h1>Welcome back, ${profile.name || 'Explorer'}! 👋</h1>
          <p>Here's your sustainability overview for today</p>
        </div>

        <div class="dashboard-grid">
          <!-- Eco Score Ring -->
          <div class="col-4">
            <div class="glass-card eco-score-ring no-hover">
              <div class="score-ring-container" id="eco-score-ring"></div>
              <div class="text-center">
                <span class="badge" style="background:${ecoScore.color}20;color:${ecoScore.color};border:1px solid ${ecoScore.color}40;">Grade ${ecoScore.rating} — ${ecoScore.label}</span>
                <p class="fs-sm text-muted mt-md">${ecoScore.description}</p>
              </div>
            </div>
          </div>

          <!-- Stats Cards -->
          <div class="col-8">
            <div class="d-grid gap-md" style="grid-template-columns: repeat(2, 1fr);">
              <div class="glass-card no-hover">
                <div class="stat-card">
                  <div class="card-icon primary"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg></div>
                  <div class="stat-content">
                    <div class="stat-value text-teal">${emissions.daily.toFixed(1)}</div>
                    <div class="stat-label">kg CO₂ Today</div>
                    <div class="stat-trend positive">↓ 12% vs last week</div>
                  </div>
                </div>
              </div>
              <div class="glass-card no-hover">
                <div class="stat-card">
                  <div class="card-icon accent"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
                  <div class="stat-content">
                    <div class="stat-value" style="color:var(--accent)">${emissions.annual.toFixed(0)}</div>
                    <div class="stat-label">kg CO₂/Year</div>
                    <div class="stat-trend ${comparison.percentDiff < 0 ? 'positive' : 'negative'}">${comparison.percentDiff < 0 ? '↓' : '↑'} ${Math.abs(comparison.percentDiff)}% vs average</div>
                  </div>
                </div>
              </div>
              <div class="glass-card no-hover">
                <div class="stat-card">
                  <div class="card-icon success"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg></div>
                  <div class="stat-content">
                    <div class="stat-value text-success">${CarbonCalculator.treesEquivalent(emissions.annual)}</div>
                    <div class="stat-label">Trees to Offset</div>
                    <div class="stat-trend positive">🌳 Per year needed</div>
                  </div>
                </div>
              </div>
              <div class="glass-card no-hover">
                <div class="stat-card">
                  <div class="card-icon error"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>
                  <div class="stat-content">
                    <div class="stat-value" style="color:var(--accent)">${gamState.points.toLocaleString()}</div>
                    <div class="stat-label">EcoPoints</div>
                    <div class="stat-trend positive">Level ${gamState.level}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Category Breakdown -->
          <div class="col-6">
            <div class="glass-card no-hover">
              <div class="card-header">
                <div><div class="card-title">Carbon Breakdown</div><div class="card-subtitle">By category today</div></div>
              </div>
              <div class="chart-container" id="donut-chart"></div>
            </div>
          </div>

          <!-- Weekly Trend -->
          <div class="col-6">
            <div class="glass-card no-hover">
              <div class="card-header">
                <div><div class="card-title">Weekly Trend</div><div class="card-subtitle">Daily emissions this week</div></div>
              </div>
              <div class="chart-container" id="bar-chart"></div>
            </div>
          </div>

          <!-- Daily Tasks -->
          <div class="col-6">
            <div class="glass-card no-hover">
              <div class="card-header">
                <div><div class="card-title">Today's Eco Tasks</div><div class="card-subtitle">Complete for bonus XP</div></div>
              </div>
              <div class="tasks-list" id="daily-tasks"></div>
            </div>
          </div>

          <!-- Streak & Quick Actions -->
          <div class="col-6">
            <div class="glass-card no-hover mb-lg">
              <div class="streak-display">
                <span class="streak-icon">🔥</span>
                <div>
                  <div class="streak-count">${gamState.streak}</div>
                  <div class="streak-label">Day Streak</div>
                </div>
                <div class="ml-auto text-right">
                  ${Gamification.renderLevelBadge()}
                </div>
              </div>
            </div>
            <div class="glass-card no-hover">
              <div class="card-header"><div class="card-title">Quick Actions</div></div>
              <div class="quick-actions">
                <div class="quick-action-btn" onclick="App.quickLog('transport')"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg><span>Log Trip</span></div>
                <div class="quick-action-btn" onclick="App.quickLog('food')"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg><span>Log Meal</span></div>
                <div class="quick-action-btn" onclick="App.quickLog('energy')"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg><span>Log Energy</span></div>
                <div class="quick-action-btn" onclick="App.navigate('chat')"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><span>Ask AI</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Render charts
    setTimeout(() => {
      EcoCharts.ProgressRing('eco-score-ring', ecoScore.score, {
        size: 180, thickness: 14, color: ecoScore.color,
        centerText: ecoScore.score, centerSubtext: 'Eco Score'
      });

      EcoCharts.DonutChart('donut-chart', sampleData.categoryBreakdown, {
        size: 200, thickness: 24,
        centerText: emissions.daily.toFixed(1), centerSubtext: 'kg CO₂/day'
      });

      EcoCharts.BarChart('bar-chart', sampleData.weeklyData, {
        width: 500, height: 220
      });

      renderDailyTasks();
    }, 100);
  }

  function renderDailyTasks() {
    const container = document.getElementById('daily-tasks');
    if (!container) return;

    container.innerHTML = dailyTasks.map((task, i) => `
      <div class="task-item ${task.completed ? 'completed' : ''}" onclick="App.toggleTask(${i})">
        <div class="task-check">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div class="task-info">
          <div class="task-name">${task.icon} ${task.name}</div>
          <div class="task-xp">+${task.xp} XP</div>
        </div>
      </div>
    `).join('');
  }

  function toggleTask(index) {
    if (dailyTasks[index] && !dailyTasks[index].completed) {
      dailyTasks[index].completed = true;
      Gamification.logActivity(dailyTasks[index].category);
      showToast(`+${dailyTasks[index].xp} XP earned! 🎉`, 'success', 'Task Complete');
      renderDailyTasks();
    }
  }

  function quickLog(category) {
    const modals = {
      transport: {
        title: 'Log a Trip',
        content: `
          <div class="form-group">
            <label class="form-label">Transport Mode</label>
            <select class="form-input" id="ql-mode">
              <option value="car_petrol">Car (Petrol)</option>
              <option value="car_diesel">Car (Diesel)</option>
              <option value="car_electric">Electric Car</option>
              <option value="bus">Bus</option>
              <option value="train">Train</option>
              <option value="metro">Metro</option>
              <option value="bicycle">Bicycle</option>
              <option value="walking">Walking</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Distance (km)</label>
            <input type="number" class="form-input" id="ql-distance" placeholder="e.g., 10" value="10">
          </div>
        `,
        action: () => {
          const mode = document.getElementById('ql-mode').value;
          const dist = parseFloat(document.getElementById('ql-distance').value) || 0;
          const co2 = CarbonCalculator.calculateTransport(mode, dist);
          Gamification.logActivity(mode);
          showToast(`Logged: ${co2.toFixed(2)} kg CO₂ for ${dist} km by ${mode.replace('_', ' ')}`, 'success', 'Trip Logged');
          closeModal();
        }
      },
      food: {
        title: 'Log a Meal',
        content: `
          <div class="form-group">
            <label class="form-label">Main Food Type</label>
            <select class="form-input" id="ql-food">
              <option value="beef">Beef</option>
              <option value="chicken">Chicken</option>
              <option value="fish">Fish</option>
              <option value="pork">Pork</option>
              <option value="vegetables" selected>Vegetables</option>
              <option value="legumes">Legumes</option>
              <option value="rice">Rice</option>
              <option value="dairy">Dairy</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Approximate weight (kg)</label>
            <input type="number" class="form-input" id="ql-weight" placeholder="e.g., 0.3" value="0.3" step="0.1">
          </div>
        `,
        action: () => {
          const food = document.getElementById('ql-food').value;
          const kg = parseFloat(document.getElementById('ql-weight').value) || 0;
          const co2 = CarbonCalculator.calculateFood([{ type: food, kg }]);
          Gamification.logActivity(food);
          showToast(`Logged: ${co2.toFixed(2)} kg CO₂ for ${kg} kg of ${food}`, 'success', 'Meal Logged');
          closeModal();
        }
      },
      energy: {
        title: 'Log Energy Usage',
        content: `
          <div class="form-group">
            <label class="form-label">Electricity used (kWh)</label>
            <input type="number" class="form-input" id="ql-kwh" placeholder="e.g., 5" value="5">
          </div>
        `,
        action: () => {
          const kwh = parseFloat(document.getElementById('ql-kwh').value) || 0;
          const co2 = CarbonCalculator.calculateElectricity(kwh);
          Gamification.logActivity('energy');
          showToast(`Logged: ${co2.toFixed(2)} kg CO₂ for ${kwh} kWh`, 'success', 'Energy Logged');
          closeModal();
        }
      }
    };

    const modal = modals[category];
    if (modal) {
      showModal(modal.title, modal.content,
        `<button class="btn btn-ghost" onclick="App.closeModal()">Cancel</button>
         <button class="btn btn-primary" onclick="(${modal.action.toString()})()">Log Activity</button>`
      );
    }
  }

  /* ── Analytics Page ── */
  function renderAnalytics(app) {
    Gamification.trackAnalyticsView();
    const emissions = profile.emissions || calculateUserEmissions();
    const comparison = CarbonCalculator.compareToAverage(emissions.annual);
    const sampleData = CarbonCalculator.generateSampleData();

    app.innerHTML = `
      <div class="page-container page-enter">
        <div class="page-header">
          <h1>Carbon Analytics 📊</h1>
          <p>Deep dive into your emission patterns and trends</p>
        </div>

        <div class="analytics-grid">
          <div class="glass-card analytics-card no-hover">
            <div class="card-title mb-md">Daily Average</div>
            <div class="analytics-value text-teal">${emissions.daily.toFixed(1)} kg</div>
            <p class="fs-sm text-muted mt-sm">CO₂ per day</p>
            <div class="chart-container mt-md" id="spark-daily" style="height:40px;"></div>
          </div>
          <div class="glass-card analytics-card no-hover">
            <div class="card-title mb-md">Monthly Total</div>
            <div class="analytics-value" style="color:var(--accent)">${emissions.monthly.toFixed(0)} kg</div>
            <p class="fs-sm text-muted mt-sm">CO₂ per month</p>
            <div class="chart-container mt-md" id="spark-monthly" style="height:40px;"></div>
          </div>
          <div class="glass-card analytics-card no-hover">
            <div class="card-title mb-md">Annual Projection</div>
            <div class="analytics-value text-success">${emissions.annual.toFixed(0)} kg</div>
            <p class="fs-sm text-muted mt-sm">vs ${comparison.globalAverage} kg global avg</p>
            <div class="chart-container mt-md" id="spark-annual" style="height:40px;"></div>
          </div>
        </div>

        <div class="d-grid gap-lg mt-xl" style="grid-template-columns: 1fr 1fr;">
          <div class="glass-card no-hover">
            <div class="card-header">
              <div class="card-title">Monthly Comparison</div>
            </div>
            <div class="chart-container" id="analytics-bar" style="height:280px;"></div>
          </div>
          <div class="glass-card no-hover">
            <div class="card-header">
              <div class="card-title">30-Day Trend</div>
            </div>
            <div class="chart-container" id="analytics-line" style="height:280px;"></div>
          </div>
        </div>

        <div class="glass-card no-hover mt-xl">
          <div class="card-header">
            <div class="card-title">Category Deep Dive</div>
          </div>
          <div class="chart-container" id="category-bars"></div>
        </div>
      </div>
    `;

    setTimeout(() => {
      EcoCharts.SparkLine('spark-daily', sampleData.sparkData, { lineColor: '#14b8a6' });
      EcoCharts.SparkLine('spark-monthly', sampleData.sparkData.map(v => v * 30), { lineColor: '#f59e0b' });
      EcoCharts.SparkLine('spark-annual', sampleData.sparkData.map(v => v * 365), { lineColor: '#10b981' });
      EcoCharts.BarChart('analytics-bar', sampleData.monthlyData.slice(0, 6), { height: 250 });
      EcoCharts.LineChart('analytics-line', sampleData.trendData, { height: 250 });
      EcoCharts.HorizontalBarChart('category-bars', sampleData.categoryBreakdown);
    }, 100);
  }

  /* ── Chat (CarbonGPT) ── */
  function renderChat(app) {
    app.innerHTML = `
      <div class="page-container page-enter">
        <div class="chat-page">
          <div class="chat-header">
            <div class="chat-avatar"><svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg></div>
            <div>
              <h4>CarbonGPT</h4>
              <div class="chat-status"><span class="status-dot"></span> Online — AI Sustainability Coach</div>
            </div>
          </div>
          <div class="chat-messages" id="chat-messages"></div>
          <div class="chat-suggestions" id="chat-suggestions"></div>
          <div class="chat-input-area">
            <input type="text" class="form-input" id="chat-input" placeholder="Ask about carbon footprint, tips, or sustainability..."
              onkeydown="if(event.key==='Enter')App.sendChat()">
            <button class="btn btn-primary" onclick="App.sendChat()">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      </div>
    `;

    // Init chat with greeting
    if (chatHistory.length === 0) {
      chatHistory.push({
        role: 'bot',
        text: EcoData.carbonGPTResponses.greetings[0]
      });
    }
    renderChatMessages();
    renderSuggestions(['How can I reduce my carbon footprint?', 'What\'s my eco score?', 'Tips for green commuting']);
  }

  function renderChatMessages() {
    const container = document.getElementById('chat-messages');
    if (!container) return;

    container.innerHTML = chatHistory.map(msg => `
      <div class="chat-message ${msg.role === 'bot' ? 'bot' : 'user'}">
        <div class="message-avatar">${msg.role === 'bot' ? '🤖' : '👤'}</div>
        <div class="message-bubble">${msg.text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</div>
      </div>
    `).join('');

    container.scrollTop = container.scrollHeight;
  }

  function renderSuggestions(suggestions) {
    const container = document.getElementById('chat-suggestions');
    if (!container) return;

    container.innerHTML = suggestions.map(s =>
      `<div class="chip" onclick="App.sendSuggestion('${s.replace(/'/g, "\\'")}')">${s}</div>`
    ).join('');
  }

  function sendChat() {
    const input = document.getElementById('chat-input');
    if (!input || !input.value.trim()) return;

    const message = input.value.trim();
    input.value = '';

    chatHistory.push({ role: 'user', text: message });
    renderChatMessages();

    // Typing indicator
    const container = document.getElementById('chat-messages');
    const typing = document.createElement('div');
    typing.className = 'chat-message bot';
    typing.id = 'typing-indicator';
    typing.innerHTML = `
      <div class="message-avatar">🤖</div>
      <div class="message-bubble"><div class="typing-indicator"><span></span><span></span><span></span></div></div>
    `;
    container.appendChild(typing);
    container.scrollTop = container.scrollHeight;

    // Simulate response delay
    setTimeout(() => {
      typing.remove();
      const response = AICoach.processChat(message);
      chatHistory.push({ role: 'bot', text: response.response });
      Gamification.trackChat();
      renderChatMessages();
      renderSuggestions(response.suggestedFollowups);
    }, 800 + Math.random() * 700);
  }

  function sendSuggestion(text) {
    const input = document.getElementById('chat-input');
    if (input) input.value = text;
    sendChat();
  }

  /* ── Simulator Page ── */
  function renderSimulator(app) {
    Gamification.trackSimulation();
    const scenarios = Simulator.getAllScenarios();

    app.innerHTML = `
      <div class="page-container page-enter">
        <div class="page-header">
          <h1>What-If Simulator 🔮</h1>
          <p>See the impact of lifestyle changes before you make them</p>
        </div>
        <div class="simulator-grid">
          ${scenarios.map(s => Simulator.renderScenarioCard(s.id)).join('')}
        </div>
      </div>
    `;
  }

  /* ── Challenges Page ── */
  function renderChallenges(app) {
    app.innerHTML = `
      <div class="page-container page-enter">
        <div class="page-header">
          <h1>Challenges 🎯</h1>
          <p>Take on challenges to accelerate your sustainability journey</p>
        </div>
        <div class="tabs">
          <div class="tab active" onclick="App.switchChallengeTab('all')">All Challenges</div>
          <div class="tab" onclick="App.switchChallengeTab('active')">Active</div>
          <div class="tab" onclick="App.switchChallengeTab('completed')">Completed</div>
        </div>
        <div class="challenges-grid" id="challenges-page-grid"></div>
      </div>
    `;
    Community.renderChallenges('challenges-page-grid');
  }

  function switchChallengeTab(tab) {
    document.querySelectorAll('.tabs .tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    // For now, show all
    Community.renderChallenges('challenges-page-grid');
  }

  /* ── Community Page ── */
  function renderCommunity(app) {
    app.innerHTML = `
      <div class="page-container page-enter">
        <div class="page-header">
          <h1>Community 🌍</h1>
          <p>Connect with fellow eco-warriors and share your journey</p>
        </div>
        <div class="tabs">
          <div class="tab active" onclick="App.switchCommunityTab('feed')">Feed</div>
          <div class="tab" onclick="App.switchCommunityTab('groups')">Groups</div>
          <div class="tab" onclick="App.switchCommunityTab('leaderboard')">Leaderboard</div>
          <div class="tab" onclick="App.switchCommunityTab('competitions')">Competitions</div>
        </div>
        <div id="community-content">
          <div class="community-layout">
            <div id="community-feed"></div>
            <div>
              <div class="glass-card no-hover mb-lg">
                <div class="card-title mb-md">🏆 Top Eco Warriors</div>
                <div class="leaderboard-list" id="sidebar-leaderboard"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    Community.renderCommunityFeed('community-feed');
    Gamification.renderLeaderboard('sidebar-leaderboard', 5);
  }

  function switchCommunityTab(tab) {
    document.querySelectorAll('.tabs .tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');

    const content = document.getElementById('community-content');
    if (!content) return;

    if (tab === 'feed') {
      content.innerHTML = `
        <div class="community-layout">
          <div id="community-feed"></div>
          <div>
            <div class="glass-card no-hover mb-lg">
              <div class="card-title mb-md">🏆 Top Eco Warriors</div>
              <div class="leaderboard-list" id="sidebar-leaderboard"></div>
            </div>
          </div>
        </div>
      `;
      Community.renderCommunityFeed('community-feed');
      Gamification.renderLeaderboard('sidebar-leaderboard', 5);
    } else if (tab === 'groups') {
      content.innerHTML = '<div class="groups-grid" id="community-groups"></div>';
      Community.renderGroups('community-groups');
    } else if (tab === 'leaderboard') {
      content.innerHTML = '<div class="glass-card no-hover"><div class="leaderboard-list" id="full-leaderboard"></div></div>';
      Gamification.renderLeaderboard('full-leaderboard', 20);
    } else if (tab === 'competitions') {
      content.innerHTML = '<div id="competitions"></div>';
      Community.renderCompetitions('competitions');
    }
  }

  /* ── Rewards Page ── */
  function renderRewards(app) {
    const gamState = Gamification.getState();

    app.innerHTML = `
      <div class="page-container page-enter">
        <div class="page-header">
          <h1>Rewards 🎁</h1>
          <p>Redeem your hard-earned EcoPoints for amazing rewards</p>
        </div>

        <div class="rewards-header glass-card no-hover">
          <div class="points-balance">
            <div class="points-value">${gamState.points.toLocaleString()}</div>
            <div class="points-label">EcoPoints Available</div>
          </div>
          <div class="flex-1">
            ${Gamification.renderLevelBadge()}
          </div>
        </div>

        <div class="tabs">
          <div class="tab active">All Rewards</div>
          <div class="tab">Impact</div>
          <div class="tab">Physical</div>
          <div class="tab">Digital</div>
          <div class="tab">Cosmetic</div>
        </div>

        <div class="rewards-grid">
          ${EcoData.rewards.map(r => `
            <div class="glass-card reward-card">
              <div class="reward-icon">${r.icon}</div>
              <div class="reward-name">${r.name}</div>
              <div class="reward-desc">${r.description}</div>
              <div class="reward-cost">⭐ ${r.cost} pts</div>
              <button class="btn ${gamState.points >= r.cost ? 'btn-primary' : 'btn-secondary'} btn-sm btn-block"
                onclick="App.redeemReward('${r.id}')" ${gamState.points < r.cost ? 'disabled style="opacity:0.5"' : ''}>
                ${gamState.points >= r.cost ? 'Redeem' : 'Not Enough Points'}
              </button>
            </div>
          `).join('')}
        </div>

        <h2 class="mt-2xl mb-lg">Achievements 🏅</h2>
        <div class="achievements-grid" id="achievements-grid"></div>
      </div>
    `;

    Gamification.renderAchievements('achievements-grid');
  }

  function redeemReward(rewardId) {
    const reward = EcoData.rewards.find(r => r.id === rewardId);
    if (!reward) return;
    const gamState = Gamification.getState();
    if (gamState.points < reward.cost) {
      showToast('Not enough EcoPoints!', 'error', 'Insufficient Points');
      return;
    }
    Gamification.addPoints(-reward.cost, `Redeemed: ${reward.name}`);
    showToast(`${reward.name} redeemed! ${reward.icon}`, 'success', 'Reward Redeemed!');
    renderRewards(document.getElementById('app'));
  }

  /* ── Settings Page ── */
  function renderSettings(app) {
    app.innerHTML = `
      <div class="page-container page-enter">
        <div class="page-header">
          <h1>Settings ⚙️</h1>
          <p>Manage your account and preferences</p>
        </div>

        <div class="glass-card no-hover mb-xl">
          <div class="settings-section">
            <h3>Profile</h3>
            <div class="form-group">
              <label class="form-label">Name</label>
              <input type="text" class="form-input" id="settings-name" value="${profile.name || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" class="form-input" id="settings-email" value="${profile.email || ''}">
            </div>
            <button class="btn btn-primary" onclick="App.saveSettings()">Save Changes</button>
          </div>
        </div>

        <div class="glass-card no-hover mb-xl">
          <div class="settings-section">
            <h3>Preferences</h3>
            <div class="settings-row">
              <div><div class="setting-label">Push Notifications</div><div class="setting-desc">Get daily eco reminders</div></div>
              <div class="toggle-switch active" onclick="this.classList.toggle('active')"></div>
            </div>
            <div class="settings-row">
              <div><div class="setting-label">Weekly Report</div><div class="setting-desc">Email summary of your impact</div></div>
              <div class="toggle-switch active" onclick="this.classList.toggle('active')"></div>
            </div>
            <div class="settings-row">
              <div><div class="setting-label">Community Visibility</div><div class="setting-desc">Show on leaderboard</div></div>
              <div class="toggle-switch active" onclick="this.classList.toggle('active')"></div>
            </div>
          </div>
        </div>

        <div class="glass-card no-hover mb-xl">
          <div class="settings-section">
            <h3>Data Management</h3>
            <div class="btn-group">
              <button class="btn btn-secondary" onclick="App.exportData()">📥 Export Data</button>
              <button class="btn btn-outline" style="border-color:var(--error);color:var(--error);" onclick="App.resetData()">🗑️ Reset All Data</button>
            </div>
          </div>
        </div>

        <div class="glass-card no-hover">
          <div class="settings-section">
            <h3>Account</h3>
            <button class="btn btn-ghost" style="color:var(--error);" onclick="App.logout()">Sign Out</button>
          </div>
        </div>
      </div>
    `;
  }

  function saveSettings() {
    profile.name = document.getElementById('settings-name')?.value || profile.name;
    profile.email = document.getElementById('settings-email')?.value || profile.email;
    saveProfile();
    updateSidebarUser();
    showToast('Settings saved!', 'success', 'Updated');
  }

  function exportData() {
    const data = {
      profile,
      gamification: Gamification.getState(),
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ecogenie-data.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported!', 'success', 'Download Started');
  }

  function resetData() {
    showModal('Reset All Data?',
      '<p>This will permanently delete all your data including emissions, achievements, and progress. This cannot be undone.</p>',
      `<button class="btn btn-ghost" onclick="App.closeModal()">Cancel</button>
       <button class="btn btn-primary" style="background:var(--gradient-accent)" onclick="App.confirmReset()">Reset Everything</button>`
    );
  }

  function confirmReset() {
    localStorage.clear();
    profile = getDefaultProfile();
    Gamification.reset();
    chatHistory = [];
    dailyTasks = [];
    closeModal();
    showToast('All data has been reset', 'info', 'Data Cleared');
    navigate('landing');
  }

  function logout() {
    profile.isLoggedIn = false;
    saveProfile();
    showToast('See you soon! 👋', 'info', 'Signed Out');
    navigate('landing');
  }

  /* ── Sidebar User Update ── */
  function updateSidebarUser() {
    const nameEl = document.querySelector('.sidebar-user .user-name');
    const levelEl = document.querySelector('.sidebar-user .user-level');
    const avatarEl = document.querySelector('.sidebar-user .user-avatar');
    if (nameEl) nameEl.textContent = profile.name || 'Explorer';
    if (levelEl) {
      const gs = Gamification.getState();
      levelEl.textContent = `Level ${gs.level} · ${Gamification.getLevelTitle(gs.level)}`;
    }
    if (avatarEl) {
      const initials = (profile.name || 'E').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
      avatarEl.textContent = initials;
    }
  }

  /* ── Menu Toggle ── */
  function toggleMenu() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    if (sidebar) sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('active');
  }

  /* ── Initialize ── */
  function init() {
    window.addEventListener('hashchange', handleRoute);

    // Nav click handlers
    document.querySelectorAll('[data-page]').forEach(item => {
      item.addEventListener('click', () => {
        navigate(item.dataset.page);
        // Close mobile menu
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
      });
    });

    // Menu toggle
    const menuBtn = document.querySelector('.menu-toggle');
    if (menuBtn) menuBtn.addEventListener('click', toggleMenu);

    const overlay = document.querySelector('.sidebar-overlay');
    if (overlay) overlay.addEventListener('click', toggleMenu);

    // Initialize route
    updateSidebarUser();
    handleRoute();
  }

  return {
    init,
    navigate,
    showToast,
    showModal,
    closeModal,
    handleLogin,
    handleRegister,
    selectOption,
    nextOnboarding,
    prevOnboarding,
    completeOnboarding,
    quickLog,
    toggleTask,
    sendChat,
    sendSuggestion,
    switchChallengeTab,
    switchCommunityTab,
    redeemReward,
    saveSettings,
    exportData,
    resetData,
    confirmReset,
    logout,
    toggleMenu
  };
})();

// Boot the app
document.addEventListener('DOMContentLoaded', App.init);
