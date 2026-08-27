"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type WeatherData = {
  temperature: number;
  humidity: number;
  wind: number;
  precipitation: number;
  weatherCode: number;
  isDay: number;
};

type ForecastDay = {
  date: string;
  temperatureMax: number;
  temperatureMin: number;
  weatherCode: number;
  precipitation: number;
};

type WeatherEvent = {
  date: string;
  type: "storm" | "rain" | "tsunami" | "cyclone" | "earthquake" | "clear";
  title: string;
  description: string;
};

type Message = {
  role: "user" | "assistant";
  text: string;
};

const languageNames: Record<string, string> = {
  en: "English",
  hi: "हिंदी",
  te: "తెలుగు",
  ta: "தமிழ்",
  bn: "বাংলা",
  mr: "मराठी",
  ml: "മലയാളം",
  gu: "ગુજરાતી",
};

const speechLanguages: Record<string, string> = {
  en: "en-IN",
  hi: "hi-IN",
  te: "te-IN",
  ta: "ta-IN",
  bn: "bn-IN",
  mr: "mr-IN",
  ml: "ml-IN",
  gu: "gu-IN",
};

const translations: Record<string, Record<string, string>> = {
  en: {
    weatherAssistant: "Weather Assistant",
    locationRequired: "Location permission required",
    locationDescription:
      "WeatherGPT needs your location to provide local weather forecasts and alerts.",
    allowLocation: "Allow Location",
    searchingLocation: "Finding your location...",
    search: "Search city...",
    currentLocation: "Use my current location",
    today: "Today",
    forecast: "Forecast",
    events: "Weather Events",
    ask: "Ask anything about the weather...",
    listening: "Listening...",
    welcome:
      "Hello! I'm WeatherGPT. Ask me about today's weather, rain, storms, temperature or your forecast.",
    temperature: "Temperature",
    humidity: "Humidity",
    wind: "Wind",
    precipitation: "Rain",
    clear: "Clear",
    rain: "Rain",
    storm: "Storm",
    heavyRain: "Heavy Rain",
    noEvents: "No major weather events detected.",
    changeLanguage: "Change language",
  },

  hi: {
    weatherAssistant: "मौसम सहायक",
    locationRequired: "स्थान की अनुमति आवश्यक है",
    locationDescription:
      "WeatherGPT को स्थानीय मौसम और चेतावनियों के लिए आपके स्थान की आवश्यकता है।",
    allowLocation: "स्थान की अनुमति दें",
    searchingLocation: "आपका स्थान खोजा जा रहा है...",
    search: "शहर खोजें...",
    currentLocation: "मेरे वर्तमान स्थान का उपयोग करें",
    today: "आज",
    forecast: "पूर्वानुमान",
    events: "मौसम की घटनाएं",
    ask: "मौसम के बारे में कुछ भी पूछें...",
    listening: "सुन रहा हूँ...",
    welcome:
      "नमस्ते! मैं WeatherGPT हूँ। आज के मौसम, बारिश, तूफान और तापमान के बारे में पूछें।",
    temperature: "तापमान",
    humidity: "नमी",
    wind: "हवा",
    precipitation: "बारिश",
    clear: "साफ",
    rain: "बारिश",
    storm: "तूफान",
    heavyRain: "भारी बारिश",
    noEvents: "कोई बड़ी मौसम घटना नहीं मिली।",
    changeLanguage: "भाषा बदलें",
  },

  te: {
    weatherAssistant: "వాతావరణ సహాయకుడు",
    locationRequired: "లొకేషన్ అనుమతి అవసరం",
    locationDescription:
      "స్థానిక వాతావరణ సమాచారం మరియు హెచ్చరికల కోసం WeatherGPT కి మీ లొకేషన్ అవసరం.",
    allowLocation: "లొకేషన్ అనుమతించండి",
    searchingLocation: "మీ లొకేషన్ కనుగొంటోంది...",
    search: "నగరాన్ని వెతకండి...",
    currentLocation: "నా ప్రస్తుత లొకేషన్ ఉపయోగించండి",
    today: "ఈ రోజు",
    forecast: "వాతావరణ సూచన",
    events: "వాతావరణ సంఘటనలు",
    ask: "వాతావరణం గురించి ఏదైనా అడగండి...",
    listening: "వింటోంది...",
    welcome:
      "నమస్కారం! నేను WeatherGPT. ఈ రోజు వాతావరణం, వర్షం, తుఫాను మరియు ఉష్ణోగ్రత గురించి అడగండి.",
    temperature: "ఉష్ణోగ్రత",
    humidity: "తేమ",
    wind: "గాలి",
    precipitation: "వర్షం",
    clear: "స్పష్టంగా",
    rain: "వర్షం",
    storm: "తుఫాను",
    heavyRain: "భారీ వర్షం",
    noEvents: "ప్రధాన వాతావరణ సంఘటనలు లేవు.",
    changeLanguage: "భాష మార్చండి",
  },

  ta: {
    weatherAssistant: "வானிலை உதவியாளர்",
    locationRequired: "இருப்பிட அனுமதி தேவை",
    locationDescription:
      "உள்ளூர் வானிலை தகவல்களுக்கு WeatherGPT உங்கள் இருப்பிடத்தைப் பயன்படுத்தும்.",
    allowLocation: "இருப்பிடத்தை அனுமதிக்கவும்",
    searchingLocation: "உங்கள் இருப்பிடம் தேடப்படுகிறது...",
    search: "நகரத்தைத் தேடுங்கள்...",
    currentLocation: "எனது தற்போதைய இருப்பிடத்தைப் பயன்படுத்தவும்",
    today: "இன்று",
    forecast: "முன்னறிவிப்பு",
    events: "வானிலை நிகழ்வுகள்",
    ask: "வானிலை பற்றி ஏதாவது கேளுங்கள்...",
    listening: "கேட்கிறது...",
    welcome:
      "வணக்கம்! நான் WeatherGPT. இன்று வானிலை, மழை மற்றும் வெப்பநிலை பற்றி கேளுங்கள்.",
    temperature: "வெப்பநிலை",
    humidity: "ஈரப்பதம்",
    wind: "காற்று",
    precipitation: "மழை",
    clear: "தெளிவு",
    rain: "மழை",
    storm: "புயல்",
    heavyRain: "கனமழை",
    noEvents: "முக்கிய வானிலை நிகழ்வுகள் இல்லை.",
    changeLanguage: "மொழியை மாற்றவும்",
  },

  bn: {
    weatherAssistant: "আবহাওয়া সহকারী",
    locationRequired: "অবস্থানের অনুমতি প্রয়োজন",
    locationDescription:
      "স্থানীয় আবহাওয়ার তথ্যের জন্য WeatherGPT আপনার অবস্থান ব্যবহার করবে।",
    allowLocation: "অবস্থানের অনুমতি দিন",
    searchingLocation: "আপনার অবস্থান খোঁজা হচ্ছে...",
    search: "শহর অনুসন্ধান করুন...",
    currentLocation: "আমার বর্তমান অবস্থান ব্যবহার করুন",
    today: "আজ",
    forecast: "পূর্বাভাস",
    events: "আবহাওয়ার ঘটনা",
    ask: "আবহাওয়া সম্পর্কে কিছু জিজ্ঞাসা করুন...",
    listening: "শুনছি...",
    welcome:
      "হ্যালো! আমি WeatherGPT। আজকের আবহাওয়া, বৃষ্টি এবং তাপমাত্রা সম্পর্কে জিজ্ঞাসা করুন।",
    temperature: "তাপমাত্রা",
    humidity: "আর্দ্রতা",
    wind: "বাতাস",
    precipitation: "বৃষ্টি",
    clear: "পরিষ্কার",
    rain: "বৃষ্টি",
    storm: "ঝড়",
    heavyRain: "ভারী বৃষ্টি",
    noEvents: "কোনো বড় আবহাওয়ার ঘটনা নেই।",
    changeLanguage: "ভাষা পরিবর্তন করুন",
  },

  mr: {
    weatherAssistant: "हवामान सहाय्यक",
    locationRequired: "स्थानाची परवानगी आवश्यक आहे",
    locationDescription:
      "स्थानिक हवामानासाठी WeatherGPT ला तुमचे स्थान आवश्यक आहे.",
    allowLocation: "स्थानाची परवानगी द्या",
    searchingLocation: "तुमचे स्थान शोधत आहे...",
    search: "शहर शोधा...",
    currentLocation: "माझे वर्तमान स्थान वापरा",
    today: "आज",
    forecast: "हवामान अंदाज",
    events: "हवामान घटना",
    ask: "हवामानाबद्दल काहीही विचारा...",
    listening: "ऐकत आहे...",
    welcome:
      "नमस्कार! मी WeatherGPT आहे. आजचे हवामान, पाऊस आणि तापमानाबद्दल विचारा.",
    temperature: "तापमान",
    humidity: "आर्द्रता",
    wind: "वारा",
    precipitation: "पाऊस",
    clear: "स्वच्छ",
    rain: "पाऊस",
    storm: "वादळ",
    heavyRain: "मुसळधार पाऊस",
    noEvents: "कोणत्याही मोठ्या हवामान घटना नाहीत.",
    changeLanguage: "भाषा बदला",
  },

  ml: {
    weatherAssistant: "കാലാവസ്ഥാ സഹായി",
    locationRequired: "ലൊക്കേഷൻ അനുമതി ആവശ്യമാണ്",
    locationDescription:
      "പ്രാദേശിക കാലാവസ്ഥ അറിയാൻ WeatherGPT നിങ്ങളുടെ ലൊക്കേഷൻ ഉപയോഗിക്കും.",
    allowLocation: "ലൊക്കേഷൻ അനുവദിക്കുക",
    searchingLocation: "നിങ്ങളുടെ ലൊക്കേഷൻ കണ്ടെത്തുന്നു...",
    search: "നഗരം തിരയുക...",
    currentLocation: "എന്റെ നിലവിലെ ലൊക്കേഷൻ ഉപയോഗിക്കുക",
    today: "ഇന്ന്",
    forecast: "കാലാവസ്ഥാ പ്രവചനം",
    events: "കാലാവസ്ഥാ സംഭവങ്ങൾ",
    ask: "കാലാവസ്ഥയെക്കുറിച്ച് എന്തും ചോദിക്കൂ...",
    listening: "കേൾക്കുന്നു...",
    welcome:
      "നമസ്കാരം! ഞാൻ WeatherGPT. ഇന്നത്തെ കാലാവസ്ഥ, മഴ, താപനില എന്നിവയെക്കുറിച്ച് ചോദിക്കൂ.",
    temperature: "താപനില",
    humidity: "ഈർപ്പം",
    wind: "കാറ്റ്",
    precipitation: "മഴ",
    clear: "തെളിഞ്ഞത്",
    rain: "മഴ",
    storm: "കൊടുങ്കാറ്റ്",
    heavyRain: "കനത്ത മഴ",
    noEvents: "പ്രധാന കാലാവസ്ഥാ സംഭവങ്ങളൊന്നുമില്ല.",
    changeLanguage: "ഭാഷ മാറ്റുക",
  },

  gu: {
    weatherAssistant: "હવામાન સહાયક",
    locationRequired: "સ્થાનની પરવાનગી જરૂરી છે",
    locationDescription:
      "સ્થાનિક હવામાન માટે WeatherGPT તમારા સ્થાનનો ઉપયોગ કરશે.",
    allowLocation: "સ્થાનની પરવાનગી આપો",
    searchingLocation: "તમારું સ્થાન શોધી રહ્યા છીએ...",
    search: "શહેર શોધો...",
    currentLocation: "મારું વર્તમાન સ્થાન વાપરો",
    today: "આજે",
    forecast: "હવામાન આગાહી",
    events: "હવામાન ઘટનાઓ",
    ask: "હવામાન વિશે કંઈપણ પૂછો...",
    listening: "સાંભળી રહ્યું છે...",
    welcome:
      "નમસ્તે! હું WeatherGPT છું. આજના હવામાન, વરસાદ અને તાપમાન વિશે પૂછો.",
    temperature: "તાપમાન",
    humidity: "ભેજ",
    wind: "પવન",
    precipitation: "વરસાદ",
    clear: "સ્વચ્છ",
    rain: "વરસાદ",
    storm: "તોફાન",
    heavyRain: "ભારે વરસાદ",
    noEvents: "કોઈ મોટી હવામાન ઘટના નથી.",
    changeLanguage: "ભાષા બદલો",
  },
};

