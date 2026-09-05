import { NavLink, Navigate, Route, Routes } from 'react-router'

import ComparePage from './routes/ComparePage.tsx'
import MappingsPage from './routes/MappingsPage.tsx'

export default function App() {
  return (
    <>
      <header>
        <div>Concept Lens</div>
        <nav>
          <NavLink to="/compare">Compare</NavLink>
          <NavLink to="/mappings">Mappings</NavLink>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Navigate to="/compare" replace />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/mappings" element={<MappingsPage />} />
      </Routes>
    </>
  )
}
