import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, ExternalLink, Mail, Search, X } from 'lucide-react'
import TextField from '../../../components/TextField'
import CheckboxField from '../../../components/CheckboxField'
import StepIndicator from '../components/StepIndicator'
import MemberInviteCard from '../components/MemberInviteCard'
import ExecutiveEmailStatus from '../components/ExecutiveEmailStatus'
import { useAuthStore } from '../../auth/authStore'
import { createSocietyRequest, useMemberSuggestions } from '../api'
import {
  createSocietySchema,
  MIN_MEMBERS,
  MAX_DESCRIPTION_LENGTH,
  MAX_PROOF_SIZE_MB,
  RATIFICATION_TERM,
  SOCIETY_CATEGORIES,
} from '../createSocietySchema'

const STEPS = ['Ratification', 'Details', 'Executives', 'Members', 'Review']
const MEMBERS_STEP = 3

// Which form fields belong to each step (Members uses the invite list instead)
const STEP_FIELDS = [
  ['isRatified', 'proof'],
  ['name', 'category', 'description'],
  ['vpName', 'vpEmail', 'treasurerName', 'treasurerEmail'],
  [],
  ['confirmAccurate', 'agreeGuidelines'],
]

const LAST_STEP = STEPS.length - 1

// ---- Draft autosave ----
const DRAFT_KEY = 'dalchat-society-draft'

const EMPTY_VALUES = {
  isRatified: false,
  name: '',
  category: '',
  description: '',
  vpName: '',
  vpEmail: '',
  treasurerName: '',
  treasurerEmail: '',
  confirmAccurate: false,
  agreeGuidelines: false,
}

function loadDraft() {
  try {
    return JSON.parse(sessionStorage.getItem(DRAFT_KEY))
  } catch {
    return null
  }
}

function clearDraft() {
  try {
    sessionStorage.removeItem(DRAFT_KEY)
  } catch {
    // Storage can be unavailable (e.g. private mode)
  }
}

const fieldClass =
  'mt-1 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400'

function ReviewRow({ label, children, onEdit }) {
  return (
    <div className="flex items-start justify-between gap-4 p-4">
      <div className="min-w-0">
        <dt className="text-sm text-gray-400">{label}</dt>
        <dd className="mt-1 break-words text-white">{children}</dd>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="shrink-0 text-sm text-yellow-400 hover:underline"
      >
        Edit
      </button>
    </div>
  )
}

