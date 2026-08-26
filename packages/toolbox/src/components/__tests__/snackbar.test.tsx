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

        expect(screen.getByRole("status")).toBeTruthy();
        expect(screen.getByText("Opération terminée")).toBeTruthy();
    });

    test("Rend une alerte pour les niveaux warning et error", () => {
        const {rerender} = renderWithTheme(
            <Snackbar active level="warning" message="Attention" theme={snackbarTheme} />
        );

        expect(screen.getByRole("alert").getAttribute("aria-live")).toBe("assertive");
        expect(screen.getByRole("alert").className).toContain("snackbar-warning");

        rerender(<Snackbar active level="error" message="Erreur" theme={snackbarTheme} />);
        expect(screen.getByRole("alert").className).toContain("snackbar-error");
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
