import type { InputHTMLAttributes } from 'react'

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

export function Slider({ label, className = '', ...props }: SliderProps) {
  return (
    <label className="flex flex-col gap-1">
      {label ? <span className="text-xs text-zinc-400">{label}</span> : null}
      <input
        type="range"
        className={`h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-violet-400 ${className}`}
        {...props}
      />
    </label>
  )
}
