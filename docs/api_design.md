# 🔌 Section 7 — REST API Design

> **EcoGenie — Personal Carbon Reduction Assistant**
> *Complete API Specification with Request/Response Examples*

---

## 7.1 API Overview

EcoGenie's REST API follows **RESTful conventions** with JSON request/response bodies, JWT-based authentication, consistent error handling, and cursor-based pagination.

### Base Configuration

| Property | Value |
|----------|-------|
| **Base URL** | `https://api.ecogenie.app/api` |
| **Protocol** | HTTPS (TLS 1.3) |
| **Format** | JSON (application/json) |
| **Authentication** | Bearer Token (JWT via Clerk) |
| **Rate Limiting** | 100 requests/minute (Free), 500/min (Pro), 2000/min (Enterprise) |
| **API Versioning** | URL path (`/api/v1/`) — currently implicit v1 |
| **CORS** | Allowed origins: `*.ecogenie.app` |

### Common Headers

```http
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
Content-Type: application/json
Accept: application/json
X-Request-ID: uuid-v4-tracking-id
```

### Standard Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "emission_kg",
        "message": "Value must be a positive number"
      }
    ]
  },
  "timestamp": "2026-06-11T12:00:00Z"
}
```

### HTTP Status Codes

| Code | Meaning | Usage |
|:----:|---------|-------|
| `200` | OK | Successful GET, PUT, PATCH |
| `201` | Created | Successful POST creating a resource |
| `204` | No Content | Successful DELETE |
| `400` | Bad Request | Validation errors, malformed JSON |
| `401` | Unauthorized | Missing or invalid JWT token |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource does not exist |
| `409` | Conflict | Duplicate resource (e.g., already joined challenge) |
| `422` | Unprocessable Entity | Semantic validation failure |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Unexpected server failure |

---

## 7.2 API Endpoint Map

```mermaid
graph LR
    subgraph "🔐 Authentication"
        AUTH1["POST /auth/register"]
        AUTH2["POST /auth/login"]
    end

    subgraph "📊 Carbon Tracking"
        C1["GET /dashboard"]
        C2["POST /carbon/calculate"]
        C3["GET /carbon/history"]
    end

    subgraph "🤖 AI Services"
        AI1["POST /recommendations"]
        AI2["POST /scan/receipt"]
        AI3["POST /scan/bill"]
        AI4["POST /predict-emissions"]
        AI5["POST /chat"]
        AI6["POST /simulator"]
    end

    subgraph "🎮 Gamification"
        G1["GET /leaderboard"]
        G2["GET /challenges"]
        G3["POST /challenges/:id/join"]
        G4["GET /achievements"]
        G5["GET /rewards"]
    end

    subgraph "👥 Community"
        CM1["GET /community"]
        CM2["POST /community/posts"]
    end

    style AUTH1 fill:#e74c3c,color:#fff
    style C1 fill:#0984e3,color:#fff
    style AI1 fill:#6c5ce7,color:#fff
    style G1 fill:#00b894,color:#fff
    style CM1 fill:#e17055,color:#fff
```

---

## 7.3 Authentication Endpoints

### POST /api/auth/register

Register a new user after Clerk authentication.

**Request:**
```http
POST /api/auth/register HTTP/1.1
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
Content-Type: application/json

{
  "name": "Arjun Mehta",
  "email": "arjun@example.com",
  "city": "Mumbai",
  "age": 28,
  "occupation": "Software Engineer",
  "lifestyle": "moderate",
  "avatar": "https://img.clerk.com/avatar/abc123.jpg"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "email": "arjun@example.com",
      "name": "Arjun Mehta",
      "avatar": "https://img.clerk.com/avatar/abc123.jpg",
      "city": "Mumbai",
      "age": 28,
      "occupation": "Software Engineer",
      "lifestyle": "moderate",
      "total_points": 0,
      "subscription_tier": "free",
      "onboarding_completed": false,
      "created_at": "2026-06-11T12:00:00Z"
    },
    "welcome_message": "Welcome to EcoGenie, Arjun! Let's start your sustainability journey."
  },
  "timestamp": "2026-06-11T12:00:00Z"
}
```

**Error (409 Conflict):**
```json
{
  "success": false,
  "error": {
    "code": "USER_EXISTS",
    "message": "A user with this email already exists"
  },
  "timestamp": "2026-06-11T12:00:00Z"
}
```

---

### POST /api/auth/login

Verify Clerk JWT and return user profile (creates session).

**Request:**
```http
POST /api/auth/login HTTP/1.1
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
Content-Type: application/json

