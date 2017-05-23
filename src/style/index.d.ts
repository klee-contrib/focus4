interface CSSVariables {
    actionBarBackground: string;
    actionBarFacetboxBackground: string;
    actionBarFacetboxTriangleHeight: string;
    actionBarFacetboxTriangleWidth: string;
    actionBarFontWeight: string;
    actionBarHeight: string;
    actionBarMargin: string;
    actionBarPadding: string;
    actionBarSearchIconContent: string;
    actionBarSearchIconFont: string;
    actionBarSearchIconLeft: string;
    actionBarSearchIconTop: string;
    actionBarSearchIconSize: string;
    actionBarSelectionBackground: string;
    actionBarSelectionColor: string;
    actionBarShadow: string;
    actionBarTransition: string;
}

declare function css(variables: CSSVariables): Record<string, string>;
export = css;
