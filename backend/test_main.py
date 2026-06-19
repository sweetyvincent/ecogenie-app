import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_register_and_login():
    # Test register
    user_email = "testuser@ecogenie.app"
    register_payload = {
        "email": user_email,
        "name": "Test User",
        "password": "securepassword123"
    }
    
    # We clear in_memory_users to avoid conflicts if test runs multiple times
    from main import in_memory_users
    in_memory_users.pop(user_email, None)
    
    response = client.post("/api/auth/register", json=register_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == user_email
    assert data["name"] == "Test User"
    assert data["subscription_tier"] == "free"
    
    # Test login
    login_payload = {
        "email": user_email,
        "password": "securepassword123"
    }
    response = client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 200
    login_data = response.json()
    assert "access_token" in login_data
    assert login_data["token_type"] == "bearer"

def test_onboarding():
    # Register first
    user_email = "onboard_user@ecogenie.app"
    register_payload = {
        "email": user_email,
        "name": "Onboarding User",
        "password": "securepassword123"
    }
    
    from main import in_memory_users
    in_memory_users.pop(user_email, None)
    
    client.post("/api/auth/register", json=register_payload)
    
    # Test onboarding
    onboard_payload = {
        "name": "Eco Enthusiast",
        "location": "San Francisco",
        "preferences": {
            "transportMode": "car_petrol",
            "dailyCommute": 15.0,
            "dietType": "vegetarian",
            "homeSize": "medium",
            "electricityKwh": 150.0,
            "waterLiters": 120.0,
            "shoppingFrequency": "weekly"
        }
    }
    response = client.post(f"/api/onboarding?email={user_email}", json=onboard_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Eco Enthusiast"
    assert data["city"] == "San Francisco"
    assert data["onboarding_completed"] is True
    assert data["total_points"] == 100

def test_get_dashboard_summary():
    response = client.get("/api/dashboard?email=testuser@ecogenie.app")
    assert response.status_code == 200
    data = response.json()
    assert "user" in data
    assert "emissions" in data
    assert "breakdown" in data
    assert data["emissions"]["eco_score"] == 78

def test_calculate_footprint():
    payload = {
        "transport": [
            {"type": "car_petrol", "distanceKm": 10},
            {"type": "bus", "distanceKm": 20}
        ],
        "electricity": {"type": "electricity", "kwh": 50},
        "water": {"type": "water", "liters": 150},
        "food": [
            {"type": "beef", "kg": 0.5},
            {"type": "vegetables", "kg": 1.0}
        ],
        "shopping": [
            {"type": "clothing", "quantity": 1}
        ],
        "waste": {"type": "waste", "kg": 5, "method": "landfill"}
    }
    response = client.post("/api/carbon/calculate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "daily" in data
    assert "weekly" in data
    assert "annual" in data
    assert "breakdown" in data
    assert data["daily"] > 0

def test_get_recommendations():
    response = client.get("/api/recommendations?email=testuser@ecogenie.app")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "content" in data[0]

def test_scan_endpoints():
    # Receipt scan
    response = client.post("/api/scan/receipt")
    assert response.status_code == 200
    data = response.json()
    assert "merchant" in data
    assert "estimated_emissions_kg" in data
    assert len(data["items"]) > 0
    
    # Bill scan
    response = client.post("/api/scan/bill")
    assert response.status_code == 200
    bill_data = response.json()
    assert "billing_period" in bill_data
    assert "kwh_used" in bill_data
    assert len(bill_data["recommendations"]) > 0

def test_predict_emissions():
    response = client.post("/api/predict-emissions")
    assert response.status_code == 200
    data = response.json()
    assert "historical_avg_daily" in data
    assert "trend" in data
    assert len(data["forecast"]) == 30

def test_chat_sustainability_coach():
    # Test transport-related chat query
    payload = {"message": "How does public transit help my commute?"}
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "commute" in data["response"] or "transit" in data["response"] or "Biking" in data["response"]
    
    # Test fallback response
    payload = {"message": "unrelated topic"}
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "CarbonGPT" in data["response"]


def test_register_duplicate_email():
    """Test that registering with duplicate email returns 400."""
    user_email = "duplicate@ecogenie.app"
    payload = {"email": user_email, "name": "Dup User", "password": "password123"}
    from main import in_memory_users
    in_memory_users.pop(user_email, None)
    client.post("/api/auth/register", json=payload)
    # Try again with same email
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]


def test_login_invalid_email():
    """Test login with non-existent email returns 401."""
    payload = {"email": "nonexistent@ecogenie.app", "password": "password123"}
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 401


def test_login_wrong_password():
    """Test login with wrong password returns 401."""
    user_email = "wrongpw@ecogenie.app"
    from main import in_memory_users
    in_memory_users.pop(user_email, None)
    client.post("/api/auth/register", json={"email": user_email, "name": "Test", "password": "correct_password"})
    response = client.post("/api/auth/login", json={"email": user_email, "password": "wrong_password"})
    assert response.status_code == 401


def test_login_returns_token():
    """Test successful login returns JWT access token."""
    user_email = "tokenuser@ecogenie.app"
    from main import in_memory_users
    in_memory_users.pop(user_email, None)
    client.post("/api/auth/register", json={"email": user_email, "name": "Token User", "password": "securepass123"})
    response = client.post("/api/auth/login", json={"email": user_email, "password": "securepass123"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_calculate_footprint_empty():
    """Test calculation with empty payload uses fallback."""
    payload = {}
    response = client.post("/api/carbon/calculate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["daily"] == 12.4  # Fallback value


def test_chat_with_empty_message():
    """Test chat endpoint with empty message."""
    payload = {"message": ""}
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    assert len(data["suggestedFollowups"]) > 0


def test_onboarding_nonexistent_user():
    """Test onboarding with non-existent user returns 404."""
    payload = {
        "name": "Nobody",
        "location": "Nowhere",
        "preferences": {
            "transportMode": "car_petrol",
            "dailyCommute": 10.0,
            "dietType": "mixed",
            "homeSize": "small",
            "electricityKwh": 100.0,
            "waterLiters": 100.0,
            "shoppingFrequency": "moderate"
        }
    }
    response = client.post("/api/onboarding?email=nobody@ecogenie.app", json=payload)
    assert response.status_code == 404

