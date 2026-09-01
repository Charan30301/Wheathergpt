"use client";

import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import {
  Bot,
  CalendarDays,
  Cloud,
  CloudRain,
  CloudLightning,
  Droplets,
  Globe2,
  LocateFixed,
  MapPin,
  Mic,
  Navigation,
  Pause,
  Play,
  Plane,
  Search,
  Send,
  Settings2,
  Sprout,
  Sun,
  Volume2,
  Wind,
  X,
  RefreshCw
} from "lucide-react";

const Globe = dynamic(
  () => import("react-globe.gl"),
  { ssr: false }
);
type GlobeLabel = {
  name: string;
  lat: number;
  lng: number;
  type: "country" | "state" | "city";
};

const globeLabels: GlobeLabel[] = [
  { name: "India", lat: 20.59, lng: 78.96, type: "country" },
  { name: "United States", lat: 39.8, lng: -98.6, type: "country" },
  { name: "Canada", lat: 56.1, lng: -106.3, type: "country" },
  { name: "Brazil", lat: -10.8, lng: -51.9, type: "country" },
  { name: "United Kingdom", lat: 55.4, lng: -3.4, type: "country" },
  { name: "France", lat: 46.2, lng: 2.2, type: "country" },
  { name: "Germany", lat: 51.2, lng: 10.4, type: "country" },
  { name: "China", lat: 35.9, lng: 104.2, type: "country" },
  { name: "Japan", lat: 36.2, lng: 138.3, type: "country" },
  { name: "Australia", lat: -25.3, lng: 133.8, type: "country" },

  { name: "Maharashtra", lat: 19.75, lng: 75.71, type: "state" },
  { name: "Telangana", lat: 18.11, lng: 79.02, type: "state" },
  { name: "Karnataka", lat: 15.32, lng: 75.71, type: "state" },
  { name: "Tamil Nadu", lat: 11.13, lng: 78.66, type: "state" },
  { name: "Kerala", lat: 10.85, lng: 76.27, type: "state" },

  { name: "Hyderabad", lat: 17.39, lng: 78.49, type: "city" },
  { name: "Mumbai", lat: 19.08, lng: 72.88, type: "city" },
  { name: "Delhi", lat: 28.61, lng: 77.21, type: "city" },
  { name: "Bengaluru", lat: 12.97, lng: 77.59, type: "city" },
  { name: "Chennai", lat: 13.08, lng: 80.27, type: "city" },
  { name: "London", lat: 51.51, lng: -0.13, type: "city" },
  { name: "New York", lat: 40.71, lng: -74.01, type: "city" },
  { name: "Tokyo", lat: 35.68, lng: 139.69, type: "city" },
];
const LiveMap = dynamic(
  () => import("../../components/LiveMap"),
  { ssr: false }
);

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

type Location = {
  name: string;
  country?: string;
  lat: number;
  lon: number;
};

type Mode =
  | "weather"
  | "farmer"
  | "traveler";

type Weather = {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    precipitation: number;
    rain: number;
    snowfall: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    pressure_msl: number;
  };

  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    precipitation_probability_max: number[];
    wind_speed_10m_max: number[];
  };

  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation_probability: number[];
    precipitation: number[];
    weather_code: number[];
    wind_speed_10m: number[];
  };

  timezone: string;
};

const languages: Record<string, string> = {
  en: "English",
  te: "Telugu",
  hi: "Hindi",
  ta: "Tamil",
  kn: "Kannada",
  ml: "Malayalam",
  bn: "Bengali",
  mr: "Marathi",
  es: "Spanish",
  fr: "French",
  de: "German",
  ja: "Japanese"
};
const translations: Record<
  string,
  Record<string, string>
