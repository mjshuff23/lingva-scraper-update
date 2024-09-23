import axios, { AxiosResponse } from "axios";
import UserAgent from "user-agents";
import { LangCodeGoogle } from "./language";

export const Endpoint = {
    INFO: "info",
    TEXT: "text",
    AUDIO: "audio",
} as const;

type EndpointType = (typeof Endpoint)[keyof typeof Endpoint];

type Params = {
    [Endpoint.INFO]: {
        body: string;
    };
    [Endpoint.TEXT]: {
        source: LangCodeGoogle<"source">;
        target: LangCodeGoogle<"target">;
        query: string;
    };
    [Endpoint.AUDIO]: {
        lang: LangCodeGoogle<"target">;
        text: string;
        textLength: number;
        speed: number;
    };
};

const request = <T extends EndpointType>(endpoint: T, retry: number = 0) => ({
    with: (params: Params[T]) => {
        const promise = retrieve(endpoint, params);
        return {
            promise,
            doing: <V>(
                callback: (res: AxiosResponse<V>) => V | undefined
            ): Promise<V | null> =>
                promise
                    .then(callback)
                    .catch((error) => {
                        // Enhanced error logging with specific handling for 404s
                        if (error.response?.status === 404) {
                            console.error(
                                "Audio not available for this language."
                            );
                        } else {
                            console.error("Axios Error: ", error);
                        }
                        return undefined;
                    })
                    .then((result) =>
                        isEmpty(result) && retry < 3
                            ? request(endpoint, retry + 1)
                                  .with(params)
                                  .doing(callback)
                            : result ?? null
                    ),
        };
    },
});

const isEmpty = (item: any) =>
    !item || (typeof item === "object" && "length" in item && item.length <= 0);

const retrieve = <T extends EndpointType>(endpoint: T, params: Params[T]) => {
    const userAgent = new UserAgent().toString(); // Reuse UserAgent for all requests

    const options = {
        headers: {
            "User-Agent": userAgent,
        },
        responseType:
            endpoint === Endpoint.AUDIO ? ("arraybuffer" as const) : undefined,
    };

    // INFO endpoint
    if (endpoint === Endpoint.INFO) {
        const { body } = params as Params[typeof Endpoint.INFO];
        return axios.post(
            "https://translate.google.com/_/TranslateWebserverUi/data/batchexecute?rpcids=MkEWBc&rt=c",
            body,
            {
                ...options,
                headers: {
                    ...options.headers,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );
    }

    // TEXT endpoint
    if (endpoint === Endpoint.TEXT) {
        const { source, target, query } =
            params as Params[typeof Endpoint.TEXT];
        return axios.get(
            `https://translate.google.com/m?sl=${source}&tl=${target}&q=${query}`,
            options
        );
    }

    // AUDIO endpoint
    if (endpoint === Endpoint.AUDIO) {
        const { lang, text, textLength, speed } =
            params as Params[typeof Endpoint.AUDIO];
        return axios
            .get(
                `https://translate.google.com/translate_tts?tl=${lang}&q=${text}&textlen=${textLength}&speed=${speed}&client=tw-ob`,
                {
                    ...options,
                    responseType: "arraybuffer",
                }
            )
            .then((response) => {
                // Check if the response is indeed an ArrayBuffer, otherwise throw an error
                if (!(response.data instanceof ArrayBuffer)) {
                    throw new Error("Received data is not an ArrayBuffer");
                }
                return response;
            });
    }

    throw new Error("Invalid endpoint");
};

export default request;
