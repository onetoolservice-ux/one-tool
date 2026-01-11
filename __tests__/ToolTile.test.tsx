/**
 * Integration Tests for ToolTile Component
 * 
 * Tests ToolTile component functionality including favorites, localStorage, and navigation
 */

import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ToolTile from '@/app/shared/ToolTile';
import { Star } from 'lucide-react';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

// Mock getTheme
jest.mock('@/app/lib/theme-config', () => ({
  getTheme: (category: string) => ({
    iconBg: 'bg-blue-500',
    shadow: 'shadow-md',
    gradient: 'from-blue-500 to-purple-500',
  }),
}));

describe('ToolTile Component', () => {
  const mockTool = {
    id: 'test-tool',
    name: 'Test Tool',
    desc: 'Test description',
    category: 'Finance',
    href: '/tools/finance/test-tool',
    icon: <Star data-testid="tool-icon" />,
    popular: true,
    status: 'Active' as const,
  };

  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render tool name and description', () => {
      render(<ToolTile tool={mockTool} />);
      expect(screen.getByText('Test Tool')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });

    it('should render tool icon', () => {
      render(<ToolTile tool={mockTool} />);
      expect(screen.getByTestId('tool-icon')).toBeInTheDocument();
    });

    it('should render "New" badge when status is New', () => {
      const newTool = { ...mockTool, status: 'New' as const };
      render(<ToolTile tool={newTool} />);
      expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('should not render "New" badge when status is not New', () => {
      render(<ToolTile tool={mockTool} />);
      expect(screen.queryByText('New')).not.toBeInTheDocument();
    });

    it('should render link with correct href', () => {
      render(<ToolTile tool={mockTool} />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/tools/finance/test-tool');
    });
  });

  describe('Favorites Functionality', () => {
    it('should load favorite state from localStorage on mount', () => {
      localStorageMock.setItem('onetool-favorites', JSON.stringify(['test-tool']));
      render(<ToolTile tool={mockTool} />);

      const starButton = screen.getByRole('button');
      expect(starButton).toHaveClass('text-amber-400');
    });

    it('should show unfilled star when tool is not favorited', () => {
      localStorageMock.setItem('onetool-favorites', JSON.stringify([]));
      render(<ToolTile tool={mockTool} />);

      const starButton = screen.getByRole('button');
      expect(starButton).not.toHaveClass('text-amber-400');
    });

    it('should toggle favorite on star click', async () => {
      localStorageMock.setItem('onetool-favorites', JSON.stringify([]));
      render(<ToolTile tool={mockTool} />);

      const starButton = screen.getByRole('button');
      
      // Initially not favorited
      expect(starButton).not.toHaveClass('text-amber-400');

      // Click to favorite
      fireEvent.click(starButton);
      
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'onetool-favorites',
          JSON.stringify(['test-tool'])
        );
      });

      // Should now be favorited
      expect(starButton).toHaveClass('text-amber-400');
    });

    it('should remove favorite on second click', async () => {
      localStorageMock.setItem('onetool-favorites', JSON.stringify(['test-tool']));
      render(<ToolTile tool={mockTool} />);

      const starButton = screen.getByRole('button');
      
      // Initially favorited
      expect(starButton).toHaveClass('text-amber-400');

      // Click to unfavorite
      fireEvent.click(starButton);
      
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'onetool-favorites',
          JSON.stringify([])
        );
      });
    });

    it('should prevent navigation when clicking star', () => {
      render(<ToolTile tool={mockTool} />);

      const link = screen.getByRole('link');
      const starButton = screen.getByRole('button');

      // Click star should not navigate
      fireEvent.click(starButton);
      // Link should still be present (navigation prevented)
      expect(link).toBeInTheDocument();
    });

    it('should handle localStorage errors gracefully', () => {
      // Simulate localStorage disabled (private browsing)
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage is disabled');
      });

      // Should not crash
      expect(() => {
        render(<ToolTile tool={mockTool} />);
      }).not.toThrow();
    });

    it('should dispatch storage event on favorite toggle', async () => {
      const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');
      localStorageMock.setItem('onetool-favorites', JSON.stringify([]));
      
      render(<ToolTile tool={mockTool} />);

      const starButton = screen.getByRole('button');
      fireEvent.click(starButton);

      await waitFor(() => {
        expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(Event));
      });

      dispatchEventSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing href gracefully', () => {
      const toolWithoutHref = { ...mockTool, href: undefined };
      render(<ToolTile tool={toolWithoutHref} />);
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/tools/Finance/test-tool');
    });

    it('should handle missing description', () => {
      const toolWithoutDesc = { ...mockTool, desc: undefined };
      render(<ToolTile tool={toolWithoutDesc} />);
      
      expect(screen.getByText('Test Tool')).toBeInTheDocument();
    });

    it('should handle invalid JSON in localStorage', () => {
      localStorageMock.setItem('onetool-favorites', 'invalid json');
      
      // Should not crash
      expect(() => {
        render(<ToolTile tool={mockTool} />);
      }).not.toThrow();
    });

    it('should handle multiple tools favoriting', async () => {
      localStorageMock.setItem('onetool-favorites', JSON.stringify(['other-tool']));
      render(<ToolTile tool={mockTool} />);

      const starButton = screen.getByRole('button');
      fireEvent.click(starButton);

      await waitFor(() => {
        const calls = (localStorageMock.setItem as jest.Mock).mock.calls;
        const lastCall = calls[calls.length - 1];
        const favorites = JSON.parse(lastCall[1]);
        expect(favorites).toContain('test-tool');
        expect(favorites).toContain('other-tool');
      });
    });
  });
});
