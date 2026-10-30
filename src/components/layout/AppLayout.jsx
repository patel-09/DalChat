import { NavLink, Outlet, useNavigate } from 'react-router'
import { useAuthStore } from '../../features/auth/authStore'
import { House, MessageCircle, Users, Compass, User, LogOut } from 'lucide-react'

const navItems = [
  { to: '/home', label: 'Home', icon: House },
  { to: '/chats', label: 'Chats', icon: MessageCircle },
  { to: '/friends', label: 'Friends', icon: Users },
  { to: '/discover', label: 'Discover', icon: Compass },
  { to: '/profile', label: 'Profile', icon: User },
]
function AppLayout() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white md:flex">
      {/* Sidebar: only on medium screens and larger */}
      <aside className="hidden md:flex md:w-64 md:flex-col border-r border-gray-800 bg-gray-900/60 p-4">
        <h1 className="mb-8 px-3 text-2xl font-bold text-yellow-400">DalChat</h1>

        <nav className="flex-1 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 font-medium transition ${
                  isActive
                    ? 'bg-yellow-400 text-gray-900'
                    : 'text-gray-300 hover:bg-gray-800'
                }`
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gray-800 pt-4">
                    <p className="truncate px-3 text-sm font-medium">
            {user?.firstName} {user?.lastName}
          </p>
          
          <button
            onClick={handleLogout}
            className="mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:bg-gray-800 transition"
          >
            <LogOut size={20} />
            Log out
          </button>
        </div>
      </aside>

      {/* The current page appears here */}
      <main className="flex-1 p-6 pb-24 md:pb-6">
        <Outlet />
      </main>

      {/* Bottom navigation: only on small screens (phones) */}
      <nav className="fixed inset-x-0 bottom-0 flex justify-around border-t border-gray-800 bg-gray-900 py-2 md:hidden">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1 text-xs ${
                isActive ? 'text-yellow-400' : 'text-gray-400'
              }`
            }
          >
            <Icon size={22} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export default AppLayout