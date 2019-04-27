import {createContext, ReactElement, RefObject} from "react";

export const MenuContext = createContext({
    activeRoute: undefined as string | undefined,
    addItem(item: readonly [RefObject<HTMLLIElement>, ReactElement, string | undefined]) {
        // tslint:disable-next-line: no-unused-expression
        item;
    },
    closePanel() {
        /* */
    },
    removeItem(item: readonly [RefObject<HTMLLIElement>, ReactElement, string | undefined]) {
        // tslint:disable-next-line: no-unused-expression
        item;
    }
});
