from typing import Dict, Any, List

class AdvisoryEngine:
    """
    MausamSetu Agro-meteorological Advisory Engine.
    Synthesizes downscaled weather forecasts with crop-specific agronomic parameters,
    growth stages, soil types, and irrigation profiles.
    """

    CROP_RULES = {
        "Wheat": {
            "Flowering Stage": {
                "heavy_rain": {
                    "title": "Postpone Irrigation & Fertilizer Application",
                    "title_hi": "सिंचाई और उर्वरक प्रयोग स्थगित करें",
                    "description": "Downscaled forecast indicates heavy rainfall (>20mm). Wheat during flowering is susceptible to lodging and flower drop.",
                    "description_hi": "पूर्वानुमान 20 मिमी से अधिक वर्षा दर्शाता है। फूल आने के समय गेहूं फसल गिरने और फूल झड़ने के प्रति संवेदनशील है।",
                    "action": "Ensure proper field drainage to prevent waterlogging. Suspend nitrogen top-dressing.",
                    "action_hi": "जलजमाव से बचने के लिए खेत में जल निकासी की व्यवस्था करें। नाइट्रोजन उर्वरक का छिड़काव रोकें।",
                    "risk": "HIGH",
                    "confidence": 92.0
                },
                "high_temp": {
                    "title": "Heat Stress Warning - Apply Light Irrigation",
                    "title_hi": "गर्मी का तनाव - हल्की सिंचाई करें",
                    "description": "Max temperature expected above 32°C. High heat during flowering causes forced maturity and lower 1000-grain weight.",
                    "description_hi": "अधिकतम तापमान 32°C से अधिक रहने की संभावना है। इससे दाना छोटा रह सकता है।",
                    "action": "Provide light irrigation during afternoon hours to reduce soil temperature. Spray 0.5% Potassium Nitrate.",
                    "action_hi": "दोपहर में हल्की सिंचाई करें। 0.5% पोटेशियम नाइट्रेट का छिड़काव करें।",
                    "risk": "MEDIUM",
                    "confidence": 88.5
                }
            }
        },
        "Rice": {
            "Tillering Stage": {
                "heavy_rain": {
                    "title": "Maintain 3-5 cm Water Depth & Monitor Stem Borer",
                    "title_hi": "3-5 सेमी पानी का स्तर बनाए रखें और तना छेदक पर नजर रखें",
                    "description": "Favorable rainfall expected. Rice crop thrives in flooded conditions during tillering.",
                    "description_hi": "अनुकूल वर्षा की संभावना है। कल्ले निकलने के दौरान धान जलमग्न स्थिति में अच्छा बढ़ता है।",
                    "action": "Regulate field bunds to retain rainwater up to 5 cm. Scout for stem borer egg masses.",
                    "action_hi": "बारिश के पानी को रोकने के लिए मेढ़ें मजबूत करें।",
                    "risk": "LOW",
                    "confidence": 94.0
                }
            }
        },
        "Mustard": {
            "Pod Formation": {
                "high_humidity": {
                    "title": "Aphid & White Rust Alert",
                    "title_hi": "माहू (माहूँ) और सफेद रतुआ कीट चेतावनी",
                    "description": "Relative humidity > 85% combined with cloud cover increases aphid infestation risk.",
                    "description_hi": "सापेक्ष आर्द्रता 85% से अधिक रहने से माहू कीट और सफेद रतुआ फैलने की आशंका है।",
                    "action": "Spray Dimethoate 30% EC @ 1.7 ml/litre of water during clear weather.",
                    "action_hi": "मौसम साफ होने पर डाइमेथॉएट 30% ईसी 1.7 मिली प्रति लीटर पानी में मिलाकर छिड़काव करें।",
                    "risk": "HIGH",
                    "confidence": 91.0
                }
            }
        }
    }

    @classmethod
    def generate_advisories(
        self,
        crop_name: str,
        growth_stage: str,
        forecast: Dict[str, Any],
        soil_type: str = "Alluvial",
        irrigation_type: str = "Canal"
    ) -> List[Dict[str, Any]]:
        advisories = []
        
        t_max = forecast.get("temp_max_c", 30.0)
        t_min = forecast.get("temp_min_c", 18.0)
        precip = forecast.get("precipitation_mm", 0.0)
        humidity = forecast.get("humidity_pct", 60.0)
        wind = forecast.get("wind_speed_kmh", 10.0)
        panchayat_name = forecast.get("panchayat_name", "Local Panchayat")

        # 1. Rain Risk Check
        if precip >= 15.0:
            advisories.append({
                "title": f"Rainfall Alert for {crop_name}: Postpone Irrigation & Spraying",
                "title_hi": f"{crop_name} के लिए वर्षा चेतावनी: सिंचाई और छिड़काव स्थगित करें",
                "description": f"Downscaled forecast for {panchayat_name} expects {precip}mm rainfall. Excess water may harm root aeration.",
                "description_hi": f"{panchayat_name} के लिए पूर्वानुमान में {precip}mm बारिश का अनुमान है।",
                "recommended_action": "Clear drainage channels. Postpone pesticide sprays and urea application until weather clears.",
                "recommended_action_hi": "जल निकासी की व्यवस्था करें। मौसम साफ होने तक कीटनाशक और यूरिया का प्रयोग रोकें।",
                "risk_level": "HIGH" if precip > 35.0 else "MEDIUM",
                "confidence_pct": forecast.get("confidence_score", 0.9) * 100,
                "weather_trigger": f"Precipitation: {precip} mm, Rain Prob: {forecast.get('precipitation_prob_pct', 70)}%",
                "is_official": False
            })

        # 2. Temperature Risk Check (Heatwave / Frost)
        if t_max > 38.0:
            advisories.append({
                "title": f"Heatwave Advisory for {crop_name} ({growth_stage})",
                "title_hi": f"{crop_name} के लिए भीषण गर्मी की चेतावनी",
                "description": f"Maximum temperature reached {t_max}°C. Heat stress risks pollen sterility.",
                "description_hi": f"अधिकतम तापमान {t_max}°C तक पहुंच गया है।",
                "recommended_action": "Apply frequent light irrigations in early morning or evening hours.",
                "recommended_action_hi": "सुबह या शाम को हल्की सिंचाई करें।",
                "risk_level": "CRITICAL" if t_max > 42.0 else "HIGH",
                "confidence_pct": 91.5,
                "weather_trigger": f"Max Temp: {t_max}°C (>38°C threshold)",
                "is_official": False
            })
        elif t_min < 5.0:
            advisories.append({
                "title": f"Frost Danger for {crop_name}",
                "title_hi": f"{crop_name} के लिए पाला पड़ने की संभावना",
                "description": f"Minimum temperature dropping to {t_min}°C.",
                "description_hi": f"न्यूनतम तापमान {t_min}°C तक गिरने का अनुमान है।",
                "recommended_action": "Burn crop waste on field borders to create smoke barrier. Light evening irrigation.",
                "recommended_action_hi": "खेत की मेढ़ों पर धुआं करें और हल्की शाम की सिंचाई करें।",
                "risk_level": "HIGH",
                "confidence_pct": 89.0,
                "weather_trigger": f"Min Temp: {t_min}°C (<5°C threshold)",
                "is_official": False
            })

        # 3. Wind speed check (Crop Lodging Risk)
        if wind > 25.0:
            advisories.append({
                "title": f"High Wind Alert: Lodging Risk for Tall Crops",
                "title_hi": f"तेज हवा की चेतावनी: फसल गिरने का जोखिम",
                "description": f"Wind speeds up to {wind} km/h recorded.",
                "description_hi": f"{wind} किमी/घंटा की रफ्तार से हवाएं चलने का अनुमान है।",
                "recommended_action": "Stake sugarcane and tall maize crops. Avoid irrigation as wet soil promotes uprooting.",
                "recommended_action_hi": "गन्ने की बंधाई करें और गीली मिट्टी में सिंचाई से बचें।",
                "risk_level": "HIGH",
                "confidence_pct": 93.0,
                "weather_trigger": f"Wind Speed: {wind} km/h",
                "is_official": False
            })

        # General Good Practices Fallback
        if not advisories:
            advisories.append({
                "title": f"Optimal Weather Conditions for {crop_name} Interventions",
                "title_hi": f"{crop_name} के लिए अनुकूल मौसम की स्थिति",
                "description": f"Fair weather expected in {panchayat_name} with moderate temperatures ({t_min}°C - {t_max}°C).",
                "description_hi": f"{panchayat_name} में अनुकूल मौसम का अनुमान है।",
                "recommended_action": "Favorable window for fertilizer application, weeding, and routine crop protection.",
                "recommended_action_hi": "उर्वरक प्रयोग, निराई-गुड़ाई और कीट नियंत्रण के लिए सही समय है।",
                "risk_level": "LOW",
                "confidence_pct": 95.0,
                "weather_trigger": f"Temp: {t_max}°C, Humidity: {humidity}%, Precip: 0mm",
                "is_official": True
            })

        return advisories
