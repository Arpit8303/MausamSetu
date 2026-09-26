from typing import List, Dict, Any

class AlertEngine:
    """
    Rule-Based Extreme Weather Alert & Early Warning System for Agricultural Panchayats.
    """

    @classmethod
    def evaluate_panchayat_alerts(cls, forecast: Dict[str, Any], panchayat_id: int, panchayat_name: str) -> List[Dict[str, Any]]:
        alerts = []
        precip = forecast.get("precipitation_mm", 0.0)
        t_max = forecast.get("temp_max_c", 30.0)
        t_min = forecast.get("temp_min_c", 20.0)
        wind = forecast.get("wind_speed_kmh", 10.0)

        # 1. Heavy Rainfall / Flash Flood Warning
        if precip >= 50.0:
            alerts.append({
                "id": 101,
                "title": f"SEVERE RAINFALL WARNING - {panchayat_name}",
                "message": f"Extreme precipitation of {precip}mm forecasted in next 24 hours. High risk of waterlogging and crop damage.",
                "severity": "EMERGENCY",
                "panchayat_id": panchayat_id,
                "panchayat_name": panchayat_name
            })
        elif precip >= 25.0:
            alerts.append({
                "id": 102,
                "title": f"HEAVY RAINFALL ALERT - {panchayat_name}",
                "message": f"Expected rainfall of {precip}mm. Ensure field drainage channels are clear.",
                "severity": "WARNING",
                "panchayat_id": panchayat_id,
                "panchayat_name": panchayat_name
            })

        # 2. Extreme Heatwave
        if t_max >= 40.0:
            alerts.append({
                "id": 103,
                "title": f"EXTREME HEATWAVE WARNING - {panchayat_name}",
                "message": f"Maximum temperature reaching {t_max}°C. Provide immediate evening irrigation to protect standing crops.",
                "severity": "SEVERE",
                "panchayat_id": panchayat_id,
                "panchayat_name": panchayat_name
            })

        # 3. High Wind Speed
        if wind >= 30.0:
            alerts.append({
                "id": 104,
                "title": f"STRONG WIND WARNING - {panchayat_name}",
                "message": f"Wind speeds up to {wind} km/h expected. Avoid foliar chemical sprays and prop up tall crops.",
                "severity": "WARNING",
                "panchayat_id": panchayat_id,
                "panchayat_name": panchayat_name
            })

        return alerts
