// Utilities for handling color.
namespace Palette {
  export const colors: {
    [key: string]: {
      index: number,
      rgb: Uint8Array,
      paid: boolean
    }
  } = {
    'Black': { index: 1, rgb: new Uint8Array([0, 0, 0]), paid: false },
    'Dark Gray': { index: 2, rgb: new Uint8Array([60, 60, 60]), paid: false },
    'Gray': { index: 3, rgb: new Uint8Array([120, 120, 120]), paid: false },
    'Medium Gray': { index: 32, rgb: new Uint8Array([170, 170, 170]), paid: true },
    'Light Gray': { index: 4, rgb: new Uint8Array([210, 210, 210]), paid: false },
    'White': { index: 5, rgb: new Uint8Array([255, 255, 255]), paid: false },
    'Deep Red': { index: 6, rgb: new Uint8Array([96, 0, 24]), paid: false },
    'Dark Red': { index: 33, rgb: new Uint8Array([165, 14, 30]), paid: true },
    'Red': { index: 7, rgb: new Uint8Array([237, 28, 36]), paid: false },
    'Light Red': { index: 34, rgb: new Uint8Array([250, 128, 114]), paid: true },
    'Dark Orange': { index: 35, rgb: new Uint8Array([228, 92, 26]), paid: true },
    'Orange': { index: 8, rgb: new Uint8Array([255, 127, 39]), paid: false },
    'Gold': { index: 9, rgb: new Uint8Array([246, 170, 9]), paid: false },
    'Yellow': { index: 10, rgb: new Uint8Array([249, 221, 59]), paid: false },
    'Light Yellow': { index: 11, rgb: new Uint8Array([255, 250, 188]), paid: false },
    'Dark Goldenrod': { index: 37, rgb: new Uint8Array([156, 132, 49]), paid: true },
    'Goldenrod': { index: 38, rgb: new Uint8Array([197, 173, 49]), paid: true },
    'Light Goldenrod': { index: 39, rgb: new Uint8Array([232, 212, 95]), paid: true },
    'Dark Olive': { index: 40, rgb: new Uint8Array([74, 107, 58]), paid: true },
    'Olive': { index: 41, rgb: new Uint8Array([90, 148, 74]), paid: true },
    'Light Olive': { index: 42, rgb: new Uint8Array([132, 197, 115]), paid: true },
    'Dark Green': { index: 12, rgb: new Uint8Array([14, 185, 104]), paid: false },
    'Green': { index: 13, rgb: new Uint8Array([19, 230, 123]), paid: false },
    'Light Green': { index: 14, rgb: new Uint8Array([135, 255, 94]), paid: false },
    'Dark Teal': { index: 15, rgb: new Uint8Array([135, 255, 94]), paid: false },
    'Teal': { index: 16, rgb: new Uint8Array([16, 174, 166]), paid: false },
    'Light Teal': { index: 17, rgb: new Uint8Array([19, 225, 190]), paid: false },
    'Dark Cyan': { index: 43, rgb: new Uint8Array([15, 121, 159]), paid: true },
    'Cyan': { index: 20, rgb: new Uint8Array([96, 247, 242]), paid: false },
    'Light Cyan': { index: 44, rgb: new Uint8Array([187, 250, 242]), paid: true },
    'Dark Blue': { index: 18, rgb: new Uint8Array([40, 80, 158]), paid: false },
    'Blue': { index: 19, rgb: new Uint8Array([64, 147, 228]), paid: false },
    'Light Blue': { index: 45, rgb: new Uint8Array([125, 199, 255]), paid: true },
    'Dark Indigo': { index: 46, rgb: new Uint8Array([77, 49, 184]), paid: true },
    'Indigo': { index: 21, rgb: new Uint8Array([107, 80, 246]), paid: false },
    'Light Indigo': { index: 22, rgb: new Uint8Array([153, 177, 251]), paid: false },
    'Dark Slate Blue': { index: 47, rgb: new Uint8Array([74, 66, 132]), paid: true },
    'Slate Blue': { index: 48, rgb: new Uint8Array([122, 113, 196]), paid: true },
    'Light Slate Blue': { index: 49, rgb: new Uint8Array([181, 174, 241]), paid: true },
    'Dark Purple': { index: 23, rgb: new Uint8Array([120, 12, 153]), paid: false },
    'Purple': { index: 24, rgb: new Uint8Array([170, 56, 185]), paid: false },
    'Light Purple': { index: 25, rgb: new Uint8Array([224, 159, 249]), paid: false },
    'Dark Pink': { index: 26, rgb: new Uint8Array([203, 0, 122]), paid: false },
    'Pink': { index: 27, rgb: new Uint8Array([236, 31, 128]), paid: false },
    'Light Pink': { index: 28, rgb: new Uint8Array([243, 141, 169]), paid: false },
    'Dark Peach': { index: 53, rgb: new Uint8Array([155, 82, 73]), paid: true },
    'Peach': { index: 54, rgb: new Uint8Array([209, 128, 120]), paid: true },
    'Light Peach': { index: 55, rgb: new Uint8Array([250, 182, 164]), paid: true },
    'Dark Brown': { index: 29, rgb: new Uint8Array([104, 70, 52]), paid: false },
    'Brown': { index: 30, rgb: new Uint8Array([149, 104, 42]), paid: false },
    'Light Brown': { index: 50, rgb: new Uint8Array([219, 164, 99]), paid: true },
    'Dark Tan': { index: 56, rgb: new Uint8Array([123, 99, 82]), paid: true },
    'Tan': { index: 57, rgb: new Uint8Array([156, 132, 107]), paid: true },
    'Light Tan': { index: 36, rgb: new Uint8Array([214, 181, 148]), paid: true },
    'Dark Beige': { index: 51, rgb: new Uint8Array([209, 128, 81]), paid: true },
    'Beige': { index: 31, rgb: new Uint8Array([248, 178, 119]), paid: false },
    'Light Beige': { index: 52, rgb: new Uint8Array([255, 197, 165]), paid: true },
    'Dark Stone': { index: 61, rgb: new Uint8Array([109, 100, 63]), paid: true },
    'Stone': { index: 62, rgb: new Uint8Array([148, 140, 107]), paid: true },
    'Light Stone': { index: 63, rgb: new Uint8Array([205, 197, 158]), paid: true },
    'Dark Slate': { index: 58, rgb: new Uint8Array([51, 57, 65]), paid: true },
    'Slate': { index: 59, rgb: new Uint8Array([109, 117, 141]), paid: true },
    'Light Slate': { index: 60, rgb: new Uint8Array([179, 185, 209]), paid: true }
  }

