import { createMemo } from 'solid-js'

interface RadarChartProps {
  stats: {
    systems: number
    uiux: number
    dataScience: number
    automation: number
    qa: number
  }
}

export default function RadarChart(props: RadarChartProps) {
  const cx = 150
  const cy = 150
  const r = 90

  const axes = [
    { name: 'Systems', key: 'systems' as const },
    { name: 'UI/UX', key: 'uiux' as const },
    { name: 'Data Sci', key: 'dataScience' as const },
    { name: 'Automation', key: 'automation' as const },
    { name: 'QA', key: 'qa' as const },
  ]

  const getCoordinates = (index: number, scale = 1) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / 5
    return {
      x: cx + r * scale * Math.cos(angle),
      y: cy + r * scale * Math.sin(angle),
    }
  }

  const gridPolygons = createMemo(() => {
    const scales = [0.2, 0.4, 0.6, 0.8, 1.0]
    return scales.map((scale) => {
      const points = axes.map((_, i) => {
        const coord = getCoordinates(i, scale)
        return `${coord.x},${coord.y}`
      }).join(' ')
      return points
    })
  })

  const statsPolygon = createMemo(() => {
    return axes.map((axis, i) => {
      const val = props.stats[axis.key] || 0.1
      const coord = getCoordinates(i, val)
      return `${coord.x},${coord.y}`
    }).join(' ')
  })

  const vertices = createMemo(() => {
    return axes.map((axis, i) => {
      const val = props.stats[axis.key] || 0.1
      return getCoordinates(i, val)
    })
  })

  return (
    <div class="relative w-300px h-300px mx-auto flex items-center justify-center">
      <svg class="w-full h-full" viewBox="0 0 300 300">
        <defs>
          <radialGradient id="radarGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#BDD5EA" stop-opacity="0.15" />
            <stop offset="70%" stop-color="#577399" stop-opacity="0.4" />
            <stop offset="100%" stop-color="#FE5F55" stop-opacity="0.65" />
          </radialGradient>
        </defs>

        {gridPolygons().map((points) => (
          <polygon
            points={points}
            fill="none"
            stroke="#495867"
            stroke-width="1"
            stroke-dasharray="3,3"
          />
        ))}

        {axes.map((_, i) => {
          const outer = getCoordinates(i, 1.0)
          return (
            <line
              x1={cx}
              y1={cy}
              x2={outer.x}
              y2={outer.y}
              stroke="#495867"
              stroke-width="1.5"
            />
          )
        })}

        <polygon
          points={statsPolygon()}
          fill="url(#radarGrad)"
          stroke="#FE5F55"
          stroke-width="2"
        />

        {vertices().map((v) => (
          <circle cx={v.x} cy={v.y} r="4" fill="#F7F7FF" stroke="#FE5F55" stroke-width="1.5" />
        ))}

        {axes.map((axis, i) => {
          const labelDist = 1.22
          const pos = getCoordinates(i, labelDist)
          const isCenterTop = i === 0
          const isLeft = i === 1 || i === 2
          const textAnchor = isCenterTop ? 'middle' : isLeft ? 'end' : 'start'

          return (
            <text
              x={pos.x}
              y={pos.y + (isCenterTop ? -4 : 4)}
              fill="#BDD5EA"
              font-size="10"
              font-weight="600"
              class="font-montserrat tracking-wider"
              text-anchor={textAnchor}
            >
              {axis.name}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
