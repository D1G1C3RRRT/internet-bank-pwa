import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { LanguageSelector } from '@/components/language-selector'
import { getTranslation } from '@/lib/i18n'
import { useRouter } from 'next/navigation'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

describe('Category 11: Language Switcher and Translations', () => {
  let mockRefresh: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockRefresh = jest.fn()
    ;(useRouter as jest.Mock).mockReturnValue({
      refresh: mockRefresh
    })
    
    // Clear cookies
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: ''
    })
  })

  it('Test 1: should translate keys correctly to English and Slovak', () => {
    const en = getTranslation('en')
    const sk = getTranslation('sk')
    
    expect(en.totalBalance).toBe('Total Balance')
    expect(sk.totalBalance).toBe('Celkový zostatok')

    expect(en.signOut).toBe('Sign Out')
    expect(sk.signOut).toBe('Odhlásiť sa')
  })

  it('Test 2: should read the initial language from cookies on mount', () => {
    document.cookie = 'lang=sk'
    
    render(<LanguageSelector />)
    
    const select = screen.getByRole('combobox') as HTMLSelectElement
    expect(select.value).toBe('sk')
  })

  it('Test 3: should update cookies and refresh router when selection is changed', () => {
    document.cookie = 'lang=en'
    render(<LanguageSelector />)

    const select = screen.getByRole('combobox') as HTMLSelectElement
    fireEvent.change(select, { target: { value: 'sk' } })

    expect(document.cookie).toContain('lang=sk')
    expect(mockRefresh).toHaveBeenCalled()
  })
})
