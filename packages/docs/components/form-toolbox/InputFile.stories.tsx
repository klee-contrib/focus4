import type {Meta, StoryObj} from "@storybook/react";

import {InputFile} from "@focus4/form-toolbox";

import {InputFileMeta} from "./metas/input-file";

export default {
    ...InputFileMeta,
    title: "Composants/@focus4∕form-toolbox/InputFile",
    tags: ["autodocs"],
    args: {accept: "image/*"}
} as Meta<typeof InputFile>;

export const Showcase: StoryObj<typeof InputFile> = {
    render(props) {
        return <InputFile {...props} />;
    }
};