> = {
  en: {
    weatherMode: "WEATHER MODE",
    farmerMode: "FARMER MODE",
    travelerMode: "TRAVELER MODE",
    weather: "Weather",
    farmer: "Farmer",
    traveler: "Traveler",
weatherCalendar: "WEATHER CALENDAR",
oday: "Today",
upcomingWeather: "Upcoming weather",
forecast: "7-day forecast",  

  search: "Search any place or ask WeatherGPT…",
    map: "Map",
    pauseGlobe: "Pause globe",
    rotateGlobe: "Rotate globe",
    cultivate: "What can I cultivate here?",
    loadingCrops: "Loading crop guidance…",
    liveTracking: "Live travel tracking",
    travelDescription:
      "Your weather location follows browser GPS while Traveler Mode is active.",
    live: "LIVE",
    off: "OFF",
    feelsLike: "Feels like",
    repliesIn: "Replies in"
  },

  te: {
    weatherMode: "వాతావరణ మోడ్",
    farmerMode: "రైతు మోడ్",
    travelerMode: "ప్రయాణ మోడ్",
    weather: "వాతావరణం",
    farmer: "రైతు",
    traveler: "ప్రయాణం",
weatherCalendar: "వాతావరణ క్యాలెండర్",

today: "ఈరోజు",
upcomingWeather: "రాబోయే వాతావరణం",
forecast: "7 రోజుల సూచన",
    search: "ఏదైనా ప్రదేశాన్ని వెతకండి లేదా WeatherGPTని అడగండి…",
    map: "మ్యాప్",
    pauseGlobe: "గ్లోబ్ ఆపండి",
    rotateGlobe: "గ్లోబ్ తిప్పండి",
    cultivate: "ఇక్కడ నేను ఏమి సాగు చేయగలను?",
    loadingCrops: "పంట సూచనలు లోడ్ అవుతున్నాయి…",
    liveTracking: "ప్రత్యక్ష ప్రయాణ ట్రాకింగ్",
    travelDescription:
      "Traveler Mode యాక్టివ్‌లో ఉన్నప్పుడు మీ వాతావరణ ప్రదేశం GPSను అనుసరిస్తుంది.",
    live: "లైవ్",
    off: "ఆఫ్",
    feelsLike: "అనిపించే ఉష్ణోగ్రత",
    repliesIn: "సమాధానాలు"
  },

  hi: {
    weatherMode: "मौसम मोड",
    farmerMode: "किसान मोड",
    travelerMode: "यात्री मोड",
    weather: "मौसम",

    farmer: "किसान",
    traveler: "यात्री",
weatherCalendar: "मौसम कैलेंडर",
today: "आज",
upcomingWeather: "आगामी मौसम",
forecast: "7 दिनों का पूर्वानुमान",
    search: "कोई स्थान खोजें या WeatherGPT से पूछें…",
    map: "मानचित्र",
    pauseGlobe: "ग्लोब रोकें",
    rotateGlobe: "ग्लोब घुमाएँ",
    cultivate: "मैं यहाँ क्या उगा सकता हूँ?",
    loadingCrops: "फसल सलाह लोड हो रही है…",
    liveTracking: "लाइव यात्रा ट्रैकिंग",
    travelDescription:
      "Traveler Mode सक्रिय होने पर आपका मौसम स्थान GPS का अनुसरण करता है।",
    live: "लाइव",
    off: "बंद",
    feelsLike: "महसूस होता है",
    repliesIn: "जवाब"
  },

  ta: {
    weatherMode: "வானிலை பயன்முறை",
    farmerMode: "விவசாயி பயன்முறை",
    travelerMode: "பயணி பயன்முறை",
    weather: "வானிலை",
    farmer: "விவசாயி",
    traveler: "பயணி",
weatherCalendar: "வானிலை நாட்காட்டி",
today: "இன்று",
upcomingWeather: "வரவிருக்கும் வானிலை",
forecast: "7 நாள் முன்னறிவிப்பு",
    search: "எந்த இடத்தையும் தேடுங்கள் அல்லது WeatherGPT-ஐ கேளுங்கள்…",
    map: "வரைபடம்",
    pauseGlobe: "குளோபை நிறுத்து",
    rotateGlobe: "குளோபை சுழற்று",
    cultivate: "இங்கே நான் என்ன பயிரிடலாம்?",
    loadingCrops: "பயிர் ஆலோசனை ஏற்றப்படுகிறது…",
    liveTracking: "நேரடி பயண கண்காணிப்பு",
    travelDescription:
      "Traveler Mode செயல்பாட்டில் இருக்கும்போது உங்கள் வானிலை இருப்பிடம் GPS-ஐ பின்தொடரும்.",
    live: "நேரலை",
    off: "ஆஃப்",
    feelsLike: "உணரப்படும் வெப்பநிலை",
    repliesIn: "பதில்கள்"
  },
kn: {
    weatherMode: "ಹವಾಮಾನ ಮೋಡ್",
    farmerMode: "ರೈತ ಮೋಡ್",
    travelerMode: "ಪ್ರಯಾಣಿಕ ಮೋಡ್",
    weather: "ಹವಾಮಾನ",
    farmer: "ರೈತ",
    traveler: "ಪ್ರಯಾಣಿಕ",
weatherCalendar: "ಹವಾಮಾನ ಕ್ಯಾಲೆಂಡರ್",
today: "ಇಂದು",
upcomingWeather: "ಮುಂಬರುವ ಹವಾಮಾನ",
forecast: "7 ದಿನಗಳ ಮುನ್ಸೂಚನೆ",
    search: "ಯಾವುದೇ ಸ್ಥಳವನ್ನು ಹುಡುಕಿ ಅಥವಾ WeatherGPT ಅನ್ನು ಕೇಳಿ…",
    map: "ನಕ್ಷೆ",
    pauseGlobe: "ಗ್ಲೋಬ್ ನಿಲ್ಲಿಸಿ",
    rotateGlobe: "ಗ್ಲೋಬ್ ತಿರುಗಿಸಿ",
    cultivate: "ನಾನು ಇಲ್ಲಿ ಏನು ಬೆಳೆಸಬಹುದು?",
    loadingCrops: "ಬೆಳೆ ಸಲಹೆ ಲೋಡ್ ಆಗುತ್ತಿದೆ…",
    liveTracking: "ಲೈವ್ ಪ್ರಯಾಣ ಟ್ರ್ಯಾಕಿಂಗ್",
    live: "ಲೈವ್",
    off: "ಆಫ್",
    feelsLike: "ಅನುಭವವಾಗುವ ತಾಪಮಾನ",
    repliesIn: "ಉತ್ತರಗಳು"
  },

  ml: {
    weatherMode: "കാലാവസ്ഥ മോഡ്",
    farmerMode: "കർഷക മോഡ്",
    travelerMode: "യാത്രിക മോഡ്",
    weather: "കാലാവസ്ഥ",
    farmer: "കർഷകൻ",
    traveler: "യാത്രികൻ",
weatherCalendar: "കാലാവസ്ഥാ കലണ്ടർ",
today: "ഇന്ന്",
upcomingWeather: "വരാനിരിക്കുന്ന കാലാവസ്ഥ",
forecast: "7 ദിവസത്തെ പ്രവചനം",
    search: "ഏത് സ്ഥലവും തിരയുക അല്ലെങ്കിൽ WeatherGPT-യോട് ചോദിക്കുക…",
    map: "മാപ്പ്",
    pauseGlobe: "ഗ്ലോബ് നിർത്തുക",
    rotateGlobe: "ഗ്ലോബ് തിരിക്കുക",
    cultivate: "എനിക്ക് ഇവിടെ എന്ത് കൃഷി ചെയ്യാം?",
    loadingCrops: "വിള നിർദ്ദേശങ്ങൾ ലോഡ് ചെയ്യുന്നു…",
    liveTracking: "തത്സമയ യാത്രാ ട്രാക്കിംഗ്",
    live: "തത്സമയം",
    off: "ഓഫ്",
    feelsLike: "അനുഭവപ്പെടുന്ന താപനില",
    repliesIn: "മറുപടികൾ"
  },

  bn: {
    weatherMode: "আবহাওয়া মোড",
    farmerMode: "কৃষক মোড",
    travelerMode: "ভ্রমণকারী মোড",
    weather: "আবহাওয়া",
    farmer: "কৃষক",
    traveler: "ভ্রমণকারী",
weatherCalendar: "আবহাওয়া ক্যালেন্ডার",
today: "আজ",
upcomingWeather: "আসন্ন আবহাওয়া",
forecast: "৭ দিনের পূর্বাভাস",
    search: "যেকোনো স্থান খুঁজুন বা WeatherGPT-কে জিজ্ঞাসা করুন…",
    map: "মানচিত্র",
    pauseGlobe: "গ্লোব থামান",
    rotateGlobe: "গ্লোব ঘোরান",
    cultivate: "আমি এখানে কী চাষ করতে পারি?",
    loadingCrops: "ফসলের পরামর্শ লোড হচ্ছে…",
    liveTracking: "লাইভ ভ্রমণ ট্র্যাকিং",
    live: "লাইভ",
    off: "বন্ধ",
    feelsLike: "অনুভূত তাপমাত্রা",
    repliesIn: "উত্তর"
  },

  mr: {
    weatherMode: "हवामान मोड",
    farmerMode: "शेतकरी मोड",
    travelerMode: "प्रवासी मोड",
    weather: "हवामान",
    farmer: "शेतकरी",
    traveler: "प्रवासी",
weatherCalendar: "हवामान कॅलेंडर",
today: "आज",
upcomingWeather: "आगामी हवामान",
forecast: "७ दिवसांचा अंदाज",
    search: "कोणतेही ठिकाण शोधा किंवा WeatherGPT ला विचारा…",
    map: "नकाशा",
    pauseGlobe: "ग्लोब थांबवा",
    rotateGlobe: "ग्लोब फिरवा",
    cultivate: "मी येथे काय पिकवू शकतो?",
    loadingCrops: "पिकांचा सल्ला लोड होत आहे…",
    liveTracking: "थेट प्रवास ट्रॅकिंग",
    live: "थेट",
    off: "बंद",
    feelsLike: "जाणवणारे तापमान",
    repliesIn: "उत्तरे"
  },

  es: {
    weatherMode: "MODO CLIMA",
    farmerMode: "MODO AGRICULTOR",
    travelerMode: "MODO VIAJERO",
    weather: "Clima",
    farmer: "Agricultor",
    traveler: "Viajero",
weatherCalendar: "CALENDARIO DEL TIEMPO",
today: "Hoy",

upcomingWeather: "Próximo tiempo",
forecast: "Pronóstico de 7 días",
    search: "Busca cualquier lugar o pregunta a WeatherGPT…",
    map: "Mapa",
    pauseGlobe: "Pausar globo",
    rotateGlobe: "Girar globo",
    cultivate: "¿Qué puedo cultivar aquí?",
    loadingCrops: "Cargando consejos de cultivos…",
    liveTracking: "Seguimiento de viaje en vivo",
    live: "EN VIVO",
    off: "APAGADO",
    feelsLike: "Sensación térmica",
    repliesIn: "Respuestas"
  },

  fr: {
    weatherMode: "MODE MÉTÉO",
    farmerMode: "MODE AGRICULTEUR",
    travelerMode: "MODE VOYAGEUR",
    weather: "Météo",
    farmer: "Agriculteur",
    traveler: "Voyageur",
weatherCalendar: "CALENDRIER MÉTÉO",
today: "Aujourd'hui",
upcomingWeather: "Météo à venir",
forecast: "Prévisions sur 7 jours",
    search: "Recherchez un lieu ou demandez à WeatherGPT…",
    map: "Carte",
    pauseGlobe: "Mettre le globe en pause",
    rotateGlobe: "Faire tourner le globe",
    cultivate: "Que puis-je cultiver ici ?",
    loadingCrops: "Chargement des conseils agricoles…",
    liveTracking: "Suivi de voyage en direct",
    live: "EN DIRECT",
    off: "DÉSACTIVÉ",
    feelsLike: "Ressenti",
    repliesIn: "Réponses"
  },

  de: {
    weatherMode: "WETTERMODUS",
    farmerMode: "LANDWIRTSCHAFTSMODUS",
    travelerMode: "REISEMODUS",
    weather: "Wetter",
    farmer: "Landwirtschaft",
    traveler: "Reisender",
weatherCalendar: "WETTERKALENDER",
today: "Heute",
upcomingWeather: "Kommendes Wetter",
forecast: "7-Tage-Vorhersage",
    search: "Ort suchen oder WeatherGPT fragen…",
    map: "Karte",
    pauseGlobe: "Globus pausieren",
    rotateGlobe: "Globus drehen",
    cultivate: "Was kann ich hier anbauen?",
    loadingCrops: "Anbauempfehlungen werden geladen…",
    liveTracking: "Live-Reiseverfolgung",
    live: "LIVE",
    off: "AUS",
    feelsLike: "Gefühlt",
    repliesIn: "Antworten"
  },

  ja: {
    weatherMode: "天気モード",
    farmerMode: "農家モード",
    travelerMode: "旅行モード",
    weather: "天気",
    farmer: "農業",
    traveler: "旅行者",
weatherCalendar: "天気カレンダー",
today: "今日",
upcomingWeather: "今後の天気",
forecast: "7日間の予報",
    search: "場所を検索するか、WeatherGPTに質問してください…",
    map: "地図",

    pauseGlobe: "地球儀を一時停止",
    rotateGlobe: "地球儀を回す",
    cultivate: "ここでは何を栽培できますか？",
    loadingCrops: "作物のアドバイスを読み込んでいます…",
    liveTracking: "旅行のライブ追跡",
    live: "ライブ",
    off: "オフ",
    feelsLike: "体感温度",
    repliesIn: "回答"
  }
};
function weatherLabel(code: number) {
  if (code === 0) return "Clear sky";

  if ([1, 2, 3].includes(code))
    return "Partly cloudy";

  if ([45, 48].includes(code))
    return "Fog";

  if ([51, 53, 55, 56, 57].includes(code))
    return "Drizzle";

  if (
    [61, 63, 65, 66, 67, 80, 81, 82]
      .includes(code)
  )
    return "Rain";

  if ([71, 73, 75, 77, 85, 86].includes(code))
    return "Snow";

  if ([95, 96, 99].includes(code))
    return "Thunderstorm";

  return "Weather event";
}

