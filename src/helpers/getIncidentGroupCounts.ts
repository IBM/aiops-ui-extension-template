/**
 * © Copyright IBM Corp. 2022, 2023
 * SPDX-License-Identifier: Apache-2.0
 */

export default function getIncidentGroupCounts(groupBy: string, rows: Array<{[key: string]: string}>) {
  const statusGroupCounts: StatusGroupCounts = {};

  rows.forEach(row => {
    const groupKey = row[groupBy] || 'All incidents';
    const assigned = row.state !== 'unassigned';
    const priority = +row.priority;
    const ticketed = row.state === 'inProgress';

    if (!statusGroupCounts[groupKey]) {
      statusGroupCounts[groupKey] = {
        ticketed: { count: 0, maxSeverity: 1 },
        assigned: { count: 0, maxSeverity: 1 },
        new: { count: 0, maxSeverity: 1 },
        total: { count: 0, maxSeverity: 1 }
      };
      for (let i = 1; i < 6; i++ ) {
        statusGroupCounts[groupKey].ticketed[`pri-${i + 1}`] = 0;
        statusGroupCounts[groupKey].assigned[`pri-${i + 1}`] = 0;
        statusGroupCounts[groupKey].new[`pri-${i + 1}`] = 0;
      }
    }
    if (ticketed) {
      statusGroupCounts[groupKey].ticketed.count++;
      statusGroupCounts[groupKey].ticketed.maxSeverity = Math.min(priority, statusGroupCounts[groupKey].ticketed.maxSeverity);
      statusGroupCounts[groupKey].ticketed[`pri-${priority}`]++;
    } else if (assigned) {
      statusGroupCounts[groupKey].assigned.count++;
      statusGroupCounts[groupKey].assigned.maxSeverity = Math.min(priority, statusGroupCounts[groupKey].assigned.maxSeverity);
      statusGroupCounts[groupKey].assigned[`pri-${priority}`]++;
    } else {
      statusGroupCounts[groupKey].new.count++;
      statusGroupCounts[groupKey].new.maxSeverity = Math.min(priority, statusGroupCounts[groupKey].new.maxSeverity);
      statusGroupCounts[groupKey].new[`pri-${priority}`]++;
    }
    statusGroupCounts[groupKey].total.count++;
    statusGroupCounts[groupKey].total.maxSeverity = Math.min(priority, statusGroupCounts[groupKey].total.maxSeverity);
    statusGroupCounts[groupKey].total[`pri-${priority}`]++;
  });

  return statusGroupCounts;
}
