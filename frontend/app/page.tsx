/**
 * Home page with gamification UI
 */
'use client'

import { useEffect, useState } from 'react'
import { Container } from '@/components/layout/Container'
import { StreakBanner } from '@/components/home/StreakBanner'
import { DailyGoalCard } from '@/components/home/DailyGoalCard'
import { ContinueBanner } from '@/components/home/ContinueBanner'
import { MaterialGrid } from '@/components/home/MaterialGrid'
import { useStatsStore } from '@/store/stats-store'
import { apiClient } from '@/lib/api-client'
import type { MaterialListItem } from '@/types/material'
import { motion } from 'framer-motion'

export default function Home() {
  const { userStats, dailyGoal, fetchStats, fetchDailyGoal } = useStatsStore()
  const [materials, setMaterials] = useState<MaterialListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch all data on mount
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch stats and daily goal
        await Promise.all([fetchStats(), fetchDailyGoal()])

        // Fetch materials
        const materialsResponse = await apiClient.get('/api/materials')
        setMaterials(materialsResponse.data)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [fetchStats, fetchDailyGoal])

  if (isLoading) {
    return (
      <Container>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="text-4xl">⏳</div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </Container>
    )
  }

  // Get last practiced material
  const lastMaterial = materials.length > 0 ? materials[0] : null

  return (
    <Container>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Welcome Section */}
        <div>
          <h1 className="text-4xl font-bold mb-2">Welcome to Shadowing App</h1>
          <p className="text-muted-foreground">
            Practice English shadowing with AI feedback and gamification
          </p>
        </div>

        {/* Gamification Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StreakBanner stats={userStats} />
          <DailyGoalCard dailyGoal={dailyGoal} />
        </div>

        {/* Continue Banner */}
        <ContinueBanner lastMaterial={lastMaterial} />

        {/* Materials Grid */}
        <MaterialGrid materials={materials} />
      </motion.div>
    </Container>
  )
}
