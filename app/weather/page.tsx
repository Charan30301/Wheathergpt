"use client";

import { useEffect, useState } from "react";

type Language = {
  code: string;
  name: string;
  native: string;
};

const languages: Record<string, Language> = {
  en: { code: "en", name: "English", native: "English" },
  hi: { code: "hi", name: "Hindi", native: "हिंदी" },
  ta: { code: "ta", name: "Tamil", native: "தமிழ்" },
  te: { code: "te", name: "Telugu", native: "తెలుగు" },
  bn: { code: "bn", name: "Bengali", native: "বাংলা" },
  mr: { code: "mr", name: "Marathi", native: "मराठी" },
  ml: { code: "ml", name: "Malayalam", native: "മലയാളം" },
  gu: { code: "gu", name: "Gujarati", native: "ગુજરાતી" },
};

const text: Record<string, Record<string, string>> = {
  en: {
    title: "WeatherGPT",
    search: "Search a city",
    searchButton: "Search",
    location: "Use my current location",
    temperature: "Temperature",
    humidity: "Humidity",
    wind: "Wind",
    forecast: "Forecast",
    chatbot: "Weather Assistant",
    ask: "Ask me anything about weather...",
    send: "Send",
    listening: "Listening...",
    welcome: "Hello! How can I help you with the weather?",
  },

  hi: {
    title: "WeatherGPT",
    search: "शहर खोजें",
    searchButton: "खोजें",
    location: "मेरी वर्तमान स्थिति का उपयोग करें",
    temperature: "तापमान",
    humidity: "नमी",
    wind: "हवा",
    forecast: "पूर्वानुमान",
    chatbot: "मौसम सहायक",
    ask: "मौसम के बारे में कुछ भी पूछें...",
    send: "भेजें",
    listening: "सुन रहा हूँ...",
    welcome: "नमस्ते! मैं मौसम के बारे में आपकी कैसे मदद कर सकता हूँ?",
  },

  ta: {
    title: "WeatherGPT",
    search: "நகரத்தைத் தேடுங்கள்",
    searchButton: "தேடு",
    location: "எனது தற்போதைய இருப்பிடத்தைப் பயன்படுத்தவும்",
    temperature: "வெப்பநிலை",
    humidity: "ஈரப்பதம்",
    wind: "காற்று",
    forecast: "முன்னறிவிப்பு",
    chatbot: "வானிலை உதவியாளர்",
    ask: "வானிலை பற்றி எதையும் கேளுங்கள்...",
    send: "அனுப்பு",
    listening: "கேட்கிறது...",
    welcome: "வணக்கம்! வானிலை பற்றி நான் உங்களுக்கு எப்படி உதவலாம்?",
  },

  te: {
    title: "WeatherGPT",
    search: "నగరాన్ని వెతకండి",
    searchButton: "వెతకండి",
    location: "నా ప్రస్తుత స్థానాన్ని ఉపయోగించండి",
    temperature: "ఉష్ణోగ్రత",
    humidity: "తేమ",
    wind: "గాలి",
    forecast: "వాతావరణ సూచన",
    chatbot: "వాతావరణ సహాయకుడు",
    ask: "వాతావరణం గురించి ఏదైనా అడగండి...",
    send: "పంపండి",
    listening: "వింటోంది...",
    welcome: "నమస్కారం! వాతావరణం గురించి నేను మీకు ఎలా సహాయం చేయగలను?",
  },

  bn: {
    title: "WeatherGPT",
    search: "শহর অনুসন্ধান করুন",
    searchButton: "অনুসন্ধান",
    location: "আমার বর্তমান অবস্থান ব্যবহার করুন",
    temperature: "তাপমাত্রা",
    humidity: "আর্দ্রতা",
    wind: "বাতাস",
    forecast: "পূর্বাভাস",
    chatbot: "আবহাওয়া সহকারী",
    ask: "আবহাওয়া সম্পর্কে কিছু জিজ্ঞাসা করুন...",
    send: "পাঠান",
    listening: "শুনছি...",
    welcome: "হ্যালো! আবহাওয়া সম্পর্কে আমি কীভাবে সাহায্য করতে পারি?",
  },

  mr: {
    title: "WeatherGPT",
    search: "शहर शोधा",
    searchButton: "शोधा",
    location: "माझे वर्तमान स्थान वापरा",
    temperature: "तापमान",
    humidity: "आर्द्रता",
    wind: "वारा",
    forecast: "हवामान अंदाज",
    chatbot: "हवामान सहाय्यक",
    ask: "हवामानाबद्दल काहीही विचारा...",
    send: "पाठवा",
    listening: "ऐकत आहे...",
    welcome: "नमस्कार! हवामानाबद्दल मी तुमची कशी मदत करू शकतो?",
  },

  ml: {
    title: "WeatherGPT",
    search: "നഗരം തിരയുക",
    searchButton: "തിരയുക",
    location: "എന്റെ നിലവിലെ സ്ഥാനം ഉപയോഗിക്കുക",
    temperature: "താപനില",
    humidity: "ഈർപ്പം",
    wind: "കാറ്റ്",
    forecast: "കാലാവസ്ഥാ പ്രവചനം",
    chatbot: "കാലാവസ്ഥാ സഹായി",
    ask: "കാലാവസ്ഥയെക്കുറിച്ച് എന്തും ചോദിക്കൂ...",
    send: "അയയ്ക്കുക",
    listening: "കേൾക്കുന്നു...",
    welcome: "നമസ്കാരം! കാലാവസ്ഥയെക്കുറിച്ച് എങ്ങനെ സഹായിക്കാം?",
  },

  gu: {
    title: "WeatherGPT",
    search: "શહેર શોધો",
    searchButton: "શોધો",
    location: "મારા વર્તમાન સ્થાનનો ઉપયોગ કરો",
    temperature: "તાપમાન",
    humidity: "ભેજ",
    wind: "પવન",
    forecast: "હવામાન આગાહી",
    chatbot: "હવામાન સહાયક",
    ask: "હવામાન વિશે કંઈપણ પૂછો...",
    send: "મોકલો",
    listening: "સાંભળી રહ્યું છે...",
    welcome: "નમસ્તે! હું હવામાન વિશે તમારી કેવી રીતે મદદ કરી શકું?",
  },
};

