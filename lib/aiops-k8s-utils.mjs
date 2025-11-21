/**
 * © Copyright IBM Corp. 2022, 2025
 * SPDX-License-Identifier: Apache-2.0
 *
 * Shared Kubernetes utilities for managing ConfigMaps and cluster operations
 */

import { CoreV1Api, KubeConfig, setHeaderOptions, PatchStrategy } from '@kubernetes/client-node';
import fs from 'fs/promises';

// Constants
export const defaultNamespace = 'cp4waiops';
export const extensionsConfigMap = 'aiops-ir-ui-extensions';
export const featureConfigMap = 'feature-flag-configmap';
export const productConfigMap = 'product-configmap';
export const labelSelectorBundle = 'component=aiops-ir-ui-bundle-api';
export const labelSelectorOperator = 'app.kubernetes.io/name=ibm-watson-aiops-ui-operator';
export const labelSelectorWatcher = 'app.kubernetes.io/component=zen-watcher';

/**
 * Create a Kubernetes API client
 * @param {*} api - API class to instantiate (default: CoreV1Api)
 * @returns Kubernetes API client
 */
export const getClient = (api = CoreV1Api) => {
  const kc = new KubeConfig();
  kc.loadFromDefault();
  return kc.makeApiClient(api);
};

/**
 * Check if a ConfigMap exists in the specified namespace
 * @param {*} client - Kubernetes API client
 * @param {string} namespace - Kubernetes namespace
 * @param {string} name - ConfigMap name
 * @returns ConfigMap object if exists, false otherwise
 */
export const configMapExists = async (client, namespace, name) => {
  try {
    const configMap = await client.listNamespacedConfigMap(
      {
        namespace,
        fieldSelector: `metadata.name=${name}`
      }
    );
    return configMap?.items.length && configMap.items[0];
  } catch (e) {
    return false;
  }
};

/**
 * Patch an existing ConfigMap
 * @param {*} client - Kubernetes API client
 * @param {string} namespace - Kubernetes namespace
 * @param {string} name - ConfigMap name
 * @param {object} body - Patch body
 * @returns Patched ConfigMap
 */
export const patchConfigMap = async (client, namespace, name, body) => {
  const configMap = await client.patchNamespacedConfigMap(
    {
      name,
      namespace,
      body
    },
    setHeaderOptions('Content-Type', PatchStrategy.StrategicMergePatch),
  );
  return configMap;
};

/**
 * Create a new ConfigMap
 * @param {*} client - Kubernetes API client
 * @param {string} namespace - Kubernetes namespace
 * @param {string} name - ConfigMap name
 * @param {object} body - ConfigMap body
 * @returns Created ConfigMap
 */
export const createConfigMap = async (client, namespace, name, body) => {
  const configMap = await client.createNamespacedConfigMap(
    {
      namespace,
      body: {
        ...body,
        metadata: {
          name
        }
      }
    }
  );
  return configMap;
};

/**
 * Load and process routes.json file
 * @param {string} bundleName - Name of the bundle
 * @param {string} routesPath - Path to routes.json file (default: './config/routes.json')
 * @returns Processed routes object
 */
export const loadAndProcessRoutes = async (bundleName, routesPath = './config/routes.json') => {
  const routesData = await fs.readFile(routesPath, 'utf-8');
  const routesJSON = JSON.parse(routesData);

  // Replace bundle path placeholder
  const routesString = JSON.stringify(routesJSON).replace(
    /\{\{BUNDLE_PATH\}\}/g,
    `bundles/${bundleName}/files/${bundleName}-bundle.js`
  );

  return JSON.parse(routesString);
};

/**
 * Update routes ConfigMap on the cluster
 * @param {*} client - Kubernetes API client
 * @param {string} namespace - Kubernetes namespace
 * @param {string} bundleName - Name of the bundle
 * @param {string} routesPath - Path to routes.json file (optional)
 * @returns true if successful, false otherwise
 */
export const updateRoutesConfigMap = async (client, namespace, bundleName, routesPath) => {
  try {
    const processedRoutes = await loadAndProcessRoutes(bundleName, routesPath);

    // Prepare ConfigMap data
    const configMapKey = `${bundleName}.json`;
    const data = {
      [configMapKey]: JSON.stringify(processedRoutes.spec)
    };

    // Check if ConfigMap exists
    const exists = await configMapExists(client, namespace, extensionsConfigMap);

    if (exists) {
      console.log('Updating routes in existing ConfigMap...');
      await patchConfigMap(client, namespace, extensionsConfigMap, { data });
      console.log('Routes ConfigMap updated successfully! 🗺️');
    } else {
      console.log('Creating new routes ConfigMap...');
      await createConfigMap(client, namespace, extensionsConfigMap, { data });
      console.log('Routes ConfigMap created successfully! 🗺️');
    }

    return true;
  } catch (e) {
    console.error('Failed to update routes ConfigMap:', e.message || e);
    return false;
  }
};

/**
 * Recycle pods matching the specified label selectors
 * @param {*} client - Kubernetes API client
 * @param {string} namespace - Kubernetes namespace
 * @param {string[]} selectorList - Array of label selectors
 */
export const recyclePods = async (client, namespace, selectorList = []) => {
  console.log('Recycling pods ...');
  await Promise.all(selectorList.map(labelSelector => client.deleteCollectionNamespacedPod(
    {
      namespace,
      labelSelector
    }
  )));
};

/**
 * Wait for pods to be ready
 * @param {*} client - Kubernetes API client
 * @param {string} namespace - Kubernetes namespace
 * @param {string[]} selectorList - Array of label selectors
 * @param {number} maxTries - Maximum number of tries (default: 30)
 * @param {number} sleep - Sleep duration between tries in ms (default: 10000)
 * @returns true if all pods are ready, false otherwise
 */
export const waitForPods = async (client, namespace, selectorList = [], maxTries = 30, sleep = 10000) => {
  let i = maxTries;
  let remaining = [...selectorList];

  while (i > 0 && remaining.length > 0) {
    const status = await Promise.all(remaining.map(labelSelector => client.listNamespacedPod(
      {
        namespace,
        labelSelector
      }
    )));
    status.forEach((pods, idx) => {
      if (pods?.items.length &&
        pods.items[0].status.phase === 'Running' &&
        pods.items[0].status.containerStatuses.every(c => c.ready === true)) {
        remaining.splice(idx, 1);
      }
    });
    i--;
    if (remaining.length > 0) {
      console.log(`Waiting for ${remaining.length} of ${selectorList.length} pods ...`);
      await new Promise(r => setTimeout(r, sleep));
    }
  }
  if (remaining.length > 0) {
    console.log(`${remaining.length} of ${selectorList.length} pods not ready after ${maxTries} tries.`);
    return false;
  }
  console.log('All pods are ready.');
  return true;
};

// Made with Bob
