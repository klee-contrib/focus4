import i18next from "i18next";
import * as React from "react";

import {Button} from "@focus4/toolbox";

import {getIcon} from "./icon";

/** Props des boutons du Panel. */
export interface PanelButtonsProps {
    /** Etat d'édition. */
    editing?: boolean;
    /** Préfixe i18n. Par défaut : "focus" */
    i18nPrefix?: string;
    /** En cours de chargement */
    loading?: boolean;
    /** Appelé au clic sur le bouton "Annuler". */
    onClickCancel?: () => void;
    /** Appelé au clic sur le bouton "Modifier". */
    onClickEdit?: () => void;
    /** Handler du bouton save. */
    save?: () => void;
}

/** Buttons par défaut du panel : edit / save / cancel. */
export function PanelButtons({
    editing,
    i18nPrefix = "focus",
    loading,
    onClickCancel,
    onClickEdit,
    save
}: PanelButtonsProps) {
    if (onClickCancel && onClickEdit) {
        if (editing) {
            return (
                <span>
                    <Button
                        icon={getIcon(`${i18nPrefix}.icons.button.save`)}
                        label={i18next.t(`${i18nPrefix}.button.save`)}
                        primary={true}
                        onClick={save}
                        type="submit"
                        disabled={loading}
                    />
                    <Button
                        icon={getIcon(`${i18nPrefix}.icons.button.cancel`)}
                        label={i18next.t(`${i18nPrefix}.button.cancel`)}
                        onClick={onClickCancel}
                        disabled={loading}
                    />
                </span>
            );
        } else {
            return (
                <Button
                    icon={getIcon(`${i18nPrefix}.icons.button.edit`)}
                    label={i18next.t(`${i18nPrefix}.button.edit`)}
                    onClick={onClickEdit}
                />
            );
        }
    } else {
        return null;
    }
}
