import { StyleTransition } from 'preact-transitioning'
import { useRef } from 'preact/hooks'
import * as lucid from 'lucide-react'

import Language from '../scripts/language'
import Palette from '../scripts/palette'
import Overlay from '../scripts/overlay'
import State from '../scripts/state'
import Image from '../scripts/image'

// The image statistics component.
export default () => {
  const backgroundReference = useRef<HTMLDivElement>(null)

  // Handle background mouse click events.
  const handleBackgroundClick = (event: MouseEvent): void => {
    if (event.target === backgroundReference.current) {
      State.updateLayout({ imageStatistics: false })
    }
  }

  return (
    <StyleTransition
      in={State.layout.imageStatistics}
      styles={{
        enter: { opacity: 0 },
        enterActive: { opacity: 1 },
        exit: { opacity: 1 },
        exitActive: { opacity: 0 }
      }}
    >
      <div ref={backgroundReference} onClick={handleBackgroundClick} style={{ position: 'fixed', display: 'flex', justifyContent: 'center', alignItems: 'center', left: '0rem', top: '0rem', width: '100dvw', height: '100dvh', backdropFilter: 'brightness(0.5) blur(0.5rem)', transition: 'opacity 0.3s', cursor: 'pointer', zIndex: 999 }}>
        <div class='wpa-container-light wpa-shadow' style={{ display: 'flex', flexDirection: 'column', borderRadius: '1.25rem', width: '40rem', maxHeight: 'calc(100dvh - calc(var(--wpa-spacing-medium) * 2))', cursor: 'auto', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--wpa-spacing-small)', borderBottom: '0.1rem solid var(--wpa-color-container-dark)', padding: 'var(--wpa-spacing-medium)' }}>
            <h3 class='wpa-title-3' style={{ flex: 1 }}>{Language.translate('common', 'Image Statistics')}</h3>

            <button class='wpa-button' title={Language.translate('imageStatistics', 'Close Image Statistics')} onClick={() => State.updateLayout({ imageStatistics: false })} style={{ width: '2rem', height: '2rem', padding: '0rem' }}>
              <lucid.X size='16'/>
            </button>
          </div>

          {
            (State.image === null) ? (
              <div style={{ flex: 1, padding: 'var(--wpa-spacing-medium)' }}>
                <p class='wpa-description'>{Language.translate('common', 'No image is loaded.')}</p>
              </div>
            ) : (
              <div style={{ flex: 1, padding: 'var(--wpa-spacing-medium)', minHeight: '0rem', overflow: 'auto' }}>
                <div style={{ display: 'flex', gap: 'var(--wpa-spacing-small)', alignItems: 'center' }}>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', marginBottom: 'var(--wpa-spacing-medium)' }}>
                    <lucid.ImageUpscale size='24' style={{ marginRight: 'var(--wpa-spacing-small)' }}></lucid.ImageUpscale>
                    <p class='wpa-description'>{Language.translate('imageStatistics', 'Size')}: {State.image.width} x {State.image.height}</p>
                  </div>

                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', marginBottom: 'var(--wpa-spacing-medium)' }}>
                    <lucid.MapPin size='24' style={{ marginRight: 'var(--wpa-spacing-small)' }}></lucid.MapPin>
                    <p class='wpa-description'>{Language.translate('imageStatistics', 'Position')}: {(State.image.position === null) ? Language.translate('imageStatistics', 'Not Set') : `${State.image.position.tileX}, ${State.image.position.tileY}, ${State.image.position.localX}, ${State.image.position.localY}`}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--wpa-spacing-small)', alignItems: 'center' }}>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', marginBottom: 'var(--wpa-spacing-medium)' }}>
                    <lucid.Image size='24' style={{ marginRight: 'var(--wpa-spacing-small)' }}></lucid.Image>
                    <p class='wpa-description'>{Language.translate('imageStatistics', 'Pixels')}: {State.image.width * State.image.height}</p>
                  </div>

                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', marginBottom: 'var(--wpa-spacing-medium)' }}>
                    <lucid.Palette size='24' style={{ marginRight: 'var(--wpa-spacing-small)' }}></lucid.Palette>
                    <p class='wpa-description'>{Language.translate('imageStatistics', 'Colors')}: {Object.keys(Image.colors).length}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--wpa-spacing-medium)', alignItems: 'center', marginBottom: 'var(--wpa-spacing-medium)' }}>
                  <div style={{ flex: 1, backgroundColor: 'var(--wpa-color-container-dark)', height: '0.1rem' }}></div>
                  <h1 class='wpa-title-1'>{Language.translate('imageStatistics', 'Progress')}</h1>
                  <div style={{ flex: 1, backgroundColor: 'var(--wpa-color-container-dark)', height: '0.1rem' }}></div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--wpa-spacing-small)', height: '25rem', marginBottom: 'var(--wpa-spacing-small)' }}>
                  <div class='wpa-container-dark wpa-container-small' style={{ flex: 1, minHeight: '0rem', padding: 'var(--wpa-spacing-small)', overflow: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <h5 class='wpa-title-5'>{Language.translate('common', 'Free Colors')}</h5>
                    </div>

                    {
                      Object.keys(Overlay.progress.value).filter((name) => !Palette.colors[name].paid).map((name) => {
                        const progress = Overlay.progress.value[name]
                        const color = Palette.colors[name]

                        return (
                          <div style={{ display: 'flex', alignItems: 'center', marginTop: 'var(--wpa-spacing-tiny)' }}>
                            <div style={{ flexShrink: 0, backgroundColor: `rgb(${color.rgba.join(',')})`, borderRadius: '0.5rem', width: '1rem', height: '1rem', marginRight: 'var(--wpa-spacing-small)' }}></div>
                            <p class='wpa-description'>{name} {Math.round((100 / progress.total) * progress.painted)}% ({progress.painted} / {progress.total})</p>
                          </div>
                        )
                      })
                    }
                  </div>

                  <div class='wpa-container-dark wpa-container-small' style={{ flex: 1, minHeight: '0rem', padding: 'var(--wpa-spacing-small)', overflow: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <h5 class='wpa-title-5'>{Language.translate('common', 'Paid Colors')}</h5>
                    </div>

                    {
                      Object.keys(Overlay.progress.value).filter((name) => Palette.colors[name].paid).map((name) => {
                        const progress = Overlay.progress.value[name]
                        const color = Palette.colors[name]

                        return (
                          <div style={{ display: 'flex', alignItems: 'center', marginTop: 'var(--wpa-spacing-tiny)' }}>
                            <div style={{ flexShrink: 0, backgroundColor: `rgb(${color.rgba.join(',')})`, borderRadius: '0.5rem', width: '1rem', height: '1rem', marginRight: 'var(--wpa-spacing-small)' }}></div>
                            <p class='wpa-description'>{name} {Math.round((100 / progress.total) * progress.painted)}% ({progress.painted} / {progress.total})</p>
                          </div>
                        )
                      })
                    }
                  </div>
                </div>

                <p class='wpa-description' style={{ textWrap: 'wrap', opacity: 0.5 }}>{Language.translate('imageStatistics', 'Only tiles in your view are calculated, please make sure the whole overlay is visible to get an accurate progress.')}</p>
              </div>
            )
          }
        </div>
      </div>
    </StyleTransition>
  )
}
