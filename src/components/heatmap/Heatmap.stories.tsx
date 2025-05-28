/**
 * © Copyright IBM Corp. 2022, 2025
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import Heatmap from './Heatmap';
import mockAlerts from '../../mocks/alerts.json';

export default {
  title: 'Application heatmap',
  component: Heatmap,
  argTypes: {
    data: {
      control: 'object'
    }
  }
};

const Template = (args: {data: {}}) => <Heatmap {...args} refetch={() => {}} />

export const Default = Template.bind({});
Default.args = {
  data: mockAlerts.data
};

export const Skeleton = () => {
  return (
    <div style={{border: '1px solid #E0E0E0'}}>
      <Heatmap loading={true} refetch={() => {}} />
    </div>
  );
};
