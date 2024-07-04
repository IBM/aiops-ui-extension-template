/**
 * © Copyright IBM Corp. 2022, 2023
 * SPDX-License-Identifier: Apache-2.0
 */

import { ALERT_QUERY_PARAMS } from '../components/constants';

export default function getStatusGroupCounts(groupBy: string, rows: Array<{fields: {[key: string]: string}}>) {
  const statusGroupCounts: StatusGroupCounts = {};

  rows.forEach(alertRow => {
    const groupKey = alertRow.fields[ALERT_QUERY_PARAMS.columns.indexOf(groupBy)] || 'All alerts';
    const acknowledged = alertRow.fields[ALERT_QUERY_PARAMS.columns.indexOf('acknowledged')] === 'true';
    const severity = +alertRow.fields[ALERT_QUERY_PARAMS.columns.indexOf('severity')];
    let ticketed = false;
    try {
      const hasRelatedStories = (JSON.parse(alertRow.fields[ALERT_QUERY_PARAMS.columns.indexOf('relatedStoryIds')]) as Array<string>).length > 0;
      const hasRelatedContextualStoryIds = (JSON.parse(alertRow.fields[ALERT_QUERY_PARAMS.columns.indexOf('relatedContextualStoryIds')]) as Array<string>).length > 0;
      ticketed = hasRelatedStories || hasRelatedContextualStoryIds;
    } catch (e) {
      // ignore for now
    }

    if (!statusGroupCounts[groupKey]) {
      statusGroupCounts[groupKey] = {
        ticketed: { count: 0, maxSeverity: 0 },
        acknowledged: { count: 0, maxSeverity: 0 },
        new: { count: 0, maxSeverity: 0 },
        total: { count: 0, maxSeverity: 0 }
      };
      for (let i = 0; i < 6; i++ ) {
        statusGroupCounts[groupKey].ticketed[`sev-${i + 1}`] = 0;
        statusGroupCounts[groupKey].acknowledged[`sev-${i + 1}`] = 0;
        statusGroupCounts[groupKey].new[`sev-${i + 1}`] = 0;
      }
    }
    if (ticketed) {
      statusGroupCounts[groupKey].ticketed.count++;
      statusGroupCounts[groupKey].ticketed.maxSeverity = Math.max(severity, statusGroupCounts[groupKey].ticketed.maxSeverity);
      statusGroupCounts[groupKey].ticketed[`sev-${severity}`]++;
    } else if (acknowledged) {
      statusGroupCounts[groupKey].acknowledged.count++;
      statusGroupCounts[groupKey].acknowledged.maxSeverity = Math.max(severity, statusGroupCounts[groupKey].acknowledged.maxSeverity);
      statusGroupCounts[groupKey].acknowledged[`sev-${severity}`]++;
    } else {
      statusGroupCounts[groupKey].new.count++;
      statusGroupCounts[groupKey].new.maxSeverity = Math.max(severity, statusGroupCounts[groupKey].new.maxSeverity);
      statusGroupCounts[groupKey].new[`sev-${severity}`]++;
    }
    statusGroupCounts[groupKey].total.count++;
    statusGroupCounts[groupKey].total.maxSeverity = Math.max(severity, statusGroupCounts[groupKey].total.maxSeverity);
    statusGroupCounts[groupKey].total[`sev-${severity}`]++;
  });

  return statusGroupCounts;
}
