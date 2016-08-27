import {Map, fromJS} from "immutable";
import * as React from "react";

import CoreStore from "store";

export const definition: Application = {
    summary: <div />,
    barLeft: <div />,
    barRight: <div />,
    cartridge: <div />,
    actions: {},
    mode: undefined,
    route: undefined,
    canDeploy: undefined
};

export interface ApplicationAction {
    summary?: React.ReactElement<any>;
    barLeft?: React.ReactElement<any>;
    barRight?: React.ReactElement<any>;
    cartridge?: React.ReactElement<any>;
    actions?: {
        primary?: {icon: string, action: () => void}[];
        secondary?: {label: string, action: () => void}[];
    };
    canDeploy?: boolean;
}

export interface Application extends ApplicationAction {
    mode?: Map<string, number>;
    route?: string;
}

export default class ApplicationStore extends CoreStore<typeof definition> {

    constructor() {
        super({definition});
    }

    updateMode({newMode, previousMode}: {newMode: string, previousMode: string}) {
        const modeData: Map<string, number> = this.data.has("mode") ? this.data.get("mode") : fromJS({});
        const newModeValue = modeData.has(newMode) ? (modeData.get(newMode) + 1) : 1;
        // Add a check to not have a negative mode, but it should not happen.
        const previousModeValue =  modeData.has(previousMode) ? (modeData.get(previousMode) - 1) : 0;
        this.data = this.data.set("mode",
            modeData.set(newMode, newModeValue).set(previousMode, previousModeValue)
        );
        this.willEmit("mode:change");
    }
}
