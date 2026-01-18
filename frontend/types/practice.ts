/**
 * Practice types for frontend
 */

export interface TranscribeResponse {
  transcript: string
}

export interface WordAnalysis {
  word: string
  status: 'correct' | 'missed' | 'extra'
}

export interface ComparisonResult {
  expected_text: string
  user_text: string
  matched_words: string[]
  missed_words: string[]
  extra_words: string[]
  word_analysis: WordAnalysis[]
}

export interface FeedbackResponse {
  score: number
  comparison: ComparisonResult
  ai_feedback: string
  xp_gained: number
}

export interface PracticeLog {
  id: string
  user_id: string
  material_id: string
  score: number
  duration_seconds: number
  xp_gained: number
  user_transcript: string
  ai_feedback: string
  created_at: string
}

export interface PracticeLogRequest {
  material_id: string
  score: number
  duration_seconds: number
  user_transcript: string
  ai_feedback: string
  xp_gained: number
}
