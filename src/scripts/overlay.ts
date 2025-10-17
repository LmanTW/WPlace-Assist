import { batch, signal } from '@preact/signals'

import Palette from './palette'
import State from './state'
import Image from './image'

const tileCanvas = document.createElement('canvas')
const tileCtx = tileCanvas.getContext('2d')!

const overlayCanvas = document.createElement('canvas')
const overlayCtx = overlayCanvas.getContext('2d')!

tileCanvas.width = 1000
tileCanvas.height = 1000

tileCtx.imageSmoothingEnabled = false
overlayCtx.imageSmoothingEnabled = false

let cached: { [key: string]: Overlay.CachedTile } = {}

// Utilities for processing the overlay.
namespace Overlay {
  export const progress = signal<{ [key: string]: Overlay.ColorProgress }>({})
  export const updatingTiles = signal<boolean>(false)

  // Render a tile.
  export async function renderTile(tileX: number, tileY: number, image: Blob): Promise<Blob> {
    if (State.image !== null && State.image.position !== null) {
      const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', await image.arrayBuffer())).toHex();
      const chunkID = `${tileX}-${tileY}` 

      if (cached.hasOwnProperty(chunkID) && hash === cached[chunkID].hash) {
        return cached[chunkID].blob
      }

      const element = await loadImage(image)

      tileCtx.clearRect(0, 0, 1000, 1000)
      tileCtx.globalAlpha = 1
      tileCtx.drawImage(element, 0, 0, 1000, 1000)

      const imageRenderX = ((State.image.position.tileX - tileX) * 1000) + State.image.position.localX
      const imageRenderY = ((State.image.position.tileY - tileY) * 1000) + State.image.position.localY

      const tileCropX = Math.max(0, imageRenderX);
      const tileCropY = Math.max(0, imageRenderY);
      const tileCropWidth = Math.min(1000 - tileCropX, Image.canvas.width - Math.max(0, -imageRenderX));
      const tileCropHeight = Math.min(1000 - tileCropY, Image.canvas.height - Math.max(0, -imageRenderY));

      const tileData = tileCtx.getImageData(tileCropX, tileCropY, tileCropWidth, tileCropHeight);
      const overlayData = Image.ctx.getImageData(Math.max(0, -imageRenderX), Math.max(0, -imageRenderY), tileCropWidth, tileCropHeight)

      const enabledColors = new Set<number>()

      for (const name of State.settings.overlayColors) {
        const color = Palette.colors[name]

        enabledColors.add(Palette.hashColor(color.rgba[0], color.rgba[1], color.rgba[2], color.rgba[3]))
      }

      const colorMap = new Map<number, Overlay.ColorProgress>()

      for (let i = 0; i < tileData.data.length; i += 4) {
        const hash = Palette.hashColor(overlayData.data[i], overlayData.data[i + 1], overlayData.data[i + 2], overlayData.data[i + 3])
        const progress = colorMap.get(hash)

        if (progress === undefined) {
          colorMap.set(hash, {
            painted: (overlayData.data[i] === tileData.data[i] && overlayData.data[i + 1] === tileData.data[i + 1] && overlayData.data[i + 2] === tileData.data[i + 2] && overlayData.data[i + 3] === tileData.data[i + 3]) ? 1 : 0,
            total: 1
          })
        } else {
          progress.total++

          if (tileData.data[i] === overlayData.data[i] && tileData.data[i + 1] === overlayData.data[i + 1] && tileData.data[i + 2] === overlayData.data[i + 2] && tileData.data[i + 3] === overlayData.data[i + 3]) {
            progress.painted++
          }
        }
      }

      for (let i = 0; i < tileData.data.length; i += 4) {
        if (State.settings.overlayMode === 'image') {
          if (!enabledColors.has(Palette.hashColor(overlayData.data[i], overlayData.data[i + 1], overlayData.data[i + 2], overlayData.data[i + 3]))) {
            overlayData.data.set(Palette.arrays.transparent, i)
          }
        } else if (State.settings.overlayMode === 'progress') {
          if (!enabledColors.has(Palette.hashColor(overlayData.data[i], overlayData.data[i + 1], overlayData.data[i + 2], overlayData.data[i + 3]))) {
            overlayData.data.set(Palette.arrays.transparent, i)
          } else if (tileData.data[i + 3] === 0 && overlayData.data[i + 3] !== 0) {
            overlayData.data.set(Palette.arrays.gray, i)
          } else if (tileData.data[i] === overlayData.data[i] && tileData.data[i + 1] === overlayData.data[i + 1] && tileData.data[i + 2] === overlayData.data[i + 2] && tileData.data[i + 3] === overlayData.data[i + 3]) {
            overlayData.data.set(Palette.arrays.green, i)
          } else {
            overlayData.data.set(Palette.arrays.red, i)
          }
        }
      }

      overlayCanvas.width = overlayData.width
      overlayCanvas.height = overlayData.height
      overlayCtx.putImageData(overlayData, 0, 0)

      if (State.settings.backgroundMode === 'black') {
        tileCtx.globalAlpha = State.settings.backgroundOpacity
        tileCtx.fillStyle = 'rgb(0,0,0)'
        tileCtx.fillRect(0, 0, 1000, 1000)
      } else if (State.settings.backgroundMode === 'white') {
        tileCtx.globalAlpha = State.settings.backgroundOpacity
        tileCtx.fillStyle = 'rgb(255,255,255)'
        tileCtx.fillRect(0, 0, 1000, 1000)
      }

      URL.revokeObjectURL(element.src)

      tileCtx.globalAlpha = State.settings.overlayOpacity
      tileCtx.drawImage(overlayCanvas, tileCropX, tileCropY, overlayCanvas.width, overlayCanvas.height) 

      return new Promise((resolve) => {
        tileCanvas.toBlob((blob) => {
          if (blob === null) {
            resolve(image)
          } else {
            cached[chunkID] = {
              hash,
              blob,
              colors: Object.fromEntries(Array.from(colorMap.entries()).map((entry) => [Palette.colorNameMap.get(entry[0]), entry[1]]))
            }

            Overlay.updateProgress()
            Overlay.updatingTiles.value = false

            return blob
          }
        })
      })
    }

    return image
  }

  // Update the progress.
  export function updateProgress(): void {
    const progress: { [key: string]: Overlay.ColorProgress } = {}

    for (const chunkID of Object.keys(cached)) {
      const chunk = cached[chunkID]

      for (const name of Object.keys(chunk.colors)) {
        if (progress[name] === undefined) {
          progress[name] = chunk.colors[name]
        } else {
          progress[name].total += chunk.colors[name].total
          progress[name].painted += chunk.colors[name].painted
        }
      }
    }

    Overlay.progress.value = Object.fromEntries(Object.entries(progress).sort((a, b) => b[1].total - a[1].total))
  }

  // Clear the cached tiles.
  export function clearCachedTiles(): void {
    cached = {}

    batch(() => {
      Overlay.progress.value = {}

      if (State.image !== null && State.image.position !== null) {
        Overlay.updatingTiles.value = true
      }
    })
  }

  // The data structure of a cached tile.
  export interface CachedTile {
    hash: string,
    blob: Blob,
    colors: { [key: string]: Overlay.ColorProgress }
  }

  // The data structure of a color progress.
  export interface ColorProgress {
    painted: number,
    total: number
  }
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

export default Overlay
