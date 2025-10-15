import { useRef, useState, useEffect } from 'preact/hooks'
import { StyleTransition } from 'preact-transitioning'
import { encode, decode } from '@msgpack/msgpack'
import * as lucid from 'lucide-react'

import Language from '../scripts/language'
import Palette from '../scripts/palette'
import State from '../scripts/state'

// The control menu component.
export default () => {
  const menuReference = useRef<HTMLDivElement>(null)
  const navbarReference = useRef<HTMLDivElement>(null)

  const [startState, setStartState] = useState<null | {
    x: number,
    y: number
  }>(null)

  // Upload an image.
  const uploadImage = (): void => {
    const input = document.createElement('input')
    const image = document.createElement('img')

    input.addEventListener('change', () => {
      if (input.files !== null && input.files.length > 0) {
        image.src = URL.createObjectURL(input.files[0])
      }
    })

    image.addEventListener('load', async () => {
      const reader = new FileReader();

      // TODO: Switch to Blob.bytes() when it's widly supported.

      reader.addEventListener('load', () => {
        if (reader.result === null) {
          window.alert('WPlace-Assist faild to read the image, please try another image.')

          throw new Error('Faild to read the file (WPlace-Assist)')
        }

        const data = new Uint8Array(reader.result as ArrayBuffer)

        if (data.length > 1024 * 1024) {
          window.alert(`Image size exceed size limition (${(data.length / (1024 * 1024)).toFixed(2)}MB / 1MB), you can try compressing the image or switch an image format.`)
        } else {
          State.updateImage({
            data,

            position: null,

            width: image.width,
            height: image.height,
            lockAspectRatio: true,

            colors: Object.keys(Palette.colors),
            dithering: true
          })

          State.updateLayout({ imageConfig: true })
        }
      })

      reader.readAsArrayBuffer(input.files![0])
    })

    input.type = 'file'
    input.accept = 'image/png,image/jpeg,image/webp'
    input.click()
  }

  // Save a config.
  const saveConfig = async (): Promise<void> => { 
    const data = encode(State.image)
    const buffer = data.buffer.slice(data.byteOffset, data.byteLength + data.byteOffset) as ArrayBuffer
    const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', buffer)).toHex()
 
    const blob = new Blob([buffer], { type: 'application/octet-stream' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    
    a.href = url
    a.download = `WPlace-Assist-${hash.substring(0, 8)}.save`
    a.click()

    URL.revokeObjectURL(url)
  }

  // Load a config.
  const loadConfig = (): void => {
    const input = document.createElement('input')

    input.addEventListener('change', async () => {
      if (input.files !== null && input.files.length > 0) {
        const file = input.files[0]

        if (file.size > 2 * (1024 * 1024)) {
          window.alert(`Save size exceed size limition (${(file.size / (1024 * 1024)).toFixed(2)}MB / 2MB).`)
        } else {
          State.updateImage(decode(await file.bytes()) as typeof State.image)
        }
      }
    })

    input.type = 'file'
    input.accept = '.save'
    input.click()
  }

  useEffect(() => {
    // Handle mouse move events.
    const handleMouseMove = (event: MouseEvent): void => {
      if (menuReference.current !== null && startState !== null) {
        menuReference.current.style.left = event.clientX - startState.x + 'px'
        menuReference.current.style.top = event.clientY - startState.y + 'px'
      }
    }

    // Handle mouse down events.
    const handleMouseDown = (event: MouseEvent): void => {
      if (event.target === navbarReference.current) {
        const bound = (event.target as HTMLElement).getBoundingClientRect()

        setStartState({
          x: event.clientX - bound.left,
          y: event.clientY - bound.top
        })
      }
    }

    // Handle mouse up events.
    const handleMouseUp = (): void => {
      setStartState(null)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  })

  return (
    <StyleTransition
      in={State.layout.controlMenu}
      styles={{
        enter: { opacity: 0, transform: 'scale(0.95)' },
        enterActive: { opacity: 1, transform: 'scale(1)' },
        exit: { opacity: 1, transform: 'scale(1)' },
        exitActive: { opacity: 0, transform: 'scale(0.95)' }
      }}
    >
      <div ref={menuReference} class='wpa-container-light wpa-container-big wpa-container-shadow' style={{ position: 'fixed', display: 'block', left: '2rem', top: '2rem', width: '20rem', transition: 'opacity 0.3s, transform 0.3s', overflow: 'hidden', zIndex: 998 }}>
        <div ref={navbarReference} style={{ display: 'flex', alignItems: 'center', gap: 'var(--wpa-spacing-small)', borderBottom: '0.1rem solid var(--wpa-color-container-dark)', padding: 'var(--wpa-spacing-medium)', cursor: (startState === null) ? 'grab' : 'grabbing' }}>
          <h3 class='wpa-title-3' style={{ flex: 1, userSelect: 'none', pointerEvents: 'none' }}>WPlace Assist</h3>
        
          <button class='wpa-button' title={Language.translate('controlMenu', 'User Settings')} onClick={() => State.updateLayout({ userSettings: !State.layout.userSettings })} style={{ width: '2rem', height: '2rem', padding: '0rem' }}>
            <lucid.Settings size='16'/>
          </button>

          <button class='wpa-button' title={Language.translate('controlMenu', 'Close Panel')} onClick={() => State.updateLayout({ controlMenu: false })} style={{ width: '2rem', height: '2rem', padding: '0rem' }}>
            <lucid.X size='16'/>
          </button>
        </div>

        <div style={{ padding: 'var(--wpa-spacing-medium)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--wpa-spacing-small)', marginBottom: 'var(--wpa-spacing-small)' }}>
            <button class={(State.image === null) ? 'wpa-button wpa-button-primary' : 'wpa-button wpa-button-normal'} title={Language.translate('controlMenu', 'Upload Image')} onClick={uploadImage} style={{ flex: 1 }}>
              <lucid.ImageUp size='20' onClick={uploadImage} style={{ marginRight: 'var(--wpa-spacing-small)' }}/>
              {Language.translate('controlMenu', 'Upload')}
            </button>

            <button class='wpa-button' title={Language.translate('controlMenu', 'Edit Image Config')} disabled={State.image === null} onClick={() => State.updateLayout({ imageConfig: true })} style={{ flex: 1 }}>
              <lucid.FileSliders size='20' style={{ marginRight: 'var(--wpa-spacing-small)' }}/>
              {Language.translate('controlMenu', 'Edit')}
            </button>
          </div>

          <button class={(State.image !== null && State.image.position === null) ? 'wpa-button wpa-button-primary' : 'wpa-button'} title={Language.translate('controlMenu', 'Select Image Position')} disabled={State.image === null || State.control.selectPosition} onClick={() => State.updateControl({ selectPosition: true })} style={{ flex: 1, width: '100%', marginBottom: 'var(--wpa-spacing-small)' }}>
            <lucid.LocateFixed size='20' style={{ marginRight: 'var(--wpa-spacing-small)' }}/>
            {Language.translate('controlMenu', 'Select Position')}
          </button>

          <div class='wpa-container-dark wpa-container-small' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '15rem', minHeight: '0rem', padding: 'var(--wpa-spacing-small)', marginBottom: 'var(--wpa-spacing-medium)' }}>
            <p class='wpa-description'>WIP</p>
          </div>

          <button class='wpa-button' title={Language.translate('controlMenu', 'Toggle Overlay')} disabled={State.image === null} onClick={() => State.updateSettings({ overlayShow: !State.settings.overlayShow })} style={{ flex: 1, width: '100%', height: '2.25rem', marginBottom: 'var(--wpa-spacing-small)' }}>
            {
              (State.settings.overlayShow) ? (
                <lucid.Eye size='20' style={{ marginRight: 'var(--wpa-spacing-small)' }}/>
              ) : (
                <lucid.EyeOff size='20' style={{ marginRight: 'var(--wpa-spacing-small)' }}/>
              )
            }

            {(State.settings.overlayShow) ? Language.translate('controlMenu', 'Show Overlay') : Language.translate('controlMenu', 'Hide Overlay')}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--wpa-spacing-small)' }}>
            <button class='wpa-button' title={Language.translate('controlMenu', 'Save Image Config')} disabled={State.image === null} onClick={saveConfig} style={{ flex: 1, height: '2.25rem' }}>
              <lucid.Save size='20' style={{ marginRight: 'var(--wpa-spacing-small)' }}/>
              {Language.translate('controlMenu', 'Save')}
            </button>

            <button class={(State.image === null) ? 'wpa-button wpa-button-primary' : 'wpa-button'} title={Language.translate('controlMenu', 'Load Image Config')} onClick={loadConfig} style={{ flex: 1, height: '2.25rem' }}>
              <lucid.Upload size='20' style={{ marginRight: 'var(--wpa-spacing-small)' }}/>
              {Language.translate('controlMenu', 'Load')}
            </button>
          </div>
        </div>
      </div>
    </StyleTransition> 
  )
}
