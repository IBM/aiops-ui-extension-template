/**
 * © Copyright IBM Corp. 2022, 2025
 * SPDX-License-Identifier: Apache-2.0
 */

type AlertsBySev = {
  [groupKey: string]: {
    [date: string] : number
  }
};

type AlertCountDataPoint = {
  group: string,
  date: string,
  value: number
}

type ChartDataPoint = {
  date: Date,
  group: string,
  value: number
}
