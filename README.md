# 🌐 EconPulse AI — Macroeconomic Intelligence & Youth Literacy Platform

**EconPulse AI** is an AI-powered economic intelligence and educational platform designed specifically for young people (ages 14–25) in Kazakhstan and Central Asia. It translates complex macroeconomic headlines ("Inflation surges", "Base rate hikes") into simple, highly personalized, and visual insights about their personal wallets, future salaries, and family budgets.

The platform aggregates real-time data from official institutional databases across **21 countries**, compares localized pricing metrics across Kazakhstan's major cities, and utilizes a cooperative network of specialized AI/statistical agents to provide conversational tutoring, long-term career planning, policy event simulations, and weekly household digests.

---

## 🎯 The Core Mission

Most students and teenagers in Central Asia hear financial news like:
- *“Инфляция өсті” (Inflation increased)*
- *“Базалық мөлшерлеме көтерілді” (Base rate increased)*

But they struggle to understand the micro-impact:
1. **Grocery & Rent Costs:** How much more will my family pay for food, utilities, and rent this month?
2. **Future Salary Value:** Will my future profession's salary keep up with inflation in 5–10 years?
3. **Savings & Credit Choices:** Should I open a tenge deposit, buy study courses now, or avoid taking out installments (rassrochka)?

**EconPulse AI** bridges this micro-to-macro disconnect by transforming complex policy metrics into visual, interactive simulators and actionable AI-driven financial roadmaps.

---

## 🤖 Cooperative Agent Architecture

EconPulse AI operates as a **Cooperative Multi-Agent Intelligence System** where specialized analytical and generative AI agents collaborate to explain personal wallet impacts:

```
                      ┌────────────────────────────────────────┐
                      │    Sovereign Data Sources (APIs)       │
                      │      (FRED, World Bank, OECD)          │
                      └──────────────────┬─────────────────────┘
                                         │
                                         ▼
                      ┌────────────────────────────────────────┐
                      │  [Agent 1] Data Orchestration Agent     │
                      │  - Handles fetch, cache & fallback     │
                      └──────────┬───────────────────┬─────────┘
                                 │                   │
                                 ▼                   ▼
      ┌──────────────────────────────────────┐     ┌──────────────────────────────────────┐
      │  [Agent 2] Statistical Anomaly Agent │     │    [Agent 3] AI Forecasting Agent    │
      │  - Computes global Z-Scores (1.6σ)   │     │    - Generates 3-month outlooks      │
      │  - Structures opportunities/risks  │     │    - Structures opportunities/risks  │
      └───────────────────┬──────────────────┘     └───────────────────┬──────────────────┘
                          │                                            │
                          ▼                                            ▼
                      ┌────────────────────────────────────────┐
                      │   [Agent 4] Personal Simulator Agent   │
                      │   - Ingests user micro-financial stats │
                      │   - Projects macro rate adjustments    │
                      └──────────────────┬─────────────────────┘
                                         │
                                         ▼
                      ┌────────────────────────────────────────┐
                      │  [Agent 5] Conversational Analyst      │
                      │  - Dashboard-aware Chatbot (Gemini)    │
                      │  - Translates macro terms for parents   │
                      └────────────────────────────────────────┘
```

### 1. Data Orchestration Agent
Manages external connections to FRED (U.S. Federal Reserve), World Bank, and OECD. Caches queries for 1 hour to prevent API rate exhaustion and handles mock fallbacks seamlessly.

### 2. Statistical Anomaly Agent
Calculates standard deviations and global Z-scores to identify statistical outliers (Z-score > $1.6\sigma$) across countries, prompting Gemini 2.5 Flash to generate streaming summaries explaining localized crises.

### 3. Personal Advisor Agent
Ingests demographic variables (age, city, interests, income) and outputs customized financial roadmaps, saving targets, and inflation shields tailored for young adults.

### 4. Career Projection Agent
Takes the user's profession and base salary, maps it against national inflation decay models, and projects 5–10 year nominal vs real targets. Provides strategic negotiation checklists.

### 5. Parent Mode Translation Agent
When Parent Mode is enabled, this agent translates technical financial indices into their household equivalents (e.g. CPI Inflation ➔ Groceries & Daily Purchases 🛒) and restricts AI chat dialogues to home budgeting advice.

---

## ✨ Interactive Feature Suite

### 1. 👤 My Economic Profile
- Custom onboarding wizard for teenagers and students (ages 14–25).
- Users input Age, City, Monthly Income, and select financial interests (Investing, Buying a Home, Starting a Business, Education Costs).
- Integrates current macroeconomic data to output a personalized **Gemini AI Financial Roadmap** with concrete action plans.

