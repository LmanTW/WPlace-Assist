import baseStyle from '../main.css?inline'

const style = document.body.appendChild(document.createElement('style'));

// Utilities for handling theming.
namespace Theme {
  export const themes = Object.fromEntries(Object.entries(import.meta.glob('../assets/themes/*.css', { eager: true, query: '?inline', import: 'default' }) as {
    [key: string]: string 
  }).map((entry) => [entry[0].substring(entry[0].lastIndexOf('/') + 1, entry[0].lastIndexOf('.')), entry[1]]))
  
  // Load a theme.
  export function loadTheme(id: string): void {
    style.innerHTML = baseStyle + Theme.themes[id]
  }

  // Format a theme name.
  export function formatThemeName(id: string): string {
    return id.split('-').map((part) => part[0].toUpperCase() + part.substring(1)).join(' ')
  }
}


export default Theme