function CreateSocietyPage() {
  const user = useAuthStore((state) => state.user)
  const [draft] = useState(loadDraft)
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [emailInvitesSentTo, setEmailInvitesSentTo] = useState([])

  // Members step
  const [memberSearch, setMemberSearch] = useState('')
  const [invited, setInvited] = useState(draft?.invited ?? [])
  const [membersError, setMembersError] = useState('')

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createSocietySchema),
    mode: 'onTouched',
    defaultValues: { ...EMPTY_VALUES, ...draft?.values },
  })

  const values = watch()

  // Save everything except the file (browsers can't store files)
  const draftJson = JSON.stringify({
    values: Object.fromEntries(
      Object.entries(values).filter(([key]) => key !== 'proof')
    ),
    invited,
  })

  useEffect(() => {
    if (submitted) return
    try {
      sessionStorage.setItem(DRAFT_KEY, draftJson)
    } catch {
      // Storage can be unavailable (e.g. private mode); the form still works
    }
  }, [draftJson, submitted])

  const hasDraft = Boolean(draft?.values?.name || draft?.invited?.length)

  const {
    data: peopleResults = [],
    isPending: isPeoplePending,
    isError: isPeopleError,
  } = useMemberSuggestions({
    search: memberSearch,
    topic: `${values.name} ${values.description}`,
    enabled: step === MEMBERS_STEP,
  })

  // Everyone in the society: the 3 executives plus invited students, no duplicates
  function getAllMemberEmails(formValues) {
    const emails = [
      user.email,
      formValues.vpEmail,
      formValues.treasurerEmail,
      ...invited.map((person) => person.email),
    ]
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
    return [...new Set(emails)]
  }

  const memberCount = getAllMemberEmails(values).length

  function toggleInvite(person) {
    setMembersError('')
    setInvited((current) =>
      current.some((p) => p.id === person.id)
        ? current.filter((p) => p.id !== person.id)
        : [...current, person]
    )
  }

  // Checks that compare several fields, which Zod can't do one step at a time
  function passesExtraChecks(stepIndex) {
    const formValues = getValues()

    if (stepIndex === 2) {
      const mine = user.email.toLowerCase()
      const vp = formValues.vpEmail.trim().toLowerCase()
      const treasurer = formValues.treasurerEmail.trim().toLowerCase()

      if (vp === mine) {
        setError('vpEmail', { message: 'This is your email. Add a different executive.' })
        return false
      }
      if (treasurer === mine || treasurer === vp) {
        setError('treasurerEmail', { message: 'Each executive needs a different email.' })
        return false
      }
    }

    if (stepIndex === MEMBERS_STEP) {
      const total = getAllMemberEmails(formValues).length
      if (total < MIN_MEMBERS) {
        setMembersError(
          `You need at least ${MIN_MEMBERS} members in total. You have ${total}.`
        )
        return false
      }
    }

    return true
  }

  async function goNext() {
    const fields = STEP_FIELDS[step]
    const isValid = fields.length > 0 ? await trigger(fields) : true
    if (!isValid || !passesExtraChecks(step)) return
    setStep(step + 1)
  }

  async function onSubmit(formValues) {
    const formData = new FormData()
    formData.append('name', formValues.name)
    formData.append('category', formValues.category)
    formData.append('description', formValues.description)
    formData.append(
      'executives',
      JSON.stringify([
        { role: 'President', name: `${user.firstName} ${user.lastName}`, email: user.email },
        { role: 'Vice President', name: formValues.vpName, email: formValues.vpEmail },
        { role: 'Treasurer', name: formValues.treasurerName, email: formValues.treasurerEmail },
      ])
    )
    formData.append('members', JSON.stringify(getAllMemberEmails(formValues)))
    formData.append('proof', formValues.proof[0])

    try {
      const result = await createSocietyRequest(formData)
      clearDraft()
      setEmailInvitesSentTo(result.emailInvitesSentTo ?? [])
      setSubmitted(true)
    } catch (error) {
      const serverError = error.response?.data
      if (serverError?.field === 'name') {
        setError('name', { message: serverError.message })
        setStep(1)
        return
      }
      setError('root', {
        message: serverError?.message ?? 'Something went wrong. Please try again.',
      })
    }
  }

  function renderMemberResults() {
    if (isPeoplePending) {
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-[70px] animate-pulse rounded-xl bg-gray-900" />
          ))}
        </div>
      )
    }

    if (isPeopleError) {
      return <p className="text-red-400">Couldn't load students. Please try again.</p>
    }

    const people = peopleResults.filter((person) => person.email !== user.email)

    if (people.length === 0) {
      return (
        <p className="text-gray-400">
          {memberSearch
            ? `No students match "${memberSearch}".`
            : 'No suggestions yet. Try searching by name or program.'}
        </p>
      )
    }

    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {people.map((person) => (
          <MemberInviteCard
            key={person.id}
            person={person}
            isInvited={invited.some((p) => p.id === person.id)}
            onToggle={toggleInvite}
          />
        ))}
      </div>
    )
  }

  function renderStep() {
    if (step === 0) {
      return (
        <div className="space-y-5">
          {hasDraft && (
            <p className="rounded-lg border border-yellow-400/40 bg-yellow-400/10 px-3 py-2 text-sm text-yellow-300">
              We restored your saved progress. Re-attach your DSU file, then click Next to continue.
            </p>
          )}

          <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
            <p className="font-semibold">Before you start, your society needs:</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-gray-300">
              <li>Official ratification with the Dalhousie Student Union (DSU) for {RATIFICATION_TERM}</li>
              <li>Your DSU ratification confirmation email, as a PDF, PNG or JPG (max {MAX_PROOF_SIZE_MB} MB)</li>
              <li>3 executives with @dal.ca emails: President (you), Vice President and Treasurer</li>
              <li>At least {MIN_MEMBERS} members in total, including executives</li>
              <li>A name that isn't already used by another society on DalChat</li>
            </ul>
            <p className="mt-3 text-sm text-gray-400">
              The DalChat team reviews every application before the society goes live.
            </p>
            <a
              href="https://www.dsu.ca/ratification"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-sm text-yellow-400 hover:underline"
            >
              Not ratified yet? Start with the DSU <ExternalLink size={14} />
            </a>
          </div>

          <CheckboxField
            label={`Yes, my society is officially ratified with the DSU for ${RATIFICATION_TERM}`}
            error={errors.isRatified}
            {...register('isRatified')}
          />

          <div>
            <label htmlFor="proof" className="block text-sm font-medium text-gray-300">
              DSU ratification confirmation
            </label>
            <input
              id="proof"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              {...register('proof')}
              className="mt-2 block w-full text-sm text-gray-300 file:mr-4 file:rounded-lg file:border-0 file:bg-yellow-400 file:px-4 file:py-2 file:font-semibold file:text-gray-900 hover:file:bg-yellow-300"
            />
            {values.proof?.[0] && (
              <p className="mt-1 text-sm text-gray-400">Selected: {values.proof[0].name}</p>
            )}
            {errors.proof && <p className="mt-1 text-sm text-red-400">{errors.proof.message}</p>}
          </div>
        </div>
      )
    }

    if (step === 1) {
      return (
        <div className="space-y-4">
          <TextField
            label="Society name"
            placeholder="e.g. Soccer Society"
            error={errors.name}
            {...register('name')}
          />

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-300">
              Category
            </label>
            <select id="category" {...register('category')} className={fieldClass}>
              <option value="">Choose a category</option>
              {SOCIETY_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-400">{errors.category.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300">
              What does your society do?
            </label>
            <textarea
              id="description"
              rows={5}
              placeholder="Tell students what your society is about, who it's for, and what events you run."
              {...register('description')}
              className={fieldClass}
            />
            <div className="mt-1 flex justify-between gap-4 text-sm">
              <span className="text-red-400">{errors.description?.message}</span>
              <span className="shrink-0 text-gray-500">
                {values.description.length}/{MAX_DESCRIPTION_LENGTH}
              </span>
            </div>
          </div>
        </div>
      )
    }

    if (step === 2) {
      return (
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
            <p className="text-sm text-gray-400">President</p>
            <p className="font-semibold">
              {user.firstName} {user.lastName}{' '}
              <span className="text-sm font-normal text-gray-400">(you)</span>
            </p>
            <p className="text-sm text-gray-400">{user.email}</p>
          </div>

          <div>
            <p className="mb-2 font-semibold">Vice President</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Full name" error={errors.vpName} {...register('vpName')} />
              <TextField
                label="Dal email"
                type="email"
                placeholder="name@dal.ca"
                error={errors.vpEmail}
                {...register('vpEmail')}
              />
            </div>
            <ExecutiveEmailStatus email={values.vpEmail} />
          </div>

          <div>
            <p className="mb-2 font-semibold">Treasurer</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Full name"
                error={errors.treasurerName}
                {...register('treasurerName')}
              />
              <TextField
                label="Dal email"
                type="email"
                placeholder="name@dal.ca"
                error={errors.treasurerEmail}
                {...register('treasurerEmail')}
              />
            </div>
            <ExecutiveEmailStatus email={values.treasurerEmail} />
          </div>
        </div>
      )
    }

    if (step === MEMBERS_STEP) {
      return (
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            Invite students to join. Your 3 executives count toward the {MIN_MEMBERS}-member minimum.
          </p>

          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              value={memberSearch}
              onChange={(event) => setMemberSearch(event.target.value)}
              placeholder="Search students by name or program"
              className="w-full rounded-lg border border-gray-700 bg-gray-900 py-2 pl-10 pr-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          {invited.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {invited.map((person) => (
                <span
                  key={person.id}
                  className="flex items-center gap-1 rounded-full bg-gray-800 py-1 pl-3 pr-2 text-sm text-gray-200"
                >
                  {person.name}
                  <button
                    type="button"
                    onClick={() => toggleInvite(person)}
                    aria-label={`Cancel invite for ${person.name}`}
                    className="rounded-full p-0.5 text-gray-400 hover:bg-gray-700 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}

          <p className="text-sm font-semibold text-gray-300">
            {memberSearch ? 'Search results' : 'Suggested for your society'}
          </p>

          {renderMemberResults()}

          {membersError && <p className="text-sm text-red-400">{membersError}</p>}

          <p
            className={`text-sm font-medium ${
              memberCount >= MIN_MEMBERS ? 'text-green-400' : 'text-gray-400'
            }`}
          >
            Members: {memberCount} / {MIN_MEMBERS} minimum
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-5">
        <dl className="divide-y divide-gray-800 rounded-xl border border-gray-800 bg-gray-900/60">
          <ReviewRow label="DSU ratification proof" onEdit={() => setStep(0)}>
            {values.proof?.[0]?.name}
          </ReviewRow>
          <ReviewRow label="Society" onEdit={() => setStep(1)}>
            {values.name} · {values.category}
          </ReviewRow>
          <ReviewRow label="Description" onEdit={() => setStep(1)}>
            {values.description}
          </ReviewRow>
          <ReviewRow label="Executives" onEdit={() => setStep(2)}>
            President: {user.firstName} {user.lastName}
            <br />
            Vice President: {values.vpName}
            <br />
            Treasurer: {values.treasurerName}
          </ReviewRow>
          <ReviewRow label="Members" onEdit={() => setStep(MEMBERS_STEP)}>
            {memberCount} members ({invited.length} invited)
          </ReviewRow>
        </dl>

        <CheckboxField
          label="I confirm this information is accurate and my society is ratified with the DSU."
          error={errors.confirmAccurate}
          {...register('confirmAccurate')}
        />
        <CheckboxField
          label="I agree to follow DalChat's community guidelines and the DSU Society Policy."
          error={errors.agreeGuidelines}
          {...register('agreeGuidelines')}
        />

        {errors.root && (
          <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {errors.root.message}
          </p>
        )}
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-gray-800 bg-gray-900/60 p-8 text-center">
        <CheckCircle2 size={56} className="mx-auto text-green-400" />
        <h2 className="mt-4 text-2xl font-bold">Application submitted</h2>
        <p className="mt-2 text-gray-400">
          We'll check your DSU ratification and let you know once {values.name} is live on DalChat.
        </p>

        {emailInvitesSentTo.length > 0 && (
          <div className="mt-6 rounded-lg border border-gray-800 bg-gray-900 p-4 text-left text-sm">
            <p className="flex items-center gap-1.5 font-medium text-white">
              <Mail size={16} />
              Email invites sent
            </p>
            <ul className="mt-2 list-disc space-y-0.5 pl-5 text-gray-300">
              {emailInvitesSentTo.map((email) => (
                <li key={email}>{email}</li>
              ))}
            </ul>
            <p className="mt-2 text-gray-400">
              They need to join DalChat with that email to accept their role.
            </p>
          </div>
        )}

        <Link
          to="/discover?tab=clubs"
          className="mt-6 inline-block rounded-lg bg-yellow-400 px-5 py-2 font-semibold text-gray-900 hover:bg-yellow-300"
        >
          Back to Clubs
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="text-2xl font-bold">Create a society</h2>
      <p className="mt-2 text-gray-400">Bring your DSU-ratified society to DalChat.</p>

      <div className="mt-6">
        <StepIndicator steps={STEPS} currentStep={step} />
      </div>

      <form
        noValidate
        className="mt-8"
        onSubmit={
          step === LAST_STEP
            ? handleSubmit(onSubmit)
            : (event) => {
                event.preventDefault()
                goNext()
              }
        }
      >
        {renderStep()}

        <div className="mt-8 flex justify-between">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="rounded-lg border border-gray-700 px-4 py-2 text-gray-300 hover:bg-gray-800"
            >
              Back
            </button>
          ) : (
            <Link
              to="/clubs"
              onClick={clearDraft}
              className="rounded-lg border border-gray-700 px-4 py-2 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Link>
          )}

          {step < LAST_STEP ? (
            <button
              key="next"
              type="button"
              onClick={goNext}
              className="rounded-lg bg-yellow-400 px-5 py-2 font-semibold text-gray-900 hover:bg-yellow-300"
            >
              Next
            </button>
          ) : (
            <button
              key="submit"
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-yellow-400 px-5 py-2 font-semibold text-gray-900 hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Submitting…' : 'Submit application'}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default CreateSocietyPage