/**
 * © Copyright IBM Corp. 2022, 2023
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import TopN from './TopN';
import { GROUP_BY as groups } from '../constants';
import mockAlerts from '../../mocks/alerts.json';

export default {
  title: 'Alerts top 10',
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
  top: 10
};

export const Skeleton = () => {
  return (
    <div style={{border: '1px solid #E0E0E0'}}>
      <TopN groups={groups} loading={true} refetch={() => {}}/>
    </div>
  );
};
