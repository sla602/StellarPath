import { GoogleGenerativeAI } from '@google/generative-ai'
import type { SkillCategory } from '../types'

const ENV_API_KEY = import.meta.env.VITE_GEMINI_API_KEY ?? ''

export interface SuggestedSkill {
  label: string
  category: SkillCategory
  reason: string
}

function safeParseJSON<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T
  } catch {}

  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(cleaned) as T
  } catch {}

  try {
    const match = text.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0]) as T
  } catch {}

  return null
}

function getModel() {
  const apiKey = ENV_API_KEY.trim()
  if (!apiKey) return null

  const genAI = new GoogleGenerativeAI(apiKey)
  return genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' })
}

function inferCategory(label: string): SkillCategory {
  const l = label.toLowerCase()

  if (
    ['react', 'typescript', 'javascript', 'next.js', 'vue', 'tailwind', 'html', 'css'].some((k) =>
      l.includes(k)
    )
  ) {
    return 'Frontend'
  }

  if (
    ['node', 'express', 'spring', 'java', 'go', 'python', 'graphql'].some((k) =>
      l.includes(k)
    )
  ) {
    return 'Backend'
  }

  if (
    ['docker', 'kubernetes', 'aws', 'gcp', 'terraform', 'ci/cd'].some((k) =>
      l.includes(k)
    )
  ) {
    return 'DevOps'
  }

  if (
    ['tensorflow', 'pytorch', 'ml', 'ai', 'llm', 'nlp'].some((k) => l.includes(k))
  ) {
    return 'AI/ML'
  }

  if (
    ['postgresql', 'mongodb', 'sql', 'data', 'pandas'].some((k) => l.includes(k))
  ) {
    return 'Data'
  }

  if (
    ['flutter', 'swift', 'kotlin', 'android', 'ios'].some((k) => l.includes(k))
  ) {
    return 'Mobile'
  }

  return 'Other'
}

export async function getSuggestedSkillsForTargetRole(
  targetRole: string,
  selectedSkills: string[]
): Promise<SuggestedSkill[]> {
  const model = getModel()

  if (!model) {
    throw new Error('Gemini API key is missing. Please set VITE_GEMINI_API_KEY in your .env file.')
  }

  const prompt = `
You are an AI skill recommendation engine.

A user is creating a developer profile.
Recommend the most relevant skills for the user's target role.

Target role: ${targetRole || 'Not specified'}
Already selected skills: ${selectedSkills.join(', ') || 'None'}

Return ONLY valid JSON in this exact format:
{
  "skills": [
    {
      "label": "Skill name",
      "category": "Frontend",
      "reason": "One short English sentence explaining why this skill fits the target role."
    }
  ]
}

Rules:
- Return exactly 12 skills
- All text must be in English
- category must be one of:
  Frontend, Backend, DevOps, AI/ML, Data, Mobile, Other
- Avoid duplicates
- Make the list realistic for the target role
- Include both core and complementary skills
`

  const result = await model.generateContent(prompt)
  const text = result.response.text()
  const parsed = safeParseJSON<{ skills: SuggestedSkill[] }>(text)

  if (!parsed?.skills?.length) {
    throw new Error('Failed to parse Gemini skill suggestions.')
  }

  return parsed.skills.slice(0, 12).map((skill: SuggestedSkill) => ({
    label: skill.label,
    category: skill.category || inferCategory(skill.label),
    reason: skill.reason || `Recommended for a ${targetRole} path.`,
  }))
}
export interface RecommendedConnection {
  name: string
  role: string
  reason: string
  sharedSkills: string[]
  avatarColor: string
}

