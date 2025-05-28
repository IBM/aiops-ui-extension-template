/**
 * © Copyright IBM Corp. 2022, 2025
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { render, screen } from '@testing-library/react';
import StatusGroups from './StatusGroups';
import { GROUP_BY as groups } from '../constants';
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

describe('StatusGroups', () => {
  it('should match sample snapshot', () => {
    const props = {
      data: mockAlerts.data,
      groups,
      refetch: () => {}
    };
    const component = render(
      wrapWithAkoraProvider(
        {
          replaceRoute: () => {},
          resolvePathExpression: (p: string) => p,
          getStateForPath: () => ({ title: 'Alerts workflow '})
        },
        {
          clientConfiguration: {
            publicurl: 'https://someurl.com'
          },
          fullPath: '/somepath',
          path: '/somepath'
        },
        <StatusGroups { ...props } />
      )
    );

    expect(component).toMatchSnapshot();
    expect(screen.getByText('Alerts workflow')).toBeInTheDocument();
  });
});
