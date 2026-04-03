// ── Government & NGO Scheme Database ──────────────────────────────────────────
// Used by MissionControl to detect potential scheme collisions in scenario options

export const GOV_SCHEMES = [
  // ── EDUCATION / EDTECH ─────────────────────────────────────────
  {
    id: 'pm-evidya',
    name: 'PM eVIDYA',
    org: 'Ministry of Education, India',
    type: 'government',
    sectors: ['edtech', 'education', 'social impact'],
    keywords: ['digital learning', 'online education', 'e-learning', 'school', 'student', 'curriculum', 'teacher training'],
    description: 'A unified programme for multi-mode access to digital education covering school education, higher education, and skill development.',
    provides: 'Free digital content, curriculum access, and teacher training resources for edtech startups working with government schools.',
    url: 'https://www.education.gov.in',
    fundingRange: '₹5L – ₹50L grants',
  },
  {
    id: 'nep-fund',
    name: 'NEP Innovation Fund',
    org: 'UGC / Ministry of Education',
    type: 'government',
    sectors: ['edtech', 'education', 'social impact'],
    keywords: ['innovation', 'skill', 'learning outcome', 'vocational', 'higher education', 'research'],
    description: 'Funds innovative education models aligned with National Education Policy 2020, especially for skill-based and vocational learning.',
    provides: 'Grants up to ₹1Cr for edtech ventures building NEP-aligned solutions.',
    url: 'https://ugc.ac.in',
    fundingRange: '₹10L – ₹1Cr grants',
  },
  {
    id: 'pratham',
    name: 'Pratham NGO Partnership',
    org: 'Pratham Education Foundation',
    type: 'ngo',
    sectors: ['edtech', 'education', 'social impact'],
    keywords: ['literacy', 'rural', 'child education', 'learning gap', 'foundational skills'],
    description: 'Pratham works to improve the quality of education, especially among underprivileged children. Partnerships available for aligned edtech.',
    provides: 'Access to 30M+ learners across India, co-delivery partnerships, field validation.',
    url: 'https://www.pratham.org',
    fundingRange: 'Partnership-based',
  },

  // ── HEALTH / HEALTHTECH ────────────────────────────────────────
  {
    id: 'ayushman-bharat',
    name: 'Ayushman Bharat - PMJAY',
    org: 'National Health Authority, India',
    type: 'government',
    sectors: ['healthtech', 'health', 'social impact'],
    keywords: ['hospital', 'treatment', 'patient', 'insurance', 'coverage', 'primary health', 'clinic', 'diagnostic'],
    description: 'World\'s largest health assurance scheme providing coverage of ₹5 lakh per family for health services.',
    provides: 'Empanelment opportunities, patient access, digital health integration APIs through HIP/HIU under ABDM.',
    url: 'https://pmjay.gov.in',
    fundingRange: 'Revenue via empanelment',
  },
  {
    id: 'national-digital-health',
    name: 'Ayushman Bharat Digital Mission',
    org: 'Ministry of Health, India',
    type: 'government',
    sectors: ['healthtech', 'health', 'social impact'],
    keywords: ['digital health', 'health records', 'telemedicine', 'health data', 'ABHA', 'health ID'],
    description: 'Creates a national digital health ecosystem with Health IDs, digital health records, and interoperable infrastructure.',
    provides: 'API access to ABHA health ID system, PHR standardization, regulatory sandbox for digital health innovation.',
    url: 'https://abdm.gov.in',
    fundingRange: 'Regulatory access + grants',
  },
  {
    id: 'who-foundation',
    name: 'WHO Foundation Grants',
    org: 'World Health Organization',
    type: 'ngo',
    sectors: ['healthtech', 'health', 'social impact', 'climatetech'],
    keywords: ['public health', 'disease', 'prevention', 'community health', 'vaccination', 'mental health'],
    description: 'WHO Foundation provides grants to innovative health solutions addressing SDG 3 (Good Health and Well-Being).',
    provides: 'Grants $50K–$500K, WHO endorsement, global health system access.',
    url: 'https://who.foundation',
    fundingRange: '$50K – $500K',
  },

  // ── CLIMATE / CLEANTECH ────────────────────────────────────────
  {
    id: 'national-solar-mission',
    name: 'National Solar Mission',
    org: 'Ministry of New & Renewable Energy',
    type: 'government',
    sectors: ['climatetech', 'cleantech', 'sustainability', 'social impact'],
    keywords: ['solar', 'renewable energy', 'clean energy', 'electricity', 'panels', 'grid'],
    description: 'India\'s flagship initiative targeting 500GW renewable energy by 2030 with subsidies and incentives for solar ventures.',
    provides: 'Capital subsidies, viability gap funding, PLI scheme access for solar manufacturing and deployment startups.',
    url: 'https://mnre.gov.in',
    fundingRange: '₹25L – ₹10Cr subsidies',
  },
  {
    id: 'green-climate-fund',
    name: 'Green Climate Fund',
    org: 'United Nations GCF',
    type: 'ngo',
    sectors: ['climatetech', 'cleantech', 'sustainability', 'social impact'],
    keywords: ['climate change', 'carbon', 'emission', 'net zero', 'adaptation', 'mitigation', 'environment'],
    description: 'UN\'s primary climate finance mechanism supporting developing countries transition to low-emission economies.',
    provides: 'Grants and concessional loans from $1M, access to accredited entities for project channeling.',
    url: 'https://www.greenclimate.fund',
    fundingRange: '$1M – $100M',
  },
  {
    id: 'atal-innovation',
    name: 'Atal Innovation Mission',
    org: 'NITI Aayog, India',
    type: 'government',
    sectors: ['climatetech', 'edtech', 'healthtech', 'fintech', 'agritech', 'social impact'],
    keywords: ['innovation', 'startup', 'incubation', 'prototype', 'pilot', 'problem solving', 'young entrepreneur'],
    description: 'AIM creates Atal Incubation Centres and Tinkering Labs to foster innovation and entrepreneurship across India.',
    provides: 'Up to ₹10Cr grant for incubation centres, mentorship, infrastructure, and startup acceleration.',
    url: 'https://aim.gov.in',
    fundingRange: '₹50L – ₹10Cr grants',
  },

  // ── FINTECH / FINANCE ─────────────────────────────────────────
  {
    id: 'mudra-yojana',
    name: 'PM Mudra Yojana',
    org: 'Ministry of Finance, India',
    type: 'government',
    sectors: ['fintech', 'social impact', 'agritech'],
    keywords: ['loan', 'micro finance', 'MSME', 'small business', 'credit', 'women entrepreneur', 'rural finance'],
    description: 'Provides loans up to ₹10 lakh to non-corporate, non-farm small/micro enterprises through lending institutions.',
    provides: 'Collateral-free loans ₹50K–₹10L, MUDRA card, credit guarantee for underserved entrepreneurs.',
    url: 'https://mudra.org.in',
    fundingRange: '₹50K – ₹10L loans',
  },
  {
    id: 'rbi-sandbox',
    name: 'RBI Regulatory Sandbox',
    org: 'Reserve Bank of India',
    type: 'government',
    sectors: ['fintech', 'social impact'],
    keywords: ['payment', 'lending', 'digital currency', 'banking', 'financial product', 'wallet', 'neobank'],
    description: 'RBI\'s regulatory sandbox allows fintech innovators to test products in a live environment with regulatory relaxations.',
    provides: 'Regulatory clearances, live testing environment, direct RBI engagement and feedback.',
    url: 'https://rbi.org.in',
    fundingRange: 'Regulatory support',
  },

  // ── AGRICULTURE ───────────────────────────────────────────────
  {
    id: 'pm-kisan',
    name: 'PM-KISAN Scheme',
    org: 'Ministry of Agriculture, India',
    type: 'government',
    sectors: ['agritech', 'social impact'],
    keywords: ['farmer', 'agriculture', 'crop', 'smallholder', 'farm income', 'rural', 'food'],
    description: 'Provides income support of ₹6000 per year to farmer families for purchasing agricultural inputs.',
    provides: 'Partnership opportunities for agritech startups to deliver services through the PM-KISAN beneficiary network.',
    url: 'https://pmkisan.gov.in',
    fundingRange: 'Partnership-based',
  },
  {
    id: 'icar',
    name: 'ICAR Technology Grant',
    org: 'Indian Council of Agricultural Research',
    type: 'government',
    sectors: ['agritech', 'climatetech'],
    keywords: ['crop yield', 'soil health', 'precision farming', 'agri-drone', 'seed', 'irrigation', 'livestock'],
    description: 'ICAR funds agritech research and startup partnerships that improve crop science and farming productivity.',
    provides: 'Grants ₹25L–₹2Cr, access to ICAR research stations, co-branding with 100+ institutes.',
    url: 'https://icar.org.in',
    fundingRange: '₹25L – ₹2Cr',
  },

  // ── WOMEN / GENDER ────────────────────────────────────────────
  {
    id: 'we-hub',
    name: 'WE Hub (Women Entrepreneurship)',
    org: 'Govt of Telangana',
    type: 'government',
    sectors: ['social impact', 'edtech', 'healthtech', 'fintech'],
    keywords: ['women entrepreneur', 'gender equity', 'women led', 'female founder', 'women empowerment'],
    description: 'India\'s first state-led incubator exclusively for women entrepreneurs, with access to funding and mentorship.',
    provides: 'Incubation space, ₹10L seed grants, investor connects, and government procurement priority.',
    url: 'https://wehub.telangana.gov.in',
    fundingRange: '₹5L – ₹50L',
  },
  {
    id: 'un-women',
    name: 'UN Women Innovation Fund',
    org: 'UN Women',
    type: 'ngo',
    sectors: ['social impact', 'edtech', 'healthtech'],
    keywords: ['gender equality', 'women rights', 'girls education', 'gender based violence', 'women health'],
    description: 'Fund supporting innovations that advance gender equality and women\'s empowerment globally.',
    provides: 'Grants $50K–$300K, access to UN system, global advocacy, and partnerships.',
    url: 'https://www.unwomen.org',
    fundingRange: '$50K – $300K',
  },

  // ── GENERAL STARTUP ───────────────────────────────────────────
  {
    id: 'startup-india',
    name: 'Startup India Initiative',
    org: 'DPIIT, Ministry of Commerce',
    type: 'government',
    sectors: ['edtech', 'healthtech', 'fintech', 'agritech', 'climatetech', 'social impact'],
    keywords: ['startup', 'registration', 'tax exemption', 'funding', 'government contract', 'incubation', 'pitch', 'scale'],
    description: 'India\'s flagship startup ecosystem initiative providing recognition, tax benefits, and access to funding networks.',
    provides: '80IC tax exemption, Fund of Funds access, government procurement exemption, simplified compliance.',
    url: 'https://startupindia.gov.in',
    fundingRange: 'Tax benefits + fund access',
  },
  {
    id: 'sidbi-fund',
    name: 'SIDBI Startup Fund',
    org: 'Small Industries Development Bank of India',
    type: 'government',
    sectors: ['edtech', 'healthtech', 'fintech', 'agritech', 'climatetech', 'social impact'],
    keywords: ['equity', 'venture capital', 'bridge funding', 'growth capital', 'term loan', 'debt financing'],
    description: 'SIDBI\'s Fund of Funds for Startups (FFS) co-invests with SEBI-registered AIFs to support early-stage startups.',
    provides: 'Equity investment through registered funds, concessional debt, working capital support.',
    url: 'https://www.sidbi.in',
    fundingRange: '₹50L – ₹5Cr',
  },
  {
    id: 'gates-foundation',
    name: 'Bill & Melinda Gates Foundation',
    org: 'BMGF',
    type: 'ngo',
    sectors: ['healthtech', 'agritech', 'edtech', 'social impact'],
    keywords: ['poverty', 'malnutrition', 'vaccine', 'sanitation', 'financial inclusion', 'smallholder', 'global health'],
    description: 'One of the world\'s largest philanthropic organizations funding solutions to global poverty, health, and education challenges.',
    provides: 'Grants $100K–$10M, Grand Challenges participation, global distribution network access.',
    url: 'https://www.gatesfoundation.org',
    fundingRange: '$100K – $10M',
  },
  {
    id: 'ashoka',
    name: 'Ashoka Fellowship',
    org: 'Ashoka Innovators for the Public',
    type: 'ngo',
    sectors: ['social impact', 'edtech', 'healthtech', 'agritech'],
    keywords: ['social entrepreneur', 'systems change', 'community impact', 'social innovation', 'equity'],
    description: 'Ashoka supports the world\'s leading social entrepreneurs with stipends, professional support, and a global network.',
    provides: 'Stipend support, lifetime fellowship, Ashoka brand credibility, senior advisor network.',
    url: 'https://www.ashoka.org',
    fundingRange: 'Stipend + network access',
  },
]

/**
 * Detects matching govt/NGO schemes for a given scenario description and venture sector.
 * Returns array of matched schemes (top 3 max).
 */
export function detectSchemeCollisions(scenarioDescription, scenarioOptions, vSector) {
  const text = (scenarioDescription + ' ' + (scenarioOptions || []).map(o => o.label).join(' ')).toLowerCase()
  const sector = (vSector || '').toLowerCase()

  const matches = GOV_SCHEMES.filter(scheme => {
    const sectorMatch = scheme.sectors.some(s => sector.includes(s) || s.includes(sector) || sector.includes('social'))
    if (!sectorMatch) return false
    const keywordMatch = scheme.keywords.some(kw => text.includes(kw.toLowerCase()))
    return keywordMatch
  })

  // Return unique top 3
  return matches.slice(0, 3)
}
