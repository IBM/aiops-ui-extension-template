/**
 * © Copyright IBM Corp. 2022, 2025
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import Sample from './Sample';

describe('Sample', () => {
  it('should match sample snapshot', () => {
    expect(render(<Sample />)).toMatchSnapshot();
    expect(screen.getByText('Hello world!')).toBeInTheDocument();
  });
});
