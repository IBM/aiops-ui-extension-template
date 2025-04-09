/**
 * © Copyright IBM Corp. 2025
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';

import { ActionableNotification, Loading, MultiSelect} from '@carbon/react';
// @ts-ignore
import getReactRenderer from '@ibm/akora-renderer-react';
import '@carbon/charts-react/styles.css'

import MonitorBox from './MonitorBox';
import { useQuery } from '#src/helpers/useQuery';
import { conditionSetToAPIQuery } from './utils/filterUtils';
import type { AlertFilter, AlertFilterParsed, QueryResponse } from './MonitorBoxTypes';

import './monitor-boxes.scss';

const ReactRenderer = getReactRenderer(React, ReactDOM);
const { useAkoraState, setUrlParameters } = ReactRenderer.components;

const className = 'monitor-boxes';
const alertsPath = '/aiops/:tenantid/resolution-hub/alerts';

export default function MonitorBoxCollection() {
  const { app } = useAkoraState();
  const targetUrl = app.resolvePathExpression(alertsPath);

  const [selectedFilters, setSelectedFilters] = useState<AlertFilterParsed[]>([]);
  const [parsedFilters, setParsedFilters] = useState<AlertFilterParsed[]>([]);
  const [shouldRefetch, setShouldRefetch] = useState(false);

  const queryName = useMemo(() => 'getFilters', []);
  const queryOptions = useMemo(() => ({
    tenantId: 'cfd95b7e-3bc7-4006-a4a8-a73a79c71255'
  }), []);

  const {
    data: alertFiltersData,
    loading: alertFiltersLoading,
    error: alertFiltersError,
    refetch: alertFiltersRefetch
  }: QueryResponse = useQuery(queryName, queryOptions);

  useEffect(() => {
    if(alertFiltersData) {
      if ('filters' in alertFiltersData?.tenant) {
        const filters = alertFiltersData.tenant.filters.map((filter: AlertFilter) => ({
          filterName: filter.name,
          filterClause: conditionSetToAPIQuery(filter.conditionSet)
        }));
        setParsedFilters(filters);
      }
    }
  }, [alertFiltersData]);

  useEffect(() => {
    const interval = setInterval(() => {
      setShouldRefetch(true);
      setShouldRefetch(false);
    }, 60000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const onBoxClick = (filterName: string) => {
    const newRoute = setUrlParameters(targetUrl, { filtername: filterName });
    window.open(newRoute);
  }

  const onFilterSelect = (data: AlertFilterParsed[]) => {
    setSelectedFilters(data);
  }

  const getBody = () => {
    if (alertFiltersLoading) {
      return (
        <div className={className + '__loading'}>
          <Loading />
        </div>
      );
    } else if (alertFiltersError) {
      return (
        <div className={className + '__error'}>
          <ActionableNotification
            inline
            kind="error"
            title="Error loading filters"
            actionButtonLabel="Retry"
            onActionButtonClick={() => alertFiltersRefetch()}
          />
        </div>
      );
    }

    return (
      <>
        <div className={className + '__dropdown'}>
          <MultiSelect
            id="Filters_multiselect"
            label="Select your filters"
            titleText="Filter selection"
            items={parsedFilters}
            itemToElement={(item) =>
              <span>
                {item.filterName}
              </span>
            }
            onChange={data => onFilterSelect(data.selectedItems)}
            selectedItems={selectedFilters}
            />
        </div>
        <div className={className + '__collection'}>
          {selectedFilters?.map((filter, index) =>
          <MonitorBox
            key={`monitor-box_${index}`}
            title={filter.filterName}
            filterClause={filter.filterClause}
            onBoxClick={() => onBoxClick(filter.filterName)}
            shouldRefetch={shouldRefetch}
            />
          )}
        </div>
      </>
    );
  };

  return (
    <div className={className} role='contentinfo'>
      {getBody()}
    </div>
  );
}
