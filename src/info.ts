import * as parse from "./utils/parse";
import {
    Data,
    TranslationInfo,
    Endpoint,
    request,
    mapGoogleCode,
    LangCode,
} from "./utils";
import { AxiosResponse } from "axios";
import { Boilerplate } from './types';

/**
 * Retrieves the full translation information given a pair of languages and a query
 * @param source - The code of the language to translate from
 * @param target - The code of the language to translate to
 * @param query - The text to be translated
 * @returns An element with all the information, as defined in {@link TranslationInfo}
 */
export const getTranslationInfo = async (
    source: LangCode<"source">,
    target: LangCode<"target">,
    query: string
): Promise<TranslationInfo | null> => {
    const parsedSource = mapGoogleCode(source);
    const parsedTarget = mapGoogleCode(target);

    const reqData = JSON.stringify([
        [query, parsedSource, parsedTarget, true],
        [null],
    ]);
    const reqBoilerplate = JSON.stringify([
        [["MkEWBc", reqData, null, "generic"]],
    ]);
    const body = "f.req=" + encodeURIComponent(reqBoilerplate);

    return request(Endpoint.INFO)
        .with({ body })
        .doing(({ data }: AxiosResponse<TranslationInfo | null>) => {
            if (typeof data === "string") {
                const resBoilerplate: Boilerplate = JSON.parse(
                    (data as string).split("\n")?.[3] || ""
                );
                const resData: Data = JSON.parse(resBoilerplate?.[0]?.[2]);
                if (!resData) return null;

                // Add extraTranslations field here (with a fallback if necessary)
                return parse.undefinedFields({
                    detectedSource:
                        source === "auto" ? parse.detected(resData) : undefined,
                    typo: parse.typo(resData),
                    pronunciation: {
                        query: parse.pronunciation.query(resData),
                        translation: parse.pronunciation.translation(resData),
                    },
                    definitions: parse.list.definitions(resData),
                    examples: parse.list.examples(resData),
                    similar: parse.list.similar(resData),
                    extraTranslations:
                        parse.list.extraTranslations?.(resData) || [],
                });
            }

            return null; // Handle the case when `data` isn't a string.
        })
        .catch((error) => {
            console.error("Error fetching translation info:", error);
            return null;
        });
};