{
  "clerk_session_id": "sess_2hF8kL9..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "email": "arjun@example.com",
      "name": "Arjun Mehta",
      "avatar": "https://img.clerk.com/avatar/abc123.jpg",
      "city": "Mumbai",
      "age": 28,
      "occupation": "Software Engineer",
      "lifestyle": "moderate",
      "total_points": 1250,
      "subscription_tier": "pro",
      "onboarding_completed": true,
      "created_at": "2026-01-15T08:30:00Z",
      "updated_at": "2026-06-10T14:22:00Z"
    },
    "session": {
      "expires_at": "2026-06-12T12:00:00Z"
    }
  },
  "timestamp": "2026-06-11T12:00:00Z"
}
```

---

## 7.4 Dashboard Endpoint

### GET /api/dashboard

Retrieve aggregated dashboard data for the authenticated user.

**Request:**
```http
GET /api/dashboard HTTP/1.1
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | string | `month` | Aggregation period: `week`, `month`, `year` |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_emissions_kg": 487.32,
      "monthly_emissions_kg": 142.65,
      "weekly_emissions_kg": 34.21,
      "daily_average_kg": 4.75,
      "month_over_month_change": -8.3,
      "total_records": 256,
      "carbon_score": 72,
      "global_rank": 1245,
      "total_points": 1250
    },
    "category_breakdown": [
      { "category": "transport", "emission_kg": 58.4, "percentage": 40.9, "record_count": 45 },
      { "category": "energy", "emission_kg": 35.2, "percentage": 24.7, "record_count": 30 },
      { "category": "food", "emission_kg": 28.9, "percentage": 20.3, "record_count": 62 },
      { "category": "shopping", "emission_kg": 12.8, "percentage": 9.0, "record_count": 8 },
      { "category": "waste", "emission_kg": 4.5, "percentage": 3.2, "record_count": 15 },
      { "category": "digital", "emission_kg": 2.85, "percentage": 2.0, "record_count": 96 }
    ],
    "trend_data": [
      { "date": "2026-06-01", "emission_kg": 5.2 },
      { "date": "2026-06-02", "emission_kg": 4.1 },
      { "date": "2026-06-03", "emission_kg": 6.8 },
      { "date": "2026-06-04", "emission_kg": 3.9 },
      { "date": "2026-06-05", "emission_kg": 4.5 },
      { "date": "2026-06-06", "emission_kg": 5.0 },
      { "date": "2026-06-07", "emission_kg": 4.7 }
    ],
    "active_challenges": 2,
    "pending_recommendations": 3,
    "recent_achievements": [
      {
        "badge_name": "Week Warrior",
        "badge_icon": "🗓️",
        "description": "Logged emissions for 7 consecutive days",
        "earned_at": "2026-06-10T18:00:00Z"
      }
    ]
  },
  "timestamp": "2026-06-11T12:00:00Z"
}
```

---

## 7.5 Carbon Tracking Endpoints

### POST /api/carbon/calculate

Calculate and log a carbon emission entry.

**Request:**
```http
POST /api/carbon/calculate HTTP/1.1
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
Content-Type: application/json

