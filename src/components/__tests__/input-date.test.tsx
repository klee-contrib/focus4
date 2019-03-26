// Libs
import {mount} from "enzyme";
import * as React from "react";
import {InputDate} from "../input-date";

// Components
describe("InputDate component", () => {
    it("with input", () => {
        // Arrange/Act
        const inputDateComponent = mount(
            <InputDate
                onChange={() => {
                    /* */
                }}
                value={undefined}
            />
        );
        // Assert
        const input = inputDateComponent.getDOMNode().querySelectorAll("input");
        expect(input).toHaveLength(1);
    });
});
