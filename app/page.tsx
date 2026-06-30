"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { RealIndicator } from "@/lib/api/fetchRealData";
import { COUNTRIES, computeHealthScore } from "@/lib/api/mockData";
import { EconomicChart } from "@/components/charts/EconomicChart";
import { AiChat } from "@/components/chat/AiChat";
import { Simulator } from "@/components/simulator/Simulator";
import { HealthScore } from "@/components/dashboard/HealthScore";
import { AiForecast } from "@/components/dashboard/AiForecast";
import { DataSourceLegend } from "@/components/dashboard/SourceBadge";
import { DataStatusBar } from "@/components/dashboard/DataStatusBar";
import { EconomicMap } from "@/components/map/EconomicMap";
import { KAZAKHSTAN_CITIES } from "@/lib/api/kazakhstanData";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// New Feature Components
import { EconomicProfile } from "@/components/dashboard/EconomicProfile";
import { FutureSalary } from "@/components/dashboard/FutureSalary";
import { CityData } from "@/components/dashboard/CityData";
import { BeforeAfterMode } from "@/components/dashboard/BeforeAfterMode";
import { WeeklyReport } from "@/components/dashboard/WeeklyReport";
import { HistoricalReview } from "@/components/dashboard/HistoricalReview";

// Localization Context
import { LanguageProvider, useTranslation } from "@/lib/LanguageContext";
import { translateCity } from "@/lib/translations";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Activity,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Globe,
  LayoutDashboard,
  User as UserIcon,
  Calculator as CalculatorIcon,
  MapPin as MapPinIcon,
  Landmark as LandmarkIcon,
  FileText as FileTextIcon,
  Sparkles,
  X,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CHART_CONFIG: Record<string, { type: "area" | "bar" | "line"; color: string }> = {
  inflation:    { type: "area",  color: "#ef4444" },
  unemployment: { type: "line",  color: "#f59e0b" },
  gdp:          { type: "bar",   color: "#10b981" },
  interest:     { type: "area",  color: "#8b5cf6" },
  confidence:   { type: "line",  color: "#06b6d4" },
  housing:      { type: "bar",   color: "#f472b6" },
};

type ViewTab = "dashboard" | "map" | "profile" | "salary" | "city" | "before-after" | "weekly" | "historical";

interface UserProfile {
  name: string;
  email: string;
  age: string;
  city: string;
  income: string;
  interests: string[];
  context: string;
  salaryProfession: string;
  salaryValue: string;
  salaryContext: string;
  simContext: string;
}

function TrendIcon({ trend }: { trend: "up" | "down" | "stable" }) {
  if (trend === "up")   return <TrendingUp   className="w-3 h-3 text-emerald-400" />;
  if (trend === "down") return <TrendingDown className="w-3 h-3 text-red-400" />;
  return                       <Minus        className="w-3 h-3 text-muted-foreground" />;
}

const REGIONS = Array.from(new Set(COUNTRIES.map(c => c.region)));

function adaptForComponents(indicators: RealIndicator[]) {
  return indicators.map(ind => ({ ...ind, source: ind.source as any }));
}

