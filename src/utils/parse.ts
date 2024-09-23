import { Data } from "./types";
import { mapLingvaCode } from "./languages/language";
import { TranslationInfo } from "./interfaces";

// Helper types
type DefinitionEntry = {
    definition: string;
    example: string;
    field?: string;
    synonyms: string[];
};

type SynonymList = [string][];
type SynonymItem = [string];

// GenericObject definition
type GenericObject<T> = { [k: string]: T } | Array<T>;

const isObject = (
    value: unknown
): value is GenericObject<object | string | number> =>
    typeof value === "object" && value !== null;

// Main Functions
export const detected = ([
    source,
    target,
    detected,
    extra,
]: Data): TranslationInfo["detectedSource"] => {
    const code =
        source?.[2] ??
        target?.[3] ??
        detected ??
        extra?.[8] ??
        extra?.[5]?.[0]?.[0]?.[3];
    return code ? mapLingvaCode<"source">(code) : undefined;
};

export const typo = ([source]: Data): TranslationInfo["typo"] =>
    source?.[1]?.[0]?.[4] ?? undefined;

export const pronunciation = {
    query: ([source]: Data): TranslationInfo["pronunciation"]["query"] =>
        source?.[0] ?? undefined,
    translation: ([
        ,
        target,
    ]: Data): TranslationInfo["pronunciation"]["translation"] =>
        target?.[0]?.[0]?.[1] ?? undefined,
};

export const list = {
    definitions: ({ 3: extra }: Data): TranslationInfo["definitions"] =>
        extra?.[1]?.[0]?.map(([type, defList]: [string, any[]]) => ({
            type,
            list:
                defList?.map(
                    ({
                        0: definition,
                        1: example,
                        4: fieldWrapper,
                        5: synList,
                    }: {
                        0: string;
                        1: string;
                        4?: string;
                        5?: SynonymList;
                    }): DefinitionEntry => ({
                        definition,
                        example,
                        field: fieldWrapper?.[0]?.[0],
                        synonyms:
                            synList
                                ?.flatMap((synItem: SynonymItem) =>
                                    synItem ?? []
                                )
                                ?.filter((item): item is string => !!item) ??
                            [],
                    })
                ) ?? [],
        })) ?? [],
    examples: ({ 3: extra }: Data): TranslationInfo["examples"] =>
        extra?.[2]?.[0]?.map(([, item]: [null, string]) => item) ?? [],
    similar: ({ 3: extra }: Data): TranslationInfo["similar"] =>
        extra?.[3]?.[0] ?? [],
    extraTranslations: ({
        3: extra,
    }: Data): TranslationInfo["extraTranslations"] =>
        extra?.[5]?.[0]?.map(
            ([type, transList]) => ({
                type,
                list:
                    transList?.map(([word, article, meanings, frequency]) => ({
                        word,
                        article: article ?? undefined,
                        meanings,
                        frequency: 4 - frequency, // Reverse the frequency ranking
                    })) ?? [],
            })
        ) ?? [],
};

// Utility function to remove undefined fields
export const undefinedFields = <T extends GenericObject<V | undefined>, V>(
    obj: T
): T => {
    if (Array.isArray(obj)) {
        return obj
            .filter((item): item is V => !!item)
            .map((item) =>
                isObject(item) ? undefinedFields(item) : item
            ) as T;
    }

    const entries = Object.entries(obj)
        .filter((entry): entry is [string, V] => !!entry[1])
        .map(([key, value]) => [
            key,
            isObject(value) ? undefinedFields(value) : value,
        ]);
    return Object.fromEntries(entries);
};
