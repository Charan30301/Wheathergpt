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
    subtitle: "Your intelligent weather assistant",
    choose: "Choose your language",
    description:
      "Get weather forecasts, warnings and weather information in your preferred language.",
    continue: "Continue",
    saved: "Your language will be remembered.",
  },

  hi: {
    title: "WeatherGPT",
    subtitle: "आपका बुद्धिमान मौसम सहायक",
    choose: "अपनी भाषा चुनें",
    description:
      "अपनी पसंदीदा भाषा में मौसम का पूर्वानुमान और चेतावनियां प्राप्त करें।",
    continue: "जारी रखें",
    saved: "आपकी भाषा याद रखी जाएगी।",
  },

  te: {
    title: "WeatherGPT",
    subtitle: "మీ తెలివైన వాతావరణ సహాయకుడు",
    choose: "మీ భాషను ఎంచుకోండి",
    description:
      "మీకు ఇష్టమైన భాషలో వాతావరణ సూచనలు మరియు హెచ్చరికలను పొందండి.",
    continue: "కొనసాగించండి",
    saved: "మీ భాష సేవ్ చేయబడుతుంది.",
  },

  ta: {
    title: "WeatherGPT",
    subtitle: "உங்கள் புத்திசாலியான வானிலை உதவியாளர்",
    choose: "உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்",
    description:
      "உங்களுக்கு விருப்பமான மொழியில் வானிலை முன்னறிவிப்புகள் மற்றும் எச்சரிக்கைகளைப் பெறுங்கள்.",
    continue: "தொடரவும்",
    saved: "உங்கள் மொழி நினைவில் வைக்கப்படும்.",
  },

  bn: {
    title: "WeatherGPT",
    subtitle: "আপনার বুদ্ধিমান আবহাওয়া সহকারী",
    choose: "আপনার ভাষা নির্বাচন করুন",
    description:
      "আপনার পছন্দের ভাষায় আবহাওয়ার পূর্বাভাস এবং সতর্কতা পান।",
    continue: "চালিয়ে যান",
    saved: "আপনার ভাষা সংরক্ষণ করা হবে।",
  },

  mr: {
    title: "WeatherGPT",
    subtitle: "तुमचा बुद्धिमान हवामान सहाय्यक",
    choose: "तुमची भाषा निवडा",
    description:
      "तुमच्या आवडत्या भाषेत हवामानाचा अंदाज आणि सूचना मिळवा.",
    continue: "पुढे जा",
    saved: "तुमची भाषा लक्षात ठेवली जाईल.",
  },

  ml: {
    title: "WeatherGPT",
    subtitle: "നിങ്ങളുടെ ബുദ്ധിമാനായ കാലാവസ്ഥാ സഹായി",
    choose: "നിങ്ങളുടെ ഭാഷ തിരഞ്ഞെടുക്കുക",
    description:
      "നിങ്ങളുടെ ഇഷ്ടഭാഷയിൽ കാലാവസ്ഥാ പ്രവചനങ്ങളും മുന്നറിയിപ്പുകളും നേടുക.",
    continue: "തുടരുക",
    saved: "നിങ്ങളുടെ ഭാഷ ഓർമ്മിക്കപ്പെടും.",
  },

  gu: {
    title: "WeatherGPT",
    subtitle: "તમારો બુદ્ધિશાળી હવામાન સહાયક",
    choose: "તમારી ભાષા પસંદ કરો",
    description:
      "તમારી પસંદગીની ભાષામાં હવામાનની આગાહી અને ચેતવણીઓ મેળવો.",
    continue: "ચાલુ રાખો",
    saved: "તમારી ભાષા યાદ રાખવામાં આવશે.",
  },
};

export default function HomePage() {
  const router = useRouter();

  const [selectedLanguage, setSelectedLanguage] = useState("en");

  useEffect(() => {
    const saved = localStorage.getItem("weatherGPTLanguage");

    if (saved && languages.some((language) => language.code === saved)) {
      setSelectedLanguage(saved);
    }
  }, []);

  const t = translations[selectedLanguage];

  const selectLanguage = (code: string) => {
    setSelectedLanguage(code);
localStorage.setItem("weatherGPTLanguage", code);
  router.push("/weather");
  };



  return (
    <main className="language-page page-enter">
      <div className="overlay" />

      <div className="language-card">
        <div className="logo">🌦️</div>

        <h1>{t.title}</h1>

        <p className="subtitle">{t.subtitle}</p>

        <div className="language-box">
          <h2>{t.choose}</h2>

          <p className="description">{t.description}</p>

          <div className="languages">
            {languages.map((language) => (
              <button
                key={language.code}
                className={`language-button ${
                  selectedLanguage === language.code ? "selected" : ""
                }`}
                onClick={() => selectLanguage(language.code)}
              >
                <span>{language.native}</span>

                <small>{language.name}</small>

                <span className="arrow">
                  {selectedLanguage === language.code ? "✓" : "→"}
                </span>
              </button>
            ))}
          </div>


          <p className="bottom-text">{t.saved}</p>
        </div>
      </div>
    </main>
  );
}
