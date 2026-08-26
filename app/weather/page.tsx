"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

const BACKEND = "http://127.0.0.1:8000";

const languages: Record<
  string,
  {
    name: string;
    speech: string;
  }
> = {
  en: {
    name: "English",
    speech: "en-IN",
  },
  hi: {
    name: "हिन्दी",
    speech: "hi-IN",
  },
  te: {
    name: "తెలుగు",
    speech: "te-IN",
  },
  ta: {
    name: "தமிழ்",
    speech: "ta-IN",
  },
  mr: {
    name: "मराठी",
    speech: "mr-IN",
  },
  bn: {
    name: "বাংলা",
    speech: "bn-IN",
  },
  pa: {
    name: "ਪੰਜਾਬੀ",
    speech: "pa-IN",
  },
  ur: {
    name: "اردو",
    speech: "ur-PK",
  },
  es: {
    name: "Español",
    speech: "es-ES",
  },
  fr: {
    name: "Français",
    speech: "fr-FR",
  },
  de: {
    name: "Deutsch",
    speech: "de-DE",
  },
  ja: {
    name: "日本語",
    speech: "ja-JP",
  },
};

export default function WeatherPage() {
  const params = useSearchParams();

  const location = params.get("location");
  const lat = params.get("lat");
  const lon = params.get("lon");

  const langCode =
    params.get("lang") || "en";

  const selectedLanguage =
    languages[langCode] || languages.en;

  const [weather, setWeather] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [safePlaces, setSafePlaces] =
    useState<any[]>([]);

  const [safeLoading, setSafeLoading] =
    useState(false);

  const [chatOpen, setChatOpen] =
    useState(false);

  const [chatMessage, setChatMessage] =
    useState("");

  const [chatReply, setChatReply] =
    useState("");

  const [chatLoading, setChatLoading] =
    useState(false);

  const [listening, setListening] =
    useState(false);

  const hasAlert =
    weather?.alerts?.length > 0;

  const weatherContext =
    useMemo(() => {
      if (!weather) {
        return "";
      }

      return JSON.stringify({
        location:
          weather.location,
        current:
          weather.current,
        alerts:
          weather.alerts,
      });
    }, [weather]);

  useEffect(() => {
    loadWeather();
  }, [location, lat, lon, langCode]);

  async function loadWeather() {
    setLoading(true);
    setError("");

    try {
      let query = "";

      if (lat && lon) {
        query = `${lat},${lon}`;
      } else if (location) {
        query = location;
      } else {
        throw new Error(
          "No location was selected."
        );
      }

      const response = await fetch(
        `${BACKEND}/weather`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            location: query,
            language: langCode,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to get weather"
        );
      }

      setWeather(data);

      if (
        data.location?.lat &&
        data.location?.lon
      ) {
        loadSafePlaces(
          data.location.lat,
          data.location.lon
        );
      }
    } catch (err: any) {
      setError(
        err.message ||
          "Unable to load weather."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadSafePlaces(
    latitude: number,
    longitude: number
  ) {
    setSafeLoading(true);

    try {
      const response = await fetch(
        `${BACKEND}/safe-places`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            latitude,
            longitude,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSafePlaces(
          data.places || []
        );
      }
    } catch (error) {
      console.log(
        "Safe place error:",
        error
      );
    } finally {
      setSafeLoading(false);
    }
  }

  async function sendChat() {
    if (!chatMessage.trim()) {
      return;
    }

    setChatLoading(true);

    try {
      const response = await fetch(
        `${BACKEND}/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            message: chatMessage,
            language:
              selectedLanguage.name,
            weather_context:
              weatherContext,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Chat failed"
        );
      }

      setChatReply(data.answer);

      speak(data.answer);
    } catch (error) {
      setChatReply(
        "I couldn't connect to the AI assistant."
      );
    } finally {
      setChatLoading(false);
    }
  }

  function speak(text: string) {
    if (
      !("speechSynthesis" in window)
    ) {
      return;
    }

    window.speechSynthesis.cancel();

    const speech =
      new SpeechSynthesisUtterance(
        text
      );

    speech.lang =
      selectedLanguage.speech;

    speech.rate = 0.95;

    window.speechSynthesis.speak(
      speech
    );
  }

  function startVoice() {
    const SpeechRecognition =
      (window as any)
        .SpeechRecognition ||
      (window as any)
        .webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Voice input is not supported."
      );
      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.lang =
      selectedLanguage.speech;

    recognition.continuous = false;
    recognition.interimResults = false;

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

  if (loading) {
    return (
      <main className="weatherPage">
        <div className="loadingScreen">
          <div className="loadingIcon">
            🌦️
          </div>

          <h1>
            Loading weather...
          </h1>

          <p>
            Getting the latest information
            for your location.
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="weatherPage">
        <div className="errorScreen">
          <h1>⚠️ WeatherGPT</h1>

          <p>{error}</p>

          <button
            onClick={loadWeather}
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  const current =
    weather.current;

  return (
    <main
      className={
        hasAlert
          ? "weatherPage alertMode"
          : "weatherPage"
      }
    >
      <div className="weatherOverlay" />

      <div className="weatherContent">
        <header className="weatherHeader">
          <div>
            <span className="miniLogo">
              🌤️
            </span>

            <strong>
              WeatherGPT
            </strong>
          </div>

          <div className="headerLocation">
            📍{" "}
            {weather.location.name}
            {weather.location.country
              ? `, ${weather.location.country}`
              : ""}
          </div>
        </header>

        {hasAlert && (
          <section className="alertBanner">
            <div className="alertIcon">
              ⚠️
            </div>

            <div>
              <strong>
                Weather Alert
              </strong>

              <p>
                {weather.alerts[0]
                  .headline ||
                  weather.alerts[0]
                    .event}
              </p>

              <small>
                Follow official local
                emergency instructions.
              </small>
            </div>
          </section>
        )}

        <section className="currentWeather">
          <div className="currentMain">
            <img
              src={
                current.icon
                  ? `https:${current.icon}`
                  : ""
              }
              alt={
                current.condition
              }
            />

            <div>
              <h1>
                {Math.round(
                  current.temperature
                )}
                °
              </h1>

              <h2>
                {current.condition}
              </h2>

              <p>
                Feels like{" "}
                {Math.round(
                  current.feels_like
                )}
                °
              </p>
            </div>
          </div>

          <div className="weatherStats">
            <div>
              💧
              <strong>
                {current.humidity}%
              </strong>
              <span>
                Humidity
              </span>
            </div>

            <div>
              💨
              <strong>
                {current.wind} km/h
              </strong>
              <span>
                Wind
              </span>
            </div>

            <div>
              👁️
              <strong>
                {current.visibility} km
              </strong>
              <span>
                Visibility
              </span>
            </div>

            <div>
              ☀️
              <strong>
                {current.uv}
              </strong>
              <span>
                UV
              </span>
            </div>
          </div>
        </section>

        <section className="forecastSection">
          <h2>
            5-Day Forecast
          </h2>

          <div className="forecastGrid">
            {weather.forecast.map(
              (day: any) => (
                <div
                  className="forecastCard"
                  key={day.date}
                >
                  <strong>
                    {new Date(
                      day.date
                    ).toLocaleDateString(
                      undefined,
                      {
                        weekday:
                          "short",
                      }
                    )}
                  </strong>

                  <img
                    src={`https:${day.day.condition.icon}`}
                    alt=""
                  />

                  <div>
                    <b>
                      {Math.round(
                        day.day.maxtemp_c
                      )}
                      °
                    </b>

                    <span>
                      {" "}
                      /{" "}
                      {Math.round(
                        day.day.mintemp_c
                      )}
                      °
                    </span>
                  </div>

                  <small>
                    {day.day.condition.text}
                  </small>
                </div>
              )
            )}
          </div>
        </section>

        {hasAlert && (
          <section className="safetySection">
            <div className="sectionTitle">
              <div>
                <span>🚨</span>

                <div>
                  <h2>
                    Safety Information
                  </h2>

                  <p>
                    Nearby places you may
                    use during an alert.
                  </p>
                </div>
              </div>
            </div>

            <div className="alertDetails">
              {weather.alerts.map(
                (alert: any, index: number) => (
                  <div
                    className="alertCard"
                    key={index}
                  >
                    <h3>
                      {alert.event ||
                        "Weather Warning"}
                    </h3>

                    <p>
                      {alert.description}
                    </p>

                    {alert.instruction && (
                      <strong>
                        🛡️{" "}
                        {alert.instruction}
                      </strong>
                    )}
                  </div>
                )
              )}
            </div>

            <h3 className="safeTitle">
              🏠 Nearby safer locations
            </h3>

            {safeLoading && (
              <div className="safeLoading">
                Finding nearby places...
              </div>
            )}

            <div className="safePlaces">
              {safePlaces.map(
                (place, index) => (
                  <div
                    className="safePlace"
                    key={`${place.name}-${index}`}
                  >
                    <div className="safePlaceIcon">
                      {place.type ===
                      "Hospital"
                        ? "🏥"
                        : place.type ===
                            "Police Station"
                          ? "👮"
                          : place.type ===
                              "Fire Station"
                            ? "🚒"
                            : "🏠"}
                    </div>

                    <div className="safePlaceInfo">
                      <h3>
                        {place.name}
                      </h3>

                      <p>
                        {place.type}
                      </p>

                      {place.walking_minutes !==
                        null && (
                        <strong>
                          🚶 About{" "}
                          {
                            place.walking_minutes
                          } min walk
                        </strong>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>

            <p className="safetyDisclaimer">
              Travel times are estimates and
              may change with traffic,
              road closures, weather, or
              emergency conditions. Follow
              official emergency instructions.
            </p>
          </section>
        )}

        <footer>
          Weather data powered by
          WeatherAPI.com
        </footer>
      </div>

      {/* CHATBOT */}

      <button
        className="chatBubble"
        onClick={() =>
          setChatOpen(!chatOpen)
        }
      >
        {chatOpen ? "×" : "🤖"}
      </button>

      {chatOpen && (
        <div className="chatWindow">
          <div className="chatHeader">
            <div>
              <strong>
                WeatherGPT AI
              </strong>

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
              👋 Ask me about this weather,
              alerts or safety.
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
              onClick={
                startVoice
              }
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
              placeholder="Ask something..."
            />

            <button
              className="sendButton"
              onClick={sendChat}
              disabled={
                chatLoading
              }
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
