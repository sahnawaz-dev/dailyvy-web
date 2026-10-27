/**
 * Create a tab, or rename / delete an existing one.
 * Render with a `key` so the form resets each time it opens.
 */
import { useState, type FormEvent } from 'react'
import { AlertCircle, FolderHeart } from 'lucide-react'
import { ConfirmDialog } from '@/shared/components'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Field, FieldGroup, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { Spinner } from '@/shared/components/ui/spinner'
import { getErrorMessage } from '@/shared/api/apiError'
import { useCreateTab, useDeleteTab, useRenameTab } from '../../services/habits.queries'
import type { Tab } from '../../types/habits.types'

interface TabFormModalProps {
  /** Tab to edit, or null to create one. */
  tab: Tab | null
  onClose: () => void
  onCreated?: (tab: Tab) => void
  onDeleted?: () => void
}

export function TabFormModal({ tab, onClose, onCreated, onDeleted }: TabFormModalProps) {
  const isEdit = tab !== null
  const [name, setName] = useState(tab?.name ?? '')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const createTab = useCreateTab()
  const renameTab = useRenameTab()
  const deleteTab = useDeleteTab()
  const save = isEdit ? renameTab : createTab

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || save.isPending) return
    if (isEdit) {
      renameTab.mutate({ tabId: tab.id, name: trimmed }, { onSuccess: onClose })
    } else {
      createTab.mutate(trimmed, {
        onSuccess: (created) => {
          onCreated?.(created)
          onClose()
        },
      })
    }
  }

  return (
    <>
      <Dialog open onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-sm">
          <form onSubmit={handleSubmit} className="grid gap-4">
            <DialogHeader>
              <DialogTitle>{isEdit ? 'Edit tab' : 'New tab'}</DialogTitle>
              <DialogDescription>Tabs group your habits, e.g. Health, Work or Learning.</DialogDescription>
            </DialogHeader>
            <FieldGroup>
              {save.isError && (
                <Alert variant="destructive">
                  <AlertCircle />
                  <AlertDescription>{getErrorMessage(save.error)}</AlertDescription>
                </Alert>
              )}
              <Field>
                <FieldLabel htmlFor="tab-name">Tab name</FieldLabel>
                <Input
                  id="tab-name"
                  placeholder="e.g. Health"
                  value={name}
                  maxLength={40}
                  onChange={(e) => setName(e.target.value)}
                />
              </Field>
            </FieldGroup>
            <DialogFooter>
              {isEdit && (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive sm:mr-auto"
                  onClick={() => setConfirmDelete(true)}
                >
                  Delete tab
                </Button>
              )}
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={!name.trim() || save.isPending}>
                {save.isPending && <Spinner />}
                {isEdit ? 'Save' : 'Create tab'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {isEdit && (
        <ConfirmDialog
          open={confirmDelete}
          title={`Delete the “${tab.name}” tab?`}
          message={`This tab holds habits you've been building. Deleting it stops all of them from today (past check-ins stay in your calendar). Need a break from just one? Archive that habit instead.`}
          keepFirst
          icon={<FolderHeart />}
          iconClassName="bg-success/15 text-success"
          cancelLabel="🌱 Keep my tab"
          confirmLabel="Delete tab and its habits"
          loading={deleteTab.isPending}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() =>
            deleteTab.mutate(tab.id, {
              onSuccess: () => {
                onClose()
                onDeleted?.()
              },
            })
          }
        />
      )}
    </>
  )
}
