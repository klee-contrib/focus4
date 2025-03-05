import {InputFile} from "@focus4/forms";

import {InputFileMeta} from "./metas/input-file";

import type {Meta, StoryObj} from "@storybook/react";

export default {
    ...InputFileMeta,
    title: "Composants/@focus4∕forms/InputFile",
    tags: ["autodocs"],
    args: {accept: "image/*"}
} as Meta<typeof InputFile>;

export const Showcase: StoryObj<typeof InputFile> = {
    render(props) {
        return <InputFile {...props} />;
    }
};
