import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import TextField from '../../../components/TextField'
import { useAuthStore } from '../../auth/authStore'
import { useUpdateProfile } from '../api'
import { profileSchema, YEAR_OPTIONS, BIO_MAX_LENGTH } from '../profileSchema'

const fieldClass =
  'mt-1 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400'

function EditProfileForm({ profile, onDone }) {
  const updateUser = useAuthStore((state) => state.updateUser)
  const updateProfile = useUpdateProfile()

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    mode: 'onTouched',
    defaultValues: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      program: profile.program,
      year: profile.year,
      bio: profile.bio,
    },
  })

  const bioLength = watch('bio')?.length ?? 0

  async function onSubmit(values) {
    try {
      const updated = await updateProfile.mutateAsync(values)
      // Keep the sidebar name in sync
      updateUser({ firstName: updated.firstName, lastName: updated.lastName })
      onDone()
    } catch (error) {
      setError('root', {
        message:
          error.response?.data?.message ?? 'Could not save your profile. Please try again.',
      })
    }
  }

  return (
    <section className="rounded-xl border border-gray-800 bg-gray-900/60 p-6">
      <h2 className="text-lg font-bold">Edit profile</h2>
      <p className="mt-1 text-sm text-gray-400">
        Your email ({profile.email}) can't be changed.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="First name"
            autoComplete="given-name"
            error={errors.firstName}
            {...register('firstName')}
          />
          <TextField
            label="Last name"
            autoComplete="family-name"
            error={errors.lastName}
            {...register('lastName')}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Program"
            placeholder="e.g. Computer Science"
            error={errors.program}
            {...register('program')}
          />
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-300">
              Year
            </label>
            <select id="year" {...register('year')} className={fieldClass}>
              <option value="">Prefer not to say</option>
              {YEAR_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.year && <p className="mt-1 text-sm text-red-400">{errors.year.message}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-300">
            Bio
          </label>
          <textarea
            id="bio"
            rows={3}
            placeholder="A little about you"
            {...register('bio')}
            className={fieldClass}
          />
          <div className="mt-1 flex justify-between gap-4 text-sm">
            <span className="text-red-400">{errors.bio?.message}</span>
            <span className="shrink-0 text-gray-500">
              {bioLength}/{BIO_MAX_LENGTH}
            </span>
          </div>
        </div>

        {errors.root && (
          <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {errors.root.message}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onDone}
            className="rounded-lg border border-gray-700 px-4 py-2 text-gray-300 hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-yellow-400 px-5 py-2 font-semibold text-gray-900 hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default EditProfileForm