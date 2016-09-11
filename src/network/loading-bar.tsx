import {observer} from "mobx-react";
import * as React from "react";

import * as defaults from "../defaults";

import {requestStore} from "./store";

export interface LoadingBarProps {
    displayDevBar?: boolean;
    ProgressBar: defaults.ReactComponent<{completed: number}>;
}

export const LoadingBar = observer(({displayDevBar, ProgressBar}: LoadingBarProps) => {
    const {count, error, pending, success} = requestStore;
    const completed = +((count.total - count.pending) / count.total) * 100;

    const {Icon} = defaults;
    if (!Icon) {
        throw new Error("Icon n'a pas été défini. Utilisez 'autofocus/defaults'.");
    }

    return (
        <div data-focus="loading-bar">
            {completed < 100 ? <ProgressBar completed={completed} /> : null}
            {displayDevBar ?
                <ul className="fa-ul">
                    <li><Icon name="swap_vert"/> pending {pending}</li>
                    <li><Icon name="check_circle"/> success {success}</li>
                    <li><Icon name="error"/> error {error}</li>
                    <li><Icon name="functions"/> total {count.total}</li>
                </ul>
            : null}
        </div>
    );
});
