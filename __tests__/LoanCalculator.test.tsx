import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import LoanCalculator from '@/app/tools/finance/loan-emi/page'

// Mock ToolHeader
jest.mock('@/app/components/ui/ToolHeader', () => {
  return function DummyHeader({ title }: any) { return <div>{title}</div>; };
});

describe('Loan Calculator', () => {
  it('renders the calculator', () => {
    render(<LoanCalculator />)
    expect(screen.getByText('Loan Planner')).toBeInTheDocument()
  })

  it('updates EMI when loan amount changes', () => {
    render(<LoanCalculator />)
    // Now this works because we added htmlFor and id
    const amountInput = screen.getByLabelText(/Amount/i)
    fireEvent.change(amountInput, { target: { value: '100000' } })
    expect(screen.getByText(/2,052/)).toBeInTheDocument()
  })
})
