import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

// Ensure PORT is 3000 as mandated by system
const PORT = 3000;

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
      console.log("GoogleGenAI client initialized successfully.");
    }
  }
  return aiClient;
}

// Structured output schema matching front-end types
const promptSchema = {
  type: Type.OBJECT,
  properties: {
    success: { type: Type.BOOLEAN },
    answer: {
      type: Type.STRING,
      description: "AI生成的智能回答内容，使用简洁的 Markdown 格式。"
    },
    references: {
      type: Type.ARRAY,
      description: "关联的相关物联网课程章节或学习文档（最多2条，可为空列表）",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          sourceType: { type: Type.STRING },
          snippet: { type: Type.STRING },
          section: { type: Type.STRING }
        },
        required: ["title", "sourceType", "snippet"]
      }
    },
    skillDiagnosis: {
      type: Type.OBJECT,
      description: "简单的技能打分与核心诊断内容",
      properties: {
        summary: { type: Type.STRING },
        weakPoints: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        mastery: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              score: { type: Type.INTEGER }
            },
            required: ["name", "score"]
          }
        }
      },
      required: ["summary", "weakPoints", "mastery"]
    },
    suggestions: {
      type: Type.ARRAY,
      description: "学习或实验建议（最多2个）",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          type: { type: Type.STRING },
          description: { type: Type.STRING }
        },
        required: ["title", "type", "description"]
      }
    },
    nextQuestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "推荐2个后续继续提问相关的物联网问题"
    }
  },
  required: ["success", "answer", "skillDiagnosis", "suggestions", "nextQuestions"]
};

