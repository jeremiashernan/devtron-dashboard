export const RequestTimeout = 60000
export const DEFAULT_STATUS = 'Checking Status...'
export const Host = process.env.REACT_APP_ORCHESTRATOR_ROOT
export const DEFAULTK8SVERSION = 'v1.16.0'

export const Routes = {
    LOGIN: 'api/v1/session',
    SOURCE_CONFIG_GET: 'app/get',

    CHART_REFERENCES_MIN: 'chartref/autocomplete',
    CI_CONFIG_GET: 'app/ci-pipeline',
    CI_CONFIG_UPDATE: 'app/ci-pipeline/template/patch',
    CI_PIPELINE_PATCH: 'app/ci-pipeline/patch',

    CI_PIPELINE_TRIGGER: 'app/ci-pipeline/trigger',
    CLUSTER: 'cluster',

    CD_CONFIG: 'app/cd-pipeline',
    CD_CONFIG_PATCH: 'app/cd-pipeline/patch',

    CD_MATERIAL_GET: 'app/cd-pipeline',
    CD_TRIGGER_POST: 'app/cd-pipeline/trigger',
    CD_TRIGGER_STATUS: 'app/vsm',

    DEPLOYMENT_TEMPLATE: 'app/template',
    DEPLOYMENT_TEMPLATE_UPDATE: 'app/template/update',

    DEPLOYMENT_STRATEGY: 'app/cd-pipeline/strategies',
    ENVIRONMENT_CONFIG: 'app/env',
    PIPELINE_CONFIG: 'app/cd-pipeline/pipeline-config',

    APP_CHECKLIST: 'global/checklist',

    APP: 'app',
    APP_LIST: 'app/list',
    APP_LIST_MIN: 'app/autocomplete',
    APP_DETAIL: 'app/detail',
    APP_CONFIG_STATUS: 'app/stage/status',
    APP_OTHER_ENVIRONMENT: 'app/other-env',
    APP_CI_PIPELINE: 'ci-pipeline/min',
    APP_LABELS: 'app/labels',

    BULK_UPDATE_APIVERSION: 'batch/v1beta1',
    BULK_UPDATE_KIND: 'application',

    DEPLOYMENT_GROUP_LIST: 'deployment-group/dg/fetch/all',
    DEPLOYMENT_GROUP_DEPLOY: 'deployment-group/release/trigger',
    DEPLOYMENT_GROUP_MATERIAL: 'deployment-group/dg/material',
    DEPLOYMENT_GROUP_DELETE: 'deployment-group/dg/delete',
    LINKED_CI_PIPELINES: 'deployment-group/dg/fetch/ci',

    HOST_URL: 'attributes',
    GIT_MATERIAL: 'app/material',
    NOTIFIER: 'notification',
    PROJECT: 'team',
    PROJECT_LIST: 'team',
    PROJECT_LIST_MIN: 'team/autocomplete',
    TEAM_USER: 'team/app/user', //TODO: PROJECT_USER
    DOCKER_REGISTRY_CONFIG: 'docker/registry',
    DOCKER_REGISTRY_MIN: 'docker/registry/autocomplete',
    GITOPS: 'gitops/config',
    GITOPS_VALIDATE: 'gitops/validate',
    GITOPS_CONFIGURED: 'gitops/configured',
    GIT_PROVIDER: 'git/provider',
    GIT_HOST: 'git/host',
    CHART_LIST_SUBPATH: 'list',
    GIT_PROVIDER_MIN: 'git/provider/autocomplete',
    MIGRATION_TOOLS: 'config/mig-tools',
    DATABASE: 'config/databases',
    DB_MIGRATION_CONFIGURATION: 'config/db-migration-config',
    PROPERTIES: 'config/properties',
    PROPERTY_OPTIONS: 'properties-options',
    ENVIRONMENT: 'env',
    ACTIVE_ENVIRONMENT: 'env/active',
    ENVIRONMENT_LIST: 'list/environments',
    ENVIRONMENT_LIST_MIN: 'env/autocomplete',
    ENVIRONMENT_LIST_MIN_HELM_PROJECTS: 'env/autocomplete/helm',

    REFRESH_MATERIAL: 'app/ci-pipeline/refresh-material',
    COMMIT_INFO: 'app/commit-info',
    APPLICATIONS: 'api/v1/applications',
    API_TOKEN: 'api-token',
    USER_CREATE: 'user/create',
    USER_UPDATE: 'user/update',
    USER_LIST: 'user/all',

    DEPLOYMENT_METRICS: 'deployment-metrics',
    APP_CONFIG_MAP_GET: 'configmap/applevel/get',
    APP_CONFIG_MAP_UPDATE: 'configmap/update/applevel',
    APP_CONFIG_MAP_SAVE: 'configmap/create/applevel',
    ENV_CONFIG_MAP_GET: 'configmap/envlevel/get',
    ENV_CONFIG_MAP_UPDATE: 'configmap/update/envlevel',
    ENV_CONFIG_MAP_SAVE: 'configmap/create/envlevel',
    PIPELINE_CONFIG_MAP_GET: 'configmap/pipelinelevel/get',
    PIPELINE_CONFIG_MAP_SAVE: 'configmap/create/pipelinelevel',
    PIPELINE_CONFIG_MAP_UPDATE: 'configmap/update/pipelinelevel',
    CHART_INSTALLED: 'app-store/installed-app',
    CHART_AVAILABLE: 'app-store',
    CHART_STORE: 'app-store',
    CHART_REPO: 'chart-repo',
    CHART_RESYNC: 'sync-charts',
    CHART_STORE_VALUES: 'values',
    CHART_STORE_DEPLOYMENT: 'deployment',
    CHART_VALUES: 'template/values',
    CHART_VALUES_LIST_CATEGORIZED: 'application/values/list',
    CHART_VALUES_LIST_TEMPLATE: 'template/values/list',
    CHART_GROUP: 'chart-group',
    CHART_GROUP_LIST: 'chart-group/list',
    APP_CREATE_CONFIG_MAP: 'config/global/cm',
    APP_CREATE_SECRET: 'config/global/cs',
    WORKFLOW: 'app/app-wf',

    APP_WORKFLOW_STATUS: 'app/workflow/status',
    APP_CREATE_ENV_SECRET: 'config/environment/cs',
    APP_CREATE_ENV_CONFIG_MAP: 'config/environment/cm',
    APP_META_INFO: 'app/meta/info',
    CLUSTER_ENV_MAPPING: 'env',
    APP_VERSION: 'version',
    HELM_RELEASE_INFO_API: 'application/release-info',
    HELM_RELEASE_DEPLOYMENT_HISTORY_API: 'application/deployment-history',
    HELM_RELEASE_DEPLOYMENT_MANIFEST_DETAILS_API: 'application/deployment-history/info',
    HELM_RELEASE_APP_DETAIL_API: 'application/app',
    MANIFEST: 'k8s/resource',
    DESIRED_MANIFEST: 'application/desired-manifest',
    EVENTS: 'k8s/events',
    LOGS: 'k8s/pods/logs',
    DELETE_RESOURCE: 'k8s/resource/delete',
    CREATE_RESOURCE: 'k8s/resource/create',
    HELM_RELEASE_APP_DELETE_API: 'application/delete',
    HELM_RELEASE_APP_UPDATE_WITHOUT_LINKING_API: 'application/update',
    UPDATE_APP_API: 'app-store/deployment/application/update',
    HELM_LINK_TO_CHART_STORE_API: 'app-store/deployment/application/helm/link-to-chart-store',
    HELM_DEPLOYMENT_ROLLBACK_API: 'application/rollback',
    NAMESPACE: 'env/namespace',
    APP_RELEASE_DEPLOYMENT_HISTORY_API: 'app-store/installed-app/deployment-history',
    APP_RELEASE_DEPLOYMENT_DETAIL_API: 'app-store/installed-app/deployment-history/info',
    PLUGIN_LIST: 'plugin/global/list',
    PLUGIN_DETAIL: 'plugin/global',
    GLOBAL_VARIABLES: 'plugin/global/list/global-variable',
    DASHBOARD_ACCESSED: '/dashboard-event/dashboardAccessed',
    DASHBOARD_LOGGEDIN: '/dashboard-event/dashboardLoggedIn',
    HELM_APP_HIBERNATE_API: 'application/hibernate',
    HELM_APP_UNHIBERNATE_API: 'application/unhibernate',
    EXTERNAL_LINKS_API: 'external-links',
    MODULE_INFO_API: 'module',
    SERVER_INFO_API: 'server',
    LOG_PODNAME_API: 'k8s/resource/inception/info',
    RELEASE_NOTES_API: 'release/notes',
    MODULES_API: 'modules',
    CUSTOM_CHART_LIST: 'deployment/template/fetch',
    VALIDATE_CUSTOM_CHART: 'deployment/template/validate',
    UPLOAD_CUSTOM_CHART: 'deployment/template/upload',
    CLUSTER_LIST: 'k8s/capacity/cluster/list',
    CLUSTER_CAPACITY: 'k8s/capacity/cluster',
    NODE_LIST: 'k8s/capacity/node/list',
    NODE_CAPACITY: 'k8s/capacity/node',
    HELM_APP_TEMPLATE_CHART: 'application/template-chart',
}

