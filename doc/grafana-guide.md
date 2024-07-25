# Grafana embedding

## Prerequisites
- Cloud Pak for AIOps cluster
- UI extension [prerequisites](getting-started.md#step-by-step) completed:
  - 1. Fork...
  - 2. Install...
  - 3. Enable...
- Grafana instance

## Step-by-step
#### 1. Ensure the prerequisites are completed. At this stage, you should be able to access your cluster and find the default instance of the AIOps UI Extension custom resource:
  ```
    $ oc get AIOpsUIExtension -n aiops
    NAME                      READY   MESSAGE
    aiopsuiextension-sample   True    READY FOR E-BUSINESS...
  ```

#### 2. Edit the `aiopsuiextension-sample` custom resource and add the following `spec`:
Update the config in `config/routes.json` to include the following new routes and run `npm run examples -- -n <AIOps namespace> ` to update the AIOpsUIExtension on the cluster. If you are not intending to use the other toolkit samples, you can simply remove them from the `config/routes.json` file at this stage.
```
{
  "menuRoutes": [
    {
      "categoryTitle": "Grafana dashboards",
      "routes": [
          "/embedded-grafana
      ],
      "type": "category"
    }
  ],
  "routes": [
    {
      "path": "/embedded-grafana",
      "title": "Grafana",
      "url": "https://your-grafana-url.com:3000"
    }
  ]
}
```
_Notes:_
  - _Adjust the url/port to be applicable to your instance._
  - _This specification of menu routes creates a new folder in the nav named 'Grafana dashboards', that will then have the 'Grafana' page in it._

#### 3. Edit your grafana configuration to allow embedding: https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/#allow_embedding.

#### 4. Navigate to your CP4AIOps instance and the newly created page: https://cpd-aiops.apps.your-aiops-cluster.your-domain.com/aiops/cfd95b7e-3bc7-4006-a4a8-a73a79c71255/page/embedded-grafana

