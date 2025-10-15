import State from './state'

import baseLanguage from '../assets/languages/en-US.json'

// Utilities for handling translation.
namespace Language {
  export const languages = Object.fromEntries(Object.entries(import.meta.glob('../assets/languages/*.json', { eager: true, import: 'default' }) as { [key: string]: Language.Raw }).map((entry) => {
    let total: number = 0
    let translated: number = 0

    const data: { [key: string]: { [key: string]: string }} = entry[1].data
    const baseData = baseLanguage.data as { [key: string]: { [key: string]: string }}

    for (const group of Object.keys(baseData)) {
      if (data[group] === undefined) {
        data[group] = {}
      }

      for (const content of Object.keys(baseData[group])) {
        total++

        if (data[group][content] === undefined) {
          data[group][content] = content
        } else {
          translated++
        }
      }
    }

    return [entry[0].substring(entry[0].lastIndexOf('/') + 1, entry[0].lastIndexOf('.')), {
      info: {
        name: entry[1].info.name,
        flag: entry[1].info.flag,

        coverage: Math.round((100 / total) * translated)
      },

      data,
    }]
  }))

  // Get a translation. (G = Group)
  export function translate<G extends keyof typeof baseLanguage['data']>(group: G, content: keyof typeof baseLanguage['data'][G] & string, parameters?: { [key: string]: number | string }): string {
    let translated = Language.languages[State.settings.language].data[group][content]

    if (parameters !== undefined) {
      Object.keys(parameters).forEach((name) => {
        translated = translated.replaceAll(name, parameters[name].toString())
      })
    }

    return translated
  }
  
  // The data structure of a raw language.
  export interface Raw {
    info: {
      name: string,
      flag: string
    },

    data: {
      [key: string]: {
        [key: string]: string
      }
    }
  }

  // The data structure of a loaded language.
  export interface Data {
    info: {
      name: string,
      flag: string,

      coverage: number
    },

    data: {
      [key: string]: {
        [key: string]: string
      }
    } 
  }
}

export default Language
