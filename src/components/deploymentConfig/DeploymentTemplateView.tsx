import React, { useEffect, useState } from 'react'
import Tippy from '@tippyjs/react'
import { NavLink } from 'react-router-dom'
import ReactSelect, { components } from 'react-select'
import { MODES, ROLLOUT_DEPLOYMENT, URLS } from '../../config'
import {
    Checkbox,
    CHECKBOX_VALUE,
    ConditionalWrap,
    isVersionLessThanOrEqualToTarget,
    Progressing,
    showError,
    sortObjectArrayAlphabetically,
} from '../common'
import { DropdownIndicator, Option } from '../v2/common/ReactSelect.utils'
import { ReactComponent as Upload } from '../../assets/icons/ic-arrow-line-up.svg'
import { ReactComponent as Arrows } from '../../assets/icons/ic-arrows-left-right.svg'
import { ReactComponent as File } from '../../assets/icons/ic-file-text.svg'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as Edit } from '../../assets/icons/ic-pencil.svg'
import { ReactComponent as Next } from '../../assets/icons/ic-arrow-right.svg'
import { MarkDown } from '../charts/discoverChartDetail/DiscoverChartDetails'
import CodeEditor from '../CodeEditor/CodeEditor'
import { getDeploymentTemplate } from './service'
import { getDeploymentTemplate as getEnvDeploymentTemplate } from '../EnvironmentOverride/service'
import YAML from 'yaml'
import {
    ChartTypeVersionOptionsProps,
    CompareOptionsProps,
    CompareWithDropdownProps,
    DeploymentChartGroupOptionType,
    DeploymentChartOptionType,
    DeploymentChartVersionType,
    DeploymentConfigFormCTAProps,
    DeploymentTemplateEditorViewProps,
    DeploymentTemplateOptionsTabProps,
} from './types'
import { getCommonSelectStyles } from './constants'

const renderReadMeOption = (openReadMe: boolean, handleReadMeClick: () => void, disabled?: boolean) => {
    const handleReadMeOptionClick = () => {
        if (disabled) {
            return
        }

        handleReadMeClick()
    }

    return (
        <span
            className={`dt-view-option flex cursor fs-13 fw-6 cn-7 ${openReadMe ? 'opened' : ''} ${
                disabled ? 'disabled' : ''
            }`}
            onClick={handleReadMeOptionClick}
        >
            {openReadMe ? (
                <>
                    <Close className="option-close-icon icon-dim-16 mr-8" />
                    Hide README
                </>
            ) : (
                <>
                    <File className="option-open-icon icon-dim-16 mr-8" />
                    README
                </>
            )}
        </span>
    )
}

const renderComparisonOption = (openComparison: boolean, handleComparisonClick: () => void, disabled: boolean) => {
    const handleComparisonOptionClick = () => {
        if (disabled) {
            return
        }

        handleComparisonClick()
    }

    return (
        <span
            className={`dt-view-option flex cursor fs-13 fw-6 cn-7 mr-10 ${openComparison ? 'opened' : ''} ${
                disabled ? 'disabled' : ''
            }`}
            onClick={handleComparisonOptionClick}
        >
            {openComparison ? (
                <>
                    <Close className="option-close-icon icon-dim-16 mr-8" />
                    Hide comparison
                </>
            ) : (
                <>
                    <Arrows className="option-open-icon icon-dim-16 mr-8" />
                    Compare values
                </>
            )}
        </span>
    )
}

const getComparisonTippyContent = (
    isComparisonAvailable: boolean,
    environmentName: string,
    isEnvOverride?: boolean,
) => {
    if (isComparisonAvailable) {
        return isEnvOverride
            ? `Compare ${environmentName} values with base template values, values on other environments or previous deployments on ${environmentName}`
            : 'Compare base template values with values on other environments'
    }

    return (
        <>
            <h2 className="fs-12 fw-6 lh-18 m-0">Nothing to compare with</h2>
            <p className="fs-12 fw-4 lh-18 m-0">No other environments available</p>
        </>
    )
}