function weatherIcon(code: number) {
  if (code === 0)
    return <Sun size={20} />;

  if ([1, 2, 3].includes(code))
    return <Cloud size={20} />;

  if (
    [61, 63, 65, 80, 81, 82].includes(code)
  )
    return <CloudRain size={20} />;

  if ([95, 96, 99].includes(code))
    return <CloudLightning size={20} />;

  return <Cloud size={20} />;
}
export default function WeatherPage() {
  const [language, setLanguage] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("weathergpt-language") ||
        "en"
      );
    }

    return "en";
  });

  const t = (key: string) =>
    translations[language]?.[key] ||
    translations.en[key] ||
    key;

  const [mode, setMode] =
    useState<Mode>("weather");

  const [location, setLocation] =
    useState<Location>({
      name: "India",
      country: "India",
      lat: 20.5937,
      lon: 78.9629
    });
  const [weather, setWeather] =
    useState<Weather | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [locationLoading, setLocationLoading] =
    useState(false);

  const [mapOpen, setMapOpen] =
    useState(false);

  const [searchText, setSearchText] =
    useState("");

  const [chatOpen, setChatOpen] =
    useState(true);

  const [chatInput, setChatInput] =
    useState("");

  const [messages, setMessages] =
    useState<
      {
        role: "user" | "assistant";
        text: string;
      }[]
    >([]);

  const [listening, setListening] =
    useState(false);

  const [autoRotate, setAutoRotate] =
    useState(true);

  const [farmerData, setFarmerData] =
    useState<
      {
        crop: string;
        reason: string;
      }[]
    >([]);

  const [travelerLive, setTravelerLive] =
    useState(false);

  const [effectsEnabled, setEffectsEnabled] =
    useState(true);

  const globeRef =
    useRef<any>(null);

  const recognitionRef =
    useRef<any>(null);

  const lastTravelerUpdate =
    useRef(0);

  useEffect(() => {
    const saved =
      localStorage.getItem(
        "weathergpt-language"
      );

    if (
      saved &&
      languages[saved]
    ) {
      setLanguage(saved);
    }
  }, []);

  const loadWeather =
    useCallback(
      async (loc: Location) => {
        setLoading(true);

        try {
          const r = await fetch(
            `${API}/api/weather?lat=${loc.lat}&lon=${loc.lon}&timezone=auto`
          );

          if (!r.ok) {
            throw new Error(
              "Weather request failed"
            );
          }

          setWeather(
            await r.json()
          );
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      },
      []
    );

  useEffect(() => {
    loadWeather(location);
  }, [
    location,
    loadWeather
  ]);

  const useCurrentLocation =
    useCallback(() => {
      if (!navigator.geolocation)
        return;

      setLocationLoading(true);

      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          try {
            const r =
              await fetch(
                `${API}/api/geocode/reverse?lat=${coords.latitude}&lon=${coords.longitude}`
              );

            const d =
              await r.json();

            setLocation({
              name:
                d.name ||
                "Current location",
              country:
                d.country || "",
              lat:
                coords.latitude,
              lon:
                coords.longitude
            });
          } finally {
            setLocationLoading(false);
          }
        },
        () =>
          setLocationLoading(false),
        {
          enableHighAccuracy: true,
          timeout: 10000
        }
      );
    }, []);

  useEffect(() => {
    useCurrentLocation();
  }, [useCurrentLocation]);

