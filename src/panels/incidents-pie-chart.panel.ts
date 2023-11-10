/**
 * © Copyright IBM Corp. 2022, 2023
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import useQuery from '../helpers/useQuery';
import { INCIDENT_QUERY_PARAMS, INCIDENT_GROUPBY as columns, PIECHART_TIMEFRAME as timeframe, PIECHART_ALERTSCOUNT as alertsCountFilter } from '../components/constants';
import createPanel from '../app/createPanel';
import IncidentPieChart from '../components/incident-pie-chart/IncidentPieChart';

const IncidentPieChartPanel = () => {
  const query = useQuery('getStories', INCIDENT_QUERY_PARAMS);
  return React.createElement(IncidentPieChart, { ...query, columns, timeframe, alertsCountFilter });
};

export default createPanel(IncidentPieChartPanel);
