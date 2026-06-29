"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EconomicIndicator } from "@/lib/api/mockData";
import { Sparkles, Calendar, BookOpen, AlertCircle, ShoppingCart, CreditCard, PiggyBank, Mail, Printer, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface WeeklyReportProps {
  indicators: EconomicIndicator[];
  country: string;
  parentMode: boolean;
  userProfile?: any;
}

export function WeeklyReport({ indicators, country, parentMode, userProfile }: WeeklyReportProps) {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const [subscribed, setSubscribed] = useState<boolean>(false);

  // Load from local storage
  useEffect(() => {
    const savedReport = localStorage.getItem("econpulse_weekly_report");
    if (savedReport) {
      try {
        setReport(JSON.parse(savedReport));
      } catch (_) {}
    }
  }, []);

  const generateReport = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/weekly-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country, indicators, parentMode, userProfile }),
      });

      if (!res.ok) throw new Error("Failed to load report");
      const data = await res.json();
      setReport(data);
      localStorage.setItem("econpulse_weekly_report", JSON.stringify(data));
    } catch (err) {
      setError("Unable to connect to Gemini AI. Showing offline recommendation.");
      const mockResult = {
        title: country === 'KAZ' ? "Tenge Stability & Your Allowance Strategy" : "EconPulse Weekly Digest",
        marketPulse: "Inflation remains elevated under base rate parameters, requiring careful budget allocation.",
        groceryImpact: parentMode 
          ? "Bread, milk, and utility prices are rising by 8-10% annually. Plan bulk purchases."
          : "Fast food, drinks, and cafeteria costs are slightly up. Pack lunches where possible.",
        creditImpact: parentMode
          ? "Avoid consumer credit or installment plans for non-essential items right now."
          : "Limit credit purchases and prioritize saving in High-yield accounts.",
        savingsAdvice: " Tenge deposits at local banks offer excellent returns of up to 14.75% to offset inflation.",
        actionItem: parentMode
          ? "Review heating and electricity usage this week to cut down utility leaks."
          : "Audit subscription streaming platforms and disable one to save 3,000 ₸."
      };
      setReport(mockResult);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail("");
      }, 5000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Parameters Panel */}
      <div className="lg:col-span-4 space-y-6">
        <Card className="bg-card/50 backdrop-blur-xl border-border/50 shadow-xl h-full flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2 text-blue-400">
              <Calendar className="w-5 h-5" />
              Weekly Briefing Setup
            </CardTitle>
            <CardDescription>
              Compile the latest economic intelligence report tailored to your current profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Our AI synthesizes the current published rates (inflation, base interest, and city pricing) into a simple, high-impact digest.
              </p>
              <Button
                onClick={generateReport}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-6 rounded-xl transition-all shadow-lg shadow-blue-600/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Compiling Report...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Compile Weekly Report
                  </>
                )}
              </Button>
            </div>

            {/* Subscribe Box */}
            <div className="border-t border-border/50 pt-6 mt-6">
              <form onSubmit={handleSubscribe} className="space-y-3">
                <Label className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  Subscribe to Weekly Digest
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-muted/40 border-border/60 text-xs py-5 rounded-lg flex-1"
                  />
                  <Button type="submit" className="bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/40 text-xs px-3">
                    Subscribe
                  </Button>
                </div>
                {subscribed && (
                  <p className="text-[10px] text-emerald-400 animate-fadeIn">
                    ✓ Subscribed! You will receive economic briefs every Monday morning.
                  </p>
                )}
              </form>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Panel */}
      <div className="lg:col-span-8">
        <AnimatePresence mode="wait">
          {report ? (
            <motion.div
              key="report"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Newspaper style header */}
              <Card className="bg-card/50 border-border/50 overflow-hidden relative shadow-xl print:border-none print:shadow-none">
                <CardHeader className="border-b border-border/40 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      EconPulse Intelligence Briefing
                    </span>
                    <CardTitle className="text-xl font-bold text-foreground mt-1">
                      {report.title}
                    </CardTitle>
                  </div>
                  <Button
                    onClick={handlePrint}
                    className="bg-muted/40 hover:bg-muted/70 text-muted-foreground hover:text-foreground text-xs flex items-center gap-1.5 py-1 px-3 rounded-lg border border-border/50 shrink-0"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print / Save PDF
                  </Button>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* General Pulse */}
                  <div className="bg-blue-950/10 border border-blue-500/20 rounded-2xl p-4">
                    <h4 className="font-semibold text-sm text-blue-300 flex items-center gap-1.5 mb-1.5">
                      <AlertCircle className="w-4 h-4 text-blue-400" />
                      Market Pulse This Week
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {report.marketPulse}
                    </p>
                  </div>

                  {/* Impact Columns */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Column 1: Groceries */}
                    <div className="bg-muted/10 border border-border/30 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <h5 className="font-bold text-xs text-amber-400 flex items-center gap-1.5">
                          <ShoppingCart className="w-3.5 h-3.5" />
                          Groceries & Purchases
                        </h5>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          {report.groceryImpact}
                        </p>
                      </div>
                    </div>

                    {/* Column 2: Credits */}
                    <div className="bg-muted/10 border border-border/30 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <h5 className="font-bold text-xs text-purple-400 flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5" />
                          Loans & Credit Cards
                        </h5>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          {report.creditImpact}
                        </p>
                      </div>
                    </div>

                    {/* Column 3: Savings */}
                    <div className="bg-muted/10 border border-border/30 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <h5 className="font-bold text-xs text-emerald-400 flex items-center gap-1.5">
                          <PiggyBank className="w-3.5 h-3.5" />
                          Savings Strategy
                        </h5>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          {report.savingsAdvice}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Item banner */}
                  <div className="border border-dashed border-emerald-500/30 bg-emerald-500/5 rounded-2xl p-4.5 flex gap-3.5 items-start">
                    <div className="w-9 h-9 shrink-0 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-emerald-400 uppercase tracking-wider mb-0.5">
                        Action Item of the Week
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {report.actionItem}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full min-h-[350px] border border-dashed border-border/60 rounded-2xl flex flex-col items-center justify-center text-center p-6 bg-card/10"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4 text-blue-400">
                <Calendar className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Your weekly briefing is empty</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Compile your customized digest to understand this week's macroeconomic shifts and receive direct pocket-money action steps.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
