"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Language = {
  code: string;
  name: string;
  native: string;
};

const languages: Language[] = [
  { code: "en", name: "English", native: "English" },
  { code: "te", name: "Telugu", native: "తెలుగు" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "ta", name: "Tamil", native: "தமிழ்" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", native: "മലയാളം" },
  { code: "mr", name: "Marathi", native: "मराठी" },
  { code: "bn", name: "Bengali", native: "বাংলা" },
];

export default function HomePage() {
  const router = useRouter();

  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedLanguage = localStorage.getItem("weathergpt-language");

    if (savedLanguage) {
      setSelectedLanguage(savedLanguage);
    }
  }, []);

  function selectLanguage(code: string) {
    setSelectedLanguage(code);
  }

  function continueToWeather() {
    setLoading(true);

    localStorage.setItem(
      "weathergpt-language",
      selectedLanguage
    );

    setTimeout(() => {
      router.push("/weather");
    }, 300);
  }

  return (
    <main className="language-page">
      <div className="overlay" />

      <div className="language-card">
        <div className="logo">🌤️</div>

        <h1>WeatherGPT</h1>

        <p className="subtitle">
          Your intelligent multilingual weather assistant
        </p>

        <div className="language-box">
          <h2>Choose your language</h2>

          <p className="description">
            WeatherGPT will remember your language and use it
            automatically whenever you return.
          </p>

          <div className="languages">
            {languages.map((language) => (
              <button
                key={language.code}
                className={`language-button ${
                  selectedLanguage === language.code
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  selectLanguage(language.code)
                }
              >
                <span>{language.name}</span>

                <small>{language.native}</small>

                {selectedLanguage === language.code && (
                  <span className="arrow">✓</span>
                )}
              </button>
            ))}
          </div>

          <button
            className="language-continue"
            onClick={continueToWeather}
            disabled={loading}
          >
            {loading ? "Opening WeatherGPT..." : "Continue →"}
          </button>
        </div>

        <p className="bottom-text">
          Your selected language will be used for weather,
          chatbot and voice responses.
        </p>
      </div>
    </main>
  );
}
