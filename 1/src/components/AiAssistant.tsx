/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  BrainCircuit, 
  BookOpen, 
  FileText, 
  Award, 
  Monitor, 
  HelpCircle, 
  Layers, 
  Sparkles, 
  Check, 
  Copy, 
  Download, 
  RefreshCcw, 
  Settings, 
  User, 
  Clock, 
  ChevronRight, 
  Plus, 
  Play, 
  FileCheck,
  ChevronDown,
  Info,
  MessageSquare,
  Send,
  Activity,
  Terminal,
  Compass,
  Trash2,
  Maximize2,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import { UserSession, AiAssistantInitContext } from "../types";

import AiCompanionConfig from "./AiCompanionConfig";
import SkillGraphAnalysis from "./SkillGraphAnalysis";
import AiAdvancedRecommendation from "./AiAdvancedRecommendation";
import LearningEngagementAnalysis from "./LearningEngagementAnalysis";

// Dynamic response templates to emulate a powerful high-quality LMS AI engine
const mockResults = {
  courseStandard: (formData: any) => `### 课程标准预览

## 一、 课程基本信息
*   **课程名称**: ${formData.courseName || "物联网设备开发实操"}
*   **专业方向**: ${formData.majorDirection || "物联网应用技术"}
*   **课程类型**: ${formData.courseType || "专业核心课"}
*   **教学对象**: ${formData.targetAudience || "高职二年级学生"}
*   **总学时**: ${formData.totalHours || "64"} 学时（理论学时：${formData.theoryHours || "24"}，实训学时：${formData.practicalHours || "40"}）

## 二、 课程性质与定位
《${formData.courseName || "物联网设备开发实操"}》是${formData.majorDirection || "物联网应用技术"}专业的核心专业能力必修课。本课程定位在于：${formData.position || "面向物联网设备接入、数据采集与平台应用能力培养"}。
本大纲依据行业急需的人才规格制定，重点解决学生从嵌入式硬核传感采集、异构多协议映射重组，到云端物模型适配、大屏可视化展现的全栈研发和工程能力。

## 三、 课程设计思路与生成要求
配合教学模式，本大纲生成时着重处理：${formData.generationRequirements || "突出实践教学、项目任务和岗位能力"}。
采用“工学结合、产教融合、任务牵引、仿真联动”的设计思路，将理论知识模块解构到若干个工程场景的实践实训任务中，实现“做中学、做中教、仿真同步、链路通畅”。

## 四、 课程培养目标
### 1. 知识目标
*   理解物联网系统的经典三层框架（感知层、网络层、应用层）及数据传递拓扑；
*   掌握 Modbus 总线协议下四大类寄存器的读写控制规范及CRC16校验机理；
*   精通轻量级互联网 MQTT 协议的核心报文结构、发布订阅消息解耦拓扑、QoS(0/1/2)控制层级；
*   熟识云平台下物模型（属性、服务、事件）的定义方式、接口签名安全哈希运算规则。

### 2. 能力目标
*   能够按照规范独立进行多类环境变送器/传感器的硬件选型、接线施工及基础通讯测试；
*   能熟练在网关或MCU侧开发配置路由规则，将 Modbus 十六进制帧重组为 MQTT 标准 JSON 负载；
*   具有独立在物联网云平台配置产品命名空间、下发控制指令、开发组态测控监控看板的能力；
*   能在出现设备不在线或数据断流时，使用调试工具实施快速链路排查、故障根源定位。

### 3. 素质目标
*   形成一丝不苟、遵守国家工业施工与用电安全规范的技术品格；
*   塑造不惧困难、面对多维参数交叉时保持严谨耐心的科学探索精神；
*   具备高度的团队协作意识、工程文档编写习惯与自主学习能力。

## 五、 教学内容学时分配与项目任务
| 序号 | 教学项目/模块 | 主要学习与实训内容 | 学时分配 | 教学方法 suggestions |
| :--- | :--- | :--- | :---: | :--- |
| 1 | 感知层多路传感器数据采集 | GPIO接口、ADC电压转换、I2C通信规范、温湿度/光照物理采集实操 | 10学时 | 案例讲授、仿真调试 |
| 2 | Modbus多总线组网与寄存器对齐 | 主从轮询、CRC16差错控制、寄存器读写功能码抓包分析 | 14学时 | 项目导向、故障排错 |
| 3 | MQTT轻量级协议与数据传输 | 发布/订阅实验、长连接鉴权、QoS会话层保障、心跳重连闭环调试 | 16学时 | 双向连通演示、仿真演练 |
| 4 | 云端物模型标准化对接与大屏 | 产品注册、属性设计、流转策略配置、实时仪表看板与组态大屏开发 | 12学时 | 实践操作、场景构建 |
| 5 | 综合项目实践与系统调试 | 多协议混合网关工业级现场部署、端到端测控调试与灾备排错 | 12学时 | 小组协同、真实测控 |

## 六、 考核与评价方式
本课程落实过程化增值评价：
*   **实训过程评价 (60%)**: 结合仿真沙箱自动评测结果、随堂实操完整性、实验分析报告完成度进行定量判定（每个子实训任务权重明确）。
*   **期末闭卷考核 (40%)**: 采用线上工程式场景命题，限时完成“多器件物理组网、链路鉴权及云端数据流可视化”异构总程搭建，实打实考察实战水平。

## 七、 教学实施建议
1. 充分配套高精度物联网仿真沙箱，保障学生“一秒开箱调试，闭环查看上报”，有效规避纯硬件损耗对实操效率的拉低；
2. 授课要善于借助多状态图、实时协议帧动态图讲解晦涩规则，并注重用真实工程报错（如丢包、签名哈希不一致）等经典反例来磨炼排错技巧。`,

  textbookOutline: (formData: any) => `### 教材大纲预览

## 教材基本信息
*   **教材名称**: ${formData.textbookName || "物联网设备接入与应用开发"}
*   **适用专业**: ${formData.targetMajor || "物联网应用技术"}
*   **教材层次**: ${formData.textbookLevel || "高职教材"}
*   **编写风格**: ${formData.style || "项目式、任务驱动"}
*   **是否包含实训**: ${formData.hasLabs || "是"}
*   **核心模块**: ${formData.coreContents || "传感器采集、MQTT通信、边缘网关、云平台接入、数据可视化"}

---

## 章节结构详情

### 第1章 物联网系统认知
*   **本章目标**: 引导学生从零建立物联网系统级全景认识，理解物理世界数据如何上浮、控制指令如何下沉。
*   **重点知识**: 智联网三层物理模型解构、常见广域网/局域网技术边界、工业物联应用实例。
*   **实训任务**: 体验温湿度数据经多网关安全上报至平台的完整物理闭环。
*   **教学建议**: 课前布置实物调研，教室内采用情境教学，先建立感性架构线索，再分析硬核细节。

### 第2章 传感器与数据采集基础
*   **本章目标**: 掌握各类传感单元的引脚特征、通讯引脚电气参数及采集标定方法。
*   **重点知识**: 数字与模拟信号辨识、ADC取样、GPIO输出输入、I2C通信时序。
*   **实训任务**: 进行高精度传感器多路原始波形捕获与温度补偿标定实操。
*   **教学建议**: 督促强化万用电表调试规程，重点强化由于线位松动导致的协议高电平卡滞故障。

### 第3章 MQTT通信协议应用
*   **本章目标**: 深入探究互联网高能效MQTT报文机制，熟练进行发布/订阅状态设计。
*   **重点知识**: 客户端到客服务端无直接联结、QoS 保证、保留信息、遗嘱信息设计。
*   **实训任务**: 完成MQTT调试客户端到消息代理服务器的鉴权连接与实时Topic推送捕获。
*   **教学建议**: 采用图形化拓扑工具演示发布订阅去耦合特性，现场演示一个订阅被多方发布的接收情况。

### 第4章 边缘网关配置与接入
*   **本章目标**: 掌握底层串行通信向云端规范网络数据包适配的核心技能。
*   **重点知识**: Modbus总线主从轮询、串口转网络映射规则、报文CRC16生成。
*   **实训任务**: 使用工业物联网边缘智能网关，完成多台Modbus仪表的串接及Topic重组封装。
*   **教学建议**: 现场给多台子设备分发表物理地址，训练学生通过协议分析仪诊断物理地址冲突。

### 第5章 物联网云平台设备管理
*   **本章目标**: 掌握在大容量、高性能要求下，如何对庞杂设备进行安全数字孪生管理。
*   **重点知识**: 产品/设备级鉴权凭据体系、多传感器物模型组态标准化。
*   **实训任务**: 定义气象多要素“属性-事件-服务”物模型，使用签名工具生成连接参数安全上云。
*   **教学建议**: 引导学生练习手写HMACMD5鉴权签名，对比签名错误时云平台的具体拒绝日志报错。

### 第6章 数据上报与可视化展示
*   **本章目标**: 学习如何将繁杂的数据源通过清洗加工，提炼为能够指导宏观态势的大屏幕。
*   **重点知识**: 数据格式化、动态曲线绑定、多维图表属性参数设置。
*   **实训任务**: 开发智慧园区组态态势感知大屏，实时呈现传感信号的多维度波动与历史追溯。
*   **教学建议**: 提供多种优秀组态风格的对照，强调工业可视化看重的不是花哨，而是对比度、警戒线和易读性。

### 第7章 场景联动与规则配置
*   **本章目标**: 培养学生构建设备“无人值守、自动适应、联动控制”方案的闭环思维。
*   **重点知识**: 规则触发策略流配置、端侧联动控制。
*   **实训任务**: 设置光照异常时联动打开电动卷帘、当异常温差出现时触发主阀关闭防灾机制。
*   **教学建议**: 列举失控联动（如临界点来回抖动导致开关频繁烧毁）典型，引申讲解滤波时间常数算法作用。

### 第8章 综合项目：智慧温室系统设计与实现
*   **本章目标**: 融合全课程技能栈，独立或协同攻关真实生活中的复杂项目架构。
*   **重点知识**: 应用场景架构设计、报文吞吐优化、防断链高可用性。
*   **实训任务**: 联合测控智慧温室：感知数据自动采集、多段物化逻辑规则、云平台组态远程联动。
*   **教学建议**: 分组实施，注重工单与设计报告的汇报述职考核，不仅考查功能，更考查代码规范度、文档规范。`,

  questionBank: (formData: any) => `### 题库预览 (20题题库方案)

*   **题目数量**: ${formData.questionCount || "20"} 题
*   **课程名称**: ${formData.courseName || "物联网设备开发实操"}
*   **知识范围**: ${formData.knowledgeRange || "MQTT通信、设备接入、物模型配置、数据上报"}
*   **难度比例**: 简单 30% | 中等 50% | 困难 20%
*   **已附答案**: ${formData.generateAnswers || "是"} | **已附解析**: ${formData.generateAnalysis || "是"}

---

## 精选核心题目大纲 (5道经典试题精选展现)

### 1. [单选题] (难度：中等)
MQTT协议中，关于发布订阅机制描述不正确的是哪一项？
*   A. 发布者与订阅者在物理网络拓扑上不需要建立直接的TCP连接
*   B. 客户端不能既是发布者，又是订阅者
*   C. Broker代理的核心作用是过滤与路由分发消息
*   D. 主题(Topic)在传输前不需要在服务器上预先创建
*   **答案**: B
*   **解析**: 在MQTT长连接通道中，任何一个注册合规的客户端既能向上报送数据（担任发布者），也能同时下发订阅控制报文接收来自云端的指令（担任订阅者），两者角色完全融通。

### 2. [判断题] (难度：简单)
在物联网云平台中，物模型的“服务(Service)”用于描述设备周期性主动上传的状态或数据。
*   A. 正确
*   B. 错误
*   **答案**: B
*   **解析**: 物模型的“属性(Property)”才用于描述设备运行的各类周期数据。“服务(Customer Service/Command)”通常是云端向设备下发的主动调用的方法、控制命令或异步响应机制。

### 3. [简答题] (难度：中等)
简要阐述边缘智能网关在处理 Modbus 传感器数据向物联网平台转发时的三个核心步骤。
*   **参考答案**:
    1.  **主动采集轮询 (Modbus)**: 网关作为主站，按照预设轮询周期、通信接口参数，向连接在线的温湿度、光电等各传感器子站发送标准十六进制问询命令帧，获取当前寄存器原始值；
    2.  **报文解码与JSON映射 (数据清洗)**: 对接收到的十六进制报文做CRC16位一致性验证，剥离出关键数据字段，乘以倍率得到真实物理量值，随后将离散数据适配为云平台要求的标准物模型 JSON 荷载；
    3.  **安全接入与批量上送 (MQTT)**: 网关使用建立的主题(Topic)将JSON数据以发布(Publish)模式推送到指定的云端服务器。

### 4. [单选题] (难度：困难)
在 Modbus TCP 协议总线中，用来读取多个输入寄存器（Input Registers）的指定功能码是？
*   A. 0x01
*   B. 0x02
*   C. 0x03
*   D. 0x04
*   **答案**: D
*   **解析**: 0x04为只读“输入寄存器(Input Registers)”标准功能码；而0x03功能码用于读取可读写的“保持寄存器(Holding Registers)”；0x01和0x02分别负责读单/多个线圈状态。

### 5. [操作简答试题] (难度：困难)
当一辆设备显示接入状态为“离线”，且在物联网平台上没有任何上报记录，请给出你在平台现场调试时排除此网络不通故障的诊断步骤。
*   **参考答案**:
    1.  **物理及供电自锁**：观察设备端板载红色工作指示灯是否亮起，用工具测量供电端口阻值与电压大小，确保无接反短路现象；
    2.  **本地直通抓包验证**：使用电脑网口或串口线直接连接该网关，通过串口助手发送手动指令，查看物理侧是否会报错以及输出是否为空；
    3.  **三元组安全秘钥复核**：登入云产品配置区，重现三元组参数，并对本地设备代码中的 ProductKey, DeviceName, DeviceSecret 进行字元级别的逐个字母复对，排除带入空白符、大小写出错的鉴权失败；
    4.  **路由与防火墙策略核查**：确认目标主机 1883/8883 MQTT 端口是否正常敞开。通过命令行 ping 对应服务器域名，以此确定是否有因安全机制、路由转发被封杀的问题。`,

  pptOutline: (formData: any) => `### PPT课件大纲预览

*   **教学主题**: ${formData.pptTheme || "MQTT通信协议与设备接入"}
*   **适用课程**: ${formData.relativeCourse || "物联网设备开发实操"}
*   **教学对象**: ${formData.targetAudience || "高职学生"}
*   **设计页数**: ${formData.pptPages || "12"} 页
*   **风格样式**: ${formData.pptStyle || "教学型、图文结合"}
*   **课堂练习**: ${formData.hasExercises || "是"} | **实验任务**: ${formData.hasLabTask || "是"}

---

## 逐页 PPT 内容框架

### 第1页： 课程导入
*   **页面标题**: 智联万物，数据先行 —— MQTT 协议与智慧传感器触电实战
*   **核心内容**: 呈现智慧农业、智能楼宇的宏大场面，抛出痛点：庞大的电池传感器如何能在荒郊野外用微小能耗持续运作并保持长连接？
*   **配图建议**: 绘制一幅城市数字化态势传感架构图，高光标示出风力、水位等多个独立的微功耗传感传输链路。
*   **教学提示**: 以故事开篇，重点不讲公式代码，用极低能耗、多点联结的行业现状激发学生的探究欲望。

### 第2页： MQTT 协议概述
*   **页面标题**: 什么是 MQTT？—— 物联网时代的通信信使
*   **核心内容**: 协议概念、应用演变历程，二进制最简帧头（少至2字节），卓越的弱网穿透能力与自愈保活策略。
*   **配图建议**: 呈现 HTTP 与 MQTT 通讯头大小直观对比。
*   **教学提示**: 拿出量化数据，对比 HTTP 一次几百字节的冗余和 MQTT 的精干，建立设备“续航能力”源于极简报文的技术意识。

### 第3页： 核心机制：发布/订阅映射
*   **页面标题**: 空间与时间的完美解耦 —— MQTT 发布/订阅原理解码
*   **核心内容**: 发布者、订阅者、消息代理(Broker)的交互网格。解耦三大特色：空间（互不需知道IP）、时间（互不需同时在线）、同步解耦。
*   **配图建议**: 信息分发流动拓扑。左侧为温度变送器发布数据，中间在Broker分流流，右侧为网页、风闸两端订阅各自主题。
*   **教学提示**: 用经典的“公众号发表文章与关注它的万千读者，互相无需互换私人号码”来做直观类比。

### 第4页： 主题(Topic)层级规范
*   **页面标题**: 给数据贴上地址标签 —— MQTT 主题分层与通配符进阶
*   **核心内容**: 主题层级剥离格式（如 /shanghai/building_A/floor_3/temperature）；单层通配符“+”和多层通配符“#”的安全使用策略。
*   **配图建议**: 类似文件夹展开的层级树状图，直观看出如何利用通配符快速囊括特定楼栋的全部能耗数值。
*   **教学提示**: 敲击键盘错误示范：强调主题前后不应随意漏写或多写斜杠 “/”，这在调试实操中是高频出错点。

### 第5页： 设备配置与接入流程
*   **页面标题**: 设备“触云”五步工作流 —— 快速实现数据在线
*   **核心内容**: 1. 云端定义设备物模型 -> 2. 获取端侧专属三元组凭据 -> 3. 本地算法签名哈希 -> 4. 链路心跳握手 -> 5. 调试工具双向测试核验。
*   **配图建议**: 用带序号的步骤台阶，一目了然标志着从零组网到云端激活的过程。
*   **教学提示**: 引导同学们将接入五步背诵下来，这是往后开展任何网络联调试验的核心定标指南。

### 第6页： 安全之锁：云平台鉴权三元组
*   **页面标题**: 安全第一线 —— 物联网三元组的本质与签名散列
*   **核心内容**: ProductKey, DeviceName 和 DeviceSecret 的职责与逻辑；哈希鉴权算法如何阻隔假冒设备非法上报脏数据。
*   **配图建议**: 绘制一幅带有加锁、解密、设备连接许可证书验证的模型配图。
*   **教学提示**: 告诫同学们，DeviceSecret 如同存折保密密码，在编写公测程序时，此密码绝不可直接放在暴露的公共源码托管区中。

### 第7页： 物模型标准与数据封装
*   **页面标题**: 物模型的统一语言 —— 格式化 JSON 数据包解析
*   **核心内容**: 什么是物模型属性、事件与服务；标准规范的数据载荷。
*   **配图建议**: 气象传感器输出的十进制数，是如何通过网关格式化后存入大括号 “{}” JSON键值对的展示图。
*   **教学提示**: 上机前，在大屏幕上用红粉高亮标识引号对、双逗号等最容易导致整个JSON解析器闪退、格式报错的微小符号。

### 第8页： 上机实训：感知信号一键连入云平台
*   **页面标题**: 动手实训：温度/环境数值安全采集与实时对接
*   **核心内容**: 实操要求：完成物理引脚连接、烧录设备三元组签名代码；连接指示验证：使底板和云平台同时亮起“设备在线-正常”。
*   **配图建议**: 展现出实物或三维环境下接线、路由器、云调试窗口三位一体的联合架构。
*   **教学提示**: 严密要求：配置完成后务必盯着状态栏查看，只要无数据反馈，迅速调阅本地的错误日志抛出点。

### 第9页： 经典故障精准排解
*   **页面标题**: 专家级避雷手册 —— 终结“设备离线”和“解析失败”
*   **核心内容**: 1. 设备签名生成错误导致连接握手失败；2. 本地心跳自适应配置不对导致经常掉线；3. 波特率不匹配造成传感器数值全为空。
*   **配图建议**: 自制的排障红绿两色对比清单。
*   **教学提示**: 建议学生将此页完整截屏保存，这是解决实训上机后95%以上无法上报问题的避雷清单。

### 第10页： 课堂随堂测试
*   **页面标题**: 学能检验 —— 限时大纲与核心概念互动测验
*   **核心内容**: 思考并回答：1. 下发风扇反转指令，应通过“属性”实现还是通过“服务”调用？ 2. Topic为 /device/temp，订阅词 /+/temp 能获取到此数据流吗？
*   **配图建议**: 带有时钟闪烁效果的互动竞答插图。
*   **教学提示**: 调动抢答激情，对于错误答案不当场批评，借讲解答案的机会深度纠正之前理解片面的易混点。

### 第11页： 课堂总结
*   **页面标题**: 融汇贯通 —— 从局域采集到全域互连
*   **核心内容**: 梳理从最初硬件电压，到寄存器数据，网关打包成标准 JSON MQTT 通道，最后呈现在大屏中的生命旅行。数据流动在每一步都有各自的标准保驾护航。
*   **配图建议**: 本次教学核心通信树。
*   **教学提示**: 点明本章主旨：精密的协议、安全的参数是一切大型物联网系统正常运行的最稳固底座。

### 第12页： 课后拓展与实战巩固
*   **页面标题**: 走向多协议融通 —— 智慧园区联动场景课后大练兵
*   **核心内容**: 1. 探访研读：MQTT 3.1 和 MQTT 5.0 关于灵活属性头和高保真的核心区别；2. 实训自主拓展：实现当温湿度超过峰值，自动下发控制线圈反转风机冷却的反馈大闭环。
*   **配图建议**: 智能楼宇自动环控机制示意图。
*   **教学提示**: 指导同学们在平台上完成高阶任务，鼓励学有余力的学生课后深入阅读前沿技术资讯，为以后考查高含金量证书奠定知识深度。`
};

