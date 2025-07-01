# Uploading to Minio
For larger bundles composed of multiple files, you can directly upload the files to Minio. The following involves generating a route in Openshift to expose Minio.

## Step-by-step
#### 1. Generate a route that exposes minio so you can directly upload to it
To do this we use an Ingress object that will automatically generate a route for you. Use the following template:
```
kind: Ingress
apiVersion: networking.k8s.io/v1
metadata:
  name: aiops-minio-ingress
  namespace: aiops
  annotations:
    route.openshift.io/destination-ca-certificate-secret: ibm-cp-watson-aiops-tls-ca
    route.openshift.io/termination: reencrypt
spec:
  rules:
    - host: aiops-minio-ingress.apps.{hostname}
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: aimanager-ibm-minio-svc
                port:
                  number: 9000
```

Ensure you replace or validate the following:
- `spec.rules.host` - Replace with your cluster hostname
- `metadata.namespace` - Use your own namespace if different

You can either:
- Save this into a yaml file, e.g `my-minio-route.yaml` and then using the Openshift cli run `oc create -f my-minio-route.yaml`
- Create it in the Openshift console using the Import tool: https://console-openshift-console.apps.{hostname}/k8s/ns/aiops/import

After creation, you should find an associated route. In this case, it will be named: `aiops-minio-ingress-xxxxx`.

#### 2. Setup the Minio Client to work directly with the AIOps Minio instance
1) Install the client: https://min.io/docs/minio/linux/reference/minio-mc.html#install-mc
2) Create an alias for your Minio instance, using the route created above:
```
mc alias set my-aiops-minio https://aiops-minio-ingress.apps.{hostname} {minio-accesskey} {minio-secretkey}
```

Notes:
- `my-aiops-minio` - A name for the alias. Can be anything.
- `{hostname}` - Replace with your deployment's hostname.
- `{minio-accesskey}` - Can be obtained from the `aimanager-ibm-minio-access-secret` secret.
- `{minio-secretkey}` - Can be obtained from the `aimanager-ibm-minio-access-secret` secret.

#### 3. Copy the directory to Minio
1) Use the minio client to copy the directory using the alias created
```
mc cp --recursive ~/{path-to-bundle-dir}/  my-aiops-minio/aiops-ui-bundles/{tenant-id}
```

Notes:
- `{path-to-bundle-dir}` - The directory of files you want to copy over. The actual bundle directory will become your 'bundle-id'.
- `{tenant-id`} - The tenant id. `cfd95b7e-3bc7-4006-a4a8-a73a79c71255`.


#### 4. Using the bundle from minio
1) In your routes file, you can use the `url` key to point directly to a bundle file which in turn can then leverage the other files in your bundle. Use the following template in your `spec.routes` block inside the `routes.json` file, or directly in the `AIOpsUIExtension` instance if editing in Openshift:
```
- path: /hello-world
  title: Hello world
  url: /api/p/hdm_custom_panel/cfd95b7e-3bc7-4006-a4a8-a73a79c71255/bundles/hello-bundle/files/hello.html
```

Notes:
- Path and title can represent whatever you chose. Remember that the path can then match up to an associated `menuRoute`.
- `hello-bundle` in the `url` should represent the 'bundle-id' mentioned earlier. For instance, if your path was `~/Laptop/Development/my-custom-bundle` then my url would read `/api/p/hdm_custom_panel/cfd95b7e-3bc7-4006-a4a8-a73a79c71255/bundles/my-custom-bundle/files/hello.html`

