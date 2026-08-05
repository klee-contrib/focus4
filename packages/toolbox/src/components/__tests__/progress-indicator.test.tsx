import {render} from "@testing-library/react";
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
        const {container} = render(<CircularProgressIndicator theme={progressTheme} value={30} />);

        const bar = container.querySelector("[role='progressbar']")!;
        expect(bar.getAttribute("aria-valuenow")).toBe("30");
        expect(bar.getAttribute("aria-valuemin")).toBe("0");
        expect(bar.getAttribute("aria-valuemax")).toBe("100");
    });

    test("CircularProgressIndicator: clamp la valeur entre min et max", () => {
        const {container} = render(<CircularProgressIndicator max={50} min={10} theme={progressTheme} value={999} />);

        expect(container.querySelector("[role='progressbar']")?.getAttribute("aria-valuenow")).toBe("50");
    });

    test("CircularProgressIndicator: indeterminate ne plante pas (animate stubbé)", () => {
        const {container} = render(<CircularProgressIndicator indeterminate theme={progressTheme} />);

        expect(container.querySelector("[role='progressbar']")).not.toBeNull();
    });

    test("LinearProgressIndicator: rôle 'progressbar' avec aria-valuenow", () => {
        const {container} = render(<LinearProgressIndicator theme={progressTheme} value={75} />);

        expect(container.querySelector("[role='progressbar']")?.getAttribute("aria-valuenow")).toBe("75");
    });

    test("LinearProgressIndicator: indeterminate ne plante pas (animate stubbé)", () => {
        const {container} = render(<LinearProgressIndicator indeterminate theme={progressTheme} />);

        expect(container.querySelector("[role='progressbar']")).not.toBeNull();
    });
});
