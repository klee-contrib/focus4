import {createContext} from "react";

export const lcInit = {
    addItemHandler: () => {
        /*noop */
    },
    mosaic: {width: 200, height: 200},
    mode: "list" as "list" | "mosaic"
};
export const ListContext = createContext(lcInit);
