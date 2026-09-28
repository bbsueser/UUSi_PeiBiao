export interface AiApp {
  id: string;
  name: string;
  scene: string;
  toolType: string;
  course: string;
  createMode: string;
  status: '已发布' | '草稿' | '停用';
  knowledgeBases: string[];
  usageCount: number;
  updatedAt: string;
  description: string;
  capabilities: string[];
}

export interface OperationRecord {
  time: string;
  type: string;
  name: string;
  mode: string;
  content: string;
  operator: string;
  result: string;
}

export interface QueryRecord {
  time: string;
  method: string;
  scene: string;
  toolType: string;
  keyword: string;
  result: string;
  operator: string;
}

export interface KnowledgeBase {
  id: string;
  courseName: string;
  icon: string;
  courseType: string;
  overview: string;
  documentCount: number;
  wordCount: string;
  managedAppCount: number;
  managedApps: string[];
  status: '已启用' | '待完善' | '更新中';
  updatedAt: string;
}

export interface KbRecord {
  time: string;
  action: string;
  courseName: string;
  documentCount: string;
  wordCount: string;
  managedAppCount: string;
  operator: string;
  result: string;
}

export const initialAiAppList: AiApp[] = [
  {
    id: "app-1",
    name: "Python课程答疑助手",
    scene: "课程教学",
    toolType: "对话助手",
    course: "Python基础与应用",
    status: "已发布",
    createMode: "对话引导式创建",
    knowledgeBases: ["Python基础知识库", "Python实验指导书"],
    usageCount: 126,
    updatedAt: "今天 10:20",
    description: "面向 Python 基础课程提供知识点答疑、代码解释和学习建议。",
    capabilities: ["课程答疑", "代码解释", "实验提示", "学习建议"]
  },
  {
    id: "app-2",
    name: "区块链实验指导助手",
    scene: "实验指导",
    toolType: "智能体应用",
    course: "区块链开发实训",
    status: "已发布",
    createMode: "信息引导式创建",
    knowledgeBases: ["区块链实验指导书", "智能合约常见错误库"],
    usageCount: 89,
    updatedAt: "昨天 16:40",
    description: "用于智能合约编写、部署、调试和实验步骤指导。",
    capabilities: ["实验指导", "代码检查", "错误排查"]
  },
  {
    id: "app-3",
    name: "物联网硬件实验助手",
    scene: "实验指导",
    toolType: "智能体应用",
    course: "物联网综合实训",
    status: "已发布",
    createMode: "信息引导式创建",
    knowledgeBases: ["物联网实验指导书", "硬件设备说明书"],
    usageCount: 96,
    updatedAt: "昨天 14:20",
    description: "用于硬件接线、设备调试、传感器数据采集和实验排错。",
    capabilities: ["实验步骤指导", "设备故障排查", "数据采集说明", "实验报告建议"]
  },
  {
    id: "app-4",
    name: "数据可视化学习助手",
    scene: "学习辅导",
    toolType: "知识库问答",
    course: "数据可视化实训",
    status: "已发布",
    createMode: "对话引导式创建",
    knowledgeBases: ["pyecharts 图表知识库", "可视化案例库"],
    usageCount: 74,
    updatedAt: "3天前 09:15",
    description: "支持图表配置、可视化案例讲解和学习路径建议。",
    capabilities: ["知识问答", "图表推荐", "代码示例"]
  },
  {
    id: "app-5",
    name: "期末复习训练助手",
    scene: "考试训练",
    toolType: "工作流应用",
    course: "Python基础与应用",
    status: "已发布",
    createMode: "信息引导式创建",
    knowledgeBases: ["考试题库", "章节知识点库"],
    usageCount: 58,
    updatedAt: "上周 11:30",
    description: "根据章节知识点生成复习计划、训练题和错题解析。",
    capabilities: ["生成题目", "自动批改", "错题解析"]
  },
  {
    id: "app-6",
    name: "作业智能批改助手",
    scene: "作业批改",
    toolType: "批改工具",
    course: "Python基础与应用",
    status: "草稿",
    createMode: "信息引导式创建",
    knowledgeBases: ["评分规则库", "作业样例库"],
    usageCount: 21,
    updatedAt: "上周 15:00",
    description: "用于代码作业、实验报告和课程练习的辅助批改。",
    capabilities: ["自动批改", "分数评估"]
  },
  {
    id: "app-7",
    name: "学生技能诊断助手",
    scene: "技能诊断",
    toolType: "分析工具",
    course: "综合实训课程",
    status: "已发布",
    createMode: "对话引导式创建",
    knowledgeBases: ["技能指标库", "学习行为分析库"],
    usageCount: 112,
    updatedAt: "本周 08:00",
    description: "根据学习行为、实验成绩和技能图谱生成技能诊断结果。",
    capabilities: ["数据分析", "学习建议", "报表生成"]
  },
  {
    id: "app-8",
    name: "教师智能备课助手",
    scene: "教学备课",
    toolType: "工作流应用",
    course: "全部课程",
    status: "已发布",
    createMode: "信息引导式创建",
    knowledgeBases: ["课程标准库", "教学资源库"],
    usageCount: 65,
    updatedAt: "本月 09:00",
    description: "辅助教师生成教学设计、课堂活动和课程资源建议。",
    capabilities: ["教案生成", "资源推荐"]
  }
];

