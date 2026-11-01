import { useState } from 'react'
import { useProfile, useProfileRequests } from '../api'
import ProfileCard from '../components/ProfileCard'
import EditProfileForm from '../components/EditProfileForm'
import MyPosts from '../components/MyPosts'

function ProfilePage() {
  const { data: profile, isPending, isError, refetch } = useProfile()
  const { data: requests } = useProfileRequests()
  const [isEditing, setIsEditing] = useState(false)

  const requestCount = Array.isArray(requests) ? requests.length : 0

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

    return (
      <ProfileCard
        profile={profile}
        requestCount={requestCount}
        onEdit={() => setIsEditing(true)}
      />
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {renderProfile()}
      <MyPosts />
    </div>
  )
}

export default ProfilePage