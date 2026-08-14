import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'ghost' | 'danger' | 'icon'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  children: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-violet-500 hover:bg-violet-400 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/40 active:scale-[0.98]',
  ghost:
    'bg-white/5 hover:bg-white/10 text-zinc-200 border border-white/10 hover:border-white/20 active:scale-[0.98]',
  danger:
    'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/25 active:scale-[0.98]',
  icon: 'bg-transparent hover:bg-white/10 text-zinc-300 hover:text-white border border-transparent active:scale-95',
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const sizeClasses =
    variant === 'icon' ? 'h-10 w-10 rounded-full p-0' : 'rounded-xl px-4 py-2.5'

  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${sizeClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
