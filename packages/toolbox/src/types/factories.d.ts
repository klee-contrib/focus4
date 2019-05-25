import {AvatarProps} from "react-toolbox/lib/avatar/Avatar";
import {ChipProps} from "react-toolbox/lib/chip";
import {FontIconProps} from "react-toolbox/lib/font_icon";
import {InputProps} from "react-toolbox/lib/input";

declare module "react-toolbox/lib/autocomplete/Autocomplete" {
    export function autocompleteFactory(
        Chip: React.ComponentType<ChipProps>,
        Input: React.ComponentType<InputProps>
    ): typeof Autocomplete;
}
declare module "react-toolbox/lib/avatar/Avatar" {
    export function avatarFactory(FontIcon: React.ComponentType<FontIconProps>): typeof Avatar;
}
declare module "react-toolbox/lib/chip/Chip" {
    export function chipFactory(Avatar: React.ComponentType<AvatarProps>): typeof Chip;
}
declare module "react-toolbox/lib/input/Input" {
    export function inputFactory(FontIcon: React.ComponentType<FontIconProps>): typeof Input;
}
