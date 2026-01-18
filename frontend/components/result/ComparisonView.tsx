/**
 * Comparison view showing expected vs user text
 */
'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ComparisonResult } from '@/types/practice'

interface ComparisonViewProps {
  comparison: ComparisonResult
}

export function ComparisonView({ comparison }: ComparisonViewProps) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-6">Text Comparison</h2>

      <div className="space-y-6">
        {/* Expected Text */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <div className="flex items-center space-x-2">
            <Badge variant="outline">Expected</Badge>
          </div>
          <div className="p-4 rounded-lg bg-muted/30 text-sm leading-relaxed">
            {comparison.expected_text}
          </div>
        </motion.div>

        {/* User Text */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-2"
        >
          <div className="flex items-center space-x-2">
            <Badge variant="outline">Your Answer</Badge>
          </div>
          <div className="p-4 rounded-lg bg-muted/30 text-sm leading-relaxed">
            {comparison.user_text || '(No transcript)'}
          </div>
        </motion.div>

        {/* Word Analysis */}
        {comparison.word_analysis && comparison.word_analysis.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-3"
          >
            <h3 className="font-medium">Word Analysis</h3>
            <div className="flex flex-wrap gap-2">
              {comparison.word_analysis.map((word, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className={
                    word.status === 'correct'
                      ? 'bg-green-500/10 text-green-500 border-green-500/20'
                      : word.status === 'missed'
                        ? 'bg-red-500/10 text-red-500 border-red-500/20'
                        : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                  }
                >
                  {word.word}
                  {word.status === 'missed' && ' (missed)'}
                  {word.status === 'extra' && ' (extra)'}
                </Badge>
              ))}
            </div>
          </motion.div>
        )}

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="grid grid-cols-3 gap-4 pt-4 border-t"
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">
              {comparison.matched_words.length}
            </div>
            <div className="text-xs text-muted-foreground">Correct</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">{comparison.missed_words.length}</div>
            <div className="text-xs text-muted-foreground">Missed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-500">
              {comparison.extra_words.length}
            </div>
            <div className="text-xs text-muted-foreground">Extra</div>
          </div>
        </motion.div>
      </div>
    </Card>
  )
}
