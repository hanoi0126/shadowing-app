/**
 * Score display with count-up animation
 */
'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ScoreDisplayProps {
  score: number
  previousScore?: number
}

export function ScoreDisplay({ score, previousScore }: ScoreDisplayProps) {
  const [displayScore, setDisplayScore] = useState(0)

  useEffect(() => {
    // Count-up animation
    const duration = 1500 // 1.5 seconds
    const steps = 60
    const increment = score / steps
    const stepDuration = duration / steps

    let currentStep = 0
    const timer = setInterval(() => {
      currentStep++
      if (currentStep >= steps) {
        setDisplayScore(score)
        clearInterval(timer)
      } else {
        setDisplayScore(Math.floor(increment * currentStep))
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [score])

  const getScoreLabel = (score: number) => {
    if (score >= 95) return { text: 'Perfect!', color: 'text-green-500' }
    if (score >= 90) return { text: 'Excellent!', color: 'text-green-400' }
    if (score >= 80) return { text: 'Great!', color: 'text-blue-500' }
    if (score >= 70) return { text: 'Good!', color: 'text-yellow-500' }
    if (score >= 60) return { text: 'Nice Try!', color: 'text-orange-500' }
    return { text: 'Keep Practicing!', color: 'text-muted-foreground' }
  }

  const getScoreChange = () => {
    if (previousScore === undefined) return null
    const change = score - previousScore
    if (change === 0) return null
    return change
  }

  const scoreLabel = getScoreLabel(score)
  const scoreChange = getScoreChange()

  return (
    <Card className="p-8">
      <div className="text-center space-y-6">
        {/* Score Label */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className={`text-3xl font-bold ${scoreLabel.color}`}>{scoreLabel.text}</h2>
        </motion.div>

        {/* Score Number */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="relative"
        >
          <div className="text-8xl font-black">
            {displayScore}
            <span className="text-5xl text-muted-foreground">%</span>
          </div>

          {/* Score Change Badge */}
          {scoreChange !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.5 }}
              className="absolute -top-4 -right-4"
            >
              <Badge
                variant={scoreChange > 0 ? 'default' : 'secondary'}
                className="text-lg px-3 py-1"
              >
                {scoreChange > 0 ? '+' : ''}
                {scoreChange}%
              </Badge>
            </motion.div>
          )}
        </motion.div>

        {/* Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-muted-foreground"
        >
          {score >= 90
            ? 'Outstanding performance! Keep up the excellent work!'
            : score >= 70
              ? "Great job! You're making solid progress!"
              : 'Good effort! Practice makes perfect!'}
        </motion.p>
      </div>
    </Card>
  )
}
