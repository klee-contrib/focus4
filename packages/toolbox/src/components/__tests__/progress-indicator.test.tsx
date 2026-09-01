import {render, screen} from "@testing-library/react";
import {describe, expect, test} from "vitest";

import {setupComponentTest} from "../../__tests__/test-utils";
import {CircularProgressIndicator, LinearProgressIndicator} from "../progress-indicator";

const progressTheme = {
    circular: "pi-circular",
    indicator: "pi-indicator",
    linear: "pi-linear",
    track: "pi-track"
};

describe("ProgressIndicator components", () => {
    setupComponentTest();

    test("CircularProgressIndicator: rôle 'progressbar' avec aria-valuenow", () => {
        render(<CircularProgressIndicator theme={progressTheme} value={30} />);

        expect(screen.getByRole("progressbar")).toMatchObject({
            ariaValueNow: "30",
            ariaValueMin: "0",
            ariaValueMax: "100"
        });
    });

    test("CircularProgressIndicator: clamp la valeur entre min et max", () => {
        render(<CircularProgressIndicator max={50} min={10} theme={progressTheme} value={999} />);

        expect(screen.getByRole("progressbar")).toMatchObject({
            ariaValueNow: "50",
            ariaValueMin: "10",
            ariaValueMax: "50"
        });
    });

    test("LinearProgressIndicator: rôle 'progressbar' avec aria-valuenow", () => {
        render(<LinearProgressIndicator theme={progressTheme} value={75} />);

        expect(screen.getByRole("progressbar")).toMatchObject({
            ariaValueNow: "75",
            ariaValueMin: "0",
            ariaValueMax: "100"
        });
    });

    test.each([
        ["circulaire", CircularProgressIndicator],
        ["linéaire", LinearProgressIndicator]
    ])("L'indicateur %s indéterminé expose une progression nulle", (_label, Indicator) => {
        render(<Indicator indeterminate theme={progressTheme} />);

        expect(screen.getByRole("progressbar")).toMatchObject({
            ariaValueNow: "0",
            ariaValueMin: "0",
            ariaValueMax: "100"
        });
    });
});
