import React from 'react'
import { toast } from 'react-toastify'
import CICDIcon from '../../../assets/img/ic-build-deploy.png'
import MoreExtentionsIcon from '../../../assets/img/ic-more-extensions.png'
import { handleError } from './DevtronStackManager.component'
import { executeModuleAction, executeServerAction } from './DevtronStackManager.service'
import {
    ModuleActionRequest,
    ModuleActions,
    ModuleDetails,
    ModuleDetailsInfo,
    ModuleStatus,
} from './DevtronStackManager.type'

export const MODULE_ICON_MAP = {
    cicd: CICDIcon,
    moreModules: MoreExtentionsIcon,
    unknown: CICDIcon
}

export const MODULE_DETAILS_MAP: Record<string, ModuleDetails> = {
    cicd: {
        id: 'cicd',
        name: 'Build and Deploy (CI/CD)',
        info: 'Enables continous code integration and deployment.',
        icon: 'cicd',
        installationStatus: ModuleStatus.NOT_INSTALLED,
    },
    moreModules: {
        id: 'moreModules',
        name: 'More modules coming soon',
        info: "You can also raise a request for a module that will improve your workflow.",
        icon: 'moreModules',
        installationStatus: ModuleStatus.NONE,
    },
    unknown: {
        id: 'unknown',
        name: 'New module coming soon',
        info: "We're building a suite of modules to serve your software delivery lifecycle.",
        icon: 'unknown',
        installationStatus: ModuleStatus.NONE,
    }
}

export const MODULE_DETAILS_INFO: Record<string, ModuleDetailsInfo> = {
    cicd: {
        name: 'Build and Deploy (CI/CD)',
        infoList: [
            'Continuous integration (CI) and continuous delivery (CD) embody a culture, set of operating principles, and collection of practices that enable application development teams to deliver code changes more frequently and reliably. The implementation is also known as the CI/CD pipeline.',
            'CI/CD is one of the best practices for devops teams to implement. It is also an agile methodology best practice, as it enables software development teams to focus on meeting business requirements, code quality, and security because deployment steps are automated.',
        ],
        featuresList: [
            "Discovery: What would the users be searching for when they're looking for a CI/CD offering?",
            'Detail: The CI/CD offering should be given sufficient importance (on Website, Readme). (Eg. Expand capability with CI/CD module [Discover more modules])',
            'Installation: Ability to install CI/CD module with the basic installation.',
            'In-Product discovery: How easy it is to discover the CI/CD offering primarily once the user is in the product. (Should we talk about modules on the login page?)',
        ],
    },
}

const actionTriggered = (location: any, history: any) => {
    const queryParams = new URLSearchParams(location.search)
    queryParams.set('actionTriggered', 'true')
    history.push(`${location.pathname}?${queryParams.toString()}`)
}

export const handleAction = async (
    moduleName: string,
    isUpgradeView: boolean,
    upgradeVersion: string,
    canUpdateServer: boolean,
    setShowManagedByDialog: React.Dispatch<React.SetStateAction<boolean>>,
    location: any,
    history: any,
) => {
    try {
        const actionRequest: ModuleActionRequest = {
            action: isUpgradeView ? ModuleActions.UPGRADE : ModuleActions.INSTALL,
            version: upgradeVersion,
        }

        const { result } = isUpgradeView
            ? await executeServerAction(actionRequest)
            : await executeModuleAction(moduleName, actionRequest)

        if (result?.success) {
            actionTriggered(history, location)
        }
    } catch (e) {
        handleError(e, isUpgradeView, canUpdateServer, setShowManagedByDialog)
    }
}

const getVersionLevels = (version: string): number[] => {
    return version
        .replace(/[vV]/, '')
        .split('.')
        .map((level) => parseInt(level, 10))
}

export const isLatestVersionAvailable = (currentVersion: string, newVersion: string): boolean => {
    if (!currentVersion || !newVersion) return false

    const currentVersionLevels = getVersionLevels(currentVersion)
    const newVersionLevels = getVersionLevels(newVersion)
    const minLevels = currentVersionLevels.length > newVersionLevels.length ? newVersionLevels : currentVersionLevels

    for (let [idx, level] of minLevels.entries()) {
        if (level === newVersionLevels[idx]) {
            continue
        } else if (level > newVersionLevels[idx]) {
            return false
        } else if (level < newVersionLevels[idx]) {
            return true
        }
    }

    if (currentVersionLevels.length === newVersionLevels.length) {
        return false
    }

    return currentVersionLevels.length > newVersionLevels.length ? false : true
}
