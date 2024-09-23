import { RequestParams } from "./types";
import { handleError, isEmpty } from "./helpers";
import retrieve from "./retrieve";
import { AxiosResponse } from "axios";

const retryRequest = <EndpointType extends keyof RequestParams, ResponseType>(
    endpoint: EndpointType,
    params: RequestParams[EndpointType],
    callback: (res: AxiosResponse<ResponseType>) => ResponseType | undefined,
    retry: number
): Promise<ResponseType | null> => {
    return request(endpoint, retry + 1)
        .with(params)
        .doing(callback);
};

const evaluateResult = <ResponseType>(
    result: ResponseType | undefined,
    retry: number,
    endpoint: keyof RequestParams,
    params: RequestParams[keyof RequestParams],
    callback: (res: AxiosResponse<ResponseType>) => ResponseType | undefined
): Promise<ResponseType | null> => {
    return isEmpty(result) && retry < 3
        ? retryRequest(endpoint, params, callback, retry)
        : Promise.resolve(result ?? null);
};

export const request = <EndpointType extends keyof RequestParams>(
    endpoint: EndpointType,
    retry: number = 0
) => ({
    with: (requestParams: RequestParams[EndpointType]) => {
        const promise = retrieve(endpoint, requestParams);
        return {
            promise,
            doing: <ResponseType>(
                callback: (
                    res: AxiosResponse<ResponseType>
                ) => ResponseType | undefined
            ): Promise<ResponseType | null> =>
                promise
                    .then(callback)
                    .catch(handleError)
                    .then((result) =>
                        evaluateResult(
                            result,
                            retry,
                            endpoint,
                            requestParams,
                            callback
                        )
                    ),
        };
    },
});