import { Captions } from '@flowfact/types';
import { ViewActionType, ViewDefinitionCategoryJsonFieldConfig, ViewType } from './ViewDefinitionService.Types';

export enum ViewDefinitionV2CategoryContentItemTypes {
    MULTIMEDIA = 'MULTIMEDIA',
    ENTITY = 'ENTITY',
    TEXT = 'TEXT',
    SCHEMA = 'SCHEMA',
    SCHEMA_INFO = 'SCHEMA_INFO',
    IS24_STATISTICS = 'IS24_STATISTICS'
}

export enum StatisticsType {
    EXPOSE_VIEWS = 'EXPOSE_VIEWS',
    CONTACT_REQUESTS = 'CONTACT_REQUESTS'
}

export type ViewDefinitionV2CategoryContentItemType = keyof typeof ViewDefinitionV2CategoryContentItemTypes;

export interface ViewDefinitionV2CategoryIs24StatisticsItem {
    type: ViewDefinitionV2CategoryContentItemTypes.IS24_STATISTICS,
    statisticsType: StatisticsType;
    icon?: string;
    linkTemplate?: string;
}

export interface ViewDefinitionV2CategoryMediaItem {
    type: ViewDefinitionV2CategoryContentItemTypes.MULTIMEDIA;
    album?: string;
    category?: string;
    index: number;
}

export interface ViewDefinitionV2CategoryEntityItem {
    type: ViewDefinitionV2CategoryContentItemTypes.ENTITY;
    fieldName?: string;
    jsonFieldConfig?: ViewDefinitionCategoryJsonFieldConfig;
}

export interface ViewDefinitionV2CategoryTextItem {
    type: ViewDefinitionV2CategoryContentItemTypes.TEXT;
    captions: Captions;
}

export interface ViewDefinitionV2CategorySchemaItem {
    type: ViewDefinitionV2CategoryContentItemTypes.SCHEMA_INFO;
}

export interface ViewDefinitionV2CategoryLinkedEntityItem {
    type: ViewDefinitionV2CategoryContentItemTypes.SCHEMA;
    fieldName: string;
    content: ViewDefinitionV2CategoryContentItem[];
}

export type ViewDefinitionV2CategoryContentItem =
    | ViewDefinitionV2CategorySchemaItem
    | ViewDefinitionV2CategoryTextItem
    | ViewDefinitionV2CategoryMediaItem
    | ViewDefinitionV2CategoryEntityItem
    | ViewDefinitionV2CategoryLinkedEntityItem
    | ViewDefinitionV2CategoryIs24StatisticsItem;

// if you need a usecase specific property - make a usecase extension of ViewDefinitionV2 & ViewDefinitionV2Category,
// don't put the fields directly in here. See ViewDefinitionV2List for reference.
export interface ViewDefinitionV2Category {
    name: string;
    id: string;
    captions: Captions;
    content: ViewDefinitionV2CategoryContentItem[];
    hideFieldsIfEmpty: string[];
}

export interface ViewDefinitionV2FilterConfigurationField {
    fieldName: string;
}

export interface ViewDefinitionV2FilterConfiguration {
    id: string;
    showSavedSearches?: boolean;
    saveFilterState?: boolean;
    groupByFields?: ViewDefinitionV2FilterConfigurationField[];
    filterFields: ViewDefinitionV2FilterConfigurationField[];
}

export interface ViewDefinitionV2 {
    id: string;
    metadata?: object;
    type: ViewType;
    default: boolean;
    actions: ViewActionType[];
    captions: Captions;
    categories: ViewDefinitionV2Category[];
    defaultOrder?: string;
    filterConfiguration?: ViewDefinitionV2FilterConfiguration;
    schema: string;
    hints?: Captions[];
}

export interface ViewDefinitionV2ListCategory extends ViewDefinitionV2Category{
    // defaults to true
    sortable?: boolean;
}

export interface ViewDefinitionV2List extends ViewDefinitionV2 {
    type: ViewType.LIST;
    categories: ViewDefinitionV2ListCategory[];
}

