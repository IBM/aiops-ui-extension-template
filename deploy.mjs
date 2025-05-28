/**
 * © Copyright IBM Corp. 2022, 2025
 * SPDX-License-Identifier: Apache-2.0
 */

import { AiopsBundleApiClient, UploadBundleTask, loginWithApiKey } from 'cp4waiops-ui-bundle-tools';
import fs from 'fs/promises';

const targetData = await fs.readFile('./target.json');
const targetDataJSON = JSON.parse(targetData);

// if (targetDataJSON.insecure) { // currently no support for cert checking, api validation only
process.removeAllListeners('warning');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
// }

const { authToken } = await loginWithApiKey(targetDataJSON.url, targetDataJSON.username, targetDataJSON.apiKey);
console.log('Logged into cluster and ready to upload 📡');

const bundleClient = AiopsBundleApiClient({
  url: targetDataJSON.url,
  token: authToken
});

const uploadBundleTask = UploadBundleTask(bundleClient);

console.log('Initiating bundle upload 🚀')
try {
  await uploadBundleTask.uploadBundleFromDirectory(targetDataJSON.tenantId, targetDataJSON.bundleName, 'dist' );
  console.log('Bundle uploaded successfully! 🎉')
} catch(e) {
  console.error(e)
}
