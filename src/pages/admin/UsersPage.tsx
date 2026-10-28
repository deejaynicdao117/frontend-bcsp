import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Plus, Search, ShieldCheck } from 'lucide-react'
import { Alert, Card, EmptyState, PageHeader, Spinner } from '../../components/ui'
import {
  createAdminUser,
  deleteAdminUser,
  getAdminUsers,
  updateAdminUser,
} from '../../shared/api'
import { useSession } from '../../shared/session-context'
import type { PortalUser, Role } from '../../shared/types'

type NewUser = {
  name: string
  email: string
  password: string
  role: Role
}

const roleOptions: Exclude<Role, 'platform_admin'>[] = ['admin', 'staff', 'resident']
const emptyUsers: PortalUser[] = []

export default function UsersPage() {
  const { session } = useSession()
  const queryClient = useQueryClient()
  const usersQuery = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: getAdminUsers,
  })
  const users = usersQuery.data?.data ?? emptyUsers
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newUser, setNewUser] = useState<NewUser>({
    name: '',
    email: '',
    password: '',
    role: 'resident',
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const createUserMutation = useMutation({
    mutationFn: createAdminUser,
  })
  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: {
      id: number
      data: Pick<PortalUser, 'name' | 'email' | 'role'>
    }) => updateAdminUser(id, data),
  })
  const deleteUserMutation = useMutation({
    mutationFn: deleteAdminUser,
  })

  async function reloadUsers() {
    await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
  }

  const filteredUsers = useMemo(
    () => users.filter((item) => {
      const query = search.toLowerCase()
      const matchesRole = roleFilter === 'all' || item.role === roleFilter
      const matchesSearch = `${item.name} ${item.email}`.toLowerCase().includes(query)

      return matchesRole && matchesSearch
    }),
    [users, search, roleFilter],
  )

  async function createUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setSuccess('')
    try {
      await createUserMutation.mutateAsync(newUser)
      setNewUser({ name: '', email: '', password: '', role: 'resident' })
      setShowCreateForm(false)
      await reloadUsers()
      setSuccess('Account created successfully.')
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Could not create account.')
    } finally {
      setBusy(false)
    }
  }

  async function updateUser(updatedUser: PortalUser) {
    setBusy(true)
    setError('')
    setSuccess('')
    try {
      const result = await updateUserMutation.mutateAsync({
        id: updatedUser.id,
        data: {
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
        },
      })
      queryClient.setQueryData(
        ['admin', 'users'],
        (current: { data: PortalUser[] } | undefined) => current
          ? {
              ...current,
              data: current.data.map((item) => (
                item.id === result.data.id ? result.data : item
              )),
            }
          : current,
      )
      setSuccess(`${result.data.name}'s account was updated.`)
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Could not update account.')
    } finally {
      setBusy(false)
    }
  }

  function updateUserDraft(updatedUser: PortalUser) {
    queryClient.setQueryData(
      ['admin', 'users'],
      (current: { data: PortalUser[] } | undefined) => current
        ? {
            ...current,
            data: current.data.map((item) => (
              item.id === updatedUser.id ? updatedUser : item
            )),
          }
        : current,
    )
  }

  async function deleteUser(target: PortalUser) {
    if (
      target.id === session.user.id
      || !window.confirm(`Delete the account for ${target.name}? This cannot be undone.`)
    ) {
      return
    }
    setBusy(true)
    setError('')
    setSuccess('')
    try {
      await deleteUserMutation.mutateAsync(target.id)
      await reloadUsers()
      setSuccess(`${target.name}'s account was deleted.`)
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Could not delete account.')
    } finally {
      setBusy(false)
    }
  }

  if (usersQuery.isPending) return <Spinner label="Loading portal accounts…" />

  const loadError = usersQuery.error instanceof Error ? usersQuery.error.message : ''

  return (
    <div className="space-y-6">
      {(error || loadError || success) && (
        <Alert tone={error || loadError ? 'error' : 'success'} onDismiss={() => { setError(''); setSuccess('') }}>
          {error || loadError || success}
        </Alert>
      )}

      <PageHeader
        eyebrow="People and access"
        title="User management"
        description="Create accounts, update profile details, and assign portal roles."
        action={
          <button type="button" onClick={() => setShowCreateForm((value) => !value)} className="btn btn-primary">
            <Plus size={16} />
            Add user
          </button>
        }
      />

      {showCreateForm && (
        <Card
          title="Create user account"
          action={
            <button type="button" aria-label="Close create form" onClick={() => setShowCreateForm(false)} className="text-slate-400 transition hover:text-slate-700">
              ✕
            </button>
          }
        >
          <form onSubmit={createUser} className="grid gap-4 p-5 sm:grid-cols-2">
            <label className="field-label">
              Full name
              <input
                required
                className="input mt-1.5"
                value={newUser.name}
                onChange={(event) => setNewUser({ ...newUser, name: event.target.value })}
              />
            </label>
            <label className="field-label">
              Email address
              <input
                required
                type="email"
                className="input mt-1.5"
                value={newUser.email}
                onChange={(event) => setNewUser({ ...newUser, email: event.target.value })}
              />
            </label>
            <label className="field-label">
              Temporary password
              <input
                required
                minLength={8}
                type="password"
                className="input mt-1.5"
                value={newUser.password}
                onChange={(event) => setNewUser({ ...newUser, password: event.target.value })}
              />
            </label>
            <label className="field-label">
              Role
              <select
                className="input mt-1.5"
                value={newUser.role}
                onChange={(event) => setNewUser({ ...newUser, role: event.target.value as Role })}
              >
                {roleOptions.map((role) => <option key={role} value={role}>{role}</option>)}
              </select>
            </label>
            <div className="flex justify-end gap-2 sm:col-span-2">
              <button type="button" onClick={() => setShowCreateForm(false)} className="btn btn-secondary">Cancel</button>
              <button disabled={busy} type="submit" className="btn btn-primary">{busy ? 'Creating…' : 'Create account'}</button>
            </div>
          </form>
        </Card>
      )}

      <Card title={`Portal accounts (${filteredUsers.length})`}>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
            <input
              aria-label="Search users"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name or email…"
              className="input pl-9"
            />
          </label>
          <select
            aria-label="Filter users by role"
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            className="input sm:w-44"
          >
            <option value="all">All roles</option>
            {roleOptions.map((role) => <option key={role} value={role}>{role}</option>)}
          </select>
        </div>

        {filteredUsers.length === 0 ? (
          <EmptyState title="No matching accounts" hint="Try a different search or role filter." />
        ) : (
          <div className="w-full max-w-full overflow-x-auto overscroll-x-contain">
            <table className="w-full min-w-[840px] text-sm">
              <thead className="table-head">
                <tr>
                  <th className="table-th">Name</th>
                  <th className="table-th">Email</th>
                  <th className="table-th">Role</th>
                  <th className="table-th text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="table-td">
                      <input
                        aria-label={`Name for ${item.email}`}
                        className="input min-w-40"
                        value={item.name}
                        onChange={(event) => updateUserDraft({ ...item, name: event.target.value })}
                      />
                    </td>
                    <td className="table-td">
                      <input
                        aria-label={`Email for ${item.name}`}
                        className="input min-w-52"
                        type="email"
                        value={item.email}
                        onChange={(event) => updateUserDraft({ ...item, email: event.target.value })}
                      />
                    </td>
                    <td className="table-td">
                      <select
                        aria-label={`Role for ${item.name}`}
                        className="input min-w-32 capitalize"
                        value={item.role}
                        onChange={(event) => updateUserDraft({ ...item, role: event.target.value as Role })}
                      >
                        {roleOptions.map((role) => <option key={role} value={role}>{role}</option>)}
                      </select>
                    </td>
                    <td className="table-td">
                      <div className="flex justify-end gap-2">
                        <button type="button" disabled={busy} onClick={() => updateUser(item)} className="btn btn-soft btn-sm">
                          <Check size={14} />
                          Save
                        </button>
                        <button
                          type="button"
                          disabled={busy || item.id === session.user.id}
                          title={item.id === session.user.id ? 'You cannot delete your own account' : 'Delete user'}
                          onClick={() => deleteUser(item)}
                          className="btn btn-danger-soft btn-sm"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <p className="flex items-center gap-2 text-xs text-slate-400">
        <ShieldCheck size={14} />
        Your own administrator account cannot be deleted or demoted.
      </p>
    </div>
  )
}
