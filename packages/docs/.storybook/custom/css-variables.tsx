import {PureArgsTable, useOf} from "@storybook/addon-docs/blocks";
import {toJS} from "mobx";
import {useLocalObservable, useObserver} from "mobx-react";
import React from "react";

import {useDarkMode} from "./docs-container";

type VariableDefinitions = Record<string, {main: string; dark?: string}>;

export function CssVariables({cssVariables}: {cssVariables?: Record<string, VariableDefinitions>}) {
    const meta = useOf<"meta">("meta");
    const dark = useDarkMode();
    const [ref, setRef] = React.useState<HTMLDivElement | null>(null);
    const state = useLocalObservable(() => ({
        overrides: document.documentElement.style.cssText.split(";").reduce((obj, value) => {
            if (!value) {
                return obj;
            }
            const lol = value.split(":");
            return {...obj, [lol[0].trim()]: lol[1].trim()};
        }, {}) as any
    }));
    const {global, common, local} = (cssVariables ?? meta.preparedMeta.parameters?.cssVariables ?? {}) as Record<
        string,
        VariableDefinitions
    >;

    function getTable(name: string, variables: VariableDefinitions) {
        const rows = variables
            ? Object.keys(variables).reduce((obj, name) => {
                  const value = getComputedStyle(document.documentElement).getPropertyValue(name);
                  const defaultValue = (dark && variables[name].dark) || variables[name].main;

                  let computedDefaultValue = "";
                  if (ref) {
                      ref.style.setProperty("--defaultValue", defaultValue);
                      computedDefaultValue = getComputedStyle(ref).getPropertyValue("--defaultValue");
                  }

                  return {
                      ...obj,
                      [name]: {
                          name,
                          type: {
                              required:
                                  computedDefaultValue.replaceAll(String.raw`0\.`, ".") !==
                                  value.replaceAll(String.raw`0\.`, ".")
                          },
                          table: {type: {summary: value}},
                          defaultValue: {summary: defaultValue},
                          control: {type: "text"}
                      }
                  };
              }, {})
            : {};

        return Object.keys(rows).length ? (
            <>
                <h4>{name}</h4>
                <PureArgsTable
                    args={toJS(state.overrides)}
                    resetArgs={() => {
                        document.documentElement.style.cssText = "";
                        state.overrides = {};
                    }}
                    rows={rows}
                    updateArgs={args => {
                        for (const prop in args) {
                            document.documentElement.style.setProperty(prop, args[prop]);
                            state.overrides[prop] = args[prop];
                        }
                    }}
                />
            </>
        ) : null;
    }

    return useObserver(() => (
        <div ref={setRef}>
            {getTable("Locales", local)}
            {getTable("Partagées (utilisées par le composant)", common)}
            {getTable("Globales (utilisées par le composant)", global)}
        </div>
    ));
}