export const initialQueryRecords: QueryRecord[] = [
  { time: "10:30:00", method: "场景筛选", scene: "实验指导", toolType: "全部类型", keyword: "-", result: "找到 2 个应用", operator: "教师1" },
  { time: "10:31:00", method: "类型筛选", scene: "全部场景", toolType: "智能体应用", keyword: "-", result: "找到 2 个应用", operator: "教师1" },
  { time: "10:32:00", method: "模糊查询", scene: "全部场景", toolType: "全部类型", keyword: "Python", result: "找到 3 个应用", operator: "教师1" },
  { time: "10:33:00", method: "组合查询", scene: "实验指导", toolType: "智能体应用", keyword: "区块链", result: "找到 1 个应用", operator: "教师1" }
];

export interface CourseConfig {
  id: string;
  courseName: string;
  icon: string;
  courseType: string;
  overview: string;
  kbName: string;
  kbDocCount: number;
  kbWordCount: string;
  aiAssistantEnabled: boolean;
  linkedAiApps: string[];
  defaultAiApp: string;
  aiCapabilities: string[];
  showInLargeModel: boolean;
  displayPositions: string[];
  displayTargets: string[];
  chartSettings: string[];
}

export const initialCourseConfigs: CourseConfig[] = [
  {
    id: "course-python",
    courseName: "Python基础与应用",
    icon: "Python",
    courseType: "编程开发",
    overview: "覆盖 Python 基础语法、数据类型、流程控制、函数、文件操作、数据处理和综合项目实训内容。",
    kbName: "Python基础与应用知识库",
    kbDocCount: 42,
    kbWordCount: "18.6",
    aiAssistantEnabled: true,
    linkedAiApps: ["Python课程答疑助手", "Python实验指导助手", "期末复习训练助手", "作业智能批改助手"],
    defaultAiApp: "Python课程答疑助手",
    aiCapabilities: ["课程知识问答", "实验步骤指导", "代码错误解释", "学习路径推荐", "技能掌握分析"],
    showInLargeModel: true,
    displayPositions: ["课程首页", "AI技能助手首页", "学生学习空间", "教师课程空间"],
    displayTargets: ["学生", "教师", "课程管理员"],
    chartSettings: ["技能掌握度图表", "学习进度图表", "实验完成率图表", "问答活跃度图表"]
  },
  {
    id: "course-blockchain",
    courseName: "区块链开发实训",
    icon: "区块链",
    courseType: "区块链",
    overview: "包含区块链基础、智能合约编写、合约编译部署、链上数据查询、实验步骤说明和常见错误排查资料。",
    kbName: "区块链开发实训知识库",
    kbDocCount: 36,
    kbWordCount: "15.2",
    aiAssistantEnabled: true,
    linkedAiApps: ["区块链实验指导助手", "智能合约答疑助手", "链上数据分析助手"],
    defaultAiApp: "区块链实验指导助手",
    aiCapabilities: ["课程知识问答", "实验步骤指导", "代码错误解释", "技能掌握分析"],
    showInLargeModel: true,
    displayPositions: ["课程首页", "AI技能助手首页", "学生学习空间"],
    displayTargets: ["学生", "教师"],
    chartSettings: ["技能掌握度图表", "问答活跃度图表", "实验完成率图表", "AI应用调用统计图表"]
  },
  {
    id: "course-iot",
    courseName: "物联网综合实训",
    icon: "物联网",
    courseType: "物联网",
    overview: "覆盖传感器接入、网关配置、硬件控制、数据采集、设备诊断和实验报告等物联网课程实验资料。",
    kbName: "物联网综合实训知识库",
    kbDocCount: 48,
    kbWordCount: "21.3",
    aiAssistantEnabled: true,
    linkedAiApps: ["物联网硬件实验助手", "设备故障排查助手", "实验报告生成助手"],
    defaultAiApp: "物联网硬件实验助手",
    aiCapabilities: ["课程知识问答", "实验步骤指导", "设备故障排查"],
    showInLargeModel: true,
    displayPositions: ["课程首页", "AI技能助手首页", "学生学习空间"],
    displayTargets: ["学生", "教师"],
    chartSettings: ["学习进度图表", "技能掌握度图表", "实验完成率图表", "设备操作统计图表"]
  },
  {
    id: "course-bigdata",
    courseName: "大数据分析实训",
    icon: "大数据",
    courseType: "数据分析",
    overview: "提供数据采集、数据清洗、数据存储、数据分析、数据处理流程和项目案例说明等知识资料。",
    kbName: "大数据分析实训知识库",
    kbDocCount: 39,
    kbWordCount: "17.4",
    aiAssistantEnabled: false,
    linkedAiApps: ["大数据分析助手"],
    defaultAiApp: "大数据分析助手",
    aiCapabilities: ["课程知识问答", "实验步骤指导", "代码错误解释", "技能掌握分析"],
    showInLargeModel: false,
    displayPositions: ["课程首页"],
    displayTargets: ["学生"],
    chartSettings: ["学习进度图表", "实验完成率图表"]
  },
  {
    id: "course-datavis",
    courseName: "数据可视化实训",
    icon: "数据可视化",
    courseType: "数据分析",
    overview: "包含 matplotlib、pyecharts、图表配置、交互图表、组合图表和可视化报告设计等课程资源。",
    kbName: "数据可视化知识库",
    kbDocCount: 31,
    kbWordCount: "12.8",
    aiAssistantEnabled: true,
    linkedAiApps: ["数据可视化学习助手", "图表配置答疑助手"],
    defaultAiApp: "数据可视化学习助手",
    aiCapabilities: ["课程知识问答", "代码错误解释"],
    showInLargeModel: true,
    displayPositions: ["课程首页", "AI技能助手首页"],
    displayTargets: ["学生", "教师"],
    chartSettings: ["学习进度图表", "技能掌握度图表", "问答活跃度图表"]
  },
  {
    id: "course-ai",
    courseName: "人工智能基础",
    icon: "人工智能",
    courseType: "人工智能",
    overview: "包含人工智能基础概念、机器学习流程、模型训练、数据标注、算法案例和课程练习说明。",
    kbName: "人工智能基础知识库",
    kbDocCount: 28,
    kbWordCount: "13.5",
    aiAssistantEnabled: true,
    linkedAiApps: ["AI基础学习助手"],
    defaultAiApp: "AI基础学习助手",
    aiCapabilities: ["课程知识问答", "学习路径推荐", "技能掌握分析"],
    showInLargeModel: true,
    displayPositions: ["课程首页", "学生学习空间"],
    displayTargets: ["学生", "教师"],
    chartSettings: ["技能掌握度图表", "学习进度图表", "问答活跃度图表"]
  },
  {
    id: "course-embed",
    courseName: "嵌入式系统基础",
    icon: "嵌入式",
    courseType: "物联网",
    overview: "覆盖嵌入式开发环境、GPIO、串口通信、传感器控制、设备调试和实验任务指导资料。",
    kbName: "嵌入式知识库",
    kbDocCount: 34,
    kbWordCount: "14.9",
    aiAssistantEnabled: false,
    linkedAiApps: ["嵌入式实验助手", "串口通信答疑助手"],
    defaultAiApp: "嵌入式实验助手",
    aiCapabilities: ["课程知识问答", "代码错误解释"],
    showInLargeModel: false,
    displayPositions: [],
    displayTargets: [],
    chartSettings: ["学习进度图表", "实验完成率图表"]
  },
  {
    id: "course-se",
    courseName: "软件项目实训",
    icon: "软件工程",
    courseType: "编程开发",
    overview: "包含项目需求分析、接口设计、前端页面、后端服务、测试文档、部署说明和项目验收资料。",
    kbName: "软件工程知识库",
    kbDocCount: 28,
    kbWordCount: "14.9",
    aiAssistantEnabled: true,
    linkedAiApps: ["软件项目指导助手"],
    defaultAiApp: "软件项目指导助手",
    aiCapabilities: ["课程知识问答", "实验步骤指导", "学习路径推荐", "考试复习建议"],
    showInLargeModel: true,
    displayPositions: ["课程首页", "AI技能助手首页", "教师课程空间"],
    displayTargets: ["学生", "教师"],
    chartSettings: ["技能掌握度图表", "实验完成率图表", "代码错误统计图表"]
  }
];

