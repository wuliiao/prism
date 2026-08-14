import { useRef } from 'react'
import { createLocalTrack } from '@entities/track'
import type { Track } from '@entities/track'
import { IconUpload } from '@shared/ui/Icon'
import { Button } from '@shared/ui/Button'

interface UploadTrackButtonProps {
  onUpload: (track: Track) => void
  onError?: (message: string) => void
}

export function UploadTrackButton({ onUpload, onError }: UploadTrackButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const objectUrlRef = useRef<string | null>(null)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!file.type.startsWith('audio/')) {
      onError?.('Please choose an audio file (MP3, WAV, etc.)')
      return
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
    }

    const objectUrl = URL.createObjectURL(file)
    objectUrlRef.current = objectUrl
    onUpload(createLocalTrack(file, objectUrl))
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
        <IconUpload className="h-4 w-4" />
        Upload
      </Button>
    </>
  )
}
