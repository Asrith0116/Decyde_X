require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const Groq = require('groq-sdk');
const crypto = require('crypto');
const multer = require('multer');
const pdf = require('pdf-parse');

const upload = multer({ storage: multer.memoryStorage() });
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const fs = require('fs');
const SIM_FILE = './simulations.json';

function hasGroqKey() {
  return typeof process.env.GROQ_API_KEY === 'string' && process.env.GROQ_API_KEY.trim().length > 0;
}

function fallbackAssessment({ track, mission }) {
  const missionText = String(mission || '');
  let geography = 'Local Region';
  if (/\b(india|delhi|mumbai|bengaluru|bangalore|hyderabad|chennai|kolkata|pune)\b/i.test(missionText)) geography = 'India';
  else if (/\b(usa|united states|new york|california|texas)\b/i.test(missionText)) geography = 'United States';
  else if (/\b(uk|united kingdom|london)\b/i.test(missionText)) geography = 'United Kingdom';

  const scopeScore =
    (missionText.length > 180 ? 2 : 0) +
    (/\b(national|global|multi[-\s]?city|enterprise|government)\b/i.test(missionText) ? 2 : 0) +
    (/\b(mvp|pilot|prototype|small|local)\b/i.test(missionText) ? -1 : 0);

  const initialCapital = Math.max(10000, Math.min(500000, 50000 + scopeScore * 25000));
  const burnRate = Math.max(500, Math.min(10000, 2500 + scopeScore * 750));

  return {
    style: 'Operator',
    reasoning: `Fallback mode (no GROQ key). Sector "${track}" calibrated from mission scope.`,
    geography,
    initialCapital,
    burnRate,
    credibleResearch: false,
    recommendations: [
      'Add 1–2 pages of problem/solution + target users.',
      'Define a measurable impact metric for week-to-week tracking.',
    ],
  };
}

