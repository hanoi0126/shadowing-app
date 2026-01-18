/**
 * Stats cards displaying user statistics
 */
'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import type { UserStats } from '@/types/stats'
import { Flame, BookOpen, Clock, TrendingUp } from 'lucide-react'

interface StatsCardsProps {
  stats: UserStats | null
}

export function StatsCards({ stats }: StatsCardsProps) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const statsData = [
    {
      title: 'Current Streak',
      value: stats?.current_streak || 0,
      unit: 'days',
      icon: Flame,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Total Practices',
      value: stats?.total_practices || 0,
      unit: 'sessions',
      icon: BookOpen,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Total Time',
      value: formatTime(stats?.total_time_seconds || 0),
      unit: '',
      icon: Clock,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Average Score',
      value: stats?.average_score?.toFixed(1) || '0.0',
      unit: '%',
      icon: TrendingUp,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {statsData.map((stat, index) => (
        <motion.div key={index} variants={item}>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 rounded-full ${stat.bgColor} flex items-center justify-center`}
              >
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">
                {stat.value}
                {stat.unit && (
                  <span className="text-lg text-muted-foreground ml-1">{stat.unit}</span>
                )}
              </div>
              <div className="text-sm text-muted-foreground">{stat.title}</div>
            </div>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )
}
