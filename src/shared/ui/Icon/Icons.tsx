type IconProps = { className?: string }

export function IconPlay({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5.14v14.72a1 1 0 0 0 1.5.86l11.04-7.36a1 1 0 0 0 0-1.72L9.5 4.28A1 1 0 0 0 8 5.14Z" />
    </svg>
  )
}

export function IconPause({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5Zm8 0a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V5Z" />
    </svg>
  )
}

export function IconSkipBack({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6 6a1 1 0 0 1 1.73-.73l8 7a1 1 0 0 1 0 1.46l-8 7A1 1 0 0 1 6 20V6ZM16 6a1 1 0 0 1 1.73-.73l4 3.5a1 1 0 0 1 0 1.46l-4 3.5A1 1 0 0 1 16 20V6Z" />
    </svg>
  )
}

export function IconSkipForward({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18 6a1 1 0 0 0-1.73-.73l-8 7a1 1 0 0 0 0 1.46l8 7A1 1 0 0 0 18 20V6ZM8 6a1 1 0 0 0-1.73-.73l-4 3.5a1 1 0 0 0 0 1.46l4 3.5A1 1 0 0 0 8 20V6Z" />
    </svg>
  )
}

export function IconVolume({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11 4.702a1 1 0 0 1 1.73-.73l4.5 4.5H20a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-2.77l-4.5 4.5A1 1 0 0 1 11 19.298V4.702ZM4 9a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h1V9H4Z" />
    </svg>
  )
}

export function IconUpload({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0 4 4m-4-4-4 4M4 20h16" />
    </svg>
  )
}

export function IconMusic({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6Z" />
    </svg>
  )
}

export function IconPlus({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function IconCheck({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

export function IconClose({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
    </svg>
  )
}
