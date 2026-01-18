/**
 * Material types for frontend
 */

export interface Sentence {
  id: string
  text: string
  start_time: number
  end_time: number
  sequence_order: number
}

export interface Material {
  id: string
  title: string
  description?: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  audio_url?: string
  duration_seconds?: number
  created_by?: string
  created_at: string
  sentences: Sentence[]
}

export interface MaterialListItem {
  id: string
  title: string
  description?: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  audio_url?: string
  duration_seconds?: number
  created_at: string
  practice_count: number
  best_score?: number
}

export interface MaterialCreateRequest {
  title: string
  description?: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  sentences: string[]
}
