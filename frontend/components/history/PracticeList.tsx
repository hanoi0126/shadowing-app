/**
 * Practice list showing recent practice logs
 */
'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { PracticeLog } from '@/types/practice'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface PracticeListProps {
  logs: PracticeLog[]
}

export function PracticeList({ logs }: PracticeListProps) {
  const router = useRouter()

  const groupByDate = (logs: PracticeLog[]) => {
    const groups: { [key: string]: PracticeLog[] } = {}
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    logs.forEach(log => {
      const logDate = new Date(log.created_at)
      let key = logDate.toLocaleDateString()

      if (logDate.toDateString() === today.toDateString()) {
        key = 'Today'
      } else if (logDate.toDateString() === yesterday.toDateString()) {
        key = 'Yesterday'
      }

      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(log)
    })

    return groups
  }

  const getScoreTrend = (currentScore: number, index: number) => {
    if (index === logs.length - 1) return 'neutral'
    const previousScore = logs[index + 1].score
    if (currentScore > previousScore + 5) return 'up'
    if (currentScore < previousScore - 5) return 'down'
    return 'neutral'
  }

  const groupedLogs = groupByDate(logs)

  if (logs.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="space-y-3">
          <div className="text-4xl">📝</div>
          <p className="text-muted-foreground">No practice history yet</p>
          <p className="text-sm text-muted-foreground">
            Start practicing to see your progress here!
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedLogs).map(([date, dateLogs]) => (
        <div key={date}>
          <h3 className="text-lg font-semibold mb-3">{date}</h3>
          <div className="space-y-3">
            {dateLogs.map((log, index) => {
              const globalIndex = logs.findIndex(l => l.id === log.id)
              const trend = getScoreTrend(log.score, globalIndex)

              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className="p-4 cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]"
                    onClick={() => router.push(`/materials/${log.material_id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium">Practice Session</h4>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{Math.floor(log.duration_seconds / 60)}min</span>
                          <span>+{log.xp_gained} XP</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {/* Trend Indicator */}
                        {trend === 'up' && <TrendingUp className="w-5 h-5 text-green-500" />}
                        {trend === 'down' && <TrendingDown className="w-5 h-5 text-red-500" />}
                        {trend === 'neutral' && <Minus className="w-5 h-5 text-muted-foreground" />}

                        {/* Score Badge */}
                        <Badge
                          variant={log.score >= 80 ? 'default' : 'secondary'}
                          className="text-lg px-3 py-1"
                        >
                          {log.score.toFixed(0)}%
                        </Badge>
                      </div>
                    </div>

                    {/* AI Feedback Preview */}
                    {log.ai_feedback && (
                      <div className="mt-3 p-3 rounded-md bg-muted/30 text-xs text-muted-foreground line-clamp-2">
                        {log.ai_feedback}
                      </div>
                    )}
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
