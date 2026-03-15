export type NodeType = 'owned' | 'learning' | 'blackhole'
export type SkillCategory = 'Frontend' | 'Backend' | 'DevOps' | 'AI/ML' | 'Data' | 'Mobile' | 'Other'

export interface SkillNode {
  id: string
  label: string
  category: SkillCategory
  proficiency: number
  type: NodeType
  projects: string[]
  description: string
  ownerId?: string
  x?: number
  y?: number
  vx?: number
  vy?: number
}

export interface SkillLink {
  source: string | SkillNode
  target: string | SkillNode
  strength: number
  type?: 'skill' | 'social'
}

export interface Constellation {
  id: string
  label: string
  color: string
  nodeIds: string[]
}

export interface Blackhole {
  id: string
  label: string
  category: SkillCategory
  priority: 1 | 2 | 3
  reason: string
  connection: string
  learningPath: string[]
}

export interface GraphMeta {
  targetRole: string
  totalSkills: number
  readinessScore: number
  readinessSummary: string
}

export interface GraphData {
  nodes: SkillNode[]
  links: SkillLink[]
  constellations: Constellation[]
  blackholes: Blackhole[]
  meta: GraphMeta
}


export interface User {
  id: string
  name: string
  handle: string
  role: string
  targetRole: string
  avatarColor: string
  skills: SkillNode[]
  constellations: Constellation[]
  connections: string[]
  readinessScore: number
  birthday?: string           // YYYY-MM-DD
  constellationName?: string  
}


export interface SocialGraphData {
  nodes: SocialNode[]
  links: SocialLink[]
}

export interface SocialNode extends SkillNode {
  isCurrentUser: boolean
  userHandle: string
  userName: string
  userAvatarColor: string
}

export interface SocialLink {
  source: string | SocialNode
  target: string | SocialNode
  strength: number
  type: 'skill' | 'social'
}


export interface SkillInput {
  label: string
  category: SkillCategory
  proficiency: number
}


export type AppStep =
  | 'landing'
  | 'burst'
  | 'galaxy'

export type AuthMode = 'login' | 'signup'