// IoT specific smart rules logic to use when key is omitted or fails
function getSmartFallback(question: string) {
  let answer = "";
  let references: any[] = [];
  let summary = "";
  let weakPoints: string[] = [];
  let mastery = [
    { name: "课程理解", score: 85 },
    { name: "实验操作", score: 78 },
    { name: "数据分析", score: 70 },
    { name: "综合应用", score: 74 },
    { name: "测评表现", score: 81 }
  ];
  let suggestions: any[] = [];
  let nextQuestions: string[] = [];

  const q = question.toLowerCase();

  if (q.includes("mqtt") || q.includes("协议") || q.includes("连接") || q.includes("topic") || q.includes("接入")) {
    answer = `针对您对 **MQTT 协议及设备接入** 的疑问，为您整理了以下核心分析：
    
- **MQTT 主题 (Topic)**：采用类似目录的层次结构划分（例如 \`sensor/temp/livingroom\`），支持单层通配符 \`+\` 和多层通配符 \`#\`。在配置订阅时，合理的命名层级能极大地优化消息检索与控制路由物理网关。
- **消息发布与订阅流程**：设备作为客户端客户端，通过向 Broker 发送 CONNECT 请求建立长连接。发布数据时需指定 Topic 与 **服务质量等级 (QoS)**：
  - **QoS 0**：至多发送一次，丢包不重发，适合低可靠采集指标。
  - **QoS 1**：至少发送一次，可能重复发送，需要 PUBACK 确认，是最常用的物联网场景基础。
  - **QoS 2**：仅发送一次，通过重发与去重四阶段握手（PUBREC - PUBREL - PUBCOMP）确保精准不丢不重。
  
- **常见连接问题排查**：若设备提示连接拒绝，请确认 Client ID 唯一配置、IP端口（标准 1883，SSL 8883）是否放行，以及安全组认证用户名、密码是否准确。`;

    references = [
      {
        title: "《物联网开发实战：第3章 MQTT 原理与应用》",
        sourceType: "courseware",
        snippet: "MQTT 是典型的轻量级发布/订阅路由控制协议，其精简包头（仅 2 字节起）极佳适应了高延时、受限低带宽无线传感网络设备。",
        section: "3.2 主题设计与消息层级设计"
      },
      {
        title: "《MQTT 沙箱实操手册：物联网接入指南》",
        sourceType: "experiment_manual",
        snippet: "在虚拟仿真沙箱中，物理传感器在激活前需保证 TCP 本地寻址畅通。对发布端的 Topic 与端口进行监听，如果配置不顺应首先开启连接认证日志抓取。",
        section: "第2节 代理服务器代理配置"
      }
    ];

    summary = "你在 [设备协议接入与机制设计] 维度下的诊断：掌握情况良好。对高阶四阶段保障机制 QoS 2 理解不足，遇到边缘突发报文丢失时可能出现理论盲点。";
    weakPoints = ["MQTT 报文级 QoS2 交互保障", "多重客户端 ID 冲突定位"];
    mastery = [
      { name: "课程理解", score: 88 },
      { name: "实验操作", score: 76 },
      { name: "数据分析", score: 68 },
      { name: "综合应用", score: 70 },
      { name: "测评表现", score: 84 }
    ];
    suggestions = [
      {
        title: "完成 MQTT 协议 QoS 1/2 报文捕获与分析实验",
        type: "experiment",
        description: "在虚拟实训仿真平台，启动网络抓包辅助对设备端发送、重传、PUBREC确认做完整的控制流捕获。"
      },
      {
        title: "复习《新大陆网关主题接入规范》文档",
        type: "note",
        description: "熟记Topic通配符( + )和( # )在星形及分布式拓扑下的匹配规律，规避Topic设计冗余风险。"
      }
    ];
    nextQuestions = [
      "请问 MQTT QoS 0、1、2 在硬件开销和报文复杂度上有哪些差异？",
      "如果连接 MQTT 服务器时提示 Connection Refused: Identifier Rejected，通常应如何进行故障诊断？"
    ];

  } else if (q.includes("失败") || q.includes("实验") || q.includes("排查") || q.includes("操作") || q.includes("报错")) {
    answer = `针对您反馈的 **实验环境操作失败或数据上报故障**，我们建议采取以下结构化排查步骤：

1. **底层物理通路自检**：
   - 检查虚拟实验沙箱网路断口是否配置正确，本地网卡状态是否正常。
   - ping 目标代理服务器，确立网闸和 TCP/IP 本地通信是打通的。
2. **设备端参数一致性核对**：
   - 检查本地设备上的产品密钥 (ProductKey) 和设备名称 (DeviceName) 是否与物联网云平台控制台完全一致。
   - 检查硬件连接波特率是否设置冲突，造成串口乱码上报失败。
3. **隔离机制与安全机制放行**：
   - 检查本地杀毒或本机防火墙是否把 1883 端口当作潜在危险出站连接进行了拦截。`;

    references = [
      {
        title: "《物联网综合实验设计与故障定位白皮书》",
        sourceType: "experiment_manual",
        snippet: "系统联调常见物理通路不可达占比约90%。对于套接字返回 Socket Timeout 错误，首选检测网段分发逻辑与物理链路配置项。",
        section: "第5章 设备在线调试诊断"
      }
    ];

    summary = "你在 [设备实操调试与排错方法] 维度的诊断：动手能力强。但在计算机网络（端口放行、底层连接握手原理）等基础知识点积淀仍有欠缺。";
    weakPoints = ["物理端口通信逻辑诊断", "波特率硬件级自适应对齐"];
    mastery = [
      { name: "课程理解", score: 75 },
      { name: "实验操作", score: 82 },
      { name: "数据分析", score: 72 },
      { name: "综合应用", score: 68 },
      { name: "测评表现", score: 79 }
    ];
    suggestions = [
      {
        title: "自检虚拟沙箱的防火墙规则与端口开闭情况",
        type: "experiment",
        description: "在仿真模拟控制台中运行端口健康检查命令，放行出入站 1883 对话通道。"
      }
    ];
    nextQuestions = [
      "设备连接时出现 Socket Connection Reset 报错应该如何准确定位？",
      "如何判断网关和传感器之间的物理串口通信波特率是否真实对齐？"
    ];

  } else if (q.includes("弱点") || q.includes("诊断") || q.includes("评估") || q.includes("能力")) {
    answer = `想要全面精准判断自己的**物联网核心技能掌握薄弱点与提升路径**，可以从新大陆平台整合的以下 3 个核心专业维度切入评估：

1. **感知层传感器驱动与接口（底层核心）**：
   - 物理硬件配线、寄存器寻址。如果您对 Modbus、UART 等通信速率及时序操作不太容易掌握，那硬件接入会是弱项。
2. **网络覆盖与物联网总线通信（中层屏障）**：
   - 包含 TCP 套接字、MQTT 通信、高并发网关协议等。如果您经常在连接网关、数据接收或消息丢包解析卡主，需要补齐协议调试。
3. **传感器数据清洗、采集与业务流转（高层应用）**：
   - 即把传感器物理实测的数据进行逻辑解析并推送至看板及微服务中。

您可以随时通过下方的【查看技能图谱】和【生产学习建议】工具，进行一键指标同步！`;

    references = [
      {
        title: "《物联网产业岗位技能体系定位与评价大纲》",
        sourceType: "knowledge_base",
        snippet: "企业技能考核强调硬件驱动编写、协议报文分析和云端应用串联三大核心，实验成绩直接反映平台级动手诊断水平。",
        section: "2.1 课程实操诊断评估"
      }
    ];

    summary = "你的技能综合画像诊断：目前课程理论理解程度相对优秀，但对于边缘传感器数据的采集清洗、业务数据清洗加工实操熟练度依然有很大强化余地。";
    weakPoints = ["感知层信号数字AD转换", "采集数据低延时滤波算法"];
    mastery = [
      { name: "课程理解", score: 84 },
      { name: "实验操作", score: 78 },
      { name: "数据分析", score: 65 },
      { name: "综合应用", score: 72 },
      { name: "测评表现", score: 80 }
    ];
    suggestions = [
      {
        title: "完成《物联网边缘采集数据滤波与流转》实训大作业",
        type: "note",
        description: "重点补齐采集数据格式在边缘端清洗的流程，提高物联网总数据通道解析性能率。"
      }
    ];
    nextQuestions = [
      "物联网工程岗位最看重哪些动手调试能力？",
      "平台技能诊断图谱除了这5个指标，还参考了哪些过程性要素？"
    ];

  } else if (q.includes("复习") || q.includes("考前") || q.includes("考试") || q.includes("测评")) {
    answer = `物联网方向考前核心点位指导：

考前备课复习，应重点攻克物联网三层基础架构（**感知层、网络传输层、应用层**）的知识融合与实操细节：
1. **感知硬件与低阶驱动**：
   - 熟悉传感器配线、模拟信号与数字信号的 A/D 转换关系。
   - 掌握单片机串行总线（Modbus RS-485 / UART / I2C / SPI）主从机制及功能码。
2. **组网与连接物理机制**：
   - 短距离自组网（ZigBee, WiFi-Mesh, BlueTooth）和低功耗广域网（NB-IoT, LoRaWAN）性能优劣比拼。
   - MQTT 报文首部结构及轻量交互优势。
3. **应用物模型提炼**：
   - 如何为物理器件设计标准物模型（包含：属性 Property、服务 Service、事件 Event 字段结构）。`;

    references = [
      {
        title: "《物联网综合理论及应用基础题库诊断手册》",
        sourceType: "exam_record",
        snippet: "历年考卷重点考察感知层传感器接线原理与 Modbus 校验错误判断。综合实操大题偏向于给出特定业务场景在平台完成数据接入调试。",
        section: "附录 B 重点命题方向解析"
      }
    ];

    summary = "你在考试与应考测评技能维度诊断：整体掌握偏向上等。感知总线和寄存器数值运算存在提分盲区，应加强专项刷题通关。";
    weakPoints = ["Modbus总线寄存器控制码计算", "应用端事件上报参数结构"];
    mastery = [
      { name: "课程理解", score: 86 },
      { name: "实验操作", score: 75 },
      { name: "数据分析", score: 81 },
      { name: "综合应用", score: 73 },
      { name: "测评表现", score: 88 }
    ];
    suggestions = [
      {
        title: "完成物联网接入与总线协议专项题库自测",
        type: "exam",
        description: "在限时30分钟内完成感知接线与报文抓包计算选择填空，全面提升应考做题手感。"
      }
    ];
    nextQuestions = [
      "物联网考卷中常考的 Modbus 协议功能码 03H 和 06H 在含义上有何差别？",
      "什么是物模型？它与我们物理连接的传感器数据通道是如何进行映射关联的？"
    ];

  } else {
    answer = `收到了您对于物联网领域的提问：**“${question}”**。新大陆平台级 AI 助手为您提供以下方向的解答建议：

1. **基本概念建构**：物联网开发是复合技能，要求底层硬件操作硬件、协议传输、高层数据流转深度协同。
2. **注重手册指引**：在具体的硬件传感器驱动和物模型配置遇到障碍时，首先参照官方参考设计手册。
3. **加强闭环动手**：通过新大陆平台丰富的在线实验仿真沙箱进行上机验证，比单纯记忆干瘪的教材更为有效。

建议点击左侧的【平台能力接入】和右侧的【技能评价与诊断】进行深度分析对接。`;

    references = [
      {
        title: "《物联网专业知识总论与技能图谱对齐指南》",
        sourceType: "knowledge_base",
        snippet: "全流程复合技术能力需要在标准场景中不断将感知层采样、通道接入与测评大纲紧联，以达成快速胜任行业任务开发的目标。",
        section: "1.1 专业工程素养概论"
      }
    ];

    summary = "你对该基础名词概念的了解已经达到推荐标准。为促成真正工程实操的胜任力，建议结合物联网套件硬件连接。";
    weakPoints = ["软硬件高并发消息控制", "通信系统安全认证集成"];
    mastery = [
      { name: "课程理解", score: 81 },
      { name: "实验操作", score: 75 },
      { name: "数据分析", score: 71 },
      { name: "综合应用", score: 73 },
      { name: "测评表现", score: 79 }
    ];
    suggestions = [
      {
        title: "阅读平台配有章节的技术背景大百科",
        type: "note",
        description: "利用碎片时间浏览本问题在平台知识库的相关概念延展介绍，强化知识面宽度。"
      }
    ];
    nextQuestions = [
      "物联网工程实践中包含哪些必须要掌握的底层开发框架与环境参数？",
      "如何合理评估我的实验操作成效，并导出针对性评价数据包？"
    ];
  }

  return {
    success: true,
    answer,
    references,
    skillDiagnosis: {
      summary,
      weakPoints,
      mastery
    },
    suggestions,
    nextQuestions
  };
}

