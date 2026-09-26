import os
import sys
import pytest
from fastapi.testclient import TestClient

# Ensure root and backend paths in sys.path
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["platform"] == "MausamSetu"
    assert data["status"] == "ONLINE"

def test_get_states():
    response = client.get("/api/v1/locations/states")
    assert response.status_code == 200
    states = response.json()
    assert isinstance(states, list)
    assert len(states) > 0

def test_get_panchayats():
    response = client.get("/api/v1/locations/panchayats")
    assert response.status_code == 200
    panchayats = response.json()
    assert isinstance(panchayats, list)

def test_weather_forecast():
    response = client.get("/api/v1/weather/forecast?panchayat_id=1")
    assert response.status_code == 200
    data = response.json()
    assert "current" in data
    assert "daily" in data
    assert len(data["daily"]) == 7

def test_advisories():
    response = client.get("/api/v1/advisories?panchayat_id=1&crop_name=Wheat")
    assert response.status_code == 200
    advisories = response.json()
    assert isinstance(advisories, list)
    assert len(advisories) > 0

def test_ml_model_status():
    response = client.get("/api/v1/ml/model/status")
    assert response.status_code == 200
    data = response.json()
    assert "active_model_version" in data

def test_system_health():
    response = client.get("/api/v1/admin/system-health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "OPERATIONAL"
