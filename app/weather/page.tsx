"use client";

import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Menu,
  MapPin,
  Search,
  Mic,
  Send,
  Plus,
  Globe2,
  Sprout,
  Plane,
  CloudSun,
  Volume2,
  VolumeX,
  Navigation,
  X,
  LocateFixed,
  CalendarDays,
  Wind,
  Droplets,
  Gauge,
  Eye,
  Sun,
  Thermometer,
  Waves,
  AlertTriangle,
} from "lucide-react";

const Globe = dynamic(
  () => import("react-globe.gl"),
  { ssr: false }
);

type Mode = "general" | "farmer" | "traveler";

type WeatherData = {
  latitude: number;
  longitude: number;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  visibility: number;
  uv: number;
  weatherCode: number;
  rainProbability: number;
  city: string;
  country: string;
};

type ForecastDay = {
  date: string;
  temperature: number;
  rain: number;
  weatherCode: number;
};

type WeatherEvent = {
  date: string;
  type:
    | "storm"
    | "rain"
    | "tsunami"
    | "cyclone"
    | "earthquake"
    | "clear";
  title: string;
  description: string;
};

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

const languageNames: Record<string, string> = {
  en: "English",
  te: "Telugu",
  hi: "Hindi",
  ta: "Tamil",
  kn: "Kannada",
  ml: "Malayalam",
  mr: "Marathi",
  bn: "Bengali",
};

const weatherDescriptions: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  80: "Rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Severe thunderstorm",
};

function weatherIcon(code: number) {
  if (code >= 95) return "⛈️";
  if (code >= 80) return "🌧️";
  if (code >= 61) return "🌧️";
  if (code >= 51) return "🌦️";
  if (code >= 45) return "🌫️";
  if (code >= 1 && code <= 3) return "⛅";
  return "☀️";
}