function getWeatherIcon(code: number) {
  if (code === 0) return "☀️";
  if (code <= 3) return "⛅";
  if (code <= 48) return "🌫️";
  if (code <= 57) return "🌦️";
  if (code <= 67) return "🌧️";
  if (code <= 77) return "❄️";
  if (code <= 82) return "🌧️";
  if (code >= 95) return "⛈️";

  return "🌤️";
}

function getWeatherDescription(code: number) {
  if (code === 0) return "Clear sky";
  if (code <= 3) return "Partly cloudy";
  if (code <= 48) return "Fog";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Rain showers";
  if (code >= 95) return "Thunderstorm";

  return "Weather";
}

function getEventForDay(
  forecast: ForecastDay,
  index: number
): WeatherEvent | null {
  const date = forecast.date;

  if (forecast.weatherCode >= 95) {
    return {
      date,
      type: "storm",
      title: "Thunderstorm",
      description: "Thunderstorm conditions are forecast.",
    };
  }

  if (forecast.precipitation >= 70) {
    return {
      date,
      type: "rain",
      title: "Heavy Rain",
      description: "Heavy rainfall is possible.",
    };
  }

  /*
   * Demo environmental events.
   *
   * Replace these with a real alert/disaster API
   * when you connect the backend.
   */
  if (index === 3 && forecast.precipitation > 30) {
    return {
      date,
      type: "cyclone",
      title: "Cyclone Watch",
      description: "Cyclone-like weather event demonstration.",
    };
  }

  if (index === 5 && forecast.precipitation > 20) {
    return {
      date,
      type: "tsunami",
      title: "Tsunami Alert",
      description: "Tsunami event demonstration.",
    };
  }

  if (index === 6) {
    return {
      date,
      type: "earthquake",
      title: "Earthquake Alert",
      description: "Earthquake event demonstration.",
    };
  }

  if (forecast.weatherCode === 0) {
    return {
      date,
      type: "clear",
      title: "Clear Sky",
      description: "Clear sky conditions.",
    };
  }

  return null;
}

