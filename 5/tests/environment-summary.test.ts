import test from 'node:test';
import assert from 'node:assert/strict';
import { experimentEnvironments } from '../src/data/environments';

test('laboratory summary is derived from the environments displayed', async () => {
  let summaryModule: typeof import('../src/data/environmentSummary') | undefined;
  try {
    summaryModule = await import('../src/data/environmentSummary');
  } catch {
    summaryModule = undefined;
  }

  assert.equal(typeof summaryModule?.summarizeEnvironments, 'function');
  const summary = summaryModule!.summarizeEnvironments(experimentEnvironments);
  assert.equal(summary.total, experimentEnvironments.length);
  assert.equal(summary.platform + summary.composite + summary.container, summary.total);
  assert.equal(summary.matchedCourses, experimentEnvironments.reduce((sum, item) => sum + item.coursesCount, 0));
});
