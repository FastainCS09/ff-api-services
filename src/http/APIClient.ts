import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, CancelToken } from 'axios';
import * as isNode from 'detect-node';
import { stringify } from 'qs';
import Authentication from '../authentication/Authentication';
import { EnvironmentManagementInstance } from '../util/EnvironmentManagement';
import { APIService, LambdaAPIService, S3APIService } from './APIMapping';
import axiosETAGCache from './cache';

export type ParamMap = { [key: string]: string | boolean | number | undefined };

export interface APIClientAdditionalParams extends AxiosRequestConfig {
    headers?: string | ParamMap;
    queryParams?: ParamMap;
    cancelToken?: CancelToken;
}

export type MethodTypes = 'GET' | 'POST' | 'DELETE' | 'PUT' | 'OPTIONS' | 'PATCH' | 'HEAD';

export type APIVersion = string;

export class APIClient {
    private userId: string;
    private readonly _service: APIService | undefined;
    private readonly _version: APIVersion | undefined;

    private static languages: string = 'de';

    public static changeLanguages(newLanguages: string) {
        this.languages = newLanguages;
    }

    public constructor(service?: APIService, version?: APIVersion) {
        this._service = service;
        this._version = version;
    }

    public withUserId(userId: string): this {
        this.userId = userId;
        return this;
    }

    private async getUserIdentification() {
        // setup the request
        if (isNode) {
            if (this.userId) {
                return {
                    userId: this.userId,
                };
            }
            return {};
        }

        const supportToken = window?.localStorage?.getItem('flowfact.support.token') || '';
        const apiToken = window?.localStorage?.getItem('flowfact.api.token') || '';

        if (supportToken.length === 0 && apiToken.length === 0) {
            const currentSession = await Authentication.getCurrentSession();
            return {
                cognitoToken: currentSession.getIdToken().getJwtToken(),
            };
        } else {
            return {
                [`x-ff-${apiToken ? 'api' : 'support'}-token`]: apiToken || supportToken,
            };
        }
    }

    public async getAuthenticationToken(): Promise<string> {
        const userIdentification = await this.getUserIdentification();
        return userIdentification.cognitoToken || userIdentification['x-ff-support-token'];
    }

    /**
     * @deprecated Use invokeApiWithErrorHandling instead.
     */
    public async invokeApi<T = any>(
        path: string,
        method: MethodTypes = 'GET',
        body: string | {} = '',
        additionalParams: APIClientAdditionalParams = {}
    ): Promise<AxiosResponse<T>> {
        // If no service is defined and the url does not start with http, then we throw an error
        if (!this._service && !path.startsWith('http')) {
            throw Error('[APIClient] If you do not pass a service into APIClient, then your url has to start with http!');
        }

        const { queryParams, headers, cancelToken, ...others } = additionalParams;

        // add parameters to the url
        let apiUrl;

        if (this._service) {
            if (this._service instanceof LambdaAPIService) {
                apiUrl = `${EnvironmentManagementInstance.getLambdaUrl(this._service)}${path}`;
            } else if (this._service instanceof S3APIService) {
                apiUrl = `${EnvironmentManagementInstance.getS3BucketUrl(this._service)}${path}`;
            } else {
                apiUrl = `${EnvironmentManagementInstance.getBaseUrl(isNode)}/${this._service.name}${path}`;
            }
        } else {
            apiUrl = path;
        }

        if (queryParams) {
            const queryString = stringify(queryParams, { addQueryPrefix: true });
            if (queryString && queryString !== '') {
                apiUrl += queryString;
            }
        }

        const versionHeaders = this._version ? { 'x-ff-version': this._version } : {};
        const userIdentification = path.startsWith('/public') || this._service instanceof S3APIService ? {} : await this.getUserIdentification();
        const languages: any = { 'Accept-Language': APIClient.languages };
        // Required for multiple companies per user
        const companyId = { comapnyid: window?.sessionStorage?.getItem('company_id') || '' };

        let request: AxiosRequestConfig = {
            method: method,
            url: apiUrl,
            headers: Object.assign({}, userIdentification, languages, versionHeaders, companyId, headers || {}),
            data: body,
            cancelToken: cancelToken,
            ...others,
        };

        const client = axiosETAGCache();
        // fire the request
        // NEVER put a catch here because it prevents all other error handling
        // i.e. you can't handle a service returning an http code >= 400 (which is possibly expected)
        return client.request<T>(request);
    }

    public async invokeApiWithErrorHandling<T = any>(
        path: string,
        method: MethodTypes = 'GET',
        body: string | {} = '',
        additionalParams: APIClientAdditionalParams = {},
        defaultValue?: T
    ): Promise<ApiResponse<T>> {
        try {
            const result = await this.invokeApi<T>(path, method, body, additionalParams);
            const response: ApiResponse<T> = {
                isSuccessful2xx: result.status >= 200 && result.status < 300,
                status: 0,
            };

            return !result
                ? response
                : {
                      ...response,
                      ...result,
                      data: result.data || defaultValue,
                  };
        } catch (error) {
            return {
                ...error,
                status: error?.response?.status,
                isSuccessful2xx: false,
                isCancelled: axios.isCancel(error),
                data: error?.response?.data ?? defaultValue,
            };
        }
    }
}

export interface ApiResponseSuccess<T> extends Partial<AxiosResponse<T>> {
    isSuccessful2xx: true;
}

export interface ApiResponseError<T> extends Partial<AxiosError<T>> {
    isSuccessful2xx: false | undefined;
    status: number;
    isCancelled?: boolean;
    data?: T;
}

export type ApiResponse<T> = ApiResponseSuccess<T> | ApiResponseError<T>;
