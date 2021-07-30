import path from "path";

import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import {merge} from "lodash";
import {Compiler, optimize, RuleSetRule, WebpackOptionsNormalized, WebpackPluginInstance} from "webpack";

const postcss = {
    loader: "postcss-loader",
    options: {postcssOptions: {plugins: ["postcss-import", "postcss-nesting"]}}
};

/**
 * Initialise une config webpack.
 * @param config Config principale.
 * @param overrideConfig Config webpack qui sera mergée avec la config principale.
 * @returns Config webpack
 */
export function webpackConfigWithDefaults(
    {
        cssModulesPath,
        entry,
        outputDir,
        rootDir,
        plugins = [],
        rules = [],
        styleLoader
    }: {
        /** CSS à compiler comme modules CSS, s'il y en a. */
        cssModulesPath?: string;
        /** Entrée de la compilation */
        entry: string;
        /** Dossier cible. */
        outputDir: string;
        /** Plugins additionnels. Inclus par défaut : "ForkTsCheckerWebpackPlugin" et "LimitChunkCountPlugin". */
        plugins?: (((this: Compiler, compiler: Compiler) => void) | WebpackPluginInstance)[];
        /** __dirname */
        rootDir: string;
        /** Règles additionnelle. Inclus par défaut : tsx?, css et (png|jpg|gif|svg|woff2?|ttf|eot). */
        rules?: RuleSetRule[];
        /** Loader à utiliser pour le CSS (à priori style-loader ou mini-css-extract-plugin) */
        styleLoader: string;
    },
    overrideConfig?: WebpackOptionsNormalized
) {
    return merge(
        {
            stats: {modules: false},
            performance: {hints: false},
            entry,
            output: {
                path: path.resolve(rootDir, outputDir),
                publicPath: "./",
                filename: "app.js",
                assetModuleFilename: "[name][ext]"
            },
            resolve: {
                extensions: [".js", ".ts", ".tsx"]
            },
            plugins: [new ForkTsCheckerWebpackPlugin(), new optimize.LimitChunkCountPlugin({maxChunks: 1}), ...plugins],
            target: "web",
            module: {
                rules: [
                    {
                        test: /\.js$/,
                        enforce: "pre",
                        use: ["source-map-loader"]
                    },
                    {
                        test: /\.tsx?$/,
                        include: [path.resolve(rootDir, entry)],
                        use: [
                            {
                                loader: "ts-loader",
                                options: {
                                    transpileOnly: true
                                }
                            }
                        ]
                    },
                    {
                        test: /\.css$/,
                        exclude: cssModulesPath ? [path.resolve(rootDir, cssModulesPath)] : undefined,
                        use: [styleLoader, "css-loader", postcss]
                    },
                    {
                        test: /\.css$/,
                        include: cssModulesPath ? [path.resolve(rootDir, cssModulesPath)] : [],
                        use: [
                            styleLoader,
                            {
                                loader: "css-loader",
                                options: {
                                    modules: {
                                        localIdentName: "[name]_[local]__[hash:base64:5]"
                                    }
                                }
                            },
                            postcss
                        ]
                    },
                    {
                        test: /\.(png|jpg|gif|svg|woff2?|ttf|eot)$/,
                        type: "asset"
                    },
                    ...rules
                ]
            }
        },
        overrideConfig
    );
}
