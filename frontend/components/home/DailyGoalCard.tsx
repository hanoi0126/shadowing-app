/**
 * Daily Goal Card component with progress bar
 */
'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { DailyGoal } from '@/types/stats'

interface DailyGoalCardProps {
  dailyGoal: DailyGoal | null
}

export function DailyGoalCard({ dailyGoal }: DailyGoalCardProps) {
  const completed = dailyGoal?.completed_count || 0
  const target = dailyGoal?.target_count || 5
  const progress = Math.min((completed / target) * 100, 100)
  const remaining = Math.max(target - completed, 0)

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Today's Goal</h3>
            <p className="text-sm text-muted-foreground">
              {completed} / {target} practices completed
            </p>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="text-4xl"
          >
            🎯
          </motion.div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-3" />

          {/* Goal Gradient Effect Message */}
          {remaining > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm font-medium text-primary"
            >
              あと {remaining} 回で達成!
            </motion.p>
          )}

          {remaining === 0 && (
            <motion.p
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-sm font-medium text-green-500"
            >
              🎉 Goal achieved! Great work!
            </motion.p>
          )}
        </div>
      </div>
    </Card>
  )
}
