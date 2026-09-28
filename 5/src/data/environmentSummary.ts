import type { ExperimentEnvironment } from './environments';

export interface EnvironmentSummary {
  total: number;
  platform: number;
  composite: number;
  container: number;
  matchedCourses: number;
}

export function summarizeEnvironments(environments: ExperimentEnvironment[]): EnvironmentSummary {
  return environments.reduce<EnvironmentSummary>((summary, environment) => {
    summary.total += 1;
    summary.matchedCourses += environment.coursesCount;
    if (environment.type === '平台型') summary.platform += 1;
    if (environment.type === '组合型') summary.composite += 1;
    if (environment.type === '容器型') summary.container += 1;
    return summary;
  }, { total: 0, platform: 0, composite: 0, container: 0, matchedCourses: 0 });
}
