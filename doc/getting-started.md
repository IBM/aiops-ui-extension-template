# Deploying on an Airgapped RHEL Host

This guide covers deploying the AIOps UI Extension Toolkit on a RHEL machine that has **no internet access**.
It assumes all packaging was done on a separate internet-connected machine and the resulting archive has been transferred.

---

## Prerequisites (on the airgapped RHEL host)

| Requirement                                  | Notes                                                                  |
| -------------------------------------------- | ---------------------------------------------------------------------- |
| **Node.js v18**                        | Must be installed before running any`npm` commands                   |
| **OpenShift CLI (`oc`)**             | Must be installed and on`$PATH`                                      |
| **CP4AIOps cluster**                   | Already installed and accessible from this RHEL host                   |
| **`aiops-toolkit-with-deps.tar.gz`** | The transferred archive containing source +`node_modules`            |
| **Cluster CA certificate** (optional)  | Required only if the cluster uses a custom/self-signed TLS certificate |
| **Alert Filters and Incident Filters** | Required Alerts and incident filters to be created on Cp4AIOps         |

> Verify prerequisites before starting:
>
> ```bash
> node --version   # must show v18.x.x
> npm --version
> oc version
> ```

---

## Step 1 — Extract the Archive

```bash
mkdir -p aiops-ui-extension-toolkit
tar -xzvf aiops-toolkit-with-deps.tar.gz -C aiops-ui-extension-toolkit
cd aiops-ui-extension-toolkit
```

> `node_modules` is included in the archive — **do not run `npm install`**.

---

## Step 2 — Create an API Key

In a browser, navigate to the CP4AIOps console and create an API key:

```
https://cpd-<project-name>.apps.<cluster-name>.<domain>/zen/#/settings/profile/list
```

> If using a shared account, check with the account owner for an existing key.

Keep this key handy — you will need it in Step 4.

---

## Step 3 — Log in to the OpenShift Cluster

```bash
oc login --token=<admin-user-token> --server=https://api.<cluster-name>.<domain>:6443
```

> To get your login token: open the CP4AIOps console → top-right user menu → **Copy login command**.

---

## Step 4 — Enable the Dashboard Extension Feature

### 4a. (If using a custom cluster certificate) Export it first

```bash
export NODE_EXTRA_CA_CERTS=/path/to/cluster-ca.pem
```

### 4b. Patch the aiopsui instance with your pull secret

```bash
oc patch aiopsui aiopsui-instance --type merge \
  -p '{"spec":{"container":{"uiBundleApi":{"image":{"pullSecret":"<YOUR-PULL-SECRET>"}}}}}' \
  -n <AIOps-namespace>
```

Replace `<YOUR-PULL-SECRET>` with the name of the Kubernetes secret in the AIOps namespace that holds credentials for the internal container registry.

### 4c. Run the enable script

```bash
npm run enable -- -n <AIOps-namespace>
```

This script will:

- Set the `USE_CUSTOM_DASHBOARD` feature flag in the cluster
- Recycle the operator and watcher pods
- Wait until all required pods are running and ready

> **Namespace:** Typically `cp4waiops` or `cp4aiops`. Confirm with:
>
> ```bash
> oc get aiopsui -A
> ```

---

## Step 5 — Configure `target.json`

Edit `target.json` in the project root with your cluster details and the API key from Step 2:

```json
{
  "url": "https://cpd-aiops.apps.<cluster-name>.<domain>/",
  "username": "<your-api-user>",
  "apiKey": "<your-api-key>",
  "tenantId": "cfd95b7e-3bc7-4006-a4a8-a73a79c71255",
  "bundleName": "alerts-examples"
}
```

> Use your preferred editor, e.g.:
>
> ```bash
> vi target.json
> ```

## Step 6 — Update `config/routes.json`

Edit `routes.json` in the project root with your filter details as created as part of prerequisites