// Localized helper for country list
const translateCountryName = (code: string, name: string, lang: string) => {
  const dict: Record<string, Record<string, string>> = {
    KAZ: { ru: "Казахстан", kk: "Қазақстан" },
    USA: { ru: "США", kk: "АҚШ" },
    RUS: { ru: "Россия", kk: "Ресей" },
    DEU: { ru: "Германия", kk: "Германия" },
    GBR: { ru: "Великобритания", kk: "Ұлыбритания" },
    FRA: { ru: "Франция", kk: "Франция" },
    CHN: { ru: "Китай", kk: "Қытай" },
    JPN: { ru: "Япония", kk: "Жапония" },
    IND: { ru: "Индия", kk: "Үндістан" },
    BRA: { ru: "Бразилия", kk: "Бразилия" },
    CAN: { ru: "Канада", kk: "Канада" },
    AUS: { ru: "Австралия", kk: "Австралия" },
    KOR: { ru: "Южная Корея", kk: "Оңтүстік Корея" },
    MEX: { ru: "Мексика", kk: "Мексика" },
    ZAF: { ru: "ЮАР", kk: "ОАР" },
    TUR: { ru: "Турция", kk: "Түркия" },
    SAU: { ru: "Саудовская Аравия", kk: "Сауд Арабиясы" },
    ARG: { ru: "Аргентина", kk: "Аргентина" },
    IDN: { ru: "Индонезия", kk: "Индонезия" },
    ESP: { ru: "Испания", kk: "Испания" },
    ITA: { ru: "Италия", kk: "Италия" },
  };
  return dict[code]?.[lang] ?? name;
};

function AuthForm({ onSuccess, existingProfile }: { onSuccess: (p: UserProfile) => void; existingProfile: UserProfile | null }) {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const mockProfile: UserProfile = {
      name: name || existingProfile?.name || "Aibek Alimkhan",
      email: email || existingProfile?.email || "aibek@example.com",
      age: existingProfile?.age || "18",
      city: existingProfile?.city || "astana",
      income: existingProfile?.income || "350000",
      interests: existingProfile?.interests || ["budgeting", "education"],
      context: existingProfile?.context || "I want to study computer science in the US next year. Save enough to cover visa costs and flight tickets.",
      salaryProfession: existingProfile?.salaryProfession || "software-engineer",
      salaryValue: existingProfile?.salaryValue || "650000",
      salaryContext: existingProfile?.salaryContext || "Junior front-end engineer at a local startup in Astana Hub.",
      simContext: existingProfile?.simContext || "My family has a mortgage of 12 million tenge with a variable rate."
    };
    onSuccess(mockProfile);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center pb-2">
        <h3 className="text-lg font-bold">{isLogin ? t("auth.welcome") : t("auth.create")}</h3>
        <p className="text-xs text-muted-foreground mt-1">
          {isLogin ? t("auth.welcomeDesc") : t("auth.createDesc")}
        </p>
      </div>
      
      {!isLogin && (
        <div className="space-y-1.5">
          <Label htmlFor="auth-name">{t("auth.name")}</Label>
          <Input id="auth-name" type="text" placeholder="e.g. Aibek Alimkhan" value={name} onChange={(e) => setName(e.target.value)} required className="bg-muted/40" />
        </div>
      )}
      
      <div className="space-y-1.5">
        <Label htmlFor="auth-email">{t("auth.email")}</Label>
        <Input id="auth-email" type="email" placeholder="e.g. aibek@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-muted/40" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="auth-pass">{t("auth.password")}</Label>
        <Input id="auth-pass" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-muted/40" />
      </div>

      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-5 rounded-xl transition-all shadow-md">
        {isLogin ? t("auth.signInBtn") : t("auth.signUpBtn")}
      </Button>

      <div className="text-center text-xs text-muted-foreground pt-2">
        {isLogin ? t("auth.noAccount") : t("auth.hasAccount")}
        <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-blue-400 hover:underline cursor-pointer font-semibold bg-transparent border-none">
          {isLogin ? t("auth.signUpBtn") : t("auth.signInBtn")}
        </button>
      </div>
    </form>
  );
}

