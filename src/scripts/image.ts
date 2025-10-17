import { signal, batch } from '@preact/signals'

import Worker from './worker?worker&inline'
import Palette from './palette'
import Overlay from './overlay'
import State from './state'

let worker: null | Worker = null

if (window.Worker === undefined) {
  window.alert('WPlace-Assist does not work on this browser, please switch a browser.')

  throw new Error('Worker is not available (WPlace-Assist)')
}

const image = signal<null | HTMLImageElement>(null)
const colors = signal<{ [key: string]: number }>({})

// Everything image related.
export default class Image {
  public static canvas = document.createElement('canvas')
  public static ctx = this.canvas.getContext('2d')!

  public static hash: null | string = null 
  public static eventTarget = new EventTarget()

  public static get image() {return image.value}
  public static get colors() {return colors.value}

  public static get imageSignal() {return image}
  public static get colorsSignal() {return colors}

  // Load an image.
  public static loadImage(image: HTMLImageElement): Promise<void> {
    return new Promise((resolve) => {
      if (State.image === null) {
        this.eventTarget.dispatchEvent(new Event('load'))

        resolve()
      } else {
        this.canvas.width = State.image.width
        this.canvas.height = State.image.height

        this.ctx.drawImage(image, 0, 0, this.canvas.width, this.canvas.height)
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

        if (worker !== null) {
          worker.terminate()
        }

        worker = new Worker()

        worker.postMessage({
          config: {
            colors: State.image.colors,
            dithering: State.image.dithering
          },

          data: imageData.data,
          width: imageData.width,
          height: imageData.height,
        }, [imageData.data.buffer])

        worker.addEventListener('message', (event) => {
          const message = event.data as {
            data: ImageDataArray,
            colors: [number, number][]
          }

          this.ctx.putImageData(new ImageData(message.data, imageData.width, imageData.height), 0, 0)

          worker!.terminate()
          worker = null

          colors.value = Object.fromEntries(
            message.colors
              .sort((a, b) => b[1] - a[1])
              .map((entry) => [Palette.colorNameMap.get(entry[0]), entry[1]])
          )

          Overlay.clearCachedTiles()

          resolve()
        })
      }
    })
  }

  // Render the image preview.
  public static renderPreview(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
    const bound = canvas.getBoundingClientRect()
    const size = 5 * window.devicePixelRatio

    canvas.width = bound.width * window.devicePixelRatio
    canvas.height = bound.height * window.devicePixelRatio

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (let x = 0; x < canvas.width; x += size) {
      for (let y = 0; y < canvas.height; y += size) {
        if ((x + y) % (size * 2) === 0) {
          ctx.fillStyle = 'rgba(0,0,0,0.1)'
          ctx.fillRect(x, y, size, size)
        }
      }
    }

    if (this.image !== null) {
      const canvasAspect = canvas.width / canvas.height
      const imageAspect = this.canvas.width / this.canvas.height

      let newWidth, newHeight

      if (imageAspect > canvasAspect) {
        newWidth = canvas.width
        newHeight = canvas.width / imageAspect
      } else {
        newWidth = canvas.height * imageAspect
        newHeight = canvas.height
      }

      newWidth *= 0.9
      newHeight *= 0.9

      ctx.imageSmoothingEnabled = false
      ctx.drawImage(this.canvas, (canvas.width - newWidth) / 2, (canvas.height - newHeight) / 2, newWidth, newHeight)
    }
  }
}

State.imageSignal.subscribe(async (value) => {
  if (value === null) {
    batch(() => image.value = null)

    Image.hash = null
    Image.eventTarget.dispatchEvent(new Event('load'))
  } else {
    let contentType!: string

    if (value.data[0] === 0x89 && value.data[1] === 0x50 && value.data[2] === 0x4E && value.data[3] === 0x47 && value.data[4] === 0x0D && value.data[5] === 0x0A && value.data[6] === 0x1A && value.data[7] === 0x0A) {
      contentType = 'image/png'
    } else if (value.data[0] === 0xFF && value.data[1] === 0xD8) {
      contentType = 'image/jpeg'
    } else if (value.data[0] === 0x52 && value.data[1] === 0x49 && value.data[2] === 0x46 && value.data[3] === 0x46 && value.data[8] === 0x57 && value.data[9] === 0x45 && value.data[10] === 0x42 && value.data[11] === 0x50) {
      contentType = 'image/webp'
    } else {
      window.alert('WPlace-Assist cannot detect the format of the image, please try another image (png, jpeg, webp).')

      throw new Error('Cannot detect content type (WPlace-Assist)')
    }

    const buffer = value.data.buffer.slice(value.data.byteOffset, value.data.byteLength + value.data.byteOffset) as ArrayBuffer
    const newHash = new Uint8Array(await crypto.subtle.digest('SHA-256', buffer)).toHex()

    if (newHash === Image.hash) {
      if (image.value !== null) {
        await Image.loadImage(image.value)

        Image.eventTarget.dispatchEvent(new Event('load'))
      }
    } else {
      if (image.value !== null) {
        URL.revokeObjectURL(image.value.src)
      }

      const element = document.createElement('img')

      element.addEventListener('load', async () => {
        await Image.loadImage(element)

        image.value = element

        Image.hash = newHash
        Image.eventTarget.dispatchEvent(new Event('load'))
      })

      element.src = URL.createObjectURL(new Blob([buffer], { type: contentType }))
    }
  }
})
