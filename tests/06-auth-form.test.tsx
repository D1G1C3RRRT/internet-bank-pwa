import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AuthForm } from '@/components/auth-form'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

jest.mock('@/lib/auth-client', () => ({
  authClient: {
    signIn: { email: jest.fn() },
    signUp: { email: jest.fn() }
  }
}))

describe('Category 6: Authentication Form Component', () => {
  let mockPush: jest.Mock
  let mockRefresh: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockPush = jest.fn()
    mockRefresh = jest.fn()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh
    })
  })

  it('Test 1: should render sign-in form by default and render name input in sign-up mode', () => {
    // Render Sign-In
    const { rerender } = render(<AuthForm mode="sign-in" />)
    expect(screen.getByRole('heading').textContent).toContain('Sign In')
    expect(screen.queryByLabelText(/full name/i)).toBeNull()

    // Render Sign-Up
    rerender(<AuthForm mode="sign-up" />)
    expect(screen.getByRole('heading').textContent).toContain('Create a new account')
    expect(screen.getByLabelText(/full name/i)).toBeDefined()
  })

  it('Test 2: should trigger email sign-in on submit when mode is sign-in', async () => {
    ;(authClient.signIn.email as jest.Mock).mockResolvedValue({ error: null })
    render(<AuthForm mode="sign-in" />)

    // Type email & password
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } })

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(authClient.signIn.email).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  it('Test 3: should display error message when authentication client returns an error', async () => {
    const errorMsg = 'Invalid email or password'
    ;(authClient.signIn.email as jest.Mock).mockResolvedValue({
      error: { message: errorMsg }
    })
    render(<AuthForm mode="sign-in" />)

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'wrong@example.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpass' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      const alertEl = screen.getByRole('alert')
      expect(alertEl.textContent).toContain(errorMsg)
    })
  })
})
