import React from 'react'
import { render, screen } from '@testing-library/react'
import { AccountCard } from '@/components/account-card'

describe('Category 9: Bank Account Card UI Component', () => {
  const mockAccount = {
    id: 'acc_123',
    accountNumber: 'NL12BUNQ3344',
    accountType: 'checking',
    balance: '250.75',
    currency: 'EUR',
    isActive: true
  }

  it('Test 1: should render correct local account name based on language and index', () => {
    // English checking account (index 0)
    const { rerender } = render(<AccountCard account={mockAccount} index={0} lang="en" />)
    expect(screen.getByText('NL € account')).toBeDefined()

    // Slovak checking account (index 0)
    rerender(<AccountCard account={mockAccount} index={0} lang="sk" />)
    expect(screen.getByText('NL € účet')).toBeDefined()

    // Spanish checking account (index 2) in English
    rerender(<AccountCard account={mockAccount} index={2} lang="en" />)
    expect(screen.getByText('Spanish account')).toBeDefined()
  })

  it('Test 2: should correctly split integer and decimal parts of the balance with localized symbols', () => {
    // EUR uses comma separating decimals, e.g. 250,75 €
    const { container } = render(<AccountCard account={mockAccount} index={0} lang="en" />)
    
    expect(screen.getByText('250')).toBeDefined()
    expect(container.textContent).toContain(',75 €')

    // USD uses dot separating decimals, e.g. 250.75 $
    const usdAccount = { ...mockAccount, currency: 'USD' }
    const { container: usdContainer } = render(<AccountCard account={usdAccount} index={0} lang="en" />)
    expect(usdContainer.textContent).toContain('.75 $')
  })

  it('Test 3: should display inactive label if account is not active', () => {
    const inactiveAccount = { ...mockAccount, isActive: false }
    
    // English Inactive label
    const { rerender } = render(<AccountCard account={inactiveAccount} index={0} lang="en" />)
    expect(screen.getByText('Inactive')).toBeDefined()

    // Slovak Inactive label
    rerender(<AccountCard account={inactiveAccount} index={0} lang="sk" />)
    expect(screen.getByText('Neaktívny')).toBeDefined()
  })
})
