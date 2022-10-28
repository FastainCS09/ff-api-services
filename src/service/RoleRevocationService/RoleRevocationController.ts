import { APIClient, APIMapping } from '../../http';

export class RoleRevocationController extends APIClient {
    constructor() {
        super(APIMapping.is24EntitlementService);
    }

    /**
     * This method removes the NSM role
     */
    async removeNsmRole() {
        return await this.invokeApiWithErrorHandling(`/nsm-role`, 'DELETE', undefined);
    }
}

export default new RoleRevocationController();
