import os
from dotenv import load_dotenv
import requests
import pandas as pd
from typing import Tuple
from datetime import datetime

# Test data
data = {
    "date": ["05-10-2025", "06-10-2025", "07-10-2025", "08-10-2025", 
                "09-10-2025", "10-10-2025", "11-10-2025"],
    "aqi": [85, 120, 95, 150, 110, 75, 60],
    "level": ["Moderate", "Unhealthy for Sensitive Groups", "Moderate", 
                "Unhealthy", "Unhealthy for Sensitive Groups", "Good", "Good"]
}

df = pd.DataFrame(data)

# Ho Chi Minh City coordinates
latitude = 10.8231
longitude = 106.6297
current_date = datetime.now().strftime("%d-%m-%Y")

load_dotenv()
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"

def generate_prompt(df: pd.DataFrame, latitude: float, longitude: float, current_date: str) -> str:
    """
    df: DataFrame containing 7-day AQI forecast with columns: 'date', 'aqi', 'pollutant' (optional)
    latitude, longitude: location coordinates
    current_date: current date (dd-mm-yyyy)
    """
    forecast_data = df.to_string(index=False)
    
    prompt = (
        f"You are AirForce - an intelligent air quality advisory assistant for the AirForce application.\n\n"
        f"FORECAST INFORMATION:\n"
        f"- Location: ({latitude}, {longitude})\n"
        f"- Current Date: {current_date}\n"
        f"- 7-Day AQI Forecast:\n{forecast_data}\n\n"
        f"ADVISORY REQUIREMENTS:\n"
        f"1. Overall Assessment: Analyze the air quality trend over the next 7 days\n\n"
        f"2. Outdoor Activity Recommendations:\n"
        f"   - Days RECOMMENDED for outdoor activities (good AQI)\n"
        f"   - Days NOT RECOMMENDED for outdoor activities (poor AQI)\n"
        f"   - Best time windows during the day (early morning, late evening usually better)\n\n"
        f"3. At-Risk Groups Advisory:\n"
        f"   - Children and elderly: specific warnings and recommendations\n"
        f"   - People with respiratory/cardiovascular conditions: special advice\n"
        f"   - Pregnant women: days to limit outdoor exposure\n"
        f"   - Healthy adults: outdoor activities that can be performed safely\n\n"
        f"4. Protective Measures:\n"
        f"   - When to wear masks (specify mask types if AQI is very poor)\n"
        f"   - Suitable indoor/outdoor activities\n"
        f"   - Precautions for outdoor exercise\n\n"
        f"5. Confidence Level: Assess the accuracy of the forecast (based on AQI volatility)\n\n"
        f"NOTE: Answer in paragraphs, do not write the prompt format in answer, no longer than 10 sentences. Use friendly, easy-to-understand language with clear structure, bullet points, and appropriate emojis.\n"
    )
    return prompt

def get_air_quality_advice(df: pd.DataFrame, latitude: float, longitude: float, current_date: str) -> str:
    """
    Get air quality advisory from Gemini AI
    """
    prompt = generate_prompt(df, latitude, longitude, current_date)
    
    headers = {
        "Content-Type": "application/json"
    }
    
    data = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.7,
            "topK": 40,
            "topP": 0.95,
            "maxOutputTokens": 2048,
        }
    }
    
    try:
        response = requests.post(GEMINI_API_URL, headers=headers, json=data, timeout=30)
        
        if response.status_code == 200:
            try:
                advice = response.json()["candidates"][0]["content"]["parts"][0]["text"]
                return advice
            except (KeyError, IndexError) as e:
                return f"[AirForce] Response processing error: {str(e)}"
        else:
            return f"[AirForce] API Error (Status {response.status_code}): {response.text}"
            
    except requests.exceptions.Timeout:
        return "[AirForce] ⏱️ Request timeout. Please try again."
    except Exception as e:
        return f"[AirForce] Unknown error: {str(e)}"

if __name__ == "__main__":
    # data = {
    #     "date": ["05-10-2025", "06-10-2025", "07-10-2025", "08-10-2025", 
    #              "09-10-2025", "10-10-2025", "11-10-2025"],
    #     "aqi": [85, 120, 95, 150, 110, 75, 60],
    #     "level": ["Moderate", "Unhealthy for Sensitive Groups", "Moderate", 
    #               "Unhealthy", "Unhealthy for Sensitive Groups", "Good", "Good"]
    # }
    
    # df = pd.DataFrame(data)
    
    # # Ho Chi Minh City coordinates
    # latitude = 10.8231
    # longitude = 106.6297
    # current_date = datetime.now().strftime("%d-%m-%Y")
    
    print("Fetching air quality advisory...")
    advice = get_air_quality_advice(df, latitude, longitude, current_date)
    print(advice)