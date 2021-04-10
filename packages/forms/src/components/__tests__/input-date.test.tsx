// Libs
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import {mount, configure} from "enzyme";
import {InputDate} from "../input-date";

configure({adapter: new Adapter()});

const inputTheme = {
    bar: "bar",
    disabled: "disabled",
    errored: "errored",
    filled: "filled",
    fixed: "fixed",
    hidden: "hidden",
    icon: "icon",
    input: "input",
    inputElement: "inputElement",
    label: "label",
    withIcon: "withIcon"
};

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
                theme={inputTheme}
                type="string"
            />
        );
        // Assert
        const input = inputDateComponent.getDOMNode().querySelectorAll("input");
        expect(input).toHaveLength(1);
    });
});

describe("Some date formation", () => {
    it("Formatter", () => {
        // Arrange/Act

        const inputDateComponent = mount(
            <InputDate
                onChange={() => {
                    /* */
                }}
                value={"10/11/2016"}
                inputFormat={"dd/MM/yy"}
                theme={inputTheme}
                type="string"
            />
        );
        // Assert
        expect(inputDateComponent.find("input").props().value).toBe("10/11/20");
    });

    it("Invalid input day", () => {
        // Arrange/Act

        const inputDateComponent = mount(
            <InputDate
                onChange={() => {
                    /* */
                }}
                value={"df/11/2016"}
                inputFormat={"dd/MM/yyyy"}
                theme={inputTheme}
                type="string"
            />
        );
        // Assert
        expect(inputDateComponent.find("input").props().value).toBe("__/11/2016");
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
    //             theme={inputTheme}
    //         />
    //     );
    //     // Assert
    //     expect(inputDateComponent.find("input").props().value).toBe("11/__/2016");
    // });

    it("Invalid input all", () => {
        // Arrange/Act

        const inputDateComponent = mount(
            <InputDate
                onChange={() => {
                    /* */
                }}
                value={"sddqsdqsdq"}
                inputFormat={"dd/MM/yyyy"}
                theme={inputTheme}
                type="string"
            />
        );
        // Assert
        expect(inputDateComponent.find("input").props().value).toBe("");
    });
});