const ChartMenuList = (props) => {
    return (
        <components.MenuList {...props}>
            {props.children}
            <NavLink
                to={URLS.GLOBAL_CONFIG_CUSTOM_CHARTS}
                className="upload-custom-chart-link cb-5 select__sticky-bottom fw-4 fs-13 no-decor bottom-radius-4"
                target="_blank"
                rel="noreferrer noopener"
            >
                <Upload className="icon-dim-16 mr-8 vertical-align-bottom upload-icon-stroke" />
                Upload custom chart
            </NavLink>
        </components.MenuList>
    )
}

export const ChartTypeVersionOptions = ({
    isUnSet,
    disableVersionSelect,
    charts,
    selectedChart,
    selectChart,
    selectedChartRefId,
}: ChartTypeVersionOptionsProps) => {
    const uniqueChartsByDevtron = new Map<string, boolean>(),
        uniqueCustomCharts = new Map<string, boolean>()
    let devtronCharts = [],
        customCharts = []

    for (let chart of charts) {
        const chartName = chart.name
        if (chart['userUploaded']) {
            if (!uniqueCustomCharts.get(chartName)) {
                uniqueCustomCharts.set(chartName, true)
                customCharts.push(chart)
            }
        } else if (!uniqueChartsByDevtron.get(chartName)) {
            uniqueChartsByDevtron.set(chartName, true)
            devtronCharts.push(chart)
        }
    }
    devtronCharts = sortObjectArrayAlphabetically(devtronCharts, 'name')
    customCharts = sortObjectArrayAlphabetically(customCharts, 'name')

    const groupedChartOptions = [
        {
            label: 'Charts by Devtron',
            options: devtronCharts,
        },
        {
            label: 'Custom charts',
            options: customCharts.length === 0 ? [{ name: 'No options' }] : customCharts,
        },
    ]
    const filteredCharts = selectedChart
        ? charts.filter((cv) => cv.name == selectedChart.name).sort((a, b) => Number(b.id) - Number(a.id))
        : []

    const onSelectChartType = (selected) => {
        const filteredCharts = charts.filter((chart) => chart.name == selected.name)
        const selectedChart = filteredCharts.find((chart) => chart.id == selectedChartRefId)
        if (selectedChart) {
            selectChart(selectedChart)
        } else {
            const sortedFilteredCharts = filteredCharts.sort((a, b) => Number(a.id) - Number(b.id))
            selectChart(sortedFilteredCharts[sortedFilteredCharts.length ? sortedFilteredCharts.length - 1 : 0])
        }
    }

    const onSelectChartVersion = (selected) => {
        selectChart(selected)
    }

    return (
        <div className="chart-type-version-options">
            <div className="chart-type-options">
                <span className="fs-13 fw-4 cn-9">Chart type:</span>
                {isUnSet ? (
                    <ReactSelect
                        options={groupedChartOptions}
                        isMulti={false}
                        getOptionLabel={(option) => `${option.name}`}
                        getOptionValue={(option) => `${option.name}`}
                        value={selectedChart}
                        classNamePrefix="chart_select"
                        isOptionDisabled={(option) => !option.id}
                        isSearchable={false}
                        components={{
                            IndicatorSeparator: null,
                            DropdownIndicator,
                            Option,
                            MenuList: ChartMenuList,
                        }}
                        styles={getCommonSelectStyles({
                            menu: (base, state) => ({
                                ...base,
                                margin: '0',
                                width: '250px',
                            }),
                            menuList: (base) => ({
                                ...base,
                                position: 'relative',
                                paddingBottom: '0px',
                                maxHeight: '250px',
                            }),
                        })}
                        onChange={onSelectChartType}
                    />
                ) : (
                    <span className="fs-13 fw-6 cn-9">{selectedChart?.name}</span>
                )}
            </div>
            <div className="chart-version-options">
                <span className="fs-13 fw-4 cn-9">Chart version:</span>
                {disableVersionSelect ? (
                    <span className="fs-13 fw-6 cn-9">{selectedChart?.version}</span>
                ) : (
                    <ReactSelect
                        options={filteredCharts}
                        isMulti={false}
                        getOptionLabel={(option) => `${option.version}`}
                        getOptionValue={(option) => `${option.id}`}
                        value={selectedChart}
                        isSearchable={false}
                        components={{
                            IndicatorSeparator: null,
                            Option,
                            DropdownIndicator,
                        }}
                        styles={getCommonSelectStyles({
                            menu: (base, state) => ({
                                ...base,
                                margin: '0',
                                width: '120px',
                            }),
                        })}
                        onChange={onSelectChartVersion}
                    />
                )}
            </div>
        </div>
    )
}

