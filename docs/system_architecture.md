# 🏗️ Section 5 — System Architecture

> **EcoGenie — Personal Carbon Reduction Assistant**
> *Complete Technical Architecture Documentation*

---

## 5.1 Architecture Overview

EcoGenie employs a **microservices-oriented architecture** designed for scalability, maintainability, and rapid iteration. The system is structured into four primary layers:

| Layer | Responsibility | Technologies |
|-------|---------------|--------------|
| **Presentation Layer** | User interface, client-side rendering | Next.js, TypeScript, Tailwind CSS, ShadCN UI |
| **API Gateway Layer** | Request routing, authentication, rate limiting | FastAPI, Clerk Auth |
| **Service Layer** | Business logic, AI processing, data pipelines | Python, LangChain, OpenAI, LightGBM |
| **Data Layer** | Persistent storage, caching, vector search | PostgreSQL, Pinecone, AWS S3, Redis |

### Technology Stack Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                 │
│   Next.js 14 · TypeScript · Tailwind CSS · ShadCN UI · Recharts│
├─────────────────────────────────────────────────────────────────┤
│                       API GATEWAY                               │
│           FastAPI · Clerk Auth · Rate Limiting                  │
├──────────┬──────────┬──────────┬──────────┬─────────────────────┤
│  Carbon  │   AI &   │  Social  │ Scanning │  Marketplace       │
│  Service │ CarbonGPT│  Service │  Service │  Service            │
├──────────┴──────────┴──────────┴──────────┴─────────────────────┤
│                       DATA LAYER                                │
│     PostgreSQL · Pinecone · AWS S3 · Redis                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5.2 High-Level Architecture Diagram (C4 — Context Level)

```mermaid
graph TB
    subgraph "External Systems"
        CLERK["🔐 Clerk<br/>Authentication"]
        OPENAI["🤖 OpenAI API<br/>GPT-4 / GPT-4o"]
        PINECONE["🌲 Pinecone<br/>Vector Database"]
        S3["☁️ AWS S3<br/>Object Storage"]
        OCR["📸 Tesseract OCR<br/>Receipt Processing"]
    end

    subgraph "👤 Users"
        WEB["🌐 Web Browser"]
        MOBILE["📱 Mobile Browser / PWA"]
    end

    subgraph "EcoGenie Platform"
        subgraph "Frontend — Next.js App"
            NEXTJS["⚛️ Next.js 14<br/>TypeScript + Tailwind CSS<br/>ShadCN UI Components"]
        end

        subgraph "Backend — FastAPI Services"
            API["🚀 API Gateway<br/>FastAPI + Uvicorn"]
            AUTH["🔑 Auth Service"]
            CARBON["📊 Carbon Service"]
            AI["🧠 AI Service"]
            SCAN["📷 Scan Service"]
            SOCIAL["👥 Social Service"]
            MARKET["🛒 Marketplace Service"]
            PREDICT["🔮 Prediction Service"]
        end

        subgraph "Data Stores"
            PG["🐘 PostgreSQL<br/>Primary Database"]
            REDIS["⚡ Redis<br/>Cache & Sessions"]
        end
    end

    WEB --> NEXTJS
    MOBILE --> NEXTJS
    NEXTJS --> API

    API --> AUTH
    API --> CARBON
    API --> AI
    API --> SCAN
    API --> SOCIAL
    API --> MARKET
    API --> PREDICT

    AUTH --> CLERK
    AI --> OPENAI
    AI --> PINECONE
    SCAN --> OCR
    SCAN --> S3
    MARKET --> S3

    CARBON --> PG
    AI --> PG
    SOCIAL --> PG
    MARKET --> PG
    PREDICT --> PG
    AUTH --> REDIS
    API --> REDIS

    style NEXTJS fill:#0070f3,color:#fff
    style API fill:#009688,color:#fff
    style PG fill:#336791,color:#fff
    style OPENAI fill:#412991,color:#fff
    style PINECONE fill:#00a98f,color:#fff
```

---

## 5.3 Component Diagram — All Modules

