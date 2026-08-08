'use client'

import { motion } from 'framer-motion'
import PlanCard from './PlanCard'
import type { Plan } from '@/types'

interface PlansCarouselProps {
  plans: Plan[]
  popularId?: string
}

export default function PlansCarousel({ plans, popularId }: PlansCarouselProps) {

  return (
    <div className="relative w-full">
      {/* Carousel Container — Horizontal scroll with CSS Grid */}
      <div className="relative overflow-x-auto overflow-y-hidden [-webkit-overflow-scrolling:touch] scroll-smooth">
        <div className="flex gap-3 lg:gap-4 min-w-min px-4 py-2">
          {plans.map((plan, i) => (
            <div
              key={plan.id}
              className="flex-shrink-0 w-[calc(100vw-32px)] sm:w-[calc(50vw-20px)] lg:w-[calc((100vw-120px)/4)] min-w-[280px]"
              style={{
                scrollSnapAlign: 'start',
                scrollSnapStop: 'always'
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <PlanCard
                  plan={plan}
                  index={i}
                  isPopular={plan.id === popularId}
                />
              </motion.div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
