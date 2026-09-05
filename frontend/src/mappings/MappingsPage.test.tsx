import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import MappingsPage from './MappingsPage.tsx'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('MappingsPage', () => {
  it('lists the demo mappings', () => {
    render(<MappingsPage />)

    expect(screen.getByText(/Returns\.valid_return_path/)).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'View' })).toHaveLength(3)
  })

  it('filters the list as you type', async () => {
    const user = userEvent.setup()
    render(<MappingsPage />)

    await user.type(screen.getByLabelText('Filter mappings'), 'delivery')

    expect(screen.getAllByRole('button', { name: 'View' })).toHaveLength(1)
    expect(screen.getByText(/Delivery\.left_fulfillment_center/)).toBeInTheDocument()
  })

  it('removes a mapping once the confirmation is accepted', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<MappingsPage />)

    await user.click(screen.getAllByRole('button', { name: 'Remove' })[0])

    expect(screen.getAllByRole('button', { name: 'View' })).toHaveLength(2)
    expect(screen.getByRole('status')).toHaveTextContent('Mapping removed')
  })

  it('keeps the mapping when the confirmation is dismissed', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<MappingsPage />)

    await user.click(screen.getAllByRole('button', { name: 'Remove' })[0])

    expect(screen.getAllByRole('button', { name: 'View' })).toHaveLength(3)
  })

  it('confirms the save from the add drawer', async () => {
    const user = userEvent.setup()
    render(<MappingsPage />)

    await user.click(screen.getByRole('button', { name: '+ Add mapping' }))
    await user.click(screen.getByRole('button', { name: 'Save mapping' }))

    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(
      'Mapping saved as Confirmed · Domain reviewer',
    )
  })

  it('explains that only the first mapping has a detail view', async () => {
    const user = userEvent.setup()
    render(<MappingsPage />)

    await user.click(screen.getAllByRole('button', { name: 'View' })[1])

    expect(screen.getByRole('status')).toHaveTextContent(
      'Mapping detail is represented by the first example in this mock.',
    )
  })

  it('opens the detail drawer for the first mapping', async () => {
    const user = userEvent.setup()
    render(<MappingsPage />)

    await user.click(screen.getAllByRole('button', { name: 'View' })[0])

    const drawer = screen.getByRole('complementary')
    expect(within(drawer).getByText('valid_return_path')).toBeInTheDocument()
  })
})
