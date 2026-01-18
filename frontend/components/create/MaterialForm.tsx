/**
 * Material creation form
 */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { apiClient } from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import { Plus, X, Loader2 } from 'lucide-react'

export function MaterialForm() {
  const router = useRouter()
  const { toast } = useToast()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner')
  const [sentences, setSentences] = useState<string[]>([''])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addSentence = () => {
    setSentences([...sentences, ''])
  }

  const removeSentence = (index: number) => {
    if (sentences.length <= 1) return
    setSentences(sentences.filter((_, i) => i !== index))
  }

  const updateSentence = (index: number, value: string) => {
    const newSentences = [...sentences]
    newSentences[index] = value
    setSentences(newSentences)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!title.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a title',
        variant: 'destructive',
      })
      return
    }

    const validSentences = sentences.filter(s => s.trim() !== '')
    if (validSentences.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one sentence',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsSubmitting(true)

      const response = await apiClient.post('/api/materials', {
        title: title.trim(),
        description: description.trim() || undefined,
        difficulty,
        sentences: validSentences,
      })

      toast({
        title: 'Success!',
        description: 'Material created successfully',
      })

      // Navigate to the new material
      router.push(`/materials/${response.data.id}`)
    } catch (error: any) {
      console.error('Failed to create material:', error)
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to create material',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <Card className="p-6">
        <label className="block mb-2 text-sm font-medium">
          Title <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="e.g., Daily Conversation Practice"
          required
        />
      </Card>

      {/* Description */}
      <Card className="p-6">
        <label className="block mb-2 text-sm font-medium">Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          rows={3}
          placeholder="Optional description of this material..."
        />
      </Card>

      {/* Difficulty */}
      <Card className="p-6">
        <label className="block mb-3 text-sm font-medium">
          Difficulty <span className="text-destructive">*</span>
        </label>
        <div className="flex flex-wrap gap-3">
          {(['beginner', 'intermediate', 'advanced'] as const).map(level => (
            <button
              key={level}
              type="button"
              onClick={() => setDifficulty(level)}
              className={`px-6 py-3 rounded-lg border-2 transition-all ${
                difficulty === level
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </Card>

      {/* Sentences */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-medium">
            Sentences <span className="text-destructive">*</span>
          </label>
          <Badge variant="secondary">{sentences.filter(s => s.trim()).length} sentences</Badge>
        </div>

        <div className="space-y-3">
          {sentences.map((sentence, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2"
            >
              <span className="text-sm text-muted-foreground w-8">{index + 1}.</span>
              <input
                type="text"
                value={sentence}
                onChange={e => updateSentence(index, e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter a sentence..."
              />
              {sentences.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSentence(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </motion.div>
          ))}
        </div>

        <Button type="button" variant="outline" onClick={addSentence} className="mt-4 w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add Sentence
        </Button>
      </Card>

      {/* Submit */}
      <div className="flex space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/')}
          disabled={isSubmitting}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Material'
          )}
        </Button>
      </div>
    </form>
  )
}
