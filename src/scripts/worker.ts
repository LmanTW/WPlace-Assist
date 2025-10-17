import Palette from './palette'

self.addEventListener('message', (event) => {
  const message = event.data as {
    config: {
      colors: string[],
      dithering: boolean
    },

    data: ImageDataArray,
    width: number,
    height: number
  }

  const colorIndex = new Uint8Array(message.config.colors.length * 4)

  for (const [index, name] of message.config.colors.entries()) {
    colorIndex.set(Palette.colors[name].rgba, index * 4)
  }

  // Find the closest color.
  function findClosestColor(r: number, g: number, b: number): Uint8Array {
    if (colorIndex.length > 0) {
      let bestIndex: number = 0
      let bestDistance: number = Infinity

      for (let i = 0; i < colorIndex.length; i += 4) {
        const rMean = (r + colorIndex[i]) / 2

        const rDifference = r - colorIndex[i]
        const gDifference = g - colorIndex[i + 1]
        const bDifference = b - colorIndex[i + 2]

        const x = ((512 + rMean) * Math.pow(rDifference, 2)) >> 8
        const y = 4 * Math.pow(gDifference, 2)
        const z = ((767 - rMean) * Math.pow(bDifference, 2)) >> 8

        const distance = Math.sqrt(x + y + z)

        if (distance < bestDistance) {
          bestIndex = i
          bestDistance = distance
        }
      }

      return colorIndex.slice(bestIndex, bestIndex + 4)
    }

    return Palette.arrays.black
  }

  if (message.config.dithering) {
    for (let i = 0; i < message.data.length; i += 4) {
      if (message.data[i + 3] > 0 && message.data[i + 3] < 255) {
        const alpha = message.data[i + 3] / 255
        const reverseAlpha = (1 - alpha)
      
        message.data[i] = Math.round((message.data[i] * alpha) + (255 * reverseAlpha))
        message.data[i + 1] = Math.round((message.data[i + 1] * alpha) + (255 * reverseAlpha))
        message.data[i + 2] = Math.round((message.data[i + 2] * alpha) + (255 * reverseAlpha))
        message.data[i + 3] = 255
      }
    }
 
    const weight = new Float32Array(message.data);

    // Add error to a pixel.
    function addError(x: number, y: number, errorR: number, errorG: number, errorB: number, factor: number): void {
      const index = ((y * message.width) + x) * 4

      if (index > 0 && index < message.data.length) {
        weight[index] += errorR * factor
        weight[index + 1] += errorG * factor
        weight[index + 2] += errorB * factor
      }
    }

    for (let y = 0 ; y < message.height; y++) {
      for (let x = 0 ; x < message.width; x++) {
        const index = ((y * message.width) + x) * 4

        if (weight[index + 3] === 0) {
          weight[index] = 0
          weight[index + 1] = 0
          weight[index + 2] = 0
        } else {
          const oldR = weight[index]
          const oldG = weight[index + 1]
          const oldB = weight[index + 2]

          const newColor = findClosestColor(oldR, oldG, oldB, weight[index + 3])
          message.data.set(newColor, index)

          const errorR = oldR - newColor[0]
          const errorG = oldG - newColor[1]
          const errorB = oldB - newColor[2]

          addError(x + 1, y, errorR, errorG, errorB, 7 / 16);
          addError(x - 1, y + 1, errorR, errorG, errorB,  3 / 16);
          addError(x, y + 1, errorR, errorG, errorB,  5 / 16);
          addError(x - 1, y + 1, errorR, errorG, errorB,  1 / 16);
        }
 
      }
    }
  } else {
    for (let i = 0; i < message.data.length; i += 4) {
      if (message.data[i + 3] < 255) {
        const alpha = message.data[i + 3] / 255
        const reverseAlpha = (1 - alpha)
        
        message.data[i] = Math.round((message.data[i] * alpha) + (255 * reverseAlpha))
        message.data[i + 1] = Math.round((message.data[i + 1] * alpha) + (255 * reverseAlpha))
        message.data[i + 2] = Math.round((message.data[i + 2] * alpha) + (255 * reverseAlpha))
        message.data[i + 3] = 255
      }

      message.data.set(findClosestColor(message.data[i], message.data[i + 1], message.data[i + 2], message.data[i + 3]), i)
    }
  }

  const colorMap = new Map<number, number>()

  for (let i = 0; i < message.data.length; i += 4) {
    const hash = Palette.hashColor(message.data[i], message.data[i + 1], message.data[i + 2], message.data[i + 3])
    const amount = colorMap.get(hash)

    colorMap.set(hash, (amount === undefined) ? 1 : amount + 1)
  }

  self.postMessage({
    data: message.data,
    colors: Array.from(colorMap.entries())
  }, { transfer: [message.data.buffer] })
})
