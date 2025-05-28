/**
 * © Copyright IBM Corp. 2022, 2025
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Button, Dropdown } from '@carbon/react';
// @ts-ignore
import { PieChart } from '@carbon/charts-react';

// @ts-ignore
import getReactRenderer from '@ibm/akora-renderer-react';

import { PIECHART_TIMEFRAME, PRIORITY_COLORS_STROKE, PRIORITY_COLORS, PLEASANT_COLORS } from '../constants';

import './IncidentPieChart.scss';

interface Incidents {
  id: string;
  title: string;
  description: string;
  priority: number;
  state: string;
  owner: string;
  team: string;
  alertIds: string[];
  contextualAlertIds: string[];
  insights: Insights[];
  createdTime: string;
}
interface Insights {
  type: string;
  source: string | null;
  details: {
    id: string;
    rank: number;
    time: number;
  }
}
interface GraphColors {
  [groupName: string]: string;
}
type GroupedCount = { group: any; value: number };

const ReactRenderer = getReactRenderer(React, ReactDOM);
const { useAkoraState, setUrlParameters } = ReactRenderer.components;

const className = 'incident-pie-chart';

const IncidentPieChart = (props: any) => {
  const {
    data,
    loading,
    refetch: fetchIncidents,
    columns,
    timeframe = PIECHART_TIMEFRAME,
    alertsCountFilter,
  } = props;

  const incidents: Incidents[] = data?.tenant.stories;

  const { state, app } = useAkoraState();
  const [selectedColumn, _setSelectedColumn] = useState<{label: string, value: string}>(columns?.[1]);
  const [selectedTimeframe, _setSelectedTimeframe] = useState<{label: string, value: string}>(timeframe[0]);
  const [selectedAlertsCount, setSelectedAlertsCount] = useState<{label: string, value: number}>(alertsCountFilter[0]);
  const [selectedSlice, setSelectedSlice] = useState();
  const [graphColors, setGraphColors] = useState<GraphColors>({});

  // use a ref since event listeners don't have access to latest state
  const selectedColumnRef = useRef(selectedColumn);
  const setSelectedColumn = (group: any) => {
    selectedColumnRef.current = group;
    _setSelectedColumn(group);
  };
  const selectedTimeframeRef = useRef(selectedTimeframe);
  const setSelectedTimeframe = (timeframe: any) => {
    selectedTimeframeRef.current = timeframe;
    _setSelectedTimeframe(timeframe);
  };

  const pieChartRef = useRef(null);

  const targetUrl = app.resolvePathExpression(state.path);
  const { title } = app.getStateForPath(targetUrl);
  const groupBy = selectedColumn.value;

  const onStatusClick = (filterwhereclause: string) => {
    const newRoute = setUrlParameters(state?.resolvedFullPath || state?.fullPath, { filterwhereclause });
    app.replaceRoute(newRoute);
  }

  function countValues(keyvalue: any, countMap: Map<string, number>, value: number = 1) {
    if (countMap.has(keyvalue)) {
      countMap.set(keyvalue, countMap.get(keyvalue)! + value);
    } else {
      countMap.set(keyvalue, 1);
    }
  }

  type mapStringNumber = Map<string, number>;

  function combineInsights(map1: mapStringNumber, map2: mapStringNumber) {
    map2.forEach((_UNUSED, key) => {
      if (map1.has(key)) {
        map1.set(key, map1.get(key)! + 1);
      } else {
        map1.set(key, 1);
      }
    });
  }

  function countObjectsByKey(objectsArray: Incidents[], key: string): GroupedCount[] {
    const objects = objectsArray
      .filter(obj => obj.alertIds.length > selectedAlertsCount.value)

    const countMap = new Map<any, number>();

    const keyParts = key.split('.');

    for (const obj of objects) {
      let keyValues
      const isDouble = keyParts.length === 2
      if (isDouble) keyValues = obj[keyParts[0] as keyof Incidents];
      else keyValues =  obj[key as keyof Incidents];

      if (Array.isArray(keyValues)) {
        const insightsMap = new Map<any, number>();
        for (const value of keyValues) { // @ts-ignore
          if (isDouble) countValues(value[keyParts[1] as keyof Insights], insightsMap, 0);
          else countValues(value, countMap)
        }
        combineInsights(countMap, insightsMap);
      } else {
        countValues(keyValues, countMap)
      }
    }

    const groupedCounts: GroupedCount[] = Array.from(countMap)
      .map(([group, value]) => ({ group: String(group), value }))

    return groupedCounts;
  }


  const slices = useMemo(() => {
    if (incidents) {
      const chartData = countObjectsByKey(incidents, selectedColumn.value);
      return chartData;
    }
    return [];
  }, [incidents, groupBy, selectedAlertsCount]);

  // the following is necessary if we want to find the defaultColor when calling getFillColor to set selected slice color
  useEffect(()=> {
    const mappedColors: Record<string, string> = {};

    slices.forEach((slice, index) => {
      const groupName = slice.group;
      const color = PLEASANT_COLORS[index % PLEASANT_COLORS.length]; // Use modulo to cycle through colors if there are more groups than colors
      mappedColors[groupName] = color;
    });

    setGraphColors(mappedColors);
  },[slices])

  useEffect(() => {
    const onRefresh = (e: any) => {
      if (e.data === 'incidentsrefresh' && e.origin === state.clientConfiguration.publicurl) {
        fetchIncidents({ filter: selectedTimeframeRef.current.value });
      }
    };

    window.addEventListener('message', onRefresh, false);
    fetchIncidents({ filter: selectedTimeframeRef.current.value });
    return () => window.removeEventListener('message', onRefresh);
  }, []);

  useEffect(() => {
    const chartOnClick = ({ detail }:any) => {
      const whichGroup = detail.datum.data.group;
      if (whichGroup === selectedSlice) {
        onStatusClick(selectedTimeframe.value);
        setSelectedSlice(null);
        return;
      }
      const filter = [];
      if (selectedColumnRef.current.value) filter.push(`${selectedColumnRef.current.value} = '${whichGroup === 'None' ? '-' : whichGroup}'`);
      if (selectedTimeframeRef.current.value) filter.push(selectedTimeframeRef.current.value);
      onStatusClick(filter.join(' and '));
      setSelectedSlice(whichGroup);
    }

    pieChartRef.current.chart.services.events.addEventListener(
      'pie-slice-click',
      chartOnClick
    );

    return () => {
      if (pieChartRef.current) {
        pieChartRef.current.chart.services.events.removeEventListener(
          'pie-slice-click',
          chartOnClick
        );
      }
    };
  }, [pieChartRef, selectedSlice])

  useEffect(() => {
    setSelectedSlice(null);
    onStatusClick(selectedTimeframe.value);
    fetchIncidents({ filter: selectedTimeframe.value });
  }, [selectedTimeframe]);

  useEffect(() => {
    setSelectedSlice(null);
    onStatusClick(selectedTimeframe.value);
  }, [selectedColumn]);

  const renderChart = () => {
    const options = {
      data: {
        loading
      },
      color: {
        scale: graphColors
      },
      pie: {
        sortFunction: ((a:GroupedCount, b:GroupedCount) => {
          return (b.group - a.group)
        }),
      },
      resizable: false,
      tooltip: {
        truncation: {
          type: 'none'
        },
        customHTML: (pointData: any) => {
          const key = selectedColumn.value;
          const label = pointData[0].label;
          const numberOfItems = pointData[0].value;
          const sText = (numberOfItems === '1') ? '' : 's'
          if (label || label === 0) return `<div class="datapoint-tooltip">${numberOfItems} Incident${sText} with ${key} "${label}"</div>`;
          return `<div class="datapoint-tooltip">${numberOfItems} Incident${sText} with empty ${key}</div>`
        },
      },
      height: '400px',
      title: 'Incident distribution',
      getFillColor: (g:any, label:any, data:any, defaultFillColor:any) => {
        const isClicked = selectedSlice && selectedSlice === g || !selectedSlice;
        if (selectedColumn.value === 'priority') {
          return isClicked ? PRIORITY_COLORS[5 - g] : PRIORITY_COLORS_STROKE[5 - g];
        }
        return isClicked ? defaultFillColor : defaultFillColor + '80';
      },
    };

    return (
      <div className={`${className}__chart`}>
        {/* @ts-ignore: TS2769 */}
        <PieChart
          data={slices}
          options={options}
          ref={pieChartRef}
        >
        </PieChart>
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
          items={columns}
          label=''
          titleText=''
          onChange={({selectedItem}) => setSelectedColumn(selectedItem)}
          selectedItem={selectedColumn}
          type='inline' />
        <Dropdown
          id='timeframe-selector'
          items={timeframe}
          label=''
          titleText=''
          onChange={({selectedItem}) => setSelectedTimeframe(selectedItem)}
          selectedItem={selectedTimeframe}
          type='inline' />
        <Dropdown
          id='alertsCount-selector'
          items={alertsCountFilter}
          label=''
          titleText=''
          onChange={({selectedItem}) => setSelectedAlertsCount(selectedItem)}
          selectedItem={selectedAlertsCount}
          type='inline' />
      </div>
    </>
  );

  const renderResetButton = () => (
    <Button
      className={`${className}__reset`}
      disabled={loading || !selectedSlice}
      kind='ghost'
      onClick={() => {
        onStatusClick(selectedTimeframe.value);
        setSelectedSlice(null);
      }}>
      Reset filter
    </Button>
  )


  return (
    <div className={className} role='contentinfo'>
      {renderHeader()}
      {renderResetButton()}
      {renderChart()}
    </div>
  );
};

export default IncidentPieChart;
