/**
 * © Copyright IBM Corp. 2022, 2025
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import IncidentPieChart from './IncidentPieChart';
import { INCIDENT_GROUPBY as columns, PIECHART_TIMEFRAME as timeframe, PIECHART_ALERTSCOUNT as alertsCountFilter }  from '../constants';
import mockIncidents from '../../mocks/incidents.json';

export default {
  title: 'Incidents distribution',
  component: IncidentPieChart,
  argTypes: {
    data: {
      control: 'object'
    },
    columns: {
      control: 'object'
    },
    timeframe: {
      control: 'object'
    },
    alertsCountFilter: {
      control: 'object'
    }
  }
};

const Template = (args: {data: {}, columns: [], timeframe: [], alertsCountFilter: []}) => <IncidentPieChart {...args} refetch={() => {}} />

export const Default = Template.bind({});
Default.args = { // @ts-ignore
  data: mockIncidents.data,
  columns,
  timeframe,
  alertsCountFilter
};

export const Skeleton = () => {
  return (
    <div style={{border: '1px solid #E0E0E0'}}>
      <IncidentPieChart columns={columns} loading={true} refetch={() => {}} timeframe={timeframe} alertsCountFilter={alertsCountFilter}/>
    </div>
  );
};
