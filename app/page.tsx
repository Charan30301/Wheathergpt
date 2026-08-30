"use client";

import { useState } from "react";
import { Globe2, Languages, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

const languages = [
  { code: "en", label: "English", native: "English" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", label: "Malayalam", native: "മലയാളം" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "es", label: "Spanish", native: "Español" },
  { code: "fr", label: "French", native: "Français" },
  { code: "de", label: "German", native: "Deutsch" },
  { code: "ja", label: "Japanese", native: "日本語" }
];

export default function Home() {
  const router = useRouter();
  const [selected, setSelected] = useState("en");

function continueToWeather() {
  localStorage.setItem("weathergpt-language", selected);
  router.push("/weather");
}

  return (
    <main className="language-shell">
      <div className="language-glow language-glow-one" />
      <div className="language-glow language-glow-two" />

      <section className="language-card">
        <div className="brand-mark">
          <Globe2 size={28} />
        </div>

        <p className="eyebrow">
          <Sparkles size={14} />
          AI WEATHER INTELLIGENCE
        </p>

        <h1>
          Weather<span>GPT</span>
        </h1>

        <p className="language-subtitle">
          Weather, maps, forecasts and an AI assistant — in your language.
        </p>

        <div className="language-heading">
          <Languages size={18} />
          <span>Choose your language</span>
        </div>

        <div className="language-grid">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => setSelected(language.code)}
              className={`language-option ${
                selected === language.code ? "selected" : ""
              }`}
            >
              <strong>{language.native}</strong>
              <small>{language.label}</small>
            </button>
          ))}
        </div>

        <button
          className="primary-button language-continue"
          onClick={continueToWeather}
        >
          Continue to WeatherGPT
        </button>
      </section>
    </main>
  );
}
