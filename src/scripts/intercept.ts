import Palette from './palette'
import Overlay from './overlay'
import State from './state'
import Image from './image'

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')!

canvas.width = 1000
canvas.height = 1000

ctx.imageSmoothingEnabled = false

// Save the canvas.
function saveCanvas(): Promise<null | Blob> {
  return new Promise((resolve) => canvas.toBlob(resolve))
}

// Load an image.
function loadImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const element = document.createElement('img')

    element.addEventListener('load', () => resolve(element))
    element.addEventListener('error', (event) => reject(event.error))

    element.src = URL.createObjectURL(blob)
  })
}

// Utilities for intercepting varias actions.
namespace Intercept {

  // Intercept tile image.
  export async function interceptTileImage(tileX: number, tileY: number, image: Blob): Promise<Blob> {
    if (State.settings.overlayShow && (State.image !== null && State.image.position !== null)) {
      if (tileX >= State.image.position.tileX && tileX < State.image.position.tileX + Math.ceil((State.image.position.localX + State.image.width) / 1000)) {
        if (tileY >= State.image.position.tileY && tileY < State.image.position.tileY + Math.ceil((State.image.position.localY + State.image.height) / 1000)) {
          return await Overlay.renderTile(tileX, tileY, image)
        }
      }

      if (State.settings.backgroundMode !== 'map') {
        const element = (State.settings.backgroundOpacity === 1) ? null : await loadImage(image)

        ctx.clearRect(0, 0, 1000, 1000)
        ctx.imageSmoothingEnabled = false

        if (element !== null) {
          ctx.globalAlpha = 1
          ctx.drawImage(element, 0, 0, 1000, 1000)
        }

        if (State.settings.backgroundMode === 'black') {
          ctx.globalAlpha = State.settings.backgroundOpacity
          ctx.fillStyle = 'rgb(0,0,0)'
          ctx.fillRect(0, 0, 1000, 1000)
        } else if (State.settings.backgroundMode === 'white') {
          ctx.globalAlpha = State.settings.backgroundOpacity
          ctx.fillStyle = 'rgb(255,255,255)'
          ctx.fillRect(0, 0, 1000, 1000)
        }

        return await saveCanvas() || image
      }
    }

    return image
  }

  // Intercept pixel placement.
  export function interceptPixelPlacement(tileX: number, tileY: number, data: Intercept.PlacementData): PlacementData {
    if (State.settings.overlayShow && (State.image !== null && State.image.position !== null)) {
      if (tileX >= State.image.position.tileX && tileX < State.image.position.tileX + Math.ceil((State.image.position.localX + State.image.width) / 1000)) {
        if (tileY >= State.image.position.tileY && tileY < State.image.position.tileY + Math.ceil((State.image.position.localY + State.image.height) / 1000)) {
          for (let i = 0; i < data.coords.length; i += 2) {
            const x = ((tileX - State.image.position.tileX) * 1000) + (data.coords[i] - State.image.position.localX)
            const y = ((tileY - State.image.position.tileY) * 1000) + (data.coords[i + 1] - State.image.position.localY)

            const color = Image.ctx.getImageData(x, y, 1, 1).data
            const hash = Palette.hashColor(color[0], color[1], color[2])

            if (color[3] === 0) {
              data.colors[i / 2] = 0
            } else {
              data.colors[i / 2] = Palette.colors[Palette.colorNameMap.get(hash)!].index
            }
          }
        }
      }
    }

    return data
  }

  // The data structure of the placement request body.
  export interface PlacementData {
    colors: number[],
    coords: number[],

    t: string,
    fp: string
  }
}

export default Intercept
