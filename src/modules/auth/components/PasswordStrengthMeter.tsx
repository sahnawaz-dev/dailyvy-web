import { Check, Circle } from 'lucide-react'
import { Progress } from '@/shared/components/ui/progress'
import { cn } from '@/shared/lib/utils'
import { PASSWORD_RULES, passwordScore } from '../utils/password'

const LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong']

export function PasswordStrengthMeter({ password }: { password: string }) {
  const score = passwordScore(password)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <Progress value={score * 25} className="h-1.5" aria-label="Password strength" />
        <span className="w-12 shrink-0 text-right text-xs text-muted-foreground">{LABELS[score]}</span>
      </div>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-0.5">
        {PASSWORD_RULES.map((rule) => {
          const ok = rule.test(password)
          return (
            <li
              key={rule.id}
              className={cn('flex items-center gap-1.5 text-xs', ok ? 'text-success' : 'text-muted-foreground')}
            >
              {ok ? <Check className="size-3" /> : <Circle className="size-2" />}
              {rule.label}
              <span className="sr-only">{ok ? '(met)' : '(not met)'}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
