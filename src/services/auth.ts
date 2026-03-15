import type { User, SkillInput, SkillNode, Constellation, SkillCategory } from '../types'
import { getConstellationByBirthday } from '../assets/constellations'

const CATEGORY_COLORS: Record<string, string> = {
  Frontend: '#4F8EF7', Backend: '#F7A24F', DevOps: '#4FF7A2',
  'AI/ML': '#C44FF7', Data: '#F74F4F', Mobile: '#F7E94F', Other: '#888888',
}

const AVATAR_COLORS = ['#4F8EF7', '#C44FF7', '#4FF7A2', '#F7A24F', '#F7C94F', '#F7634F']

export function buildUserFromInputs(
  name: string,
  email: string,
  targetRole: string,
  inputs: SkillInput[],
  birthday?: string
): User {
  const handle = email.split('@')[0].replace(/[^a-z0-9]/gi, '_').toLowerCase()
  const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]

  const skills: SkillNode[] = inputs.map((inp, i) => ({
    id: `me_${i}_${inp.label.toLowerCase().replace(/\s+/g, '_')}`,
    label: inp.label,
    category: inp.category,
    proficiency: inp.proficiency,
    // proficiency: 0 = none, 1 = learning, 2 = proficient
    type: inp.proficiency === 0 ? 'blackhole' : inp.proficiency >= 2 ? 'owned' : 'learning',
    projects: [],
    description: `${inp.label} — ${inp.category}`,
    ownerId: 'user_me',
  }))

  const catMap = new Map<SkillCategory, string[]>()
  skills.forEach(s => {
    const list = catMap.get(s.category) ?? []
    list.push(s.id)
    catMap.set(s.category, list)
  })

  const constellations: Constellation[] = []
  catMap.forEach((nodeIds, category) => {
    constellations.push({
      id: category.toLowerCase().replace('/', '_'),
      label: category,
      color: CATEGORY_COLORS[category] ?? '#888',
      nodeIds,
    })
  })

  // readiness: proficiency avg (0-2 scale → normalize to 0-100)
  const readinessScore = Math.round(
    (skills.reduce((acc, s) => acc + s.proficiency, 0) / Math.max(skills.length, 1)) * 47.5
  )

  let constellationName = 'Pisces'
  if (birthday) {
    const [, m, d] = birthday.split('-').map(Number)
    constellationName = getConstellationByBirthday(m, d).name
  }

  return {
    id: 'user_me',
    name: name || 'Explorer',
    handle,
    role: inputs[0]?.category ?? 'Developer',
    targetRole: targetRole || 'Software Engineer',
    avatarColor,
    skills,
    constellations,
    connections: ['user_2', 'user_3'],
    readinessScore: Math.min(readinessScore, 95),
    birthday,
    constellationName,
  }
}