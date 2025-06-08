import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatTimeAgo(date) {
  const now = new Date()
  const diffInMs = now - new Date(date)
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInMinutes < 1) return 'just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  if (diffInHours < 24) return `${diffInHours}h ago`
  if (diffInDays < 7) return `${diffInDays}d ago`
  
  return new Date(date).toLocaleDateString()
}

export function calculateHotScore(votes, createdAt, comments = 0) {
  const ageInHours = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60)
  const gravity = 1.8
  const score = (votes + comments * 0.5) / Math.pow(ageInHours + 2, gravity)
  return score
}

export function isValidDomain(email) {
  const allowedDomains = process.env.ALLOWED_DOMAINS?.split(',') || ['sst.scaler.com', 'scaler.com']
  const domain = email.split('@')[1]
  return allowedDomains.includes(domain)
}

export function extractDomain(url) {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return null
  }
} 