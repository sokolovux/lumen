import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAppState } from '@/state/AppStateContext'
import { Button } from '@/components/ui/button'
import { RotateCcw } from 'lucide-react'

export function DemoControlsBar() {
  const { state, dispatch } = useAppState()
  const navigate = useNavigate()

  const handleReset = () => {
    dispatch({ type: 'RESET_DEMO' })
    toast.success('Demo reset', { description: 'All state restored to initial values.' })
  }

  const handleRoleChange = (role: 'assistant' | 'physician') => {
    if (state.role === role) return
    navigate('/schedule', { replace: true })
    dispatch({ type: 'SET_ROLE', role })
  }

  return (
    <div className="dark flex items-center gap-3 border-b border-border bg-background px-4 py-2 text-foreground scheme-dark">
      <div className="flex rounded-md border border-border bg-card p-0.5">
        {(['assistant', 'physician'] as const).map((role) => {
          const selected = state.role === role
          return (
            <Button
              key={role}
              variant={selected ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleRoleChange(role)}
            >
              {role === 'assistant' ? 'Assistant' : 'Physician'}
            </Button>
          )
        })}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleReset}
      >
        <RotateCcw className="size-3" />
        Reset demo
      </Button>
    </div>
  )
}
