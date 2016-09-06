import {v4} from "node-uuid";
import * as React from "react";

/** Légère surcouche au composant React pour enlever le state et ajouter un identifier. */
export abstract class Component<P> extends React.Component<P, {}> {
    identifier = v4();
}