useEffect(() => {
  if (!globeRef.current)
    return;

  const controls =
    globeRef.current.controls();

  // Stop rotation while flying to the new location
  controls.autoRotate = false;

  // Move the selected location to the front
  globeRef.current.pointOfView(
    {
      lat: location.lat,
      lng: location.lon,
      altitude: 1.55
    },
    2500
  );

  // Start rotating again after reaching the location
  const timer = setTimeout(() => {
    controls.autoRotate = true;
  }, 2600);

  return () => {
    clearTimeout(timer);
  };
}, [location]);
  useEffect(() => {
    if (!globeRef.current)
      return;

    globeRef.current
      .controls()
      .autoRotate =
      autoRotate;

    globeRef.current
      .controls()
      .autoRotateSpeed =
      0.35;
  }, [
    autoRotate,
    weather
  ]);

  useEffect(() => {
    if (mode !== "farmer")
      return;

    fetch(
      `${API}/api/farmer/crops?lat=${location.lat}&lon=${location.lon}`
    )
      .then((r) => r.json())
      .then(setFarmerData)
      .catch(console.error);
  }, [
    mode,
    location
  ]);

  useEffect(() => {
    if (mode !== "traveler")
      return;

    setTravelerLive(true);

    return () =>
      setTravelerLive(false);
  }, [mode]);

  useEffect(() => {
    if (
      !travelerLive ||
      mode !== "traveler" ||
      !navigator.geolocation
    ) {
      return;
    }

    const id =
      navigator.geolocation.watchPosition(
        async ({ coords }) => {
          const now =
            Date.now();

          if (
            now -
              lastTravelerUpdate.current <
            60000
          ) {
            return;
          }

          lastTravelerUpdate.current =
            now;

          try {
            const r =
              await fetch(
                `${API}/api/geocode/reverse?lat=${coords.latitude}&lon=${coords.longitude}`
              );

            const d =
              await r.json();

            setLocation({
              name:
                d.name ||
                "Moving location",
              country:
                d.country || "",
              lat:
                coords.latitude,
              lon:
                coords.longitude
            });
          } catch {}
        }
      );

    return () =>
      navigator.geolocation.clearWatch(
        id
      );
  }, [
    travelerLive,
    mode
  ]);

  const eventType =
    useMemo(() => {
      if (!weather)
        return "clear";

      const c =
        weather.current.weather_code;

      if (
        [95, 96, 99].includes(c)
      ) {
        return "storm";
      }

      if (
        [61, 63, 65, 80, 81, 82]
          .includes(c) &&
        weather.current
          .precipitation >= 5
      ) {
        return "heavy-rain";
      }

      if (
        weather.daily.weather_code.some(
          (x) =>
            [95, 96, 99].includes(x)
        )
      ) {
        return "storm";
      }

      if (
        weather.daily.precipitation_sum.some(
          (x) => x >= 30
        )
      ) {
        return "heavy-rain";
      }

      if (c === 0)
        return "clear";

      return "cloud";
    }, [weather]);
