import { NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const { scenario, context, profile } = await req.json();
    const client = getGeminiClient();

    const scenarioText = {
      "rate-hike": "Interest Rate Hike (+2.0% base rate increase to fight inflation)",
      "oil-drop": "Global Oil Price Crash (-25% drop impacting exports and budget revenues)",
      "tax-cut": "Income Tax Relief (-5% tax cuts to boost consumption)",
      "supply-chain": "Import Supply Chain Delays (+15% transit and import price shocks)"
    }[scenario as string] || scenario;

    const prompt = `You are EconPulse AI — a macroeconomic shock simulation analyst.
Analyze how the following economic shock event will affect the user based on their personal situation and context.

SHOCK EVENT:
- Scenario: ${scenarioText}

USER PROFILE & CONTEXT:
- Name: ${profile?.name || 'Guest'}
- Age: ${profile?.age || '18'} years old
- City: ${profile?.city || 'Almaty'}
- Income/Allowance: ${profile?.income || '80000'} KZT
- Specific Family/Personal Context: ${context || 'None provided'}

Provide a structured, personalized impact assessment. Your response MUST be a valid JSON object only (no markdown, no code blocks) in exactly this format:
{
  "impactRating": "Negative | Neutral | Positive",
  "personalImpact": "A 2-sentence highly tailored description of how this shock affects them. Address them by name and reference their specific context (e.g. mortgage, student status, or saving plans) if provided.",
  "actionTip": "A specific action recommendation to mitigate the risk or capitalize on this scenario."
}

Ensure the tone is educational, encouraging, and extremely clear. Avoid jargon.`;

    if (!client) {
      // Mock fallback
      await new Promise(resolve => setTimeout(resolve, 800));
      
      let rating = "Neutral";
      let impact = `Under the ${scenarioText} scenario, economic changes will affect your purchasing power.`;
      let tip = "Monitor prices and keep a liquid cash buffer in tenge deposits.";

      if (scenario === "rate-hike") {
        rating = context?.toLowerCase().includes("mortgage") || context?.toLowerCase().includes("loan") ? "Negative" : "Neutral";
        impact = `Hi ${profile?.name || 'there'}! Since rates are rising, borrowing costs will spike. If your family has a variable mortgage, monthly payments will increase. For a ${profile?.age || '18'}-year old, saving accounts will yield higher returns (up to 15%), making it a great time to deposit tenge.`;
        tip = "Avoid new variable credit card loans. Move cash to fixed-rate tenge savings accounts.";
      } else if (scenario === "oil-drop") {
        rating = "Negative";
        impact = `A oil drop weakens the tenge. Imported tech items (phones, laptops) will become more expensive. If you are planning purchases in ${profile?.city || 'Almaty'}, buy essential electronics soon.`;
        tip = "Defer buying foreign luxury items and hold some savings in inflation-hedged tools.";
      } else if (scenario === "tax-cut") {
        rating = "Positive";
        impact = `The tax cut gives you more disposable income. For a budget of ${profile?.income || '80000'} KZT, this is a direct boost to your pocket. Spending will surge in ${profile?.city || 'Almaty'}, which helps businesses.`;
        tip = "Save the 5% tax difference instead of spending it immediately to build an emergency fund.";
      } else if (scenario === "supply-chain") {
        rating = "Negative";
        impact = `Import price shocks will increase grocery and food bills. Since your monthly income is ${profile?.income || '80000'} KZT, you will see a reduction in what you can buy daily.`;
        tip = "Buy local goods and staples in bulk before logistics delays push supermarket prices up.";
      }

      return NextResponse.json({
        impactRating: rating,
        personalImpact: impact,
        actionTip: tip
      });
    }

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const rawText = response.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Simulator Advice API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate shock simulation advice' },
      { status: 500 }
    );
  }
}
