import React from 'react'
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { User } from "lucide-react"

export function UserAvatar({ user, size = "md", className = "" }) {
  // Get initials from name or username
  const getInitials = () => {
    if (!user) return '?'
    
    if (user.name) {
      return user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    }
    
    if (user.username) {
      return user.username.substring(0, 2).toUpperCase()
    }
    
    if (user.email) {
      return user.email.substring(0, 2).toUpperCase()
    }
    
    return '?'
  }
  
  // Determine size
  const sizeClasses = {
    xs: "h-6 w-6 text-xs",
    sm: "h-8 w-8 text-sm",
    md: "h-10 w-10 text-base",
    lg: "h-16 w-16 text-xl",
    xl: "h-24 w-24 text-2xl"
  }
  
  const sizeClass = sizeClasses[size] || sizeClasses.md
  
  // Generate a consistent color based on username or email
  const generateColor = () => {
    if (!user) return 'bg-primary/20'
    
    const string = user.username || user.email || user.name || ''
    let hash = 0
    
    for (let i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash)
    }
    
    const colors = [
      'bg-red-500/20 text-red-700 dark:text-red-300',
      'bg-orange-500/20 text-orange-700 dark:text-orange-300',
      'bg-amber-500/20 text-amber-700 dark:text-amber-300',
      'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300',
      'bg-lime-500/20 text-lime-700 dark:text-lime-300',
      'bg-green-500/20 text-green-700 dark:text-green-300',
      'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
      'bg-teal-500/20 text-teal-700 dark:text-teal-300',
      'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300',
      'bg-sky-500/20 text-sky-700 dark:text-sky-300',
      'bg-blue-500/20 text-blue-700 dark:text-blue-300',
      'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300',
      'bg-violet-500/20 text-violet-700 dark:text-violet-300',
      'bg-purple-500/20 text-purple-700 dark:text-purple-300',
      'bg-fuchsia-500/20 text-fuchsia-700 dark:text-fuchsia-300',
      'bg-pink-500/20 text-pink-700 dark:text-pink-300',
      'bg-rose-500/20 text-rose-700 dark:text-rose-300',
    ]
    
    return colors[Math.abs(hash) % colors.length]
  }
  
  return (
    <Avatar className={`${sizeClass} ${className} ring-2 ring-background`}>
      {user?.image ? (
        <AvatarImage 
          src={user.image} 
          alt={user.name || user.username || "User"} 
          className="object-cover"
        />
      ) : null}
      <AvatarFallback className={`${generateColor()} font-semibold`}>
        {user ? getInitials() : <User className="h-4 w-4" />}
      </AvatarFallback>
    </Avatar>
  )
} 