export default function WeatherPage() {
  const [language, setLanguage] = useState("en");

  const [mode, setMode] =
    useState<Mode>("general");

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const [mapOpen, setMapOpen] =
    useState(false);

  const [locationPermission, setLocationPermission] =
    useState(false);

  const [locationLoading, setLocationLoading] =
    useState(true);

  const [weatherLoading, setWeatherLoading] =
    useState(false);

  const [selectedLocation, setSelectedLocation] =
    useState({
      lat: 17.385,
      lng: 78.4867,
      city: "Hyderabad",
      country: "India",
    });

  const [weather, setWeather] =
    useState<WeatherData | null>(null);

  const [forecast, setForecast] =
    useState<ForecastDay[]>([]);

  const [events, setEvents] =
    useState<WeatherEvent[]>([]);

  const [chatMessages, setChatMessages] =
    useState<ChatMessage[]>([
      {
        role: "assistant",
        text: "Hello! I am WeatherGPT. Ask me anything about the weather.",
      },
    ]);

  const [chatInput, setChatInput] =
    useState("");

  const [chatOpen, setChatOpen] =
    useState(false);

  const [listening, setListening] =
    useState(false);

  const [soundEnabled, setSoundEnabled] =
    useState(true);

  const [activeEffect, setActiveEffect] =
    useState("");

  const globeRef = useRef<any>(null);

  const recognitionRef =
    useRef<any>(null);

  const selectedLanguageName =
    languageNames[language] || "English";

  /*
   * LOAD SAVED LANGUAGE
   */

  useEffect(() => {
    const saved =
      localStorage.getItem(
        "weathergpt-language"
      );

    if (saved) {
      setLanguage(saved);
    }
  }, []);

  /*
   * LOCATION PERMISSION
   */

  useEffect(() => {
    requestLocation();
  }, []);

  async function requestLocation() {
    setLocationLoading(true);

    if (!navigator.geolocation) {
      setLocationPermission(false);
      setLocationLoading(false);
      fetchWeather(
        selectedLocation.lat,
        selectedLocation.lng
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat =
          position.coords.latitude;

        const lng =
          position.coords.longitude;

        setLocationPermission(true);

        await selectLocation(
          lat,
          lng,
          "Current location",
          "Current location"
        );

        setLocationLoading(false);
      },
      () => {
        setLocationPermission(false);
        setLocationLoading(false);

        fetchWeather(
          selectedLocation.lat,
          selectedLocation.lng
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  }

  /*
   * REVERSE GEOCODING
   */

  async function reverseGeocode(
    lat: number,
    lng: number
  ) {
    try {
      const response = await fetch(
        `${API_URL}/location/reverse?lat=${lat}&lon=${lng}`
      );

      if (!response.ok) {
        return {
          city: "Selected location",
          country: "",
        };
      }

      return await response.json();
    } catch {
      return {
        city: "Selected location",
        country: "",
      };
    }
  }

  /*
   * SELECT LOCATION
   */

  async function selectLocation(
    lat: number,
    lng: number,
    city?: string,
    country?: string
  ) {
    setWeatherLoading(true);

    const location =
      city && country
        ? { city, country }
        : await reverseGeocode(
            lat,
            lng
          );

    setSelectedLocation({
      lat,
      lng,
      city: location.city,
      country: location.country,
    });

    await fetchWeather(lat, lng);

    rotateGlobe(lat, lng);

    setMapOpen(false);
  }

  /*
   * FETCH WEATHER
   */

  async function fetchWeather(
    lat: number,
    lng: number
  ) {
    setWeatherLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/weather?lat=${lat}&lon=${lng}`
      );

      if (!response.ok) {
        throw new Error(
          "Weather request failed"
        );
      }

      const data = await response.json();

      setWeather(data.current);
      setForecast(data.forecast);
      setEvents(data.events);
    } catch (error) {
      console.error(error);

      /*
       * FALLBACK DEMO DATA
       */

      setWeather({
        latitude: lat,
        longitude: lng,
        temperature: 28,
        feelsLike: 30,
        humidity: 68,
        windSpeed: 13,
        pressure: 1012,
        visibility: 10,
        uv: 6,
        weatherCode: 2,
        rainProbability: 30,
        city: selectedLocation.city,
        country: selectedLocation.country,
      });

      const demoForecast: ForecastDay[] =
        Array.from({ length: 7 }).map(
          (_, index) => {
            const date =
              new Date();

            date.setDate(
              date.getDate() + index
            );

            return {
              date:
                date
                  .toISOString()
                  .split("T")[0],
              temperature:
                27 + index % 3,
              rain:
                20 + index * 5,
              weatherCode:
                index === 2
                  ? 61
                  : 2,
            };
          }
        );

      setForecast(demoForecast);

      setEvents([
        {
          date:
            new Date()
              .toISOString()
              .split("T")[0],
          type: "clear",
          title: "Clear sky",
          description:
            "Mostly clear weather expected.",
        },
      ]);
    } finally {
      setWeatherLoading(false);
    }
  }

  /*
   * GLOBE ROTATION
   */

  function rotateGlobe(
    lat: number,
    lng: number
  ) {
    if (!globeRef.current) return;

    globeRef.current.pointOfView(
      {
        lat,
        lng,
        altitude: 1.8,
      },
      1800
    );
  }

  /*
   * MANUAL GLOBE COUNTRY SELECTION
   */

  function handleGlobeClick(
    point: any
  ) {
    if (!point) return;

    const lat = point.lat;
    const lng = point.lng;

    selectLocation(lat, lng);
  }

  /*
   * WEATHER EVENT EFFECTS
   */

  const currentEvent =
    events.length > 0
      ? events[0]
      : null;

  useEffect(() => {
    if (!weather) return;

    let effect = "";

    if (
      weather.weatherCode >= 95
    ) {
      effect = "storm";
    } else if (
      weather.weatherCode >= 65
    ) {
      effect = "rain";
    } else if (
      weather.weatherCode >= 61
    ) {
      effect = "rain";
    } else {
      effect = "clear";
    }

    setActiveEffect(effect);

    const timer =
      setTimeout(() => {
        setActiveEffect("");
      }, 7000);

    return () => clearTimeout(timer);
  }, [weather]);

  /*
   * WEATHER EFFECT SOUND
   */

  function playEffectSound(
    type: string
  ) {
    if (!soundEnabled) return;

    /*
     * Add actual mp3/wav files here later.
     *
     * Example:
     *
     * const audio = new Audio(
     *   `/sounds/${type}.mp3`
     * );
     *
     * audio.play();
     */

    console.log(
      `Playing ${type} weather sound`
    );
  }

  /*
   * CHAT
   */

  async function sendChat() {
    const message =
      chatInput.trim();

    if (!message) return;

    setChatInput("");

    setChatMessages((previous) => [
      ...previous,
      {
        role: "user",
        text: message,
      },
    ]);

    try {
      const response = await fetch(
        `${API_URL}/ai/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            message,
            language,
            mode,
            location: {
              latitude:
                selectedLocation.lat,
              longitude:
                selectedLocation.lng,
              city:
                selectedLocation.city,
              country:
                selectedLocation.country,
            },
            weather,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("AI failed");
      }

      const data =
        await response.json();

      setChatMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: data.reply,
        },
      ]);
    } catch {
      const fallback =
        getLocalAssistantReply(
          message
        );

      setChatMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: fallback,
        },
      ]);
    }
  }

  function getLocalAssistantReply(
    message: string
  ) {
    const temperature =
      weather?.temperature ?? 28;

    const condition =
      weatherDescriptions[
        weather?.weatherCode ?? 2
      ];

    if (language === "te") {
      return `ప్రస్తుతం ${selectedLocation.city}లో ఉష్ణోగ్రత ${temperature}°C. వాతావరణం ${condition}.`;
    }

    if (language === "hi") {
      return `अभी ${selectedLocation.city} में तापमान ${temperature}°C है और मौसम ${condition} है।`;
    }

    return `Currently in ${selectedLocation.city}, it is ${temperature}°C with ${condition}.`;
  }

  /*
   * VOICE INPUT
   */

  function startVoice() {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any)
        .webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Voice recognition is not supported in this browser."
      );
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.lang =
      language === "te"
        ? "te-IN"
        : language === "hi"
        ? "hi-IN"
        : language === "ta"
        ? "ta-IN"
        : language === "kn"
        ? "kn-IN"
        : "en-IN";

    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (
      event: any
    ) => {
      const transcript =
        event.results[0][0]
          .transcript;

      setChatInput(transcript);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current =
      recognition;

    recognition.start();
  }

  /*
   * TEXT TO SPEECH
   */

  function speak(text: string) {
    if (!("speechSynthesis" in window))
      return;

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(
        text
      );

    utterance.lang =
      language === "te"
        ? "te-IN"
        : language === "hi"
        ? "hi-IN"
        : language === "ta"
        ? "ta-IN"
        : language === "kn"
        ? "kn-IN"
        : "en-IN";

    window.speechSynthesis.speak(
      utterance
    );
  }

  /*
   * SEARCH BUTTON
   */

  function openSearchMap() {
    setMapOpen(true);
  }

  /*
   * WEATHER STATISTICS
   */

  const weatherStats = useMemo(
    () => [
      {
        icon: <Thermometer size={20} />,
        label: "Feels like",
        value: `${weather?.feelsLike ?? "--"}°C`,
      },
      {
        icon: <Droplets size={20} />,
        label: "Humidity",
        value: `${weather?.humidity ?? "--"}%`,
      },
      {
        icon: <Wind size={20} />,
        label: "Wind",
        value: `${weather?.windSpeed ?? "--"} km/h`,
      },
      {
        icon: <Gauge size={20} />,
        label: "Pressure",
        value: `${weather?.pressure ?? "--"} hPa`,
      },
      {
        icon: <Eye size={20} />,
        label: "Visibility",
        value: `${weather?.visibility ?? "--"} km`,
      },
      {
        icon: <Sun size={20} />,
        label: "UV index",
        value: `${weather?.uv ?? "--"}`,
      },
    ],
    [weather]
  );

  return (
    <main
      className={`weather-page effect-${activeEffect}`}
    >
      <div className="weather-overlay" />

      {/* WEATHER EFFECTS */}

      {activeEffect === "rain" && (
        <div className="rain-effect">
          {Array.from({
            length: 80,
          }).map((_, index) => (
            <span
              key={index}
              style={{
                left: `${
                  Math.random() * 100
                }%`,
                animationDelay: `${
                  Math.random() * 2
                }s`,
              }}
            />
          ))}
        </div>
      )}

      {activeEffect === "storm" && (
        <div
          className="storm-effect"
          onClick={() =>
            playEffectSound("thunder")
          }
        >
          <div className="lightning">
            ⚡
          </div>
        </div>
      )}

      {activeEffect === "tsunami" && (
        <div className="tsunami-effect">
          🌊 🌊 🌊 🌊
        </div>
      )}

      {activeEffect === "cyclone" && (
        <div className="cyclone-effect">
          🌀
        </div>
      )}

      {activeEffect ===
        "earthquake" && (
        <div className="earthquake-effect" />
      )}

      <div className="weather-app">

        {/* SIDEBAR */}

        <aside
          className={`weather-sidebar ${
            sidebarOpen
              ? ""
              : "sidebar-hidden"
          }`}
        >
          <div className="sidebar-logo">
            🌤️ WeatherGPT
          </div>

          <button
            className="new-chat-button"
            onClick={() =>
              setChatMessages([
                {
                  role: "assistant",
                  text: "How can I help with the weather?",
                },
              ])
            }
          >
            <Plus size={17} />
            &nbsp; New chat
          </button>

          <div className="sidebar-section">
            <span>MODES</span>

            <button
              onClick={() =>
                setMode("general")
              }
              className={
                mode === "general"
                  ? "active"
                  : ""
              }
            >
              <CloudSun size={17} />
              General
            </button>

            <button
              onClick={() =>
                setMode("farmer")
              }
              className={
                mode === "farmer"
                  ? "active"
                  : ""
              }
            >
              <Sprout size={17} />
              Farmer
            </button>

            <button
              onClick={() =>
                setMode("traveler")
              }
              className={
                mode === "traveler"
                  ? "active"
                  : ""
              }
            >
              <Plane size={17} />
              Traveler
            </button>
          </div>

          <div className="sidebar-section">
            <span>LOCATION</span>

            <button
              className="sidebar-location"
              onClick={
                requestLocation
              }
            >
              <LocateFixed
                size={16}
              />
              {selectedLocation.city}
            </button>
          </div>

          <div className="sidebar-bottom">
            <button
              onClick={() =>
                setSoundEnabled(
                  !soundEnabled
                )
              }
            >
              {soundEnabled ? (
                <>
                  <Volume2 size={16} />
                  Sound effects ON
                </>
              ) : (
                <>
                  <VolumeX size={16} />
                  Sound effects OFF
                </>
              )}
            </button>
          </div>
        </aside>

        {/* MAIN */}

        <section className="chat-main">

          {/* TOP BAR */}

          <header className="chat-topbar">

            <div className="topbar-left">
              <button
                className="mobile-menu"
                onClick={() =>
                  setSidebarOpen(
                    !sidebarOpen
                  )
                }
              >
                <Menu />
              </button>

              <div>
                <h1>
                  WeatherGPT
                </h1>

                <p>
                  {selectedLocation.city},{" "}
                  {selectedLocation.country}
                </p>
              </div>
            </div>

            <div className="topbar-status">
              <span className="status-dot" />
              Live weather
            </div>
          </header>

          {/* CHAT CONTENT */}

          <div className="chat-scroll">
            <div className="chat-content">

              {/* SEARCH */}

              <button
                className="weather-search"
                onClick={
                  openSearchMap
                }
              >
                <Search size={19} />

                <span>
                  Search location...
                </span>

                <MapPin
                  size={17}
                />
              </button>

              {/* CURRENT WEATHER */}

              <div className="weather-dashboard">

                <div className="current-weather">

                  <div className="weather-primary">

                    <div className="weather-location">
                      <MapPin
                        size={17}
                      />

                      {selectedLocation.city},{" "}
                      {selectedLocation.country}
                    </div>

                    <div className="big-weather-icon">
                      {weatherIcon(
                        weather
                          ?.weatherCode ??
                          2
                      )}
                    </div>

                    <div className="big-temperature">
                      {weather
                        ? Math.round(
                            weather.temperature
                          )
                        : "--"}
                      <sup>°C</sup>
                    </div>

                    <div className="weather-condition">
                      {
                        weatherDescriptions[
                          weather
                            ?.weatherCode ??
                            2
                        ]
                      }
                    </div>

                    <div className="rain-probability">
                      🌧️ Rain probability:{" "}
                      {weather
                        ?.rainProbability ??
                        "--"}
                      %
                    </div>

                  </div>

                  <div className="weather-globe-wrapper">

                    <Globe
                      ref={globeRef}
                      width={420}
                      height={420}
                      backgroundColor="rgba(0,0,0,0)"
                      globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                      bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                      atmosphereColor="#4fc3ff"
                      atmosphereAltitude={0.18}
                      onGlobeClick={
                        handleGlobeClick
                      }
                    />

                    <div className="globe-location">
                      <Navigation
                        size={14}
                      />
                      {selectedLocation.city}
                    </div>

                  </div>

                  <div className="weather-stats">

                    {weatherStats.map(
                      (stat) => (
                        <div
                          key={
                            stat.label
                          }
                        >
                          {stat.icon}

                          <small>
                            {
                              stat.label
                            }
                          </small>

                          <strong>
                            {
                              stat.value
                            }
                          </strong>
                        </div>
                      )
                    )}

                  </div>

                </div>

                {/* FORECAST */}

                <section className="forecast-section">

                  <div className="section-title-row">
                    <h2>
                      {mode ===
                      "farmer"
                        ? "🌾 Farming forecast"
                        : mode ===
                          "traveler"
                        ? "✈️ Travel forecast"
                        : "7-day forecast"}
                    </h2>

                    <span className="forecast-location">
                      {selectedLocation.city}
                    </span>
                  </div>

                  <div className="forecast-scroll">

                    {forecast.map(
                      (day) => (
                        <div
                          className="forecast-day"
                          key={
                            day.date
                          }
                        >
                          <small>
                            {new Date(
                              day.date
                            ).toLocaleDateString(
                              language ===
                                "en"
                                ? "en-IN"
                                : language,
                              {
                                weekday:
                                  "short",
                              }
                            )}
                          </small>

                          <strong>
                            {weatherIcon(
                              day.weatherCode
                            )}
                          </strong>

                          <b>
                            {Math.round(
                              day.temperature
                            )}
                            °C
                          </b>

                          <em>
                            💧{" "}
                            {day.rain}%
                          </em>
                        </div>
                      )
                    )}

                  </div>

                </section>

                {/* FARMER MODE */}

                {mode ===
                  "farmer" && (
                  <section className="mode-panel farmer-panel">

                    <h2>
                      🌾 Farmer Assistant
                    </h2>

                    <p>
                      Crop recommendations
                      for your current
                      location.
                    </p>

                    <div className="crop-grid">

                      <div>
                        🌾
                        <strong>
                          Rice
                        </strong>
                        <small>
                          Suitable
                          with good
                          water
                          availability
                        </small>
                      </div>

                      <div>
                        🌽
                        <strong>
                          Maize
                        </strong>
                        <small>
                          Moderate
                          suitability
                        </small>
                      </div>

                      <div>
                        🌱
                        <strong>
                          Vegetables
                        </strong>
                        <small>
                          Good
                          conditions
                        </small>
                      </div>

                    </div>

                  </section>
                )}

                {/* TRAVELER MODE */}

                {mode ===
                  "traveler" && (
                  <section className="mode-panel traveler-panel">

                    <h2>
                      ✈️ Traveler Assistant
                    </h2>

                    <p>
                      Weather for your
                      current journey.
                    </p>

                    <div className="traveler-info">

                      <div>
                        <Navigation />
                        <strong>
                          Live location
                        </strong>
                        <span>
                          {selectedLocation.city}
                        </span>
                      </div>

                      <div>
                        <CloudSun />
                        <strong>
                          Today's weather
                        </strong>
                        <span>
                          {
                            weatherDescriptions[
                              weather
                                ?.weatherCode ??
                                2
                            ]
                          }
                        </span>
                      </div>

                      <div>
                        <UmbrellaIcon />
                        <strong>
                          Rain chance
                        </strong>
                        <span>
                          {
                            weather
                              ?.rainProbability ??
                              0
                          }
                          %
                        </span>
                      </div>

                    </div>

                  </section>
                )}

                {/* CALENDAR */}

                <section className="calendar-section">

                  <div className="section-title-row">

                    <h2>
                      <CalendarDays
                        size={20}
                      />
                      Weather Calendar
                    </h2>

                    <span>
                      Upcoming events
                    </span>

                  </div>

                  <div className="event-list">

                    {events.length ===
                    0 ? (
                      <div className="empty-events">
                        No major weather
                        events predicted.
                      </div>
                    ) : (
                      events.map(
                        (
                          event,
                          index
                        ) => (
                          <button
                            key={
                              `${event.date}-${index}`
                            }
                            className={`event-item event-${event.type}`}
                            onClick={() => {
                              setActiveEffect(
                                event.type
                              );

                              playEffectSound(
                                event.type
                              );
                            }}
                          >
                            <span>
                              {event.type ===
                                "storm" &&
                                "⚡"}

                              {event.type ===
                                "rain" &&
                                "🌧️"}

                              {event.type ===
                                "tsunami" &&
                                "🌊"}

                              {event.type ===
                                "cyclone" &&
                                "🌀"}

                              {event.type ===
                                "earthquake" &&
                                "🌎"}

                              {event.type ===
                                "clear" &&
                                "☀️"}
                            </span>

                            <div>
                              <strong>
                                {
                                  event.title
                                }
                              </strong>

                              <small>
                                {
                                  event.date
                                }
                              </small>

                              <small>
                                {
                                  event.description
                                }
                              </small>
                            </div>
                          </button>
                        )
                      )
                    )}

                  </div>

                </section>

              </div>

              {/* CHAT MESSAGES */}

              <div className="messages-area">

                {chatMessages.map(
                  (
                    message,
                    index
                  ) => (
                    <div
                      className={`chat-message-row ${message.role}`}
                      key={index}
                    >
                      <div className="message-avatar">
                        {message.role ===
                        "assistant"
                          ? "🌤️"
                          : "👤"}
                      </div>

                      <div className="chat-message">

                        <div className="message-role">
                          {message.role ===
                          "assistant"
                            ? "WeatherGPT"
                            : "You"}
                        </div>

                        <div>
                          {
                            message.text
                          }
                        </div>

                        {message.role ===
                          "assistant" && (
                          <button
                            className="speak-message"
                            onClick={() =>
                              speak(
                                message.text
                              )
                            }
                          >
                            <Volume2
                              size={15}
                            />
                          </button>
                        )}

                      </div>
                    </div>
                  )
                )}

              </div>

            </div>
          </div>

          {/* CHAT COMPOSER */}

          <div className="chat-composer-area">

            {chatOpen && (
              <div className="floating-chat-window">

                <div className="floating-chat-header">
                  <strong>
                    🌤️ WeatherGPT
                  </strong>

                  <button
                    onClick={() =>
                      setChatOpen(
                        false
                      )
                    }
                  >
                    <X size={17} />
                  </button>
                </div>

                <div className="floating-chat-messages">

                  {chatMessages.map(
                    (
                      message,
                      index
                    ) => (
                      <div
                        className={`floating-message ${message.role}`}
                        key={index}
                      >
                        {message.text}
                      </div>
                    )
                  )}

                </div>

              </div>
            )}

            <div className="chat-composer">

              <button
                className={`voice-button ${
                  listening
                    ? "listening"
                    : ""
                }`}
                onClick={
                  startVoice
                }
                title="Voice assistant"
              >
                <Mic size={20} />
              </button>

              <input
                value={chatInput}
                onChange={(event) =>
                  setChatInput(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key ===
                    "Enter"
                  ) {
                    sendChat();
                  }
                }}
                placeholder={
                  language ===
                  "te"
                    ? "వాతావరణం గురించి అడగండి..."
                    : language ===
                      "hi"
                    ? "मौसम के बारे में पूछें..."
                    : "Ask WeatherGPT..."
                }
              />

              <button
                className="chat-mini-button"
                onClick={() =>
                  setChatOpen(
                    !chatOpen
                  )
                }
              >
                🤖
              </button>

              <button
                className="send-button"
                onClick={
                  sendChat
                }
              >
                <Send size={19} />
              </button>

            </div>

            <p className="composer-note">
              WeatherGPT responds in{" "}
              <strong>
                {selectedLanguageName}
              </strong>
            </p>

          </div>

        </section>

      </div>

      {/* SEARCH / MAP MODAL */}

      {mapOpen && (
        <LocationMapModal
          currentLat={
            selectedLocation.lat
          }
          currentLng={
            selectedLocation.lng
          }
          onClose={() =>
            setMapOpen(false)
          }
          onSelect={(
            lat,
            lng,
            city,
            country
          ) =>
            selectLocation(
              lat,
              lng,
              city,
              country
            )
          }
        />
      )}

      {/* LOCATION LOADING */}

      {locationLoading && (
        <div className="location-overlay">
          <div className="location-card">
            <LocateFixed
              size={40}
            />

            <h2>
              Finding your location
            </h2>

            <p>
              Please allow location
              access so WeatherGPT can
              show your local weather.
            </p>
          </div>
        </div>
      )}

      {/* WEATHER LOADING */}

      {weatherLoading && (
        <div className="weather-loading">
          Updating weather...
        </div>
      )}

    </main>
  );
}

