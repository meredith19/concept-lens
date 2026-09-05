import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'

import App from './App.tsx'

describe('App', () => {
  it('lands on the Compare page', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Compare any two concepts.' })).toBeInTheDocument()
  })

  it('navigates to the Mappings page', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/compare']}>
        <App />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('link', { name: 'Mappings' }))

    expect(screen.getByRole('heading', { name: 'Mappings' })).toBeInTheDocument()
  })
})
