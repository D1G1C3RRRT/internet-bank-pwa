import { render, screen } from '@testing-library/react'
import { SavingsGoalCard } from '@/components/savings-goal-card'

describe('SavingsGoalCard', () => {
  it('shows current and target values with bounded progress', () => {
    const { container } = render(
      <SavingsGoalCard
        name="Emergency fund"
        currentAmount="250.00"
        targetAmount="1000.00"
        currency="EUR"
        targetDate={new Date('2030-01-01T00:00:00.000Z')}
        status="active"
        lang="en"
      />
    )

    expect(screen.getByText('Emergency fund')).toBeTruthy()
    expect(screen.getByText('25%')).toBeTruthy()
    expect(container.querySelector('[style="width: 25%;"]')).toBeTruthy()
  })
})
