# 行业云双向联动与 AI 图文回复改造实施计划

> **Execution:** Use the `superpowers:executing-plans` skill to implement this plan task-by-task.

**Goal:** 让 UUSi 与 P2 都能完整演示“仿真数据上云、云端控制执行器、设备回执同步”的闭环，并将 MQTT AI 回复改造成内容完整、配图形象、离线可用的真实教学问答。

**Architecture:** UUSi 使用一个无后端的浏览器本地桥接模块，以 `localStorage` 保存权威状态、以 `BroadcastChannel` 和 `storage` 事件跨页面实时通知；工程仿真页只负责产生遥测并执行指令，行业云页只负责显示遥测并下发指令。P2 保留单页 React 结构，但把现有 `window.CLOUD_SHARED_STATE` 明确为唯一共享状态，移除云端自行抖动数据，补齐指令生命周期和仿真离线状态。两套项目共用同一张本地教学场景图的内容思路，但分别存放、独立运行。

**Tech Stack:** 原生 HTML/CSS/JavaScript、Node.js `node:test`、React 18 + TypeScript、Vite、ImageGen 本地 PNG 资产。

**Spec:** 本计划基于 2026-09-23 对话中已确认的“智慧温室云端联动”和 MQTT 图文回答设计。

---

## 已核查结论

- UUSi 的 `industry-cloud.html` 当前每 2 秒自行随机生成遥测，工程仿真页与行业云页没有共享同一份数据；云端控制按钮只改本页状态，因此不构成真实演示闭环。
- UUSi 的 MQTT 回答使用 `generateMqttFlowSVG()` 生成方框箭头流程图，正文只覆盖基础概念，不足以模拟真实知识库问答。
- P2 已有 `window.CLOUD_SHARED_STATE` 和下发入口，但行业云控制台仍会自行修改遥测值；下发记录在发出时直接写“成功”，没有等待设备回执；关闭仿真不会把云端置为离线。
- P2 的 MQTT 回答正文只有发布者、订阅者、Broker 和一句优点；`public/images/ai-answers/mqtt-pubsub.png` 是带水印的卡片箭头式生成图，存在相同的“AI 味”和信息不足问题。

## Task 1：先建立可失败的联动与问答验收测试

**Files:**
- Create: `tests/demo-cloud-bridge.test.js`
- Modify: `tests/demo-integrity.test.js`
- Modify: `D:/Aliyun/公司历史文件/陪标文件/P2/陪标p2/5/tests/demo-navigation.test.ts`
- Modify: `D:/Aliyun/公司历史文件/陪标文件/P2/陪标p2/5/tests/offline-assets.test.ts`

- [x] 在 UUSi 的桥接单测中覆盖：默认离线、启动并发布遥测、生成控制指令、设备确认回执、停止后离线且遥测序号不再增长。
- [x] 在 UUSi 静态完整性测试中断言：两个页面都加载 `js/demo-cloud-bridge.js`；AI 回答引用本地 PNG；页面中不再出现 `ThingsBoard` 与 `generateMqttFlowSVG`。
- [x] 在 P2 测试中断言：行业云不再自行 jitter 权威遥测；共享状态包含 `commandStatus`/`ackAt`；关闭环境写入离线状态；MQTT 图片资产存在且无远程 URL。
- [x] 先运行测试并确认新增测试因功能尚未实现而失败：

```powershell
node --test tests/demo-cloud-bridge.test.js tests/demo-integrity.test.js
npx tsx --test tests/demo-navigation.test.ts tests/offline-assets.test.ts
```

## Task 2：实现 UUSi 浏览器本地云桥

**Files:**
- Create: `js/demo-cloud-bridge.js`
- Modify: `engineering-simulation.html`
- Modify: `industry-cloud.html`

- [x] 创建 UMD 风格 `DemoCloudBridge`，使浏览器和 Node 测试都能使用。状态至少包含：

```js
{
  version: 1,
  simulation: { running: false, connected: false, scene: '智慧温室' },
  telemetry: { temperature: null, humidity: null, light: null, door: null, sequence: 0, updatedAt: null },
  actuator: { fanOn: false, updatedAt: null },
  command: { id: null, target: 'fan', desiredOn: false, status: 'idle', sentAt: null, ackAt: null, message: '' },
  logs: []
}
```

- [x] 提供 `startSimulation()`、`stopSimulation()`、`publishTelemetry()`、`sendFanCommand()`、`acknowledgeCommand()`、`subscribe()` 和 `getState()`；所有写入先落 `localStorage`，再经 `BroadcastChannel` 通知，并保留 `storage` 事件降级路径。
- [x] 日志限制为最近 80 条，状态读取时做结构归一化，避免旧缓存破坏演示。
- [x] 在 `engineering-simulation.html` 中加载桥接脚本。仿真启动/停止时更新连接状态；智慧温室传感器每 2 秒把同一批温湿度、光照和门磁值发布到桥接状态；收到风扇指令后调用现有 `setDeviceState()`，把下行命令写入消息面板，再回写成功回执。
- [x] 在工程页增加紧凑的“行业云联动”状态区：连接状态、最后上报时间、最近指令与回执、打开行业云控制台按钮。按钮新开 `industry-cloud.html`，便于录屏时同时观察两端。
- [x] 在 `industry-cloud.html` 中加载桥接脚本，删除本页独立随机遥测；所有卡片、在线状态、时间和日志只读取共享状态。
- [x] 云端按钮按生命周期显示：“开启通风风扇” → “指令已发送，等待设备回执” → “设备执行成功”；仿真离线时按钮禁用，遥测停止更新；关闭命令走同一链路。
- [x] 将用户可见的 “ThingsBoard 开源物联网平台” 和演示地址统一改为“行业云平台”与本地演示接入地址，不留下品牌表述。

