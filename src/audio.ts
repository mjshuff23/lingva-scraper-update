import { mapGoogleCode, LangCode } from "./utils/language";
import request, { Endpoint } from "./utils/request";

/**
 * Retrieves an audio buffer of the given text in the given language
 * @param lang - The code of the language to be used as the TTS voice or "auto" for automatic detection
 * @param text - The text to be converted into speech
 * @param [isSlow=false] - Whether the audio should be slowed down or not
 * @returns An array of numbers that represents a {@link Uint8Array} of the audio buffer or null on failure
 */
export const getAudio = async (
    lang: LangCode<"target"> | "auto",
    text: string,
    isSlow: boolean = false
): Promise<number[] | null> => {
    if (lang === "auto") {
        throw new Error("Auto-detection is not supported for audio.");
    }

    const parsedLang = mapGoogleCode(lang);
    const lastSpace = text.lastIndexOf(" ", 200);
    const slicedText = text.slice(
        0,
        text.length > 200 && lastSpace !== -1 ? lastSpace : 200
    );
    const encodedText = encodeURIComponent(slicedText);
    const textLength = slicedText.length;
    const speed = isSlow ? 0.1 : 1;

    try {
        const result = await request(Endpoint.AUDIO)
            .with({ lang: parsedLang, text: encodedText, textLength, speed })
            .doing(({ data }) => {
                if (data instanceof ArrayBuffer) {
                    return Array.from(new Uint8Array(data));
                }
                console.error("Received data is not an ArrayBuffer:", data);
                return null;
            });

        if (!result || !Array.isArray(result)) {
            throw new Error("Failed to retrieve audio buffer.");
        }

        return result;
    } catch (error) {
        console.error("Error fetching audio:", error);
        return null;
    }
};
