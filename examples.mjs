/**
 * © Copyright IBM Corp. 2022, 2025
 * SPDX-License-Identifier: Apache-2.0
 */

import { spawn } from 'child_process';
import { readFileSync } from 'fs';
import minimist from 'minimist';

const defaultCr = 'aiopsuiextension-sample';
const defaultNamespace = 'cp4aiops';

const addExamples = (finalSpec, namespace, cr) => {
  let newSpec = JSON.stringify(finalSpec);
  const getSpecChildProcess = spawn('oc', ['get', 'AIOpsUIExtension', cr, '-o', 'jsonpath={.spec}', '-n', namespace]);
  getSpecChildProcess.on('exit', (ret) => {
    const writeSpecChildProcess = !ret ?
      spawn('oc', ['patch', 'AIOpsUIExtension', cr, '--type', 'merge', '-p', newSpec, '-n', namespace]) :
      spawn('oc', ['apply', '-f', '-', '-n', namespace]);
    if (ret) {
      console.log('Creating examples...')
      newSpec = JSON.stringify({
        kind: 'AIOpsUIExtension',
        metadata: { name: cr },
        apiVersion: 'consoleui.aiops.ibm.com/v1',
        ...finalSpec
      });
      writeSpecChildProcess.stdin.setEncoding('utf8');
      writeSpecChildProcess.stdin.write(newSpec + '\n');
      setTimeout(() => {
        writeSpecChildProcess.stdin.end();
      }, 1000);
    } else {
      console.log('Updating examples...')
    }
    writeSpecChildProcess.stderr
      .on('data', (err) => {
        const errString = Buffer.from(err).toString();
        console.log(errString);
        if (errString.includes('Unauthorized')) {
          console.log('Could not write example spec due to Unauthorized error. Please ensure you are logged into the Openshift CLI.');
        }
      });
    writeSpecChildProcess.stdout
      .on('data', (err) => {
        console.log(Buffer.from(err).toString());
      });
    writeSpecChildProcess
      .on('exit', (ret) => {
        console.log(!ret ? 'All done! You might need to wait a minute until the examples are ready.' : 'Exited with errors.');
      });
  });
}

const readConfig = () => {
  const routeData = readFileSync('config/routes.json');
  return JSON.parse(routeData);
}

const removeExamples = (namespace, cr) => {
  const deleteSpecChildProcess = spawn('oc', ['delete', 'AIOpsUIExtension', cr, '-n', namespace]);
  deleteSpecChildProcess.stderr
    .on('data', (err) => {
      console.log(Buffer.from(err).toString());
    });
  deleteSpecChildProcess
    .on('exit', (ret) => {
      console.log(!ret ? 'All done!' : 'Exited with errors.');
    });
}

/**
 * Create, patch or remove example custom resource
 *
 * @cr {*} Custom resource name
 * @namespace {*} Namespace
 * @remove {*} Remove examples
 */
const { cr, namespace, remove } = minimist(process.argv.slice(2),
  {
    alias: { n: 'namespace', r: 'remove' },
    boolean: ['remove'],
    default: { namespace: defaultNamespace, cr: defaultCr }
  });

const specObj = readConfig();
if (remove) {
  removeExamples(namespace, cr);
} else {
  addExamples(specObj, namespace, cr);
}
