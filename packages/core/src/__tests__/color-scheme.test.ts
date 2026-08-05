// @vitest-environment jsdom
import {afterEach, describe, expect, test, vi} from "vitest";

const storage = new Map<string, string>();
const localStorageMock = {
    getItem: vi.fn((key: string) => (storage.has(key) ? storage.get(key)! : null)),
    setItem: vi.fn((key: string, value: string) => {
        storage.set(key, String(value));
    }),
    removeItem: vi.fn((key: string) => {
        storage.delete(key);
    }),
    clear: vi.fn(() => {
        storage.clear();
    })
};

Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: localStorageMock
});

function mockMatchMedia(matches: boolean) {
    Object.defineProperty(window, "matchMedia", {
        configurable: true,
        value: vi.fn().mockReturnValue({matches})
    });
}

afterEach(() => {
    localStorageMock.clear();
    document.documentElement.removeAttribute("dark");
    vi.restoreAllMocks();
    vi.resetModules();
});

describe("initColorScheme", () => {
    test("active le mode sombre depuis localStorage", async () => {
        localStorageMock.setItem("color-scheme", "dark");
        mockMatchMedia(false);
        const {colorScheme, initColorScheme} = await import("../color-scheme");

        initColorScheme();

        expect(colorScheme.dark).toBe(true);
        expect(document.documentElement.getAttribute("dark")).toBe("true");
        expect(localStorageMock.getItem("color-scheme")).toBe("dark");
    });

    test("active le mode sombre via préférence système", async () => {
        localStorageMock.removeItem("color-scheme");
        mockMatchMedia(true);
        const {colorScheme, initColorScheme} = await import("../color-scheme");

        initColorScheme();

        expect(colorScheme.dark).toBe(true);
        expect(document.documentElement.getAttribute("dark")).toBe("true");
    });

    test("désactive l'auto dark mode quand demandé", async () => {
        localStorageMock.removeItem("color-scheme");
        mockMatchMedia(true);
        const {colorScheme, initColorScheme} = await import("../color-scheme");

        initColorScheme(true);

        expect(colorScheme.dark).toBe(false);
        expect(document.documentElement.hasAttribute("dark")).toBe(false);
        expect(localStorageMock.getItem("color-scheme")).toBe("light");
    });

    test("retire l'attribut dark si le store repasse en clair", async () => {
        localStorageMock.setItem("color-scheme", "light");
        document.documentElement.setAttribute("dark", "true");
        mockMatchMedia(false);
        const {colorScheme, initColorScheme} = await import("../color-scheme");

        initColorScheme();

        expect(document.documentElement.hasAttribute("dark")).toBe(false);
        expect(localStorageMock.getItem("color-scheme")).toBe("light");
        expect(colorScheme.dark).toBe(false);
    });
});