export const ViewType = {
    EMPTY: 'EMPTY',
    LOADING: 'LOADING',
    FORM: 'FORM',
    ERROR: 'ERROR',
}

export const AppConfigStatus = {
    LOADING: -1,
    APP: 0,
    MATERIAL: 1,
    TEMPLATE: 2,
    CHARTS: 3,
    WORKFLOW: 4,
    CONFIGMAP: 5,
    SECRETS: 6,
    ENV_OVERRIDE: 7,
    END: 10,
}

export const FullRoutes = {
    LOGIN: `${Routes.LOGIN}`,
    CENTRAL: 'https://api-stage.devtron.ai'//'https://api.devtron.ai',
}

export const PATTERNS = {
    STRING: /[A-Za-z0-9]+$/,
    APP_NAME: '^[a-z][a-z0-9-.]*[a-z0-9]$/*',
    CD_PIPELINE_NAME: `^[a-z]+[a-z0-9\-\?]*[a-z0-9]+$`,
    CONFIG_MAP_AND_SECRET_KEY: /^[-._a-zA-Z0-9]+$/,
    CONFIGMAP_AND_SECRET_NAME: /^[a-z0-9][a-z0-9-.]*[a-z0-9]$/,
    ALL_DIGITS_BETWEEN_0_AND_7: /^[0-7]*$/,
    APP_LABEL_CHIP: /^.+:.+$/,
    CONFIG_MAP_AND_SECRET_MULTPLS_KEYS: /^[-._a-zA-Z0-9\,\?\s]*[-._a-zA-Z0-9\s]$/,
    VARIABLE: /^[A-z0-9-_]+$/,
    API_TOKEN: '^[a-z0-9][a-z0-9_-]*[a-z0-9]$/*',
}

