/**
 * © Copyright IBM Corp. 2022, 2023
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useQuery } from '../helpers/useQuery';
import { ALERT_QUERY_PARAMS } from '../components/constants';
import createPanel from '../app/createPanel';
import AlertTimeline from '../components/alert-timeline/AlertTimeline';

const AlertsTimelinePanel = () => {
  const query = useQuery('getAlerts', ALERT_QUERY_PARAMS);
  return React.createElement(AlertTimeline, query);
};

export default createPanel(AlertsTimelinePanel);
