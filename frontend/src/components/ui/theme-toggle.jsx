import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../hooks/useTheme.jsx";
import { cn } from "../../lib/utils";

export function ThemeToggle({ className }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative inline-flex h-10 w-10 items-center justify-center rounded-lg border transition-all duration-300",
        theme === "dark"
          ? "border-slate-700 bg-slate-800 text-yellow-400 hover:bg-slate-700 hover:border-slate-600"
          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:border-slate-400 shadow-sm",
        className
      )}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon className="h-5 w-5 transition-transform duration-300 hover:-rotate-12" />
      )}
    </button>
  );
}