```mermaid
graph TB
    subgraph "🖥️ Frontend Application"
        direction TB
        DASH["📊 Dashboard Module<br/>• Carbon overview<br/>• Trend charts<br/>• Quick actions"]
        CALC["🧮 Calculator Module<br/>• Activity logging<br/>• Category selection<br/>• Emission display"]
        CHAT["💬 CarbonGPT Module<br/>• Chat interface<br/>• Message history<br/>• Context awareness"]
        CHAL["🏆 Challenges Module<br/>• Active challenges<br/>• Progress tracking<br/>• Leaderboard"]
        COMM["👥 Community Module<br/>• Social feed<br/>• Post creation<br/>• Likes & comments"]
        SCAN_UI["📸 Scanner Module<br/>• Camera capture<br/>• Upload interface<br/>• Results display"]
        MARKET_UI["🛒 Marketplace Module<br/>• Product catalog<br/>• Sustainability scores<br/>• Purchase flow"]
        SIM["🧪 Simulator Module<br/>• Scenario builder<br/>• Impact projections<br/>• Comparison charts"]
        PROFILE["👤 Profile Module<br/>• User settings<br/>• Achievement gallery<br/>• Reward balance"]
    end

    subgraph "⚙️ Backend Services"
        direction TB
        SVC_AUTH["Auth Service<br/>────────────<br/>• JWT management<br/>• Clerk integration<br/>• Session handling<br/>• Role-based access"]
        SVC_CARBON["Carbon Service<br/>────────────<br/>• Emission calculation<br/>• History management<br/>• Category aggregation<br/>• Trend analysis"]
        SVC_AI["AI Service<br/>────────────<br/>• CarbonGPT chat<br/>• Recommendations<br/>• RAG pipeline<br/>• Prompt management"]
        SVC_SCAN["Scan Service<br/>────────────<br/>• OCR processing<br/>• Receipt parsing<br/>• Bill analysis<br/>• Item extraction"]
        SVC_PREDICT["Prediction Service<br/>────────────<br/>• LightGBM inference<br/>• Feature engineering<br/>• Behavioral clustering<br/>• Anomaly detection"]
        SVC_SOCIAL["Social Service<br/>────────────<br/>• Community feed<br/>• Post management<br/>• Leaderboard<br/>• Comments & likes"]
        SVC_GAMIFY["Gamification Service<br/>────────────<br/>• Challenge management<br/>• Achievement tracking<br/>• Points calculation<br/>• Streak maintenance"]
        SVC_MARKET["Marketplace Service<br/>────────────<br/>• Product catalog<br/>• Order management<br/>• Sustainability scoring<br/>• Partner integration"]
    end

    DASH --> SVC_CARBON
    CALC --> SVC_CARBON
    CHAT --> SVC_AI
    CHAL --> SVC_GAMIFY
    COMM --> SVC_SOCIAL
    SCAN_UI --> SVC_SCAN
    MARKET_UI --> SVC_MARKET
    SIM --> SVC_PREDICT
    PROFILE --> SVC_AUTH

    style DASH fill:#00b894,color:#fff
    style SVC_AI fill:#6c5ce7,color:#fff
    style SVC_CARBON fill:#0984e3,color:#fff
    style SVC_PREDICT fill:#e17055,color:#fff
```

---

## 5.4 Frontend Architecture

### Technology Choices

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 14.x | React framework with SSR, routing, and API routes |
| **TypeScript** | 5.x | Type safety and developer productivity |
| **Tailwind CSS** | 3.x | Utility-first CSS framework for rapid UI development |
| **ShadCN UI** | Latest | Pre-built accessible component library |
| **Recharts** | 2.x | Responsive charting library for carbon visualizations |
| **React Query** | 5.x | Server state management and data fetching |
| **Zustand** | 4.x | Lightweight client-side state management |
| **Clerk React** | Latest | Pre-built auth UI components |

### Directory Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   ├── calculator/
│   │   │   ├── chat/
│   │   │   ├── challenges/
│   │   │   ├── community/
│   │   │   ├── marketplace/
│   │   │   ├── simulator/
│   │   │   └── profile/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/                 # ShadCN UI components
│   │   ├── charts/             # Recharts wrappers
│   │   ├── forms/              # Form components
│   │   └── layout/             # Header, Sidebar, Footer
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utility functions
│   ├── services/               # API client functions
│   ├── stores/                 # Zustand state stores
│   └── types/                  # TypeScript type definitions
├── public/                     # Static assets
├── tailwind.config.ts
├── next.config.js
└── tsconfig.json
```

### Frontend Data Flow

```mermaid
sequenceDiagram
    participant U as 👤 User
    participant UI as ⚛️ Next.js UI
    participant RQ as 🔄 React Query
    participant API as 🚀 FastAPI
    participant DB as 🐘 PostgreSQL

    U->>UI: Logs a driving activity
    UI->>RQ: useMutation('carbonRecord')
    RQ->>API: POST /api/carbon/calculate
    API->>API: Calculate emission (km × factor)
    API->>DB: INSERT carbon_record
    DB-->>API: Record created
    API-->>RQ: { emission_kg: 2.4, category: "transport" }
    RQ-->>UI: Update cache & re-render
    UI-->>U: Shows "2.4 kg CO₂ added to Transport"
    
    Note over RQ: React Query auto-invalidates<br/>dashboard queries
    RQ->>API: GET /api/dashboard
    API->>DB: Aggregate user emissions
    DB-->>API: Dashboard data
    API-->>RQ: Updated dashboard
    RQ-->>UI: Re-render dashboard
    UI-->>U: Updated charts & totals
