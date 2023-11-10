/**
 * © Copyright IBM Corp. 2022, 2023
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import './sample.scss';
// @ts-ignore
import ibm from './boilerplate-ibm-img.png';

const Sample: React.FC = () => {

  return (
    <>
      <div className='sample-container'>
        <h1> Hello world! </h1>
        <img alt="IBM Logo" src={ibm}/>
      </div>
    </>
  );
}

export default Sample;