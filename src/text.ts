import { load } from "cheerio";
import { mapGoogleCode, LangCode } from "./utils/language";
import request, { Endpoint } from "./utils/request";
import { AxiosResponse } from 'axios';

const MAX_QUERY_LENGTH = 7500;

const isHtmlContent = (headers: Record<string, any>) => {
    const contentType = headers["content-type"];
    return typeof contentType === "string" && contentType.includes("text/html");
};

const extractTranslation = (html: string): string | undefined => {
    const translation = load(html)(".result-container").text()?.trim();
    return translation && !translation.includes("#af-error-page") ? translation : undefined;
};

/**
 * Retrieves the translation given a pair of languages and a query
 * @param source - The code of the language to translate from
 * @param target - The code of the language to translate to
 * @param query - The text to be translated
 * @returns A single {@link string} with the translated text
 */
export const getTranslationText = async (
    source: LangCode<"source">,
    target: LangCode<"target">,
    query: string
): Promise<string | null> => {
    const parsedSource = mapGoogleCode(source);
    const parsedTarget = mapGoogleCode(target);
    const encodedQuery = encodeURIComponent(query);

    if (encodedQuery.length > MAX_QUERY_LENGTH) return null;

    return request(Endpoint.TEXT)
        .with({ source: parsedSource, target: parsedTarget, query: encodedQuery })
        .doing(({ data, headers }: AxiosResponse<string>) => {
            if (isHtmlContent(headers)) {
                return extractTranslation(data);
            }

            return undefined;
        });
};