### 2. 🧮 "My Future Salary" Calculator
- Projects the erosion of a user's selected profession's salary over a 5 or 10-year period under inflation.
- Visualizes three paths using **Recharts Line Charts**:
  1. *Stagnant Nominal Salary* (purchasing power decay).
  2. *Inflation-Matching Salary* (minimum raise needed).
  3. *Career Target* (nominal salary with inflation + 3% real growth).
- Generates tailored raise negotiation tips based on the profession.

### 3. 🏔️ Kazakhstan City-Specific Data
- Compares typical prices (rent, public transport, utilities, milk, bread, gasoline) and average salaries across major Kazakhstani cities (*Almaty, Astana, Shymkent, Karaganda, Aktobe, Taraz, Pavlodar, Ust-Kamenogorsk*).
- Includes a **Relocation Optimizer** that calculates whether moving to another city makes financial sense after cost-of-living adjustments.

### 4. 🏦 "Before and After" Scenario Simulator
- Lets users simulate macroeconomic shocks: Interest Rate Hikes (+2.0%), Oil Price Crashes (-25%), Tax Cuts (-5%), and Import Supply Chain delays (+15%).
- Compares indicators side-by-side and displays a structural explainer mapping the policy's transmission pathway.

### 5. 👪 Persistent Parent Mode
- Toggled in the navigation bar to simplify the dashboard for household budgeters.
- Translates economic variables (CPI Inflation ➔ Grocery Costs 🛒, Interest Rate ➔ Mortgages & Loans Cost 🏠, GDP ➔ Job Security 💼).
- Modifies the floating AI chat adviser to speak in simple, family-friendly terms.

### 6. 📰 Weekly Report Generator
- Compiles the current macroeconomic environment into a stylized digital newspaper brief.
- Formulates wallet-impact checklists and weekly action challenges.
- Offers interactive email subscription forms and print/PDF download wrappers.

---

## 📡 Data Ingestion & Priority Sources

EconPulse AI prioritizes official national and international portals for economic telemetry:

| Priority | Source / Institution | Data Covered | Best For | Access Mode |
| :---: | --- | --- | --- | --- |
| **1** | **Bureau of National Statistics** (stat.gov.kz) | CPI Inflation, GDP, Unemployment, Regional Wages | Regional KZ indicators | Free Excel/PDF queries |
| **2** | **National Bank of Kazakhstan** (nationalbank.kz) | Base Interest Rate, inflation expectations | Interest rates & monetary policies | Free |
| **3** | **World Bank Open Data** | Historical GDP, Inflation, Unemployment | Long-term trends & global comparison | Free REST API |
| **4** | **OECD Data Explorer** | Consumer Confidence Index (CCI) | Household sentiment vectors | Free CSV/REST |
| **5** | **FRED** (Federal Reserve Bank of St. Louis) | US CPI, Federal Funds Rate, Housing indices | Monthly live US telemetry | API Key required |

---

## 🛠️ Technology Stack

- **Framework:** Next.js 16 (App Router, Turbopack, strict TypeScript)
- **Styling:** Tailwind CSS 4 + shadcn/ui components (dark theme, glassmorphism)
- **Charts:** Recharts 3 (animated line, bar, area charts)
- **Maps:** react-simple-maps + TopoJSON world atlas
- **AI Core:** Google Gemini 2.5 Flash (`@google/genai` SDK)
- **Animations:** Framer Motion 12 (smooth route switches, custom tabs, slider fades)

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
git clone https://github.com/shokkanuly/EconPulse-AI.git
cd econpulse-ai
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
# Required - powers profile, salary, weekly, and conversation advisers
GEMINI_API_KEY=your_gemini_api_key

# Optional - unlocks live monthly US data
FRED_API_KEY=your_fred_api_key
```

### 3. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** to explore the platform.

---

## 🌍 Supported Countries (21)

| Region | Countries |
| --- | --- |
| **Americas** | 🇺🇸 United States, 🇨🇦 Canada, 🇧🇷 Brazil, 🇲🇽 Mexico, 🇦🇷 Argentina |
| **Europe** | 🇬🇧 United Kingdom, 🇩🇪 Germany, 🇫🇷 France, 🇪🇸 Spain, 🇮🇹 Italy, 🇷🇺 Russia, 🇹🇷 Turkey |
| **Asia Pacific & Middle East** | 🇰🇿 **Kazakhstan**, 🇯🇵 Japan, 🇨🇳 China, 🇮🇳 India, 🇰🇷 South Korea, 🇦🇺 Australia, 🇮🇩 Indonesia, 🇸🇦 Saudi Arabia |
| **Africa** | 🇿🇦 South Africa |

---

## 📄 License
This project is licensed under the MIT License.
