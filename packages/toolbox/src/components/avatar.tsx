import * as React from "react";
import {Avatar as AvatarType, avatarFactory, AvatarProps, AvatarTheme} from "react-toolbox/lib/avatar/Avatar";
import {AVATAR} from "react-toolbox/lib/identifiers";

import {useTheme} from "@focus4/styling";
import rtAvatarTheme from "react-toolbox/components/avatar/theme.css";
const avatarTheme: AvatarTheme = rtAvatarTheme;
export {avatarTheme};

import {FontIcon} from "./font-icon";

const RTAvatar = avatarFactory(FontIcon);
export const Avatar: React.ForwardRefExoticComponent<AvatarProps & React.RefAttributes<AvatarType>> = React.forwardRef(
    (props, ref) => {
        const theme = useTheme(AVATAR, avatarTheme, props.theme);
        return <RTAvatar ref={ref} {...props} theme={theme} />;
    }
);

export {AvatarProps, AvatarTheme};
