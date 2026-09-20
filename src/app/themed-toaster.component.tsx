import React from "react"
import { Toaster } from "sonner"
import { useTheme } from "./shared/use-theme"

// sonner needs the live theme, and the toggle sits inside <App />; the shared
// theme store keeps both in step
const ThemedToaster: React.FC = () => {
  const { theme } = useTheme()

  return <Toaster richColors theme={theme} />
}

export default ThemedToaster
