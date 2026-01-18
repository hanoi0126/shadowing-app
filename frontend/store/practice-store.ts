/**
 * Practice store using Zustand
 */
import { create } from 'zustand'
import type { Material } from '@/types/material'
import type { FeedbackResponse } from '@/types/practice'

interface PracticeState {
  currentMaterial: Material | null
  isRecording: boolean
  recordingStartTime: number | null
  transcript: string
  feedback: FeedbackResponse | null

  // Actions
  setCurrentMaterial: (material: Material | null) => void
  startRecording: () => void
  stopRecording: () => void
  setTranscript: (transcript: string) => void
  setFeedback: (feedback: FeedbackResponse | null) => void
  reset: () => void
}

export const usePracticeStore = create<PracticeState>(set => ({
  currentMaterial: null,
  isRecording: false,
  recordingStartTime: null,
  transcript: '',
  feedback: null,

  setCurrentMaterial: material => set({ currentMaterial: material }),

  startRecording: () =>
    set({
      isRecording: true,
      recordingStartTime: Date.now(),
      transcript: '',
      feedback: null,
    }),

  stopRecording: () =>
    set({
      isRecording: false,
    }),

  setTranscript: transcript => set({ transcript }),

  setFeedback: feedback => set({ feedback }),

  reset: () =>
    set({
      currentMaterial: null,
      isRecording: false,
      recordingStartTime: null,
      transcript: '',
      feedback: null,
    }),
}))
