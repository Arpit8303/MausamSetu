# MausamSetu (मौसमसेतु) 🌾☀️🌧️
> **Tagline**: *“Har Panchayat Ka Mausam, Har Kisan Ke Naam.”*  
> **SIH 2026 Problem Statement**: 26074 - AI-Powered Weather Downscaling & Agro-Meteorological Advisory Platform for Indian Panchayats.

---

## 🌟 Executive Summary
MausamSetu is an enterprise full-stack platform designed to bridge the spatial resolution gap between coarse **Block-level weather forecasts** (~25km resolution) and micro-localized **Gram Panchayat realities** (~1-3km resolution).

By integrating meteorological observations, Shuttle Radar Topography Mission (SRTM) DEM elevation models, terrain slope, aspect, and multi-output machine learning (XGBoost / Random Forest Regressor), MausamSetu downscales weather predictions in real-time and delivers localized crop advisories to farmers and agricultural officers across India.

---

## 🏗️ Architecture & Technology Stack

### 1. Frontend
- **Framework**: Next.js 14 App Router, TypeScript, Tailwind CSS.
- **Visualizations**: Recharts for 24h diurnal curves & 7-day rainfall bar charts.
- **Geospatial Maps**: Interactive Leaflet / OpenStreetMap canvas with colored risk overlays and Panchayat boundary highlighting.
- **i18n**: Built-in English & Hindi language switcher.

### 2. Backend & API Service
- **Framework**: Python FastAPI with Pydantic v2 schemas and OpenAPI/Swagger documentation (`/docs`).
- **Database Engine**: SQLAlchemy ORM with SQLite fallback for instant out-of-the-box Windows/local dev, and PostgreSQL + PostGIS extension support for containerized production.
- **Authentication**: JWT access & refresh token handling with bcrypt password hashing across three roles: `Farmer`, `Agricultural Officer`, and `Administrator`.

### 3. AI / ML Downscaling Engine
- **Preprocessing**: Feature engineering with environmental lapse rate (-6.5°C per 1000m elevation), terrain aspect insolation, and distance weighting.
- **Model**: Multi-Output Random Forest / XGBoost regressor predicting downscaled minimum/maximum temperature, precipitation amount & probability, relative humidity, and wind speed.
- **Evaluator**: Computes MAE, RMSE, R² for temperature, and precipitation event Precision/Recall. Model binaries serialized via `joblib`.

### 4. Data Ingestion Architecture
- **Provider Adapters**: Ingestion connectors for IMD, NASA POWER Agroclimatology API, ERA5, and Data.gov.in.
- **Demo Mode**: High-fidelity simulated provider for offline demonstration and testing.
- **CSV Ingestion**: Bulk dataset parser for custom meteorological uploads.

---

## ⚡ Quick Start Guide

### Option 1: Docker Compose (Recommended)
Launch the entire platform (PostgreSQL + PostGIS, Redis, FastAPI Backend, Next.js Frontend) with one command:
```bash
docker-compose -f infrastructure/docker-compose.yml up --build
```
- **Frontend Portal**: http://localhost:3000
- **Backend Swagger API Docs**: http://localhost:8000/docs

---

### Option 2: Local Manual Setup

#### 1. ML Pipeline Training & Evaluation
```bash
# Run reproducible downscaling training script
python ml/train_and_eval.py
```

#### 2. Backend FastAPI Launch
```bash
cd backend
pip install -r requirements.txt
python app/main.py
```
*Backend runs on http://127.0.0.1:8000*

#### 3. Frontend Next.js Launch
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on http://localhost:3000*

---

## 🔐 Default Demo Accounts

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Farmer** | `farmer@mausamsetu.in` | `Farmer@123` | Localized Panchayat Weather, 24h/7d Charts, Crop Advisories |
| **Agricultural Officer** | `officer@mausamsetu.in` | `Officer@123` | Interactive Leaflet Map, Block vs Panchayat Heatmaps, Risk Table, CSV Export |
| **Administrator** | `admin@mausamsetu.in` | `Admin@123` | Dataset CSV Ingestion, Model Pipeline Trigger, System Health, Audit Logs |

---

## 🧪 Verification & Testing
Run backend unit and integration tests:
```bash
pytest backend/app/tests
```

---

## 📜 License
Developed for Smart India Hackathon (SIH 2026) Problem Statement 26074.
