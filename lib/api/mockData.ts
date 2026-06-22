export type DataPoint = {
  date: string;
  value: number;
};

export type EconomicIndicator = {
  id: string;
  title: string;
  description: string;
  unit: string;
  data: DataPoint[];
};

// Generate realistic mock data over a 12-month period
const generateData = (startVal: number, volatility: number, months: number = 12): DataPoint[] => {
  const data: DataPoint[] = [];
  let currentVal = startVal;
  
  const today = new Date();
  for (let i = months; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    data.push({
      date: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      value: Number(currentVal.toFixed(2))
    });
    // Random walk
    currentVal = currentVal + (Math.random() - 0.5) * volatility;
    if (currentVal < 0) currentVal = Math.max(0.1, currentVal); // keep positive
  }
  return data;
};

export const getMockIndicators = async (country: string = 'USA'): Promise<EconomicIndicator[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  if (country === 'USA') {
    return [
      {
        id: 'inflation',
        title: 'Inflation Rate (CPI)',
        description: 'Consumer Price Index for All Urban Consumers',
        unit: '%',
        data: generateData(3.2, 0.4)
      },
      {
        id: 'gdp',
        title: 'GDP Growth',
        description: 'Real Gross Domestic Product',
        unit: '%',
        data: generateData(2.1, 0.5) // GDP can be more volatile in this simple mock
      },
      {
        id: 'unemployment',
        title: 'Unemployment Rate',
        description: 'Unemployment Rate, Seasonally Adjusted',
        unit: '%',
        data: generateData(3.8, 0.2)
      },
      {
        id: 'interest',
        title: 'Interest Rate',
        description: 'Federal Funds Effective Rate',
        unit: '%',
        data: generateData(5.33, 0.1) // relatively stable recently
      }
    ];
  }

  // Generic fallback for other countries
  return [
    {
      id: 'inflation',
      title: 'Inflation Rate (CPI)',
      description: 'Consumer Price Index',
      unit: '%',
      data: generateData(5.0, 1.2)
    },
    {
      id: 'gdp',
      title: 'GDP Growth',
      description: 'Gross Domestic Product',
      unit: '%',
      data: generateData(1.5, 0.8)
    },
    {
      id: 'unemployment',
      title: 'Unemployment Rate',
      description: 'Total Unemployment',
      unit: '%',
      data: generateData(6.0, 0.4)
    },
    {
      id: 'interest',
      title: 'Interest Rate',
      description: 'Central Bank Rate',
      unit: '%',
      data: generateData(6.5, 0.5)
    }
  ];
};
