import test from 'node:test';
import assert from 'node:assert/strict';

test('restores a valid top-level demo tab and rejects unknown values', async () => {
  let navigation: typeof import('../src/demoNavigation') | undefined;
  try {
    navigation = await import('../src/demoNavigation');
  } catch {
    navigation = undefined;
  }

  assert.equal(typeof navigation?.parseActiveTab, 'function');
  assert.equal(navigation?.parseActiveTab('labs'), 'labs');
  assert.equal(navigation?.parseActiveTab('unknown-page'), 'dashboard');
  assert.equal(navigation?.parseActiveTab(null), 'dashboard');
});

test('restores a valid laboratory workspace and rejects unknown values', async () => {
  let navigation: typeof import('../src/demoNavigation') | undefined;
  try {
    navigation = await import('../src/demoNavigation');
  } catch {
    navigation = undefined;
  }

  assert.equal(typeof navigation?.parseLabPage, 'function');
  assert.equal(navigation?.parseLabPage('environmentClient'), 'environmentClient');
  assert.equal(navigation?.parseLabPage('industryCloudConsole'), 'industryCloudConsole');
  assert.equal(navigation?.parseLabPage('unknown-workspace'), 'experimentHall');
});
