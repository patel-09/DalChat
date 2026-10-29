import { Routes, Route } from 'react-router'
import LandingPage from './pages/LandingPage'
import NotFoundPage from './pages/NotFoundPage'
import LoginPage from './features/auth/pages/LoginPage'
import SignupPage from './features/auth/pages/SignupPage'
import ProtectedRoute from './features/auth/components/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import ChatsPage from './features/chat/pages/ChatsPage'
import FriendsPage from './features/friends/pages/FriendsPage'
import DiscoverPage from './features/discover/pages/DiscoverPage'
import ProfilePage from './features/profile/pages/ProfilePage'

function App() {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Logged-in pages */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/chats" element={<ChatsPage />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App