
import { CancerStage } from './types';

export const STAGE_COLORS: Record<CancerStage, { bg: string; text: string; border: string }> = {
  [CancerStage.NORMAL]: {
    bg: 'bg-green-100 dark:bg-green-900',
    text: 'text-green-800 dark:text-green-200',
    border: 'border-green-500',
  },
  [CancerStage.BEGINNING]: {
    bg: 'bg-yellow-100 dark:bg-yellow-900',
    text: 'text-yellow-800 dark:text-yellow-200',
    border: 'border-yellow-500',
  },
  [CancerStage.INTERMEDIATE]: {
    bg: 'bg-orange-100 dark:bg-orange-900',
    text: 'text-orange-800 dark:text-orange-200',
    border: 'border-orange-500',
  },
  [CancerStage.FINAL]: {
    bg: 'bg-red-100 dark:bg-red-900',
    text: 'text-red-800 dark:text-red-200',
    border: 'border-red-500',
  },
  [CancerStage.UNKNOWN]: {
    bg: 'bg-slate-200 dark:bg-slate-700',
    text: 'text-slate-800 dark:text-slate-200',
    border: 'border-slate-500',
  },
};
