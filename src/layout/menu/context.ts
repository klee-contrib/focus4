import {createContext, ReactElement, ReactPortal} from "react";

export const MenuContext = createContext({
    activeRoute: undefined as string | undefined,
    closePanel() {
        /* */
    },
    renderSubMenu(_: ReactElement): ReactPortal | null {
        return null;
    }
});
