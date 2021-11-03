import React from 'react'
import TableUtil from '../../../../utils/tableUtils/Table.util'


const EventTableJSON = {
    tHead: [
        { value: "Reason", className:"pl-20 pr-20" },
        { value: "Message" },
        { value: "Count" },
        { value: "Last Time stamp" },
    ],
    tBody: [
        [
            { value: "Pulled", className:"pl-20 pr-20" },
            { value: "Container image docker.elastic.co/elasticsearch/elasticsearch:7.9.1 already present on machine" },
            { value: "0" },
            { value: "Wed, 19 Jun 2019, 16:02 PM" },
        ],
        [
            { value: "Back off", className:"pl-20 pr-20" },
            { value: "Back-off restarting failed container" },
            { value: "0" },
            { value: "Wed, 19 Jun 2019, 16:02 PM" },
        ],
        [
            { value: "FailedGetResourceMetric", className:"pl-20 pr-20" },
            { value: "missing request for memory" },
            { value: "0" },
            { value: "Wed, 19 Jun 2019, 16:02 PM" },
        ]
    ]
}
function EventsComponent() {

    return (
        <div className="bcn-0" >
            <TableUtil table={EventTableJSON} bodyFont="SourceCodePro"/>
        </div>
    )
}

export default EventsComponent