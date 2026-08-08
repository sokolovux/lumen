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

  const handleRoleChange = (role: 'pa' | 'physician') => {
    if (state.role === role) return
    dispatch({ type: 'SET_ROLE', role })
    navigate('/schedule', { replace: true })
  }

  return (
    <div className="dark flex items-center gap-3 border-b border-border bg-background px-4 py-2 text-foreground scheme-dark">
      <div className="flex rounded-lg border border-border bg-card p-0.5">
        {(['pa', 'physician'] as const).map((role) => {
          const selected = state.role === role
          return (
            <Button
              key={role}
              variant={selected ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleRoleChange(role)}
            >
              {role === 'pa' ? 'PA' : 'Physician'}
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
