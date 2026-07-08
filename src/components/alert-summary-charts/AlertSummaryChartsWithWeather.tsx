/**
 * © Copyright IBM Corp. 2026
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import {
  Grid,
  Column,
  InlineLoading,
  Layer,
  Tag,
  MultiSelect,
  Toggle,
  Tile
} from '@carbon/react';
import { DonutChart, SimpleBarChart, GroupedBarChart } from '@carbon/charts-react';

// @ts-ignore
import getReactRenderer from '@ibm/akora-renderer-react';

import {
  ALERT_QUERY_COLUMNS,
  COLORS_STROKE,
  SEVERITIES
} from '../constants';
import { useAlertSummaries } from '../../helpers/useAlertSummaries';
import { getMockAlertsData, mockFilters } from './mockData';

import './alert-summary-charts.scss';

const ReactRenderer = getReactRenderer(React, ReactDOM);
const { useAkoraState } = ReactRenderer.components;

const className = 'alert-summary-charts';

type AlertRow = {
  fields: Array<string | null>;
};

type AlertsData = {
  tenant?: {
    alerts?: {
      rows?: AlertRow[];
    };
  };
};

type FilterOption = {
  label: string;
  value: string;
  filterClause: string;
};

type Props = {
  data?: AlertsData;
  loading?: boolean;
  error?: unknown;
  refetch: (refetchOptions?: object) => void;
  useMockData?: boolean;
};

type WeatherData = {
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
  };
  daily: Array<{
    dt: number;
    temp: {
      day: number;
      min: number;
      max: number;
    };
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
    humidity: number;
    wind_speed: number;
    pop: number; // Probability of precipitation
  }>;
};

const getColumnIndex = (columnName: string) => ALERT_QUERY_COLUMNS.indexOf(columnName);

const getFieldValue = (alert: AlertRow, columnName: string) => {
  const index = getColumnIndex(columnName);
  const value = index > -1 ? alert.fields[index] : null;
  return value && `${value}`.trim() ? `${value}`.trim() : '-';
};

const getSeverityValue = (alert: AlertRow) => {
  const severity = Number(getFieldValue(alert, 'severity'));
  return Number.isNaN(severity) ? 0 : severity;
};

// Location coordinates mapping (US state codes to lat/lon)
const LOCATION_COORDINATES: Record<string, { lat: number; lon: number; name: string }> = {
  'TX': { lat: 31.9686, lon: -99.9018, name: 'Texas' },
  'NY': { lat: 40.7128, lon: -74.0060, name: 'New York' },
  'CA': { lat: 36.7783, lon: -119.4179, name: 'California' },
  'IL': { lat: 40.6331, lon: -89.3985, name: 'Illinois' },
  'FL': { lat: 27.9944, lon: -81.7603, name: 'Florida' },
  'WA': { lat: 47.7511, lon: -120.7401, name: 'Washington' },
  'MA': { lat: 42.4072, lon: -71.3824, name: 'Massachusetts' },
  'GA': { lat: 32.1656, lon: -82.9001, name: 'Georgia' },
  'Unknown': { lat: 31.9686, lon: -99.9018, name: 'Texas (Default)' }
};

/**
 * Fetch weather data from OpenWeatherMap API
 * Requires API key from https://openweathermap.org/api
 */
