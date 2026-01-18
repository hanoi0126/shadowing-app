/**
 * Stats store using Zustand
 */
import { create } from 'zustand'
import { apiClient } from '@/lib/api-client'
import type { UserStats, DailyGoal, Achievement } from '@/types/stats'

interface StatsState {
  userStats: UserStats | null
  dailyGoal: DailyGoal | null
  achievements: Achievement[]
  isLoading: boolean

  // Actions
  fetchStats: () => Promise<void>
  fetchDailyGoal: () => Promise<void>
  fetchAchievements: () => Promise<void>
  updateStats: (stats: UserStats) => void
  updateDailyGoal: (goal: DailyGoal) => void
  addAchievements: (newAchievements: Achievement[]) => void
}

export const useStatsStore = create<StatsState>((set, get) => ({
  userStats: null,
  dailyGoal: null,
  achievements: [],
  isLoading: false,

  fetchStats: async () => {
    try {
      set({ isLoading: true })
      const response = await apiClient.get('/api/stats')
      set({ userStats: response.data, isLoading: false })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      set({ isLoading: false })
    }
  },

  fetchDailyGoal: async () => {
    try {
      const response = await apiClient.get('/api/daily-goal')
      set({ dailyGoal: response.data })
    } catch (error) {
      console.error('Failed to fetch daily goal:', error)
    }
  },

  fetchAchievements: async () => {
    try {
      const response = await apiClient.get('/api/achievements')
      set({ achievements: response.data })
    } catch (error) {
      console.error('Failed to fetch achievements:', error)
    }
  },

  updateStats: stats => set({ userStats: stats }),

  updateDailyGoal: goal => set({ dailyGoal: goal }),

  addAchievements: newAchievements => {
    const current = get().achievements
    set({ achievements: [...current, ...newAchievements] })
  },
}))