```json
{
 "spec": {
    "menuRoutes": [
      {
        "categoryTitle": "Filtered Alerts",
        "routes": [
          "/<AlertfilterRouteName1>",
          "/<AlertfilterRouteName2>",
          "/<AlertfilterRouteName3>"
        ],
        "type": "category"
      },
      {
        "categoryTitle": "Filtered Incidents",
        "routes": [
          "/<incidentFilterRouteName1>",
          "/<incidentFilterRouteName2>"
        ],
        "type": "category"
      }
    ],
    "routes": [
      {
        "path": "/<AlertfilterRouteName1>",
        "aiopsPanel": "alertViewer",
        "state": {
          "filtername": "<alertFilterName1>",
          "viewname": "<alertViewName1>"
        },
        "title": "<Alert Filter Title 1>"
      },
      {
        "path": "/<AlertfilterRouteName1>",
        "aiopsPanel": "alertViewer",
        "state": {
          "filtername": "<alertFilterName2>",
          "viewname": "<alertViewName1>"
        },
        "title": "<Alert Filter Title 2>"
      },
      {
        "path": "/<AlertfilterRouteName1>",
        "aiopsPanel": "alertViewer",
        "state": {
          "filtername": "<alertFilterName3>",
          "viewname": "<alertViewName2>"
        },
        "title": "<Alert Filter Title 3>"
      },
      {
        "path": "/<incidentFilterRouteName1>",
        "aiopsPanel": "incidentViewer",
        "state": {
          "filtername": "<incidentFilterName1>"
        },
        "title": "<incident Filter Title 1>"
      },
      {
        "path": "/<incidentFilterRouteName2>",
        "aiopsPanel": "incidentViewer",
        "state": {
          "filtername": "<incidentFilterName2>"
        },
        "title": "incident Filter Title 2"
      }
    ],
    "frameSrcUrls": ""
  }
}
```

> Use your preferred editor, e.g.:
>
> ```bash
> vi config/routes.json
> ```

---


## Step 7 — Deploy the Examples to the Cluster

```bash
npm run deploy -- -n <AIOps-namespace>
```

This single command will:

1. **Build** the bundle (`webpack` — fully local, no network calls)
2. **Upload** the bundle files to the CP4AIOps cluster via the bundle API
3. **Update** the `aiops-ir-ui-extensions` ConfigMap on the cluster with the routes from `config/routes.json`

Expected output ends with:

```
✅ Deployment complete! Bundle and routes updated successfully.
```

> If you see `⚠️ No kubeconfig found`, ensure Step 3 (`oc login`) was completed successfully.
> You may need to wait a minute and reload the browser console to pick up the changes.

---

## Step 8 — Verify in the Browser

Open the CP4AIOps console in a browser:

```
https://cpd-aiops.apps.<cluster-name>.<domain>
```

The following example dashboard pages should appear under the **"Example dashboards"** category in the main menu:

| Page                     | Path                        |
| ------------------------ | --------------------------- |
| Alerts workflow          | `/alerts-workflow`        |
| Alerts timeline          | `/alerts-timeline`        |
| Alerts top 10            | `/alerts-top-10`          |
| Incidents distribution   | `/incidents-distribution` |
| Incidents top 10         | `/incidents-top-10`       |
| Application heatmap      | `/application-heatmap`    |
| Monitor boxes            | `/monitor-boxes`          |
| Alert viewer with filter | `/alert-viewer-filter`    |

> If the pages do not appear immediately, wait ~1 minute and hard-refresh the browser.

---

## Re-deploying After Changes

Whenever you modify source files or `config/routes.json`, re-run deploy:

```bash
npm run deploy -- -n <AIOps-namespace>
```

No other steps are needed — this rebuilds the bundle and updates the cluster routes in one command.

### Note: Re-deploying After Changes requires permission to run the above command . Better to have permissions to run this command with the project team

---

## Troubleshooting

### "Failed to get valid local kubeconfig file"

Your `~/.kube/config` has an invalid context entry. Open it and ensure every context has non-empty `cluster` and `user` fields:

```yaml
# Valid entry
contexts:
- context:
    cluster: test-cluster:6443
    namespace: test-namespace
    user: kube:admin/api-test-cluster-com:6443
  name: test-namespace/test-cluster:6443/kube:admin
```

Remove or correct any entries where `cluster` or `user` are empty strings, then re-run the failed command.

### "Unauthorized" error during deploy

Your API key in `target.json` is invalid or expired. Repeat Step 2 to generate a new key and update `target.json`.

### Bundle uploaded but routes not updated

The bundle API upload succeeded but the kubeconfig was not available for the routes update. Ensure `oc login` (Step 3) was run in the same shell session, then run:

```bash
npm run examples -- -n <AIOps-namespace>
```

### Pods not ready after enable

The `enable` script waits up to 5 minutes (30 retries × 10s) for pods to become ready. If it times out, check pod status manually:

```bash
oc get pods -n <AIOps-namespace> -l app.kubernetes.io/name=ibm-watson-aiops-ui-operator
oc get pods -n <AIOps-namespace> -l app.kubernetes.io/component=zen-watcher
oc get pods -n <AIOps-namespace> -l component=aiops-ir-ui-bundle-api
```
