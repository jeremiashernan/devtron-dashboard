import { RouteComponentProps } from "react-router-dom";


export interface CodeEditorScript {
    apiVersion: string;
    kind: string;
    payload: {
        include: {
            name: string;
        }
        exclude: {
            name: string;
        }
        envId: number[];
        global: boolean;
        deploymentTemplate: {
            spec: {
                patchJson: any;
            }
        }
    }
}

export interface BulkConfiguration {
    task: string;
    script: CodeEditorScript;
    readme: string;
}

export interface UpdatedTemplate {
    value: number,
    label: string
}

export interface ImpactedObjectList {
    appId: number;
    appName: string;
    envId: number;
}

export interface BulkEditsState {
    view: string;
    statusCode: number;
    impactedObjectList: ImpactedObjectList[];
    outputList: "";
    updatedTemplate: UpdatedTemplate[];
    showObjectsOutputDrawer: boolean;
    readmeResult: string[];
    showExamples: boolean;
    showHeaderDescription: boolean;
    showOutputData: boolean;
    bulkConfig: BulkConfiguration[];
    codeEditorPayload: string;
}

export enum OutputObjectTabs {
    OUTPUT = "Output",
    IMPACTED_OBJECTS = "Impacted objects"
}

export interface BulkEditsProps extends RouteComponentProps<{}> {
    // close: (event) => void;
}