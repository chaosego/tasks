export class FieldDefinition {
    templateId: string = 'base';
    dbName: string = '';
    dbType: string = '';
    isTableField: boolean = true;
    isPK: boolean = false;
    size: number = 0;
    decimal: number = 0;
    minLength: number = 0;
    allowNull: boolean = false;
    default: string = '';
    dbComment: string = '';
    catalogId: string = '';
    originTable: string = '';
    linkedField: string = '';
    entName: string = '';
    formControl: string = '';
    captureRequired: boolean = false;
    appearsByDefaultOnGrid: boolean = true;
    specialRules: string[] = [];
    displayName: string = '';
    tooltip: string = '';
    isRecordName: boolean = false;

    gridOrder: number = 0;
    orderOnNew: number = 0;
    orderOnDetails: number = 0;
    orderOnEdit: number = 0;
    orderOnImport: number = 0;
    globalOrder: number = 0;
    value: any = null;
}