function fallbackScenario({ venture, category }) {
  const week = venture.week || 1;
  
  const FALLBACK_DATA = {
    'Funding & Capital Strategy (investor pitch, bridge loan, grant application)': {
      title: 'Runway Extension Crisis',
      description: `Week ${week}: Your ${venture.track} startup is burning cash faster than expected in ${venture.geography}. You need to secure capital or cut costs to survive.`,
      options: [
        { label: 'Option A: Apply for an emergency bridge loan', capitalChange: 15000, impacts: { credits: 15000, communityTrust: -5, impactScore: 2 } },
        { label: 'Option B: Cut all non-essential staff and R&D', capitalChange: 25000, impacts: { credits: 25000, communityTrust: -10, impactScore: -8 } },
        { label: 'Option C: Pivot to a high-margin service model', capitalChange: 5000, impacts: { credits: 5000, communityTrust: 2, impactScore: 6 } },
        { label: 'Option D: Run a community equity crowdfunding campaign', capitalChange: 10000, impacts: { credits: 10000, communityTrust: 15, impactScore: 4 } },
      ],
      expertPreferred: 'Option D: Run a community equity crowdfunding campaign',
      expertReasoning: 'Community crowdfunding builds social capital and trust while providing necessary runway without aggressive layoffs.'
    },
    'Team & Talent Management (hiring, co-founder conflict, culture, attrition)': {
      title: 'Co-Founder Strategic Conflict',
      description: `Week ${week}: A major disagreement between your co-founders regarding the ${venture.track} roadmap is demoralizing the core team.`,
      options: [
        { label: 'Option A: Bring in an external mediator', capitalChange: -3000, impacts: { credits: -3000, communityTrust: 5, impactScore: 3 } },
        { label: 'Option B: Force a vote and pick one direction', capitalChange: 0, impacts: { credits: 0, communityTrust: -8, impactScore: 10 } },
        { label: 'Option C: Separate into two focused departments', capitalChange: -5000, impacts: { credits: -5000, communityTrust: 2, impactScore: 5 } },
        { label: 'Option D: Pause operations for one week of retreat', capitalChange: -8000, impacts: { credits: -8000, communityTrust: 12, impactScore: 2 } },
      ],
      expertPreferred: 'Option A: Bring in an external mediator',
      expertReasoning: 'Neutral mediation preserves the relationship and team morale while ensuring a structured resolution.'
    },
    'Regulatory & Legal Compliance (licenses, government policy, data law, IP)': {
      title: 'Data Privacy Audit',
      description: `Week ${week}: A new regulatory framework has been introduced in ${venture.geography} that affects how your ${venture.track} venture handles data.`,
      options: [
        { label: 'Option A: Redesign the architecture for compliance', capitalChange: -12000, impacts: { credits: -12000, communityTrust: 10, impactScore: 5 } },
        { label: 'Option B: Outsource data handling to a 3rd party', capitalChange: -7000, impacts: { credits: -7000, communityTrust: 2, impactScore: 0 } },
        { label: 'Option C: Delay compliance until the grace period ends', capitalChange: 0, impacts: { credits: 0, communityTrust: -15, impactScore: 8 } },
        { label: 'Option D: Lobby the government for an exemption', capitalChange: -5000, impacts: { credits: -5000, communityTrust: -5, impactScore: 3 } },
      ],
      expertPreferred: 'Option A: Redesign the architecture for compliance',
      expertReasoning: 'Building compliance into your core product creates a moat and builds long-term institutional trust.'
    },
    'Market Competition & Positioning (competitor entry, pricing war, differentiation)': {
      title: 'Aggressive Competitor Pivot',
      description: `Week ${week}: A larger competitor has launched a feature that replicates your ${venture.track} startup's core value proposition.`,
      options: [
        { label: 'Option A: Engage in a pricing war', capitalChange: -15000, impacts: { credits: -15000, communityTrust: -2, impactScore: 4 } },
        { label: 'Option B: Focus on a niche customer segment', capitalChange: -2000, impacts: { credits: -2000, communityTrust: 8, impactScore: 7 } },
        { label: 'Option C: Accelerate your next high-impact feature', capitalChange: -10000, impacts: { credits: -10000, communityTrust: 5, impactScore: 12 } },
        { label: 'Option D: Publish a public case for your mission', capitalChange: -1000, impacts: { credits: -1000, communityTrust: 18, impactScore: 3 } },
      ],
      expertPreferred: 'Option B: Focus on a niche customer segment',
      expertReasoning: 'Niches lead to riches; specializing in an underserved segment protects you from broad platform competition.'
    },
    'Community Trust & Stakeholder Relations (NGO partnership, media, user feedback)': {
      title: 'Local Community Backlash',
      description: `Week ${week}: A local advocacy group in ${venture.geography} claims your venture is ignoring indigenous needs or cultural norms.`,
      options: [
        { label: 'Option A: Appoint a community board lead', capitalChange: -4000, impacts: { credits: -4000, communityTrust: 20, impactScore: 8 } },
        { label: 'Option B: Release a public rebuttal document', capitalChange: -1000, impacts: { credits: -1000, communityTrust: -15, impactScore: 2 } },
        { label: 'Option C: Offer a percentage of profits to the group', capitalChange: -8000, impacts: { credits: -8000, communityTrust: 5, impactScore: 4 } },
        { label: 'Option D: Ignore the claims and focus on users', capitalChange: 0, impacts: { credits: 0, communityTrust: -25, impactScore: 10 } },
      ],
      expertPreferred: 'Option A: Appoint a community board lead',
      expertReasoning: 'Inclusion is better than defense. Giving stakeholders a seat at the table ensures long-term social license to operate.'
    },
    'Product-Market Fit & Pivot (feature validation, MVP iteration, user adoption)': {
      title: 'Low Retention Feedback',
      description: `Week ${week}: Your latest user data shows that while people sign up for your ${venture.track} tool, they rarely return after 48 hours.`,
      options: [
        { label: 'Option A: Interview 20 users personally', capitalChange: -1000, impacts: { credits: -1000, communityTrust: 12, impactScore: 6 } },
        { label: 'Option B: Add gamification and daily notifications', capitalChange: -6000, impacts: { credits: -6000, communityTrust: -5, impactScore: 2 } },
        { label: 'Option C: Rebuild the onboarding experience', capitalChange: -9000, impacts: { credits: -9000, communityTrust: 5, impactScore: 9 } },
        { label: 'Option D: Hard pivot to the most active sub-feature', capitalChange: -15000, impacts: { credits: -15000, communityTrust: 2, impactScore: 15 } },
      ],
      expertPreferred: 'Option A: Interview 20 users personally',
      expertReasoning: 'Data tells you what is happening; users tell you why. Qualitative insights are critical for the next iteration.'
    },
    'Operations & Supply Chain (vendor, logistics, quality control, tech debt)': {
      title: 'Critical Supply Chain Failure',
      description: `Week ${week}: Your primary vendor for ${venture.track} fulfillment in ${venture.geography} has declared bankruptcy.`,
      options: [
        { label: 'Option A: Bring operations in-house', capitalChange: -20000, impacts: { credits: -20000, communityTrust: 8, impactScore: 12 } },
        { label: 'Option B: Scramble to find a temporary supplier', capitalChange: -5000, impacts: { credits: -5000, communityTrust: -5, impactScore: 4 } },
        { label: 'Option C: Halt operations until a partner is found', capitalChange: 0, impacts: { credits: 0, communityTrust: -12, impactScore: -5 } },
        { label: 'Option D: Shift focus to purely digital services', capitalChange: -8000, impacts: { credits: -8000, communityTrust: 2, impactScore: 7 } },
      ],
      expertPreferred: 'Option B: Scramble to find a temporary supplier',
      expertReasoning: 'Maintaining service continuity is a priority, even at higher costs, to preserve existing customer trust.'
    },
    'Partnerships & Distribution (B2B deal, channel partner, government contract)': {
      title: 'Major Government Contract Delay',
      description: `Week ${week}: A key distribution partner has pushed their contract signing by 3 months, creating a massive pipeline gap.`,
      options: [
        { label: 'Option A: Pursue direct-to-consumer sales', capitalChange: -10000, impacts: { credits: -10000, communityTrust: 5, impactScore: 8 } },
        { label: 'Option B: Secure an interim private-sector deal', capitalChange: -4000, impacts: { credits: -4000, communityTrust: 2, impactScore: 5 } },
        { label: 'Option C: Cut active costs to wait out the delay', capitalChange: 12000, impacts: { credits: 12000, communityTrust: -8, impactScore: -2 } },
        { label: 'Option D: Offer the partner an equity incentive', capitalChange: 0, impacts: { credits: 0, communityTrust: -5, impactScore: 6 } },
      ],
      expertPreferred: 'Option B: Secure an interim private-sector deal',
      expertReasoning: 'Diversifying your revenue stream prevents over-reliance on a single large partner while maintaining growth.'
    }
  };

  const data = FALLBACK_DATA[category] || FALLBACK_DATA[Object.keys(FALLBACK_DATA)[0]];
  
  // Add small random noise to impacts to make it feel less pre-determined
  const randomizedOptions = data.options.map(opt => ({
    ...opt,
    impacts: {
      credits: Math.round(opt.impacts.credits * (0.95 + Math.random() * 0.1)),
      communityTrust: Math.round(opt.impacts.communityTrust + (Math.random() * 2 - 1)),
      impactScore: Math.round(opt.impacts.impactScore + (Math.random() * 2 - 1)),
    }
  }));

  return {
    title: data.title,
    description: data.description,
    expertPreferredChoiceLabel: data.expertPreferred,
    expertReasoning: data.expertReasoning,
    improvisationTips: [
      'Define a single metric you will improve this week.',
      'Communicate trade-offs clearly to stakeholders before executing.',
    ],
    options: randomizedOptions,
    _fallback: true,
  };
}

