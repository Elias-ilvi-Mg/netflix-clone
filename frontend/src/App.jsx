import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Header from './components/Header'
import ErrorBoundary from './components/ErrorBoundary'
import Seo from './components/Seo'

const Home = lazy(() => import('./pages/Home'))
const Search = lazy(() => import('./pages/Search'))
const Details = lazy(() => import('./pages/Details'))
const Watch = lazy(() => import('./pages/Watch'))               // ✅ movie/one-off
const WatchEpisode = lazy(() => import('./pages/WatchEpisode')) // ✅ episodes
const MyList = lazy(() => import('./pages/MyList'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Forgot = lazy(() => import('./pages/Forgot'))
const Reset = lazy(() => import('./pages/Reset'))
const NotFound = lazy(() => import('./pages/NotFound'))

export default function App() {
  return (
    <>
      <Seo />
      <Header />
      <ErrorBoundary>
        <Suspense fallback={<div className="container" style={{ padding: '24px 0', color:'#9ca3af' }}>Loading…</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/title/:id" element={<Details />} />
            <Route path="/watch/:id" element={<Watch />} />                  {/* ✅ correct */}
            <Route path="/watch/episode/:id" element={<WatchEpisode />} />   {/* ✅ episodes */}
            <Route path="/my-list" element={<MyList />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/forgot" element={<Forgot />} />
            <Route path="/reset" element={<Reset />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </>
  )
}
