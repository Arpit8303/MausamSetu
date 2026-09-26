import io
import pandas as pd
from typing import List, Dict, Any, Tuple

class CSVDatasetParser:
    @staticmethod
    def parse_weather_csv(contents: bytes) -> Tuple[bool, str, List[Dict[str, Any]]]:
        try:
            df = pd.read_csv(io.BytesIO(contents))
            
            required_cols = ["block_name", "date", "temp_min_c", "temp_max_c", "humidity_pct", "precipitation_mm"]
            missing = [c for c in required_cols if c not in df.columns]
            
            if missing:
                return False, f"Missing required columns in CSV: {', '.join(missing)}", []
            
            records = df.to_dict(orient="records")
            return True, f"Successfully parsed {len(records)} weather records from CSV dataset.", records
        except Exception as e:
            return False, f"Failed to parse CSV file: {str(e)}", []