function fallbackSwotAnalysis({ venture }) {
  const isHighImpact = (venture.impactScore || 0) > 70;
  const isHighTrust = (venture.communityTrust || 0) > 70;
  const isHighCapital = (venture.credits || 0) > venture.startingCredits * 0.8;

  return {
    strengths: [
      isHighImpact ? "Strong social alignment and impact metrics" : "Resilient core mission despite scaling hurdles",
      isHighTrust ? "Deep community integration and stakeholder trust" : "Established initial user base in local market",
      isHighCapital ? "Excellent capital efficiency and runway management" : "Lean operations model with proven burn control",
      "Demonstrated adaptability through 10 weeks of market challenges"
    ],
    weaknesses: [
      !isHighImpact ? "Impact metrics lagging behind growth targets" : "High dependency on early-adopter feedback",
      !isHighTrust ? "Vulnerable stakeholder trust index" : "Limited brand awareness outside primary geography",
      !isHighCapital ? "Tight remaining runway for aggressive expansion" : "Under-optimized resource allocation in middle phases",
      "Institutional knowledge gaps in highly regulated sectors"
    ],
    opportunities: [
      "Expansion into adjacent regional markets in ${venture.geography}",
      "Potential for series A funding based on current traction",
      "Scaling impact through automated digital delivery systems",
      "Strategic partnerships with local government or NGOs"
    ],
    threats: [
      "New aggressive competitors entering the ${venture.track} space",
      "Potential regulatory shifts in ${venture.geography} privacy laws",
      "Macroeconomic pressure affecting local community spending",
      "Talent attrition as venture scales into more complex ops"
    ],
    documentationFeedback: venture.researchContent 
      ? "Your research context added significant depth to the simulation. Recommendation: Include more quantitative user data in future uploads." 
      : "No research context was provided. For next time, prepare a 1-page PDF summarizing your target market and local competitor analysis.",
    overallVerdict: `Your 10-week journey as a ${venture.founderStyle || 'Visionary'} founder shows ${isHighImpact ? 'exceptional' : 'solid'} potential. With a final Impact Score of ${venture.impactScore}%, your venture has established a meaningful footprint in ${venture.track}. Focus next on stabilizing your ${!isHighCapital ? 'cash flow' : 'community relations'} to ensure long-term viability.`
  };
}

function fallbackResourcePlan({ venture }) {
  const budget = venture.credits || 50000;
  
  const phaseData = [
    { name: "Phase 1: Product Stabilization", timeline: "Weeks 1-4", pct: 0.15, milestone: "Core platform hardened and bugs resolved" },
    { name: "Phase 2: Market Validation", timeline: "Weeks 5-12", pct: 0.20, milestone: "First 1,000 active daily users reached" },
    { name: "Phase 3: Team Expansion", timeline: "Months 4-6", pct: 0.30, milestone: "Key hires in Ops and Growth onboarding" },
    { name: "Phase 4: Geographic Scaling", timeline: "Months 7-12", pct: 0.25, milestone: "Expansion into second major city" },
    { name: "Phase 5: Series A Preparation", timeline: "Year 2", pct: 0.10, milestone: "Complete data package for institutional round" }
  ];

  const phases = phaseData.map(p => {
    const amount = Math.round(budget * p.pct);
    return {
      name: p.name,
      timeline: p.timeline,
      amount: amount,
      goal: `Successfully execute the ${p.name.toLowerCase()} milestone within budget.`,
      allocations: [
        { category: "Manpower", amount: Math.round(amount * 0.6) },
        { category: "Infrastructure", amount: Math.round(amount * 0.3) },
        { category: "Contingency", amount: Math.round(amount * 0.1) }
      ],
      milestones: [p.milestone, "Stakeholder alignment report completed"],
      successMetric: "Cost-to-benefit ratio within 1.2x of projections"
    };
  });

  return {
    executiveSummary: `A strategic 5-phase roadmap for deploying your final $${budget.toLocaleString()} capital into long-term growth.`,
    phases,
    successProjection: {
      marketReadiness: 72,
      fundingProbability: 65,
      breakEven: "Month 11"
    }
  };
}


