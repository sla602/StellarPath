export interface ConstellationDef {
  name: string
  symbol: string
  startDate: string   // MM-DD
  endDate: string
  stars: { dx: number; dy: number }[]
  lines: [number, number][]
}

export const CONSTELLATIONS: ConstellationDef[] = [
  {
    name: 'Capricorn', symbol: '♑', startDate: '12-22', endDate: '01-19',
    stars: [
      { dx: -0.38, dy: -0.05 }, { dx: -0.20, dy: -0.18 }, { dx: -0.05, dy: -0.22 },
      { dx:  0.12, dy: -0.18 }, { dx:  0.28, dy: -0.08 }, { dx:  0.32, dy:  0.10 },
      { dx:  0.18, dy:  0.22 }, { dx:  0.00, dy:  0.26 }, { dx: -0.18, dy:  0.20 },
      { dx: -0.30, dy:  0.10 },
    ],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,0]],
  },
  {
    name: 'Aquarius', symbol: '♒', startDate: '01-20', endDate: '02-18',
    stars: [
      { dx: -0.28, dy: -0.30 }, { dx: -0.10, dy: -0.20 }, { dx:  0.05, dy: -0.28 },
      { dx:  0.20, dy: -0.18 }, { dx:  0.10, dy: -0.05 }, { dx: -0.05, dy:  0.05 },
      { dx: -0.20, dy:  0.15 }, { dx: -0.10, dy:  0.28 }, { dx:  0.05, dy:  0.22 },
      { dx:  0.22, dy:  0.30 },
    ],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[1,5]],
  },
  {
    name: 'Pisces', symbol: '♓', startDate: '02-19', endDate: '03-20',
    stars: [
      { dx:  0.30, dy: -0.32 }, { dx:  0.18, dy: -0.22 }, { dx:  0.08, dy: -0.28 },
      { dx: -0.02, dy: -0.18 }, { dx: -0.08, dy: -0.06 }, { dx: -0.20, dy:  0.04 },
      { dx: -0.32, dy:  0.14 }, { dx: -0.28, dy:  0.26 }, { dx: -0.16, dy:  0.32 },
      { dx: -0.04, dy:  0.26 }, { dx:  0.06, dy:  0.14 },
    ],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,4]],
  },
  {
    name: 'Aries', symbol: '♈', startDate: '03-21', endDate: '04-19',
    stars: [
      { dx: -0.30, dy:  0.05 }, { dx: -0.10, dy:  0.00 },
      { dx:  0.10, dy: -0.08 }, { dx:  0.28, dy: -0.20 },
    ],
    lines: [[0,1],[1,2],[2,3]],
  },
  {
    name: 'Taurus', symbol: '♉', startDate: '04-20', endDate: '05-20',
    stars: [
      { dx: -0.05, dy:  0.10 }, { dx: -0.20, dy:  0.00 }, { dx: -0.32, dy: -0.12 },
      { dx: -0.16, dy: -0.22 }, { dx:  0.10, dy: -0.05 }, { dx:  0.26, dy: -0.18 },
      { dx:  0.08, dy:  0.20 }, { dx: -0.08, dy:  0.32 },
    ],
    lines: [[0,1],[1,2],[2,3],[0,4],[4,5],[0,6],[6,7]],
  },
  {
    name: 'Gemini', symbol: '♊', startDate: '05-21', endDate: '06-21',
    stars: [
      { dx: -0.18, dy: -0.35 }, { dx: -0.08, dy: -0.35 }, { dx: -0.20, dy: -0.18 },
      { dx: -0.10, dy: -0.15 }, { dx: -0.22, dy:  0.00 }, { dx: -0.10, dy:  0.02 },
      { dx: -0.24, dy:  0.18 }, { dx: -0.12, dy:  0.18 }, { dx:  0.00, dy:  0.18 },
      { dx: -0.24, dy:  0.34 }, { dx:  0.02, dy:  0.34 },
    ],
    lines: [[0,2],[2,4],[4,6],[6,9],[1,3],[3,5],[5,7],[7,10],[5,8],[4,5]],
  },
  {
    name: 'Cancer', symbol: '♋', startDate: '06-22', endDate: '07-22',
    stars: [
      { dx: -0.20, dy: -0.20 }, { dx:  0.20, dy: -0.20 }, { dx: -0.08, dy:  0.00 },
      { dx:  0.08, dy:  0.00 }, { dx: -0.22, dy:  0.22 }, { dx:  0.22, dy:  0.22 },
    ],
    lines: [[0,2],[1,3],[2,3],[2,4],[3,5]],
  },
  {
    name: 'Leo', symbol: '♌', startDate: '07-23', endDate: '08-22',
    stars: [
      { dx: -0.10, dy: -0.30 }, { dx:  0.08, dy: -0.22 }, { dx:  0.18, dy: -0.08 },
      { dx:  0.10, dy:  0.08 }, { dx: -0.05, dy:  0.18 }, { dx: -0.20, dy:  0.10 },
      { dx: -0.30, dy: -0.05 }, { dx: -0.25, dy: -0.20 }, { dx: -0.38, dy:  0.20 },
    ],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,0],[4,8]],
  },
  {
    name: 'Virgo', symbol: '♍', startDate: '08-23', endDate: '09-22',
    stars: [
      { dx:  0.05, dy: -0.35 }, { dx:  0.15, dy: -0.18 }, { dx:  0.25, dy: -0.02 },
      { dx:  0.18, dy:  0.14 }, { dx:  0.00, dy:  0.22 }, { dx: -0.18, dy:  0.14 },
      { dx: -0.28, dy:  0.00 }, { dx: -0.20, dy: -0.15 }, { dx: -0.05, dy: -0.22 },
      { dx:  0.10, dy:  0.35 }, { dx: -0.10, dy:  0.35 },
    ],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,1],[4,9],[4,10]],
  },
  {
    name: 'Libra', symbol: '♎', startDate: '09-23', endDate: '10-22',
    stars: [
      { dx: -0.22, dy:  0.20 }, { dx:  0.00, dy:  0.28 }, { dx:  0.22, dy:  0.20 },
      { dx:  0.00, dy:  0.00 }, { dx: -0.18, dy: -0.18 }, { dx:  0.18, dy: -0.18 },
    ],
    lines: [[0,1],[1,2],[0,3],[2,3],[3,4],[3,5],[4,5]],
  },
  {
    name: 'Scorpius', symbol: '♏', startDate: '10-23', endDate: '11-21',
    stars: [
      { dx: -0.10, dy: -0.32 }, { dx:  0.05, dy: -0.22 }, { dx:  0.10, dy: -0.08 },
      { dx:  0.05, dy:  0.05 }, { dx: -0.02, dy:  0.18 }, { dx: -0.10, dy:  0.28 },
      { dx: -0.05, dy:  0.38 }, { dx:  0.08, dy:  0.42 }, { dx:  0.20, dy:  0.36 },
      { dx:  0.25, dy:  0.24 },
    ],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9]],
  },
  {
    name: 'Sagittarius', symbol: '♐', startDate: '11-22', endDate: '12-21',
    stars: [
      { dx:  0.00, dy: -0.30 }, { dx: -0.10, dy: -0.15 }, { dx:  0.10, dy: -0.15 },
      { dx: -0.20, dy:  0.00 }, { dx:  0.00, dy:  0.05 }, { dx:  0.20, dy:  0.00 },
      { dx: -0.28, dy:  0.18 }, { dx:  0.00, dy:  0.22 }, { dx:  0.25, dy:  0.18 },
      { dx: -0.15, dy:  0.35 }, { dx:  0.15, dy:  0.35 },
    ],
    lines: [[0,1],[0,2],[1,3],[2,5],[3,4],[4,5],[3,6],[4,7],[5,8],[6,9],[7,9],[7,10],[8,10]],
  },
]

export function getConstellationByBirthday(month: number, day: number): ConstellationDef {
  for (const c of CONSTELLATIONS) {
    const [sm, sd] = c.startDate.split('-').map(Number)
    const [em, ed] = c.endDate.split('-').map(Number)

    if (sm > em) {
      // year-spanning (Capricorn: 12/22 ~ 1/19)
      if ((month === sm && day >= sd) || month > sm ||
          (month === em && day <= ed) || month < em) return c
    } else {
      if ((month === sm && day >= sd) || (month === em && day <= ed) ||
          (month > sm && month < em)) return c
    }
  }
  return CONSTELLATIONS[2] // default: Pisces
}