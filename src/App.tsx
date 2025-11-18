import './App.css'
import { SpaceXLaunches } from './components/SpaceXLaunches'
import { CryptoTracker } from './components/CryptoTracker'

function App() {
    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">RxJS Real-world Examples</h1>
            <p className="mb-8 text-gray-600">
                Real API integrations with SpaceX and CoinCap
            </p>

            <div className="space-y-8">
                <CryptoTracker />
                <SpaceXLaunches />
            </div>
        </div>
    )
}

export default App
