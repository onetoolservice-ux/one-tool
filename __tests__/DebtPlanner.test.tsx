import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
// FIX: Point to the correct new path (smart-debt) instead of old debt-planner
import DebtPlanner from '@/app/tools/finance/smart-debt/page'

describe('DebtPlanner', () => {
  it('renders without crashing', () => {
    render(<DebtPlanner />)
    const heading = screen.getByText(/Smart Debt/i)
    expect(heading).toBeInTheDocument()
  })
})