function DashboardContent() {
  const { t, language, setLanguage } = useTranslation();
  const [country, setCountry]       = useState("KAZ"); // Set Kazakhstan as default
  const [indicators, setIndicators] = useState<RealIndicator[]>([]);
  const [loading, setLoading]       = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");
  const [error, setError]           = useState<string | null>(null);
  const [view, setView]             = useState<ViewTab>("dashboard");
  const [parentMode, setParentMode] = useState<boolean>(false);

  // Global authenticated profile state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  // Load user profile on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem("econpulse_user_profile");
    if (savedProfile) {
      try {
        setUserProfile(JSON.parse(savedProfile));
      } catch (_) {}
    }
  }, []);

  const handleUpdateProfile = useCallback((updates: Partial<UserProfile>) => {
    setUserProfile((prev: any) => {
      const updated = prev ? { ...prev, ...updates } : {
        name: "Guest User",
        email: "guest@example.com",
        age: "18",
        city: "almaty",
        income: "150000",
        interests: [],
        context: "",
        salaryProfession: "software-engineer",
        salaryValue: "400000",
        salaryContext: "",
        simContext: "",
        ...updates
      };
      localStorage.setItem("econpulse_user_profile", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const fetchData = useCallback(async (c: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/economic-data?country=${c}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setIndicators(json.indicators ?? []);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } catch (err: any) {
      setError("Could not load economic data. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(country); }, [country, fetchData]);

  // When user clicks a country on the map → switch to dashboard
  const handleCountrySelect = (code: string) => {
    setCountry(code);
    setView("dashboard");
  };

  // Simplification wrapper for Parent Mode
  const getSimplifiedIndicator = useCallback((ind: RealIndicator) => {
    if (!parentMode) return ind;
    const translations: Record<string, { title: string; description: string }> = {
      inflation: { title: t("dashboard.groceryDaily"), description: t("dashboard.groceryDailyDesc") },
      unemployment: { title: t("dashboard.jobSecurity"), description: t("dashboard.jobSecurityDesc") },
      gdp: { title: t("dashboard.economyHealth"), description: t("dashboard.economyHealthDesc") },
      interest: { title: t("dashboard.mortgageCost"), description: t("dashboard.mortgageCostDesc") },
      confidence: { title: t("dashboard.familySentiment"), description: t("dashboard.familySentimentDesc") },
      housing: { title: t("dashboard.housingCost"), description: t("dashboard.housingCostDesc") },
    };
    const trans = translations[ind.id];
    if (trans) {
      return { ...ind, title: trans.title, description: trans.description };
    }
    return ind;
  }, [parentMode, t]);

  const countryInfo  = COUNTRIES.find(c => c.code === country);
  const countryLabel = countryInfo ? `${countryInfo.flag} ${translateCountryName(countryInfo.code, countryInfo.name, language)}` : country;

  // Process indicators through Parent Mode mapping if active
  const processedIndicators = useMemo(() => {
    return indicators.map(getSimplifiedIndicator);
  }, [indicators, getSimplifiedIndicator]);

  const adapted = useMemo(() => adaptForComponents(processedIndicators), [processedIndicators]);

  // Localized Frequency Labels
  const FREQ_LABEL: Record<string, string> = {
    monthly: t("dashboard.monthly"),
    quarterly: t("dashboard.quarterly"),
    annual: t("dashboard.annual"),
    simulated: t("dashboard.simulated"),
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-30 border-b border-border/40 bg-background/90 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg sm:text-xl tracking-tight">
              {t("nav.logo")} <span className="text-blue-500">{t("nav.logoAi")}</span>
            </span>
          </div>

          {/* Controls: Language + Parent Mode + Refresh + Country + Auth */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Language Dropdown Selector */}
            <Select value={language} onValueChange={(val) => { if (val) setLanguage(val as any); }}>
              <SelectTrigger className="w-[60px] sm:w-[85px] bg-muted/50 border-border/50 text-xs py-1 px-1.5 shrink-0 select-none">
                <div className="flex items-center justify-center gap-1">
                  <Globe className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                  <span className="hidden sm:inline uppercase font-bold">{language}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">🇬🇧 EN</SelectItem>
                <SelectItem value="ru">🇷🇺 RU</SelectItem>
                <SelectItem value="kk">🇰🇿 KK</SelectItem>
              </SelectContent>
            </Select>

            {/* Parent Mode Toggle */}
            <button
              onClick={() => setParentMode(!parentMode)}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer select-none shrink-0 ${
                parentMode
                  ? "bg-purple-600/10 border-purple-500/40 text-purple-300 shadow-sm"
                  : "bg-muted/40 border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
              title={t("nav.parentMode")}
            >
              <span>👪</span>
              <span className="hidden md:inline">{t("nav.parentMode")}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${parentMode ? "bg-purple-400 animate-pulse" : "bg-muted-foreground/30"}`} />
            </button>

            {lastUpdated && (
              <div className="hidden xl:flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span>{lastUpdated}</span>
              </div>
            )}
            
            <button
              onClick={() => fetchData(country)}
              disabled={loading}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors shrink-0"
              title={t("nav.refresh")}
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${loading ? "animate-spin" : ""}`} />
            </button>

            <Select value={country} onValueChange={(val) => { if (val) setCountry(val); }}>
              <SelectTrigger className="w-[105px] sm:w-[135px] bg-muted/50 border-border/50 text-xs sm:text-sm shrink-0">
                <SelectValue placeholder={t("nav.selectCountry")} />
              </SelectTrigger>
              <SelectContent className="max-h-[320px]">
                {REGIONS.map(region => (
                  <SelectGroup key={region}>
                    <SelectLabel className="text-xs">{region}</SelectLabel>
                    {COUNTRIES.filter(c => c.region === region).map(c => (
                      <SelectItem key={c.code} value={c.code}>
                        <span className="flex items-center gap-1 text-xs">
                          <span>{c.flag}</span>
                          <span className="truncate">{translateCountryName(c.code, c.name, language)}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>

            {/* User Profile Sync / Auth Widget */}
            {userProfile ? (
              <div className="flex items-center gap-1.5 ml-0.5 shrink-0">
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-600 flex items-center justify-center text-[10px] sm:text-xs font-bold text-white shadow-md cursor-pointer hover:bg-blue-500 transition-colors"
                  title={`Logged in as ${userProfile.name}`}
                >
                  {userProfile.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                </button>
                <button
                  onClick={() => {
                    setUserProfile(null);
                    localStorage.removeItem("econpulse_user_profile");
                  }}
                  className="hidden md:inline text-xs text-muted-foreground hover:text-red-400 transition-colors cursor-pointer border-none bg-transparent"
                >
                  {t("nav.logout")}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-xl border border-border/50 bg-muted/40 hover:bg-muted/70 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-all ml-0.5 shrink-0"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t("nav.signIn")}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Sub-navbar: Tabs ── */}
      <nav className="border-b border-border/20 bg-muted/20 backdrop-blur-md sticky top-16 z-20 overflow-x-auto scrollbar-none">
        <div className="container mx-auto px-4 flex gap-1.5 py-3">
          {[
            { id: "dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
            { id: "profile", label: t("nav.profile"), icon: UserIcon },
            { id: "salary", label: t("nav.salary"), icon: CalculatorIcon },
            { id: "city", label: t("nav.city"), icon: MapPinIcon },
            { id: "before-after", label: t("nav.beforeAfter"), icon: LandmarkIcon },
            { id: "weekly", label: t("nav.weekly"), icon: FileTextIcon },
            { id: "historical", label: t("nav.historical"), icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = view === tab.id || (tab.id === "dashboard" && view === "map");
            return (
              <button
                key={tab.id}
                onClick={() => setView(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-blue-600/10 border border-blue-500/30 text-blue-300 shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30 border border-transparent"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── Content ── */}
      <main className="flex-1">
        <AnimatePresence mode="wait">

          {/* ════════ DASHBOARD VIEW ════════ */}
          {view === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="container mx-auto px-4 py-8 space-y-6"
            >
              {/* Heading */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">
                    {parentMode ? t("dashboard.titleFamily") : t("dashboard.titleMacro")}
                  </h1>
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    {parentMode ? t("dashboard.descFamily") : t("dashboard.descMacro")}
                    <span className="text-foreground font-medium">{countryLabel}</span>
                  </p>
                </div>
                <DataSourceLegend />
              </div>

              {/* Welcome Greeting */}
              {userProfile && (
                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 flex gap-3 text-xs leading-relaxed text-blue-300">
                  <Sparkles className="w-5 h-5 shrink-0 text-blue-400 animate-pulse mt-0.5" />
                  <div>
                    <span className="font-bold">{t("dashboard.welcome", { name: userProfile.name })}</span>{" "}
                    {t("dashboard.profileSynced")}{" "}
                    {t("dashboard.ageLabel", {
                      age: userProfile.age,
                      city: translateCity(userProfile.city, language),
                      income: Number(userProfile.income).toLocaleString()
                    })}
                  </div>
                </div>
              )}

              {/* Parent Mode explanation alert */}
              {parentMode && (
                <div className="rounded-2xl border border-purple-500/25 bg-purple-500/5 p-4 flex gap-3 text-xs leading-relaxed text-purple-300">
                  <Sparkles className="w-5 h-5 shrink-0 text-purple-400 animate-pulse mt-0.5" />
                  <div>
                    {t("dashboard.parentModeActive")}
                  </div>
                </div>
              )}

              {/* Data Status Bar */}
              <DataStatusBar indicators={processedIndicators} loading={loading} />

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                  ⚠ {error}
                </div>
              )}

              {/* Stat Summary Row */}
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="h-24 rounded-xl bg-muted/20 border border-border/50 animate-pulse" />
                  ))}
                </div>
              ) : processedIndicators.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
                >
                  {processedIndicators.map((ind) => {
                    const config = CHART_CONFIG[ind.id] ?? { color: "#3b82f6" };
                    return (
                      <div
                        key={ind.id}
                        className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-3 flex flex-col justify-between h-[105px]"
                        style={{ borderTop: `2px solid ${config.color}` }}
                      >
                        <div className="text-xs text-muted-foreground font-semibold line-clamp-2">{ind.title}</div>
                        <div>
                          <div className="flex items-end gap-1">
                            <span className="text-lg font-bold animate-fadeIn" style={{ color: config.color }}>
                              {ind.currentValue.toFixed(ind.currentValue < 100 ? (ind.id === 'confidence' ? 0 : 1) : 0)}
                              <span className="text-sm font-normal text-muted-foreground">{ind.unit}</span>
                            </span>
                            <TrendIcon trend={ind.trend} />
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${ind.isRealData ? "bg-emerald-400" : "bg-amber-400"}`} />
                            <span className="text-[9px] text-muted-foreground/75">{FREQ_LABEL[ind.dataFrequency]}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}

              {/* Health Score + AI Forecast */}
              {!loading && processedIndicators.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                  <HealthScore indicators={adapted as any} country={countryLabel} />
                  <AiForecast indicators={adapted as any} country={countryLabel} />
                </motion.div>
              )}

              {/* Charts Grid */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="h-[300px] bg-muted/20 rounded-xl border border-border/50 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {processedIndicators.map((indicator, index) => {
                    const config = CHART_CONFIG[indicator.id] ?? { type: "area", color: "#3b82f6" };
                    return (
                      <motion.div
                        key={indicator.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                      >
                        <EconomicChart
                          title={indicator.title}
                          description={`${indicator.description}${!indicator.isRealData ? ` (${t("dashboard.estimated")})` : ""}`}
                          data={indicator.data}
                          unit={indicator.unit}
                          type={config.type}
                          color={config.color}
                          source={indicator.source as any}
                          isRealData={indicator.isRealData}
                          dataFrequency={indicator.dataFrequency}
                          lastPublished={indicator.lastPublished}
                        />
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Simulator */}
              {!loading && processedIndicators.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Simulator indicators={adapted as any} />
                </motion.div>
              )}

              {/* Teaser to open Map view */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                onClick={() => setView("map")}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border border-dashed border-border/60 text-muted-foreground hover:text-foreground hover:border-blue-500/40 hover:bg-blue-500/5 transition-all group cursor-pointer select-none"
              >
                <Globe className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
                <span className="text-sm font-medium">{t("dashboard.openMap")}</span>
                <span className="text-xs opacity-50">→ {t("dashboard.compareCountries")}</span>
              </motion.button>
            </motion.div>
          )}

          {/* ════════ MAP VIEW ════════ */}
          {view === "map" && (
            <motion.div
              key="map"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="container mx-auto px-4 py-8 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight mb-1">{t("dashboard.openMap")}</h1>
                  <p className="text-muted-foreground text-sm">
                    {t("dashboard.compareCountries")}
                  </p>
                </div>
                <button
                  onClick={() => setView("dashboard")}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border/50 bg-muted/40 hover:bg-muted/70 text-sm font-medium transition-colors shrink-0 cursor-pointer"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {t("nav.dashboard")}
                </button>
              </div>

              <EconomicMap
                selectedCountry={country}
                onCountrySelect={handleCountrySelect}
              />
            </motion.div>
          )}

          {/* ════════ PROFILE VIEW ════════ */}
          {view === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="container mx-auto px-4 py-8"
            >
              <EconomicProfile
                indicators={adapted as any}
                country={country}
                parentMode={parentMode}
                userProfile={userProfile}
                onUpdateProfile={handleUpdateProfile}
              />
            </motion.div>
          )}

          {/* ════════ SALARY VIEW ════════ */}
          {view === "salary" && (
            <motion.div
              key="salary"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="container mx-auto px-4 py-8"
            >
              <FutureSalary
                indicators={adapted as any}
                country={country}
                parentMode={parentMode}
                userProfile={userProfile}
                onUpdateProfile={handleUpdateProfile}
              />
            </motion.div>
          )}

          {/* ════════ CITY VIEW ════════ */}
          {view === "city" && (
            <motion.div
              key="city"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="container mx-auto px-4 py-8"
            >
              <CityData userProfile={userProfile} />
            </motion.div>
          )}

          {/* ════════ BEFORE & AFTER VIEW ════════ */}
          {view === "before-after" && (
            <motion.div
              key="before-after"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="container mx-auto px-4 py-8"
            >
              <BeforeAfterMode
                indicators={adapted as any}
                country={country}
                userProfile={userProfile}
                onUpdateProfile={handleUpdateProfile}
              />
            </motion.div>
          )}

          {/* ════════ WEEKLY VIEW ════════ */}
          {view === "weekly" && (
            <motion.div
              key="weekly"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="container mx-auto px-4 py-8"
            >
              <WeeklyReport
                indicators={adapted as any}
                country={country}
                parentMode={parentMode}
                userProfile={userProfile}
              />
            </motion.div>
          )}

          {/* ════════ HISTORICAL VIEW ════════ */}
          {view === "historical" && (
            <motion.div
              key="historical"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="container mx-auto px-4 py-8"
            >
              <HistoricalReview country={country} />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Auth Modal Overlay */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-card/95 border border-border/60 rounded-2xl shadow-2xl p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl" />
            <button
              onClick={() => setAuthModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 cursor-pointer border-none bg-transparent"
            >
              <X className="w-5 h-5" />
            </button>

            <AuthForm
              onSuccess={(profile) => {
                setUserProfile(profile);
                localStorage.setItem("econpulse_user_profile", JSON.stringify(profile));
                setAuthModalOpen(false);
              }}
              existingProfile={userProfile}
            />
          </motion.div>
        </div>
      )}

      {/* AI Chat */}
      <AiChat contextData={adapted} country={country} parentMode={parentMode} />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <LanguageProvider>
      <DashboardContent />
    </LanguageProvider>
  );
}
