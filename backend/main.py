import os
from typing import Any, Optional

import httpx

from dotenv import load_dotenv

from fastapi import (
    FastAPI,
    HTTPException,
    Query
)

from fastapi.middleware.cors import (
    CORSMiddleware
)

from pydantic import BaseModel


load_dotenv()


OPEN_METEO = (
    "https://api.open-meteo.com/v1/forecast"
)

NOMINATIM = (
    "https://nominatim.openstreetmap.org"
)

FRONTEND_ORIGIN = os.getenv(
    "FRONTEND_ORIGIN",
    "http://localhost:3000"
)


app = FastAPI(
    title="WeatherGPT API",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_ORIGIN,
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Location(BaseModel):
    name: str
    country: str = ""
    lat: float
    lon: float


class ChatRequest(BaseModel):
    message: str
    language: str = "en"
    mode: str = "weather"
    location: Location
    weather: Optional[
        dict[str, Any]
    ] = None


LANGUAGE_NAMES = {
    "en": "English",
    "te": "Telugu",
    "hi": "Hindi",
    "ta": "Tamil",
    "kn": "Kannada",
    "ml": "Malayalam",
    "bn": "Bengali",
    "mr": "Marathi",
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "ja": "Japanese"
}


WEATHER_KNOWLEDGE = [
    (
        "rain",
        "Rain is represented by WMO weather codes 51-67 and 80-82. Check precipitation amount and probability together."
    ),
    (
        "storm",
        "Thunderstorms use WMO codes 95-99. Outdoor plans should be reconsidered during lightning. Follow official local warnings."
    ),
    (
        "farmer",
        "Crop decisions depend on temperature, rainfall, soil, irrigation, season and local agronomy. Suggestions are guidance, not guarantees."
    ),
    (
        "traveler",
        "Travel planning should consider precipitation, thunderstorms, visibility, wind, extreme heat and local alerts."
    ),
    (
        "humidity",
        "High relative humidity can increase perceived heat and reduce drying. Apparent temperature is useful for comfort decisions."
    )
]


def retrieve_knowledge(
    query: str
) -> str:

    q = query.lower()

    return "\n".join(
        text
        for key, text
        in WEATHER_KNOWLEDGE
        if key in q
    )[:2500]


async def get_json(
    url: str,
    params: dict[str, Any],
    headers: Optional[
        dict[str, str]
    ] = None
):

    async with httpx.AsyncClient(
        timeout=15
    ) as client:

        r = await client.get(
            url,
            params=params,
            headers=headers
        )

        r.raise_for_status()

        return r.json()


@app.get("/health")
async def health():

    return {
        "ok": True,
        "service":
            "weathergpt-api"
    }


@app.get("/api/weather")
async def weather(
    lat: float = Query(
        ...,
        ge=-90,
        le=90
    ),

    lon: float = Query(
        ...,
        ge=-180,
        le=180
    ),

    timezone: str = "auto"
):

    params = {
        "latitude": lat,
        "longitude": lon,
        "timezone": timezone,
        "forecast_days": 7,

        "current": ",".join([
            "temperature_2m",
            "relative_humidity_2m",
            "apparent_temperature",
            "precipitation",
            "rain",
            "snowfall",
            "weather_code",
            "wind_speed_10m",
            "wind_direction_10m",
            "pressure_msl"
        ]),

        "hourly": ",".join([
            "temperature_2m",
            "precipitation_probability",
            "precipitation",
            "weather_code",
            "wind_speed_10m"
        ]),

        "daily": ",".join([
            "weather_code",
            "temperature_2m_max",
            "temperature_2m_min",
            "precipitation_sum",
            "precipitation_probability_max",
            "wind_speed_10m_max"
        ])
    }

    try:

        return await get_json(
            OPEN_METEO,
            params
        )

    except Exception as exc:

        raise HTTPException(
            502,
            detail=
                f"Weather provider error: {exc}"
        )


@app.get("/api/geocode/search")
async def geocode_search(
    q: str = Query(
        ...,
        min_length=2
    )
):

    try:

        data = await get_json(
            f"{NOMINATIM}/search",

            {
                "q": q,
                "format": "jsonv2",
                "limit": 8,
                "addressdetails": 1
            },

            {
                "User-Agent":
                    "WeatherGPT/1.0 weather-app"
            }
        )

        results = []

        for item in data:

            address = item.get(
                "address",
                {}
            )

            name = (
                address.get("city")
                or address.get("town")
                or address.get("village")
                or address.get("municipality")
                or item.get(
                    "display_name",
                    "Selected location"
                ).split(",")[0]
            )

            results.append({
                "name": name,
                "country":
                    address.get(
                        "country",
                        ""
                    ),
                "lat":
                    float(
                        item["lat"]
                    ),
                "lon":
                    float(
                        item["lon"]
                    )
            })

        return results

    except Exception as exc:

        raise HTTPException(
            502,
            detail=
                f"Geocoding provider error: {exc}"
        )


@app.get("/api/geocode/reverse")
async def geocode_reverse(
    lat: float = Query(
        ...,
        ge=-90,
        le=90
    ),

    lon: float = Query(
        ...,
        ge=-180,
        le=180
    )
):

    try:

        data = await get_json(
            f"{NOMINATIM}/reverse",

            {
                "lat": lat,
                "lon": lon,
                "format": "jsonv2",
                "zoom": 10,
                "addressdetails": 1
            },

            {
                "User-Agent":
                    "WeatherGPT/1.0 weather-app"
            }
        )

        address = data.get(
            "address",
            {}
        )

        name = (
            address.get("city")
            or address.get("town")
            or address.get("village")
            or address.get("municipality")
            or address.get("state")
            or "Selected location"
        )

        return {
            "name": name,
            "country":
                address.get(
                    "country",
                    ""
                ),
            "lat": lat,
            "lon": lon
        }

    except Exception as exc:

        raise HTTPException(
            502,
            detail=
                f"Reverse geocoding error: {exc}"
        )


@app.get("/api/farmer/crops")
async def farmer_crops(
    lat: float,
    lon: float
):

    data = await get_json(
        OPEN_METEO,
        {
            "latitude": lat,
            "longitude": lon,
            "timezone": "auto",
            "forecast_days": 7,
            "current":
                "temperature_2m,precipitation"
        }
    )

    temp = float(
        data["current"][
            "temperature_2m"
        ]
    )

    rain = float(
        data["current"][
            "precipitation"
        ]
    )

    crops = []

    if 20 <= temp <= 34:

        crops += [
            {
                "crop": "Rice",
                "reason":
                    "Warm conditions; suitable where water and soil conditions support paddy."
            },

            {
                "crop": "Maize",
                "reason":
                    "Temperature is broadly favorable; manage moisture and avoid waterlogging."
            }
        ]

    if 18 <= temp <= 30:

        crops += [
            {
                "crop":
                    "Groundnut",
                "reason":
                    "Moderate warm temperatures can support groundnut with suitable drainage."
            },

            {
                "crop":
                    "Pulses",
                "reason":
                    "Several pulse crops tolerate this range; select by local season."
            }
        ]

    if rain < 2:

        crops.append({
            "crop":
                "Millets",
            "reason":
                "Lower current rainfall makes drought-tolerant millets worth considering if seasonally appropriate."
        })

    if not crops:

        crops.append({
            "crop":
                "Local seasonal crop",
            "reason":
                "Weather alone is not enough; consult the local crop calendar and soil data."
        })

    return crops[:4]


def local_answer(
    req: ChatRequest,
    knowledge: str
) -> str:

    current = (
        req.weather or {}
    ).get(
        "current",
        {}
    )

    temp = current.get(
        "temperature_2m"
    )

    code = current.get(
        "weather_code"
    )

    rain = current.get(
        "precipitation",
        0
    )

    wind = current.get(
        "wind_speed_10m",
        0
    )

    place = req.location.name

    condition = (
        "clear"
        if code == 0
        else "unsettled"
    )

    if code in [
        61,
        63,
        65,
        80,
        81,
        82
    ]:

        condition = "rainy"

    if code in [
        95,
        96,
        99
    ]:

        condition = "stormy"

    if req.mode == "farmer":

        return (
            f"For {place}, it is about "
            f"{temp}°C with {condition} "
            f"conditions. Use Farmer mode "
            f"as guidance and confirm local "
            f"soil, season and crop-calendar "
            f"information."
        )

    if req.mode == "traveler":

        return (
            f"For your current travel "
            f"location, {place}, it is about "
            f"{temp}°C with {condition} "
            f"conditions, around {rain} mm "
            f"precipitation and wind near "
            f"{wind} km/h. Recheck before "
            f"departure."
        )

    return (
        f"In {place}, it is about "
        f"{temp}°C and currently "
        f"{condition}. Precipitation is "
        f"{rain} mm and wind is around "
        f"{wind} km/h."
    )


@app.post("/api/chat")
async def chat(
    req: ChatRequest
):

    language_name = (
        LANGUAGE_NAMES.get(
            req.language,
            "English"
        )
    )

    knowledge = retrieve_knowledge(req.message)

    system = f"""
You are WeatherGPT, a careful weather assistant.
Reply in {language_name}. Do not switch language unless the user asks.
Location: {req.location.name}, {req.location.country}
Coordinates: {req.location.lat}, {req.location.lon}
Mode: {req.mode}
Weather JSON: {req.weather}
Retrieved guidance:
{knowledge}

Use the supplied weather data. Do not invent weather values or alerts.
For severe-weather safety questions, advise official local alerts.
Keep normal answers concise and useful.
""".strip()

    api_key = os.getenv(
        "LLM_API_KEY",
        ""
    ).strip()

    model = os.getenv(
        "LLM_MODEL",
        ""
    ).strip()

    base_url = os.getenv(
        "LLM_BASE_URL",
        "https://api.openai.com/v1"
    ).rstrip("/")

    if api_key and model:

        try:

            from openai import (
                AsyncOpenAI
            )

            client = AsyncOpenAI(
                api_key=api_key,
                base_url=base_url
            )

            response = (
                await client
                .chat
                .completions
                .create(
                    model=model,

                    messages=[
                        {
                            "role":
                                "system",
                            "content":
                                system
                        },

                        {
                            "role":
                                "user",
                            "content":
                                req.message
                        }
                    ],

                    temperature=0.2
                )
            )

            answer = (
                response
                .choices[0]
                .message
                .content
                or ""
            )

            return {
                "answer": answer,
                "language":
                    req.language,
                "source":
                    "llm-rag"
            }

        except Exception:
            pass

    return {
        "answer":
            local_answer(
                req,
                knowledge
            ),
        "language":
            req.language,
        "source":
            "local-rag-fallback"
    }
