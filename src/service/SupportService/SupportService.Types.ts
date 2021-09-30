import { Captions } from '@flowfact/types';

export namespace SupportServiceTypes {
    export type SupportItem = RestSupportItem | DisplayResponseItem;

    export interface BaseSupportItem {
        type: 'REST' | 'DISPLAY_RESPONSE';
        captions: Captions;
        descriptions: Captions;
        confirmable?: boolean;
    }

    export interface RestSupportItem extends BaseSupportItem {
        type: 'REST';
        url: string;
        method: 'GET' | 'POST' | 'PATCH' | 'PUT';
        body?: any;
        accept?: string;
        contentType?: string;
    }

    export interface DisplayResponseItem extends Omit<RestSupportItem, 'type'> {
        type: 'DISPLAY_RESPONSE';
    }
}
