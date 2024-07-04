/**
 * © Copyright IBM Corp. 2022, 2023
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import useQuery from '../helpers/useQuery';
import { ALERT_QUERY_PARAMS, GROUP_BY as groups } from '../components/constants';
import getStatusGroupCounts from '../helpers/getStatusGroupCounts';
import createPanel from '../app/createPanel';
import TopN from '../components/top-n/TopN';

const TopNPanel = () => {
  const top = 10;
  const query = useQuery('getAlerts', ALERT_QUERY_PARAMS);
  return React.createElement(TopN, { ...query, groups, top, getStatusGroupCounts });
};

export default createPanel(TopNPanel);
