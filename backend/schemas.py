import datetime
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field


# ── User Schemas ──
class UserBase(BaseModel):
  email: EmailStr
  name: str
  city: Optional[str] = None
  age: Optional[int] = None
  occupation: Optional[str] = None
  lifestyle: Optional[str] = None


class UserCreate(UserBase):
  password: str


class UserLogin(BaseModel):
  email: EmailStr
  password: str


class UserResponse(UserBase):
  id: UUID
  total_points: int
  subscription_tier: str
  onboarding_completed: bool
  created_at: datetime.datetime

  class Config:
    from_attributes = True


class OnboardingPreferences(BaseModel):
  transportMode: str
  dailyCommute: float
  dietType: str
  homeSize: str
  electricityKwh: float
  waterLiters: float
  shoppingFrequency: str


class OnboardingRequest(BaseModel):
  name: str
  location: str
  preferences: OnboardingPreferences


# ── Carbon Record Schemas ──
class CarbonRecordBase(BaseModel):
  category: str
  activity: str
  emission_kg: float
  date: Optional[datetime.date] = None
  notes: Optional[str] = None
  source: Optional[str] = "manual"


class CarbonRecordCreate(CarbonRecordBase):
  pass


class CarbonRecordResponse(CarbonRecordBase):
  id: UUID
  user_id: UUID
  created_at: datetime.datetime

  class Config:
    from_attributes = True


# ── Carbon Calculation Schemas ──
class ActivityInput(BaseModel):
  type: str
  kg: Optional[float] = None
  distanceKm: Optional[float] = None
  kwh: Optional[float] = None
  liters: Optional[float] = None
  quantity: Optional[float] = None
  method: Optional[str] = None


class CalculateCarbonRequest(BaseModel):
  transport: Optional[List[ActivityInput]] = []
  electricity: Optional[ActivityInput] = None
  water: Optional[ActivityInput] = None
  food: Optional[List[ActivityInput]] = []
  shopping: Optional[List[ActivityInput]] = []
  waste: Optional[ActivityInput] = None


class CategoryBreakdown(BaseModel):
  transport: float
  electricity: float
  water: float
  food: float
  shopping: float
  waste: float


class CarbonCalculationResponse(BaseModel):
  daily: float
  weekly: float
  monthly: float
  annual: float
  breakdown: CategoryBreakdown


# ── Recommendation Schemas ──
class RecommendationResponse(BaseModel):
  id: UUID
  content: str
  category: str
  priority: str
  status: str
  potential_savings_kg: Optional[float] = None
  confidence_score: Optional[float] = None
  created_at: datetime.datetime

  class Config:
    from_attributes = True


# ── OCR Scanner Schemas ──
class ScanReceiptResponse(BaseModel):
  merchant: str
  date: datetime.date
  items: List[dict]
  estimated_emissions_kg: float
  sustainability_score: int


class ScanBillResponse(BaseModel):
  billing_period: str
  kwh_used: float
  estimated_emissions_kg: float
  potential_savings_usd: float
  recommendations: List[str]


# ── Prediction Schemas ──
class EmissionForecastPoint(BaseModel):
  date: datetime.date
  predicted_emission_kg: float


class EmissionPredictionResponse(BaseModel):
  historical_avg_daily: float
  predicted_next_month_total: float
  trend: str
  anomalies_detected: List[str]
  forecast: List[EmissionForecastPoint]


# ── CarbonGPT Chat Schemas ──
class ChatRequest(BaseModel):
  message: str
  context: Optional[dict] = {}


class ChatResponse(BaseModel):
  response: str
  suggestedFollowups: List[str]