export const TriggerType = {
    Auto: 'AUTOMATIC',
    Manual: 'MANUAL',
}

export const TriggerTypeMap = {
    automatic: 'Auto',
    manual: 'Manual',
}

export const SourceTypeMap = {
    BranchFixed: 'SOURCE_TYPE_BRANCH_FIXED',
    WEBHOOK: 'WEBHOOK',
    BranchRegex: 'SOURCE_TYPE_BRANCH_REGEX',
}

export const Moment12HourFormat = 'ddd, DD MMM YYYY, hh:mm A'
export const MomentDateFormat = 'ddd, DD MMM YYYY'

export const DOCUMENTATION = {
    HOME_PAGE: 'https://docs.devtron.ai',
    APP_CREATE: 'https://docs.devtron.ai/user-guide/creating-application',
    APP_CREATE_ENV: 'https://docs.devtron.ai/user-guide/creating-application/environment-overrides',
    APP_CREATE_MATERIAL: 'https://docs.devtron.ai/devtron/user-guide/creating-application/git-material',
    APP_CREATE_CI_CONFIG: 'https://docs.devtron.ai/devtron/user-guide/creating-application/docker-build-configuration',
    APP_CREATE_DEPLOYMENT_TEMPLATE: 'https://docs.devtron.ai/user-guide/creating-application/deployment-template',
    APP_CREATE_CONFIG_MAP: 'https://docs.devtron.ai/devtron/user-guide/creating-application/config-maps',
    APP_CREATE_SECRET: 'https://docs.devtron.ai/devtron/user-guide/creating-application/secrets',
    APP_CREATE_WORKFLOW: 'https://docs.devtron.ai/devtron/user-guide/creating-application/workflow',
    APP_CREATE_ENVIRONMENT_OVERRIDE: 'https://docs.devtron.ai/user-guide/creating-application/environment-overrides',
    BULK_UPDATE: 'https://docs.devtron.ai/user-guide/bulk-update',
    CHART_DEPLOY: 'https://docs.devtron.ai/user-guide/deploy-chart',
    CHART_LIST: 'https://docs.devtron.ai/user-guide/deploy-chart/overview-of-charts',
    SECURITY: 'https://docs.devtron.ai/user-guide/security-features',
    GLOBAL_CONFIG_GITOPS: 'https://docs.devtron.ai/user-guide/global-configurations/gitops',
    GLOBAL_CONFIG_GIT: 'https://docs.devtron.ai/user-guide/global-configurations/git-accounts',
    GLOBAL_CONFIG_DOCKER: 'https://docs.devtron.ai/user-guide/global-configurations/docker-registries',
    GLOBAL_CONFIG_CLUSTER: 'https://docs.devtron.ai/user-guide/global-configurations/cluster-and-environments',
    GLOBAL_CONFIG_CHART: 'https://docs.devtron.ai/user-guide/global-configurations/chart-repo',
    GLOBAL_CONFIG_NOTIFICATION: 'https://docs.devtron.ai/devtron/setup/global-configurations/manage-notification',
    GLOBAL_CONFIG_PROJECT: 'https://docs.devtron.ai/devtron/setup/global-configurations/projects',
    GLOBAL_CONFIG_SSO: 'https://docs.devtron.ai/devtron/setup/global-configurations/sso-login',
    GLOBAL_CONFIG_USER: 'https://docs.devtron.ai/devtron/setup/global-configurations/user-access',
    HYPERION_TO_FULL_MODE: 'https://docs.devtron.ai/hyperion/upgrade-to-devtron',
    HYPERION: 'https://docs.devtron.ai/#hyperion',
    PRE_BUILD_TASK: 'https://docs.devtron.ai/devtron/user-guide/creating-application/workflow/cd-pipeline',
    BUILD_STAGE: 'https://docs.devtron.ai/devtron/user-guide/creating-application/workflow/ci-pipeline#build-stage',
    PRE_POST_BUILD_STAGE:
        'https://docs.devtron.ai/devtron/user-guide/creating-application/workflow/ci-pipeline/ci-build-pre-post-plugins',
    CUSTOM_CHART: 'https://docs.devtron.ai/devtron/setup/global-configurations/custom-charts',
    CUSTOM_CHART_PRE_REQUISITES:
        'https://docs.devtron.ai/devtron/setup/global-configurations/custom-charts#prerequisites',
    ADMIN_PASSWORD: 'https://docs.devtron.ai/devtron/setup/install/install-devtron-with-cicd#devtron-admin-credentials',
    CUSTOM_VALUES: 'https://docs.devtron.ai/devtron/user-guide/deploy-chart/overview-of-charts#custom-values',
}

