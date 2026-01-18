/**
 * Material Grid component to display materials
 */
'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { MaterialListItem } from '@/types/material'

interface MaterialGridProps {
  materials: MaterialListItem[]
}

export function MaterialGrid({ materials }: MaterialGridProps) {
  const router = useRouter()

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'intermediate':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'advanced':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Practice Materials</h2>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {materials.map(material => (
          <motion.div key={material.id} variants={item}>
            <Card
              className="p-6 cursor-pointer transition-all hover:shadow-lg hover:scale-105"
              onClick={() => router.push(`/materials/${material.id}`)}
            >
              <div className="space-y-4">
                {/* Title and Difficulty */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">{material.title}</h3>
                  <Badge className={getDifficultyColor(material.difficulty)}>
                    {material.difficulty}
                  </Badge>
                </div>

                {/* Description */}
                {material.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {material.description}
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    {material.duration_seconds && (
                      <span className="text-muted-foreground">
                        {Math.floor(material.duration_seconds / 60)}:
                        {(material.duration_seconds % 60).toString().padStart(2, '0')}
                      </span>
                    )}
                    {material.practice_count > 0 && (
                      <span className="text-muted-foreground">
                        {material.practice_count} practices
                      </span>
                    )}
                  </div>
                  {material.best_score !== null && (
                    <span className="font-medium text-primary">{material.best_score}%</span>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {materials.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No materials available yet.</p>
          <p className="mt-2 text-sm">Create your first material to get started!</p>
        </div>
      )}
    </div>
  )
}
