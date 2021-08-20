import React from 'react';
import Creatable from 'react-select/creatable';
import { ClearIndicator, MultiValueRemove, MultiValueChipContainer } from '../../common';

export default function TagLabelSelect({ validateTags, labelTags, onInputChange, onKeyDown, onTagsChange, onCreatableBlur }) {

    const CreatableChipStyle = {
        multiValue: (base, state) => {
            return ({
                ...base,
                border: validateTags(state.data.value) ? `1px solid var(--N200)` : `1px solid var(--R500)`,
                borderRadius: `4px`,
                background: validateTags(state.data.value) ? 'white' : 'var(--R100)',
                height: '28px',
                margin: '8px 8px 4px 0px',
                paddingLeft: '4px',
                fontSize: '12px',
            })
        },
        control: (base, state) => ({
            ...base,
            border: state.isFocused ? '1px solid #06c' : '1px solid #d0d4d9', // default border color
            boxShadow: 'none', // no box-shadow
            minHeight: '72px',
            alignItems: "end",
        }),
        indicatorsContainer: () => ({
            height: '28px'
        })
    }

    return (
        <div>
            <span className="form__label cn-6"> Tags (only key:value allowed)</span>
            <Creatable
                className={"create-app_tags"}
                components={{
                    DropdownIndicator: () => null,
                    ClearIndicator,
                    MultiValueRemove,
                    MultiValueContainer: ({ ...props }) => <MultiValueChipContainer {...props} validator={validateTags} />,
                    IndicatorSeparator: () => null,
                    Menu: () => null,
                }}
                styles={CreatableChipStyle}
                autoFocus
                isMulti
                isClearable
                inputValue={labelTags.inputTagValue}
                placeholder="Add a tag..."
                isValidNewOption={() => false}
                backspaceRemovesValue
                value={labelTags.tags}
                onBlur={onCreatableBlur}
                onInputChange={onInputChange}
                onKeyDown={onKeyDown}
                onChange={onTagsChange}
            />
        </div>
    )
}

