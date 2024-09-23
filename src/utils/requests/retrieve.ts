import axios from "axios";
import UserAgent from "user-agents";
import { EndpointType, RequestParams } from "./types";
import { Endpoint } from '.';

const retrieveInfo = (body: string, options: any) => {
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
};

const retrieveText = (
    source: string,
    target: string,
    query: string,
    options: any
) => {
    return axios.get(
        `https://translate.google.com/m?sl=${source}&tl=${target}&q=${query}`,
        options
    );
};

const retrieveAudio = (
    lang: string,
    text: string,
    textLength: number,
    speed: number,
    options: any
) => {
    return axios
        .get(
            `https://translate.google.com/translate_tts?tl=${lang}&q=${text}&textlen=${textLength}&speed=${speed}&client=tw-ob`,
            {
                ...options,
                responseType: "arraybuffer",
            }
        )
        .then((response) => {
            if (!(response.data instanceof ArrayBuffer)) {
                throw new Error("Received data is not an ArrayBuffer");
            }
            return response;
        });
};

const retrieve = <EndpointKey extends EndpointType>(
    endpoint: EndpointKey,
    params: RequestParams[EndpointKey]
) => {
    const userAgent = new UserAgent().toString();

    const options = {
        headers: {
            "User-Agent": userAgent,
        },
        responseType:
            endpoint === Endpoint.AUDIO ? ("arraybuffer" as const) : undefined,
    };

    switch (endpoint) {
        case Endpoint.INFO:
            return retrieveInfo(
                (params as RequestParams[typeof Endpoint.INFO]).body,
                options
            );
        case Endpoint.TEXT:
            return retrieveText(
                (params as RequestParams[typeof Endpoint.TEXT]).source,
                (params as RequestParams[typeof Endpoint.TEXT]).target,
                (params as RequestParams[typeof Endpoint.TEXT]).query,
                options
            );
        case Endpoint.AUDIO:
            return retrieveAudio(
                (params as RequestParams[typeof Endpoint.AUDIO]).lang,
                (params as RequestParams[typeof Endpoint.AUDIO]).text,
                (params as RequestParams[typeof Endpoint.AUDIO]).textLength,
                (params as RequestParams[typeof Endpoint.AUDIO]).speed,
                options
            );
        default:
            throw new Error("Invalid endpoint");
    }
};

export default retrieve;
