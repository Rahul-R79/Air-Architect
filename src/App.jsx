import { useEffect } from 'react'
import useAppStore from './store/useAppStore'
import LandingPage from './components/LandingPage'

function App() {
    const mode = useAppStore(state => state.mode)
    const setMode = useAppStore(state => state.setMode)
    const permissionGranted = useAppStore(state => state.permissionGranted)

    // Auto-transition from PERMISSION to DRAWING once camera is ready
    useEffect(() => {
        if (mode === 'PERMISSION' && permissionGranted) {
            setMode('DRAWING')
        }
    }, [mode, permissionGranted, setMode])

    return (
        <div className="relative w-full h-screen bg-black overflow-hidden font-inter select-none">

            {/* 1. Landing Layer */}
            {mode === 'IDLE' && <LandingPage />}

        </div>
    )
}

export default App
