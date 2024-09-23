import cheerio from "cheerio";
import { mapGoogleCode, LangCode } from "./utils/language";
import request, { Endpoint } from "./utils/request";
import { AxiosResponse } from 'axios';

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

    if (encodedQuery.length > 7500) return null;

    return request(Endpoint.TEXT)
        .with({ source: parsedSource, target: parsedTarget, query: encodedQuery })
        .doing(({ data, headers }: AxiosResponse<string>) => {
            // Check if content-type header exists and is of type text/html
            const contentType = headers["content-type"];
            if (contentType && contentType.includes("text/html")) {
                console.log('Response is HTML, parsing with Cheerio');
                const translation = cheerio.load(data)(".result-container").text()?.trim();
                return translation && !translation.includes("#af-error-page") ? translation : undefined;
            }

            // If content-type is not HTML, handle accordingly (e.g., return null or handle non-HTML response)
            console.log('Response is not HTML, returning null or error');
            return undefined;
        });
};