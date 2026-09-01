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

    condition = "clear"

    if code in [
        61, 63, 65,
        80, 81, 82
    ]:
        condition = "rainy"

    elif code in [
        95, 96, 99
    ]:
        condition = "stormy"

    elif code != 0:
        condition = "unsettled"

    # English
    if req.language == "en":
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

    # Telugu
    if req.language == "te":
        conditions = {
            "clear": "స్పష్టమైన",
            "rainy": "వర్షపు",
            "stormy": "తుఫాను",
            "unsettled": "మారుతున్న"
        }

        return (
            f"{place}లో ప్రస్తుతం ఉష్ణోగ్రత "
            f"సుమారు {temp}°C ఉంది. "
            f"ప్రస్తుతం {conditions[condition]} "
            f"వాతావరణ పరిస్థితులు ఉన్నాయి. "
            f"వర్షపాతం {rain} మి.మీ. మరియు "
            f"గాలి వేగం సుమారు {wind} కి.మీ/గం."
        )

    # Hindi
    if req.language == "hi":
        conditions = {
            "clear": "साफ",
            "rainy": "बारिश वाला",
            "stormy": "तूफानी",
            "unsettled": "बदलता हुआ"
        }

        return (
            f"{place} में अभी तापमान लगभग "
            f"{temp}°C है। वर्तमान मौसम "
            f"{conditions[condition]} है। "
            f"वर्षा {rain} मिमी है और हवा की "
            f"गति लगभग {wind} किमी/घंटा है।"
        )

    # Tamil
    if req.language == "ta":
        conditions = {
            "clear": "தெளிவான",
            "rainy": "மழையான",
            "stormy": "புயல்",
            "unsettled": "மாறுபடும்"
        }

        return (
            f"{place} பகுதியில் தற்போது "
            f"வெப்பநிலை சுமார் {temp}°C. "
            f"வானிலை {conditions[condition]} "
            f"நிலையில் உள்ளது. மழைப்பொழிவு "
            f"{rain} மி.மீ. மற்றும் காற்றின் வேகம் "
            f"சுமார் {wind} கி.மீ/மணி."
        )

    # Kannada
    if req.language == "kn":
        conditions = {
            "clear": "ಸ್ಪಷ್ಟ",
            "rainy": "ಮಳೆಯ",
            "stormy": "ಬಿರುಗಾಳಿ",
            "unsettled": "ಬದಲಾಗುತ್ತಿರುವ"
        }

        return (
            f"{place} ನಲ್ಲಿ ಪ್ರಸ್ತುತ ತಾಪಮಾನ "
            f"ಸುಮಾರು {temp}°C ಇದೆ. ಹವಾಮಾನವು "
            f"{conditions[condition]} ಸ್ಥಿತಿಯಲ್ಲಿದೆ. "
            f"ಮಳೆಯ ಪ್ರಮಾಣ {rain} ಮಿ.ಮೀ. ಮತ್ತು "
            f"ಗಾಳಿಯ ವೇಗ ಸುಮಾರು {wind} ಕಿಮೀ/ಗಂ."
        )

    # Malayalam
    if req.language == "ml":
        conditions = {
            "clear": "തെളിഞ്ഞ",
            "rainy": "മഴയുള്ള",
            "stormy": "കൊടുങ്കാറ്റുള്ള",
            "unsettled": "മാറിക്കൊണ്ടിരിക്കുന്ന"
        }

        return (
            f"{place} ൽ ഇപ്പോൾ താപനില "
            f"ഏകദേശം {temp}°C ആണ്. കാലാവസ്ഥ "
            f"{conditions[condition]} ആണ്. "
            f"മഴ {rain} മി.മീ.യും കാറ്റിന്റെ വേഗത "
            f"ഏകദേശം {wind} കി.മീ/മണിക്കൂറുമാണ്."
        )

    # Bengali
    if req.language == "bn":
        conditions = {
            "clear": "পরিষ্কার",
            "rainy": "বৃষ্টির",
            "stormy": "ঝড়ো",
            "unsettled": "পরিবর্তনশীল"
        }

        return (
            f"{place}-এ বর্তমানে তাপমাত্রা "
            f"প্রায় {temp}°C। আবহাওয়া "
            f"{conditions[condition]}। বৃষ্টিপাত "
            f"{rain} মিমি এবং বাতাসের গতি "
            f"প্রায় {wind} কিমি/ঘণ্টা।"
        )

    # Marathi
    if req.language == "mr":
        conditions = {
            "clear": "स्वच्छ",
            "rainy": "पावसाळी",
            "stormy": "वादळी",
            "unsettled": "बदलते"
        }

        return (
            f"{place} येथे सध्या तापमान "
            f"सुमारे {temp}°C आहे. हवामान "
            f"{conditions[condition]} आहे. "
            f"पर्जन्यमान {rain} मिमी असून "
            f"वाऱ्याचा वेग सुमारे {wind} किमी/ता. आहे."
        )

    # Spanish
    if req.language == "es":
        conditions = {
            "clear": "despejado",
            "rainy": "lluvioso",
            "stormy": "tormentoso",
            "unsettled": "variable"
        }

        return (
            f"En {place}, la temperatura actual "
            f"es de aproximadamente {temp}°C. "
            f"El tiempo está {conditions[condition]}. "
            f"La precipitación es de {rain} mm "
            f"y el viento alcanza unos {wind} km/h."
        )

    # French
    if req.language == "fr":
        conditions = {
            "clear": "dégagé",
            "rainy": "pluvieux",
            "stormy": "orageux",
            "unsettled": "variable"
        }

        return (
            f"À {place}, la température actuelle "
            f"est d'environ {temp}°C. Le temps est "
            f"{conditions[condition]}. Les précipitations "
            f"sont de {rain} mm et le vent souffle à "
            f"environ {wind} km/h."
        )

    # German
    if req.language == "de":
        conditions = {
            "clear": "klar",
            "rainy": "regnerisch",
            "stormy": "stürmisch",
            "unsettled": "wechselhaft"
        }

        return (
            f"In {place} beträgt die aktuelle "
            f"Temperatur etwa {temp}°C. Das Wetter "
            f"ist {conditions[condition]}. Der "
            f"Niederschlag beträgt {rain} mm und "
            f"der Wind weht mit etwa {wind} km/h."
        )

    # Japanese
    if req.language == "ja":
        conditions = {
            "clear": "晴れ",
            "rainy": "雨",
            "stormy": "嵐",
            "unsettled": "不安定"
        }

        return (
            f"{place}の現在の気温は約{temp}°Cです。"
            f"現在の天気は{conditions[condition]}です。"
            f"降水量は{rain}mm、風速は約"
            f"{wind}km/hです。"
        )

    # Unknown language → English
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

    knowledge = retrieve_knowledge(
        req.message
    )

    system = f"""
You are WeatherGPT, a careful multilingual weather assistant.

IMPORTANT LANGUAGE RULE:
The user's selected language is {language_name}.
You MUST write your entire response ONLY in {language_name}.
Do NOT answer in English unless the selected language is English.
Do NOT mix English with {language_name}.
Translate explanations, recommendations, headings, and normal weather descriptions into {language_name}.
Keep place names such as city and country names in their commonly recognized local form when appropriate.
Weather numbers, temperatures, dates, percentages, and units must remain accurate.

Selected language code: {req.language}
Selected language name: {language_name}

Location:
{req.location.name}, {req.location.country}

Coordinates:
{req.location.lat}, {req.location.lon}

Mode:
{req.mode}

Weather data:
{req.weather}

Retrieved weather guidance:
{knowledge}

Use only the supplied weather data.
Do not invent weather values, forecasts, or alerts.
For severe-weather safety questions, advise the user to check official local alerts.
Keep normal answers concise, clear, and useful.

FINAL CHECK BEFORE RESPONDING:
1. Is the entire response written in {language_name}?
2. Did you accidentally use English sentences?
3. Did you mix languages?
If yes, rewrite the response completely in {language_name} before sending it.
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
                            "role": "system",
                            "content": system
                        },
                        {
                            "role": "user",
                            "content": req.message
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
                "language": req.language,
                "source": "llm-rag"
            }

        except Exception:
            pass

    return {
        "answer": local_answer(
            req,
            knowledge
        ),
        "language": req.language,
        "source": "local-rag-fallback"
            }
