/**
 * © Copyright IBM Corp. 2022, 2023
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Button, Checkbox, Dropdown} from '@carbon/react';
import { LineChart } from '@carbon/charts-react';
import {
  ALERT_QUERY_PARAMS,
  DROPDOWN_ITEMS,
  LINE_CHART_OPTIONS,
  SEVERITIES
} from '../constants';
import getTimeGroupCounts from '../../helpers/getTimeGroupCounts';

import './alert-timeline.scss';

// @ts-ignore
import getReactRenderer from '@ibm/akora-renderer-react';

const ReactRenderer = getReactRenderer(React, ReactDOM);
const { useAkoraState, setUrlParameters } = ReactRenderer.components;

const className = 'alert-timeline';

type AlertCountDataPoint = {
  group: string,
  date: string,
  value: number
}

type ChartDataPoint = {
  date: Date,
  group: string,
  value: number
}


const AlertTimeline = (props: any) => {
  const {
    data,
    loading,
    refetch: fetchAlerts
  } = props;
  const alerts = data?.tenant.alerts.rows;

  const { state, app } = useAkoraState();
  const chartRef = useRef(null);
  const [useFirstOccurrence, setUseFirstOccurrence] = useState(true);
  const [useLastOccurrence, setUseLastOccurrence] = useState(false);
  // we want to rerender when timewindow updates but we also want to use it in event listener so we need ref + state mgmt
  const [timeWindow, setTimeWindow] = useState('15Min');
  const timeWindowRef = useRef('15Min');
  const targetUrl = app.resolvePathExpression(state.path);
  const { title } = app.getStateForPath(targetUrl);
  const alertCountGroups = useMemo(() => getTimeGroupCounts(alerts, timeWindow), [alerts, timeWindow]);

  const getTimeWindowLeftEdge = () => {
    // replace with line below for accurate chart (this date is for example purposes)
    const threshold = new Date("2023-08-22T16:49:00.000Z")
    // const threshold = new Date(); // todo change to date now
    let dateThresh;
    // window is either last 15 min or last 24 hours
    if (timeWindow === '15Min') {
      dateThresh = threshold;
      dateThresh.setMinutes(threshold.getMinutes() - 15);
    } else {
      dateThresh = new Date(threshold.getTime() - (24 * 60 * 60 * 1000));
    }
    return dateThresh.toISOString();
  }

  const onPointClick = (filterStr: string) => {
    const newRoute = setUrlParameters(state?.resolvedFullPath || state?.fullPath, { filtername: 'All alerts', filterwhereclause: filterStr });
    app.replaceRoute(newRoute);
  }

  const getFilteredFirstLast = (alertCount: AlertCountDataPoint[]) => {
    // filter out first occurrence data points if necessary
    const filteredFirst = useFirstOccurrence ? alertCount : alertCount.filter((dp) => dp.group.slice(-5) !== 'first')
    // filter out last occurrence data points if necessary
    const filteredLast = useLastOccurrence ? filteredFirst : filteredFirst.filter((dp) => dp.group.slice(-4) !== 'last')
    const timeCutoff = getTimeWindowLeftEdge();
    // remove data points outside time window (because alert query filters on firstOcc >= cutoff OR lastOcc >= cutoff)
    const filteredDate = filteredLast.filter((dp) => dp.date >= timeCutoff);
    return filteredDate;
  }

  // we want alerts that have a first occurrence within window or a last occurrence within window
  const getQueryFilter = (filter: string) => {
    const timeCutoff = getTimeWindowLeftEdge();
    const firstOccFilter = `firstOccurrenceTime >= '${timeCutoff}'`;
    const lastOccFilter = `lastOccurrenceTime >= '${timeCutoff}'`;
    return filter + ` and (${firstOccFilter} or ${lastOccFilter})`
  }

  const getUrlFilter = (datum: ChartDataPoint) => {
    const windowLeftEdge = datum.date;
    let windowRightEdge;
    if (timeWindowRef.current === '15Min') {
      // aggregate by minute so add one minute
      windowRightEdge = new Date(windowLeftEdge.getTime() + 60 * 1000);
    } else {
      // aggregate by hour so add one hour
      windowRightEdge = new Date(windowLeftEdge.getTime() + 60 * 60 * 1000);
    }
    const occType = datum.group.slice(-5) === 'first' ? 'firstOccurrenceTime' : 'lastOccurrenceTime';
    const filterTemplate = `state != 'clear' and ${occType} >= '${windowLeftEdge.toISOString()}' and ${occType} < '${windowRightEdge.toISOString()}'`
    const severityStr = datum.group.slice(0, datum.group.indexOf('_'));
    const severity = severityStr === 'AllSeverities' ? 7 : SEVERITIES.indexOf(severityStr);
    const filterWithSeverity = severity < 7 ? (filterTemplate + ` and severity = ${severity.toString()}`) : filterTemplate;
    return filterWithSeverity;
  }

  // we refetch data everytime we click refresh OR change time window. we don't refresh for occurrence type change but we do refilter
  const getAlertOptions = () => {
    return (
      <div className={`${className}-options`}>
        <div className={`${className}-options-firstrow`}>
          <Dropdown
            id='timewindow-dropdown'
            label='Time window'
            items={Object.keys(DROPDOWN_ITEMS)} itemToString={(item) => DROPDOWN_ITEMS[item]}
            selectedItem={timeWindow}
            onChange={(e) => {setTimeWindow(e.selectedItem); timeWindowRef.current = e.selectedItem}}
            type='inline'
          />
          <Checkbox labelText='First occurrence' id='first-occur-chkbox' checked={useFirstOccurrence} onChange={(e, {checked}) => setUseFirstOccurrence(checked)}/>
          <Checkbox labelText='Last occurrence' id='last-occur-chkbox' checked={useLastOccurrence} onChange={(e, {checked}) => setUseLastOccurrence(checked)}/>
        </div>
        <Button
          className={`${className}__reset`}
          disabled={loading}
          kind='ghost'
          onClick={() => onPointClick('')}>
          Reset filter
        </Button>
      </div>
    )
  }

  useEffect(() => {
    const onRefresh = (e: any) => {
      if (e.data === 'alertsrefresh' && e.origin === state.clientConfiguration.publicurl) {
        fetchAlerts({ filter: getQueryFilter(ALERT_QUERY_PARAMS.filter) });
      }
    }
    window.addEventListener('message', onRefresh, false);
    chartRef.current?.chart.services.events.addEventListener('scatter-click', (e : any) => {
      onPointClick(getUrlFilter(e.detail.datum));
    });
    fetchAlerts({ filter: getQueryFilter(ALERT_QUERY_PARAMS.filter) });
    return () => window.removeEventListener('message', onRefresh);
  }, []);

  useEffect(() => {
    fetchAlerts({ filter: getQueryFilter(ALERT_QUERY_PARAMS.filter) });
  }, [timeWindow])

  return (
    <div className={className} role='contentinfo'>
      <div className={`${className}__heading`}>
        {title}
      </div>
      <div className={`${className}__chart`}>
        {getAlertOptions()}
        <LineChart data={getFilteredFirstLast(alertCountGroups)} options={{...LINE_CHART_OPTIONS, data: { loading }}} ref={chartRef}/>
      </div>
    </div>
  );
};

export default AlertTimeline;
