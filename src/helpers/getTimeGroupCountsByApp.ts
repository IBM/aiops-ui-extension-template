/**
 * © Copyright IBM Corp. 2022, 2025
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ALERT_QUERY_PARAMS,
  ALL_APPS_FIRST_OCC,
  ALL_APPS_LAST_OCC
} from '../components/constants';

type AlertsByApp = {
  [groupKey: string]: {
    [date: string] : number
  }
};

type AlertCountDataPoint = {
  group: string,
  date: string,
  value: number
}

type Insight = {
  id?: string,
  details?: {
    name: string
  }
}

export default function getAlertCountGroups(alerts: Array<{fields: {[key: string]: string}}>, timeWindow: string) {
  const alertsByApp : AlertsByApp = {
    ALL_APPS_FIRST_OCC: {},
    ALL_APPS_LAST_OCC: {}
  };

  const alertCountData: AlertCountDataPoint[] = [];

  const chopOccurrence = (occ: string) => {
    // aggregate by minute
    if (timeWindow === '15Min') return occ.slice(0, -7) + '00.000Z'
    // aggregate by hour
    return occ.slice(0, -10) + '00:00.000Z'
  }

  alerts?.forEach(alertRow => {
    const applicationString = alertRow.fields[ALERT_QUERY_PARAMS.columns.indexOf('@insights.type=\'aiops.ibm.com/insight-type/topology/group\'')];
    let application: Insight = { id: null, details: { name: null } };
    if (applicationString) {
      try {
        application = JSON.parse(applicationString)[0];
      } catch {
        // ignore
      }
    }

    const firstOccurrenceUnchopped : string = alertRow.fields[ALERT_QUERY_PARAMS.columns.indexOf('firstOccurrenceTime')];
    const lastOccurrenceUnchopped : string = alertRow.fields[ALERT_QUERY_PARAMS.columns.indexOf('lastOccurrenceTime')];

    // prepare data for aggregation by minutes or hours
    const firstOccurrence = chopOccurrence(firstOccurrenceUnchopped);
    const lastOccurrence = chopOccurrence(lastOccurrenceUnchopped);


    // data group names as seen in model
    const { id, details: { name } } = application;
    const firstGroupKey = (name || 'None') + '_' + id + '_first';
    const lastGroupKey = (name || 'None') + '_' + id  + '_last';

    // initialize obj if necessary
    if (!alertsByApp[firstGroupKey]?.[firstOccurrence]) alertsByApp[firstGroupKey] = {...alertsByApp[firstGroupKey], [firstOccurrence]: 0};
    if (!alertsByApp[lastGroupKey]?.[lastOccurrence]) alertsByApp[lastGroupKey] = {...alertsByApp[lastGroupKey], [lastOccurrence]: 0};
    if (!alertsByApp[ALL_APPS_FIRST_OCC]?.[firstOccurrence]) alertsByApp[ALL_APPS_FIRST_OCC] = {...alertsByApp[ALL_APPS_FIRST_OCC], [firstOccurrence]: 0};
    if (!alertsByApp[ALL_APPS_LAST_OCC]?.[lastOccurrence]) alertsByApp[ALL_APPS_LAST_OCC] = {...alertsByApp[ALL_APPS_LAST_OCC], [lastOccurrence]: 0};

    // increment alert count for that application + occurrence
    alertsByApp[firstGroupKey][firstOccurrence]++;
    alertsByApp[lastGroupKey][lastOccurrence]++;

    // increment alert count for that occurrence over all apps
    alertsByApp[ALL_APPS_FIRST_OCC][firstOccurrence]++;
    alertsByApp[ALL_APPS_LAST_OCC][lastOccurrence]++;
  });

  for (const groupKey in alertsByApp) {
    for (const date of Object.keys(alertsByApp[groupKey]).sort()) {
      alertCountData.push(
        {
          group: groupKey,
          date: date,
          value: alertsByApp[groupKey][date]
        }
      )
    }
  }

  return alertCountData;
}
