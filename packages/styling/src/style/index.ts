/* tslint:disable */

const {kebabCase} = require("lodash");

module.exports = function css(va: Record<string, string>) {
    return Object.keys(va)
        .map(k => ({[kebabCase(k)]: va[k]}))
        .reduce((a, b) => Object.assign(a, b), {});
};
