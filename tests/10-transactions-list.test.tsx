import React from 'react'
import { render, screen } from '@testing-library/react'
import { TransactionsList } from '@/components/transactions-list'

describe('Category 10: Transactions List Component', () => {
  const mockTransactions = [
    {
      id: 'tx_1',
      amount: '50.00',
      type: 'deposit',
      description: 'Refund from shop',
      status: 'completed',
      createdAt: new Date('2026-06-01T10:00:00Z'),
      currency: 'EUR'
    },
    {
      id: 'tx_2',
      amount: '120.50',
      type: 'withdrawal',
      description: null,
      status: 'completed',
      createdAt: new Date('2026-06-02T12:00:00Z'),
      currency: 'EUR'
    },
    {
      id: 'tx_3',
      amount: '30.00',
      type: 'transfer',
      description: 'For dinner',
      status: 'pending',
      createdAt: new Date('2026-06-03T15:00:00Z'),
      currency: 'USD'
    }
  ]

  it('Test 1: should prefix deposit amounts with + and apply green text formatting', () => {
    render(<TransactionsList transactions={mockTransactions} />)
    
    const depositElement = screen.getByText('+€50.00')
    expect(depositElement).toBeDefined()
    expect(depositElement.className).toContain('text-emerald-600')
  })

  it('Test 2: should prefix withdrawal amounts with - and render status', () => {
    render(<TransactionsList transactions={mockTransactions} />)

    const withdrawalElement = screen.getByText('-€120.50')
    expect(withdrawalElement).toBeDefined()
    expect(withdrawalElement.className).toContain('text-foreground')
  })

  it('Test 3: should fall back to localized date if description is empty, and display transaction status', () => {
    render(<TransactionsList transactions={mockTransactions} />)

    // Transaction 2 has description: null. It should render formatted date
    const expectedDate = new Date('2026-06-02T12:00:00Z').toLocaleDateString()
    expect(screen.getByText(expectedDate)).toBeDefined()
    
    // Transaction 3 is pending
    expect(screen.getByText('For dinner')).toBeDefined()
    expect(screen.getByText('pending')).toBeDefined()
  })
})