function fallbackGovAnalysis({ venture }) {
  const track = venture.track || 'ImpactTech';
  const geo = venture.geography || 'Global';
  
  return {
    supportProbability: 62,
    governmentSentiment: "Positive",
    sentimentReasoning: `The government of ${geo} is currently prioritizing ${track} innovation to meet national development goals.`,
    regulatoryRisks: [
      "Ambiguity in early-stage data processing laws",
      "Potential licensing delays for sector-specific operations"
    ],
    supportOpportunities: [
      "National Innovation Fund for Social Impact",
      "Startup R&D Tax Incentive Scheme"
    ],
    legalDimensions: [
      { label: "Data Privacy", status: "caution", detail: "General data protection rules apply; audit required." },
      { label: "Labor Laws", status: "compliant", detail: "Standard employment contracts are within legal limits." },
      { label: "Corporate Gov", status: "neutral", detail: "Standard incorporation filings are up to date." },
      { label: "IP Protection", status: "caution", detail: "Patent filing recommended for core ${track} tech." },
      { label: "Market Regs", status: "risk", detail: "New market entry rules pending in ${geo}." },
      { label: "Tax & Ethics", status: "compliant", detail: "Ethical guidelines align with ESG standards." }
    ],
    policyAlignment: 8,
    policyNote: "High alignment with digital transformation priorities.",
    keyActions: [
      "Register for the national startup database",
      "Assign a compliance lead for data privacy",
      "Apply for the Innovation Grant within 30 days"
    ]
  };
}
let activeSimulations = new Map();
try {
  if (fs.existsSync(SIM_FILE)) {
    const data = JSON.parse(fs.readFileSync(SIM_FILE, 'utf8'));
    activeSimulations = new Map(Object.entries(data));
    console.log(`📂 Loaded ${activeSimulations.size} simulations from disk.`);
  }
} catch (err) {
  console.error('Failed to load simulations:', err);
}

const saveSims = () => {
  try {
    fs.writeFileSync(SIM_FILE, JSON.stringify(Object.fromEntries(activeSimulations)), 'utf8');
  } catch (err) {
    console.error('Failed to save simulations:', err);
  }
};

// Health Check
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    engine: 'ImpactSim Engine v7',
    memory: process.memoryUsage().heapUsed,
    simulations: activeSimulations.size,
    hasKey: !!process.env.GROQ_API_KEY
  });
});

app.get('/api/test-groq', async (req, res) => {
  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'Say "hello world" in a JSON object with a "message" field.' }],
      model: 'llama-3.1-8b-instant',
      response_format: { type: 'json_object' }
    });
    res.json({ success: true, response: JSON.parse(completion.choices[0].message.content) });
  } catch (err) {
    console.error('GROQ TEST FAILURE:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected'));
});

// ── Research Upload: accepts PDF + images (up to 5 files) ──────────────────
app.post('/api/upload-research', upload.array('files', 5), async (req, res) => {
  if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No files uploaded' });

  try {
    let combinedText = '';

    for (const file of req.files) {
      const mime = file.mimetype;

      if (mime === 'application/pdf') {
        const data = await pdf(file.buffer);
        combinedText += `\n[PDF: ${file.originalname}]\n${data.text.slice(0, 4000)}\n`;
      } else if (mime.startsWith('image/')) {
        // Use vision model to describe image content
        const base64 = file.buffer.toString('base64');
        try {
          const imgCompletion = await groq.chat.completions.create({
            model: 'llama-3.2-11b-vision-preview',
            messages: [{
              role: 'user',
              content: [
                { type: 'text', text: 'Describe this image in the context of a startup or research document. Extract any key text, data, diagrams, or relevant business information visible.' },
                { type: 'image_url', image_url: { url: `data:${mime};base64,${base64}` } }
              ]
            }],
            max_tokens: 800
          });
          combinedText += `\n[Image: ${file.originalname}]\n${imgCompletion.choices[0].message.content}\n`;
        } catch (imgErr) {
          console.error(`Error processing image ${file.originalname}:`, imgErr);
          combinedText += `\n[Image: ${file.originalname}] — Image attached (content extraction skipped)\n`;
        }
      }
    }

    res.json({ text: combinedText.slice(0, 10000), fileCount: req.files.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'File processing failed.' });
  }
});

