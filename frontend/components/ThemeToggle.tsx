'use client';

import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full w-10 h-10 transition-all duration-300 hover:bg-accent"
            aria-label="Toggle theme"
        >
            {theme === "light" ? (
                <Moon className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-80 dark:scale-0" />
            ) : (
                <Sun className="h-5 w-5 rotate-80 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            )}
        </Button>
    );
}
