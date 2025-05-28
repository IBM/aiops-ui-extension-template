/**
 * © Copyright IBM Corp. 2022, 2025
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import StatusGroups from './StatusGroups';
import { GROUP_BY as groups } from '../constants';
import mockAlerts from '../../mocks/alerts.json';

export default {
  title: 'Alerts workflow',
  component: StatusGroups,
  argTypes: {
    data: {
      control: 'object'
    },
    groups: {
      control: 'object'
    }
  }
};

const Template = (args: {data: {}, groups: []}) => <StatusGroups {...args} refetch={() => {}} />

export const Default = Template.bind({});
Default.args = {
  data: mockAlerts.data,
  groups
};

export const Skeleton = () => {
  return (
    <div style={{width: '17.5rem', border: '1px solid #E0E0E0'}}>
      <StatusGroups groups={groups} loading={true} refetch={() => {}} />
    </div>
  );
};