const CompareOptions = ({
    isComparisonAvailable,
    environmentName,
    isEnvOverride,
    showComparisonOption,
    openComparison,
    handleComparisonClick,
    chartConfigLoading,
    openReadMe,
    isReadMeAvailable,
    handleReadMeClick,
}: CompareOptionsProps) => {
    return (
        <div className="flex">
            {showComparisonOption && (
                <ConditionalWrap
                    condition={!openComparison && !chartConfigLoading}
                    wrap={(children) => (
                        <Tippy
                            className="default-tt w-200"
                            arrow={false}
                            placement="bottom"
                            content={getComparisonTippyContent(isComparisonAvailable, environmentName, isEnvOverride)}
                        >
                            {children}
                        </Tippy>
                    )}
                >
                    {renderComparisonOption(
                        openComparison,
                        handleComparisonClick,
                        chartConfigLoading || !isComparisonAvailable,
                    )}
                </ConditionalWrap>
            )}
            <ConditionalWrap
                condition={!openReadMe && (chartConfigLoading || !isReadMeAvailable)}
                wrap={(children) => (
                    <Tippy
                        className="default-tt"
                        arrow={false}
                        placement="bottom"
                        content={chartConfigLoading ? 'Fetching...' : 'Readme is not available'}
                    >
                        {children}
                    </Tippy>
                )}
            >
                {renderReadMeOption(openReadMe, handleReadMeClick, chartConfigLoading || !isReadMeAvailable)}
            </ConditionalWrap>
        </div>
    )
}

export const DeploymentTemplateOptionsTab = ({
    isComparisonAvailable,
    environmentName,
    isEnvOverride,
    openComparison,
    handleComparisonClick,
    chartConfigLoading,
    openReadMe,
    isReadMeAvailable,
    handleReadMeClick,
    isUnSet,
    charts,
    selectedChart,
    selectChart,
    selectedChartRefId,
    disableVersionSelect,
}: DeploymentTemplateOptionsTabProps) => {
    return (
        <div className="dt-options-tab-container flex content-space pl-16 pr-16 pt-14 pb-14">
            {!openComparison && !openReadMe ? (
                <ChartTypeVersionOptions
                    isUnSet={isUnSet}
                    charts={charts}
                    selectedChart={selectedChart}
                    selectChart={selectChart}
                    selectedChartRefId={selectedChartRefId}
                    disableVersionSelect={disableVersionSelect}
                />
            ) : (
                <span className="flex fs-13 fw-6 cn-9 h-32">
                    {openComparison ? 'Comparing deployment template' : 'Showing README.md'}
                </span>
            )}
            <CompareOptions
                isComparisonAvailable={isComparisonAvailable}
                environmentName={environmentName}
                isEnvOverride={isEnvOverride}
                showComparisonOption={!disableVersionSelect}
                openComparison={openComparison}
                handleComparisonClick={handleComparisonClick}
                chartConfigLoading={chartConfigLoading}
                openReadMe={openReadMe}
                isReadMeAvailable={isReadMeAvailable}
                handleReadMeClick={handleReadMeClick}
            />
        </div>
    )
}

const formatOptionLabel = (option: DeploymentChartOptionType): JSX.Element => {
    return (
        <div className="flex left column">
            <span className="w-100 ellipsis-right">
                {option.label}&nbsp;{option.version && `(${option.version})`}
            </span>
        </div>
    )
}

