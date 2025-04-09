# Getting started

## Prerequisites
- Cloud Pak for AIOps cluster
- Node.js v18
- OpenShift CLI (oc)

## Step-by-step
1. Fork this repository.

2. Install dependencies.

    `npm i`

3. Create an API key.
  - If you're using a shared account, check with the account owner for an existing key.
  - Otherwise, create an API key here - https://cpd-\<project-name\>.apps.\<cluster-name\>.\<domain\>/zen/#/settings/profile/list, e.g.
    > https://cpd-aiops.apps.yourcluster.cp.yourdomain.com/zen/#/settings/profile/list

4. Inside the repository, create a file named `target.json` and use the following format, including the apiKey generated in the previous step. This is used to test with your cluster.
```json
  {
    "url": "https://cpd-aiops.apps.yourcluster.cp.yourdomain.com/",
    "username": "<your api user>",
    "apiKey": "<your api key>",
    "tenantId": "cfd95b7e-3bc7-4006-a4a8-a73a79c71255",
    "bundleName": "alerts-examples"
  }
```

5. Enable the dashboard extension feature on your cluster.
  - `oc login --token=<admin user token> --server=<your cluster>`
  - `oc patch aiopsui aiopsui-instance --type merge -p '{"spec":{"container":{"uiBundleApi":{"image":{"pullSecret":"YOUR PULL SECRET"}}}}}' -n <AIOps namespace>`
  - `npm run enable -- -n <AIOps namespace>`

6. Run the examples within your Cloud Pak for AIOps cluster.
  - Deploy the examples to the cluster, `npm run deploy -- -n <AIOps namespace>`
  - Confirm the examples show up in the main menu at your browser console (e.g. https://cpd-aiops.apps.yourcluster.cp.yourdomain.com).
  > You may need to wait a minute then reload the browser console to pick up the changes.
  > Also if you ever want to remove the examples, `npm run examples -- --remove -n <AIOps namespace>`

7. Run the examples locally.
  - Start your local server, `npm start`
  > Make sure there are no other processes running on port 8080.
  - Open a browser to your dashboard page. The format is

    `https://127.0.0.1:8080/aiops/cfd95b7e-3bc7-4006-a4a8-a73a79c71255/page/alerts-workflow`
  > alerts-workflow is one of the example pages provided. Other examples include alerts-timeline and alerts-top-10.

8. Build your own custom pages!
  - Predefined panels - Use a panel provided by Cloud Pak for AIOps, alertViewer or incidentViewer.
  - Custom panels - Create custom React components to do whatever you like. Several examples are provided to help get you started.
  > All panels must be exported in `src/index.js`.

9. Use the example config `config/routes.json` as a starting point and add your own routes and panels.
  - Set the path by which the custom dashboard page will be accessible from the console URL, e.g. `/your-path`.
  - Define how your panels are organized in the page. Regions include top, bottom, left and right.
  - Whenever you want to see the changes in your cluster you will have to re-run the ```npm run deploy -- -n <AIOps namespace>``` command.
  - That's all!
