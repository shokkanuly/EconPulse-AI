"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EconomicIndicator } from "@/lib/api/mockData";
import { KAZAKHSTAN_PROFESSIONS } from "@/lib/api/kazakhstanData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Sparkles, TrendingUp, TrendingDown, DollarSign, Wallet, ShieldAlert, Award, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FutureSalaryProps {
  indicators: EconomicIndicator[];
  country: string;
  parentMode: boolean;
  userProfile?: any;
  onUpdateProfile?: (updates: any) => void;
}

export function FutureSalary({ indicators, country, parentMode, userProfile, onUpdateProfile }: FutureSalaryProps) {
  const [professionId, setProfessionId] = useState<string>("software-engineer");
  const [customProfession, setCustomProfession] = useState<string>("");
  const [salary, setSalary] = useState<string>("350000");
  const [context, setContext] = useState<string>("");
  const [period, setPeriod] = useState<number>(5); // 5 or 10 years
  const [advice, setAdvice] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state if userProfile changes
  useEffect(() => {
    if (userProfile) {
      if (userProfile.salaryProfession) setProfessionId(userProfile.salaryProfession);
      if (userProfile.salaryValue) setSalary(userProfile.salaryValue);
      if (userProfile.salaryContext !== undefined) setContext(userProfile.salaryContext);
    }
  }, [userProfile]);

  // Load from local storage
  useEffect(() => {
    if (!userProfile) {
      const savedProf = localStorage.getItem("econpulse_salary_prof");
      const savedCustomProf = localStorage.getItem("econpulse_salary_custom");
      const savedSal = localStorage.getItem("econpulse_salary_val");
      const savedPeriod = localStorage.getItem("econpulse_salary_period");
      const savedContext = localStorage.getItem("econpulse_salary_context");
      const savedAdvice = localStorage.getItem("econpulse_salary_advice");

      if (savedProf) setProfessionId(savedProf);
      if (savedCustomProf) setCustomProfession(savedCustomProf);
      if (savedSal) setSalary(savedSal);
      if (savedPeriod) setPeriod(Number(savedPeriod));
      if (savedContext) setContext(savedContext);
      if (savedAdvice) {
        try {
          setAdvice(JSON.parse(savedAdvice));
        } catch (_) {}
      }
    }
  }, [userProfile]);

  const inflationRate = useMemo(() => {
    const infInd = indicators.find((i) => i.id === "inflation");
    return infInd ? infInd.currentValue : 8.4;
  }, [indicators]);

  const currencySymbol = useMemo(() => {
    return country === "KAZ" ? "₸" : "$";
  }, [country]);

  // Update default salary when profession changes
  useEffect(() => {
    if (professionId !== "custom") {
      const selected = KAZAKHSTAN_PROFESSIONS.find((p) => p.id === professionId);
      if (selected) {
        setSalary(selected.averageSalary.toString());
      }
    }
  }, [professionId]);

  const professionName = useMemo(() => {
    if (professionId === "custom") return customProfession || "Selected Profession";
    return KAZAKHSTAN_PROFESSIONS.find((p) => p.id === professionId)?.name.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, "").trim() || "Selected Profession";
  }, [professionId, customProfession]);

  // Calculations for graph
  const chartData = useMemo(() => {
    const s = Number(salary) || 200000;
    const infDecimal = inflationRate / 100;
    const data = [];

    for (let year = 0; year <= period; year++) {
      // 1. Stagnant Real (Purchasing power decay of initial salary)
      const realPurchasingPower = s * Math.pow(1 - infDecimal, year);
      
      // 2. Inflation Adjusted (Nominal salary needed to retain initial purchasing power)
      const nominalNeeded = s * Math.pow(1 + infDecimal, year);
      
      // 3. Career Growth (Salary raising at inflation + 3% real growth annually)
      const careerGrowth = s * Math.pow(1 + infDecimal + 0.03, year);

      data.push({
        name: `Yr ${year}`,
        "Current Power (Decay)": Math.round(realPurchasingPower),
        "Inflation Match": Math.round(nominalNeeded),
        "Career Target (Ideal)": Math.round(careerGrowth),
      });
    }
    return data;
  }, [salary, inflationRate, period]);

  const currentPowerFinal = chartData[chartData.length - 1]["Current Power (Decay)"];
  const decayPercentage = Math.round(((Number(salary) - currentPowerFinal) / Number(salary)) * 100);

  const calculateSalaryAdvice = async () => {
    setLoading(true);
    setError(null);

    if (onUpdateProfile) {
      onUpdateProfile({
        salaryProfession: professionId,
        salaryValue: salary,
        salaryContext: context
      });
    } else {
      localStorage.setItem("econpulse_salary_prof", professionId);
      localStorage.setItem("econpulse_salary_custom", customProfession);
      localStorage.setItem("econpulse_salary_val", salary);
      localStorage.setItem("econpulse_salary_period", period.toString());
      localStorage.setItem("econpulse_salary_context", context);
    }

    try {
      const res = await fetch("/api/salary-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profession: professionName,
          salary: Number(salary),
          period,
          inflation: inflationRate,
          context,
          country,
          parentMode,
        }),
      });

      if (!res.ok) throw new Error("Failed to load salary roadmap");
      const data = await res.json();
      setAdvice(data);
      localStorage.setItem("econpulse_salary_advice", JSON.stringify(data));
    } catch (err) {
      setError("Unable to connect to Gemini AI. Showing offline recommendation.");
      const mockResult = {
        careerOutlook: `The profession of ${professionName} is highly subject to inflation rates in ${country}. Dynamic raises are essential to secure long term stability.`,
        purchasingPowerWarning: `At ${inflationRate}% inflation, your salary of ${salary} ${currencySymbol} will experience a ${decayPercentage}% loss in value over ${period} years.`,
        negotiationTips: [
          "Document your contributions (revenue earned, workload managed) before salary review.",
          "Target certifications or tools (AI assistance, cloud computing) that boost efficiency.",
          "Politely negotiate for an annual cost-of-living adjustment (COLA) indexed to the CPI inflation rate."
        ]
      };
      setAdvice(mockResult);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
      {/* Parameters Panel */}
      <div className="xl:col-span-4 space-y-6">
        <Card className="bg-card/50 backdrop-blur-xl border-border/50 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2 text-blue-400">
              <DollarSign className="w-5 h-5" />
              Salary & Inflation Setup
            </CardTitle>
            <CardDescription>
              Analyze how inflation impacts your purchasing power and project your career targets.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Profession select */}
            <div className="space-y-2">
              <Label>Profession</Label>
              <Select value={professionId} onValueChange={(val) => { if (val) setProfessionId(val); }}>
                <SelectTrigger className="bg-muted/40 border-border/60">
                  <SelectValue placeholder="Select Profession" />
                </SelectTrigger>
                <SelectContent>
                  {KAZAKHSTAN_PROFESSIONS.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Write custom profession...</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom profession input */}
            {professionId === "custom" && (
              <div className="space-y-2 animate-fadeIn">
                <Label htmlFor="custom-prof">Enter Profession Name</Label>
                <Input
                  id="custom-prof"
                  type="text"
                  placeholder="e.g. Graphic Designer"
                  value={customProfession}
                  onChange={(e) => setCustomProfession(e.target.value)}
                  className="bg-muted/40 border-border/60"
                />
              </div>
            )}

            {/* Current Salary */}
            <div className="space-y-2">
              <Label htmlFor="salary">Current Monthly Salary ({currencySymbol})</Label>
              <div className="relative">
                <Input
                  id="salary"
                  type="number"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  className="bg-muted/40 border-border/60 pr-12"
                />
                <span className="absolute right-4 top-2 text-xs font-semibold text-muted-foreground">{currencySymbol}</span>
              </div>
            </div>

            {/* Projection Period */}
            <div className="space-y-3">
              <Label>Forecast Period</Label>
              <div className="grid grid-cols-2 gap-2 bg-muted/30 p-1 rounded-xl border border-border/50">
                <button
                  onClick={() => setPeriod(5)}
                  className={`py-2 rounded-lg text-sm font-medium transition-all ${
                    period === 5 ? "bg-blue-600 text-white shadow-sm shadow-blue-900/20" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  5 Years
                </button>
                <button
                  onClick={() => setPeriod(10)}
                  className={`py-2 rounded-lg text-sm font-medium transition-all ${
                    period === 10 ? "bg-blue-600 text-white shadow-sm shadow-blue-900/20" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  10 Years
                </button>
              </div>
            </div>

            {/* Context Board */}
            <div className="space-y-2">
              <Label htmlFor="salary-context">Context Board (Job & company details)</Label>
              <textarea
                id="salary-context"
                rows={3}
                placeholder="e.g. I work as a junior frontend engineer at a local startup. My company usually adjusts wages for inflation by 5% every January."
                value={context}
                onChange={(e) => {
                  setContext(e.target.value);
                  if (onUpdateProfile) onUpdateProfile({ salaryContext: e.target.value });
                }}
                className="w-full bg-muted/40 border border-border/60 rounded-xl p-3 text-xs text-foreground focus:ring-blue-500 focus:border-blue-500 focus-visible:outline-none"
              />
            </div>

            {/* Micro economic context */}
            <div className="rounded-xl border border-border/50 bg-muted/10 p-3 flex flex-col gap-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Inflation:</span>
                <span className="text-foreground font-semibold">{inflationRate.toFixed(2)}%</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Data based on {country === "KAZ" ? "National Bank of Kazakhstan" : country} current index.
              </p>
            </div>

            <Button
              onClick={calculateSalaryAdvice}
              disabled={loading || !salary}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-6 rounded-xl transition-all shadow-lg shadow-blue-600/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Analyzing Career...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze with Gemini AI
                </>
              )}
            </Button>
            {error && <p className="text-xs text-amber-400 text-center">{error}</p>}
          </CardContent>
        </Card>
      </div>

      {/* Chart & Analysis Panel */}
      <div className="xl:col-span-8 space-y-6">
        <Card className="bg-card/50 border-border/50 shadow-xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2 text-blue-400">
              <Wallet className="w-5 h-5" />
              Inflation Impact & Target Trajectory
            </CardTitle>
            <CardDescription>
              How inflation erodes your base pay vs what you need to earn to maintain or grow purchasing power.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Visual Callout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 flex items-center gap-4">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Purchasing Power Decay</div>
                  <div className="text-lg font-bold text-red-400">
                    -{decayPercentage}% <span className="text-xs font-normal text-muted-foreground">value in {period} yrs</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-center gap-4">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Career Growth Target</div>
                  <div className="text-lg font-bold text-emerald-400">
                    {Math.round(chartData[chartData.length - 1]["Career Target (Ideal)"]).toLocaleString()} {currencySymbol}
                    <span className="text-xs font-normal text-muted-foreground">/mo target</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Chart */}
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis 
                    stroke="var(--muted-foreground)" 
                    fontSize={11} 
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "oklch(0.205 0 0)", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "12px" }}
                    formatter={(value) => [`${Number(value).toLocaleString()} ${currencySymbol}`]}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                  <Line
                    type="monotone"
                    dataKey="Career Target (Ideal)"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Inflation Match"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Current Power (Decay)"
                    stroke="#ef4444"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* AI Career Advice Section */}
        <AnimatePresence mode="wait">
          {advice && (
            <motion.div
              key="salary-advice"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-6"
            >
              {/* Outlook & Power Warning */}
              <div className="md:col-span-5 space-y-4">
                <Card className="bg-blue-950/20 border-blue-500/20 h-full">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 text-blue-300">
                      <Award className="w-4 h-4" />
                      Career Outlook
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-xs text-muted-foreground leading-relaxed">
                    <p>{advice.careerOutlook}</p>
                    <div className="rounded-xl border border-red-500/25 bg-red-500/5 p-3 flex gap-2">
                      <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      <p className="text-[11px] leading-relaxed text-red-300">
                        {advice.purchasingPowerWarning}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Negotiation tips */}
              <div className="md:col-span-7">
                <Card className="bg-card/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 text-emerald-400">
                      <Sparkles className="w-4 h-4" />
                      Gemini Career Advisor Plan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3.5">
                    {advice.negotiationTips && advice.negotiationTips.map((tip: string, idx: number) => (
                      <div key={idx} className="flex gap-2.5 items-start">
                        <div className="w-5 h-5 shrink-0 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-[10px] font-bold text-emerald-400 mt-0.5">
                          {idx + 1}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{tip}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