export const initialCourseRecords: CourseConfigRecord[] = [
  { time: "10:30:00", courseName: "Python基础与应用", action: "启用AI技能助手", linkedApps: "4个应用", displayStatus: "展示", chartSetting: "4项图表", operator: "教师1", result: "成功" },
  { time: "10:32:00", courseName: "区块链开发实训", action: "关联AI应用", linkedApps: "3个应用", displayStatus: "展示", chartSetting: "4项图表", operator: "教师1", result: "成功" },
  { time: "10:34:00", courseName: "物联网综合实训", action: "修改展示图表", linkedApps: "3个应用", displayStatus: "展示", chartSetting: "实验完成率等", operator: "教师1", result: "成功" },
  { time: "10:36:00", courseName: "大数据分析实训", action: "修改展示状态", linkedApps: "1个应用", displayStatus: "不展示", chartSetting: "2项图表", operator: "教师1", result: "成功" },
];

export interface CourseConfigRecord {
  time: string;
  courseName: string;
  action: string;
  linkedApps: string;
  displayStatus: string;
  chartSetting: string;
  operator: string;
  result: string;
}

export const initialKbList: KnowledgeBase[] = [
  {
    id: "kb-python",
    courseName: "Python基础与应用",
    icon: "Python",
    courseType: "编程开发",
    overview: "覆盖 Python 基础语法、数据类型、流程控制、函数、文件操作、数据处理和综合项目实训内容，为 AI 问答和实验指导提供课程知识支撑。",
    documentCount: 42,
    wordCount: "18.6 万字",
    managedAppCount: 4,
    managedApps: ["Python课程答疑助手", "Python实验指导助手", "期末复习训练助手", "作业智能批改助手"],
    status: "已启用",
    updatedAt: "今天 10:20"
  },
  {
    id: "kb-blockchain",
    courseName: "区块链开发实训",
    icon: "区块链",
    courseType: "区块链",
    overview: "包含区块链基础、智能合约编写、合约编译部署、链上数据查询、实验步骤说明和常见错误排查资料。",
    documentCount: 36,
    wordCount: "15.2 万字",
    managedAppCount: 3,
    managedApps: ["区块链实验指导助手", "智能合约答疑助手", "链上数据分析助手"],
    status: "已启用",
    updatedAt: "昨天 16:40"
  },
  {
    id: "kb-iot",
    courseName: "物联网综合实训",
    icon: "物联网",
    courseType: "物联网",
    overview: "覆盖传感器接入、网关配置、硬件控制、数据采集、设备诊断和实验报告等物联网课程实验资料。",
    documentCount: 48,
    wordCount: "21.3 万字",
    managedAppCount: 3,
    managedApps: ["物联网硬件实验助手", "设备故障排查助手", "实验报告生成助手"],
    status: "已启用",
    updatedAt: "今天 09:35"
  },
  {
    id: "kb-datavis",
    courseName: "数据可视化实训",
    icon: "数据可视化",
    courseType: "数据分析",
    overview: "包含 matplotlib、pyecharts、图表配置、交互图表、组合图表和可视化报告设计等课程资源。",
    documentCount: 31,
    wordCount: "12.8 万字",
    managedAppCount: 2,
    managedApps: ["数据可视化学习助手", "图表配置答疑助手"],
    status: "已启用",
    updatedAt: "本周一 14:10"
  },
  {
    id: "kb-bigdata",
    courseName: "大数据分析实训",
    icon: "大数据",
    courseType: "数据分析",
    overview: "提供数据采集、数据清洗、数据存储、数据分析、数据处理流程和项目案例说明等知识资料。",
    documentCount: 39,
    wordCount: "17.4 万字",
    managedAppCount: 2,
    managedApps: ["大数据分析助手", "数据处理问答助手"],
    status: "待完善",
    updatedAt: "本周二 11:30"
  },
  {
    id: "kb-ai",
    courseName: "人工智能基础",
    icon: "人工智能",
    courseType: "人工智能",
    overview: "包含人工智能基础概念、机器学习流程、模型训练、数据标注、算法案例和课程练习说明。",
    documentCount: 28,
    wordCount: "13.5 万字",
    managedAppCount: 1,
    managedApps: ["AI基础学习助手"],
    status: "已启用",
    updatedAt: "本周三 15:20"
  },
  {
    id: "kb-embed",
    courseName: "嵌入式系统基础",
    icon: "嵌入式",
    courseType: "物联网",
    overview: "覆盖嵌入式开发环境、GPIO、串口通信、传感器控制、设备调试和实验任务指导资料。",
    documentCount: 34,
    wordCount: "14.9 万字",
    managedAppCount: 2,
    managedApps: ["嵌入式实验助手", "串口通信答疑助手"],
    status: "更新中",
    updatedAt: "今天 08:50"
  },
  {
    id: "kb-se",
    courseName: "软件项目实训",
    icon: "软件工程",
    courseType: "编程开发",
    overview: "包含项目需求分析、接口设计、前端页面、后端服务、测试文档、部署说明和项目验收资料。",
    documentCount: 28,
    wordCount: "14.9 万字",
    managedAppCount: 1,
    managedApps: ["软件项目指导助手"],
    status: "已启用",
    updatedAt: "昨天 18:05"
  }
];

export const initialKbRecords: KbRecord[] = [
  { time: '10:20:00', action: '查看知识库', courseName: 'Python基础与应用', documentCount: '42个', wordCount: '18.6万字', managedAppCount: '4个', operator: '教师1', result: '成功' },
  { time: '10:22:00', action: '筛选知识库', courseName: '物联网综合实训', documentCount: '48个', wordCount: '21.3万字', managedAppCount: '3个', operator: '教师1', result: '成功' },
  { time: '10:25:00', action: '更新知识库', courseName: '嵌入式系统基础', documentCount: '34个', wordCount: '14.9万字', managedAppCount: '2个', operator: '教师1', result: '成功' },
  { time: '10:28:00', action: '管理应用', courseName: '区块链开发实训', documentCount: '36个', wordCount: '15.2万字', managedAppCount: '3个', operator: '教师1', result: '成功' }
];
