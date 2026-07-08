/**
 * © Copyright IBM Corp. 2026
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useState } from 'react';
import createPanel from '../app/createPanel';
import AlertSummaryChartsWithWeather from '../components/alert-summary-charts/AlertSummaryChartsWithWeather';

type AlertRecord = Record<string, unknown> & {
  type?: Record<string, unknown>;
  sender?: Record<string, unknown>;
  resource?: Record<string, unknown>;
};

type AlertsApiResponse = {
  alerts?: AlertRecord[];
};

type AlertDashboardData = {
  tenant: {
    alerts: {
      rows: Array<{
        fields: Array<string | null>;
      }>;
    };
  };
};

const alertProperties = [
  'severity',
  'state',
  'summary',
  'type.classification',
  'type.eventType',
  'sender.name',
  'sender.type',
  'resource.name',
  'resource.type',
  'resource.location',
  'firstOccurrenceTime',
  'lastOccurrenceTime',
  'closedTime',
  'relatedContextualStoryIds',
  'relatedStoryIds',
  'suppressed',
  'owner',
  'team',
  'acknowledged',
  'id',
  'signature'
];


const buildAlertsUrl = () => {
  const url = new URL('/aiops/api/v2/alerts', window.location.origin);
  url.searchParams.set('filter', 'state != \'clear\'');
  return url.toString();
};

const getNestedValue = (alert: AlertRecord, property: string) =>
  property.split('.').reduce<unknown>((value, segment) => {
    if (value && typeof value === 'object') {
      return (value as Record<string, unknown>)[segment];
    }
    return undefined;
  }, alert) ?? null;

const mapAlertsResponse = (response: AlertsApiResponse): AlertDashboardData => {
  const alerts = Array.isArray(response?.alerts)
    ? response.alerts
    : Array.isArray((response as AlertsApiResponse & { items?: AlertRecord[] }).items)
      ? (response as AlertsApiResponse & { items?: AlertRecord[] }).items || []
      : [];

  return {
    tenant: {
      alerts: {
        rows: alerts.map((alert: AlertRecord) => ({
          fields: alertProperties.map((property) => {
            const value = property.includes('.') ? getNestedValue(alert, property) : alert?.[property] ?? null;

            if (value === null || value === undefined) {
              return null;
            }

            if (typeof value === 'string') {
              return value;
            }

            return String(value);
          })
        }))
      }
    }
  };
};

const AlertSummaryChartsWithWeatherPanel = () => {
  const [data, setData] = useState<AlertDashboardData>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>();

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(undefined);

    try {
      const response = await fetch(buildAlertsUrl(), {
        credentials: 'same-origin'
      });

      if (!response.ok) {
        throw new Error(`Alerts request failed with status ${response.status}`);
      }

      const payload = await response.json();
      setData(mapAlertsResponse(payload));
    } catch (requestError) {
      setError(requestError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return React.createElement(AlertSummaryChartsWithWeather, {
    data,
    loading,
    error,
    refetch
  });
};

export default createPanel(AlertSummaryChartsWithWeatherPanel);

// Made with Bob