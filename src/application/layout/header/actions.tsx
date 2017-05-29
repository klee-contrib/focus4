import {observer} from "mobx-react";
import * as React from "react";
import {Button} from "react-toolbox/lib/button";

import {ButtonMenu, getIcon, MenuItem} from "../../../components";

import {applicationStore} from "../../store";

/** Barre d'actions du header. */
export const HeaderActions = observer<{className: string, i18nPrefix?: string}>(
    ({className: cName, i18nPrefix = "focus"}) => {
        const {actions} = applicationStore;
        return (
            <div className={cName}>
                {actions.primary.map((action, i) => (
                    <Button
                        key={`${i}`}
                        floating={true}
                        {...action}
                        icon={getIcon(action.icon, action.iconCustom || false)}
                    />
                ))}
                {actions.secondary && actions.secondary.length > 0 ?
                    <ButtonMenu
                        button={{
                            floating: true,
                            icon: getIcon(`${i18nPrefix}.icons.headerActions.secondary`)
                        }}
                    >
                        {actions.secondary.map((action, i) => <MenuItem key={`${i}`} {...action} icon={getIcon(action.icon, action.iconCustom || false)}  />)}
                    </ButtonMenu>
                : null}
            </div>
        );
    }
);

// iconLibrary={iconLibrary}
// iconLibrary: i18n.t(`${i18nPrefix}.icons.headerActions.secondary.library`)