{
  "category": "transport",
  "activity": "Car - Petrol (per km)",
  "value": 25,
  "unit": "km",
  "date": "2026-06-11",
  "notes": "Daily commute to office"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "record": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "user_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "category": "transport",
      "activity": "Car - Petrol (per km)",
      "emission_kg": 4.8,
      "date": "2026-06-11",
      "notes": "Daily commute to office",
      "source": "manual",
      "created_at": "2026-06-11T12:30:00Z"
    },
    "calculation": {
      "input_value": 25,
      "unit": "km",
      "emission_factor": 0.192,
      "formula": "25 km × 0.192 kg CO₂/km = 4.800 kg CO₂"
    },
    "context": {
      "equivalent_to": "Charging 590 smartphones",
      "daily_total_kg": 9.55,
      "points_earned": 5,
      "tip": "Consider carpooling to cut this emission in half!"
    }
  },
  "timestamp": "2026-06-11T12:30:00Z"
}
```

---

### GET /api/carbon/history

Retrieve carbon emission history with filters.

**Request:**
```http
GET /api/carbon/history?period=month&category=transport&page=1&limit=20 HTTP/1.1
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | string | `month` | `week`, `month`, `year`, `all` |
| `category` | string | `all` | Filter by emission category |
| `start_date` | string | — | ISO 8601 date (YYYY-MM-DD) |
| `end_date` | string | — | ISO 8601 date (YYYY-MM-DD) |
| `source` | string | `all` | `manual`, `receipt_scan`, `bill_scan`, `prediction` |
| `sort` | string | `date_desc` | `date_desc`, `date_asc`, `emission_desc`, `emission_asc` |
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Records per page (max 100) |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "category": "transport",
        "activity": "Car - Petrol (per km)",
        "emission_kg": 4.8,
        "date": "2026-06-11",
        "notes": "Daily commute to office",
        "source": "manual",
        "created_at": "2026-06-11T12:30:00Z"
      },
      {
        "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        "category": "transport",
        "activity": "Bus (per km)",
        "emission_kg": 1.34,
        "date": "2026-06-10",
        "notes": "Weekend trip to market",
        "source": "manual",
        "created_at": "2026-06-10T09:15:00Z"
      }
    ],
    "summary": {
      "total_emission_kg": 58.4,
      "record_count": 45,
      "avg_per_record_kg": 1.30,
      "highest_day": { "date": "2026-06-03", "emission_kg": 12.5 },
      "lowest_day": { "date": "2026-06-07", "emission_kg": 1.2 }
    },
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_records": 45,
      "limit": 20,
      "has_next": true,
      "has_previous": false
    }
  },
  "timestamp": "2026-06-11T12:35:00Z"
}
```

---

## 7.6 AI Service Endpoints

### POST /api/recommendations

Generate personalized AI recommendations for the user.

**Request:**
```http
POST /api/recommendations HTTP/1.1
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
Content-Type: application/json

{
  "focus_categories": ["transport", "energy"],
  "max_recommendations": 5
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "id": "rec-001-uuid",
        "content": "Switch your daily 25km car commute to the metro line. Based on your history, this could save 3.8 kg CO₂ per day.",
        "category": "transport",
        "priority": "high",
        "potential_savings_kg": 83.6,
        "potential_savings_period": "monthly",
        "difficulty": "medium",
        "status": "pending",
        "confidence_score": 0.92
      },
      {
        "id": "rec-002-uuid",
        "content": "Your energy usage spikes on weekends. Try setting your AC to 24°C instead of 22°C — a 2-degree change can reduce cooling energy by 14%.",
        "category": "energy",
        "priority": "high",
        "potential_savings_kg": 12.4,
        "potential_savings_period": "monthly",
        "difficulty": "easy",
        "status": "pending",
        "confidence_score": 0.88
      },
      {
        "id": "rec-003-uuid",
        "content": "You drove on 18 of the last 20 weekdays. Consider a carpool with colleagues living within 5km of your route.",
        "category": "transport",
        "priority": "medium",
        "potential_savings_kg": 41.8,
        "potential_savings_period": "monthly",
        "difficulty": "medium",
        "status": "pending",
        "confidence_score": 0.85
      },
      {
        "id": "rec-004-uuid",
        "content": "Switch to LED bulbs in your home. Based on average usage patterns, this one-time change saves ~45 kg CO₂ per year.",
        "category": "energy",
        "priority": "medium",
        "potential_savings_kg": 3.75,
        "potential_savings_period": "monthly",
        "difficulty": "easy",
        "status": "pending",
        "confidence_score": 0.95
      },
      {
        "id": "rec-005-uuid",
        "content": "Try cycling for trips under 5km. Your data shows 30% of your car trips are short distances.",
        "category": "transport",
        "priority": "low",
        "potential_savings_kg": 15.2,
        "potential_savings_period": "monthly",
        "difficulty": "medium",
        "status": "pending",
        "confidence_score": 0.78
      }
    ],
    "total_potential_savings_kg": 156.75,
    "ai_model": "ecogenie-rec-v2.1",
    "generated_at": "2026-06-11T12:40:00Z"
  },
  "timestamp": "2026-06-11T12:40:00Z"
}
```

---

### POST /api/scan/receipt

Upload and scan a shopping receipt to extract carbon emissions.

**Request:**
```http
POST /api/scan/receipt HTTP/1.1
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
Content-Type: multipart/form-data

