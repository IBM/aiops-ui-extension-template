/**
 * © Copyright IBM Corp. 2022, 2023
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import TopN from './TopN';
import { GROUP_BY as groups, INCIDENT_GROUPBY as incidentGroups, INCIDENT_COUNT_THRESHOLD as thresholds } from '../constants';
import mockAlerts from '../../mocks/alerts.json';
import mockIncidents from '../../mocks/incidents.json';
import getAlertStatusGroupCounts from '../../helpers/getStatusGroupCounts';
import getIncidentGroupCounts from '../../helpers/getIncidentGroupCounts';

export default {
  title: 'Top 10',
  component: TopN,
  argTypes: {
    data: {
      control: 'object'
    },
    groups: {
      control: 'object'
    },
    top: {
      control: { type: 'number', min: 1, step: 1 }
    }
  }
};

const Template = (args: {data: {}, groups: [], top: number}) => <TopN {...args} refetch={() => {}} />

export const Default = Template.bind({});
Default.args = {
  data: mockAlerts.data,
  groups,
  top: 10,
  getStatusGroupCounts: getAlertStatusGroupCounts
};

export const Incidents = () => {
  return (
    <div style={{border: '1px solid #E0E0E0'}}>
      <TopN data={mockIncidents.data} groups={incidentGroups} refetch={() => {}} things={'stories'} timeProp={'createdTime'} getStatusGroupCounts={getIncidentGroupCounts} thresholds={thresholds} />
    </div>
  );
};

export const Skeleton = () => {
  return (
    <div style={{border: '1px solid #E0E0E0'}}>
      <TopN groups={groups} loading={true} refetch={() => {}}/>
    </div>
  );
};