export async function getNetworkRecommendations(
  selectedSkills: string[],
  targetRole: string
): Promise<RecommendedConnection[]> {
  const AVATAR_COLORS = ['#4F8EF7', '#C44FF7', '#4FF7A2', '#F7A24F', '#F7C94F', '#F7634F']

  const model = getModel()

  if (!model) {
    return [
      { name: 'Alex Chen',   role: 'Frontend Engineer', reason: 'Strong overlap with your frontend and product-building skills.', sharedSkills: selectedSkills.slice(0, 3), avatarColor: AVATAR_COLORS[0] },
      { name: 'Mina Park',   role: 'Full-Stack Dev',    reason: 'Complements your stack with strong backend experience.',          sharedSkills: selectedSkills.slice(1, 4), avatarColor: AVATAR_COLORS[1] },
      { name: 'Jordan Kim',  role: 'DevOps Engineer',   reason: 'Shares your infrastructure interests and career direction.',      sharedSkills: selectedSkills.slice(0, 2), avatarColor: AVATAR_COLORS[2] },
      { name: 'Sam Rivera',  role: 'ML Engineer',       reason: 'Great match for AI/ML collaboration on your target path.',       sharedSkills: selectedSkills.slice(2, 4), avatarColor: AVATAR_COLORS[3] },
      { name: 'Dana Lee',    role: 'Product Engineer',  reason: 'Aligned with your full-stack direction and product mindset.',    sharedSkills: selectedSkills.slice(0, 2), avatarColor: AVATAR_COLORS[4] },
      { name: 'Chris Wang',  role: 'Backend Engineer',  reason: 'Deep expertise that pairs well with your frontend skills.',      sharedSkills: selectedSkills.slice(1, 3), avatarColor: AVATAR_COLORS[5] },
    ]
  }

  const prompt = `
You are an AI networking recommendation engine.

A developer wants to find useful people to connect with.

Target role: ${targetRole || 'Not specified'}
Current skills: ${selectedSkills.join(', ') || 'None'}

Return ONLY valid JSON in this exact format:
{
  "recommendations": [
    {
      "name": "Alex Chen",
      "role": "Frontend Engineer",
      "reason": "One short English sentence explaining why this person is a good connection.",
      "sharedSkills": ["React", "TypeScript"]
    }
  ]
}

Rules:
- Return exactly 6 recommendations
- All text must be in English
- Keep reasons short and realistic (1 sentence)
- sharedSkills must be 1–3 skills from the user's current skills
- Use realistic developer names and roles
`

  const result = await model.generateContent(prompt)
  const text   = result.response.text()
  const parsed = safeParseJSON<{ recommendations: Array<{ name: string; role: string; reason: string; sharedSkills: string[] }> }>(text)

  if (!parsed?.recommendations?.length) {
    throw new Error('Failed to parse Gemini network recommendations.')
  }

  return parsed.recommendations.slice(0, 6).map((r, i) => ({
    name:        r.name,
    role:        r.role,
    reason:      r.reason,
    sharedSkills: Array.isArray(r.sharedSkills) ? r.sharedSkills.slice(0, 3) : [],
    avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
  }))
}

export interface DeveloperProfile {
  title: string
  summary: string
  strengths: string[]
  suggestedPath: string
  constellationTheme: string
}

export async function getDeveloperProfile(
  skills: string[],
  targetRole: string,
  constellationName: string,
  birthday?: string
): Promise<DeveloperProfile> {
  const model = getModel()

  if (!model) {
    return {
      title: `Emerging ${targetRole}`,
      summary: `Your constellation reveals a developer with a strong foundation across ${skills.slice(0, 3).join(', ')} and more. You show a natural aptitude for building and growing in your field.`,
      strengths: skills.slice(0, 3),
      suggestedPath: `Continue deepening your core skills and start contributing to open source projects aligned with ${targetRole}.`,
      constellationTheme: `Like the ${constellationName} constellation, your skills form a unique and recognizable pattern in the developer universe.`,
    }
  }

  const prompt = `
You are an AI career analyst for a constellation-themed developer portfolio app.

Analyze this developer's profile and write an inspiring, personalized summary.

Skills: ${skills.join(', ') || 'None listed'}
Target Role: ${targetRole || 'Software Engineer'}
Birth Constellation: ${constellationName}
Birthday: ${birthday || 'Unknown'}

Return ONLY valid JSON in this exact format:
{
  "title": "A short evocative developer archetype title (e.g. 'The Full-Stack Architect', 'The AI Pioneer')",
  "summary": "2-3 sentence inspiring summary of who they are as a developer based on their skills",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "suggestedPath": "One actionable sentence on their best next career move",
  "constellationTheme": "One poetic sentence connecting their ${constellationName} constellation to their dev personality"
}

Rules:
- All text in English
- Keep the tone inspiring and personal, not generic
- strengths must be exactly 3 items
- Base the analysis on the actual skills provided
`

  const result = await model.generateContent(prompt)
  const text = result.response.text()
  const parsed = safeParseJSON<DeveloperProfile>(text)

  if (!parsed) throw new Error('Failed to parse developer profile.')

  return {
    title: parsed.title || `${targetRole} in the Making`,
    summary: parsed.summary || '',
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 3) : skills.slice(0, 3),
    suggestedPath: parsed.suggestedPath || '',
    constellationTheme: parsed.constellationTheme || '',
  }
}