------boundary
Content-Disposition: form-data; name="receipt_image"; filename="receipt.jpg"
Content-Type: image/jpeg

[binary image data]
------boundary
Content-Disposition: form-data; name="date"
Content-Type: text/plain

2026-06-11
------boundary--
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "scan_id": "scan-receipt-uuid-001",
    "status": "completed",
    "store": "Whole Foods Market",
    "date": "2026-06-11",
    "items": [
      {
        "name": "Organic Chicken Breast (1kg)",
        "category": "food",
        "quantity": 1,
        "price": 12.99,
        "emission_kg": 6.9,
        "emission_factor_source": "DEFRA 2025"
      },
      {
        "name": "Basmati Rice (2kg)",
        "category": "food",
        "quantity": 1,
        "price": 5.49,
        "emission_kg": 5.4,
        "emission_factor_source": "DEFRA 2025"
      },
      {
        "name": "Fresh Vegetables (Mixed, 1.5kg)",
        "category": "food",
        "quantity": 1,
        "price": 4.99,
        "emission_kg": 0.6,
        "emission_factor_source": "EPA 2025"
      },
      {
        "name": "Almond Milk (1L)",
        "category": "food",
        "quantity": 2,
        "price": 3.49,
        "emission_kg": 1.4,
        "emission_factor_source": "Poore & Nemecek 2018"
      }
    ],
    "total_emission_kg": 14.3,
    "total_price": 30.45,
    "carbon_records_created": 4,
    "confidence": 0.91,
    "receipt_image_url": "https://s3.ecogenie.app/receipts/scan-receipt-uuid-001.jpg",
    "processing_time_ms": 3200
  },
  "timestamp": "2026-06-11T12:45:00Z"
}
```

---

### POST /api/scan/bill

Upload and analyze a utility bill for emission insights.

**Request:**
```http
POST /api/scan/bill HTTP/1.1
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
Content-Type: multipart/form-data

------boundary
Content-Disposition: form-data; name="bill_image"; filename="electricity_bill.pdf"
Content-Type: application/pdf

[binary PDF data]
------boundary
Content-Disposition: form-data; name="bill_type"
Content-Type: text/plain

electricity
------boundary--
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "scan_id": "scan-bill-uuid-001",
    "status": "completed",
    "bill_type": "electricity",
    "provider": "Mumbai Electric Supply",
    "billing_period": {
      "start": "2026-05-01",
      "end": "2026-05-31"
    },
    "consumption": {
      "value": 320,
      "unit": "kWh",
      "cost": 2480.00,
      "currency": "INR"
    },
    "emission_analysis": {
      "total_emission_kg": 74.56,
      "emission_factor": 0.233,
      "emission_factor_source": "CEA India Grid Factor 2025",
      "daily_average_kg": 2.41,
      "comparison": {
        "national_average_kg": 65.0,
        "difference_percent": 14.7,
        "status": "above_average"
      }
    },
    "recommendations": [
      "Your consumption is 14.7% above the national average. Consider an energy audit.",
      "Switching to a 5-star rated AC could save 80 kWh/month (~18.6 kg CO₂).",
      "Installing solar panels for your rooftop could offset 60% of your consumption."
    ],
    "carbon_record_created": true,
    "confidence": 0.94,
    "processing_time_ms": 4100
  },
  "timestamp": "2026-06-11T12:50:00Z"
}
```

---

### POST /api/predict-emissions

Get AI-predicted future emissions based on behavioral patterns.

**Request:**
```http
POST /api/predict-emissions HTTP/1.1
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
Content-Type: application/json

