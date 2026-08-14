import type { InputHTMLAttributes } from 'react'

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  showLabel?: boolean
}

export function Slider({ label, showLabel = true, className = '', ...props }: SliderProps) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      {label && showLabel ? (
        <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
          {label}
        </span>
      ) : null}
      <input
        type="range"
        className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-violet-400 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md"
        {...props}
      />
    </label>
  )
}
