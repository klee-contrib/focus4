import {cleanup, render, screen} from "@testing-library/react";
import {ReactNode} from "react";
import {afterEach, describe, expect, test} from "vitest";

import {ThemeProvider, useTheme} from "..";

function ThemeConsumer({local}: {local?: string}) {
    const theme = useTheme("button", {button: local ?? "local"});
    return <output>{theme.button()}</output>;
}

function renderTheme(children: ReactNode, appTheme: Record<string, object>) {
    return render(<ThemeProvider appTheme={appTheme}>{children}</ThemeProvider>);
}

describe("ThemeProvider et useTheme", () => {
    afterEach(cleanup);

    test("fusionne le thème du parent avec celui du composant", () => {
        renderTheme(<ThemeConsumer />, {button: {button: "parent"}});

        expect(screen.getByText("parent local").tagName).toBe("OUTPUT");
    });

    test("fusionne les thèmes imbriqués et conserve les composants non modifiés", () => {
        renderTheme(
            <ThemeProvider appTheme={{button: {button: "child"}, input: {input: "input"}}}>
                <ThemeConsumer local="local" />
            </ThemeProvider>,
            {button: {button: "parent"}, checkbox: {checkbox: "checkbox"}}
        );

        expect(screen.getByText("parent child local").tagName).toBe("OUTPUT");
    });

    test("utilise le thème local lorsqu'aucun thème global n'est fourni", () => {
        renderTheme(<ThemeConsumer />, {});

        expect(screen.getByText("local").tagName).toBe("OUTPUT");
    });
});
