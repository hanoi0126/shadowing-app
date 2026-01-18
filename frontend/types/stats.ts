/**
 * Stats and gamification types for frontend
 */

export interface UserStats {
  id: string
  user_id: string
  current_streak: number
  longest_streak: number
  total_practices: number
  total_time_seconds: number
  total_xp: number
  level: number
  average_score: number
}

export interface DailyGoal {
  id: string
  user_id: string
  target_count: number
  completed_count: number
  goal_date: string
}

export interface Achievement {
  id: string
  user_id: string
  achievement_type: string
  title: string
  description: string
  icon: string
  unlocked_at: string
}

export interface PracticeLogResponse {
  log_id: string
  user_stats: UserStats
  daily_goal: DailyGoal
  new_achievements: Achievement[]
  streak_updated: boolean
}
