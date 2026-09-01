import {fireEvent, screen} from "@testing-library/react";
import {describe, expect, test, vi} from "vitest";

import {renderWithTheme, setupComponentTest} from "../../__tests__/test-utils";
import {Snackbar} from "../snackbar";

const snackbarTheme = {
    action: "snackbar-action",
    close: "snackbar-close",
    message: "snackbar-message",
    snackbar: "snackbar",
    "snackbar--error": "snackbar-error",
    "snackbar--success": "snackbar-success",
    "snackbar--warning": "snackbar-warning"
};

describe("Snackbar component", () => {
    setupComponentTest();

    test("Rend un message de statut quand elle est active", () => {
        renderWithTheme(<Snackbar active message="Opération terminée" theme={snackbarTheme} />);

        expect(screen.getByRole("status").textContent).toBe("Opération terminée");
    });

    test.each([
        ["warning", "Attention", "snackbar-warning"],
        ["error", "Erreur", "snackbar-error"]
    ] as const)("Rend une alerte pour le niveau %s", (level, message, className) => {
        renderWithTheme(<Snackbar active level={level} message={message} theme={snackbarTheme} />);

        const alert = screen.getByRole("alert");
        expect(alert.ariaLive).toBe("assertive");
        expect(alert.classList.contains(className)).toBe(true);
        expect(alert.textContent).toBe(message);
    });

    test("Déclenche l'action puis la fermeture", () => {
        const action = vi.fn();
        const close = vi.fn();
        renderWithTheme(
            <Snackbar
                active
                action={{label: "Annuler", onClick: action}}
                close={close}
                message="Suppression"
                theme={snackbarTheme}
            />
        );

        fireEvent.click(screen.getByRole("button", {name: "Annuler"}));

        expect(action).toHaveBeenCalledTimes(1);
        expect(close).toHaveBeenCalledTimes(1);
    });
});
