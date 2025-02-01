import classNames from "classnames";
import {AnimatePresence, motion} from "motion/react";
import {useCallback} from "react";
import {createPortal} from "react-dom";

import {CSSProp, getSpringTransition, useTheme} from "@focus4/styling";

import {Button} from "./button";
import {IconButton} from "./icon-button";

import snackbarCss, {SnackbarCss} from "./__style__/snackbar.css";
export {snackbarCss};
export type {SnackbarCss};

export interface SnackbarProps {
    /** Action de la Snackbar. */
    action?: {label: string; onClick: () => void};
    /** Affiche la Snackbar. */
    active: boolean;
    /** Classe CSS pour l'élément racine. */
    className?: string;
    /** Si renseigné, affiche un bouton pour fermer la Snackbar avec ce handler. */
    close?: () => void;
    /** Niveau du message de la Snackbar. */
    level?: "error" | "success" | "warning";
    /** Message à afficher dans la Snackbar. */
    message: string;
    /** Handler appelé à la fermeture de la Snackbar. */
    onClose?: () => void;
    /** CSS. */
    theme?: CSSProp<SnackbarCss>;
}

/**
 * Une snackbar affiche un message court à un utilisateur en bas de l'écran pour le notifier du status d'une action dans l'application.
 *
 * Elle est posée par défaut par le `MessageCenter` du [`Layout`](/docs/mise-en-page-layout--docs).
 *
 * - 4 types de messages : succès, erreur, avertissement ou information
 * - Peut inclure une action.
 */
export function Snackbar({active, action, className, close, level, message, onClose, theme: pTheme}: SnackbarProps) {
    const theme = useTheme("snackbar", snackbarCss, pTheme);

    const handleAction = useCallback(
        function handleAction() {
            action?.onClick();
            close?.();
        },
        [action, close]
    );

    return createPortal(
        <AnimatePresence onExitComplete={onClose}>
            {active ? (
                <motion.div
                    animate={{y: 0}}
                    aria-live={level === "warning" || level === "error" ? "assertive" : "polite"}
                    className={classNames(
                        theme.snackbar({
                            error: level === "error",
                            success: level === "success",
                            warning: level === "warning"
                        }),
                        className
                    )}
                    exit={{y: "100%"}}
                    initial={{y: "100%"}}
                    role={level === "warning" || level === "error" ? "alert" : "status"}
                    transition={{...getSpringTransition(), delay: 0.2}}
                >
                    <span className={theme.message()}>{message}</span>
                    {action ? (
                        <Button className={theme.action()} color="light" label={action.label} onClick={handleAction} />
                    ) : null}
                    {close ? <IconButton className={theme.close()} icon="clear" onClick={close} /> : null}
                </motion.div>
            ) : null}
        </AnimatePresence>,
        document.body
    );
}
