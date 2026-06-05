import { render, screen } from '@testing-library/react'
import { CryptoHoldingCard } from '@/components/crypto-holding-card'

describe('CryptoHoldingCard', () => {
  it('calculates current demo value and gain', () => {
    render(
      <CryptoHoldingCard
        symbol="ETH"
        quantity="2.000000000000"
        averagePrice="2000.00000000"
        quote={{
          symbol: 'ETH',
          name: 'Ethereum',
          price: 2500,
          changePercent: 1,
          currency: 'USD',
        }}
        lang="en"
      />
    )

    expect(screen.getByText('$5,000.00')).toBeTruthy()
    expect(screen.getByText('25.00%')).toBeTruthy()
    expect(screen.getByText('+$1,000.00')).toBeTruthy()
  })
})
