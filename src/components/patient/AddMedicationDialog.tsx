import { useState } from 'react'
import { toast } from 'sonner'
import { useAppState } from '@/state/AppStateContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

export function AddMedicationDialog() {
  const { dispatch } = useAppState()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [dose, setDose] = useState('')
  const [frequency, setFrequency] = useState('')

  const handleAdd = () => {
    if (!name.trim() || !dose.trim() || !frequency.trim()) return
    dispatch({ type: 'ADD_MEDICATION', name, dose, frequency })
    toast.success(`${name} added`)
    setName('')
    setDose('')
    setFrequency('')
    setOpen(false)
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        Add medication
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add medication</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Medication name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Dose" value={dose} onChange={(e) => setDose(e.target.value)} />
            <Input placeholder="Frequency" value={frequency} onChange={(e) => setFrequency(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              onClick={handleAdd}
              disabled={!name.trim() || !dose.trim() || !frequency.trim()}
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
