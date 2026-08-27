"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const languages = [
  { code: "en", name: "English", native: "English" },
  { code: "hi", name: "Hindi", native: "हिंदी" },
  { code: "ta", name: "Tamil", native: "தமிழ்" },
  { code: "te", name: "Telugu", native: "తెలుగు" },
  { code: "bn", name: "Bengali", native: "বাংলা" },
  { code: "mr", name: "Marathi", native: "मराठी" },
  { code: "ml", name: "Malayalam", native: "മലയാളം" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી" },
];

export default function Home() {
  const router = useRouter();

  const [selected, setSelected] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const chooseLanguage = (code: string) => {
    setSelected(code);

    localStorage.setItem("weatherGPTLanguage", code);

    setIsTransitioning(true);

    setTimeout(() => {
      router.push("/weather");
    }, 900);
  };

  return (
    <main className="language-page">
      <div className="overlay" />

      <section
        className={`language-card ${
          isTransitioning ? "page-exit" : "page-enter"
        }`}
      >
        <div className="logo weather-float weather-glow">
          🌤️
        </div>

        <h1>WeatherGPT</h1>

        <p className="subtitle">
          Your intelligent weather assistant
        </p>

        <div className="language-box">
          <h2>🌐 Choose your language</h2>

          <p className="description">
            Select the language you want to use for WeatherGPT.
          </p>

          <div className="languages">
            {languages.map((language) => (
              <button
                key={language.code}
                className={`language-button ${
                  selected === language.code ? "selected" : ""
                }`}
                onClick={() => chooseLanguage(language.code)}
                disabled={isTransitioning}
              >
                <span>{language.native}</span>

                <small>{language.name}</small>

                <span className="arrow">→</span>
              </button>
            ))}
          </div>
        </div>

        <p className="bottom-text">
          Weather information, chatbot and voice assistant
          will use your selected language.
        </p>
      </section>

      {isTransitioning && (
        <div className="weather-transition">
          <div className="transition-glow"></div>
<div className="transition-orbit orbit-one"></div>
    <div className="transition-orbit orbit-two"></div>
          <div className="transition-content">
            <div className="transition-icon">🌍</div>

            <h2>WeatherGPT</h2>

            <p>Preparing your weather...</p>

            <div className="loading-line">
              <span></span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
