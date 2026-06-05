import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function accountLast4(accountNumber: string) {
  return accountNumber.replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase().padStart(4, '•')
}

export function roundMoney(value: number) {
  if (!Number.isFinite(value)) return 0
  const correction = Number.EPSILON * Math.max(1, Math.abs(value))
  return Math.round((value + correction) * 100) / 100
}
