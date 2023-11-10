/**
 * © Copyright IBM Corp. 2022, 2023
 * SPDX-License-Identifier: Apache-2.0
 */

import '@testing-library/jest-dom/extend-expect';

global.window.akoraConfig = {
  baseState: {
    clientConfiguration: {
      publicurl: 'https://someurl.com'
    },
    API: {
      contentAnalyticsAPI: {
        getAlerts: () => ({ tenant: { alerts: { rows: [] } } })
      }
    }
  }
};

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));
