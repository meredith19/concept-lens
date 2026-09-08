import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router'

import { api } from './api/client.ts'
import AppHeader from './components/AppHeader.tsx'
import ToastProvider from './components/ToastProvider.tsx'
import { useToast } from './components/useToast.ts'
import ComparePage from './compare/ComparePage.tsx'
import MappingsPage from './mappings/MappingsPage.tsx'

export default function App() {
  return (
    <ToastProvider>
      <AppShell />
    </ToastProvider>
  )
}

function AppShell() {
  const { showToast } = useToast()

  /**
   * Bumped after a reset. It keys the routed page so it remounts and refetches, which is enough
   * to get both pages back in step without any shared data layer.
   */
  const [dataVersion, setDataVersion] = useState(0)

  const resetDemoData = async () => {
    const confirmed = window.confirm(
      'Reset demo data? Mappings you have added or removed will be restored to the seeded set.',
    )
    if (!confirmed) {
      return
    }

    try {
      await api.resetDemoData()
      setDataVersion((current) => current + 1)
      showToast('Demo data reset.')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not reset demo data')
    }
  }

  return (
    <>
      <AppHeader onReset={() => void resetDemoData()} />

      <Routes key={dataVersion}>
        <Route path="/" element={<Navigate to="/compare" replace />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/mappings" element={<MappingsPage />} />
      </Routes>
    </>
  )
}