const fetchWeatherData = async (location: string = 'TX'): Promise<WeatherData | null> => {
  const coords = LOCATION_COORDINATES[location] || LOCATION_COORDINATES['TX'];
  const { lat, lon } = coords;
  try {
    // Add small delay to simulate API call and prevent instant re-render
    await new Promise(resolve => setTimeout(resolve, 100));

    // Mock data for demonstration - in production, replace with actual API call
    // Example: const response = await fetch(
    //   `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    // );

    // Generate location-specific mock weather with slight variations
    const baseTemp = location === 'TX' ? 28 : location === 'FL' ? 30 : location === 'CA' ? 22 : 18;
    const tempVariation = Math.random() * 4 - 2;

    const mockWeather: WeatherData = {
      current: {
        temp: baseTemp + tempVariation,
        feels_like: baseTemp + tempVariation - 2,
        humidity: 65,
        wind_speed: 4.5,
        weather: [{
          main: 'Clouds',
          description: 'partly cloudy',
          icon: '02d'
        }]
      },
      daily: [
        {
          dt: Date.now() / 1000,
          temp: { day: baseTemp, min: baseTemp - 4, max: baseTemp + 2 },
          weather: [{ main: 'Clouds', description: 'partly cloudy', icon: '02d' }],
          humidity: 65,
          wind_speed: 4.5,
          pop: 0.2
        },
        {
          dt: Date.now() / 1000 + 86400,
          temp: { day: baseTemp + 1, min: baseTemp - 3, max: baseTemp + 4 },
          weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }],
          humidity: 60,
          wind_speed: 3.8,
          pop: 0.1
        },
        {
          dt: Date.now() / 1000 + 172800,
          temp: { day: baseTemp - 1, min: baseTemp - 5, max: baseTemp + 1 },
          weather: [{ main: 'Rain', description: 'light rain', icon: '10d' }],
          humidity: 75,
          wind_speed: 5.2,
          pop: 0.6
        },
        {
          dt: Date.now() / 1000 + 259200,
          temp: { day: baseTemp - 2, min: baseTemp - 6, max: baseTemp },
          weather: [{ main: 'Rain', description: 'moderate rain', icon: '10d' }],
          humidity: 80,
          wind_speed: 6.1,
          pop: 0.8
        },
        {
          dt: Date.now() / 1000 + 345600,
          temp: { day: baseTemp + 2, min: baseTemp - 2, max: baseTemp + 5 },
          weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }],
          humidity: 55,
          wind_speed: 3.2,
          pop: 0.05
        },
        {
          dt: Date.now() / 1000 + 432000,
          temp: { day: baseTemp + 3, min: baseTemp - 1, max: baseTemp + 6 },
          weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }],
          humidity: 50,
          wind_speed: 2.8,
          pop: 0.0
        },
        {
          dt: Date.now() / 1000 + 518400,
          temp: { day: baseTemp + 4, min: baseTemp, max: baseTemp + 7 },
          weather: [{ main: 'Clouds', description: 'few clouds', icon: '02d' }],
          humidity: 52,
          wind_speed: 3.5,
          pop: 0.15
        }
      ]
    };

    return mockWeather;
  } catch (error) {
    console.error('Failed to fetch weather data:', error);
    return null;
  }
};

const getWeatherIcon = (iconCode: string) => {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
};

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' });
};

