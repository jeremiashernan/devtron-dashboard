import React, { useState } from 'react'
import { ReactComponent as Search } from '../../assets/icons/ic-search.svg'
import { ReactComponent as Clear } from '../../assets/icons/ic-error.svg'
import { Option, DropdownIndicator } from '../v2/common/ReactSelect.utils'
import { containerImageSelectStyles } from '../CIPipelineN/ciPipeline.utils'
import { ReactComponent as Setting } from '../../assets/icons/ic-nav-gear.svg'
import ReactSelect, { components, MultiValue } from 'react-select'
import { Option as OptionWithCheckbox } from '../common'
import { OptionType } from '../app/types'

interface NodeListSearchFliterType {
    defaultVersion: OptionType
    nodeK8sVersions: string[]
    selectedVersion: OptionType
    setSelectedVersion: React.Dispatch<React.SetStateAction<OptionType>>
    appliedColumns: MultiValue<OptionType>
    setAppliedColumns: React.Dispatch<React.SetStateAction<MultiValue<OptionType>>>
    selectedSearchTextType: string
    setSelectedSearchTextType: React.Dispatch<React.SetStateAction<string>>
    setSearchText: React.Dispatch<React.SetStateAction<string>>
    searchedLabelMap: Map<string, string>
    setSearchedLabelMap: React.Dispatch<React.SetStateAction<Map<string, string>>>
    searchApplied: boolean
}

