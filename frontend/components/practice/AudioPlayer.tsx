/**
 * Audio player with custom controls and time tracking
 */
'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Play, Pause, RotateCcw } from 'lucide-react'

interface AudioPlayerProps {
  audioUrl: string
  onTimeUpdate?: (currentTime: number) => void
  onEnded?: () => void
  autoPlay?: boolean
}

export function AudioPlayer({
  audioUrl,
  onTimeUpdate,
  onEnded,
  autoPlay = false,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
      onTimeUpdate?.(audio.currentTime)
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      onEnded?.()
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [onTimeUpdate, onEnded])

  useEffect(() => {
    if (autoPlay && audioRef.current) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }, [autoPlay])

  // Ensure playback speed is applied to audio element
  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      audio.playbackRate = playbackSpeed
    }
  }, [playbackSpeed, audioUrl])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = value[0]
    setCurrentTime(value[0])
  }

  const handleRestart = () => {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = 0
    setCurrentTime(0)
  }

  const changeSpeed = (speed: number) => {
    const audio = audioRef.current
    if (!audio) return

    const wasPlaying = isPlaying
    audio.playbackRate = speed
    setPlaybackSpeed(speed)

    // If audio was playing, ensure it continues at new speed
    if (wasPlaying && audio.paused) {
      audio.play().catch(err => console.error('Playback failed:', err))
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-4">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Progress Bar */}
      <div className="space-y-2">
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeek}
          className="cursor-pointer"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={handleRestart}>
            <RotateCcw className="h-4 w-4" />
          </Button>

          <Button size="lg" onClick={togglePlay} className="w-20">
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
        </div>

        {/* Speed Control */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-muted-foreground">Speed:</span>
          {[0.5, 0.75, 1.0, 1.25, 1.5].map(speed => (
            <Button
              key={speed}
              variant={playbackSpeed === speed ? 'default' : 'outline'}
              size="sm"
              onClick={() => changeSpeed(speed)}
              className="min-w-[60px]"
            >
              {speed}x
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
