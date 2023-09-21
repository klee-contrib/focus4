import {autorun, observable} from "mobx";

export const colorScheme = observable({dark: false});

export function initColorScheme(disableAutoDarkMode = false) {
    const ls = localStorage.getItem("color-scheme");
    if (ls === "dark" || (!disableAutoDarkMode && window.matchMedia?.("(prefers-color-scheme: dark)").matches)) {
        colorScheme.dark = true;
    }
    localStorage.setItem("color-scheme", colorScheme.dark ? "dark" : "light");

    autorun(() => {
        const darkModeAttribute = document.documentElement.hasAttribute("dark");
        if (colorScheme.dark && !darkModeAttribute) {
            document.documentElement.setAttribute("dark", "true");
            localStorage.setItem("color-scheme", "dark");
        } else if (!colorScheme.dark && darkModeAttribute) {
            document.documentElement.removeAttribute("dark");
            localStorage.setItem("color-scheme", "light");
        }
    });
}