const customValueContainer = (props): JSX.Element => {
    return (
        <components.ValueContainer {...props}>
            {props.selectProps.value?.label}&nbsp;
            {props.selectProps.value?.version && `(${props.selectProps.value.version})`}
            {React.cloneElement(props.children[1], {
                style: { position: 'absolute' },
            })}
        </components.ValueContainer>
    )
}

const CompareWithDropdown = ({
    isEnvOverride,
    environments,
    charts,
    selectedOption,
    setSelectedOption,
    globalChartRef,
}: CompareWithDropdownProps) => {
    const [groupedOptions, setGroupedOptions] = useState<DeploymentChartGroupOptionType[]>([
        {
            label: '',
            options: [],
        },
    ])
    const baseTemplateOption = {
        id: -1,
        value: '',
        label: 'Base deployment template',
        version: globalChartRef?.version || '',
        kind: 'base',
    }

    useEffect(() => {
        _initOptions()
    }, [environments, charts])

    const _initOptions = () => {
        const _groupOptions = []
        if (isEnvOverride) {
            _groupOptions.push(
                ...[
                    {
                        label: '',
                        options: [baseTemplateOption],
                    },
                    {
                        label: 'Values on other environments',
                        options:
                            environments.length > 0 ? environments : [{ label: 'No options', value: 0, kind: 'env' }],
                    },
                ],
            )

            if (!selectedOption) {
                setSelectedOption(baseTemplateOption as DeploymentChartOptionType)
            }
        } else {
            _groupOptions.push({
                label: 'Values used on environment',
                options: environments.length > 0 ? environments : [{ label: 'No options', value: 0, kind: 'env' }],
            })

            if (!selectedOption) {
                setSelectedOption(environments.length > 0 ? environments[0] : charts[0])
            }
        }

        _groupOptions.push({
            label: 'Other version values',
            options: charts.length > 0 ? charts : [{ label: 'No options', value: 0, kind: 'chartVersion' }],
        })
        setGroupedOptions(_groupOptions)
    }

    const onChange = (selected: DeploymentChartOptionType) => {
        setSelectedOption(selected)
    }

    return (
        <ReactSelect
            options={groupedOptions}
            isMulti={false}
            value={selectedOption}
            isOptionSelected={(option, selected) => option.id === selected[0].id}
            classNamePrefix="compare-template-values-select"
            formatOptionLabel={formatOptionLabel}
            isOptionDisabled={(option) => option.value === 0}
            isSearchable={false}
            onChange={onChange}
            components={{
                IndicatorSeparator: null,
                Option,
                DropdownIndicator,
                ValueContainer: customValueContainer,
            }}
            styles={{
                control: (base) => ({
                    ...base,
                    backgroundColor: 'var(--N100)',
                    border: 'none',
                    boxShadow: 'none',
                    minHeight: '32px',
                    cursor: 'pointer',
                }),
                option: (base, state) => ({
                    ...base,
                    color: 'var(--N900)',
                    backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
                }),
                menu: (base) => ({
                    ...base,
                    marginTop: '2px',
                    minWidth: '240px',
                }),
                menuList: (base) => ({
                    ...base,
                    position: 'relative',
                    paddingBottom: 0,
                    paddingTop: 0,
                    maxHeight: '250px',
                }),
                dropdownIndicator: (base, state) => ({
                    ...base,
                    padding: 0,
                    color: 'var(--N400)',
                    transition: 'all .2s ease',
                    transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }),
                noOptionsMessage: (base) => ({
                    ...base,
                    color: 'var(--N600)',
                }),
            }}
        />
    )
}

const getCodeEditorHeight = (
    isUnSet: boolean,
    isEnvOverride: boolean,
    openComparison: boolean,
    showReadme: boolean,
) => {
    if (openComparison || showReadme) {
        return 'calc(100vh - 158px)'
    } else if (isEnvOverride) {
        return 'calc(100vh - 282px)'
    }

    return isUnSet ? 'calc(100vh - 256px)' : 'calc(100vh - 224px)'
}