{
  "prediction_horizon": "3_months",
  "include_breakdown": true,
  "scenario": "current_behavior"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "prediction": {
      "horizon": "3_months",
      "scenario": "current_behavior",
      "predicted_total_kg": 427.5,
      "confidence_interval": {
        "lower_bound_kg": 395.2,
        "upper_bound_kg": 461.8
      },
      "model": "LightGBM v2.3",
      "r_squared": 0.87
    },
    "monthly_predictions": [
      { "month": "2026-07", "predicted_kg": 138.2, "trend": "stable" },
      { "month": "2026-08", "predicted_kg": 145.8, "trend": "rising" },
      { "month": "2026-09", "predicted_kg": 143.5, "trend": "stable" }
    ],
    "category_breakdown": [
      { "category": "transport", "predicted_kg": 175.3, "percentage": 41.0 },
      { "category": "energy", "predicted_kg": 107.5, "percentage": 25.2 },
      { "category": "food", "predicted_kg": 86.9, "percentage": 20.3 },
      { "category": "shopping", "predicted_kg": 38.4, "percentage": 9.0 },
      { "category": "other", "predicted_kg": 19.4, "percentage": 4.5 }
    ],
    "risk_factors": [
      {
        "factor": "Summer AC usage expected to increase energy emissions by ~15%",
        "category": "energy",
        "impact_kg": 16.1
      },
      {
        "factor": "Holiday travel in August may spike transport emissions",
        "category": "transport",
        "impact_kg": 25.0
      }
    ],
    "reduction_opportunities": {
      "if_switch_to_public_transport": -62.4,
      "if_reduce_meat_50_percent": -21.5,
      "if_optimize_ac_temperature": -12.8,
      "total_potential_savings_kg": -96.7
    }
  },
  "timestamp": "2026-06-11T12:55:00Z"
}
```

---

### POST /api/chat (CarbonGPT)

Conversational AI endpoint for sustainability questions and guidance.

**Request:**
```http
POST /api/chat HTTP/1.1
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
Content-Type: application/json

{
  "message": "How much CO₂ does a round-trip flight from Mumbai to London produce, and how can I offset it?",
  "conversation_id": "conv-uuid-001",
  "include_sources": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "response": {
      "message": "A round-trip flight from Mumbai (BOM) to London (LHR) produces approximately **1,840 kg of CO₂** per passenger in economy class. Here's the breakdown:\n\n**Flight Details:**\n- Distance: ~7,200 km one way (14,400 km round trip)\n- Emission factor: 0.128 kg CO₂/passenger-km (long-haul economy)\n- Total: 14,400 × 0.128 = **1,843 kg CO₂**\n\n**For context, this equals:**\n- 🚗 Driving 9,200 km in a petrol car\n- 🌳 What 92 trees absorb in a year\n- 📱 Charging 226,000 smartphones\n\n**Offsetting options:**\n1. **Plant trees**: ~92 trees needed (~$460 via verified programs)\n2. **Renewable energy credits**: ~$25-40 via Gold Standard\n3. **EcoGenie Offset Partners**: We recommend Atmosfair or myclimate\n4. **Behavior change**: Going car-free for 4 months would offset the same amount",
      "conversation_id": "conv-uuid-001",
      "message_id": "msg-uuid-001",
      "model": "gpt-4o",
      "tokens_used": 485
    },
    "sources": [
      { "title": "DEFRA Emission Factors 2025", "url": "https://defra.gov.uk/emission-factors" },
      { "title": "ICAO Carbon Calculator", "url": "https://icao.int/carbon-calculator" },
      { "title": "Gold Standard Offsets", "url": "https://goldstandard.org" }
    ],
    "related_actions": [
      { "action": "Log this flight", "endpoint": "POST /carbon/calculate", "prefill": { "category": "transport", "activity": "International Flight", "emission_kg": 1843 } },
      { "action": "Find offset programs", "endpoint": "GET /rewards?category=donation" }
    ]
  },
  "timestamp": "2026-06-11T13:00:00Z"
}
```

---

### POST /api/simulator

Run carbon simulation scenarios to model lifestyle changes.

**Request:**
```http
POST /api/simulator HTTP/1.1
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
Content-Type: application/json

