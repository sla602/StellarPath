import type { User } from '../types'

// 현재 로그인한 유저 (Mock)
export const MOCK_CURRENT_USER: User = {
  id: 'user_me',
  name: '김개발',
  handle: 'devkim',
  role: 'Frontend Developer',
  targetRole: 'Full-Stack Engineer',
  avatarColor: '#4F8EF7',
  readinessScore: 68,
  connections: ['user_2', 'user_3'],
  constellations: [
    { id: 'frontend', label: 'Frontend', color: '#4F8EF7', nodeIds: ['me_react', 'me_typescript', 'me_tailwind'] },
    { id: 'backend',  label: 'Backend',  color: '#F7A24F', nodeIds: ['me_nodejs', 'me_postgresql'] },
    { id: 'devops',   label: 'DevOps',   color: '#4FF7A2', nodeIds: ['me_docker'] },
  ],
  skills: [
    { id: 'me_react',      label: 'React',        category: 'Frontend', proficiency: 85, type: 'owned',    ownerId: 'user_me', projects: ['포트폴리오', '쇼핑몰'], description: '컴포넌트 기반 UI 라이브러리' },
    { id: 'me_typescript', label: 'TypeScript',   category: 'Frontend', proficiency: 70, type: 'owned',    ownerId: 'user_me', projects: ['포트폴리오'],          description: '타입 안전 JavaScript' },
    { id: 'me_tailwind',   label: 'Tailwind CSS', category: 'Frontend', proficiency: 80, type: 'owned',    ownerId: 'user_me', projects: ['랜딩 페이지'],         description: '유틸리티 CSS 프레임워크' },
    { id: 'me_nodejs',     label: 'Node.js',      category: 'Backend',  proficiency: 60, type: 'owned',    ownerId: 'user_me', projects: ['REST API'],            description: 'JS 서버 런타임' },
    { id: 'me_postgresql', label: 'PostgreSQL',   category: 'Data',     proficiency: 55, type: 'owned',    ownerId: 'user_me', projects: ['REST API'],            description: '관계형 데이터베이스' },
    { id: 'me_docker',     label: 'Docker',       category: 'DevOps',   proficiency: 40, type: 'learning', ownerId: 'user_me', projects: ['개인 프로젝트'],       description: '컨테이너 플랫폼' },
    // 블랙홀
    { id: 'me_k8s',        label: 'Kubernetes',   category: 'DevOps',   proficiency: 0,  type: 'blackhole', ownerId: 'user_me', projects: [], description: '컨테이너 오케스트레이션' },
    { id: 'me_graphql',    label: 'GraphQL',      category: 'Backend',  proficiency: 0,  type: 'blackhole', ownerId: 'user_me', projects: [], description: 'API 쿼리 언어' },
    { id: 'me_rust',       label: 'Rust',         category: 'Backend',  proficiency: 0,  type: 'blackhole', ownerId: 'user_me', projects: [], description: '시스템 프로그래밍 언어' },
  ],
}

