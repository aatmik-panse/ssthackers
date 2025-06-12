"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export function LoadingScreen() {
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(true)
  
  useEffect(() => {
    // Simulate progress
    const timer = setInterval(() => {
      setProgress(prev => {
        // Slow down progress as it gets closer to 100%
        const increment = Math.max(1, 10 * (1 - prev / 100))
        const newProgress = Math.min(99, prev + increment)
        
        return newProgress
      })
    }, 150)
    
    // Start hiding after content is loaded
    const hideTimer = setTimeout(() => {
      setProgress(100)
      setTimeout(() => setVisible(false), 500) // Fade out animation duration
    }, 1500) // Minimum display time
    
    return () => {
      clearInterval(timer)
      clearTimeout(hideTimer)
    }
  }, [])
  
  if (!visible) return null
  
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
      initial={{ opacity: 1 }}
      animate={{ opacity: progress >= 100 ? 0 : 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col items-center max-w-md px-8">
        <h1 className="text-3xl font-bold mb-6">SST Hackers</h1>
        <div className="w-full bg-muted rounded-full h-2.5 mb-4">
          <motion.div 
            className="bg-primary h-2.5 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
        <p className="text-muted-foreground text-sm">Loading community content...</p>
      </div>
    </motion.div>
  )
} 