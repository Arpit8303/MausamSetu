# MausamSetu — Implementation Roadmap & Gap Analysis

## 1. Prioritized Gap Analysis

### P0 — Critical
- None. The core application runs stably and successfully fetches, caches, and serves intelligence and forecast data.

### P1 — High Priority (For Core SIH Prototype)
- **Problem:** ML `confidence_score` and `uncertainty_margin_c` are static placeholders.
- **Solution:** Train the existing `ml/downscaling_engine.py` on a historical dataset (IMD/ERA5) and deploy the inference endpoint to dynamically calculate these metrics based on model variance.
- **Estimated Effort:** 10-15 hours.

- **Problem:** Agricultural advisories lack dynamic crop-stage awareness.
- **Solution:** Update the database to store active crops per Panchayat and adjust the advisory logic to filter recommendations by crop and growth stage.
- **Estimated Effort:** 8 hours.

### P2 — Future Enhancements
- **SMS/WhatsApp Notifications:** Push extreme weather alerts to farmers via Twilio or Gupshup API. (15 hours)
- **Offline PWA Support:** Cache dashboard data via Service Workers so farmers can view the latest forecast even in low-connectivity zones. (10 hours)

---

## 2. Implementation Roadmap

### Milestone 1: Stabilize Existing Functionality (Completed ✅)
- Fix Open-Meteo `weather_code` and timestamp parsing.
- Refactor frontend to use real API responses without hardcoded demo data.
- Ensure E2E pipeline handles GEE cold-starts gracefully.

### Milestone 2: Complete Core Weather Intelligence (Completed ✅)
- Map WMO weather codes to human-readable text.
- Integrate surface pressure, humidity, wind, precipitation probabilities.
- Establish robust caching strategy.

### Milestone 3: Complete Agricultural Decision Support (Planned)
- **Task 3.1:** Create `Crop` and `GrowthStage` DB models.
- **Task 3.2:** Link Panchayats to active crops.
- **Task 3.3:** Modify `weather_service.py` to fetch advisories based on specific active crops rather than generic rules.

### Milestone 4: Improve Frontend UX and Visualization (Planned)
- **Task 4.1:** Implement localized Hindi translations for weather conditions.
- **Task 4.2:** Make the NDVIMap interactive (allow users to click sub-regions for pixel-level NDVI).

### Milestone 5: Add AI/ML Functionality (Planned)
- **Task 5.1:** Gather historical ERA5 vs. AWS ground-truth datasets.
- **Task 5.2:** Execute `train_and_eval.py` to generate XGBoost model weights.
- **Task 5.3:** Replace `1012.8` and `0.92` placeholders with live ML predictions in `weather.py`.

### Milestone 6: Deployment & SIH Demo Preparation (In Progress)
- **Task 6.1:** Containerize using Docker (Dockerfile exists, needs validation).
- **Task 6.2:** Deploy Backend to AWS/Railway.
- **Task 6.3:** Deploy Frontend to Vercel.

---

## 3. Recommended Feature Additions (Innovation)

1. **Explainable AI (XAI) Advisories:** Instead of just "Water crops", generate "Because rainfall chance is < 15% and NDVI indicates moisture stress (0.3), irrigation is highly recommended." *High demo value.*
2. **Crowdsourced Ground Truth:** Allow farmers to report current weather (e.g., "It is raining now"). Use this to continuously calibrate the ML downscaler. *Scalable & impactful.*
3. **Low-bandwidth UI Mode:** A toggle that strips out Leaflet maps and complex charts, serving only text and basic icons for 2G/3G rural networks. *Extremely relevant to the problem statement.*
