import Palette from './palette'
import State from './state'
import Image from './image'
import { h } from 'preact'
import { ImageDown } from 'lucide-react'

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
      const transparent = new Uint8Array([0, 0, 0, 0])

      for (const name of State.settings.overlayColors) {
        const color = Palette.colors[name]

        enabledColors.add(Palette.hashColor(color.rgb[0], color.rgb[1], color.rgb[2]))
      }

      for (let i = 0; i < tileData.data.length; i += 4) {
        if (State.settings.overlayMode === 'image') {
          if (!enabledColors.has(Palette.hashColor(overlayData.data[i], overlayData.data[i + 1], overlayData.data[i + 2]))) {
            overlayData.data.set(transparent, i)
          }
        } else if (State.settings.overlayMode === 'progress') {
          if (!enabledColors.has(Palette.hashColor(overlayData.data[i], overlayData.data[i + 1], overlayData.data[i + 2]))) {
            overlayData.data.set(transparent, i)
          } else if (tileData.data[i + 3] === 0 && overlayData.data[i + 3] !== 0) {
            overlayData.data[i] = 128
            overlayData.data[i + 1] = 128
            overlayData.data[i + 2] = 128
          } else if (tileData.data[i] === overlayData.data[i] && tileData.data[i + 1] === overlayData.data[i + 1] && tileData.data[i + 2] === overlayData.data[i + 2] && tileData.data[i + 3] === overlayData.data[i + 3]) {
            overlayData.data[i] = 0
            overlayData.data[i + 1] = 255
            overlayData.data[i + 2] = 0 
          } else {
            overlayData.data[i] = 255
            overlayData.data[i + 1] = 0
            overlayData.data[i + 2] = 0 
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
      tileCtx.drawImage(overlayCanvas, tileCropX, tileCropY, overlayCanvas.width, overlayCanvas.height);

      return new Promise((resolve) => {
        tileCanvas.toBlob((blob) => {
          if (blob === null) {
            resolve(image)
          } else {
            Overlay.cached[chunkID] = { hash, blob }

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
    blob: Blob
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
