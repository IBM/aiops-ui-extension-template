/**
 * © Copyright IBM Corp. 2022, 2025
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { withConsole } from '@storybook/addon-console';
import './_carbon-styles.scss';

// @ts-ignore
import getReactRenderer from '@ibm/akora-renderer-react';

// @ts-ignore
const { AkoraStateProvider } = getReactRenderer(React, ReactDOM).components;

const withAkora = (StoryComponent, context) => {
  const { title } = context;
  console.log('JSJS with akora');
  return (
    <AkoraStateProvider value={{
      app: {
        replaceRoute: (r) => console.log(r),
        resolvePathExpression: (p) => p,
        getStateForPath: () => ({ title })
      },
      state: {
        clientConfiguration: {
          publicurl: 'https://someurl.com'
        },
        fullPath: '/',
        path: '/'
      }
    }}>
      <div className='hdm--custom-layout-container'>
        <StoryComponent {...context} />
      </div>
    </AkoraStateProvider>
  );
};

const decorators = [
  withAkora,
  (StoryComponent, context) => withConsole()(StoryComponent)(context)
];

const preview = {
  decorators,
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    options: {
      storySort: {
        method: 'alphabetical'
      }
    },
  },
};

export default preview;
