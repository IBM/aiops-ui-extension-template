/**
 * © Copyright IBM Corp. 2022, 2025
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';

/**
 * The following queries are available:
 *
 *  activatePolicy ($tenantId: ID!, $policyIds: [ID!]!)
 *  archivedPoliciesSetpolicies ($tenantId: ID!, $policyIds: [ID!]!, $state: PolicyStateValue, $commentText: String)
 *  createIncidentMutation ($tenantId: ID!, $alertIds: [String]!, $description: String, $priority: Int!)
 *  getActionInstance ($tenantId: ID!, $id: ID!, $data: String!)
 *  getActions ($tenantId: ID!)
 *  getAiopsAlertConfiguration ($tenantId: ID!, $condition: String)
 *  getAiopsConversions ($tenantId: ID!)
 *  getAlertDisplayConfiguration ($tenantId: ID!)
 *  getAlertSchema ($tenantId: ID!)
 *  getAlerts ($tenantId: ID!, $columns: [String], $format: AlertFormat, $storyId: ID, $filter: String)
 *  getAnalyticConfigurations ($tenantId: ID!, $analyticType: String!)
 *  getConfiguration ($tenantId: ID!, $columns: [String!])
 *  getConversions ($tenantId: ID!)
 *  getEventData ($id: String!)
 *  getFiltersViews ($tenantId: ID!, $condition: String, $viewType: String)
 *  getGoldenSignalLogMessages ($tenantId: ID!, $appGroupId: String!, $appId: String!, $templateId: String!, $startTimestamp: String!)
 *  getGroups ($tenantId: ID!)
 *  getImpactedApplications ($tenantId: ID!, $includeCount: Boolean, $includeSeverity: Boolean, $includeStoryPriority: Boolean, $includeBusinessCriticality: Boolean, $applicationIds: String!)
 *  getIncident ($incident: ID!, $tenantId: ID!)
 *  getIncidentAlertDetails ($tenantId: ID!, $alertId: String!)
 *  getIncidentAlerts ($incidentId: ID!, $tenantId: ID!, $columns: [String])
 *  getMenu ($tenantId: ID!, $menuId: ID!)
 *  getMenuWithTools ($tenantId: ID!, $menuId: ID!, $userId: ID!, $type: String)
 *  getMenus ($tenantId: ID!, $menuType: String)
 *  getMetricForecastData ($tenantId: ID!, $resource: ID!, $group: ID!, $metric: String!)
 *  getMetricGroups ($tenantId: ID!)
 *  getMetricManagerData ($tenantId: ID!, $resource: ID!, $group: ID!, $metric: String!, $startTime: Float, $endTime: Float)
 *  getMetricManagerWithGroupAlertsData ($tenantId: ID!, $resource: ID!, $group: ID!, $metric: String!, $startTime: Float, $endTime: Float, $storyId: ID, $columns: [String]!, $format: AlertFormat!, $isAiopsPolicy: Boolean!)
 *  getMetricResources ($tenantId: ID!, $group: ID!, $metric: ID!, $filter: String)
 *  getMetrics ($tenantId: ID!, $group: ID!, $filter: String)
 *  getMimeComment ($id: ID!, $tenantId: ID!)
 *  getMimeGroup ($id: ID!, $tenantId: ID!, $eventIds: [String!]!)
 *  getPatternResourceData ($tenantId: ID!, $alertId: ID!, $detailsId: ID!)
 *  getPolicyIndexCount ($tenantId: ID!, $index: String!, $groupId: [String], $policyState: String)
 *  getPolicyMetadata ($policyId: ID!, $tenantId: ID!)
 *  getPolicyWithGroupInstances ($policyId: ID!, $tenantId: ID!, $columns: [String]!, $format: AlertFormat!, $isAiopsPolicy: Boolean!)
 *  getPolicyWithRelatedResources ($policyId: ID!, $tenantId: ID!, $correlationType: String!, $resource: [String]!)
 *  getRawAlerts ($tenantId: ID!, $filter: String!)
 *  getRelatedStories ($tenantId: ID!, $alertIds: [ID!], $storyId: ID, $filter: String)
 *  getRunbook ($runbookId: ID!, $tenantId: ID!)
 *  getRunbooksAndPolicy ($tenantId: ID!, $runbookIds: [ID!]!, $context: String, $policyId: ID!, $policyIds: String, $includePolicy: Boolean!, $includePolicies: Boolean!, $includeRunbooks: Boolean!)
 *  getSeasonalityPolicyMetadata ($policyId: ID!, $tenantId: ID!, $isAiopsPolicy: Boolean!)
 *  getSimilarIncidents ($tenantId: ID!, $storyId: ID!, $applicationId: String!, $applicationGroupId: String!, $searchText: String!)
 *  getStories ($tenantId: ID!, $filter: String)
 *  getStoriesByAlerts ($tenantId: ID!, $filter: String)
 *  getStoryAlertsGroups ($tenantId: ID!, $columns: [String], $format: AlertFormat, $storyId: ID!, $includeGroups: Boolean!)
 *  getStoryAlertsInsights ($tenantId: ID!, $storyId: ID!)
 *  getTool ($tenantId: ID!, $storyId: ID!)
 *  getTools ($tenantId: ID!, $type: String)
 *  getTopologyResource ($tenantId: ID!, $resourceId: String)
 *  getUser ($tenantId: ID!, $userId: ID!)
 *  getUserAndGroups ($tenantId: ID!, $userId: ID!)
 *  getUserPreference ($tenantId: ID!, $id: ID!)
 *  getUserPreferences ($tenantId: ID!)
 *  getUsersAndGroups ($tenantId: ID!)
 *  getUsersByGroupId ($tenantId: ID!, $groupId: ID!)
 *  rejectPolicy ($tenantId: ID!, $policyIds: [ID!]!, $commentText: String)
 *  renamePolicy ($tenantId: ID!, $policyId: ID!, $name: String!)
 *  restorePolicy ($tenantId: ID!, $policyIds: [ID!]!, $commentText: String)
 *  setPolicyDeployed ($tenantId: ID!, $policyId: ID!, $deployed: Boolean!)
 *  setPolicyLock ($tenantId: ID!, $policyIds: [ID!]!, $state: PolicyStateValue, $locked: Boolean)
 *  setPolicyStatus ($tenantId: ID!, $policyIds: [ID!]!)
 *  setSuggestedPolicies ($tenantId: ID!, $policyIds: [ID!]!, $state: PolicyStateValue, $commentText: String)
 *  updateIncidentMutation ($tenantId: ID!, $alertIds: [String]!, $correlationKey: String)
 */

/**
 *
 * @param query String identifier of the query function
 * @param options Object of query specific parameters
 * @returns Object of query properties
 */

export function useQuery<T>(query: string, options: object) {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState<boolean>();
  const [error, setError] = useState<object>();

  const refetch = (refetchOptions?: object) => {
    setLoading(true);
    window.akoraConfig.baseState.API.contentAnalyticsAPI[query]({ ...options, ...refetchOptions })
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (query) refetch();
  }, [query, options]);

  return {
    data,
    error,
    loading,
    refetch
  };
}
