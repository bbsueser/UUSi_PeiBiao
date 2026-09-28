import type { ActiveTab } from './types';

export const ACTIVE_TAB_STORAGE_KEY = 'platform_active_tab';
export const LAB_PAGE_STORAGE_KEY = 'platform_lab_page';
export const LAB_ENVIRONMENT_STORAGE_KEY = 'platform_lab_environment';

export type LabPage =
  | 'experimentHall'
  | 'environmentClient'
  | 'industryCloudConsole'
  | 'threeDDesigner'
  | 'twoDDesigner'
  | 'ideClient'
  | 'threeDEngineering';

const activeTabs: ReadonlySet<string> = new Set([
  'dashboard', 'courses', 'labs', 'exams', 'specs', 'exams_tab',
  'best_practices', 'product_center', 'about_platform', 'ai_assistant',
  'ai_skills_config', 'ai_analysis', 'hardware_agent', 'personal_center',
  'task_assignment'
]);

const labPages: ReadonlySet<string> = new Set([
  'experimentHall', 'environmentClient', 'industryCloudConsole',
  'threeDDesigner', 'twoDDesigner', 'ideClient', 'threeDEngineering'
]);

export function parseActiveTab(value: string | null): ActiveTab {
  return value && activeTabs.has(value) ? value as ActiveTab : 'dashboard';
}

export function parseLabPage(value: string | null): LabPage {
  return value && labPages.has(value) ? value as LabPage : 'experimentHall';
}