```

---

## 5.5 Backend Architecture

### Technology Choices

| Technology | Version | Purpose |
|-----------|---------|---------|
| **FastAPI** | 0.110+ | High-performance async Python web framework |
| **Uvicorn** | 0.27+ | ASGI server for production deployment |
| **SQLAlchemy** | 2.0 | ORM for database operations |
| **Alembic** | 1.13 | Database migration management |
| **Pydantic** | 2.x | Request/response validation and serialization |
| **LangChain** | 0.1+ | LLM orchestration for CarbonGPT |
| **OpenAI SDK** | 1.x | GPT-4 API integration |
| **Pinecone Client** | 3.x | Vector database for RAG |
| **Celery** | 5.x | Async task queue for background processing |
| **Redis** | 7.x | Caching, sessions, and Celery broker |

### Backend Service Architecture

```mermaid
graph LR
    subgraph "API Gateway"
        GW["FastAPI Gateway<br/>• Route dispatch<br/>• Auth middleware<br/>• Rate limiting<br/>• CORS handling<br/>• Request logging"]
    end

    subgraph "Microservices"
        direction TB
        CS["Carbon Service<br/>POST /carbon/calculate<br/>GET /carbon/history<br/>GET /dashboard"]
        AIS["AI Service<br/>POST /chat<br/>POST /recommendations<br/>POST /predict-emissions"]
        SS["Scan Service<br/>POST /scan/receipt<br/>POST /scan/bill"]
        GS["Gamification Service<br/>GET /challenges<br/>GET /achievements<br/>GET /leaderboard"]
        CMS["Community Service<br/>GET /community<br/>POST /community/posts"]
        MS["Marketplace Service<br/>GET /rewards<br/>POST /simulator"]
    end

    subgraph "Background Workers"
        CL["Celery Workers<br/>• Async OCR processing<br/>• ML model inference<br/>• Email notifications<br/>• Data aggregation"]
    end

    GW --> CS
    GW --> AIS
    GW --> SS
    GW --> GS
    GW --> CMS
    GW --> MS
    
    SS --> CL
    AIS --> CL

    style GW fill:#009688,color:#fff
    style AIS fill:#6c5ce7,color:#fff
    style CS fill:#0984e3,color:#fff
    style CL fill:#e17055,color:#fff
