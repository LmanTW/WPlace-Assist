import { signal } from '@preact/signals'

import Language from './language'
import State from './state'

// The diagnostor.
namespace Diagnostor {
  export const updatingTiles = signal<boolean>(false)

  // Diagnose the system.
  export function diagnose(): Diagnostor.Diagnostic[] {
    const diagnostics: Diagnostor.Diagnostic[] = []

    if (State.control.selectingPosition) {
      diagnostics.push({ type: 'tip', message: Language.translate('tip', 'Click on a pixel to set the position.') })
    }

    // if (Overlay.updatingTiles.value) {
    //  diagnostics.push({ type: 'tip', message: Language.translate('tip', 'It might take some time to update the tiles.') })
    //}

    return diagnostics
  }

  // The data structure of a diagnostic.
  export interface Diagnostic {
    type: 'tip' | 'warning' | 'error',
    message: string
  }
}

export default Diagnostor
