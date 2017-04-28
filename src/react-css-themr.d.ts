import "react-css-themr";
declare module "react-css-themr" {
	export function themr(
		identifier: string,
		defaultTheme?: {},
		options?: IThemrOptions
	): <TFunction extends React.StatelessComponent<P> | React.ComponentClass<P>>(component: TFunction) => TFunction;
}