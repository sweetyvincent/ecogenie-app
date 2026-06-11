import datetime
import uuid
from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
  __tablename__ = "users"

  id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
  email = Column(String(255), unique=True, nullable=False, index=True)
  name = Column(String(150), nullable=False)
  avatar = Column(String(500))
  city = Column(String(100))
  age = Column(Integer)
  occupation = Column(String(100))
  lifestyle = Column(String(50))
  total_points = Column(Integer, default=0, nullable=False)
  subscription_tier = Column(String(20), default="free", nullable=False)
  clerk_user_id = Column(String(255), unique=True)
  onboarding_completed = Column(Boolean, default=False, nullable=False)
  created_at = Column(
      DateTime(timezone=True), default=datetime.datetime.utcnow, nullable=False
  )
  updated_at = Column(
      DateTime(timezone=True), default=datetime.datetime.utcnow, nullable=False
  )

  # Relationships
  records = relationship("CarbonRecord", back_populates="user", cascade="all, delete-orphan")
  achievements = relationship("Achievement", back_populates="user", cascade="all, delete-orphan")
  recommendations = relationship("Recommendation", back_populates="user", cascade="all, delete-orphan")
  posts = relationship("CommunityPost", back_populates="user", cascade="all, delete-orphan")


class CarbonRecord(Base):
  __tablename__ = "carbon_records"

  id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
  user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
  category = Column(String(50), nullable=False)
  activity = Column(String(200), nullable=False)
  emission_kg = Column(Numeric(10, 4), nullable=False)
  date = Column(Date, default=datetime.date.today, nullable=False)
  notes = Column(Text)
  source = Column(String(50), default="manual")
  created_at = Column(
      DateTime(timezone=True), default=datetime.datetime.utcnow, nullable=False
  )

  # Relationships
  user = relationship("User", back_populates="records")


class Activity(Base):
  __tablename__ = "activities"

  id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
  name = Column(String(200), unique=True, nullable=False, index=True)
  category = Column(String(50), nullable=False)
  emission_factor = Column(Numeric(10, 6), nullable=False)
  unit = Column(String(50), nullable=False)
  description = Column(Text)
  is_active = Column(Boolean, default=True, nullable=False)
  data_source = Column(String(200))
  last_verified = Column(Date)
  created_at = Column(
      DateTime(timezone=True), default=datetime.datetime.utcnow, nullable=False
  )


class Challenge(Base):
  __tablename__ = "challenges"

  id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
  title = Column(String(200), nullable=False)
  description = Column(Text, nullable=False)
  category = Column(String(50), nullable=False)
  difficulty = Column(String(20), nullable=False)
  points = Column(Integer, nullable=False)
  duration_days = Column(Integer, nullable=False)
  target_reduction_kg = Column(Numeric(10, 2), nullable=False)
  max_participants = Column(Integer)
  status = Column(String(20), default="active", nullable=False)
  start_date = Column(Date)
  end_date = Column(Date)
  created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
  created_at = Column(
      DateTime(timezone=True), default=datetime.datetime.utcnow, nullable=False
  )


class Achievement(Base):
  __tablename__ = "achievements"

  id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
  user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
  badge_name = Column(String(100), nullable=False)
  badge_icon = Column(String(50), nullable=False)
  description = Column(Text, nullable=False)
  category = Column(String(50))
  rarity = Column(String(20), default="common")
  earned_at = Column(
      DateTime(timezone=True), default=datetime.datetime.utcnow, nullable=False
  )

  user = relationship("User", back_populates="achievements")


class Recommendation(Base):
  __tablename__ = "recommendations"

  id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
  user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
  content = Column(Text, nullable=False)
  category = Column(String(50), nullable=False)
  priority = Column(String(20), default="medium", nullable=False)
  status = Column(String(20), default="pending", nullable=False)
  potential_savings_kg = Column(Numeric(10, 2))
  ai_model_version = Column(String(50))
  confidence_score = Column(Numeric(5, 4))
  created_at = Column(
      DateTime(timezone=True), default=datetime.datetime.utcnow, nullable=False
  )
  acted_at = Column(DateTime(timezone=True))

  user = relationship("User", back_populates="recommendations")


class CommunityPost(Base):
  __tablename__ = "community_posts"

  id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
  user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
  content = Column(Text, nullable=False)
  image_url = Column(String(500))
  likes = Column(Integer, default=0, nullable=False)
  comments_count = Column(Integer, default=0, nullable=False)
  post_type = Column(String(30), default="general")
  visibility = Column(String(20), default="public")
  is_pinned = Column(Boolean, default=False, nullable=False)
  is_flagged = Column(Boolean, default=False, nullable=False)
  created_at = Column(
      DateTime(timezone=True), default=datetime.datetime.utcnow, nullable=False
  )
  updated_at = Column(
      DateTime(timezone=True), default=datetime.datetime.utcnow, nullable=False
  )

  user = relationship("User", back_populates="posts")


class Reward(Base):
  __tablename__ = "rewards"

  id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
  name = Column(String(200), nullable=False)
  description = Column(Text, nullable=False)
  points_required = Column(Integer, nullable=False)
  partner = Column(String(200), nullable=False)
  discount_percent = Column(Numeric(5, 2))
  category = Column(String(50), nullable=False)
  redemption_code = Column(String(100))
  terms_conditions = Column(Text)
  is_active = Column(Boolean, default=True, nullable=False)
  stock_count = Column(Integer)
  valid_from = Column(Date)
  valid_until = Column(Date)
  created_at = Column(
      DateTime(timezone=True), default=datetime.datetime.utcnow, nullable=False
  )


class MarketplaceProduct(Base):
  __tablename__ = "marketplace_products"

  id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
  name = Column(String(200), nullable=False)
  description = Column(Text, nullable=False)
  price = Column(Numeric(10, 2), nullable=False)
  sustainability_score = Column(Integer, nullable=False)
  category = Column(String(50), nullable=False)
  image_url = Column(String(500))
  carbon_saved_kg = Column(Numeric(10, 2), default=0, nullable=False)
  seller = Column(String(200))
  rating = Column(Numeric(3, 2))
  review_count = Column(Integer, default=0, nullable=False)
  in_stock = Column(Boolean, default=True, nullable=False)
  affiliate_url = Column(String(500))
  eco_certifications = Column(ARRAY(String))
  created_at = Column(
      DateTime(timezone=True), default=datetime.datetime.utcnow, nullable=False
  )
  updated_at = Column(
      DateTime(timezone=True), default=datetime.datetime.utcnow, nullable=False
  )