// APP LIST STARTS
export const AppListConstants = {
    SAMPLE_NODE_REPO_URL: 'https://github.com/devtron-labs/getting-started-nodejs',
    CREATE_DEVTRON_APP_URL: 'create-d-app',
    AppTabs: {
        DEVTRON_APPS: 'Devtron Apps',
        HELM_APPS: 'Helm Apps',
    },
    AppType: {
        DEVTRON_APPS: 'd',
        HELM_APPS: 'h',
    },
    FilterType: {
        PROJECT: 'team',
        CLUTSER: 'cluster',
        NAMESPACE: 'namespace',
        ENVIRONMENT: 'environment',
    },
}
// APP LIST ENDS

export enum SERVER_MODE {
    EA_ONLY = 'EA_ONLY',
    FULL = 'FULL',
}

export type SERVER_MODE_TYPE = keyof typeof SERVER_MODE

export enum ACCESS_TYPE_MAP {
    DEVTRON_APPS = '', // devtron app work flow
    HELM_APPS = 'helm-app', //helm app work flow
}

export enum MODES {
    YAML = 'yaml',
    JSON = 'json',
    SHELL = 'shell',
}

export const HELM_APP_UNASSIGNED_PROJECT = 'unassigned'
export interface InputDetailType {
    label: string
    defaultValue: string
    placeholder: string
}
export interface RegistryTypeDetailType {
    value: string
    label: string
    desiredFormat: string
    placeholderText: string
    gettingStartedLink: string
    defaultRegistryURL: string
    registryURL: InputDetailType
    id: InputDetailType
    password: InputDetailType
}

