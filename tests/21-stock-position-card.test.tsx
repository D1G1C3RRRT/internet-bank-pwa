import { render, screen } from '@testing-library/react'
import { StockPositionCard } from '@/components/stock-position-card'

describe('StockPositionCard', () => {
  it('calculates current value and unrealized gain from the mock quote', () => {
    render(
      <StockPositionCard
        symbol="AAPL"
        quantity="2.000000"
        averagePrice="100.0000"
        quote={{
          symbol: 'AAPL',
          name: 'Apple',
          price: 125,
          changePercent: 1,
          currency: 'USD',
        }}
        lang="en"
      />
    )

    expect(screen.getByText('$250.00')).toBeTruthy()
    expect(screen.getByText('25.00%')).toBeTruthy()
    expect(screen.getByText('+$50.00')).toBeTruthy()
  })
})
