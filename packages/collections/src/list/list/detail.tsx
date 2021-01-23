import {ComponentType, forwardRef, Ref} from "react";
import posed from "react-pose";

import {defaultPose, ToBem} from "@focus4/styling";
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
export interface DetailWrapperProps {
    displayedIdx: number;
    mode: "list" | "mosaic";
    mosaic: {width: number; height: number};
    isAddItemShown: boolean;
    byLine: number;
    DetailComponent: ComponentType<DetailProps<{}>>;
    closeDetail: () => void;
    item: {};
    theme: ToBem<ListCss>;
}

/** Wrapper pour le composant de détail. */
export const DetailWrapper: ComponentType<DetailWrapperProps> = posed(
    forwardRef(
        (
            {
                displayedIdx,
                mode,
                mosaic,
                isAddItemShown,
                byLine,
                DetailComponent,
                closeDetail,
                item,
                theme
            }: DetailWrapperProps,
            ref: Ref<HTMLLIElement>
        ) => (
            <li ref={ref} className={theme.detailWrapper()}>
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
                                      ((displayedIdx! + (isAddItemShown ? 1 : 0)) % byLine) * (mosaic.width + 10)
                              }
                            : {}
                    }
                />
                <div className={theme.detail()}>
                    <IconButton icon="clear" onClick={closeDetail} />
                    <DetailComponent data={item} closeDetail={closeDetail} />
                </div>
            </li>
        )
    )
)({
    enter: {
        applyAtStart: {overflow: "hidden"},
        applyAtEnd: {overflow: "visible"},
        height: "auto",
        ...defaultPose
    },
    exit: {
        applyAtStart: {overflow: "hidden"},
        applyAtEnd: {overflow: "visible"},
        height: 0,
        ...defaultPose
    }
});
