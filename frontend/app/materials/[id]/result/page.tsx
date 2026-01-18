/**
 * Result page showing score, comparison, and AI feedback
 */
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/button'
import { ScoreDisplay } from '@/components/result/ScoreDisplay'
import { ComparisonView } from '@/components/result/ComparisonView'
import { AIFeedback } from '@/components/result/AIFeedback'
import { Confetti } from '@/components/result/Confetti'
import { apiClient } from '@/lib/api-client'
import { usePracticeStore } from '@/store/practice-store'
import { useStatsStore } from '@/store/stats-store'
import { useToast } from '@/hooks/use-toast'
import type { FeedbackResponse } from '@/types/practice'
import { ArrowLeft, Home, RotateCcw } from 'lucide-react'

export default function ResultPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const materialId = params.id as string
  const scoreParam = searchParams.get('score')

  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const { transcript, currentMaterial, reset } = usePracticeStore()
  const { updateStats, updateDailyGoal, addAchievements } = useStatsStore()

  useEffect(() => {
    const loadFeedback = async () => {
      try {
        setIsLoading(true)

        // Simulated loading delay (Illusion of Labor)
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Get feedback from practice store or fetch
        if (!feedback && transcript) {
          const response = await apiClient.post('/api/feedback', {
            material_id: materialId,
            user_transcript: transcript,
          })
          setFeedback(response.data)

          // Trigger confetti for high scores
          if (response.data.score >= 90) {
            setShowConfetti(true)
          }
        }
      } catch (error) {
        console.error('Failed to load feedback:', error)
        toast({
          title: 'Error',
          description: 'Failed to load results',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadFeedback()
  }, [materialId, transcript, feedback, toast])

  const handleSaveAndContinue = async () => {
    if (!feedback || !currentMaterial) return

    try {
      setIsSaving(true)

      // Save practice log
      const response = await apiClient.post('/api/practice-logs', {
        material_id: materialId,
        score: feedback.score,
        duration_seconds: currentMaterial.duration_seconds || 30,
        user_transcript: transcript,
        ai_feedback: feedback.ai_feedback,
        xp_gained: feedback.xp_gained,
      })

      // Update stats stores
      updateStats(response.data.user_stats)
      updateDailyGoal(response.data.daily_goal)
      if (response.data.new_achievements.length > 0) {
        addAchievements(response.data.new_achievements)

        // Show achievement toast
        response.data.new_achievements.forEach((achievement: any) => {
          toast({
            title: `🏆 Achievement Unlocked!`,
            description: achievement.title,
          })
        })
      }

      // Reset practice store
      reset()

      // Navigate to home
      router.push('/')
    } catch (error) {
      console.error('Failed to save practice:', error)
      toast({
        title: 'Error',
        description: 'Failed to save your practice',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleTryAgain = () => {
    reset()
    router.push(`/materials/${materialId}`)
  }

  if (isLoading) {
    return (
      <Container>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="text-6xl"
          >
            ⚙️
          </motion.div>
          <div className="space-y-2 text-center">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg font-medium"
            >
              Processing audio...
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-muted-foreground"
            >
              Matching words...
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-sm text-muted-foreground"
            >
              Generating feedback...
            </motion.p>
          </div>
        </div>
      </Container>
    )
  }

  if (!feedback) {
    return (
      <Container>
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No results available</p>
          <Button onClick={() => router.push(`/materials/${materialId}`)}>Go back</Button>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <Confetti trigger={showConfetti} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>

        {/* Score Display */}
        <ScoreDisplay score={feedback.score} />

        {/* Comparison and Feedback */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ComparisonView comparison={feedback.comparison} />
          <AIFeedback feedback={feedback.ai_feedback} xpGained={feedback.xp_gained} />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Button size="lg" variant="outline" onClick={handleTryAgain}>
            <RotateCcw className="mr-2 h-5 w-5" />
            Try Again
          </Button>
          <Button size="lg" onClick={handleSaveAndContinue} disabled={isSaving}>
            <Home className="mr-2 h-5 w-5" />
            {isSaving ? 'Saving...' : 'Save & Continue'}
          </Button>
        </div>
      </motion.div>
    </Container>
  )
}