const chooseMapLocation =
  (loc: Location) => {
    setLocation(loc);
    setMapOpen(false);
    setSearchText("");
  };
  async function sendChat(
    preset?: string
  ) {
    const text =
      (preset ?? chatInput).trim();

    if (!text)
      return;

    setMessages((old) => [
      ...old,
      {
        role: "user",
        text
      }
    ]);

    setChatInput("");

    try {
      const r =
        await fetch(
          `${API}/api/chat`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json"
            },
            body: JSON.stringify({
              message: text,
              language,
              mode,
              location,
              weather
            })
          }
        );

      const d =
        await r.json();

      const answer =
        d.answer ||
        "I couldn't generate a weather answer.";

      setMessages((old) => [
        ...old,
        {
          role: "assistant",
          text: answer
        }
      ]);

      speak(answer);
    } catch {
      setMessages((old) => [
        ...old,
        {
          role: "assistant",
          text:
            "WeatherGPT backend is unavailable. Start FastAPI on port 8000."
        }
      ]);
    }
  }

  function speak(text: string) {
    if (
      !("speechSynthesis" in window)
    )
      return;

    window.speechSynthesis.cancel();

    const u =
      new SpeechSynthesisUtterance(
        text
      );

    u.lang =
      language === "te"
        ? "te-IN"
        : `${language}-IN`;

    window.speechSynthesis.speak(u);
  }

  function toggleVoice() {
    const Recognition =
      (window as any)
        .SpeechRecognition ||
      (window as any)
        .webkitSpeechRecognition;

    if (!Recognition) {
      alert(
        "Voice input is not supported by this browser. Try Chrome or Edge."
      );

      return;
    }

    if (
      listening &&
      recognitionRef.current
    ) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    const recognition =
      new Recognition();

    recognition.lang =
      language === "te"
        ? "te-IN"
        : `${language}-IN`;

    recognition.interimResults =
      false;

    recognition.continuous =
      false;

    recognition.onstart = () =>
      setListening(true);

    recognition.onend = () =>
      setListening(false);

    recognition.onerror = () =>
      setListening(false);

    recognition.onresult =
      (event: any) => {
        const transcript =
          event.results[0][0]
            .transcript;

        setChatInput(
          transcript
        );

        sendChat(transcript);
      };

    recognitionRef.current =
      recognition;

    recognition.start();
  }