export default function WeatherPage() {
  const [language, setLanguage] = useState("en");

  const [locationAllowed, setLocationAllowed] = useState(false);
  const [locating, setLocating] = useState(false);

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [city, setCity] = useState("");
  const [locationName, setLocationName] = useState("Your location");

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");

  const [listening, setListening] = useState(false);
  const [loadingWeather, setLoadingWeather] = useState(false);

  const [activeEvent, setActiveEvent] = useState<WeatherEvent | null>(null);

  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const t = translations[language] || translations.en;

  /*
   * Load saved language.
   */
  useEffect(() => {
    const saved = localStorage.getItem("weatherGPTLanguage");

    if (saved && translations[saved]) {
      setLanguage(saved);
    }
  }, []);

  /*
   * Initial assistant message.
   */
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          text: t.welcome,
        },
      ]);
    }
  }, [language]);

  /*
   * Scroll chat to bottom.
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  /*
   * Find current location.
   */
  const requestLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        setLatitude(lat);
        setLongitude(lon);
        setLocationAllowed(true);

        try {
          const response = await fetch(
            `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=en&format=json`
          );

          const data = await response.json();

          const place = data.results?.[0];

          if (place) {
            setLocationName(
              place.city ||
                place.town ||
                place.village ||
                place.name ||
                "Your location"
            );
          }
        } catch {
          setLocationName("Your location");
        }

        setLocating(false);
      },
      () => {
        setLocating(false);
        alert(
          "Location permission was denied. Please enable location permission in your browser settings."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 600000,
      }
    );
  };

  /*
   * Automatically ask for location after entering the page.
   */
  useEffect(() => {
    if (!locationAllowed) {
      requestLocation();
    }
  }, []);

  /*
   * Get weather from Open-Meteo.
   */
  const loadWeather = async (lat: number, lon: number) => {
    setLoadingWeather(true);

    try {
      const url =
        "https://api.open-meteo.com/v1/forecast" +
        `?latitude=${lat}` +
        `&longitude=${lon}` +
        "&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,is_day" +
        "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max" +
        "&timezone=auto" +
        "&forecast_days=7";

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Weather request failed");
      }

      const data = await response.json();

      setWeather({
        temperature: Math.round(data.current.temperature_2m),
        humidity: data.current.relative_humidity_2m,
        wind: Math.round(data.current.wind_speed_10m),
        precipitation: data.current.precipitation,
        weatherCode: data.current.weather_code,
        isDay: data.current.is_day,
      });

      const days: ForecastDay[] = data.daily.time.map(
        (date: string, index: number) => ({
          date,
          temperatureMax: Math.round(
            data.daily.temperature_2m_max[index]
          ),
          temperatureMin: Math.round(
            data.daily.temperature_2m_min[index]
          ),
          weatherCode: data.daily.weather_code[index],
          precipitation:
            data.daily.precipitation_probability_max[index] || 0,
        })
      );

      setForecast(days);

      setMessages((old) => {
        if (old.length === 1) {
          return [
            ...old,
            {
              role: "assistant",
              text: `I found your location near ${locationName}. The current temperature is ${Math.round(
                data.current.temperature_2m
              )}°C with ${getWeatherDescription(
                data.current.weather_code
              ).toLowerCase()}.`,
            },
          ];
        }

        return old;
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingWeather(false);
    }
  };

  useEffect(() => {
    if (latitude !== null && longitude !== null) {
      loadWeather(latitude, longitude);
    }
  }, [latitude, longitude]);

  /*
   * Search city using Open-Meteo geocoding.
   */
  const searchCity = async () => {
    if (!city.trim()) return;

    setLoadingWeather(true);

    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          city
        )}&count=1&language=en&format=json`
      );

      const data = await response.json();

      const result = data.results?.[0];

      if (!result) {
        alert("City not found.");
        return;
      }

      setLatitude(result.latitude);
      setLongitude(result.longitude);

      setLocationName(
        result.name + (result.country ? `, ${result.country}` : "")
      );

      setLocationAllowed(true);
      setCity("");
    } catch {
      alert("Unable to search this city.");
    } finally {
      setLoadingWeather(false);
    }
  };

  /*
   * Voice output.
   */
  const speak = (words: string) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(words);

    speech.lang = speechLanguages[language] || "en-IN";

    window.speechSynthesis.speak(speech);
  };

  /*
   * Voice recognition.
   */
  const startVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = speechLanguages[language] || "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    setListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;

      setMessage(transcript);
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  };

  /*
   * Weather-aware frontend assistant.
   */
  const generateWeatherAnswer = (question: string) => {
    const q = question.toLowerCase();

    if (!weather) {
      return "Please allow location access or search for a city first.";
    }

    if (
      q.includes("temperature") ||
      q.includes("hot") ||
      q.includes("cold")
    ) {
      return `The current temperature in ${locationName} is ${weather.temperature}°C.`;
    }

    if (q.includes("rain")) {
      if (weather.precipitation > 0 || weather.weatherCode >= 51) {
        return `Rain is currently possible in ${locationName}. The current precipitation is ${weather.precipitation} mm.`;
      }

      return `There is currently no significant rain in ${locationName}.`;
    }

    if (
      q.includes("wind") ||
      q.includes("windy")
    ) {
      return `The current wind speed is approximately ${weather.wind} km/h.`;
    }

    if (
      q.includes("humidity") ||
      q.includes("humid")
    ) {
      return `The current humidity is ${weather.humidity}%.`;
    }

    if (
      q.includes("storm") ||
      q.includes("thunder")
    ) {
      if (weather.weatherCode >= 95) {
        return "Yes. Thunderstorm conditions are currently detected.";
      }

      return "No thunderstorm conditions are currently detected.";
    }

    if (
      q.includes("tomorrow") &&
      forecast.length > 1
    ) {
      const tomorrow = forecast[1];

      return `Tomorrow's forecast is ${getWeatherDescription(
        tomorrow.weatherCode
      )}, with temperatures from ${tomorrow.temperatureMin}°C to ${tomorrow.temperatureMax}°C and about ${tomorrow.precipitation}% precipitation probability.`;
    }

    return `Currently in ${locationName}: ${weather.temperature}°C, ${getWeatherDescription(
      weather.weatherCode
    ).toLowerCase()}, humidity ${weather.humidity}%, and wind ${weather.wind} km/h.`;
  };

  const sendMessage = () => {
    const question = message.trim();

    if (!question) return;

    setMessages((old) => [
      ...old,
      {
        role: "user",
        text: question,
      },
    ]);

    setMessage("");

    setTimeout(() => {
      const answer = generateWeatherAnswer(question);

      setMessages((old) => [
        ...old,
        {
          role: "assistant",
          text: answer,
        },
      ]);

      speak(answer);
    }, 400);
  };

  /*
   * Calendar events.
   */
  const events = useMemo(() => {
    return forecast
      .map((day, index) => getEventForDay(day, index))
      .filter(Boolean) as WeatherEvent[];
  }, [forecast]);

  /*
   * Run weather effect.
   */
  const triggerEvent = (event: WeatherEvent) => {
    setActiveEvent(event);

    if (event.type === "storm") {
      playThunderSound();
    }

    if (event.type === "rain") {
      playRainSound();
    }

    if (event.type === "earthquake") {
      playEarthquakeSound();
    }

    if (event.type === "cyclone") {
      playCycloneSound();
    }

    if (event.type === "tsunami") {
      playTsunamiSound();
    }

    setTimeout(() => {
      setActiveEvent(null);
    }, 8000);
  };

  /*
   * Browser-generated sound effects.
   */
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = () => {
    if (!audioContextRef.current) {
      const AudioContextClass =
        window.AudioContext ||
        (window as any).webkitAudioContext;

      audioContextRef.current = new AudioContextClass();
    }

    return audioContextRef.current;
  };

  const playTone = (
    frequency: number,
    duration: number,
    type: OscillatorType = "sine",
    volume = 0.08
  ) => {
    try {
      const ctx = getAudioContext();

      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.type = type;
      oscillator.frequency.value = frequency;

      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + duration
      );

      oscillator.connect(gain);
      gain.connect(ctx.destination);

      oscillator.start();
      oscillator.stop(ctx.currentTime + duration);
    } catch {}
  };

  const playThunderSound = () => {
    playTone(55, 1.4, "sawtooth", 0.15);

    setTimeout(() => {
      playTone(35, 1.8, "sawtooth", 0.1);
    }, 150);
  };

  const playRainSound = () => {
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        playTone(
          300 + Math.random() * 600,
          0.12,
          "sine",
          0.025
        );
      }, i * 80);
    }
  };

  const playEarthquakeSound = () => {
    playTone(45, 1.1, "square", 0.12);
  };

  const playCycloneSound = () => {
    playTone(120, 2, "sine", 0.1);
  };

  const playTsunamiSound = () => {
    playTone(80, 2, "sine", 0.12);
  };

  /*
   * Calendar.
   */
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(day);
    }

    return cells;
  }, [calendarMonth]);

  const eventForCalendarDay = (day: number) => {
    const date = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth(),
      day
    );

    const iso = date.toISOString().split("T")[0];

    return events.find((event) => event.date === iso);
  };

  const eventEmoji = (type: WeatherEvent["type"]) => {
    switch (type) {
      case "storm":
        return "⛈️";

      case "rain":
        return "🌧️";

      case "tsunami":
        return "🌊";

      case "cyclone":
        return "🌀";

      case "earthquake":
        return "🌎";

      case "clear":
        return "☀️";

      default:
        return "🌤️";
    }
  };

  const previousMonth = () => {
    setCalendarMonth(
      new Date(
        calendarMonth.getFullYear(),
        calendarMonth.getMonth() - 1,
        1
      )
    );
  };

  const nextMonth = () => {
    setCalendarMonth(
      new Date(
        calendarMonth.getFullYear(),
        calendarMonth.getMonth() + 1,
        1
      )
    );
  };

  /*
   * Visual event classes.
   */
  const eventClass = activeEvent
    ? `event-${activeEvent.type}`
    : "";

  return (
    <main className={`weather-page ${eventClass}`}>
      <div className="weather-overlay" />

      {/* =====================================
          WEATHER EFFECTS
      ====================================== */}

      {activeEvent?.type === "storm" && (
        <div className="storm-effect">
          <div className="lightning lightning-one" />
          <div className="lightning lightning-two" />
          <div className="storm-clouds">⛈️</div>
        </div>
      )}

      {activeEvent?.type === "rain" && (
        <div className="rain-effect">
          {Array.from({ length: 70 }).map((_, index) => (
            <span
              key={index}
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 1.5}s`,
                animationDuration: `${0.45 + Math.random() * 0.6}s`,
              }}
            />
          ))}
        </div>
      )}

      {activeEvent?.type === "tsunami" && (
        <div className="tsunami-effect">
          <div className="tsunami-wave">🌊🌊🌊</div>
        </div>
      )}

      {activeEvent?.type === "cyclone" && (
        <div className="cyclone-effect">
          <div className="cyclone">
            🌀
          </div>
        </div>
      )}

      {activeEvent?.type === "clear" && (
        <div className="clear-cloud-effect">
          <span>☁️</span>
          <span>☁️</span>
          <span>☁️</span>
        </div>
      )}

      {activeEvent?.type === "earthquake" && (
        <div className="earthquake-warning">
          🌎 EARTHQUAKE
        </div>
      )}

      {/* =====================================
          LOCATION PERMISSION
      ====================================== */}

      {!locationAllowed && (
        <div className="location-permission">
          <div className="location-card">
            <div className="location-big-icon">📍</div>

            <h2>{t.locationRequired}</h2>

            <p>{t.locationDescription}</p>

            <button
              className="allow-location-button"
              onClick={requestLocation}
              disabled={locating}
            >
              {locating
                ? `📡 ${t.searchingLocation}`
                : `📍 ${t.allowLocation}`}
            </button>

            <small>
              Your browser will ask you to allow location access.
            </small>
          </div>
        </div>
      )}

      {/* =====================================
          MAIN CHATGPT STYLE APP
      ====================================== */}

      <div className="weather-app">
        {/* Sidebar */}

        <aside className="weather-sidebar">
          <div className="sidebar-logo">
            🌦️
            <span>WeatherGPT</span>
          </div>

          <button
            className="new-chat-button"
            onClick={() =>
              setMessages([
                {
                  role: "assistant",
                  text: t.welcome,
                },
              ])
            }
          >
            ＋ New weather chat
          </button>

          <div className="sidebar-section">
            <span>LOCATION</span>

            <div className="sidebar-location">
              📍 {locationName}
            </div>
          </div>

          <div className="sidebar-section">
            <span>QUICK WEATHER</span>

            <button
              onClick={() =>
                setMessage("Will it rain today?")
              }
            >
              🌧️ Will it rain today?
            </button>

            <button
              onClick={() =>
                setMessage("What is the temperature?")
              }
            >
              🌡️ Temperature
            </button>

            <button
              onClick={() =>
                setMessage("Will there be a storm?")
              }
            >
              ⛈️ Storm forecast
            </button>
          </div>

          <div className="sidebar-bottom">
            <button
              onClick={() => {
                const newLanguage = prompt(
                  `${t.changeLanguage}\n${Object.entries(
                    languageNames
                  )
                    .map(([code, name]) => `${code}: ${name}`)
                    .join("\n")}`
                );

                if (
                  newLanguage &&
                  translations[newLanguage]
                ) {
                  localStorage.setItem(
                    "weatherGPTLanguage",
                    newLanguage
                  );

                  setLanguage(newLanguage);
                }
              }}
            >
              🌐 {languageNames[language]}
            </button>
          </div>
        </aside>

        {/* Main area */}

        <section className="chat-main">
          {/* Header */}

          <header className="chat-topbar">
            <div>
              <h1>🌦️ {t.weatherAssistant}</h1>
              <p>
                {locationName}
                {weather
                  ? ` • ${weather.temperature}°C`
                  : ""}
              </p>
            </div>

            <div className="topbar-status">
              <span className="status-dot" />
              Live weather
            </div>
          </header>

          {/* Chat */}

          <div className="chat-scroll">
            <div className="chat-content">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`chat-message-row ${msg.role}`}
                >
                  <div className="message-avatar">
                    {msg.role === "assistant"
                      ? "🌦️"
                      : "👤"}
                  </div>

                  <div className="chat-message">
                    <div className="message-role">
                      {msg.role === "assistant"
                        ? "WeatherGPT"
                        : "You"}
                    </div>

                    <div>{msg.text}</div>
                  </div>
                </div>
              ))}

              <div ref={messagesEndRef} />

              {/* Current weather */}

              {weather && (
                <div className="weather-dashboard">
                  <div className="current-weather">
                    <div>
                      <div className="weather-location">
                        📍 {locationName}
                      </div>

                      <div className="big-weather-icon">
                        {getWeatherIcon(
                          weather.weatherCode
                        )}
                      </div>

                      <div className="big-temperature">
                        {weather.temperature}°
                      </div>

                      <div className="weather-condition">
                        {getWeatherDescription(
                          weather.weatherCode
                        )}
                      </div>
                    </div>

                    <div className="weather-stats">
                      <div>
                        <span>🌡️</span>
                        <small>{t.temperature}</small>
                        <strong>
                          {weather.temperature}°C
                        </strong>
                      </div>

                      <div>
                        <span>💧</span>
                        <small>{t.humidity}</small>
                        <strong>
                          {weather.humidity}%
                        </strong>
                      </div>

                      <div>
                        <span>💨</span>
                        <small>{t.wind}</small>
                        <strong>
                          {weather.wind} km/h
                        </strong>
                      </div>

                      <div>
                        <span>🌧️</span>
                        <small>{t.precipitation}</small>
                        <strong>
                          {weather.precipitation} mm
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* 7-day forecast */}

                  <div className="forecast-section">
                    <h2>{t.forecast}</h2>

                    <div className="forecast-scroll">
                      {forecast.map((day, index) => (
                        <div
                          className="forecast-day"
                          key={day.date}
                        >
                          <span>
                            {index === 0
                              ? t.today
                              : new Date(
                                  day.date
                                ).toLocaleDateString(
                                  language,
                                  {
                                    weekday: "short",
                                  }
                                )}
                          </span>

                          <strong>
                            {getWeatherIcon(
                              day.weatherCode
                            )}
                          </strong>

                          <b>
                            {day.temperatureMax}°
                          </b>

                          <small>
                            {day.temperatureMin}°
                          </small>

                          <em>
                            💧 {day.precipitation}%
                          </em>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Calendar */}

              <section className="calendar-section">
                <div className="section-title-row">
                  <h2>📅 {t.events}</h2>

                  <div className="calendar-controls">
                    <button onClick={previousMonth}>
                      ‹
                    </button>

                    <strong>
                      {calendarMonth.toLocaleDateString(
                        language,
                        {
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </strong>

                    <button onClick={nextMonth}>
                      ›
                    </button>
                  </div>
                </div>

                <div className="calendar">
                  {[
                    "Sun",
                    "Mon",
                    "Tue",
                    "Wed",
                    "Thu",
                    "Fri",
                    "Sat",
                  ].map((day) => (
                    <div
                      key={day}
                      className="calendar-weekday"
                    >
                      {day}
                    </div>
                  ))}

                  {calendarDays.map((day, index) => {
                    if (!day) {
                      return (
                        <div
                          key={`empty-${index}`}
                          className="calendar-empty"
                        />
                      );
                    }

                    const event =
                      eventForCalendarDay(day);

                    return (
                      <button
                        key={day}
                        className={`calendar-day ${
                          event
                            ? `calendar-event-${event.type}`
                            : ""
                        }`}
                        onClick={() => {
                          if (event) {
                            triggerEvent(event);
                          }
                        }}
                      >
                        <span>{day}</span>

                        {event && (
                          <small>
                            {eventEmoji(event.type)}
                          </small>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="event-list">
                  {events.length === 0 ? (
                    <p>{t.noEvents}</p>
                  ) : (
                    events.map((event) => (
                      <button
                        key={`${event.date}-${event.type}`}
                        className="event-item"
                        onClick={() =>
                          triggerEvent(event)
                        }
                      >
                        <span>
                          {eventEmoji(event.type)}
                        </span>

                        <div>
                          <strong>
                            {event.title}
                          </strong>

                          <small>
                            {event.date} —{" "}
                            {event.description}
                          </small>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </section>
            </div>
          </div>

          {/* Input */}

          <div className="chat-composer-area">
            {listening && (
              <div className="voice-listening">
                🎤 {t.listening}
              </div>
            )}

            <div className="chat-composer">
              <button
                className={`voice-button ${
                  listening ? "recording" : ""
                }`}
                onClick={startVoice}
              >
                🎤
              </button>

              <input
                value={message}
                onChange={(e) =>
                  setMessage(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
                placeholder={t.ask}
              />

              <button
                className="send-button"
                onClick={sendMessage}
              >
                ↑
              </button>
            </div>

            <div className="composer-hint">
              WeatherGPT can provide weather information,
              forecasts and weather-event demonstrations.
            </div>
          </div>
        </section>
      </div>

      {/* Search floating control */}

      <div className="city-search">
        <input
          value={city}
          onChange={(e) =>
            setCity(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              searchCity();
            }
          }}
          placeholder={t.search}
        />

        <button onClick={searchCity}>
          🔍
        </button>
      </div>

      {/* Active event notification */}

      {activeEvent && (
        <div
          className={`event-notification event-${activeEvent.type}`}
        >
          <span className="notification-icon">
            {eventEmoji(activeEvent.type)}
          </span>

          <div>
            <strong>{activeEvent.title}</strong>

            <p>{activeEvent.description}</p>
          </div>

          <button
            onClick={() => setActiveEvent(null)}
          >
            ×
          </button>
        </div>
      )}
    </main>
  );
}
