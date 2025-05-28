/**
 * © Copyright IBM Corp. 2022, 2025
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import AlertTimeline from './AlertTimeline';
import mockAlerts from '../../mocks/alerts.json';

export default {
  title: 'Alerts timeline',
  component: AlertTimeline,
  argTypes: {
    data: {
      control: 'object'
    }
  }
};

const Template = (args: {data: {}}) => <AlertTimeline {...args} refetch={() => {}} />

export const Default = Template.bind({});
Default.args = {
  data: mockAlerts.data
};

export const Skeleton = () => {
  return (
    <div style={{border: '1px solid #E0E0E0'}}>
      <AlertTimeline loading={true} refetch={() => {}} />
    </div>
  );
};
