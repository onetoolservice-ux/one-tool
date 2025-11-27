import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import DebtPlanner from '@/app/tools/finance/debt-planner/page'

jest.mock('@/app/components/ui/ToolHeader', () => {
  return function DummyHeader({ title }: any) { return <div>{title}</div>; };
});

describe('Debt Planner', () => {
  it('renders default debt list', () => {
    render(<DebtPlanner />)
    // The default state has "Credit Card", not "New Debt"
    expect(screen.getByDisplayValue('Credit Card')).toBeInTheDocument()
  })

  it('calculates payoff date', () => {
    render(<DebtPlanner />)
    expect(screen.getByText(/Debt Free/i)).toBeInTheDocument()
  })
})
