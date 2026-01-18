/**
 * Confetti animation for high scores
 */
'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ConfettiProps {
  trigger: boolean
}

export function Confetti({ trigger }: ConfettiProps) {
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; rotation: number; color: string }>
  >([])

  useEffect(() => {
    if (trigger) {
      // Generate confetti particles
      const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8']
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
      }))
      setParticles(newParticles)

      // Clear after animation
      setTimeout(() => setParticles([]), 3000)
    }
  }, [trigger])

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            initial={{
              x: `${particle.x}vw`,
              y: -20,
              rotate: 0,
              opacity: 1,
            }}
            animate={{
              y: '100vh',
              rotate: particle.rotation * 4,
              opacity: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 2 + Math.random(),
              ease: 'easeIn',
            }}
            style={{
              position: 'absolute',
              width: '10px',
              height: '10px',
              backgroundColor: particle.color,
              borderRadius: '2px',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
