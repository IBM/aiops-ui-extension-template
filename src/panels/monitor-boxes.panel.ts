/**
 * © Copyright IBM Corp. 2025
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import createPanel from '../app/createPanel';
import MonitorBoxCollection from '../components/monitor-box/MonitorBoxCollection';


const MonitorBoxesPanel = () => {
  return React.createElement(MonitorBoxCollection);
};

export default createPanel(MonitorBoxesPanel);
