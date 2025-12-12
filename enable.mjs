/**
 * © Copyright IBM Corp. 2022, 2025
 * SPDX-License-Identifier: Apache-2.0
 */

import { existsSync, writeFileSync } from 'fs';
import minimist from 'minimist';
import {
  getClient,
  configMapExists,
  patchConfigMap,
  createConfigMap,
  recyclePods,
  waitForPods,
  defaultNamespace,
  extensionsConfigMap,
  featureConfigMap,
  productConfigMap,
  labelSelectorBundle,
  labelSelectorOperator,
  labelSelectorWatcher
} from './lib/aiops-k8s-utils.mjs';

const defaultTarget = {
  url: 'https://cpd-aiops.apps.yourcluster.cp.yourdomain.com/',
  username: '<your api user>',
  apiKey: '<your api key>',
  tenantId: 'cfd95b7e-3bc7-4006-a4a8-a73a79c71255',
  bundleName: 'alerts-examples'
};
const defaultFeatureFlag = 'USE_CUSTOM_DASHBOARD';
const targetFile = 'target.json'

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

// Made with Bob
