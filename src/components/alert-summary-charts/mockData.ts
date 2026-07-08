/**
 * © Copyright IBM Corp. 2026
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Mock alert data inspired by bank-services sample data
 * This provides realistic test data for the Alert Summary Charts dashboard
 */

export interface MockAlert {
  id: string;
  severity: number;
  state: string;
  summary: string;
  'type.classification': string;
  'type.eventType': string;
  'sender.name': string;
  'sender.type': string;
  'resource.name': string;
  'resource.type': string;
  'resource.location': string;
  firstOccurrenceTime: string;
  lastOccurrenceTime: string;
  closedTime: string | null;
  relatedContextualStoryIds: string[];
  relatedStoryIds: string[];
  suppressed: boolean;
  owner: string;
  team: string;
  acknowledged: boolean;
  signature: string;
}

const locations = ['TX', 'NY', 'CA', 'IL', 'FL', 'WA', 'MA', 'GA'];
const severities = [3, 4, 5, 6]; // Warning, Minor, Major, Critical
const resourceTypes = ['ApplicationServer', 'Database', 'NetworkDevice', 'LoadBalancer', 'WebServer'];
const senderTypes = ['Dynatrace', 'SevOne', 'Prometheus', 'Zabbix', 'Nagios'];
const classifications = [
  'High CPU usage:++:CPU',
  'Memory leak detected:++:Memory',
  'Disk space low:++:Disk',
  'Network latency high:++:Network',
  'Service unavailable:++:Service',
  'Database connection timeout:++:Database',
  'SSL certificate expiring:++:Security',
  'API response time high:++:Performance'
];

const teams = ['Platform', 'Database', 'Network', 'Security', 'Application'];
const owners = ['alice@example.com', 'bob@example.com', 'charlie@example.com', '', ''];

/**
 * Generate a random alert with realistic data
 */
function generateAlert(index: number): MockAlert {
  const location = locations[Math.floor(Math.random() * locations.length)];
  const severity = severities[Math.floor(Math.random() * severities.length)];
  const resourceType = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
  const senderType = senderTypes[Math.floor(Math.random() * senderTypes.length)];
  const classification = classifications[Math.floor(Math.random() * classifications.length)];
  const team = teams[Math.floor(Math.random() * teams.length)];
  const owner = owners[Math.floor(Math.random() * owners.length)];

  const resourceName = `${location.toLowerCase()}-${resourceType.toLowerCase()}-${String(index).padStart(2, '0')}`;
  const hostname = `${resourceName}.bank.local`;

  // Generate timestamps - alerts from last 24 hours
  const now = Date.now();
  const hoursAgo = Math.floor(Math.random() * 24);
  const firstOccurrence = new Date(now - hoursAgo * 60 * 60 * 1000).toISOString();
  const lastOccurrence = new Date(now - Math.floor(Math.random() * hoursAgo) * 60 * 60 * 1000).toISOString();

  const classificationParts = classification.split(':++:');
  const summary = `${classificationParts[0]} on ${resourceType} ${resourceName}`;

  return {
    id: `alert-${index}-${Date.now()}`,
    severity,
    state: 'open',
    summary,
    'type.classification': classification,
    'type.eventType': 'problem',
    'sender.name': resourceName,
    'sender.type': senderType,
    'resource.name': resourceName,
    'resource.type': resourceType,
    'resource.location': location,
    firstOccurrenceTime: firstOccurrence,
    lastOccurrenceTime: lastOccurrence,
    closedTime: null,
    relatedContextualStoryIds: [],
    relatedStoryIds: [],
    suppressed: false,
    owner,
    team,
    acknowledged: Math.random() > 0.7,
    signature: `${hostname}-${classification}`
  };
}

/**
 * Generate a set of mock alerts
 * @param count Number of alerts to generate (default: 50)
 */
export function generateMockAlerts(count: number = 50): MockAlert[] {
  const alerts: MockAlert[] = [];

  for (let i = 1; i <= count; i++) {
    alerts.push(generateAlert(i));
  }

  return alerts;
}

/**
 * Convert mock alerts to the format expected by the dashboard
 */
export function mockAlertsToRows(alerts: MockAlert[]): Array<{ fields: Array<string | null> }> {
  return alerts.map(alert => ({
    fields: [
      String(alert.severity),
      alert.state,
      alert.summary,
      alert['type.classification'],
      alert['type.eventType'],
      alert['sender.name'],
      alert['sender.type'],
      alert['resource.name'],
      alert['resource.type'],
      alert['resource.location'],
      alert.firstOccurrenceTime,
      alert.lastOccurrenceTime,
      alert.closedTime,
      JSON.stringify(alert.relatedContextualStoryIds),
      JSON.stringify(alert.relatedStoryIds),
      String(alert.suppressed),
      alert.owner,
      alert.team,
      String(alert.acknowledged),
      alert.id,
      alert.signature
    ]
  }));
}

/**
 * Get mock data in the format expected by the component
 */
export function getMockAlertsData(count: number = 50) {
  const alerts = generateMockAlerts(count);
  const rows = mockAlertsToRows(alerts);

  return {
    tenant: {
      alerts: {
        rows
      }
    }
  };
}

/**
 * Mock filters data
 */
export const mockFilters = [
  {
    label: 'Critical Alerts',
    value: 'Critical Alerts',
    filterClause: 'severity = 6'
  },
  {
    label: 'High Priority Services',
    value: 'High Priority Services',
    filterClause: 'resource.type = \'ApplicationServer\' OR resource.type = \'Database\''
  },
  {
    label: 'Network Issues',
    value: 'Network Issues',
    filterClause: 'type.classification LIKE \'%Network%\''
  },
  {
    label: 'Texas Region',
    value: 'Texas Region',
    filterClause: 'resource.location = \'TX\''
  },
  {
    label: 'Unacknowledged',
    value: 'Unacknowledged',
    filterClause: 'acknowledged = false'
  }
];

// Made with Bob
