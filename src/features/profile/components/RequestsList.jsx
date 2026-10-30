import { Award, Users } from 'lucide-react'
import { formatTimeAgo } from '../../../lib/formatTimeAgo'
import { useProfileRequests, useRespondToRequest } from '../api'

function RequestText({ request }) {
  const strong = 'font-semibold text-white'

  if (request.type === 'EXECUTIVE_ROLE') {
    return (
      <>
        <span className={strong}>{request.invitedBy}</span> added you as{' '}
        <span className={strong}>{request.role}</span> of{' '}
        <span className={strong}>{request.societyName}</span>
      </>
    )
  }

  return (
    <>
      <span className={strong}>{request.invitedBy}</span> invited you to join{' '}
      <span className={strong}>{request.societyName}</span>
    </>
  )
}

function RequestsList() {
  const { data, isPending, isError, refetch } = useProfileRequests()
  const respond = useRespondToRequest()
  const requests = Array.isArray(data) ? data : []

  function renderBody() {
    if (isPending) {
      return (
        <div className="space-y-3 p-6">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="h-14 animate-pulse rounded-lg bg-gray-900" />
          ))}
        </div>
      )
    }

    if (isError) {
      return (
        <div className="p-6 text-center">
          <p className="text-red-400">Couldn't load your requests.</p>
          <button onClick={() => refetch()} className="mt-2 text-yellow-400 hover:underline">
            Try again
          </button>
        </div>
      )
    }

    if (requests.length === 0) {
      return <p className="p-6 text-sm text-gray-400">No pending requests.</p>
    }

    return (
      <ul className="divide-y divide-gray-800">
        {requests.map((request) => {
          const Icon = request.type === 'EXECUTIVE_ROLE' ? Award : Users
          const isBusy = respond.isPending && respond.variables?.id === request.id

          return (
            <li
              key={request.id}
              className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-800 text-yellow-400">
                  <Icon size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-gray-300">
                    <RequestText request={request} />
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {formatTimeAgo(request.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  disabled={isBusy}
                  onClick={() => respond.mutate({ id: request.id, action: 'decline' })}
                  className="rounded-lg border border-gray-700 px-4 py-1.5 text-sm text-gray-300 hover:bg-gray-800 disabled:opacity-50"
                >
                  Decline
                </button>
                <button
                  disabled={isBusy}
                  onClick={() => respond.mutate({ id: request.id, action: 'accept' })}
                  className="rounded-lg bg-yellow-400 px-4 py-1.5 text-sm font-semibold text-gray-900 hover:bg-yellow-300 disabled:opacity-50"
                >
                  Accept
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <section className="rounded-xl border border-gray-800 bg-gray-900/60">
      <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
        <h2 className="text-lg font-bold">Requests</h2>
        {requests.length > 0 && (
          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-yellow-400 px-2 text-xs font-bold text-gray-900">
            {requests.length}
          </span>
        )}
      </div>

      {renderBody()}

      {respond.isError && (
        <p className="px-6 pb-4 text-sm text-red-400">
          Couldn't update that request. Please try again.
        </p>
      )}
    </section>
  )
}

export default RequestsList