// ── Founder Assessment & Venture Init ─────────────────────────────────────
app.post('/api/assess-founder', async (req, res) => {
  const { track, mission, researchContent = '' } = req.body;
  if (!track || !mission) return res.status(400).json({ error: 'Missing data.' });

  try {
    if (!hasGroqKey()) {
      const assessment = fallbackAssessment({ track, mission });
      const ventureId = crypto.randomUUID();
      const ventureData = {
        ventureId, track, mission, researchContent,
        geography: assessment.geography,
        founderStyle: assessment.style,
        credits: assessment.initialCapital || 50000,
        startingCredits: assessment.initialCapital || 50000,
        burnRate: assessment.burnRate || 2500,
        communityTrust: 50,
        impactScore: 0,
        week: 1, history: [], xp: 0
      };
      activeSimulations.set(ventureId, ventureData);
      saveSims();
      return res.json({ ...assessment, ventureId, _fallback: true });
    }

    const prompt = `You are a senior venture analyst. Analyze this startup:
Mission: "${mission}"
Sector: "${track}"
Research Context (uploaded documents/images): """${researchContent.slice(0, 3000)}"""

Tasks:
1. Identify the likely Geography focus (City/Country).
2. Assess Founder Leadership Style: Visionary, Operator, or Advocate.
3. Calculate appropriate Initial Capital ($10,000–$500,000) and Weekly Burn Rate ($500–$10,000) based on scope, geography, and research depth.
4. Note if the research context adds credibility (credibleResearch: true/false).

JSON only:
{
  "style": "...",
  "reasoning": "one sentence",
  "geography": "City, Country",
  "initialCapital": 50000,
  "burnRate": 2500,
  "credibleResearch": false,
  "recommendations": ["...", "..."]
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a professional venture analyst. Output strict JSON.' },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.1-8b-instant',
      response_format: { type: 'json_object' }
    });

    const assessment = JSON.parse(completion.choices[0].message.content);
    const ventureId = crypto.randomUUID();
    const ventureData = {
      ventureId, track, mission, researchContent,
      geography: assessment.geography,
      founderStyle: assessment.style,
      credits: assessment.initialCapital || 50000,
      startingCredits: assessment.initialCapital || 50000,
      burnRate: assessment.burnRate || 2500,
      communityTrust: 50,
      impactScore: 0,
      week: 1, history: [], xp: 0
    };
    activeSimulations.set(ventureId, ventureData);
    saveSims();
    res.json({ ...assessment, ventureId });
  } catch (err) {
    console.error('Assess Founder Error:', err);
    res.status(500).json({ error: 'Venture calibration failed.', message: err.message });
  }
});

// ── Generate Scenario ──────────────────────────────────────────────────────
app.post('/api/generate-scenario', async (req, res) => {
  const { ventureId } = req.body;
  const venture = activeSimulations.get(ventureId);
  if (!venture) return res.status(404).json({ error: 'Venture not found' });

  // 8 distinct scenario categories — each week pulls from a different one
  const SCENARIO_CATEGORIES = [
    'Funding & Capital Strategy (investor pitch, bridge loan, grant application)',
    'Team & Talent Management (hiring, co-founder conflict, culture, attrition)',
    'Regulatory & Legal Compliance (licenses, government policy, data law, IP)',
    'Market Competition & Positioning (competitor entry, pricing war, differentiation)',
    'Community Trust & Stakeholder Relations (NGO partnership, media, user feedback)',
    'Product-Market Fit & Pivot (feature validation, MVP iteration, user adoption)',
    'Operations & Supply Chain (vendor, logistics, quality control, tech debt)',
    'Partnerships & Distribution (B2B deal, channel partner, government contract)',
  ];
  const usedWeeks = venture.history.length;
  const nextCategory = SCENARIO_CATEGORIES[usedWeeks % SCENARIO_CATEGORIES.length];

  try {
    if (!hasGroqKey()) {
      return res.json(fallbackScenario({ venture, category: nextCategory }));
    }

    const prevTitles = venture.history.map(h => `"${h.scenarioTitle}"`).join(', ');
    const prevTypes  = venture.history.map((_, i) => SCENARIO_CATEGORIES[i % SCENARIO_CATEGORIES.length]).join(', ');
    const prompt = `You are the Market Reality Engine for a ${venture.track} startup in ${venture.geography}.
Mission: "${venture.mission}" | Week: ${venture.week}/10
Funds: $${venture.credits} | Community Trust: ${venture.communityTrust}% | Impact Score: ${venture.impactScore}%
Research Context: ${venture.researchContent ? venture.researchContent.slice(0, 800) : 'None provided'}

Already used titles: [${prevTitles || 'none'}]
Previously covered scenario types: [${prevTypes || 'none'}]

THIS WEEK'S MANDATORY CATEGORY: "${nextCategory}"
You MUST create a scenario specifically about: ${nextCategory}
Do NOT generate scenarios about: ${prevTypes || 'N/A'}
Do NOT use any of these titles or similar concepts: [${prevTitles || 'none'}]

Generate a highly realistic, sector-specific challenge for Week ${venture.week}.
The scenario must escalate in complexity from previous weeks.
Provide exactly 4 options with DIFFERENT strategies (not just variations of the same idea).
Each option must have meaningfully different capital impact (range: -$15000 to +$20000).
Identify the EXPERT-preferred option with clear reasoning.

JSON:
{
  "title": "4-word scenario title",
  "description": "2-3 sentence realistic scenario in ${venture.geography} context",
  "expertPreferredChoiceLabel": "exact label of best option",
  "expertReasoning": "why this is the expert move (1-2 sentences)",
  "improvisationTips": ["tactical tip 1", "tactical tip 2"],
  "options": [
    {
      "label": "Option A: specific action description (max 15 words)",
      "capitalChange": 5000,
      "capitalReason": "Specific reason capital changes by this exact amount",
      "impacts": { "credits": 5000, "communityTrust": 5, "impactScore": 3 }
    },
    {
      "label": "Option B: different strategic approach (max 15 words)",
      "capitalChange": -3000,
      "capitalReason": "Specific reason capital changes by this exact amount",
      "impacts": { "credits": -3000, "communityTrust": 8, "impactScore": 5 }
    },
    {
      "label": "Option C: conservative/safe approach (max 15 words)",
      "capitalChange": 1000,
      "capitalReason": "Specific reason capital changes by this exact amount",
      "impacts": { "credits": 1000, "communityTrust": 2, "impactScore": 1 }
    },
    {
      "label": "Option D: bold/risky approach (max 15 words)",
      "capitalChange": -8000,
      "capitalReason": "Specific reason capital changes by this exact amount",
      "impacts": { "credits": -8000, "communityTrust": -5, "impactScore": 10 }
    }
  ]
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a realistic startup simulation engine. Output strict JSON.' },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.1-8b-instant',
      response_format: { type: 'json_object' }
    });
    res.json(JSON.parse(completion.choices[0].message.content));
  } catch (err) {
    console.error(err);
    res.json(fallbackScenario({ venture, category: nextCategory }));
  }
});

