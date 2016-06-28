import * as React from "react";
import ApplicationStore, {ApplicationAction} from "../store/application";
import {dispatcher} from "../";

export { default as actionBuilder } from "./action-builder";

export const builtInStore = new ApplicationStore();

export function changeMode(newMode: string, previousMode: string) {
    dispatcher.handleViewAction({data: {mode: {newMode, previousMode}}, type: "update"});
}

export function changeRoute(route: string) {
    dispatcher.handleViewAction({data: {route}, type: "update"});
}

export function setHeader({cartridge, summary, actions, barLeft, canDeploy, barRight}: ApplicationAction, isPartial?: boolean) {
    let data: ApplicationAction = {};

    if (!isPartial) {
        data = {
            cartridge: cartridge || <div />,
            summary: summary || <div />,
            actions: actions || {primary: [], secondary: []},
            barLeft: barLeft || <div />,
            canDeploy: canDeploy === undefined ? true : canDeploy
        };
    } else {
        if (cartridge) {
            data.cartridge = cartridge;
        }
        if (summary) {
            data.summary = summary;
        }
        if (actions) {
            data.actions = actions;
        }
        if (barLeft) {
            data.barLeft = barLeft;
        }
        if (canDeploy) {
            data.canDeploy = canDeploy;
        }
    }

    if (barRight) {
        data.barRight = barRight;
    }

    dispatcher.handleViewAction({data, type: "update"});
}

export function clearHeader() {
    dispatcher.handleViewAction({
        data: {
            cartridge: <div />,
            barLeft: <div />,
            summary: <div />,
            actions: {primary: [], secondary: []}
        },
        type: "update"
    });
}
