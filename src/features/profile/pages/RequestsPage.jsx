import { Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import RequestsList from '../components/RequestsList'

function RequestsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link
        to="/profile"
        className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
      >
        <ArrowLeft size={16} />
        Back to profile
      </Link>

      <RequestsList />
    </div>
  )
}

export default RequestsPage