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
  { code: "hi", name: "Hindi", native: "हिंदी" },
  { code: "te", name: "Telugu", native: "తెలుగు" },
  { code: "ta", name: "Tamil", native: "தமிழ்" },
  { code: "bn", name: "Bengali", native: "বাংলা" },
  { code: "mr", name: "Marathi", native: "मराठी" },
  { code: "ml", name: "Malayalam", native: "മലയാളം" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી" },
];

const translations: Record<
  string,
  {
    title: string;
    subtitle: string;
    choose: string;
    description: string;
    continue: string;
    saved: string;
  }
> = {
  en: {
    title: "WeatherGPT",
    subtitle: "Your intelligent weather companion",
    choose: "Choose your language",
    description:
      "Select your preferred language. WeatherGPT will remember your choice for future visits.",
    continue: "Continue",
    saved: "Your language preference will be saved.",
  },

  hi: {
    title: "WeatherGPT",
    subtitle: "आपका बुद्धिमान मौसम सहायक",
    choose: "अपनी भाषा चुनें",
    description:
      "अपनी पसंदीदा भाषा चुनें। WeatherGPT आपकी पसंद को भविष्य के लिए याद रखेगा।",
    continue: "जारी रखें",
    saved: "आपकी भाषा की पसंद सहेजी जाएगी।",
  },

  te: {
    title: "WeatherGPT",
    subtitle: "మీ తెలివైన వాతావరణ సహాయకుడు",
    choose: "మీ భాషను ఎంచుకోండి",
    description:
      "మీకు ఇష్టమైన భాషను ఎంచుకోండి. WeatherGPT మీ ఎంపికను భవిష్యత్తు కోసం గుర్తుంచుకుంటుంది.",
    continue: "కొనసాగించండి",
    saved: "మీ భాష ఎంపిక సేవ్ చేయబడుతుంది.",
  },

  ta: {
    title: "WeatherGPT",
    subtitle: "உங்கள் புத்திசாலியான வானிலை உதவியாளர்",
    choose: "உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்",
    description:
      "உங்களுக்கு விருப்பமான மொழியைத் தேர்ந்தெடுக்கவும். WeatherGPT உங்கள் தேர்வை நினைவில் வைத்திருக்கும்.",
    continue: "தொடரவும்",
    saved: "உங்கள் மொழித் தேர்வு சேமிக்கப்படும்.",
  },

  bn: {
    title: "WeatherGPT",
    subtitle: "আপনার বুদ্ধিমান আবহাওয়া সহকারী",
    choose: "আপনার ভাষা নির্বাচন করুন",
    description:
      "আপনার পছন্দের ভাষা নির্বাচন করুন। WeatherGPT ভবিষ্যতের জন্য আপনার পছন্দ মনে রাখবে।",
    continue: "চালিয়ে যান",
    saved: "আপনার ভাষার পছন্দ সংরক্ষণ করা হবে।",
  },

  mr: {
    title: "WeatherGPT",
    subtitle: "तुमचा बुद्धिमान हवामान सहाय्यक",
    choose: "तुमची भाषा निवडा",
    description:
      "तुमची आवडती भाषा निवडा. WeatherGPT तुमची निवड भविष्यासाठी लक्षात ठेवेल.",
    continue: "पुढे जा",
    saved: "तुमची भाषा निवड जतन केली जाईल.",
  },

  ml: {
    title: "WeatherGPT",
    subtitle: "നിങ്ങളുടെ ബുദ്ധിമാനായ കാലാവസ്ഥാ സഹായി",
    choose: "നിങ്ങളുടെ ഭാഷ തിരഞ്ഞെടുക്കുക",
    description:
      "നിങ്ങളുടെ ഇഷ്ട ഭാഷ തിരഞ്ഞെടുക്കുക. WeatherGPT നിങ്ങളുടെ തിരഞ്ഞെടുപ്പ് ഓർമ്മയിൽ സൂക്ഷിക്കും.",
    continue: "തുടരുക",
    saved: "നിങ്ങളുടെ ഭാഷാ തിരഞ്ഞെടുപ്പ് സംരക്ഷിക്കും.",
  },

  gu: {
    title: "WeatherGPT",
    subtitle: "તમારો બુદ્ધિશાળી હવામાન સહાયક",
    choose: "તમારી ભાષા પસંદ કરો",
    description:
      "તમારી પસંદગીની ભાષા પસંદ કરો. WeatherGPT તમારી પસંદગી ભવિષ્ય માટે યાદ રાખશે.",
    continue: "ચાલુ રાખો",
    saved: "તમારી ભાષાની પસંદગી સાચવવામાં આવશે.",
  },
};

export default function HomePage() {
  const router = useRouter();

  const [selectedLanguage, setSelectedLanguage] = useState("en");

  useEffect(() => {
    const savedLanguage = localStorage.getItem("weatherGPTLanguage");

    if (savedLanguage && languages.some((l) => l.code === savedLanguage)) {
      setSelectedLanguage(savedLanguage);
    }
  }, []);

  const t = translations[selectedLanguage];

  const selectLanguage = (code: string) => {
    setSelectedLanguage(code);
  };

  const continueToWeather = () => {
    localStorage.setItem(
      "weatherGPTLanguage",
      selectedLanguage
    );

    router.push("/weather");
  };

  return (
    <main className="language-page page-enter">
      <div className="overlay" />

      <div className="language-card">
        <div className="logo weather-glow">🌤️</div>

        <h1>{t.title}</h1>

        <p className="subtitle">{t.subtitle}</p>

        <section className="language-box">
          <h2>{t.choose}</h2>

          <p className="description">{t.description}</p>

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
                <span>{language.native}</span>

                <small>{language.name}</small>

                <span className="arrow">
                  {selectedLanguage === language.code
                    ? "✓"
                    : "→"}
                </span>
              </button>
            ))}
          </div>

          <button
            className="continue-button"
            onClick={continueToWeather}
          >
            {t.continue} →
          </button>

          <p className="bottom-text">{t.saved}</p>
        </section>
      </div>
    </main>
  );
}