// ── Update Venture State ───────────────────────────────────────────────────
app.post('/api/update-venture', (req, res) => {
  const { ventureId, updates } = req.body;
  const venture = activeSimulations.get(ventureId);
  if (!venture) return res.status(404).send();
  if (updates.historyEntry) {
    venture.history.push(updates.historyEntry);
    delete updates.historyEntry;
  }
  const updated = { ...venture, ...updates };
  activeSimulations.set(ventureId, updated);
  saveSims();
  res.json(updated);
});

// ── Register / Rehydrate Venture from Client ───────────────────────────────
app.post('/api/register-venture', (req, res) => {
  const incoming = req.body;
  if (!incoming || !incoming.ventureId) {
    return res.status(400).json({ error: 'Missing venture data' });
  }
  const history = Array.isArray(incoming.history) ? incoming.history : [];
  const weekRaw = Number(incoming.week);
  const week = Number.isFinite(weekRaw) ? Math.max(1, Math.min(11, Math.floor(weekRaw))) : 1;
  const normalized = {
    ...incoming,
    week,
    history,
    xp: incoming.xp || 0,
    credits: incoming.credits || incoming.startingCredits || 50000,
    burnRate: incoming.burnRate || 2500,
    communityTrust: incoming.communityTrust ?? 50,
    impactScore: incoming.impactScore ?? 0,
  };
  activeSimulations.set(normalized.ventureId, normalized);
  saveSims();
  res.json({ ok: true, simulations: activeSimulations.size });
});