export const DeploymentTemplateEditorView = ({
    appId,
    envId,
    isUnSet,
    isEnvOverride,
    environmentName,
    openComparison,
    showReadme,
    chartConfigLoading,
    readme,
    value,
    defaultValue,
    editorOnChange,
    schemas,
    charts,
    selectedChart,
    environments,
    fetchedValues,
    setFetchedValues,
    readOnly,
    globalChartRefId,
}: DeploymentTemplateEditorViewProps) => {
    const [fetchingValues, setFetchingValues] = useState(false)
    const [selectedOption, setSelectedOption] = useState<DeploymentChartOptionType>()
    const [filteredEnvironments, setFilteredEnvironments] = useState<DeploymentChartOptionType[]>([])
    const [filteredCharts, setFilteredCharts] = useState<DeploymentChartOptionType[]>([])
    const [globalChartRef, setGlobalChartRef] = useState(null)

    useEffect(() => {
        if (selectedChart && environments.length > 0) {
            let _filteredEnvironments = environments
            if (isEnvOverride) {
                _filteredEnvironments = environments.filter((env) => +envId !== env.environmentId)
            }

            setFilteredEnvironments(
                _filteredEnvironments.map((env) => ({
                    id: env.environmentId,
                    label: env.environmentName,
                    value: env.chartRefId,
                    version: charts.find((chart) => chart.id === env.chartRefId)?.version || '',
                    kind: 'env',
                })) as DeploymentChartOptionType[],
            )
        }
    }, [selectedChart, environments])

    useEffect(() => {
        if (selectedChart && charts.length > 0) {
            const _filteredCharts = charts
                .filter((chart) => {
                    if (!globalChartRef && chart.id === globalChartRefId) {
                        setGlobalChartRef(chart)
                    }

                    return chart.id !== selectedChart.id && chart.name === selectedChart.name
                })
                .sort((a, b) => Number(b.id) - Number(a.id))

            setFilteredCharts(
                _filteredCharts.map((chart) => ({
                    id: `version-${chart.version}`,
                    label: chart.version,
                    value: chart.id,
                    kind: 'chartVersion',
                })) as DeploymentChartOptionType[],
            )
        }
    }, [selectedChart, charts])

    useEffect(() => {
        if (selectedChart && selectedOption && selectedOption.id !== -1 && !fetchedValues[selectedOption.id]) {
            setFetchingValues(true)
            const isEnvOption = selectedOption.kind === 'env'
            const _getDeploymentTemplate =
                isEnvOverride || isEnvOption
                    ? getEnvDeploymentTemplate(appId, isEnvOption ? selectedOption.id : envId, selectedOption.value)
                    : getDeploymentTemplate(+appId, +selectedOption.value)

            _getDeploymentTemplate
                .then(({ result }) => {
                    const _fetchedValues = {
                        ...fetchedValues,
                        [selectedOption.id]: YAML.stringify(
                            isEnvOverride || isEnvOption
                                ? result?.environmentConfig?.envOverrideValues || result?.globalConfig
                                : result?.globalConfig.defaultAppOverride,
                        ),
                    }
                    setFetchedValues(_fetchedValues)
                    setFetchingValues(false)
                })
                .catch((err) => {
                    showError(err)
                    setFetchingValues(false)
                })
        }
    }, [selectedOption])

    useEffect(() => {
        return (): void => {
            setSelectedOption(null)
        }
    }, [openComparison])

    return (
        <>
            {showReadme && (
                <div className="dt-readme border-right">
                    <div className="code-editor__header flex left fs-12 fw-6 cn-9">Readme</div>
                    {chartConfigLoading ? (
                        <Progressing pageLoader />
                    ) : (
                        <MarkDown markdown={readme} className="dt-readme-markdown" />
                    )}
                </div>
            )}
            <div className="form__row form__row--code-editor-container border-top border-bottom">
                <CodeEditor
                    defaultValue={(selectedOption?.id === -1 ? defaultValue : fetchedValues[selectedOption?.id]) || ''}
                    value={value}
                    onChange={editorOnChange}
                    mode={MODES.YAML}
                    validatorSchema={schemas}
                    loading={chartConfigLoading || !value || fetchingValues}
                    height={getCodeEditorHeight(isUnSet, isEnvOverride, openComparison, showReadme)}
                    diffView={openComparison}
                    readOnly={readOnly}
                >
                    {isUnSet && !openComparison && !showReadme && (
                        <CodeEditor.Warning text={'Chart type cannot be changed once saved.'} />
                    )}
                    {showReadme && (
                        <CodeEditor.Header hideDefaultSplitHeader={true}>
                            <div className="flex fs-12 fw-6 cn-9">
                                <Edit className="icon-dim-16 mr-10" />
                                {`${isEnvOverride ? environmentName : 'Base deployment template'} ${
                                    selectedChart ? `(${selectedChart.version})` : ''
                                }`}
                            </div>
                        </CodeEditor.Header>
                    )}
                    {openComparison && (
                        <CodeEditor.Header hideDefaultSplitHeader={true}>
                            <>
                                <div className="flex left fs-12 fw-6 cn-9 border-right h-32">
                                    <span style={{ width: '85px' }}>Compare with: </span>
                                    <CompareWithDropdown
                                        isEnvOverride={isEnvOverride}
                                        environments={filteredEnvironments}
                                        charts={filteredCharts}
                                        selectedOption={selectedOption}
                                        setSelectedOption={setSelectedOption}
                                        globalChartRef={globalChartRef}
                                    />
                                </div>
                                <div className="flex left fs-12 fw-6 cn-9 pl-16 h-32">
                                    <Edit className="icon-dim-16 mr-10" />
                                    {`${isEnvOverride ? environmentName : 'Base deployment template'} ${
                                        selectedChart ? `(${selectedChart.version})` : ''
                                    }`}
                                </div>
                            </>
                        </CodeEditor.Header>
                    )}
                </CodeEditor>
            </div>
        </>
    )
}

