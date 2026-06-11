import datetime
import random
import uuid
from typing import Dict, List, Optional
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

# Import db modules
from database import engine, get_db
from models import Base, User, CarbonRecord, Recommendation
from schemas import (
    CalculateCarbonRequest,
    CarbonCalculationResponse,
    CategoryBreakdown,
    ChatRequest,
    ChatResponse,
    EmissionForecastPoint,
    EmissionPredictionResponse,
    OnboardingRequest,
    RecommendationResponse,
    ScanBillResponse,
    ScanReceiptResponse,
    UserCreate,
    UserLogin,
    UserResponse,
)

# Initialize FastAPI App
app = FastAPI(
    title="EcoGenie Backend Service",
    description="Asynchronous core service supporting calculations, predictions, scanning OCR, and CarbonGPT conversations",
    version="1.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For demo / hackathon purposes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create Database tables automatically on startup
try:
  Base.metadata.create_all(bind=engine)
except Exception as e:
  print(f"Postgres Connection failed: {e}. Running in memory-fallback mode.")

# Mock in-memory DB for fallback when PostgreSQL is unavailable
in_memory_users: Dict[str, dict] = {}


# Health Check
@app.get("/health", status_code=status.HTTP_200_OK)
def health_check():
  return {"status": "healthy", "timestamp": datetime.datetime.utcnow()}


# ── Auth Endpoints ──
@app.post("/api/auth/register", response_model=UserResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
  # Check if email exists
  try:
    db_user = db.query(User).filter(User.email == user_data.email).first()
    if db_user:
      raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        email=user_data.email,
        name=user_data.name,
        total_points=0,
        subscription_tier="free",
        onboarding_completed=False,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user
  except Exception:
    # Memory fallback
    if user_data.email in in_memory_users:
      raise HTTPException(status_code=400, detail="Email already registered")
    user_id = uuid.uuid4()
    new_user = {
        "id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "city": None,
        "age": None,
        "occupation": None,
        "lifestyle": None,
        "total_points": 0,
        "subscription_tier": "free",
        "onboarding_completed": False,
        "created_at": datetime.datetime.utcnow(),
    }
    in_memory_users[user_data.email] = new_user
    return new_user


@app.post("/api/auth/login", response_model=UserResponse)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
  try:
    db_user = db.query(User).filter(User.email == user_data.email).first()
    if not db_user:
      raise HTTPException(status_code=400, detail="Invalid email or password")
    return db_user
  except Exception:
    # Memory fallback
    user = in_memory_users.get(user_data.email)
    if not user:
      raise HTTPException(status_code=400, detail="Invalid email or password")
    return user


# ── Dashboard & Profile ──
@app.post("/api/onboarding", response_model=UserResponse)
def onboarding(req: OnboardingRequest, email: str, db: Session = Depends(get_db)):
  try:
    user = db.query(User).filter(User.email == email).first()
    if not user:
      raise HTTPException(status_code=404, detail="User not found")

    user.name = req.name
    user.city = req.location
    user.lifestyle = "eco-conscious"
    user.onboarding_completed = True
    user.total_points = 100  # Welcome points

    # Save initial carbon baseline record
    baseline = CarbonRecord(
        user_id=user.id,
        category="other",
        activity="Initial baseline assessment",
        emission_kg=12.5,
        notes=f"Commute: {req.preferences.dailyCommute}km. Diet: {req.preferences.dietType}.",
        source="manual",
    )
    db.add(baseline)

    # Award welcome achievement badge
    db.commit()
    db.refresh(user)
    return user
  except Exception:
    user = in_memory_users.get(email)
    if not user:
      raise HTTPException(status_code=404, detail="User not found")
    user["name"] = req.name
    user["city"] = req.location
    user["lifestyle"] = "eco-conscious"
    user["onboarding_completed"] = True
    user["total_points"] = 100
    return user


@app.get("/api/dashboard")
def get_dashboard_summary(email: str, db: Session = Depends(get_db)):
  # Baselines
  daily_emissions = 12.4
  weekly_emissions = 86.8
  annual_emissions = 4526.0

  return {
      "user": {"name": "Eco Explorer", "level": 3, "points": 350, "streak": 5},
      "emissions": {
          "daily": daily_emissions,
          "weekly": weekly_emissions,
          "annual": annual_emissions,
          "percent_change_weekly": -12.4,
          "eco_score": 78,
          "grade": "B",
      },
      "breakdown": {
          "transport": 4.2,
          "electricity": 3.8,
          "water": 0.2,
          "food": 2.4,
          "shopping": 1.2,
          "waste": 0.6,
      },
  }


# ── Carbon Footprint Calculations ──
@app.post("/api/carbon/calculate", response_model=CarbonCalculationResponse)
def calculate_footprint(req: CalculateCarbonRequest):
  # Emission coefficients mapping
  factors = {
      "car_petrol": 0.21,
      "car_diesel": 0.17,
      "car_electric": 0.05,
      "bus": 0.089,
      "train": 0.041,
      "metro": 0.033,
      "motorcycle": 0.113,
      "electricity": 0.42,
      "water": 0.000298,
      "beef": 27.0,
      "chicken": 6.9,
      "fish": 6.1,
      "vegetables": 2.0,
      "legumes": 0.9,
      "dairy": 3.2,
      "clothing": 10.0,
      "electronics": 50.0,
      "groceries": 2.0,
      "landfill": 0.58,
      "recycled": 0.02,
  }

  t_emissions = 0.0
  for t in req.transport:
    t_emissions += factors.get(t.type, 0.21) * (t.distanceKm or 0.0)

  e_emissions = 0.0
  if req.electricity:
    e_emissions += factors.get("electricity") * (req.electricity.kwh or 0.0)

  w_emissions = 0.0
  if req.water:
    w_emissions += factors.get("water") * (req.water.liters or 0.0)

  f_emissions = 0.0
  for f in req.food:
    f_emissions += factors.get(f.type, 2.0) * (f.kg or 0.0)

  s_emissions = 0.0
  for s in req.shopping:
    s_emissions += factors.get(s.type, 2.0) * (s.quantity or 1.0)

  waste_emissions = 0.0
  if req.waste:
    waste_emissions += factors.get(req.waste.method, 0.58) * (req.waste.kg or 0.0)

  daily_total = (
      t_emissions + e_emissions + w_emissions + f_emissions + s_emissions + waste_emissions
  )
  if daily_total == 0.0:
    daily_total = 12.4  # Fallback to average

  return CarbonCalculationResponse(
      daily=daily_total,
      weekly=daily_total * 7,
      monthly=daily_total * 30,
      annual=daily_total * 365,
      breakdown=CategoryBreakdown(
          transport=max(0.1, t_emissions),
          electricity=max(0.1, e_emissions),
          water=max(0.05, w_emissions),
          food=max(0.1, f_emissions),
          shopping=max(0.1, s_emissions),
          waste=max(0.05, waste_emissions),
      ),
  )


# ── AI Coach & Recommendations ──
@app.get("/api/recommendations", response_model=List[RecommendationResponse])
def get_recommendations(email: str, db: Session = Depends(get_db)):
  # Simulated recommendations list
  mock_recs = [
      {
          "id": uuid.uuid4(),
          "content": "Switch public transport for your daily commute to save 4.2kg CO2 per day.",
          "category": "transport",
          "priority": "high",
          "status": "pending",
          "potential_savings_kg": 4.2,
          "confidence_score": 0.94,
          "created_at": datetime.datetime.utcnow(),
      },
      {
          "id": uuid.uuid4(),
          "content": "Reduce AC usage by 1 hour daily to trim 1.5kg CO2 and save $12/month on utility bill.",
          "category": "energy",
          "priority": "medium",
          "status": "pending",
          "potential_savings_kg": 1.5,
          "confidence_score": 0.88,
          "created_at": datetime.datetime.utcnow(),
      },
      {
          "id": uuid.uuid4(),
          "content": "Incorporate meatless vegetarian meals twice a week to reduce agricultural food footprint by 8.4kg CO2.",
          "category": "food",
          "priority": "high",
          "status": "pending",
          "potential_savings_kg": 8.4,
          "confidence_score": 0.95,
          "created_at": datetime.datetime.utcnow(),
      },
  ]
  return mock_recs


# ── Smart Scanning OCR Endpoints ──
@app.post("/api/scan/receipt", response_model=ScanReceiptResponse)
def scan_receipt():
  # Mocking OCR line item extraction
  items = [
      {"name": "Organic Almond Milk", "price": 4.29, "emissions_kg": 0.7, "score": 85},
      {"name": "Grass-Fed Beef Ribeye", "price": 18.99, "emissions_kg": 14.2, "score": 20},
      {"name": "Local Seasonal Apples", "price": 3.49, "emissions_kg": 0.3, "score": 92},
      {"name": "Recycled Trash Bags", "price": 5.99, "emissions_kg": 0.8, "score": 78},
  ]
  return ScanReceiptResponse(
      merchant="Whole Foods Market",
      date=datetime.date.today(),
      items=items,
      estimated_emissions_kg=16.0,
      sustainability_score=68,
  )


@app.post("/api/scan/bill", response_model=ScanBillResponse)
def scan_bill():
  # Mocking electric bill energy OCR analysis
  return ScanBillResponse(
      billing_period="May 2026",
      kwh_used=312.4,
      estimated_emissions_kg=131.2,
      potential_savings_usd=18.50,
      recommendations=[
          "Unplug phantom chargers and electronics during sleep cycles.",
          "Optimize smart thermostat schedules to lower AC during peak daytime hours.",
      ],
  )


# ── AI Behavioral Predictions ──
@app.post("/api/predict-emissions", response_model=EmissionPredictionResponse)
def predict_emissions():
  today = datetime.date.today()
  forecast = []

  # Generate 30-day forecast points using baseline emissions + random adjustments
  for i in range(1, 31):
    day = today + datetime.timedelta(days=i)
    base = 12.4
    # Simulate slightly lower weekend travel footprint
    if day.weekday() >= 5:
      base -= 2.5
    forecast.append(
        EmissionForecastPoint(
            date=day, predicted_emission_kg=round(base + random.uniform(-1.0, 1.0), 2)
        )
    )

  return EmissionPredictionResponse(
      historical_avg_daily=12.4,
      predicted_next_month_total=341.2,
      trend="Decreasing",
      anomalies_detected=[
          "Spike in transport emissions detected on Tuesday due to extra highway commute."
      ],
      forecast=forecast,
  )


# ── CarbonGPT AI Chatbot ──
@app.post("/api/chat", response_model=ChatResponse)
def chat_sustainability_coach(req: ChatRequest):
  msg = req.message.lower()

  responses = {
      "commute": (
          "Biking or walking instead of driving is the single most effective transit shift. Biking produces "
          "**zero direct emissions**! If you substitute a 15km car ride for public transit or rail, you will "
          "save approximately **3.2kg CO2** immediately!"
      ),
      "diet": (
          "Beef has a carbon footprint of **27kg CO2 per kg**, compared to only **2kg per kg** for fresh vegetables. "
          "By switching even just one meal a day from red meat to beans, legumes, or local produce, you can cut your food emissions by up to **60%**!"
      ),
      "energy": (
          "Electricity grid generation averages **0.42kg CO2 per kWh**. Turning your air conditioner up by 1 degree, "
          "unplugging phantom appliances, and cleaning smart filters can easily shave **10-15%** off your monthly power emissions."
      ),
      "onboarding": (
          "EcoGenie initializes your personal dashboard tracking carbon logs across Transport, Energy, Water, Diet, "
          "Shopping, and Waste. Log activities, test simulator scenarios, and check in with me anytime for sustainability help!"
      ),
  }

  resp_text = (
      "I am your AI Coach, CarbonGPT! I can help analyze your carbon footprint. Ask me about **commute** alternatives, "
      "plant-based **diet** changes, or **energy** optimizations in your household."
  )
  suggested = ["Tips to save energy", "Is chicken better than beef?", "Public transit vs driving"]

  if "commute" in msg or "transport" in msg or "car" in msg or "bike" in msg:
    resp_text = responses["commute"]
    suggested = ["Calculate transport", "EV vs gasoline emissions", "How does public transit help?"]
  elif "diet" in msg or "food" in msg or "meat" in msg or "beef" in msg:
    resp_text = responses["diet"]
    suggested = ["Vegan vs meat footprint", "Log a veggie meal", "Almond vs dairy milk impact"]
  elif "energy" in msg or "ac" in msg or "electricity" in msg or "solar" in msg:
    resp_text = responses["energy"]
    suggested = ["Home utility scanner", "What is my energy score?", "Renewable energy factors"]

  return ChatResponse(response=resp_text, suggestedFollowups=suggested)


# Run Server locally (e.g. `python main.py` for testing)
if __name__ == "__main__":
  import uvicorn

  uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