// 다른 유저들 (Mock)
export const MOCK_OTHER_USERS: User[] = [
  {
    id: 'user_2',
    name: '박인공',
    handle: 'aipark',
    role: 'ML Engineer',
    targetRole: 'AI Research Engineer',
    avatarColor: '#C44FF7',
    readinessScore: 75,
    connections: ['user_me', 'user_4'],
    constellations: [
      { id: 'aiml',    label: 'AI/ML',   color: '#C44FF7', nodeIds: ['u2_python', 'u2_tensorflow', 'u2_pytorch'] },
      { id: 'data',    label: 'Data',    color: '#F74F4F', nodeIds: ['u2_pandas', 'u2_sql'] },
    ],
    skills: [
      { id: 'u2_python',     label: 'Python',     category: 'Backend', proficiency: 90, type: 'owned',   ownerId: 'user_2', projects: ['ML 모델'], description: '데이터 과학 언어' },
      { id: 'u2_tensorflow', label: 'TensorFlow', category: 'AI/ML',   proficiency: 80, type: 'owned',   ownerId: 'user_2', projects: ['딥러닝'],   description: '딥러닝 프레임워크' },
      { id: 'u2_pytorch',    label: 'PyTorch',    category: 'AI/ML',   proficiency: 75, type: 'owned',   ownerId: 'user_2', projects: ['NLP'],      description: '동적 딥러닝' },
      { id: 'u2_pandas',     label: 'Pandas',     category: 'Data',    proficiency: 85, type: 'owned',   ownerId: 'user_2', projects: ['분석'],     description: '데이터 처리 라이브러리' },
      { id: 'u2_sql',        label: 'SQL',        category: 'Data',    proficiency: 65, type: 'owned',   ownerId: 'user_2', projects: ['DB 설계'],  description: '쿼리 언어' },
      { id: 'u2_react',      label: 'React',      category: 'Frontend',proficiency: 30, type: 'learning',ownerId: 'user_2', projects: [],           description: 'UI 라이브러리' },
    ],
  },
  {
    id: 'user_3',
    name: '이데브옵스',
    handle: 'devops_lee',
    role: 'DevOps Engineer',
    targetRole: 'Platform Engineer',
    avatarColor: '#4FF7A2',
    readinessScore: 82,
    connections: ['user_me', 'user_4', 'user_5'],
    constellations: [
      { id: 'devops',  label: 'DevOps',  color: '#4FF7A2', nodeIds: ['u3_k8s', 'u3_docker', 'u3_terraform'] },
      { id: 'backend', label: 'Backend', color: '#F7A24F', nodeIds: ['u3_go', 'u3_nodejs'] },
    ],
    skills: [
      { id: 'u3_k8s',       label: 'Kubernetes', category: 'DevOps',  proficiency: 90, type: 'owned', ownerId: 'user_3', projects: ['클러스터 구축'], description: '컨테이너 오케스트레이션' },
      { id: 'u3_docker',    label: 'Docker',     category: 'DevOps',  proficiency: 95, type: 'owned', ownerId: 'user_3', projects: ['CI/CD'],        description: '컨테이너 플랫폼' },
      { id: 'u3_terraform', label: 'Terraform',  category: 'DevOps',  proficiency: 80, type: 'owned', ownerId: 'user_3', projects: ['인프라 자동화'], description: 'IaC 도구' },
      { id: 'u3_go',        label: 'Go',         category: 'Backend', proficiency: 70, type: 'owned', ownerId: 'user_3', projects: ['마이크로서비스'], description: '고성능 언어' },
      { id: 'u3_nodejs',    label: 'Node.js',    category: 'Backend', proficiency: 55, type: 'owned', ownerId: 'user_3', projects: ['API'],           description: 'JS 런타임' },
    ],
  },
  {
    id: 'user_4',
    name: '최풀스택',
    handle: 'fullstack_choi',
    role: 'Full-Stack Developer',
    targetRole: 'Tech Lead',
    avatarColor: '#F7C94F',
    readinessScore: 79,
    connections: ['user_2', 'user_3'],
    constellations: [
      { id: 'frontend', label: 'Frontend', color: '#4F8EF7', nodeIds: ['u4_react', 'u4_nextjs'] },
      { id: 'backend',  label: 'Backend',  color: '#F7A24F', nodeIds: ['u4_nodejs', 'u4_graphql', 'u4_postgres'] },
    ],
    skills: [
      { id: 'u4_react',    label: 'React',      category: 'Frontend', proficiency: 85, type: 'owned', ownerId: 'user_4', projects: ['SaaS'], description: 'UI 라이브러리' },
      { id: 'u4_nextjs',   label: 'Next.js',    category: 'Frontend', proficiency: 80, type: 'owned', ownerId: 'user_4', projects: ['웹앱'], description: 'React 풀스택 프레임워크' },
      { id: 'u4_nodejs',   label: 'Node.js',    category: 'Backend',  proficiency: 80, type: 'owned', ownerId: 'user_4', projects: ['API'], description: 'JS 런타임' },
      { id: 'u4_graphql',  label: 'GraphQL',    category: 'Backend',  proficiency: 75, type: 'owned', ownerId: 'user_4', projects: ['API'], description: 'API 쿼리 언어' },
      { id: 'u4_postgres', label: 'PostgreSQL', category: 'Data',     proficiency: 70, type: 'owned', ownerId: 'user_4', projects: ['DB'],  description: '관계형 DB' },
    ],
  },
  {
    id: 'user_5',
    name: '정모바일',
    handle: 'mobile_jung',
    role: 'Mobile Developer',
    targetRole: 'Mobile Lead',
    avatarColor: '#F7634F',
    readinessScore: 71,
    connections: ['user_3'],
    constellations: [
      { id: 'mobile',   label: 'Mobile',   color: '#F7634F', nodeIds: ['u5_flutter', 'u5_swift', 'u5_kotlin'] },
      { id: 'frontend', label: 'Frontend', color: '#4F8EF7', nodeIds: ['u5_react_native'] },
    ],
    skills: [
      { id: 'u5_flutter',      label: 'Flutter',      category: 'Mobile',  proficiency: 85, type: 'owned', ownerId: 'user_5', projects: ['앱'],  description: 'Google 크로스플랫폼' },
      { id: 'u5_swift',        label: 'Swift',        category: 'Mobile',  proficiency: 75, type: 'owned', ownerId: 'user_5', projects: ['iOS'], description: 'iOS 언어' },
      { id: 'u5_kotlin',       label: 'Kotlin',       category: 'Mobile',  proficiency: 70, type: 'owned', ownerId: 'user_5', projects: ['Android'], description: 'Android 언어' },
      { id: 'u5_react_native', label: 'React Native', category: 'Mobile',  proficiency: 60, type: 'owned', ownerId: 'user_5', projects: ['크로스플랫폼'], description: 'RN 프레임워크' },
    ],
  },
]

