import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import SmartBudgetPro from '@/app/tools/finance/smart-budget/page'
import Button from '@/app/shared/ui/Button'

// Mock the hook to avoid complex logic during simple UI testing
jest.mock('@/app/tools/finance/smart-budget/hooks/useSmartBudget', () => ({
  useSmartBudget: () => ({
    filteredData: [],
    filters: {},
    categories: [],
    kpi: { totalIncome: 1000, totalExpense: 500, balance: 500, savingsRate: 50 },
    isLoaded: true,
    mode: 'Personal',
    toggleMode: jest.fn(),
    addTransaction: jest.fn(),
  })
}))

describe('Smart Budget UI', () => {
  it('renders the main header correctly', () => {
    render(<SmartBudgetPro />)
    expect(screen.getByText(/Smart Budget/i)).toBeInTheDocument()
    expect(screen.getByText(/Personal/i)).toBeInTheDocument()
  })

  it('renders the updated Button component', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Test Button</Button>)
    
    const btn = screen.getByText('Test Button')
    fireEvent.click(btn)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
    // Check if base styles are present (tailwind class check)
    expect(btn.className).toContain('inline-flex')
  })
})
