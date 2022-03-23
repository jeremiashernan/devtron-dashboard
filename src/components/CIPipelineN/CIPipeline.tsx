import React, { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { ButtonWithLoader, ConditionalWrap, DeleteDialog, showError, VisibleModal } from '../common'
import { Redirect, Route, Switch, useParams, useRouteMatch } from 'react-router'
import { TriggerType, ViewType } from '../../config'
import {
    deleteCIPipeline,
    getInitData,
    getInitDataWithCIPipeline,
    saveCIPipeline,
} from '../ciPipeline/ciPipeline.service'
import { toast } from 'react-toastify'
import { ServerErrors } from '../../modals/commonTypes'
import { ValidationRules } from '../ciPipeline/validationRules'
import { CIPipelineDataType, FormType } from '../ciPipeline/types'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import Tippy from '@tippyjs/react'
import { PreBuild } from './PreBuild'
import { PostBuild } from './PostBuild'
import { Sidebar } from './Sidebar'
import { Build } from './Build'

interface CIPipelineType {
    appName: string
    connectCDPipelines: number
    getWorkflows: () => void
    close: () => void
}

export default function CIPipeline({ appName, connectCDPipelines, getWorkflows, close }: CIPipelineType) {
    let { appId, workflowId, ciPipelineId } = useParams<{ appId: string; workflowId: string; ciPipelineId: string }>()
    if (ciPipelineId && ciPipelineId.indexOf('build') >= 0) {
        ciPipelineId = undefined
    }
    const { path } = useRouteMatch()
    const [pageState, setPageState] = useState(ViewType.LOADING)
    const text = ciPipelineId ? 'Update Pipeline' : 'Create Pipeline'
    const title = ciPipelineId ? 'Edit build pipeline' : 'Create build pipeline'
    const [isAdvanced, setIsAdvanced] = useState<boolean>(false)
    const [showFormError, setShowFormError] = useState<boolean>(false)
    const [loadingData, setLoadingData] = useState<boolean>(false)
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
    const [formData, setFormData] = useState<FormType>({
        name: '',
        args: [{ key: '', value: '' }],
        materials: [],
        triggerType: TriggerType.Auto,
        beforeDockerBuildScripts: [],
        afterDockerBuildScripts: [],
        scanEnabled: false,
        gitHost: undefined,
        webhookEvents: [],
        ciPipelineSourceTypeOptions: [],
        webhookConditionList: [],
        ciPipelineEditable: true,
    })
    const [ciPipeline, setCIPipeline] = useState<CIPipelineDataType>({
        active: true,
        ciMaterial: [],
        dockerArgs: {},
        externalCiConfig: {},
        id: 0,
        isExternal: false,
        isManual: false,
        name: '',
        linkedCount: 0,
        scanEnabled: false,
    })
    const validationRules = new ValidationRules()

    useEffect(() => {
        setPageState(ViewType.LOADING)
        if (ciPipelineId) {
            getInitDataWithCIPipeline(appId, ciPipelineId, true)
                .then((response) => {
                    setFormData(response.form)
                    setCIPipeline(response.ciPipeline)
                    setIsAdvanced(true)
                    setPageState(ViewType.FORM)
                })
                .catch((error: ServerErrors) => {
                    setPageState(ViewType.ERROR)
                    showError(error)
                })
        } else {
            getInitData(appId, true)
                .then((response) => {
                    setFormData(response.result.form)
                    setPageState(ViewType.FORM)
                })
                .catch((error: ServerErrors) => {
                    setPageState(ViewType.ERROR)
                    showError(error)
                })
        }
    }, [])

    const deletePipeline = (): void => {
        deleteCIPipeline(
            formData,
            ciPipeline,
            formData.materials,
            Number(appId),
            Number(workflowId),
            false,
            formData.webhookConditionList,
        )
            .then((response) => {
                if (response) {
                    toast.success('Pipeline Deleted')
                    setPageState(ViewType.FORM)
                    close()
                    getWorkflows()
                }
            })
            .catch((error: ServerErrors) => {
                showError(error)
                setPageState(ViewType.ERROR)
            })
    }

    const closeCIDeleteModal = (): void => {
        setShowDeleteModal(false)
    }

    const renderDeleteCIModal = () => {
        if (ciPipelineId && showDeleteModal) {
            return (
                <DeleteDialog
                    title={`Delete '${formData.name}' ?`}
                    description={`Are you sure you want to delete this CI Pipeline from '${appName}' ?`}
                    closeDelete={closeCIDeleteModal}
                    delete={deletePipeline}
                />
            )
        }
        return null
    }

    const renderSecondaryButtton = () => {
        if (ciPipelineId) {
            let canDeletePipeline = connectCDPipelines === 0 && ciPipeline.linkedCount === 0
            let message =
                connectCDPipelines > 0
                    ? 'This Pipeline cannot be deleted as it has connected CD pipeline'
                    : 'This pipeline has linked CI pipelines'
            return (
                <ConditionalWrap
                    condition={!canDeletePipeline}
                    wrap={(children) => (
                        <Tippy className="default-tt" content={message}>
                            <div>{children}</div>
                        </Tippy>
                    )}
                >
                    <button
                        type="button"
                        className={`cta cta--workflow delete mr-16`}
                        disabled={!canDeletePipeline}
                        onClick={() => {
                            setShowDeleteModal(true)
                        }}
                    >
                        Delete Pipeline
                    </button>
                </ConditionalWrap>
            )
        } else if (!isAdvanced) {
            return (
                <button
                    type="button"
                    className={`cta cta--workflow cancel mr-16`}
                    onClick={() => {
                        setIsAdvanced(true)
                    }}
                >
                    Advanced options
                </button>
            )
        }
    }

    const checkUniqueness = (): boolean => {
        let list = formData.beforeDockerBuildScripts.concat(formData.afterDockerBuildScripts)
        let stageNameList = list.map((l) => {
            return l.name
        })
        let set = new Set()
        for (let i = 0; i < stageNameList.length; i++) {
            if (set.has(stageNameList[i])) return false
            else set.add(stageNameList[i])
        }
        return true
    }

    const savePipeline = () => {
        let isUnique = checkUniqueness()
        if (!isUnique) {
            toast.error('All Stage names must be unique')
            return
        }
        setLoadingData(true)
        setShowFormError(true)
        let errObj = validationRules.name(formData.name)
        let valid = formData.materials.reduce((isValid, mat) => {
            isValid = isValid && validationRules.sourceValue(mat.value).isValid
            return isValid
        }, true)
        valid = valid && errObj.isValid
        let scanValidation = formData.scanEnabled || !window._env_.FORCE_SECURITY_SCANNING
        if (!scanValidation) {
            setLoadingData(false)
            toast.error('Scanning is mandotory, please enable scanning')
            return
        }
        if (!valid) {
            setLoadingData(false)
            toast.error('Some Required Fields are missing')
            return
        }
        let msg = ciPipeline.id ? 'Pipeline Updated' : 'Pipeline Created'
        saveCIPipeline(
            formData,
            ciPipeline,
            formData.materials,
            +appId,
            +workflowId,
            false,
            formData.webhookConditionList,
            formData.ciPipelineSourceTypeOptions,
        )
            .then((response) => {
                if (response) {
                    toast.success(msg)
                    setLoadingData(false)
                    close()
                    getWorkflows()
                }
            })
            .catch((error: ServerErrors) => {
                showError(error)

                setLoadingData(false)
            })
    }
    return (
        <VisibleModal className="">
            {' '}
            <div
                className={`modal__body modal__body__ci_new_ui br-0 modal__body--p-0 ${
                    isAdvanced ? 'advanced-option-container' : 'bottom-border-radius'
                }`}
            >
                <div className="flex flex-align-center flex-justify bcn-0 pr-20">
                <h2 className="fs-16 fw-6 lh-1-43 m-0 title-padding">{title}</h2>
                <button
                        type="button"
                        className="transparent flex icon-dim-24"
                        onClick={() => {
                            close()
                        }}
                    >
                        <Close className="icon-dim-24" />
                    </button>
                </div>
                {isAdvanced &&
                        <ul className="ml-20 tab-list w-90">
                            <li className="tab-list__tab">
                                <NavLink
                                    replace
                                    className="tab-list__tab-link fs-13 pt-5 pb-5"
                                    activeClassName="active"
                                    to={`pre-build`}
                                >
                                    Pre-build stage
                                </NavLink>
                            </li>
                            <li className="tab-list__tab">
                                <NavLink replace className="tab-list__tab-link fs-13 pt-5 pb-5" activeClassName="active" to={`build`}>
                                    Build stage
                                </NavLink>
                            </li>
                            <li className="tab-list__tab">
                                <NavLink
                                    replace
                                    className="tab-list__tab-link fs-13 pt-5 pb-5"
                                    activeClassName="active"
                                    to={`post-build`}
                                >
                                    Post-build stage
                                </NavLink>
                            </li>
                        </ul>
                   }
                <hr className="divider m-0" />

                <div className={`ci-pipeline-advance ${isAdvanced ? 'pipeline-container' : ''}`}>
                    {isAdvanced && (
                        <div className="sidebar-container">
                            <Sidebar
                                formData={formData}
                                setFormData={setFormData} />
                        </div>
                    )}
                    <Switch>
                        <Route path={`${path}/pre-build`}>
                            <PreBuild />
                        </Route>
                        <Route path={`${path}/build`}>
                            <Build
                                formData={formData}
                                setFormData={setFormData}
                                pageState={pageState}
                                showFormError={showFormError}
                                isAdvanced={isAdvanced}
                                ciPipelineId={ciPipeline.id}
                            />
                        </Route>
                        <Route path={`${path}/post-build`}>
                            <PostBuild />
                        </Route>
                        <Redirect to={`${path}/build`} />
                    </Switch>
                </div>
                {pageState !== ViewType.LOADING && (
                    <>
                        <div
                            className={`ci-button-container bcn-0 pt-12 pb-12 pl-20 pr-20 flex bottom-border-radius ${
                                ciPipelineId || !isAdvanced ? 'flex-justify' : 'justify-right'
                            } `}
                        >
                            {renderSecondaryButtton()}
                            {formData.ciPipelineEditable && (
                                <ButtonWithLoader
                                    rootClassName="cta cta--workflow"
                                    loaderColor="white"
                                    onClick={savePipeline}
                                    isLoading={loadingData}
                                >
                                    {text}
                                </ButtonWithLoader>
                            )}
                        </div>
                    </>
                )}
                {renderDeleteCIModal()}
            </div>
        </VisibleModal>
    )
}
