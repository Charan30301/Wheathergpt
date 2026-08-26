"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const BACKEND = "http://127.0.0.1:8000";

const languages = [
  { code: "en", name: "English", speech: "en-IN" },
  { code: "hi", name: "हिन्दी", speech: "hi-IN" },
  { code: "te", name: "తెలుగు", speech: "te-IN" },
  { code: "ta", name: "தமிழ்", speech: "ta-IN" },
  { code: "mr", name: "मराठी", speech: "mr-IN" },
  { code: "bn", name: "বাংলা", speech: "bn-IN" },
  { code: "pa", name: "ਪੰਜਾਬੀ", speech: "pa-IN" },
  { code: "ur", name: "اردو", speech: "ur-PK" },
  { code: "es", name: "Español", speech: "es-ES" },
  { code: "fr", name: "Français", speech: "fr-FR" },
  { code: "de", name: "Deutsch", speech: "de-DE" },
  { code: "ja", name: "日本語", speech: "ja-JP" },
];

export default function Home() {
  const router = useRouter();

  const [city, setCity] = useState("");
  const [language, setLanguage] = useState("en");
  const [locationLoading, setLocationLoading] = useState(false);

  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatReply, setChatReply] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [listening, setListening] = useState(false);

  const selectedLanguage =
    languages.find((item) => item.code === language) ||
    languages[0];

  useEffect(() => {
    const savedLanguage = localStorage.getItem(
      "weather-language"
    );

    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  function saveLanguage(code: string) {
    setLanguage(code);
    localStorage.setItem(
      "weather-language",
      code
    );
  }

  function goToWeather(location: string) {
    if (!location.trim()) {
      return;
    }

    const encoded = encodeURIComponent(
      location.trim()
    );

    router.push(
      `/weather?location=${encoded}&lang=${language}`
    );
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      alert(
        "Location is not supported by this browser."
      );
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        router.push(
          `/weather?lat=${lat}&lon=${lon}&lang=${language}`
        );

        setLocationLoading(false);
      },
      () => {
        setLocationLoading(false);

        alert(
          "Location permission was denied. Please allow location access."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      }
    );
  }

  async function sendChat() {
    if (!chatMessage.trim()) {
      return;
    }

    setChatLoading(true);
    setChatReply("");

    try {
      const response = await fetch(
        `${BACKEND}/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: chatMessage,
            language:
              selectedLanguage.name,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Chat error"
        );
      }

      setChatReply(data.answer);

      speak(data.answer);
    } catch (error) {
      setChatReply(
        "Sorry, I couldn't connect to the AI assistant."
      );
    } finally {
      setChatLoading(false);
    }
  }

  function speak(text: string) {
    if (!("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(text);

    utterance.lang =
      selectedLanguage.speech;

    utterance.rate = 0.95;

    window.speechSynthesis.speak(
      utterance
    );
  }

  function startVoice() {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Voice input is not supported in this browser."
      );
      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.lang =
      selectedLanguage.speech;

    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onresult = (
      event: any
    ) => {
      const text =
        event.results[0][0].transcript;

      setChatMessage(text);
    };

    recognition.start();
  }

  return (
    <main className="homePage">
      <div className="homeOverlay" />

      <section className="homeContent">
        <div className="brand">
          <div className="brandIcon">🌤️</div>

          <h1>WeatherGPT</h1>

          <p>
            Your intelligent weather assistant
          </p>
        </div>

        <div className="searchCard">
          <h2>Where do you want the weather?</h2>

          <p className="smallText">
            Search any place or use your current
            location.
          </p>

          <div className="searchRow">
            <input
              value={city}
              onChange={(event) =>
                setCity(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  goToWeather(city);
                }
              }}
              placeholder="Search city..."
            />

            <button
              className="searchButton"
              onClick={() =>
                goToWeather(city)
              }
            >
              🔍
            </button>
          </div>

          <button
            className="locationButton"
            onClick={useCurrentLocation}
            disabled={locationLoading}
          >
            📍{" "}
            {locationLoading
              ? "Finding your location..."
              : "Use my current location"}
          </button>

          <div className="languageSection">
            <label>
              🌐 Which language do you want
              to see the weather in?
            </label>

            <select
              value={language}
              onChange={(event) =>
                saveLanguage(
                  event.target.value
                )
              }
            >
              {languages.map((item) => (
                <option
                  key={item.code}
                  value={item.code}
                >
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <p className="privacyText">
            Your location is only requested when
            you choose "Use my current location".
          </p>
        </div>
      </section>

      {/* CHATBOT */}

      <button
        className="chatBubble"
        onClick={() =>
          setChatOpen(!chatOpen)
        }
        aria-label="Open WeatherGPT assistant"
      >
        {chatOpen ? "×" : "🤖"}
      </button>

      {chatOpen && (
        <div className="chatWindow">
          <div className="chatHeader">
            <div>
              <strong>WeatherGPT AI</strong>

              <span>
                {selectedLanguage.name}
              </span>
            </div>

            <button
              onClick={() =>
                setChatOpen(false)
              }
            >
              ×
            </button>
          </div>

          <div className="chatMessages">
            <div className="botMessage">
              👋 Ask me anything about weather,
              warnings, temperature or safety.
            </div>

            {chatMessage && (
              <div className="userMessage">
                {chatMessage}
              </div>
            )}

            {chatLoading && (
              <div className="botMessage">
                Thinking...
              </div>
            )}

            {chatReply && (
              <div className="botMessage">
                {chatReply}

                <button
                  className="speakButton"
                  onClick={() =>
                    speak(chatReply)
                  }
                >
                  🔊
                </button>
              </div>
            )}
          </div>

          <div className="chatInput">
            <button
              className={
                listening
                  ? "voiceButton listening"
                  : "voiceButton"
              }
              onClick={startVoice}
            >
              🎤
            </button>

            <input
              value={chatMessage}
              onChange={(event) =>
                setChatMessage(
                  event.target.value
                )
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  sendChat();
                }
              }}
              placeholder="Ask WeatherGPT..."
            />

            <button
              className="sendButton"
              onClick={sendChat}
              disabled={chatLoading}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
