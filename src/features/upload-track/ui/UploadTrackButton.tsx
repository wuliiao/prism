import { useRef } from 'react'
import { createLocalTrack } from '@entities/track'
import type { Track } from '@entities/track'
import { Button } from '@shared/ui/Button'

interface UploadTrackButtonProps {
  onUpload: (track: Track) => void
}

export function UploadTrackButton({ onUpload }: UploadTrackButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const objectUrl = URL.createObjectURL(file)
    onUpload(createLocalTrack(file, objectUrl))
    event.target.value = ''
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={handleChange}
      />
      <Button variant="ghost" onClick={() => inputRef.current?.click()}>
        Upload track
      </Button>
    </>
  )
}
