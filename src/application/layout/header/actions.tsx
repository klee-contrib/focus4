import {observer} from "mobx-react";
import * as React from "react";

import * as defaults from "../../../defaults";

import {applicationStore} from "../../store";

export const HeaderActions = observer(() => {
    const {Button, Dropdown} = defaults;
    if (!Button || !Dropdown) {
        throw new Error("Vous n'avez pas enregistré Button et/ou Dropdown dans autofocus/defaults");
    }

    const {actions} = applicationStore;
    return (
        <div data-focus="header-actions">
            {actions.primary.map(primary => {
                const {action, className, icon, iconLibrary, label} = primary;
                return (
                    <Button
                        key={`header-action-${label}`}
                        className={className}
                        handleOnClick={action}
                        icon={icon}
                        iconLibrary={iconLibrary}
                        label={label}
                        shape="fab"
                        type="button"
                    />
                );
            })}
            {actions.secondary && actions.secondary.length > 0 ?
                <Dropdown operationList={actions.secondary} />
            : null}
        </div>
    );
});
