import { Loader2, Mail} from 'lucide-react'
import { useEmailLookup } from '../api'

function ExecutiveEmailStatus({ email }) {
  const { data, isFetching } = useEmailLookup(email)

  if (isFetching && !data) {
    return (
      <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
        <Loader2 size={14} className="animate-spin" />
        Checking DalChat…
      </p>
    )
  }

  // Not a complete @dal.ca email yet, or the check failed
  if (!data) return null
  // Existing DalChat users: show nothing
  if (data.onDalChat) return null

  return (
    <p className="mt-2 flex items-start gap-1.5 text-xs text-yellow-300">
      <Mail size={14} className="mt-0.5 shrink-0" />
      Not on DalChat yet. We'll email them an invite to join when you submit.
    </p>
  )
}

export default ExecutiveEmailStatus