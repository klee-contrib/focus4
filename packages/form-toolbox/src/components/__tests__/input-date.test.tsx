import {fireEvent, render, screen} from "@testing-library/react";
import {describe, expect, test, vi} from "vitest";
import z from "zod";

import {setupComponentTest} from "../../__tests__/test-utils";
import {InputDate} from "../input-date";

const inputDateTheme = {
    input: "inputDate-input",
    calendar: "inputDate-calendar"
};

const textFieldTheme = {
    input: "textField-input"
};

describe("InputDate component", () => {
    setupComponentTest();

    test("render un input", () => {
        render(
            <InputDate
                inputProps={{theme: textFieldTheme}}
                onChange={() => undefined}
                schema={z.iso.date()}
                theme={inputDateTheme}
                value={undefined}
            />
        );

        expect(screen.getByRole("textbox")).toBeTruthy();
    });

    test("formatte une valeur ISO initiale", () => {
        render(
            <InputDate
                inputFormat="dd/MM/yyyy"
                inputProps={{theme: textFieldTheme}}
                onChange={() => undefined}
                schema={z.iso.date()}
                theme={inputDateTheme}
                value="2024-10-24"
            />
        );

        expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe("24/10/2024");
    });

    test("réinitialise un texte non ISO à vide", () => {
        render(
            <InputDate
                inputFormat="dd/MM/yyyy"
                inputProps={{theme: textFieldTheme}}
                onChange={() => undefined}
                schema={z.iso.date()}
                theme={inputDateTheme}
                value="sddqsdqsdq"
            />
        );

        expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe("");
    });

    test("saisie complète commit en date-only", () => {
        const onChange = vi.fn();
        render(
            <InputDate
                inputFormat="dd/MM/yyyy"
                inputProps={{theme: textFieldTheme}}
                onChange={onChange}
                schema={z.iso.date()}
                theme={inputDateTheme}
                value={undefined}
            />
        );

        fireEvent.change(screen.getByRole("textbox"), {target: {value: "24/10/2024"}});

        expect(onChange).toHaveBeenCalledWith("2024-10-24");
    });

    test("saisie incomplète puis Enter commit la valeur saisie", () => {
        const onChange = vi.fn();
        render(
            <InputDate
                inputFormat="dd/MM/yyyy"
                inputProps={{theme: textFieldTheme}}
                onChange={onChange}
                schema={z.iso.date()}
                theme={inputDateTheme}
                value={undefined}
            />
        );

        fireEvent.change(screen.getByRole("textbox"), {target: {value: "24/10/20"}});
        expect(onChange).not.toHaveBeenCalled();

        fireEvent.keyDown(screen.getByRole("textbox"), {key: "Enter"});

        expect(onChange).toHaveBeenCalledWith("24/10/20");
    });

    test("blur externe commit un texte invalide", () => {
        const onChange = vi.fn();
        render(
            <InputDate
                inputFormat="dd/MM/yyyy"
                inputProps={{theme: textFieldTheme}}
                onChange={onChange}
                schema={z.iso.date()}
                theme={inputDateTheme}
                value={undefined}
            />
        );

        const input = screen.getByRole("textbox");
        fireEvent.change(input, {target: {value: "abc"}});
        fireEvent.blur(input, {relatedTarget: null});

        expect(onChange).toHaveBeenCalledWith("abc");
    });

    test("Enter sans saisie commit undefined", () => {
        const onChange = vi.fn();
        render(
            <InputDate
                inputFormat="dd/MM/yyyy"
                inputProps={{theme: textFieldTheme}}
                onChange={onChange}
                schema={z.iso.date()}
                theme={inputDateTheme}
                value={undefined}
            />
        );

        fireEvent.keyDown(screen.getByRole("textbox"), {key: "Enter"});

        expect(onChange).toHaveBeenCalledWith(undefined);
    });

    test("trimme les espaces avant commit", () => {
        const onChange = vi.fn();
        render(
            <InputDate
                inputFormat="dd/MM/yyyy"
                inputProps={{theme: textFieldTheme}}
                onChange={onChange}
                schema={z.iso.date()}
                theme={inputDateTheme}
                value={undefined}
            />
        );

        const input = screen.getByRole("textbox");
        fireEvent.change(input, {target: {value: "   "}});
        fireEvent.blur(input, {relatedTarget: null});

        expect(onChange).toHaveBeenCalledWith(undefined);
    });

    test("ISOStringFormat utc-midnight retourne un ISO UTC", () => {
        const onChange = vi.fn();
        render(
            <InputDate
                ISOStringFormat="utc-midnight"
                inputProps={{theme: textFieldTheme}}
                onChange={onChange}
                schema={z.iso.datetime()}
                theme={inputDateTheme}
                value={undefined}
            />
        );

        fireEvent.change(screen.getByRole("textbox"), {target: {value: "24/10/2024"}});
        fireEvent.keyDown(screen.getByRole("textbox"), {key: "Enter"});

        const lastCall = onChange.mock.calls.at(-1)?.[0] as string | undefined;
        expect(lastCall).toMatch(/Z$/u);
    });

    test("ISOStringFormat local-midnight retourne un ISO datetime", () => {
        const onChange = vi.fn();
        render(
            <InputDate
                ISOStringFormat="local-midnight"
                inputProps={{theme: textFieldTheme}}
                onChange={onChange}
                schema={z.iso.datetime()}
                theme={inputDateTheme}
                value={undefined}
            />
        );

        fireEvent.change(screen.getByRole("textbox"), {target: {value: "24/10/2024"}});
        fireEvent.keyDown(screen.getByRole("textbox"), {key: "Enter"});

        const lastCall = onChange.mock.calls.at(-1)?.[0] as string | undefined;
        expect(lastCall).toContain("T");
    });

    test("ignore les placeholders '_' pour le déclenchement du commit", () => {
        const onChange = vi.fn();
        render(
            <InputDate
                inputFormat="dd/MM/yyyy"
                inputProps={{theme: textFieldTheme}}
                onChange={onChange}
                schema={z.iso.date()}
                theme={inputDateTheme}
                value={undefined}
            />
        );

        fireEvent.change(screen.getByRole("textbox"), {target: {value: "24/10/20__"}});

        expect(onChange).not.toHaveBeenCalled();
    });
});
