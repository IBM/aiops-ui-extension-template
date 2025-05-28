/**
 * © Copyright IBM Corp. 2022, 2025
 * SPDX-License-Identifier: Apache-2.0
 */

import { existsSync, writeFileSync } from 'fs';
import { CoreV1Api, KubeConfig, setHeaderOptions, PatchStrategy } from '@kubernetes/client-node';
import minimist from 'minimist';

const defaultTarget = {
  url: 'https://cpd-aiops.apps.yourcluster.cp.yourdomain.com/',
  username: '<your api user>',
  apiKey: '<your api key>',
  tenantId: 'cfd95b7e-3bc7-4006-a4a8-a73a79c71255',
  bundleName: 'alerts-examples'
};
const defaultFeatureFlag = 'USE_CUSTOM_DASHBOARD';
const defaultNamespace = 'cp4waiops';
const extensionsConfigMap = 'aiops-ir-ui-extensions';
const featureConfigMap = 'feature-flag-configmap';
const labelSelectorBundle = 'component=aiops-ir-ui-bundle-api';
const labelSelectorOperator = 'app.kubernetes.io/name=ibm-watson-aiops-ui-operator';
const labelSelectorWatcher = 'app.kubernetes.io/component=zen-watcher';
const productConfigMap = 'product-configmap';
const targetFile = 'target.json'

const getClient = (api = CoreV1Api) => {
  const kc = new KubeConfig();
  kc.loadFromDefault();
  return kc.makeApiClient(api);
};

const configMapExists = async (client, namespace, name) => {
  const configMap = await client.listNamespacedConfigMap(
    {
      namespace,
      fieldSelector: `metadata.name=${name}`
    }
  );
  return configMap?.items.length && configMap.items[0];
};

const patchConfigMap = async (client, namespace, name, body) => {
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

const createConfigMap = async (client, namespace, name, body) => {
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

const setFeatureFlag = async (client, namespace, disable) => {
  const data = { [defaultFeatureFlag]: disable ? 'disabled' : 'enabled' };
  const exists = await configMapExists(client, namespace, featureConfigMap);
  if (exists) {
    console.log('Patching config map ...');
    await patchConfigMap(client, namespace, featureConfigMap, { data });
  } else if (!disable)  {
    console.log('Creating config map ...');
    await createConfigMap(client, namespace, featureConfigMap, { data });
  }
};

const recyclePods = async (client, namespace, selectorList = []) => {
  console.log('Recycling pods ...');
  await Promise.all(selectorList.map(labelSelector => client.deleteCollectionNamespacedPod(
    {
      namespace,
      labelSelector
    }
  )));
};

const bedrock3hack = async (client, namespace) => {
  const exists = await configMapExists(client, namespace, extensionsConfigMap);
  if (exists) {
    const patch = {
      metadata: {
        labels: {
          icpdata_addon_version: String(Date.now())
        }
      }
    };
    await patchConfigMap(client, namespace, extensionsConfigMap, patch);
  }
};

const createTargetFile = async (client, namespace) => {
  if (existsSync(targetFile)) return;

  const exists = await configMapExists(client, namespace, productConfigMap);
  let url;
  if (exists) {
    url = `https://${exists.data?.URL_PREFIX}/`;
  }

  writeFileSync(targetFile, JSON.stringify({ ...defaultTarget, url }, null, 2));
};

const waitForPods = async (client, namespace, selectorList = [], maxTries = 30, sleep = 10000) => {
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

/**
 * Enable or disable dashboard extensions
 *
 * @namespace {*} Namespace
 * @disable {*} Disable dashboard extensions
 * @insecure {*} Disable cert check
 */
const { namespace, disable, insecure } = minimist(process.argv.slice(2),
  {
    alias: { n: 'namespace', d: 'disable', k: 'insecure' },
    boolean: ['disable', 'insecure'],
    default: { namespace: defaultNamespace, disable: false, insecure: true }
  });

process.removeAllListeners('warning');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

let client;
try {
  client = getClient();
} catch (e) {
  if (e.toString().includes('cluster is missing')) {
    console.error('Failed to get valid local kubeconfig file. Please ensure your kubeconfig file has valid context entires and retry. See troubleshooting section of doc/getting-started.md for more info.');
  }
  process.exit(1);
}

try {
  await createTargetFile(client, namespace);

  await setFeatureFlag(client, namespace, disable);

  await recyclePods(client, namespace, [labelSelectorOperator, labelSelectorWatcher]);

  const waitFor = [labelSelectorOperator, labelSelectorWatcher, labelSelectorBundle];
  const ready = await waitForPods(client, namespace, waitFor);
  if (!ready) process.exit(1);

  await bedrock3hack(client, namespace); // until v4

  process.exit(0);
} catch (e) {
  console.error('Failed to enable dashboard extensions:', e.body?.message || e);
  process.exit(1);
}
