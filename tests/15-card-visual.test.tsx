import { render, screen } from '@testing-library/react'
import { CardVisual } from '@/components/card-visual'

describe('CardVisual', () => {
  it('renders only masked card information', () => {
    const { container } = render(
      <CardVisual
        label="Travel card"
        last4="4242"
        cardType="virtual"
        status="active"
        network="mastercard"
        expiresAt={new Date('2029-06-01T00:00:00.000Z')}
      />
    )

    expect(screen.getByText('•••• •••• •••• 4242')).toBeTruthy()
    expect(container.textContent).not.toContain('4111111111114242')
    expect(container.textContent?.toLowerCase()).not.toContain('cvv')
    expect(container.textContent?.toLowerCase()).not.toContain('pin')
  })
})