const AlertSummaryChartsWithWeather = ({
  data,
  loading,
  error,
  refetch,
  useMockData: initialUseMockData = false
}: Props) => {
  const { state, app } = useAkoraState();
  const severityChartRef = useRef<any>(null);
  const locationChartRef = useRef<any>(null);
  const filterChartRef = useRef<any>(null);

  // Mock data toggle state
  const [useMockData, setUseMockData] = useState(initialUseMockData);
  const [mockData, setMockData] = useState<AlertsData | null>(null);

  // Weather state
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>('TX'); // Default to Texas
  const [showForecast, setShowForecast] = useState(false); // 7-day forecast toggle, disabled by default

  // Use mock data if enabled, otherwise use real data
  const effectiveData = useMockData ? mockData : data;
  const alerts = effectiveData?.tenant?.alerts?.rows || [];

  const targetUrl = app.resolvePathExpression(state.path);
  const { title } = app.getStateForPath(targetUrl);

  // Get available filters from AIOps or mock data
  const [availableFilters, setAvailableFilters] = useState<FilterOption[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<FilterOption[]>([]);

  // Generate mock data when toggle is enabled
  useEffect(() => {
    if (useMockData) {
      setMockData(getMockAlertsData(50));
    }
  }, [useMockData]);

  // Fetch weather data when location changes
  useEffect(() => {
    let cancelled = false;

    const loadWeather = async () => {
      setWeatherLoading(true);
      const weather = await fetchWeatherData(selectedLocation);
      // Only update if we got valid data and effect hasn't been cancelled
      if (weather && !cancelled) {
        setWeatherData(weather);
        setWeatherLoading(false);
      }
    };

    loadWeather();
    // Refresh weather every 30 minutes
    const interval = setInterval(loadWeather, 30 * 60 * 1000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [selectedLocation]);


  useEffect(() => {
    if (useMockData) {
      // Use mock filters
      setAvailableFilters(mockFilters);
      setSelectedFilters(mockFilters.slice(0, 3));
    } else {
      // Fetch available filters using AIOps API
      const fetchFilters = async () => {
        try {
          const filtersData = await window.akoraConfig.baseState.API.contentAnalyticsAPI.getFiltersViews({
            tenantId: 'cfd95b7e-3bc7-4006-a4a8-a73a79c71255',
            condition: null,
            viewType: null
          });

          const filters: FilterOption[] = (filtersData?.tenant?.filters || []).map((filter: any) => ({
            label: filter.name || filter.filtername,
            value: filter.name || filter.filtername,
            filterClause: filter.filtercondition || filter.filterClause || ''
          }));
          setAvailableFilters(filters);
          // Select first 3 filters by default
          setSelectedFilters(filters.slice(0, 3));
        } catch (err) {
          console.error('Failed to fetch filters:', err);
        }
      };

      fetchFilters();
    }
  }, [useMockData]);

  // Use the useAlertSummaries hook to fetch alert summaries for selected filters
  const filterQueries = useMemo(() =>
    selectedFilters.map(filter => ({
      filterName: filter.label,
      filterClause: filter.filterClause
    })),
  [selectedFilters]
  );

  const { results: filterResults, loading: filterLoading } = useAlertSummaries(filterQueries);

  // Calculate severity distribution
  const severitySummary = useMemo(() => {
    const severityCounts = [0, 0, 0, 0, 0, 0, 0];

    alerts.forEach((alert) => {
      const severity = getSeverityValue(alert);
      severityCounts[severity] = (severityCounts[severity] || 0) + 1;
    });

    const chartData = severityCounts
      .map((count, severity) => ({
        group: SEVERITIES[severity],
        value: count
      }))
      .filter((item) => item.value > 0);

    return {
      total: alerts.length,
      chartData
    };
  }, [alerts]);

  // Calculate location distribution
  const locationSummary = useMemo(() => {
    const locationCounts = new Map<string, number>();

    alerts.forEach((alert) => {
      const location = getFieldValue(alert, 'resource.location');
      const key = location === '-' ? 'Unknown' : location;
      locationCounts.set(key, (locationCounts.get(key) || 0) + 1);
    });

    const chartData = Array.from(locationCounts.entries())
      .map(([location, count]) => ({
        group: location,
        value: count
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10 locations

    return { chartData };
  }, [alerts]);

  // Calculate severity breakdown per filter
  const filterSeverityBreakdown = useMemo(() => {
    const breakdownData: Array<{ group: string; key: string; value: number }> = [];

    if (useMockData) {
      // Generate mock filter breakdown data
      selectedFilters.forEach((filter) => {
        // Count alerts by severity for each filter
        const severityCounts = [0, 0, 0, 0, 0, 0, 0];

        alerts.forEach((alert) => {
          const severity = getSeverityValue(alert);
          severityCounts[severity] = (severityCounts[severity] || 0) + 1;
        });

        // Add data for ALL severity levels (including zeros) to prevent Carbon Charts warnings
        severityCounts.forEach((count, severity) => {
          if (count > 0) {
            // Vary the counts slightly per filter to make it realistic
            const variance = Math.floor(Math.random() * 5) - 2; // -2 to +2
            const adjustedCount = Math.max(1, count + variance);
            breakdownData.push({
              group: filter.label,
              key: SEVERITIES[severity],
              value: adjustedCount
            });
          }
        });
      });
    } else {
      // Use real data from filterResults
      // First, collect all data
      const dataByFilter = new Map<string, Map<string, number>>();

      filterResults.forEach((result, filterName) => {
        if (!dataByFilter.has(filterName)) {
          dataByFilter.set(filterName, new Map());
        }
        const filterData = dataByFilter.get(filterName)!;

        if (result.data?.tenant?.alertSummary?.summary) {
          result.data.tenant.alertSummary.summary.forEach((summary: any) => {
            const severityIndex = summary.severity || 0;
            filterData.set(SEVERITIES[severityIndex], summary.count || 0);
          });
        }
      });

      // Now ensure all filters have all severity levels (with 0 if missing)
      dataByFilter.forEach((severityMap, filterName) => {
        SEVERITIES.forEach((severity) => {
          breakdownData.push({
            group: filterName,
            key: severity,
            value: severityMap.get(severity) || 0
          });
        });
      });
    }

    return breakdownData;
  }, [useMockData, selectedFilters, alerts, filterResults]);

  useEffect(() => {
    const onRefresh = (e: MessageEvent) => {
      if (e.data === 'alertsrefresh' && e.origin === state.clientConfiguration.publicurl) {
        refetch();
      }
    };

    window.addEventListener('message', onRefresh, false);
    refetch();

    return () => window.removeEventListener('message', onRefresh);
  }, [state.clientConfiguration.publicurl, refetch]);

  const handleMockDataToggle = (checked: boolean) => {
    setUseMockData(checked);
    if (!checked) {
      // Refresh real data when switching back
      refetch();
    }
  };

  // Add click event listener to location chart and set cursor style
  useEffect(() => {
    if (!locationChartRef.current) return;

    const handleChartClick = (event: any) => {
      // Carbon Charts emits custom events with detail containing the clicked data
      if (event.detail?.datum?.group) {
        const location = event.detail.datum.group;
        setSelectedLocation(location);
      }
    };

    // Use Carbon Charts services.events API to listen for bar-click events
    // Access via chartRef.current.chart.services.events
    locationChartRef.current.chart.services.events.addEventListener('bar-click', handleChartClick);

    // Set cursor to pointer on bars
    const chartElement = locationChartRef.current.chart.holder;
    if (chartElement) {
      const bars = chartElement.querySelectorAll('.bar');
      bars.forEach((bar: Element) => {
        (bar as HTMLElement).style.cursor = 'pointer';
      });
    }

    return () => {
      if (locationChartRef.current) {
        locationChartRef.current.chart.services.events.removeEventListener('bar-click', handleChartClick);
      }
    };
  }, [locationChartRef.current, locationSummary.chartData]);

  return (
    <div className={className} role='main'>
      <div className={`${className}__header`}>
        <div className={`${className}__header-main`}>
          <h2 className={`${className}__title`}>{title}</h2>
          <div className={`${className}__header-controls`} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {/* Current Weather in Header */}
            {weatherData && (
              <Tile style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: '#f4f4f4' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                  Current Weather in {LOCATION_COORDINATES[selectedLocation]?.name || selectedLocation}
                </div>
                <img
                  src={getWeatherIcon(weatherData.current.weather[0].icon)}
                  alt={weatherData.current.weather[0].description}
                  style={{ width: '40px', height: '40px' }}
                />
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                    {Math.round(weatherData.current.temp)}°C
                  </div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>
                    {weatherData.current.weather[0].description}
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', display: 'flex', gap: '0.75rem' }}>
                  <span>Feels like: {Math.round(weatherData.current.feels_like)}°C</span>
                  <span>Humidity: {weatherData.current.humidity}%</span>
                  <span>Wind: {weatherData.current.wind_speed} m/s</span>
                </div>
              </Tile>
            )}
            {weatherLoading && <InlineLoading description='Loading weather...' />}

            <Toggle
              id='forecast-toggle'
              labelText='Show 7-day forecast'
              labelA='Hide forecast'
              labelB='Show forecast'
              toggled={showForecast}
              onToggle={setShowForecast}
              size='sm'
            />
            <Toggle
              id='mock-data-toggle'
              labelText='Use mock data'
              labelA='Real data'
              labelB='Mock data'
              toggled={useMockData}
              onToggle={handleMockDataToggle}
              size='sm'
            />
          </div>
        </div>
        <Layer className={`${className}__hero`}>
          <div className={`${className}__hero-count`}>{severitySummary.total}</div>
          <div className={`${className}__hero-label`}>Total Open Alerts</div>
        </Layer>
      </div>

      <Grid condensed className={`${className}__grid`}>
        {/* 7-Day Forecast Section (conditionally shown) */}
        {showForecast && weatherData && (
          <Column sm={4} md={8} lg={16}>
            <Layer className={`${className}__section`}>
              <h3 className={`${className}__section-title`}>7-Day Forecast</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                {weatherData.daily.slice(0, 7).map((day, index) => (
                  <Tile key={index} style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                      {index === 0 ? 'Today' : formatDate(day.dt)}
                    </div>
                    <img
                      src={getWeatherIcon(day.weather[0].icon)}
                      alt={day.weather[0].description}
                      style={{ width: '50px', height: '50px', margin: '0 auto' }}
                    />
                    <div style={{ fontSize: '0.75rem', textTransform: 'capitalize', marginBottom: '0.5rem', minHeight: '2.5rem' }}>
                      {day.weather[0].description}
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                      {Math.round(day.temp.max)}° / {Math.round(day.temp.min)}°
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#525252' }}>
                      <div>💧 {Math.round(day.pop * 100)}%</div>
                      <div>💨 {day.wind_speed} m/s</div>
                    </div>
                  </Tile>
                ))}
              </div>
            </Layer>
          </Column>
        )}

        {/* Severity Overview */}
        <Column sm={4} md={4} lg={8}>
          <Layer className={`${className}__section`}>
            <h3 className={`${className}__section-title`}>Alerts by Severity</h3>
            <div className={`${className}__chart`}>
              {severitySummary.chartData.length ? (
                <DonutChart
                  data={severitySummary.chartData}
                  options={{
                    title: 'Alert severity distribution',
                    height: '280px',
                    donut: {
                      center: {
                        label: `${severitySummary.total}`,
                        number: severitySummary.total
                      },
                      alignment: 'center'
                    },
                    legend: {
                      alignment: 'center',
                      position: 'bottom'
                    },
                    resizable: true,
                    toolbar: {
                      enabled: false
                    },
                    color: {
                      scale: {
                        Clear: COLORS_STROKE[0],
                        Indeterminate: COLORS_STROKE[1],
                        Information: COLORS_STROKE[2],
                        Warning: COLORS_STROKE[3],
                        Minor: COLORS_STROKE[4],
                        Major: COLORS_STROKE[5],
                        Critical: COLORS_STROKE[6]
                      }
                    }
                  }}
                  ref={severityChartRef}
                />
              ) : (
                <div className={`${className}__empty-state`}>No alerts to display</div>
              )}
            </div>
          </Layer>
        </Column>

        {/* Location Distribution */}
        <Column sm={4} md={4} lg={8}>
          <Layer className={`${className}__section`}>
            <h3 className={`${className}__section-title`}>Alerts by Location</h3>
            <div className={`${className}__chart`}>
              {locationSummary.chartData.length ? (
                <SimpleBarChart
                  data={locationSummary.chartData}
                  options={{
                    title: 'Top 10 locations by alert count (click to view weather)',
                    height: '280px',
                    resizable: true,
                    toolbar: {
                      enabled: false
                    },
                    legend: {
                      enabled: false
                    },
                    axes: {
                      left: {
                        mapsTo: 'value',
                        title: 'Alert count'
                      },
                      bottom: {
                        mapsTo: 'group',
                        title: 'Location',
                        scaleType: 'labels'
                      }
                    },
                    events: {
                      click: (event: any) => {
                        if (event?.detail?.datum?.group) {
                          const location = event.detail.datum.group;
                          setSelectedLocation(location);
                        }
                      }
                    }
                  }}
                  ref={locationChartRef}
                />
              ) : (
                <div className={`${className}__empty-state`}>No location data available</div>
              )}
            </div>
          </Layer>
        </Column>

        {/* Severity Breakdown by Filter */}
        <Column sm={4} md={8} lg={16}>
          <Layer className={`${className}__section`}>
            <div className={`${className}__section-heading`}>
              <h3 className={`${className}__section-title`}>Severity Breakdown by Filter</h3>
              {(loading || filterLoading) && <InlineLoading />}
            </div>

            {availableFilters.length > 0 && (
              <div className={`${className}__filter-selector`}>
                <MultiSelect
                  id='filter-selector'
                  titleText='Select filters to compare'
                  label='Choose filters'
                  items={availableFilters}
                  itemToString={(item: FilterOption) => item?.label || ''}
                  initialSelectedItems={selectedFilters}
                  onChange={(event: { selectedItems: FilterOption[] }) => {
                    setSelectedFilters(event.selectedItems);
                  }}
                />
              </div>
            )}

            <div className={`${className}__chart`}>
              {filterSeverityBreakdown.length ? (
                <GroupedBarChart
                  data={filterSeverityBreakdown}
                  options={{
                    title: 'Alert severity by filter',
                    height: '300px',
                    resizable: true,
                    legend: {
                      alignment: 'center',
                      position: 'bottom'
                    },
                    toolbar: {
                      enabled: false
                    },
                    axes: {
                      left: {
                        mapsTo: 'value',
                        title: 'Alert count'
                      },
                      bottom: {
                        mapsTo: 'key',
                        title: 'Filter',
                        scaleType: 'labels'
                      }
                    },
                    color: {
                      scale: {
                        Clear: COLORS_STROKE[0],
                        Indeterminate: COLORS_STROKE[1],
                        Information: COLORS_STROKE[2],
                        Warning: COLORS_STROKE[3],
                        Minor: COLORS_STROKE[4],
                        Major: COLORS_STROKE[5],
                        Critical: COLORS_STROKE[6]
                      }
                    }
                  }}
                  ref={filterChartRef}
                />
              ) : (
                <div className={`${className}__empty-state`}>
                  {selectedFilters.length === 0
                    ? 'Please select filters to view severity breakdown'
                    : 'No data available for selected filters'}
                </div>
              )}
            </div>

            {error && (
              <p className={`${className}__error`}>
                Unable to load alert data for the dashboard.
              </p>
            )}
          </Layer>
        </Column>
      </Grid>
    </div>
  );
};

export default AlertSummaryChartsWithWeather;

// Made with Bob