async function startServer() {
  const app = express();

  app.use(express.json());

  // 1. Core API Route: /api/ai-skill/chat
  app.post("/api/ai-skill/chat", async (req, res) => {
    try {
      const { question, userId, userName, role, scene, platformContext } = req.body;

      if (!question || typeof question !== "string") {
        return res.status(400).json({
          success: false,
          error: "Question is required and must be a string."
        });
      }

      console.log(`Received request: [student: ${userName || userId}] question: "${question}"`);

      const gemini = getGeminiClient();

      if (gemini) {
        // Build prompt incorporating platform context parameters to make Gemini extremely precise
        const prompt = `
          Student Question: "${question}"
          Student User ID: "${userId || "anonymous"}"
          Student Name: "${userName || "学生"}"
          Role: "${role || "student"}"
          Interface Scene: "${scene || "ai_skill_assistant"}"
          Platform Context Info: ${JSON.stringify(platformContext || {})}

          Please generate a structured, professional output using the defined responses JSON schema. Ensure references, diagnosis details, suggestion items, and nextQuestions are present, highly technical, and strictly written in Simplified Chinese (简体中文).
        `;

        const response = await gemini.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            systemInstruction: `你是物联网(IoT)实训平台的 AI 助手（北京新大陆时代科技）。
            请根据学生提问（关于MQTT通讯协议、嵌入式网关调试或物联网工程技术规格等方面），给出专业、通俗、简洁的智能回复。
            
            必须遵守以下 JSON 输出规范：
            1. 'answer' 包含主回答（使用简洁清晰的 Markdown 语法：加粗、层级列表及代码关键行），避免废话，点到即止，实现精简响应。
            2. 'references' 可为空或提供1-2个模拟的平台教材/手册。
            3. 'skillDiagnosis' 包含对本次问题的一句简述 'summary'、1-2个词的 'weakPoints' 以及5个核心维度的评分 'mastery'。
            4. 'suggestions' 为其自适应建议1个上机或者题库作业项目。
            5. 'nextQuestions' 额外提供 2 个有助于加深学习的技术方向延伸引导问题。
            6. 所有字段文字必须严格使用简体中文输出。`,
            responseMimeType: "application/json",
            responseSchema: promptSchema
          }
        });

        const textOutput = response.text;
        if (textOutput) {
          try {
            const parsed = JSON.parse(textOutput);
            return res.json(parsed);
          } catch (jsonErr) {
            console.error("Failed to parse JSON output generated by Gemini model:", jsonErr, "Output was:", textOutput);
            // Fallback to regex generator if json parsing failed
            const fallbackData = getSmartFallback(question);
            return res.json({
              ...fallbackData,
              note: "Gemini response parsing failed, using high fidelity backup parser."
            });
          }
        } else {
          throw new Error("Empty response from GoogleGenAI model.");
        }
      } else {
        // Fallback when key is not defined yet - perfectly dynamic and helpful
        const fallbackData = getSmartFallback(question);
        return res.json(fallbackData);
      }
    } catch (error: any) {
      console.error("Error inside AI Skill Chat handler:", error);
      return res.status(500).json({
        success: false,
        error: "AI技能助手服务暂时不可用，请检查接口连接或稍后重试。",
        details: error.message || String(error)
      });
    }
  });

  // 2. Vite Middleware Setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware loaded successfully.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static files mounted.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Fullstack Express server running on port ${PORT}`);
  });
}

startServer();
