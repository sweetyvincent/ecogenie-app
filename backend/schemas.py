import datetime
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field


# ── User Schemas ──
class UserBase(BaseModel):
  email: EmailStr
  name: str = Field(..., max_length=128)
  city: Optional[str] = Field(None, max_length=128)
  age: Optional[int] = Field(None, ge=0, le=120)
  occupation: Optional[str] = Field(None, max_length=128)
  lifestyle: Optional[str] = Field(None, max_length=128)


class UserCreate(UserBase):
  password: str = Field(..., min_length=6, max_length=128)


class UserLogin(BaseModel):
  email: EmailStr
  password: str = Field(..., max_length=128)


class UserResponse(UserBase):
  id: UUID
  total_points: int
  subscription_tier: str
  onboarding_completed: bool
  created_at: datetime.datetime

  class Config:
    from_attributes = True


class Token(BaseModel):
  access_token: str
  token_type: str = "bearer"


class TokenData(BaseModel):
  email: Optional[str] = None


class OnboardingPreferences(BaseModel):
  transportMode: str = Field(..., max_length=64)
  dailyCommute: float = Field(..., ge=0, le=1000)
  dietType: str = Field(..., max_length=64)
  homeSize: str = Field(..., max_length=64)
  electricityKwh: float = Field(..., ge=0, le=100000)
  waterLiters: float = Field(..., ge=0, le=100000)
  shoppingFrequency: str = Field(..., max_length=64)


class OnboardingRequest(BaseModel):
  name: str = Field(..., max_length=128)
  location: str = Field(..., max_length=128)
  preferences: OnboardingPreferences


# ── Carbon Record Schemas ──
class CarbonRecordBase(BaseModel):
  category: str = Field(..., max_length=64)
  activity: str = Field(..., max_length=256)
  emission_kg: float = Field(..., ge=0)
  date: Optional[datetime.date] = None
  notes: Optional[str] = Field(None, max_length=512)
  source: Optional[str] = Field("manual", max_length=64)


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
  message: str = Field(..., max_length=1000)
  context: Optional[dict] = {}


class ChatResponse(BaseModel):
  response: str
  suggestedFollowups: List[str]