const globeLabels = [
  // Countries
  { name: "India", lat: 20.5937, lng: 78.9629, type: "country" },
  { name: "United States", lat: 37.0902, lng: -95.7129, type: "country" },
  { name: "Canada", lat: 56.1304, lng: -106.3468, type: "country" },
  { name: "Brazil", lat: -14.2350, lng: -51.9253, type: "country" },
  { name: "Australia", lat: -25.2744, lng: 133.7751, type: "country" },
  { name: "China", lat: 35.8617, lng: 104.1954, type: "country" },
  { name: "Japan", lat: 36.2048, lng: 138.2529, type: "country" },
  { name: "United Kingdom", lat: 55.3781, lng: -3.4360, type: "country" },
  { name: "France", lat: 46.2276, lng: 2.2137, type: "country" },
  { name: "Germany", lat: 51.1657, lng: 10.4515, type: "country" },
  { name: "Russia", lat: 61.5240, lng: 105.3188, type: "country" },
  { name: "South Africa", lat: -30.5595, lng: 22.9375, type: "country" },

  // Major cities
  { name: "New Delhi", lat: 28.6139, lng: 77.2090, type: "city" },
  { name: "Mumbai", lat: 19.0760, lng: 72.8777, type: "city" },
  { name: "Hyderabad", lat: 17.3850, lng: 78.4867, type: "city" },
  { name: "Bengaluru", lat: 12.9716, lng: 77.5946, type: "city" },
  { name: "Chennai", lat: 13.0827, lng: 80.2707, type: "city" },
  { name: "Kolkata", lat: 22.5726, lng: 88.3639, type: "city" },
  { name: "London", lat: 51.5074, lng: -0.1278, type: "city" },
  { name: "Paris", lat: 48.8566, lng: 2.3522, type: "city" },
  { name: "New York", lat: 40.7128, lng: -74.0060, type: "city" },
  { name: "Tokyo", lat: 35.6762, lng: 139.6503, type: "city" },
  { name: "Sydney", lat: -33.8688, lng: 151.2093, type: "city" },
  { name: "Dubai", lat: 25.2048, lng: 55.2708, type: "city" }
];

