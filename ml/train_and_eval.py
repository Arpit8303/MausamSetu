import os
import sys
import json
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, precision_score, recall_score

# Ensure ml package import path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from ml.downscaling_engine import WeatherDownscaler

def generate_synthetic_training_dataset(num_samples=1000):
    """
    Generates realistic weather observation dataset covering varied topographies,
    elevations, and microclimates across Indian Block and Panchayat stations.
    """
    np.random.seed(42)
    
    # Block baseline variables
    block_temp_min = np.random.uniform(10.0, 28.0, num_samples)
    block_temp_max = np.random.uniform(22.0, 44.0, num_samples)
    block_humidity = np.random.uniform(30.0, 95.0, num_samples)
    block_precip = np.random.exponential(scale=5.0, size=num_samples)
    block_elevation = np.random.uniform(50.0, 1200.0, num_samples)
    
    # Panchayat terrain variables
    elevation_delta = np.random.uniform(-300.0, 400.0, num_samples)
    panchayat_elevation = block_elevation + elevation_delta
    panchayat_slope = np.random.uniform(0.5, 15.0, num_samples)
    panchayat_aspect = np.random.uniform(0.0, 360.0, num_samples)
    distance_km = np.random.uniform(1.0, 20.0, num_samples)
    
    # True downscaled target variables with physical lapse rates + microclimate noise
    lapse_temp_adj = -0.0065 * elevation_delta
    aspect_sun = np.cos(np.radians(panchayat_aspect)) * (panchayat_slope / 10.0) * 0.3
    
    target_temp_min = block_temp_min + lapse_temp_adj + (aspect_sun * 0.4) + np.random.normal(0, 0.3, num_samples)
    target_temp_max = block_temp_max + lapse_temp_adj + aspect_sun + np.random.normal(0, 0.4, num_samples)
    target_precip = np.maximum(0.0, block_precip * (1.0 + (elevation_delta / 1000.0) * 0.2) + np.random.normal(0, 0.5, num_samples))
    
    X = pd.DataFrame({
        "block_temp_min": block_temp_min,
        "block_temp_max": block_temp_max,
        "block_humidity": block_humidity,
        "block_precip": block_precip,
        "block_elevation": block_elevation,
        "panchayat_elevation": panchayat_elevation,
        "elevation_delta": elevation_delta,
        "panchayat_slope": panchayat_slope,
        "panchayat_aspect": panchayat_aspect,
        "distance_km": distance_km
    })
    
    y = pd.DataFrame({
        "target_temp_min": target_temp_min,
        "target_temp_max": target_temp_max,
        "target_precip": target_precip
    })
    
    return X, y

def train_and_evaluate():
    print("=" * 60)
    print("MeghSetu Weather Downscaling ML Training & Evaluation Engine")
    print("=" * 60)
    
    X, y = generate_synthetic_training_dataset(num_samples=2500)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # 1. Baseline Physical Model Evaluation (Lapse Rate Only)
    downscaler = WeatherDownscaler()
    baseline_preds_max = []
    baseline_preds_min = []
    
    for idx, row in X_test.iterrows():
        base_res = downscaler.apply_baseline_downscaling(
            block_temp_min=row["block_temp_min"],
            block_temp_max=row["block_temp_max"],
            block_humidity=row["block_humidity"],
            block_precip=row["block_precip"],
            block_wind=10.0,
            block_elevation=row["block_elevation"],
            block_lat=26.5, block_lon=80.5,
            panchayat_elevation=row["panchayat_elevation"],
            panchayat_lat=26.52, panchayat_lon=80.53,
            panchayat_slope=row["panchayat_slope"],
            panchayat_aspect=row["panchayat_aspect"]
        )
        baseline_preds_min.append(base_res["temp_min_c"])
        baseline_preds_max.append(base_res["temp_max_c"])
        
    baseline_mae = mean_absolute_error(y_test["target_temp_max"], baseline_preds_max)
    baseline_rmse = np.sqrt(mean_squared_error(y_test["target_temp_max"], baseline_preds_max))
    
    print(f"\n[Baseline Model] Elevation Lapse Rate:")
    print(f"   - Temp Max MAE:  {baseline_mae:.4f} °C")
    print(f"   - Temp Max RMSE: {baseline_rmse:.4f} °C")
    
    # 2. Machine Learning Model Training (Multi-output Random Forest / Gradient Boosting)
    rf_model = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)
    rf_model.fit(X_train, y_train)
    
    y_pred = rf_model.predict(X_test)
    y_pred_df = pd.DataFrame(y_pred, columns=["pred_temp_min", "pred_temp_max", "pred_precip"])
    
    ml_mae = mean_absolute_error(y_test["target_temp_max"], y_pred_df["pred_temp_max"])
    ml_rmse = np.sqrt(mean_squared_error(y_test["target_temp_max"], y_pred_df["pred_temp_max"]))
    ml_r2 = r2_score(y_test["target_temp_max"], y_pred_df["pred_temp_max"])
    
    # Rain event precision/recall (> 1.0mm)
    actual_rain = (y_test["target_precip"] > 1.0).astype(int)
    pred_rain = (y_pred_df["pred_precip"] > 1.0).astype(int)
    
    rain_prec = precision_score(actual_rain, pred_rain, zero_division=1)
    rain_rec = recall_score(actual_rain, pred_rain, zero_division=1)
    
    print(f"\n[ML Model] Multi-Output Random Forest / XGBoost:")
    print(f"   - Temp Max MAE:  {ml_mae:.4f} °C")
    print(f"   - Temp Max RMSE: {ml_rmse:.4f} °C")
    print(f"   - Temp Max R²:   {ml_r2:.4f}")
    print(f"   - Rain Event Precision (>1mm): {rain_prec:.4f}")
    print(f"   - Rain Event Recall (>1mm):    {rain_rec:.4f}")
    print(f"   - Accuracy Improvement vs Baseline: {((baseline_mae - ml_mae) / baseline_mae * 100):.2f}%")
    
    # Save model artifact and metrics JSON
    os.makedirs("ml/artifacts", exist_ok=True)
    model_artifact_path = "ml/artifacts/downscaling_v1.joblib"
    joblib.dump({"model": rf_model, "features": list(X.columns)}, model_artifact_path)
    
    metrics = {
        "version_name": "v1.0.0-xgb-rf",
        "algorithm": "Multi-Output Random Forest + Elevation Lapse Rate",
        "baseline_mae_c": round(baseline_mae, 4),
        "mae_temp_c": round(ml_mae, 4),
        "rmse_temp_c": round(ml_rmse, 4),
        "r2_temp": round(ml_r2, 4),
        "rain_precision": round(rain_prec, 4),
        "rain_recall": round(rain_rec, 4),
        "improvement_pct": round(((baseline_mae - ml_mae) / baseline_mae * 100), 2),
        "trained_at": datetime.utcnow().isoformat(),
        "status": "ACTIVE"
    }
    
    with open("ml/artifacts/metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)
        
    print(f"\nSaved model artifact to: {model_artifact_path}")
    print(f"Saved evaluation metrics to: ml/artifacts/metrics.json")
    print("=" * 60)

if __name__ == "__main__":
    train_and_evaluate()
