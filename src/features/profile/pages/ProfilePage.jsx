import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { LogOut } from 'lucide-react'
import { useAuthStore } from '../../auth/authStore'
import { useProfile } from '../api'
import ProfileCard from '../components/ProfileCard'
import EditProfileForm from '../components/EditProfileForm'
import RequestsList from '../components/RequestsList'

function ProfilePage() {
  const { data: profile, isPending, isError, refetch } = useProfile()
  const [isEditing, setIsEditing] = useState(false)
  const logout = useAuthStore((state) => state.logout)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    queryClient.clear() // forget this user's cached data
    navigate('/login', { replace: true })
  }

  function renderProfile() {
    if (isPending) {
      return <div className="h-44 animate-pulse rounded-xl bg-gray-900" />
    }

    if (isError || !profile) {
      return (
        <section className="rounded-xl border border-gray-800 bg-gray-900/60 p-6 text-center">
          <p className="text-red-400">Couldn't load your profile.</p>
          <button onClick={() => refetch()} className="mt-2 text-yellow-400 hover:underline">
            Try again
          </button>
        </section>
      )
    }

    if (isEditing) {
      return <EditProfileForm profile={profile} onDone={() => setIsEditing(false)} />
    }

    return <ProfileCard profile={profile} onEdit={() => setIsEditing(true)} />
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {renderProfile()}

      <RequestsList />

      <section className="rounded-xl border border-gray-800 bg-gray-900/60 p-6">
        <h2 className="text-lg font-bold">Account</h2>
        <button
          onClick={handleLogout}
          className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/40 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
        >
          <LogOut size={16} />
          Log out
        </button>
      </section>
    </div>
  )
}

export default ProfilePage