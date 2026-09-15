import React, { useMemo, useState } from 'react'

export type ExpenseSlice = {
  category: string
  value: number
}

const sliceColors = ['#0369a1', '#0ea5a6', '#b45309', '#7c3aed', '#be123c', '#0f766e', '#1d4ed8']
const otherColor = '#64748b'
const maxVisibleSlices = 6

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatPercent(value: number) {
  return value.toLocaleString('pt-BR', { style: 'percent', maximumFractionDigits: 1 })
}

function shortLabel(value: string) {
  return value.length > 18 ? `${value.slice(0, 17)}…` : value
}

function polar(cx: number, cy: number, radius: number, angle: number) {
  const radians = (angle - 90) * (Math.PI / 180)
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians)
  }
}

function donutPath(cx: number, cy: number, outerRadius: number, innerRadius: number, startAngle: number, endAngle: number) {
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  const outerStart = polar(cx, cy, outerRadius, startAngle)
  const outerEnd = polar(cx, cy, outerRadius, endAngle)
  const innerEnd = polar(cx, cy, innerRadius, endAngle)
  const innerStart = polar(cx, cy, innerRadius, startAngle)
  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    'Z'
  ].join(' ')
}

function buildSlices(items: ExpenseSlice[]) {
  const grouped = new Map<string, number>()
  items.forEach(item => {
    const category = item.category.trim() || 'Sem categoria'
    grouped.set(category, (grouped.get(category) || 0) + item.value)
  })

  const ranked = [...grouped.entries()]
    .map(([category, value]) => ({ category, value }))
    .filter(item => item.value > 0)
    .sort((left, right) => right.value - left.value)

  if (ranked.length <= maxVisibleSlices) return ranked

  const visible = ranked.slice(0, maxVisibleSlices - 1)
  const otherValue = ranked.slice(maxVisibleSlices - 1).reduce((sum, item) => sum + item.value, 0)
  return [...visible, { category: 'Outros', value: otherValue }]
}

export default function ExpensePieChart({ items, periodLabel }: { items: ExpenseSlice[], periodLabel: string }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const slices = useMemo(() => buildSlices(items), [items])
  const total = slices.reduce((sum, slice) => sum + slice.value, 0)
  const active = activeIndex === null ? null : slices[activeIndex]

  let angle = 0
  const drawn = slices.map((slice, index) => {
    const span = total > 0 ? (slice.value / total) * 360 : 0
    const startAngle = angle
    const endAngle = angle + span
    angle = endAngle
    return {
      ...slice,
      index,
      color: slice.category === 'Outros' ? otherColor : sliceColors[index % sliceColors.length],
      startAngle,
      endAngle,
      percent: total > 0 ? slice.value / total : 0
    }
  })

  return (
    <section className="transparency-section expense-chart-section" aria-label={`Despesas por categoria em ${periodLabel}`}>
      <div className="section-heading">
        <div>
          <span className="section-label">Despesas de {periodLabel}</span>
          <h2>Gastos por categoria</h2>
        </div>
        <span className="section-count">{slices.length} {slices.length === 1 ? 'categoria' : 'categorias'}</span>
      </div>

      <div className="expense-chart">
        <div className="expense-chart-visual">
          <svg viewBox="0 0 200 200" role="img" aria-label={total === 0 ? `Nenhuma despesa em ${periodLabel}` : `Despesas de ${periodLabel} por categoria`}>
            {total === 0 && (
              <circle cx="100" cy="100" r="72" fill="none" stroke="rgba(15,23,42,0.12)" strokeWidth="24" strokeDasharray="8 10" />
            )}
            {total > 0 && drawn.length === 1 && (
              <circle
                cx="100"
                cy="100"
                r="72"
                fill="none"
                stroke={drawn[0].color}
                strokeWidth={activeIndex === 0 ? 28 : 24}
                onMouseEnter={() => setActiveIndex(0)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <title>{`${drawn[0].category}: ${formatCurrency(drawn[0].value)} (${formatPercent(drawn[0].percent)})`}</title>
              </circle>
            )}
            {total > 0 && drawn.length > 1 && drawn.map(slice => {
              const isActive = activeIndex === slice.index
              const outer = isActive ? 86 : 84
              const inner = isActive ? 58 : 60
              return (
                <path
                  key={slice.category}
                  d={donutPath(100, 100, outer, inner, slice.startAngle, slice.endAngle)}
                  fill={slice.color}
                  opacity={activeIndex === null || isActive ? 1 : 0.45}
                  onMouseEnter={() => setActiveIndex(slice.index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  onFocus={() => setActiveIndex(slice.index)}
                  onBlur={() => setActiveIndex(null)}
                  tabIndex={0}
                >
                  <title>{`${slice.category}: ${formatCurrency(slice.value)} (${formatPercent(slice.percent)})`}</title>
                </path>
              )
            })}
            <text x="100" y="90" textAnchor="middle" className="expense-chart-center-label">
              {active ? shortLabel(active.category) : 'Total'}
            </text>
            <text x="100" y="112" textAnchor="middle" className="expense-chart-center-value">
              {formatCurrency(active ? active.value : total)}
            </text>
          </svg>
        </div>

        {total === 0 ? (
          <div className="dashboard-empty">
            <strong>Nenhuma despesa neste período</strong>
            <span>Quando houver saídas, o gráfico mostra a participação de cada categoria.</span>
          </div>
        ) : (
          <ul className="expense-legend">
            {drawn.map(slice => (
              <li key={slice.category}>
                <button
                  type="button"
                  className={`expense-legend-item${activeIndex === slice.index ? ' is-active' : ''}`}
                  onMouseEnter={() => setActiveIndex(slice.index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  onFocus={() => setActiveIndex(slice.index)}
                  onBlur={() => setActiveIndex(null)}
                >
                  <span className="expense-swatch" style={{ background: slice.color }} aria-hidden="true" />
                  <span className="expense-legend-copy">
                    <strong>{slice.category}</strong>
                    <span>{formatPercent(slice.percent)}</span>
                  </span>
                  <span className="expense-legend-value">{formatCurrency(slice.value)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
