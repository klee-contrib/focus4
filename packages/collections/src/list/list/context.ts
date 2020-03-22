import {createContext} from "react";

export const ListContext = createContext({
    addItemHandler: undefined as (() => void) | undefined,
    mode: undefined as "list" | "mosaic" | undefined
});
