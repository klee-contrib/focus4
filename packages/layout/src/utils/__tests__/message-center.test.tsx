import {defaultAppTheme, setupComponentTest} from "@focus4/toolbox/src/__tests__/test-utils";
import {fireEvent, render, screen} from "@testing-library/react";
import {describe, expect, test, vi} from "vitest";

import {messageStore} from "@focus4/core";
import {ThemeProvider} from "@focus4/styling";

import {MessageCenter} from "../message-center";

setupComponentTest();

const snackbar = {
    action: "snackbar-action",
    close: "snackbar-close",
    message: "snackbar-message",
    snackbar: "snackbar",
    "snackbar--error": "snackbar-error",
    "snackbar--success": "snackbar-success",
    "snackbar--warning": "snackbar-warning"
};

describe("MessageCenter", () => {
    test("affiche un message d'erreur avec action", async () => {
        const onClick = vi.fn();
        render(
            <ThemeProvider appTheme={{...defaultAppTheme, snackbar}}>
                <MessageCenter />
            </ThemeProvider>
        );

        messageStore.addErrorMessage({label: "Erreur", action: {label: "Réessayer", onClick}});

        expect((await screen.findByRole("alert")).classList.contains("snackbar-error")).toBe(true);
        expect((await screen.findByText("Erreur")).textContent).toBe("Erreur");
        fireEvent.click(screen.getByRole("button", {name: "Réessayer"}));
        expect(onClick).toHaveBeenCalledOnce();
    });

    test("affiche les messages suivants après fermeture", async () => {
        render(
            <ThemeProvider appTheme={{...defaultAppTheme, snackbar}}>
                <MessageCenter />
            </ThemeProvider>
        );

        messageStore.addSuccessMessage("Premier");
        messageStore.addInformationMessage("Second");
        expect((await screen.findByText("Premier")).textContent).toBe("Premier");
        fireEvent.click(screen.getByRole("button"));
        expect((await screen.findByText("Second")).textContent).toBe("Second");
    });
});
