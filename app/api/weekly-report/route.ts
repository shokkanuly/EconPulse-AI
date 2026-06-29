import { NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const { country, indicators, parentMode, userProfile } = await req.json();
    const client = getGeminiClient();

    const indicatorSummary = Array.isArray(indicators)
      ? indicators.map((ind: any) => `- ${ind.title}: ${ind.currentValue}${ind.unit} (Trend: ${ind.trend})`).join('\n')
      : 'No current indicators';

    const prompt = `You are EconPulse AI — a financial journalist writing a weekly economic digest.
A user in ${country === 'KAZ' ? 'Kazakhstan' : country} wants to know:
1. What happened in the macroeconomy this week?
2. How does it directly affect their budget?
3. What is one actionable thing they should do right now?

USER PROFILE DETAILS (for personalization):
- Name: ${userProfile?.name || 'Guest'}
- Age: ${userProfile?.age || '18'} years old
- City: ${userProfile?.city || 'Almaty'}
- Income/Allowance: ${userProfile?.income || '80000'} KZT
- Financial Interests: ${userProfile?.interests?.join(', ') || 'General budgeting'}
- Personal Context: ${userProfile?.context || 'None provided'}

CURRENT INDICATORS:
${indicatorSummary}

Active Mode: ${parentMode ? 'Parent Mode (Focus on family budget, milk, bread, utility bills, kids, simple terms)' : 'Youth Mode (Focus on allowance, cafe outings, tech purchases, student savings, coding skills)'}

Provide a structured briefing. Your response MUST be a valid JSON object only (no markdown, no code blocks) in exactly this format:
{
  "title": "A catchy weekly report title tailored to ${userProfile?.name || 'your'} summer/winter budget",
  "marketPulse": "A 2-sentence summary of the current economic environment using numbers from the indicators. Address them by name if appropriate.",
  "groceryImpact": "Explain in 1-2 sentences how the inflation trend affects daily purchases like food, cafes, or milk in their city of ${userProfile?.city || 'Almaty'}.",
  "creditImpact": "Explain in 1-2 sentences how current interest rates affect borrowing, credit cards, or their family mortgage context.",
  "savingsAdvice": "Explain in 1-2 sentences how they should store their savings this week, reflecting their income level of ${userProfile?.income || '80000'} KZT.",
  "actionItem": "One concrete micro-action for this week tailored to their interests (e.g. '${userProfile?.name || 'Review'} your subscriptions and cancel one to offset the inflation hike')."
}

Ensure all advice is highly actionable, clear, and avoids complex jargon. Personalize the response context using the user's city and goals.`;

    if (!client) {
      // Mock fallback
      await new Promise(resolve => setTimeout(resolve, 1000));
      return NextResponse.json({
        title: country === 'KAZ' ? 'Kazakhstan Weekly Pulse: Tenge Yields & Spending Buffers' : 'Weekly EconPulse Digest',
        marketPulse: `With inflation at ${indicators.find((i: any) => i.id === 'inflation')?.currentValue ?? '8.4'}% and interest rates at ${indicators.find((i: any) => i.id === 'interest')?.currentValue ?? '14.75'}%, the economy remains in a tight balancing act.`,
        groceryImpact: parentMode 
          ? "Grocery bills for milk, meat, and utilities remain elevated, squeezing household budgets."
          : "Your daily coffee or cafe lunch costs are creeping up. Consider packing a snack to save.",
        creditImpact: parentMode
          ? "Mortgages and auto loans remain expensive. Avoid taking on new debt until base rates decrease."
          : "Getting a new installment plan (Rassrochka) or credit card is expensive right now. Try to pay in cash.",
        savingsAdvice: "Store any excess savings in tenge bank deposits to capture the high interest rates.",
        actionItem: parentMode
          ? "Do a refrigerator audit: plan meals around existing items to save up to 15,000 ₸ on groceries this week."
          : "Review your streaming subscriptions and cancel one unused platform to immediately offset inflation."
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
    console.error('Weekly Report API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate weekly economic report' },
      { status: 500 }
    );
  }
}
