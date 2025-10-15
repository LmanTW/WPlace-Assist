import { encode, decode } from '@msgpack/msgpack'
import { signal } from '@preact/signals'

import Palette from './palette'

// TODO: Remove this when TypeScript start including this.
declare global {
  interface Uint8ArrayConstructor {
    fromHex: (hex: string) => Uint8Array,
    fromBase64: (base64: string) => Uint8Array
  }

  interface Uint8Array {
    toHex: () => string,
    toBase64: () => string
  }
}

// Recover states from the local storage.
function recoverStates <T> (name: string, value: T): T {
  if (localStorage.hasOwnProperty(name)) {
    return decode(Uint8Array.fromBase64(localStorage.getItem(name)!)) as T
  }

  return value  
}

const image = signal<null | {
  data: Uint8Array,

  position: null | {
    tileX: number,
    tileY: number,
    localX: number,
    localY: number
  },

  width: number,
  height: number,
  lockAspectRatio: boolean

  colors: string[],
  dithering: boolean
}>(recoverStates('wplace-assist-image', null))

const settings = signal<{
  language: string,
  theme: string,

  overlayShow: boolean,
  overlayColors: string[],

  overlayMode: 'image' | 'progress',
  overlayOpacity: number,
  backgroundMode: 'map' | 'black' | 'white',
  backgroundOpacity: number
}>(recoverStates('wplace-assist-settings', {
  language: 'en-US',
  theme: 'default',

  overlayShow: true,
  overlayColors: Object.keys(Palette.colors),

  overlayMode: 'image',
  overlayOpacity: 0.5,
  backgroundMode: 'map',
  backgroundOpacity: 1
}))

const layout = signal<{
  controlMenu: boolean,
  imageConfig: boolean
  userSettings: boolean
}>({
  controlMenu: false,
  imageConfig: false,
  userSettings: false
})

const control = signal<{
  selectPosition: boolean,
  gettingAvailableColors: boolean 
}>({
  selectPosition: false,
  gettingAvailableColors: false
})

// All the global states.
export default class {
  public static get image() {return image.value}
  public static get settings() {return settings.value}
  public static get layout() {return layout.value}
  public static get control() {return control.value}

  public static get imageSignal() {return image}
  public static get settingsSignal() {return settings}
  public static get layoutSignal() {return layout}
  public static get controlSignal() {return control}

  // Update the image.
  public static updateImage(modifications: null | Partial<typeof image.value>): void {
    image.value = (modifications === null) ? null : { ...image.value, ...modifications } as typeof image.value

    localStorage.setItem('wplace-assist-image', encode(image.value).toBase64())
  }

  // Update the settings.
  public static updateSettings(modifications: Partial<typeof settings.value>): void {
    settings.value = { ...settings.value, ...modifications }

    localStorage.setItem('wplace-assist-settings', encode(settings.value).toBase64())
  }

  // Update the layout.
  public static updateLayout(modifications: Partial<typeof layout.value>): void {
    layout.value = { ...layout.value, ...modifications }
  }

  // Update the control.
  public static updateControl(modifications: Partial<typeof control.value>): void {
    control.value = { ...control.value, ...modifications }
  }
}
