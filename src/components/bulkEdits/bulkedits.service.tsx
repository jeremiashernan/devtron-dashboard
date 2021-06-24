import react from 'react';
import { resolve } from "dns"
import { rejects } from "assert"
import { get, post, put, trash } from '../../services/api';

export function getReadme() {
    return get(`app-store/application/readme/240`)
}

export function getOutputListMin(): Promise<{
    appNameIncludes: string;
    appNameExcludes: string;
    envId: number;
    isGlobal: boolean;
    patchJson: string;
}[]> {
    return new Promise((resolve, reject) => {
        resolve([{
            "appNameIncludes": "demo",
            "appNameExcludes": "string",
            "envId": 5,
            "isGlobal": true,
            "patchJson": "string"
        },
        {
            "appNameIncludes": "demo-env",
            "appNameExcludes": "string",
            "envId": 5,
            "isGlobal": true,
            "patchJson": "string"
        },
        {
            "appNameIncludes": "demo_live",
            "appNameExcludes": "string",
            "envId": 5,
            "isGlobal": true,
            "patchJson": "string"
        }])
    })
}