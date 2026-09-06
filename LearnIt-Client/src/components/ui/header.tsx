/**
 * Folder: src/components/ui/
 * Description: Stores global UI components.
 * This file: header.tsx (Application top navigation bar with theme toggle).
 */
import ThemeToogle from '../themeToogle'

export function Header() {

  return (
    <header className="border-b border-border-main bg-bg-card/80 backdrop-blur-md sticky top-0 z-40 h-16 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <h1 className="text-base font-bold text-text-main tracking-tight">LearnIt</h1>
      </div>

      <div className="flex items-center space-x-4">
        <ThemeToogle />
      </div>
    </header>
  )
}

export default Header
