import { StyleTransition } from 'preact-transitioning'
import { useRef } from 'preact/hooks'
import * as lucid from 'lucide-react'

import Language from '../scripts/language'
import Palette from '../scripts/palette'
import Overlay from '../scripts/overlay'
import State from '../scripts/state'
import Theme from '../scripts/theme'
import Image from '../scripts/image'

// The user settings component.
export default () => {
  const backgroundReference = useRef<HTMLDivElement>(null)

  // Handle background mouse click events.
  const handleBackgroundClick = (event: MouseEvent): void => {
    if (event.target === backgroundReference.current) {
      State.updateLayout({ userSettings: false })
    }
  }

  // Update the overlay settings.
  const updateOverlaySettings = (modifications: Partial<typeof State.settings>): void => {
    State.updateSettings(modifications)
    Overlay.cached = {}
  }

  // Select the available colors.
  const selectAvailableColors = async (): Promise<void> => {
    State.updateControl({ gettingAvailableColors: true })
    
    try {
      State.updateSettings({
        overlayColors: await Palette.getAvailableColors()
      })
    } catch (error) {
      State.updateControl({ gettingAvailableColors: false })

      throw error
    }

    State.updateControl({ gettingAvailableColors: false })
  }

  // Toggle free colors.
  const toggleFreeColors = (toggle: boolean) => {
    if (toggle) {
      let colors = structuredClone(State.settings.overlayColors)

      Object.keys(Palette.colors).forEach((name) => {
        if (!colors.includes(name) && !Palette.colors[name].paid) {
          colors.push(name)
        }
      })

      State.updateSettings({ overlayColors: colors })
    } else {
      State.updateSettings({ overlayColors: State.settings.overlayColors.filter((name) => Palette.colors[name].paid) })
    }
  }

  // Toggle paid colors.
  const togglePaidColors = (toggle: boolean) => {
    if (toggle) {
      let colors = structuredClone(State.settings.overlayColors)

      Object.keys(Palette.colors).forEach((name) => {
        if (!colors.includes(name) && Palette.colors[name].paid) {
          colors.push(name)
        }
      })

      State.updateSettings({ overlayColors: colors })
    } else {
      State.updateSettings({ overlayColors: State.settings.overlayColors.filter((name) => !Palette.colors[name].paid) })
    }
  }

  // Toggle a color.
  const toggleColor = (name: string, toggle: boolean) => {
    if (State.settings.overlayColors.includes(name)) {
      if (!toggle) {
        const index = State.settings.overlayColors.indexOf(name)

        State.updateSettings({ overlayColors: [...State.settings.overlayColors.slice(0, index), ...State.settings.overlayColors.slice(index + 1)] })
      }
    } else if (toggle) {
      State.updateSettings({ overlayColors: [...State.settings.overlayColors, name] })
    }
  }

  return (
    <StyleTransition
      in={State.layout.userSettings}
      styles={{
        enter: { opacity: 0 },
        enterActive: { opacity: 1 },
        exit: { opacity: 1 },
        exitActive: { opacity: 0 }
      }}
    >
      <div ref={backgroundReference} onClick={handleBackgroundClick} style={{ position: 'fixed', display: 'flex', justifyContent: 'center', alignItems: 'center', left: '0rem', top: '0rem', width: '100dvw', height: '100dvh', backdropFilter: 'brightness(0.5) blur(0.5rem)', transition: 'opacity 0.3s', cursor: 'pointer', zIndex: 999 }}>
        <div class='wpa-container-light wpa-shadow' style={{ display: 'flex', flexDirection: 'column', borderRadius: '1.25rem', width: '40rem', maxHeight: 'calc(100dvh - calc(var(--wpa-spacing-medium) * 2))', cursor: 'default', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--wpa-spacing-small)', borderBottom: '0.1rem solid var(--wpa-color-container-dark)', padding: 'var(--wpa-spacing-medium)' }}>
            <h3 class='wpa-title-3' style={{ flex: 1, userSelect: 'none' }}>{Language.translate('userSettings', 'User Settings')}</h3>

            <button class='wpa-button' title={Language.translate('userSettings', 'Reset User Settings')} style={{ width: '2rem', height: '2rem', padding: '0rem' }}>
              <lucid.RefreshCcw size='16'/>
            </button>

            <button class='wpa-button' title={Language.translate('userSettings', 'Close User Settings')} onClick={() => State.updateLayout({ userSettings: false })} style={{ width: '2rem', height: '2rem', padding: '0rem' }}>
              <lucid.X size='16'/>
            </button>
          </div>

          <div style={{ flex: 1, padding: 'var(--wpa-spacing-medium)', minHeight: '0rem', overflow: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--wpa-spacing-small)' }}>
              <h5 class='wpa-title-5' style={{ marginRight: 'var(--wpa-spacing-small)' }}>{Language.translate('userSettings', 'Language')}:</h5>
              <select class='wpa-select' value={State.settings.language} onChange={(event) => State.updateSettings({ language: (event.target as HTMLSelectElement).value })} style={{ outline: 'none', width: '15rem' }}>
                {
                  Object.keys(Language.languages).map((id) => {
                    const language = Language.languages[id]

                    return (
                      <option value={id}>{language.info.flag} {language.info.name} ({language.info.coverage}%)</option>
                    )
                  })
                }
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--wpa-spacing-medium)' }}>
              <h5 class='wpa-title-5' style={{ marginRight: 'var(--wpa-spacing-small)' }}>{Language.translate('userSettings', 'Theme')}:</h5>
              <select class='wpa-select' value={State.settings.theme} onChange={(event) => State.updateSettings({ theme: (event.target as HTMLSelectElement).value })} style={{ outline: 'none', width: '15rem' }}>
                {
                  Object.keys(Theme.themes).map((id) => (
                    <option value={id}>{Theme.formatThemeName(id)}</option>
                  ))
                }
              </select>
            </div>

            <div style={{ display: 'flex', gap: 'var(--wpa-spacing-medium)', alignItems: 'center', marginBottom: 'var(--wpa-spacing-medium)' }}>
              <div style={{ flex: 1, backgroundColor: 'var(--wpa-color-container-dark)', height: '0.1rem' }}></div>
              <h1 class='wpa-title-1'>{Language.translate('userSettings', 'Overlay')}</h1>
              <div style={{ flex: 1, backgroundColor: 'var(--wpa-color-container-dark)', height: '0.1rem' }}></div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--wpa-spacing-small)' }}>
              <h5 class='wpa-title-5' style={{ marginRight: 'var(--wpa-spacing-small)' }}>{Language.translate('userSettings', 'Mode')}:</h5>
              <select class='wpa-select' value={State.settings.overlayMode} onChange={(event) => updateOverlaySettings({ overlayMode: (event.target as HTMLSelectElement).value as typeof State.settings.overlayMode })} style={{ outline: 'none', width: '15rem', marginRight: 'var(--wpa-spacing-small)' }}>
                <option value='image'>{Language.translate('userSettings', 'Image')}</option>
                <option value='progress'>{Language.translate('userSettings', 'Progress')}</option>
              </select>

              <h5 class='wpa-title-5' style={{ marginRight: 'var(--wpa-spacing-small)' }}>{Language.translate('userSettings', 'Opacity')}:</h5>
              <input type='range' step="0.1" min="0.1" max="1" value={State.settings.overlayOpacity} onChange={(event) => updateOverlaySettings({ overlayOpacity: parseFloat((event.target as HTMLInputElement).value) })} style={{ marginRight: 'var(--wpa-spacing-small)' }}/>
              <h5 class='wpa-title-5'>({State.settings.overlayOpacity})</h5>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--wpa-spacing-small)' }}>
              <h5 class='wpa-title-5' style={{ marginRight: 'var(--wpa-spacing-small)' }}>{Language.translate('userSettings', 'Background')}:</h5>
              <select class='wpa-select' value={State.settings.backgroundMode} onChange={(event) => updateOverlaySettings({ backgroundMode: (event.target as HTMLSelectElement).value as typeof State.settings.backgroundMode })} style={{ utline: 'none', width: '15rem', marginRight: 'var(--wpa-spacing-small)' }}>
                <option value='map'>{Language.translate('userSettings', 'Map')}</option>
                <option value='black'>{Language.translate('userSettings', 'Black')}</option>
                <option value='white'>{Language.translate('userSettings', 'White')}</option>
              </select>

              <h5 class='wpa-title-5' style={{ marginRight: 'var(--wpa-spacing-small)' }}>{Language.translate('userSettings', 'Opacity')}:</h5>
              <input type='range' step="0.1" min="0.1" max="1" value={State.settings.backgroundOpacity} onChange={(event) => updateOverlaySettings({ backgroundOpacity: parseFloat((event.target as HTMLInputElement).value) })} style={{ marginRight: 'var(--wpa-spacing-small)' }}/>
              <h5 class='wpa-title-5'>({State.settings.backgroundOpacity})</h5>
            </div>

            <div style={{ display: 'flex', gap: 'var(--wpa-spacing-medium)', alignItems: 'center', marginBottom: 'var(--wpa-spacing-medium)' }}>
              <div style={{ flex: 1, backgroundColor: 'var(--wpa-color-container-dark)', height: '0.1rem' }}></div>
              <h1 class='wpa-title-1'>{Language.translate('userSettings', 'Enable Colors')}</h1>
              <div style={{ flex: 1, backgroundColor: 'var(--wpa-color-container-dark)', height: '0.1rem' }}></div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--wpa-spacing-small)', marginBottom: 'var(--wpa-spacing-medium)' }}>
              <button class='wpa-button' title={Language.translate('userSettings', 'Select All Available Colors')} disabled={State.control.gettingAvailableColors} onClick={selectAvailableColors} style={{ flex: 1, display: 'flex', width: '100%', height: '2.25rem' }}>
                <lucid.Palette size='20' style={{ marginRight: 'var(--wpa-spacing-tiny)' }}/>
                {Language.translate('userSettings', 'Select Available')}
              </button>

              <button class='wpa-button' title={Language.translate('userSettings', 'Select All Colors')} disabled={State.control.gettingAvailableColors} onClick={() => State.updateSettings({ overlayColors: Object.keys(Palette.colors) })} style={{ flex: 1, display: 'flex', width: '100%' }}>
                <lucid.FolderPlus size='20' style={{ marginRight: 'var(--wpa-spacing-tiny)' }}/>
                {Language.translate('userSettings', 'Select All')}
              </button>

              <button class='wpa-button' title={Language.translate('userSettings', 'Unselect All Colors')} disabled={State.control.gettingAvailableColors} onClick={() => State.updateSettings({ overlayColors: [] })} style={{ flex: 1, display: 'flex', width: '100%' }}>
                <lucid.FolderMinus size='20' style={{ marginRight: 'var(--wpa-spacing-tiny)' }}/>
                {Language.translate('userSettings', 'Unselect All Colors')}
              </button>
            </div>

            <div style={{ display: 'flex', gap: 'var(--wpa-spacing-small)', height: '25rem' }}>
              <div style={{ flex: 1, backgroundColor: 'var(--wpa-color-container-dark)', borderRadius: '0.75rem', minHeight: '0rem', padding: 'var(--wpa-spacing-small)', overflow: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input type='checkbox' class='wpa-input-checkbox' checked={Palette.containFreeColors(State.settings.overlayColors)} disabled={State.control.gettingAvailableColors} onChange={(event) => toggleFreeColors((event.target as HTMLInputElement).checked)} style={{ marginRight: 'var(--wpa-spacing-small)' }}/>
                  <h5 class='wpa-title-5'>{Language.translate('userSettings', 'Free Colors')}</h5>
                </div>

                {
                  Object.keys(Image.colors).filter((name) => !Palette.colors[name].paid).map((name) => {
                    const color = Palette.colors[name]

                    return (
                      <div style={{ display: 'flex', alignItems: 'center', marginTop: 'var(--wpa-spacing-tiny)' }}>
                        <input type='checkbox' class='wpa-input-checkbox' checked={State.settings.overlayColors.includes(name)} disabled={State.control.gettingAvailableColors} onChange={(event) => toggleColor(name, (event.target as HTMLInputElement).checked)} style={{ marginRight: 'var(--wpa-spacing-small)' }}/>
                        <div style={{ backgroundColor: `rgb(${color.rgb.join(',')})`, borderRadius: '0.5rem', width: '1rem', height: '1rem', marginRight: 'var(--wpa-spacing-small)' }}></div>
                        <p class='wpa-description'>{name} ({Image.colors[name]})</p>
                      </div>
                    )
                  })
                }
              </div>

              <div style={{ flex: 1, backgroundColor: 'var(--wpa-color-container-dark)', borderRadius: '0.75rem', minHeight: '0', padding: 'var(--wpa-spacing-small)', overflow: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input type='checkbox' class='wpa-input-checkbox' checked={Palette.containPaidColors(State.settings.overlayColors)} disabled={State.control.gettingAvailableColors} onChange={(event) => togglePaidColors((event.target as HTMLInputElement).checked)} style={{ marginRight: 'var(--wpa-spacing-small)' }}/>
                  <h5 class='wpa-title-5'>{Language.translate('userSettings', 'Paid Colors')}</h5>
                </div>

                {
                  Object.keys(Image.colors).filter((name) => Palette.colors[name].paid).map((name) => {
                    const color = Palette.colors[name]

                    return (
                      <div style={{ display: 'flex', alignItems: 'center', marginTop: 'var(--wpa-spacing-tiny)' }}>
                        <input type='checkbox' class='wpa-input-checkbox' checked={State.settings.overlayColors.includes(name)} disabled={State.control.gettingAvailableColors} onChange={(event) => toggleColor(name, (event.target as HTMLInputElement).checked)} style={{ marginRight: 'var(--wpa-spacing-small)' }}/>
                        <div style={{ backgroundColor: `rgb(${color.rgb.join(',')})`, borderRadius: '0.5rem', width: '1rem', height: '1rem', marginRight: 'var(--wpa-spacing-small)' }}></div>
                        <p class='wpa-wpa-description'>{name} ({Image.colors[name]})</p>
                      </div>
                    )
                  })
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </StyleTransition>
  )
}
