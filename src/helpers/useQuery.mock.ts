import { fn } from '@storybook/test';
export * from './useQuery';

export const useQuery = fn((input: string) => input).mockName('useQuery');