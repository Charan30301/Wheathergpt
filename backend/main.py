from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
from datetime import datetime, timedelta
import math

app = FastAPI(
    title="WeatherGPT API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =====================================================
# MODELS
# =====================================================

class Location(BaseModel):
    latitude: float
    longitude: float
    city: str = ""
    country: str = ""


class ChatRequest(BaseModel):
    message: str
    language: str = "en"
    mode: str = "general"
    location: Location
    weather: dict | None = None


# =====================================================
# WEATHER
# =====================================================

@app.get("/")
def root():
    return {
        "message": "WeatherGPT API is running"
    }


@app.get("/weather")
def get_weather(
    lat: float,
    lon: float
):

    try:

        url = (
            "https://api.open-meteo.com/v1/forecast"
        )

        params = {
            "latitude": lat,
            "longitude": lon,

            "current": ",".join([
                "temperature_2m",
                "relative_humidity_2m",
                "apparent_temperature",
                "weather_code",
                "surface_pressure",
                "wind_speed_10m"
            ]),

            "hourly": ",".join([
                "temperature_2m",
                "precipitation_probability",
                "weather_code",
                "visibility"
            ]),

            "daily": ",".join([
                "weather_code",
                "temperature_2m_max",
                "temperature_2m_min",
                "precipitation_probability_max",
                "uv_index_max"
            ]),

            "timezone": "auto",

            "forecast_days": 7
        }

        response = requests.get(
            url,
            params=params,
            timeout=15
        )

        response.raise_for_status()

        data = response.json()

        current = data["current"]

        current_weather = {
            "latitude": lat,
            "longitude": lon,

            "temperature":
                current.get(
                    "temperature_2m",
                    0
                ),

            "feelsLike":
                current.get(
                    "apparent_temperature",
                    0
                ),

            "humidity":
                current.get(
                    "relative_humidity_2m",
                    0
                ),

            "windSpeed":
                current.get(
                    "wind_speed_10m",
                    0
                ),

            "pressure":
                current.get(
                    "surface_pressure",
                    0
                ),

            "visibility": 10,

            "uv": (
                data
                .get("daily", {})
                .get("uv_index_max", [0])[0]
            ),

            "weatherCode":
                current.get(
                    "weather_code",
                    0
                ),

            "rainProbability": (
                data
                .get("daily", {})
                .get(
                    "precipitation_probability_max",
                    [0]
                )[0]
            ),

            "city":
                "Selected location",

            "country":
                ""
        }

        daily = data["daily"]

        forecast = []

        for index, date in enumerate(
            daily["time"]
        ):

            forecast.append({
                "date": date,

                "temperature":
                    daily[
                        "temperature_2m_max"
                    ][index],

                "rain":
                    daily[
                        "precipitation_probability_max"
                    ][index],

                "weatherCode":
                    daily[
                        "weather_code"
                    ][index]
            })

        events = generate_weather_events(
            daily
        )

        return {
            "current": current_weather,
            "forecast": forecast,
            "events": events
        }

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


# =====================================================
# WEATHER EVENTS
# =====================================================

def generate_weather_events(
    daily
):

    events = []

    for index, date in enumerate(
        daily["time"]
    ):

        code = daily[
            "weather_code"
        ][index]

        rain = daily[
            "precipitation_probability_max"
        ][index]

        temperature = daily[
            "temperature_2m_max"
        ][index]

        if code >= 95:

            events.append({
                "date": date,
                "type": "storm",
                "title": "Thunderstorm",
                "description":
                    "Thunderstorm conditions may occur."
            })

        elif rain >= 80:

            events.append({
                "date": date,
                "type": "rain",
                "title": "Heavy rainfall",
                "description":
                    "High probability of heavy rainfall."
            })

        elif code >= 80:

            events.append({
                "date": date,
                "type": "rain",
                "title": "Rain showers",
                "description":
                    "Rain showers are expected."
            })

        else:

            events.append({
                "date": date,
                "type": "clear",
                "title": "Clear / stable weather",
                "description":
                    f"Mostly stable weather around {temperature}°C."
            })

    return events


# =====================================================
# REVERSE GEOCODING
# =====================================================

@app.get("/location/reverse")
def reverse_location(
    lat: float,
    lon: float
):

    try:

        url = (
            "https://nominatim.openstreetmap.org/reverse"
        )

        params = {
            "lat": lat,
            "lon": lon,
            "format": "json",
            "zoom": 10
        }

        headers = {
            "User-Agent":
                "WeatherGPT/1.0"
        }

        response = requests.get(
            url,
            params=params,
            headers=headers,
            timeout=15
        )

        response.raise_for_status()

        data = response.json()

        address = data.get(
            "address",
            {}
        )

        city = (
            address.get("city")
            or address.get("town")
            or address.get("village")
            or address.get("municipality")
            or "Selected location"
        )

        country = address.get(
            "country",
            ""
        )

        return {
            "city": city,
            "country": country,
            "latitude": lat,
            "longitude": lon
        }

    except Exception:

        return {
            "city": "Selected location",
            "country": "",
            "latitude": lat,
            "longitude": lon
        }


# =====================================================
# AI CHAT
# =====================================================

@app.post("/ai/chat")
def ai_chat(
    request: ChatRequest
):

    weather = request.weather or {}

    temperature = weather.get(
        "temperature",
        "--"
    )

    condition = weather.get(
        "weatherCode",
        "--"
    )

    city = request.location.city

    language = request.language

    mode = request.mode

    # -------------------------------------------------
    # TEMPORARY RESPONSE
    #
    # Replace this section with your LLM API.
    # -------------------------------------------------

    if language == "te":

        reply = (
            f"{city}లో ప్రస్తుతం "
            f"ఉష్ణోగ్రత {temperature}°C ఉంది. "
            f"మీ WeatherGPT {mode} మోడ్‌లో "
            f"వాతావరణాన్ని విశ్లేషిస్తోంది."
        )

    elif language == "hi":

        reply = (
            f"{city} में अभी तापमान "
            f"{temperature}°C है। "
            f"WeatherGPT आपके {mode} मोड "
            f"के अनुसार मौसम की जानकारी दे रहा है।"
        )

    elif language == "ta":

        reply = (
            f"{city} பகுதியில் தற்போது "
            f"வெப்பநிலை {temperature}°C."
        )

    elif language == "kn":

        reply = (
            f"{city} ನಲ್ಲಿ ಪ್ರಸ್ತುತ "
            f"ತಾಪಮಾನ {temperature}°C."
        )

    else:

        reply = (
            f"Currently in {city}, "
            f"the temperature is "
            f"{temperature}°C. "
            f"I can help you understand "
            f"the forecast, weather risks, "
            f"farming conditions or travel "
            f"conditions."
        )

    return {
        "reply": reply,
        "language": language,
        "mode": mode
    }


# =====================================================
# STARTUP
# =====================================================

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000
    )
