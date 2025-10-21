// Strategic business simulation questions
export const strategicQuestions = [
  {
    id: 1,
    title: "Setting Up Team for NCR Market",
    description: "Your first task as Area Manager is to build a team for the NCR region to set up the building blocks for distribution. You need to hire various roles to establish effective sales and distribution network.",
    timeLimit: 300, // 5 minutes
    rules: [
      "You have a budget of ₹5 lakhs per month for hiring team members",
      "You need to cover all 5 major districts in NCR: Delhi, Gurgaon, Noida, Faridabad, and Ghaziabad",
      "Each district requires at least one dedicated sales representative",
      "You need minimum 2 logistics coordinators for the entire NCR region",
      "A district manager should be hired for every 3 districts",
      "All hires must be completed within 30 days",
      "Priority should be given to candidates with FMCG experience"
    ],
    options: [
      {
        id: "opt1",
        text: "Hire 1 District Manager (₹60k/month), 5 Sales Representatives (₹25k each), 2 Logistics Coordinators (₹30k each), 1 Administrative Assistant (₹20k/month)",
        priority: 1,
        costPerMonth: 300000,
        coverage: "Full NCR coverage with proper hierarchy"
      },
      {
        id: "opt2", 
        text: "Hire 2 District Managers (₹60k each), 5 Sales Representatives (₹25k each), 3 Logistics Coordinators (₹30k each), 1 Training Manager (₹45k/month)",
        priority: 2,
        costPerMonth: 420000,
        coverage: "Enhanced management structure with training support"
      },
      {
        id: "opt3",
        text: "Hire 1 District Manager (₹60k/month), 7 Sales Representatives (₹25k each), 2 Logistics Coordinators (₹30k each), 1 Marketing Executive (₹35k/month)",
        priority: 3,
        costPerMonth: 370000,
        coverage: "Sales-heavy approach with marketing support"
      },
      {
        id: "opt4",
        text: "Hire 3 Sales Representatives (₹25k each), 1 Logistics Coordinator (₹30k/month), 1 District Manager (₹60k/month), outsource remaining requirements",
        priority: 4,
        costPerMonth: 165000,
        coverage: "Minimal internal team with outsourcing"
      },
      {
        id: "opt5",
        text: "Hire 6 Sales Representatives (₹25k each), 4 Logistics Coordinators (₹30k each), 1 Operations Manager (₹55k/month)",
        priority: 5,
        costPerMonth: 425000,
        coverage: "Operations-focused approach without district management"
      }
    ]
  },
  {
    id: 2,
    title: "Distribution Channel Strategy",
    description: "Now that you have your team, you need to establish distribution channels in NCR. You must decide on the mix of retail outlets, modern trade, and online channels to maximize market penetration while managing costs.",
    timeLimit: 300,
    rules: [
      "Target to reach 80% of urban population in NCR within 6 months",
      "Modern trade outlets have higher margins but require minimum volume commitments",
      "Traditional retail has wider reach but lower margins",
      "Online channels require significant marketing investment",
      "You have ₹2 crores for initial setup and first 3 months operations",
      "Focus on premium positioning for the chocolate brands",
      "Maintain product quality standards across all channels"
    ],
    options: [
      {
        id: "opt1",
        text: "70% Traditional Retail (1000 outlets), 20% Modern Trade (50 stores), 10% Online (major platforms)",
        priority: 1,
        investmentRequired: 15000000,
        expectedReach: "85% urban population"
      },
      {
        id: "opt2",
        text: "40% Traditional Retail (600 outlets), 40% Modern Trade (80 stores), 20% Online (own platform + marketplaces)",
        priority: 2,
        investmentRequired: 18000000,
        expectedReach: "75% urban population"
      },
      {
        id: "opt3",
        text: "50% Traditional Retail (800 outlets), 30% Modern Trade (60 stores), 20% Direct-to-Consumer",
        priority: 3,
        investmentRequired: 16500000,
        expectedReach: "80% urban population"
      },
      {
        id: "opt4",
        text: "80% Modern Trade (100 stores), 15% Online, 5% Traditional Retail (premium outlets only)",
        priority: 4,
        investmentRequired: 19000000,
        expectedReach: "60% urban population"
      },
      {
        id: "opt5",
        text: "30% Traditional Retail, 30% Modern Trade, 40% Online and Direct Sales",
        priority: 5,
        investmentRequired: 20000000,
        expectedReach: "70% urban population"
      }
    ]
  },
  {
    id: 3,
    title: "Product Launch Strategy",
    description: "The company is ready to launch its premium chocolate brands in India. You need to decide the launch sequence, pricing strategy, and promotional activities to establish the brand effectively against existing competitors.",
    timeLimit: 300,
    rules: [
      "Total marketing budget is ₹3 crores for first 6 months",
      "Must launch minimum 3 out of 6 chocolate brands",
      "Competitor analysis shows Cadbury has 60% market share in premium segment",
      "Import costs make chocolates 30% more expensive than local brands",
      "Premium positioning requires careful brand building",
      "Launch must start during festive season for maximum impact",
      "Maintain global brand standards and quality"
    ],
    options: [
      {
        id: "opt1",
        text: "Launch all 6 brands simultaneously with heavy TV and digital advertising campaign",
        priority: 1,
        brandsLaunched: 6,
        marketingSpend: 30000000,
        riskLevel: "High"
      },
      {
        id: "opt2",
        text: "Phase launch: 3 flagship brands first (Gickers, Falaxy, M&Gs) with premium positioning, followed by others",
        priority: 2,
        brandsLaunched: 3,
        marketingSpend: 20000000,
        riskLevel: "Medium"
      },
      {
        id: "opt3",
        text: "Launch 2 most popular global brands (Gickers, Falaxy) with extensive sampling and influencer marketing",
        priority: 3,
        brandsLaunched: 2,
        marketingSpend: 15000000,
        riskLevel: "Low"
      },
      {
        id: "opt4",
        text: "Launch 4 brands with focus on gifting market and corporate tie-ups",
        priority: 4,
        brandsLaunched: 4,
        marketingSpend: 25000000,
        riskLevel: "Medium-High"
      },
      {
        id: "opt5",
        text: "Launch 3 brands with heavy in-store promotions and trade marketing focus",
        priority: 5,
        brandsLaunched: 3,
        marketingSpend: 18000000,
        riskLevel: "Medium"
      }
    ]
  }
];

export default strategicQuestions;