export const REGISTRY_TYPE_MAP: Record<string, RegistryTypeDetailType> = {
    ecr: {
        value: 'ecr',
        label: 'ECR',
        desiredFormat: '(desired format: repo-name)',
        placeholderText: 'Eg. repo_name',
        gettingStartedLink: 'https://docs.aws.amazon.com/AmazonECR/latest/userguide/get-set-up-for-amazon-ecr.html',
        defaultRegistryURL: '',
        registryURL: {
            label: 'Registry URL*',
            defaultValue: '',
            placeholder: 'Eg. xxxxxxxxxxxx.dkr.ecr.region.amazonaws.com',
        },
        id: {
            label: 'Access key ID*',
            defaultValue: '',
            placeholder: '',
        },
        password: {
            label: 'Secret access key*',
            defaultValue: '',
            placeholder: '',
        },
    },
    'docker-hub': {
        value: 'docker-hub',
        label: 'Docker',
        desiredFormat: '(desired format: username/repo-name)',
        placeholderText: 'Eg. username/repo_name',
        gettingStartedLink: 'https://docs.docker.com/docker-hub/',
        defaultRegistryURL: 'docker.io',
        registryURL: {
            label: 'Registry URL*',
            defaultValue: 'docker.io',
            placeholder: '',
        },
        id: {
            label: 'Username*',
            defaultValue: '',
            placeholder: '',
        },
        password: {
            label: 'Password/Token (recommended)*',
            defaultValue: '',
            placeholder: '',
        },
    },
    acr: {
        value: 'acr',
        label: 'Azure',
        desiredFormat: '(desired format: repo-name)',
        placeholderText: 'Eg. repo_name',
        gettingStartedLink:
            'https://docs.microsoft.com/en-us/azure/container-registry/container-registry-get-started-portal',
        defaultRegistryURL: '',
        registryURL: {
            label: 'Registry url/Login server*',
            defaultValue: '',
            placeholder: 'Eg. xxx.azurecr.io',
        },
        id: {
            label: 'Username/Registry name*',
            defaultValue: '',
            placeholder: '',
        },
        password: {
            label: 'Password*',
            defaultValue: '',
            placeholder: '',
        },
    },
    'artifact-registry': {
        value: 'artifact-registry',
        label: 'Artifact Registry (GCP)',
        desiredFormat: '(desired format: project-id/artifacts-repo/repo-name)',
        placeholderText: 'Eg. project-id/artifacts-repo/repo-name',
        gettingStartedLink: 'https://cloud.google.com/artifact-registry/docs/manage-repos?hl=en_US',
        defaultRegistryURL: '',
        registryURL: {
            label: 'Registry URL*',
            defaultValue: '',
            placeholder: 'Eg. region-docker.pkg.dev',
        },
        id: {
            label: 'Username*',
            defaultValue: '_json_key',
            placeholder: '',
        },
        password: {
            label: 'Service account JSON file*',
            defaultValue: '',
            placeholder: 'Paste json file content here',
        },
    },
    gcr: {
        value: 'gcr',
        label: 'GCR',
        desiredFormat: '(desired format: project-id/repo-name)',
        placeholderText: 'Eg. project-id/repo_name',
        gettingStartedLink: 'https://cloud.google.com/container-registry/docs/quickstart',
        defaultRegistryURL: 'gcr.io',
        registryURL: {
            label: 'Registry URL*',
            defaultValue: 'gcr.io',
            placeholder: '',
        },
        id: {
            label: 'Username*',
            defaultValue: '_json_key',
            placeholder: '',
        },
        password: {
            label: 'Service account JSON file*',
            defaultValue: '',
            placeholder: 'Paste json file content here',
        },
    },
    quay: {
        value: 'quay',
        label: 'Quay',
        desiredFormat: '(desired format: username/repo-name)',
        placeholderText: 'Eg. username/repo_name',
        gettingStartedLink: '',
        defaultRegistryURL: 'quay.io',
        registryURL: {
            label: 'Registry URL*',
            defaultValue: 'quay.io',
            placeholder: '',
        },
        id: {
            label: 'Username*',
            defaultValue: '',
            placeholder: '',
        },
        password: {
            label: 'Token*',
            defaultValue: '',
            placeholder: '',
        },
    },
    other: {
        value: 'other',
        label: 'Other',
        desiredFormat: '',
        placeholderText: '',
        gettingStartedLink: '',
        defaultRegistryURL: '',
        registryURL: {
            label: 'Registry URL*',
            defaultValue: '',
            placeholder: '',
        },
        id: {
            label: 'Username*',
            defaultValue: '',
            placeholder: '',
        },
        password: {
            label: 'Password/Token*',
            defaultValue: '',
            placeholder: '',
        },
    },
}