// ── Custom Strategy Evaluation ─────────────────────────────────────────────
app.post('/api/evaluate-custom-decision', async (req, res) => {
  const { strategy, ventureId } = req.body;
  const venture = activeSimulations.get(ventureId);
  if (!venture) return res.status(404).json({ error: 'Venture not found' });

  try {
    const prompt = `You are a senior board member for a ${venture.track} startup: "${venture.mission}".
Current: Impact ${venture.impactScore}%, Cash $${venture.credits}, Trust ${venture.communityTrust}%

User's custom strategy: "${strategy}"

Analyze this strategy's likely real-world outcome.

JSON:
{
  "analysis": "Expert assessment in 1-2 sentences",
  "capitalChange": 2000,
  "capitalReason": "Why capital changes by this amount",
  "impacts": { "credits": 2000, "communityTrust": 3, "impactScore": 2 },
  "feedback": "Specific improvement suggestion for this strategy"
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a realistic strategic auditor. Output strict JSON.' },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.1-8b-instant',
      response_format: { type: 'json_object' }
    });
    res.json(JSON.parse(completion.choices[0].message.content));
  } catch (err) {
    res.status(500).json({ error: 'Strategy analysis failed.' });
  }
});

// ── SWOT Analysis (rich, history-aware) ───────────────────────────────────
app.post('/api/swot-analysis', async (req, res) => {
  const { ventureId } = req.body;
  const venture = activeSimulations.get(ventureId);
  if (!venture) return res.status(404).json({ error: 'Venture not found' });

  if (!hasGroqKey()) {
    return res.json(fallbackSwotAnalysis({ venture }));
  }

  try {
    const journeySummary = venture.history
      .map((h, i) => `W${i+1}: ${h.scenarioTitle} → User chose: "${h.userChoice}"`)
      .join('\n');

    const prompt = `Generate a detailed SWOT analysis for this ${venture.track} startup after completing its 10-week simulation journey.
Mission: "${venture.mission}" | Geography: ${venture.geography}
Final Stats: Impact ${venture.impactScore}%, Capital $${venture.credits}, Trust ${venture.communityTrust}%
Research Context Provided: ${venture.researchContent ? venture.researchContent.slice(0, 1500) : 'None provided'}
Decision History:
${journeySummary}

Provide 4 points per quadrant, each concise and specific to their actual journey decisions.
CRITICAL: Also evaluate the 'Research Context Provided' (if any) and provide actionable feedback on the user's documentation quality.

JSON:
{
  "strengths": ["...", "...", "...", "..."],
  "weaknesses": ["...", "...", "...", "..."],
  "opportunities": ["...", "...", "...", "..."],
  "threats": ["...", "...", "...", "..."],
  "documentationFeedback": "Specific feedback on their provided documentation/research context. 1-2 sentences on how to improve it. If none provided, suggest what documents they should prepare.",
  "overallVerdict": "One-paragraph expert summary of market readiness"
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a startup market analyst. Output strict JSON.' },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.1-8b-instant',
      response_format: { type: 'json_object' }
    });
    res.json(JSON.parse(completion.choices[0].message.content));
  } catch (err) {
    res.status(500).json({ error: 'SWOT analysis failed.' });
  }
});

// ── Government Analysis ──────────────────────────────────────────────────
app.post('/api/gov-analysis', async (req, res) => {
  const { ventureId } = req.body;
  const venture = activeSimulations.get(ventureId);
  if (!venture) return res.status(404).json({ error: 'Venture not found' });

  if (!hasGroqKey()) {
    return res.json(fallbackGovAnalysis({ venture }));
  }

  try {
    const prompt = `Perform a regulatory & policy impact assessment for this startup:
Mission: "${venture.mission}"
Sector: "${venture.track}"
Geography: "${venture.geography}"
Current Status: Capital $${venture.credits}, Trust ${venture.communityTrust}%, Impact ${venture.impactScore}%

Provide:
1. Support probability (0-100)
2. Government expected sentiment (Positive/Neutral/Negative) and 1 reason why
3. Top 2 specific regulatory risks
4. Top 2 specific support opportunities (subsidies/grants/schemes)
5. 6 Legal Compliance Dimensions (status: compliant, caution, risk, or neutral)
6. Policy Alignment Score (0-10) and brief note
7. Top 3 priority actions for legal/gov compliance

JSON only:
{
  "supportProbability": 68,
  "governmentSentiment": "Positive",
  "sentimentReasoning": "...",
  "regulatoryRisks": ["...", "..."],
  "supportOpportunities": ["...", "..."],
  "legalDimensions": [
    { "label": "Data Privacy", "status": "caution", "detail": "..." },
    { "label": "Labor Laws", "status": "compliant", "detail": "..." },
    { "label": "Corporate Gov", "status": "neutral", "detail": "..." },
    { "label": "IP Protection", "status": "caution", "detail": "..." },
    { "label": "Market Regs", "status": "risk", "detail": "..." },
    { "label": "Tax & Ethics", "status": "compliant", "detail": "..." }
  ],
  "policyAlignment": 8,
  "policyNote": "...",
  "keyActions": ["...", "...", "..."]
}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'system', content: 'You are an AI policy expert. Output strict JSON.' }, { role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      response_format: { type: 'json_object' }
    });
    res.json(JSON.parse(completion.choices[0].message.content));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gov analysis failed.' });
  }
});

// ── Resource Plan ───────────────────────────────────────────────────────
app.post('/api/resource-plan', async (req, res) => {
  const { ventureId } = req.body;
  const venture = activeSimulations.get(ventureId);
  if (!venture) return res.status(404).json({ error: 'Venture not found' });

  if (!hasGroqKey()) {
    return res.json(fallbackResourcePlan({ venture }));
  }

  try {
    const prompt = `Create a strategic capital allocation plan for deploying the remaining $${venture.credits} for this startup:
Mission: "${venture.mission}"
Sector: "${venture.track}"
Geography: "${venture.geography}"
Burn Rate: $${venture.burnRate}/week

Output a structured 5-phase execution roadmap. 
CRITICAL RULE: The sum of the "amount" of all 5 phases MUST EXACTLY EQUAL ${venture.credits}.

JSON:
{
  "executiveSummary": "2-sentence strategic justification.",
  "phases": [
    {
      "name": "Phase 1: Foundation",
      "timeline": "Months 1-3",
      "amount": number (ensure all 5 phases sum precisely to ${venture.credits}),
      "goal": "1 sentence objective",
      "allocations": [
        { "category": "Tech Stack", "amount": number },
        { "category": "Legal Setup", "amount": number }
      ],
      "milestones": ["Milestone 1", "Milestone 2"],
      "successMetric": "..."
    }
  ],
  "successProjection": {
    "marketReadiness": 75,
    "fundingProbability": 60,
    "breakEven": "Month 14"
  }
}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'system', content: 'You are an elite VC allocator. Output strict JSON.' }, { role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      response_format: { type: 'json_object' }
    });
    res.json(JSON.parse(completion.choices[0].message.content));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Resource plan failed.' });
  }
});

