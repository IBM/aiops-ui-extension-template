# AlertSummaryChartsWithWeather Component

This is an enhanced version of the original AlertSummaryCharts component that includes a weather forecast section alongside the alert monitoring dashboard.

## Panel Registration and Routing

The component is fully integrated into the application:

1. **Panel Registration**: Registered in [`index.js`](../../index.js:120-128) with panel ID: `alert-summary-charts-weather`
2. **Route Configuration**: Added to [`config/routes.json`](../../../config/routes.json) with path: `/alert-summary-charts-weather`
3. **Menu Integration**: Appears in the "Example dashboards" menu category

### Accessing the Dashboard

After building and deploying:
- **Direct URL**: Navigate to `/alert-summary-charts-weather` in your AIOps instance
- **Menu**: Select "Alert Summary Charts with Weather" from the "Example dashboards" menu
- **Custom Panel**: Use panel ID `alert-summary-charts-weather` in custom dashboard configurations

### Deployment Steps

1. Build the bundle: `npm run build`
2. Deploy the bundle to your AIOps instance
3. Access via the menu or direct URL: `https://your-aiops-instance/alert-summary-charts-weather`

## Features

### Original Alert Dashboard Features
- Alert severity distribution (donut chart)
- Alert location distribution (bar chart)
- Severity breakdown by filter (grouped bar chart)
- Mock data toggle for testing
- Filter selection and comparison

### New Weather Features
- **Current Weather**: Real-time weather conditions with temperature, feels like, humidity, and wind speed
- **7-Day Forecast**: Daily weather predictions including:
  - High/low temperatures
  - Weather conditions with icons
  - Precipitation probability
  - Wind speed
- **Interactive Location Selection**: Click any location bar in the "Alerts by Location" chart to view weather for that location
- **Default Location**: Defaults to Texas (TX) on initial load
- **Location-Specific Data**: Weather data varies by location with realistic temperature ranges
- **Auto-refresh**: Weather data refreshes every 30 minutes
- **Visual Display**: Weather icons from OpenWeatherMap

## Usage

### Basic Implementation

```typescript
import AlertSummaryChartsWithWeather from './components/alert-summary-charts/AlertSummaryChartsWithWeather';

<AlertSummaryChartsWithWeather
  data={alertsData}
  loading={isLoading}
  error={error}
  refetch={refetchFunction}
  useMockData={false}
/>
```

### Props

- `data`: AlertsData object containing alert information
- `loading`: Boolean indicating if data is loading
- `error`: Error object if data fetch failed
- `refetch`: Function to refresh alert data
- `useMockData`: Boolean to toggle mock data (default: false)

## Interactive Features

### Location-Based Weather

The component features interactive location selection:

1. **Default Location**: Weather defaults to Texas (TX) when the dashboard loads
2. **Click to Change**: Click any bar in the "Alerts by Location" chart to switch weather to that location
3. **Visual Feedback**: The weather section header updates to show the selected location name
4. **Supported Locations**:
   - TX (Texas) - Default
   - NY (New York)
   - CA (California)
   - IL (Illinois)
   - FL (Florida)
   - WA (Washington)
   - MA (Massachusetts)
   - GA (Georgia)
   - Unknown (defaults to Texas)

### How It Works

```typescript
// Location coordinates are mapped to US states
const LOCATION_COORDINATES = {
  'TX': { lat: 31.9686, lon: -99.9018, name: 'Texas' },
  'NY': { lat: 40.7128, lon: -74.0060, name: 'New York' },
  // ... other locations
};

// Click handler on location chart
events: {
  click: (event) => {
    if (event?.detail?.datum?.group) {
      setSelectedLocation(event.detail.datum.group);
    }
  }
}
```

## Weather Data Integration

### Current Implementation (Mock Data)

The component currently uses mock weather data for demonstration purposes. The [`fetchWeatherData`](AlertSummaryChartsWithWeather.tsx:108) function returns sample weather information.

### Production Integration

To integrate with a real weather API, replace the mock data in [`fetchWeatherData`](AlertSummaryChartsWithWeather.tsx:108) with an actual API call to OpenWeatherMap:

```typescript
const fetchWeatherData = async (lat: number = 51.5074, lon: number = -0.1278): Promise<WeatherData | null> => {
  try {
    const API_KEY = process.env.OPENWEATHER_API_KEY;
    const response = await fetch(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Weather API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch weather data:', error);
    return null;
  }
};
```

### Getting an OpenWeatherMap API Key