interface StudentAiAssistantProps {
  session: UserSession;
  context?: AiAssistantInitContext;
}

import { getMockAiResponse } from "./mockAiResponses";

function StudentAiAssistant({ session, context }: StudentAiAssistantProps) {
  const [messages, setMessages] = useState<Array<{ sender: "user" | "ai"; text: string; time: string }>>([
    {
      sender: "ai",
      text: context?.welcomeMessage || "你好，我是平台 AI技能助手，你可以向我咨询课程学习、实验实训、技能提升、考试测评等问题。发送问题后，我将会结合平台能力与知识库服务生成回答。",
      time: new Date().toLocaleTimeString().substring(0, 5)
    }
  ]);
  const [inputText, setInputText] = useState("");

  const presetPrompts = context?.presetPrompts || [
    { q: "我想提升物联网设备接入能力，应该怎么学习？", sub: "系统级别课程与典型实验提升要领" },
    { q: "实验环境操作失败时应该如何排查？", sub: "物理连线断开及鉴权错误的排查步骤" },
    { q: "如何判断我的技能薄弱点？", sub: "多门物联网请求实操数据的定位建议" },
    { q: "考前应该重点复习哪些内容？", sub: "底层硬件和MQTT通信协议的常见方向" }
  ];

  const handleSendMessage = (textToSend?: string) => {
    const rawText = textToSend || inputText;
    if (!rawText.trim()) return;

    const userMsg = {
      sender: "user" as const,
      text: rawText,
      time: new Date().toLocaleTimeString().substring(0, 5)
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");

    setTimeout(() => {
      const aiReply = {
        sender: "ai" as const,
        text: getMockAiResponse(rawText),
        time: new Date().toLocaleTimeString().substring(0, 5)
      };
      setMessages(prev => [...prev, aiReply]);
    }, 800);
  };

  return (
    <div className="bg-[#f0f9f6]/30 min-h-screen text-zinc-800 font-sans antialiased pb-12 select-text p-6">
      <div className="max-w-[1400px] mx-auto space-y-4">
        
        {/* Top Banner */}
        <div className="bg-[#EAF8F1] border border-[#10A66A]/20 rounded-xl p-3 px-5 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10A66A]"></span>
              <span className="text-[#10A66A] font-bold text-sm">平台级 AI技能智能诊断服务</span>
            </div>
            <span className="text-xs text-[#0a6d45]/70 mt-1 pl-4">本系统病例结果部分均通过 AI 模块直接连接分析，为您生成契合学习及实操情况的闭环路径方案。</span>
          </div>
          <div className="bg-[#d2f0df] text-[#0a6d45] text-xs font-bold px-3 py-1.5 rounded flex items-center gap-2">
             AI 服务: 工作中
          </div>
        </div>

        {/* Title Card */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#10A66A] flex items-center justify-center text-white shadow-md">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-zinc-900">AI技能助手</h1>
                <span className="bg-[#e0f7eb] text-[#10A66A] text-[10px] px-2 py-0.5 rounded font-bold">全场景数据同步</span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">多课程、多实验、能力诊断与提升路线接口综合对齐。本页面的诊断信息与提示内容在您发送问题后自动提取获取。</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="bg-[#10a66a] text-white text-xs font-bold px-3 py-1.5 rounded border border-[#10A66A]">平台级：AI技能助手</div>
             {context?.courseName && (
               <div className="bg-white text-[#10A66A] text-xs font-bold px-3 py-1.5 rounded border border-[#10A66A]/30">当前关联课程：{context.courseName}</div>
             )}
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-12 gap-4">
          
          {/* Left Column: Platform Integration */}
          <div className="col-span-3 space-y-4">
            <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                 <h2 className="text-sm font-bold flex items-center gap-2">
                   <Layers className="w-4 h-4 text-[#10A66A]"/> 平台能力接入
                 </h2>
                 <span className="text-[9px] font-bold text-[#10A66A] border border-[#10A66A] px-1.5 py-0.5 rounded uppercase">ACTIVE</span>
              </div>
              
              <div className="space-y-4">
                {[
                  { title: "课程体系", status: "已接入", desc: "覆盖平台所有课程资源与综合教学内容及知识节点体系" },
                  { title: "实验体系", status: "已接入", desc: "关联虚拟仿真沙箱、行业云以及动手操作类实验实训环境" },
                  { title: "知识库", status: "已接入", desc: "集成平台工程文档、设备参考手册与适用原理等核心资料库" },
                  { title: "学习数据", status: "已同步", desc: "实时汇总统课程学习时长、实操报告评估及成绩数据" },
                  { title: "技能图谱", status: "已加载", desc: "多门核心专业技能维度的认知负荷建模与多阶技能树映射" }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col border border-zinc-100 p-3 rounded-lg bg-zinc-50/50">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-sm text-zinc-800">{item.title}</span>
                      <span className="text-[10px] font-bold text-[#10A66A] bg-[#e0f7eb] px-2 py-0.5 rounded">{item.status}</span>
                    </div>
                    <span className="text-xs text-zinc-500 leading-relaxed">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Middle Column: Chat & QA */}
          <div className="col-span-6 flex flex-col space-y-4">
            <div className="bg-white border border-zinc-200 rounded-xl shadow-sm flex-1 flex flex-col p-0 overflow-hidden h-[700px]">
              
              {/* Chat Header */}
              <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/30">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-[15px] font-bold text-zinc-900">AI技能问答</h2>
                    <span className="text-[10px] text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded font-bold">多维度平台总线</span>
                  </div>
                  <span className="text-xs text-zinc-500">跨课程全景学习支持、实验指导配对及测点分流定位。</span>
                </div>
                <span className="text-[9px] font-bold text-[#10A66A]">ACTIVE</span>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-zinc-50/30">
                {messages.map((m, i) => (
                  <div key={i} className={`flex gap-3 ${m.sender === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold shadow-sm ${m.sender === "user" ? "bg-blue-200 text-blue-800" : "bg-[#10A66A]"}`}>
                      {m.sender === "user" ? "学" : "AI"}
                    </div>
                    <div className={`flex flex-col max-w-[80%] ${m.sender === "user" ? "items-end" : "items-start"}`}>
                      <div className={`p-3.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap ${m.sender === "user" ? "bg-[#eaf5ff] text-blue-900 rounded-tr-sm" : "bg-white border border-zinc-200 text-zinc-700 rounded-tl-sm shadow-sm"}`}>
                         {m.text}
                      </div>
                      <span className="text-[10px] text-zinc-400 mt-1.5 px-1">{m.time}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recommends & Input */}
              <div className="border-t border-zinc-100 bg-white p-5 flex flex-col">
                <span className="text-xs font-bold text-zinc-500 mb-3">{context?.courseName ? `推荐提问示例(点击快速提问) - 当前关联《${context.courseName}》` : "推荐提问示例(点击快速提问)"}</span>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {presetPrompts.map((tip, i) => (
                     <button
                        key={i}
                        onClick={() => handleSendMessage(tip.q)}
                        className="text-left p-3 border border-zinc-100 rounded-lg hover:border-[#10A66A]/40 hover:bg-[#10A66A]/5 transition-all outline-none"
                     >
                        <div className="text-xs font-bold text-zinc-700 mb-1">{tip.q}</div>
                        <div className="text-[10px] text-zinc-400">{tip.sub}</div>
                     </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input 
                      type="text"
                      className="w-full h-11 pl-4 pr-16 border rounded-lg text-sm focus:outline-none focus:border-[#10A66A] focus:ring-1 focus:ring-[#10A66A] bg-white border-zinc-300"
                      placeholder="请问..."
                      value={inputText}
                      onChange={e => setInputText(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") handleSendMessage(); }}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-zinc-300 tracking-wider">
                       READY
                    </div>
                  </div>
                  <button onClick={() => handleSendMessage()} className="h-11 w-11 bg-[#10A66A] text-white flex items-center justify-center rounded-lg hover:bg-[#0d8e5a] transition-all shadow-sm">
                    <Send className="w-5 h-5 ml-0.5" />
                  </button>
                  <button className="h-11 w-11 bg-white border border-zinc-200 text-zinc-500 flex items-center justify-center rounded-lg hover:bg-zinc-50 transition-all">
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button className="h-11 w-11 bg-slate-900 border border-slate-900 text-white flex items-center justify-center rounded-lg hover:bg-slate-800 transition-all">
                    <Maximize2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Diagnosis & Tips */}
          <div className="col-span-3 space-y-4">
            
            {/* 技能评价与诊断 */}
            <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm flex flex-col">
               <div className="flex items-center justify-between mb-5">
                 <h2 className="text-sm font-bold flex items-center gap-2">
                   <Activity className="w-4 h-4 text-[#10A66A]"/> 技能评价与诊断
                 </h2>
                 <span className="text-[10px] bg-[#EAF8F1] text-[#10A66A] px-2 py-0.5 rounded font-bold">实时分析</span>
               </div>
               
               <div className="border border-zinc-100 bg-zinc-50/50 rounded-lg p-5 flex flex-col items-center justify-center text-center mb-5">
                  <FileText className="w-6 h-6 text-[#10A66A] mb-3 opacity-80" />
                  <span className="text-xs font-bold text-zinc-600">已根据当前问题生成学习建议。</span>
               </div>

               <span className="text-xs font-bold text-zinc-500 mb-2">自适应闭环提升机制</span>
               
               <div className="bg-zinc-900 text-white rounded-lg p-4 flex items-center justify-center mb-5 text-[11px] font-bold shadow-sm text-center leading-relaxed">
                  学习任务<ArrowRight className="w-3 h-3 mx-1.5 inline"/>实验调整<ArrowRight className="w-3 h-3 mx-1.5 inline"/>项目实践<ArrowRight className="w-3 h-3 mx-1.5 inline"/>测评验证
               </div>

               <div className="flex gap-3 mb-3">
                  <button onClick={() => handleSendMessage("查看技能图谱")} className="flex-1 bg-white border border-[#10A66A] text-[#10A66A] text-xs font-bold py-2.5 rounded-lg hover:bg-[#EAF8F1] transition-all">
                     查看技能图谱
                  </button>
                  <button onClick={() => handleSendMessage("生成学习建议")} className="flex-1 bg-zinc-900 text-white text-xs font-bold py-2.5 rounded-lg hover:bg-zinc-800 transition-all">
                     生成学习建议
                  </button>
               </div>

               <button onClick={() => handleSendMessage("定制针对性推荐学习路径")} className="w-full bg-white border border-zinc-200 text-zinc-700 text-xs font-bold py-2.5 rounded-lg hover:bg-zinc-50 transition-all">
                  定制针对性推荐学习路径
               </button>
            </div>

            {/* 推荐提升建议 */}
            <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
               <div className="flex items-center justify-between mb-5">
                 <h2 className="text-sm font-bold flex items-center gap-2">
                   <CheckCircle className="w-4 h-4 text-blue-600"/> 推荐提升建议
                 </h2>
                 <span className="text-[10px] border border-blue-200 text-blue-600 px-2 py-0.5 rounded font-bold">Adaptive</span>
               </div>
               
               <div className="border border-blue-100 bg-[#f8fbff] p-4 rounded-lg flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-[13px] font-bold text-zinc-900">物联网通信协议故障排查实验</h3>
                    <span className="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">仿真上机</span>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    演练在物理或仿真断开情况下，如何定位客户端鉴权密码及连接报文问题。
                  </p>
               </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

interface AiAssistantProps {
  session: UserSession;
  activeTool?: "courseStandard" | "textbookOutline" | "questionBank" | "pptOutline";
  setActiveTool?: (tool: "courseStandard" | "textbookOutline" | "questionBank" | "pptOutline") => void;
  context?: AiAssistantInitContext;
}

export default function AiAssistant({ session, activeTool: propActiveTool, setActiveTool: propSetActiveTool, context }: AiAssistantProps) {
  if (session?.role === "student") {
    return <StudentAiAssistant session={session} context={context} />;
  }

  const [localActiveTool, setLocalActiveTool] = useState<"courseStandard" | "textbookOutline" | "questionBank" | "pptOutline">("courseStandard");
  const activeTool = propActiveTool || localActiveTool;
  const setActiveTool = propSetActiveTool || setLocalActiveTool;
  const [loading, setLoading] = useState<boolean>(false);
  const [isToastVisible, setIsToastVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");

  // Store pre-generated results for beautiful, instant switching
  const [results, setResults] = useState<Record<string, string>>({
    courseStandard: mockResults.courseStandard({
      courseName: "物联网设备开发实战",
      majorDirection: "物联网应用技术",
      courseType: "专业核心课",
      targetAudience: "高职二年级学生",
      totalHours: "64",
      theoryHours: "24",
      practicalHours: "40",
      position: "面向物联网设备接入、数据采集与平台应用能力培养",
      generationRequirements: "突出实践教学、项目任务和岗位能力"
    }),
    textbookOutline: "",
    questionBank: "",
    pptOutline: ""
  });

  // Separate form states for the 4 tools
  const [courseForm, setCourseForm] = useState({
    courseName: "物联网设备开发实操",
    majorDirection: "物联网应用技术",
    courseType: "专业核心课",
    targetAudience: "高职二年级学生",
    totalHours: "64",
    theoryHours: "24",
    practicalHours: "40",
    position: "面向物联网设备接入、数据采集与平台应用能力培养",
    generationRequirements: "突出实践教学、项目任务和岗位能力"
  });

  const [textbookForm, setTextbookForm] = useState({
    textbookName: "物联网设备接入与应用开发",
    targetMajor: "物联网应用技术",
    textbookLevel: "高职教材",
    chapterCount: "8",
    style: "项目式、任务驱动",
    coreContents: "传感器采集、MQTT通信、边缘网关、云平台接入、数据可视化",
    hasLabs: "是"
  });

  const [questionForm, setQuestionForm] = useState({
    courseName: "物联网设备开发实战",
    knowledgeRange: "MQTT通信、设备接入、物模型配置、数据上报",
    types: ["单选题", "多选题", "判断题", "简答题", "实操题"],
    easyPercent: "30%",
    mediumPercent: "50%",
    hardPercent: "20%",
    questionCount: "20",
    generateAnswers: "是",
    generateAnalysis: "是"
  });

  const [pptForm, setPptForm] = useState({
    pptTheme: "MQTT通信协议与设备接入",
    relativeCourse: "物联网设备开发实战",
    targetAudience: "高职学生",
    pptPages: "12",
    teachingGoal: "理解MQTT发布订阅机制，掌握设备接入实验流程",
    pptStyle: "教学型、图文结合",
    hasExercises: "是",
    hasLabTask: "是"
  });

  // Helper to show modern professional feedback messages
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setIsToastVisible(true);
  };

  useEffect(() => {
    if (isToastVisible) {
      const timer = setTimeout(() => {
        setIsToastVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isToastVisible]);

  // Handle generative AI simulation
  const handleGenerate = (type: "courseStandard" | "textbookOutline" | "questionBank" | "pptOutline") => {
    setLoading(true);
    const delay = Math.floor(Math.random() * 300 + 500); // 500ms - 800ms
    setTimeout(() => {
      let content = "";
      if (type === "courseStandard") {
        content = mockResults.courseStandard(courseForm);
      } else if (type === "textbookOutline") {
        content = mockResults.textbookOutline(textbookForm);
      } else if (type === "questionBank") {
        content = mockResults.questionBank(questionForm);
      } else if (type === "pptOutline") {
        content = mockResults.pptOutline(pptForm);
      }

      setResults(prev => ({
        ...prev,
        [type]: content
      }));
      setLoading(false);
      triggerToast("生成工作流顺利完成，最新大纲已同步至右侧。");
    }, delay);
  };

  // Convert custom markdown syntax into visual elements elegantly
  const renderDocumentContent = (text: string) => {
    if (!text) {
      return (
        <div className="flex flex-col items-center justify-center h-full py-24 text-center space-y-3">
          <div className="w-12 h-12 bg-zinc-50 border border-zinc-200 rounded-full flex items-center justify-center text-zinc-300">
            <FileText className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-zinc-800">暂无大纲内容</h4>
            <p className="text-[11px] text-zinc-400">请在左侧配置相应的系统参数，点击对应的“生成”按钮以获得最新的课程方案大纲。</p>
          </div>
        </div>
      );
    }

    const lines = text.split("\n");
    return (
      <div className="space-y-4 text-xs font-semibold text-zinc-700 leading-relaxed max-w-full overflow-x-hidden">
        {lines.map((line, index) => {
          const trimmed = line.trim();
          if (trimmed.startsWith("### ")) {
            return (
              <h4 key={index} className="text-zinc-900 font-extrabold text-[12px] flex items-center gap-1.5 border-b border-zinc-150 pb-1 mt-4">
                <span className="w-1 px-1 py-1.5 h-3.5 bg-[#009b86] rounded" />
                {trimmed.replace(/^###\s*/, "")}
              </h4>
            );
          }
          if (trimmed.startsWith("## ")) {
            return (
              <h3 key={index} className="text-[#009b86] font-extrabold text-[13px] flex items-center gap-1 bg-[#e6f5f3]/30 px-3 py-1.5 rounded-lg mt-5">
                <Sparkles className="w-4 h-4 text-[#009b86] shrink-0" />
                {trimmed.replace(/^##\s*/, "")}
              </h3>
            );
          }
          if (trimmed.startsWith("# ")) {
            return (
              <h2 key={index} className="text-zinc-900 font-black text-sm border-l-4 border-[#009b86] pl-2.5 py-1 mt-6">
                {trimmed.replace(/^#\s*/, "")}
              </h2>
            );
          }
          if (trimmed.startsWith("*   **") && trimmed.includes("**: ")) {
            const matches = trimmed.match(/^\*\s+\*\*([^*]+)\*\*:\s*(.*)/);
            if (matches) {
              return (
                <div key={index} className="pl-4 flex flex-col md:flex-row md:items-start gap-1">
                  <span className="text-[#009b86] font-black shrink-0 text-[11px]">{matches[1]}:</span>
                  <span className="text-zinc-700 text-[11px] font-bold leading-normal">{matches[2]}</span>
                </div>
              );
            }
          }
          if (trimmed.startsWith("* ")) {
            return (
              <div key={index} className="pl-4 py-0.5 flex items-start gap-2">
                <span className="text-[#009b86] font-black leading-none mt-1">&bull;</span>
                <span className="text-[11px] leading-relaxed text-zinc-700 font-bold">{trimmed.slice(2)}</span>
              </div>
            );
          }
          if (trimmed.startsWith("|")) {
            const cells = trimmed.split("|").map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);
            if (trimmed.includes("---")) return null; // table divider
            const isHeader = index === 0 || lines[index - 1]?.trim().startsWith("###");
            return (
              <div key={index} className={`grid grid-cols-12 gap-2 p-2 border-b border-zinc-100 ${isHeader ? "bg-zinc-50 font-black text-zinc-900 text-[11.5px]" : "font-bold text-zinc-600 text-[11px]"}`}>
                <div className="col-span-1">{cells[0]}</div>
                <div className="col-span-3">{cells[1]}</div>
                <div className="col-span-5">{cells[2]}</div>
                <div className="col-span-1 text-center">{cells[3]}</div>
                <div className="col-span-2">{cells[4]}</div>
              </div>
            );
          }
          if (trimmed === "---") {
            return <hr key={index} className="border-t border-zinc-150 my-4" />;
          }
          if (trimmed === "") {
            return <div key={index} className="h-1.5" />;
          }
          return <p key={index} className="text-[11px] text-zinc-600 leading-relaxed pl-2 font-bold">{trimmed}</p>;
        })}
      </div>
    );
  };

  return (
    <div className="bg-[#f4f6f8] min-h-screen text-zinc-800 font-sans antialiased flex flex-col select-text">
      
      {/* Toast Popups Notifications */}
      {isToastVisible && (
        <div className="fixed top-20 right-6 z-50 bg-[#009b86] text-white text-[11px] font-black px-5 py-3 rounded-xl border border-teal-400 shadow-xl transition-all duration-300 flex items-center gap-2 animate-in slide-in-from-top-4 duration-300">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 w-full flex-grow">
        
        {/* Row 1: AI Teacher Assistant Headline Strip */}
        <div className="bg-[#e6f5f3] border border-[#009b86]/20 rounded-xl px-4 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs font-bold shadow-3xs gap-3 text-zinc-700">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#009b86] animate-pulse shrink-0" />
            <div className="space-y-0.5">
              <span className="font-extrabold text-[#009b86] block">
                教师端工具栏 - AI 辅助备课与大纲生成工作组已上线
              </span>
              <span className="text-[11px] text-zinc-500 font-bold leading-normal">
                教师可通过 AI教师助手快速完成课程标准、教材大纲、题库和课件内容的辅助设计，提高课程建设与教学准备效率。
              </span>
            </div>
          </div>
          <div className="font-bold px-2.5 py-1 rounded border text-[10px] shrink-0 self-start sm:self-center text-[#009b86] bg-[#009b86]/10 border-[#009b86]/20">
            工作站：智能生成中
          </div>
        </div>

        {/* Row 2: Title Block */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center shadow-[0_1px_3px_rgba(0,0,0,0.04)] gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#009b86] to-emerald-600 flex items-center justify-center text-white shadow-md shrink-0">
              <BrainCircuit className="w-6.5 h-6.5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base font-black text-zinc-900 tracking-tight">AI教师助手</h1>
                <span className="bg-zinc-100 text-zinc-650 text-[9px] px-2 py-0.5 rounded border border-zinc-200 font-extrabold">
                  教师端工具
                </span>
                <span className="bg-blue-50 text-blue-700 text-[9px] px-2 py-0.5 rounded border border-blue-200 font-extrabold">
                  课程建设
                </span>
                <span className="bg-[#e6f5f3] text-[#009b86] text-[9px] px-2 py-0.5 rounded border border-[#009b86]/20 font-extrabold">
                  智能备课
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-semibold tracking-tight mt-1 leading-normal max-w-2xl">
                面向教师备课、课程建设、题库设计与课件制作的智能辅助工具。
              </p>
            </div>
          </div>
        </div>

        {/* Row 3: Four Main Function Tool Cards (并列功能入口区) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              id: "courseStandard",
              title: "课程标准定制",
              icon: FileText,
              desc: "根据专业方向、课程名称、教学对象和课时要求生成课程标准框架。",
              btnText: "开始定制",
              color: "border-[#009b86]/20 bg-[#e6f5f3]/10 hover:border-[#009b86]/40 hover:bg-[#e6f5f3]/25"
            },
            {
              id: "textbookOutline",
              title: "教材大纲设计助手",
              icon: BookOpen,
              desc: "辅助教师生成教材章节结构、知识模块和教学内容安排。",
              btnText: "设计大纲",
              color: "border-blue-200 bg-blue-50/10 hover:border-blue-300 hover:bg-blue-50/20"
            },
            {
              id: "questionBank",
              title: "题库设计助手",
              icon: HelpCircle,
              desc: "按题型、难度、知识点和数量生成题目设计方案。",
              btnText: "生成题库",
              color: "border-purple-200 bg-purple-50/5 hover:border-purple-300 hover:bg-purple-50/15"
            },
            {
              id: "pptOutline",
              title: "PPT生成助手",
              icon: Monitor,
              desc: "根据课程主题和教学目标生成课件大纲与页面内容。",
              btnText: "生成PPT",
              color: "border-amber-200 bg-amber-50/5 hover:border-amber-300 hover:bg-amber-50/15"
            }
          ].map((card) => {
            const Icon = card.icon;
            const active = activeTool === card.id;
            return (
              <div 
                key={card.id} 
                onClick={() => {
                  setActiveTool(card.id as any);
                  if (!results[card.id] && card.id !== "courseStandard") {
                    handleGenerate(card.id as any);
                  }
                }}
                className={`border rounded-xl p-4.5 flex flex-col justify-between shadow-3xs cursor-pointer transition-all hover:translate-y-[-2px] ${card.color} ${
                  active 
                    ? "ring-2 ring-[#009b86] bg-white border-transparent" 
                    : "bg-white border-zinc-200"
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg shrink-0 ${active ? "bg-[#009b86] text-white" : "bg-zinc-100 text-zinc-650"}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {active && <span className="bg-[#009b86] text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase">CURRENT</span>}
                  </div>
                  <h3 className="text-xs font-extrabold text-zinc-900">{card.title}</h3>
                  <p className="text-[10.5px] leading-relaxed text-zinc-500 font-bold">{card.desc}</p>
                </div>
                <button
                  type="button"
                  className={`mt-4 w-full py-1.5 rounded-lg text-[10px] font-black transition-all ${
                    active 
                      ? "bg-[#009b86] text-white shadow-3xs" 
                      : "bg-[#e6f5f3] text-[#009b86] hover:bg-[#00816f] hover:text-white"
                  }`}
                >
                  {card.btnText}
                </button>
              </div>
            );
          })}
        </div>

        {/* Row 4: AI教师助手工作区 */}
        <div className="border border-zinc-200 rounded-2xl bg-white shadow-3xs overflow-hidden">
          
          {/* Header layout showing tabs synchronized with select tool states */}
          <div className="bg-zinc-50 border-b border-zinc-200/80 px-4.5 py-3 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-4 bg-[#009b86] rounded" />
              <h2 className="text-xs font-black text-zinc-900 tracking-tight">AI教师助手工作区</h2>
            </div>

            {/* Quick selection labels (分段页签选择) */}
            <div className="flex items-center bg-zinc-200/50 p-1 rounded-lg border border-zinc-250 text-[10px] font-black shrink-0">
              {[
                { id: "courseStandard", label: "课程标准定制" },
                { id: "textbookOutline", label: "教材大纲设计" },
                { id: "questionBank", label: "题库设计" },
                { id: "pptOutline", label: "PPT生成助手" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTool(tab.id as any);
                    if (!results[tab.id]) {
                      handleGenerate(tab.id as any);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                    activeTool === tab.id 
                      ? "bg-white text-[#009b86] shadow-3xs font-extrabold" 
                      : "text-zinc-650 hover:text-zinc-900 hover:bg-zinc-200/20"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* Left Parameters Configuration Column (左侧参数配置) */}
            <div className="lg:col-span-5 p-5 border-r border-zinc-150 space-y-4 bg-zinc-50/30">
              
              {activeTool === "courseStandard" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="border-b border-zinc-200 pb-2">
                    <h3 className="text-xs font-black text-zinc-900">课程标准定制参数</h3>
                    <p className="text-[10px] text-zinc-400 mt-0.5">请录入物联网专业开发课程的定位和课时分配</p>
                  </div>

                  <div className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-zinc-700 block">课程名称</label>
                      <input 
                        type="text" 
                        value={courseForm.courseName}
                        onChange={(e) => setCourseForm({...courseForm, courseName: e.target.value})}
                        className="w-full bg-white border border-zinc-250 rounded-lg px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-[#009b86] focus:ring-1 focus:ring-[#009b86]/20 transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-zinc-700 block">专业方向</label>
                      <input 
                        type="text" 
                        value={courseForm.majorDirection}
                        onChange={(e) => setCourseForm({...courseForm, majorDirection: e.target.value})}
                        className="w-full bg-white border border-zinc-250 rounded-lg px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-[#009b86] focus:ring-1 focus:ring-[#009b86]/20 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-black text-zinc-700 block">课程类型</label>
                        <select 
                          value={courseForm.courseType}
                          onChange={(e) => setCourseForm({...courseForm, courseType: e.target.value})}
                          className="w-full bg-white border border-zinc-250 rounded-lg px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-[#009b86] focus:ring-1 focus:ring-[#009b86]/20 transition-all"
                        >
                          <option>专业核心课</option>
                          <option>专业必修课</option>
                          <option>公共基础课</option>
                          <option>专业选修课</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-black text-zinc-700 block">教学对象</label>
                        <input 
                          type="text" 
                          value={courseForm.targetAudience}
                          onChange={(e) => setCourseForm({...courseForm, targetAudience: e.target.value})}
                          className="w-full bg-white border border-zinc-250 rounded-lg px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-[#009b86] focus:ring-1 focus:ring-[#009b86]/20 transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-zinc-700 block">总学时</label>
                        <input 
                          type="number" 
                          value={courseForm.totalHours}
                          onChange={(e) => setCourseForm({...courseForm, totalHours: e.target.value})}
                          className="w-full bg-white border border-zinc-250 rounded-lg px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-zinc-700 block">理论学时</label>
                        <input 
                          type="number" 
                          value={courseForm.theoryHours}
                          onChange={(e) => setCourseForm({...courseForm, theoryHours: e.target.value})}
                          className="w-full bg-white border border-zinc-250 rounded-lg px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-zinc-700 block">实训学时</label>
                        <input 
                          type="number" 
                          value={courseForm.practicalHours}
                          onChange={(e) => setCourseForm({...courseForm, practicalHours: e.target.value})}
                          className="w-full bg-white border border-zinc-250 rounded-lg px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-zinc-700 block">课程定位</label>
                      <textarea 
                        rows={3} 
                        value={courseForm.position}
                        onChange={(e) => setCourseForm({...courseForm, position: e.target.value})}
                        className="w-full bg-white border border-zinc-250 rounded-lg px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-[#009b86]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-zinc-700 block">生成要求</label>
                      <textarea 
                        rows={2} 
                        value={courseForm.generationRequirements}
                        onChange={(e) => setCourseForm({...courseForm, generationRequirements: e.target.value})}
                        className="w-full bg-white border border-zinc-250 rounded-lg px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-[#009b86]"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleGenerate("courseStandard")}
                      disabled={loading}
                      className="mt-2 w-full py-2.5 bg-[#009b86] text-white hover:bg-[#008976] rounded-xl text-xs font-black font-sans shadow-3xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-none"
                    >
                      {loading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      <span>生成课程标准</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTool === "textbookOutline" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="border-b border-zinc-200 pb-2">
                    <h3 className="text-xs font-black text-zinc-900">教材大纲定制助手</h3>
                    <p className="text-[10px] text-zinc-400 mt-0.5">规划教材名称、重点知识模块及编写方式</p>
                  </div>

                  <div className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-zinc-700 block">教材名称</label>
                      <input 
                        type="text" 
                        value={textbookForm.textbookName}
                        onChange={(e) => setTextbookForm({...textbookForm, textbookName: e.target.value})}
                        className="w-full bg-white border border-zinc-250 rounded-lg px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-[#009b86]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-black text-zinc-700 block">适用专业</label>
                        <input 
                          type="text" 
                          value={textbookForm.targetMajor}
                          onChange={(e) => setTextbookForm({...textbookForm, targetMajor: e.target.value})}
                          className="w-full bg-white border border-zinc-250 rounded-lg px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-black text-zinc-700 block">教材层次</label>
                        <input 
                          type="text" 
                          value={textbookForm.textbookLevel}
                          onChange={(e) => setTextbookForm({...textbookForm, textbookLevel: e.target.value})}
                          className="w-full bg-white border border-zinc-250 rounded-lg px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-black text-zinc-700 block">章节数量</label>
                        <input 
                          type="number" 
                          value={textbookForm.chapterCount}
                          onChange={(e) => setTextbookForm({...textbookForm, chapterCount: e.target.value})}
                          className="w-full bg-white border border-zinc-250 rounded-lg px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-black text-zinc-700 block">编写风格</label>
                        <input 
                          type="text" 
                          value={textbookForm.style}
                          onChange={(e) => setTextbookForm({...textbookForm, style: e.target.value})}
                          className="w-full bg-white border border-zinc-250 rounded-lg px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-zinc-700 block">重点内容</label>
                      <textarea 
                        rows={3} 
                        value={textbookForm.coreContents}
                        onChange={(e) => setTextbookForm({...textbookForm, coreContents: e.target.value})}
                        className="w-full bg-white border border-zinc-250 rounded-lg px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-[#009b86]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-zinc-700 block">是否包含实训任务</label>
                      <select 
                        value={textbookForm.hasLabs}
                        onChange={(e) => setTextbookForm({...textbookForm, hasLabs: e.target.value})}
                        className="w-full bg-white border border-zinc-250 rounded-lg px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-[#009b86]"
                      >
                        <option>是</option>
                        <option>否</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleGenerate("textbookOutline")}
                      disabled={loading}
                      className="mt-2 w-full py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-xs font-black font-sans shadow-3xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-none"
                    >
                      {loading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
                      <span>生成教材大纲</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTool === "questionBank" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="border-b border-zinc-200 pb-2">
                    <h3 className="text-xs font-black text-zinc-900">题库设计助手</h3>
                    <p className="text-[10px] text-zinc-400 mt-0.5">设定考察范围、比例及是否同步生成解析</p>
                  </div>

                  <div className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-zinc-700 block">课程名称</label>
                      <input 
                        type="text" 
                        value={questionForm.courseName}
                        onChange={(e) => setQuestionForm({...questionForm, courseName: e.target.value})}
                        className="w-full bg-white border border-zinc-250 rounded-lg px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-[#009b86]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-zinc-700 block">知识点范围</label>
                      <input 
                        type="text" 
                        value={questionForm.knowledgeRange}
                        onChange={(e) => setQuestionForm({...questionForm, knowledgeRange: e.target.value})}
                        className="w-full bg-white border border-zinc-250 rounded-lg px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-zinc-700 block">可用题型范围</label>
                      <div className="grid grid-cols-2 gap-2 p-2 bg-white rounded-lg border border-zinc-200">
                        {["单选题", "多选题", "判断题", "简答题", "实操题"].map(t => (
                          <div key={t} className="flex items-center space-x-1.5">
                            <input 
                              type="checkbox" 
                              checked={questionForm.types.includes(t)}
                              onChange={() => {
                                const exists = questionForm.types.includes(t);
                                if (exists) {
                                  setQuestionForm({...questionForm, types: questionForm.types.filter(item => item !== t)});
                                } else {
                                  setQuestionForm({...questionForm, types: [...questionForm.types, t]});
                                }
                              }}
                              className="accent-[#009b86]"
                            />
                            <span className="text-[10px] font-bold text-zinc-600">{t}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-zinc-700 block">简单比例</label>
                        <input 
                          type="text" 
                          value={questionForm.easyPercent}
                          onChange={(e) => setQuestionForm({...questionForm, easyPercent: e.target.value})}
                          className="w-full bg-white border border-zinc-250 rounded-lg px-2.5 py-1.5 text-xs text-center font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-zinc-700 block">中等比例</label>
                        <input 
                          type="text" 
                          value={questionForm.mediumPercent}
                          onChange={(e) => setQuestionForm({...questionForm, mediumPercent: e.target.value})}
                          className="w-full bg-white border border-zinc-250 rounded-lg px-2.5 py-1.5 text-xs text-center font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-zinc-700 block">困难比例</label>
                        <input 
                          type="text" 
                          value={questionForm.hardPercent}
                          onChange={(e) => setQuestionForm({...questionForm, hardPercent: e.target.value})}
                          className="w-full bg-white border border-zinc-250 rounded-lg px-2.5 py-1.5 text-xs text-center font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-black text-zinc-700 block">题目数量</label>
                        <input 
                          type="number" 
                          value={questionForm.questionCount}
                          onChange={(e) => setQuestionForm({...questionForm, questionCount: e.target.value})}
                          className="w-full bg-white border border-zinc-250 rounded-lg px-3 py-2 text-xs font-bold text-zinc-800"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-black text-zinc-700 block">是否附答案解析</label>
                        <select 
                          value={questionForm.generateAnswers}
                          onChange={(e) => setQuestionForm({...questionForm, generateAnswers: e.target.value, generateAnalysis: e.target.value})}
                          className="w-full bg-white border border-zinc-250 rounded-lg px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-none"
                        >
                          <option>是</option>
                          <option>否</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleGenerate("questionBank")}
                      disabled={loading}
                      className="mt-2 w-full py-2.5 bg-purple-600 text-white hover:bg-purple-700 rounded-xl text-xs font-black font-sans shadow-3xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-none"
                    >
                      {loading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <HelpCircle className="w-4 h-4" />}
                      <span>生成题库</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTool === "pptOutline" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="border-b border-zinc-200 pb-2">
                    <h3 className="text-xs font-black text-zinc-900">PPT生成设计大纲</h3>
                    <p className="text-[10px] text-zinc-400 mt-0.5">设定课件大纲主题、风格和教学交互点</p>
                  </div>

                  <div className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-zinc-700 block">PPT主题</label>
                      <input 
                        type="text" 
                        value={pptForm.pptTheme}
                        onChange={(e) => setPptForm({...pptForm, pptTheme: e.target.value})}
                        className="w-full bg-white border border-zinc-250 rounded-lg px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-[#009b86]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-zinc-700 block">适用课程</label>
                      <input 
                        type="text" 
                        value={pptForm.relativeCourse}
                        onChange={(e) => setPptForm({...pptForm, relativeCourse: e.target.value})}
                        className="w-full bg-white border border-zinc-250 rounded-lg px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-black text-zinc-700 block">教学对象</label>
                        <input 
                          type="text" 
                          value={pptForm.targetAudience}
                          onChange={(e) => setPptForm({...pptForm, targetAudience: e.target.value})}
                          className="w-full bg-white border border-zinc-250 rounded-lg px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-black text-zinc-700 block">课件页数</label>
                        <input 
                          type="number" 
                          value={pptForm.pptPages}
                          onChange={(e) => setPptForm({...pptForm, pptPages: e.target.value})}
                          className="w-full bg-white border border-zinc-250 rounded-lg px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-zinc-700 block">教学目标</label>
                      <textarea 
                        rows={2.5} 
                        value={pptForm.teachingGoal}
                        onChange={(e) => setPptForm({...pptForm, teachingGoal: e.target.value})}
                        className="w-full bg-white border border-zinc-250 rounded-lg px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-none focus:border-[#009b86]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-black text-zinc-700 block">课件风格</label>
                        <input 
                          type="text" 
                          value={pptForm.pptStyle}
                          onChange={(e) => setPptForm({...pptForm, pptStyle: e.target.value})}
                          className="w-full bg-white border border-zinc-250 rounded-lg px-3 py-2 text-xs font-bold text-zinc-800"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-black text-zinc-700 block">包含实验任务</label>
                        <select 
                          value={pptForm.hasLabTask}
                          onChange={(e) => setPptForm({...pptForm, hasLabTask: e.target.value})}
                          className="w-full bg-white border border-zinc-250 rounded-lg px-3 py-2 text-xs font-bold text-zinc-800 focus:outline-none"
                        >
                          <option>是</option>
                          <option>否</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleGenerate("pptOutline")}
                      disabled={loading}
                      className="mt-2 w-full py-2.5 bg-amber-600 text-white hover:bg-amber-700 rounded-xl text-xs font-black font-sans shadow-3xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-none"
                    >
                      {loading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Monitor className="w-4 h-4" />}
                      <span>生成PPT大纲</span>
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Right Generated Preview Column (右侧生成结果预览) */}
            <div className="lg:col-span-7 p-5 flex flex-col justify-between min-h-[500px]">
              
              <div className="space-y-3.5 flex-1">
                <div className="border-b border-zinc-200/80 pb-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#009b86] shrink-0" />
                    <span className="text-xs font-black text-zinc-900">
                      {activeTool === "courseStandard" ? "课程标准预览" : 
                       activeTool === "textbookOutline" ? "教材大纲预览" : 
                       activeTool === "questionBank" ? "题库标准预览" : "PPT课件框架大纲预览"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 font-mono text-[9px] text-zinc-400">
                    <span>SYSTEM OUT</span>
                    <span className="inline-block w-1.5 h-3.5 bg-zinc-400 animate-pulse ml-1" />
                  </div>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center h-full py-32 space-y-3">
                    <div className="w-9 h-9 border-2 border-zinc-200 border-t-[#009b86] rounded-full animate-spin" />
                    <span className="text-[11px] text-[#009b86] font-black tracking-tight">AI教师助手正在生成内容...</span>
                  </div>
                ) : (
                  <div className="max-h-[500px] overflow-y-auto px-2 py-1 select-text scrollbar-thin">
                    {renderDocumentContent(results[activeTool])}
                  </div>
                )}
              </div>

              {/* Action operations strip at the bottom of the document block */}
              {!loading && results[activeTool] && (
                <div className="border-t border-zinc-200 pt-4.5 mt-4 flex flex-wrap gap-2.5 items-center justify-between text-xs font-semibold select-none">
                  <div className="text-[10px] text-zinc-400 font-bold block">
                    输出模式：高标准教学体系对齐
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const plainText = results[activeTool].replace(/###/g, "").replace(/##/g, "").replace(/\*\*/g, "");
                        navigator.clipboard.writeText(plainText);
                        triggerToast("大纲内容成功复制到剪贴板，您可以直接粘贴到 Word 中。");
                      }}
                      className="px-3 py-1.8 bg-zinc-50 hover:bg-zinc-100 border border-zinc-250 text-zinc-700 rounded-lg text-[10px] font-black transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5 text-[#009b86]" />
                      <span>复制内容</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => triggerToast("已成功导出标准Word备课文档到您的系统本地。")}
                      className="px-3 py-1.8 bg-zinc-50 hover:bg-zinc-100 border border-zinc-250 text-zinc-700 rounded-lg text-[10px] font-black transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-650 text-blue-600" />
                      <span>导出Word</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => triggerToast("已成功将幻灯片教学大纲包装成标准 PPTX 设计件。")}
                      className="px-3 py-1.8 bg-zinc-50 hover:bg-zinc-100 border border-zinc-250 text-zinc-700 rounded-lg text-[10px] font-black transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-600" />
                      <span>导出PPT</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleGenerate(activeTool)}
                      className="px-3 py-1.8 bg-white hover:bg-teal-50 border border-[#009b86]/25 text-[#009b86] rounded-lg text-[10px] font-black transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <RefreshCcw className="w-3.5 h-3.5" />
                      <span>重新生成</span>
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>

        {/* Row 5: Teacher Prep Workflow Auxiliary Card (教师备课流程) */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-3xs space-y-4">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-4 bg-[#009b86] rounded" />
            <h3 className="text-xs font-black text-zinc-900">教师备课流程说明</h3>
          </div>

          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4.5 bg-zinc-50 border border-zinc-200/80 rounded-xl">
            {/* Step badges */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 flex-1 text-center font-black">
              {[
                { step: "步骤一", name: "课程标准设计", color: "bg-teal-50 border-teal-200 text-[#009b86]" },
                { step: "步骤二", name: "教材大纲设计", color: "bg-blue-50 border-blue-200 text-blue-700" },
                { step: "步骤三", name: "题库生成", color: "bg-purple-50 border-purple-200 text-purple-700" },
                { step: "步骤四", name: "PPT课件制作", color: "bg-amber-50 border-amber-200 text-amber-700" },
                { step: "步骤五", name: "教学实施", color: "bg-zinc-100 border-zinc-350 text-zinc-800" }
              ].map((item, index) => (
                <div key={item.step} className="flex items-center justify-between gap-1">
                  <div className={`p-3 rounded-xl border flex-1 space-y-1 block ${item.color}`}>
                    <span className="text-[10px] block font-extrabold uppercase opacity-80">{item.step}</span>
                    <span className="text-[11px] block">{item.name}</span>
                  </div>
                  {index < 4 && (
                    <ChevronRight className="hidden md:block w-4 h-4 text-zinc-350" />
                  )}
                </div>
              ))}
            </div>

            {/* General flow description */}
            <div className="lg:max-w-xs space-y-1 border-t lg:border-t-0 lg:border-l border-zinc-200 pt-4 lg:pt-0 lg:pl-4">
              <span className="text-[10px] font-black text-zinc-400 block uppercase tracking-wider">FLOW DESIGN</span>
              <h4 className="text-xs font-black text-zinc-900">AI支持全闭环流程</h4>
              <p className="text-[10.5px] leading-relaxed text-zinc-500 font-bold">
                AI教师助手围绕课程建设流程，为教师提供结构化内容生成与备课辅助。
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
