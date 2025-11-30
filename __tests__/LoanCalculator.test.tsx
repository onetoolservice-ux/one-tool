import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
// FIX: Point to the correct new path (smart-loan) instead of old loan-emi
import LoanCalculator from '@/app/tools/finance/smart-loan/page'

describe('LoanCalculator', () => {
  it('renders without crashing', () => {
    render(<LoanCalculator />)
    const heading = screen.getByText(/Smart Loan/i)
    expect(heading).toBeInTheDocument()
  })
})
