import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes and tailwind-merge for Tailwind class conflicts
 * 
 * @param inputs - Class values (strings, objects, arrays, etc.)
 * @returns Merged class string
 * 
 * @example
 * cn('px-2 py-1', 'bg-red-500', { 'text-white': isActive })
 * cn('px-2', 'px-4') // Returns 'px-4' (tailwind-merge resolves conflict)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