/*
 * MAP MODAL
 *
 * This version uses OpenStreetMap
 * through an iframe to keep the first
 * version simple and dependency-light.
 *
 * The coordinates can later be connected
 * to Leaflet/Mapbox/Google Maps.
 */

function LocationMapModal({
  currentLat,
  currentLng,
  onClose,
  onSelect,
}: {
  currentLat: number;
  currentLng: number;
  onClose: () => void;
  onSelect: (
    lat: number,
    lng: number,
    city?: string,
    country?: string
  ) => void;
}) {
  const [search, setSearch] =
    useState("");

  const [results, setResults] =
    useState<any[]>([]);

  async function searchLocation() {
    if (!search.trim()) return;

    try {
      const response =
        await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            search
          )}&limit=5`
        );

      const data =
        await response.json();

      setResults(data);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="map-modal">

      <div className="map-modal-header">

        <button
          onClick={onClose}
        >
          <X />
        </button>

        <div>
          <strong>
            Choose location
          </strong>

          <small>
            Your current location is
            already selected.
          </small>
        </div>

      </div>

      <div className="map-search">

        <Search size={18} />

        <input
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          onKeyDown={(event) => {
            if (
              event.key ===
              "Enter"
            ) {
              searchLocation();
            }
          }}
          placeholder="Search city, country or place..."
        />

        <button
          onClick={
            searchLocation
          }
        >
          Search
        </button>

      </div>

      <div className="map-results">

        <button
          className="current-location-result"
          onClick={() =>
            onSelect(
              currentLat,
              currentLng,
              "Current location",
              ""
            )
          }
        >
          <LocateFixed
            size={18}
          />

          <div>
            <strong>
              Current location
            </strong>

            <small>
              {currentLat.toFixed(
                4
              )}
              ,{" "}
              {currentLng.toFixed(
                4
              )}
            </small>
          </div>
        </button>

        {results.map(
          (result) => (
            <button
              className="map-result"
              key={result.place_id}
              onClick={() =>
                onSelect(
                  Number(
                    result.lat
                  ),
                  Number(
                    result.lon
                  ),
                  result.name,
                  result.display_name
                )
              }
            >
              <MapPin
                size={17}
              />

              <span>
                {
                  result.display_name
                }
              </span>
            </button>
          )
        )}

      </div>

      <div className="map-preview">

        <iframe
          title="OpenStreetMap"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${
            currentLng - 0.1
          }%2C${
            currentLat - 0.1
          }%2C${
            currentLng + 0.1
          }%2C${
            currentLat + 0.1
          }&layer=mapnik&marker=${currentLat}%2C${currentLng}`}
        />

      </div>

    </div>
  );
}

function UmbrellaIcon() {
  return (
    <span className="umbrella-icon">
      ☂️
    </span>
  );
}
