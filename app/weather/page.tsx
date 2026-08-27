"use client";

import { useEffect, useState } from "react";

type WeatherEvent =
  | "normal"
  | "rain"
  | "heavy-rain"
  | "storm"
  | "tsunami"
  | "cyclone";

type WeatherData = {
  city: string;
  temperature: number;
  humidity: number;
  wind: number;
  condition: string;
  icon: string;
  event: WeatherEvent;
};

type Message = {
  sender: "user" | "assistant";
  text: string;
};

const translations: Record<string, Record<string, string>> = {
  en: {
    title: "WeatherGPT",
    subtitle: "Your intelligent weather companion",
    search: "Search a city",
    searchButton: "Search",
    location: "Use my current location",
    temperature: "Temperature",
    humidity: "Humidity",
    wind: "Wind",
    forecast: "Forecast",
    events: "Weather Calendar",
    assistant: "Weather Assistant",
    ask: "Ask anything about the weather...",
    welcome:
      "Hello! I'm WeatherGPT. Ask me anything about the weather.",
    listening: "Listening...",
    locationDenied:
      "Location permission was not granted.",
    locationSuccess: "Location detected successfully.",
    currentWeather: "Current Weather",
    today: "Today",
    send: "Send",
  },

  hi: {
    title: "WeatherGPT",
    subtitle: "आपका बुद्धिमान मौसम सहायक",
    search: "शहर खोजें",
    searchButton: "खोजें",
    location: "मेरी वर्तमान स्थिति का उपयोग करें",
    temperature: "तापमान",
    humidity: "नमी",
    wind: "हवा",
    forecast: "पूर्वानुमान",
    events: "मौसम कैलेंडर",
    assistant: "मौसम सहायक",
    ask: "मौसम के बारे में कुछ भी पूछें...",
    welcome:
      "नमस्ते! मैं WeatherGPT हूँ। मौसम के बारे में कुछ भी पूछें।",
    listening: "सुन रहा हूँ...",
    locationDenied:
      "स्थान की अनुमति नहीं दी गई।",
    locationSuccess:
      "स्थान सफलतापूर्वक पता चला।",
    currentWeather: "वर्तमान मौसम",
    today: "आज",
    send: "भेजें",
  },

  te: {
    title: "WeatherGPT",
    subtitle: "మీ తెలివైన వాతావరణ సహాయకుడు",
    search: "నగరాన్ని వెతకండి",
    searchButton: "వెతకండి",
    location: "నా ప్రస్తుత స్థానాన్ని ఉపయోగించండి",
    temperature: "ఉష్ణోగ్రత",
    humidity: "తేమ",
    wind: "గాలి",
    forecast: "వాతావరణ సూచన",
    events: "వాతావరణ క్యాలెండర్",
    assistant: "వాతావరణ సహాయకుడు",
    ask: "వాతావరణం గురించి ఏదైనా అడగండి...",
    welcome:
      "నమస్కారం! నేను WeatherGPT. వాతావరణం గురించి ఏదైనా అడగండి.",
    listening: "వింటోంది...",
    locationDenied:
      "లొకేషన్ అనుమతి ఇవ్వబడలేదు.",
    locationSuccess:
      "లొకేషన్ విజయవంతంగా గుర్తించబడింది.",
    currentWeather: "ప్రస్తుత వాతావరణం",
    today: "ఈరోజు",
    send: "పంపండి",
  },

  ta: {
    title: "WeatherGPT",
    subtitle: "உங்கள் புத்திசாலியான வானிலை உதவியாளர்",
    search: "நகரத்தைத் தேடுங்கள்",
    searchButton: "தேடு",
    location: "எனது தற்போதைய இருப்பிடத்தைப் பயன்படுத்தவும்",
    temperature: "வெப்பநிலை",
    humidity: "ஈரப்பதம்",
    wind: "காற்று",
    forecast: "முன்னறிவிப்பு",
    events: "வானிலை காலண்டர்",
    assistant: "வானிலை உதவியாளர்",
    ask: "வானிலை பற்றி எதையும் கேளுங்கள்...",
    welcome:
      "வணக்கம்! நான் WeatherGPT. வானிலை பற்றி எதையும் கேளுங்கள்.",
    listening: "கேட்கிறது...",
    locationDenied:
      "இருப்பிட அனுமதி வழங்கப்படவில்லை.",
    locationSuccess:
      "இருப்பிடம் வெற்றிகரமாக கண்டறியப்பட்டது.",
    currentWeather: "தற்போதைய வானிலை",
    today: "இன்று",
    send: "அனுப்பு",
  },

  bn: {
    title: "WeatherGPT",
    subtitle: "আপনার বুদ্ধিমান আবহাওয়া সহকারী",
    search: "শহর অনুসন্ধান করুন",
    searchButton: "অনুসন্ধান",
    location: "আমার বর্তমান অবস্থান ব্যবহার করুন",
    temperature: "তাপমাত্রা",
    humidity: "আর্দ্রতা",
    wind: "বাতাস",
    forecast: "পূর্বাভাস",
    events: "আবহাওয়া ক্যালেন্ডার",
    assistant: "আবহাওয়া সহকারী",
    ask: "আবহাওয়া সম্পর্কে কিছু জিজ্ঞাসা করুন...",
    welcome:
      "হ্যালো! আমি WeatherGPT। আবহাওয়া সম্পর্কে কিছু জিজ্ঞাসা করুন।",
    listening: "শুনছি...",
    locationDenied:
      "অবস্থানের অনুমতি দেওয়া হয়নি।",
    locationSuccess:
      "অবস্থান সফলভাবে শনাক্ত হয়েছে।",
    currentWeather: "বর্তমান আবহাওয়া",
    today: "আজ",
    send: "পাঠান",
  },

  mr: {
    title: "WeatherGPT",
    subtitle: "तुमचा बुद्धिमान हवामान सहाय्यक",
    search: "शहर शोधा",
    searchButton: "शोधा",
    location: "माझे वर्तमान स्थान वापरा",
    temperature: "तापमान",
    humidity: "आर्द्रता",
    wind: "वारा",
    forecast: "हवामान अंदाज",
    events: "हवामान कॅलेंडर",
    assistant: "हवामान सहाय्यक",
    ask: "हवामानाबद्दल काहीही विचारा...",
    welcome:
      "नमस्कार! मी WeatherGPT आहे. हवामानाबद्दल काहीही विचारा.",
    listening: "ऐकत आहे...",
    locationDenied:
      "स्थानाची परवानगी दिली नाही.",
    locationSuccess:
      "स्थान यशस्वीपणे शोधले.",
    currentWeather: "सध्याचे हवामान",
    today: "आज",
    send: "पाठवा",
  },

  ml: {
    title: "WeatherGPT",
    subtitle: "നിങ്ങളുടെ ബുദ്ധിമാനായ കാലാവസ്ഥാ സഹായി",
    search: "നഗരം തിരയുക",
    searchButton: "തിരയുക",
    location: "എന്റെ നിലവിലെ സ്ഥാനം ഉപയോഗിക്കുക",
    temperature: "താപനില",
    humidity: "ഈർപ്പം",
    wind: "കാറ്റ്",
    forecast: "കാലാവസ്ഥാ പ്രവചനം",
    events: "കാലാവസ്ഥാ കലണ്ടർ",
    assistant: "കാലാവസ്ഥാ സഹായി",
    ask: "കാലാവസ്ഥയെക്കുറിച്ച് എന്തും ചോദിക്കൂ...",
    welcome:
      "നമസ്കാരം! ഞാൻ WeatherGPT ആണ്. കാലാവസ്ഥയെക്കുറിച്ച് എന്തും ചോദിക്കൂ.",
    listening: "കേൾക്കുന്നു...",
    locationDenied:
      "ലൊക്കേഷൻ അനുമതി നൽകിയിട്ടില്ല.",
    locationSuccess:
      "ലൊക്കേഷൻ വിജയകരമായി കണ്ടെത്തി.",
    currentWeather: "നിലവിലെ കാലാവസ്ഥ",
    today: "ഇന്ന്",
    send: "അയയ്ക്കുക",
  },

  gu: {
    title: "WeatherGPT",
    subtitle: "તમારો બુદ્ધિશાળી હવામાન સહાયક",
    search: "શહેર શોધો",
    searchButton: "શોધો",
    location: "મારા વર્તમાન સ્થાનનો ઉપયોગ કરો",
    temperature: "તાપમાન",
    humidity: "ભેજ",
    wind: "પવન",
    forecast: "હવામાન આગાહી",
    events: "હવામાન કેલેન્ડર",
    assistant: "હવામાન સહાયક",
    ask: "હવામાન વિશે કંઈપણ પૂછો...",
    welcome:
      "નમસ્તે! હું WeatherGPT છું. હવામાન વિશે કંઈપણ પૂછો.",
    listening: "સાંભળી રહ્યું છે...",
    locationDenied:
      "સ્થાનની પરવાનગી આપવામાં આવી નથી.",
    locationSuccess:
      "સ્થાન સફળતાપૂર્વક શોધાયું.",
    currentWeather: "વર્તમાન હવામાન",
    today: "આજે",
    send: "મોકલો",
  },
};

