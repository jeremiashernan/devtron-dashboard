import { RouteComponentProps } from 'react-router-dom';

export const COMMAND = {
    APPLICATIONS: 'app',
    CHART: 'chart',
    SECURITY: 'security',
    GLOBAL_CONFIG: 'global-config'
}

export const COMMAND_REV = {
    app: 'Applications',
    env: 'environments',
    misc: 'misc',
    none: 'none',
    'global-config': 'Global Config',
}


export interface CommandProps extends RouteComponentProps<{}> {
    isTabMode: boolean;
    isCommandBarActive: boolean;
    toggleCommandBar: (flag: boolean) => void;
}

export interface ArgumentType {
    value: string;
    readonly data: {
        readonly value?: string | number;
        readonly kind?: string;
        readonly url?: string;
        readonly group?: string;
        groupStart: boolean;
        readonly isValid: boolean;
        readonly isEOC: boolean;
    }
}

export type SuggestedArgumentType = ArgumentType & { ref: any; };

export interface CommandState {
    argumentInput: string;
    arguments: ArgumentType[];
    command: { label: string; argument: ArgumentType; }[];
    suggestedArguments: SuggestedArgumentType[];
    readonly allSuggestedArguments: SuggestedArgumentType[];
    isLoading: boolean;
    focussedArgument: number; //index of the higlighted argument
    tab: 'jump-to' | 'this-app';
    groupName: string | undefined;
}

export const PlaceholderText = "Search";

export type CommandSuggestionType = { allSuggestionArguments: SuggestedArgumentType[], groups: any[] }