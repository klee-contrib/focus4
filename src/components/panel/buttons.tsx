import i18n from "i18next";
import * as React from "react";
import {Button} from "react-toolbox/lib/button";

export interface PanelButtonsProps {
    editing?: boolean;
    i18nPrefix?: string;
    toggleEdit?: (edit: boolean) => void;
    save?: () => void;
    saving?: boolean;
}

export function PanelButtons({editing, i18nPrefix = "focus", toggleEdit, save, saving}: PanelButtonsProps) {
    if (toggleEdit) {
        if (editing) {
            return (
                <span>
                    <Button
                        icon="save"
                        label={i18n.t(`${i18nPrefix}.components.button.save`)}
                        primary={true}
                        onClick={save}
                        disabled={saving}
                    />
                    <Button
                        icon="clear"
                        label={i18n.t(`${i18nPrefix}.components.button.cancel`)}
                        onClick={() => toggleEdit(false)}
                        disabled={saving}
                    />
                </span>
            );
        } else {
            return (
                <Button
                    icon="edit"
                    label={i18n.t(`${i18nPrefix}.components.button.edit`)}
                    onClick={() => toggleEdit(true)}
                />
            );
        }
    }

    return null;
}

export default PanelButtons;
