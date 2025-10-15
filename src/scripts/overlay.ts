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

// Utilities for processing the overlay.
namespace Overlay {
  export let cached: { [key: string]: Overlay.Chunk } = {} 
  export let progress: { [key: string]: Overlay.ColorProgress } = {}

  // Render a tile.
  export async function renderTile(tileX: number, tileY: number, image: Blob): Promise<Blob> {
    if (State.image !== null && State.image.position !== null) {
      const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', await image.arrayBuffer())).toHex();
      const chunkID = `${tileX}-${tileY}` 

      if (Overlay.cached.hasOwnProperty(chunkID) && hash === Overlay.cached[chunkID].hash) {
        return Overlay.cached[chunkID].blob
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
      
      const colorProgressMap = new Map<number, Overlay.ColorProgress>()

      for (let i = 0; i < tileData.data.length; i += 4) {
        const hash = Palette.hashColor(tileData.data[i], tileData.data[i + 1], tileData.data[i + 2], tileData.data[i + 3])
        const progress = colorProgressMap.get(hash)

        if (progress === undefined) {
          if (tileData.data[i + 3] === 0 && overlayData.data[i + 3] !== 0) {

          }
        } else {
          progress.total
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
      tileCtx.drawImage(overlayCanvas, tileCropX, tileCropY, overlayCanvas.width, overlayCanvas.height);

      return new Promise((resolve) => {
        tileCanvas.toBlob((blob) => {
          if (blob === null) {
            resolve(image)
          } else {
            Overlay.cached[chunkID] = {
              hash,
              blob
            }

            return blob
          }
        })
      })
    }

    return image
  }

  // The data structure of a chunk.
  export interface Chunk {
    hash: string,
    blob: Blob,
    progress: { [key: string]: Overlay.ColorProgress }
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
