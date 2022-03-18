export namespace IS24EstateStatisticsTypes {

    export interface ExposeViewsResponse {
        totalExposeViews: number;
    }

    export interface ContactRequestResponse {
        totalContactRequests: number;
        totalUnreadContactRequests: number;
    }

    export interface HomeOwnerRequestResponse {
        totalHomeOwnerRequests: number;
    }

    export type IS24StatisticsResponse =
        | ExposeViewsResponse
        | ContactRequestResponse
        | HomeOwnerRequestResponse;
}