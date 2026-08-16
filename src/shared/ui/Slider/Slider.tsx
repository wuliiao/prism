import type { InputHTMLAttributes } from 'react'

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  showLabel?: boolean
}

export function Slider({ label, showLabel = true, className = '', ...props }: SliderProps) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      {label && showLabel ? (
        <span className="hud-label">{label}</span>
      ) : null}
      <input
        type="range"
        className="h-1 w-full cursor-pointer appearance-none rounded-full bg-sky-950/80 accent-sky-400 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-sky-300/50 [&::-webkit-slider-thumb]:bg-sky-200 [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgb(56_189_248/40%)]"
        {...props}
      />
    </label>
  )
}