{
  "scenarios": [
    {
      "name": "Switch to EV",
      "changes": [
        { "category": "transport", "current_activity": "Car - Petrol (per km)", "new_activity": "Car - Electric (per km)", "monthly_usage_km": 500 }
      ]
    },
    {
      "name": "Go Vegetarian",
      "changes": [
        { "category": "food", "current_activity": "Beef (per kg)", "new_activity": "Vegetables (per kg)", "monthly_usage_kg": 8 },
        { "category": "food", "current_activity": "Chicken (per kg)", "new_activity": "Vegetables (per kg)", "monthly_usage_kg": 6 }
      ]
    },
    {
      "name": "Install Solar Panels",
      "changes": [
        { "category": "energy", "current_activity": "Electricity (per kWh)", "new_activity": "Solar Panel (per kWh)", "monthly_usage_kwh": 320 }
      ]
    }
  ],
  "projection_months": 12
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "current_annual_emission_kg": 1710.0,
    "scenarios": [
      {
        "name": "Switch to EV",
        "annual_savings_kg": 834.0,
        "new_annual_emission_kg": 876.0,
        "reduction_percent": 48.8,
        "monthly_breakdown": {
          "current_kg": 96.0,
          "projected_kg": 26.5
        },
        "investment_note": "Average EV cost: $35,000. Fuel savings: ~$2,400/year"
      },
      {
        "name": "Go Vegetarian",
        "annual_savings_kg": 358.8,
        "new_annual_emission_kg": 1351.2,
        "reduction_percent": 21.0,
        "monthly_breakdown": {
          "current_kg": 257.4,
          "projected_kg": 227.5
        },
        "investment_note": "Net savings: ~$600/year on groceries"
      },
      {
        "name": "Install Solar Panels",
        "annual_savings_kg": 817.9,
        "new_annual_emission_kg": 892.1,
        "reduction_percent": 47.8,
        "monthly_breakdown": {
          "current_kg": 74.56,
          "projected_kg": 6.4
        },
        "investment_note": "Avg solar installation: $15,000. Payback period: ~6 years"
      }
    ],
    "combined_impact": {
      "all_changes_annual_savings_kg": 2010.7,
      "new_annual_emission_kg": -300.7,
      "status": "carbon_negative",
      "message": "By implementing all three changes, you would become carbon negative! 🌍🎉"
    }
  },
  "timestamp": "2026-06-11T13:05:00Z"
}
```

---

## 7.7 Gamification Endpoints

### GET /api/leaderboard

Retrieve global or friend-group leaderboard rankings.

**Request:**
```http
GET /api/leaderboard?scope=global&limit=10&period=month HTTP/1.1
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `scope` | string | `global` | `global`, `city`, `friends` |
| `period` | string | `month` | `week`, `month`, `year`, `all` |
| `limit` | integer | 10 | Number of entries (max 100) |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      { "rank": 1, "user_id": "uuid-1", "name": "Priya Sharma", "avatar": "https://...", "city": "Delhi", "points": 4250, "badges": 18, "reduction_percent": 35.2 },
      { "rank": 2, "user_id": "uuid-2", "name": "Alex Chen", "avatar": "https://...", "city": "Singapore", "points": 3890, "badges": 15, "reduction_percent": 31.8 },
      { "rank": 3, "user_id": "uuid-3", "name": "Maria Santos", "avatar": "https://...", "city": "Lisbon", "points": 3720, "badges": 14, "reduction_percent": 29.5 },
      { "rank": 4, "user_id": "uuid-4", "name": "James Wilson", "avatar": "https://...", "city": "London", "points": 3550, "badges": 12, "reduction_percent": 27.1 },
      { "rank": 5, "user_id": "uuid-5", "name": "Yuki Tanaka", "avatar": "https://...", "city": "Tokyo", "points": 3410, "badges": 13, "reduction_percent": 26.4 }
    ],
    "current_user": {
      "rank": 127,
      "points": 1250,
      "badges": 6,
      "reduction_percent": 12.3,
      "points_to_next_rank": 85
    },
    "scope": "global",
    "period": "month",
    "total_participants": 15420
  },
  "timestamp": "2026-06-11T13:10:00Z"
}
```

---

### GET /api/challenges

List available and active eco-challenges.

**Request:**
```http
GET /api/challenges?status=active&category=transport&difficulty=intermediate HTTP/1.1
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "challenges": [
      {
        "id": "chal-uuid-001",
        "title": "Public Transport Champion",
        "description": "Use only public transport for your daily commute for 14 days straight. Track every trip and watch your transport emissions drop!",
        "category": "transport",
        "difficulty": "intermediate",
        "points": 150,
        "duration_days": 14,
        "target_reduction_kg": 20.0,
        "participants_count": 342,
        "status": "active",
        "start_date": "2026-06-01",
        "end_date": "2026-06-30",
        "user_status": "not_joined",
        "completion_rate": 0.68
      },
      {
        "id": "chal-uuid-002",
        "title": "Bike to Work Week",
        "description": "Cycle to work for a full week. Great exercise and zero emissions!",
        "category": "transport",
        "difficulty": "intermediate",
        "points": 120,
        "duration_days": 7,
        "target_reduction_kg": 10.0,
        "participants_count": 189,
        "status": "active",
        "start_date": "2026-06-07",
        "end_date": "2026-06-30",
        "user_status": "not_joined",
        "completion_rate": 0.72
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 1,
      "total_records": 2,
      "limit": 20,
      "has_next": false,
      "has_previous": false
    }
  },
  "timestamp": "2026-06-11T13:15:00Z"
}
```

---

### POST /api/challenges/{id}/join

Join a specific challenge.

**Request:**
```http
POST /api/challenges/chal-uuid-001/join HTTP/1.1
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "participation": {
      "id": "cp-uuid-001",
      "challenge_id": "chal-uuid-001",
      "challenge_title": "Public Transport Champion",
      "user_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "status": "active",
      "progress_kg": 0,
      "target_kg": 20.0,
      "progress_percent": 0,
      "joined_at": "2026-06-11T13:20:00Z",
      "deadline": "2026-06-25T23:59:59Z"
    },
    "message": "You've joined 'Public Transport Champion'! Track your public transport trips to make progress. 🚌"
  },
  "timestamp": "2026-06-11T13:20:00Z"
}
```

**Error (409 Conflict):**
```json
{
  "success": false,
  "error": {
    "code": "ALREADY_JOINED",
    "message": "You have already joined this challenge"
  },
  "timestamp": "2026-06-11T13:20:00Z"
}
```

---

### GET /api/achievements

Retrieve user's earned achievements and available badges.

**Request:**
```http
GET /api/achievements HTTP/1.1
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "earned": [
      {
        "id": "ach-uuid-001",
        "badge_name": "First Step",
        "badge_icon": "🌱",
        "description": "Logged your first carbon emission",
        "category": "milestone",
        "rarity": "common",
        "earned_at": "2026-01-15T09:00:00Z"
      },
      {
        "id": "ach-uuid-002",
        "badge_name": "Week Warrior",
        "badge_icon": "🗓️",
        "description": "Logged emissions for 7 consecutive days",
        "category": "streak",
        "rarity": "uncommon",
        "earned_at": "2026-01-22T18:00:00Z"
      },
      {
        "id": "ach-uuid-003",
        "badge_name": "Carbon Cutter",
        "badge_icon": "✂️",
        "description": "Reduced monthly emissions by 10%",
        "category": "milestone",
        "rarity": "rare",
        "earned_at": "2026-03-01T00:00:00Z"
      },
      {
        "id": "ach-uuid-004",
        "badge_name": "Community Star",
        "badge_icon": "⭐",
        "description": "Received 50 likes on community posts",
        "category": "community",
        "rarity": "uncommon",
        "earned_at": "2026-04-15T12:00:00Z"
      },
      {
        "id": "ach-uuid-005",
        "badge_name": "Challenge Champion",
        "badge_icon": "🏆",
        "description": "Completed 5 eco-challenges",
        "category": "challenge",
        "rarity": "rare",
        "earned_at": "2026-05-20T10:00:00Z"
      },
      {
        "id": "ach-uuid-006",
        "badge_name": "EcoGenie Master",
        "badge_icon": "🧞",
        "description": "Reached 1000 total points",
        "category": "milestone",
        "rarity": "epic",
        "earned_at": "2026-06-05T16:30:00Z"
      }
    ],
    "total_earned": 6,
    "total_available": 35,
    "next_milestone": {
      "badge_name": "Month Marathoner",
      "badge_icon": "📅",
      "description": "Log emissions for 30 consecutive days",
      "progress": "23/30 days",
      "progress_percent": 76.7
    }
  },
  "timestamp": "2026-06-11T13:25:00Z"
}
```

---

### GET /api/rewards

Browse available rewards in the rewards store.

**Request:**
```http
GET /api/rewards?category=food&sort=points_asc HTTP/1.1
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "rewards": [
      {
        "id": "rw-uuid-001",
        "name": "10% Off at GreenBites Café",
        "description": "Get 10% off your next meal at any GreenBites location. Valid for plant-based menu items.",
        "points_required": 200,
        "partner": "GreenBites Café",
        "discount_percent": 10.0,
        "category": "food",
        "is_active": true,
        "stock_count": 450,
        "valid_until": "2026-12-31"
      },
      {
        "id": "rw-uuid-002",
        "name": "Free Organic Smoothie",
        "description": "Redeem for a free organic smoothie at participating EcoJuice bars.",
        "points_required": 350,
        "partner": "EcoJuice",
        "discount_percent": 100.0,
        "category": "food",
        "is_active": true,
        "stock_count": 200,
        "valid_until": "2026-09-30"
      }
    ],
    "user_points": 1250,
    "pagination": {
      "current_page": 1,
      "total_pages": 1,
      "total_records": 2,
      "limit": 20,
      "has_next": false,
      "has_previous": false
    }
  },
  "timestamp": "2026-06-11T13:30:00Z"
}
```

---

## 7.8 Community Endpoints

### GET /api/community

Retrieve the community social feed.

**Request:**
```http
GET /api/community?page=1&limit=10&post_type=all HTTP/1.1
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "post-uuid-001",
        "user": {
          "id": "uuid-user-1",
          "name": "Priya Sharma",
          "avatar": "https://img.clerk.com/priya.jpg"
        },
        "content": "Just completed the Meatless Monday challenge! 🥦🌿 Saved 12kg of CO₂ this month by going plant-based every Monday. Who's joining me next month?",
        "image_url": null,
        "post_type": "achievement",
        "likes": 47,
        "comments_count": 8,
        "is_liked_by_user": true,
        "created_at": "2026-06-11T10:30:00Z"
      },
      {
        "id": "post-uuid-002",
        "user": {
          "id": "uuid-user-2",
          "name": "Alex Chen",
          "avatar": "https://img.clerk.com/alex.jpg"
        },
        "content": "Pro tip: I started using the receipt scanner for all my grocery shopping. It's amazing how much you learn about the carbon footprint of different foods. Beef vs. lentils is mind-blowing! 🔍",
        "image_url": "https://s3.ecogenie.app/posts/alex-tip-001.jpg",
        "post_type": "tip",
        "likes": 32,
        "comments_count": 5,
        "is_liked_by_user": false,
        "created_at": "2026-06-11T08:15:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 45,
      "total_records": 442,
      "limit": 10,
      "has_next": true,
      "has_previous": false
    }
  },
  "timestamp": "2026-06-11T13:35:00Z"
}
```

---

### POST /api/community/posts

Create a new community post.

**Request:**
```http
POST /api/community/posts HTTP/1.1
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
Content-Type: application/json

