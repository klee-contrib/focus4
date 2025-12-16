// Libs
import {render} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import z from "zod";

import {InputDate} from "../input-date";

const props = {
    theme: {
        calendar: "calendar",
        input: "input"
    }
};

// Components
describe("InputDate component", () => {
    it("with input", () => {
        // Arrange/Act
        const {container} = render(
            <InputDate
                onChange={() => {
                    /* */
                }}
                value={undefined}
                schema={z.iso.date()}
                {...props}
            />
        );
        // Assert
        expect(container.querySelectorAll("input")).toHaveLength(1);
    });
});

describe("Some date formation", () => {
    it("Formatter", () => {
        // Arrange/Act

        const {container} = render(
            <InputDate
                onChange={() => {
                    /* */
                }}
                value="10/11/2016"
                inputFormat="dd/MM/yy"
                schema={z.iso.date()}
                {...props}
            />
        );
        // Assert
        expect(container.querySelector("input")?.value).toBe("10/11/20");
    });

    it("Invalid input day", () => {
        // Arrange/Act

        const {container} = render(
            <InputDate
                onChange={() => {
                    /* */
                }}
                value="df/11/2016"
                inputFormat="dd/MM/yyyy"
                schema={z.iso.date()}
                {...props}
            />
        );
        // Assert
        expect(container.querySelector("input")?.value).toBe("__/11/2016");
    });

    // it("Invalid input month", () => {
    //     // Arrange/Act

    //     const inputDateComponent = mount(
    //         <InputDate
    //             onChange={() => {
    //                 /* */
    //             }}
    //             value={"11/15/2016"}
    //             inputFormat={"dd/MM/yyyy"}
    //             {...props}
    //         />
    //     );
    //     // Assert
    //     expect(inputDateComponent.find("input").props().value).toBe("11/__/2016");
    // });

    it("Invalid input all", () => {
        // Arrange/Act

        const {container} = render(
            <InputDate
                onChange={() => {
                    /* */
                }}
                value="sddqsdqsdq"
                inputFormat="dd/MM/yyyy"
                schema={z.iso.date()}
                {...props}
            />
        );
        // Assert
        expect(container.querySelector("input")?.value).toBe("");
    });
});
