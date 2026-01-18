/**
 * Subtitle display with synchronized highlighting
 */
'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import type { Sentence } from '@/types/material'

interface SubtitleDisplayProps {
  sentences: Sentence[]
  currentTime: number
}

export function SubtitleDisplay({ sentences, currentTime }: SubtitleDisplayProps) {
  const [currentSentence, setCurrentSentence] = useState<Sentence | null>(null)

  useEffect(() => {
    // Find the sentence that should be displayed at current time
    const sentence = sentences.find(s => currentTime >= s.start_time && currentTime <= s.end_time)
    setCurrentSentence(sentence || null)
  }, [currentTime, sentences])

  return (
    <div className="space-y-4">
      {/* Current Sentence (Large) */}
      <Card className="p-8 min-h-[120px] flex items-center justify-center bg-primary/5 border-primary/20">
        <AnimatePresence mode="wait">
          {currentSentence ? (
            <motion.p
              key={currentSentence.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-2xl font-medium text-center leading-relaxed"
            >
              {currentSentence.text}
            </motion.p>
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-muted-foreground"
            >
              Play audio to see subtitles
            </motion.p>
          )}
        </AnimatePresence>
      </Card>

      {/* All Sentences List */}
      <Card className="p-6 max-h-[400px] overflow-y-auto">
        <div className="space-y-3">
          {sentences.map((sentence, index) => {
            const isCurrent = currentSentence?.id === sentence.id
            const isPast = currentTime > sentence.end_time

            return (
              <motion.div
                key={sentence.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-3 rounded-lg transition-all ${
                  isCurrent
                    ? 'bg-primary text-primary-foreground'
                    : isPast
                      ? 'bg-muted/50 text-muted-foreground'
                      : 'bg-background'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-xs font-mono mt-1 opacity-70">
                    {Math.floor(sentence.start_time / 60)}:
                    {(sentence.start_time % 60).toFixed(0).padStart(2, '0')}
                  </span>
                  <p className="flex-1 text-sm leading-relaxed">{sentence.text}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
