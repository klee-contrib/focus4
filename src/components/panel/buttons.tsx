import i18next from "i18next";
import * as React from "react";
import {Button} from "react-toolbox/lib/button";

import {getIcon} from "../icon";

/** Props des boutons du Panel. */
export interface PanelButtonsProps {
    /** Etat d'édition. */
    editing?: boolean;
    /** Préfixe i18n. Par défaut : "focus" */
    i18nPrefix?: string;
    /** En cours de chargement */
    loading?: boolean;
    /** Fonction pour changer de mode. */
    toggleEdit?: (edit: boolean) => void;
    /** Handler du bouton save. */
    save?: () => void;
}

/** Buttons par défaut du panel : edit / save / cancel. */
export function PanelButtons({editing, i18nPrefix = "focus", loading, toggleEdit, save}: PanelButtonsProps) {
    if (toggleEdit) {
        if (editing) {
            return (
                <span>
                    <Button
                        icon={getIcon(`${i18nPrefix}.icons.button.save`)}
                        label={i18next.t(`${i18nPrefix}.button.save`)}
                        primary={true}
                        onClick={save}
                        disabled={loading}
                    />
                    <Button
                        icon={getIcon(`${i18nPrefix}.icons.button.cancel`)}
                        label={i18next.t(`${i18nPrefix}.button.cancel`)}
                        onClick={() => toggleEdit(false)}
                        disabled={loading}
                    />
                </span>
            );
        } else {
            return (
                <Button
                    icon={getIcon(`${i18nPrefix}.icons.button.edit`)}
                    label={i18next.t(`${i18nPrefix}.button.edit`)}
                    onClick={() => toggleEdit(true)}
                />
            );
        }
    }

    return null;
}

export default PanelButtons;
