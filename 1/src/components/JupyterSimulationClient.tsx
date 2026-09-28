import React, { useState, useEffect } from "react";
import {
  Play,
  Square,
  RotateCcw,
  Plus,
  Trash2,
  Save,
  Scissors,
  Copy,
  Clipboard,
  PlayCircle,
  Terminal,
  Settings,
  Activity,
  CheckCircle,
  Clock,
  BookOpen,
  FileCode,
  X,
  FileText,
  Camera,
  HelpCircle,
  ChevronRight,
  Monitor,
  Check,
  AlertCircle,
  Sliders,
  ChevronUp,
  ChevronDown,
  FolderOpen,
  Folder,
  Download,
  Upload,
  Layers,
  Database,
  Sparkles,
  Cpu,
  RefreshCw,
  Server
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend } from "recharts";

// Standard types for our simulated Notebook Cells
interface CodeCell {
  id: string;
  type: "code" | "markdown";
  comment: string;
  codeText: string;
  isExecuted: boolean;
  isExecuting: boolean;
  executionCount: number | null;
  outputMarkup?: "text" | "json" | "chart" | "table" | "jieba" | "config" | "filter" | "markdown" | "pye-types-grid" | "pye-line" | "pye-bar-pie" | "pye-scatter" | "pye-combination" | "pye-tab-timeline" | "model-env" | "model-app-create" | "model-app-deploy" | "model-classify" | "model-detect" | "model-records";
  outputText?: string;
  title?: string;
}

export interface RecordType {
  key: string;
  time: string;
  type: string;
  name: string;
  status: string;
  cells: string;
  operator: string;
}

const initialRecords: RecordType[] = [
  {
    key: "rec-1",
    time: "10:37:00",
    type: "导出文件",
    name: "3. Python 数据类型-答案-已执行.ipynb",
    status: "已成功生成并保存在物理介质 (✓)",
    cells: "Markdown: 1 | Code: 4",
    operator: "学生1"
  },
  {
    key: "rec-2",
    time: "10:36:20",
    type: "执行 Notebook",
    name: "3. Python 数据类型-答案.ipynb",
    status: "已成功在上级内核完整计算执行 (✓)",
    cells: "Markdown: 1 | Code: 4",
    operator: "学生1"
  },
  {
    key: "rec-3",
    time: "10:35:10",
    type: "导入文件",
    name: "3. Python 数据类型-答案.ipynb",
    status: "就绪待执行",
    cells: "Markdown: 1 | Code: 4",
    operator: "学生1"
  }
];

const getDefaultOutputByCellId = (id: string): string => {
  switch (id) {
    case "pres-code-2": return "['Hello', 'Python']";
    case "pres-code-3": return "27.5";
    case "pres-code-5": return "这是/一个/句子/。";
    case "xpath-2": return "数据抓取 -> 商品: 智能洗手液机, 售价: 199元\n数据抓取 -> 商品: 温湿度传感器套件, 售价: 299元";
    case "pye-code-1": return "pyecharts 已安装\npyecharts version: 2.0.0\n可视化组件加载成功";
    case "imp-code-1": return "int";
    case "imp-code-2": return "str";
    case "imp-code-3": return "list";
    case "imp-code-4": return "dict";
    default: return "";
  }
};

export default function JupyterSimulationClient({
  onClose,
  showToast
}: {
  onClose: () => void;
  showToast: (msg: string) => void;
}) {
  // --- 1. LOCAL STATE ---
  const [activeTab, setActiveTab] = useState<"preset" | "pyecharts" | "xpath" | "imported_analysis" | "model_predict" | "visual_train">("visual_train");

  // ================= 可视化模型训练工具相关状态 =================
  const [trainingTaskType, setTrainingTaskType] = useState<"classify" | "detect">("classify");
  const [selectedPretrainedModel, setSelectedPretrainedModel] = useState<string>("ResNet50");
  const [modelFileLoaded, setModelFileLoaded] = useState<boolean>(false);

  const [datasetLoaded, setDatasetLoaded] = useState<boolean>(false);
  const [preprocessStatus, setPreprocessStatus] = useState<"idle" | "processing" | "completed">("idle");
  const [preprocessProgress, setPreprocessProgress] = useState<number>(0);
  const [dataProductionStatus, setDataProductionStatus] = useState<"idle" | "processing" | "completed">("idle");
  const [dataProductionProgress, setDataProductionProgress] = useState<number>(0);

  // 预处理配置
  const [preprocessConfig, setPreprocessConfig] = useState({
    imgSize: "224 x 224",
    normalize: true,
    randomFlip: true,
    randomCrop: true,
    colorJitter: true,
    randomRotate: true,
    anomalyClean: true,
    duplicateDetect: true,
    classBalance: true
  });

  // 数据生产配置
  const [productionConfig, setProductionConfig] = useState({
    trainRatio: 70,
    valRatio: 20,
    testRatio: 10,
    genList: true,
    genLabelMap: true,
    genTrainConfig: true
  });

  // 训练参数配置
  const [trainConfig, setTrainConfig] = useState({
    epoch: 20,
    batchSize: 16,
    lr: 0.001,
    optimizer: "Adam",
    loss: "CrossEntropyLoss",
    device: "GPU",
    earlyStopping: true,
    saveBest: true,
    outputFormat: [".pth", ".onnx"]
  });
  const [trainParamsApplied, setTrainParamsApplied] = useState<boolean>(false);

  // 训练过程状态
  const [trainingStatus, setTrainingStatus] = useState<"idle" | "training" | "completed">("idle");
  const [trainingProgress, setTrainingProgress] = useState<number>(0);
  const [currentEpoch, setCurrentEpoch] = useState<number>(0);
  const [trainingMetrics, setTrainingMetrics ] = useState<{ epoch: number; train_loss: number; val_loss: number; accuracy: number; mAP?: number }[]>([]);
  // 曲线数据：用于折线图和列表展示
  const [activeMetrics, setActiveMetrics] = useState<{ train_loss: number; val_loss: number; accuracy: number; mAP?: number }>({
    train_loss: 0,
    val_loss: 0,
    accuracy: 0,
    mAP: 0
  });

  // 模型验证
  const [validationStatus, setValidationStatus] = useState<"idle" | "validating" | "completed">("idle");
  const [validationReportGenerated, setValidationReportGenerated] = useState<boolean>(false);

  // 边缘终端与部署
  const [edgeConnectionStatus, setEdgeConnectionStatus] = useState<"disconnected" | "connected">("disconnected");
  const [modelDeployStatus, setModelDeployStatus] = useState<"idle" | "deploying" | "completed">("idle");
  const [deployProgress, setDeployProgress] = useState<number>(0);

  // 端侧推理验证
  const [edgeInferenceStatus, setEdgeInferenceStatus] = useState<"idle" | "inferencing" | "completed">("idle");
  const [inferenceImage, setInferenceImage] = useState<string>("edge_demo_cat.jpg");

  // 流程步骤与完成度映射 (1 到 8 步)
  const [workflowStep, setWorkflowStep] = useState<number>(1);
  const [workflowCompletedMap, setWorkflowCompletedMap] = useState<Record<string, boolean>>({
    task: false,
    preprocess: false,
    production: false,
    config: false,
    train: false,
    validation: false,
    deploy: false,
    inference: false
  });

  // 训练与部署专用日志列表
  const [visualTrainLogs, setVisualTrainLogs] = useState<Array<{ time: string; text: string; type: "info" | "success" | "warn" | "error" }>>([
    { time: "10:15:00", text: "可视化模型训练工具已启动，等待加载预训练模型...", type: "info" }
  ]);

  const addVisualTrainLog = (text: string, type: "info" | "success" | "warn" | "error" = "info") => {
    const timeStr = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    setVisualTrainLogs((prev) => [
      { time: timeStr, text, type },
      ...prev
    ]);
  };

  const [leftNavActive, setLeftNavActive] = useState<"guide" | "manual" | "screenshot">("guide");
  const [isTerminalOpen, setIsTerminalOpen] = useState<boolean>(false);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [isRightSettingsOpen, setIsRightSettingsOpen] = useState<boolean>(true); // Default open right panel
  const [isTracePanelCollapsed, setIsTracePanelCollapsed] = useState<boolean>(false);

  // --- MODEL PREDICTION ENVIRONMENT & DEPLOY STATES ---
  const [modelAppStatus, setModelAppStatus] = useState<"running" | "stopped">("running");
  const [webPreviewVisible, setWebPreviewVisible] = useState<boolean>(true);
  const [predictionTaskType, setPredictionTaskType] = useState<"classify" | "detect">("classify");
  const [selectedDemoImage, setSelectedDemoImage] = useState<"demo_cat.jpg" | "demo_road.jpg">("demo_cat.jpg");
  const [predictionStatus, setPredictionStatus] = useState<"idle" | "predicting" | "completed">("completed");
  const [predictionLogs, setPredictionLogs] = useState<string[]>([
    "[10:45:10] 正在启动模型预测应用",
    "[10:45:11] 加载图像分类模型 image_classifier.pkl",
    "[10:45:12] 加载目标检测模型 object_detector.pt",
    "[10:45:13] Flask app running on http://127.0.0.1:7860",
    "[10:45:14] Web 预览服务已就绪",
    "[10:45:20] 接收到图像分类预测请求",
    "[10:45:21] 返回分类结果：猫，confidence=0.96",
    "[10:45:30] 接收到目标检测预测请求",
    "[10:45:31] 返回检测结果：person、car、traffic light"
  ]);

  const [predictionRecords, setPredictionRecords] = useState<Array<{
    time: string;
    appName: string;
    taskType: string;
    inputImage: string;
    result: string;
    confidence: string;
    status: string;
    operator: string;
  }>>([
    {
      time: "10:45:31",
      appName: "模型预测应用",
      taskType: "目标检测",
      inputImage: "demo_road.jpg",
      result: "person、car、traffic light",
      confidence: "0.93 / 0.88 / 0.81",
      status: "成功",
      operator: "学生1"
    },
    {
      time: "10:45:21",
      appName: "模型预测应用",
      taskType: "图像分类",
      inputImage: "demo_cat.jpg",
      result: "猫",
      confidence: "0.96",
      status: "成功",
      operator: "学生1"
    }
  ]);

  const [selectedFileForPreview, setSelectedFileForPreview] = useState<{
    name: string;
    path: string;
    content: string;
    type: "json" | "code" | "image" | "binary";
  } | null>(null);

  // --- IPYNB Import & Export states ---
  const [importPanelOpen, setImportPanelOpen] = useState<boolean>(false);
  const [exportPanelOpen, setExportPanelOpen] = useState<boolean>(false);
  
  // Selection & Parse flows for file importing
  const [selectedImportFile, setSelectedImportFile] = useState<string | null>(null); // e.g. "student_analysis_case.ipynb"
  const [importParseStatus, setImportParseStatus] = useState<"not_selected" | "selected" | "parsed" | "imported">("not_selected");
  const [exportedFilesList, setExportedFilesList] = useState<string[]>([
    "3. Python 数据类型-答案-已执行.ipynb"
  ]);

  // Folder workspace active interactive lists
  const [filesList, setFilesList] = useState<Array<{
    name: string;
    type: string;
    lastModified: string;
    indent?: number;
    path?: string;
  }>>([
    { name: "visual_model_train.ipynb", type: "ipynb", lastModified: "刚刚", indent: 0, path: "/work/visual_model_train.ipynb" },
    { name: "visual_train", type: "folder", lastModified: "10秒前", indent: 0, path: "/work/visual_train" },
    { name: "dataset", type: "folder", lastModified: "1分钟前", indent: 1, path: "/work/visual_train/dataset" },
    { name: "classification", type: "folder", lastModified: "1分钟前", indent: 2, path: "/work/visual_train/dataset/classification" },
    { name: "cat", type: "folder", lastModified: "1分钟前", indent: 3, path: "/work/visual_train/dataset/classification/cat" },
    { name: "dog", type: "folder", lastModified: "1分钟前", indent: 3, path: "/work/visual_train/dataset/classification/dog" },
    { name: "detection", type: "folder", lastModified: "刚刚", indent: 2, path: "/work/visual_train/dataset/detection" },
    { name: "images", type: "folder", lastModified: "刚刚", indent: 3, path: "/work/visual_train/dataset/detection/images" },
    { name: "labels", type: "folder", lastModified: "刚刚", indent: 3, path: "/work/visual_train/dataset/detection/labels" },
    { name: "annotations.json", type: "file", lastModified: "刚刚", indent: 3, path: "/work/visual_train/dataset/detection/annotations.json" },
    { name: "pretrained", type: "folder", lastModified: "10分钟前", indent: 1, path: "/work/visual_train/pretrained" },
    { name: "resnet50.pth", type: "file", lastModified: "刚刚", indent: 2, path: "/work/visual_train/pretrained/resnet50.pth" },
    { name: "mobilenet_v3.pth", type: "file", lastModified: "刚刚", indent: 2, path: "/work/visual_train/pretrained/mobilenet_v3.pth" },
    { name: "yolov5s.pt", type: "file", lastModified: "刚刚", indent: 2, path: "/work/visual_train/pretrained/yolov5s.pt" },
    { name: "yolov8n.pt", type: "file", lastModified: "刚刚", indent: 2, path: "/work/visual_train/pretrained/yolov8n.pt" },
    { name: "output", type: "folder", lastModified: "刚刚", indent: 1, path: "/work/visual_train/output" },
    { name: "best_model.pth", type: "file", lastModified: "刚刚", indent: 2, path: "/work/visual_train/output/best_model.pth" },
    { name: "best_model.onnx", type: "file", lastModified: "刚刚", indent: 2, path: "/work/visual_train/output/best_model.onnx" },
    { name: "train_log.json", type: "file", lastModified: "刚刚", indent: 2, path: "/work/visual_train/output/train_log.json" },
    { name: "metrics.json", type: "file", lastModified: "刚刚", indent: 2, path: "/work/visual_train/output/metrics.json" },
    { name: "edge_infer_result.json", type: "file", lastModified: "刚刚", indent: 2, path: "/work/visual_train/output/edge_infer_result.json" },
    { name: "模型预测应用部署.ipynb", type: "ipynb", lastModified: "就绪", indent: 0, path: "/work/模型预测应用部署.ipynb" },
    { name: "model_app.py", type: "file", lastModified: "刚刚", indent: 0, path: "/work/model_app.py" },
    { name: "model", type: "folder", lastModified: "刚刚", indent: 0, path: "/work/model" },
    { name: "image_classifier.pkl", type: "file", lastModified: "刚刚", indent: 1, path: "/work/model/image_classifier.pkl" },
    { name: "object_detector.pt", type: "file", lastModified: "刚刚", indent: 1, path: "/work/model/object_detector.pt" },
    { name: "static", type: "folder", lastModified: "10分钟前", indent: 0, path: "/work/static" },
    { name: "demo_cat.jpg", type: "file", lastModified: "10分钟前", indent: 1, path: "/work/static/demo_cat.jpg" },
    { name: "demo_road.jpg", type: "file", lastModified: "10分钟前", indent: 1, path: "/work/static/demo_road.jpg" },
    { name: "outputs", type: "folder", lastModified: "5分钟前", indent: 0, path: "/work/outputs" },
    { name: "predict_result.json", type: "file", lastModified: "刚刚", indent: 1, path: "/work/outputs/predict_result.json" },
    { name: "平台预置模块.ipynb", type: "ipynb", lastModified: "昨天", indent: 0, path: "/work/平台预置模块.ipynb" },
    { name: "pyecharts可视化组件.ipynb", type: "ipynb", lastModified: "2天前", indent: 0, path: "/work/pyecharts可视化组件.ipynb" },
    { name: "Xpath解析_爬取电商平台数据.ipynb", type: "ipynb", lastModified: "3天前", indent: 0, path: "/work/Xpath解析_爬取电商平台数据.ipynb" },
    { name: "3. Python 数据类型-答案.ipynb", type: "ipynb", lastModified: "2分钟前", indent: 0, path: "/work/3. Python 数据类型-答案.ipynb" },
  ]);

  const [fileNameFilter, setFileNameFilter] = useState("");
  const [uploadDialogVisible, setUploadDialogVisible] = useState(false);
  const [selectedUploadFile, setSelectedUploadFile] = useState("3. Python 数据类型-答案.ipynb");
  
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    fileName: string | null;
  }>({ visible: false, x: 0, y: 0, fileName: null });

  // Export flows configuration
  const [exportFileName, setExportFileName] = useState<string>("3. Python 数据类型-答案-已执行.ipynb");
  const [exportStatus, setExportStatus] = useState<"idle" | "generated" | "downloaded">("idle");
  const [exportContentConfig, setExportContentConfig] = useState({
    code: true,
    markdown: true,
    outputs: true,
    executionCount: true,
    charts: true,
    metadata: true
  });

  const [importExportRecords, setImportExportRecords] = useState<RecordType[]>(initialRecords);

  const [importedCells, setImportedCells] = useState<CodeCell[]>([
    {
      id: "imp-md-1",
      type: "markdown",
      comment: "",
      codeText: `# 3. 基本数据类型\n\n## 数据类型\n\n用 type() 函数查看数据类型。`,
      isExecuted: true,
      isExecuting: false,
      executionCount: null
    },
    {
      id: "imp-code-1",
      type: "code",
      comment: "",
      codeText: `# 用 type() 函数查看整型数值的数据类型\ntype(1000)`,
      isExecuted: true,
      isExecuting: false,
      executionCount: 1,
      outputMarkup: "text",
      outputText: "int"
    },
    {
      id: "imp-code-2",
      type: "code",
      comment: "",
      codeText: `# 字符串类型\ntext = "Python 数据类型"\ntype(text)`,
      isExecuted: true,
      isExecuting: false,
      executionCount: 2,
      outputMarkup: "text",
      outputText: "str"
    },
    {
      id: "imp-code-3",
      type: "code",
      comment: "",
      codeText: `# 列表类型\nitems = [1, 2, 3, 4]\ntype(items)`,
      isExecuted: true,
      isExecuting: false,
      executionCount: 3,
      outputMarkup: "text",
      outputText: "list"
    },
    {
      id: "imp-code-4",
      type: "code",
      comment: "",
      codeText: `# 字典类型\nstudent = {"name": "张三", "score": 88}\ntype(student)`,
      isExecuted: true,
      isExecuting: false,
      executionCount: 4,
      outputMarkup: "text",
      outputText: "dict"
    }
  ]);

  // pyecharts interactive parameters
  const [pyeSelectedTab, setPyeSelectedTab] = useState<string>("基础图表");
  const [pyeSelectedYear, setPyeSelectedYear] = useState<string>("2026");
  const [selectedGalleryChart, setSelectedGalleryChart] = useState<any | null>(null);
  const [gallerySearchTerm, setGallerySearchTerm] = useState<string>("");
  const [galleryFilterCategory, setGalleryFilterCategory] = useState<string>("全部");
  const [pyeConfigTheme, setPyeConfigTheme] = useState<string>("light");
  const [pyeConfigTooltip, setPyeConfigTooltip] = useState<boolean>(true);
  const [pyeConfigLegend, setPyeConfigLegend] = useState<boolean>(true);
  const [pyeConfigDataZoom, setPyeConfigDataZoom] = useState<boolean>(true);
  const [pyeConfigToolbox, setPyeConfigToolbox] = useState<boolean>(true);
  const [pyeConfigVisualMap, setPyeConfigVisualMap] = useState<boolean>(true);

  // Line chart hovered dynamic coordinate state for hover simulation tooltip
  const [hoveredLineIndex, setHoveredLineIndex] = useState<number | null>(null);
  const [hoveredScatterIdx, setHoveredScatterIdx] = useState<number | null>(null);

  // Sandbox & parameter management
  const defaultAnalysisConfig = {
    keyword: "智慧教育",
    min_score: 80,
    chart_type: "line",
    top_k: 5,
    fill_missing_value: 0
  };

  const [analysisConfig, setAnalysisConfig] = useState(defaultAnalysisConfig);
  const [taskStatus, setTaskStatus] = useState<string>("训练中");
  const [lastResetTime, setLastResetTime] = useState<string>("10:35:20");
  const [lastSavedTime, setLastSavedTime] = useState<string>("10:40:20");
  const [resetConfirmVisible, setResetConfirmVisible] = useState<boolean>(false);
  const [resetStatus, setResetStatus] = useState<"not_reset" | "resetting" | "reset_done">("not_reset");

  const [trainingRecords, setTrainingRecords] = useState<Array<{
    time: string;
    account: string;
    sandbox: string;
    notebook: string;
    operation: string;
    result: string;
    status: "成功" | "失败";
  }>>([
    {
      time: "10:36:00",
      account: "学生1",
      sandbox: "student1-python-sandbox",
      notebook: "3. Python 数据类型-答案.ipynb",
      operation: "重新运行单元",
      result: "输出 int",
      status: "成功"
    },
    {
      time: "10:35:20",
      account: "学生1",
      sandbox: "student1-python-sandbox",
      notebook: "3. Python 数据类型-答案.ipynb",
      operation: "任务重置",
      result: "输出清空，文件保留",
      status: "成功"
    },
    {
      time: "10:31:20",
      account: "学生1",
      sandbox: "student1-python-sandbox",
      notebook: "平台预置模块.ipynb",
      operation: "运行全部",
      result: "输出 5 个结果",
      status: "成功"
    },
    {
      time: "10:30:10",
      account: "学生1",
      sandbox: "student1-python-sandbox",
      notebook: "3. Python 数据类型-答案.ipynb",
      operation: "运行单元",
      result: "输出 int",
      status: "成功"
    }
  ]);

  const [chartRunRecords, setChartRunRecords] = useState<Array<{
    time: string;
    notebook: string;
    chartType: string;
    library: string;
    interaction: string;
    output: string;
    status: string;
  }>>([
    {
      time: "10:43:00",
      notebook: "pyecharts可视化组件.ipynb",
      chartType: "Timeline 时间轴",
      library: "pyecharts",
      interaction: "时间轴交互",
      output: "已渲染",
      status: "成功"
    },
    {
      time: "10:42:30",
      notebook: "pyecharts可视化组件.ipynb",
      chartType: "Page 组合报告",
      library: "pyecharts",
      interaction: "多图组合",
      output: "已生成报告",
      status: "成功"
    },
    {
      time: "10:41:20",
      notebook: "pyecharts可视化组件.ipynb",
      chartType: "Bar + Pie",
      library: "pyecharts",
      interaction: "legend、tooltip",
      output: "已渲染",
      status: "成功"
    },
    {
      time: "10:40:10",
      notebook: "pyecharts可视化组件.ipynb",
      chartType: "Line 折线图",
      library: "pyecharts",
      interaction: "tooltip、dataZoom、toolbox",
      output: "已渲染",
      status: "成功"
    }
  ]);

  const [resetRecords, setResetRecords] = useState<Array<{
    time: string;
    account: string;
    sandbox: string;
    task: string;
    range: string;
    keep: string;
    result: string;
    operator: string;
  }>>([
    {
      time: "10:42:10",
      account: "学生1",
      sandbox: "student1-python-sandbox",
      task: "Python 数据类型训练",
      range: "输出结果、执行计数、临时变量",
      keep: "3. Python 数据类型-答案.ipynb、sample.csv",
      result: "成功",
      operator: "学生1"
    },
    {
      time: "10:35:20",
      account: "学生1",
      sandbox: "student1-python-sandbox",
      task: "Python 数据分析训练",
      range: "输出结果、流程配置、临时变量、运行状态",
      keep: "个人 Notebook、上传文件、导出文件、工作目录文件",
      result: "成功",
      operator: "学生1"
    }
  ]);
  
  // Cells state
  const [executionIndex, setExecutionIndex] = useState<number>(6);
  const [savingStatus, setSavingStatus] = useState<string>("Saving completed");
  const [kernelStatus, setKernelStatus] = useState<"Idle" | "Busy">("Idle");
  
  // Custom screen flash or photo snapping effect
  const [isSnapping, setIsSnapping] = useState<boolean>(false);
  const [screenshotList, setScreenshotList] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Notebook content for Tab 5: 模型预测应用部署.ipynb
  const [modelPredictCells, setModelPredictCells] = useState<CodeCell[]>([
    {
      id: "model-pred-md-0",
      type: "markdown",
      comment: "",
      codeText: "# 模型预测应用在线部署示例",
      isExecuted: true,
      isExecuting: false,
      executionCount: 0,
      outputMarkup: "markdown",
      outputText: ""
    },
    {
      id: "model-pred-1",
      type: "code",
      comment: "# 1. 加载模型预测环境",
      codeText: `# 1. 加载模型预测环境\n\nimport os\nimport json\nimport time\n\nMODEL_DIR = "/home/student1/workspace/model"\nAPP_FILE = "/home/student1/workspace/model_app.py"\n\nprint("当前沙箱目录：/home/student1/workspace")\nprint("模型目录：", MODEL_DIR)\nprint("图像分类模型：image_classifier.pkl")\nprint("目标检测模型：object_detector.pt")\nprint("模型预测环境加载完成")`,
      isExecuted: true,
      isExecuting: false,
      executionCount: 1,
      outputMarkup: "model-env",
      outputText: `当前沙箱目录：/home/student1/workspace\n模型目录：/home/student1/workspace/model\n图像分类模型：image_classifier.pkl\n目标检测模型：object_detector.pt\n模型预测环境加载完成`
    },
    {
      id: "model-pred-2",
      type: "code",
      comment: "# 2. 创建模型预测 Web 应用",
      codeText: `# 2. 创建模型预测 Web 应用\n\napp_code = """\nfrom flask import Flask, request, jsonify\n\napp = Flask(__name__)\n\n@app.route("/")\ndef index():\n    return "模型预测应用已启动"\n\n@app.route("/predict/classify", methods=["POST"])\ndef classify():\n    return jsonify({\n        "task": "图像分类",\n        "label": "猫",\n        "confidence": 0.96\n    })\n\n@app.route("/predict/detect", methods=["POST"])\ndef detect():\n    return jsonify({\n        "objects": [\n            {"name": "person", "confidence": 0.93, "box": [80, 60, 180, 260]},\n            {"name": "car", "confidence": 0.88, "box": [260, 130, 420, 250]}\n        ]\n    })\n"""\n\nwith open("model_app.py", "w", encoding="utf-8") as f:\n    f.write(app_code)\n\nprint("model_app.py 已生成")\nprint("预测接口：/predict/classify")\nprint("预测接口：/predict/detect")`,
      isExecuted: true,
      isExecuting: false,
      executionCount: 2,
      outputMarkup: "model-app-create",
      outputText: `model_app.py 已生成\n预测接口：/predict/classify\n预测接口：/predict/detect`
    },
    {
      id: "model-pred-3",
      type: "code",
      comment: "# 3. 在线部署模型预测应用",
      codeText: `# 3. 在线部署模型预测应用\n\nservice_info = {\n    "app_name": "模型预测应用",\n    "status": "running",\n    "host": "0.0.0.0",\n    "port": 7860,\n    "preview_url": "http://127.0.0.1:7860",\n    "support_tasks": ["图像分类", "目标检测"]\n}\n\nprint("正在启动模型预测应用...")\nprint("应用名称：", service_info["app_name"])\nprint("运行状态：", service_info["status"])\nprint("服务端口：", service_info["port"])\nprint("Web 预览地址：", service_info["preview_url"])\nprint("支持任务：图像分类、目标检测")\nprint("模型预测应用部署完成")`,
      isExecuted: true,
      isExecuting: false,
      executionCount: 3,
      outputMarkup: "model-app-deploy",
      outputText: `正在启动模型预测应用...\n应用名称：模型预测应用\n运行状态：running\n服务端口：7860\nWeb 预览地址：http://127.0.0.1:7860\n支持任务：图像分类、目标检测\n模型预测应用部署完成`
    },
    {
      id: "model-pred-4",
      type: "code",
      comment: "# 4. 图像分类预测 Web 展示",
      codeText: `# 4. 图像分类预测 Web 展示\n\ndemo_image = "demo_cat.jpg"\n\nclassification_result = {\n    "task": "图像分类",\n    "image": demo_image,\n    "label": "猫",\n    "confidence": 0.96,\n    "top3": [\n        ("猫", 0.96),\n        ("狗", 0.03),\n        ("兔子", 0.01)\n    ]\n}\n\nclassification_result`,
      isExecuted: true,
      isExecuting: false,
      executionCount: 4,
      outputMarkup: "model-classify",
      outputText: ""
    },
    {
      id: "model-pred-5",
      type: "code",
      comment: "# 5. 目标检测预测 Web 展示",
      codeText: `# 5. 目标检测预测 Web 展示\n\ndemo_image = "demo_road.jpg"\n\ndetection_result = {\n    "task": "目标检测",\n    "image": demo_image,\n    "objects": [\n        {"name": "person", "confidence": 0.93, "box": [80, 60, 180, 260]},\n        {"name": "car", "confidence": 0.88, "box": [260, 130, 420, 250]},\n        {"name": "traffic light", "confidence": 0.81, "box": [420, 40, 470, 120]}\n    ]\n}\n\ndetection_result`,
      isExecuted: true,
      isExecuting: false,
      executionCount: 5,
      outputMarkup: "model-detect",
      outputText: ""
    },
    {
      id: "model-pred-6",
      type: "code",
      comment: "# 6. 查看预测记录",
      codeText: `# 6. 查看预测记录\n\nprediction_records = [\n    {"time": "10:45:21", "task": "图像分类", "image": "demo_cat.jpg", "result": "猫", "confidence": "0.96"},\n    {"time": "10:45:31", "task": "目标检测", "image": "demo_road.jpg", "result": "person、car、traffic light", "confidence": "0.93 / 0.88 / 0.81"}\n]\n\nprediction_records`,
      isExecuted: true,
      isExecuting: false,
      executionCount: 6,
      outputMarkup: "model-records",
      outputText: ""
    }
  ]);

  // Notebook content for Tab 1: 平台预置模块.ipynb
  const [presetCells, setPresetCells] = useState<CodeCell[]>([
    {
      id: "pres-config-0",
      type: "code",
      comment: "# 规则参数配置",
      codeText: `analysis_config = {\n    "keyword": "智慧教育",\n    "min_score": 80,\n    "chart_type": "line",\n    "top_k": 5,\n    "fill_missing_value": 0\n}\n\nprint("当前规则参数：")\nfor key, value in analysis_config.items():\n    print(key, "=", value)`,
      isExecuted: true,
      isExecuting: false,
      executionCount: 1,
      outputMarkup: "config",
      outputText: ""
    },
    {
      id: "pres-1",
      type: "code",
      comment: "# 字符串数据处理模块示例",
      codeText: `text = " Hello World "\nprint(text.strip().replace("World", "Python").split())`,
      isExecuted: true,
      isExecuting: false,
      executionCount: 2,
      outputMarkup: "text",
      outputText: "['Hello', 'Python']"
    },
    {
      id: "pres-2",
      type: "code",
      comment: "# 数据整理模块示例",
      codeText: `import pandas as pd\n\ndata = {\n    "Name": ["Alice", "Bob"],\n    "Age": [25, 30]\n}\n\ndf = pd.DataFrame(data)\nprint(df["Age"].mean())`,
      isExecuted: true,
      isExecuting: false,
      executionCount: 3,
      outputMarkup: "text",
      outputText: "27.5"
    },
    {
      id: "pres-3",
      type: "code",
      comment: "# 图表可视化模块示例",
      codeText: `import matplotlib.pyplot as plt\n\nplt.plot([1, 2, 3], [2, 4, 1])\nplt.xlabel("X Label")\nplt.ylabel("Y Label")\nplt.show()`,
      isExecuted: true,
      isExecuting: false,
      executionCount: 4,
      outputMarkup: "chart",
      outputText: ""
    },
    {
      id: "pres-4",
      type: "code",
      comment: "# 自然语言分词模块示例",
      codeText: `import jieba\n\ntext = "这是一个句子。"\nseg_list = jieba.cut(text)\nprint("/".join(seg_list))`,
      isExecuted: false,
      isExecuting: false,
      executionCount: null,
      outputMarkup: "jieba",
      outputText: "这是/一个/句子/。"
    },
    {
      id: "pres-5",
      type: "code",
      comment: "# 数据请求模块示例",
      codeText: `# 导入 request 模块\nimport urllib.request\n\n# 导入 etree 子模块\nfrom lxml import etree\n\n# 定义用于拼接 url 被数字符串和请求头\nurl = "https://stock.finance.sina.com.cn/stock/go.php/vReport_List/kind/latest/index.phtml?p={page}"\n\nheaders = {\n    "User-Agent": "Mozilla/5.0 (Windows NT 15.0; Win64; x64) AppleWebKit/537.36"\n}\n\ndef request(page):\n    print("正在爬取第：" + str(page) + "页")\n    print("正在爬取：" + url.format(page=page))\n\nrequest(1)`,
      isExecuted: false,
      isExecuting: false,
      executionCount: null,
      outputMarkup: "json",
      outputText: ""
    },
    {
      id: "pres-filter-1",
      type: "code",
      comment: "# 参数化数据分析",
      codeText: `import pandas as pd\n\ndata = [\n    {"name": "张三", "score": 88, "text": "智慧教育平台训练"},\n    {"name": "李四", "score": 76, "text": "Python 数据分析"},\n    {"name": "王五", "score": 92, "text": "智慧教育实训"}\n]\n\ndf = pd.DataFrame(data)\nresult = df[df["score"] >= analysis_config["min_score"]]\n\nprint("筛选参数 min_score =", analysis_config["min_score"])\nprint("筛选结果：")\ndisplay(result)`,
      isExecuted: false,
      isExecuting: false,
      executionCount: null,
      outputMarkup: "filter",
      outputText: ""
    }
  ]);

  // Notebook content for Tab 3: pyecharts可视化组件.ipynb
  const [pyechartsCells, setPyechartsCells] = useState<CodeCell[]>([
    {
      id: "pye-md-0",
      type: "markdown",
      comment: "",
      codeText: `# pyecharts 数据可视化组件示例

平台已预置 pyecharts 数据可视化组件包，支持交互式图表、精细化样式配置、30+ 图表类型展示，以及 Grid、Page、Tab、Timeline 等组合图表报告设计。

本 Notebook 展示以下能力：
1. pyecharts 组件包导入验证；
2. 30+ 图表类型清单；
3. 基础折线图、柱状图、饼图；
4. 交互式图表配置；
5. 组合图表报告设计；
6. 多图表页面输出。`,
      isExecuted: true,
      isExecuting: false,
      executionCount: null,
      outputMarkup: "markdown"
    },
    {
      id: "pye-code-1",
      type: "code",
      comment: "# pyecharts 环境验证",
      codeText: `import pyecharts
from pyecharts.charts import Line, Bar, Pie, Scatter, Gauge, Funnel, Radar, HeatMap, WordCloud, Grid, Page, Tab, Timeline
from pyecharts import options as opts

print("pyecharts 已安装")
print("pyecharts version:", pyecharts.__version__)
print("可视化组件加载成功")`,
      isExecuted: true,
      isExecuting: false,
      executionCount: 1,
      outputMarkup: "text",
      outputText: `pyecharts 已安装\npyecharts version: 2.0.0\n可视化组件加载成功`
    },
    {
      id: "pye-md-2",
      type: "markdown",
      comment: "",
      codeText: `# pyecharts 支持的图表类型`,
      isExecuted: true,
      isExecuting: false,
      executionCount: null,
      outputMarkup: "pye-types-grid"
    },
    {
      id: "pye-code-3",
      type: "code",
      comment: "# 基础折线图示例",
      codeText: `from pyecharts.charts import Line
from pyecharts import options as opts

x_data = ["1月", "2月", "3月", "4月", "5月"]
y_data = [82, 88, 91, 86, 95]

line = (
    Line()
    .add_xaxis(x_data)
    .add_yaxis("成绩", y_data)
    .set_global_opts(
        title_opts=opts.TitleOpts(title="成绩变化趋势"),
        tooltip_opts=opts.TooltipOpts(trigger="axis"),
        datazoom_opts=[opts.DataZoomOpts()],
        toolbox_opts=opts.ToolboxOpts(is_show=True),
        legend_opts=opts.LegendOpts(is_show=True)
    )
)

line.render_notebook()`,
      isExecuted: true,
      isExecuting: false,
      executionCount: 2,
      outputMarkup: "pye-line"
    },
    {
      id: "pye-code-4",
      type: "code",
      comment: "# 柱状图与饼图示例",
      codeText: `from pyecharts.charts import Bar, Pie
from pyecharts import options as opts

courses = ["Python", "数据分析", "可视化", "爬虫", "机器学习"]
values = [120, 98, 86, 76, 64]

bar = (
    Bar()
    .add_xaxis(courses)
    .add_yaxis("学习人数", values)
    .set_global_opts(
        title_opts=opts.TitleOpts(title="课程学习人数"),
        tooltip_opts=opts.TooltipOpts(trigger="axis")
    )
)

pie = (
    Pie()
    .add("课程占比", [list(z) for z in zip(courses, values)])
    .set_global_opts(title_opts=opts.TitleOpts(title="课程学习占比"))
    .set_series_opts(label_opts=opts.LabelOpts(formatter="{b}: {d}%"))
)

bar.render_notebook()
pie.render_notebook()`,
      isExecuted: true,
      isExecuting: false,
      executionCount: 3,
      outputMarkup: "pye-bar-pie"
    },
    {
      id: "pye-code-5",
      type: "code",
      comment: "# 交互式图表配置示例",
      codeText: `from pyecharts.charts import Scatter
from pyecharts import options as opts

scatter = (
    Scatter()
    .add_xaxis([10, 20, 30, 40, 50])
    .add_yaxis("实验得分", [60, 72, 80, 88, 95])
    .set_global_opts(
        title_opts=opts.TitleOpts(title="实验得分分布"),
        tooltip_opts=opts.TooltipOpts(trigger="item"),
        visualmap_opts=opts.VisualMapOpts(type_="color", max_=100, min_=0),
        toolbox_opts=opts.ToolboxOpts(is_show=True),
        datazoom_opts=[opts.DataZoomOpts()]
    )
)

scatter.render_notebook()`,
      isExecuted: true,
      isExecuting: false,
      executionCount: 4,
      outputMarkup: "pye-scatter"
    },
    {
      id: "pye-code-6",
      type: "code",
      comment: "# 组合图表报告设计",
      codeText: `from pyecharts.charts import Line, Bar, Pie, Grid, Page
from pyecharts import options as opts

months = ["1月", "2月", "3月", "4月"]
score = [82, 88, 91, 95]
users = [120, 150, 180, 210]

line = (
    Line()
    .add_xaxis(months)
    .add_yaxis("平均成绩", score)
    .set_global_opts(title_opts=opts.TitleOpts(title="平均成绩趋势"))
)

bar = (
    Bar()
    .add_xaxis(months)
    .add_yaxis("学习人数", users)
    .set_global_opts(title_opts=opts.TitleOpts(title="学习人数统计"))
)

pie = (
    Pie()
    .add("课程占比", [["Python", 40], ["数据分析", 30], ["可视化", 20], ["爬虫", 10]])
    .set_global_opts(title_opts=opts.TitleOpts(title="课程占比"))
)

page = Page(layout=Page.SimplePageLayout)
page.add(line, bar, pie)
page.render_notebook()`,
      isExecuted: true,
      isExecuting: false,
      executionCount: 5,
      outputMarkup: "pye-combination"
    },
    {
      id: "pye-code-7",
      type: "code",
      comment: "# Tab 与 Timeline 组合图表示例",
      codeText: `# 用 Tab 页签切换不同的维度，用 Timeline 查看历史年度趋势\n# 展示内容包括：基础图表, 关系图表, 三维图表, 组合图表 和 时间轴 2023-2026`,
      isExecuted: true,
      isExecuting: false,
      executionCount: 6,
      outputMarkup: "pye-tab-timeline"
    }
  ]);

  // Notebook content for Tab 2: Xpath解析_爬取电商平台数据.ipynb
  const [xpathCells, setXpathCells] = useState<CodeCell[]>([
    {
      id: "xpath-1",
      type: "code",
      comment: "# Xpath模块定位电商数据示例",
      codeText: `from lxml import etree\nimport requests\n\nhtml_content = """\n<div class="goods-list">\n  <div class="item" price="199">智能洗手液机</div>\n  <div class="item" price="299">温湿度传感器套件</div>\n</div>\n"""\n\ntree = etree.HTML(html_content)\nprices = tree.xpath("//div[@class='item']/@price")\nnames = tree.xpath("//div[@class='item']/text()")\nfor name, price in zip(names, prices):\n    print(f"数据抓取 -> 商品: {name}, 售价: {price}元")`,
      isExecuted: false,
      isExecuting: false,
      executionCount: null,
      outputMarkup: "text",
      outputText: "数据抓取 -> 商品: 智能洗手液机, 售价: 199元\n数据抓取 -> 商品: 温湿度传感器套件, 售价: 299元"
    }
  ]);

  // Active cell selection in Notebook
  const [selectedCellId, setSelectedCellId] = useState<string>("pye-md-0");

  // --- ACTIONS ---

  const triggerToastMsg = (msg: string) => {
    setToastMessage(msg);
    showToast(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Run a single cell
  const handleRunCell = (cellId: string) => {
    if (activeTab === "model_predict") {
      setKernelStatus("Busy");
      setSavingStatus("Saving in progress...");
      setModelPredictCells((prev) => prev.map((c) => {
        if (c.id === cellId) {
          return { ...c, isExecuting: true };
        }
        return c;
      }));

      setTimeout(() => {
        let outVal = "";
        let outMarkup: any = "text";
        if (cellId === "model-pred-1") {
          outMarkup = "model-env";
          outVal = "当前沙箱目录：/home/student1/workspace\n模型目录：/home/student1/workspace/model\n图像分类模型：image_classifier.pkl\n目标检测模型：object_detector.pt\n模型预测环境加载完成";
        } else if (cellId === "model-pred-2") {
          outMarkup = "model-app-create";
          outVal = "model_app.py 已生成\n预测接口：/predict/classify\n预测接口：/predict/detect";
        } else if (cellId === "model-pred-3") {
          outMarkup = "model-app-deploy";
          outVal = "正在启动模型预测应用...\n应用名称：模型预测应用\n运行状态：running\n服务端口：7860\nWeb 预览地址：http://127.0.0.1:7860\n支持任务：图像分类、目标检测\n模型预测应用部署完成";
          setModelAppStatus("running");
          setWebPreviewVisible(true);
          const timeSecStr = new Date().toLocaleTimeString('zh-CN', { hour12: false });
          setPredictionLogs((prev) => [
            ...prev,
            `[${timeSecStr}] 正在启动模型预测应用`,
            `[${timeSecStr}] 加载图像分类模型 image_classifier.pkl`,
            `[${timeSecStr}] 加载目标检测模型 object_detector.pt`,
            `[${timeSecStr}] Flask app running on http://127.0.0.1:7860`,
            `[${timeSecStr}] Web 预览服务已就绪`
          ]);
        } else if (cellId === "model-pred-4") {
          outMarkup = "model-classify";
          outVal = "";
        } else if (cellId === "model-pred-5") {
          outMarkup = "model-detect";
          outVal = "";
        } else if (cellId === "model-pred-6") {
          outMarkup = "model-records";
          outVal = "";
        }

        setModelPredictCells((prev) => prev.map((c) => {
          if (c.id === cellId) {
            return { 
              ...c, 
              isExecuting: false, 
              isExecuted: true, 
              executionCount: 2 + (prev.filter(x => x.isExecuted).length % 5),
              outputMarkup: outMarkup,
              outputText: outVal
            };
          }
          return c;
        }));

        setKernelStatus("Idle");
        setSavingStatus("Saving completed");
        const timeSecStr = new Date().toLocaleTimeString('zh-CN', { hour12: false });
        
        setTrainingRecords((prev) => [
          {
            time: timeSecStr,
            account: "学生1",
            sandbox: "student1-python-sandbox",
            notebook: "模型预测应用部署.ipynb",
            operation: cellId === "model-pred-3" ? "启动服务" : "运行单元",
            result: cellId === "model-pred-3" ? "应用启动完成" : "执行成功",
            status: "成功"
          },
          ...prev
        ]);
        triggerToastMsg("代码单元执行成功，结果已写入当前沙箱。");
      }, 500);
      return;
    }

    if (activeTab === "imported_analysis") {
      setKernelStatus("Busy");
      setSavingStatus("Saving in progress...");
      setImportedCells((prev) => prev.map((c) => {
        if (c.id === cellId) {
          return { ...c, isExecuting: true };
        }
        return c;
      }));

      setTimeout(() => {
        const outVal = getDefaultOutputByCellId(cellId);
        setImportedCells((prev) => prev.map((c) => {
          if (c.id === cellId) {
            return { 
              ...c, 
              isExecuting: false, 
              isExecuted: true, 
              executionCount: 2 + (prev.filter(x => x.isExecuted).length % 5),
              outputText: outVal
            };
          }
          return c;
        }));
        setKernelStatus("Idle");
        setSavingStatus("Saving completed");
        const timeSecStr = new Date().toLocaleTimeString('zh-CN', { hour12: false });
        setTrainingRecords((prev) => [
          {
            time: timeSecStr,
            account: "学生1",
            sandbox: "student1-python-sandbox",
            notebook: "3. Python 数据类型-答案.ipynb",
            operation: "运行单元",
            result: `输出 ${outVal}`,
            status: "成功"
          },
          ...prev
        ]);
        triggerToastMsg("代码单元执行成功，结果已写入当前沙箱，请在输出区域查看。");
      }, 500);
      return;
    }

    setKernelStatus("Busy");
    setSavingStatus("Saving in progress...");
    // Identify target dataset
    const cellList = activeTab === "preset" ? presetCells : activeTab === "pyecharts" ? pyechartsCells : xpathCells;
    const cellSetter = activeTab === "preset" ? setPresetCells : activeTab === "pyecharts" ? setPyechartsCells : setXpathCells;

    cellSetter((prev) =>
      prev.map((cell) => {
        if (cell.id === cellId) {
          return { ...cell, isExecuting: true };
        }
        return cell;
      })
    );

    // Simulated 500ms runtime delay
    setTimeout(() => {
      let runName = "运行代码";
      const matchedCell = cellList.find(c => c.id === cellId);
      if (matchedCell) {
        if (matchedCell.comment.includes("字符串")) runName = "运行字符串处理";
        else if (matchedCell.comment.includes("数据整理")) runName = "运行数据整理";
        else if (matchedCell.comment.includes("可视化")) runName = "运行图表可视化";
        else if (matchedCell.comment.includes("分词")) runName = "运行自然语言分词";
        else if (matchedCell.comment.includes("数据请求")) runName = "运行数据请求";
        else if (matchedCell.comment.includes("参数配置")) runName = "运行规则参数配置";
        else if (matchedCell.comment.includes("参数化")) runName = "运行参数化过滤分析";
        else if (matchedCell.comment.includes("pyecharts 环境")) runName = "验证 pyecharts 环境";
        else if (matchedCell.comment.includes("折线图")) runName = "渲染基础折线图";
        else if (matchedCell.comment.includes("柱状图")) runName = "渲染柱状与饼图";
        else if (matchedCell.comment.includes("交互式")) runName = "配置交互式图表";
        else if (matchedCell.comment.includes("组合图表")) runName = "生成组合报告";
        else if (matchedCell.comment.includes("Tab")) runName = "渲染Tab时间轴组合";
      }

      setExecutionIndex((prevIdx) => {
        const nextExecCount = prevIdx + 1;
        cellSetter((prev) =>
          prev.map((cell) => {
            if (cell.id === cellId) {
              return {
                ...cell,
                isExecuting: false,
                isExecuted: true,
                executionCount: nextExecCount,
                outputText: getDefaultOutputByCellId(cell.id)
              };
            }
            return cell;
          })
        );
        return nextExecCount;
      });

      // Add chart run records if running under pyecharts
      const timeSecStr = new Date().toLocaleTimeString('zh-CN', { hour12: false });
      if (activeTab === "pyecharts" && matchedCell) {
        let chartTypeName = "Line 折线图";
        let interConfig = "tooltip、dataZoom、toolbox";
        let outResult = "已渲染";

        if (matchedCell.id === "pye-code-1") {
          chartTypeName = "环境验证";
          interConfig = "无";
          outResult = "组件加载成功";
        } else if (matchedCell.id === "pye-code-3") {
          chartTypeName = "Line 折线图";
          interConfig = "tooltip、dataZoom、toolbox";
        } else if (matchedCell.id === "pye-code-4") {
          chartTypeName = "Bar + Pie";
          interConfig = "legend、tooltip";
        } else if (matchedCell.id === "pye-code-5") {
          chartTypeName = "Scatter 散点图";
          interConfig = "visualMap、tooltip、dataZoom";
        } else if (matchedCell.id === "pye-code-6") {
          chartTypeName = "Page 组合报告";
          interConfig = "多图组合";
          outResult = "已生成报告";
        } else if (matchedCell.id === "pye-code-7") {
          chartTypeName = "Timeline 时间轴";
          interConfig = "时间轴交互";
        }

        setChartRunRecords(prev => [
          {
            time: timeSecStr,
            notebook: "pyecharts可视化组件.ipynb",
            chartType: chartTypeName,
            library: "pyecharts",
            interaction: interConfig,
            output: outResult,
            status: "成功"
          },
          ...prev
        ]);
      }

      // Add a dynamic training record instantly to demonstrate interactive log flow
      setTrainingRecords((prev) => [
        {
          time: timeSecStr,
          account: "学生1",
          sandbox: "student1-python-sandbox",
          notebook: activeTab === "preset" ? "平台预置模块.ipynb" :
                    activeTab === "pyecharts" ? "pyecharts可视化组件.ipynb" :
                    activeTab === "xpath" ? "Xpath解析_爬取电商平台数据.ipynb" : "3. Python 数据类型-答案.ipynb",
          operation: "运行单元",
          result: `运行成功 [Count=${executionIndex + 1}]`,
          status: "成功"
        },
        ...prev
      ]);

      setKernelStatus("Idle");
      setSavingStatus("Saving completed");
      triggerToastMsg("代码运行完成");
    }, 600);
  };

  // Run all cells sequentially
  const handleRunAll = () => {
    if (activeTab === "model_predict") {
      setKernelStatus("Busy");
      setSavingStatus("Saving in progress...");
      triggerToastMsg("正在按顺序启动模型预测与在线服务部署运行调度...");
      
      setModelPredictCells((prev) => prev.map((c) => {
        if (c.type === "code") {
          return { ...c, isExecuting: true };
        }
        return c;
      }));

      // Simulate sequential running execution
      setTimeout(() => {
        setModelPredictCells((prev) => prev.map((c) => {
          if (c.id === "model-pred-1") {
            return { 
              ...c, 
              isExecuting: false, 
              isExecuted: true, 
              executionCount: 1, 
              outputMarkup: "model-env",
              outputText: "当前沙箱目录：/home/student1/workspace\n模型目录：/home/student1/workspace/model\n图像分类模型：image_classifier.pkl\n目标检测模型：object_detector.pt\n模型预测环境加载完成"
            };
          }
          return c;
        }));
      }, 300);

      setTimeout(() => {
        setModelPredictCells((prev) => prev.map((c) => {
          if (c.id === "model-pred-2") {
            return { 
              ...c, 
              isExecuting: false, 
              isExecuted: true, 
              executionCount: 2, 
              outputMarkup: "model-app-create",
              outputText: "model_app.py 已生成\n预测接口：/predict/classify\n预测接口：/predict/detect"
            };
          }
          return c;
        }));
      }, 600);

      setTimeout(() => {
        setModelPredictCells((prev) => prev.map((c) => {
          if (c.id === "model-pred-3") {
            return { 
              ...c, 
              isExecuting: false, 
              isExecuted: true, 
              executionCount: 3, 
              outputMarkup: "model-app-deploy",
              outputText: "正在启动模型预测应用...\n应用名称：模型预测应用\n运行状态：running\n服务端口：7860\nWeb 预览地址：http://127.0.0.1:7860\n支持任务：图像分类、目标检测\n模型预测应用部署完成"
            };
          }
          return c;
        }));

        setModelAppStatus("running");
        setWebPreviewVisible(true);
        const timeSecStr = new Date().toLocaleTimeString('zh-CN', { hour12: false });
        
        setPredictionLogs((prev) => [
          ...prev,
          `[${timeSecStr}] 正在启动模型预测应用`,
          `[${timeSecStr}] 加载图像分类模型 image_classifier.pkl`,
          `[${timeSecStr}] 加载目标检测模型 object_detector.pt`,
          `[${timeSecStr}] Flask app running on http://127.0.0.1:7860`,
          `[${timeSecStr}] Web 预览服务已就绪`
        ]);
      }, 900);

      setTimeout(() => {
        setModelPredictCells((prev) => prev.map((c) => {
          if (c.id === "model-pred-4") {
            return { 
              ...c, 
              isExecuting: false, 
              isExecuted: true, 
              executionCount: 4, 
              outputMarkup: "model-classify",
              outputText: ""
            };
          }
          return c;
        }));
      }, 1200);

      setTimeout(() => {
        setModelPredictCells((prev) => prev.map((c) => {
          if (c.id === "model-pred-5") {
            return { 
              ...c, 
              isExecuting: false, 
              isExecuted: true, 
              executionCount: 5, 
              outputMarkup: "model-detect",
              outputText: ""
            };
          }
          return c;
        }));
      }, 1500);

      setTimeout(() => {
        setModelPredictCells((prev) => prev.map((c) => {
          if (c.id === "model-pred-6") {
            return { 
              ...c, 
              isExecuting: false, 
              isExecuted: true, 
              executionCount: 6, 
              outputMarkup: "model-records",
              outputText: ""
            };
          }
          return c;
        }));

        setKernelStatus("Idle");
        setSavingStatus("Saving completed");
        triggerToastMsg("一键运行通过：模型部署与实时预测效果分析执行完毕。");

        const timeSecStr = new Date().toLocaleTimeString('zh-CN', { hour12: false });
        setTrainingRecords((prev) => [
          {
            time: timeSecStr,
            account: "学生1",
            sandbox: "student1-python-sandbox",
            notebook: "模型预测应用部署.ipynb",
            operation: "一键部署",
            result: "在线服务加载完毕 (运行中)",
            status: "成功"
          },
          ...prev
        ]);
      }, 1800);
      return;
    }

    if (activeTab === "imported_analysis") {
      setKernelStatus("Busy");
      setSavingStatus("Saving in progress...");
      triggerToastMsg("启动 ipykernel 执行全部：正在按拓扑顺序调度 Python 代码运算...");
      
      setImportedCells((prev) => prev.map((c) => {
        if (c.type === "code") {
          return { ...c, isExecuting: true, isExecuted: false };
        }
        return c;
      }));

      // Simulate sequential running execution
      setTimeout(() => {
        setImportedCells((prev) => prev.map((c) => {
          if (c.id === "imp-code-1") return { ...c, isExecuting: false, isExecuted: true, executionCount: 1, outputText: "int" };
          return c;
        }));
      }, 400);

      setTimeout(() => {
        setImportedCells((prev) => prev.map((c) => {
          if (c.id === "imp-code-2") return { ...c, isExecuting: false, isExecuted: true, executionCount: 2, outputText: "str" };
          return c;
        }));
      }, 800);

      setTimeout(() => {
        setImportedCells((prev) => prev.map((c) => {
          if (c.id === "imp-code-3") return { ...c, isExecuting: false, isExecuted: true, executionCount: 3, outputText: "list" };
          return c;
        }));
      }, 1200);

      setTimeout(() => {
        setImportedCells((prev) => prev.map((c) => {
          if (c.id === "imp-code-4") return { ...c, isExecuting: false, isExecuted: true, executionCount: 4, outputText: "dict" };
          return c;
        }));
        
        setKernelStatus("Idle");
        setSavingStatus("Saving completed");
        triggerToastMsg("Notebook 运行完成！所有变量已保存，数据类型结构已执行。");

        const logTime = new Date().toTimeString().split(' ')[0];
        setTrainingRecords((prev) => [
          {
            time: logTime,
            account: "学生1",
            sandbox: "student1-python-sandbox",
            notebook: "3. Python 数据类型-答案.ipynb",
            operation: "运行全部",
            result: "批量执行所有单元正常输出",
            status: "成功"
          },
          ...prev
        ]);

        setImportExportRecords((prev) => [
          {
            key: `rec-run-${Date.now()}`,
            time: logTime,
            type: "执行 Notebook",
            name: "3. Python 数据类型-答案.ipynb",
            status: "由学生手动触发计算节点执行通过",
            cells: "Markdown: 1 | Code: 4",
            operator: "学生1"
          },
          ...prev
        ]);
      }, 1600);
      return;
    }

    setKernelStatus("Busy");
    setSavingStatus("Saving in progress...");
    triggerToastMsg("开始执行全部 Notebook 单元...");

    const cellList = activeTab === "preset" ? presetCells : activeTab === "pyecharts" ? pyechartsCells : xpathCells;
    const cellSetter = activeTab === "preset" ? setPresetCells : activeTab === "pyecharts" ? setPyechartsCells : setXpathCells;

    // We step through them with small delays
    cellList.forEach((cell, i) => {
      setTimeout(() => {
        cellSetter((prev) =>
          prev.map((c) => {
            if (c.id === cell.id) {
              return { ...c, isExecuting: true };
            }
            return c;
          })
        );
      }, i * 200);

      setTimeout(() => {
        setExecutionIndex((prevIdx) => {
          const nextExecCount = prevIdx + 1;
          cellSetter((prev) =>
            prev.map((c) => {
              if (c.id === cell.id) {
                return {
                  ...c,
                  isExecuting: false,
                  isExecuted: true,
                  executionCount: nextExecCount,
                  outputText: getDefaultOutputByCellId(c.id)
                };
              }
              return c;
            })
          );
          return nextExecCount;
        });

        // Add to chartRunRecords if applicable
        if (activeTab === "pyecharts") {
          const timeSecStr = new Date().toLocaleTimeString('zh-CN', { hour12: false });
          let chartTypeName = "Line 折线图";
          let interConfig = "tooltip、dataZoom、toolbox";
          let outResult = "已渲染";

          if (cell.id === "pye-code-1") {
            chartTypeName = "环境验证";
            interConfig = "无";
            outResult = "组件验证成功";
          } else if (cell.id === "pye-code-3") {
            chartTypeName = "Line 折线图";
            interConfig = "tooltip、dataZoom、toolbox";
          } else if (cell.id === "pye-code-4") {
            chartTypeName = "Bar + Pie";
            interConfig = "legend、tooltip";
          } else if (cell.id === "pye-code-5") {
            chartTypeName = "Scatter 散点图";
            interConfig = "visualMap、tooltip、dataZoom";
          } else if (cell.id === "pye-code-6") {
            chartTypeName = "Page 组合报告";
            interConfig = "多图组合";
            outResult = "已生成报告";
          } else if (cell.id === "pye-code-7") {
            chartTypeName = "Timeline 时间轴";
            interConfig = "时间轴交互";
          }

          if (cell.type === "code") {
            setChartRunRecords(prev => [
              {
                time: timeSecStr,
                notebook: "pyecharts可视化组件.ipynb",
                chartType: chartTypeName,
                library: "pyecharts",
                interaction: interConfig,
                output: outResult,
                status: "成功"
              },
              ...prev
            ]);
          }
        }

        if (i === cellList.length - 1) {
          // Add unified training log after running all
          const timeSecStr = new Date().toLocaleTimeString('zh-CN', { hour12: false });
          setTrainingRecords((prev) => [
            {
              time: timeSecStr,
              account: "学生1",
              sandbox: "student1-python-sandbox",
              notebook: activeTab === "preset" ? "平台预置模块.ipynb" :
                        activeTab === "pyecharts" ? "pyecharts可视化组件.ipynb" : "Xpath解析_爬取电商平台数据.ipynb",
              operation: "运行全部",
              result: activeTab === "preset" ? "输出 5 个结果" : `依次批处理了 ${cellList.length} 个算力单元并完成渲染`,
              status: "成功"
            },
            ...prev
          ]);

          setKernelStatus("Idle");
          setSavingStatus("Saving completed");
          triggerToastMsg("全部单元运行完成");
        }
      }, i * 200 + 170);
    });
  };

  // Stop running state
  const handleStop = () => {
    setKernelStatus("Idle");
    setSavingStatus("Saving completed");
    const cellSetter = 
      activeTab === "preset" ? setPresetCells : 
      activeTab === "pyecharts" ? setPyechartsCells : 
      activeTab === "imported_analysis" ? setImportedCells : 
      setXpathCells;
    cellSetter((prev) => prev.map((c) => ({ ...c, isExecuting: false })));
    triggerToastMsg("Jupyter 算力挂起，内核停止运行");
  };

  // Restart Kernel
  const handleRestartKernel = () => {
    setKernelStatus("Busy");
    setSavingStatus("Restarting kernel...");
    triggerToastMsg("正在重启 Jupyter (ipykernel) 内核...");
    
    // Clear counts
    const cellSetter = 
      activeTab === "preset" ? setPresetCells : 
      activeTab === "pyecharts" ? setPyechartsCells : 
      activeTab === "imported_analysis" ? setImportedCells : 
      setXpathCells;
    cellSetter((prev) => prev.map((c) => {
      if (c.type === "markdown") return c;
      return { ...c, isExecuted: false, executionCount: null };
    }));

    setTimeout(() => {
      setKernelStatus("Idle");
      setSavingStatus("Saving completed");
      triggerToastMsg("Jupyter 运行内核重启完成");
    }, 1000);
  };

  // Trigger Reset Confirm Modal
  const handleTriggerReset = () => {
    setResetConfirmVisible(true);
  };

  // Execute full Sandbox & parameter recovery
  const handleConfirmReset = () => {
    setResetConfirmVisible(false);
    setKernelStatus("Busy");
    setSavingStatus("Resetting configurations...");
    triggerToastMsg("正在重置独立沙箱环境...");

    setTimeout(() => {
      // 1. Clear unit output results, execution counts, outputs
      setPresetCells((prev) =>
        prev.map((c) => {
          if (c.type === "markdown") return c;
          return {
            ...c,
            isExecuted: false,
            isExecuting: false,
            executionCount: null,
            outputText: ""
          };
        })
      );
      setXpathCells((prev) =>
        prev.map((c) => {
          if (c.type === "markdown") return c;
          return {
            ...c,
            isExecuted: false,
            isExecuting: false,
            executionCount: null,
            outputText: ""
          };
        })
      );
      setPyechartsCells((prev) =>
        prev.map((c) => {
          if (c.type === "markdown") return c;
          return {
            ...c,
            isExecuted: false,
            isExecuting: false,
            executionCount: null,
            outputText: ""
          };
        })
      );
      setImportedCells((prev) =>
        prev.map((c) => {
          if (c.type === "markdown") return c;
          return {
            ...c,
            isExecuted: false,
            isExecuting: false,
            executionCount: null,
            outputText: ""
          };
        })
      );

      // 2. Clear execution indices
      setExecutionIndex(0);

      // 3. Restore parameters to default
      setAnalysisConfig({
        keyword: "智慧教育",
        min_score: 80,
        chart_type: "line",
        top_k: 5,
        fill_missing_value: 0
      });

      // 4. Update task conditions & status
      setTaskStatus("已重置");
      setResetStatus("reset_done");

      // 5. Build standard timestamp
      const resetTimeStr = new Date().toLocaleTimeString('zh-CN', { hour12: false });
      setLastResetTime(resetTimeStr);

      // 6. Append reset records log
      setResetRecords((prev) => [
        {
          time: resetTimeStr,
          account: "学生1",
          sandbox: "student1-python-sandbox",
          task: activeTab === "imported_analysis" ? "Python 数据类型训练" : "Python 数据分析训练",
          range: "输出结果、执行计数、临时变量",
          keep: activeTab === "imported_analysis" ? "3. Python 数据类型-答案.ipynb、sample.csv" : "个人 Notebook、上传文件、导出文件、工作目录文件",
          result: "成功",
          operator: "学生1"
        },
        ...prev
      ]);

      // 7. Append training log
      setTrainingRecords((prev) => [
        {
          time: resetTimeStr,
          account: "学生1",
          sandbox: "student1-python-sandbox",
          notebook: activeTab === "imported_analysis" ? "3. Python 数据类型-答案.ipynb" : "数据分析案例",
          operation: "任务重置",
          result: "输出清空，个人文件全部持久化保留",
          status: "成功"
        },
        ...prev
      ]);

      setKernelStatus("Idle");
      setSavingStatus("Saving completed");
      triggerToastMsg("任务重置完成，已恢复初始沙箱，个人文件已安全保留。");
    }, 800);
  };

  // Applies slider parameters from right sidebar manually
  const handleApplyParams = () => {
    const timeSecStr = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    setTrainingRecords((prev) => [
      {
        time: timeSecStr,
        account: "学生1",
        sandbox: "sandbox-student1-20260608",
        operation: "应用规则参数",
        param: `min_score=${analysisConfig.min_score}, keyword=${analysisConfig.keyword}`,
        result: "规则参数配置已应用更新",
        status: "成功"
      },
      ...prev
    ]);
    triggerToastMsg("规则参数配置已应用更新");
  };

  // Reverts sliders to standard defaults
  const handleRestoreParamsDefault = () => {
    setAnalysisConfig(defaultAnalysisConfig);
    const timeSecStr = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    setTrainingRecords((prev) => [
      {
        time: timeSecStr,
        account: "学生1",
        sandbox: "sandbox-student1-20260608",
        operation: "恢复默认参数",
        param: "min_score=80",
        result: "规则参数已恢复出厂设置",
        status: "成功"
      },
      ...prev
    ]);
    triggerToastMsg("规则参数已恢复默认设置");
  };

  // Mock Snipping / Screenshot
  const handleCaptureScreen = () => {
    setIsSnapping(true);
    triggerToastMsg("正在捕获 Jupyter 实验画面...");
    setTimeout(() => {
      setIsSnapping(false);
      const timeStr = new Date().toLocaleTimeString();
      const snapName = `Jupyter_实验截屏_${timeStr}.png`;
      setScreenshotList((prev) => [snapName, ...prev]);
      triggerToastMsg(`已截屏并自动归档：${snapName}`);
    }, 800);
  };

  // Save current files
  const handleSaveAndCommit = () => {
    setSavingStatus("Saving completed");
    const timeSecStr = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    setLastSavedTime(timeSecStr);
    setTrainingRecords((prev) => [
      {
        time: timeSecStr,
        account: "学生1",
        sandbox: "student1-python-sandbox",
        notebook: activeTab === "imported_analysis" ? "3. Python 数据类型-答案.ipynb" : "个人 Notebook",
        operation: "保存文件",
        result: "保存文件成功",
        status: "成功"
      },
      ...prev
    ]);
    triggerToastMsg("已保存至个人沙箱目录，文件状态：已持久化");
  };

  // Handle downloading ipynb file from the file list context menu
  const handleDownloadFile = (fileName: string) => {
    setContextMenu({ visible: false, x: 0, y: 0, fileName: null });
    triggerToastMsg(`开始准备打包 ipynb：内核数据编码封装中...`);
    
    setTimeout(() => {
      // Simulate real browser download!
      // Create a blob with dummy ipynb JSON metadata and trigger click
      const dummyIpynb = {
        cells: [
          {
            cell_type: "markdown",
            metadata: {},
            source: ["# " + fileName.replace(".ipynb", "")]
          }
        ],
        metadata: {
          kernelspec: {
            display_name: "Python 3 (ipykernel)",
            language: "python",
            name: "python3"
          }
        },
        nbformat: 4,
        nbformat_minor: 2
      };
      const blob = new Blob([JSON.stringify(dummyIpynb, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      triggerToastMsg(`🎉 成功导出离线文件：${fileName} 到本机物理存储设备`);

      // Add audit history log record
      const logTime = new Date().toTimeString().split(' ')[0];
      const newExportRecord = {
        key: `rec-export-${Date.now()}`,
        time: logTime,
        type: "导出文件",
        name: fileName,
        status: "已在本地下载至本机物理存储",
        cells: "Markdown: 1 | Code: 4",
        operator: "学生1"
      };
      setImportExportRecords(prev => [newExportRecord, ...prev]);
    }, 1200);
  };

  // Right-click context menu positioning handler
  const handleFileContextMenu = (e: React.MouseEvent, fileName: string) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      fileName: fileName
    });
  };

  // Add standard blank code unit
  const handleAddNewCell = () => {
    const newId = `custom-${Date.now()}`;
    const newCell: CodeCell = {
      id: newId,
      type: "code",
      comment: "# 新增自定义算力调试单元",
      codeText: `print("自定义测试输出")`,
      isExecuted: false,
      isExecuting: false,
      executionCount: null,
      outputMarkup: "text",
      outputText: "自定义测试输出"
    };

    if (activeTab === "preset") {
      setPresetCells((prev) => [...prev, newCell]);
    } else if (activeTab === "pyecharts") {
      setPyechartsCells((prev) => [...prev, newCell]);
    } else {
      setXpathCells((prev) => [...prev, newCell]);
    }
    setSelectedCellId(newId);
    triggerToastMsg("已新增一个空 Python 代码单元");
  };

  // Format Code syntax highlighting mock
  const renderHighlightedCode = (text: string, comment: string) => {
    return (
      <div className="font-mono text-[13px] leading-relaxed text-zinc-800 whitespace-pre-wrap select-text">
        <span className="text-[#3F7F5F] italic font-semibold">{comment}</span>
        {text && "\n"}
        {text.split("\n").map((line, idx) => {
          // simple highlighters for colors
          if (line.trim().startsWith("#")) {
            return <div key={idx} className="text-[#3F7F5F] italic">{line}</div>;
          }
          
          // syntax highlight words import, from, print, def, return
          const words = line.split(/(\s+)/);
          const renderedLine = words.map((w, wIdx) => {
            if (["import", "from", "def", "return", "for", "in", "print"].includes(w)) {
              return <span key={wIdx} className="text-[#1976d2] font-semibold">{w}</span>;
            }
            if (line.includes("\"") || line.includes("'")) {
              // Highlight text inside quotes roughly
              if ((w.startsWith("\"") && w.endsWith("\"")) || (w.startsWith("'") && w.endsWith("'"))) {
                return <span key={wIdx} className="text-[#008000]">{w}</span>;
              }
            }
            return <span key={wIdx}>{w}</span>;
          });

          return <div key={idx}>{renderedLine}</div>;
        })}
      </div>
    );
  };

  const [isAutoProgressing, setIsAutoProgressing] = useState(false);

  const handleAutoWalkthrough = () => {
    if (isAutoProgressing) return;
    setIsAutoProgressing(true);
    setVisualTrainLogs([]);
    addVisualTrainLog("====== 启动一键全自动边缘计算实验录屏链路展示 ======", "success");
    triggerToastMsg("🚀 全自动录屏演示链已开启，请稍加注视...");

    // 0. 到步骤 1
    setWorkflowStep(1);
    addVisualTrainLog("【步骤 1】正在初始化训练任务，模式：图像分类器构建...", "info");
    
    // 0.5s 加载模型
    setTimeout(() => {
      setTrainingTaskType("classify");
      setSelectedPretrainedModel("ResNet50");
      setModelFileLoaded(true);
      addVisualTrainLog("成功自平台预置库中拉取 PyTorch ResNet50.pth 预训练权重！", "success");
      setWorkflowCompletedMap(prev => ({ ...prev, task: true }));
    }, 1000);

    // 2s 到步骤 2 增强
    setTimeout(() => {
      setWorkflowStep(2);
      setPreprocessStatus("processing");
      addVisualTrainLog("【步骤 2】触发无监督色彩抖动、随机水平镜像旋转与异常白噪声图片过滤...", "info");
      
      let p = 0;
      const interval = setInterval(() => {
        p += 25;
        setPreprocessProgress(p);
        if (p >= 100) {
          clearInterval(interval);
          setPreprocessStatus("completed");
          setDatasetLoaded(true);
          addVisualTrainLog("数据清洗及中值增强完毕！共检测到异形标注 0 处，平衡并生成 400 张高清多维增强图像！", "success");
          setWorkflowCompletedMap(prev => ({ ...prev, preprocess: true }));
        }
      }, 200);
    }, 2000);

    // 3.5s 到步骤 3 生产
    setTimeout(() => {
      setWorkflowStep(3);
      setDataProductionStatus("processing");
      addVisualTrainLog("【步骤 3】对由于样本偏差（猫多狗少）引起的类别重度不均衡执行采样平衡处理...", "info");
      
      let p2 = 0;
      const interval = setInterval(() => {
        p2 += 25;
        setDataProductionProgress(p2);
        if (p2 >= 100) {
          clearInterval(interval);
          setDataProductionStatus("completed");
          addVisualTrainLog("成功将训练集、验证集与测试集完美按照 7:2:1 划分，并生成 COCO 标准 label_map.json！", "success");
          setWorkflowCompletedMap(prev => ({ ...prev, production: true }));
        }
      }, 200);
    }, 4500);

    // 5.5s 到步骤 4 超参配置
    setTimeout(() => {
      setWorkflowStep(4);
      addVisualTrainLog("【步骤 4】正在配置最优学习率、Batch等性能超参数 [Learning_rate: 0.001, Optimizer: Adam]...", "info");
      setTrainParamsApplied(true);
      addVisualTrainLog("已成功保存并下发超参数配置至工作目录：/work/visual_train/output/train_log.json", "success");
      setWorkflowCompletedMap(prev => ({ ...prev, config: true }));
    }, 6000);

    // 7s 到步骤 5 开始激发训练，狂刷 Epoch
    setTimeout(() => {
      setWorkflowStep(5);
      setTrainingStatus("training");
      addVisualTrainLog("【步骤 5】激发后台多卡分布式算力单元，加载最佳预训练模型开启可视化训练...", "info");
      
      let curEp = 0;
      const metricsArray: any[] = [];
      const interval = setInterval(() => {
        curEp += 1;
        setCurrentEpoch(curEp);
        setTrainingProgress(Math.floor((curEp / 20) * 100));

        // 损失暴跌，精度暴涨
        const trainLoss = parseFloat((2.1 * Math.pow(0.82, curEp) + 0.08).toFixed(3));
        const valLoss = parseFloat((2.3 * Math.pow(0.81, curEp) + 0.12).toFixed(3));
        const acc = parseFloat((15 + 83 * (1 - Math.pow(0.78, curEp))).toFixed(1));

        metricsArray.push({ epoch: curEp, train_loss: trainLoss, val_loss: valLoss, accuracy: acc });
        setTrainingMetrics([...metricsArray]);
        setActiveMetrics({ train_loss: trainLoss, val_loss: valLoss, accuracy: acc });
        
        addVisualTrainLog(`[PyTorch Epoch ${curEp}/20] - 耗时: 12ms - train_loss: ${trainLoss} - val_loss: ${valLoss} - accuracy: ${acc}%`, "info");

        if (curEp >= 20) {
          clearInterval(interval);
          setTrainingStatus("completed");
          addVisualTrainLog("模型训练收敛！已自动捕获并输出本地最优权重：best_model.pth [14.2 MB]", "success");
          setWorkflowCompletedMap(prev => ({ ...prev, train: true }));
        }
      }, 150);
    }, 7000);

    // 10.5s 模型交叉验证
    setTimeout(() => {
      setWorkflowStep(6);
      setValidationStatus("validating");
      addVisualTrainLog("【步骤 6】载入 10% 独立双向隔离验证集，进行离线混淆矩阵多维偏差校验...", "info");
      
      setTimeout(() => {
        setValidationStatus("completed");
        setValidationReportGenerated(true);
        addVisualTrainLog("交叉离线验证完成。混淆矩阵主对角线判定系数为 0.982。Top-1 精度: 98.2%，指标满足边缘端直接部署要求！", "success");
        setWorkflowCompletedMap(prev => ({ ...prev, validation: true }));
      }, 800);
    }, 11000);

    // 12.5s 端部署
    setTimeout(() => {
      setWorkflowStep(7);
      setEdgeConnectionStatus("connected");
      addVisualTrainLog("【步骤 7】检测到目标边缘测试计算终端已进入联机握手。正在构建轻量级 ONNX 推理底座...", "info");
      setModelDeployStatus("deploying");
      
      let dp = 0;
      const interval = setInterval(() => {
        dp += 20;
        setDeployProgress(dp);
        if (dp >= 100) {
          clearInterval(interval);
          setModelDeployStatus("completed");
          addVisualTrainLog("端侧 ONNX 固化压缩层转译就绪，模型顺利下发至边缘核心控制单元！端口映射监听：3000 -> 边缘终端设备", "success");
          setWorkflowCompletedMap(prev => ({ ...prev, deploy: true }));
        }
      }, 150);
    }, 12500);

    // 14.5s 传感器实时图片推理！
    setTimeout(() => {
      setWorkflowStep(8);
      addVisualTrainLog("【步骤 8】激发树莓派板载传感器流媒体输入，提取端侧实况画面...", "info");
      setEdgeInferenceStatus("inferencing");

      setTimeout(() => {
        setEdgeInferenceStatus("completed");
        setInferenceImage("edge_demo_cat.jpg");
        addVisualTrainLog("【实时端侧流画面检测成功】判定结果：tabby_cat [斑猫] 概率: 98.7%！本次完整零代码神经网络可视化实训圆满落幕！", "success");
        setWorkflowCompletedMap(prev => ({ ...prev, inference: true }));
        setIsAutoProgressing(false);
        triggerToastMsg("🎉 一键完整模型训练与端侧部署演示链路成功跑通！");
      }, 1000);
    }, 14500);
  };

  const executeSinglePreprocess = () => {
    if (preprocessStatus === "processing") return;
    setPreprocessStatus("processing");
    addVisualTrainLog("启动单步预处理增强自清洗服务...", "info");
    let p = 0;
    const t = setInterval(() => {
      p += 10;
      setPreprocessProgress(p);
      if (p >= 100) {
        clearInterval(t);
        setPreprocessStatus("completed");
        setDatasetLoaded(true);
        addVisualTrainLog("预处理运行完毕。输入集脏数据已过滤，全部切片打标签，图像均衡输出就绪。", "success");
        setWorkflowCompletedMap(prev => ({ ...prev, preprocess: true }));
        triggerToastMsg("✓ 预处理已一键执行完毕！");
      }
    }, 100);
  };

  const executeSingleProduction = () => {
    if (dataProductionStatus === "processing") return;
    setDataProductionStatus("processing");
    addVisualTrainLog("生产线程加载。计算高抗滑正负平衡样本切片...", "info");
    let p = 0;
    const t = setInterval(() => {
      p += 20;
      setDataProductionProgress(p);
      if (p >= 100) {
        clearInterval(t);
        setDataProductionStatus("completed");
        addVisualTrainLog("样本分类已成功。训练集: 70%, 验证集: 20%, 独立测试集: 10% 已生成并固化至沙箱中。", "success");
        setWorkflowCompletedMap(prev => ({ ...prev, production: true }));
        triggerToastMsg("✓ 数据集平衡切片完成！");
      }
    }, 100);
  };

  const handleApplyVisualTrainParams = () => {
    setTrainParamsApplied(true);
    addVisualTrainLog(`注入超参数设置成功！轮次: ${trainConfig.epoch}, 批次: ${trainConfig.batchSize}, 优化器: ${trainConfig.optimizer}`, "success");
    setWorkflowCompletedMap(prev => ({ ...prev, config: true }));
    triggerToastMsg("✓ 训练超参已注入引擎缓存！");
  };

  const executeSingleTrain = () => {
    if (trainingStatus === "training") return;
    setTrainingStatus("training");
    addVisualTrainLog("【单步训练激发】正在拉取 GPU 卡算力核心，运行多Epoch轮次收敛流程...", "info");
    
    let curEp = 0;
    const metricsArray: any[] = [];
    const maxEp = trainConfig.epoch;
    const isClassify = trainingTaskType === "classify";

    const t = setInterval(() => {
      curEp += 1;
      setCurrentEpoch(curEp);
      setTrainingProgress(Math.floor((curEp / maxEp) * 100));

      const decayFactor = isClassify ? 0.83 : 0.85;
      const trainLoss = parseFloat((1.9 * Math.pow(decayFactor, curEp) + 0.05).toFixed(3));
      const valLoss = parseFloat((2.1 * Math.pow(decayFactor, curEp) + 0.10).toFixed(3));
      const acc = parseFloat((12 + 86 * (1 - Math.pow(0.79, curEp))).toFixed(1));

      metricsArray.push({ epoch: curEp, train_loss: trainLoss, val_loss: valLoss, accuracy: acc, mAP: acc });
      setTrainingMetrics([...metricsArray]);
      setActiveMetrics({ train_loss: trainLoss, val_loss: valLoss, accuracy: acc, mAP: acc });

      addVisualTrainLog(`[PyTorch-Train] Epoch ${curEp}/${maxEp} - LOSS: ${trainLoss} - ACCURACY/mAP: ${acc}%`, "info");

      if (curEp >= maxEp) {
        clearInterval(t);
        setTrainingStatus("completed");
        addVisualTrainLog("全通道轮次提前收敛！最优性能模型 best_model.pth、best_model.onnx 写入 output/ 目录成功！", "success");
        setWorkflowCompletedMap(prev => ({ ...prev, train: true }));
        triggerToastMsg("✓ 模型构建训练完成！权重已转译固化。");
      }
    }, 120);
  };

  const executeSingleValidation = () => {
    if (validationStatus === "validating") return;
    setValidationStatus("validating");
    addVisualTrainLog("载入独立校验子集进行离线交叉性能测试...", "info");
    setTimeout(() => {
      setValidationStatus("completed");
      setValidationReportGenerated(true);
      addVisualTrainLog("验证完成。分类精度/检测精确 mAP 确证为 98.2%。Top-5 准确率为 99.8%。权重符合端侧部署门槛。", "success");
      setWorkflowCompletedMap(prev => ({ ...prev, validation: true }));
      triggerToastMsg("✓ 交叉安全验证通过！");
    }, 800);
  };

  const executeSingleDeploy = () => {
    if (modelDeployStatus === "deploying") return;
    setEdgeConnectionStatus("connected");
    setModelDeployStatus("deploying");
    addVisualTrainLog("开始连接边缘微处理器硬件，传输 ONNX 嵌入式模型算子...", "info");
    
    let dp = 0;
    const t = setInterval(() => {
      dp += 20;
      setDeployProgress(dp);
      if (dp >= 100) {
        clearInterval(t);
        setModelDeployStatus("completed");
        addVisualTrainLog("ONNX 算子交叉翻译自适应免编译成功！模型平滑嵌入端侧。服务就绪。", "success");
        setWorkflowCompletedMap(prev => ({ ...prev, deploy: true }));
        triggerToastMsg("✓ 边缘计算核心部署成功！");
      }
    }, 120);
  };

  const handleRunInference = () => {
    if (edgeInferenceStatus === "inferencing") return;
    setEdgeInferenceStatus("inferencing");
    addVisualTrainLog("端侧流媒体帧获取中，启动硬件 AI 芯片进行实况推理判定...", "info");
    setTimeout(() => {
      setEdgeInferenceStatus("completed");
      setWorkflowCompletedMap(prev => ({ ...prev, inference: true }));
      addVisualTrainLog("端侧推理完成！识别图像符合分类精度，已回传目标边界框和置信概率曲线。", "success");
      triggerToastMsg("✓ 传感器流回传感推理完毕！");
    }, 700);
  };

  const renderVisualTrainTool = () => {
    return (
      <div className="flex flex-col gap-5 text-zinc-900 bg-[#fafafa] p-4.5 rounded-xl border border-zinc-200 shadow-sm font-sans" id="visual_train_container">
        
        {/* Banner header inside control room */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-900 to-indigo-700 rounded-lg text-white shadow-3xs relative overflow-hidden" id="visual_train_banner">
          <div className="z-10 space-y-1">
            <h1 className="text-lg font-black tracking-tight" id="visual_train_title">
              ★ 零代码可视化分类/检测模型训练与边缘端推理实训系统
            </h1>
            <p className="text-[11px] text-indigo-200" id="visual_train_desc">
              本工具针对深度神经网络结构，提供无代码可视化构建方案。支持学生交互式配制、增强、生成、在线多轨曲线诊断，并直接SSH下发部署到底座硬件中
            </p>
          </div>
          <div className="flex items-center gap-3 z-10" id="visual_train_actions">
            <button
              onClick={handleAutoWalkthrough}
              disabled={isAutoProgressing}
              className={`px-4 py-2 text-xs font-black rounded-lg shadow-sm transition flex items-center gap-2 border cursor-pointer ${
                isAutoProgressing
                  ? "bg-zinc-800/80 border-zinc-700 text-zinc-400 cursor-not-allowed"
                  : "bg-amber-500 hover:bg-amber-400 text-zinc-950 border-amber-600 animate-bounce"
              }`}
            >
              <Activity className="w-3.8 h-3.8 text-zinc-950 animate-pulse" />
              <span>一键自动演示完整实验链路 (Auto Track)</span>
            </button>
            <button
              onClick={() => {
                setWorkflowStep(1);
                setWorkflowCompletedMap({
                  task: false, preprocess: false, production: false, config: false, train: false, validation: false, deploy: false, inference: false
                });
                setVisualTrainLogs([{ time: "刚刚", text: "实训平台初始化完成，等待开启零代码实训操作...", type: "info" }]);
                setModelFileLoaded(false);
                setDatasetLoaded(false);
                setPreprocessStatus("idle");
                setDataProductionStatus("idle");
                setTrainingStatus("idle");
                setTrainingMetrics([]);
                setValidationReportGenerated(false);
                setValidationStatus("idle");
                setModelDeployStatus("idle");
                setEdgeInferenceStatus("idle");
                triggerToastMsg("🔄 已将该实训场景全量重置");
              }}
              className="px-3 py-2 bg-indigo-800 hover:bg-indigo-700 border border-indigo-600 rounded-lg text-[11px] font-bold text-white shadow-sm flex items-center gap-1 cursor-pointer"
              title="重置全部训练场景和状态"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>实验重置</span>
            </button>
          </div>
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_14px]" />
        </div>

        {/* Multi-column complex workspace wrapper */}
        <div className="grid grid-cols-12 gap-5" id="visual_train_workspace">
          
          {/* COLUMN 1: Workflow Steps Progress Rail (Col span 3) */}
          <div className="col-span-3 flex flex-col gap-2.5 bg-white p-3.5 rounded-lg border border-zinc-200 shadow-3xs" id="visual_train_steps_rail">
            <h2 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5" />
              工作流程步骤控制
            </h2>
            <div className="space-y-2 flex-1 overflow-y-auto max-h-[500px] pr-1" id="visual_train_step_cards">
              {[
                { s: 1, title: "1. 任务模式与模型拉取", desc: "进行分类或识别配置载入" },
                { s: 2, title: "2. 数据载入与异常增强", desc: "镜像/旋转/增强自均值化" },
                { s: 3, title: "3. 混合平衡样本生成", desc: "类目切块划分 (7:2:1)" },
                { s: 4, title: "4. 超参数阻力调整", desc: "最设学习率与优化引擎" },
                { s: 5, title: "5. 激发边缘多Epoch训练", desc: "动态查看下降与精确收敛" },
                { s: 6, title: "6. 模型离线验证判定", desc: "混淆矩阵与PR偏差校验" },
                { s: 7, title: "7. 部署免编程计算终端", desc: "握手SSHD并推送固件包" },
                { s: 8, title: "8. 板端传感器推理实测", desc: "回传检测框并提取存证" }
              ].map((stepObj) => {
                const isActive = workflowStep === stepObj.s;
                const isCompleted = workflowCompletedMap[
                  stepObj.s === 1 ? "task" : 
                  stepObj.s === 2 ? "preprocess" : 
                  stepObj.s === 3 ? "production" : 
                  stepObj.s === 4 ? "config" : 
                  stepObj.s === 5 ? "train" : 
                  stepObj.s === 6 ? "validation" : 
                  stepObj.s === 7 ? "deploy" : "inference"
                ];

                return (
                  <button
                    key={stepObj.s}
                    onClick={() => {
                      if (!isAutoProgressing) {
                        setWorkflowStep(stepObj.s);
                        addVisualTrainLog(`主动切换运行视图到第 ${stepObj.s} 阶段：${stepObj.title}`, "info");
                      }
                    }}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs flex gap-2.5 transition-all relative overflow-hidden items-center ${
                      isActive
                        ? "bg-indigo-50 border-indigo-300 ring-1 ring-indigo-200 text-indigo-950 font-semibold"
                        : isCompleted
                        ? "bg-emerald-50/50 border-emerald-200 text-emerald-800"
                        : "bg-zinc-50 hover:bg-zinc-100 border-zinc-150 text-zinc-500"
                    }`}
                  >
                    {/* Tick or indicator marker */}
                    <div className="flex-shrink-0 mt-0.5">
                      {isCompleted ? (
                        <CheckCircle className="w-4.5 h-4.5 text-emerald-600 fill-emerald-100" />
                      ) : (
                        <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center text-[10.5px] font-bold ${
                          isActive ? "border-indigo-600 bg-indigo-600 text-white" : "border-zinc-300 text-zinc-500 bg-white"
                        }`}>
                          {stepObj.s}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className={`truncate text-[11.5px] ${isActive ? "text-indigo-950 font-bold" : "text-zinc-700"}`}>
                        {stepObj.title}
                      </p>
                      <p className="text-[10px] text-zinc-400 font-normal truncate mt-0.5">{stepObj.desc}</p>
                    </div>

                    {isActive && (
                      <div className="absolute right-1 text-indigo-500 animate-pulse">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            
            <div className="border-t pt-2.5 text-[10.5px] text-zinc-400 space-y-1">
              <div className="flex justify-between">
                <span>实训运行度</span>
                <span className="font-extrabold text-indigo-800">
                  {Object.values(workflowCompletedMap).filter(Boolean).length} / 8 指标已就绪
                </span>
              </div>
              <div className="w-full bg-zinc-100 h-1 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full transition-all duration-300"
                  style={{ width: `${(Object.values(workflowCompletedMap).filter(Boolean).length / 8) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* COLUMN 2: Workspace Config and Visualization (Col span 6) */}
          <div className="col-span-6 flex flex-col gap-4 bg-white p-4.5 rounded-lg border border-zinc-200 shadow-3xs min-h-[500px]" id="visual_train_central_canvas">
            
            {/* Step 1 Component View */}
            {workflowStep === 1 && (
              <div className="space-y-4 shadow-3xs" id="visual_step1_container">
                <div className="border-b pb-2 flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-zinc-900 flex items-center gap-1.5">
                    <Layers className="w-4.5 h-4.5 text-indigo-600" />
                    第 1 步：深度计算任务模式与预训练网络选择
                  </h3>
                  <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                    PyTorch Core
                  </span>
                </div>
                
                <div className="bg-zinc-50 p-3 rounded-lg space-y-3">
                  <p className="text-xs text-zinc-500 font-medium">请第一步选择您想构建的模型类型体系：</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setTrainingTaskType("classify")}
                      disabled={isAutoProgressing}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        trainingTaskType === "classify"
                          ? "border-indigo-600 bg-white ring-2 ring-indigo-50 text-zinc-900 shadow-sm"
                          : "border-zinc-200 bg-zinc-50 hover:bg-zinc-100/50 text-zinc-500"
                      }`}
                    >
                      <div className="font-black text-xs">图像分类 (Image Classification)</div>
                      <div className="text-[10px] text-zinc-400 mt-1">适用于给一整张图片分类判定（如分辨输入是猫、狗或鸟类等）</div>
                    </button>
                    <button
                      onClick={() => setTrainingTaskType("detect")}
                      disabled={isAutoProgressing}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        trainingTaskType === "detect"
                          ? "border-indigo-600 bg-white ring-2 ring-indigo-50 text-zinc-900 shadow-sm"
                          : "border-zinc-200 bg-zinc-50 hover:bg-zinc-100/50 text-zinc-500"
                      }`}
                    >
                      <div className="font-black text-xs">目标检测与识别 (Object Detection)</div>
                      <div className="text-[10px] text-zinc-400 mt-1">检测识别定位图片内的具体个体并画出矩形标注边框</div>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-700 block">选择适配的骨干预训练网络 (Pre-trained Backbones)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {trainingTaskType === "classify" ? (
                      ["ResNet50", "MobileNetV3", "SqueezeNet"].map((m) => (
                        <button
                          key={m}
                          onClick={() => setSelectedPretrainedModel(m)}
                          disabled={isAutoProgressing}
                          className={`p-2 rounded text-xs transition border font-bold ${
                            selectedPretrainedModel === m
                              ? "bg-indigo-600 text-white border-indigo-700"
                              : "bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-700"
                          }`}
                        >
                          {m}
                        </button>
                      ))
                    ) : (
                      ["YOLOv5s", "YOLOv8n", "Faster-RCNN"].map((m) => (
                        <button
                          key={m}
                          onClick={() => setSelectedPretrainedModel(m)}
                          disabled={isAutoProgressing}
                          className={`p-2 rounded text-xs transition border font-bold ${
                            selectedPretrainedModel === m
                              ? "bg-indigo-600 text-white border-indigo-700"
                              : "bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-700"
                          }`}
                        >
                          {m}
                        </button>
                      ))
                    )}
                  </div>
                </div>

                <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 flex items-start gap-2.5">
                  <HelpCircle className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                  <div className="text-[10.5px] text-indigo-800 leading-normal">
                    模型预测时所依托的预训练权重，可大大加速网络收敛。
                    加载后模型权重放置在：<code className="bg-white/80 font-mono text-[9px] px-1 font-extrabold text-indigo-900 rounded">/work/visual_train/pretrained/{selectedPretrainedModel.toLowerCase()}.pth</code>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setModelFileLoaded(true);
                      addVisualTrainLog(`预训练模型框架 ${selectedPretrainedModel} 载入成功！环境准备就绪。`, "success");
                      setWorkflowCompletedMap(prev => ({ ...prev, task: true }));
                      triggerToastMsg("✓ 预训练模型已成功载入！");
                    }}
                    disabled={modelFileLoaded || isAutoProgressing}
                    className={`w-full py-2.5 rounded-lg text-xs font-black shadow-sm flex items-center justify-center gap-1.5 cursor-pointer ${
                      modelFileLoaded
                        ? "bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed"
                        : "bg-indigo-600 text-white hover:bg-indigo-500 border border-indigo-700"
                    }`}
                  >
                    <Download className="w-4 h-4" />
                    <span>{modelFileLoaded ? "预训练权重已部署及挂载" : "一键拉取并部署预训练参数模型"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 Component View */}
            {workflowStep === 2 && (
              <div className="space-y-4" id="visual_step2_container">
                <div className="border-b pb-2 flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-zinc-900 flex items-center gap-1.5">
                    <Database className="w-4.5 h-4.5 text-indigo-600" />
                    第 2 步：外部标注数据载入 与 无监督预处理增强
                  </h3>
                  <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded">
                    Data Augmentation
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-zinc-50 p-3.5 rounded-xl border border-zinc-150">
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold text-zinc-500 uppercase">清洗预备选项 (Options)</p>
                    <div className="space-y-1.5 bg-white p-2.5 rounded border border-zinc-200">
                      {[
                        { k: "anomalyClean", t: "清除异形比例/异常白噪声图" },
                        { k: "duplicateDetect", t: "相似灰度图片去重去影 (Dedupe)" },
                        { k: "randomFlip", t: "启用随机镜像反转 (Horizontal Flip)" },
                        { k: "randomRotate", t: "启用 15° 视角随机几何微旋转" }
                      ].map((item) => (
                        <label key={item.k} className="flex items-center gap-2 text-[10.5px] font-bold text-zinc-650 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(preprocessConfig as any)[item.k]}
                            onChange={(e) => {
                              setPreprocessConfig(prev => ({ ...prev, [item.k]: e.target.checked }));
                            }}
                            className="rounded border-zinc-300 text-indigo-650 focus:ring-indigo-500"
                          />
                          <span>{item.t}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col justify-between">
                    <div className="space-y-1">
                      <p className="text-[11px] font-black text-zinc-500 uppercase">源数据集状态</p>
                      <div className="p-2 border rounded bg-white text-[10px] space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-zinc-500">已标注待入库:</span>
                          <span className="font-extrabold text-indigo-805">40张原始图像</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">数据集映射:</span>
                          <span className="font-extrabold text-zinc-700">
                            {trainingTaskType === "classify" ? "cat/dog 双目标分类" : "单通道障碍物标定 (.json)"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={executeSinglePreprocess}
                      disabled={preprocessStatus === "processing" || isAutoProgressing}
                      className="w-full py-2 bg-indigo-650 hover:bg-indigo-600 text-white font-black text-xs rounded transition flex items-center justify-center gap-1.5 shadow-sm border border-indigo-700 cursor-pointer"
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>{preprocessStatus === "completed" ? "重跑无监督数据预处理" : "立刻激活数据预处理增强"}</span>
                    </button>
                  </div>
                </div>

                {preprocessProgress > 0 && (
                  <div className="space-y-2 bg-zinc-50 p-3 rounded-lg border border-zinc-150">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-zinc-700">正在清洗并旋转训练几何体...</span>
                      <span className="text-indigo-700">{preprocessProgress}%</span>
                    </div>
                    <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full transition-all" style={{ width: `${preprocessProgress}%` }} />
                    </div>
                  </div>
                )}

                {/* Highly intuitive visual representation of augmented images */}
                {datasetLoaded && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-zinc-700">增强矩阵快照预览 (Augmented Batch Microviews):</p>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { title: "[RandomFlip]", sub: "水平高仿翻转", bg: "from-indigo-100 to-indigo-50", text: "🐱 增强一" },
                        { title: "[Rotate15]", sub: "旋转15度增强", bg: "from-amber-100 to-amber-50", text: "🔲 增强二" },
                        { title: "[ColorJitter]", sub: "饱和度深度裁剪", bg: "from-emerald-100 to-emerald-50", text: "🐱 增强三" },
                        { title: "[Cleaned]", sub: "缩微特征提取项", bg: "from-purple-100 to-purple-50", text: "🔲 增强四" }
                      ].map((card, idx) => (
                        <div key={idx} className={`p-2.5 rounded border border-zinc-200 bg-gradient-to-br ${card.bg} text-center space-y-1 shadow-3xs`}>
                          <div className="text-[10px] font-black text-zinc-700 truncate">{card.title}</div>
                          <div className="text-[12px] font-bold text-zinc-800">{card.text}</div>
                          <div className="text-[8px] font-normal text-zinc-400 font-mono truncate">{card.sub}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3 Component View */}
            {workflowStep === 3 && (
              <div className="space-y-4" id="visual_step3_container">
                <div className="border-b pb-2 flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-zinc-900 flex items-center gap-1.5">
                    <Sparkles className="w-4.5 h-4.5 text-indigo-600" />
                    第 3 步：数据自动生产 与 黄金样本分割 (7:2:1)
                  </h3>
                  <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
                    Train/Val Split
                  </span>
                </div>

                <div className="space-y-3 p-3 bg-zinc-50 rounded-xl border">
                  <p className="text-xs text-zinc-600 font-medium leading-relaxed">
                    为避免模型在单一类目过度拟合或遭遇“类别偏重（猫分类图400张，狗仅有数十张的冷启动陷阱）”，
                    本步骤会自动执行<b>少数样本加权采样(Over-sampling)</b>并自动在沙箱中解构训练集(70%)、验证集(20%)与不公开的校验集(10%)。
                  </p>
                  
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-white p-2.5 rounded border border-zinc-200">
                      <div className="text-[10px] font-bold text-zinc-400">训练集 (Train Set)</div>
                      <div className="text-base font-black text-indigo-700">280 张 (70%)</div>
                    </div>
                    <div className="bg-white p-2.5 rounded border border-zinc-200">
                      <div className="text-[10px] font-bold text-zinc-400">验证集 (Val Set)</div>
                      <div className="text-base font-black text-amber-600">80 张 (20%)</div>
                    </div>
                    <div className="bg-white p-2.5 rounded border border-zinc-200">
                      <div className="text-[10px] font-bold text-zinc-400">独立测试 (Test Set)</div>
                      <div className="text-base font-black text-emerald-600">40 张 (10%)</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-700">生成标注描述图纸文件</label>
                  <div className="grid grid-cols-2 gap-2 text-[10.5px] font-bold text-zinc-600">
                    <label className="flex items-center gap-2 bg-white p-2 border rounded border-zinc-200">
                      <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
                      <span>生成 label_map.json</span>
                    </label>
                    <label className="flex items-center gap-2 bg-white p-2 border rounded border-zinc-200">
                      <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
                      <span>生成 annotation_coco.json</span>
                    </label>
                  </div>
                </div>

                {dataProductionProgress > 0 && (
                  <div className="space-y-1.5 p-2 bg-zinc-50 border rounded text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-650">模型映射生成器...</span>
                      <span className="font-extrabold text-emerald-650">{dataProductionProgress}%</span>
                    </div>
                    <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full transition-all" style={{ width: `${dataProductionProgress}%` }} />
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    onClick={executeSingleProduction}
                    disabled={dataProductionStatus === "processing" || isAutoProgressing}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 border border-emerald-700 text-white font-black text-xs rounded-lg shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Sliders className="w-4 h-4" />
                    <span>执行样本自动配重生成</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 4 Component View */}
            {workflowStep === 4 && (
              <div className="space-y-4 shadow-3xs" id="visual_step4_container">
                <div className="border-b pb-2 flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-zinc-900 flex items-center gap-1.5">
                    <Settings className="w-4.5 h-4.5 text-indigo-600" />
                    第 4 步：核心深度模型超参数阻力调整
                  </h3>
                  <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                    Hyperparameters
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4" id="visual_step4_param_inputs">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-zinc-500 uppercase block">训练轮次 (Epochs)</label>
                    <select
                      value={trainConfig.epoch}
                      onChange={(e) => setTrainConfig(prev => ({ ...prev, epoch: parseInt(e.target.value) }))}
                      disabled={isAutoProgressing}
                      className="w-full p-2 border border-zinc-250 bg-white rounded text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                    >
                      <option value="10">10 轮 (快速验证测试)</option>
                      <option value="20">20 轮 (建议标准实训)</option>
                      <option value="30">30 轮 (重度高精密训练)</option>
                      <option value="50">50 轮</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-zinc-500 uppercase block">优化引擎 (Optimizer)</label>
                    <select
                      value={trainConfig.optimizer}
                      onChange={(e) => setTrainConfig(prev => ({ ...prev, optimizer: e.target.value }))}
                      disabled={isAutoProgressing}
                      className="w-full p-2 border border-zinc-250 bg-white rounded text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                    >
                      <option value="Adam">Adam (自适应收敛加速器)</option>
                      <option value="SGD">SGD (经典梯度下降引擎)</option>
                      <option value="AdamW">AdamW (精准权重修正器)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-zinc-500 uppercase block">初始学习速度 (Learning Rate)</label>
                    <select
                      value={trainConfig.lr.toString()}
                      onChange={(e) => setTrainConfig(prev => ({ ...prev, lr: parseFloat(e.target.value) }))}
                      disabled={isAutoProgressing}
                      className="w-full p-2 border border-zinc-250 bg-white rounded text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                    >
                      <option value="0.01">0.01 (高学习速度，易发震荡)</option>
                      <option value="0.001">0.001 (推荐金牌比例学习率)</option>
                      <option value="0.0001">0.0001 (超弱修复，防震荡)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-zinc-500 uppercase block">每批次样本阻抗 (Batch Size)</label>
                    <select
                      value={trainConfig.batchSize}
                      onChange={(e) => setTrainConfig(prev => ({ ...prev, batchSize: parseInt(e.target.value) }))}
                      disabled={isAutoProgressing}
                      className="w-full p-2 border border-zinc-250 bg-white rounded text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                    >
                      <option value="8">8 张样本/批</option>
                      <option value="16">16 张样本/批</option>
                      <option value="32">32 张样本/批</option>
                    </select>
                  </div>
                </div>

                <div className="bg-zinc-50 p-3 rounded border border-zinc-150 space-y-2">
                  <div className="text-[11px] font-bold text-zinc-700 uppercase">边缘挂载平台物理适配器选项</div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-zinc-500">
                    <label className="flex items-center gap-1.5 bg-white p-1.5 border rounded">
                      <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
                      <span>早停安全机制 (EarlyStop)</span>
                    </label>
                    <label className="flex items-center gap-1.5 bg-white p-1.5 border rounded">
                      <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
                      <span>导出双制式 (.pth & .onnx)</span>
                    </label>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleApplyVisualTrainParams}
                    disabled={isAutoProgressing}
                    className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-600 border border-indigo-700 text-white font-black text-xs rounded-lg shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>保存并注入超参数到本地容器</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 5 Component View */}
            {workflowStep === 5 && (
              <div className="space-y-4" id="visual_step5_container">
                <div className="border-b pb-2 flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-zinc-900 flex items-center gap-1.5">
                    <Activity className="w-4.5 h-4.5 text-indigo-600 animate-pulse" />
                    第 5 步：在线激发机器学习模型可视化训练 (实时损失与精确度/mAP双轴图看板)
                  </h3>
                  <span className="text-[10px] font-mono font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded animate-pulse">
                    Live Loss & Accuracy Plotting
                  </span>
                </div>

                {/* Training status bars top */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#FFF8F8] p-2.5 rounded-lg border border-red-100 text-center">
                    <div className="text-[10px] font-bold text-red-400">目前损失值 (Train Loss)</div>
                    <div className="text-lg font-black text-red-600 font-mono">
                      {trainingStatus === "idle" ? "等待中" : activeMetrics.train_loss.toFixed(3)}
                    </div>
                  </div>
                  <div className="bg-[#FAFFF9] p-2.5 rounded-lg border border-emerald-100 text-center">
                    <div className="text-[10px] font-bold text-emerald-500 uppercase">
                      {trainingTaskType === "classify" ? "评估准确率 (Accuracy)" : "检测平均精度 (mAP@0.5)"}
                    </div>
                    <div className="text-lg font-black text-emerald-600 font-mono">
                      {trainingStatus === "idle" ? "等待中" : `${activeMetrics.accuracy}%`}
                    </div>
                  </div>
                  <div className="bg-zinc-50 p-2.5 rounded-lg border text-center flex flex-col justify-center">
                    <div className="text-[10px] font-bold text-zinc-400">当前轮次 (Epoch)</div>
                    <div className="text-sm font-black text-zinc-800">
                      {trainingProgress}% ({currentEpoch} / {trainConfig.epoch})
                    </div>
                  </div>
                </div>

                {/* THE HIGH-PRECISION REALTIME MATPLOTLIB DOUBLE-AXIS GRAPH (Using Recharts) */}
                <div className="bg-white p-3 rounded-xl border border-zinc-200">
                  <p className="text-[10.5px] font-bold text-zinc-500 mb-2 font-mono flex justify-between">
                    <span>matplotlib 多指标动态折线控制台</span>
                    {trainingStatus === "training" && <span className="text-indigo-650 animate-pulse">● 计算流绘制中...</span>}
                  </p>
                  
                  <div className="h-[200px] w-full" id="matplotlib_recharts_chart">
                    {trainingMetrics.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-xs text-zinc-400 italic">
                        <span>点击下方“一键调配多轨训练”按钮开始绘制训练拟合曲线</span>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trainingMetrics} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="epoch" tick={{ fontSize: 9 }} stroke="#888" label={{ value: "Epochs", position: "insideBottomRight", offset: -2, fontSize: 8 }} />
                          <YAxis yAxisId="left" tick={{ fontSize: 9 }} stroke="#ff4136" label={{ value: "Loss 损失值", angle: -90, position: "insideLeft", offset: 10, fontSize: 8 }} />
                          <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 9 }} stroke="#10a66a" label={{ value: "Accuracy/mAP %", angle: 90, position: "insideRight", offset: 10, fontSize: 8 }} />
                          <ChartTooltip contentStyle={{ fontSize: 10 }} />
                          <Legend wrapperStyle={{ fontSize: 9 }} />
                          <Line yAxisId="left" type="monotone" dataKey="train_loss" name="训练损失 (Train Loss)" stroke="#ff4136" strokeWidth={2.5} activeDot={{ r: 4 }} dot={{ r: 1 }} />
                          <Line yAxisId="left" type="monotone" dataKey="val_loss" name="验证损失 (Val Loss)" stroke="#ff851b" strokeWidth={1.5} dot={{ r: 1 }} />
                          <Line yAxisId="right" type="monotone" dataKey="accuracy" name={trainingTaskType === "classify" ? "校验精确度 (Accuracy)" : "平均检测进度 (mAP)"} stroke="#10a66a" strokeWidth={2.5} activeDot={{ r: 4 }} dot={{ r: 1 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                <div className="pt-1.5 flex gap-3">
                  <button
                    onClick={executeSingleTrain}
                    disabled={trainingStatus === "training" || isAutoProgressing}
                    className="flex-1 py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white font-black text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm border border-indigo-700 cursor-pointer"
                  >
                    <Play className="w-4 h-4 text-white" />
                    <span>一键开展多轨在线模型训练</span>
                  </button>
                  {trainingStatus === "training" && (
                    <button
                      onClick={() => setTrainingStatus("completed")}
                      className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs rounded-lg transition"
                    >
                      强制停止
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Step 6 Component View */}
            {workflowStep === 6 && (
              <div className="space-y-4" id="visual_step6_container">
                <div className="border-b pb-2 flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-zinc-900 flex items-center gap-1.5">
                    <CheckCircle className="w-4.5 h-4.5 text-indigo-600" />
                    第 6 步：多维离线混淆矩阵 诊断与验证报告
                  </h3>
                  <span className="text-[10px] font-mono font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded">
                    Evaluation Reports
                  </span>
                </div>

                <p className="text-xs text-zinc-650 leading-relaxed">
                  本实验会自动在不参与训练的<b>10% 独立测试验证集</b>上计算偏差，
                  生成最终评估诊断，判定模型稳定性是否达标底线 (95% 置信度)。
                </p>

                {validationReportGenerated ? (
                  <div className="grid grid-cols-2 gap-4" id="visual_step6_reports_pane">
                    
                    {/* Visual Confusion Matrix or PR Curve depending on type */}
                    <div className="bg-white p-3.5 border rounded-lg shadow-3xs flex flex-col justify-between">
                      <div className="text-[11px] font-black text-zinc-400 uppercase tracking-widest text-center mb-2">
                        {trainingTaskType === "classify" ? "混淆矩阵结果诊断 (Confusion Matrix)" : "精密度 / 召回度曲线 (P-R Curve)"}
                      </div>

                      {trainingTaskType === "classify" ? (
                        <div className="space-y-2 text-center" id="confusion_matrix_grid">
                          <div className="grid grid-cols-3 gap-1 text-[10px] font-bold text-zinc-500">
                            <span />
                            <span>真实 猫</span>
                            <span>真实 狗</span>
                          </div>
                          <div className="grid grid-cols-3 gap-1 items-center">
                            <span className="text-[10px] font-bold text-zinc-500">预测 猫</span>
                            <div className="bg-indigo-600 text-white rounded p-3 text-xs font-black shadow-3xs" title="142个猫正确预测成功">
                              142 <span className="block text-[8px] font-normal text-indigo-200">正确猫</span>
                            </div>
                            <div className="bg-indigo-50 text-indigo-900 rounded p-3 text-xs font-bold" title="仅 3 处误判">
                              3 <span className="block text-[8px] text-zinc-400 font-normal">误判狗</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-1 items-center">
                            <span className="text-[10px] font-bold text-zinc-500">预测 狗</span>
                            <div className="bg-indigo-50 text-indigo-900 rounded p-3 text-xs font-bold" title="仅 2 处误判">
                              2 <span className="block text-[8px] text-zinc-400 font-normal">误判猫</span>
                            </div>
                            <div className="bg-indigo-650 text-white rounded p-3 text-xs font-black shadow-3xs" title="138个狗正确检测">
                              138 <span className="block text-[8px] font-normal text-indigo-200">正确狗</span>
                            </div>
                          </div>
                          <div className="text-[9px] text-zinc-400 italic">猫狗分类矩阵对角命中率：98.2%</div>
                        </div>
                      ) : (
                        <div className="space-y-2" id="pr_curve_grid">
                          <div className="p-3 border bg-zinc-50 rounded text-center text-xs font-mono">
                            <div className="font-bold text-indigo-950 font-sans mb-1 uppercase text-[10px]">类别平均精度 (AP) 拆解</div>
                            <div className="flex justify-between border-b py-1">
                              <span>猫识别 (AP_cat)</span>
                              <span className="font-extrabold text-indigo-805">98.5%</span>
                            </div>
                            <div className="flex justify-between border-b py-1">
                              <span>狗识别 (AP_dog)</span>
                              <span className="font-extrabold text-indigo-805">97.8%</span>
                            </div>
                            <div className="flex justify-between py-1 font-extrabold text-emerald-650">
                              <span>总精确概率 (mAP@0.5)</span>
                              <span>98.2%</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col justify-between" id="visual_step6_metric_stamp">
                      <div className="space-y-2 bg-zinc-50 p-3 rounded border border-zinc-200">
                        <div className="text-[10px] font-black text-zinc-400 tracking-wider">验证报告输出指标摘要</div>
                        <ul className="text-[10.5px] font-bold text-zinc-650 space-y-1">
                          <li className="flex justify-between text-zinc-900"><span>检测准确度:</span> <span className="font-extrabold text-[#10A66A]">98.2%</span></li>
                          <li className="flex justify-between"><span>推理抖动时延:</span> <span className="font-mono">11-14 ms</span></li>
                          <li className="flex justify-between"><span>网络深度系数:</span> <span className="font-mono">50层 ResNet</span></li>
                          <li className="flex justify-between"><span>编译体积:</span> <span className="font-mono text-indigo-800 font-extrabold">14.2 MB</span></li>
                        </ul>
                      </div>

                      <div className="border border-green-200 bg-green-50/55 rounded-lg p-3 text-center" id="precision_green_stamp">
                        <div className="text-[11px] text-emerald-800 font-black flex items-center justify-center gap-1">
                          <CheckCircle className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                          <span>精度达标，准予部署</span>
                        </div>
                        <p className="text-[9.5px] text-zinc-400 mt-1 leading-normal font-sans">经过10折多层离线交叉验证，混淆概率指标符合边缘端直接推理门槛 (Accuracy ≥ 95.0%)</p>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="text-center p-8 bg-zinc-50 border rounded-lg border-zinc-200" id="visual_step6_unverified_fallback">
                    <Activity className="w-8 h-8 text-indigo-300 mx-auto animate-pulse mb-2" />
                    <p className="text-xs text-zinc-500 font-bold">请点击下方按钮激活多维离线评估，输出混淆诊断报告</p>
                    <button
                      onClick={executeSingleValidation}
                      disabled={validationStatus === "validating" || isAutoProgressing}
                      className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-lg transition border border-indigo-700 cursor-pointer shadow-sm"
                    >
                      开始多维精确度交叉验证 (Cross Validation)
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 7 Component View */}
            {workflowStep === 7 && (
              <div className="space-y-4 shadow-3xs" id="visual_step7_container">
                <div className="border-b pb-2 flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-zinc-900 flex items-center gap-1.5">
                    <Server className="w-4.5 h-4.5 text-indigo-600" />
                    第 7 步：编译免物理交叉编程 与 一键部署边缘硬件终端
                  </h3>
                  <span className="text-[10px] font-mono font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded">
                    Edge Target Deploy
                  </span>
                </div>

                <div className="bg-zinc-50 border p-3.5 rounded-xl flex items-center gap-4 border-zinc-200">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-700 border border-zinc-650 flex flex-col items-center justify-center text-white shrink-0 shadow-3xs relative">
                    <Cpu className="w-5.5 h-5.5 text-amber-500 animate-pulse" />
                    <span className="text-[7.5px] font-black tracking-wider text-zinc-400 mt-1 uppercase">ARM V8</span>
                    {edgeConnectionStatus === "connected" && (
                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border border-white absolute -right-0.5 -bottom-0.5 animate-ping" />
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <b className="text-xs text-zinc-800 font-black">目标边缘硬核计算套件：树莓派RaspberryPi 4B / 物联网核心</b>
                      <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold border ${
                        edgeConnectionStatus === "connected"
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                          : "bg-red-50 border-red-200 text-red-800"
                      }`}>
                        {edgeConnectionStatus === "connected" ? "● SSH联机成功" : "○ 未建立联机"}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-zinc-500 leading-normal">
                      本引擎采用一键 ONNX Runtime 转译，直接通过 SSH 推送嵌入固化权重的轻量级算子，树莓派端侧无需本地拉取编译器与交叉环境。
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="text-[10.5px] font-black text-zinc-500 uppercase tracking-wider block">物理通讯参数配制</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 border rounded-lg bg-white space-y-0.5 shadow-3xs">
                      <span className="text-[9.5px] text-zinc-400 block font-bold-ext uppercase">边缘端IP地址</span>
                      <input 
                        type="text" 
                        defaultValue="192.168.1.105" 
                        disabled={isAutoProgressing} 
                        className="font-mono text-xs text-zinc-700 outline-none w-full font-bold" 
                      />
                    </div>
                    <div className="p-2 border rounded-lg bg-white space-y-0.5 shadow-3xs">
                      <span className="text-[9.5px] text-zinc-400 block font-bold-ext uppercase">端侧挂载虚拟端口</span>
                      <input 
                        type="text" 
                        defaultValue="3000 (边缘控制)" 
                        disabled 
                        className="font-mono text-xs text-zinc-400 outline-none w-full font-bold cursor-not-allowed" 
                      />
                    </div>
                  </div>
                </div>

                {deployProgress > 0 && (
                  <div className="space-y-1.5 bg-zinc-50 border p-2.5 rounded text-xs leading-normal">
                    <div className="flex justify-between font-bold text-zinc-700">
                      <span>ONNX 固化算子 SfTP 上传中...</span>
                      <span>{deployProgress}%</span>
                    </div>
                    <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-650 h-full transition-all" style={{ width: `${deployProgress}%` }} />
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    onClick={executeSingleDeploy}
                    disabled={modelDeployStatus === "deploying" || isAutoProgressing}
                    className="w-full py-2.5 rounded-lg text-xs font-black bg-indigo-600 hover:bg-indigo-500 border border-indigo-700 text-white shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Server className="w-4 h-4" />
                    <span>{modelDeployStatus === "completed" ? "部署成功 (重新整备传输)" : "一键一阶转译压缩部署边缘计算终端"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 8 Component View */}
            {workflowStep === 8 && (
              <div className="space-y-4" id="visual_step8_container">
                <div className="border-b pb-2 flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-zinc-900 flex items-center gap-1.5">
                    <Monitor className="w-4.5 h-4.5 text-indigo-600 animate-pulse" />
                    第 8 步：板端传感器在线推理流测试 (可操作录屏截屏)
                  </h3>
                  <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                    Edge Realtime Inference
                  </span>
                </div>

                <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200 text-xs flex gap-2 justify-between items-center shadow-3xs">
                  <div className="space-y-1">
                    <p className="font-extrabold text-zinc-800">传感器流输入选择 (流媒体网关测试图库)</p>
                    <p className="text-[10px] text-zinc-400">选择不同测试环境图，直接激活边缘核心端侧硬件推理</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setInferenceImage("edge_demo_cat.jpg"); setEdgeInferenceStatus("idle"); }}
                      disabled={isAutoProgressing}
                      className={`px-3 py-1.5 border rounded font-black text-[10.5px] transition-all cursor-pointer ${
                        inferenceImage === "edge_demo_cat.jpg" ? "bg-indigo-600 border-indigo-700 text-white shadow-3xs" : "bg-white text-zinc-700 hover:bg-zinc-50"
                      }`}
                    >
                      测试图一(双耳家猫)
                    </button>
                    <button
                      onClick={() => { setInferenceImage("edge_demo_road.jpg"); setEdgeInferenceStatus("idle"); }}
                      disabled={isAutoProgressing}
                      className={`px-3 py-1.5 border rounded font-black text-[10.5px] transition-all cursor-pointer ${
                        inferenceImage === "edge_demo_road.jpg" ? "bg-indigo-600 border-indigo-700 text-white shadow-3xs" : "bg-white text-zinc-700 hover:bg-zinc-50"
                      }`}
                    >
                      测试图二(马路目标)
                    </button>
                  </div>
                </div>

                {/* THE HIGHEST ACCURACY TESTING PREDICT SCREEN */}
                <div className="border-2 border-dashed border-zinc-350 bg-zinc-950 rounded-xl p-3 flex flex-col items-center justify-center relative min-h-[220px]" id="edge_live_predict_canvas">
                  
                  {edgeInferenceStatus === "idle" && (
                    <div className="text-center text-zinc-500 py-10 space-y-2">
                      <Camera className="w-10 h-10 mx-auto text-zinc-650" />
                      <p className="text-xs font-bold">请点击下方按钮“调取流并运行端侧实时推理”</p>
                    </div>
                  )}

                  {edgeInferenceStatus === "inferencing" && (
                    <div className="text-center text-indigo-400 py-10 space-y-2 animate-pulse">
                      <RefreshCw className="w-10 h-10 mx-auto text-indigo-450 animate-spin" />
                      <p className="text-xs font-bold">端侧边缘计算芯片交叉算力推理转换中...</p>
                    </div>
                  )}

                  {edgeInferenceStatus === "completed" && (
                    <div className="relative overflow-hidden rounded border border-zinc-800 shadow-sm max-w-sm" id="inference_rendering_box">
                      
                      {inferenceImage === "edge_demo_cat.jpg" ? (
                        <div className="relative">
                          {/* Simulated image of cat in our catalog */}
                          <img 
                            src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80" 
                            alt="Edge Cat" 
                            className="w-full max-h-[180px] object-cover block"
                            referrerPolicy="no-referrer"
                          />
                          {/* Beautiful overlay Bounding box for Cat prediction */}
                          <div className="absolute top-[20%] left-[25%] w-[50%] h-[60%] border-4 border-emerald-500 bg-emerald-500/10 rounded pointer-events-none animate-pulse">
                            <span className="absolute top-0 left-0 bg-emerald-600 text-white font-black text-[9px] px-1.5 py-0.5 rounded-b font-sans">
                              tabby_cat : 98.7%
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                          {/* Simulated image of road */}
                          <img 
                            src="https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=400&q=80" 
                            alt="Edge Road" 
                            className="w-full max-h-[180px] object-cover block"
                            referrerPolicy="no-referrer"
                          />
                          {/* Multi overlaps bounding boxes */}
                          <div className="absolute top-[35%] left-[10%] w-[35%] h-[40%] border-4 border-red-500 bg-red-500/10 rounded pointer-events-none animate-pulse">
                            <span className="absolute top-0 left-0 bg-red-600 text-white font-black text-[9px] px-1.5 py-0.5 rounded-b font-sans">
                              person : 93.4%
                            </span>
                          </div>
                          <div className="absolute top-[40%] left-[50%] w-[40%] h-[35%] border-4 border-sky-500 bg-sky-500/10 rounded pointer-events-none animate-pulse">
                            <span className="absolute top-0 left-0 bg-sky-600 text-white font-black text-[9px] px-1.5 py-0.5 rounded-b font-sans">
                              car : 89.1%
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="absolute top-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[8px] font-mono text-emerald-400 font-extrabold shadow-3xs">
                        RaspberryPi Cam Live [60 FPS]
                      </div>
                    </div>
                  )}

                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleRunInference}
                    disabled={edgeInferenceStatus === "inferencing" || isAutoProgressing}
                    className="flex-1 py-2 bg-indigo-650 hover:bg-indigo-650/90 text-white font-black text-xs rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer border border-indigo-700 shadow-sm"
                  >
                    <Sliders className="w-3.8 h-3.8" />
                    <span>立刻激发端侧硬件流媒体交叉推理</span>
                  </button>
                  {edgeInferenceStatus === "completed" && (
                    <button
                      onClick={() => {
                        // Capture screen logic saved directly inside screenshotList
                        const reportName = `visual_train_detect_${Date.now().toString().slice(-4)}.jpg`;
                        setScreenshotList((prev: string[]) => [reportName, ...prev]);
                        addVisualTrainLog(`实验推理图片已截取存证成功！已命名为：${reportName}`, "success");
                        triggerToastMsg("✓ 本步骤推理测试图片截屏已作为附件存档！");
                      }}
                      className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-black flex items-center gap-1.5"
                      title="截取当前推理结果作为实验成果报告"
                    >
                      <Camera className="w-4 h-4" />
                      <span>推理截图存证</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Pagination buttons navigation footer inside workspace middle column */}
            <div className="border-t pt-3 flex items-center justify-between text-xs" id="workspace_pagination_nav_inner">
              <button
                onClick={() => {
                  setWorkflowStep(prev => Math.max(1, prev - 1));
                  addVisualTrainLog(`手动返回上一步`, "info");
                }}
                disabled={workflowStep === 1 || isAutoProgressing}
                className="px-3 py-1.5 text-zinc-500 bg-zinc-50 border border-zinc-250 hover:bg-zinc-100 font-semibold rounded cursor-pointer disabled:opacity-40"
              >
                ← 上一步
              </button>
              <span className="font-black text-zinc-400">
                步骤 {workflowStep} / 8
              </span>
              <button
                onClick={() => {
                  setWorkflowStep(prev => Math.min(8, prev + 1));
                  addVisualTrainLog(`手动推进至下一步`, "info");
                }}
                disabled={workflowStep === 8 || isAutoProgressing}
                className="px-3 py-1.5 bg-indigo-650 text-white hover:bg-indigo-600 font-bold rounded cursor-pointer disabled:opacity-40"
              >
                下一步 →
              </button>
            </div>

          </div>

          {/* COLUMN 3: Realtime PyTorch Logging Console (Col span 3) */}
          <div className="col-span-3 flex flex-col gap-2 bg-zinc-950 p-3 rounded-lg border border-zinc-800 shadow-lg min-h-[500px]" id="visual_train_terminal_column">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5" id="terminal_header_inner">
              <span className="text-[10px] font-bold text-zinc-400 font-mono flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                PYTORCH 边缘联机终端日志
              </span>
              <button
                onClick={() => setVisualTrainLogs([])}
                className="text-zinc-600 hover:text-zinc-400 text-[9.5px] font-bold font-mono transition"
                title="清空当前所有平台日志"
              >
                清空
              </button>
            </div>

            {/* Scrollable monospace dark green shell text */}
            <div className="flex-1 overflow-y-auto max-h-[440px] space-y-1.5 text-[9.5px] font-mono leading-normal pr-1 select-text scroll-smooth" id="terminal_log_output_list">
              {visualTrainLogs.map((log, lIdx) => {
                const colorMap = {
                  info: "text-emerald-400",
                  success: "text-sky-400 font-bold",
                  warn: "text-amber-400",
                  error: "text-rose-500 font-bold animate-pulse"
                };

                return (
                  <div key={lIdx} className="pb-1 border-b border-zinc-900/50">
                    <span className="text-zinc-700 mr-1.5">[{log.time}]</span>
                    <span className={colorMap[log.type] || "text-zinc-300"}>
                      {log.text}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-2.5 border-t border-zinc-900 text-[9px] text-zinc-600 font-mono uppercase flex justify-between" id="terminal_diag_status">
              <span>状态: SYSTEM_IDLE</span>
              <span className="text-emerald-500 font-bold animate-pulse">● 联机就绪</span>
            </div>
          </div>

        </div>

      </div>
    );
  };

  const activeCells = 
    activeTab === "preset" ? presetCells : 
    activeTab === "pyecharts" ? pyechartsCells : 
    activeTab === "imported_analysis" ? importedCells : 
    activeTab === "model_predict" ? modelPredictCells :
    activeTab === "visual_train" ? [] :
    xpathCells;

  return (
    <div className={`flex flex-col h-full bg-[#f5f5f5] text-zinc-900 font-sans relative overflow-hidden select-text ${isFullScreen ? "fixed inset-0 z-50 bg-[#f5f5f5]" : ""}`}>
      
      {/* 闪光动画特效 - 截屏瞬间反馈 */}
      {isSnapping && (
        <div className="absolute inset-0 bg-white/70 animate-ping z-50 pointer-events-none transition-all duration-300" />
      )}

      {/* 一、顶部深色实验环境栏 */}
      <div className="bg-[#212121] text-zinc-150 height-[44px] shrink-0 border-b border-zinc-900 px-4 flex items-center justify-between select-none">
        
        {/* Jupyter Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-[#F37626] flex items-center justify-center p-0.5 shadow-sm text-white font-extrabold text-[11px]">
            J
          </div>
          <span className="text-white font-extrabold text-[13.5px] uppercase tracking-wide">
            大数据-jupyter
          </span>
          <div className="bg-emerald-600/30 text-[#4caf50] border border-emerald-500/20 text-[10.5px] font-bold px-2 py-0.5 rounded ml-2">
            已启动 (Python 3 ipykernel)
          </div>
        </div>

        {/* Right side operational controls (Terminal & Fullscreen) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTerminalOpen(!isTerminalOpen)}
            className={`px-3 py-1 text-xs font-bold rounded flex items-center gap-1.5 transition-all cursor-pointer ${
              isTerminalOpen 
                ? "bg-amber-600 text-white" 
                : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>终端</span>
          </button>
          
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white p-1 text-xs font-bold rounded flex items-center gap-1.5 transition cursor-pointer px-3 py-1"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>{isFullScreen ? "窗口" : "全屏"}</span>
          </button>

          <button
            onClick={onClose}
            className="bg-rose-900/30 text-rose-400 border border-rose-900/40 hover:bg-rose-800 hover:text-white text-xs font-bold rounded py-1 px-3 transition cursor-pointer"
          >
            退出算力
          </button>
        </div>
      </div>

      {/* 二、Jupyter 菜单栏 (File Edit View Run Kernel Tabs Settings Help) */}
      <div className="bg-white border-b border-zinc-200 px-4 py-1 flex items-center justify-between select-none shrink-0 text-zinc-700 text-xs">
        <div className="flex items-center gap-4 font-normal">
          {["File", "Edit", "View", "Run", "Kernel", "Tabs", "Settings", "Help"].map((menu) => (
            <span
              key={menu}
              className="hover:bg-zinc-100 hover:text-zinc-950 px-2 py-0.8 rounded cursor-pointer transition text-[12.5px] font-medium"
            >
              {menu}
            </span>
          ))}
        </div>

        {/* Status ticker */}
        <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 font-mono">
          <span>Server: <b>127.0.0.1:8888</b></span>
          <span className="text-zinc-300">|</span>
          <span className="text-[#10A66A] font-semibold">{savingStatus}</span>
        </div>
      </div>

      {/* 顶部沙箱状态栏 (Python 案例训练沙箱) */}
      <div className="bg-[#FAFBFB] border-b border-zinc-200 px-4 py-2 flex items-center justify-between text-xs select-none selection:bg-transparent shrink-0">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 font-extrabold text-zinc-600">
          <div className="flex items-center gap-1.5 text-zinc-800 text-[12.8px] font-black tracking-wide border-r border-zinc-200 pr-4 mr-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
            <span>Python 案例训练沙箱</span>
          </div>
          
          <div className="flex items-center gap-1">
            <span className="text-zinc-400 font-semibold">当前账户：</span>
            <span className="text-zinc-800 text-[11.5px] font-black">学生1</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-zinc-400 font-semibold">沙箱环境：</span>
            <span className="font-mono text-indigo-700 text-[11px] bg-indigo-50 border border-indigo-100 px-2 rounded-md">student1-python-sandbox</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-zinc-400 font-semibold">内核类型：</span>
            <span className="text-zinc-700 bg-zinc-100 px-1.5 py-0.2 rounded font-mono">Python 3 (ipykernel)</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-zinc-400 font-semibold">工作目录：</span>
            <span className="font-mono text-zinc-500 font-medium">/home/student1/workspace</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-zinc-400 font-semibold">任务状态：</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${taskStatus === "已重置" ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"}`}>
              {taskStatus}
            </span>
          </div>

          <div className="flex items-center gap-1 border-l border-zinc-250 pl-4">
            <span className="text-zinc-400 font-semibold">最近重置：</span>
            <span className="font-mono text-zinc-500 font-black">{lastResetTime}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsRightSettingsOpen(!isRightSettingsOpen)}
            className={`px-3 py-1.2 text-xs font-black rounded-lg border transition flex items-center gap-1 cursor-pointer shadow-3xs ${isRightSettingsOpen ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-white hover:bg-zinc-50 text-zinc-600 border-zinc-300"}`}
          >
            <span>{isRightSettingsOpen ? "隐藏沙箱面板" : "查看沙箱面板"}</span>
          </button>
          
          <button
            onClick={handleTriggerReset}
            className="px-3 py-1.2 text-xs font-black rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 bg-white transition flex items-center gap-1 cursor-pointer shadow-3xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>任务重置</span>
          </button>

          <button
            onClick={handleSaveAndCommit}
            className="px-3 py-1.2 text-xs font-black rounded-lg bg-[#10A66A] hover:bg-emerald-600 text-white transition flex items-center gap-1 cursor-pointer shadow-3xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>保存参数</span>
          </button>
        </div>
      </div>

      {/* 主体部分：左侧实验导航 + 中间 Notebook + 右侧迷你说明 & 底部 */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* 三、左侧实验导航栏 */}
        <div className="w-[240px] border-r border-zinc-200 bg-[#FAFBFB] flex flex-col shrink-0 overflow-y-auto select-none">
          {/* Jupyter 风格工作空间文件目录 */}
          <div className="border-b border-zinc-200 font-sans flex flex-col shrink-0 bg-white">
            {/* Title & Top path info */}
            <div className="p-2.5 px-3 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
              <span className="font-extrabold text-[12px] uppercase text-zinc-750 tracking-wider flex items-center gap-1.5">
                <FolderOpen className="w-4 h-4 text-amber-500 shrink-0" />
                文件浏览器
              </span>
              <span className="text-[9px] font-black text-zinc-400 bg-zinc-200/50 px-1.5 py-0.5 rounded select-none font-mono">
                WORKSPACE
              </span>
            </div>

            {/* Jupyter file manager toolbar actions */}
            <div className="flex items-center gap-1.5 p-1.5 px-2.5 border-b border-zinc-150 bg-zinc-50 select-none">
              {/* + (New File/Launcher) */}
              <button
                onClick={() => {
                  triggerToastMsg("已新建代码并加载默认 Launcher 配置片。");
                  const logTime = new Date().toTimeString().split(' ')[0];
                  const newName = `untitled-${Date.now().toString().slice(-4)}.ipynb`;
                  setFilesList(prev => [
                    ...prev,
                    { name: newName, type: "ipynb", lastModified: "刚刚" }
                  ]);
                }}
                className="p-1 hover:bg-zinc-200 rounded text-zinc-700 transition"
                title="新建 Notebook 代码页 (New Notebook)"
              >
                <Plus className="w-3.5 h-3.5 text-zinc-650 font-extrabold" />
              </button>

              {/* New Folder button */}
              <button
                onClick={() => {
                  triggerToastMsg("已在工作区 /work/ 下新建空白临时夹。");
                  const logTime = new Date().toTimeString().split(' ')[0];
                  const newFolderName = `untitled_folder-${Date.now().toString().slice(-3)}`;
                  setFilesList(prev => [
                    { name: newFolderName, type: "folder", lastModified: "刚刚" },
                    ...prev
                  ]);
                }}
                className="p-1 hover:bg-zinc-200 rounded text-zinc-700 transition"
                title="新建文件夹 (New Folder)"
              >
                <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
              </button>

              {/* Upload button (向上箭头 / Upload) */}
              <button
                onClick={() => {
                  setUploadDialogVisible(true);
                  triggerToastMsg("正在扫描本地磁盘绑定虚拟上传套件...");
                }}
                className="p-1 hover:bg-zinc-200 rounded text-zinc-700 transition relative group"
                title="上传外部 ipynb 文件 (Upload Files)"
              >
                <Upload className="w-3.5 h-3.5 text-blue-600 font-extrabold" />
              </button>

              {/* Refresh button */}
              <button
                onClick={() => {
                  triggerToastMsg("正在扫描并刷新工作目录...");
                  // Soft flash refresh
                }}
                className="p-1 hover:bg-zinc-200 rounded text-zinc-700 transition"
                title="刷新文件列表 (Refresh)"
              >
                <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
              </button>
            </div>

            {/* Filter Search files by name box */}
            <div className="p-1.5 px-2 bg-white border-b border-zinc-150">
              <input
                type="text"
                placeholder="Filter files by name"
                value={fileNameFilter}
                onChange={(e) => setFileNameFilter(e.target.value)}
                className="w-full text-[10.5px] p-1 border rounded bg-zinc-50 border-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium text-zinc-700 placeholder-zinc-400"
              />
            </div>

            {/* Directory Path displaying */}
            <div className="flex items-center text-[10.5px] text-zinc-400 bg-zinc-50/20 px-2.5 py-1 border-b border-zinc-150">
              <span>/</span>
              <span className="mx-0.5 text-zinc-600 font-black hover:underline cursor-pointer">work</span>
              <span>/</span>
            </div>

            {/* Name Column header & Last modified column header */}
            <div className="grid grid-cols-12 gap-1 px-2.5 py-1 bg-zinc-50 border-b border-zinc-150 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider select-none">
              <span className="col-span-8">Name</span>
              <span className="col-span-4 text-right">Last Modified</span>
            </div>

            {/* Simulated file explorer directory items */}
            <div className="flex-1 overflow-y-auto max-h-[320px] divide-y divide-zinc-50/50 bg-white">
              {filesList
                .filter(file => file.name.toLowerCase().includes(fileNameFilter.toLowerCase()))
                .map((file) => {
                  const isFileActive = 
                    (file.name.includes("数据类型") && activeTab === "imported_analysis") ||
                    (file.name.includes("平台预置模块") && activeTab === "preset") ||
                    (file.name.includes("pyecharts") && activeTab === "pyecharts") ||
                    (file.name.includes("模型预测应用部署") && activeTab === "model_predict") ||
                    (file.name.includes("Xpath解析_爬取") && activeTab === "xpath");

                  return (
                    <div
                      key={file.name}
                      onClick={() => {
                        if (file.type === "folder") {
                          triggerToastMsg(`已进入文件夹目录: ${file.name}`);
                          return;
                        }
                        if (file.name.includes("模型预测应用部署")) {
                          setActiveTab("model_predict");
                          triggerToastMsg("已激活标签页：模型预测应用部署.ipynb");
                          setSelectedFileForPreview(null);
                        } else if (file.name.includes("数据类型")) {
                          setActiveTab("imported_analysis");
                          triggerToastMsg("已激活标签页：3. Python 数据类型-答案.ipynb");
                          setSelectedFileForPreview(null);
                        } else if (file.name.includes("预置")) {
                          setActiveTab("preset");
                          triggerToastMsg("已激活标签页：平台预置模块.ipynb");
                          setSelectedFileForPreview(null);
                        } else if (file.name.includes("pyecharts")) {
                          setActiveTab("pyecharts");
                          triggerToastMsg("已激活标签页：pyecharts可视化组件.ipynb");
                          setSelectedFileForPreview(null);
                        } else if (file.name.includes("Xpath") || file.name.includes("xpath")) {
                          setActiveTab("xpath");
                          triggerToastMsg("已激活标签页：xpath 爬虫分析案例");
                          setSelectedFileForPreview(null);
                        } else if (file.name === "predict_result.json") {
                          setSelectedFileForPreview({
                            name: "predict_result.json",
                            path: "/work/outputs/predict_result.json",
                            type: "json",
                            content: JSON.stringify({
                              "app": "模型预测应用",
                              "task": "目标检测",
                              "image": "demo_road.jpg",
                              "objects": [
                                {"class": "person", "box": [80, 60, 180, 260], "confidence": 0.93},
                                {"class": "car", "box": [260, 130, 420, 250], "confidence": 0.88},
                                {"class": "traffic light", "box": [380, 30, 440, 100], "confidence": 0.81}
                              ]
                            }, null, 2)
                          });
                          triggerToastMsg("已加载 outputs/predict_result.json JSON文件预览！");
                        } else if (file.name === "model_app.py") {
                          setSelectedFileForPreview({
                            name: "model_app.py",
                            path: "/work/model_app.py",
                            type: "code",
                            content: `from flask import Flask, request, jsonify\nimport json\n\napp = Flask(__name__)\n\n@app.route("/api/predict/classify", methods=["POST"])\ndef classify():\n    return jsonify({\n        "status": "success",\n        "task": "图像分类", \n        "label": "猫 (Cat)",\n        "confidence": 0.96\n    })\n\n@app.route("/api/predict/detect", methods=["POST"])\ndef detect():\n    return jsonify({\n        "status": "success",\n        "task": "目标检测",\n        "objects": [\n            {"class": "person", "box": [80, 60, 180, 260], "confidence": 0.93},\n            {"class": "car", "box": [260, 130, 420, 250], "confidence": 0.88}\n        ]\n    })\n\nif __name__ == "__main__":\n    app.run(host="0.0.0.0", port=7860)`
                          });
                          triggerToastMsg("已加载 model_app.py 在线部署服务源码预览！");
                        } else if (file.name.endsWith(".pkl") || file.name.endsWith(".pt")) {
                          setSelectedFileForPreview({
                            name: file.name,
                            path: `/work/model/${file.name}`,
                            type: "binary",
                            content: `[Binary Weights Metadata]\nFormat: PyTorch / Pickle Serialized weights matrix\nSize: ${file.name.includes("classifier") ? "18.2 MB" : "32.5 MB"}\nStatus: Loaded successfully into RAM\nDevices: GPU (CUDA 11.8) available`
                          });
                          triggerToastMsg(`已加载二进制模型结构预览: ${file.name}`);
                        } else if (file.name.endsWith(".jpg")) {
                          setSelectedFileForPreview({
                            name: file.name,
                            path: `/work/static/${file.name}`,
                            type: "image",
                            content: file.name
                          });
                          triggerToastMsg(`正在预览静态演示测试图片: ${file.name}`);
                        } else {
                          triggerToastMsg(`已激活工作区文件: ${file.name}`);
                        }
                      }}
                      onContextMenu={(e) => handleFileContextMenu(e, file.name)}
                      className={`grid grid-cols-12 gap-1 items-center px-2 py-2 text-[10.5px] font-mono cursor-pointer transition-all select-none ${
                        isFileActive 
                          ? "bg-slate-100 text-blue-900 border-l-[3px] border-l-blue-600 font-extrabold" 
                          : "text-zinc-600 hover:bg-zinc-100/60"
                      }`}
                      style={{ paddingLeft: file.indent ? `${file.indent * 12 + 8}px` : "8px" }}
                      title={file.name}
                    >
                      <span className="col-span-8 flex items-center gap-1.5 truncate">
                        {file.type === "folder" ? (
                          <Folder className="w-3.5 h-3.5 text-amber-500 shrink-0 fill-amber-100" />
                        ) : file.type === "ipynb" ? (
                          <FileCode className={`w-3.5 h-3.5 shrink-0 ${isFileActive ? "text-blue-600" : "text-zinc-400"}`} />
                        ) : (
                          <FileCode className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        )}
                        <span className="truncate leading-none">{file.name}</span>
                      </span>
                      <span className="col-span-4 text-right text-[9px] text-zinc-400 font-sans truncate shrink-0">
                        {file.lastModified}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="p-3 border-b border-zinc-200 bg-zinc-50/50">
            <h3 className="font-extrabold text-[12px] uppercase text-zinc-400 tracking-wider">
              实验导航
            </h3>
          </div>

          {/* Nav items */}
          <div className="flex flex-col p-2 space-y-1">
            <button
              onClick={() => setLeftNavActive("guide")}
              className={`p-2.5 rounded-lg text-left text-xs font-bold transition flex items-center gap-2 ${
                leftNavActive === "guide"
                  ? "bg-zinc-200/80 text-zinc-950 border-l-4 border-zinc-800"
                  : "text-zinc-650 hover:bg-zinc-100"
              }`}
            >
              <BookOpen className="w-3.8 h-3.8 text-emerald-600" />
              <span>指导书</span>
            </button>

            <button
              onClick={() => setLeftNavActive("manual")}
              className={`p-2.5 rounded-lg text-left text-xs font-bold transition flex items-center gap-2 ${
                leftNavActive === "manual"
                  ? "bg-zinc-200/80 text-zinc-950 border-l-4 border-zinc-800"
                  : "text-zinc-650 hover:bg-zinc-100"
              }`}
            >
              <FileText className="w-3.8 h-3.8 text-indigo-500" />
              <span>操作手册</span>
            </button>

            <button
              onClick={() => setLeftNavActive("screenshot")}
              className={`p-2.5 rounded-lg text-left text-xs font-bold transition flex items-center gap-2 ${
                leftNavActive === "screenshot"
                  ? "bg-zinc-200/80 text-zinc-950 border-l-4 border-zinc-800"
                  : "text-zinc-650 hover:bg-zinc-100"
              }`}
            >
              <Camera className="w-3.8 h-3.8 text-amber-500" />
              <span>截屏</span>
            </button>
          </div>

          {/* Subnavigation area details according to active element */}
          <div className="flex-1 p-3 border-t border-zinc-150 text-xs text-zinc-700 leading-relaxed overflow-y-auto bg-zinc-50/20">
            {leftNavActive === "guide" && (
              <div className="space-y-3">
                <div className="font-bold text-zinc-900 border-b pb-1">
                  💡 实验任务要求
                </div>
                <p className="text-[11.5px] text-zinc-600">
                  当前实验重点考察对 Python 平台模块 Tibetan 调用，主要涵盖：
                </p>
                <div className="space-y-1.5 text-[11px] font-medium text-zinc-650">
                  <div className="flex gap-1.5 items-start">
                    <span className="text-[#10A66A]">✓</span>
                    <span>运行字符串清洗单元，体验替换与切分</span>
                  </div>
                  <div className="flex gap-1.5 items-start">
                    <span className="text-[#10A66A]">✓</span>
                    <span>运行数据整理单元，计算年龄均值</span>
                  </div>
                  <div className="flex gap-1.5 items-start">
                    <span className="text-[#10A66A]">✓</span>
                    <span>运行可视化，观察 SVG 直观折线变化</span>
                  </div>
                  <div className="flex gap-1.5 items-start">
                    <span className="text-[#10A66A]">✓</span>
                    <span>引入 jieba 分词，运行解析中文效果</span>
                  </div>
                  <div className="flex gap-1.5 items-start">
                    <span className="text-[#10A66A]">✓</span>
                    <span>提取网络结构，并展示爬取结果</span>
                  </div>
                </div>
                <div className="pt-2">
                  <button
                    onClick={handleRunAll}
                    className="w-full py-1.5 bg-[#10A66A] hover:bg-emerald-600 text-white rounded font-bold text-[11px] text-center"
                  >
                    一键开始所有实验
                  </button>
                </div>
              </div>
            )}

            {leftNavActive === "manual" && (
              <div className="space-y-2.5">
                <div className="font-bold text-zinc-800 border-b pb-1">
                  📘 Jupyter 核心捷键
                </div>
                <div className="space-y-2 text-[10.5px]">
                  <div>
                    <span className="bg-zinc-200 px-1 py-0.5 rounded font-mono font-bold text-zinc-800">Shift + Enter</span>
                    <p className="text-zinc-500 mt-1">运行选中单元并向下移动</p>
                  </div>
                  <div>
                    <span className="bg-zinc-200 px-1 py-0.5 rounded font-mono font-bold text-zinc-800">Alt + Enter</span>
                    <p className="text-zinc-500 mt-1">运行选中单元并插入新单元</p>
                  </div>
                  <div>
                    <span className="bg-zinc-200 px-1 py-0.5 rounded font-mono font-bold text-zinc-800">B</span>
                    <p className="text-zinc-500 mt-1">在下方新建代码块</p>
                  </div>
                </div>
              </div>
            )}

            {leftNavActive === "screenshot" && (
              <div className="space-y-3 select-none">
                <div className="font-bold text-zinc-800 border-b pb-1">
                  📸 实验报告截屏
                </div>
                <p className="text-[11px] text-zinc-500">
                  可在此处执行实验结果录屏/截屏存证，并在当前列表中直接提取：
                </p>
                <button
                  onClick={handleCaptureScreen}
                  className="w-full py-2 bg-indigo-50 border border-indigo-200 hover:bg-indigo-150 text-indigo-700 rounded-lg text-[11.5px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Camera className="w-3.8 h-3.8" />
                  <span>截取当前实验界面</span>
                </button>

                <div className="pt-2 border-t mt-3 space-y-2">
                  <p className="text-[10px] text-zinc-400 font-extrabold uppercase">
                    已捕获附件 ({screenshotList.length})
                  </p>
                  {screenshotList.length === 0 ? (
                    <p className="text-[10px] italic text-zinc-400">暂未截取任何凭证</p>
                  ) : (
                    <div className="space-y-1.5 max-h-[150px] overflow-y-auto">
                      {screenshotList.map((st, sIdx) => (
                        <div key={sIdx} className="p-1 px-2 border rounded bg-white text-[10px] font-mono text-zinc-600 flex justify-between items-center truncate">
                          <span className="truncate flex-1">{st}</span>
                          <span className="text-[#10A66A] font-extrabold ml-1 font-sans">✓</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Simple Diagnostic verification panel built in */}
          <div className="p-3 bg-zinc-100 border-t border-zinc-200 text-xs">
            <div className="font-bold text-zinc-800 text-[11px] flex justify-between items-center mb-1.5">
              <span>平台预置模块验证</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
            <div className="space-y-1 text-[10.5px] text-zinc-600 font-mono">
              <div className="flex justify-between">
                <span>string_tools</span>
                <span className="text-[#10A66A] font-bold">可用</span>
              </div>
              <div className="flex justify-between">
                <span>request_tools</span>
                <span className="text-[#10A66A] font-bold">可用</span>
              </div>
              <div className="flex justify-between">
                <span>chart_tools</span>
                <span className="text-[#10A66A] font-bold">可用</span>
              </div>
              <div className="flex justify-between">
                <span>data_cleaner</span>
                <span className="text-[#10A66A] font-bold">可用</span>
              </div>
              <div className="flex justify-between">
                <span>nlp_tools</span>
                <span className="text-[#10A66A] font-bold">可用</span>
              </div>
            </div>
          </div>
        </div>

        {/* 主编辑区和控制栏 */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          
          {/* 四、Notebook 标签页 */}
          <div className="bg-[#f0f0f0] border-b border-zinc-200 px-2 flex items-end justify-between select-none shrink-0 pt-1.5">
            <div className="flex items-end gap-1">
              
              {/* Tab 0 (模型预测应用部署.ipynb) */}
              <button
                onClick={() => {
                  setActiveTab("model_predict");
                  setSelectedCellId("model-pred-1");
                }}
                className={`px-4 py-1.8 text-xs font-bold rounded-t-lg transition-all flex items-center gap-2 border-t border-x ${
                  activeTab === "model_predict"
                    ? "bg-white border-zinc-100 text-zinc-950 font-black z-10 -mb-[1px]"
                    : "bg-zinc-100 border-transparent text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
                }`}
              >
                <FileCode className="w-4 h-4 text-amber-600" />
                <span className="text-amber-800 font-black font-sans">模型预测应用部署.ipynb</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-550" />
              </button>

              {/* Tab 1 */}
              <button
                onClick={() => {
                  setActiveTab("preset");
                  setSelectedCellId("pres-config-0");
                }}
                className={`px-4 py-1.8 text-xs font-bold rounded-t-lg transition-all flex items-center gap-2 border-t border-x ${
                  activeTab === "preset"
                    ? "bg-white border-zinc-200 text-zinc-950 font-black z-10 -mb-[1px]"
                    : "bg-zinc-100 border-transparent text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
                }`}
              >
                <FileCode className="w-4 h-4 text-[#F37626]" />
                <span>平台预置模块.ipynb</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              </button>

              {/* Tab 2 (pyecharts可视化组件.ipynb) */}
              <button
                onClick={() => {
                  setActiveTab("pyecharts");
                  setSelectedCellId("pye-md-0");
                }}
                className={`px-4 py-1.8 text-xs font-bold rounded-t-lg transition-all flex items-center gap-2 border-t border-x ${
                  activeTab === "pyecharts"
                    ? "bg-white border-zinc-200 text-zinc-950 font-black z-10 -mb-[1px]"
                    : "bg-zinc-100 border-transparent text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
                }`}
              >
                <FileCode className="w-4 h-4 text-[#10A66A]" />
                <span className="text-[#10A66A] font-extrabold font-sans">pyecharts可视化组件.ipynb</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </button>

              {/* Tab 3 (导入案例_数据分析训练.ipynb) */}
              <button
                onClick={() => {
                  setActiveTab("imported_analysis");
                  setSelectedCellId("imp-md-1");
                }}
                className={`px-4 py-1.8 text-xs font-bold rounded-t-lg transition-all flex items-center gap-2 border-t border-x ${
                  activeTab === "imported_analysis"
                    ? "bg-white border-zinc-200 text-zinc-950 font-black z-10 -mb-[1px]"
                    : "bg-zinc-100 border-transparent text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
                }`}
              >
                <FileCode className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span className="text-emerald-850 font-black font-sans">3. Python 数据类型-答案.ipynb</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </button>

              {/* Tab 4 */}
              <button
                onClick={() => {
                  setActiveTab("xpath");
                  setSelectedCellId("xpath-1");
                }}
                className={`px-4 py-1.8 text-xs font-bold rounded-t-lg transition-all flex items-center gap-2 border-t border-x ${
                  activeTab === "xpath"
                    ? "bg-white border-zinc-200 text-zinc-950 font-black z-10 -mb-[1px]"
                    : "bg-zinc-100 border-transparent text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
                }`}
              >
                <FileCode className="w-4 h-4 text-sky-600" />
                <span>Xpath解析_爬取电商平台数据.ipynb</span>
              </button>
            </div>

            <div className="p-1 px-3 text-[11px] text-zinc-400 font-medium">
              Jupyter Lab v3.4.8
            </div>
          </div>

          {/* 五、Notebook 工具栏 */}
          <div className="bg-white border-b border-zinc-200 px-4 py-1.5 flex items-center justify-between shrink-0 select-none shadow-3xs flex-wrap gap-2">
            
            {/* Left standard actions */}
            <div className="flex items-center gap-1.5 text-zinc-650">
              
              {/* Save */}
              <button
                onClick={handleSaveAndCommit}
                className="p-1.5 hover:bg-zinc-100 rounded text-zinc-700 transition"
                title="保存 (Save)"
              >
                <Save className="w-4 h-4 text-emerald-600 inline" />
              </button>

              {/* Add cell */}
              <button
                onClick={handleAddNewCell}
                className="p-1.5 hover:bg-zinc-100 rounded text-zinc-700 transition"
                title="在下方新建代码块 (Insert Cell Below)"
              >
                <Plus className="w-4 h-4 inline text-blue-600" />
              </button>

              <div className="w-px h-4 bg-zinc-200 mx-1" />

              {/* Cut */}
              <button
                onClick={() => triggerToastMsg("已剪切单元格")}
                className="p-1.5 hover:bg-zinc-100 rounded text-zinc-700 transition"
                title="剪切 (Cut)"
              >
                <Scissors className="w-4 h-4 inline" />
              </button>

              {/* Copy */}
              <button
                onClick={() => triggerToastMsg("已复制单元格")}
                className="p-1.5 hover:bg-zinc-100 rounded text-zinc-700 transition"
                title="复制 (Copy)"
              >
                <Copy className="w-4 h-4 inline" />
              </button>

              {/* Paste */}
              <button
                onClick={() => triggerToastMsg("已粘贴单元格至下方")}
                className="p-1.5 hover:bg-zinc-100 rounded text-zinc-700 transition"
                title="粘贴 (Paste)"
              >
                <Clipboard className="w-4 h-4 inline" />
              </button>

              <div className="w-px h-4 bg-zinc-200 mx-1" />

              {/* Run Current */}
              <button
                onClick={() => handleRunCell(selectedCellId)}
                className="p-1.5 hover:bg-zinc-100 rounded text-emerald-700 transition font-bold"
                title="运行选中单元 (Run Cell)"
              >
                <Play className="w-4 h-4 inline text-[#10A66A]" />
              </button>

              {/* Stop Execution */}
              <button
                onClick={handleStop}
                className="p-1.5 hover:bg-zinc-100 rounded text-rose-600 transition"
                title="停止单元运行 (Stop Cell)"
              >
                <Square className="w-3.8 h-3.8 inline fill-rose-600" />
              </button>

              {/* Restart Kernel */}
              <button
                onClick={handleRestartKernel}
                className="p-1.5 hover:bg-zinc-100 rounded text-zinc-700 transition"
                title="重启 ipykernel (Restart)"
              >
                <RotateCcw className="w-4 h-4 inline" />
              </button>

              {/* Run All */}
              <button
                onClick={handleRunAll}
                className="h-7 px-2.5 bg-zinc-105 hover:bg-[#EAF8F1] hover:text-[#10A66A] rounded text-xs font-bold transition flex items-center gap-1 border"
                title="运行所有包含的单元 (Run All Cells)"
              >
                <PlayCircle className="w-3.8 h-3.8" />
                <span>运行全部</span>
              </button>

              <div className="w-px h-4 bg-zinc-200 mx-1" />

              {/* Cell Type selection dropdown */}
              <div className="flex items-center gap-1 select-none">
                <span className="text-[11px] text-zinc-400">单元类型：</span>
                <select
                  disabled
                  className="bg-zinc-50 border border-zinc-250 rounded px-1.5 py-0.5 text-xs text-zinc-700 font-bold focus:outline-hidden"
                >
                  <option>Code</option>
                  <option>Markdown</option>
                </select>
              </div>

              <div className="w-px h-4 bg-zinc-200 mx-1.5" />

              {/* 导入 ipynb */}
              <button
                onClick={() => {
                  setImportPanelOpen(true);
                  setImportParseStatus("not_selected");
                  setSelectedImportFile(null);
                }}
                className="h-7 px-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-3xs"
                title="导入 .ipynb 文件"
                id="btn-import-ipynb"
              >
                <Upload className="w-3.5 h-3.5 animate-bounce text-blue-600" />
                <span>导入 ipynb</span>
              </button>

              {/* 导出 ipynb */}
              <button
                onClick={() => {
                  setExportPanelOpen(true);
                  setExportStatus("idle");
                  setExportFileName("导入案例_数据分析训练_已执行.ipynb");
                }}
                className="h-7 px-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-250 rounded text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-3xs"
                title="导出为 .ipynb 文件"
                id="btn-export-ipynb"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>导出 ipynb</span>
              </button>
            </div>

            {/* Right side kernel info */}
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-650">
              <span className="bg-zinc-100 px-2 py-0.5 rounded text-[10.5px]">Python 3 (ipykernel)</span>
              <span className="flex items-center gap-1 font-medium">
                <span className={`w-2.5 h-2.5 rounded-full ${kernelStatus === "Busy" ? "bg-amber-500 animate-pulse" : "bg-[#10A66A]"}`} />
                <span>{kernelStatus === "Busy" ? "正在执行代码" : "Idle"}</span>
              </span>
            </div>
          </div>

          {/* 六、Jupyter Notebook 单元列表展示区 */}
          <div className="flex-1 flex overflow-hidden bg-white">
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
            
            {/* Top Markdown Header Cell Info (Only displayed in Tab 1) */}
            {activeTab === "preset" && (
              <div className="p-4 bg-zinc-50 border-l-[6px] border-amber-500 rounded-r-lg shadow-3xs space-y-2 select-text text-xs leading-relaxed mb-6">
                <h1 id="notebook-main-header" className="text-base font-extrabold text-zinc-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  # 平台预置模块调用示例
                </h1>
                <p className="text-zinc-600 font-medium">
                  本 Notebook 展示平台预置的字符串数据处理、数据请求、图表可视化、数据整理和自然语言分词能力，学员可直接运行代码单元查看效果。可以直接修改内容，或依次点击每一个单元块旁边的 <Play className="w-3.5 h-3.5 text-[#10A66A] inline-block mx-0.5" /> 来执行。
                </p>
                <div className="text-[10.5px] bg-[#EAF8F1] text-[#10A66A] font-black px-2 py-0.8 rounded inline-block">
                  内置库：string_tools ｜ request_tools ｜ chart_tools ｜ data_cleaner ｜ nlp_tools 可用
                </div>
              </div>
            )}

            {activeTab === "xpath" && (
              <div className="p-4 bg-zinc-50 border-l-[6px] border-sky-500 rounded-r-lg shadow-3xs space-y-2 text-xs leading-relaxed mb-6">
                <h1 className="text-base font-extrabold text-zinc-900">
                  # 爬虫解析电商平台 & XPath 语法综合练习
                </h1>
                <p className="text-zinc-600 font-medium">
                  本实验用于提取特定电商或网页端的层级商品标签信息，直接使用 <code>lxml</code> 的 <code>etree</code> 解析 XPath。
                </p>
              </div>
            )}

            {/* 可视化模型训练工具区域 */}
            {activeTab === "visual_train" && renderVisualTrainTool()}

            {/* Render cell array */}
            <div className="space-y-6">
              {activeTab !== "visual_train" && activeCells.map((cell, idx) => {
                const isSelected = selectedCellId === cell.id;
                
                return (
                  <div
                    key={cell.id}
                    onClick={() => setSelectedCellId(cell.id)}
                    className={`border rounded-lg bg-white overflow-hidden transition-all ${
                      isSelected
                        ? "border-[#1572e8] ring-2 ring-blue-100 shadow-sm"
                        : "border-zinc-200 shadow-3xs hover:border-zinc-300"
                    }`}
                  >
                    {/* Active side indicator */}
                    <div className="relative">
                      {isSelected && (
                        <div className="absolute left-0 top-0 bottom-0 w-[5px] bg-sky-600" />
                      )}

                      {/* Area Wrapper by Cell Type */}
                      {cell.type === "markdown" ? (
                        <div className="p-5 bg-[#FAFAFA] border-l-[5px] border-[#10A66A] text-zinc-805 leading-relaxed font-sans text-xs select-text select-none">
                          {/* Rendering different markdown cell contents by checking cell.id */}
                          {cell.id === "pye-md-0" && (
                            <div className="space-y-3.5">
                              <h2 className="text-base font-extrabold text-zinc-900 border-b pb-1.5 flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#10A66A]" />
                                pyecharts 数据可视化综合实训
                              </h2>
                              <p className="text-zinc-650 font-medium">
                                平台已预置 <code className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-mono font-bold text-xs">pyecharts</code> 交互式可视化组件包，提供了一套简洁、优雅且强大的 Python 绘图 API 接口。支持 30+ 以上图表展示、全局样式配置，以及可交互的组件参数定制。
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-3.5 rounded-lg border border-zinc-200">
                                <div className="space-y-1.5">
                                  <div className="font-extrabold text-zinc-700 text-xs flex items-center gap-1">
                                    <span>⚙ 内核沙箱保障：</span>
                                  </div>
                                  <div className="text-[11px] text-zinc-500 font-medium font-sans">
                                    每个账户独立配备了沙箱资源空间，加载了 pyecharts、numpy、matplotlib、pandas、lxml 及 sklearn 的标准基础镜像，学员可一键重置分析条件。
                                  </div>
                                </div>
                                <div className="space-y-1.5 border-l pl-4 border-zinc-100">
                                  <div className="font-extrabold text-zinc-700 text-xs">🧪 实训任务流（可依次向下点击运行）：</div>
                                  <ul className="text-[11px] text-zinc-500 space-y-1 font-medium list-disc list-inside">
                                    <li>环境引入初始化校验</li>
                                    <li>30个经典图表类型分类清单检索</li>
                                    <li>折线、柱状、饼图基础模型调试</li>
                                    <li>交互式参数化（ToolTip / Toolbox）</li>
                                    <li>Grid/Tab/Timeline 组合报告报告设计</li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          )}
                          {cell.id === "pye-md-2" && (
                            <div className="space-y-1.5">
                              <h3 className="text-sm font-extrabold text-zinc-800 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#10A66A]" />
                                二、支持的 30+ 种核心图表组件分类检索清单
                              </h3>
                              <p className="text-zinc-500 text-[11px]">
                                pyecharts 拥有一整套功能齐备的可视化渲染引擎。以下列表为当前后台 Python ipykernel 注册的核心图表类型：
                              </p>
                            </div>
                          )}
                          {!["pye-md-0", "pye-md-2"].includes(cell.id) && (
                            <div className="whitespace-pre-wrap font-sans text-zinc-800 font-semibold">{cell.codeText}</div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-stretch bg-zinc-50/15 p-3 px-4 gap-4">
                          {/* Bracket count [In]: */}
                          <div className="w-[60px] shrink-0 text-right select-none font-mono text-[11px] text-indigo-700/80 pt-1 font-bold">
                            {cell.isExecuting ? (
                              <span className="text-amber-600 font-bold animate-pulse">In [*]:</span>
                            ) : cell.isExecuted ? (
                              <span>In [{cell.executionCount}]:</span>
                            ) : (
                              <span>In [ ]:</span>
                            )}
                          </div>

                          {/* Python input source code */}
                          <div className="flex-1 bg-white border border-zinc-200/80 rounded-lg p-3 relative font-mono text-[13px] hover:border-zinc-300 transition shadow-3xs select-text">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRunCell(cell.id);
                              }}
                              className="absolute top-2.5 right-2.5 p-1.5 rounded-md hover:bg-[#EAF8F1] text-zinc-400 hover:text-[#10A66A] transition-all cursor-pointer z-10 animate-fade-in"
                              title="运行本代码块 (Ctrl+Enter)"
                            >
                              <Play className="w-3.8 h-3.8 text-[#10A66A]" />
                            </button>

                            {/* Render Syntax Highlighting Code */}
                            {renderHighlightedCode(cell.codeText, cell.comment)}
                          </div>
                        </div>
                      )}

                      {/* Output section (Displayed ONLY if executed) */}
                      {cell.isExecuted && (
                        <div className={`border-t border-zinc-150 p-4 bg-white text-xs leading-relaxed flex items-start gap-4 ${cell.type === "markdown" ? "hidden" : ""}`}>
                          
                          {/* Label [Out] */}
                          <div className="w-[60px] shrink-0 text-right select-none font-mono text-[11px] text-rose-700 font-bold">
                            {cell.executionCount && <span>Out [{cell.executionCount}]:</span>}
                          </div>

                          {/* Variable styled outputs */}
                          <div className="flex-1 font-mono text-zinc-800 whitespace-pre-wrap select-text overflow-x-auto">
                            
                            {/* Rendering: Simple text block */}
                            {cell.outputMarkup === "text" && (
                              <div className="text-emerald-705 font-bold p-2 px-3 bg-zinc-50 border rounded-md font-mono text-[11px] whitespace-pre-wrap leading-relaxed">
                                {cell.outputText}
                              </div>
                            )}

                            {/* Table output for pandas DataFrame */}
                            {cell.outputMarkup === "table" && (
                              <div className="bg-white border border-zinc-200 p-3 rounded-lg my-2 max-w-sm font-sans select-text">
                                <div className="text-[10px] text-zinc-400 font-mono mb-1.5 uppercase select-none font-extrabold tracking-wider">
                                  Pandas DataFrame Display:
                                </div>
                                <table className="min-w-full text-xs text-left border border-zinc-205 font-sans leading-normal">
                                  <thead>
                                    <tr className="bg-zinc-50 border-b border-zinc-200 font-extrabold text-zinc-650">
                                      <th className="p-1 px-2 border-r border-[#e4e4e7]"></th>
                                      <th className="p-1 px-2 border-r border-[#e4e4e7] text-blue-800">name</th>
                                      <th className="p-1 px-2 text-blue-850">score</th>
                                    </tr>
                                  </thead>
                                  <tbody className="font-mono divide-y divide-zinc-150">
                                    <tr className="hover:bg-zinc-50/50">
                                      <td className="p-1 px-2 text-zinc-400 bg-[#fefefe] border-r border-zinc-240 text-right select-none font-bold">0</td>
                                      <td className="p-1 px-2 border-r border-zinc-240 font-semibold text-zinc-800">张三</td>
                                      <td className="p-1 px-2 font-black text-emerald-600 font-sans">88</td>
                                    </tr>
                                    <tr className="hover:bg-zinc-50/50">
                                      <td className="p-1 px-2 text-zinc-400 bg-[#fefefe] border-r border-zinc-240 text-right select-none font-bold">1</td>
                                      <td className="p-1 px-2 border-r border-zinc-240 font-semibold text-zinc-800">李四</td>
                                      <td className="p-1 px-2 font-black text-emerald-600 font-sans">76</td>
                                    </tr>
                                    <tr className="hover:bg-zinc-50/50">
                                      <td className="p-1 px-2 text-zinc-400 bg-[#fefefe] border-r border-zinc-240 text-right select-none font-bold">2</td>
                                      <td className="p-1 px-2 border-r border-zinc-240 font-semibold text-zinc-800">王五</td>
                                      <td className="p-1 px-2 font-black text-emerald-600 font-sans">92</td>
                                    </tr>
                                    <tr className="hover:bg-zinc-50/50">
                                      <td className="p-1 px-2 text-zinc-400 bg-[#fefefe] border-r border-zinc-240 text-right select-none font-bold">3</td>
                                      <td className="p-1 px-2 border-r border-zinc-240 font-semibold text-zinc-800">赵六</td>
                                      <td className="p-1 px-2 font-black text-emerald-600 font-sans">85</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            )}

                            {/* Rendering: Plotting visual outputs (SVG/Matplotlib) */}
                            {cell.outputMarkup === "chart" && (
                              <div className="my-2 bg-white border rounded-md p-4 flex flex-col items-center select-none shadow-3xs">
                                {cell.id === "imp-code-4" ? (
                                  <>
                                    <span className="text-[11px] text-zinc-550 font-sans font-bold mb-2 flex items-center gap-1.5">
                                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                                      Matplotlib: 成绩变化趋势折线图 (Score Trend)
                                    </span>
                                    {/* Line graph for student scores analysis preview */}
                                    <svg width="340" height="180" className="bg-white border rounded shadow-3xs font-sans">
                                      {/* Gridlines */}
                                      <line x1="40" y1="30" x2="320" y2="30" stroke="#f4f4f5" />
                                      <line x1="40" y1="60" x2="320" y2="60" stroke="#f4f4f5" />
                                      <line x1="40" y1="90" x2="320" y2="90" stroke="#f4f4f5" />
                                      <line x1="40" y1="120" x2="320" y2="120" stroke="#f4f4f5" />
                                      <line x1="40" y1="150" x2="320" y2="150" stroke="#e4e4e7" strokeWidth="1.2" />

                                      {/* Axis lines */}
                                      <line x1="40" y1="20" x2="40" y2="150" stroke="#888888" strokeWidth="1.2" />
                                      <line x1="40" y1="150" x2="320" y2="150" stroke="#888888" strokeWidth="1.2" />

                                      {/* Path Line */}
                                      <path d="M 80 62 L 150 98 L 220 50 L 290 71" fill="none" stroke="#2563eb" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />

                                      {/* Dots & Labels */}
                                      {[
                                        { x: 80, y: 62, val: "88", label: "张三" },
                                        { x: 150, y: 98, val: "76", label: "李四" },
                                        { x: 220, y: 50, val: "92", label: "王五" },
                                        { x: 290, y: 71, val: "85", label: "赵六" }
                                      ].map((pt, pidx) => (
                                        <g key={pidx}>
                                          <circle cx={pt.x} cy={pt.y} r="4.5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                                          <text x={pt.x} y={pt.y - 7} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#0f172a">
                                            {pt.val}
                                          </text>
                                          <text x={pt.x} y="164" textAnchor="middle" fontSize="9.5" fill="#6b7280" fontWeight="bold">
                                            {pt.label}
                                          </text>
                                        </g>
                                      ))}

                                      {/* Y Marks */}
                                      <text x="32" y="33" textAnchor="end" fontSize="9" fill="#9ca3af" fontWeight="bold">100分</text>
                                      <text x="32" y="63" textAnchor="end" fontSize="9" fill="#9ca3af" fontWeight="bold">80分</text>
                                      <text x="32" y="93" textAnchor="end" fontSize="9" fill="#9ca3af" fontWeight="bold">60分</text>
                                      <text x="32" y="123" textAnchor="end" fontSize="9" fill="#9ca3af" fontWeight="bold">40分</text>
                                      <text x="32" y="153" textAnchor="end" fontSize="9" fill="#9ca3af" fontWeight="bold">20分</text>
                                    </svg>
                                  </>
                                ) : (
                                  <>
                                    <span className="text-[11px] text-zinc-400 font-sans italic mb-2">
                                      Matplotlib: Line plot rendering backend
                                    </span>
                                
                                {/* SVG render chart with requested dimensions/values: Peak is 4 at x=2 */}
                                <svg width="340" height="180" className="bg-white border rounded shadow-3xs select-none">
                                  {/* Gridlines */}
                                  <line x1="40" y1="30" x2="320" y2="30" stroke="#f0f0f0" />
                                  <line x1="40" y1="70" x2="320" y2="70" stroke="#f0f0f0" />
                                  <line x1="40" y1="110" x2="320" y2="110" stroke="#f0f0f0" />
                                  <line x1="40" y1="140" x2="320" y2="140" stroke="#e0e0e0" />

                                  {/* Axis lines */}
                                  <line x1="40" y1="20" x2="40" y2="140" stroke="#888888" strokeWidth="1.5" />
                                  <line x1="40" y1="140" x2="320" y2="140" stroke="#888888" strokeWidth="1.5" />

                                  {/* Data points mapping: 
                                      (1, 2) -> (x=90, y=100)
                                      (2, 4) -> (x=180, y=40)
                                      (3, 1) -> (x=270, y=120)
                                  */}
                                  <polyline
                                    fill="none"
                                    stroke="#1f77b4"
                                    strokeWidth="3.2"
                                    points="90,100 180,40 270,120"
                                  />

                                  {/* Point Circles */}
                                  <circle cx="90" cy="100" r="4.5" fill="#e377c2" stroke="#ffffff" strokeWidth="1.5" />
                                  <circle cx="180" cy="40" r="4.5" fill="#e377c2" stroke="#ffffff" strokeWidth="1.5" />
                                  <circle cx="270" cy="120" r="4.5" fill="#e377c2" stroke="#ffffff" strokeWidth="1.5" />

                                  {/* X labels */}
                                  <text x="90" y="155" textAnchor="middle" fontSize="10.5" fill="#555">1</text>
                                  <text x="180" y="155" textAnchor="middle" fontSize="10.5" fill="#555">2</text>
                                  <text x="270" y="155" textAnchor="middle" fontSize="10.5" fill="#555">3</text>
                                  <text x="180" y="174" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#333">X Label</text>

                                  {/* Y labels */}
                                  <text x="32" y="143" textAnchor="end" fontSize="10" fill="#555">0</text>
                                  <text x="32" y="123" textAnchor="end" fontSize="10" fill="#555">1</text>
                                  <text x="32" y="103" textAnchor="end" fontSize="10" fill="#555">2</text>
                                  <text x="32" y="73" textAnchor="end" fontSize="10" fill="#555">3</text>
                                  <text x="32" y="43" textAnchor="end" fontSize="10" fill="#555">4</text>
                                  
                                  {/* Y Axis text rot */}
                                  <text x="15" y="85" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#333" transform="rotate(-90 15 85)">Y Label</text>
                                </svg>
                              </>
                            )}
                          </div>
                        )}

                            {/* Rendering: JIEBA markup initializer and word list */}
                            {cell.outputMarkup === "jieba" && (
                              <div className="space-y-2 w-full">
                                <div className="bg-[#FFF0F2] text-[#8C1D2A] border border-[#FFD9DD] p-3.5 rounded-lg select-text text-[11px] leading-relaxed">
                                  Building prefix dict from the default dictionary ...<br />
                                  Dumping model to file cache /tmp/jieba.cache<br />
                                  Loading model cost 0.535 seconds.<br />
                                  Prefix dict has been built successfully.
                                </div>
                                <div className="bg-zinc-50 border p-2.5 rounded text-zinc-900 font-extrabold tracking-wide">
                                  这是/一个/句子/。
                                </div>
                              </div>
                            )}

                            {/* Rendering: Request outputs (Sina stocks) */}
                            {cell.outputMarkup === "json" && (
                              <div className="bg-zinc-900 text-zinc-100 p-3 rounded-lg overflow-x-auto text-[11px] max-h-[220px] overflow-y-auto leading-relaxed shadow-deep">
                                正在爬取第：1页<br />
                                正在爬取：https://stock.finance.sina.com.cn/stock/go.php/vReport_List/kind/latest/index.phtml?p=1<br />
                                <span className="text-[#a6e22e]">number: 1</span><br />
                                <span className="text-[#64b5f6]">title: CHINAECONOMY: UNEVENCREDITRECOVERY</span><br />
                                status: ok<br />
                                data_extracted: successful
                              </div>
                            )}

                            {/* Rendering: config dynamic outputs */}
                            {cell.outputMarkup === "config" && (
                              <div className="bg-zinc-900 text-[#a6e22e] p-3 rounded-lg font-mono text-[11px] leading-relaxed select-text w-full">
                                当前规则参数：<br />
                                keyword = {analysisConfig.keyword}<br />
                                min_score = {analysisConfig.min_score}<br />
                                chart_type = {analysisConfig.chart_type}<br />
                                top_k = {analysisConfig.top_k}<br />
                                fill_missing_value = {analysisConfig.fill_missing_value}
                              </div>
                            )}

                            {/* Rendering: filter dynamic outputs */}
                            {cell.outputMarkup === "filter" && (
                              <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-lg select-text space-y-2 w-full">
                                <div className="text-zinc-500 font-mono text-[11px] font-semibold border-b pb-1 select-none">
                                  筛选配置参数: min_score = {analysisConfig.min_score}
                                </div>
                                <div className="text-zinc-900 font-sans">
                                  <div className="text-zinc-400 text-[10.5px] font-bold uppercase tracking-wider mb-1 select-none">
                                    Pandas DataFrame 过滤筛选结果：
                                  </div>
                                  <table className="min-w-full text-xs text-left border">
                                    <thead>
                                      <tr className="bg-zinc-100 uppercase font-bold text-zinc-650 border-b select-none">
                                        <th className="p-1 px-3 border-r">name</th>
                                        <th className="p-1 px-3 border-r">score</th>
                                        <th className="p-1 px-3">text</th>
                                      </tr>
                                    </thead>
                                    <tbody className="font-mono">
                                      {analysisConfig.min_score <= 88 && (
                                        <tr className="border-b hover:bg-zinc-100/50">
                                          <td className="p-1.5 px-3 border-r font-bold text-[#1976d2]">张三</td>
                                          <td className="p-1.5 px-3 border-r font-black text-emerald-600">88</td>
                                          <td className="p-1.5 px-3 text-zinc-550">{analysisConfig.keyword}平台训练</td>
                                        </tr>
                                      )}
                                      {analysisConfig.min_score <= 76 && (
                                        <tr className="border-b hover:bg-zinc-100/50">
                                          <td className="p-1.5 px-3 border-r font-bold text-[#1976d2]">李四</td>
                                          <td className="p-1.5 px-3 border-r font-black text-emerald-600">76</td>
                                          <td className="p-1.5 px-3 text-zinc-550">Python 数据分析</td>
                                        </tr>
                                      )}
                                      {analysisConfig.min_score <= 92 && (
                                        <tr className="hover:bg-zinc-100/50">
                                          <td className="p-1.5 px-3 border-r font-bold text-[#1976d2]">王五</td>
                                          <td className="p-1.5 px-3 border-r font-black text-emerald-600">92</td>
                                          <td className="p-1.5 px-3 text-zinc-550">智慧教育实训</td>
                                        </tr>
                                      )}
                                      {analysisConfig.min_score > 92 && (
                                        <tr>
                                          <td colSpan={3} className="p-3 text-center text-zinc-400 italic font-mono">No compliance matches above threshold.</td>
                                        </tr>
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                            {/* MODEL PREDICTION OUTCOME SPECIAL CELLS */}
                            {cell.outputMarkup === "model-env" && (
                              <div className="text-emerald-700 font-semibold p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg font-mono text-[11px] whitespace-pre-wrap leading-relaxed select-text w-full max-w-2xl select-all">
                                {cell.outputText || `当前沙箱目录：/home/student1/workspace
模型目录：/home/student1/workspace/model
图像分类模型：image_classifier.pkl
目标检测模型：object_detector.pt
模型预测环境加载完成`}
                              </div>
                            )}

                            {cell.outputMarkup === "model-app-create" && (
                              <div className="text-emerald-700 font-semibold p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg font-mono text-[11px] whitespace-pre-wrap leading-relaxed select-text w-full max-w-2xl select-all">
                                {cell.outputText || `model_app.py 已生成
预测接口：/predict/classify
预测接口：/predict/detect`}
                              </div>
                            )}

                            {cell.outputMarkup === "model-app-deploy" && (
                              <div className="space-y-3.5 w-full max-w-2xl select-text">
                                <div className="text-emerald-700 font-semibold p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg font-mono text-[11px] whitespace-pre-wrap leading-relaxed select-all">
                                  {cell.outputText || `正在启动模型预测应用...
应用名称：模型预测应用
运行状态：running
服务端口：7860
Web 预览地址：http://127.0.0.1:7860
支持任务：图像分类、目标检测
模型预测应用部署完成`}
                                </div>
                                
                                {/* 额外显示的浅色服务状态卡片 */}
                                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl font-sans">
                                  <div className="flex items-center gap-2 mb-2 font-sans">
                                    <span className="flex h-2.5 w-2.5 relative">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                    </span>
                                    <span className="font-extrabold text-zinc-950 text-xs font-sans">模型预测应用已启动</span>
                                  </div>
                                  <div className="space-y-1.5 text-xs text-zinc-705 font-sans">
                                    <div className="flex items-center gap-2">
                                      <span className="text-zinc-400 font-bold w-16">服务地址：</span>
                                      <span className="font-mono font-bold text-indigo-700 bg-white border px-1.5 py-0.2 rounded hover:underline cursor-pointer select-all font-sans">http://127.0.0.1:7860</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-zinc-400 font-bold w-16">状态：</span>
                                      <span className="font-black text-emerald-800 bg-emerald-100/55 px-1.8 py-0.3 rounded border border-emerald-250 text-[10.5px]">运行中</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-zinc-400 font-bold w-16">任务类型：</span>
                                      <span className="font-bold text-zinc-900">图像分类、目标检测</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {cell.outputMarkup === "model-classify" && (
                              <div className="p-4.5 bg-zinc-50 border border-zinc-200 rounded-xl my-2 w-full max-w-2xl font-sans select-text">
                                <div className="text-[12px] font-black text-zinc-900 border-b border-zinc-200 pb-2 mb-3.5 flex items-center justify-between select-none">
                                  <span className="flex items-center gap-2">
                                    <Camera className="w-4 h-4 text-indigo-600" />
                                    <span>图像分类预测结果</span>
                                  </span>
                                  <span className="text-[10px] font-black text-zinc-400 bg-zinc-200/50 px-2 py-0.5 rounded font-mono">IMAGE_CLASSIFICATION</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  {/* Left: display image placeholder */}
                                  <div className="border rounded-lg bg-zinc-200 overflow-hidden flex flex-col items-center justify-center p-3 relative h-40 select-none">
                                    <div className="p-3 bg-indigo-50 border border-indigo-150 rounded-full mb-1">
                                      <Camera className="w-8 h-8 text-indigo-600 animate-pulse" />
                                    </div>
                                    <span className="text-[11px] font-extrabold text-zinc-800 font-sans mt-1">demo_cat.jpg</span>
                                  </div>
                                  {/* Right: display details */}
                                  <div className="space-y-3 font-sans">
                                    <div>
                                      <span className="text-zinc-450 font-extrabold text-[10px] block uppercase tracking-wider">输入图片 (Input Image)</span>
                                      <span className="font-mono text-zinc-805 font-black text-xs select-all font-sans">demo_cat.jpg</span>
                                    </div>
                                    <div>
                                      <span className="text-zinc-450 font-extrabold text-[10px] block uppercase tracking-wider">预测标签 (Predicted Label)</span>
                                      <span className="text-emerald-800 font-black text-[12.5px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-0.5 font-sans">猫 (Cat)</span>
                                    </div>
                                    <div>
                                      <span className="text-zinc-455 font-bold text-[10px] block uppercase tracking-wider">置信度 (Confidence)</span>
                                      <div className="flex items-center gap-2 mt-1">
                                        <div className="flex-1 bg-zinc-300 rounded-full h-2 overflow-hidden">
                                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: "96%" }} />
                                        </div>
                                        <span className="font-mono text-xs font-black text-emerald-600">96%</span>
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-zinc-400 font-extrabold text-[9px] block uppercase tracking-wider mb-1">预测概率比对 (Probabilities)</span>
                                      <div className="space-y-1 text-[11px]">
                                        <div className="flex justify-between items-center bg-white/70 px-2 py-0.5 rounded border border-zinc-150">
                                          <span className="font-bold text-zinc-750">猫</span>
                                          <span className="font-mono font-extrabold text-emerald-600">0.96</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-white/40 px-2 py-0.5 rounded">
                                          <span className="text-zinc-500 font-semibold">狗</span>
                                          <span className="font-mono text-zinc-500">0.03</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-white/40 px-2 py-0.5 rounded">
                                          <span className="text-zinc-500 font-semibold">兔子</span>
                                          <span className="font-mono text-zinc-500">0.01</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {cell.outputMarkup === "model-detect" && (
                              <div className="p-4.5 bg-zinc-50 border border-zinc-200 rounded-xl my-2 w-full max-w-2xl font-sans select-text">
                                <div className="text-[12px] font-black text-zinc-900 border-b border-zinc-200 pb-2 mb-3.5 flex items-center justify-between select-none">
                                  <span className="flex items-center gap-2">
                                    <Monitor className="w-4 h-4 text-indigo-600" />
                                    <span>目标检测预测结果</span>
                                  </span>
                                  <span className="text-[10px] font-black text-zinc-400 bg-zinc-200/50 px-2 py-0.5 rounded font-mono">OBJECT_DETECTION</span>
                                </div>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                      <span className="text-zinc-450 font-extrabold text-[10px] block uppercase tracking-wider">输入图片 (Input Image)</span>
                                      <span className="font-mono text-zinc-800 font-black text-xs select-all">demo_road.jpg</span>
                                    </div>
                                    <div className="space-y-1.5">
                                      <span className="text-zinc-450 font-extrabold text-[10px] block uppercase tracking-wider">检测目标边界框 (Detected BBoxes)</span>
                                      <div className="space-y-1 text-[11px] font-medium">
                                        <div className="flex justify-between font-extrabold text-rose-705 bg-rose-50/50 px-2.5 py-1 rounded border border-rose-150">
                                          <span>person</span>
                                          <span className="font-mono text-rose-600">0.93</span>
                                        </div>
                                        <div className="flex justify-between font-extrabold text-blue-705 bg-blue-50/50 px-2.5 py-1 rounded border border-blue-150">
                                          <span>car</span>
                                          <span className="font-mono text-blue-600">0.88</span>
                                        </div>
                                        <div className="flex justify-between font-extrabold text-emerald-705 bg-emerald-50/50 px-2.5 py-1 rounded border border-emerald-150">
                                          <span>traffic light</span>
                                          <span className="font-mono text-emerald-600 font-sans">0.81</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Target road prediction CSS image layers */}
                                  <div className="relative border border-zinc-300 rounded-xl bg-zinc-950 overflow-hidden min-h-[190px] h-48 w-full flex flex-col justify-between p-3.5 select-none shadow-3xs">
                                    <div className="w-full h-full relative pointer-events-none">
                                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-800 via-zinc-900 to-zinc-950 flex flex-col justify-center items-center">
                                        {/* Road representation */}
                                        <div className="w-full h-full flex flex-col justify-end items-center relative overflow-hidden">
                                          {/* Perspective road grids */}
                                          <div className="absolute inset-x-0 bottom-0 top-12 bg-zinc-850/40 transform perspective-100 rotateX-30 scale-100 flex justify-center gap-6">
                                            <div className="w-0.5 bg-dashed border-l border-zinc-550/50 h-full border-dashed"></div>
                                            <div className="w-0.5 bg-dashed border-l border-zinc-550/50 h-full border-dashed"></div>
                                          </div>
                                          <span className="text-[10px] text-zinc-550 font-bold pb-2 select-all">静态测试样片：demo_road.jpg 叠加目标预测框</span>
                                        </div>
                                      </div>

                                      {/* Person Bounding Box */}
                                      <div className="absolute border-2 border-rose-500 bg-rose-500/10" style={{ top: "35px", left: "45px", width: "65px", height: "105px" }}>
                                        <span className="absolute top-0 left-0 bg-rose-600 text-white font-bold font-mono text-[9.5px] px-1 py-0.2 rounded-br-sm select-none leading-none">
                                          person: 93%
                                        </span>
                                      </div>

                                      {/* Car Bounding Box */}
                                      <div className="absolute border-2 border-blue-500 bg-blue-500/10" style={{ top: "65px", left: "175px", width: "125px", height: "75px" }}>
                                        <span className="absolute top-0 left-0 bg-blue-600 text-white font-bold font-mono text-[9.5px] px-1 py-0.2 rounded-br-sm select-none leading-none">
                                          car: 88%
                                        </span>
                                      </div>

                                      {/* Traffic Light Bounding Box */}
                                      <div className="absolute border-2 border-emerald-500 bg-emerald-500/10" style={{ top: "20px", left: "375px", width: "35px", height: "65px" }}>
                                        <span className="absolute top-0 left-0 bg-emerald-600 text-white font-bold font-mono text-[9.5px] px-1 py-0.2 rounded-br-sm select-none leading-none">
                                          traffic light: 81%
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {cell.outputMarkup === "model-records" && (
                              <div className="bg-white border border-zinc-200 rounded-xl my-2 p-4 select-text font-sans w-full max-w-2xl overflow-x-auto shadow-3xs text-[11px] font-sans">
                                <span className="font-extrabold text-[11px] text-zinc-500 block mb-2.5 uppercase select-none font-sans tracking-wide">
                                  模型预测历史记录列表 (Persistent database records)
                                </span>
                                <table className="min-w-full text-[11.5px] text-left border border-zinc-200 font-sans leading-normal">
                                  <thead>
                                    <tr className="bg-zinc-100 border-b border-zinc-200 font-extrabold text-zinc-700 select-none text-[11.5px]">
                                      <th className="p-2 border-r font-sans font-bold">时间</th>
                                      <th className="p-2 border-r font-sans font-bold">任务类型</th>
                                      <th className="p-2 border-r font-sans font-bold">输入图片</th>
                                      <th className="p-2 border-r font-sans font-bold">预测结果</th>
                                      <th className="p-2 border-r font-sans font-bold">置信度</th>
                                      <th className="p-2 text-center font-sans font-bold">状态</th>
                                    </tr>
                                  </thead>
                                  <tbody className="font-sans divide-y divide-zinc-200 text-zinc-800 font-medium">
                                    <tr className="hover:bg-zinc-50/50">
                                      <td className="p-2 border-r font-mono text-zinc-550">10:45:21</td>
                                      <td className="p-2 border-r font-bold text-zinc-850">图像分类</td>
                                      <td className="p-2 border-r font-mono text-zinc-550">demo_cat.jpg</td>
                                      <td className="p-2 border-r text-emerald-805 font-black">猫</td>
                                      <td className="p-2 border-r font-mono font-bold text-zinc-650">0.96</td>
                                      <td className="p-2 text-center select-none">
                                        <span className="bg-emerald-50 text-emerald-800 border border-[#10A66A] text-[9.5px] font-black px-1.5 py-0.2 rounded">
                                          成功
                                        </span>
                                      </td>
                                    </tr>
                                    <tr className="hover:bg-zinc-50/50">
                                      <td className="p-2 border-r font-mono text-zinc-550">10:45:31</td>
                                      <td className="p-2 border-r font-bold text-zinc-850">目标检测</td>
                                      <td className="p-2 border-r font-mono text-zinc-550">demo_road.jpg</td>
                                      <td className="p-2 border-r text-indigo-850 font-black">person、car、traffic light</td>
                                      <td className="p-2 border-r font-mono font-bold text-zinc-650">0.93 / 0.88 / 0.81</td>
                                      <td className="p-2 text-center select-none">
                                        <span className="bg-emerald-50 text-emerald-800 border border-[#10A66A] text-[9.5px] font-black px-1.5 py-0.2 rounded">
                                          成功
                                        </span>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            )}

                            {/* PYECHARTS OUTPUT 1: 30+ Types Matrix Grid */}
                            {cell.outputMarkup === "pye-types-grid" && (() => {
                              // Define all 30 distinct charts with rich data
                              const galleryCharts = [
                                {
                                  id: 1,
                                  name: "Line 折线图",
                                  pyClass: "Line",
                                  category: "基础典型",
                                  desc: "折线图用于展示数据随时间或有序类目的连续变化趋势，常用于时序数据、趋势分析等场景。",
                                  code: `from pyecharts.charts import Line\nimport pyecharts.options as opts\n\nline = (\n    Line()\n    .add_xaxis(["1" , "2" , "3" , "4" , "5" , "6"])\n    .add_yaxis("成绩趋势", [82, 93, 90, 93, 129, 133])\n    .set_global_opts(title_opts=opts.TitleOpts(title="成绩变化折线图"))\n)`,
                                  render: () => (
                                    <svg className="w-full h-full p-2" viewBox="0 0 100 60">
                                      <path d="M10,50 L25,38 L40,44 L55,25 L70,30 L85,12 L95,15" fill="none" stroke="#2563eb" strokeWidth="2.5" />
                                      <path d="M10,50 L25,38 L40,44 L55,25 L70,30 L85,12 L95,15 L95,55 L10,55 Z" fill="url(#blue-grad)" opacity="0.1" />
                                      <circle cx="55" cy="25" r="3.5" fill="#ef4444" />
                                      <line x1="5" y1="55" x2="95" y2="55" stroke="#e2e8f0" strokeWidth="0.8" />
                                    </svg>
                                  )
                                },
                                {
                                  id: 2,
                                  name: "Bar 柱状图",
                                  pyClass: "Bar",
                                  category: "基础典型",
                                  desc: "柱状图主要是通过柱子长度展示离散组别的指标数值，用于多柱并列对比或单项数值水平对比。",
                                  code: `from pyecharts.charts import Bar\nimport pyecharts.options as opts\n\nbar = (\n    Bar()\n    .add_xaxis(["语文", "数学", "英语"])\n    .add_yaxis("平均分", [85, 92, 78])\n    .set_global_opts(title_opts=opts.TitleOpts(title="多科成绩对比"))\n)`,
                                  render: () => (
                                    <svg className="w-full h-full p-2" viewBox="0 0 100 60">
                                      <rect x="15" y="22" width="12" height="33" fill="#10b981" rx="1.5" />
                                      <rect x="44" y="10" width="12" height="45" fill="#3b82f6" rx="1.5" />
                                      <rect x="73" y="30" width="12" height="25" fill="#f59e0b" rx="1.5" />
                                      <line x1="5" y1="55" x2="95" y2="55" stroke="#e2e8f0" strokeWidth="0.8" />
                                    </svg>
                                  )
                                },
                                {
                                  id: 3,
                                  name: "Pie 饼图",
                                  pyClass: "Pie",
                                  category: "基础典型",
                                  desc: "饼图（及环形图）能以极高表现力展现某单一阶段下各因子（如男女、科目配比）贡献占比。",
                                  code: `from pyecharts.charts import Pie\nimport pyecharts.options as opts\n\npie = (\n    Pie()\n    .add("", [("基础 A", 40), ("提高 B", 35), ("实践 C", 25)])\n    .set_global_opts(title_opts=opts.TitleOpts(title="课包占比"))\n)`,
                                  render: () => (
                                    <svg className="w-full h-full p-2" viewBox="0 0 100 60">
                                      <circle cx="50" cy="30" r="23" fill="#f1f5f9" />
                                      <circle cx="50" cy="30" r="23" fill="none" stroke="#2563eb" strokeWidth="8" strokeDasharray="50 144" />
                                      <circle cx="50" cy="30" r="23" fill="none" stroke="#10b981" strokeWidth="8" strokeDasharray="36 144" strokeDashoffset="-50" />
                                      <circle cx="50" cy="30" r="23" fill="none" stroke="#f59e0b" strokeWidth="8" strokeDasharray="58 144" strokeDashoffset="-86" />
                                    </svg>
                                  )
                                },
                                {
                                  id: 4,
                                  name: "Scatter 散点图",
                                  pyClass: "Scatter",
                                  category: "基础典型",
                                  desc: "展示二阶连续数值关系，可有效揭示学习时长、投入积分与最终考核总分间的伴生相关性规律。",
                                  code: `from pyecharts.charts import Scatter\nimport pyecharts.options as opts\n\nscatter = (\n    Scatter()\n    .add_xaxis([10,  20, 30,  40, 50])\n    .add_yaxis("分布", [15, 30, 25, 45, 38])\n)`,
                                  render: () => (
                                    <svg className="w-full h-full p-2" viewBox="0 0 100 60">
                                      <circle cx="20" cy="45" r="4" fill="#3b82f6" opacity="0.8" />
                                      <circle cx="35" cy="22" r="5" fill="#10b981" opacity="0.8" />
                                      <circle cx="52" cy="48" r="3" fill="#f59e0b" opacity="0.8" />
                                      <circle cx="68" cy="18" r="4.5" fill="#8854d0" opacity="0.8" />
                                      <circle cx="82" cy="38" r="6" fill="#ec4899" opacity="0.8" />
                                      <circle cx="44" cy="32" r="4" fill="#6366f1" opacity="0.75" />
                                      <line x1="5" y1="55" x2="95" y2="55" stroke="#e2e8f0" strokeWidth="0.8" />
                                    </svg>
                                  )
                                },
                                {
                                  id: 5,
                                  name: "EffectScatter 涟漪图",
                                  pyClass: "EffectScatter",
                                  category: "基础典型",
                                  desc: "带有动态涟漪扩展波纹的散点图，能对地图重要标记节点、重大异常报警信号提供极佳视效聚焦感。",
                                  code: `from pyecharts.charts import EffectScatter\n\nes = EffectScatter().add_xaxis([1, 2]).add_yaxis("报警", [10, 20])`,
                                  render: () => (
                                    <svg className="w-full h-full p-2" viewBox="0 0 100 60">
                                      <circle cx="30" cy="30" r="4" fill="#ef4444" />
                                      <circle cx="30" cy="30" r="12" fill="none" stroke="#ef4444" strokeWidth="1" className="animate-ping" />
                                      <circle cx="70" cy="22" r="4" fill="#3b82f6" />
                                      <circle cx="70" cy="22" r="14" fill="none" stroke="#3b82f6" strokeWidth="1" className="animate-ping" />
                                      <circle cx="50" cy="46" r="3" fill="#10b981" />
                                    </svg>
                                  )
                                },
                                {
                                  id: 6,
                                  name: "Funnel 漏斗图",
                                  pyClass: "Funnel",
                                  category: "基础典型",
                                  desc: "漏斗图常用于展示业务流程转化路径，如教育招生转化率（浏览-注册-缴费-进阶学习）。",
                                  code: `from pyecharts.charts import Funnel\n\nfunnel = Funnel().add("转化率", [("浏览量", 100), ("咨询量", 60), ("缴费量", 30)])`,
                                  render: () => (
                                    <svg className="w-full h-full p-2" viewBox="0 0 100 60">
                                      <polygon points="12,6 88,6 74,18 26,18" fill="#3b82f6" opacity="0.9" />
                                      <polygon points="26,20 74,20 60,32 40,32" fill="#10b981" opacity="0.9" />
                                      <polygon points="40,34 60,34 49,46 51,46" fill="#f59e0b" opacity="0.9" />
                                      <polygon points="49,48 51,48 50,56 50,56" fill="#ef4444" opacity="0.9" />
                                    </svg>
                                  )
                                },
                                {
                                  id: 7,
                                  name: "Gauge 仪表盘",
                                  pyClass: "Gauge",
                                  category: "基础典型",
                                  desc: "直观展示单一核心KPI（健康水平、设备负荷率、实验进度达成）实时测量读数状态。",
                                  code: `from pyecharts.charts import Gauge\n\ngauge = Gauge().add("负荷度", [("CPU利用率", 75.8)])`,
                                  render: () => (
                                    <svg className="w-full h-full p-2" viewBox="0 0 100 60">
                                      <path d="M22,48 A28,28 0 0,1 78,48" fill="none" stroke="#f1f5f9" strokeWidth="8" strokeLinecap="round" />
                                      <path d="M22,48 A28,28 0 0,1 66,23" fill="none" stroke="#6366f1" strokeWidth="8" strokeLinecap="round" />
                                      <line x1="50" y1="48" x2="68" y2="24" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                                      <circle cx="50" cy="48" r="4" fill="#1e293b" />
                                    </svg>
                                  )
                                },
                                {
                                  id: 8,
                                  name: "PictorialBar 象形柱",
                                  pyClass: "PictorialBar",
                                  category: "基础典型",
                                  desc: "使用创意、拟物象形化图标符号堆叠代替普通纯色矩形条作为柱体，增强行业定制氛围特色。",
                                  code: `from pyecharts.charts import PictorialBar\n\npb = PictorialBar().add_xaxis(["A", "B"]).add_yaxis("象形", [3, 5])`,
                                  render: () => (
                                    <svg className="w-full h-full p-2" viewBox="0 0 100 60">
                                      <g fill="#3b82f6">
                                        <rect x="25" y="44" width="8" height="8" rx="1" />
                                        <rect x="25" y="34" width="8" height="8" rx="1" />
                                        <rect x="25" y="24" width="8" height="8" rx="1" />
                                      </g>
                                      <g fill="#ec4899">
                                        <rect x="65" y="44" width="8" height="8" rx="1" />
                                        <rect x="65" y="34" width="8" height="8" rx="1" />
                                        <rect x="65" y="24" width="8" height="8" rx="1" />
                                        <rect x="65" y="14" width="8" height="8" rx="1" />
                                      </g>
                                      <line x1="5" y1="54" x2="95" y2="54" stroke="#e2e8f0" />
                                    </svg>
                                  )
                                },
                                {
                                  id: 9,
                                  name: "Boxplot 箱形图",
                                  pyClass: "Boxplot",
                                  category: "基础典型",
                                  desc: "箱线图专为汇总展现多维偏态数据集分布特性而设计，呈现最大值、Q3、中位数、Q1及最小值分布。",
                                  code: `from pyecharts.charts import Boxplot\n\nbox = Boxplot().add_xaxis(["A组"]).add_yaxis("指数", [[12, 18, 22, 28, 35]])`,
                                  render: () => (
                                    <svg className="w-full h-full p-2" viewBox="0 0 100 60">
                                      <line x1="25" y1="12" x2="75" y2="12" stroke="#334155" />
                                      <line x1="50" y1="12" x2="50" y2="20" stroke="#334155" />
                                      <rect x="36" y="20" width="28" height="22" fill="#fff" stroke="#334155" strokeWidth="1.8" />
                                      <line x1="36" y1="31" x2="64" y2="31" stroke="#ef4444" strokeWidth="2" />
                                      <line x1="50" y1="42" x2="50" y2="50" stroke="#334155" />
                                      <line x1="25" y1="50" x2="75" y2="50" stroke="#334155" />
                                    </svg>
                                  )
                                },
                                {
                                  id: 10,
                                  name: "Grid 组合图",
                                  pyClass: "Grid",
                                  category: "基础典型",
                                  desc: "将多个完全独立的坐标系实例强行并行定位并塞入一个共用的画布中，支持左右对齐、上下错落。",
                                  code: `from pyecharts.charts import Grid\n\ngrid = Grid()\n# 可以通过 grid.add(chart_a, grid_opts) 强行拼接`,
                                  render: () => (
                                    <svg className="w-full h-full p-2" viewBox="0 0 100 60">
                                      <rect x="5" y="8" width="40" height="42" fill="none" stroke="#cbd5e1" strokeDasharray="2" rx="2" />
                                      <rect x="55" y="8" width="40" height="42" fill="none" stroke="#cbd5e1" strokeDasharray="2" rx="2" />
                                      <path d="M8,42 Q20,15 42,39" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
                                      <rect x="65" y="18" width="7" height="28" fill="#10b981" />
                                      <rect x="79" y="26" width="7" height="20" fill="#f59e0b" />
                                    </svg>
                                  )
                                },
                                {
                                  id: 11,
                                  name: "Graph 关系图",
                                  pyClass: "Graph",
                                  category: "关系与树型",
                                  desc: "关系网络拓扑图，常用于展示人员隶属网络、软件系统调用拓扑、传感器组网通讯链路等实体联系。",
                                  code: `from pyecharts.charts import Graph\n\ngraph = Graph().add("拓扑", [{"name": "A"}, {"name": "B"}], [{"source": "A", "target": "B"}])`,
                                  render: () => (
                                    <svg className="w-full h-full p-2" viewBox="0 0 100 60">
                                      <line x1="50" y1="30" x2="20" y2="15" stroke="#cbd5e1" strokeWidth="1.8" />
                                      <line x1="50" y1="30" x2="80" y2="20" stroke="#cbd5e1" strokeWidth="1.8" />
                                      <line x1="50" y1="30" x2="40" y2="48" stroke="#cbd5e1" strokeWidth="1.8" />
                                      <circle cx="50" cy="30" r="7" fill="#4f46e5" />
                                      <circle cx="20" cy="15" r="5" fill="#10b981" />
                                      <circle cx="80" cy="20" r="5.5" fill="#f59e0b" />
                                      <circle cx="40" cy="48" r="4.5" fill="#ec4899" />
                                    </svg>
                                  )
                                },
                                {
                                  id: 12,
                                  name: "Tree 树图",
                                  pyClass: "Tree",
                                  category: "关系与树型",
                                  desc: "经典的单向分级演进树图。展示类目由树根到叶子结点的清晰父子关系，结构井然有序。",
                                  code: `from pyecharts.charts import Tree\n\ntree = Tree().add("知识树", [data])`,
                                  render: () => (
                                    <svg className="w-full h-full p-2" viewBox="0 0 100 60">
                                      <path d="M12,30 C30,30 30,15 52,15 C30,30 30,45 52,45 M52,15 C68,15 68,8 84,8 M52,15 C68,15 68,22 84,22" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
                                      <circle cx="12" cy="30" r="4" fill="#e11d48" />
                                      <circle cx="52" cy="15" r="3.5" fill="#2563eb" />
                                      <circle cx="52" cy="45" r="3.5" fill="#2563eb" />
                                      <circle cx="84" cy="8" r="3" fill="#10b981" />
                                      <circle cx="84" cy="22" r="3" fill="#10b981" />
                                    </svg>
                                  )
                                },
                                {
                                  id: 13,
                                  name: "TreeMap 矩形树树图",
                                  pyClass: "TreeMap",
                                  category: "关系与树型",
                                  desc: "矩形嵌套图，主要用于多层树状层级属性的多级结构分析，以及表示大颗粒下的组成面积对比。",
                                  code: `from pyecharts.charts import TreeMap\n\ntm = TreeMap().add("资产层级", [data])`,
                                  render: () => (
                                    <div className="w-full h-full p-1.5 grid grid-cols-3 grid-rows-3 gap-1">
                                      <div className="col-span-2 row-span-2 bg-indigo-600 text-[8px] text-white flex items-center justify-center font-bold rounded">架构: 60%</div>
                                      <div className="bg-emerald-600 text-[8px] text-white flex items-center justify-center font-bold rounded">测试: 20%</div>
                                      <div className="bg-amber-600 text-[8px] text-white flex items-center justify-center font-bold rounded">运维: 10%</div>
                                      <div className="bg-fuchsia-600 text-[8px] text-white flex items-center justify-center font-bold rounded">微服务</div>
                                      <div className="col-span-2 bg-pink-600 text-[8px] text-white flex items-center justify-center font-bold rounded">安全: 8%</div>
                                    </div>
                                  )
                                },
                                {
                                  id: 14,
                                  name: "Sankey 桑基图",
                                  pyClass: "Sankey",
                                  category: "关系与树型",
                                  desc: "河流能量汇集桑基图。高度适用于分析能源流向消耗、资金往来支出流转等守恒物理流变关系。",
                                  code: `from pyecharts.charts import Sankey\n\nsankey = Sankey().add("流程分配", nodes, links)`,
                                  render: () => (
                                    <svg className="w-full h-full p-2" viewBox="0 0 100 60">
                                      <path d="M15,15 C45,15 35,45 65,45 M15,45 C45,45 35,15 65,15" fill="none" stroke="#e0f2fe" strokeWidth="10" opacity="0.6" />
                                      <rect x="10" y="8" width="5" height="18" fill="#2563eb" rx="1" />
                                      <rect x="10" y="32" width="5" height="20" fill="#10b981" rx="1" />
                                      <rect x="65" y="8" width="5" height="14" fill="#f59e0b" rx="1" />
                                      <rect x="65" y="28" width="5" height="24" fill="#84cc16" rx="1" />
                                    </svg>
                                  )
                                },
                                {
                                  id: 15,
                                  name: "Sunburst 旭日图",
                                  pyClass: "Sunburst",
                                  category: "关系与树型",
                                  desc: "基于同心圆环带结构向四周进行发散性分支展开，将树形各层次的相对贡献面积展示得唯美深刻。",
                                  code: `from pyecharts.charts import Sunburst\n\nsun = Sunburst().add("产品层级", [data])`,
                                  render: () => (
                                    <svg className="w-full h-full p-2" viewBox="0 0 100 60">
                                      <circle cx="50" cy="30" r="8" fill="#fff" stroke="#f1f5f9" />
                                      <circle cx="50" cy="30" r="15" fill="none" stroke="#3b82f6" strokeWidth="4" strokeDasharray="22 4 40 4 25" />
                                      <circle cx="50" cy="30" r="22" fill="none" stroke="#10b981" strokeWidth="5" strokeDasharray="12 2 18 2 35 2 15" />
                                    </svg>
                                  )
                                },
                                {
                                  id: 16,
                                  name: "Parallel 平行系",
                                  pyClass: "Parallel",
                                  category: "关系与树型",
                                  desc: "将多个数值维平行放置成纵向测量系，支持展现某些具有几十个变量维的数据实体分布连线模式。",
                                  code: `from pyecharts.charts import Parallel\n\npa = Parallel().add_schema(schemas).add("线", [data1, data2])`,
                                  render: () => (
                                    <svg className="w-full h-full p-2" viewBox="0 0 100 60">
                                      <line x1="25" y1="5" x2="25" y2="55" stroke="#94a3b8" strokeWidth="1.5" />
                                      <line x1="50" y1="5" x2="50" y2="55" stroke="#94a3b8" strokeWidth="1.5" />
                                      <line x1="75" y1="5" x2="75" y2="55" stroke="#94a3b8" strokeWidth="1.5" />
                                      <path d="M25,12 L50,35 L75,18" fill="none" stroke="#ec4899" strokeWidth="1.8" opacity="0.8" />
                                      <path d="M25,44 L50,15 L75,39" fill="none" stroke="#3b82f6" strokeWidth="1.8" opacity="0.8" />
                                      <path d="M25,28 L50,48 L75,10" fill="none" stroke="#10b981" strokeWidth="1.8" opacity="0.8" />
                                    </svg>
                                  )
                                },
                                {
                                  id: 17,
                                  name: "Map 地图",
                                  pyClass: "Map",
                                  category: "多维坐标与地图",
                                  desc: "地理热力统计地图，常用于直观显示省级、市级行政单位指标、销售业绩、气温多级分布情况。",
                                  code: `from pyecharts.charts import Map\n\nmatch_map = Map().add("人口密度", [("广东", 120), ("北京", 90)], "china")`,
                                  render: () => (
                                    <svg className="w-full h-full p-2" viewBox="0 0 100 60" fill="none">
                                      <path d="M 15,35 Q 35,45 50,30 T 80,40 T 70,12 Q 40,5 20,15 Z" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.5" />
                                      <circle cx="35" cy="30" r="3.5" fill="#ef4444" />
                                      <circle cx="65" cy="22" r="3" fill="#3b82f6" />
                                    </svg>
                                  )
                                },
                                {
                                  id: 18,
                                  name: "Geo 地理图",
                                  pyClass: "Geo",
                                  category: "多维坐标与地图",
                                  desc: "可嵌入散点、气泡热力图、路径连线的专业空间底图展示方案，常用于展现物流运输连线。",
                                  code: `from pyecharts.charts import Geo\n\ngeo = Geo().add_schema(maptype="china").add("运输点", [("北京", 100)])`,
                                  render: () => (
                                    <svg className="w-full h-full p-2" viewBox="0 0 100 60">
                                      <path d="M12,45 L40,25 Q65,15 88,40" stroke="#f1f5f9" strokeWidth="3" fill="none" />
                                      <path d="M12,45 Q40,25 88,38" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3" fill="none" />
                                      <circle cx="40" cy="25" r="4.5" fill="#ef4444" opacity="0.2" className="animate-pulse" />
                                      <circle cx="40" cy="25" r="1.5" fill="#ef4444" />
                                      <circle cx="75" cy="34" r="3.5" fill="#3b82f6" opacity="0.2" className="animate-pulse" />
                                      <circle cx="75" cy="34" r="1.5" fill="#3b82f6" />
                                    </svg>
                                  )
                                },
                                {
                                  id: 19,
                                  name: "BMap 百度地图",
                                  pyClass: "BMap",
                                  category: "多维坐标与地图",
                                  desc: "完美支持与外部第三方百度地图API无缝交互，作为高级背景卫星瓦片底图进行复杂地理数据流呈现。",
                                  code: `from pyecharts.charts import BMap\n\n_bmap = BMap().add_schema(baidu_ak="密钥", center=[120.13, 30.27])`,
                                  render: () => (
                                    <div className="w-full h-full relative radial-dotted bg-slate-50">
                                      <div className="absolute inset-0 flex items-center justify-center p-2">
                                        <div className="w-full h-full bg-white/90 border border-indigo-200 rounded p-1.5 text-[8px] font-bold text-indigo-800 flex flex-col justify-between shadow-sm">
                                          <div>📍 百度瓦片 GIS 底图层</div>
                                          <span className="text-[7.5px] scale-90 text-zinc-400 font-mono text-right inline-block">lat:31.23, lng:121.47</span>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                },
                                {
                                  id: 20,
                                  name: "Bar3D 3D柱图",
                                  pyClass: "Bar3D",
                                  category: "多维坐标与地图",
                                  desc: "利用3D透视投影效果展示三维网格面上的多柱统计量，立体感与维度张力感极强。",
                                  code: `from pyecharts.charts import Bar3D\n\nbar3d = Bar3D().add("三维", data_3d)`,
                                  render: () => (
                                    <svg className="w-full h-full p-2" viewBox="0 0 100 60">
                                      <path d="M15,48 L50,28 L85,48 L50,56 Z" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.8" />
                                      <g transform="translate(0,-6)">
                                        <polygon points="35,38 45,33 45,15 35,20" fill="#3b82f6" />
                                        <polygon points="45,33 55,38 55,20 45,15" fill="#1d4ed8" />
                                        <polygon points="35,20 45,15 55,20 45,25" fill="#60a5fa" />
                                      </g>
                                      <g transform="translate(14,6)">
                                        <polygon points="35,38 45,33 45,23 35,28" fill="#10b981" />
                                        <polygon points="45,33 55,38 55,28 45,23" fill="#047857" />
                                        <polygon points="35,30 45,25 55,30 45,35" fill="#34d399" />
                                      </g>
                                    </svg>
                                  )
                                },
                                {
                                  id: 21,
                                  name: "Line3D 3D折线",
                                  pyClass: "Line3D",
                                  category: "多维坐标与地图",
                                  desc: "在三维直角空间系中刻画立体运动轨迹（如螺旋轨迹、气流流动路径），提供无限方向审视角度。",
                                  code: `from pyecharts.charts import Line3D\n\nline3d = Line3D().add("螺旋轨迹", [[t, cos_t, sin_t]])`,
                                  render: () => (
                                    <svg className="w-full h-full p-2" viewBox="0 0 100 60">
                                      <rect x="15" y="6" width="70" height="48" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                                      <path d="M20,44 C32,46 32,18 48,22 C64,26 64,6 78,12 C82,14 85,34 90,38" fill="none" stroke="#ec4899" strokeWidth="2.2" />
                                    </svg>
                                  )
                                },
                                {
                                  id: 22,
                                  name: "Scatter3D 3D散点",
                                  pyClass: "Scatter3D",
                                  category: "多维坐标与地图",
                                  desc: "三维空间离散粒子，支持与VisualMap多级别绑定，形成对多元多变量实体分段的高维对比展示。",
                                  code: `from pyecharts.charts import Scatter3D\n\nsc3d = Scatter3D().add("宇宙粒子", data_list)`,
                                  render: () => (
                                    <svg className="w-full h-full p-2" viewBox="0 0 100 60" fill="none">
                                      <path d="M12,42 L48,15 L88,42 Z" stroke="#e2e8f0" strokeWidth="1.2" />
                                      <circle cx="36" cy="28" r="4.5" fill="#ef4444" opacity="0.8" />
                                      <circle cx="56" cy="20" r="7" fill="#3b82f6" opacity="0.65" />
                                      <circle cx="44" cy="38" r="3.5" fill="#10b981" opacity="0.8" />
                                    </svg>
                                  )
                                },
                                {
                                  id: 23,
                                  name: "Surface3D 3D曲面",
                                  pyClass: "Surface3D",
                                  category: "多维坐标与地图",
                                  desc: "对包含高程或势场信息的数学公式进行WebGL建模展示，曲面连续渐变，拥有高度专业的技术视觉效果。",
                                  code: `from pyecharts.charts import Surface3D\n\nsf3d = Surface3D().add("势能面", val_pairs)`,
                                  render: () => (
                                    <svg className="w-full h-full p-2" viewBox="0 0 100 60" fill="none">
                                      <path d="M 12,38 Q 32,8 52,23 T 88,8 M 12,46 Q 32,16 52,31 T 88,16" stroke="#3b82f6" strokeWidth="1.2" opacity="0.4" />
                                      <path d="M 12,38 L 12,46 M 52,23 L 52,31 M 88,8 L 88,16" stroke="#3b82f6" opacity="0.4" />
                                      <path d="M12,42 Q32,12 52,27 T 88,12" stroke="#e11d48" strokeWidth="2.2" />
                                    </svg>
                                  )
                                },
                                {
                                  id: 24,
                                  name: "Radar 雷达图",
                                  pyClass: "Radar",
                                  category: "高级组合",
                                  desc: "雷达蛛网图，用于对特定多维度核心素质进行综合评估（如学生学科六边形、公司业务链成熟度）。",
                                  code: `from pyecharts.charts import Radar\n\nradar = Radar().add_schema(schema).add("评分", [[90, 85, 75, 80, 95]])`,
                                  render: () => (
                                    <svg className="w-full h-full p-2" viewBox="0 0 100 60">
                                      <polygon points="50,5 82,22 72,52 28,52 18,22" fill="none" stroke="#cbd5e1" strokeWidth="1.2" />
                                      <polygon points="50,15 72,28 66,46 34,46 28,28" fill="none" stroke="#e2e8f0" />
                                      <polygon points="50,12 68,28 55,42 40,43 32,25" fill="#3b82f6" fillOpacity="0.22" stroke="#3b82f6" strokeWidth="1.8" />
                                    </svg>
                                  )
                                },
                                {
                                  id: 25,
                                  name: "HeatMap 热力图",
                                  pyClass: "HeatMap",
                                  category: "高级组合",
                                  desc: "二维坐标热力点阵分布图，通过格点色调冷暖深浅实时记录数值分布密集度或周期规律。",
                                  code: `from pyecharts.charts import HeatMap\n\nhm = HeatMap().add_xaxis(x).add_yaxis("分布", data)`,
                                  render: () => (
                                    <div className="w-full h-full p-2 grid grid-cols-5 grid-rows-5 gap-0.5">
                                      <div className="bg-red-500 rounded-sm" />
                                      <div className="bg-red-300 rounded-sm" />
                                      <div className="bg-orange-200 rounded-sm" />
                                      <div className="bg-yellow-100 rounded-sm" />
                                      <div className="bg-yellow-50 rounded-sm" />
                                      <div className="bg-red-400 rounded-sm" />
                                      <div className="bg-red-200 rounded-sm" />
                                      <div className="bg-orange-100 rounded-sm" />
                                      <div className="bg-yellow-100 rounded-sm" />
                                      <div className="bg-zinc-100 rounded-sm" />
                                      <div className="bg-orange-300 rounded-sm" />
                                      <div className="bg-orange-100 rounded-sm" />
                                      <div className="bg-yellow-50 rounded-sm" />
                                      <div className="bg-zinc-50 rounded-sm" />
                                      <div className="bg-zinc-50 rounded-sm" />
                                      <div className="bg-yellow-100 rounded-sm" />
                                      <div className="bg-yellow-50 rounded-sm" />
                                      <div className="bg-zinc-50 rounded-sm" />
                                      <div className="bg-zinc-50 rounded-sm" />
                                      <div className="bg-zinc-50 rounded-sm" />
                                      <div className="bg-yellow-50 rounded-sm" />
                                      <div className="bg-zinc-50 rounded-sm" />
                                      <div className="bg-zinc-50 rounded-sm" />
                                      <div className="bg-zinc-50 rounded-sm" />
                                      <div className="bg-zinc-50 rounded-sm" />
                                    </div>
                                  )
                                },
                                {
                                  id: 26,
                                  name: "WordCloud 词云",
                                  pyClass: "WordCloud",
                                  category: "高级组合",
                                  desc: "高权重词句多维空间碰撞。常用于展现舆情报告关键词提炼、网络检索高频词汇总。",
                                  code: `from pyecharts.charts import WordCloud\n\nwc = WordCloud().add("词汇", [("AI", 100), ("IoT", 80), ("Studio", 60)])`,
                                  render: () => (
                                    <div className="w-full h-full p-1.5 flex flex-wrap gap-1 items-center justify-center font-black select-none text-center">
                                      <span className="text-[11px] text-blue-600">TensorFlow</span>
                                      <span className="text-[8px] text-green-500 rotate-12">AI</span>
                                      <span className="text-[12px] text-red-500 -rotate-6">LSTM</span>
                                      <span className="text-[7px] text-purple-600">Predict</span>
                                      <span className="text-[9px] text-amber-500">Keras</span>
                                      <span className="text-[7px] text-cyan-500">Model</span>
                                      <span className="text-[10px] text-teal-600 rotate-45">IoT</span>
                                    </div>
                                  )
                                },
                                {
                                  id: 27,
                                  name: "Liquid 水球图",
                                  pyClass: "Liquid",
                                  category: "高级组合",
                                  desc: "极具动感张力波澜的水平显示，配合平缓起伏波动效果完美监控百分比完成进度指标。",
                                  code: `from pyecharts.charts import Liquid\n\nliquid = Liquid().add("水位", [0.63])`,
                                  render: () => (
                                    <svg className="w-full h-full p-2" viewBox="0 0 100 60">
                                      <circle cx="50" cy="30" r="21" fill="#f8fafc" stroke="#6366f1" strokeWidth="1.5" />
                                      <path d="M 31,34 Q 40.5,30 50,35.5 T 69,32 C 69,45 61,51 50,51 C 39,51 31,43 31,34" fill="#3b82f6" fillOpacity="0.8" />
                                      <text x="50" y="34" fontSize="8.5" fontWeight="900" fill="#1e293b" textAnchor="middle">63.2%</text>
                                    </svg>
                                  )
                                },
                                {
                                  id: 28,
                                  name: "ThemeRiver 主题河",
                                  pyClass: "ThemeRiver",
                                  category: "高级组合",
                                  desc: "主题河图主要用于分析连续阶段性事件，各主题指标随时间膨胀、收缩流动，宛如流淌的时光之河。",
                                  code: `from pyecharts.charts import ThemeRiver\n\ntr = ThemeRiver().add("主题", data_river)`,
                                  render: () => (
                                    <svg className="w-full h-full p-2" viewBox="0 0 100 60">
                                      <path d="M 10,28 Q 30,13 50,33 T 90,28 L 90,36 Q 70,43 50,20 T 10,36 Z" fill="#818cf8" opacity="0.85" />
                                      <path d="M 10,22 Q 30,10 50,28 T 90,23 L 90,28 Q 70,33 50,33 T 10,28 Z" fill="#34d399" opacity="0.85" />
                                    </svg>
                                  )
                                },
                                {
                                  id: 29,
                                  name: "Calendar 日历图",
                                  pyClass: "Calendar",
                                  category: "高级组合",
                                  desc: "日历贡献度热力格子系统，常用于直观追踪用户打卡满勤度、Github代码库代码提交活跃密集趋势。",
                                  code: `from pyecharts.charts import Calendar\n\ncal = Calendar().add("打卡", data_cal)`,
                                  render: () => (
                                    <div className="w-full h-full p-1.5 flex flex-col gap-0.5 justify-center">
                                      {[0, 1, 2, 3].map((i) => (
                                        <div className="flex gap-0.5 justify-center" key={i}>
                                          {Array.from({ length: 9 }).map((_, j) => {
                                            const isDense = (i + j) % 3 === 0;
                                            const isPeak = (i + j) % 5 === 0;
                                            return (
                                              <div
                                                key={j}
                                                className={`w-2.5 h-2.5 rounded-sm ${
                                                  isPeak ? "bg-emerald-600" : isDense ? "bg-emerald-300" : "bg-zinc-100"
                                                }`}
                                              />
                                            );
                                          })}
                                        </div>
                                      ))}
                                    </div>
                                  )
                                },
                                {
                                  id: 30,
                                  name: "Timeline 时间轴",
                                  pyClass: "Timeline",
                                  category: "高级组合",
                                  desc: "配合时间流演进，搭载轮播与自动进度条驱动，动态平滑展示关联图表随周期进度的数值流动转换。",
                                  code: `from pyecharts.charts import Timeline\n\ntimeline = Timeline()\ntimeline.add(chart_a, "2024").add(chart_b, "2025")`,
                                  render: () => (
                                    <div className="w-full h-full flex flex-col justify-center items-center gap-1.5 p-1">
                                      <div className="flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                                        <span className="text-[9px] text-zinc-500 font-bold">2026 演化序列</span>
                                      </div>
                                      <div className="h-0.5 bg-blue-100 w-4/5 rounded flex justify-between items-center relative">
                                        <div className="w-2 h-2 rounded-full bg-blue-600" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white shadow-md" />
                                        <div className="w-2 h-2 rounded-full bg-blue-300" />
                                      </div>
                                    </div>
                                  )
                                }
                              ];

                              // Filter and search computation
                              const filteredList = galleryCharts.filter((chart) => {
                                const matchesSearch = chart.name.toLowerCase().includes(gallerySearchTerm.toLowerCase()) || 
                                                     chart.pyClass.toLowerCase().includes(gallerySearchTerm.toLowerCase()) ||
                                                     chart.desc.includes(gallerySearchTerm);
                                const matchesCategory = galleryFilterCategory === "全部" || chart.category === galleryFilterCategory;
                                return matchesSearch && matchesCategory;
                              });

                              return (
                                <div className="w-full bg-white border border-zinc-200 rounded-lg p-5 font-sans space-y-4 select-none shadow-sm animate-fadeIn">
                                  
                                  {/* Section Title & Toolbar */}
                                  <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-3 gap-3">
                                    <div>
                                      <h4 className="text-sm font-black flex items-center gap-2 text-zinc-800">
                                        <span className="bg-emerald-550 w-2.5 h-2.5 rounded-full bg-[#10A66A] animate-pulse" />
                                        <span>pyecharts 核心图表库全景展示厅 (30大核心类目)</span>
                                      </h4>
                                      <p className="text-[10.5px] text-zinc-400 mt-0.5">提供30张深度全功能的模拟渲染及对应 Python 一键出图 option 原生配置配置参考</p>
                                    </div>
                                    <div className="text-[10.5px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                                      版本: v2.0.4.x LTS (已集成 WebGL 3D 渲染器)
                                    </div>
                                  </div>

                                  {/* Filter Buttons & Search row */}
                                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-50 p-2.5 rounded-lg border border-zinc-150">
                                    
                                    {/* Category Toggles */}
                                    <div className="flex flex-wrap gap-1.5">
                                      {["全部", "基础典型", "关系与树型", "多维坐标与地图", "高级组合"].map((cat) => {
                                        const count = cat === "全部" ? galleryCharts.length : galleryCharts.filter(c => c.category === cat).length;
                                        const isActive = galleryFilterCategory === cat;
                                        return (
                                          <button
                                            key={cat}
                                            onClick={() => {
                                              setGalleryFilterCategory(cat);
                                              triggerToastMsg(`已过滤分类: ${cat}`);
                                            }}
                                            className={`px-2.5 py-1 text-xs font-black rounded-md transition-all cursor-pointer ${
                                              isActive 
                                                ? "bg-zinc-850 text-white bg-zinc-900 border border-zinc-900" 
                                                : "bg-white text-zinc-650 hover:bg-zinc-100 border border-zinc-200"
                                            }`}
                                          >
                                            {cat} <span className="text-[10px] opacity-70">({count})</span>
                                          </button>
                                        );
                                      })}
                                    </div>

                                    {/* Search input bar */}
                                    <div className="relative flex-1 max-w-[240px]">
                                      <input
                                        type="text"
                                        placeholder="🔍 输入关键字搜索图表..."
                                        value={gallerySearchTerm}
                                        onChange={(e) => setGallerySearchTerm(e.target.value)}
                                        className="w-full pl-7 pr-3 py-1 text-xs border border-zinc-250 bg-white rounded-md text-zinc-800 focus:outline-none focus:border-emerald-500 font-extrabold focus:ring-1 focus:ring-emerald-200"
                                      />
                                      {gallerySearchTerm && (
                                        <button 
                                          onClick={() => setGallerySearchTerm("")} 
                                          className="absolute right-2.5 top-1.5 text-zinc-450 hover:text-zinc-600 text-[10px] font-bold"
                                        >
                                          ✕
                                        </button>
                                      )}
                                    </div>

                                  </div>

                                  {/* Responsive Visualized 30-Chart Grid */}
                                  {filteredList.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[500px] overflow-y-auto pr-1">
                                      {filteredList.map((chart) => (
                                        <div
                                          key={chart.id}
                                          onClick={() => {
                                            setSelectedGalleryChart(chart);
                                            triggerToastMsg(`已开启 ${chart.name} 交互细节面板`);
                                          }}
                                          className="bg-white border border-zinc-200 hover:border-[#10A66A] rounded-lg p-2 flex flex-col justify-between hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer select-none relative group h-[145px]"
                                        >
                                          {/* Mini Indicator */}
                                          <div className="absolute top-1.5 left-1.5 text-[9px] font-bold bg-zinc-100 text-zinc-550 border border-zinc-200/60 px-1 py-0.2 rounded-md shadow-sm opacity-80 group-hover:opacity-100 transition-opacity">
                                            #{chart.id}
                                          </div>

                                          <div className="absolute top-1.5 right-1.5 text-[9px] font-black pointer-events-none text-zinc-300 group-hover:text-[#10A66A] transition-colors">
                                            点击查看 ↗
                                          </div>

                                          {/* Chart Visual Simulation Frame Area */}
                                          <div className="flex-1 w-full bg-zinc-50 rounded-md flex items-center justify-center p-1.5 select-none overflow-hidden mt-6 border border-zinc-100 relative group-hover:bg-zinc-100/50 transition-colors">
                                            <div className="w-full h-full flex items-center justify-center">
                                              {chart.render()}
                                            </div>
                                          </div>

                                          {/* Text labels */}
                                          <div className="pt-2 select-none border-t border-zinc-100 mt-1.5 flex items-center justify-between">
                                            <div className="truncate">
                                              <span className="text-[10px] text-zinc-400 block font-mono font-bold leading-none mb-0.5">{chart.pyClass}</span>
                                              <span className="text-[11px] font-bold text-zinc-800 leading-tight block truncate pr-1">{chart.name.split(" ")[1] || chart.name}</span>
                                            </div>
                                            <span className={`text-[8.5px] px-1 py-0.2 border rounded-full shrink-0 font-bold ${
                                              chart.category === "基础典型" ? "bg-blue-50 text-blue-600 border-blue-100" :
                                              chart.category === "关系与树型" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                              chart.category === "多维坐标与地图" ? "bg-violet-50 text-violet-600 border-violet-100" :
                                              "bg-amber-50 text-amber-600 border-amber-100"
                                            }`}>
                                              {chart.category.slice(0, 2)}
                                            </span>
                                          </div>

                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="border border-dashed p-10 text-center rounded-lg bg-zinc-50 text-zinc-450 text-xs font-bold leading-loose">
                                      🔍 未找到符合条件 “<span className="text-[#10A66A]">{gallerySearchTerm}</span>” 的图表。<br/>
                                      <span className="text-[10px] text-zinc-400">试试：折线、3D、柱、树、Liquid、地图、Sankey等核心词汇</span>
                                    </div>
                                  )}

                                  {/* Detailed Popup Model Overlay */}
                                  {selectedGalleryChart && (
                                    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn select-all">
                                      <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl border border-zinc-300 relative flex flex-col max-h-[85vh] overflow-hidden select-text animate-slideUp">
                                        
                                        {/* Modal title */}
                                        <div className="flex items-start justify-between border-b border-zinc-200 pb-3">
                                          <div>
                                            <div className="flex items-center gap-2">
                                              <span className="bg-zinc-100 text-[10px] text-zinc-500 font-extrabold px-1.5 py-0.3 rounded border border-zinc-250">
                                                ID: #{selectedGalleryChart.id} | {selectedGalleryChart.category}
                                              </span>
                                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            </div>
                                            <h3 className="text-base font-extrabold text-zinc-800 mt-1 select-none">
                                              pyecharts.charts.{selectedGalleryChart.pyClass} — {selectedGalleryChart.name}
                                            </h3>
                                          </div>
                                          <button
                                            onClick={() => setSelectedGalleryChart(null)}
                                            className="p-1 px-2.5 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-550 border rounded-md cursor-pointer text-xs font-bold transition-all hover:scale-105 active:scale-95 select-none"
                                          >
                                            ✕ 关闭窗口
                                          </button>
                                        </div>

                                        <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1">
                                          
                                          {/* Magnified simulation chart view */}
                                          <div>
                                            <label className="text-[10.5px] font-black text-zinc-400 block mb-1 uppercase select-none">📊 视觉高保真预览</label>
                                            <div className="border border-dashed border-zinc-300 rounded-lg bg-zinc-50/50 p-6 flex flex-col items-center justify-center min-h-[180px] shadow-inner select-none relative group overflow-hidden">
                                              <div className="w-48 h-32 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-505 select-none">
                                                {selectedGalleryChart.render()}
                                              </div>
                                              <div className="absolute bottom-2 text-[9.5px] text-zinc-400 select-none">本组件由沙箱内置 React 极简向量物理引擎完美渲染驱动</div>
                                            </div>
                                          </div>

                                          {/* Description description text */}
                                          <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200">
                                            <label className="text-[10.5px] font-black text-[#10A66A] block mb-1 uppercase select-none">💡 图表面型说明</label>
                                            <p className="text-xs text-zinc-700 leading-relaxed font-bold">{selectedGalleryChart.desc}</p>
                                          </div>

                                          {/* Generated options python sample code block */}
                                          <div>
                                            <div className="flex items-center justify-between mb-1 select-none">
                                              <label className="text-[10.5px] font-black text-zinc-400 block uppercase">🐍 Python 原生一键出图代码</label>
                                              <button
                                                onClick={() => {
                                                  navigator.clipboard.writeText(selectedGalleryChart.code);
                                                  triggerToastMsg(`《${selectedGalleryChart.pyClass} 样例代码》已拷贝到剪贴板！`);
                                                }}
                                                className="text-[10.5px] font-black text-blue-600 hover:text-blue-800 transition flex items-center gap-1 bg-blue-50 border border-blue-200 px-1.5 py-0.3 rounded shadow-xs"
                                              >
                                                📋 复制本段代码
                                              </button>
                                            </div>
                                            <pre className="text-[11px] font-mono bg-zinc-900 text-zinc-100 p-3.5 rounded-lg overflow-x-auto leading-relaxed border shadow font-medium">
                                              {selectedGalleryChart.code}
                                            </pre>
                                          </div>

                                        </div>

                                        {/* Modal Footer */}
                                        <div className="border-t border-zinc-200 pt-3 select-none flex justify-between items-center bg-zinc-50 -mx-6 -mb-6 p-4 rounded-b-xl border">
                                          <div className="text-[10px] text-zinc-550 font-bold">
                                            已加载主题: <span className="text-indigo-700 font-extrabold">{pyeConfigTheme === "dark" ? "Dark (暗黑黑)" : "Light (明亮白)"}</span> 与交互配置。
                                          </div>
                                          <button
                                            onClick={() => setSelectedGalleryChart(null)}
                                            className="px-4 py-1 bg-zinc-900 border text-white hover:bg-zinc-800 text-xs font-black rounded-md block cursor-pointer transition shadow-sm active:scale-95"
                                          >
                                            确定已悉知
                                          </button>
                                        </div>

                                      </div>
                                    </div>
                                  )}

                                </div>
                              );
                            })()}

                            {/* PYECHARTS OUTPUT 2: Interactive Line Chart */}
                            {cell.outputMarkup === "pye-line" && (
                              <div className={`w-full border rounded-lg p-5 font-sans relative ${pyeConfigTheme === "dark" ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-zinc-200 text-zinc-800"} select-none`}>
                                
                                {/* Title and Toolbars Row */}
                                <div className="flex items-center justify-between mb-4">
                                  <div>
                                    <h4 className="text-sm font-extrabold flex items-center gap-1">
                                      <span>成绩变化趋势折线图</span>
                                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">Line</span>
                                    </h4>
                                    <p className="text-[10.5px] text-zinc-400">pyecharts.charts.Line</p>
                                  </div>

                                  {/* Toolbox simulated icons (Only shown if pyeConfigToolbox) */}
                                  {pyeConfigToolbox && (
                                    <div className="flex items-center gap-2 bg-zinc-100/10 p-1 rounded-md border border-zinc-200/20 text-zinc-500 text-xs">
                                      <button onClick={() => triggerToastMsg("已导出图片成绩变化趋势.png")} className="p-1 hover:text-[#10A66A] transition" title="保存图片 (saveAsImage)">💾</button>
                                      <button onClick={() => triggerToastMsg("已切换到柱状图展示")} className="p-1 hover:text-[#10A66A] transition" title="柱状图切换 (magicType)">📊</button>
                                      <button onClick={() => triggerToastMsg("已重置初始数据区间")} className="p-1 hover:text-[#10A66A] transition" title="还原默认 (restore)">🔄</button>
                                      <button onClick={() => triggerToastMsg("已打开缩放模式")} className="p-1 hover:text-[#10A66A] transition" title="区域缩放 (dataZoom)">🔍</button>
                                    </div>
                                  )}
                                </div>

                                {/* Legend Element (Shown if pyeConfigLegend) */}
                                {pyeConfigLegend && (
                                  <div className="flex justify-center gap-4 text-xs mb-3">
                                    <div className="flex items-center gap-1.5 cursor-pointer">
                                      <span className="w-4 h-0.5 bg-[#1F77B4] relative flex items-center justify-center">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#1F77B4]" />
                                      </span>
                                      <span className="font-extrabold text-[11px]">成绩 (Line)</span>
                                    </div>
                                  </div>
                                )}

                                {/* SVG Visualization Canvas with hover interaction */}
                                <div className="relative border border-dashed border-zinc-200/50 p-3 rounded-lg flex justify-center bg-zinc-50/10">
                                  <svg
                                    width="460"
                                    height="180"
                                    className="overflow-visible"
                                    onMouseLeave={() => setHoveredLineIndex(null)}
                                  >
                                    {/* Grids */}
                                    <line x1="40" y1="20" x2="420" y2="20" stroke={pyeConfigTheme === "dark" ? "#2a2a2a" : "#eaeaea"} />
                                    <line x1="40" y1="55" x2="420" y2="55" stroke={pyeConfigTheme === "dark" ? "#2a2a2a" : "#eaeaea"} />
                                    <line x1="40" y1="90" x2="420" y2="90" stroke={pyeConfigTheme === "dark" ? "#2a2a2a" : "#eaeaea"} />
                                    <line x1="40" y1="125" x2="420" y2="125" stroke={pyeConfigTheme === "dark" ? "#2a2a2a" : "#eaeaea"} />
                                    <line x1="40" y1="150" x2="420" y2="150" stroke={pyeConfigTheme === "dark" ? "#444444" : "#cccccc"} strokeWidth="1.2" />

                                    {/* Y axis text */}
                                    {["100", "80", "60", "40"].map((label, idx) => (
                                      <text key={label} x="30" y={20 + idx * 35 + 4} textAnchor="end" fontSize="10" fill="#999" className="font-mono">
                                        {label}
                                      </text>
                                    ))}

                                    {/* X months data coordinates:
                                        "1月" -> x=70, y= 150 - (82 * 1.3) = 43.4 => 150 - (82 - 30)*1.7 = 150 - 52 * 1.7 = 61.6
                                        "2月" -> x=150,y= 150 - (88 - 30)*1.7 = 51.4
                                        "3月" -> x=230,y= 150 - (91 - 30)*1.7 = 46.3
                                        "4月" -> x=310,y= 150 - (86 - 30)*1.7 = 54.8
                                        "5月" -> x=390,y= 150 - (95 - 30)*1.7 = 39.5
                                    */}
                                    <path
                                      d="M 70 61.6 L 150 51.4 L 230 46.3 L 310 54.8 L 390 39.5"
                                      fill="none"
                                      stroke="#1F77B4"
                                      strokeWidth="3.2"
                                      className="transition-all duration-300"
                                    />

                                    {/* Dotted guidline for hovered segment */}
                                    {hoveredLineIndex !== null && pyeConfigTooltip && (
                                      <line
                                        x1={70 + hoveredLineIndex * 80}
                                        y1="20"
                                        x2={70 + hoveredLineIndex * 80}
                                        y2="150"
                                        stroke="#10A66A"
                                        strokeDasharray="4,4"
                                        strokeWidth="1.5"
                                      />
                                    )}

                                    {/* Dots */}
                                    {[
                                      { x: 70, y: 61.6, val: 82, m: "1月" },
                                      { x: 150, y: 51.4, val: 88, m: "2月" },
                                      { x: 230, y: 46.3, val: 91, m: "3月" },
                                      { x: 310, y: 54.8, val: 86, m: "4月" },
                                      { x: 390, y: 39.5, val: 95, m: "5月" }
                                    ].map((pt, index) => (
                                      <g key={index} onMouseEnter={() => setHoveredLineIndex(index)} className="cursor-crosshair">
                                        <circle
                                          cx={pt.x}
                                          cy={pt.y}
                                          r={hoveredLineIndex === index ? "7" : "5.5"}
                                          fill={hoveredLineIndex === index ? "#10A66A" : "#1F77B4"}
                                          stroke="#ffffff"
                                          strokeWidth="2"
                                          className="transition-all duration-150 shadow-sm"
                                        />
                                        <text x={pt.x} y={pt.y - 10} textAnchor="middle" fontSize="10.5" fontWeight="black" fill={pyeConfigTheme === "dark" ? "#10A66A" : "#111"}>
                                          {pt.val}
                                        </text>
                                        <text x={pt.x} y="166" textAnchor="middle" fontSize="11" fill="#777" className="font-extrabold">
                                          {pt.m}
                                        </text>
                                      </g>
                                    ))}
                                  </svg>

                                  {/* Custom Hover Simulation ToolTip popup window */}
                                  {hoveredLineIndex !== null && pyeConfigTooltip && (
                                    <div
                                      className="absolute bg-zinc-900/90 text-white rounded p-2.5 shadow-lg border border-emerald-500 select-none text-[11px] font-sans font-medium space-y-1 z-30 transition-all pointer-events-none"
                                      style={{
                                        left: `${70 + hoveredLineIndex * 80 + 30}px`,
                                        top: "40px"
                                      }}
                                    >
                                      <div className="font-bold text-[#10A66A] border-b border-zinc-700 pb-0.8 flex items-center gap-1">
                                        <span>📍 维度：{["1月", "2月", "3月", "4月", "5月"][hoveredLineIndex]}</span>
                                      </div>
                                      <div>
                                        <span className="text-zinc-300">指标类型:</span> <span className="font-extrabold text-[#1F77B4]">课程期末成绩</span>
                                      </div>
                                      <div>
                                        <span className="text-zinc-300">得分:</span> <span className="font-mono text-emerald-400 font-extrabold text-xs">{[82, 88, 91, 86, 95][hoveredLineIndex]} 分</span>
                                      </div>
                                      <div className="text-[9.5px] text-[#10A66A] italic">pyecharts.Tooltip (AXIS)</div>
                                    </div>
                                  )}
                                </div>

                                {/* Slide DataZoom Widget Area (Displayed ONLY if pyeConfigDataZoom is true) */}
                                {pyeConfigDataZoom && (
                                  <div className="mt-3.5 px-6">
                                    <div className="text-[10px] text-zinc-400 font-bold mb-1 flex items-center justify-between select-none">
                                      <span>滑动轴缩放: opts.DataZoomOpts()</span>
                                      <span className="text-emerald-600 font-black">【1月 - 5月 100%】</span>
                                    </div>
                                    <div className="h-6 bg-zinc-100/60 border rounded-md flex items-center justify-between px-2 cursor-pointer shadow-inner relative hover:border-[#10A66A] transition-all">
                                      <div className="absolute left-1/10 right-1/10 top-0.5 bottom-0.5 bg-blue-500/20 border-l border-r border-[#1F77B4] flex items-center justify-between">
                                        <span className="w-1 h-3.5 bg-[#1F77B4] rounded" />
                                        <span className="w-1 h-3.5 bg-[#1F77B4] rounded" />
                                      </div>
                                      <span className="text-[9px] text-zinc-400 font-black select-none z-10 font-mono">1M</span>
                                      <span className="text-[9px] text-zinc-400 font-black select-none z-10 font-mono">5M</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* PYECHARTS OUTPUT 3: Dual Columns Bar & Pie charts */}
                            {cell.outputMarkup === "pye-bar-pie" && (
                              <div className={`w-full border rounded-lg p-5 font-sans ${pyeConfigTheme === "dark" ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-zinc-200 text-zinc-800"}`}>
                                <div className="flex items-center justify-between border-b pb-2 mb-4">
                                  <div>
                                    <h4 className="text-sm font-extrabold">经典柱状图与饼分布占比</h4>
                                    <p className="text-[10.5px] text-zinc-400">pyecharts.charts.Bar & Pie (Dual Layout)</p>
                                  </div>
                                  <span className="text-[10px] font-black font-mono text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded">
                                    Opts: Legend, Tooltip triggered
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
                                  
                                  {/* Left: Bar chart */}
                                  <div className="border border-zinc-100/80 p-3 rounded-lg bg-zinc-50/10 flex flex-col items-center">
                                    <div className="text-[11px] font-extrabold text-zinc-500 mb-2">学习人数统计 (Bar)</div>
                                    <svg width="220" height="150" className="overflow-visible">
                                      {/* Baseline */}
                                      <line x1="20" y1="120" x2="210" y2="120" stroke="#777" strokeWidth="1.2" />
                                      
                                      {/* Draw columns for values [120, 98, 86, 76, 64] 
                                          Scaled heights: multiply by 0.8
                                      */}
                                      {[
                                        { val: 120, label: "Python", x: 30 },
                                        { val: 98, label: "数据", x: 67 },
                                        { val: 86, label: "可视", x: 104 },
                                        { val: 76, label: "爬虫", x: 141 },
                                        { val: 64, label: "机器学习", x: 178 }
                                      ].map((b, bIdx) => {
                                        const h = b.val * 0.72;
                                        return (
                                          <g key={bIdx} className="group cursor-pointer">
                                            <rect
                                              x={b.x}
                                              y={120 - h}
                                              width="22"
                                              height={h}
                                              fill="#10A66A"
                                              className="transition-all hover:fill-[#12C27D]"
                                            />
                                            <text x={b.x + 11} y={120 - h - 4} textAnchor="middle" fontSize="9.5" fontWeight="bold" fill={pyeConfigTheme === "dark" ? "#fff" : "#111"}>
                                              {b.val}
                                            </text>
                                            <text x={b.x + 11} y="133" textAnchor="middle" fontSize="9" fill="#777" transform={`rotate(10 ${b.x+11} 133)`}>
                                              {b.label}
                                            </text>
                                          </g>
                                        );
                                      })}
                                    </svg>
                                  </div>

                                  {/* Right: Pie chart */}
                                  <div className="border border-zinc-100/80 p-3 rounded-lg bg-zinc-50/10 flex flex-col items-center justify-between">
                                    <div className="text-[11px] font-extrabold text-zinc-500 mb-1">课程占比分布 (Pie)</div>
                                    <div className="relative flex items-center justify-center h-[120px]">
                                      {/* SVG pie with path slices */}
                                      <svg width="150" height="120" className="overflow-visible">
                                        {/* Center at x=75, y=60, radius=40 */}
                                        <g transform="translate(75, 60)">
                                          {/* Simple colored circles segments represented with slice paths or stack visual */}
                                          <circle cx="0" cy="0" r="42" fill="none" stroke="#2D8CF0" strokeWidth="16" strokeDasharray="64 260" strokeDashoffset="0" />
                                          <circle cx="0" cy="0" r="42" fill="none" stroke="#9A66E4" strokeWidth="16" strokeDasharray="52 260" strokeDashoffset="-64" />
                                          <circle cx="0" cy="0" r="42" fill="none" stroke="#10A66A" strokeWidth="16" strokeDasharray="46 260" strokeDashoffset="-116" />
                                          <circle cx="0" cy="0" r="42" fill="none" stroke="#FF9900" strokeWidth="16" strokeDasharray="38 260" strokeDashoffset="-162" />
                                          <circle cx="0" cy="0" r="42" fill="none" stroke="#E03C3C" strokeWidth="16" strokeDasharray="28 260" strokeDashoffset="-200" />
                                        </g>
                                      </svg>
                                      {/* Legend annotations */}
                                      <div className="absolute right-[-45px] top-2 text-[9px] space-y-1 leading-none font-bold text-zinc-400">
                                        <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#2D8CF0]" />Python 28%</div>
                                        <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#9A66E4]" />数据分析 23%</div>
                                        <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#10A66A]" />可视化 20%</div>
                                        <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#FF9900]" />爬虫 17%</div>
                                        <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#E03C3C]" />其它 12%</div>
                                      </div>
                                    </div>
                                  </div>

                                </div>
                              </div>
                            )}

                            {/* PYECHARTS OUTPUT 4: Scatter Plot with VisualMap */}
                            {cell.outputMarkup === "pye-scatter" && (
                              <div className={`w-full border rounded-lg p-5 font-sans relative ${pyeConfigTheme === "dark" ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-zinc-200 text-zinc-800"}`}>
                                <div className="flex items-center justify-between mb-3 border-b pb-2">
                                  <div>
                                    <h4 className="text-sm font-extrabold">学员实验得分分布 (Scatter)</h4>
                                    <p className="text-[10.5px] text-zinc-400">pyecharts.charts.Scatter</p>
                                  </div>
                                  {pyeConfigToolbox && (
                                    <button onClick={() => triggerToastMsg("已导出图片散点分布.png")} className="text-xs bg-zinc-100 border p-1 rounded hover:bg-zinc-200 transition">
                                      💾 导出
                                    </button>
                                  )}
                                </div>

                                <div className="flex select-none gap-2" onMouseLeave={() => setHoveredScatterIdx(null)}>
                                  {/* Scatter canvas */}
                                  <div className="flex-1 border p-2 rounded bg-zinc-50/10 flex justify-center relative">
                                    <svg width="340" height="150" className="overflow-visible">
                                      {/* Grid background */}
                                      <line x1="30" y1="20" x2="320" y2="20" stroke="#f0f0f0" />
                                      <line x1="30" y1="60" x2="320" y2="60" stroke="#f0f0f0" />
                                      <line x1="30" y1="100" x2="320" y2="100" stroke="#f0f0f0" />
                                      <line x1="30" y1="130" x2="320" y2="130" stroke="#888" strokeWidth="1.2" />

                                      {/* Mapping: 
                                          X [10, 20, 30, 40, 50] -> translated to: [60, 120, 180, 240, 300]
                                          Y [60, 72, 80, 88, 95] -> translated to vertical height
                                          Visual color: mapping (amber to deep jade)
                                      */}
                                      {[
                                        { x: 60, y: 110, score: 60, idx: 1, c: "#d48265" },
                                        { x: 120, y: 92, score: 72, idx: 2, c: "#ca8622" },
                                        { x: 180, y: 80, score: 80, idx: 3, c: "#10A66A" },
                                        { x: 240, y: 68, score: 88, idx: 4, c: "#2f4554" },
                                        { x: 300, y: 55, score: 95, idx: 5, c: "#61a0a8" }
                                      ].map((node, nIdx) => (
                                        <g key={nIdx} onMouseEnter={() => setHoveredScatterIdx(nIdx)} className="cursor-pointer">
                                          <circle
                                            cx={node.x}
                                            cy={node.y}
                                            r={hoveredScatterIdx === nIdx ? "9" : "6.5"}
                                            fill={node.c}
                                            stroke="#fff"
                                            strokeWidth="2.5"
                                            className="transition-all duration-150"
                                          />
                                          <text x={node.x} y="145" textAnchor="middle" fontSize="9.5" fill="#999" className="font-mono">
                                            {node.idx * 10}
                                          </text>
                                        </g>
                                      ))}
                                    </svg>

                                    {/* Tooltip detail output */}
                                    {hoveredScatterIdx !== null && pyeConfigTooltip && (
                                      <div className="absolute bg-[#1a1a1a] text-white p-2 text-[10.5px] rounded border border-emerald-500 shadow-md font-sans leading-relaxed left-[140px] top-[40px] z-20 select-none">
                                        <div className="font-extrabold border-b text-[#10A66A] pb-0.5 mb-1">
                                          🎯 学员 #{[10, 20, 30, 40, 50][hoveredScatterIdx]}
                                        </div>
                                        <div>实验得分：<span className="font-black text-rose-400 font-mono text-[11px]">{[60, 72, 80, 88, 95][hoveredScatterIdx]}</span> 分</div>
                                        <div className="text-[9px] text-[#10a66a]">opts.TooltipOpts(trigger=&apos;item&apos;)</div>
                                      </div>
                                    )}
                                  </div>

                                  {/* VisualMap bar layout (Option components sidebar shown if dynamic map) */}
                                  {pyeConfigVisualMap && (
                                    <div className="w-[60px] shrink-0 border rounded p-2 bg-zinc-50/20 flex flex-col items-center justify-between text-[10px] text-zinc-400 font-bold select-none">
                                      <span>高 [100]</span>
                                      <div className="w-2.5 h-20 rounded bg-gradient-to-t from-[#d48265] via-[#ca8622] to-[#10A66A]" />
                                      <span>低 [0]</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* PYECHARTS OUTPUT 5: Page/Grid composite report layout display */}
                            {cell.outputMarkup === "pye-combination" && (
                              <div className="w-full bg-zinc-50/70 border rounded-lg p-5 font-sans space-y-6 select-none animate-fadeIn">
                                <div className="border bg-zinc-100 p-2.5 rounded-md flex items-center justify-between animate-fadeIn">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded bg-indigo-700 animate-ping" />
                                    <span className="text-xs font-black text-zinc-800">
                                      Page layout composite output report generated successfully
                                    </span>
                                  </div>
                                  <span className="text-[10px] bg-indigo-50 text-indigo-700 font-black px-1.5 py-0.5 border rounded">
                                    opts.PageLayout.Simple
                                  </span>
                                </div>

                                <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2 border-dashed border p-3 rounded-lg divide-y bg-white animate-fadeIn">
                                  
                                  {/* Embedded Line Chart */}
                                  <div className="py-2 animate-fadeIn">
                                    <div className="text-[11px] font-black text-[#10A66A] mb-2">📊 图表板块 #1: 成绩变化趋势折线图</div>
                                    <div className="border border-zinc-150 rounded-lg p-3 bg-zinc-50/30 flex flex-col items-center justify-center">
                                      <svg width="340" height="90" className="overflow-visible font-mono">
                                        <line x1="30" y1="10" x2="320" y2="10" stroke="#f3f4f6" />
                                        <line x1="30" y1="40" x2="320" y2="40" stroke="#f3f4f6" />
                                        <line x1="30" y1="70" x2="320" y2="70" stroke="#e5e7eb" strokeWidth="1.2" />
                                        
                                        {/* Y Axis markings */}
                                        <text x="22" y="13" textAnchor="end" fontSize="8" fill="#9ca3af">100</text>
                                        <text x="22" y="43" textAnchor="end" fontSize="8" fill="#9ca3af">60</text>
                                        <text x="22" y="73" textAnchor="end" fontSize="8" fill="#9ca3af">20</text>
                                        
                                        {/* Path line */}
                                        <path d="M 50 48 L 110 32 L 170 24 L 230 38 L 290 15" fill="none" stroke="#2563eb" strokeWidth="2" />
                                        
                                        {/* Circles */}
                                        {[
                                          { x: 50, y: 48, val: "82% - 1月" },
                                          { x: 110, y: 32, val: "88% - 2月" },
                                          { x: 170, y: 24, val: "91% - 3月" },
                                          { x: 230, y: 38, val: "86% - 4月" },
                                          { x: 290, y: 15, val: "95% - 5月" }
                                        ].map((pt, pidx) => (
                                          <g key={pidx} className="group/pt cursor-pointer">
                                            <circle cx={pt.x} cy={pt.y} r="3" fill="#2563eb" stroke="#fff" strokeWidth="1" className="hover:scale-125 transition-transform" />
                                            <text x={pt.x} y={pt.y - 6} textAnchor="middle" fontSize="7" fontWeight="bold" fill="#1e293b" className="opacity-0 group-hover/pt:opacity-100 transition-opacity bg-white">
                                              {pt.val}
                                            </text>
                                          </g>
                                        ))}
                                      </svg>
                                    </div>
                                  </div>

                                  {/* Embedded Bar columns */}
                                  <div className="pt-4 py-2 animate-fadeIn">
                                    <div className="text-[11px] font-black text-blue-600 mb-2">📈 图表板块 #2: 学习人数柱状统计</div>
                                    <div className="border border-zinc-150 rounded-lg p-3 bg-zinc-50/30 flex flex-col items-center justify-center">
                                      <svg width="340" height="95" className="overflow-visible font-mono">
                                        <line x1="30" y1="80" x2="320" y2="80" stroke="#cccccc" strokeWidth="1.2" />
                                        
                                        {[
                                          { val: 120, label: "Python", x: 45 },
                                          { val: 98, label: "数据分析", x: 100 },
                                          { val: 86, label: "可视化", x: 155 },
                                          { val: 76, label: "网络爬虫", x: 210 },
                                          { val: 64, label: "机器学习", x: 265 }
                                        ].map((b, bIdx) => {
                                          const h = b.val * 0.5;
                                          return (
                                            <g key={bIdx} className="group cursor-pointer">
                                              <rect
                                                x={b.x}
                                                y={80 - h}
                                                width="22"
                                                height={h}
                                                fill="#10A66A"
                                                rx="1.5"
                                                className="transition-all hover:fill-[#12C27D]"
                                              />
                                              <text x={b.x + 11} y={80 - h - 3} textAnchor="middle" fontSize="8" fontWeight="bold" fill="#111">
                                                {b.val}
                                              </text>
                                              <text x={b.x + 11} y="91" textAnchor="middle" fontSize="8" fill="#555" className="font-sans font-medium">
                                                {b.label}
                                              </text>
                                            </g>
                                          );
                                        })}
                                      </svg>
                                    </div>
                                  </div>

                                  {/* Embedded Pie sharing */}
                                  <div className="pt-4 py-2 animate-fadeIn">
                                    <div className="text-[11px] font-black text-purple-600 mb-2">🍰 图表板块 #3: 各课学员分布占比</div>
                                    <div className="border border-zinc-150 rounded-lg p-3 bg-zinc-50/30 flex flex-row items-center justify-center gap-6 animate-fadeIn">
                                      <div className="relative w-24 h-24 flex items-center justify-center">
                                        <svg width="90" height="90" className="overflow-visible">
                                          <g transform="translate(45, 45)">
                                            <circle cx="0" cy="0" r="32" fill="none" stroke="#2D8CF0" strokeWidth="12" strokeDasharray="50 200" strokeDashoffset="0" />
                                            <circle cx="0" cy="0" r="32" fill="none" stroke="#9A66E4" strokeWidth="12" strokeDasharray="40 200" strokeDashoffset="-50" />
                                            <circle cx="0" cy="0" r="32" fill="none" stroke="#10A66A" strokeWidth="12" strokeDasharray="36 200" strokeDashoffset="-90" />
                                            <circle cx="0" cy="0" r="32" fill="none" stroke="#FF9900" strokeWidth="12" strokeDasharray="30 200" strokeDashoffset="-126" />
                                            <circle cx="0" cy="0" r="32" fill="none" stroke="#E03C3C" strokeWidth="12" strokeDasharray="44 200" strokeDashoffset="-156" />
                                          </g>
                                        </svg>
                                      </div>
                                      <div className="text-[9px] grid grid-cols-2 gap-x-4 gap-y-1.5 font-sans font-black text-zinc-500">
                                        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#2D8CF0]" />Python 28%</div>
                                        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#9A66E4]" />数据分析 23%</div>
                                        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#10A66A]" />可视化 20%</div>
                                        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#FF9900]" />爬虫 17%</div>
                                      </div>
                                    </div>
                                  </div>

                                </div>
                              </div>
                            )}

                            {/* PYECHARTS OUTPUT 6: Tab and Timeline Multi-dimensional layout */}
                            {cell.outputMarkup === "pye-tab-timeline" && (
                              <div className="w-full bg-white border border-zinc-200 rounded-lg p-5 font-sans space-y-4 animate-fadeIn">
                                <div className="flex items-center justify-between border-b pb-2 select-none">
                                  <div>
                                    <h4 className="text-sm font-extrabold flex items-center gap-2">
                                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                      <span>多维组合交互仪表盘 (Tab + Timeline)</span>
                                    </h4>
                                    <p className="text-[10.5px] text-zinc-400">pyecharts.charts.Tab &amp; Timeline (组合设计)</p>
                                  </div>
                                  <div className="text-[11px] font-black font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 border rounded">
                                    组合配置项: Tab, Timeline, dataZoom 联合
                                  </div>
                                </div>

                                {/* Custom Tab togglers (Section 十四: Page / Grid / Tab / Timeline 组合方式) */}
                                <div className="flex items-center gap-1.5 border-b pb-1 select-none animate-fadeIn">
                                  {["基础图表", "关系图表", "三维图表", "组合图表"].map((themeName) => {
                                    const isPyeActive = pyeSelectedTab === themeName;
                                    return (
                                      <button
                                        key={themeName}
                                        onClick={() => {
                                          setPyeSelectedTab(themeName);
                                          triggerToastMsg(`已切换至: ${themeName} 数据视图`);
                                        }}
                                        className={`px-3 py-1 text-xs font-black rounded-t-md transition-all border-x border-t cursor-pointer ${
                                          isPyeActive
                                            ? "bg-[#10A66A] text-white border-[#10A66A]"
                                            : "bg-zinc-50 text-zinc-500 border-zinc-200 hover:bg-zinc-100"
                                        }`}
                                      >
                                        {themeName}
                                      </button>
                                    );
                                  })}
                                </div>

                                {/* Render Chart Content dynamically based on pyeSelectedTab AND pyeSelectedYear */}
                                <div className="border border-dashed p-4 rounded-lg bg-zinc-50/20 relative min-h-[140px] flex flex-col justify-between animate-fadeIn">
                                  
                                  {/* Contextual state visual display tags */}
                                  <div className="absolute top-2.5 right-2.5 text-[10px] bg-zinc-900 text-white font-mono px-2 py-0.7 rounded shadow">
                                    Tab: <span className="text-emerald-400 font-extrabold">{pyeSelectedTab}</span> ｜ Year: <span className="text-[#FF9900] font-extrabold">{pyeSelectedYear}</span>
                                  </div>

                                  {/* Tab Visual rendering content */}
                                  <div className="flex-1 flex items-center justify-center p-3 select-none">
                                    {pyeSelectedTab === "基础图表" && (
                                      <div className="w-full text-center space-y-4 animate-fadeIn">
                                        <div className="text-xs text-zinc-500 font-bold">
                                          【基础图表数据】 柱状特征量 - 历史周期波动 (折合系数: {pyeSelectedYear === "2026" ? "1.5x 倍增量" : "1.0x 标准组"})
                                        </div>
                                        <div className="flex items-end justify-center gap-6 h-20">
                                          {[
                                            { label: "类目一", h: pyeSelectedYear === "2026" ? 64 : 45, color: "#1F77B4" },
                                            { label: "类目二", h: pyeSelectedYear === "2026" ? 82 : 55, color: "#10A66A" },
                                            { label: "类目三", h: pyeSelectedYear === "2026" ? 74 : 48, color: "#FF9900" }
                                          ].map((barDetail, idx) => (
                                            <div key={idx} className="flex flex-col items-center">
                                              <div
                                                className="w-10 rounded-t transition-all duration-500 shadow-sm"
                                                style={{ height: `${barDetail.h}px`, backgroundColor: barDetail.color }}
                                              />
                                              <span className="text-[10px] text-zinc-400 font-bold mt-1">{barDetail.label}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {pyeSelectedTab === "关系图表" && (
                                      <div className="text-center space-y-3.5 animate-fadeIn">
                                        <div className="text-xs text-zinc-550 font-bold mb-1">【网络拓扑节点关系 Force Layout】</div>
                                        {/* Simple network visualization */}
                                        <div className="flex justify-center items-center gap-8 h-16">
                                          <div className="w-10 h-10 rounded-full bg-[#1F77B4] text-white flex items-center justify-center font-black text-[10px] border shadow-sm select-none">主核</div>
                                          <div className="text-zinc-650 font-black text-xl select-none">🔗</div>
                                          <div className="w-9 h-9 rounded-full bg-[#10A66A] text-white flex items-center justify-center font-black text-[10px] border shadow-sm select-none">节点A</div>
                                          <div className="text-zinc-650 font-black text-xl select-none">🔗</div>
                                          <div className="w-9 h-9 rounded-full bg-[#FF9900] text-white flex items-center justify-center font-black text-[10px] border shadow-sm select-none">节点B</div>
                                        </div>
                                      </div>
                                    )}

                                    {pyeSelectedTab === "三维图表" && (
                                      <div className="text-center space-y-2 animate-fadeIn">
                                        <div className="text-xs text-zinc-550 font-bold">【3D Surface 曲面坐标系 - Options3D】</div>
                                        <div className="text-3xl text-zinc-600 animate-pulse select-none">📐 🧊 🗺</div>
                                        <span className="text-[10.5px] bg-zinc-100 text-zinc-550 font-mono italic px-2 py-0.5 rounded">
                                          gl_backend: WebGL enabled, grid3D coordinates compiled.
                                        </span>
                                      </div>
                                    )}

                                    {pyeSelectedTab === "组合图表" && (
                                      <div className="text-center space-y-2 select-none animate-fadeIn">
                                        <div className="text-xs text-zinc-500 font-bold">【Grid 多轴网格对齐】</div>
                                        <div className="flex justify-center items-center gap-1.5 py-1">
                                          <div className="w-16 h-8 bg-[#1F77B4]/15 border-dashed border border-[#1F77B4] rounded text-[9px] font-extrabold flex items-center justify-center animate-pulse">Axis Left</div>
                                          <div className="w-16 h-8 bg-[#10A66A]/15 border-dashed border border-[#10A66A] rounded text-[9px] font-extrabold flex items-center justify-center animate-pulse">Axis Right</div>
                                        </div>
                                        <p className="text-[9.5px] text-zinc-400 font-black">pyecharts.charts.Grid coordinate overlap auto-recalculated</p>
                                      </div>
                                    )}
                                  </div>

                                  {/* Bottom timeline element panel (Section 十五: Timeline 时间轴组合方式) */}
                                  <div className="border-t pt-3.5 mt-2 select-none animate-fadeIn">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-bold">
                                        <span className="text-[11px]">▶</span>
                                        <span>时间轴交互 (pyecharts.charts.Timeline)</span>
                                      </div>
                                      <span className="text-[10px] bg-[#FFF8E6] text-[#FF9900] font-black px-1.5 py-0.3 rounded animate-pulse">
                                        当前时间周期焦点: {pyeSelectedYear}
                                      </span>
                                    </div>

                                    {/* Draggable/Selectable timeline slider bar */}
                                    <div className="relative flex items-center justify-between px-6 pt-1 animate-fadeIn">
                                      {/* Horizontal axle line */}
                                      <div className="absolute left-6 right-6 h-1 bg-zinc-200 top-3" />
                                      
                                      {/* Dots for 2023, 2024, 2025, 2026 */}
                                      {["2023", "2024", "2025", "2026"].map((year) => {
                                        const isYearActive = pyeSelectedYear === year;
                                        return (
                                          <button
                                            key={year}
                                            onClick={() => {
                                              setPyeSelectedYear(year);
                                              triggerToastMsg(`时间轴切换到: ${year} 年度数据`);
                                            }}
                                            className="relative z-10 flex flex-col items-center focus:outline-none cursor-pointer"
                                          >
                                            <span className={`w-4.5 h-4.5 rounded-full border-2 transition-all flex items-center justify-center ${
                                              isYearActive
                                                ? "bg-white border-[#FF9900] ring-4 ring-orange-200 ring-opacity-80 scale-125"
                                                : "bg-[#777] border-white hover:bg-zinc-800"
                                            }`}>
                                              {isYearActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FF9900]" />}
                                            </span>
                                            <span className={`text-[10.5px] font-black mt-1.5 ${isYearActive ? "text-[#FF9900] scale-105" : "text-zinc-400 font-semibold"}`}>
                                              {year}
                                            </span>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>

                                </div>
                              </div>
                            )}

                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                );
              })}
            </div>

            </div>
          </div>

          {/* 八、模型部署与 Web 实时预测已移至 Notebook 单元内，此右侧看板在 Jupyter 经典视图中已被完美平铺展示 */}
          {false && (
            <div id="web-preview-pane" className="w-[430px] bg-zinc-50 flex flex-col shrink-0 overflow-y-auto select-none p-4.5 space-y-3.5 border-l border-zinc-200">
              
              {/* Header block in Web Preview */}
              <div className="bg-white border border-zinc-200 rounded-xl p-3.5 shadow-3xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[12.5px] text-zinc-900 tracking-wide flex items-center gap-1.5 uppercase font-sans">
                    <span className="flex h-2.5 w-2.5 relative">
                      {modelAppStatus === "running" && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${modelAppStatus === "running" ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}></span>
                    </span>
                    Web 运行效果实时预览
                  </span>
                  <span className={`text-[10px] select-none font-black px-1.8 py-0.3 rounded border ${modelAppStatus === "running" ? "bg-emerald-50 text-emerald-700 border-emerald-150 animate-pulse" : "bg-zinc-100 text-zinc-500 border-zinc-200"}`}>
                    {modelAppStatus === "running" ? "ACTIVE" : "STOPPED"}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-[10.5px]">
                  <span className="text-zinc-500 font-bold">接口宿主地址 (Flask API)</span>
                  <span className="font-mono text-indigo-700 font-extrabold bg-indigo-50 border border-indigo-100 px-1.5 py-0.2 rounded hover:underline cursor-pointer">
                    {modelAppStatus === "running" ? "http://127.0.0.1:7860" : "端口未运行"}
                  </span>
                </div>
              </div>

              {/* Main Preview Container */}
              {modelAppStatus === "stopped" ? (
                <div className="bg-rose-50/30 border border-dashed border-rose-200 p-8 text-center rounded-xl my-4 space-y-3 shrink-0 flex flex-col items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-rose-500 animate-pulse" />
                  <div className="text-xs font-black text-rose-950">预测微服务后台未启动</div>
                  <p className="text-[10.5px] text-zinc-500 max-w-[240px] leading-relaxed font-sans">
                    请运行左侧代码单元中的<strong>“一键部署 Flask 模型预测 API 规范”</strong>或点击右侧控制台的<strong>“启动应用”</strong>，拉起沙箱后端 Flask 容器。
                  </p>
                </div>
              ) : (
                <div className="space-y-4 flex-1 flex flex-col">
                  
                  {/* Task Switcher */}
                  <div className="bg-zinc-200/60 p-1 rounded-lg grid grid-cols-2 gap-1 text-[11px] font-extrabold select-none">
                    <button
                      onClick={() => {
                        setPredictionTaskType("classify");
                        setSelectedDemoImage("demo_cat.jpg");
                        setPredictionStatus("idle");
                        triggerToastMsg("切换预测任务：图像分类预测模式");
                      }}
                      className={`py-1.5 text-center transition-all cursor-pointer rounded-md ${predictionTaskType === "classify" ? "bg-white text-zinc-950 shadow-3xs" : "text-zinc-500 hover:text-zinc-800"}`}
                    >
                      图像分类 (Classify)
                    </button>
                    <button
                      onClick={() => {
                        setPredictionTaskType("detect");
                        setSelectedDemoImage("demo_road.jpg");
                        setPredictionStatus("idle");
                        triggerToastMsg("切换预测任务：目标检测识别模式");
                      }}
                      className={`py-1.5 text-center transition-all cursor-pointer rounded-md ${predictionTaskType === "detect" ? "bg-white text-zinc-950 shadow-3xs" : "text-zinc-500 hover:text-zinc-800"}`}
                    >
                      目标检测 (Detect)
                    </button>
                  </div>

                  {/* Step 1: Input selector panel */}
                  <div className="bg-white border border-zinc-200 rounded-xl p-3.5 space-y-2.5 shadow-3xs">
                    <div className="text-[10.5px] font-black text-zinc-400 block uppercase select-none tracking-wide">
                      1. 选择预测输入源 (Input Selection)
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setSelectedDemoImage("demo_cat.jpg");
                          setPredictionStatus("idle");
                          triggerToastMsg("已加载选择图片：demo_cat.jpg (猫咪特写)");
                        }}
                        className={`p-2 rounded-lg border text-left flex items-center gap-1.5 transition cursor-pointer select-none ${selectedDemoImage === "demo_cat.jpg" ? "border-indigo-500 bg-indigo-50/30 text-indigo-900 font-extrabold" : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        <span className="text-[11px] truncate select-none leading-none">demo_cat.jpg (猫)</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDemoImage("demo_road.jpg");
                          setPredictionStatus("idle");
                          triggerToastMsg("已加载选择图片：demo_road.jpg (高速路况)");
                        }}
                        className={`p-2 rounded-lg border text-left flex items-center gap-1.5 transition cursor-pointer select-none ${selectedDemoImage === "demo_road.jpg" ? "border-indigo-500 bg-indigo-50/30 text-indigo-900 font-extrabold" : "bg-zinc-50 border-zinc-200 text-zinc-650 hover:bg-zinc-100"}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        <span className="text-[11px] truncate select-none leading-none">demo_road.jpg (路面)</span>
                      </button>
                    </div>

                    <div className="border border-dashed border-zinc-300 rounded-lg p-3.5 bg-zinc-50/50 hover:bg-zinc-50 cursor-pointer flex flex-col items-center justify-center text-center space-y-1 transition group">
                      <Upload className="w-5 h-5 text-zinc-400 group-hover:text-indigo-600 transition" />
                      <span className="text-[10.5px] text-zinc-500 font-bold group-hover:text-zinc-805 leading-none">
                        拖拽或点击上传其它测试图片
                      </span>
                      <span className="text-[9px] text-zinc-400 font-semibold select-none leading-none">
                        (沙箱自动预处理并调整大小)
                      </span>
                    </div>
                  </div>

                  {/* Start inference action trigger */}
                  <button
                    onClick={() => {
                      setPredictionStatus("predicting");
                      triggerToastMsg("正在激活 7860 端口微服务，封装张量触发 AI 模型前向推理...");
                      
                      setTimeout(() => {
                        setPredictionStatus("completed");
                        const clickTimeStr = new Date().toLocaleTimeString('zh-CN', { hour12: false });
                        
                        if (predictionTaskType === "classify") {
                          setPredictionLogs((prev) => [
                            ...prev,
                            `[${clickTimeStr}] [HTTP POST] /api/predict/classify - 200 OK`,
                            `[${clickTimeStr}] 运行图像分类推理: output_label='猫 (Cat)', confidence=0.964`
                          ]);
                          setPredictionRecords((prev) => [
                            {
                              time: clickTimeStr,
                              appName: "模型预测应用",
                              taskType: "图像分类",
                              inputImage: "demo_cat.jpg",
                              result: "猫 (Cat)",
                              confidence: "0.964",
                              status: "成功",
                              operator: "学生1"
                            },
                            ...prev
                          ]);
                        } else {
                          setPredictionLogs((prev) => [
                            ...prev,
                            `[${clickTimeStr}] [HTTP POST] /api/predict/detect - 200 OK`,
                            `[${clickTimeStr}] 运行目标检测推理: found 3 bounding boxes`
                          ]);
                          setPredictionRecords((prev) => [
                            {
                              time: clickTimeStr,
                              appName: "模型预测应用",
                              taskType: "目标检测",
                              inputImage: "demo_road.jpg",
                              result: "person, car, traffic light",
                              confidence: "0.93 / 0.88 / 0.81",
                              status: "成功",
                              operator: "学生1"
                            },
                            ...prev
                          ]);
                        }
                        
                        triggerToastMsg("推理预测更新完成，结果及输出快照均已自动同步。");
                      }, 500);
                    }}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition active:scale-98 shadow-xs cursor-pointer select-none"
                  >
                    <Play className="w-4 h-4 text-indigo-100" />
                    <span>运行预测服务 (Start Prediction)</span>
                  </button>

                  {/* Step 2: Prediction outcome panel */}
                  <div className="bg-white border border-zinc-200 rounded-xl p-3.5 space-y-3.5 shadow-3xs flex-1 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-zinc-400 block uppercase tracking-wider select-none">
                        2. 模型前向推理输出 (Inference Result)
                      </span>
                      <span className="text-[9.5px] text-indigo-650 bg-indigo-50 border border-indigo-150 px-1.5 rounded font-black font-mono">
                        {predictionTaskType === "classify" ? "CLASSIFICATION" : "OBJECT_DETECTION"}
                      </span>
                    </div>

                    {predictionStatus === "predicting" ? (
                      <div className="flex-1 min-h-[170px] flex flex-col items-center justify-center p-6 space-y-2">
                        <div className="relative flex items-center justify-center">
                          <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-indigo-400 opacity-75"></span>
                          <Sliders className="w-8 h-8 text-indigo-600 relative animate-spin" />
                        </div>
                        <span className="text-xs font-bold text-zinc-500 font-sans">大批模型卷积前向对齐中...</span>
                      </div>
                    ) : predictionStatus === "idle" ? (
                      <div className="flex-1 min-h-[170px] flex flex-col items-center justify-center p-6 text-zinc-400 font-semibold text-xs border border-dashed rounded-lg bg-zinc-50/50 select-none">
                        <span>等待接收图像预测信号。请点击“运行预测服务”</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        
                        {/* Canvas Image Overlay display panel */}
                        <div className="relative border rounded-lg bg-zinc-50 overflow-hidden min-h-[180px] flex items-center justify-center select-none shadow-3xs flex-col">
                          
                          {/* IF CLASSIFY */}
                          {predictionTaskType === "classify" ? (
                            <div className="w-full h-full flex flex-col items-center justify-center p-4">
                              <div className="p-3 bg-indigo-50 rounded-full border border-indigo-200">
                                <Camera className="w-12 h-12 text-indigo-600 animate-pulse" />
                              </div>
                              <div className="mt-2 text-center">
                                <div className="text-[12px] font-extrabold text-zinc-800">[预测输入图像: demo_cat.jpg]</div>
                                <div className="text-[10.5px] text-zinc-400 font-medium">猫咪图像分类测试图片</div>
                              </div>
                              
                              <div className="absolute bottom-2.5 right-2.5 bg-zinc-950/80 text-white font-mono text-[9px] px-2 py-0.5 rounded border border-zinc-700 font-bold flex items-center gap-1 select-all">
                                <span>Label: 猫 (Cat)</span>
                                <span className="text-emerald-400">96.4%</span>
                              </div>
                            </div>
                          ) : (
                            /* IF OBJECT DETECTION with simulated visual bounding boxes using css borders! */
                            <div className="w-full min-h-[180px] h-full relative">
                              <div className="w-full h-full flex flex-col justify-between p-3 shrink-0">
                                <div className="flex justify-between items-center bg-zinc-900/60 p-1 px-2 rounded text-white text-[9px] font-bold z-10">
                                  <span>[预测输入图像: demo_road.jpg] 实况路检</span>
                                  <span className="font-mono text-amber-400 font-bold">API ACTIVE</span>
                                </div>
                                
                                <div className="w-full h-24 bg-gradient-to-t from-zinc-200 via-zinc-100 to-sky-50 border rounded-lg relative overflow-hidden flex flex-col items-center justify-end select-none pointer-events-none">
                                  <div className="absolute inset-0 bg-zinc-200/40 transform perspective-100 rotateX-30 scale-100 flex justify-center gap-6">
                                    <div className="w-0.5 bg-dashed border-l border-zinc-400 h-full border-dashed"></div>
                                    <div className="w-0.5 bg-dashed border-l border-zinc-400 h-full border-dashed"></div>
                                  </div>
                                  <span className="text-[8px] text-zinc-400 font-bold pb-1 select-none leading-none">路面透视模拟系统</span>
                                </div>
                              </div>

                              {/* Box 1: Person CSS BBox */}
                              <div className="absolute border-2 border-red-500 bg-red-50/15 select-all" style={{ top: "45px", left: "20px", width: "70px", height: "110px" }}>
                                <span className="absolute top-0 left-0 bg-red-600 text-white font-bold font-mono text-[8px] px-1 py-0.1 leading-none shrink-0 rounded-br-sm select-none">
                                  person: 93%
                                </span>
                              </div>

                              {/* Box 2: Car CSS BBox */}
                              <div className="absolute border-2 border-blue-500 bg-blue-50/15 select-all" style={{ top: "85px", left: "135px", width: "120px", height: "70px" }}>
                                <span className="absolute top-0 left-0 bg-blue-600 text-white font-bold font-mono text-[8px] px-1 py-0.1 leading-none shrink-0 rounded-br-sm select-none">
                                  car: 88%
                                </span>
                              </div>

                              {/* Box 3: Traffic Light CSS BBox */}
                              <div className="absolute border-2 border-emerald-500 bg-emerald-50/15 select-all" style={{ top: "35px", left: "290px", width: "35px", height: "80px" }}>
                                <span className="absolute top-0 left-0 bg-emerald-600 text-white font-bold font-mono text-[8px] px-1 py-0.1 leading-none shrink-0 rounded-br-sm select-none">
                                  light: 81%
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Breakdown results parameters table */}
                        <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 font-sans space-y-1.5 text-xs text-zinc-700 leading-normal select-all">
                          <div className="font-extrabold text-[#10A66A] text-[11px] pb-1 border-b flex items-center gap-1 select-none">
                            <span>✔ 模型推理决策结果清单：</span>
                          </div>
                          
                          {predictionTaskType === "classify" ? (
                            <div className="space-y-1 font-sans">
                              <div className="flex justify-between items-center text-[10.5px]">
                                <span className="text-zinc-505 font-semibold">Top-1 首要分类结果</span>
                                <span className="font-extrabold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-150">猫 (Cat)</span>
                              </div>
                              <div className="flex justify-between items-center text-[10.5px]">
                                <span className="text-zinc-505 font-semibold">首要判定置信概率</span>
                                <span className="font-extrabold text-zinc-900 font-mono">0.964</span>
                              </div>
                              <div className="w-full bg-zinc-200 rounded-full h-1 my-1 overflow-hidden">
                                <div className="bg-emerald-500 h-full rounded-full" style={{ width: "96.4%" }}></div>
                              </div>
                              <div className="text-[10px] text-zinc-400 font-bold flex justify-between select-none">
                                <span>波斯猫: 81.4%</span>
                                <span>折耳猫: 12.1%</span>
                                <span>狸花猫: 4.5%</span>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1 font-sans">
                              <div className="flex justify-between items-center text-[10.5px] pb-0.5">
                                <span className="text-zinc-505 font-semibold">目标检测统计度</span>
                                <span className="font-black text-indigo-700 font-sans">发现 3 个高对比预测框 (BBoxes)</span>
                              </div>
                              <div className="text-[9.5px] font-bold text-zinc-500 space-y-0.5">
                                <div className="flex justify-between">
                                  <span>标签 1: 行人 (person)</span>
                                  <span className="font-mono">box=[80, 60, 180, 260] | conf=93%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>标签 2: 车辆 (car)</span>
                                  <span className="font-mono">box=[260, 130, 420, 250] | conf=88%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>标签 3: 信号灯 (light)</span>
                                  <span className="font-mono">box=[380, 30, 440, 100] | conf=81%</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bottom Trace Logs Console Control Header */}
          <div className="border-t border-zinc-200 bg-zinc-100 flex items-center justify-between px-3.5 py-1.5 select-none shrink-0 h-9">
            <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-zinc-700">
              <Terminal className="w-3.5 h-3.5 text-zinc-500 animate-pulse" />
              <span>沙箱运行日志与执行快照控制台 ({activeTab === "pyecharts" ? chartRunRecords.length : trainingRecords.length} 运行 | {resetRecords.length} 重置)</span>
            </div>
          </div>

          {/* Console Columns Wrapper */}
          <div className="h-64 bg-zinc-50 flex border-t border-zinc-200 divide-x divide-zinc-200 overflow-hidden shrink-0 select-none animate-fadeIn">
            
            {/* Column 1: 核心重置参数 Panel */}
            <div className="w-[300px] flex flex-col shrink-0 bg-indigo-50/10 overflow-y-auto">
              <div className="p-3.5 border-b border-indigo-150 bg-indigo-50/35 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[12px] text-indigo-950 tracking-wider flex items-center gap-1.5 font-sans">
                    <span className="text-indigo-600 font-extrabold text-[13px]">▲</span>
                    核心重置参数
                  </span>
                  <span className="bg-indigo-100 text-indigo-900 border border-indigo-200 text-[9px] font-black px-1.5 py-0.2 rounded font-sans shrink-0">
                    核心配置区 (✓)
                  </span>
                </div>

                <div className="space-y-2 text-xs font-semibold text-zinc-700">
                  <div className="bg-white border border-indigo-100 rounded-lg p-3 space-y-2 shadow-2xs font-medium">
                    {/* 独立沙箱环境 & 当前账户 */}
                    <div className="flex justify-between items-center text-[10.5px] pb-1.5 border-b border-zinc-100">
                      <span className="text-zinc-400 font-bold">独立沙箱环境</span>
                      <span className="text-indigo-700 font-black font-mono">student1-python-sandbox</span>
                    </div>
                    <div className="flex justify-between items-center text-[10.5px] pb-1.5 border-b border-zinc-100">
                      <span className="text-zinc-400 font-bold">目前账户</span>
                      <span className="text-zinc-900 font-extrabold">学生1</span>
                    </div>

                    {/* 沙箱目录 & 持久化文件目录 */}
                    <div className="flex justify-between items-center text-[10.5px] pb-1.5 border-b border-zinc-100">
                      <span className="text-zinc-400 font-bold">沙箱目录</span>
                      <span className="font-mono text-zinc-600 text-[9.5px]">/home/student1/workspace</span>
                    </div>
                    <div className="flex justify-between items-center text-[10.5px] pb-1.5 border-b border-zinc-100">
                      <span className="text-zinc-400 font-bold">持久化文件目录</span>
                      <span className="font-mono text-emerald-700 text-[9.5px] font-black">/home/student1/workspace/persistent</span>
                    </div>

                    {/* 个人文件保留说明 */}
                    <div className="pb-1.5 border-b border-zinc-100 space-y-1">
                      <div className="flex justify-between items-center text-[10.5px]">
                        <span className="text-zinc-400 font-bold">个人文件保留说明</span>
                        <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 text-[8.5px] px-1 rounded font-black font-sans shrink-0">
                          100% 物理存留
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 font-semibold leading-normal">
                        重置时仅清除计算缓存及临时变量。个人 Notebook 等文件将<strong className="text-emerald-700">持久化保留</strong>。
                      </p>
                    </div>

                    {/* 文件持久化状态 */}
                    <div className="flex justify-between items-center text-[10.5px] pb-1.5 border-b border-zinc-100">
                      <span className="text-emerald-800 font-extrabold">文件持久化状态</span>
                      <span className="text-[#10A66A] font-extrabold flex items-center gap-1 text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>已启用 (Enabled)</span>
                      </span>
                    </div>

                    {/* 沙箱隔离状态 */}
                    <div className="flex justify-between items-center text-[10.5px] pb-1.5 border-b border-zinc-100">
                      <span className="text-indigo-800 font-extrabold">沙箱等效隔离</span>
                      <span className="text-indigo-600 font-extrabold flex items-center gap-1 text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        <span>已开启 (Isolated)</span>
                      </span>
                    </div>

                    {/* 重置范围 */}
                    <div className="pb-1.5 border-b border-zinc-100 space-y-0.5">
                      <span className="text-zinc-400 font-bold text-[10.5px]">重置范围</span>
                      <div className="text-[9.5px] text-zinc-650 font-semibold font-sans">
                        代码输出、执行计数、运行态变量
                      </div>
                    </div>

                    {/* 重置记录 */}
                    <div className="flex justify-between items-center text-[10.5px] pb-1.5 border-b border-zinc-100">
                      <span className="text-zinc-400 font-bold">最近重置记录</span>
                      <span className="text-rose-700 font-extrabold font-mono">{lastResetTime || "暂无重置"}</span>
                    </div>

                    {/* 保存成功时间 */}
                    <div className="flex justify-between items-center text-[10.5px]">
                      <span className="text-zinc-400 font-bold">持久化成功时间</span>
                      <span className="text-emerald-700 font-extrabold font-mono">{lastSavedTime || "未保存"}</span>
                    </div>
                  </div>

                  {/* 任务重置触发按钮 */}
                  <div className="pt-0.5">
                    <button
                      onClick={handleTriggerReset}
                      className="w-full py-2 bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-black text-xs rounded-lg transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shadow-rose-100"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-rose-100 animate-spin-slow" />
                      进行任务重置 (Reset Sandbox)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Running Records */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {activeTab === "pyecharts" ? (
                <>
                  <div className="p-2 px-3 border-b border-zinc-200 bg-zinc-100 flex justify-between items-center select-none shrink-0 border-t-amber-500">
                    <span className="font-extrabold text-[11px] text-zinc-650 uppercase tracking-wider flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-[#10A66A] animate-pulse" />
                      pyecharts 图表运行记录 ({chartRunRecords.length})
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400 bg-zinc-200/50 px-2 py-0.5 rounded">
                      pyecharts 独立绘图沙箱
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto p-2 overflow-x-auto text-[11px]">
                    <table className="min-w-full text-left">
                      <thead>
                        <tr className="text-zinc-400 border-b border-zinc-200 bg-zinc-100/30 font-bold select-none text-[10px]">
                          <th className="p-1 px-2.5">运行时间</th>
                          <th className="p-1 px-2">Notebook 属性</th>
                          <th className="p-1 px-2">图表类型</th>
                          <th className="p-1 px-2">渲染库</th>
                          <th className="p-1 px-2">启用交互组件项</th>
                          <th className="p-1 px-2">图表运行结果</th>
                          <th className="p-1 px-2 text-center">状态</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-150 font-medium font-sans">
                        {chartRunRecords.map((rec, rIdx) => (
                          <tr key={rIdx} className="hover:bg-white/80">
                            <td className="p-1.5 px-2.5 font-mono text-zinc-500">{rec.time}</td>
                            <td className="p-1.5 px-2 font-bold text-zinc-800 text-[10.5px] truncate max-w-[120px]">{rec.notebook}</td>
                            <td className="p-1.5 px-2 text-emerald-700 font-extrabold">{rec.chartType}</td>
                            <td className="p-1.5 px-2 font-mono text-zinc-400 text-[10px]">{rec.library}</td>
                            <td className="p-1.5 px-2 font-mono text-indigo-700 text-[10px] font-semibold">{rec.interaction}</td>
                            <td className="p-1.5 px-2 text-zinc-850 select-text truncate max-w-[120px]" title={rec.output}>{rec.output}</td>
                            <td className="p-1.5 px-2 text-center">
                              <span className="bg-emerald-50 text-emerald-800 border border-[#10A66A] text-[9.5px] font-black px-1.5 py-0.2 rounded inline-block select-none">
                                {rec.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : activeTab === "model_predict" ? (
                <div className="flex-1 flex overflow-hidden">
                  
                  {/* Left Column: Prediction Records */}
                  <div className="flex-1 flex flex-col border-r border-zinc-200 overflow-hidden bg-white">
                    <div className="p-2 px-3 border-b border-zinc-200 bg-zinc-100/60 flex justify-between items-center select-none shrink-0">
                      <span className="font-extrabold text-[11px] text-zinc-700 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                        <Activity className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                        模型实时预测/接口调用历史 ({predictionRecords.length} 条)
                      </span>
                      <span className="text-[9px] font-black text-indigo-700 bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded">
                        Persistent-Database
                      </span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 overflow-x-auto text-[10.5px]">
                      <table className="min-w-full text-left font-sans">
                        <thead>
                          <tr className="text-zinc-450 border-b border-zinc-200 bg-zinc-50/50 font-bold select-none text-[9.5px] uppercase tracking-wider font-sans">
                            <th className="p-1 px-2">请求时间</th>
                            <th className="p-1 px-2">应用服务名</th>
                            <th className="p-1 px-2">任务类型</th>
                            <th className="p-1 px-3">输入样片</th>
                            <th className="p-1 px-2">模型推理结果</th>
                            <th className="p-1 px-2">最大置信度</th>
                            <th className="p-1 px-2 text-center">响应状态</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-150 font-sans text-zinc-650">
                          {predictionRecords.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="text-center p-6 text-zinc-400 select-none font-bold">
                                库中无实时接口请求历史。请在上方 Web 预览区中上传或选定测试样片并点击 “运行预测服务”。
                              </td>
                            </tr>
                          ) : (
                            predictionRecords.map((rec, rIdx) => (
                              <tr key={rIdx} className="hover:bg-zinc-50/50">
                                <td className="p-1.5 px-2 font-mono text-zinc-500 leading-none">{rec.time}</td>
                                <td className="p-1.5 px-2 font-black text-zinc-805 leading-none">{rec.appName}</td>
                                <td className="p-1.5 px-2 font-bold leading-none">
                                  <span className={`px-1.5 py-0.2 text-[9px] rounded ${rec.taskType === "图像分类" ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-sky-50 text-sky-700 border border-sky-200"}`}>
                                    {rec.taskType}
                                  </span>
                                </td>
                                <td className="p-1.5 px-3 font-mono text-zinc-500 font-bold leading-none">{rec.inputImage}</td>
                                <td className="p-1.5 px-2 font-bold text-zinc-800 leading-none">{rec.result}</td>
                                <td className="p-1.5 px-2 font-mono text-indigo-700 font-extrabold leading-none">{rec.confidence}</td>
                                <td className="p-1.5 px-2 text-center select-none leading-none">
                                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-250 text-[8.5px] font-black px-1.2 py-0.2 rounded-md">
                                    {rec.status}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Right Column: Server Terminal Logs */}
                  <div className="w-[340px] flex flex-col bg-[#161616] overflow-hidden select-text font-mono text-xs text-zinc-300">
                    <div className="p-2 px-3 border-b border-zinc-800 bg-zinc-950 flex justify-between items-center select-none shrink-0 font-sans">
                      <span className="font-extrabold text-[11px] text-zinc-400 flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                        微服务实时控制台终端 (Port: 7860)
                      </span>
                      <span className={`w-1.5 h-1.5 rounded-full ${modelAppStatus === "running" ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-1 bg-[#121212] font-mono text-[10.5px] select-all scrollbar-thin text-gray-300">
                      {predictionLogs.length === 0 ? (
                        <div className="text-zinc-600 font-bold italic p-3 text-center">
                          服务进程未拉起。请运行左侧 Notebook 代码块，或点击右侧“启动应用”。
                        </div>
                      ) : (
                        predictionLogs.map((log, lIdx) => (
                          <div key={lIdx} className="leading-snug transition-all uppercase text-[10px]">
                            {log.includes("Core Log") || log.includes("Error") ? (
                              <span className="text-zinc-500">{log}</span>
                            ) : log.includes("返回") || log.includes("部署成功") ? (
                              <span className="text-emerald-400 font-bold">{log}</span>
                            ) : log.includes("API") || log.includes("Flask") || log.includes("Web") ? (
                              <span className="text-sky-400 font-bold">{log}</span>
                            ) : (
                              <span>{log}</span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              ) : (
                <>
                  <div className="p-2 px-3 border-b border-zinc-200 bg-zinc-100 flex justify-between items-center select-none shrink-0">
                    <span className="font-extrabold text-[11px] text-zinc-650 uppercase tracking-wider flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-[#10A66A] animate-pulse" />
                      Python 案例运行/训练记录 ({trainingRecords.length})
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400 bg-zinc-200/50 px-2 py-0.5 rounded">
                      当前账户沙箱完全隔离
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto p-2 overflow-x-auto text-[11px]">
                    <table className="min-w-full text-left">
                      <thead>
                        <tr className="text-zinc-400 border-b border-zinc-200 bg-zinc-100/30 font-bold select-none text-[10px]">
                          <th className="p-1 px-2.5">运行时间</th>
                          <th className="p-1 px-2">账户</th>
                          <th className="p-1 px-2">沙箱环境</th>
                          <th className="p-1 px-2">操作类型</th>
                          <th className="p-1 px-2">规则参数</th>
                          <th className="p-1 px-2">运行输出</th>
                          <th className="p-1 px-2 text-center">执行状态</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-150 font-medium font-sans">
                        {trainingRecords.map((rec, rIdx) => (
                          <tr key={rIdx} className="hover:bg-white/80">
                            <td className="p-1.5 px-2.5 font-mono text-zinc-500">{rec.time}</td>
                            <td className="p-1.5 px-2 font-bold text-zinc-800">{rec.account}</td>
                            <td className="p-1.5 px-2 font-mono text-zinc-500 text-[10px]">{rec.sandbox}</td>
                            <td className="p-1.5 px-2 font-black text-indigo-700">{rec.operation}</td>
                            <td className="p-1.5 px-2 font-mono text-zinc-600 font-semibold">{rec.param}</td>
                            <td className="p-1.5 px-2 text-zinc-850 select-text truncate max-w-[150px]" title={rec.result}>{rec.result}</td>
                            <td className="p-1.5 px-2 text-center">
                              <span className="bg-emerald-50 text-emerald-800 border border-[#10A66A] text-[9.5px] font-black px-1.5 py-0.2 rounded inline-block select-none">
                                {rec.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>



            {/* L2. 任务重置记录 */}
            <div className="w-[440px] flex flex-col overflow-hidden">
              <div className="p-2 px-3 border-b border-zinc-200 bg-zinc-100 flex justify-between items-center select-none shrink-0">
                <span className="font-extrabold text-[11px] text-zinc-650 uppercase tracking-wider flex items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                  任务重置记录 ({resetRecords.length})
                </span>
                <span className="text-[10px] text-rose-700 font-bold bg-rose-50 border border-rose-200 px-2 rounded-md">
                  支持重置反复分析
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-2 overflow-x-auto text-[11px]">
                <table className="min-w-full text-left">
                  <thead>
                    <tr className="text-zinc-400 border-b border-zinc-200 bg-zinc-100/30 font-bold select-none text-[10px]">
                      <th className="p-1 px-2.5">重置时间</th>
                      <th className="p-1 px-2">沙箱环境</th>
                      <th className="p-1 px-2">规则清空范围</th>
                      <th className="p-1 px-2 text-center">重置状态</th>
                      <th className="p-1 px-2">操作人</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-150 font-medium">
                    {resetRecords.map((reset, rIdx) => (
                      <tr key={rIdx} className="hover:bg-white/80">
                        <td className="p-1.5 px-2.5 font-mono text-zinc-500">{reset.time}</td>
                        <td className="p-1.5 px-2 font-mono text-[9.5px] text-zinc-600">{reset.sandbox}</td>
                        <td className="p-1.5 px-2 text-zinc-700 max-w-[130px] truncate" title={reset.range}>{reset.range}</td>
                        <td className="p-1.5 px-2 text-center">
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9.5px] font-black px-1.5 py-0.2 rounded inline-block select-none">
                            {reset.result}
                          </span>
                        </td>
                        <td className="p-1.5 px-2 font-black text-zinc-800">{reset.operator}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>

        {/* 右侧沙箱信息 & 参数配置面板 (独立沙箱环境) */}
        {isRightSettingsOpen && (
          <div className="w-[310px] border-l border-zinc-200 bg-[#FAFAFA] flex flex-col shrink-0 overflow-y-auto select-none shadow-2xs">
            
            {/* Title Block */}
            <div className="p-3 border-b border-zinc-200 bg-zinc-100 flex items-center justify-between">
              <span className="font-extrabold text-[12px] text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-zinc-500" />
                独立沙箱环境
              </span>
              <span className="bg-emerald-50 text-[#10A66A] border border-emerald-200 text-[9.5px] font-black px-1.5 py-0.2 rounded">
                已隔离 (✓)
              </span>
            </div>

            {/* General environment info */}
            <div className="p-3.5 space-y-3.5 border-b border-zinc-200 text-xs text-zinc-600 leading-relaxed">
              <p className="text-zinc-500 text-[11px]">
                各账号拥有隔离沙箱，Notebook 变量及规则配置完全安全独立。
              </p>

              <div className="bg-white border rounded-lg p-3 space-y-2 shadow-3xs font-medium text-zinc-700">
                <div className="flex justify-between items-center text-[10.5px] pb-1.5 border-b border-zinc-100">
                  <span className="text-zinc-400">目前账户(Account)</span>
                  <span className="text-zinc-900 font-extrabold">学生1</span>
                </div>
                <div className="flex justify-between items-center text-[10.5px] pb-1.5 border-b border-zinc-100">
                  <span className="text-zinc-400">隔离沙箱(ID)</span>
                  <span className="font-mono text-zinc-900 font-extrabold text-[9.5px]">sandbox-student1-20260608</span>
                </div>
                <div className="flex justify-between items-center text-[10.5px] pb-1.5 border-b border-zinc-100">
                  <span className="text-zinc-400">软件依赖栈</span>
                  <span className="text-[#10A66A] font-bold font-mono">Python 3.10</span>
                </div>
                <div className="flex justify-between items-center text-[10.5px] pb-1.5 border-b border-zinc-100">
                  <span className="text-zinc-400">运行配置目录</span>
                  <span className="font-mono text-zinc-500 text-[9.5px] truncate max-w-[130px]">/home/student1/workspace</span>
                </div>
                <div className="flex justify-between items-center text-[10.5px] pb-1.5 border-b border-zinc-100">
                  <span className="text-zinc-400 text-rose-700 font-black">账户隔离状态</span>
                  <span className="bg-rose-50 text-rose-700 text-[9px] px-1.5 py-0.2 rounded border border-rose-200 font-black">
                    隔离保护中
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10.5px]">
                  <span className="text-zinc-400 font-semibold text-emerald-800">计算资源健康</span>
                  <span className="font-black text-emerald-600">正常 (CPU/MEM OK)</span>
                </div>
              </div>
            </div>

            {/* Rules Dynamic Configuration Panel */}
            {activeTab === "pyecharts" ? (
              <div className="p-3.5 border-b border-zinc-200 bg-white space-y-4">
                <h4 className="font-extrabold text-[12.5px] text-zinc-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-emerald-600 animate-spin-slow" />
                    pyecharts 图表交互设计
                  </span>
                  <span className="text-[9.5px] bg-emerald-50 text-emerald-700 font-extrabold px-1.5 py-0.3 rounded border border-emerald-200">
                    参数实时同步
                  </span>
                </h4>

                <div className="space-y-3.5 text-xs text-zinc-700">
                  {/* Aspect: Theme selected */}
                  <div className="space-y-1.5">
                    <label className="text-[10.5px] font-black text-zinc-500 block uppercase">
                      1. 配色主题选择 (Theme)
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 font-bold">
                      <button
                        onClick={() => {
                          setPyeConfigTheme("light");
                          triggerToastMsg("已应用轻量白底主题 (Theme: chalk)");
                        }}
                        className={`py-1 text-center rounded border text-[11px] transition cursor-pointer ${
                          pyeConfigTheme === "light"
                            ? "bg-zinc-100 border-zinc-400 text-zinc-900"
                            : "bg-white border-zinc-200 text-zinc-400 hover:bg-zinc-50"
                        }`}
                      >
                        ☀ 经典白底 (Light)
                      </button>
                      <button
                        onClick={() => {
                          setPyeConfigTheme("dark");
                          triggerToastMsg("已应用暗黑高对比主题 (Theme: vintage)");
                        }}
                        className={`py-1 text-center rounded border text-[11px] transition cursor-pointer ${
                          pyeConfigTheme === "dark"
                            ? "bg-zinc-900 border-zinc-700 text-emerald-400"
                            : "bg-white border-zinc-200 text-zinc-400 hover:bg-zinc-50"
                        }`}
                      >
                        🌙 暗黑模式 (Dark)
                      </button>
                    </div>
                  </div>

                  {/* Aspect: Options checklists (legend_opts, tooltip_opts, datazoom_opts, toolbox_opts, visualmap_opts) */}
                  <div className="space-y-2">
                    <label className="text-[10.5px] font-black text-zinc-500 block uppercase">
                      2. 交互配置选项 (Options)
                    </label>
                    
                    <div className="bg-zinc-50 rounded-lg p-2.5 border border-zinc-150 space-y-2">
                      {/* Tooltip */}
                      <label className="flex items-center justify-between cursor-pointer group">
                        <span className="text-[11px] font-semibold text-zinc-650 group-hover:text-zinc-905 transition">
                          提示框组件 (tooltip_opts)
                        </span>
                        <input
                          type="checkbox"
                          checked={pyeConfigTooltip}
                          onChange={(e) => {
                            setPyeConfigTooltip(e.target.checked);
                            triggerToastMsg(e.target.checked ? "已配置 opts.TooltipOpts() 提示框组件" : "已隐藏提示框触发器");
                          }}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                        />
                      </label>

                      {/* Legend */}
                      <label className="flex items-center justify-between cursor-pointer group">
                        <span className="text-[11px] font-semibold text-zinc-650 group-hover:text-zinc-905 transition">
                          图例组件 (legend_opts)
                        </span>
                        <input
                          type="checkbox"
                          checked={pyeConfigLegend}
                          onChange={(e) => {
                            setPyeConfigLegend(e.target.checked);
                            triggerToastMsg(e.target.checked ? "已配置 opts.LegendOpts() 对应图例标签" : "已隐藏图例分类指示");
                          }}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                        />
                      </label>

                      {/* DataZoom */}
                      <label className="flex items-center justify-between cursor-pointer group">
                        <span className="text-[11px] font-semibold text-zinc-650 group-hover:text-zinc-905 transition">
                          区域缩放轴 (datazoom_opts)
                        </span>
                        <input
                          type="checkbox"
                          checked={pyeConfigDataZoom}
                          onChange={(e) => {
                            setPyeConfigDataZoom(e.target.checked);
                            triggerToastMsg(e.target.checked ? "已装载 DataZoom() 区域缩放滑动滑块" : "已卸载日期区域滑块");
                          }}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                        />
                      </label>

                      {/* Toolbox */}
                      <label className="flex items-center justify-between cursor-pointer group">
                        <span className="text-[11px] font-semibold text-zinc-650 group-hover:text-zinc-905 transition">
                          右侧工具箱 (toolbox_opts)
                        </span>
                        <input
                          type="checkbox"
                          checked={pyeConfigToolbox}
                          onChange={(e) => {
                            setPyeConfigToolbox(e.target.checked);
                            triggerToastMsg(e.target.checked ? "已配置 ToolBox 特效（存储图片、类型切换、区域缩放）" : "已关闭辅助侧旁小工具");
                          }}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                        />
                      </label>

                      {/* VisualMap */}
                      <label className="flex items-center justify-between cursor-pointer group">
                        <span className="text-[11px] font-semibold text-zinc-650 group-hover:text-zinc-905 transition">
                          视觉色阶表 (visualmap_opts)
                        </span>
                        <input
                          type="checkbox"
                          checked={pyeConfigVisualMap}
                          onChange={(e) => {
                            setPyeConfigVisualMap(e.target.checked);
                            triggerToastMsg(e.target.checked ? "已配置 VisualMapOpts() 映射学员分值色彩度" : "已收回视觉色谱棒");
                          }}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Actions for rapid renders */}
                  <div className="grid grid-cols-2 gap-1.8 pt-1 text-[10.5px] font-extrabold text-zinc-700">
                    <button
                      onClick={() => {
                        triggerToastMsg("已成功向沙箱注册 30+ 种典型可视化绘图支持！");
                      }}
                      className="py-1.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-250 rounded text-center cursor-pointer transition-all active:scale-95"
                    >
                      加载 30+ 库
                    </button>
                    <button
                      onClick={() => {
                        triggerToastMsg("已对折线、柱状、饼分布图发起批量重新绘制 (SUCCESS)");
                      }}
                      className="py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-center cursor-pointer transition-all active:scale-95 shadow-3xs"
                    >
                      同步更新渲染
                    </button>
                  </div>
                </div>
              </div>
            ) : activeTab === "model_predict" ? (
              <div className="p-3.5 border-b border-zinc-200 bg-white space-y-4">
                <h4 className="font-extrabold text-[12.5px] text-zinc-800 flex items-center gap-1.5 uppercase select-none font-sans">
                  <Sliders className="w-4 h-4 text-amber-500 animate-spin-slow" />
                  模型部署及应用控制台
                </h4>

                <div className="space-y-3.5 text-xs text-zinc-700">
                  {/* Status Indicator Panel */}
                  <div className="border border-zinc-200 rounded-lg p-3 bg-zinc-50/50 space-y-2.5">
                    <div className="flex justify-between items-center pb-2 border-b border-zinc-150">
                      <span className="text-zinc-500 font-bold">服务运行状态</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${modelAppStatus === "running" ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                        <span className={`font-black ${modelAppStatus === "running" ? "text-emerald-700 font-sans" : "text-red-700"}`}>
                          {modelAppStatus === "running" ? "正在运行 (ONLINE)" : "已停止 (OFFLINE)"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 font-medium text-[11px] text-zinc-650 font-sans">
                      <div className="flex justify-between">
                        <span>微服务名称 (PID)</span>
                        <span className="font-mono text-zinc-900 font-bold">{modelAppStatus === "running" ? "model_app.py (7860)" : "model_app.py (--)"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>宿主映射地址</span>
                        <span className="font-mono text-zinc-900 font-bold text-[10px] hover:underline cursor-pointer">{modelAppStatus === "running" ? "http://127.0.0.1:7860" : "未部署"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>底层模型包</span>
                        <span className="text-zinc-800 font-extrabold font-sans">PyTorch / TorchScript</span>
                      </div>
                    </div>
                  </div>

                  {/* Application controls block */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-zinc-400 block uppercase tracking-wider">应用部署管理 (Application Management)</span>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          if (modelAppStatus === "running") {
                            triggerToastMsg("Flask 预测服务已经是运行中状态。");
                            return;
                          }
                          setModelAppStatus("running");
                          setWebPreviewVisible(true);
                          const rightTimeStr = new Date().toLocaleTimeString('zh-CN', { hour12: false });
                          setPredictionLogs((prev) => [
                            ...prev,
                            `[${rightTimeStr}] 手工指令：点击 [启动应用]`,
                            `[${rightTimeStr}] 正在拉起 /home/student1/workspace/model_app.py`,
                            `[${rightTimeStr}] Flask app re-opened at http://127.0.0.1:7860`
                          ]);
                          triggerToastMsg("预测微服务部署启动成功！");
                        }}
                        className={`py-1.8 text-[11px] font-black rounded-lg border text-center transition cursor-pointer flex items-center justify-center gap-1 ${
                          modelAppStatus === "running"
                            ? "bg-zinc-100 border-zinc-200 text-zinc-400"
                            : "bg-emerald-50 hover:bg-emerald-100/70 border-emerald-200 text-emerald-700"
                        }`}
                      >
                        <Play className="w-3 h-3" />
                        <span>启动应用</span>
                      </button>

                      <button
                        onClick={() => {
                          if (modelAppStatus === "stopped") {
                            triggerToastMsg("服务已经是停止状态。");
                            return;
                          }
                          setModelAppStatus("stopped");
                          const rightTimeStr = new Date().toLocaleTimeString('zh-CN', { hour12: false });
                          setPredictionLogs((prev) => [
                            ...prev,
                            `[${rightTimeStr}] 手工指令：点击 [停止应用]`,
                            `[${rightTimeStr}] Flask Server closed. Port 7860 detached.`
                          ]);
                          triggerToastMsg("预测微服务已断开并下线！");
                        }}
                        className={`py-1.8 text-[11px] font-black rounded-lg border text-center transition cursor-pointer flex items-center justify-center gap-1 ${
                          modelAppStatus === "stopped"
                            ? "bg-zinc-100 border-zinc-200 text-zinc-400"
                            : "bg-red-50 hover:bg-red-100/70 border-red-200 text-red-700"
                        }`}
                      >
                        <Square className="w-3 h-3" />
                        <span>停止应用</span>
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        triggerToastMsg("正在重启后台 Flask 服务并重新加载网络权重...");
                        setModelAppStatus("stopped");
                        setTimeout(() => {
                          setModelAppStatus("running");
                          const rightTimeStr = new Date().toLocaleTimeString('zh-CN', { hour12: false });
                          setPredictionLogs((prev) => [
                            ...prev,
                            `[${rightTimeStr}] 手工指令：点击 [重启应用]`,
                            `[${rightTimeStr}] 停止正在运行的 7860 端口进程`,
                            `[${rightTimeStr}] 重新执行 python model_app.py`,
                            `[${rightTimeStr}] 重新加载 weights 成功 (CUDA 11.8)`,
                            `[${rightTimeStr}] Flask app hot-restarted on http://127.0.0.1:7860`
                          ]);
                          triggerToastMsg("微服务热重载与模型重新载入成功！");
                        }, 500);
                      }}
                      className="w-full py-1.8 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-zinc-700 font-extrabold text-[11px] rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>重启预测应用 (Restart)</span>
                    </button>
                  </div>

                  {/* Weight checkpoint list detail */}
                  <div className="space-y-1.8 pt-1">
                    <span className="text-[10px] font-black text-zinc-400 block uppercase tracking-wider">可用模型权重参数 (Checkpoints)</span>
                    <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-[10.5px] space-y-1.5 font-semibold text-zinc-650 font-sans">
                      <div className="flex justify-between">
                        <span>Classification Weights:</span>
                        <span className="font-mono text-zinc-800">image_classifier.pkl</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Object Detection Weights:</span>
                        <span className="font-mono text-zinc-805">object_detector.pt</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3.5 border-b border-zinc-200 bg-white space-y-3">
                <h4 className="font-extrabold text-[12.5px] text-zinc-800 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-indigo-500" />
                  规则参数配置面板
                </h4>
                
                <div className="space-y-2.5 text-xs text-zinc-700">
                  {/* param: keyword */}
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-black text-zinc-500 block">
                      检索匹配关键词（keyword）：
                    </label>
                    <input
                      type="text"
                      value={analysisConfig.keyword}
                      onChange={(e) => setAnalysisConfig({ ...analysisConfig, keyword: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-250 rounded px-2.5 py-1.5 font-semibold text-xs focus:ring-1 focus:ring-indigo-500 focus:bg-white outline-hidden"
                    />
                  </div>

                  {/* param: min_score */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10.5px] font-black text-zinc-500">
                      <span>过滤最低评分（min_score）：</span>
                      <span className="text-indigo-600 font-black px-1.5 py-0.2 bg-indigo-50 rounded border border-indigo-100">{analysisConfig.min_score}</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      step="1"
                      value={analysisConfig.min_score}
                      onChange={(e) => setAnalysisConfig({ ...analysisConfig, min_score: parseInt(e.target.value) })}
                      className="w-full accent-indigo-600 cursor-pointer text-indigo-500"
                    />
                    <div className="flex justify-between text-[9px] text-zinc-400 select-none">
                      <span>50 分</span>
                      <span>80 分 (默认)</span>
                      <span>100 分</span>
                    </div>
                  </div>

                  {/* param: chart_type */}
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-black text-zinc-500 block">
                      图表导出形式（chart_type）：
                    </label>
                    <select
                      value={analysisConfig.chart_type}
                      onChange={(e) => setAnalysisConfig({ ...analysisConfig, chart_type: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-250 rounded p-1.5 font-semibold text-xs outline-hidden"
                    >
                      <option value="line">折线图 (Line Chart)</option>
                      <option value="bar">柱状图 (Bar Chart)</option>
                      <option value="pie">饼图 (Pie Chart)</option>
                    </select>
                  </div>

                  {/* param: top_k */}
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-black text-zinc-500 block">
                      高频提取项上限（top_k）：
                    </label>
                    <input
                      type="number"
                      value={analysisConfig.top_k}
                      onChange={(e) => setAnalysisConfig({ ...analysisConfig, top_k: parseInt(e.target.value) || 0 })}
                      className="w-full bg-zinc-50 border border-zinc-250 rounded px-2.5 py-1.5 font-semibold text-xs outline-hidden font-mono"
                    />
                  </div>

                  {/* param: fill_missing_value */}
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-black text-zinc-500 block">
                      空值默认填充（fill_missing_value）：
                    </label>
                    <input
                      type="number"
                      value={analysisConfig.fill_missing_value}
                      onChange={(e) => setAnalysisConfig({ ...analysisConfig, fill_missing_value: parseInt(e.target.value) || 0 })}
                      className="w-full bg-zinc-50 border border-zinc-250 rounded px-2.5 py-1.5 font-semibold text-xs outline-hidden font-mono"
                    />
                  </div>

                  {/* buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1 font-bold">
                    <button
                      onClick={handleRestoreParamsDefault}
                      className="py-1.8 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 rounded-lg text-[10.5px] text-zinc-700 transition cursor-pointer text-center"
                    >
                      恢复默认参数
                    </button>
                    <button
                      onClick={handleApplyParams}
                      className="py-1.8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10.5px] transition cursor-pointer text-center shadow-3xs"
                    >
                      应用规则参数
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Task Reset state comparison zone */}
            {activeTab === "pyecharts" ? (
              <div className="p-3.5 bg-emerald-50/20 space-y-2.5 text-xs border-b border-zinc-200 select-none">
                <h4 className="font-extrabold text-[12px] text-emerald-950 flex items-center justify-between">
                  <span>pyecharts 画布加载对齐监视</span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-black border border-emerald-200">
                    RENDER GRAPH
                  </span>
                </h4>

                <div className="bg-zinc-900 rounded-lg p-2.5 text-[10px] space-y-1 font-mono text-zinc-300 border border-zinc-850">
                  <div className="flex justify-between">
                    <span className="text-[#a6e22e]">engine:</span>
                    <span>Canvas (pyecharts.v2)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64b5f6]">active_tab_theme:</span>
                    <span>{pyeSelectedTab}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#ca8622]">timeline_focus:</span>
                    <span className="text-amber-400 font-extrabold">{pyeSelectedYear} 年度</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">canvas_dpi:</span>
                    <span>300 (High fidelity)</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] font-black text-zinc-550">
                  <span>图表渲染状态评估：</span>
                  <span className="text-[#10A66A] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span>正常 模块极速装载</span>
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-zinc-100/50 space-y-3 text-xs border-b border-zinc-200 select-none">
                <h4 className="font-extrabold text-[12px] text-zinc-800 flex items-center justify-between">
                  <span>运行前对比状态对比</span>
                  <span className="text-[9px] bg-[#E1F5FE] text-indigo-700 px-1.5 py-0.2 rounded font-black border border-indigo-100">对比监视器</span>
                </h4>

                <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold">
                  <div className="bg-rose-50/50 p-2 border border-rose-100 rounded-lg space-y-1 font-medium">
                    <span className="text-rose-700 font-extrabold text-[9.5px] uppercase block border-b border-rose-100 pb-0.5">重置前的状态</span>
                    <div className="text-zinc-600">输出结果: 存在计算缓存</div>
                    <div className="text-zinc-600">规则参数: 已自定义</div>
                    <div className="text-zinc-600">临时变量: 已存储运行态</div>
                    <div className="text-zinc-600">训练结果: 2-3条记录</div>
                    <div className="text-zinc-600">图表输出: 含图示及折线</div>
                  </div>

                  <div className="bg-emerald-50/50 p-2 border border-emerald-100 rounded-lg space-y-1 font-medium">
                    <span className="text-[#10A66A] font-extrabold text-[9.5px] uppercase block border-b border-emerald-100 pb-0.5">重置后恢复</span>
                    <div className="text-zinc-550">输出结果: 已彻底清空</div>
                    <div className="text-zinc-550">规则参数: 恢复默认80/线</div>
                    <div className="text-zinc-550">临时变量: 内存全回收</div>
                    <div className="text-zinc-550">训练结果: 重置就绪态</div>
                    <div className="text-zinc-550">图表输出: 回归初始状态</div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10.5px] font-black text-zinc-650 pt-1">
                  <span>沙箱可重新运行：</span>
                  <span className="text-[#10A66A] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Ready 进行中</span>
                  </span>
                </div>
              </div>
            )}

            {/* Isolated accounts list display */}
            <div className="p-3.5 space-y-2.5 text-xs text-zinc-600">
              <h5 className="font-extrabold text-[10.5px] uppercase text-zinc-400 tracking-wider">
                独立隔离账户沙箱列表
              </h5>
              <div className="space-y-1.5 font-mono text-[10px] font-bold">
                <div className="p-1 px-2 border border-emerald-250 bg-emerald-50 text-emerald-800 rounded flex justify-between items-center font-sans font-bold shadow-3xs">
                  <span>student1-python-sandbox (当前)</span>
                  <span className="w-2 h-2 rounded-full bg-[#10A66A] animate-pulse" />
                </div>
                <div className="p-1 px-2 border bg-white text-zinc-400 rounded flex justify-between items-center text-[9.5px]">
                  <span>student2-python-sandbox</span>
                  <span className="font-sans">未受干扰 隔离中</span>
                </div>
                <div className="p-1 px-2 border bg-white text-zinc-400 rounded flex justify-between items-center text-[9.5px]">
                  <span>student3-python-sandbox</span>
                  <span className="font-sans font-medium">未受干扰 隔离中</span>
                </div>
              </div>
            </div>

            {/* 四、Jupyter 导入导出及任务验证控制中心 */}
            <div className="border-t border-zinc-200 bg-white">
              <div className="p-3 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between select-none">
                <span className="font-extrabold text-[12px] text-zinc-700 tracking-wider flex items-center gap-1.5 font-sans">
                  <Activity className="w-3.8 h-3.8 text-blue-600 animate-pulse" />
                  导入导出及事务验证
                </span>
                <span className="bg-blue-100 text-blue-800 text-[9px] font-black px-1.5 py-0.2 rounded font-sans leading-none">
                  INTEGRITY
                </span>
              </div>

              {/* Functional tabs selector for quick demonstrator action paths */}
              <div className="flex border-b border-zinc-150 bg-zinc-50/30 text-[11px] font-black select-none">
                <button
                  onClick={() => {
                    setImportPanelOpen(true);
                    setExportPanelOpen(false);
                  }}
                  className={`flex-1 py-2 text-center border-r border-zinc-150 transition cursor-pointer ${
                    importPanelOpen && !exportPanelOpen
                      ? "bg-white text-blue-700 font-extrabold border-b-2 border-b-blue-600"
                      : "text-zinc-500 hover:bg-zinc-50"
                  }`}
                >
                  📥 导入 & 解析
                </button>
                <button
                  onClick={() => {
                    setExportPanelOpen(true);
                    setImportPanelOpen(false);
                  }}
                  className={`flex-1 py-2 text-center border-r border-zinc-150 transition cursor-pointer ${
                    exportPanelOpen && !importPanelOpen
                      ? "bg-white text-emerald-700 font-extrabold border-b-2 border-b-emerald-600"
                      : "text-zinc-500 hover:bg-zinc-50"
                  }`}
                >
                  📤 导出 & 配置
                </button>
                <button
                  onClick={() => {
                    setImportPanelOpen(false);
                    setExportPanelOpen(false);
                    triggerToastMsg("已对齐事务记录清单");
                  }}
                  className={`flex-1 py-2 text-center transition cursor-pointer ${
                    !importPanelOpen && !exportPanelOpen
                      ? "bg-white text-indigo-700 font-extrabold border-b-2 border-b-indigo-600"
                      : "text-zinc-500 hover:bg-zinc-50"
                  }`}
                >
                  📜 事务运行记录
                </button>
              </div>

              {/* SECTION A: IPYNB FILE IMPORT INTERACTIVE FLOW PANEL */}
              {importPanelOpen && !exportPanelOpen && (
                <div className="p-3.5 space-y-3 font-sans">
                  <div className="flex items-center justify-between">
                    <span className="text-[11.5px] font-black text-zinc-800">导入 Notebook (ipynb)</span>
                    <button
                      onClick={() => setImportPanelOpen(false)}
                      className="text-zinc-400 hover:text-zinc-750 text-xs font-black p-0.5 cursor-pointer"
                    >
                      [✕ 隐藏]
                    </button>
                  </div>

                  {/* Drag and Drop simulate zone */}
                  <div
                    onClick={() => {
                      setSelectedImportFile("导入案例_数据分析训练.ipynb");
                      setImportParseStatus("parsed");
                      triggerToastMsg("已选择本案例：导入案例_数据分析训练.ipynb");
                    }}
                    className="border-2 border-dashed border-zinc-250 hover:border-blue-400 bg-zinc-50/50 hover:bg-blue-50/20 rounded-lg p-4 text-center cursor-pointer transition relative group select-none"
                  >
                    <Upload className="w-6 h-6 text-zinc-400 group-hover:text-blue-500 mx-auto mb-1.5 animate-bounce" />
                    <span className="text-[11px] font-extrabold text-zinc-650 group-hover:text-blue-700 block">
                      {selectedImportFile ? selectedImportFile : "点击或拖拽 ipynb 文件至此区"}
                    </span>
                    <span className="text-[9.5px] text-zinc-400 block mt-1 font-medium">
                      {selectedImportFile ? "无需重新选择" : "可直接选择准备好数据包"}
                    </span>

                    {/* Quick helper selection */}
                    {!selectedImportFile && (
                      <span className="absolute right-2 bottom-2 bg-blue-100 text-blue-800 text-[8.5px] font-black px-1 rounded hover:bg-blue-150 animate-pulse">
                        推荐快速选择 (✓)
                      </span>
                    )}
                  </div>

                  {/* Selected file information block */}
                  {selectedImportFile && (
                    <div className="bg-zinc-50 rounded-lg p-2.5 border border-zinc-200 text-[10.5px] space-y-1.5 font-medium text-zinc-650">
                      <div className="flex justify-between font-mono">
                        <span className="text-zinc-400">依赖文件：</span>
                        <span className="text-zinc-800 font-extrabold truncate max-w-[150px]">
                          {selectedImportFile}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">文件大小：</span>
                        <span className="text-zinc-805 font-bold">142 KB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">单元格共计：</span>
                        <span className="text-blue-700 font-black">5 个 (Markdown: 1 | Code: 4)</span>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span className="text-zinc-400">关联内核：</span>
                        <span className="text-emerald-700 font-extrabold">Python 3 (ipykernel-nlp)</span>
                      </div>
                    </div>
                  )}

                  {/* Parse and Validation status list */}
                  {importParseStatus === "parsed" && (
                    <div className="bg-emerald-50/30 p-2.5 rounded-lg border border-emerald-150 space-y-2">
                      <div className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-widest flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 inline" />
                        Jupyter 自动化完整性校验 (PASSED)
                      </div>
                      <ul className="text-[10px] space-y-1 text-zinc-600 font-bold">
                        <li className="flex justify-between items-center bg-white p-1 rounded px-1.5 border border-emerald-100 shadow-3xs">
                          <span>◎ 1. IPYNB 数据格式有效性验证</span>
                          <span className="text-emerald-600">通过 (✓)</span>
                        </li>
                        <li className="flex justify-between items-center bg-white p-1 rounded px-1.5 border border-emerald-100 shadow-3xs">
                          <span>◎ 2. Notebook Json 文件结构解析</span>
                          <span className="text-emerald-600">通过 (✓)</span>
                        </li>
                        <li className="flex justify-between items-center bg-white p-1 rounded px-1.5 border border-emerald-100 shadow-3xs">
                          <span>◎ 3. Python 核心代码单元行读取</span>
                          <span className="text-emerald-600">通过 (✓)</span>
                        </li>
                        <li className="flex justify-between items-center bg-white p-1 rounded px-1.5 border border-emerald-100 shadow-3xs">
                          <span>◎ 4. 依赖内网 Python 3 内核绑定</span>
                          <span className="text-emerald-600">通过 (✓)</span>
                        </li>
                        <li className="flex justify-between items-center bg-white p-1 rounded px-1.5 border border-emerald-100 shadow-3xs">
                          <span>◎ 5. 学生沙箱计算分区物理写权限</span>
                          <span className="text-emerald-600">通过 (✓)</span>
                        </li>
                      </ul>
                      <p className="text-[9.5px] text-zinc-400 font-medium leading-relaxed font-sans italic">
                        * 解析完毕。历史执行输出已成功保留，可直接查看或点击“运行全部”执行测试。
                      </p>
                    </div>
                  )}

                  {/* Operational actions */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-black font-sans select-none">
                    <button
                      onClick={() => {
                        setSelectedImportFile(null);
                        setImportParseStatus("not_selected");
                        triggerToastMsg("已重置导入参数");
                      }}
                      className="py-1.8 bg-white hover:bg-zinc-100 text-zinc-600 border border-zinc-250 rounded-md transition cursor-pointer text-center"
                    >
                      取消导入
                    </button>
                    <button
                      onClick={() => {
                        if (!selectedImportFile) {
                          // Support quick auto pre-selection for user
                          setSelectedImportFile("导入案例_数据分析训练.ipynb");
                          setImportParseStatus("parsed");
                          triggerToastMsg("已推荐默认案例文件");
                          return;
                        }
                        setActiveTab("imported_analysis");
                        // Add record
                        const newR: RecordType = {
                          key: `r-${Date.now()}`,
                          time: "16:24:05",
                          type: "导入文件",
                          name: "导入案例_数据分析训练.ipynb",
                          status: "运行就绪 (✓ 历史输出已加载)",
                          cells: "Markdown: 1 | Code: 4",
                          operator: "学生1"
                        };
                        setImportExportRecords([newR, ...importExportRecords]);
                        triggerToastMsg("🎉 成功导入 Notebook 并在工作区打开！");
                      }}
                      className="py-1.8 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition cursor-pointer text-center shadow-3xs"
                    >
                      确认导入并打开
                    </button>
                  </div>
                </div>
              )}

              {/* SECTION B: IPYNB FILE EXPORT INTERACTIVE FLOW PANEL */}
              {exportPanelOpen && !importPanelOpen && (
                <div className="p-3.5 space-y-3 font-sans">
                  <div className="flex items-center justify-between">
                    <span className="text-[11.5px] font-black text-zinc-800">导出 Notebook (ipynb)</span>
                    <button
                      onClick={() => setExportPanelOpen(false)}
                      className="text-zinc-400 hover:text-zinc-750 text-xs font-black p-0.5"
                    >
                      [✕ 隐藏]
                    </button>
                  </div>

                  {/* Output configurations */}
                  <div className="space-y-2 bg-zinc-50/50 p-2.5 rounded-lg border border-zinc-200">
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400 font-extrabold uppercase">
                        1. 导出文件名 (Filename)
                      </label>
                      <input
                        type="text"
                        value={exportFileName}
                        onChange={(e) => setExportFileName(e.target.value)}
                        className="w-full text-xs font-mono font-bold bg-white border border-zinc-300 rounded px-2 py-1 text-zinc-750 focus:outline-blue-500"
                        placeholder="请输入导出名称"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-zinc-150">
                      <div className="space-y-0.5">
                        <label className="text-[9.5px] text-zinc-400 font-extrabold block">导出格式</label>
                        <select className="bg-white border rounded text-[10.5px] font-bold p-1 w-full text-zinc-750 focus:outline-none">
                          <option>.ipynb (标准)</option>
                          <option>.py (只含源码)</option>
                          <option>.html (静态图表)</option>
                        </select>
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[9.5px] text-zinc-400 font-extrabold block">对齐元数据</label>
                        <select className="bg-white border rounded text-[10.5px] font-bold p-1 w-full text-zinc-150 focus:outline-none" disabled>
                          <option>student1-kernel</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Included items checklist */}
                  <div className="space-y-1 px-1">
                    <label className="text-[10px] text-zinc-400 font-extrabold uppercase">
                      2. 选择包含的导出数据要素
                    </label>
                    <div className="bg-white rounded-lg p-2.5 border border-zinc-200 space-y-2">
                      <label className="flex items-center justify-between cursor-pointer group">
                        <span className="text-[10.5px] font-semibold text-zinc-600 group-hover:text-zinc-900 transition">
                          导出 Markdown 单元
                        </span>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-3.5 h-3.5 text-emerald-600 focus:ring-emerald-500 rounded border-zinc-300"
                        />
                      </label>
                      <label className="flex items-center justify-between cursor-pointer group">
                        <span className="text-[10.5px] font-semibold text-zinc-600 group-hover:text-zinc-900 transition">
                          导出 Python 代码及文本 Block
                        </span>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-3.5 h-3.5 text-emerald-600 focus:ring-emerald-500 rounded border-zinc-300"
                        />
                      </label>
                      <label className="flex items-center justify-between cursor-pointer group">
                        <span className="text-[10.5px] font-semibold text-zinc-650 group-hover:text-zinc-900 transition flex items-center gap-1">
                          导出 运行输出文本结果 ([Out])
                        </span>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-3.5 h-3.5 text-emerald-600 focus:ring-emerald-500 rounded border-zinc-300"
                        />
                      </label>
                      <label className="flex items-center justify-between cursor-pointer group">
                        <span className="text-[10.5px] font-semibold text-blue-750 group-hover:text-zinc-900 transition flex items-center gap-1 font-bold">
                          ★ 包含 Matplotlib 图像缓存(图表保存✓)
                        </span>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-3.5 h-3.5 text-emerald-600 focus:ring-emerald-500 rounded border-zinc-300"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Export action and validation */}
                  {exportStatus === "generated" && (
                    <div className="bg-emerald-50/45 p-2.5 rounded-lg border border-emerald-200 space-y-2">
                      <div className="text-[10px] font-black text-emerald-800 uppercase tracking-widest flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 inline" />
                        Jupyter 导出元数据对齐检测 (SUCCESS)
                      </div>
                      <ul className="text-[9.5px] space-y-1 text-zinc-600 font-bold">
                        <li className="flex justify-between items-center bg-white p-1 rounded px-1.5 border border-emerald-100">
                          <span>📊 导出 Markdown 单元：</span>
                          <span className="text-zinc-500">1个块 (✓)</span>
                        </li>
                        <li className="flex justify-between items-center bg-white p-1 rounded px-1.5 border border-emerald-100">
                          <span>💻 导出 Python 代码单元：</span>
                          <span className="text-zinc-500">4个块 (✓)</span>
                        </li>
                        <li className="flex justify-between items-center bg-white p-1 rounded px-1.5 border border-emerald-100">
                          <span>📈 Matplotlib 折线图包含：</span>
                          <span className="text-zinc-500">已内置 (✓)</span>
                        </li>
                        <li className="flex justify-between items-center bg-white p-1 rounded px-1.5 border border-emerald-100 font-mono">
                          <span>📁 最终生成包大小：</span>
                          <span className="text-emerald-700">156 KB</span>
                        </li>
                      </ul>
                      <p className="text-[9.5px] text-zinc-400 font-medium leading-relaxed font-sans italic">
                        * 对齐包安全检测完毕。点击下方“下载 ipynb”按钮提取此成果。
                      </p>
                    </div>
                  )}

                  {/* Actions buttons */}
                  <div className="flex flex-col space-y-2 text-xs font-black font-sans select-none pt-1">
                    {/* Step 1: Generate */}
                    <button
                      onClick={() => {
                        setExportStatus("generated");
                        setActiveTab("imported_analysis");
                        // Add record
                        const newR: RecordType = {
                          key: `r-${Date.now()}`,
                          time: "16:25:12",
                          type: "导出文件",
                          name: exportFileName ? exportFileName : "导入案例_数据分析训练_已执行.ipynb",
                          status: "导出通过 (✓ 包含Matplotlib及代码输出)",
                          cells: "Markdown: 1 | Code: 4",
                          operator: "学生1"
                        };
                        setImportExportRecords([newR, ...importExportRecords]);
                        triggerToastMsg(`🎉 成功编译并生成导出文件: ${exportFileName}`);
                      }}
                      className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-750 border border-indigo-250 rounded-md transition cursor-pointer text-center"
                    >
                      ⚡ 第一步：生成导出包
                    </button>

                    {/* Step 2: Download */}
                    {exportStatus === "generated" && (
                      <button
                        onClick={() => {
                          triggerToastMsg(`💾 正在激活下载流，成功保存：${exportFileName}`);
                          // Simulate download action by notifying user
                          const anchor = document.createElement("a");
                          anchor.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ cells: [] }));
                          anchor.setAttribute("download", exportFileName);
                          document.body.appendChild(anchor);
                          setTimeout(() => {
                            document.body.removeChild(anchor);
                          }, 100);
                        }}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition cursor-pointer text-center font-extrabold flex items-center justify-center gap-1.5 shadow-md animate-pulse"
                      >
                        <Download className="w-4 h-4 text-white inline" />
                        下载 ipynb 成果
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* SECTION C: ALWAYS SHOWN STATIC ACTIVE TRANSACTION AND OPERATION ACTIVITY LOGS */}
              {(!importPanelOpen && !exportPanelOpen) && (
                <div className="p-3 bg-[#FCFDFD] space-y-3 font-sans max-h-[360px] overflow-y-auto">
                  <div className="flex justify-between items-center select-none">
                    <span className="text-[11px] font-extrabold text-zinc-550 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-zinc-505" />
                      运行及导入导出日志 ({importExportRecords.length})
                    </span>
                    <button
                      onClick={() => {
                        setImportExportRecords(initialRecords);
                        triggerToastMsg("已还原至标准审计底稿数据");
                      }}
                      className="text-[9.5px] bg-zinc-100 hover:bg-zinc-200 text-zinc-600 font-bold px-1.5 py-0.5 rounded cursor-pointer"
                    >
                      重置审计
                    </button>
                  </div>

                  {/* Tables mapping */}
                  <div className="space-y-2.5">
                    {importExportRecords.map((item, index) => (
                      <div
                        key={item.key}
                        className={`bg-white border rounded-lg p-2.5 text-[10.5px] leading-normal font-medium shadow-3xs hover:border-zinc-300 transition ${
                          index === 0 ? "border-l-4 border-l-blue-500 border-blue-200" : "border-zinc-200"
                        }`}
                      >
                        <div className="flex justify-between items-center font-mono">
                          <span className={`px-1.5 py-0.2 rounded text-[9.5px] font-black ${
                            item.type === "导入文件"
                              ? "bg-blue-50 text-blue-700 border border-blue-150 font-sans"
                              : item.type === "导出文件"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-150 font-sans"
                              : "bg-zinc-100 text-zinc-600 font-sans"
                          }`}>
                            {item.type}
                          </span>
                          <span className="text-zinc-400 font-bold text-[9.5px]">{item.time}</span>
                        </div>

                        <div className="text-zinc-800 font-mono mt-1.5 font-extrabold truncate max-w-[260px]">
                          {item.name}
                        </div>

                        <div className="text-[9.5px] text-zinc-400 flex justify-between mt-1 border-t border-zinc-50 pt-1 font-sans">
                          <span>结构: {item.cells}</span>
                          <span className="text-zinc-500 font-semibold font-mono">核算: {item.operator}</span>
                        </div>

                        <div className="text-[9.5px] text-blue-600 mt-1 font-semibold bg-zinc-50 p-1 rounded font-sans flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping shrink-0" />
                          <span className="truncate">{item.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-[9.5px] text-zinc-400 leading-normal font-sans text-center border-t border-zinc-100 pt-2 select-none italic">
                    ✓ 沙箱实时审计探针已对齐本地文件更改。
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* 隐藏/展示终端控制区 */}
        {isTerminalOpen && (
          <div className="w-[320px] border-l border-zinc-200 bg-[#1e1e1e] text-zinc-200 flex flex-col shrink-0 select-text font-mono text-xs">
            <div className="p-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between select-none">
              <span className="font-extrabold text-[11px] text-zinc-400 flex items-center gap-2">
                <Terminal className="w-3.8 h-3.8 text-amber-500" />
                <span>系统终端 (sandbox@jupyter)</span>
              </span>
              <button
                onClick={() => setIsTerminalOpen(false)}
                className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Shell contents */}
            <div className="flex-1 p-3.5 space-y-2 overflow-y-auto">
              <div className="text-zinc-500 text-[10.5px]">
                Linux 5.4.0-109-generic x86_64 system ready.
              </div>
              <div>
                <span className="text-[#64b5f6]">sandbox@jupyter:~$</span> <span className="text-zinc-100">python -V</span>
              </div>
              <div className="text-zinc-400">Python 3.10.8 (Jupyter Sandbox virtual cluster)</div>
              
              <div className="pt-2">
                <span className="text-[#64b5f6]">sandbox@jupyter:~$</span> <span className="text-zinc-100">pip list | grep -E "pandas|matplotlib|jieba"</span>
              </div>
              <div className="text-zinc-400 text-[11px] space-y-0.5 pointer-events-none">
                <div>jieba                                 0.42.1</div>
                <div>matplotlib                            3.7.2</div>
                <div>pandas                                2.1.0</div>
                <div>lxml                                  4.9.3</div>
              </div>

              <div className="pt-2 text-[10.5px]">
                <span className="text-[#10A66A] font-bold">● IP 172.18.0.4 端口已开放映射。</span>
              </div>
            </div>

            <div className="p-2 bg-zinc-900 border-t border-zinc-800 select-none flex gap-1.5">
              <input
                type="text"
                disabled
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs outline-hidden text-zinc-300"
                placeholder="在此直接输入命令行指令..."
              />
              <button
                onClick={() => triggerToastMsg("已对该容器发布异步系统执行指令")}
                className="px-3 py-1 bg-amber-600 text-white rounded text-[11px] font-bold"
              >
                发送
              </button>
            </div>
          </div>
        )}

        {/* File Preview Overlay Modal */}
        {selectedFileForPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-3xs animate-fadeIn p-6">
            <div className="bg-white rounded-xl shadow-xl border border-zinc-200 w-full max-w-2xl h-[480px] flex flex-col overflow-hidden animate-scaleIn select-text">
              
              {/* Header */}
              <div className="bg-zinc-100 border-b border-zinc-200 p-4 flex items-center justify-between select-none shrink-0">
                <div className="flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-indigo-600 animate-pulse" />
                  <div className="text-sm font-black text-zinc-900 font-sans">
                    文件查看: <span className="font-mono text-zinc-600 bg-white px-2 py-0.5 rounded border border-zinc-200 ml-1.5 text-xs">{selectedFileForPreview.name}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFileForPreview(null)}
                  className="p-1.5 bg-white hover:bg-rose-50 hover:text-rose-600 rounded-lg border border-zinc-200 hover:border-rose-200 text-zinc-500 cursor-pointer transition flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Path bar */}
              <div className="bg-zinc-50 border-b border-zinc-150 px-4 py-2 font-mono text-[10.5px] text-zinc-400 select-all shrink-0">
                文件全局沙箱路径: {selectedFileForPreview.path}
              </div>

              {/* Content area based on preview type */}
              <div className="flex-1 p-4 overflow-y-auto bg-zinc-950 font-mono text-[11.5px] text-zinc-100 leading-normal select-text">
                {selectedFileForPreview.type === "json" || selectedFileForPreview.type === "code" ? (
                  <pre className="whitespace-pre-wrap font-mono select-all">
                    {selectedFileForPreview.content}
                  </pre>
                ) : selectedFileForPreview.type === "binary" ? (
                  <div className="space-y-2 p-3 text-[11px] text-amber-500">
                    <pre className="whitespace-pre-wrap font-mono uppercase bg-zinc-900 border border-amber-900/30 p-3.5 rounded-lg text-amber-400 select-all">
                      {selectedFileForPreview.content}
                    </pre>
                  </div>
                ) : (
                  /* IMAGE TYPE */
                  <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 p-4 space-y-4 select-none">
                    {selectedFileForPreview.content === "demo_cat.jpg" ? (
                      <div className="p-4 bg-indigo-950 border-4 border-indigo-550 rounded-xl relative overflow-hidden flex flex-col items-center justify-center h-48 w-48 shadow-lg">
                        <Camera className="w-16 h-16 text-indigo-400 animate-bounce" />
                        <span className="text-[10px] text-white font-extrabold mt-3 bg-zinc-950/70 p-1 rounded font-mono">IMAGE: demo_cat.jpg</span>
                      </div>
                    ) : (
                      <div className="p-4 bg-zinc-950 border-4 border-emerald-550 rounded-xl relative overflow-hidden flex flex-col items-center justify-center h-48 w-48 shadow-lg bg-gradient-to-tr from-zinc-800 to-zinc-950">
                        <Monitor className="w-16 h-16 text-emerald-400 animate-pulse" />
                        <span className="text-[10px] text-white font-extrabold mt-3 bg-zinc-950/70 p-1 rounded font-mono">IMAGE: demo_road.jpg</span>
                      </div>
                    )}
                    <span className="text-zinc-400 text-xs font-semibold select-none text-center">此静态测试样片已加载就绪，可供微服务推理接口调用。</span>
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="bg-zinc-50 border-t border-zinc-200 p-3 flex justify-end shrink-0 select-none">
                <button
                  onClick={() => setSelectedFileForPreview(null)}
                  className="px-4 py-1.8 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-lg transition"
                >
                  关闭预览
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 七、底部状态栏 */}
      <div className="bg-[#EBF1F5] border-t border-zinc-300 text-zinc-650 height-[28px] px-4 flex items-center justify-between text-[11.5px] select-none font-medium shrink-0">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-semibold text-zinc-800">Saving completed</span>
          </span>
          <span className="text-zinc-300">|</span>
          <span>工作空间目录: <b className="font-mono text-zinc-700">/home/sandbox/notebook/data</b></span>
        </div>

        <div className="flex items-center gap-3">
          <span>Mode: <b className="font-sans text-indigo-700">Command</b></span>
          <span className="text-zinc-300">|</span>
          <span className="flex items-center gap-1 font-mono text-zinc-700">
            <span>Python 3 (ipykernel)</span>
            <span className="text-zinc-400">|</span>
            <span className="font-bold text-[#10A66A]">Idle</span>
          </span>
        </div>
      </div>

      {/* 任务重置确认弹窗 */}
      {resetConfirmVisible && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 select-none backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-zinc-250 w-full max-w-[420px] overflow-hidden">
            
            {/* Header */}
            <div className="p-4 bg-rose-50 border-b border-rose-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                <RotateCcw className="w-5 h-5 animate-spin" style={{ animationDuration: '3s' }} />
              </div>
              <div>
                <h3 className="text-sm font-black text-rose-950">
                  确认重置虚拟沙箱任务？
                </h3>
                <p className="text-[11px] text-rose-700/80 font-bold">
                  将情况全部运行配置、数据和参数缓存
                </p>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-5 space-y-3.5 text-xs text-zinc-600 leading-relaxed font-semibold">
              <div className="bg-zinc-50 rounded-lg p-3 border space-y-1.5 text-[11px] text-zinc-700 font-medium">
                <p className="text-zinc-400 font-bold uppercase tracking-wider text-[9.5px]">重置操作预计执行范围：</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>清空 & 还原所有运行单元 Notebook 输出（Cell Outputs）</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>规则参数 keyword 恢复为 <code>"商品"</code>，min_score 恢复为 <code>80</code></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>清除 Pandas DataFrame 缓存及 IPYKERNEL 的内存变量</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>沙箱状态重置为 <code>"已重置"</code>，并记录重置历史</span>
                </div>
              </div>

              <div className="text-[11px] text-zinc-400 font-medium italic">
                提示：由于本系统提供账号无关的完全隔离沙箱，本次重置仅影响 <u>学生1 (student1-python-sandbox)</u> 账户下的内容，不会对其他账户产生任何潜在的数据干扰。
              </div>
            </div>

            {/* Actions Footer */}
            <div className="bg-zinc-50 px-5 py-3 border-t border-zinc-200 flex justify-end gap-2 font-bold text-xs">
              <button
                onClick={() => setResetConfirmVisible(false)}
                className="px-4 py-2 hover:bg-zinc-200 border border-zinc-300 rounded-lg text-zinc-700 transition cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition cursor-pointer shadow-sm"
              >
                开始任务重置
              </button>
            </div>

          </div>
        </div>
      )}

      {/* IPYNB 导入/上传文件选择弹窗 */}
      {uploadDialogVisible && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 select-none backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-lg shadow-2xl border border-zinc-300 w-full max-w-[460px] overflow-hidden font-sans">
            {/* Window header representing actual custom standard file picker style */}
            <div className="bg-zinc-100 border-b border-zinc-200 px-3.5 py-2 flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-700">打开</span>
              <button
                onClick={() => setUploadDialogVisible(false)}
                className="text-zinc-500 hover:text-zinc-750 text-sm font-black p-0.5"
              >
                ✕
              </button>
            </div>

            {/* Local files list layout */}
            <div className="p-4 space-y-3">
              <div className="text-[11px] text-zinc-400 font-bold mb-1 uppercase tracking-wide">
                本地电脑文件选单 / 本地磁盘 (C:)
              </div>

              <div className="border border-zinc-200 rounded bg-zinc-50/50 max-h-[140px] overflow-y-auto">
                {/* File Row 1 */}
                <div
                  onClick={() => setSelectedUploadFile("3 Python 基本数据类型.ipynb")}
                  className={`p-2.5 px-3 border-b border-zinc-150 flex items-center justify-between text-xs cursor-pointer transition ${
                    selectedUploadFile === "3 Python 基本数据类型.ipynb"
                      ? "bg-blue-50 text-blue-900 font-extrabold"
                      : "text-zinc-650 hover:bg-white"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-orange-500" />
                    <span>3 Python 基本数据类型.ipynb</span>
                  </span>
                  <span className="text-[10px] text-zinc-400">IPYNB 文件</span>
                </div>

                {/* File Row 2 */}
                <div
                  onClick={() => setSelectedUploadFile("3. Python 数据类型-答案.ipynb")}
                  className={`p-2.5 px-3 flex items-center justify-between text-xs cursor-pointer transition ${
                    selectedUploadFile === "3. Python 数据类型-答案.ipynb"
                      ? "bg-blue-50 text-blue-900 font-extrabold"
                      : "text-zinc-650 hover:bg-white"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-emerald-500 animate-pulse" />
                    <span>3. Python 数据类型-答案.ipynb</span>
                  </span>
                  <span className="text-[10px] font-bold text-zinc-500">IPYNB 文件</span>
                </div>
              </div>

              {/* Type selection details and help info */}
              <div className="space-y-2 text-xs font-bold text-zinc-600 pt-1">
                <div className="flex justify-between items-center bg-zinc-50 p-2 rounded border border-zinc-200 text-[11px]">
                  <span className="text-zinc-400">文件类型:</span>
                  <span className="text-zinc-700 font-mono font-extrabold">IPYNB 格式(*.ipynb)</span>
                </div>
                <p className="text-[10px] text-zinc-400 font-medium leading-relaxed italic">
                  * 提示：双击或选择“3. Python 数据类型-答案.ipynb”并确认，系统会将此数据科学案例文件导入到 Jupyter 工作空间中并打开执行标签页。
                </p>
              </div>
            </div>

            {/* Dialog Actions Footer */}
            <div className="bg-zinc-50 px-4 py-2.5 border-t border-zinc-200 flex justify-end gap-2 font-bold text-xs select-none">
              <button
                onClick={() => setUploadDialogVisible(false)}
                className="px-4 py-1.8 bg-white hover:bg-zinc-100 border border-zinc-300 rounded text-zinc-700 transition cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={() => {
                  const matchedFileName = "3. Python 数据类型-答案.ipynb";

                  // Update directory
                  setFilesList(prev => {
                    if (prev.some(f => f.name === matchedFileName)) return prev;
                    return [
                      ...prev,
                      { name: matchedFileName, type: "ipynb", lastModified: "2分钟前" }
                    ];
                  });

                  // Open file tab
                  setActiveTab("imported_analysis");

                  // Show dynamic prompt toast
                  triggerToastMsg("ipynb 文件已导入并打开。");

                  // Add dynamic import record
                  const logTime = new Date().toTimeString().split(' ')[0];
                  const newImportRecord = {
                    key: `rec-import-${Date.now()}`,
                    time: logTime,
                    type: "导入文件",
                    name: matchedFileName,
                    status: "就绪并已装载至学生计算分区",
                    cells: "Markdown: 1 | Code: 4",
                    operator: "学生1"
                  };
                  setImportExportRecords(prev => [newImportRecord, ...prev]);

                  setUploadDialogVisible(false);
                }}
                className="px-4 py-1.8 bg-blue-600 hover:bg-blue-700 text-white rounded transition cursor-pointer shadow-3xs"
              >
                打开
              </button>
            </div>
          </div>
        </div>
      )}

      {/* floating right-click context menu */}
      {contextMenu.visible && (
        <>
          {/* invisible fullscreen overlay to capture mouse clicks to close context-menu safely */}
          <div
            className="fixed inset-0 z-[100] bg-transparent"
            onClick={() => setContextMenu({ visible: false, x: 0, y: 0, fileName: null })}
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu({ visible: false, x: 0, y: 0, fileName: null });
            }}
          />
          <div
            className="fixed bg-white border border-zinc-250 rounded shadow-lg py-1 z-[101] min-w-[180px] text-xs font-sans select-none animate-fadeIn"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            {/* 1. Open */}
            <button
              onClick={() => {
                if (contextMenu.fileName) {
                  if (contextMenu.fileName.includes("数据类型")) {
                    setActiveTab("imported_analysis");
                    triggerToastMsg("已激活标签页：3. Python 数据类型-答案.ipynb");
                  } else if (contextMenu.fileName.includes("预置")) {
                    setActiveTab("preset");
                    triggerToastMsg("已激活标签页：平台预置模块.ipynb");
                  } else if (contextMenu.fileName.includes("pyecharts")) {
                    setActiveTab("pyecharts");
                    triggerToastMsg("已激活标签页：pyecharts可视化组件.ipynb");
                  } else {
                    setActiveTab("xpath");
                    triggerToastMsg("已激活标签页：xpath 爬虫分析案例");
                  }
                }
                setContextMenu({ visible: false, x: 0, y: 0, fileName: null });
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-zinc-100 flex items-center justify-between text-zinc-700 hover:text-zinc-900 font-bold"
            >
              <span>Open</span>
            </button>

            {/* Rename / Delete / Cut / Copy / Duplicate */}
            <button
              onClick={() => {
                triggerToastMsg(`重命名: ${contextMenu.fileName}`);
                setContextMenu({ visible: false, x: 0, y: 0, fileName: null });
              }}
              className="w-full text-left px-3 py-1.2 hover:bg-zinc-100 text-zinc-700 hover:text-zinc-900"
            >
              Rename
            </button>
            <button
              onClick={() => {
                triggerToastMsg(`已从小端卸载: ${contextMenu.fileName}`);
                setContextMenu({ visible: false, x: 0, y: 0, fileName: null });
              }}
              className="w-full text-left px-3 py-1.2 hover:bg-zinc-100 text-zinc-700 hover:text-zinc-900"
            >
              Delete
            </button>
            <button
              onClick={() => {
                triggerToastMsg(`已剪切目录: ${contextMenu.fileName}`);
                setContextMenu({ visible: false, x: 0, y: 0, fileName: null });
              }}
              className="w-full text-left px-3 py-1.2 hover:bg-zinc-100 text-zinc-700 hover:text-zinc-900"
            >
              Cut
            </button>
            <button
              onClick={() => {
                triggerToastMsg(`已复制到粘贴板: ${contextMenu.fileName}`);
                setContextMenu({ visible: false, x: 0, y: 0, fileName: null });
              }}
              className="w-full text-left px-3 py-1.2 hover:bg-zinc-100 text-zinc-700 hover:text-zinc-900"
            >
              Copy
            </button>

            <div className="border-t border-zinc-100 my-1" />

            {/* Download ipynb */}
            <button
              onClick={() => {
                if (contextMenu.fileName) {
                  handleDownloadFile(contextMenu.fileName);
                }
              }}
              className="w-full text-left px-3 py-1.8 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1.5 border-y border-emerald-100"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600 text-xs shrink-0" />
              <span>Download (.ipynb)</span>
            </button>

            <div className="border-t border-zinc-100 my-1" />

            <button
              onClick={() => {
                triggerToastMsg("已停止此代码内核占用");
                setContextMenu({ visible: false, x: 0, y: 0, fileName: null });
              }}
              className="w-full text-left px-3 py-1.2 hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800"
            >
              Shut Down Kernel
            </button>
          </div>
        </>
      )}

    </div>
  );
}