```

### Backend Directory Structure

```
backend/
├── app/
│   ├── main.py                 # FastAPI application entry
│   ├── config.py               # Configuration & env vars
│   ├── middleware/
│   │   ├── auth.py             # Clerk JWT verification
│   │   ├── rate_limit.py       # Rate limiting middleware
│   │   └── cors.py             # CORS configuration
│   ├── routers/
│   │   ├── auth.py             # Auth endpoints
│   │   ├── carbon.py           # Carbon calculation endpoints
│   │   ├── chat.py             # CarbonGPT endpoints
│   │   ├── scan.py             # Receipt/bill scanning
│   │   ├── predict.py          # Emission prediction
│   │   ├── challenges.py       # Challenges & gamification
│   │   ├── community.py        # Social features
│   │   ├── marketplace.py      # Marketplace & rewards
│   │   └── simulator.py        # Carbon simulator
│   ├── services/
│   │   ├── carbon_service.py
│   │   ├── ai_service.py
│   │   ├── scan_service.py
│   │   ├── prediction_service.py
│   │   ├── gamification_service.py
│   │   ├── community_service.py
│   │   └── marketplace_service.py
│   ├── models/                 # SQLAlchemy models
│   ├── schemas/                # Pydantic schemas
│   ├── ml/                     # ML model files & inference
│   │   ├── lightgbm_model.pkl
│   │   ├── feature_pipeline.py
│   │   └── inference.py
│   └── utils/
│       ├── emission_factors.py
│       └── helpers.py
├── migrations/                 # Alembic migrations
├── tests/                      # Pytest test suite
├── requirements.txt
└── Dockerfile
```

---

## 5.6 AI & Machine Learning Layer

### CarbonGPT Architecture (RAG Pipeline)

```mermaid
graph TB
    subgraph "User Interaction"
        USER["👤 User Query<br/>'How much CO₂ does a<br/>flight from NYC to London emit?'"]
    end

    subgraph "RAG Pipeline"
        EMB["🔢 Embedding Model<br/>OpenAI text-embedding-3-small"]
        VS["🌲 Pinecone Vector Search<br/>Top-K similar documents"]
        CONTEXT["📄 Context Assembly<br/>Retrieved docs + user profile"]
        PROMPT["📝 Prompt Template<br/>System prompt + context + query"]
        LLM["🤖 GPT-4o<br/>Response generation"]
    end

    subgraph "Knowledge Base"
        KB1["📚 Emission Factor DB<br/>500+ activity factors"]
        KB2["📰 Climate Research<br/>IPCC reports, studies"]
        KB3["💡 Sustainability Tips<br/>1000+ actionable tips"]
        KB4["👤 User History<br/>Past emissions & goals"]
    end

    USER --> EMB
    EMB --> VS
    KB1 --> VS
    KB2 --> VS
    KB3 --> VS
    VS --> CONTEXT
    KB4 --> CONTEXT
    CONTEXT --> PROMPT
    PROMPT --> LLM
    LLM --> USER

    style USER fill:#00b894,color:#fff
    style LLM fill:#6c5ce7,color:#fff
    style VS fill:#00a98f,color:#fff
    style EMB fill:#0984e3,color:#fff
```

### ML Models Deployed

| Model | Algorithm | Purpose | Input Features | Output |
|-------|-----------|---------|----------------|--------|
| Emission Predictor | LightGBM | Forecast user's future emissions | Demographics, history, weather, time | Predicted monthly CO₂ (kg) |
| Behavioral Cluster | K-Means | Segment users by lifestyle patterns | Activity categories, frequencies, amounts | Cluster label (1-5) |
| Anomaly Detector | Isolation Forest | Flag unusual emission spikes | Daily/weekly emission patterns | Anomaly score (0-1) |
| Receipt Parser | OCR + NER | Extract items from receipt images | Receipt image (JPEG/PNG) | List of items + quantities |

---

## 5.7 Data Flow Diagram

```mermaid
graph TB
    subgraph "📱 User Actions"
        A1["Log Activity"]
        A2["Scan Receipt"]
        A3["Chat with CarbonGPT"]
        A4["Join Challenge"]
        A5["Browse Marketplace"]
    end

    subgraph "🚀 API Processing"
        P1["Calculate Emissions"]
        P2["OCR + Item Extraction"]
        P3["RAG + LLM Response"]
        P4["Progress Tracking"]
        P5["Product Recommendations"]
    end

    subgraph "💾 Data Storage"
        D1["carbon_records"]
        D2["scan_results"]
        D3["chat_history"]
        D4["challenge_progress"]
        D5["order_history"]
    end

    subgraph "📊 Analytics"
        AN1["Dashboard Aggregation"]
        AN2["Trend Analysis"]
        AN3["Prediction Engine"]
        AN4["Leaderboard Ranking"]
    end

    subgraph "📤 Output"
        O1["Dashboard Charts"]
        O2["AI Recommendations"]
        O3["Achievement Badges"]
        O4["Push Notifications"]
    end

    A1 --> P1 --> D1
    A2 --> P2 --> D2
    A3 --> P3 --> D3
    A4 --> P4 --> D4
    A5 --> P5 --> D5

    D1 --> AN1
    D1 --> AN2
    D1 --> AN3
    D4 --> AN4

    AN1 --> O1
    AN2 --> O2
    AN3 --> O2
    AN4 --> O3
    AN2 --> O4

    style A1 fill:#00b894,color:#fff
    style P1 fill:#0984e3,color:#fff
    style D1 fill:#336791,color:#fff
    style AN1 fill:#e17055,color:#fff
    style O1 fill:#6c5ce7,color:#fff