const globePoints = [
  {
    lat: location.lat,
    lng: location.lon,
    size: 1,
    color: "#6ee7ff",
    label: `${Math.round(
      weather?.current.temperature_2m ?? 0
    )}°C`
  }
];
  return (
    <main
      className={`weather-app event-${eventType} ${
        effectsEnabled
          ? ""
          : "effects-off"
      }`}
    >
      {effectsEnabled && (
        <WeatherEffects
          event={eventType}
        />
      )}

      <header className="topbar">
        <div className="brand">
          <div className="brand-dot">
            <Globe2 size={20} />
          </div>

          <div>
            <strong>
              WeatherGPT
            </strong>

            <span>
              AI weather intelligence
            </span>
          </div>
        </div>

        <div className="top-location">
          <MapPin size={15} />
          <span>
            {location.name}
          </span>
          <small>
            {location.country}
          </small>
        </div>

        <div className="top-actions">
          <button
            className="icon-button"
            title="Current location"
            onClick={
              useCurrentLocation
            }
          >
            <LocateFixed size={18} />
          </button>

          <button
            className="icon-button"
            title="Toggle weather effects"
            onClick={() =>
              setEffectsEnabled(
                (v) => !v
              )
            }
          >
            <Settings2 size={18} />
          </button>

          <div className="language-pill">
            <Globe2 size={14} />

            <select
              value={language}
              onChange={(e) => {
                setLanguage(
                  e.target.value
                );

                localStorage.setItem(
                  "weathergpt-language",
                  e.target.value
                );
              }}
            >
              {Object.entries(
                languages
              ).map(
                ([code, name]) => (
                  <option
                    key={code}
                    value={code}
                  >
                    {name}
                  </option>
                )
              )}
            </select>
          </div>
        </div>
      </header>

      <section className="workspace">
        <aside className="left-rail">
          <button
            className={`rail-mode ${
              mode === "weather"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setMode("weather")
            }
          >
            <Cloud size={19} />
<span>
  {t("weather")}
</span>
          </button>

          <button
            className={`rail-mode ${
              mode === "farmer"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setMode("farmer")
            }
          >
            <Sprout size={19} />
<span>
  {t("farmer")}
</span>
          </button>

          <button
            className={`rail-mode ${
              mode === "traveler"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setMode("traveler")
            }
          >
            <Plane size={19} />
<span>
  {t("traveler")}
</span>
          </button>
        </aside>

        <section className="main-stage">
          <div className="hero-copy">
            <div>
              <p className="eyebrow">
                <Bot size={14} />
                {mode.toUpperCase()} MODE
              </p>

              <h1>
                {loading
                  ? "Reading the sky…"
                  : `${Math.round(
                      weather?.current
                        .temperature_2m ??
                        0
                    )}°`}
              </h1>

              <p>
                {weatherLabel(
                  weather?.current
                    .weather_code ?? 0
                )}{" "}
                · Feels like{" "}
                {Math.round(
                  weather?.current
                    .apparent_temperature ??
                    0
                )}
                °
              </p>
            </div>

            <div className="hero-search">
              <Search size={19} />

              <input
                value={searchText}
                onFocus={() =>
                  setMapOpen(true)
                }
                onChange={(e) =>
                  setSearchText(
                    e.target.value
                  )
                }
placeholder={t("search")}
              />

              <button
                onClick={() =>
                  setMapOpen(true)
                }
              >
                {t("map")}
              </button>
            </div>
          </div>

          <div className="globe-wrap">
            <div className="globe-hud">
              <div className="hud-chip">
                <Wind size={14} />
                {Math.round(
                  weather?.current
                    .wind_speed_10m ??
                    0
                )}{" "}
                km/h
              </div>

              <div className="hud-chip">
                <Droplets size={14} />
                {Math.round(
                  weather?.current
                    .relative_humidity_2m ??
                    0
                )}
                %
              </div>

              <div className="hud-chip">
                <CloudRain size={14} />
                {Math.round(
                  weather?.current
                    .precipitation ??
                    0
                )}{" "}
                mm
              </div>
            </div>

<Globe
  ref={globeRef}
  width={
    typeof window !== "undefined"
      ? Math.min(window.innerWidth - 100, 1250)
      : 1000
  }
  height={520}
  backgroundColor="rgba(0,0,0,0)"
  globeImageUrl="https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
  bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
  atmosphereColor="#67ddff"
  atmosphereAltitude={0.18}
  pointsData={globePoints}
  pointLat="lat"
  pointLng="lng"
  pointRadius={0.55}
  pointAltitude={0.05}
  pointLabel="label"

  labelsData={globeLabels}
  labelLat={(d: any) => d.lat}
  labelLng={(d: any) => d.lng}
  labelText={(d: any) => d.name}
  labelSize={0.7}
  labelColor={() => "#ffffff"}
  labelResolution={2}
  onGlobeClick={({ lat, lng }: { lat: number; lng: number }) => {
    fetch(
      `${API}/api/geocode/reverse?lat=${lat}&lon=${lng}`
    )
      .then((r) => r.json())
      .then((d) => {
        setLocation({
          name: d.name || "Selected point",
          country: d.country || "",
          lat,
          lon: lng
        });
      })
      .catch(() => {});
  }}
  enablePointerInteraction={true}
  showAtmosphere={true}
  animateIn={true}

/>
            <div className="globe-marker-card">
              <div className="marker-pulse" />

              <MapPin size={18} />

              <div>
                <strong>
                  {location.name}
                </strong>

                <span>
                  {location.country}
                </span>
              </div>

              <b>
                {Math.round(
                  weather?.current
                    .temperature_2m ??
                    0
                )}
                °
              </b>
            </div>

            <button
              className="rotate-button"
              onClick={() =>
                setAutoRotate(
                  (v) => !v
                )
              }
            >
              {autoRotate ? (
                <Pause size={15} />
              ) : (
                <Play size={15} />
              )}
{autoRotate
  ? t("pauseGlobe")
  : t("rotateGlobe")}
            </button>
          </div>

          {mode === "farmer" && (
            <div className="mode-panel">
              <div className="mode-title">
                <Sprout size={18} />
                <span>
{t("cultivate")}
                </span>
              </div>

              <div className="crop-list">
                {farmerData.length ===
                0 ? (
                  <span>
                    Loading crop
                    guidance…
                  </span>
                ) : (
                  farmerData.map(
                    (c) => (
                      <div
                        className="crop-card"
                        key={c.crop}
                      >
                        <strong>
                          {c.crop}
                        </strong>

                        <span>
                          {c.reason}
                        </span>
                      </div>
                    )
                  )
                )}
              </div>
            </div>
          )}

          {mode === "traveler" && (
            <div className="traveler-strip">
              <Navigation size={18} />

              <div>
<strong>
  {t("liveTracking")}
</strong>
                <span>
{t("travelDescription")}
                </span>
              </div>

              <span className="live-dot">
{travelerLive
  ? t("live")
  : t("off")}
              </span>
            </div>
          )}

          <WeatherCalendar
            weather={weather}
t={t}          
/>
        </section>
      </section>

      <button
        className="chat-fab"
        onClick={() =>
          setChatOpen(
            (v) => !v
          )
        }
      >
        {chatOpen ? (
          <X size={23} />
        ) : (
          <Bot size={23} />
        )}
      </button>

      {chatOpen && (
        <section className="chat-panel">
          <div className="chat-header">
            <div className="chat-avatar">
              <Bot size={19} />
            </div>

            <div>
              <strong>
                WeatherGPT
              </strong>

              <span>
                Replies in{" "}
                {languages[language]}
              </span>
            </div>

            <button
              onClick={() =>
                setChatOpen(false)
              }
            >
              <X size={17} />
            </button>
          </div>

          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="chat-welcome">
                <div className="welcome-icon">
                  ✦
                </div>

                <strong>
                  Ask me about{" "}
                  {location.name}
                </strong>

                <p>
                  Try “Will it rain
                  today?”, “What should
                  I grow?” or “Plan my
                  day outdoors.”
                </p>

                <div className="suggestions">
                  <button
                    onClick={() =>
                      sendChat(
                        "Will it rain today?"
                      )
                    }
                  >
                    Will it rain today?
                  </button>

                  <button
                    onClick={() =>
                      sendChat(
                        "Give me today's forecast."
                      )
                    }
                  >
                    Today's forecast
                  </button>

                  <button
                    onClick={() =>
                      sendChat(
                        "Is it safe for travel today?"
                      )
                    }
                  >
                    Travel safety
                  </button>
                </div>
              </div>
            )}

            {messages.map(
              (m, i) => (
                <div
                  key={i}
                  className={`chat-message ${m.role}`}
                >
                  {m.role ===
                    "assistant" && (
                    <Bot size={14} />
                  )}

                  <span>
                    {m.text}
                  </span>

                  {m.role ===
                    "assistant" && (
                    <button
                      className="speak-small"
                      onClick={() =>
                        speak(m.text)
                      }
                    >
                      <Volume2
                        size={13}
                      />
                    </button>
                  )}
                </div>
              )
            )}
          </div>

          <div className="chat-composer">
            <button
              className={
                listening
                  ? "mic-listening"
                  : ""
              }
              onClick={
                toggleVoice
              }
            >
              <Mic size={18} />
            </button>

            <input
              value={chatInput}
              onChange={(e) =>
                setChatInput(
                  e.target.value
                )
              }
              onKeyDown={(e) =>
                e.key === "Enter" &&
                sendChat()
              }
              placeholder="Message WeatherGPT…"
            />

            <button
              onClick={() =>
                sendChat()
              }
            >
              <Send size={18} />
            </button>
          </div>
        </section>
      )}

      {mapOpen && (
        <div className="map-overlay">
          <div className="map-sheet">
            <div className="map-top">
              <div>
                <p className="eyebrow">
                  <Search size={13} />
                  LIVE LOCATION MAP
                </p>

                <h2>
                  Choose where to see
                  the weather
                </h2>

                <p>
                  Your current location
                  is shown first. Select
                  any point to make it the
                  active weather location.
                </p>
              </div>

              <button
                className="icon-button"
                onClick={() =>
                  setMapOpen(false)
                }
              >
                <X />
              </button>
            </div>

            <LiveMap
              current={location}
              query={searchText}
              onSelect={
                chooseMapLocation
              }
              onLocate={
                useCurrentLocation
              }
            />
          </div>
        </div>
      )}

      {locationLoading && (
        <div className="location-toast">
          <RefreshCw
            size={15}
            className="spin"
          />
          Finding your location…
        </div>
      )}
    </main>
  );
}

function WeatherCalendar({
  weather,
  t
}: {
  weather: Weather | null;
  t: (key: string) => string;
}) {
  if (!weather) return null;

  return (
    <section className="weather-calendar">
      <div className="calendar-heading">
        <div>
          <p className="eyebrow">
            <CalendarDays size={13} />
            {t("weatherCalendar")}
          </p>

          <h2>{t("upcomingWeather")}</h2>
        </div>

        <span>{t("forecast")}</span>
      </div>

      <div className="calendar-row">
        {weather.daily.time.map((day, index) => (
          <article
            key={day}
            className={`day-card ${index === 0 ? "today" : ""}`}
          >
            <strong>
              {index === 0
                ? t("today")
                : new Date(day).toLocaleDateString(undefined, {
                    weekday: "short"
                  })}
            </strong>

            <small>
              {new Date(day).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric"
              })}
            </small>

            <div className="day-icon">
              {weatherIcon(weather.daily.weather_code[index])}
            </div>

            <b>
              {Math.round(
                weather.daily.temperature_2m_max[index]
              )}
              °
            </b>

            <span>
              {Math.round(
                weather.daily.temperature_2m_min[index]
              )}
              °
            </span>

            <div className="day-rain">
              <Droplets size={12} />
              {weather.daily.precipitation_probability_max[index] ?? 0}%
            </div>

            <small>
              {weatherLabel(weather.daily.weather_code[index])}
            </small>
          </article>
        ))}
      </div>
    </section>
  );
}
function WeatherEffects({
  event
}: {
  event: string;
}) {
  if (
    event ===
    "heavy-rain"
  ) {
    return (
      <div
        className="rain-effect"
        aria-hidden
      >
        {Array.from({
          length: 75
        }).map((_, i) => (
          <i
            key={i}
            style={{
              left: `${
                (i * 37) % 100
              }%`,
              animationDelay: `${
                (i % 9) * -0.15
              }s`
            }}
          />
        ))}
      </div>
    );
  }

  if (event === "storm") {
    return (
      <div
        className="storm-effect"
        aria-hidden
      >
        <div className="lightning-flash" />
        <div className="storm-clouds" />
      </div>
    );
  }

  if (event === "clear") {
    return (
      <div
        className="clear-effect"
        aria-hidden
      >
        <div className="sun-orb" />
      </div>
    );
  }

  return (
    <div
      className="cloud-effect"
      aria-hidden
    >
      <div />
      <div />
      <div />
    </div>
  );
}
