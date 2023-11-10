/**
 * © Copyright IBM Corp. 2022, 2023
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export type PanelProps = {
  dashOriginUrl?: string,
  isZenHeaderEnabled?: boolean,
  akoraOriginUrl?: string,
  asmProxyEndpoint?: string,
  app?: unknown,
  locale?: string
};

const createPanel = (Component: React.FC) => (props: PanelProps) : JSX.Element => <Component/>;

export default createPanel;