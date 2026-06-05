import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TransferForm } from '@/components/transfer-form'
import { createTransaction, depositFunds } from '@/app/actions/banking'
import { useRouter } from 'next/navigation'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

jest.mock('@/app/actions/banking', () => ({
  createTransaction: jest.fn(),
  depositFunds: jest.fn()
}))

describe('Category 7: Money Transfer Form Component', () => {
  let mockRefresh: jest.Mock
  const mockAccounts = [
    { id: 'acc_1', accountNumber: 'NL12BUNQ3344', accountType: 'checking', balance: '250.00', currency: 'EUR', isActive: true },
    { id: 'acc_2', accountNumber: 'NL12BUNQ9999', accountType: 'savings', balance: '1000.00', currency: 'EUR', isActive: true }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    mockRefresh = jest.fn()
    ;(useRouter as jest.Mock).mockReturnValue({
      refresh: mockRefresh
    })
  })

  it('Test 1: should update inputs and execute depositFunds on form submit', async () => {
    ;(depositFunds as jest.Mock).mockResolvedValue(true)
    
    const { container } = render(<TransferForm accountId="acc_1" accounts={mockAccounts} />)

    // Switch to Deposit mode (first button is switcher)
    fireEvent.click(screen.getAllByRole('button', { name: /deposit/i })[0])

    // Fill amount and description
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '150.00' } })
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Salary deposit' } })

    // Submit
    fireEvent.click(container.querySelector('button[type="submit"]')!)

    await waitFor(() => {
      expect(depositFunds).toHaveBeenCalledWith('acc_1', '150.00', 'Salary deposit')
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  it('Test 2: should display error message if attempting transfer without selecting a recipient', async () => {
    const { container } = render(<TransferForm accountId="acc_1" accounts={mockAccounts} />)

    // Input amount
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '50.00' } })
    
    // Submit (recipient select has default empty value "")
    fireEvent.submit(container.querySelector('form')!)

    await waitFor(() => {
      expect(screen.getByText('Please select a recipient account')).toBeDefined()
      expect(createTransaction).not.toHaveBeenCalled()
    })
  })

  it('Test 3: should invoke createTransaction with correct parameters on successful transfer submit', async () => {
    ;(createTransaction as jest.Mock).mockResolvedValue({ id: 'tx_123' })
    
    const { container } = render(<TransferForm accountId="acc_1" accounts={mockAccounts} />)

    // Select recipient account
    fireEvent.change(screen.getByLabelText(/send to/i), { target: { value: 'acc_2' } })

    // Input amount & description
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '75.50' } })
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Dinner share' } })

    // Submit
    fireEvent.click(container.querySelector('button[type="submit"]')!)

    await waitFor(() => {
      expect(createTransaction).toHaveBeenCalledWith('acc_1', 'acc_2', '75.50', 'transfer', 'Dinner share')
      expect(screen.getByText('Transfer completed successfully!')).toBeDefined()
    })
  })
})
