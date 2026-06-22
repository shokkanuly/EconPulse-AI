"use client";

import { useEffect, useState } from "react";
import { getMockIndicators, EconomicIndicator } from "@/lib/api/mockData";
import { EconomicChart } from "@/components/charts/EconomicChart";
import { AiChat } from "@/components/chat/AiChat";
import { Simulator } from "@/components/simulator/Simulator";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Activity, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const [country, setCountry] = useState("USA");
  const [indicators, setIndicators] = useState<EconomicIndicator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getMockIndicators(country);
        setIndicators(data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [country]);

  // Map indicator IDs to specific chart types and colors for variety
  const chartConfig = {
    inflation: { type: "area" as const, color: "#ef4444" }, // red
    gdp: { type: "bar" as const, color: "#10b981" }, // emerald
    unemployment: { type: "line" as const, color: "#f59e0b" }, // amber
    interest: { type: "area" as const, color: "#8b5cf6" }, // violet
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">EconPulse <span className="text-blue-500">AI</span></span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Last updated: Just now</span>
            </div>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="w-[180px] bg-muted/50 border-0">
                <SelectValue placeholder="Select Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USA">United States</SelectItem>
                <SelectItem value="IND">India</SelectItem>
                <SelectItem value="GBR">United Kingdom</SelectItem>
                <SelectItem value="GLOBAL">Global Average</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Macroeconomic Dashboard</h1>
          <p className="text-muted-foreground">Real-time indicators and AI-powered insights for {country}.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[350px] bg-muted/20 rounded-xl border border-border/50"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {indicators.map((indicator, index) => {
              const config = chartConfig[indicator.id as keyof typeof chartConfig] || { type: "area", color: "#3b82f6" };
              
              return (
                <motion.div
                  key={indicator.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <EconomicChart 
                    title={indicator.title}
                    description={indicator.description}
                    data={indicator.data}
                    unit={indicator.unit}
                    type={config.type}
                    color={config.color}
                  />
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Simulators */}
        {!loading && indicators.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Simulator indicators={indicators} />
          </motion.div>
        )}
      </main>
      
      {/* AI Analyst Chat Widget */}
      <AiChat contextData={indicators} />
    </div>
  );
}
