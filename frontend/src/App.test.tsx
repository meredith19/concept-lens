import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'

import App from './App.tsx'

describe('App', () => {
  it('renders the Compare page by default', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Compare' })).toBeInTheDocument()
  })
})
