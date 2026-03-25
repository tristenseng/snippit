/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { EmployeeAutocomplete } from '@/components/days/EmployeeAutocomplete'

// Stub out the useDebounce hook to return value immediately (no timer needed in tests)
jest.mock('@/lib/hooks/useDebounce', () => ({
  useDebounce: <T,>(value: T) => value,
}))

const mockEmployees = [
  { id: 'emp-1', name: 'Alice Smith' },
  { id: 'emp-2', name: 'Bob Jones' },
  { id: 'emp-3', name: 'Carol White' },
  { id: 'emp-4', name: 'David Brown' },
]

function setup(props: Partial<React.ComponentProps<typeof EmployeeAutocomplete>> = {}) {
  const onSelect = jest.fn()
  const result = render(
    <EmployeeAutocomplete
      locationId="loc-1"
      excludeIds={props.excludeIds ?? []}
      onSelect={props.onSelect ?? onSelect}
      disabled={props.disabled}
    />
  )
  return { onSelect, ...result }
}

beforeEach(() => {
  // Mock fetch to return our employee list
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockEmployees),
  } as unknown as Response)
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('EmployeeAutocomplete', () => {
  describe('filtering', () => {
    it('shows all employees when focused with empty query', async () => {
      setup()
      const input = screen.getByRole('combobox')
      await act(async () => {
        fireEvent.focus(input)
      })
      // Wait for fetch to resolve and employees to be populated
      await waitFor(() => {
        expect(screen.queryByRole('option', { name: /Alice/i })).toBeInTheDocument()
      })
    })

    it('filters employees by name prefix (case-insensitive)', async () => {
      setup()
      const input = screen.getByRole('combobox')
      await act(async () => {
        fireEvent.focus(input)
        fireEvent.change(input, { target: { value: 'ali' } })
      })
      await waitFor(() => {
        expect(screen.getByRole('option', { name: /Alice/i })).toBeInTheDocument()
        expect(screen.queryByRole('option', { name: /Bob/i })).not.toBeInTheDocument()
      })
    })

    it('filters employees by uppercase prefix', async () => {
      setup()
      const input = screen.getByRole('combobox')
      await act(async () => {
        fireEvent.focus(input)
        fireEvent.change(input, { target: { value: 'BOB' } })
      })
      await waitFor(() => {
        expect(screen.getByRole('option', { name: /Bob/i })).toBeInTheDocument()
        expect(screen.queryByRole('option', { name: /Alice/i })).not.toBeInTheDocument()
      })
    })

    it('shows no-results message when no employees match query', async () => {
      setup()
      const input = screen.getByRole('combobox')
      await act(async () => {
        fireEvent.focus(input)
        fireEvent.change(input, { target: { value: 'zzz' } })
      })
      await waitFor(() => {
        expect(screen.getByText(/No employees match 'zzz'/i)).toBeInTheDocument()
      })
    })

    it('excludes employees whose IDs are in excludeIds', async () => {
      setup({ excludeIds: ['emp-1'] })
      const input = screen.getByRole('combobox')
      await act(async () => {
        fireEvent.focus(input)
      })
      await waitFor(() => {
        expect(screen.queryByRole('option', { name: /Alice/i })).not.toBeInTheDocument()
        expect(screen.getByRole('option', { name: /Bob/i })).toBeInTheDocument()
      })
    })
  })

  describe('keyboard navigation', () => {
    it('moves active index down with ArrowDown', async () => {
      setup()
      const input = screen.getByRole('combobox')
      await act(async () => {
        fireEvent.focus(input)
      })
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument()
      })
      await act(async () => {
        fireEvent.keyDown(input, { key: 'ArrowDown' })
      })
      // First item should be focused (aria-selected=true or bg-blue-50)
      await waitFor(() => {
        const options = screen.getAllByRole('option')
        expect(options[0]).toHaveAttribute('aria-selected', 'true')
      })
    })

    it('moves active index up with ArrowUp', async () => {
      setup()
      const input = screen.getByRole('combobox')
      await act(async () => {
        fireEvent.focus(input)
      })
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument()
      })
      // Go down twice then up once
      await act(async () => {
        fireEvent.keyDown(input, { key: 'ArrowDown' })
        fireEvent.keyDown(input, { key: 'ArrowDown' })
        fireEvent.keyDown(input, { key: 'ArrowUp' })
      })
      await waitFor(() => {
        const options = screen.getAllByRole('option')
        expect(options[0]).toHaveAttribute('aria-selected', 'true')
      })
    })

    it('selects active item on Enter and clears input', async () => {
      const onSelect = jest.fn()
      render(
        <EmployeeAutocomplete
          locationId="loc-1"
          excludeIds={[]}
          onSelect={onSelect}
        />
      )
      const input = screen.getByRole('combobox')

      // Focus and type a query — wait for employees to load + filtered option to appear
      await act(async () => {
        fireEvent.focus(input)
        fireEvent.change(input, { target: { value: 'ali' } })
      })

      // Wait until the Alice option is rendered (confirms fetch resolved + filter applied)
      await waitFor(() => {
        expect(screen.getByRole('option', { name: /Alice/i })).toBeInTheDocument()
      })

      // Navigate to first item and press Enter in separate act calls
      await act(async () => {
        fireEvent.keyDown(input, { key: 'ArrowDown' })
      })
      await act(async () => {
        fireEvent.keyDown(input, { key: 'Enter' })
      })

      await waitFor(() => {
        expect(onSelect).toHaveBeenCalledWith({ id: 'emp-1', name: 'Alice Smith' })
      })
      expect((input as HTMLInputElement).value).toBe('')
    })

    it('closes dropdown on Escape', async () => {
      setup()
      const input = screen.getByRole('combobox')
      await act(async () => {
        fireEvent.focus(input)
      })
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument()
      })
      await act(async () => {
        fireEvent.keyDown(input, { key: 'Escape' })
      })
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
      })
    })
  })

  describe('ARIA attributes', () => {
    it('has role="combobox" on the input', () => {
      setup()
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('has aria-expanded false when closed', () => {
      setup()
      const input = screen.getByRole('combobox')
      expect(input).toHaveAttribute('aria-expanded', 'false')
    })

    it('has aria-expanded true when open', async () => {
      setup()
      const input = screen.getByRole('combobox')
      await act(async () => {
        fireEvent.focus(input)
      })
      expect(input).toHaveAttribute('aria-expanded', 'true')
    })

    it('has role="listbox" on the dropdown', async () => {
      setup()
      const input = screen.getByRole('combobox')
      await act(async () => {
        fireEvent.focus(input)
      })
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument()
      })
    })

    it('dropdown items have role="option"', async () => {
      setup()
      const input = screen.getByRole('combobox')
      await act(async () => {
        fireEvent.focus(input)
      })
      await waitFor(() => {
        const options = screen.getAllByRole('option')
        expect(options.length).toBeGreaterThan(0)
      })
    })

    it('sets aria-activedescendant when an item is active', async () => {
      setup()
      const input = screen.getByRole('combobox')
      await act(async () => {
        fireEvent.focus(input)
      })
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument()
      })
      await act(async () => {
        fireEvent.keyDown(input, { key: 'ArrowDown' })
      })
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-activedescendant')
        expect(input.getAttribute('aria-activedescendant')).not.toBe('')
      })
    })
  })

  describe('disabled state', () => {
    it('disables the input when disabled prop is true', () => {
      setup({ disabled: true })
      const input = screen.getByRole('combobox')
      expect(input).toBeDisabled()
    })

    it('does not show dropdown when disabled', async () => {
      setup({ disabled: true })
      const input = screen.getByRole('combobox')
      await act(async () => {
        fireEvent.focus(input)
      })
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })
  })
})
