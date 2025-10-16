import { render } from 'preact'

import ImageStatistics from './components/ImageStatistics'
import UserSettings from './components/UserSettings'
import ToolbarIcon from './components/ToolbarIcon'
import ControlMenu from './components/ControlMenu'
import ImageConfig from './components/ImageConfig'
import Intercept from './scripts/intercept'
import State from './scripts/state'
import Theme from './scripts/theme'

const container_root = document.createElement('div')
const container_sidebar = document.querySelector('.flex.flex-col.gap-4.items-center')

if (container_sidebar === null) {
  window.alert('WPlace-Assist is not working, please update the script or contact the maintainers.')

  throw new Error('Cannot locate the sidebar container (WPlace-Assist)')
}

Theme.loadTheme(State.settings.theme)

render(<ToolbarIcon/>, container_root)
render(<ControlMenu/>, document.body.appendChild(document.createElement('div')))
render(<ImageConfig/>, document.body.appendChild(document.createElement('div')))
render(<ImageStatistics/>, document.body.appendChild(document.createElement('div')))
render(<UserSettings/>, document.body.appendChild(document.createElement('div')))

// Mount the toolbar icon component.
function mountToolbarIcon() {
  const container_toolbar = document.querySelector<HTMLDivElement>('.flex.flex-col.items-center.gap-3')

  if (container_toolbar === null) {
    window.alert('WPlace-Assist is not working, please update the script or contact the maintainers.')

    throw new Error('Cannot locate the toolbar container (WPlace-Assist)')
  }

  container_toolbar.appendChild(container_root)
}

mountToolbarIcon()

new MutationObserver((mutations) => {
  if (mutations.length > 1 && container_sidebar.querySelector('.flex.flex-col.items-center.gap-3') !== null) {
    mountToolbarIcon()
  }
}).observe(container_sidebar, { childList: true })

const originalFetch = window.fetch

// Turn a fetch input into an URL object.
function inputToURL(input: RequestInfo | URL): null | URL {
  if (typeof input === 'string') {
    return new URL(input)
  } else if (input instanceof URL) {
    return input
  } else if (input instanceof Request) {
    return new URL(input.url)
  }

  return null
}

window.fetch = async (input: URL | RequestInfo, init?: RequestInit): Promise<Response> => {
  let url = inputToURL(input)

  if (url !== null) {
    if (url.pathname.startsWith('/files/s0/tiles')) {
      const response = await originalFetch.call(this, new Request(url, init))

      return new Response(await Intercept.interceptTileImage(parseInt(url.pathname.split('/')[4]), parseInt(url.pathname.split('/')[5]), await response.blob()))
    } else if (url.pathname.startsWith('/s0/pixel')) {
      if (url.searchParams.has('x') && url.searchParams.has('y')) {
        if (State.control.selectPosition) {
          if (State.image !== null) {
            State.updateImage({
              position: {
                tileX: parseInt(url.pathname.split('/')[3]),
                tileY: parseInt(url.pathname.split('/')[4]),
                localX: parseInt(url.searchParams.get('x')!),
                localY: parseInt(url.searchParams.get('y')!)
              } 
            })
          }

          State.updateControl({ selectPosition: false })
        }
      } else if (init !== undefined && typeof init.body === 'string') {
        const data = Intercept.interceptPixelPlacement(
          parseInt(url.pathname.split('/')[3]), parseInt(url.pathname.split('/')[4]),
          JSON.parse(init.body) as Intercept.PlacementData
        )

        init.body = JSON.stringify(data)
      }
    }
  }

  return originalFetch.call(this, input, init)
}


