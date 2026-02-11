"use client"

import { useState } from "react"
import { Play, Pause, Volume2 } from "lucide-react"
import { motion } from "framer-motion"

interface VoiceNotePlayerProps {
  transcript: string
  duration?: number // in seconds
}

export function VoiceNotePlayer({ transcript, duration = 0 }: VoiceNotePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)

  const handlePlay = () => {
    setIsPlaying(true)
    // Simulate playback
    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= duration) {
          setIsPlaying(false)
          clearInterval(interval)
          return 0
        }
        return prev + 0.1
      })
    }, 100)
  }

  const handlePause = () => {
    setIsPlaying(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
      <div className="flex items-center space-x-3 mb-3">
        <button
          onClick={isPlaying ? handlePause : handlePlay}
          className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow border border-slate-200"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 text-slate-700" />
          ) : (
            <Play className="w-4 h-4 text-slate-700" />
          )}
        </button>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-600">Sprachnotiz</span>
            <span className="text-xs text-slate-500">
              {formatTime(currentTime)} / {formatTime(duration || 0)}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#B8903A] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            />
          </div>
        </div>
        <Volume2 className="w-4 h-4 text-slate-400" />
      </div>
      <div className="mt-3 pt-3 border-t border-slate-200">
        <p className="text-sm text-slate-700 leading-relaxed">{transcript}</p>
      </div>
    </div>
  )
}

