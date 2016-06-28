let _back: () => void;
let _navigate: (...args: any[]) => void;
let _start: () => void;

/**
 * Sets the navigation functions.
 * @param navigate The navigate function.
 * @param back The back function.
 * @param start The start function.
 */
export function setNavigationFunctions(navigate: (...args: any[]) => void, back: () => void, start: () => void) {
    _navigate = navigate;
    _back = back;
    _start = start;
}

/**
 * Navigates to the previous page.
 */
export function back() {
    _back();
}

/**
 * Navigates to the given URL
 * @param path The URL to navigate to.
 * @param options Navigation options.
 */
export function navigate(path: string, options?: {trigger?: boolean, replace?: boolean}): void
export function navigate(path: string | {pathName: string, query: {}, state: {}}): void
export function navigate(...args: any[]) {
    _navigate(...args);
}

/**
 * Starts the router.
 */
export function start() {
    _start();
}
