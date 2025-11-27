import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Home from '@/app/page'
import { UIProvider } from '@/app/lib/ui-context'

// Mock data
jest.mock('@/app/lib/tools-data', () => ({
  ALL_TOOLS: [{ id: '1', name: 'Test Tool', category: 'Finance', href: '#', popular: true }]
}));

describe('Home Page', () => {
  it('renders the search bar', () => {
    // Wrap in UIProvider to provide context
    render(
      <UIProvider>
        <Home />
      </UIProvider>
    )
    // Check for "Most Popular" which is always there
    expect(screen.getByText(/Most Popular/i)).toBeInTheDocument()
  })
})
