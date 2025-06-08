import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date to a relative time string (e.g., "2 hours ago")
 */
export function formatTimeAgo(date) {
  if (!date) return 'unknown time';
  
  const dateObj = new Date(date);
  
  if (isToday(dateObj)) {
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } else if (isYesterday(dateObj)) {
    return 'yesterday';
  } else if (dateObj > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } else {
    return format(dateObj, 'MMM d, yyyy');
  }
}

/**
 * Extract the domain from a URL
 */
export function extractDomain(url) {
  if (!url) return null;
  
  try {
    const domain = new URL(url).hostname.replace(/^www\./, '');
    return domain;
  } catch (error) {
    console.error('Error extracting domain:', error);
    return null;
  }
}

/**
 * Calculate a "hot" score for a post based on votes, age, and comments
 */
export function calculateHotScore(votes, createdAt, commentCount = 0) {
  const ageInHours = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
  const gravity = 1.8; // Gravity controls how quickly score decays with time
  
  // Algorithm similar to Hacker News: score = (votes + comments) / (age + 2)^gravity
  const score = (votes + commentCount * 0.5) / Math.pow(ageInHours + 2, gravity);
  
  return score;
}

/**
 * Validate if an email domain is allowed
 */
export function isValidDomain(email) {
  if (!email || typeof email !== 'string') return false;
  
  const allowedDomains = ['sst.scaler.com', 'scaler.com'];
  const domain = email.split('@')[1]?.toLowerCase();
  
  return domain && allowedDomains.includes(domain);
}
