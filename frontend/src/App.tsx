import { Navigate, Route, Routes } from 'react-router'

import AppHeader from './components/AppHeader.tsx'
import ComparePage from './compare/ComparePage.tsx'
import MappingsPage from './mappings/MappingsPage.tsx'

export default function App() {
  return (
    <>
      <AppHeader />
      <Routes>
        <Route path="/" element={<Navigate to="/compare" replace />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/mappings" element={<MappingsPage />} />
      </Routes>
    </>
  )
}
