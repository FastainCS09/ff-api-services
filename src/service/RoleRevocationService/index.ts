import {RoleRevocationController} from "./RoleRevocationController";


export class RoleRevocationService {
    public readonly roleRevocation: RoleRevocationController;

    constructor() {
        this.roleRevocation = new RoleRevocationController();
    }
}

export const RoleRevocationInstance = new RoleRevocationService();