export default function WeatherPage() {
  const [language, setLanguage] = useState("en");
  const [city, setCity] = useState("");
  const [message, setMessage] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [chatMessages, setChatMessages] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("weatherGPTLanguage");

    if (saved && languages[saved]) {
      setLanguage(saved);
    }
  }, []);

  const t = text[language] || text.en;

  const speak = (words: string) => {
    if (typeof window === "undefined") return;

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(words);

    speech.lang =
      language === "hi"
        ? "hi-IN"
        : language === "ta"
        ? "ta-IN"
        : language === "te"
        ? "te-IN"
        : language === "bn"
        ? "bn-IN"
        : language === "mr"
        ? "mr-IN"
        : language === "ml"
        ? "ml-IN"
        : language === "gu"
        ? "gu-IN"
        : "en-IN";

    window.speechSynthesis.speak(speech);
  };

  const startVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang =
      language === "hi"
        ? "hi-IN"
        : language === "ta"
        ? "ta-IN"
        : language === "te"
        ? "te-IN"
        : language === "bn"
        ? "bn-IN"
        : language === "mr"
        ? "mr-IN"
        : language === "ml"
        ? "ml-IN"
        : language === "gu"
        ? "gu-IN"
        : "en-IN";

    recognition.interimResults = false;
    recognition.continuous = false;

    setListening(true);

    recognition.onresult = (event: any) => {
      const spokenText = event.results[0][0].transcript;
      setMessage(spokenText);
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

  const sendMessage = () => {
    if (!message.trim()) return;

    const userMessage = message.trim();

    setChatMessages((old) => [...old, `You: ${userMessage}`]);

    setMessage("");

    const reply = t.welcome;

    setTimeout(() => {
      setChatMessages((old) => [...old, `WeatherGPT: ${reply}`]);
      speak(reply);
    }, 500);
  };

  return (
    <main className="weather-page">
      <div className="weather-overlay" />

      <header className="weather-header">
        <div className="weather-logo">🌤️</div>

        <div>
          <h1>{t.title}</h1>
          <p>{languages[language].native}</p>
        </div>
      </header>

      <section className="weather-panel">
        <h2>{t.title}</h2>

        <div className="search-row">
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder={t.search}
          />

          <button>
            🔍 {t.searchButton}
          </button>
        </div>

        <button className="location-button">
          📍 {t.location}
        </button>

        <div className="weather-card">
          <div className="weather-icon">☁️</div>

          <div className="temperature">
            24°C
          </div>

          <div className="weather-info">
            <p>🌡️ {t.temperature}: 24°C</p>
            <p>💧 {t.humidity}: 78%</p>
            <p>💨 {t.wind}: 15 km/h</p>
          </div>
        </div>

        <div className="forecast-card">
          <h2>{t.forecast}</h2>

          <div className="forecast">
            <div>MON<br />☁️<br />26°</div>
            <div>TUE<br />🌧️<br />27°</div>
            <div>WED<br />☀️<br />28°</div>
            <div>THU<br />🌦️<br />27°</div>
            <div>FRI<br />⛈️<br />26°</div>
          </div>
        </div>
      </section>

      <button
        className="chat-button"
        onClick={() => setChatOpen(!chatOpen)}
      >
        🤖
      </button>

      {chatOpen && (
        <section className="chat-box">
          <div className="chat-header">
            🤖 {t.chatbot}
          </div>

          <div className="chat-messages">
            {chatMessages.length === 0 ? (
              <div className="bot-message">
                {t.welcome}
              </div>
            ) : (
              chatMessages.map((msg, index) => (
                <div key={index} className="message">
                  {msg}
                </div>
              ))
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
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              placeholder={t.ask}
            />

            <button onClick={startVoice}>
              🎤
            </button>

            <button onClick={sendMessage}>
              ➤
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
