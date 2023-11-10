/**
 * © Copyright IBM Corp. 2022, 2023
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { Button, Dropdown } from '@carbon/react';
import { SimpleBarChart } from '@carbon/charts-react';

// @ts-ignore
import getReactRenderer from '@ibm/akora-renderer-react';

import { TOP_N_TIMEFRAME } from '../constants';
import getStatusGroupCounts from '../../helpers/getStatusGroupCounts';

import './top-n.scss';

const ReactRenderer = getReactRenderer(React, ReactDOM);
const { useAkoraState, setUrlParameters } = ReactRenderer.components;

const className = 'top-n';

const TopN = (props: any) => {
  const {
    data,
    loading,
    refetch: fetchAlerts,
    groups,
    top = 10
  } = props;
  const alerts = data?.tenant.alerts.rows;

  const { state, app } = useAkoraState();
  const [selectedGroup, _setSelectedGroup] = useState<{label: string, value: string}>(groups?.[1]);
  const [selectedTimeframe, _setSelectedTimeframe] = useState<{label: string, value: string}>(TOP_N_TIMEFRAME[0]);
  const [selectedBar, setSelectedBar] = useState();

  // use a ref since event listeners don't have access to latest state
  const selectedGroupRef = useRef(selectedGroup);
  const setSelectedGroup = (group: any) => {
    selectedGroupRef.current = group;
    _setSelectedGroup(group);
  };
  const selectedTimeframeRef = useRef(selectedTimeframe);
  const setSelectedTimeframe = (timeframe: any) => {
    selectedTimeframeRef.current = timeframe;
    _setSelectedTimeframe(timeframe);
  };
  
  const barChartRef = useRef(null);
  
  const targetUrl = app.resolvePathExpression(state.path);
  const { title } = app.getStateForPath(targetUrl);
  const groupBy = selectedGroup.value;
  
  const onStatusClick = (filterwhereclause: string) => {
    const newRoute = setUrlParameters(state?.resolvedFullPath || state?.fullPath, { filtername: 'All alerts', filterwhereclause });
    app.replaceRoute(newRoute); 
  }
  
  const bars = useMemo(() => {
    if (alerts) {
      const groups = getStatusGroupCounts(groupBy, alerts);
      const chartData = Object.keys(groups).sort().map(g => (
        {
          group: g === '-' ? 'None' : g, 
          value: groups[g].new.count + 
            groups[g].acknowledged.count + 
            groups[g].ticketed.count
        }
      ));
      return chartData.sort((a, b) => b.value - a.value).slice(0, top);
    }
    return [];
  }, [alerts, groupBy]);
  
  useEffect(() => {
    const onRefresh = (e: any) => {
      if (e.data === 'alertsrefresh' && e.origin === state.clientConfiguration.publicurl) {
        fetchAlerts({ filter: selectedTimeframeRef.current.value });
      }
    };

    window.addEventListener('message', onRefresh, false);
    fetchAlerts({ filter: selectedTimeframeRef.current.value });
    return () => window.removeEventListener('message', onRefresh);
  }, []);
  
  useEffect(() => {
    const onBarClick = (e: any) => {
      const whichGroup = e.detail.datum.group;
      const filter = [];
      if (selectedGroupRef.current.value) filter.push(`${selectedGroupRef.current.value} = '${whichGroup === 'None' ? '-' : whichGroup}'`);
      if (selectedTimeframeRef.current.value) filter.push(selectedTimeframeRef.current.value);
      onStatusClick(filter.join(' and '));
      setSelectedBar(whichGroup);
    }
    
    barChartRef.current.chart.services.events.addEventListener(
      'bar-click',
      onBarClick
    );
    
    return () => {
      if (barChartRef.current) {
        barChartRef.current.chart.services.events.removeEventListener(
          'bar-click',
          onBarClick
        );
      }
    };
  }, [barChartRef])
  
  useEffect(() => {
    setSelectedBar(null);
    onStatusClick(selectedTimeframe.value);
    fetchAlerts({ filter: selectedTimeframe.value });
  }, [selectedTimeframe]);
  
  useEffect(() => {
    setSelectedBar(null);
    onStatusClick(selectedTimeframe.value);
  }, [selectedGroup]);
  
  const renderChart = () => {
    const options = {
      axes: {
        left: {
          title: 'Open alerts',
          mapsTo: 'value'
        },
        bottom: {
          title: selectedGroup.label,
          mapsTo: 'group',
          scaleType: 'labels'
        }
      },
      bars: {
        maxWidth: 40
      },
      data: {
        loading
      },
      getFillColor: (g: string) => (selectedBar && selectedBar === g || !selectedBar) ? '#4589ff' : '#4589ff53',
      height: '400px',
      legend: {
        enabled: false
      }
    };
    
    return (
      <div className={`${className}__chart`}>
        <SimpleBarChart
          data={bars} // @ts-ignore
          options={options}
          ref={barChartRef}>
        </SimpleBarChart>
      </div>
    );
  };
  
  const renderHeader = () => (
    <>
      <div className={`${className}__heading`}>
        {title}
      </div>
      <div className={`${className}__selectors`}>
        <Dropdown
          id='group-selector'
          items={groups}
          label=''
          onChange={({selectedItem}) => setSelectedGroup(selectedItem)}
          selectedItem={selectedGroup}
          type='inline' />
        <Dropdown
          id='timeframe-selector'
          items={TOP_N_TIMEFRAME}
          label=''
          onChange={({selectedItem}) => setSelectedTimeframe(selectedItem)}
          selectedItem={selectedTimeframe}
          type='inline' />
        <Button
          className={`${className}__reset`}
          disabled={loading || !selectedBar}
          kind='ghost'
          onClick={() => {
            onStatusClick(selectedTimeframe.value);
            setSelectedBar(null);
          }}>
          Reset filter
        </Button>
      </div>
    </>
  );
 
  return (
    <div className={className} role='contentinfo'>
      {renderHeader()}
      {renderChart()}
    </div>
	);
};

export default TopN;
