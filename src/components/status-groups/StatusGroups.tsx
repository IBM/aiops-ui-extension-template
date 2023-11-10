/**
 * © Copyright IBM Corp. 2022, 2023
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { Accordion, AccordionItem, AccordionSkeleton, Button, Dropdown } from '@carbon/react';

// @ts-ignore
import getReactRenderer from '@ibm/akora-renderer-react';

import StatusCard from './status-card/StatusCard';
import { COLORS, SEVERITIES } from '../constants';
import getStatusGroupCounts from '../../helpers/getStatusGroupCounts';

import './status-groups.scss';

const ReactRenderer = getReactRenderer(React, ReactDOM);
const { useAkoraState, setUrlParameters } = ReactRenderer.components;

const className = 'status-groups';

const StatusGroups = (props: any) => {
  const {
    data,
    loading,
    refetch: fetchAlerts,
    groups
  } = props;
  const alerts = data?.tenant.alerts.rows;
  
  const { state, app } = useAkoraState();
  const [selectedGroup, setSelectedGroup] = useState<{label: string, value: string}>(groups?.[0]);
  
  const targetUrl = app.resolvePathExpression(state.path);
  const { title } = app.getStateForPath(targetUrl);
  const groupBy = selectedGroup?.value;

  const statusGroups = useMemo(() => {
    if (alerts) return getStatusGroupCounts(groupBy, alerts);
    return {};
  }, [alerts, groupBy]);
  
  const onStatusClick = (filterwhereclause: string) => {
    const newRoute = setUrlParameters(state?.resolvedFullPath || state?.fullPath, { filtername: 'All alerts', filterwhereclause });
    app.replaceRoute(newRoute); 
  }
  
  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return parseFloat((value / 1000000).toFixed(1)) + `M`
    } else if (value >= 1000) {
      return parseFloat((value / 1000).toFixed(1)) + `k`
    }
    return value;
  }
  
  const getStatusList = (groupKey: string, severity?: number) => { 
    const statusGroup = statusGroups[groupKey];
    const statusList: Array<Status> = [];
    const getCount = (status: string) => severity ? statusGroup[status][`sev-${severity}`] : statusGroup[status].count;
    const getColor = (status: string) => severity ? COLORS[getCount(status) === 0 ? 0 : severity] : COLORS[statusGroup[status].maxSeverity];

    statusList.push({
      title: `${getCount('new')} new`,
      value: formatValue(getCount('new')),
      color: getColor('new'),
      onClick: () => onStatusClick(`acknowledged = false and relatedStoryIds = '[]' and relatedContextualStoryIds = '[]'`
        + (severity ? ` and severity = ${severity}` : '')
        + (groupBy ? ` and ${groupBy} = '${groupKey}'` : ''))
    });
    statusList.push({
      title: `${getCount('acknowledged')} acknowledged`,
      value: formatValue(getCount('acknowledged')),
      color: getColor('acknowledged'),
      onClick: () => onStatusClick(`acknowledged = true and relatedStoryIds = '[]' and relatedContextualStoryIds = '[]'`
        + (severity ? ` and severity = ${severity}` : '')
        + (groupBy ? ` and ${groupBy} = '${groupKey}'` : ''))
    });
    statusList.push({
      title: `${getCount('ticketed')} ticketed`,
      value: formatValue(getCount('ticketed')),
      color: getColor('ticketed'),
      onClick: () => onStatusClick(`(relatedStoryIds != '[]' or relatedContextualStoryIds != '[]')`
        + (severity ? ` and severity = ${severity}` : '')
        + (groupBy ? ` and ${groupBy} = '${groupKey}'` : ''))
    });   
    return statusList;
  }
  
  const renderHeader = () => (
    <>
      <div className={`${className}__heading`}>
        {title}
        <span className={`${className}__subheading`}>New / Ack'd / Tkt'd</span>
      </div>
      <Dropdown
        className={`${className}__groupby`}
        id='status-group-selector'
        items={groups}
        label=''
        onChange={({selectedItem}) => setSelectedGroup(selectedItem)}
        selectedItem={selectedGroup}
        type='inline' />
    </>
  );
  
  const renderStatusList = () => Object.keys(statusGroups).sort().map((g) => (
    <AccordionItem title={<StatusCard label={g === '-' ? 'None' : g} statusList={getStatusList(g)} />} >
      {[6, 5, 4, 3, 2, 1].reduce((acc: Array<React.JSX.Element>, sev: number) => {
        const nextSeverity = getStatusList(g, sev);
        if (nextSeverity.find((s) => s.value !== 0)) {
          acc.push(<StatusCard label={SEVERITIES[sev]} statusList={getStatusList(g, sev)} />);
        }
        return acc;
      }, [])}
    </AccordionItem>
  ));
    
  const renderResetButton = () => (
    <Button
      className={`${className}__reset`}
      disabled={loading}
      kind='secondary'
      onClick={() => onStatusClick('')}>
      Reset filter
    </Button>
  );
  
  useEffect(() => {
    const onRefresh = (e: any) => {
      if (e.data === 'alertsrefresh' && e.origin === state.clientConfiguration.publicurl) {
        fetchAlerts();
      }
    }
    window.addEventListener('message', onRefresh, false);
    fetchAlerts();
    return () => window.removeEventListener('message', onRefresh);
  }, []);
  
  useEffect(() => {
    onStatusClick('');
    fetchAlerts();
  }, [selectedGroup]);

  return (
    <div className={className} role='contentinfo'>
      {renderHeader()}
      { loading ?
        <AccordionSkeleton className={`${className}__scroll-area`} /> :
        <Accordion className={`${className}__scroll-area`}>
          {renderStatusList()}
        </Accordion>
      }
      {renderResetButton()}
    </div>
  );
};

export default StatusGroups;
