import { mapGoogleCode, LangCode } from "./utils/language";
import request, { Endpoint } from "./utils/request";

/**
 * Retrieves an audio buffer of the given text in the given language
 * @param lang - The code of the language to be used as the TTS voice or "auto" for automatic detection
 * @param text - The text to be converted into speech
 * @param [isSlow=false] - Whether the audio should be slowed down or not
 * @returns An array of numbers that represents a {@link Uint8Array} of the audio buffer
 */
export const getAudio = async (
    lang: LangCode<"target"> | "auto", // Allow "auto" as a language code
    text: string,
    isSlow: boolean = false
): Promise<number[] | null> => {
    // Handle the "auto" case if needed
    if (lang === "auto") {
        throw new Error("Auto-detection is not supported for audio. Please specify a target language.");
    }

    const parsedLang = mapGoogleCode(lang);

    const lastSpace = text.lastIndexOf(" ", 200);
    const slicedText = text.slice(0, text.length > 200 && lastSpace !== -1 ? lastSpace : 200);
    const encodedText = encodeURIComponent(slicedText);

    const textLength = slicedText.length;
    const speed = isSlow ? 0.1 : 1;

    return request(Endpoint.AUDIO)
        .with({ lang: parsedLang, text: encodedText, textLength, speed })
        .doing(({ data }) => (data ? Array.from(new Uint8Array(data)) : undefined));
};
