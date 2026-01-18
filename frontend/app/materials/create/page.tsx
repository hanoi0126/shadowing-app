/**
 * Material creation page
 */
'use client'

import { motion } from 'framer-motion'
import { Container } from '@/components/layout/Container'
import { MaterialForm } from '@/components/create/MaterialForm'
import { Card } from '@/components/ui/card'

export default function CreateMaterialPage() {
  return (
    <Container>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto space-y-8"
      >
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">Create New Material</h1>
          <p className="text-muted-foreground">
            Add a new shadowing practice material with custom sentences
          </p>
        </div>

        {/* Instructions */}
        <Card className="p-6 bg-primary/5 border-primary/20">
          <h2 className="font-semibold mb-3">How it works:</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Enter a title and optional description for your material</li>
            <li>Select the difficulty level (beginner, intermediate, or advanced)</li>
            <li>Add the sentences you want to practice</li>
            <li>Click "Create Material" to generate audio and timestamps</li>
            <li>Start practicing right away!</li>
          </ol>
        </Card>

        {/* Form */}
        <MaterialForm />
      </motion.div>
    </Container>
  )
}