  // Hash a color.
  export function hashColor(r: number, g: number, b: number): number {
    return (r << 16) | (g << 8) | b
  }

  export const colorNameMap = new Map<number, string>(Object.keys(Palette.colors).map((name) => {
    const color = Palette.colors[name]
 
    return [Palette.hashColor(color.rgb[0], color.rgb[1], color.rgb[2]), name]
  }))

  // Check if a list contains free colors.
  export function containFreeColors(colors: string[]): boolean {
    for (const name of colors) {
      if (!Palette.colors[name].paid) {
        return true
      }
    }

    return false
  }

  // Check if a list contains paid colors.
  export function containPaidColors(colors: string[]): boolean {
    for (const name of colors) {
      if (Palette.colors[name].paid) {
        return true
      }
    }

    return false
  }

  // Get the available colors.
  export async function getAvailableColors(): Promise<string[]> {
    let container_paint = document.querySelector<HTMLDivElement>('.rounded-t-box.bg-base-100.border-base-300.w-full.border-t.py-3 > .relative.px-3')

    if (container_paint === null) {
      let button_paint = document.querySelector<HTMLButtonElement>('.btn.btn-primary.btn-lg.relative.z-30')

      if (button_paint === null) {
        const container_pixel = document.querySelector<HTMLDivElement>('.rounded-t-box.bg-base-100.border-base-300.w-full.border-t.pt-2')

        if (container_pixel !== null) {
          const button_close = Array.from(container_pixel.querySelectorAll<HTMLButtonElement>('.btn.btn-circle.btn-sm')).at(-1)

          if (button_close === undefined) {
            window.alert('WPlace-Assist cannot get the available colors, please update the script or contact the maintainers.')

            throw new Error('Cannot locate the close button (WPlace-Assist)')
          }

          button_close.click()

          await waitUntilOrTimeout(() => document.querySelector<HTMLButtonElement>('.btn.btn-primary.btn-lg.relative.z-30') !== null, 1000)

         button_paint = document.querySelector<HTMLButtonElement>('.btn.btn-primary.btn-lg.relative.z-30')
        }
      }

      if (button_paint === null) {
        window.alert('WPlace-Assist cannot get the available colors, please make sure the paint button is visible.')

        throw new Error('Cannot locate the paint button (WPlace-Assist)')
      }

      button_paint.click()

      if (await waitUntilOrTimeout(() => document.querySelector('.rounded-t-box.bg-base-100.border-base-300.w-full.border-t.py-3 > .relative.px-3') !== null, 1000)) {
        container_paint = document.querySelector<HTMLDivElement>('.rounded-t-box.bg-base-100.border-base-300.w-full.border-t.py-3 > .relative.px-3')!
      } else {
        window.alert('WPlace-Assist cannot get the available colors, please update the script or contact the maintainers.')

        throw new Error('Cannot locate the paint container (WPlace-Assist)')
      }
    }

    const container_palette = container_paint.querySelector('.mb-4.mt-3')

    if (container_palette === null || container_palette.firstChild == null) {
      window.alert('WPlace-Assist cannot get the available colors, please update the script or contact the maintainers.')

      throw new Error('Cannot locate the palette container (WPlace-Assist)')
    }

    if (container_palette.firstChild.childNodes.length < 65) {
      const button_expend = container_paint.querySelector<HTMLButtonElement>('.btn.btn-lg.btn-square.absolute.bottom-0.left-0.shadow-md')

      if (button_expend === null) {
        window.alert('WPlace-Assist cannot get the available colors, please update the script or contact the maintainers.')

        throw new Error('Cannot locate the expend button (WPlace-Assist)')
      }

      button_expend.click()

      if (!await waitUntilOrTimeout(() => container_paint!.firstChild!.childNodes.length < 65, 1000)) {
        window.alert('WPlace-Assist cannot get the available colors, please update the script or contact the maintainers.')

        throw new Error('Cannot expend the palette container (WPlace-Assist)')
      }
    }

    const colors: string[] = []

    container_palette.firstChild!.childNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLDivElement
        const name = element.getAttribute('data-tip')!

        if (Palette.colors.hasOwnProperty(name)) {
          if (element.querySelector('.bg-base-100.absolute.bottom-0.right-0.flex.size-5.items-center.justify-center.rounded-full') === null) {
            colors.push(name)
          }
        } else {
          console.warn(`Unknown color: ${name} (WPlace-Assist)`)
        }
      }
    })

    const button_close = Array.from(container_paint.querySelectorAll<HTMLButtonElement>(' .btn.btn-circle.btn-sm')).at(-1)!

    if (button_close !== null) {
      button_close.click()
    }

    return colors
  }
}

// Wait until a condition is true or a timeout.
function waitUntilOrTimeout(callback: () => boolean, timeout: number): Promise<boolean> {
  return new Promise((resolve) => {
    const start = performance.now()

    const interval = setInterval(() => {
      const result = callback()

      if (result || performance.now() - start > timeout) {
        clearInterval(interval)

        resolve(result)
      }
    }, 100)
  })
}

export default Palette
