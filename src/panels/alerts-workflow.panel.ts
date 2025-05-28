/**
 * © Copyright IBM Corp. 2022, 2025
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useQuery } from '../helpers/useQuery';
import { ALERT_QUERY_PARAMS, GROUP_BY as groups } from '../components/constants';
import createPanel from '../app/createPanel';
import StatusGroups from '../components/status-groups/StatusGroups';


const AlertsWorkflowPanel = () => {
  const query = useQuery('getAlerts', ALERT_QUERY_PARAMS);
  return React.createElement(StatusGroups, { ...query, groups });
};

export default createPanel(AlertsWorkflowPanel);
