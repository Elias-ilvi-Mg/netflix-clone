import { useEffect, useState } from 'react'

/**
 * Show Skip Intro / Next Episode buttons based on time windows.
 * Props:
 *  - t: current time (sec)
 *  - d: duration (sec)
 *  - introStartSec, introEndSec, creditsStartSec
 *  - onSeek(toSec)
 *  - onNext()
 */
export default function SkipControls({
  t = 0, d = 0,
  introStartSec = 0, introEndSec = 0, creditsStartSec = 0,
  onSeek, onNext
}) {
  const [showIntro, setShowIntro] = useState(false)
  const [showNext, setShowNext] = useState(false)

  useEffect(() => {
    const inIntro = introEndSec > introStartSec && t >= introStartSec && t <= introEndSec
    setShowIntro(inIntro)
    const nearCredits = creditsStartSec > 0 && t >= creditsStartSec - 1
    setShowNext(nearCredits)
  }, [t, introStartSec, introEndSec, creditsStartSec])

  if (!showIntro && !showNext) return null

  return (
    <div style={{
      position:'absolute', right:12, bottom:12, display:'grid', gap:8,
      zIndex: 10
    }}>
      {showIntro && (
        <button
          onClick={() => onSeek?.(introEndSec)}
          style={{ background:'rgba(0,0,0,.7)', color:'#fff', border:'1px solid #333', borderRadius:10, padding:'10px 12px' }}
        >
          Skip Intro
        </button>
      )}
      {showNext && (
        <button
          onClick={() => onNext?.()}
          style={{ background:'rgba(0,0,0,.7)', color:'#fff', border:'1px solid #333', borderRadius:10, padding:'10px 12px' }}
        >
          Next Episode ▶
        </button>
      )}
    </div>
  )
}