export const AppCreationType = {
    Blank: 'BLANK',
    Existing: 'EXISTING',
}

export const ConfigurationType = {
    GUI: 'GUI',
    YAML: 'YAML',
}

export const BuildStageVariable = {
    PreBuild: 'preBuildStage',
    Build: 'buildStage',
    PostBuild: 'postBuildStage',
}

export const BuildTabText = {
    preBuildStage: 'Pre-build stage',
    buildStage: 'Build stage',
    postBuildStage: 'Post-build stage',
}

export const APP_STATUS_CUSTOM_MESSAGES = {
    HIBERNATED: "This application's workloads are scaled down to 0 replicas",
    'PARTIALLY HIBERNATED': "Some of this application's workloads are scaled down to 0 replicas.",
}

export const DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP = {
    DEPLOYMENT_TEMPLATE: {
        DISPLAY_NAME: 'Deployment template',
        VALUE: 'deployment-template',
    },
    PIPELINE_STRATEGY: {
        DISPLAY_NAME: 'Pipeline configurations',
        VALUE: 'pipeline-strategy',
    },
    CONFIGMAP: {
        DISPLAY_NAME: 'ConfigMap',
        VALUE: 'configmap',
    },
    SECRET: {
        DISPLAY_NAME: 'Secret',
        VALUE: 'secret',
    },
}

export const EXTERNAL_TYPES = {
    '': 'Kubernetes Secret',
    KubernetesSecret: 'Kubernetes External Secret',
    AWSSecretsManager: 'AWS Secrets Manager',
    AWSSystemManager: 'AWS System Manager',
    HashiCorpVault: 'Hashi Corp Vault',
}

export const ROLLOUT_DEPLOYMENT = 'Rollout Deployment'
