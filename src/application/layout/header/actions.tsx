import i18n from "i18next";
import {observer} from "mobx-react";
import * as React from "react";

import Button from "focus-components/button";
import Dropdown from "focus-components/dropdown";

import {applicationStore} from "../../store";

/** Barre d'actions du header. */
export const HeaderActions = observer<{className: string, i18nPrefix?: string}>(
    ({className: cName, i18nPrefix = "focus"}) => {
        const {actions} = applicationStore;
        return (
            <div className={cName}>
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
                    <Dropdown button={{
                        shape: "fab",
                        icon: i18n.t(`${i18nPrefix}.icons.headerActions.secondary.name`),
                        iconLibrary: i18n.t(`${i18nPrefix}.icons.headerActions.secondary.library`),
                    }} operations={actions.secondary.slice()} />
                : null}
            </div>
        );
    }
);
