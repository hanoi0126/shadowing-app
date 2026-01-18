/**
 * Material detail page with practice and recording modes
 */
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Container } from '@/components/layout/Container'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AudioPlayer } from '@/components/practice/AudioPlayer'
import { SubtitleDisplay } from '@/components/practice/SubtitleDisplay'
import { RecordingMode } from '@/components/practice/RecordingMode'
import { apiClient } from '@/lib/api-client'
import { usePracticeStore } from '@/store/practice-store'
import type { Material } from '@/types/material'
import { ArrowLeft } from 'lucide-react'

type TabType = 'practice' | 'record'

export default function MaterialDetailPage() {
  const params = useParams()
  const router = useRouter()
  const materialId = params.id as string

  const [material, setMaterial] = useState<Material | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [activeTab, setActiveTab] = useState<TabType>('practice')

  const { setCurrentMaterial } = usePracticeStore()

  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        setIsLoading(true)
        const response = await apiClient.get(`/api/materials/${materialId}`)
        setMaterial(response.data)
        setCurrentMaterial(response.data)
      } catch (error) {
        console.error('Failed to fetch material:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMaterial()
  }, [materialId, setCurrentMaterial])

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time)
  }

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

  if (isLoading) {
    return (
      <Container>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="text-4xl">⏳</div>
            <p className="text-muted-foreground">Loading material...</p>
          </div>
        </div>
      </Container>
    )
  }

  if (!material) {
    return (
      <Container>
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Material not found</p>
          <Button onClick={() => router.push('/')}>Go back home</Button>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.push('/')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        {/* Material Header */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{material.title}</h1>
                {material.description && (
                  <p className="text-muted-foreground mb-4">{material.description}</p>
                )}
                <div className="flex items-center space-x-3">
                  <Badge className={getDifficultyColor(material.difficulty)}>
                    {material.difficulty}
                  </Badge>
                  {material.duration_seconds && (
                    <span className="text-sm text-muted-foreground">
                      {Math.floor(material.duration_seconds / 60)}:
                      {(material.duration_seconds % 60).toString().padStart(2, '0')}
                    </span>
                  )}
                  <span className="text-sm text-muted-foreground">
                    {material.sentences.length} sentences
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex space-x-2 border-b">
          <button
            onClick={() => setActiveTab('practice')}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'practice'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Practice Mode
          </button>
          <button
            onClick={() => setActiveTab('record')}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'record'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Recording Mode
          </button>
        </div>

        {/* Content */}
        {activeTab === 'practice' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Audio Player */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Audio Player</h2>
              {material.audio_url ? (
                <AudioPlayer audioUrl={material.audio_url} onTimeUpdate={handleTimeUpdate} />
              ) : (
                <p className="text-muted-foreground">No audio available for this material</p>
              )}
            </Card>

            {/* Subtitles */}
            <div>
              <SubtitleDisplay sentences={material.sentences} currentTime={currentTime} />
            </div>
          </div>
        ) : (
          <RecordingMode material={material} />
        )}
      </motion.div>
    </Container>
  )
}
