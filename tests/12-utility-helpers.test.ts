import { accountLast4, cn, roundMoney } from '@/lib/utils'

describe('Category 12: Tailwind Merge Utility (cn)', () => {
  it('masks account numbers using the final four alphanumeric characters', () => {
    expect(accountLast4('ACC-116004D9-518')).toBe('9518')
  })

  it('rounds half-cent financial values consistently', () => {
    expect(roundMoney(0.5 * 201.45)).toBe(100.73)
    expect(roundMoney(0.25 * 3150.1)).toBe(787.53)
  })

  it('Test 1: should merge multiple plain class strings together', () => {
    const result = cn('text-sm', 'text-foreground', 'font-semibold')
    expect(result).toBe('text-sm text-foreground font-semibold')
  })

  it('Test 2: should resolve conflicts in Tailwind CSS classes correctly (last one wins)', () => {
    // px-2 and px-4 conflict, px-4 should win
    const result = cn('px-2 py-1', 'px-4')
    expect(result).toBe('py-1 px-4')

    // bg-red-500 and bg-blue-500 conflict, bg-blue-500 should win
    const bgResult = cn('bg-red-500 text-white', 'bg-blue-500')
    expect(bgResult).toBe('text-white bg-blue-500')
  })

  it('Test 3: should handle falsy inputs, empty inputs, and conditional objects gracefully', () => {
    const isActive = true
    const isDisabled = false
    
    const result = cn(
      'btn-base',
      isActive && 'btn-active',
      isDisabled && 'btn-disabled',
      null,
      undefined,
      false,
      { 'shadow-lg': true, 'border-red-500': false }
    )
    
    expect(result).toBe('btn-base btn-active shadow-lg')
  })
})
