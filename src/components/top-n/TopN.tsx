/**
 * © Copyright IBM Corp. 2022, 2023
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { Button, Dropdown } from '@carbon/react';
// @ts-ignore
import { SimpleBarChart } from '@carbon/charts-react';

// @ts-ignore
import getReactRenderer from '@ibm/akora-renderer-react';

import { TOP_N_TIMEFRAME } from '../constants';

import './top-n.scss';

const ReactRenderer = getReactRenderer(React, ReactDOM);
const { useAkoraState, setUrlParameters } = ReactRenderer.components;

const className = 'top-n';

const TopN = (props: any) => {
  const {
    data,
    loading,
    refetch: fetchThings,
    groups,
    top = 10,
    getStatusGroupCounts,
    things = 'alerts',
    timeProp = 'firstOccurrenceTime',
    thresholds
  } = props;
  const dataPoints = data?.tenant[things].rows || data?.tenant[things];

  const { state, app } = useAkoraState();
  const [selectedGroup, _setSelectedGroup] = useState<{label: string, value: string}>(groups?.[1]);
  const [selectedTimeframe, _setSelectedTimeframe] = useState<{label: string, value: string}>(TOP_N_TIMEFRAME(timeProp)[0]);
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
    const newRoute = setUrlParameters(state?.resolvedFullPath || state?.fullPath, { filtername: `All ${things}`, filterwhereclause });
    app.replaceRoute(newRoute);
  }

  const bars = useMemo(() => {
    if (dataPoints) {
      const groups = getStatusGroupCounts(groupBy, dataPoints);
      const chartData = Object.keys(groups).sort().map(g => (
        {
          group: g === '-' ? 'None' : g,
          value: groups[g].total.count
        }
      ));
      return chartData.sort((a, b) => b.value - a.value).slice(0, top);
    }
    return [];
  }, [dataPoints, groupBy]);

  useEffect(() => {
    const onRefresh = (e: any) => {
      if (e.data === `${things}refresh` && e.origin === state.clientConfiguration.publicurl) {
        fetchThings({ filter: selectedTimeframeRef.current.value });
      }
    };

    window.addEventListener('message', onRefresh, false);
    fetchThings({ filter: selectedTimeframeRef.current.value });
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
    fetchThings({ filter: selectedTimeframe.value });
  }, [selectedTimeframe]);

  useEffect(() => {
    setSelectedBar(null);
    onStatusClick(selectedTimeframe.value);
  }, [selectedGroup]);

  const getFillColor = (g: string, label?: string, data?: any) => {
    let barColor = '#4589ff';
    if (typeof thresholds === 'object') {
      const values = Object.keys(thresholds).sort().reverse();
      for (let i = 0; i < values.length; i++) {
        if (data?.value >= values[i]) {
          barColor = thresholds[values[i]];
          break;
        }
      }
    }
    const adjustedColor =  (selectedBar && selectedBar === g || !selectedBar) ? barColor : `${barColor}53`
    return adjustedColor;
  };

  const renderChart = () => {
    const options = {
      axes: {
        left: {
          title: `Open ${things}`,
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
      getFillColor,
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
          titleText={''}
          type='inline' />
        <Dropdown
          id='timeframe-selector'
          items={TOP_N_TIMEFRAME(timeProp)}
          label=''
          onChange={({selectedItem}) => setSelectedTimeframe(selectedItem)}
          selectedItem={selectedTimeframe}
          titleText={''}
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
