import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { LANGUAGES } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";

interface LanguageContextValue {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<string, string>> = {
  en: {
    dashboard: "Dashboard",
    analyzeDocument: "Analyze Document",
    askJurisGuide: "Ask JurisGuide",
    myDocuments: "My Documents",
    legalTopics: "Legal Topics",
    courtReminders: "Court Reminders",
    profile: "Profile",
    logout: "Logout",
    goodMorning: "Good morning",
    howCanHelp: "How can JurisGuide help you today?",
    getStarted: "Get Started",
    exploreFeatures: "Explore Features",
  },
  hi: {
    dashboard: "डैशबोर्ड",
    analyzeDocument: "दस्तावेज़ विश्लेषण",
    askJurisGuide: "जुरिसगाइड से पूछें",
    myDocuments: "मेरे दस्तावेज़",
    legalTopics: "कानूनी विषय",
    courtReminders: "न्यायालय अनुस्मारक",
    profile: "प्रोफ़ाइल",
    logout: "लॉग आउट",
    goodMorning: "सुप्रभात",
    howCanHelp: "जुरिसगाइड आज आपकी कैसे मदद कर सकता है?",
    getStarted: "शुरू करें",
    exploreFeatures: "विशेषताएं देखें",
  },
  bn: {
    dashboard: "ড্যাশবোর্ড",
    analyzeDocument: "নথি বিশ্লেষণ",
    askJurisGuide: "জুরিসগাইডকে জিজ্ঞাসা করুন",
    myDocuments: "আমার নথি",
    legalTopics: "আইনি বিষয়",
    courtReminders: "আদালত অনুস্মারক",
    profile: "প্রোফাইল",
    logout: "লগ আউট",
    goodMorning: "সুপ্রভাত",
    howCanHelp: "জুরিসগাইড আজ আপনাকে কীভাবে সাহায্য করতে পারে?",
    getStarted: "শুরু করুন",
    exploreFeatures: "বৈশিষ্ট্য দেখুন",
  },
  ta: {
    dashboard: "டாஷ்போர்டு",
    analyzeDocument: "ஆவண பகுப்பாய்வு",
    askJurisGuide: "ஜுரிஸ்கைடிடம் கேளுங்கள்",
    myDocuments: "எனது ஆவணங்கள்",
    legalTopics: "சட்ட தலைப்புகள்",
    courtReminders: "நீதிமன்ற நினைவூட்டல்கள்",
    profile: "சுயவிவரம்",
    logout: "வெளியேறு",
    goodMorning: "காலை வணக்கம்",
    howCanHelp: "ஜுரிஸ்கைட் இன்று உங்களுக்கு எப்படி உதவ முடியும்?",
    getStarted: "தொடங்குங்கள்",
    exploreFeatures: "அம்சங்களை ஆராயுங்கள்",
  },
  te: {
    dashboard: "డాష్‌బోర్డ్",
    analyzeDocument: "పత్రం విశ్లేషణ",
    askJurisGuide: "జురిస్‌గైడ్‌ను అడగండి",
    myDocuments: "నా పత్రాలు",
    legalTopics: "న్యాయ అంశాలు",
    courtReminders: "న్యాయస్థానం అనుస్మారకాలు",
    profile: "ప్రొఫైల్",
    logout: "లాగ్ అవుట్",
    goodMorning: "శుభోదయం",
    howCanHelp: "జురిస్‌గైడ్ ఈ రోజు మీకు ఎలా సహాయం చేయగలదు?",
    getStarted: "ప్రారంభించండి",
    exploreFeatures: "ఫీచర్లను అన్వేషించండి",
  },
  mr: {
    dashboard: "डॅशबोर्ड",
    analyzeDocument: "दस्तऐवज विश्लेषण",
    askJurisGuide: "जुरिसगाईडला विचारा",
    myDocuments: "माझे दस्तऐवज",
    legalTopics: "कायदेशीर विषय",
    courtReminders: "न्यायालय आठवण",
    profile: "प्रोफाइल",
    logout: "लॉग आउट",
    goodMorning: "सुप्रभात",
    howCanHelp: "जुरिसगाईड आज तुमची कशी मदत करू शकतो?",
    getStarted: "सुरू करा",
    exploreFeatures: "वैशिष्ट्ये पाहा",
  },
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const [language, setLanguageState] = useState<string>(
    () => localStorage.getItem("jurisguide-language") || "en"
  );

  useEffect(() => {
    if (profile?.preferred_language) {
      setLanguageState(profile.preferred_language);
      localStorage.setItem("jurisguide-language", profile.preferred_language);
    }
  }, [profile?.preferred_language]);

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem("jurisguide-language", lang);
    if (profile) {
      supabase
        .from("profiles")
        .update({ preferred_language: lang })
        .eq("id", profile.id);
    }
  };

  const t = (key: string) => translations[language]?.[key] ?? translations.en[key] ?? key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

export { LANGUAGES };