export default function NodeListSearchFliter({
    defaultVersion,
    nodeK8sVersions,
    selectedVersion,
    setSelectedVersion,
    appliedColumns,
    setAppliedColumns,
    selectedSearchTextType,
    setSelectedSearchTextType,
    setSearchText,
    setSearchedLabelMap,
    searchApplied,
}: NodeListSearchFliterType) {
    const [selectedColumns, setSelectedColumns] = useState<MultiValue<OptionType>>([
        { label: 'Node', value: 'name' },
        { label: 'Status', value: 'status' },
        { label: 'Roles', value: 'roles' },
        { label: 'Errors', value: 'errors' },
        { label: 'K8S Version', value: 'k8sVersion' },
        { label: 'Pods', value: 'podCount' },
        { label: 'Taints', value: 'taintCount' },
        { label: 'CPU Usage', value: 'cpu.usagePercentage' },
        { label: 'Mem Usage', value: 'memory.usagePercentage' },
    ])
    const [isMenuOpen, setMenuOpen] = useState(false)
    const [openFilterPopup, setOpenFilterPopup] = useState(false)
    const columnMetadata = [
        { label: 'Node', value: 'name', disabled: true },
        { label: 'Status', value: 'status' },
        { label: 'Roles', value: 'roles' },
        { label: 'Errors', value: 'errors' },
        { label: 'K8S Version', value: 'k8sVersion' },
        { label: 'Pods', value: 'podCount' },
        { label: 'Taints', value: 'taintCount' },
        { label: 'CPU Usage', value: 'cpu.usagePercentage' },
        { label: 'Mem Usage', value: 'memory.usagePercentage' },
        { label: 'External IP', value: 'externalIp' },
        { label: 'Internal IP', value: 'internalIp' },
        { label: 'Unschedulable', value: 'unschedulable' },
    ]

    const [searchInputText, setSearchInputText] = useState('')

    const onVersionChange = (selectedValue: OptionType): void => {
        setSelectedVersion(selectedValue)
    }

    const clearTextFilter = () => {
        setSearchInputText('')
        setSearchText('')
        setSelectedSearchTextType('')
    }

    const handleFilterInput = (event): void => {
        setSearchInputText(event.target.value)
    }

    const handleFilterTag = (event): void => {
        let theKeyCode = event.key
        //const _appliedFilters = appliedFilters
        if (theKeyCode === 'Enter') {
            if (selectedSearchTextType === 'label') {
                const _searchedLabelMap = new Map()
                const searchedLabelArr = searchInputText.split(',')
                for (let index = 0; index < searchedLabelArr.length; index++) {
                    const element = searchedLabelArr[index].trim().split('=')
                    const key = element[0] ? element[0].trim() : null
                    if (!key) {
                        continue
                    }
                    const value = element[1] ? element[1].trim() : null
                    _searchedLabelMap.set(key, value)
                }
                setSearchedLabelMap(_searchedLabelMap)
            } else {
                setSearchText(event.target.value)
            }
        } else if (theKeyCode === 'Backspace') {
            if (searchInputText.length === 0 && selectedSearchTextType) {
                setSelectedSearchTextType('')
                setSearchText('')
                setOpenFilterPopup(false)
            }
        }
    }

    const toggleSelectPipeline = () => {
        // let _appliedFilters = appliedFilters
        // if (openFilterPopup) {
        //     _appliedFilters = appliedFilters.filter((e) => e.value)
        // }
        setOpenFilterPopup(!openFilterPopup)
    }

    const selectFilterType = (filter: { label: string; value: string | number; type: string }): void => {
        // const _appliedFilters = appliedFilters
        // _appliedFilters.push({ type: filter.label, value: undefined, label: undefined })
        // setAppliedFilter(_appliedFilters)
        setSelectedSearchTextType(filter.label)
        setOpenFilterPopup(false)
    }
    const renderTextFilter = (): JSX.Element => {
        // let unsavedFilter = appliedFilters.find((e) => e.type && !e.value)
        return (
            <div className="position-rel">
                <div
                    className=" h-32 br-4 en-2 bw-1 w-100 fw-4 pt-6 pb-6 pr-10 flexbox"
                    onClick={() => setOpenFilterPopup(true)}
                >
                    <Search className="mr-5 ml-10 icon-dim-18" />
                    {selectedSearchTextType ? (
                        <>
                            <span>{selectedSearchTextType}:</span>
                            <input
                                autoComplete="off"
                                type="text"
                                className="pipeline-filter__search transparent flex-1"
                                autoFocus
                                placeholder={
                                    selectedSearchTextType === 'name'
                                        ? 'Search by node name Eg. ip-172-31-2-152.us-east-2.compute.internal'
                                        : 'Search by key=value Eg. environment=production, tier=frontend'
                                }
                                onKeyDown={handleFilterTag}
                                onChange={handleFilterInput}
                                value={searchInputText}
                            />
                        </>
                    ) : (
                        <span>Search nodes by name or labels</span>
                    )}
                </div>
                {openFilterPopup && (
                    <>
                        <div className="transparent-div" onClick={toggleSelectPipeline}></div>{' '}
                        {!selectedSearchTextType && (
                            <div className="search-popup w-100 bcn-0 position-abs br-4 en-2 bw-1">
                                <div className="search-title pt-4 pb-4 pl-10 pr-10">Search by</div>
                                {[
                                    { value: 1, label: 'name', type: 'main' },
                                    { value: 2, label: 'label', type: 'main' },
                                ].map((o) => {
                                    return (
                                        <div
                                            className="pt-8 pb-8 pl-10 pr-10"
                                            key={o.label}
                                            onClick={() => {
                                                selectFilterType(o)
                                            }}
                                        >
                                            {o.label}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </>
                )}
                {searchApplied ? (
                    <button className="search__clear-button" type="button" onClick={clearTextFilter}>
                        <Clear className="icon-dim-18 icon-n4 vertical-align-middle" />
                    </button>
                ) : null}
            </div>
        )
    }

    const handleApplySelectedColumns = () => {
        setMenuOpen(false)
        setAppliedColumns(selectedColumns)
    }

    const handleMenuState = (menuOpenState: boolean): void => {
        if (menuOpenState) {
            setSelectedColumns(appliedColumns)
        }
        setMenuOpen(menuOpenState)
    }

    const handleCloseFilter = (): void => {
        handleMenuState(false)
        setSelectedColumns(appliedColumns)
    }

    const MenuList = (props: any): JSX.Element => {
        return (
            <components.MenuList {...props}>
                {props.children}
                <div className="flex react-select__bottom bcn-0 p-8">
                    <button className="flex cta apply-filter" onClick={handleApplySelectedColumns}>
                        Apply
                    </button>
                </div>
            </components.MenuList>
        )
    }

    const ValueContainer = (props: any): JSX.Element => {
        const length = props.getValue().length

        return (
            <components.ValueContainer {...props}>
                {length > 0 ? (
                    <>
                        {!props.selectProps.menuIsOpen && (
                            <>
                                <Setting className="icon-dim-16 setting-icon mr-5" />
                                Columns &nbsp;
                                {length === props.options.length ? 'All' : <span className="badge">{length}</span>}
                            </>
                        )}
                        {React.cloneElement(props.children[1])}
                    </>
                ) : (
                    <>{props.children}</>
                )}
            </components.ValueContainer>
        )
    }
    return (
        <div className="search-wrapper ">
            {renderTextFilter()}
            <ReactSelect
                options={[
                    defaultVersion,
                    ...(nodeK8sVersions?.map((version) => ({
                        label: 'K8s version: ' + version,
                        value: version,
                    })) || []),
                ]}
                onChange={onVersionChange}
                components={{
                    IndicatorSeparator: null,
                    DropdownIndicator,
                    Option,
                }}
                value={selectedVersion}
                styles={containerImageSelectStyles}
            />
            <div className="border-left h-20 mt-6"></div>
            <ReactSelect
                menuIsOpen={isMenuOpen}
                name="columns"
                value={selectedColumns}
                options={columnMetadata}
                onChange={setSelectedColumns}
                isMulti={true}
                isSearchable={false}
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                onMenuOpen={() => handleMenuState(true)}
                onMenuClose={handleCloseFilter}
                isOptionDisabled={(option) => option['disabled']}
                components={{
                    Option: OptionWithCheckbox,
                    ValueContainer,
                    IndicatorSeparator: null,
                    ClearIndicator: null,
                    MenuList: (props) => <MenuList {...props} />,
                }}
                styles={{
                    ...containerImageSelectStyles,
                    menuList: (base, state) => ({
                        ...base,
                        borderRadius: '4px',
                        paddingTop: 0,
                        paddingBottom: 0,
                    }),
                    option: (base, state) => ({
                        ...base,
                        padding: '10px 12px',
                        backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
                        color: 'var(--N900)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                    }),
                    dropdownIndicator: (base, state) => ({
                        ...base,
                        color: 'var(--N400)',
                        transition: 'all .2s ease',
                        transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        padding: '0 8px',
                    }),
                }}
            />
        </div>
    )
}
