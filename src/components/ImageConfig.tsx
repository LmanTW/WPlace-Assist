import { useRef, useEffect } from 'preact/hooks'
import { StyleTransition } from 'preact-transitioning'
import * as lucid from 'lucide-react'

import Language from '../scripts/language'
import Palette from '../scripts/palette'
import State from '../scripts/state'
import Image from '../scripts/image'

// The image config component.
export default () => {
  const backgroundReference = useRef<HTMLDivElement>(null)
  const canvasReference = useRef<HTMLCanvasElement>(null)

  // Handle background mouse click events.
  const handleBackgroundClick = (event: MouseEvent): void => {
    if (!State.control.gettingAvailableColors && event.target === backgroundReference.current) {
      State.updateLayout({ imageConfig: false })
    }
  }

  // Reset the image config.
  const resetImageConfig = (): void => {
    if (State.image !== null && Image.image !== null) {
      State.updateImage({
        width: Image.image.width,
        height: Image.image.height,
        lockAspectRatio: true,

        colors: Object.keys(Palette.colors),
        dithering: true
      })
    }
  }

  // Update the width of the image.
  const updateImageWidth = (value: number): void => {
    if (State.image !== null) {
      if (isNaN(value)) {
        State.updateImage({
          width: State.image.width
        })
      } else if (value !== State.image.width) {
        State.updateImage({
          width: value,
          height: Math.round(value * (State.image.height / State.image.width))
        })
      }
    }
  }

  // Update the height of the image.
  const updateImageHeight = (value: number): void => {
    if (State.image !== null) {
      if (isNaN(value)) {
        State.updateImage({
          height: State.image.height
        })
      } else if (value !== State.image.height) {
        State.updateImage({
          width: Math.round(value * (State.image.width / State.image.height)),
          height: value
        })
      }
    }
  }

  // Select the available colors.
  const selectAvailableColors = async (): Promise<void> => {
    State.updateControl({ gettingAvailableColors: true })
    
    try {
      State.updateImage({
        colors: await Palette.getAvailableColors()
      })
    } catch (error) {
      State.updateControl({ gettingAvailableColors: false })

      throw error
    }

    State.updateControl({ gettingAvailableColors: false })
  }

  // Toggle free colors.
  const toggleFreeColors = (toggle: boolean) => {
    if (State.image !== null) {
      if (toggle) {
        let colors = structuredClone(State.image.colors)

        Object.keys(Palette.colors).forEach((name) => {
          if (!colors.includes(name) && !Palette.colors[name].paid) {
            colors.push(name)
          }
        })

        State.updateImage({ colors })
      } else {
        State.updateImage({ colors: State.image.colors.filter((name) => Palette.colors[name].paid) })
      }
    }
  }

  // Toggle paid colors.
  const togglePaidColors = (toggle: boolean) => {
    if (State.image !== null) {
      if (toggle) {
        let colors = structuredClone(State.image.colors)

        Object.keys(Palette.colors).forEach((name) => {
          if (!colors.includes(name) && Palette.colors[name].paid) {
            colors.push(name)
          }
        })

        State.updateImage({ colors })
      } else {
        State.updateImage({ colors: State.image.colors.filter((name) => !Palette.colors[name].paid) })
      }
    }
  }

  // Toggle a color.
  const toggleColor = (name: string, toggle: boolean) => {
    if (State.image !== null) {
      if (State.image.colors.includes(name)) {
        if (!toggle) {
          const index = State.image.colors.indexOf(name)

          State.updateImage({ colors: [...State.image.colors.slice(0, index), ...State.image.colors.slice(index + 1)] })
        }
      } else if (toggle) {
        State.updateImage({ colors: [...State.image.colors, name] })
      }
    }
  }

  useEffect(() => {
    if (canvasReference.current !== null) {
      const canvas = canvasReference.current
      const ctx = canvas.getContext('2d')!

      // Handle when an image is loaded.
      const handleImageLoad = (): void => {
        Image.renderPreview(canvas, ctx)
      }
      
      handleImageLoad()
      Image.eventTarget.addEventListener('load', handleImageLoad)

      return () => {
        Image.eventTarget.removeEventListener('load', handleImageLoad)
      }
    }
  })

  return (
    <StyleTransition
      in={State.layout.imageConfig}
      styles={{
        enter: { opacity: 0 },
        enterActive: { opacity: 1 },
        exit: { opacity: 1 },
        exitActive: { opacity: 0 }
      }}
    >
      <div ref={backgroundReference} onClick={handleBackgroundClick} style={{ position: 'fixed', display: 'flex', justifyContent: 'center', alignItems: 'center', left: '0rem', top: '0rem', width: '100dvw', height: '100dvh', backdropFilter: 'brightness(0.5) blur(0.5rem)', transition: 'opacity 0.3s', cursor: (State.control.gettingAvailableColors) ? 'wait' : 'pointer', zIndex: 999 }}>
        <div class='wpa-container-light wpa-container-big' style={{ display: 'flex', flexDirection: 'column', width: '40rem', maxHeight: 'calc(100dvh - calc(var(--wpa-spacing-medium) * 2))', cursor: 'default', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--wpa-spacing-small)', borderBottom: '0.1rem solid var(--wpa-color-container-dark)', padding: 'var(--wpa-spacing-medium)' }}>
            <h3 class='wpa-title-3' style={{ flex: 1, userSelect: 'none' }}>{Language.translate('common', 'Image Config')}</h3>

            <button class='wpa-button' title={Language.translate('imageConfig', 'Reset Image Config')} disabled={State.control.gettingAvailableColors} onClick={resetImageConfig} style={{ width: '2rem', height: '2rem', padding: '0rem' }}>
              <lucid.RefreshCcw size='16'/>
            </button>

            <button class='wpa-button' title={Language.translate('imageConfig', 'Close Image Config')} disabled={State.control.gettingAvailableColors} onClick={() => State.updateLayout({ imageConfig: false })} style={{ width: '2rem', height: '2rem', padding: '0rem' }}>
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
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--wpa-spacing-medium)' }}>
                  <h5 class='wpa-title-5' style={{ marginRight: 'var(--wpa-spacing-small)' }}>{Language.translate('imageConfig', 'Width')}:</h5>
                  <div class='wpa-input-text' style={{ flex: 1, display: 'flex', minWidth: '0', marginRight: 'var(--wpa-spacing-small)' }}>
                    <input value={State.image.width} onBlur={(event) => updateImageWidth(parseInt((event.target as HTMLInputElement).value))} style={{ flex: 1, outline: 'none', minWidth: '0' }}/>
                    <p class='wpa-description'>px</p>
                  </div>

                  <h5 class='wpa-title-5' style={{ marginRight: 'var(--wpa-spacing-small)' }}>{Language.translate('imageConfig', 'Height')}:</h5>
                  <div class='wpa-input-text' style={{ flex: 1, display: 'flex', minWidth: '0', marginRight: 'var(--wpa-spacing-small)' }}>
                    <input value={State.image.height} onBlur={(event) => updateImageHeight(parseInt((event.target as HTMLInputElement).value))} style={{ flex: 1, outline: 'none', minWidth: '0' }}/>
                    <p class='wpa-description'>px</p>
                  </div>

                  <button class={(State.image.lockAspectRatio) ? 'wpa-button wpa-button-primary' : 'wpa-button'} title={Language.translate('imageConfig', 'Lock Aspect Ratio')} onClick={() => State.updateImage({ lockAspectRatio: !State.image!.lockAspectRatio })} style={{ width: '2.25rem', height: '2.25rem', padding: '0rem' }}>
                    {
                      (State.image.lockAspectRatio) ? (
                        <lucid.Lock size='16' style={{ cursor: 'pointer' }}/>
                      ) : (
                        <lucid.LockOpen size='16' style={{ cursor: 'pointer' }}/>
                      )
                    } 
                  </button>
                </div>

                <canvas ref={canvasReference} style={{ backgroundColor: 'var(--wpa-color-container-dark)', borderRadius: '0.75rem', width: '100%', height: '25rem', marginBottom: 'var(--wpa-spacing-medium)' }}></canvas>

                <div style={{ display: 'flex', gap: 'var(--wpa-spacing-medium)', alignItems: 'center', marginBottom: 'var(--wpa-spacing-medium)' }}>
                  <div style={{ flex: 1, backgroundColor: 'var(--wpa-color-container-dark)', height: '0.1rem' }}></div>
                  <h1 class='wpa-title-1'>{Language.translate('imageConfig', 'Palette')}</h1>
                  <div style={{ flex: 1, backgroundColor: 'var(--wpa-color-container-dark)', height: '0.1rem' }}></div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--wpa-spacing-small)', marginBottom: 'var(--wpa-spacing-medium)' }}>
                  <button class='wpa-button' title={Language.translate('imageConfig', 'Select All Available Colors')} disabled={State.control.gettingAvailableColors} onClick={selectAvailableColors} style={{ flex: 1, display: 'flex', width: '100%' }}>
                    <lucid.Palette size='20' style={{ marginRight: 'var(--wpa-spacing-tiny)' }}/>
                    {Language.translate('imageConfig', 'Select Available')}
                  </button>

                  <button class='wpa-button' title={Language.translate('imageConfig', 'Select All Colors')} disabled={State.control.gettingAvailableColors} onClick={() => State.updateImage({ colors: Object.keys(Palette.colors) })} style={{ flex: 1, display: 'flex', width: '100%' }}>
                    <lucid.FolderPlus size='20' style={{ marginRight: 'var(--wpa-spacing-tiny)' }}/>
                    {Language.translate('imageConfig', 'Select All')}
                  </button>

                  <button class='wpa-button' title={Language.translate('imageConfig', 'Unselect All Colors')} disabled={State.control.gettingAvailableColors} onClick={() => State.updateImage({ colors: [] })} style={{ flex: 1, display: 'flex', width: '100%' }}>
                    <lucid.FolderMinus size='20' style={{ marginRight: 'var(--wpa-spacing-tiny)' }}/>
                    {Language.translate('imageConfig', 'Unselect All')}
                  </button>

                  <button class={(State.image.dithering) ? 'wpa-button wpa-button-primary' : 'wpa-button'} title={Language.translate('imageConfig', 'Image Dithering (Smoother Color)')} onClick={() => State.updateImage({ dithering: !State.image!.dithering })} style={{ width: '2.25rem', height: '2.25rem', padding: '0rem' }}>
                    <lucid.Paintbrush size='16' style={{ cursor: 'pointer' }}/>
                  </button>
                </div>

                <div style={{ display: 'flex', gap: 'var(--wpa-spacing-small)', height: '25rem' }}>
                  <div class='wpa-container-dark wpa-container-small' style={{ flex: 1, minHeight: '0rem', padding: 'var(--wpa-spacing-small)', overflow: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <input type='checkbox' class='wpa-input-checkbox' checked={Palette.containFreeColors(State.image.colors)} disabled={State.control.gettingAvailableColors} onChange={(event) => toggleFreeColors((event.target as HTMLInputElement).checked)} style={{ marginRight: 'var(--wpa-spacing-small)' }}/>
                      <h5 class='wpa-title-5'>{Language.translate('common', 'Free Colors')}</h5>
                    </div>

                    {
                      Object.keys(Palette.colors).filter((name) => !Palette.colors[name].paid).map((name) => {
                        const color = Palette.colors[name]

                        return (
                          <div style={{ display: 'flex', alignItems: 'center', marginTop: 'var(--wpa-spacing-tiny)' }}>
                            <input type='checkbox' class='wpa-input-checkbox' checked={State.image!.colors.includes(name)} disabled={State.control.gettingAvailableColors} onChange={(event) => toggleColor(name, (event.target as HTMLInputElement).checked)} style={{ marginRight: 'var(--wpa-spacing-small)' }}/>
                            <div style={{ flexShrink: 0, backgroundColor: `rgb(${color.rgba.join(',')})`, borderRadius: '0.5rem', width: '1rem', height: '1rem', marginRight: 'var(--wpa-spacing-small)' }}></div>
                            <p class='wpa-description'>{name}</p>
                          </div>
                        )
                      })
                    }
                  </div>

                  <div class='wpa-container-dark wpa-container-small' style={{ flex: 1, minHeight: '0rem', padding: 'var(--wpa-spacing-small)', overflow: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <input type='checkbox' class='wpa-input-checkbox' checked={Palette.containPaidColors(State.image.colors)} disabled={State.control.gettingAvailableColors} onChange={(event) => togglePaidColors((event.target as HTMLInputElement).checked)} style={{ marginRight: 'var(--wpa-spacing-small)' }}/>
                      <h5 class='wpa-title-5'>{Language.translate('common', 'Paid Colors')}</h5>
                    </div>

                    {
                      Object.keys(Palette.colors).filter((name) => Palette.colors[name].paid).map((name) => {
                        const color = Palette.colors[name]

                        return (
                          <div style={{ display: 'flex', alignItems: 'center', marginTop: 'var(--wpa-spacing-tiny)' }}>
                            <input type='checkbox' class='wpa-input-checkbox' checked={State.image!.colors.includes(name)} disabled={State.control.gettingAvailableColors} onChange={(event) => toggleColor(name, (event.target as HTMLInputElement).checked)} style={{ marginRight: 'var(--wpa-spacing-small)' }}/>
                            <div style={{ flexShrink: 0, backgroundColor: `rgb(${color.rgba.join(',')})`, borderRadius: '0.5rem', width: '1rem', height: '1rem', marginRight: 'var(--wpa-spacing-small)' }}></div>
                            <p class='wpa-description'>{name}</p>
                          </div>
                        )
                      })
                    }
                  </div>
                </div>
              </div>
            )
          }
        </div>
      </div>
    </StyleTransition>
  )
}