// 소셜 그래프 데이터 빌더
export function buildSocialGraphData(currentUser: User, otherUsers: User[]) {
  const allUsers = [currentUser, ...otherUsers]
  const nodes: any[] = []
  const links: any[] = []

  // 각 유저의 스킬을 노드로 추가
  allUsers.forEach(user => {
    user.skills.forEach(skill => {
      nodes.push({
        ...skill,
        isCurrentUser: user.id === currentUser.id,
        userHandle: user.handle,
        userName: user.name,
        userAvatarColor: user.avatarColor,
      })
    })
  })

  // 각 유저 내 스킬 연결 (별자리 내부 링크)
  allUsers.forEach(user => {
    user.constellations.forEach(c => {
      for (let i = 0; i < c.nodeIds.length - 1; i++) {
        links.push({
          source: c.nodeIds[i],
          target: c.nodeIds[i + 1],
          strength: 0.7,
          type: 'skill',
        })
      }
    })
  })

  // 유저 간 소셜 연결: 같은 스킬을 가진 연결된 유저끼리 대표 노드를 이음
  currentUser.connections.forEach(connId => {
    const connUser = otherUsers.find(u => u.id === connId)
    if (!connUser) return

    // 공통 기술 라벨 찾기
    const myLabels = new Set(currentUser.skills.map(s => s.label.toLowerCase()))
    const sharedSkill = connUser.skills.find(s => myLabels.has(s.label.toLowerCase()))

    if (sharedSkill) {
      // 공통 기술 노드끼리 연결
      const mySkill = currentUser.skills.find(s => s.label.toLowerCase() === sharedSkill.label.toLowerCase())
      if (mySkill) {
        links.push({
          source: mySkill.id,
          target: sharedSkill.id,
          strength: 0.3,
          type: 'social',
        })
      }
    } else {
      // 공통 기술 없으면 각자 첫 번째 스킬끼리 연결
      if (currentUser.skills[0] && connUser.skills[0]) {
        links.push({
          source: currentUser.skills[0].id,
          target: connUser.skills[0].id,
          strength: 0.2,
          type: 'social',
        })
      }
    }
  })

  return { nodes, links }
}
