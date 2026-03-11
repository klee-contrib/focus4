import {motion} from "motion/react";
import {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";

import {Button} from "@focus4/toolbox";

/** Props des boutons du Panel. */
export interface PanelButtonsProps {
    /** Si le panel qui le contient est repliable. */
    collapsible?: boolean;
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

/**
 * Boutons par défaut pour un `Panel`.
 *
 * Affiche un bouton "Modifier" en consultation, et 2 boutons "Enregistrer" et "Annuler" en édition.
 *
 * Les boutons seront désactivés pendant le chargement.
 */
export function PanelButtons({
    collapsible = false,
    editing,
    i18nPrefix = "focus",
    loading,
    onClickCancel,
    onClickEdit,
    save
}: PanelButtonsProps) {
    const {t} = useTranslation();

    const [isInForm, setIsInForm] = useState(false);
    const [ref, setRef] = useState<HTMLSpanElement | null>(null);

    /* On essaie de savoir si ces boutons sont inclus dans un formulaire. */
    useEffect(() => {
        let parentNode: HTMLElement | null = ref;
        while (parentNode && parentNode.tagName !== "FORM") {
            parentNode = parentNode.parentElement;
        }
        setIsInForm(!!parentNode);
    }, [ref]);

    if (onClickCancel && onClickEdit) {
        return (
            <motion.span ref={setRef} variants={collapsible ? {opened: {opacity: 1}, closed: {opacity: 0}} : {}}>
                {editing ? (
                    <>
                        <Button
                            color="primary"
                            disabled={loading}
                            icon={{i18nKey: `${i18nPrefix}.icons.button.save`}}
                            label={t(`${i18nPrefix}.button.save`)}
                            onClick={!isInForm ? save : undefined}
                            type="submit"
                        />
                        <Button
                            key="main"
                            disabled={loading}
                            icon={{i18nKey: `${i18nPrefix}.icons.button.cancel`}}
                            label={t(`${i18nPrefix}.button.cancel`)}
                            onClick={onClickCancel}
                        />
                    </>
                ) : (
                    <Button
                        key="main"
                        disabled={loading}
                        icon={{i18nKey: `${i18nPrefix}.icons.button.edit`}}
                        label={t(`${i18nPrefix}.button.edit`)}
                        onClick={onClickEdit}
                    />
                )}
            </motion.span>
        );
    } else {
        return null;
    }
}
