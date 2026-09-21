export type GenerationState = 'idle' | 'waiting' | 'generating' | 'complete' | 'interrupted' | 'incomplete' | 'failed';
export const generationStates: readonly GenerationState[];
export function registerClarityElements(): void;
export interface ClarityElement<T = Record<string, unknown>> extends HTMLElement { data: T | null; }
export interface TableData { rows: Array<{ id: string | number; [key: string]: unknown }>; columns?: Array<{ key: string; label: string }>; }
export interface GenerationData { state: GenerationState; text?: string; error?: string; note?: string; }
export interface ExecutionData { title?: string; note?: string; steps: Array<{id: string; label: string; state: 'pending' | 'running' | 'complete' | 'failed' | 'skipped'; detail?: string; retryable?: boolean}>; }
export interface EvidenceData { title?: string; summary?: string; inputs?: string[]; sources: Array<{title: string; url?: string; excerpt?: string; state?: 'provided' | 'conflicting' | 'unavailable'; date?: string}>; }
export interface DecisionDetail { decision: 'approve' | 'reject'; ids: string[]; }
export interface RequestDetail { prompt: string; context: string[]; files: File[]; }
export interface FeedbackDetail { claimId: string | null; reasons: string[]; detail: string; }
declare global {
 interface HTMLElementTagNameMap {
  'cl-menu': ClarityElement<{items: Array<{id:string;label:string;disabled?:boolean}>}>;
  'cl-popover': ClarityElement<{title?:string;text?:string}>;
  'cl-tooltip': ClarityElement;
  'cl-combobox': ClarityElement<{options: string[]}>;
  'cl-multiselect': ClarityElement<{options: string[]}>;
  'cl-date-range': ClarityElement<{start?: string;end?: string}>;
  'cl-drawer': ClarityElement<{title?:string;text?:string;name?:string}>;
  'cl-upload': ClarityElement & {files: File[]};
  'cl-data-table': ClarityElement<TableData>;
  'cl-stepper': ClarityElement<{steps:Array<{title:string;name?:string;label?:string}>}>;
  'cl-ai-capability': ClarityElement<{title?:string;description?:string;capabilities?:string[];limitations?:string[];quality?:string;examples?:string[]}>;
  'cl-ai-suggestion': ClarityElement<{title?:string;text?:string;context?:string}>;
  'cl-ai-clarification': ClarityElement<{title?:string;reason?:string;options?:string[]}>;
  'cl-ai-evidence': ClarityElement<EvidenceData>;
  'cl-ai-correction': ClarityElement<{title?:string;original?:string;proposed?:string}>;
  'cl-ai-feedback': ClarityElement<{title?:string;claim?:string;claimId?:string;consequence?:string}>;
  'cl-ai-context': ClarityElement<{items:Array<{id:string;label:string;detail:string}>}>;
  'cl-ai-preferences': ClarityElement<{assistance?:boolean;personalize?:boolean;scope?:'selected'|'workspace'}>;
  'cl-ai-change-notice': ClarityElement<{id?:string;title?:string;description?:string;impact?:string}>;
  'cl-ai-composer': ClarityElement<{context?:string[];suggestions?:string[]}>;
  'cl-ai-generation': ClarityElement<GenerationData>;
  'cl-ai-action-review': ClarityElement<{title?:string;description?:string;consequence?:string;actions:Array<{id:string;label:string;detail:string}>}>;
  'cl-ai-execution': ClarityElement<ExecutionData>;
 }
}
