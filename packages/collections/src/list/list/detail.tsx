import {motion} from "motion/react";
import {ComponentType} from "react";

import {getDefaultTransition, ToBem} from "@focus4/styling";
import {IconButton} from "@focus4/toolbox";

import {ListCss} from "../__style__/list.css";

/** Props de base d'un composant de détail. */
export interface DetailProps<T> {
    /** Handler de fermeture du détail. */
    closeDetail: () => void;
    /** Elément de liste sélectionné. */
    data: T;
}

/** Props du composant wrapper du détail. */
export interface DetailWrapperProps<T> {
    displayedIdx: number;
    mode: "list" | "mosaic";
    mosaic: {width: number; height: number};
    isAddItemShown: boolean;
    byLine: number;
    DetailComponent: ComponentType<DetailProps<T>>;
    closeDetail: () => void;
    item: T;
    theme: ToBem<ListCss>;
}

/** Wrapper pour le composant de détail. */
export function DetailWrapper<T>({
    displayedIdx,
    mode,
    mosaic,
    isAddItemShown,
    byLine,
    DetailComponent,
    closeDetail,
    item,
    theme
}: DetailWrapperProps<T>) {
    return (
        <motion.li
            animate={{overflow: "hidden", height: "auto", transitionEnd: {overflow: "visible"}}}
            className={theme.detailWrapper()}
            exit={{overflow: "hidden", height: 0}}
            initial={{overflow: "hidden", height: 0}}
            transition={getDefaultTransition()}
        >
            {/* Le calcul de la position du triangle en mosaïque n'est pas forcément évident...
                        et il suppose qu'on ne touche pas au marges par défaut entre les mosaïques. */}
            <div
                className={theme.triangle()}
                style={
                    displayedIdx === undefined && mode === "mosaic"
                        ? {left: -1000}
                        : mode === "mosaic"
                        ? {
                              left:
                                  mosaic.width / 2 -
                                  8.25 +
                                  ((displayedIdx + (isAddItemShown ? 1 : 0)) % byLine) * (mosaic.width + 10)
                          }
                        : {}
                }
            />
            <div className={theme.detail()}>
                <IconButton icon="clear" onClick={closeDetail} />
                <DetailComponent closeDetail={closeDetail} data={item} />
            </div>
        </motion.li>
    );
}
