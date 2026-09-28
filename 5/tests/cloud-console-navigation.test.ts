import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('engineering simulation and industry cloud expose a reversible demo switch', () => {
  const engineering = readFileSync(resolve('src/components/EngineeringSimulationClient.tsx'), 'utf8');
  const cloud = readFileSync(resolve('src/components/IndustryCloudConsole.tsx'), 'utf8');
  const dispatcher = readFileSync(resolve('src/components/ExperimentEnvironmentClient.tsx'), 'utf8');
  const hall = readFileSync(resolve('src/components/LabHall.tsx'), 'utf8');

  assert.match(engineering, /打开行业云控制台/);
  assert.match(engineering, /onOpenIndustryCloud/);
  assert.match(cloud, /返回工程仿真/);
  assert.match(cloud, /onOpenEngineering/);
  assert.match(cloud, /设备已确认执行/);
  assert.match(dispatcher, /onOpenIndustryCloud/);
  assert.match(hall, /setCurrentPage\("industryCloudConsole"\)/);
  assert.match(hall, /setCurrentPage\("environmentClient"\)/);
});
