/**
 * History page showing stats and practice logs
 */
'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Container } from '@/components/layout/Container'
import { StatsCards } from '@/components/history/StatsCards'
import { PracticeList } from '@/components/history/PracticeList'
import { useStatsStore } from '@/store/stats-store'
import { apiClient } from '@/lib/api-client'
import type { PracticeLog } from '@/types/practice'

export default function HistoryPage() {
  const { userStats, fetchStats } = useStatsStore()
  const [practiceLogs, setPracticeLogs] = useState<PracticeLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch stats
        await fetchStats()

        // Fetch practice logs
        // Note: This endpoint needs to be created in the backend
        // For now, we'll use empty array
        try {
          const logsResponse = await apiClient.get('/api/practice-logs')
          setPracticeLogs(logsResponse.data)
        } catch (error) {
          console.log('Practice logs endpoint not yet implemented')
          setPracticeLogs([])
        }
      } catch (error) {
        console.error('Failed to fetch history:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [fetchStats])

  if (isLoading) {
    return (
      <Container>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="text-4xl">⏳</div>
            <p className="text-muted-foreground">Loading history...</p>
          </div>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">Practice History</h1>
          <p className="text-muted-foreground">Track your progress and review past sessions</p>
        </div>

        {/* Stats Cards */}
        <StatsCards stats={userStats} />

        {/* Practice Logs */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Recent Practice Sessions</h2>
          <PracticeList logs={practiceLogs} />
        </div>
      </motion.div>
    </Container>
  )
}
