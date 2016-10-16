import {observer} from "mobx-react";
import * as React from "react";

import Button from "focus-components/button";
import Dropdown from "focus-components/dropdown";

import {applicationStore} from "../../store";

export const HeaderActions = observer(() => {
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
                <Dropdown operations={actions.secondary} />
            : null}
        </div>
    );
});
