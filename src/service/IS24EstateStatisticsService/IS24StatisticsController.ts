import {APIClient, APIMapping} from '../../http';
import {StatisticsType} from "../ViewDefinitionService";

export default class IS24StatisticsController extends APIClient {
    constructor() {
        super(APIMapping.is24EstateStatisticsLambdaService);
    }

    /**
     * Fetches IS24 statistics value for given estate
     * @param is24EstateId
     * @param portalId
     * @param type
     */
    async fetchStatistics(is24EstateId: string, portalId: string, type: StatisticsType) {
        // invokeApi is used here because this endpoint can return plain '0' which is treated as error in invokeApiWithErrorHandling
        return await this.invokeApi<number>(this.getPath(type), 'GET', {}, {
            queryParams: {
                portalId,
                scoutId: is24EstateId
            }
        });
    }

    private getPath(type: StatisticsType): string {
        switch (type) {
            case StatisticsType.EXPOSE_VIEWS:
                return '/exposeviews';
            case StatisticsType.CONTACT_REQUESTS:
                return '/contactRequestsAmount';
            default:
                throw new TypeError(`Unhandled statistics type: ${type}`);
        }
    }

}