{
  "content": "Switched to cycling for my daily commute this week! 🚴‍♂️ Already saved 15kg CO₂ and feeling healthier too. #EcoCommute #GreenTravel",
  "post_type": "milestone",
  "visibility": "public",
  "image_url": null
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "post": {
      "id": "post-uuid-new",
      "user": {
        "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        "name": "Arjun Mehta",
        "avatar": "https://img.clerk.com/arjun.jpg"
      },
      "content": "Switched to cycling for my daily commute this week! 🚴‍♂️ Already saved 15kg CO₂ and feeling healthier too. #EcoCommute #GreenTravel",
      "image_url": null,
      "post_type": "milestone",
      "visibility": "public",
      "likes": 0,
      "comments_count": 0,
      "created_at": "2026-06-11T13:40:00Z"
    },
    "points_earned": 10,
    "message": "Post shared with the community! +10 points 🎉"
  },
  "timestamp": "2026-06-11T13:40:00Z"
}
```

---

## 7.9 API Rate Limiting

```mermaid
graph LR
    subgraph "Rate Limit Tiers"
        FREE["🆓 Free Tier<br/>100 req/min<br/>1,000 req/day<br/>5 AI calls/day"]
        PRO["⭐ Pro Tier<br/>500 req/min<br/>10,000 req/day<br/>50 AI calls/day"]
        ENT["🏢 Enterprise<br/>2,000 req/min<br/>100,000 req/day<br/>Unlimited AI"]
    end

    FREE --> |"Upgrade"| PRO --> |"Upgrade"| ENT

    style FREE fill:#95a5a6,color:#fff
    style PRO fill:#f39c12,color:#fff
    style ENT fill:#8e44ad,color:#fff
```

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1718107200
Retry-After: 30
```

---

**© 2026 EcoGenie — API Design Document v1.0**
