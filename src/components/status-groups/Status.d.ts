/**
 * © Copyright IBM Corp. 2022, 2023
 * SPDX-License-Identifier: Apache-2.0
 */

type Status = {
  title: string,
  value: string|number
  color: string
  onClick?: () => void | undefined;
}

type StatusGroupCounts = {
  [key: string]: {
    [status: string]: {
      count: number,
      maxSeverity: number,
      [severity: string]: number
    }
  }
}