1. Sign up at [OpenWeatherMap](https://openweathermap.org/api)
2. Subscribe to the "One Call API 3.0" (free tier available)
3. Get your API key from the dashboard
4. Add it to your environment variables

**Free Tier Limits:**
- 1,000 calls/day
- Current weather + 7-day forecast
- Hourly forecast for 48 hours

### Alternative Weather APIs

1. **WeatherAPI.com** (Free tier: 1M calls/month)
   - URL: https://www.weatherapi.com/
   - Features: Current + 3-day forecast free

2. **Open-Meteo** (Completely free, no API key required)
   - URL: https://open-meteo.com/
   - Features: Open-source weather API

3. **Visual Crossing** (Free tier: 1,000 records/day)
   - URL: https://www.visualcrossing.com/
   - Features: Historical and forecast data

## Weather Data Structure

```typescript
type WeatherData = {
  current: {
    temp: number;              // Temperature in Celsius
    feels_like: number;        // Feels like temperature
    humidity: number;          // Humidity percentage
    wind_speed: number;        // Wind speed in m/s
    weather: Array<{
      main: string;            // Weather condition (e.g., "Clouds")
      description: string;     // Detailed description
      icon: string;            // Icon code for weather icon
    }>;
  };
  daily: Array<{
    dt: number;                // Unix timestamp
    temp: {
      day: number;             // Day temperature
      min: number;             // Minimum temperature
      max: number;             // Maximum temperature
    };
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
    humidity: number;
    wind_speed: number;
    pop: number;               // Probability of precipitation (0-1)
  }>;
};
```

## Styling

The component uses:
- [`alert-summary-charts.scss`](alert-summary-charts.scss) styles
- Carbon Design System [`Tile`](AlertSummaryChartsWithWeather.tsx:17) components for weather cards
- Inline styles for weather-specific layouts
- OpenWeatherMap weather icons

## Auto-refresh Behavior

- Weather data refreshes every 30 minutes automatically
- Refresh interval can be adjusted in the [`useEffect`](AlertSummaryChartsWithWeather.tsx:264) hook
- Manual refresh can be triggered by remounting the component

## Customization

### Changing Location

Modify the default coordinates in [`fetchWeatherData`](AlertSummaryChartsWithWeather.tsx:108):

```typescript
const fetchWeatherData = async (lat: number = YOUR_LAT, lon: number = YOUR_LON)
```

Or make it dynamic based on user preferences or alert locations.

### Changing Units

The current implementation uses metric units (Celsius, m/s). To use imperial units:

```typescript
// In the API call
`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`
```

### Customizing Forecast Days

To show fewer or more days, modify the slice in the render:

```typescript
{weatherData.daily.slice(0, 5).map((day, index) => (
  // Shows 5 days instead of 7
))}
```

## Testing

The component includes mock data that simulates:
- Current weather: 18°C, partly cloudy
- 7-day forecast with varying conditions
- Realistic temperature ranges and precipitation probabilities

To test with mock data:
```typescript
<AlertSummaryChartsWithWeather
  data={mockAlertsData}
  loading={false}
  error={null}
  refetch={() => {}}
  useMockData={true}
/>
```

## Differences from Original Component

1. **Additional State**: [`weatherData`](AlertSummaryChartsWithWeather.tsx:177) and [`weatherLoading`](AlertSummaryChartsWithWeather.tsx:178)
2. **New Section**: Weather forecast section added at the top of the grid
3. **Auto-refresh**: 30-minute interval for weather data updates
4. **Weather Icons**: Integration with OpenWeatherMap icon service

## Browser Compatibility

- Requires modern browser with ES6+ support
- Uses Fetch API (polyfill may be needed for older browsers)
- Carbon Design System v11+ required
- Weather icons loaded from external CDN

## Performance Considerations

- Weather data is cached in component state
- API calls are throttled to every 30 minutes
- Consider implementing request caching/memoization for production
- Weather icons are loaded from CDN (consider local caching)

## Future Enhancements

Potential improvements for production use:

1. **Location Selection**: Allow users to select their location
2. **Multiple Locations**: Show weather for multiple data center locations
3. **Weather Alerts**: Highlight severe weather warnings
4. **Historical Data**: Show weather trends over time
5. **Correlation**: Correlate weather events with system alerts
6. **Notifications**: Alert users about weather conditions affecting infrastructure

## Inspired By

This component was inspired by [react-open-weather](https://github.com/farahat80/react-open-weather), a React component for displaying weather information.

## License

© Copyright IBM Corp. 2026
SPDX-License-Identifier: Apache-2.0

---

Made with Bob