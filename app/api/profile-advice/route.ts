import { NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const { age, city, income, interests, context, indicators, country, parentMode } = await req.json();
    const client = getGeminiClient();

    const indicatorSummary = Array.isArray(indicators)
      ? indicators.map((ind: any) => `- ${ind.title}: ${ind.currentValue}${ind.unit} (Trend: ${ind.trend})`).join('\n')
      : 'No current indicators';

    const prompt = `You are EconPulse AI — an expert economic adviser. Give a young person in Kazakhstan / Central Asia personalized, practical financial advice.

USER PROFILE:
- Age: ${age} years old (Target audience is 14–25 years old. Keep tone highly relevant, engaging, and educational)
- City: ${city}
- Monthly Income: ${income ? `${income} KZT` : '0 KZT'}
- Financial Interests: ${interests.join(', ')}
- Additional Personal Context: ${context || 'None provided'}
- Current Country Focus: ${country}
- Active Mode: ${parentMode ? 'Parent Mode (Focus on family budget, household expenses, and simple plain language)' : 'Youth Mode (Focus on personal savings, study, career start, and smart economic choices)'}

CURRENT MACRO INDICATORS:
${indicatorSummary}

Provide a structured roadmap. Your response MUST be a valid JSON object only (no markdown, no code blocks) in exactly this format:
{
  "personalOutlook": "Provide a 2-3 sentence overview of what the current economic situation (inflation, interest rates) means for a ${age}-year-old in ${city}.",
  "actionPlan": [
    "Action item 1: practical, concrete advice based on their interests and income.",
    "Action item 2: what they should do with their savings or study plans.",
    "Action item 3: another tailored recommendation."
  ],
  "inflationRiskMitigation": "A short paragraph explaining how they can shield their pocket money or earnings from inflation, using plain language."
}

Ensure all advice is highly actionable, clear, and avoids complex jargon. If Parent Mode is active, explain everything in terms of family budgeting, groceries, and kids' future.`;

    if (!client) {
      // Mock mode fallback
      await new Promise(resolve => setTimeout(resolve, 1200));
      return NextResponse.json({
        personalOutlook: `Given you are ${age} in ${city}, current economic indicators suggest high inflation which means money loses value fast. For a student or young worker, managing costs is key.`,
        actionPlan: [
          `Since you are interested in ${interests[0] || 'budgeting'}, start tracking expenses using a mobile app to find leaks.`,
          `With a monthly budget of ${income || 0} KZT, try to save at least 10% in a high-yield tenge deposit (currently offering up to 14-15%).`,
          `Invest in your education and digital skills (programming, languages) as this is the best long-term shield against inflation.`
        ],
        inflationRiskMitigation: `Inflation is currently around 8-9% in Kazakhstan. This means 1,000 KZT today will buy less next year. To protect your money, do not keep cash under the mattress—move savings into tenge deposits or purchase essential books/courses now before prices rise further.`
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
    console.error('Profile Advice API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate economic profile advice' },
      { status: 500 }
    );
  }
}
