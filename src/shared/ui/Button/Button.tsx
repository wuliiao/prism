import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'ghost' | 'danger' | 'icon'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  children: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-sky-500/90 hover:bg-sky-400 text-slate-950 font-semibold shadow-[0_0_20px_rgb(56_189_248/25%)] hover:shadow-[0_0_28px_rgb(56_189_248/35%)] border border-sky-300/30 active:scale-[0.98]',
  ghost:
    'bg-sky-500/8 hover:bg-sky-500/15 text-sky-100 border border-sky-400/20 hover:border-sky-400/35 active:scale-[0.98]',
  danger:
    'bg-rose-500/12 hover:bg-rose-500/20 text-rose-200 border border-rose-400/25 active:scale-[0.98]',
  icon: 'bg-transparent hover:bg-sky-500/12 text-sky-200/80 hover:text-sky-100 border border-transparent active:scale-95',
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const sizeClasses =
    variant === 'icon' ? 'h-10 w-10 rounded-full p-0' : 'rounded-md px-4 py-2.5 font-mono text-xs uppercase tracking-wider'

  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050a14] cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${sizeClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
