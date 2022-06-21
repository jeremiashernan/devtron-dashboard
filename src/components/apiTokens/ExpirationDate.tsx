import moment from 'moment'
import React, { useState } from 'react'
import ReactSelect from 'react-select'
import { MomentDateFormat } from '../../config'
import { multiSelectStyles } from '../common'
import { DropdownIndicator } from '../security/security.util'
import { getOptions, getDateInMilliseconds } from './authorization.utils'
import SingleDatePickerComponent from './SingleDatePicker'
import { Option } from '../v2/common/ReactSelect.utils'

function ExpirationDate({ selectedExpirationDate, onChangeSelectFormData, handleDatesChange }) {
    const [customDate, setCustomDate] = useState<number>(undefined)
    const [focused, setFocused] = useState(undefined)

    return (
        <div>
            <span className="form__label">
                Expiration <span className="cr-5"> *</span>
            </span>
            <div className="flex left">
                <ReactSelect
                    value={selectedExpirationDate}
                    options={getOptions(customDate)}
                    className="select-width w-200"
                    isSearchable={false}
                    onChange={(e) => onChangeSelectFormData(e)}
                    components={{
                        IndicatorSeparator: null,
                        DropdownIndicator,
                        Option,
                    }}
                    styles={{
                        ...multiSelectStyles,
                    }}
                />
                {selectedExpirationDate.label !== 'Custom...' && (
                    <span className="ml-16 fw-4">
                        <span>This token will expire on</span>&nbsp;
                        {moment(getDateInMilliseconds(selectedExpirationDate.value)).format(MomentDateFormat)}
                    </span>
                )}
                {selectedExpirationDate.label === 'Custom...' && (
                    <div className="w-200 ml-16">
                        <SingleDatePickerComponent
                            date={moment(getDateInMilliseconds(customDate))}
                            handleDatesChange={(e) => handleDatesChange(e, 'customDate')}
                            focused={focused}
                            handleFocusChange={() => setFocused(customDate)}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

export default ExpirationDate
