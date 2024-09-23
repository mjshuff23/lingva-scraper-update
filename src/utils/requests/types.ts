import { LangCodeGoogle } from "../languages";
import { Endpoint } from "../constants";

export type EndpointType = (typeof Endpoint)[keyof typeof Endpoint];

export type RequestParams = {
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