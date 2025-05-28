/**
 * © Copyright IBM Corp. 2022, 2025
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useQuery } from '../helpers/useQuery';
import { ALERT_QUERY_PARAMS } from '../components/constants';
import createPanel from '../app/createPanel';
import Heatmap from '../components/heatmap/Heatmap';

const ApplicationHeatmapPanel = () => {
  const query = useQuery('getAlerts', ALERT_QUERY_PARAMS);
  return React.createElement(Heatmap, query);
};

export default createPanel(ApplicationHeatmapPanel);