```

---

## 5.8 Authentication Flow

```mermaid
sequenceDiagram
    participant U as 👤 User
    participant FE as ⚛️ Next.js Frontend
    participant CK as 🔐 Clerk
    participant BE as 🚀 FastAPI Backend
    participant DB as 🐘 PostgreSQL

    U->>FE: Click "Sign Up"
    FE->>CK: Open Clerk Sign-Up UI
    U->>CK: Enter email, password, OAuth
    CK-->>CK: Create user + issue JWT
    CK-->>FE: Return session + JWT
    FE->>BE: POST /api/auth/register (JWT in header)
    BE->>CK: Verify JWT signature
    CK-->>BE: Valid — user claims
    BE->>DB: INSERT user profile
    DB-->>BE: User created
    BE-->>FE: { user_id, profile }
    FE-->>U: Redirect to Dashboard

    Note over FE,BE: Subsequent API calls
    U->>FE: Navigate to Dashboard
    FE->>BE: GET /api/dashboard (Authorization: Bearer <JWT>)
    BE->>CK: Verify JWT
    CK-->>BE: Valid
    BE->>DB: Query user data
    DB-->>BE: Dashboard data
    BE-->>FE: JSON response
    FE-->>U: Render dashboard
```

---

## 5.9 Deployment Architecture

### Cloud Infrastructure (AWS)

```mermaid
graph TB
    subgraph "🌐 Internet"
        USER["👤 Users"]
    end

    subgraph "AWS Cloud"
        subgraph "Edge Layer"
            CF["☁️ CloudFront CDN<br/>Static asset caching"]
            R53["🌍 Route 53<br/>DNS management"]
        end

        subgraph "Compute Layer"
            subgraph "ECS Cluster"
                FE_TASK["📦 Frontend Container<br/>Next.js (2 tasks)<br/>t3.medium"]
                BE_TASK["📦 Backend Container<br/>FastAPI (3 tasks)<br/>t3.large"]
                WORKER["📦 Celery Workers<br/>ML + OCR (2 tasks)<br/>t3.xlarge"]
            end
            ALB["⚖️ Application Load Balancer"]
        end

        subgraph "Data Layer"
            RDS["🐘 RDS PostgreSQL<br/>db.r6g.large<br/>Multi-AZ"]
            ELAST["⚡ ElastiCache Redis<br/>cache.t3.medium"]
            S3_STORE["📂 S3 Bucket<br/>Receipts, images, models"]
        end

        subgraph "External Services"
            PINE["🌲 Pinecone<br/>Managed Vector DB"]
            OAI["🤖 OpenAI API<br/>GPT-4o"]
            CLERK_SVC["🔐 Clerk<br/>Auth Service"]
        end

        subgraph "Monitoring"
            CW["📈 CloudWatch<br/>Metrics & Logs"]
            XRAY["🔍 X-Ray<br/>Distributed Tracing"]
        end
    end

    USER --> R53
    R53 --> CF
    CF --> ALB
    ALB --> FE_TASK
    ALB --> BE_TASK
    
    BE_TASK --> RDS
    BE_TASK --> ELAST
    BE_TASK --> S3_STORE
    BE_TASK --> PINE
    BE_TASK --> OAI
    BE_TASK --> CLERK_SVC
    
    WORKER --> RDS
    WORKER --> S3_STORE
    WORKER --> ELAST
    
    FE_TASK --> CW
    BE_TASK --> CW
    BE_TASK --> XRAY

    style ALB fill:#ff9900,color:#fff
    style RDS fill:#336791,color:#fff
    style FE_TASK fill:#0070f3,color:#fff
    style BE_TASK fill:#009688,color:#fff
    style PINE fill:#00a98f,color:#fff
    style OAI fill:#412991,color:#fff
```

### Docker Configuration

```yaml
# docker-compose.yml (Development)
version: "3.9"

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000
      - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${CLERK_PK}
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/ecogenie
      - OPENAI_API_KEY=${OPENAI_KEY}
      - PINECONE_API_KEY=${PINECONE_KEY}
      - CLERK_SECRET_KEY=${CLERK_SK}
      - REDIS_URL=redis://redis:6379
      - AWS_S3_BUCKET=${S3_BUCKET}
    depends_on:
      - db
      - redis

  celery_worker:
    build: ./backend
    command: celery -A app.celery worker -l info
    environment:
      - REDIS_URL=redis://redis:6379
      - DATABASE_URL=postgresql://user:pass@db:5432/ecogenie
    depends_on:
      - redis
      - db

  db:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=ecogenie
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

---

