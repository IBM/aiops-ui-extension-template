/**
 * © Copyright IBM Corp. 2022, 2023
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { render, screen } from '@testing-library/react';
import AlertTimeline from './AlertTimeline';
import mockAlerts from '../../mocks/alerts.json';

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

describe('AlertTimeline', () => {
  it('should match sample snapshot', () => {
    const props = {
      data: mockAlerts.data,
      refetch: () => {}
    };
    render(
      wrapWithAkoraProvider(
        {
          replaceRoute: () => {},
          resolvePathExpression: (p: string) => p,
          getStateForPath: () => ({ title: 'Top 10' })
        },
        {
          clientConfiguration: {
            publicurl: 'https://someurl.com'
          },
          fullPath: '/somepath',
          path: '/somepath'
        },
        <AlertTimeline { ...props } />
      )
    );

    expect(screen.getAllByTitle('Last 15 minutes').length).toBeGreaterThan(0);
  });
});
