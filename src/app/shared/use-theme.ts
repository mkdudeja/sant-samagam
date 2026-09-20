import React from "react"

export type Theme = "light" | "dark"

// kept in sync with the inline script in index.html that applies the class
// before first paint
export const KEY_THEME = "eDirectory_theme"
const DARK_QUERY = "(prefers-color-scheme: dark)"

// null means the user has never picked a theme, so the device decides
function getStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(KEY_THEME)
    return stored === "dark" || stored === "light" ? stored : null
  } catch {
    return null
  }
}

function getDeviceTheme(): Theme {
  return window.matchMedia?.(DARK_QUERY).matches ? "dark" : "light"
}

export function useTheme() {
  const [theme, setTheme] = React.useState<Theme>(
    () => getStoredTheme() ?? getDeviceTheme(),
  )

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")

    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#111827" : "#fbf8f2")
  }, [theme])

  // keep following the device until the user overrides it
  React.useEffect(() => {
    const media = window.matchMedia?.(DARK_QUERY)
    if (!media) return

    const onChange = (event: MediaQueryListEvent) => {
      if (!getStoredTheme()) setTheme(event.matches ? "dark" : "light")
    }

    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [])

  // only an explicit toggle is persisted; the device default never is
  const toggleTheme = React.useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark"

    try {
      localStorage.setItem(KEY_THEME, next)
    } catch {
      // private mode / blocked storage: the choice still applies this session
    }

    setTheme(next)
  }, [theme])

  return { theme, toggleTheme }
}
