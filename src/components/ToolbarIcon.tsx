import { Pointer } from 'lucide-react'

import State from '../scripts/state'

// The toolbar icon component.
export default () => {
  return (
    <div class='wpa-button shadow-md' onClick={() => State.updateLayout({ controlMenu: !State.layout.controlMenu })} style={{ width: '40px', height: '40px', padding: '0rem' }}>
      <Pointer width='20' height='20'/>
    </div>
  )
}
