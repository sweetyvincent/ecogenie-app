<![CDATA[<div align="center">

# 🌿 ECOGENIE

### Your Personal Carbon Reduction Assistant

[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Version](https://img.shields.io/badge/Version-1.0.0-teal.svg)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)]()

**Empowering individuals to understand, track, and reduce their carbon footprint through AI-powered insights and gamification.**

[Live Demo](#demo) · [Documentation](docs/) · [Report Bug](#) · [Request Feature](#)

</div>

---

## 🌍 About EcoGenie

EcoGenie is an AI-powered personal carbon reduction assistant that helps individuals understand their environmental impact and take actionable steps to reduce it. Built with cutting-edge technology and beautiful design, EcoGenie makes sustainability accessible, engaging, and rewarding.

### The Problem
The average person generates **4-8 tonnes of CO₂ annually** but has virtually no visibility into their impact. Existing solutions are either too complex, too simplistic, or lack the personalization needed to drive real behavioral change.

### Our Solution
EcoGenie combines **real-time carbon tracking**, **AI-powered coaching**, **gamification**, and **community engagement** to create a comprehensive sustainability companion that makes reducing your carbon footprint feel achievable and fun.

---

## ✨ Features

### 🧮 Carbon Footprint Calculator
- Track emissions across **6 categories**: Transport, Electricity, Water, Food, Shopping, Waste
- Real-time daily, weekly, monthly, and annual scoring
- EPA-validated emission factors
- Eco Score rating system (A+ to F)

### 🤖 CarbonGPT – AI Sustainability Coach
- Conversational AI assistant for sustainability questions
- Personalized recommendations based on your profile
- Daily eco-tasks and weekly challenges
- Smart habit detection and wasteful behavior alerts

### 🔬 Carbon Reduction Simulator
- Interactive "What if?" scenario testing
- Compare alternatives: Drive vs. Bike, Meat vs. Vegetarian, etc.
- See impact in CO₂ saved, money saved, and trees equivalent

### 🏆 Gamification
- Points, levels, and XP progression system
- Streak tracking for consecutive eco-actions
- 20+ unlockable achievements and green badges
- Global leaderboard with rankings

### 👥 Community
- Sustainability groups and local challenges
- Carbon reduction competitions
- Achievement sharing and social feed
- Eco-tips and knowledge sharing

### 🎁 Eco Rewards
- Earn rewards from partner brands
- Redeem points for sustainable products
- Carbon offset marketplace

### 📊 Advanced Analytics
- Interactive SVG charts (donut, bar, line)
- Emission predictions using behavioral data
- Category deep-dives with trend analysis
- Year-over-year comparisons

### 🧾 Smart Scanning (UI Ready)
- Receipt scanner for shopping emissions
- Utility bill analyzer for energy insights
- Image-based carbon estimation

---

## 🚀 Quick Start

### Option 1: Open Directly (Recommended for Demo)
Simply open `index.html` in any modern web browser:

```bash
# Clone the repository
git clone https://github.com/ecogenie/ecogenie-app.git
cd ecogenie-app

# Open in browser
start index.html          # Windows
open index.html           # macOS
xdg-open index.html       # Linux
```

No build tools, no dependencies, no setup required! 🎉

### Option 2: Docker (Production)
```bash
# Build and run with Docker Compose
docker-compose up --build

# Access at http://localhost:8080
```

### Option 3: Development Server
```bash
# Using Python's built-in server
python -m http.server 8080

# Using Node.js
npx serve .

# Access at http://localhost:8080
```

---

## 📁 Project Structure

```
ecogenie/
├── index.html                    # Main application entry point
├── css/
│   └── style.css                 # Complete design system (1500+ lines)
├── js/
│   ├── data.js                   # Emission factors, sample data, configs
│   ├── charts.js                 # Custom SVG chart library
│   ├── carbon-calculator.js      # Carbon footprint calculation engine
│   ├── ai-coach.js               # CarbonGPT & AI recommendation engine
│   ├── simulator.js              # What-if carbon reduction simulator
│   ├── gamification.js           # Points, levels, streaks, achievements
│   ├── community.js              # Social features and community module
│   └── app.js                    # Main application controller & SPA router
├── docs/
│   ├── executive_summary.md      # Business overview & market analysis
│   ├── system_architecture.md    # Technical architecture & diagrams
│   ├── database_design.md        # ER diagrams & SQL schema
│   ├── api_design.md             # REST API specification
│   ├── data_science.md           # ML model design & evaluation
│   ├── business_model.md         # Revenue streams & financials
│   ├── pitch_deck.md             # Investor pitch deck
│   └── roadmap.md                # 5-phase development roadmap
├── docker-compose.yml            # Docker orchestration
├── Dockerfile                    # Container build file
├── .env.example                  # Environment variables template
└── README.md                     # This file
```

---

## 🛠️ Technology Stack

### Frontend (MVP)
| Technology | Purpose |
|-----------|---------|
| HTML5 | Semantic structure |
| CSS3 | Glassmorphism design system |
| Vanilla JavaScript | Application logic |
| SVG | Custom chart library |
| Google Fonts | Inter + Outfit typography |

### Production Stack (Roadmap)
| Layer | Technology |
|-------|-----------|
| Frontend | Next.js + TypeScript + Tailwind CSS + ShadCN UI |
| Backend | FastAPI + Python |
| Database | PostgreSQL |
| AI/ML | OpenAI GPT + LangChain + Pinecone |
| Auth | Clerk |
| Storage | AWS S3 |
| Deployment | Docker + AWS ECS |

---

## 📐 Architecture

```
┌─────────────────────────────────────────────┐
│                  Frontend                    │
│         (Next.js / TypeScript)               │
├─────────────────────────────────────────────┤
│                 API Gateway                  │
│              (FastAPI / Python)              │
├──────────┬──────────┬──────────┬────────────┤
│  Auth    │  Carbon  │  AI/ML   │ Community  │
│ Service  │ Service  │ Service  │  Service   │
├──────────┴──────────┴──────────┴────────────┤
│              Data Layer                      │
│    PostgreSQL  │  Redis  │  Pinecone        │
└─────────────────────────────────────────────┘
```

See [System Architecture](docs/system_architecture.md) for detailed diagrams.

---

## 📊 Carbon Emission Factors

EcoGenie uses scientifically validated emission factors:

| Category | Activity | Factor | Unit |
|----------|----------|--------|------|
| Transport | Car (Petrol) | 0.21 | kg CO₂/km |
| Transport | Bus | 0.089 | kg CO₂/km |
| Transport | Train | 0.041 | kg CO₂/km |
| Electricity | Grid Average | 0.42 | kg CO₂/kWh |
| Food | Beef | 27.0 | kg CO₂/kg |
| Food | Vegetables | 2.0 | kg CO₂/kg |
| Waste | Landfill | 0.58 | kg CO₂/kg |
| Waste | Recycled | 0.02 | kg CO₂/kg |

---

## 📈 Impact Metrics

| Metric | Target |
|--------|--------|
| Average user carbon reduction | 20% in 6 months |
| Daily active engagement | 15+ minutes |
| Challenge completion rate | 65%+ |
| User retention (30-day) | 40%+ |

---

## 🗺️ Roadmap

| Phase | Timeline | Focus |
|-------|----------|-------|
| Phase 1 | Month 1-3 | MVP: Calculator, AI Coach, Gamification |
| Phase 2 | Month 4-6 | AI Automation: CarbonGPT, Scanning, Predictions |
| Phase 3 | Month 7-12 | Smart City Integration: APIs, Partnerships |
| Phase 4 | Year 2 | IoT Monitoring: Smart Home, Wearables |
| Phase 5 | Year 3 | Global Network: Carbon Trading, Policy Tools |

See [Full Roadmap](docs/roadmap.md) for details.

---

## 📄 Documentation

| Document | Description |
|----------|-------------|
| [Executive Summary](docs/executive_summary.md) | Vision, mission, market analysis |
| [System Architecture](docs/system_architecture.md) | Technical design & diagrams |
| [Database Design](docs/database_design.md) | ER diagrams & SQL schema |
| [API Design](docs/api_design.md) | REST API specification |
| [Data Science](docs/data_science.md) | ML model design |
| [Business Model](docs/business_model.md) | Revenue & financials |
| [Pitch Deck](docs/pitch_deck.md) | Investor presentation |
| [Roadmap](docs/roadmap.md) | Development phases |

---

## 💚 Contributing

We welcome contributions! Please see our contribution guidelines:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- EPA for emission factor data
- Our sustainability advisors
- The open-source community
- Everyone fighting climate change

---

<div align="center">

**Built with 💚 for the Planet**

*EcoGenie — Making sustainability personal, actionable, and rewarding.*

</div>
]]>