// ── Detect Domain ───────────────────────────────────────────────────────
app.post('/api/detect-domain', async (req, res) => {
  const { description } = req.body;
  try {
    const prompt = `Categorize this startup description into ONE of these specific domains:
"EdTech", "HealthTech", "ClimateTech", "FinTech", "AgriTech", or "Social Impact" (default fallback).

Description: "${description}"

JSON:
{ "domain": "Exact String Match from List" }`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'system', content: 'You are a fast categorization engine. Output strict JSON.' }, { role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      response_format: { type: 'json_object' },
      max_tokens: 50
    });
    res.json(JSON.parse(completion.choices[0].message.content));
  } catch (err) {
    res.json({ domain: "Social Impact" });
  }
});

// ── Exit Report (with risk index + alignment score) ───────────────────────
app.post('/api/generate-exit-report', async (req, res) => {
  const { ventureId } = req.body;
  const venture = activeSimulations.get(ventureId);
  if (!venture) return res.status(404).send();

  if (!hasGroqKey()) {
    const swot = fallbackSwotAnalysis({ venture });
    return res.json({
      executiveSummary: swot.overallVerdict,
      compatibilityScore: 70,
      expertAlignmentScore: 65,
      riskIndex: 30,
      documentationScore: venture.researchContent ? 85 : 0,
      documentationTips: [swot.documentationFeedback],
      overallScore: 68,
      expertScore: 80,
      userScore: 68,
      successProbability: "72%",
      expertComparison: "You balanced impact and runway effectively despite resource constraints.",
      journeyTimeline: venture.history.map((h, i) => ({
        week: i + 1,
        status: "Optimal",
        matchedExpert: true,
        critique: "Solid decision choice",
        capitalChange: 0,
        capitalReason: "N/A"
      })),
      strategicGaps: ["Market penetration in secondary cities", "Advanced regulatory lobbying"],
      swot: swot
    });
  }

  try {
    const journeyDetail = venture.history.map((h, i) =>
      `W${i+1}: "${h.scenarioTitle}" → User: "${h.userChoice}" | Expert preferred: "${h.expertPreferred}"`
    ).join('\n');

    const prompt = `Generate a comprehensive 'Startup Market Readiness Exit Analysis' for:
Mission: "${venture.mission}" | Sector: ${venture.track} | Geography: ${venture.geography}
Final: Impact ${venture.impactScore}%, Capital $${venture.credits}/$${venture.startingCredits} starting, Trust ${venture.communityTrust}%
Research Context Provided: ${venture.researchContent ? venture.researchContent.slice(0, 1500) : 'None provided'}

Decision Journey:
${journeyDetail}

Analyze alignment between user decisions and expert recommendations, risk exposure, market readiness, and the quality of their uploaded 'Research Context'.

JSON:
{
  "executiveSummary": "2-sentence expert verdict",
  "compatibilityScore": 72,
  "expertAlignmentScore": 60,
  "riskIndex": 35,
  "documentationScore": 85,
  "documentationTips": ["tip 1", "tip 2"],
  "overallScore": 68,
  "expertScore": 80,
  "userScore": 68,
  "successProbability": "67%",
  "expertComparison": "2-sentence holistic view of expert vs user journey",
  "journeyTimeline": [
    {
      "week": 1,
      "status": "Optimal",
      "matchedExpert": true,
      "critique": "brief decision assessment",
      "capitalChange": 5000,
      "capitalReason": "why capital changed"
    }
  ],
  "strategicGaps": ["gap 1", "gap 2", "gap 3"],
  "swot": {
    "strengths": ["...", "...", "..."],
    "weaknesses": ["...", "...", "..."],
    "opportunities": ["...", "...", "..."],
    "threats": ["...", "...", "..."]
  }
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a silicon valley startup readiness auditor. Output strict JSON.' },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.1-8b-instant',
      response_format: { type: 'json_object' }
    });
    res.json(JSON.parse(completion.choices[0].message.content));
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

app.post('/api/negotiate', async (req, res) => {
  const { persona, message, history = [] } = req.body;
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: `You are a ${persona} stakeholder. Reply concisely and firmly in 2 sentences.` },
        ...history,
        { role: 'user', content: message }
      ],
      model: 'llama-3.1-8b-instant',
    });
    res.json({ reply: completion.choices[0].message.content });
  } catch (err) { res.status(500).send(); }
});

const PORT = 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ImpactSim Engine v7 Online: PORT ${PORT}`);
});
