import {take} from "es-toolkit";
import {fileTypeFromBlob} from "file-type";
import i18next from "i18next";
import {useCallback, useRef, useState} from "react";

import {messageStore} from "@focus4/core";
import {CSSProp, useTheme} from "@focus4/styling";
import {FontIcon, IconButton} from "@focus4/toolbox";

import inputFileCss, {InputFileCss} from "./__style__/input-file.css";
export {inputFileCss, InputFileCss};

type InputFileValue<T extends number> = T extends 1 ? File : File[];

/** Props du InputFile. */
export interface InputFileProps<T extends number = number> {
    /** Types de fichiers autorisés.  */
    accept?: string;
    /** Erreur à afficher sous le champ. */
    error?: string;
    /** Préfixe i18n pour le texte et les icônes. Par défaut : "focus". */
    i18nPrefix?: string;
    /** Id de l'input HTML. */
    id?: string;
    /** Nombre maximum de fichiers acceptés en upload. S'il vaut 1, alors cet input sera en pour un champ simple, sinon pour un champ multiple. */
    maxFiles?: T;
    /** Nom de l'input HTML. */
    name?: string;
    /** Appelé avec le (si `maxFiles` == 1) ou les fichier(s) sélectionnés. */
    onChange?: (file?: InputFileValue<T>) => void;
    /** Contrôle l'affichage du texte en dessous du champ, quelque soit la valeur de `errir` ou `maxFiles`. Par défaut : "always". */
    showSupportingText?: "always" | "auto" | "never";
    /** "tabindex" pour l'élément HTML. */
    tabIndex?: number;
    /** CSS. */
    theme?: CSSProp<InputFileCss>;
    /** Fichier unique (si `maxFiles` == 1), ou liste de fichiers sélectionnés. */
    value?: InputFileValue<T>;
}

/**
 * Composant pour gérer l'upload d'un ou plusieurs fichiers.
 */
export function InputFile<T extends number = number>({
    accept,
    error,
    i18nPrefix = "focus",
    onChange,
    id = "input-file",
    maxFiles = Infinity as T,
    name = "input-file",
    showSupportingText = "always",
    tabIndex = 0,
    value,
    theme: pTheme
}: InputFileProps<T>) {
    const theme = useTheme("inputFile", inputFileCss, pTheme);
    const [files, setFiles] = useState(getFiles(value));
    const [dragOver, setDragOver] = useState(false);

    const inputRef = useRef<HTMLInputElement | null>(null);

    const addFiles = useCallback(
        async function addFiles(fileList: FileList) {
            let newFiles = [...files];
            for (const file of Array.from(fileList)) {
                if (files.some(f => f.name === file.name)) {
                    messageStore.addErrorMessage(i18next.t(`${i18nPrefix}.file.existing`, {file: file.name}));
                } else {
                    if (accept) {
                        const acceptedTypes = accept.split(",");
                        const type = await fileTypeFromBlob(file);
                        if (
                            !acceptedTypes.some(at =>
                                at.includes("/")
                                    ? at.includes("*")
                                        ? at.split("/")[0] === type?.mime.split("/")[0]
                                        : at === type?.mime
                                    : `.${type?.ext}` === at
                            )
                        ) {
                            messageStore.addErrorMessage(i18next.t(`${i18nPrefix}.file.invalid`, {file: file.name}));
                            continue;
                        }
                    }

                    newFiles.push(file);
                }
            }

            if (newFiles.length > files.length) {
                newFiles = take(newFiles, maxFiles);
                onChange?.((maxFiles === 1 ? newFiles[0] : newFiles) as InputFileValue<T>);
                setFiles(newFiles);
            }
        },
        [accept, files, i18nPrefix, maxFiles]
    );

    return (
        <div className={theme.field({error: !!error})}>
            <label
                className={theme.container({disabled: files.length >= maxFiles, dragOver})}
                htmlFor={id}
                onDragEnter={() => setDragOver(true)}
                onDragLeave={() => setDragOver(false)}
                onDragOver={e => {
                    e.preventDefault();
                    setDragOver(true);
                }}
                onDrop={e => {
                    e.preventDefault();
                    setDragOver(false);
                    addFiles(e.dataTransfer.files);
                }}
                onKeyDown={e => {
                    if (e.currentTarget === e.target && e.key === "Enter") {
                        inputRef.current?.click();
                    }
                }}
                tabIndex={files.length >= maxFiles ? -1 : tabIndex}
            >
                {files.length < maxFiles ? (
                    <span className={theme.text()}>
                        <FontIcon icon={{i18nKey: `${i18nPrefix}.icons.file.upload`}} />
                        <span>{i18next.t(`${i18nPrefix}.file.upload`)}</span>
                    </span>
                ) : null}
                {getFiles(files).map(f => (
                    <span key={f.name} className={theme.file()}>
                        <span>
                            <FontIcon icon={{i18nKey: `${i18nPrefix}.icons.file.line`}} />
                            <span>{f.name}</span>
                        </span>
                        <IconButton
                            icon={{i18nKey: `${i18nPrefix}.icons.file.delete`}}
                            onClick={e => {
                                e.preventDefault();
                                e.stopPropagation();
                                const newFiles = files.filter(ef => ef.name !== f.name);
                                setFiles(newFiles);
                                onChange?.((maxFiles === 1 ? newFiles[0] : newFiles) as InputFileValue<T>);
                            }}
                        />
                    </span>
                ))}
                <input
                    ref={inputRef}
                    accept={accept}
                    aria-errormessage={error ? `${id}-st` : undefined}
                    aria-invalid={error ? true : undefined}
                    className={theme.input()}
                    disabled={files.length >= maxFiles}
                    id={id}
                    multiple={maxFiles > 1}
                    name={name}
                    onChange={e => {
                        const file = (e.target as HTMLInputElement).files;
                        if (file) {
                            addFiles(file);
                            (e.target as HTMLInputElement).value = "";
                        }
                    }}
                    type="file"
                />
            </label>
            {showSupportingText === "always" ||
            (showSupportingText === "auto" && (!!error || (maxFiles !== Infinity && maxFiles > 1))) ? (
                <div className={theme.supportingText()}>
                    <div id={`${id}-st`}>{error}</div>
                    {maxFiles !== Infinity && maxFiles > 1 ? (
                        <div>
                            {files.length ?? 0}/{maxFiles}
                        </div>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}

function getFiles<T extends number>(file?: InputFileValue<T>): File[] {
    if (!file) {
        return [];
    } else if (!Array.isArray(file)) {
        return [file];
    } else {
        return file;
    }
}
