import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DepositModal } from '@/components/deposit-modal'
import { depositFunds } from '@/app/actions/banking'
import { useRouter } from 'next/navigation'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

jest.mock('@/app/actions/banking', () => ({
  depositFunds: jest.fn()
}))

describe('Category 8: Deposit Modal Component', () => {
  let mockRefresh: jest.Mock
  const mockAccounts = [
    { id: 'acc_1', accountNumber: 'NL12BUNQ3344', accountType: 'checking', balance: '250.00', currency: 'EUR', isActive: true }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    mockRefresh = jest.fn()
    ;(useRouter as jest.Mock).mockReturnValue({
      refresh: mockRefresh
    })
  })

  it('Test 1: should open and close the modal when trigger/close buttons are clicked', () => {
    render(<DepositModal accounts={mockAccounts} />)

    // Initially modal content should not be visible
    expect(screen.queryByText(/select destination account/i)).toBeNull()

    // Click trigger button
    fireEvent.click(screen.getByRole('button', { name: /\+ add money/i }))
    expect(screen.getByText(/select destination account/i)).toBeDefined()

    // Click close button
    fireEvent.click(screen.getByRole('button', { name: '' })) // X button has no text
    expect(screen.queryByText(/select destination account/i)).toBeNull()
  })

  it('Test 2: should display error message if submitting an empty or negative amount', () => {
    const { container } = render(<DepositModal accounts={mockAccounts} />)

    // Open modal
    fireEvent.click(screen.getByRole('button', { name: /\+ add money/i }))

    // Type empty or negative amount
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '-10.00' } })
    
    // Submit the form directly to bypass HTML5 validation in JSDOM
    fireEvent.submit(container.querySelector('form')!)

    expect(screen.getByText('Please enter a valid amount')).toBeDefined()
    expect(depositFunds).not.toHaveBeenCalled()
  })

  it('Test 3: should invoke depositFunds and render success confirmation upon valid submit', async () => {
    ;(depositFunds as jest.Mock).mockResolvedValue(true)
    render(<DepositModal accounts={mockAccounts} />)

    // Open modal
    fireEvent.click(screen.getByRole('button', { name: /\+ add money/i }))

    // Fill valid amount
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '200.00' } })
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Atm deposit' } })

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /deposit/i }))

    await waitFor(() => {
      expect(depositFunds).toHaveBeenCalledWith('acc_1', '200.00', 'Atm deposit')
      expect(screen.getByText('Deposit Successful')).toBeDefined()
      expect(mockRefresh).toHaveBeenCalled()
    })
  })
})