## Task 3：生成并接入形象化 MQTT 教学插图

**Files:**
- Create: `images/ai-answers/mqtt-smart-greenhouse.png`
- Create: `D:/Aliyun/公司历史文件/陪标文件/P2/陪标p2/5/public/images/ai-answers/mqtt-smart-greenhouse.png`
- Modify: `ai-assistant.html`
- Modify: `D:/Aliyun/公司历史文件/陪标文件/P2/陪标p2/5/src/components/AiAssistant.tsx`

- [x] 按 `imagegen` 技能读取提示词规范，生成一张 16:9 横向教育插图：真实教材摄影/技术插画风格的智慧温室，清楚出现温湿度传感器、ESP32/边缘网关、通风风扇、云端监控屏和手机看板；不使用流程图方框和箭头，不放长段文字，不使用塑料 3D 图标风格，不带水印。
- [x] 目视检查构图、硬件形态和文字伪影；不合格则迭代一次。将最终 PNG 分别复制到两个项目的本地资产目录。
- [x] UUSi 删除 `generateMqttFlowSVG()`，消息卡改为语义化 `<figure>`，包含本地图片、标题、说明和准确 `alt`。
- [x] P2 的 MQTT 发布/订阅回答改用新图，保留现有知识库来源卡；不修改其他问答功能。

## Task 4：把 MQTT 回答扩写成真实教学答复

**Files:**
- Modify: `ai-assistant.html`
- Modify: `D:/Aliyun/公司历史文件/陪标文件/P2/陪标p2/5/src/components/AiAssistant.tsx`

- [x] 两端回答均包含：一句话定义、Publisher/Subscriber/Broker/Topic 四个角色、智慧温室从采集到控制回执的完整过程。
- [x] 加入可直接演示的主题与负载示例：

```text
上报主题：greenhouse/GH-01/telemetry
上报载荷：{"temperature":26.4,"humidity":68,"fan":false}
控制主题：greenhouse/GH-01/command/fan
控制载荷：{"on":true,"commandId":"cmd-1001"}
```

- [x] 补充 QoS 0/1/2、保留消息、遗嘱消息、适用优势与限制、四步排错建议，以及一段短小可读的 ESP32/Arduino 发布订阅代码。
- [x] 文案保持专业但口语化，避免绝对化和营销化表述；UUSi 增加“知识库参考”卡，P2 沿用现有来源字段。

## Task 5：收紧 P2 的双向联动语义

**Files:**
- Modify: `D:/Aliyun/公司历史文件/陪标文件/P2/陪标p2/5/src/components/IndustryCloudConsole.tsx`
- Modify: `D:/Aliyun/公司历史文件/陪标文件/P2/陪标p2/5/src/components/EngineeringSimulationClient.tsx`

- [x] 扩展共享状态：下发指令包含唯一 ID、`pending/acknowledged/failed` 状态、发送时间和回执时间。
- [x] 删除 `IndustryCloudConsole` 中对 `latestValues` 的自主随机抖动，仅轮询/订阅仿真侧写入的权威状态。
- [x] 点击“测试下发”时先记录为“等待设备回执”，不再立即写“成功”；工程仿真执行风扇/继电器后回写实际状态和回执；行业云收到回执后更新执行记录与提示。
- [x] `handleConfirmClose()` 将共享状态写为 `isConnected: false`、`isReporting: false`；重新启动并保持已同步时恢复上报，使云端在线/离线和控制可用性与仿真一致。
- [x] 下行命令同时进入工程通信消息与操作日志，云端保留指令、回执和最后同步时间，形成可录屏的因果链。

## Task 6：更新演示指南并做完整验证

**Files:**
- Modify: `UUSi-招标参数演示指南.md`
- Modify: `D:/Aliyun/公司历史文件/陪标文件/P2/陪标p2/5/P2-招标参数演示指南.md`（若现有指南文件名不同，使用该目录中对应 P2 演示指南）

- [x] 更新两份指南的行业云演示步骤：启动仿真、同步/连接、核对同值同时间、云端开启风扇、查看工程消息与状态、查看云端回执、关闭风扇、停止仿真并验证离线。
- [x] 更新两份指南的 AI 演示步骤，指定 MQTT 推荐问题，并列出配图、完整正文、代码和知识库来源四个镜头。
- [x] 运行 UUSi 全部测试：

```powershell
node --test tests/*.test.js
powershell -ExecutionPolicy Bypass -File tests/verify-platform.ps1
```

- [x] 运行 P2 测试与构建：

```powershell
npx tsx --test tests/*.test.ts
npm run build
```

- [x] 使用浏览器做 UUSi 双标签手工验收和 P2 跨页面手工验收；每端完成开启、回执、关闭、停止离线四个动作，确认控制台无错误、页面无横向溢出、图片本地加载正常。
- [x] 最后全文搜索 UUSi 的 `ThingsBoard`、旧 SVG 函数和远程图片 URL，确认演示界面不再残留不应出现的品牌或旧资源。

## 完成标准

- 两个项目都能清楚证明遥测来自仿真端，而不是云端自己随机生成。
- 两个项目都能演示“云端发命令—仿真执行—工程消息记录—云端收到回执”的双向闭环。
- 停止仿真后云端在一个上报周期内显示离线并禁用控制，重新启动后可恢复。
- MQTT 回答在两个项目中都有形象化本地配图、完整正文、代码示例和知识库来源，无流程图式 AI 卡片和生成水印。
- UUSi 用户可见文本不出现 `ThingsBoard`。