export const DeploymentConfigFormCTA = ({
    loading,
    showAppMetricsToggle,
    isAppMetricsEnabled,
    isEnvOverride,
    isCiPipeline,
    disableCheckbox,
    disableButton,
    currentChart,
    toggleAppMetrics,
}: DeploymentConfigFormCTAProps) => {
    const isUnSupportedChartVersion =
        showAppMetricsToggle &&
        currentChart.name === ROLLOUT_DEPLOYMENT &&
        isVersionLessThanOrEqualToTarget(currentChart.version, [3, 7, 0])
    return (
        <div className="form-cta-section flex right pt-16 pb-16 pr-20 pl-20">
            {showAppMetricsToggle && (
                <div className="form-app-metrics-cta flex top left">
                    {loading ? (
                        <Progressing
                            styles={{
                                width: 'auto',
                                marginRight: '16px',
                            }}
                        />
                    ) : (
                        <Checkbox
                            rootClassName="mt-2 mr-8"
                            isChecked={isAppMetricsEnabled}
                            value={CHECKBOX_VALUE.CHECKED}
                            onChange={toggleAppMetrics}
                            disabled={disableCheckbox || isUnSupportedChartVersion}
                        />
                    )}
                    <div className="flex column left">
                        <b className="fs-13 fw-6 cn-9 mb-4">Show application metrics</b>
                        <div className={`fs-13 fw-4 ${isUnSupportedChartVersion ? 'cr-5' : 'cn-7'}`}>
                            {isUnSupportedChartVersion
                                ? 'Application metrics is not supported for the selected chart version. Select a different chart version.'
                                : 'Capture and show key application metrics over time. (E.g. Status codes 2xx, 3xx, 5xx; throughput and latency).'}
                        </div>
                    </div>
                </div>
            )}
            <button className="form-submit-cta cta flex h-32" type="submit" disabled={disableButton || loading}>
                {loading ? (
                    <Progressing />
                ) : (
                    <>
                        {!isEnvOverride && !isCiPipeline ? (
                            <>
                                Save & Next
                                <Next className={`icon-dim-16 ml-5 ${disableButton || loading ? 'scn-4' : 'scn-0'}`} />
                            </>
                        ) : (
                            'Save changes'
                        )}
                    </>
                )}
            </button>
        </div>
    )
}
