import React from 'react'
import { scrollToId } from '../../lib/scroll'

export interface StoryRailProps {
  steps?: Array<{ id: string; label: string; number: string }>
}

const defaultSteps = [
  { id: 'welcome-world', label: 'Welcome', number: '01' },
  { id: 'teddy-bears', label: 'Teddy Bears', number: '02' },
  { id: 'dolls', label: 'Dolls', number: '03' },
  { id: 'perfect-gift', label: 'Perfect Gift', number: '04' },
  { id: 'favorite-companions', label: 'Favorite Friends', number: '05' },
]

export const StoryRail: React.FC<StoryRailProps> = ({ steps = defaultSteps }) => {
  const [active, setActive] = React.useState(steps[0].id)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible?.target.id) setActive(visible.target.id)
      },
      { rootMargin: '-35% 0px -45% 0px', threshold: [0, 0.15, 0.4, 0.7] },
    )

    steps.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })
    return () => observer.disconnect()
  }, [steps])

  return (
    <nav
      aria-label="Homepage story sections"
      className="fixed left-2 top-1/2 z-30 hidden -translate-y-1/2 min-[1180px]:block"
    >
      <ol className="space-y-5">
        {steps.map((step) => {
          const isActive = active === step.id
          return (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => scrollToId(step.id)}
                aria-current={isActive ? 'step' : undefined}
                className="group flex items-center gap-2.5 text-left min-[1600px]:gap-3"
              >
                <span
                  aria-hidden="true"
                  className={`h-px transition-all duration-300 ${
                    isActive
                      ? 'w-5 bg-cyan min-[1600px]:w-9'
                      : 'w-2 bg-marron/30 min-[1600px]:w-3'
                  }`}
                />
                <span
                  className={`hidden whitespace-nowrap text-[9px] font-semibold uppercase tracking-[0.24em] transition-colors min-[1600px]:inline ${
                    isActive ? 'text-marron' : 'text-marron/35 group-hover:text-marron/70'
                  }`}
                >
                  <span className="mr-1.5 tabular-nums text-cyan">{step.number}</span>
                  {step.label}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
