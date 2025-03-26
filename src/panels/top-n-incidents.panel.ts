/**
 * © Copyright IBM Corp. 2022, 2023
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useQuery } from '../helpers/useQuery';
import { INCIDENT_QUERY_PARAMS, INCIDENT_COUNT_THRESHOLD as thresholds, INCIDENT_GROUPBY as groups } from '../components/constants';
import getStatusGroupCounts from '../helpers/getIncidentGroupCounts';
import createPanel from '../app/createPanel';
import TopN from '../components/top-n/TopN';

const TopNIncidentsPanel = () => {
  const top = 10;
  const query = useQuery('getStories', INCIDENT_QUERY_PARAMS);
  return React.createElement(TopN, { ...query, groups, top, getStatusGroupCounts, things: 'stories', timeProp: 'createdTime', thresholds });
};

export default createPanel(TopNIncidentsPanel);