## 5.10 Security Architecture

```mermaid
graph TB
    subgraph "🔒 Security Layers"
        direction TB
        L1["Layer 1: Network Security<br/>• CloudFront WAF<br/>• VPC isolation<br/>• Security groups<br/>• TLS 1.3 everywhere"]
        L2["Layer 2: Authentication<br/>• Clerk OAuth 2.0 + JWT<br/>• Multi-factor authentication<br/>• Session management<br/>• Token rotation"]
        L3["Layer 3: Authorization<br/>• Role-based access control<br/>• Resource-level permissions<br/>• API key scoping<br/>• Rate limiting per tier"]
        L4["Layer 4: Data Security<br/>• AES-256 encryption at rest<br/>• TLS in transit<br/>• PII anonymization<br/>• GDPR compliance"]
        L5["Layer 5: Monitoring<br/>• CloudWatch alerts<br/>• Anomaly detection<br/>• Audit logging<br/>• Incident response"]
    end

    L1 --> L2 --> L3 --> L4 --> L5

    style L1 fill:#e74c3c,color:#fff
    style L2 fill:#e67e22,color:#fff
    style L3 fill:#f1c40f,color:#000
    style L4 fill:#2ecc71,color:#fff
    style L5 fill:#3498db,color:#fff
```

### Security Measures Summary

| Category | Implementation | Standard |
|----------|---------------|----------|
| Authentication | Clerk with JWT, MFA support | OAuth 2.0 / OIDC |
| Authorization | RBAC with scoped permissions | OWASP best practices |
| Data Encryption | AES-256 at rest, TLS 1.3 in transit | SOC 2 Type II |
| API Security | Rate limiting, input validation, CORS | OWASP API Top 10 |
| Data Privacy | PII anonymization, right to deletion | GDPR, CCPA |
| Infrastructure | VPC, security groups, WAF | AWS Well-Architected |
| Monitoring | Real-time alerts, audit logs | ISO 27001 |
| CI/CD Security | SAST, dependency scanning | DevSecOps |

---

## 5.11 Scalability Strategy

| Growth Stage | Users | Infrastructure | Estimated Monthly Cost |
|-------------|:---:|----------------|:---:|
| **MVP** | 0–1K | Single ECS task, RDS db.t3.medium | $150/mo |
| **Early Growth** | 1K–10K | 2 tasks, RDS db.r6g.large | $500/mo |
| **Scaling** | 10K–100K | Auto-scaling ECS, RDS Multi-AZ, ElastiCache | $2,500/mo |
| **Mature** | 100K–1M | Multi-region, read replicas, dedicated workers | $8,000/mo |
| **Enterprise** | 1M+ | Multi-region active-active, dedicated Pinecone | $25,000/mo |

### Auto-Scaling Policies

```mermaid
graph LR
    subgraph "Auto-Scaling Triggers"
        CPU["CPU > 70%<br/>Scale Out"]
        MEM["Memory > 80%<br/>Scale Out"]
        REQ["Requests > 1000/s<br/>Scale Out"]
        LOW["CPU < 30%<br/>Scale In"]
    end
    
    subgraph "Scaling Actions"
        FE_SCALE["Frontend: 2–8 tasks"]
        BE_SCALE["Backend: 3–15 tasks"]
        WORKER_SCALE["Workers: 2–10 tasks"]
        DB_SCALE["RDS: Read replicas"]
    end

    CPU --> FE_SCALE
    CPU --> BE_SCALE
    MEM --> WORKER_SCALE
    REQ --> BE_SCALE
    REQ --> DB_SCALE
    LOW --> FE_SCALE

    style CPU fill:#e74c3c,color:#fff
    style BE_SCALE fill:#009688,color:#fff
```

---

## 5.12 Performance Requirements

| Metric | Target | Measurement |
|--------|--------|-------------|
| API Response Time (p50) | < 100ms | CloudWatch latency |
| API Response Time (p99) | < 500ms | CloudWatch latency |
| CarbonGPT Response Time | < 3s | End-to-end including LLM |
| Receipt Scan Processing | < 5s | OCR + extraction pipeline |
| Dashboard Load Time | < 2s | Lighthouse FCP |
| Uptime SLA | 99.9% | Monthly availability |
| Concurrent Users | 10,000+ | Load test validation |
| Database Query Time (p95) | < 50ms | PostgreSQL slow query log |

---

**© 2026 EcoGenie — System Architecture Document v1.0**
