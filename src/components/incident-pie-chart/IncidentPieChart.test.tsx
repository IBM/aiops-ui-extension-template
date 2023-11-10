/**
 * © Copyright IBM Corp. 2022, 2023
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { render, screen } from '@testing-library/react';
import IncidentPieChart from './IncidentPieChart';
import { INCIDENT_GROUPBY as columns, PIECHART_TIMEFRAME as timeframe, PIECHART_ALERTSCOUNT as alertsCountFilter }  from '../constants';
import mockIncidents from '../../mocks/alerts.json';

// @ts-ignore
import getReactRenderer from '@ibm/akora-renderer-react';

// @ts-ignore
const { AkoraStateProvider } = getReactRenderer(React, ReactDOM).components;
const wrapWithAkoraProvider = (mockApp: any, mockState: any, component: any) => {
  return (
    <AkoraStateProvider value={{app: mockApp, state: mockState}}>
      {component}
    </AkoraStateProvider>
  );
}

describe('IncidentPieChart', () => {
  it('should match sample snapshot', () => {
    const props = {
      data: mockIncidents.data,
      columns,
      timeframe,
      alertsCountFilter,
      refetch: () => {}
    };
    render(
      wrapWithAkoraProvider(
        {
          replaceRoute: () => {},
          resolvePathExpression: (p: string) => p,
          getStateForPath: () => ({ title: 'Incident distribution' })
        },
        {
          clientConfiguration: {
            publicurl: 'https://someurl.com'
          },
          fullPath: '/somepath',
          path: '/somepath'
        },
        <IncidentPieChart { ...props } />
      )
    );

    expect(screen.getAllByText('Incident distribution').length).toBeGreaterThan(0);
    expect(screen.getAllByTitle('By priority').length).toBeGreaterThan(0);
  });
});
