"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingDown, TrendingUp, Calculator } from "lucide-react";
import { EconomicIndicator } from "@/lib/api/mockData";

interface SimulatorProps {
  indicators: EconomicIndicator[];
}

export function Simulator({ indicators }: SimulatorProps) {
  // What-If State
  const [inflationDelta, setInflationDelta] = useState([0]);
  const [interestDelta, setInterestDelta] = useState([0]);

  // Personal State
  const [income, setIncome] = useState("5000");
  const [expenses, setExpenses] = useState("3500");
  const [impactResult, setImpactResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Helper to find latest value
  const getLatest = (id: string) => {
    const data = indicators.find(i => i.id === id)?.data;
    return data ? data[data.length - 1].value : 0;
  };

  const currentInflation = getLatest('inflation');
  const currentInterest = getLatest('interest');

  const calculateImpact = () => {
    setLoading(true);
    setTimeout(() => {
      const incomeNum = Number(income);
      const expensesNum = Number(expenses);
      
      const newInflation = currentInflation + inflationDelta[0];
      const newInterest = currentInterest + interestDelta[0];
      
      // Basic heuristic for hackathon demo
      const expenseIncrease = expensesNum * (newInflation / 100);
      const mortgageImpact = (expensesNum * 0.4) * (newInterest / 100); // assume 40% of expenses is mortgage/debt
      
      const newExpenses = expensesNum + expenseIncrease + mortgageImpact;
      const newSavings = incomeNum - newExpenses;
      const oldSavings = incomeNum - expensesNum;

      setImpactResult({
        expenseChange: newExpenses - expensesNum,
        newSavings,
        savingsChange: newSavings - oldSavings,
      });
      setLoading(false);
    }, 600); // simulate calculation/AI delay
  };

  return (
    <Card className="w-full mt-8 bg-card/50 backdrop-blur-xl border-border/50">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Calculator className="w-6 h-6 text-blue-500" />
          Interactive Economics Lab
        </CardTitle>
        <CardDescription>
          Adjust macroeconomic factors and see the direct impact on your personal finances.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="what-if" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="what-if">What-If Simulator</TabsTrigger>
            <TabsTrigger value="personal">Personal Impact</TabsTrigger>
          </TabsList>
          
          <TabsContent value="what-if" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Label className="text-base">Inflation Rate adjustment</Label>
                  <span className="font-mono text-sm text-muted-foreground">
                    {inflationDelta[0] > 0 ? '+' : ''}{inflationDelta[0]}%
                  </span>
                </div>
                <Slider 
                  defaultValue={[0]} max={10} min={-10} step={0.5} 
                  value={inflationDelta} onValueChange={setInflationDelta} 
                />
                <p className="text-xs text-muted-foreground">
                  Simulated Inflation: <span className="text-foreground font-semibold">{(currentInflation + inflationDelta[0]).toFixed(1)}%</span> (Current: {currentInflation}%)
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <Label className="text-base">Interest Rate adjustment</Label>
                  <span className="font-mono text-sm text-muted-foreground">
                    {interestDelta[0] > 0 ? '+' : ''}{interestDelta[0]}%
                  </span>
                </div>
                <Slider 
                  defaultValue={[0]} max={5} min={-5} step={0.25} 
                  value={interestDelta} onValueChange={setInterestDelta} 
                />
                <p className="text-xs text-muted-foreground">
                  Simulated Interest: <span className="text-foreground font-semibold">{(currentInterest + interestDelta[0]).toFixed(2)}%</span> (Current: {currentInterest}%)
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="personal" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Monthly Income ($)</Label>
                  <Input type="number" value={income} onChange={(e) => setIncome(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Monthly Expenses ($)</Label>
                  <Input type="number" value={expenses} onChange={(e) => setExpenses(e.target.value)} />
                </div>
                <Button onClick={calculateImpact} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  {loading ? (
                    <span className="animate-pulse flex items-center gap-2"><Sparkles className="w-4 h-4" /> Calculating AI Impact...</span>
                  ) : (
                    "Calculate Personal Impact"
                  )}
                </Button>
              </div>

              {impactResult && (
                <div className="bg-muted/30 p-6 rounded-xl border border-border/50 flex flex-col justify-center space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    Your Financial Forecast
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Extra Monthly Costs</span>
                    <span className="text-lg font-bold text-red-500 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      +${impactResult.expenseChange.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">New Monthly Savings</span>
                    <span className={`text-lg font-bold ${impactResult.newSavings > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      ${impactResult.newSavings.toFixed(2)}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground pt-4 border-t border-border/50">
                    Based on simulated inflation ({(currentInflation + inflationDelta[0]).toFixed(1)}%) and interest rates ({(currentInterest + interestDelta[0]).toFixed(2)}%).
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
