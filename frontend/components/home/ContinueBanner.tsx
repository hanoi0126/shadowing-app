/**
 * Continue Banner component (Zeigarnik Effect)
 */
'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { MaterialListItem } from '@/types/material'

interface ContinueBannerProps {
  lastMaterial: MaterialListItem | null
}

export function ContinueBanner({ lastMaterial }: ContinueBannerProps) {
  const router = useRouter()

  if (!lastMaterial) {
    return null
  }

  const handleContinue = () => {
    router.push(`/materials/${lastMaterial.id}`)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">Continue where you left off</p>
            <h3 className="text-xl font-semibold mb-1">{lastMaterial.title}</h3>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2 py-1 rounded-full bg-background">
                {lastMaterial.difficulty}
              </span>
              {lastMaterial.best_score !== null && (
                <span className="text-xs text-muted-foreground">
                  Best: {lastMaterial.best_score}%
                </span>
              )}
            </div>
          </div>

          <Button onClick={handleContinue} size="lg" className="ml-4">
            Continue
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}
