/**
 * AI Feedback display component
 */
'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Sparkles } from 'lucide-react'

interface AIFeedbackProps {
  feedback: string
  xpGained: number
}

export function AIFeedback({ feedback, xpGained }: AIFeedbackProps) {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-3"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">AI Feedback</h2>
            <p className="text-xs text-muted-foreground">Personalized insights for improvement</p>
          </div>
        </motion.div>

        {/* Feedback Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-lg bg-primary/5 border border-primary/10"
        >
          <p className="text-sm leading-relaxed">{feedback}</p>
        </motion.div>

        {/* XP Gained */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center space-x-2 p-3 rounded-lg bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20"
        >
          <span className="text-2xl">⭐</span>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-500">+{xpGained} XP</div>
            <div className="text-xs text-muted-foreground">Experience gained</div>
          </div>
        </motion.div>
      </div>
    </Card>
  )
}
