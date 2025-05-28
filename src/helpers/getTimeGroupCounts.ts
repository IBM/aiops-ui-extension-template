/**
 * © Copyright IBM Corp. 2022, 2025
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ALERT_QUERY_PARAMS,
  ALL_SEVS_FIRST_OCC,
  ALL_SEVS_LAST_OCC,
  SEVERITIES
} from '../components/constants';

type AlertsBySev = {
  [groupKey: string]: {
    [date: string] : number
  }
};

type AlertCountDataPoint = {
  group: string,
  date: string,
  value: number
}

export default function getAlertCountGroups(alerts: Array<{fields: {[key: string]: string}}>, timeWindow: string) {
  const alertsBySev : AlertsBySev = {
    ALL_SEVS_FIRST_OCC: {},
    ALL_SEVS_LAST_OCC: {}
  };

  const alertCountData: AlertCountDataPoint[] = [];

  const chopOccurrence = (occ: string) => {
    // aggregate by minute
    if (timeWindow === '15Min') return occ.slice(0, -7) + '00.000Z'
    // aggregate by hour
    return occ.slice(0, -10) + '00:00.000Z'
  }

  alerts?.forEach(alertRow => {
    const severity = +alertRow.fields[ALERT_QUERY_PARAMS.columns.indexOf('severity')];
    const firstOccurrenceUnchopped : string = alertRow.fields[ALERT_QUERY_PARAMS.columns.indexOf('firstOccurrenceTime')];
    const lastOccurrenceUnchopped : string = alertRow.fields[ALERT_QUERY_PARAMS.columns.indexOf('lastOccurrenceTime')];

    // prepare data for aggregation by minutes or hours
    const firstOccurrence = chopOccurrence(firstOccurrenceUnchopped);
    const lastOccurrence = chopOccurrence(lastOccurrenceUnchopped);


    // data group names as seen in model
    const firstGroupKey = SEVERITIES[severity] + '_first';
    const lastGroupKey = SEVERITIES[severity] + '_last';

    // initialize obj if necessary
    if (!alertsBySev[firstGroupKey]?.[firstOccurrence]) alertsBySev[firstGroupKey] = {...alertsBySev[firstGroupKey], [firstOccurrence]: 0};
    if (!alertsBySev[lastGroupKey]?.[lastOccurrence]) alertsBySev[lastGroupKey] = {...alertsBySev[lastGroupKey], [lastOccurrence]: 0};
    if (!alertsBySev[ALL_SEVS_FIRST_OCC]?.[firstOccurrence]) alertsBySev[ALL_SEVS_FIRST_OCC] = {...alertsBySev[ALL_SEVS_FIRST_OCC], [firstOccurrence]: 0};
    if (!alertsBySev[ALL_SEVS_LAST_OCC]?.[lastOccurrence]) alertsBySev[ALL_SEVS_LAST_OCC] = {...alertsBySev[ALL_SEVS_LAST_OCC], [lastOccurrence]: 0};

    // increment alert count for that severity + occurrence
    alertsBySev[firstGroupKey][firstOccurrence]++;
    alertsBySev[lastGroupKey][lastOccurrence]++;

    // increment alert count for that occurrence over all sevs
    alertsBySev[ALL_SEVS_FIRST_OCC][firstOccurrence]++;
    alertsBySev[ALL_SEVS_LAST_OCC][lastOccurrence]++;
  });

  for (const groupKey in alertsBySev) {
    for (const date of Object.keys(alertsBySev[groupKey]).sort()) {
      alertCountData.push(
        {
          group: groupKey,
          date: date,
          value: alertsBySev[groupKey][date]
        }
      )
    }
  }

  return alertCountData;
}
