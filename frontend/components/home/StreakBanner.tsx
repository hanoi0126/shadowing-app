/**
 * Streak Banner component with fire emoji and calendar
 */
'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import type { UserStats } from '@/types/stats'

interface StreakBannerProps {
  stats: UserStats | null
}

export function StreakBanner({ stats }: StreakBannerProps) {
  const currentStreak = stats?.current_streak || 0
  const longestStreak = stats?.longest_streak || 0

  // Generate last 7 days for calendar
  const getLast7Days = () => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      days.push({
        date: date.getDate(),
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        isPracticed: i === 0 && currentStreak > 0, // Simplified - in production, check actual practice dates
      })
    }
    return days
  }

  const days = getLast7Days()

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        {/* Streak Info */}
        <div className="flex items-center space-x-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="text-6xl"
          >
            🔥
          </motion.div>
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl font-bold"
            >
              {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
            </motion.div>
            <p className="text-sm text-muted-foreground">Current streak</p>
            <p className="text-xs text-muted-foreground mt-1">
              Longest: {longestStreak} {longestStreak === 1 ? 'day' : 'days'}
            </p>
          </div>
        </div>

        {/* Weekly Calendar */}
        <div className="flex space-x-2">
          {days.map((day, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex flex-col items-center"
            >
              <span className="text-xs text-muted-foreground mb-1">{day.day}</span>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                  day.isPracticed
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {day.date}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Card>
  )
}