const demoForecast = [
  {
    day: "MON",
    icon: "☀️",
    temp: 28,
    event: "normal",
  },
  {
    day: "TUE",
    icon: "🌧️",
    temp: 26,
    event: "rain",
  },
  {
    day: "WED",
    icon: "🌧️",
    temp: 24,
    event: "heavy-rain",
  },
  {
    day: "THU",
    icon: "⛈️",
    temp: 23,
    event: "storm",
  },
  {
    day: "FRI",
    icon: "🌊",
    temp: 25,
    event: "tsunami",
  },
  {
    day: "SAT",
    icon: "🌀",
    temp: 22,
    event: "cyclone",
  },
];

const languageSpeechCodes: Record<string, string> = {
  en: "en-IN",
  hi: "hi-IN",
  te: "te-IN",
  ta: "ta-IN",
  bn: "bn-IN",
  mr: "mr-IN",
  ml: "ml-IN",
  gu: "gu-IN",
};

export default function WeatherPage() {
  const [language, setLanguage] = useState("en");

  const [city, setCity] = useState("");

  const [weather, setWeather] =
    useState<WeatherData>({
      city: "Your Location",
      temperature: 24,
      humidity: 78,
      wind: 15,
      condition: "Partly Cloudy",
      icon: "🌤️",
      event: "normal",
    });

  const [chatOpen, setChatOpen] = useState(false);

  const [message, setMessage] = useState("");

  const [listening, setListening] = useState(false);

  const [locationMessage, setLocationMessage] =
    useState("");

  const [messages, setMessages] = useState<Message[]>(
    []
  );

  const [activeEvent, setActiveEvent] =
    useState<WeatherEvent>("normal");

  useEffect(() => {
    const saved =
      localStorage.getItem("weatherGPTLanguage");

    if (saved && translations[saved]) {
      setLanguage(saved);
    }

    requestLocation();
  }, []);

  const t =
    translations[language] || translations.en;

  /*
   * LOCATION
   */

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage(
        "Geolocation is not supported."
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log(
          "Latitude:",
          position.coords.latitude
        );

        console.log(
          "Longitude:",
          position.coords.longitude
        );

        setLocationMessage(
          t.locationSuccess
        );

        setWeather((old) => ({
          ...old,
          city: "Current Location",
        }));
      },
      () => {
        setLocationMessage(
          t.locationDenied
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  /*
   * SEARCH
   */

  const searchCity = () => {
    if (!city.trim()) return;

    setWeather((old) => ({
      ...old,
      city: city.trim(),
    }));

    setCity("");
  };

  /*
   * VOICE
   */

  const speak = (words: string) => {
    if (
      typeof window === "undefined" ||
      !window.speechSynthesis
    ) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(words);

    utterance.lang =
      languageSpeechCodes[language] ||
      "en-IN";

    window.speechSynthesis.speak(utterance);
  };

  const startVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Voice recognition is not supported in this browser."
      );
      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.lang =
      languageSpeechCodes[language] ||
      "en-IN";

    recognition.continuous = false;
    recognition.interimResults = false;

    setListening(true);

    recognition.onresult = (event: any) => {
      const spoken =
        event.results[0][0].transcript;

      setMessage(spoken);
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
   * CHAT ASSISTANT
   */

  const createWeatherReply = (
    question: string
  ) => {
    const q = question.toLowerCase();

    if (
      q.includes("temperature") ||
      q.includes("hot") ||
      q.includes("cold")
    ) {
      return `${t.temperature}: ${weather.temperature}°C.`;
    }

    if (
      q.includes("rain") ||
      q.includes("raining")
    ) {
      return `The current condition is ${weather.condition}. Please check the forecast for upcoming rainfall.`;
    }

    if (q.includes("wind")) {
      return `${t.wind}: ${weather.wind} km/h.`;
    }

    if (
      q.includes("humidity") ||
      q.includes("humid")
    ) {
      return `${t.humidity}: ${weather.humidity}%.`;
    }

    return `The current weather in ${weather.city} is ${weather.temperature}°C with ${weather.condition}.`;
  };

  const sendMessage = () => {
    if (!message.trim()) return;

    const userText = message.trim();

    setMessages((old) => [
      ...old,
      {
        sender: "user",
        text: userText,
      },
    ]);

    setMessage("");

    const reply =
      createWeatherReply(userText);

    setTimeout(() => {
      setMessages((old) => [
        ...old,
        {
          sender: "assistant",
          text: reply,
        },
      ]);

      speak(reply);
    }, 500);
  };

  /*
   * WEATHER EVENT EFFECTS
   */

  useEffect(() => {
    setActiveEvent(weather.event);
  }, [weather.event]);

  const triggerEvent = (
    event: WeatherEvent
  ) => {
    setActiveEvent(event);
  };

  return (
    <main
      className={`weather-page event-${activeEvent}`}
    >
      <div className="weather-overlay" />

      {/* HEAVY RAIN */}

      {activeEvent === "heavy-rain" && (
        <div className="rain-container">
          {Array.from({ length: 70 }).map(
            (_, index) => (
              <span
                key={index}
                className="rain-drop"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${
                    Math.random() * 2
                  }s`,
                }}
              />
            )
          )}
        </div>
      )}

      {/* THUNDER */}

      {activeEvent === "storm" && (
        <div className="storm-effect">
          <div className="lightning">
            ⚡
          </div>
        </div>
      )}

      {/* TSUNAMI */}

      {activeEvent === "tsunami" && (
        <div className="tsunami-effect">
          🌊 🌊 🌊
        </div>
      )}

      {/* CYCLONE */}

      {activeEvent === "cyclone" && (
        <div className="cyclone-effect">
          🌀
        </div>
      )}

      {/* HEADER */}

      <header className="weather-header page-enter">
        <div className="weather-logo weather-glow">
          🌤️
        </div>

        <div>
          <h1>{t.title}</h1>

          <p>{t.subtitle}</p>

          <small>
            {language.toUpperCase()}
          </small>
        </div>
      </header>

      {/* MAIN PANEL */}

      <section className="weather-panel page-enter">
        <div className="weather-hero">
          <span className="hero-small">
            {t.currentWeather}
          </span>

          <h2>{weather.city}</h2>

          <div className="big-weather-icon weather-float">
            {weather.icon}
          </div>

          <div className="temperature">
            {weather.temperature}°
          </div>

          <div className="condition">
            {weather.condition}
          </div>
        </div>

        {/* SEARCH */}

        <div className="search-section">
          <p className="search-question">
            Where do you want the weather?
          </p>

          <div className="search-row">
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

            <button
              className="search-button"
              onClick={searchCity}
            >
              🔍 {t.searchButton}
            </button>
          </div>

          <button
            className="location-button"
            onClick={requestLocation}
          >
            📍 {t.location}
          </button>

          {locationMessage && (
            <p className="location-message">
              {locationMessage}
            </p>
          )}
        </div>

        {/* WEATHER INFORMATION */}

        <div className="weather-info">
          <div className="info-box">
            <span>🌡️</span>
            <small>{t.temperature}</small>
            <strong>
              {weather.temperature}°C
            </strong>
          </div>

          <div className="info-box">
            <span>💧</span>
            <small>{t.humidity}</small>
            <strong>
              {weather.humidity}%
            </strong>
          </div>

          <div className="info-box">
            <span>💨</span>
            <small>{t.wind}</small>
            <strong>
              {weather.wind} km/h
            </strong>
          </div>
        </div>

        {/* FORECAST */}

        <div className="forecast-card">
          <div className="section-title">
            <h2>{t.forecast}</h2>

            <span>7 Days</span>
          </div>

          <div className="forecast">
            {demoForecast.map(
              (day, index) => (
                <button
                  key={day.day}
                  className={`forecast-item ${
                    activeEvent ===
                    day.event
                      ? "active-event"
                      : ""
                  }`}
                  onClick={() =>
                    triggerEvent(
                      day.event as WeatherEvent
                    )
                  }
                >
                  <strong>
                    {index === 0
                      ? t.today
                      : day.day}
                  </strong>

                  <span className="forecast-icon">
                    {day.icon}
                  </span>

                  <span>
                    {day.temp}°
                  </span>
                </button>
              )
            )}
          </div>
        </div>

        {/* WEATHER CALENDAR */}

        <div className="calendar-section">
          <div className="section-title">
            <h2>📅 {t.events}</h2>
          </div>

          <div className="weather-calendar">
            {demoForecast.map(
              (day) => (
                <div
                  key={day.day}
                  className={`calendar-event event-card-${day.event}`}
                >
                  <div className="calendar-date">
                    {day.day}
                  </div>

                  <div className="calendar-icon">
                    {day.icon}
                  </div>

                  <div className="calendar-info">
                    <strong>
                      {day.event ===
                      "heavy-rain"
                        ? "Heavy Rain"
                        : day.event ===
                          "storm"
                        ? "Thunderstorm"
                        : day.event ===
                          "tsunami"
                        ? "Tsunami Alert"
                        : day.event ===
                          "cyclone"
                        ? "Cyclone Alert"
                        : "Weather Event"}
                    </strong>

                    <span>
                      {day.temp}°C
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* CHAT BUTTON */}

      <button
        className="chat-button chatbot-button"
        onClick={() =>
          setChatOpen(!chatOpen)
        }
        aria-label="Open weather assistant"
      >
        🤖
      </button>

      {/* CHAT */}

      {chatOpen && (
        <section className="chat-box">
          <div className="chat-header">
            <div>
              🤖 {t.assistant}
            </div>

            <button
              onClick={() =>
                setChatOpen(false)
              }
            >
              ✕
            </button>
          </div>

          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="bot-message">
                {t.welcome}
              </div>
            )}

            {messages.map(
              (msg, index) => (
                <div
                  key={index}
                  className={
                    msg.sender === "user"
                      ? "user-message"
                      : "bot-message"
                  }
                >
                  {msg.text}
                </div>
              )
            )}
          </div>

          {listening && (
            <div className="listening">
              🎤 {t.listening}
            </div>
          )}

          <div className="chat-input">
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
              onClick={startVoice}
              className={
                listening
                  ? "voice-active"
                  : ""
              }
            >
              🎤
            </button>

            <button
              onClick={sendMessage}
            >
              ➤
            </button>
          </div>
        </section>
      )}
    </main>
  );
          }
