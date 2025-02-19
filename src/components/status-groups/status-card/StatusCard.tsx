/**
 * © Copyright IBM Corp. 2022, 2023
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Button } from '@carbon/react';

const className = 'status-card';

const StatusCard = (props: {label?: string, statusList: Array<Status>}) => {
  const {
    label,
    statusList
  } = props;

  return (
    <div className={className}>
      <span className={`${className}__label`} title={label}>{label}</span>
      <div className={`${className}__status-row`}>
        {
          statusList.map(s => (
            <Button
              className={`${className}__status`}
              hasIconOnly={true}
              iconDescription={s.title}
              onClick={(e: any) => { e.stopPropagation(); s.onClick(); }}
              size='sm'
              style={{backgroundColor: s.color}}>
              {s.value}
            </Button>
            )
          )
        }
      </div>
    </div>
  );
};

export default StatusCard;
