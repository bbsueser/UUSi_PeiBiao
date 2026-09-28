import React, { useState, useMemo, useEffect } from "react";
import { ExamResults } from "./ExamResults";
import { ExamMonitor } from "./ExamMonitor";

import { ExamGrading } from "./ExamGrading";

import { 
  Plus, 
  Edit3, 
  Trash2, 
  Calendar, 
  MapPin, 
  Users, 
  Info, 
  ChevronRight, 
  Save, 
  X, 
  CheckCircle2, 
  Clock,
  Layers,
  FileText,
  AlertCircle,
  Settings,
  ClipboardList,
  CheckSquare,
  Layout,
  UserCheck,
  Search,
  UploadCloud,
  Upload,
  MonitorStop,
  PieChart as PieChartIcon,
  BarChart2,
  BookOpen
} from "lucide-react";

interface MarkingSettings {
  markingType: "系统批阅" | "人工批阅" | "混合批阅";
  auditMode: {
    enableReview: boolean;
    reviewRatio: number;
    enableAbnormalAudit: boolean;
    requireAuditBeforeRelease: boolean;
    hideStudentInfo: boolean;
    abnormalThreshold: number;
  };
  markingMethod: "按整卷分配" | "按题目分配" | "按班级分配" | "按场次分配" | "系统自动判分";
  personnel: {
    mainMarkers: string[];
    reviewMarkers: string[];
    arbitrationMarker: string;
    taskInstruction: string;
  };
}

interface AntiCheatConfig {
  preventSwitch: boolean;
  maxSwitch: number;
  preventCopy: boolean;
  preventPaste: boolean;
  preventRightClick: boolean;
  forceFullScreen: boolean;
  timeoutAction: "自动交卷" | "禁止继续作答" | "标记异常后允许提交";
}

interface Session {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  duration: number; // 考试时长 (分钟)
  allowedAttempts: number; // 限考次数
  passingScore: number; // 及格分数
  location: string;
  targetClass: string;
  studentCount: number;
  status: "未开始" | "进行中" | "已结束";
  markingSettings: MarkingSettings;
  antiCheatConfig?: AntiCheatConfig;
}

interface Exam {
  id: string;
  name: string;
  type: string;
  description: string;
  status: "未开始" | "进行中" | "已结束";
  sessions: Session[];
  associatedPapers?: string[];
}

interface ExamManagementProps {
  onBack: () => void;
  showToast: (msg: string) => void;
}

export default function ExamManagement({ onBack, showToast }: ExamManagementProps) {
  const [exams, setExams] = useState<Exam[]>([
    {
      id: "exam-101",
      name: "物联网设备接入能力测评",
      type: "认证测评",
      description: "面向物联网设备接入、通信协议和平台应用能力的综合测评。",
      status: "未开始",
      associatedPapers: ["p1", "p2", "p3"],
      sessions: [
        {
          id: "s1",
          name: "第一场",
          startTime: "2026-06-10 09:00",
          endTime: "2026-06-10 11:00",
          duration: 120,
          allowedAttempts: 1,
          passingScore: 60,
          location: "线上考试环境",
          targetClass: "物联网2301班",
          studentCount: 42,
          status: "未开始",
          markingSettings: {
            markingType: "混合批阅",
            auditMode: {
              enableReview: true,
              reviewRatio: 20,
              enableAbnormalAudit: true,
              requireAuditBeforeRelease: true,
              hideStudentInfo: true,
              abnormalThreshold: 15
            },
            markingMethod: "按题目分配",
            personnel: {
              mainMarkers: ["教师1", "教师2"],
              reviewMarkers: ["教师3"],
              arbitrationMarker: "教师4",
              taskInstruction: "客观题由系统自动批阅，主观题按题目分配给主阅卷教师，异常试卷进入复核流程。"
            }
          }
        },
        {
          id: "s2",
          name: "第二场",
          startTime: "2026-06-10 14:00",
          endTime: "2026-06-10 16:00",
          duration: 120,
          allowedAttempts: 1,
          passingScore: 60,
          location: "线上考试环境",
          targetClass: "物联网2302班",
          studentCount: 39,
          status: "未开始",
          markingSettings: {
            markingType: "人工批阅",
            auditMode: {
              enableReview: true,
              reviewRatio: 20,
              enableAbnormalAudit: true,
              requireAuditBeforeRelease: true,
              hideStudentInfo: true,
              abnormalThreshold: 15
            },
            markingMethod: "按整卷分配",
            personnel: {
              mainMarkers: ["教师1"],
              reviewMarkers: ["教师2"],
              arbitrationMarker: "教师3",
              taskInstruction: "本场次全部由人工判分。"
            }
          }
        },
        {
          id: "s3",
          name: "第三场",
          startTime: "2026-06-11 14:30",
          endTime: "2026-06-11 16:30",
          duration: 120,
          allowedAttempts: 2,
          passingScore: 70,
          location: "线上考试环境",
          targetClass: "工业互联网2301班",
          studentCount: 36,
          status: "未开始",
          markingSettings: {
            markingType: "系统批阅",
            auditMode: {
              enableReview: false,
              reviewRatio: 0,
              enableAbnormalAudit: false,
              requireAuditBeforeRelease: true,
              hideStudentInfo: true,
              abnormalThreshold: 0
            },
            markingMethod: "系统自动判分",
            personnel: {
              mainMarkers: [],
              reviewMarkers: [],
              arbitrationMarker: "",
              taskInstruction: "全客观题，系统自动评分。"
            }
          }
        }
      ]
    },
    {
      id: "exam-102",
      name: "Linux基础命令阶段考试",
      type: "常规考试",
      description: "考察 Linux 常用命令操作及目录结构理解。",
      status: "未开始",
      sessions: [
        {
          id: "s4",
          name: "第一场",
          startTime: "2026-06-12 10:00",
          endTime: "2026-06-12 12:00",
          duration: 120,
          allowedAttempts: 1,
          passingScore: 60,
          location: "线上考试环境",
          targetClass: "物联网2301班",
          studentCount: 45,
          status: "未开始",
          markingSettings: {
            markingType: "混合批阅",
            auditMode: {
              enableReview: true,
              reviewRatio: 15,
              enableAbnormalAudit: true,
              requireAuditBeforeRelease: true,
              hideStudentInfo: true,
              abnormalThreshold: 10
            },
            markingMethod: "按题目分配",
            personnel: {
              mainMarkers: ["教师1"],
              reviewMarkers: ["教师2"],
              arbitrationMarker: "教师3",
              taskInstruction: "常规考试，请严谨判分。"
            }
          }
        },
        {
          id: "s5",
          name: "第二场",
          startTime: "2026-06-12 15:00",
          endTime: "2026-06-12 17:00",
          duration: 120,
          allowedAttempts: 1,
          passingScore: 60,
          location: "线上考试环境",
          targetClass: "物联网2302班",
          studentCount: 40,
          status: "未开始",
          markingSettings: {
            markingType: "混合批阅",
            auditMode: {
              enableReview: true,
              reviewRatio: 15,
              enableAbnormalAudit: true,
              requireAuditBeforeRelease: true,
              hideStudentInfo: true,
              abnormalThreshold: 10
            },
            markingMethod: "按题目分配",
            personnel: {
              mainMarkers: ["教师1"],
              reviewMarkers: ["教师2"],
              arbitrationMarker: "教师3",
              taskInstruction: "常规考试，请严谨判分。"
            }
          }
        }
      ]
    }
  ]);

  const [activeModule, setActiveModule] = useState<"考试管理" | "试卷管理" | "题库管理" | "试题管理" | "考试结果" | "阅卷评分" | "考试监控">("考试管理");
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [editingTab, setEditingTab] = useState<"基础信息" | "场次设置" | "阅卷设置" | "关联试卷" | "试题管理" | "题库管理" | "试卷管理">("基础信息");
  const [showSessionModal, setShowSessionModal] = useState<boolean>(false);
  const [showMarkingModal, setShowMarkingModal] = useState<boolean>(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [markingSessionId, setMarkingSessionId] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>("s1");

  type QuestionType = "单选题" | "多选题" | "判断题" | "填空题" | "简答题" | "实操题";
  
  interface Question {
    id: string;
    type: QuestionType;
    content: string;
    answer: string;
    score: number;
    difficulty: "简单" | "中等" | "困难";
    knowledgePoint: string;
    chapter: string;
    entryMethod: "单题新增" | "批量导入" | "模板导入";
    status: "已启用" | "已停用";
  }

  interface PaperRule {
    id: string;
    type: string;
    difficulty: string;
    knowledgePoint: string;
    count: number;
    scorePerQuestion: number;
  }

  interface PaperScoreItem {
    id: string;
    name: string;
    score: number;
    desc: string;
  }

  interface Paper {
    id: string;
    name: string;
    type: "理论试卷" | "实操试卷";
    composeMethod: "固定组卷" | "随机组卷" | "实操任务组卷";
    questionCount: number;
    totalScore: number;
    passScore: number;
    sessions: string[];
    status: "草稿" | "已启用" | "已停用";
    createTime: string;
    desc?: string;
    questionIds?: string[]; // for old logic, we can keep it
    rules?: PaperRule[]; // old logic
    sections?: PaperSection[];
    taskName?: string;
    env?: string;
    scoreMethod?: string;
    scoreItems?: PaperScoreItem[];
  }

  const [papers, setPapers] = useState<Paper[]>([
    {
      id: "p1",
      name: "物联网设备接入理论试卷A",
      type: "理论试卷",
      composeMethod: "固定组卷",
      questionCount: 36,
      totalScore: 100,
      passScore: 60,
      sessions: ["第一场", "第二场"],
      status: "已启用",
      createTime: "2026-06-03 09:30"
    },
    {
      id: "p2",
      name: "物联网设备接入理论随机卷",
      type: "理论试卷",
      composeMethod: "随机组卷",
      questionCount: 40,
      totalScore: 100,
      passScore: 60,
      sessions: ["第三场"],
      status: "已启用",
      createTime: "2026-06-03 10:10"
    },
    {
      id: "p3",
      name: "设备接入实操试卷",
      type: "实操试卷",
      composeMethod: "实操任务组卷",
      questionCount: 5,
      totalScore: 100,
      passScore: 70,
      sessions: ["第一场"],
      status: "已启用",
      createTime: "2026-06-03 11:20",
      env: "工程虚拟仿真",
      scoreMethod: "混合评分",
      scoreItems: [
        { id: "s1", name: "设备创建与配置", score: 20, desc: "完成设备创建、密钥配置和基础参数设置" },
        { id: "s2", name: "物模型配置", score: 20, desc: "完成属性、事件、服务配置" },
        { id: "s3", name: "通信参数配置", score: 20, desc: "完成 MQTT Topic、Broker 参数配置" },
        { id: "s4", name: "数据采集与上报", score: 25, desc: "完成传感器数据采集与平台上报" },
        { id: "s5", name: "实验报告提交", score: 15, desc: "提交完整实验报告与结果说明" }
      ]
    },
    {
      id: "p4",
      name: "数据采集实操试卷",
      type: "实操试卷",
      composeMethod: "实操任务组卷",
      questionCount: 4,
      totalScore: 100,
      passScore: 70,
      sessions: [],
      status: "草稿",
      createTime: "2026-06-03 14:00"
    }
  ]);

  const [paperFilterName, setPaperFilterName] = useState("");
  const [paperFilterType, setPaperFilterType] = useState("全部");
  const [paperFilterMethod, setPaperFilterMethod] = useState("全部");
  const [paperFilterStatus, setPaperFilterStatus] = useState("全部");
  
  const [editingPaperId, setEditingPaperId] = useState<string | null>(null);
  const [isEditingPaper, setIsEditingPaper] = useState(false);
  const [newPaper, setNewPaper] = useState<Partial<Paper>>({});
  const [paperGenPreview, setPaperGenPreview] = useState(false);

  interface PaperSection {
    id: string;
    name: string;
    type: QuestionType | "全部题型";
    targetCount: number;
    scorePerQuestion: number;
    description?: string;
    randomBank?: string;
    randomDifficulty?: string;
    randomKnowledge?: string;
    questions?: string[]; // IDs of picked questions for fixed compose
  }

  const [paperEditTab, setPaperEditTab] = useState<"基础信息" | "组卷配置" | "试卷预览">("基础信息");
  const [paperSections, setPaperSections] = useState<PaperSection[]>([]);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [newSection, setNewSection] = useState<Partial<PaperSection>>({});
  
  const [pickingForSectionId, setPickingForSectionId] = useState<string | null>(null);
  const [pickerBank, setPickerBank] = useState("全部题库");
  const [pickerType, setPickerType] = useState<QuestionType | "全部题型">("全部题型");
  const [pickerDifficulty, setPickerDifficulty] = useState("全部难度");
  const [pickerKnowledge, setPickerKnowledge] = useState("全部知识点");
  const [pickerChapter, setPickerChapter] = useState("全部章节");
  const [pickerSearch, setPickerSearch] = useState("");
  const [batchSelectedQuestionIds, setBatchSelectedQuestionIds] = useState<string[]>([]);

  const savePaper = () => {
    // Basic validation
    if (newPaper.type !== "实操试卷") {
      if (paperSections.length === 0) {
        showToast("请至少配置一个大题。");
        return;
      }
      for (const sec of paperSections) {
        if (!sec.targetCount || sec.targetCount <= 0) {
          showToast(`大题「${sec.name}」题目数量必须大于 0。`);
          return;
        }
        if (!sec.scorePerQuestion || sec.scorePerQuestion <= 0) {
          showToast(`大题「${sec.name}」每题分值必须大于 0。`);
          return;
        }
        if (newPaper.composeMethod === "固定组卷") {
           if ((sec.questions?.length ?? 0) < sec.targetCount) {
             showToast(`「${sec.name}」已选试题数量不足。`);
             return;
           }
        } else {
           if (!sec.randomBank || !sec.type || sec.type === "全部题型") {
             showToast(`「${sec.name}」请选择题库和题型后再保存组卷规则。`);
             return;
           }
        }
      }
      
      const calcTotal = paperSections.reduce((acc, sec) => acc + (sec.targetCount * sec.scorePerQuestion), 0);
      const calcCount = paperSections.reduce((acc, sec) => acc + sec.targetCount, 0);
      
      newPaper.sections = paperSections;
      newPaper.totalScore = calcTotal;
      newPaper.questionCount = calcCount;
      if (calcTotal <= 0) {
         showToast("试卷总分必须大于 0。");
         return;
      }
    }

    if (editingPaperId) {
      setPapers(papers.map(p => p.id === editingPaperId ? { ...p, ...newPaper } as Paper : p));
      showToast("试卷已更新。");
    } else {
      const id = "p" + Date.now();
      const paper = {
        ...newPaper,
        id,
        createTime: "2026-06-03 16:00",
        status: newPaper.status || "草稿"
      } as Paper;
      setPapers([paper, ...papers]);
      showToast("试卷组卷已保存。");
    }
    setIsEditingPaper(false);
    setEditingPaperId(null);
  };

  const copyPaper = (p: Paper) => {
    const id = "p" + Date.now();
    const paper = {
      ...p,
      id,
      name: p.name + " 副本",
      status: "草稿",
      createTime: "2026-06-03 16:00"
    };
    setPapers([paper, ...papers]);
    showToast("试卷已复制为草稿。");
  };

  const togglePaperStatus = (p: Paper, targetStatus: "已启用" | "已停用") => {
    setPapers(papers.map(x => x.id === p.id ? { ...x, status: targetStatus } : x));
  };

  const handleEditPaper = (p: Paper) => {
    setEditingPaperId(p.id);
    setNewPaper(p);
    setPaperSections(p.sections || []);
    setPaperEditTab("基础信息");
    setPickingForSectionId(null);
    setIsEditingPaper(true);
  };
  
  const handleCreatePaper = () => {
    setEditingPaperId(null);
    setNewPaper({ type: "理论试卷", composeMethod: "固定组卷" });
    setPaperSections([]);
    setPaperEditTab("基础信息");
    setPickingForSectionId(null);
    setIsEditingPaper(true);
  };

  const filteredPapers = papers.filter(p => {
    if (paperFilterType !== "全部" && p.type !== paperFilterType) return false;
    if (paperFilterMethod !== "全部" && p.composeMethod !== paperFilterMethod) return false;
    if (paperFilterStatus !== "全部" && p.status !== paperFilterStatus) return false;
    if (paperFilterName.trim() && !p.name.includes(paperFilterName.trim())) return false;
    return true;
  });

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "q1",
      type: "单选题",
      content: "MQTT协议中负责消息转发的组件是？",
      answer: "C",
      score: 5,
      difficulty: "中等",
      knowledgePoint: "MQTT通信协议",
      chapter: "第3章 MQTT通信协议",
      entryMethod: "单题新增",
      status: "已启用"
    },
    {
      id: "q2",
      type: "判断题",
      content: "设备物模型用于描述设备属性、事件和服务。",
      answer: "正确",
      score: 3,
      difficulty: "简单",
      knowledgePoint: "物模型配置",
      chapter: "第4章 设备接入与数据上报",
      entryMethod: "批量导入",
      status: "已启用"
    },
    {
      id: "q3",
      type: "简答题",
      content: "简述设备接入物联网平台的一般流程。",
      answer: "参考答案",
      score: 10,
      difficulty: "中等",
      knowledgePoint: "设备接入",
      chapter: "第4章 设备接入与数据上报",
      entryMethod: "模板导入",
      status: "已启用"
    },
    {
      id: "q4",
      type: "实操题",
      content: "完成传感器数据上报并查看数据看板。",
      answer: "评分标准",
      score: 20,
      difficulty: "困难",
      knowledgePoint: "数据采集",
      chapter: "第5章 行业云平台应用",
      entryMethod: "模板导入",
      status: "已启用"
    }
  ]);

  const [entryMethod, setEntryMethod] = useState<"单题新增" | "批量导入" | "模板导入">("单题新增");
  const [filterType, setFilterType] = useState<string>("全部");
  const [filterDiff, setFilterDiff] = useState<string>("全部");
  const [filterEntry, setFilterEntry] = useState<string>("全部");
  const [searchKnowledge, setSearchKnowledge] = useState("");
  const [searchContent, setSearchContent] = useState("");
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    type: "单选题",
    content: "MQTT协议中负责消息转发的组件是？",
    answer: "C",
    score: 5,
    difficulty: "中等",
    knowledgePoint: "MQTT通信协议、发布订阅机制",
    chapter: "第3章 MQTT通信协议"
  });

  const [importText, setImportText] = useState("");
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [templatePreview, setTemplatePreview] = useState<any[]>([]);


  const defaultMarkingSettings: MarkingSettings = {
    markingType: "混合批阅",
    auditMode: {
      enableReview: true,
      reviewRatio: 20,
      enableAbnormalAudit: true,
      requireAuditBeforeRelease: true,
      hideStudentInfo: true,
      abnormalThreshold: 15
    },
    markingMethod: "按题目分配",
    personnel: {
      mainMarkers: ["教师1", "教师2"],
      reviewMarkers: ["教师3"],
      arbitrationMarker: "教师4",
      taskInstruction: "客观题由系统自动批阅，主观题按题目分配给主阅卷教师，异常试卷进入复核流程。"
    }
  };
  
  const [newSession, setNewSession] = useState<Partial<Session>>({
    name: "",
    startTime: "",
    endTime: "",
    duration: 120,
    allowedAttempts: 1,
    passingScore: 60,
    location: "线上考试环境",
    targetClass: "物联网2301班",
    studentCount: 42,
    status: "未开始",
    markingSettings: defaultMarkingSettings,
    antiCheatConfig: {
      preventSwitch: true,
      maxSwitch: 2,
      preventCopy: true,
      preventPaste: true,
      preventRightClick: true,
      forceFullScreen: false,
      timeoutAction: "自动交卷"
    }
  });

  const [markingSettings, setMarkingSettings] = useState<MarkingSettings>(defaultMarkingSettings);

  const editingExam = useMemo(() => 
    exams.find(e => e.id === editingExamId) || null
  , [exams, editingExamId]);

  const selectedSession = useMemo(() => 
    editingExam?.sessions.find(s => s.id === (selectedSessionId || (editingExam.sessions[0]?.id))) || null
  , [editingExam, selectedSessionId]);

  // Initial selection when opening exam
  useEffect(() => {
    if (editingExam && editingExam.sessions.length > 0 && !selectedSessionId) {
      setSelectedSessionId(editingExam.sessions[0].id);
    }
  }, [editingExamId]);

  const calculateDuration = (startStr: string, endStr: string) => {
    if (!startStr || !endStr) return 0;
    try {
      const start = new Date(startStr.replace(/-/g, "/")).getTime();
      const end = new Date(endStr.replace(/-/g, "/")).getTime();
      if (isNaN(start) || isNaN(end) || end <= start) return 0;
      return Math.floor((end - start) / (1000 * 60));
    } catch {
      return 0;
    }
  };

  const handleAddSession = () => {
    if (!editingExamId) return;
    
    // Validation
    if (!newSession.name) { showToast("场次名称不能为空"); return; }
    if (!newSession.startTime || !newSession.endTime) { showToast("请填写考试时间"); return; }
    
    const startTs = new Date(newSession.startTime.replace(/-/g, "/")).getTime();
    const endTs = new Date(newSession.endTime.replace(/-/g, "/")).getTime();
    
    if (isNaN(startTs) || isNaN(endTs)) { showToast("日期格式不正确，请使用 YYYY-MM-DD HH:mm"); return; }
    if (endTs <= startTs) { showToast("结束时间必须晚于开始时间。"); return; }
    if ((newSession.duration || 0) <= 0) { showToast("考试时长必须大于 0。"); return; }
    if ((newSession.allowedAttempts || 0) <= 0) { showToast("限考次数必须大于 0。"); return; }
    if ((newSession.passingScore || 0) < 0 || (newSession.passingScore || 0) > 100) { showToast("及格分数应在 0 到 100 分之间。"); return; }

    const sessionToAdd: Session = {
      id: editingSessionId || `s-${Date.now()}`,
      name: newSession.name || "",
      startTime: newSession.startTime || "",
      endTime: newSession.endTime || "",
      duration: newSession.duration || calculateDuration(newSession.startTime!, newSession.endTime!),
      allowedAttempts: newSession.allowedAttempts || 1,
      passingScore: newSession.passingScore || 60,
      location: newSession.location || "线上考试环境",
      targetClass: newSession.targetClass || "",
      studentCount: newSession.studentCount || 0,
      status: newSession.status || "未开始",
      markingSettings: newSession.markingSettings || defaultMarkingSettings
    };

    const updatedExams = exams.map(exam => {
      if (exam.id === editingExamId) {
        if (editingSessionId) {
          return {
            ...exam,
            sessions: exam.sessions.map(s => s.id === editingSessionId ? sessionToAdd : s)
          };
        } else {
          return {
            ...exam,
            sessions: [...exam.sessions, sessionToAdd]
          };
        }
      }
      return exam;
    });

    setExams(updatedExams);
    setShowSessionModal(false);
    setEditingSessionId(null);
    showToast(editingSessionId ? "场次基础设置已保存，考试场次已成功保存。" : "场次已保存，考试整体时间已自动更新。");
    setNewSession({
      name: "",
      startTime: "",
      endTime: "",
      duration: 120,
      allowedAttempts: 1,
      passingScore: 60,
      location: "线上考试环境",
      targetClass: "物联网2301班",
      studentCount: 42,
      status: "未开始",
      markingSettings: defaultMarkingSettings,
      antiCheatConfig: {
      preventSwitch: true,
      maxSwitch: 2,
      preventCopy: true,
      preventPaste: true,
      preventRightClick: true,
      forceFullScreen: false,
      timeoutAction: "自动交卷"
    }
    });
  };

  const handleEditSession = (session: Session) => {
    setNewSession(session);
    setEditingSessionId(session.id);
    setShowSessionModal(true);
  };

  const handleDeleteSession = (sessionId: string) => {
    if (!editingExamId) return;
    const updatedExams = exams.map(exam => {
      if (exam.id === editingExamId) {
        return {
          ...exam,
          sessions: exam.sessions.filter(s => s.id !== sessionId)
        };
      }
      return exam;
    });
    setExams(updatedExams);
    if (selectedSessionId === sessionId) {
      setSelectedSessionId(null);
    }
    showToast("场次已删除，考试整体时间已更新。");
  };

  const handleSaveMarkingSettings = () => {
    if (!editingExamId || !markingSessionId) return;

    // Validation
    if (markingSettings.markingType !== "系统批阅" && markingSettings.personnel.mainMarkers.length === 0) {
      showToast("人工批阅或混合批阅时，主阅卷教师不能为空。");
      return;
    }
    if (markingSettings.auditMode.reviewRatio < 0 || markingSettings.auditMode.reviewRatio > 100) {
      showToast("复核比例应在 0 到 100 之间。");
      return;
    }
    if (markingSettings.auditMode.abnormalThreshold <= 0 && markingSettings.markingType !== "系统批阅") {
      showToast("异常分差阈值应大于 0。");
      return;
    }

    const updatedExams = exams.map(exam => {
      if (exam.id === editingExamId) {
        return {
          ...exam,
          sessions: exam.sessions.map(s => s.id === markingSessionId ? { ...s, markingSettings } : s)
        };
      }
      return exam;
    });

    setExams(updatedExams);
    setShowMarkingModal(false);
    showToast("阅卷设置已保存。");
  };

  const [bankFilterType, setBankFilterType] = useState<string>("全部");
  const [bankFilterDiff, setBankFilterDiff] = useState<string>("全部");
  const [bankFilterStatus, setBankFilterStatus] = useState<string>("全部");
  const [bankSearchKnowledge, setBankSearchKnowledge] = useState<string>("");
  const [bankSearchContent, setBankSearchContent] = useState<string>("");
  const [viewQuestionId, setViewQuestionId] = useState<string | null>(null);

  const [statUnit, setStatUnit] = useState<"按题数" | "按分值" | "按占比">("按题数");
  const [chartDisplayMode, setChartDisplayMode] = useState<"综合展示" | "饼图" | "柱状图" | "条形图" | "折线图" | "列表">("综合展示");

  const bankFilteredQuestions = questions.filter(q => {
    if (bankFilterType !== '全部' && q.type !== bankFilterType) return false;
    if (bankFilterDiff !== '全部' && q.difficulty !== bankFilterDiff) return false;
    if (bankFilterStatus !== '全部' && q.status !== bankFilterStatus) return false;
    if (bankSearchKnowledge && !q.knowledgePoint.includes(bankSearchKnowledge)) return false;
    if (bankSearchContent && !q.content.includes(bankSearchContent)) return false;
    return true;
  });

  const activeQuestions = questions.filter(q => q.status === "已启用");
  const tpTypesCount = new Set(questions.map(q => q.type)).size;
  const tpKnowledgeCount = new Set(questions.flatMap(q => q.knowledgePoint.split(/[,、]/))).size;
  const totalScore = questions.reduce((sum, q) => sum + q.score, 0);

  const viewQuestion = questions.find(q => q.id === viewQuestionId);

  const allTypeAnalysis = (["单选题", "多选题", "判断题", "填空题", "简答题", "实操题"] as const).map(type => {
    const qts = bankFilteredQuestions.filter(q => q.type === type);
    const count = qts.length;
    const score = qts.reduce((s, q) => s + q.score, 0);
    const avgScore = count ? (score / count).toFixed(1) : "0";
    const percentageNum = bankFilteredQuestions.length ? (count / bankFilteredQuestions.length) * 100 : 0;
    const percentage = percentageNum.toFixed(1);
    let desc = "";
    if (type === "单选题" || type === "判断题") desc = "客观题占比较高，适合系统自动判分";
    else if (type === "多选题") desc = "用于考察综合知识点掌握情况";
    else if (type === "简答题") desc = "用于考察理解与表达能力";
    else if (type === "实操题") desc = "用于考察实验操作与应用能力";
    else desc = "辅助填空测试";
    return { type, count, percentage, percentageNum, score, avgScore, desc, color: type === "单选题" ? "#10A66A" : type === "多选题" ? "#34d399" : type === "判断题" ? "#6ee7b7" : type === "简答题" ? "#059669" : type === "实操题" ? "#047857" : "#a7f3d0" };
  });
  const typeAnalysis = allTypeAnalysis.filter(t => t.count > 0);

  const allDiffAnalysis = (["简单", "中等", "困难"] as const).map(diff => {
    const qts = bankFilteredQuestions.filter(q => q.difficulty === diff);
    const count = qts.length;
    const score = qts.reduce((s, q) => s + q.score, 0);
    const percentageNum = bankFilteredQuestions.length ? (count / bankFilteredQuestions.length) * 100 : 0;
    const percentage = percentageNum.toFixed(1);
    const repTypes = Array.from(new Set(qts.map(q => q.type))).join("、") || "--";
    let desc = "";
    if (diff === "简单") desc = "用于基础知识检测";
    else if (diff === "中等") desc = "题库主体难度适中";
    else desc = "用于能力提升与综合应用测评";
    return { diff, count, percentage, percentageNum, score, repTypes, desc, color: diff === "简单" ? "#6ee7b7" : diff === "中等" ? "#10A66A" : "#047857" };
  });
  const diffAnalysis = allDiffAnalysis.filter(d => d.count > 0);

  const calculateExamTimeRange = (sessions: Session[]) => {
    if (!sessions || sessions.length === 0) {
      return { startTime: "--", endTime: "--", earliestSession: null, latestSession: null };
    }
    const nodes = sessions.map(item => ({
      ...item,
      startTs: new Date(item.startTime.replace(/-/g, "/")).getTime(),
      endTs: new Date(item.endTime.replace(/-/g, "/")).getTime()
    }));

    const earliest = nodes.reduce((prev, curr) => prev.startTs < curr.startTs ? prev : curr);
    const latest = nodes.reduce((prev, curr) => prev.endTs > curr.endTs ? prev : curr);

    return {
      startTime: earliest.startTime,
      endTime: latest.endTime,
      earliestSession: earliest,
      latestSession: latest
    };
  };

  const handleSaveQuestion = () => {
    if (!newQuestion.type) { showToast("题型不能为空"); return; }
    if (!newQuestion.content?.trim()) { showToast("题干不能为空"); return; }
    if (!newQuestion.difficulty) { showToast("难度不能为空"); return; }
    if (!newQuestion.knowledgePoint?.trim()) { showToast("知识点不能为空"); return; }
    if (!newQuestion.score || newQuestion.score <= 0) { showToast("分值必须大于 0"); return; }

    const isObjective = newQuestion.type === "单选题" || newQuestion.type === "多选题" || newQuestion.type === "判断题";
    if (isObjective && !newQuestion.answer?.trim()) {
       showToast("客观题必须有正确答案"); return;
    }
    
    if (editingQuestionId) {
      setQuestions(questions.map(q => q.id === editingQuestionId ? { ...q, ...newQuestion } as Question : q));
      setEditingQuestionId(null);
      showToast("试题修改已保存。");
    } else {
      setQuestions([...questions, {
        ...newQuestion,
        id: `q${Date.now()}`,
        entryMethod: "单题新增",
        status: "已启用"
      } as Question]);
      showToast("试题已保存。");
    }
    
    setNewQuestion({
      type: "单选题",
      content: "",
      answer: "",
      score: 5,
      difficulty: "中等",
      knowledgePoint: "",
      chapter: ""
    });
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
    showToast("试题已删除。");
  };

  const handleEditQuestion = (q: Question) => {
    setEditingQuestionId(q.id);
    setEntryMethod("单题新增");
    setNewQuestion(q);
  };

  const handleParseText = () => {
    if (!importText) {
      showToast("请粘贴题目文本。");
      return;
    }
    setImportPreview([
      { id: 'p1', type: '单选题', content: 'MQTT协议中负责消息转发的组件是？', answer: 'C', score: 5, difficulty: '中等', knowledgePoint: 'MQTT通信协议', status: '校验通过' },
      { id: 'p2', type: '判断题', content: '设备物模型用于描述设备属性、事件和服务。', answer: '正确', score: 3, difficulty: '简单', knowledgePoint: '物模型配置', status: '校验通过' },
      { id: 'p3', type: '简答题', content: '简述设备接入物联网平台的一般流程。', answer: '参考答案已填写', score: 10, difficulty: '中等', knowledgePoint: '设备接入', status: '校验通过' }
    ]);
  };

  const handleConfirmImport = () => {
    if (importPreview.length === 0) return;
    
    const mappedQuestions = importPreview.map((p, index) => ({
      ...p,
      id: `q${Date.now()}_${index}`,
      chapter: "第4章 设备接入与数据上报",
      entryMethod: "批量导入",
      status: "已启用"
    } as Question));
    
    setQuestions([...questions, ...mappedQuestions]);
    setImportPreview([]);
    setImportText("");
    showToast(`已成功导入 ${mappedQuestions.length} 道试题。`);
  };

  const handleCreatePaperRule = () => {
    const nextId = String(paperGenRules.length + 1);
    setPaperGenRules([...paperGenRules, {
      ...newPaperRule,
      id: nextId
    } as PaperRule]);
    showToast("抽题规则已添加。");
  };

  const handleDeletePaperRule = (id: string) => {
    setPaperGenRules(paperGenRules.filter(r => r.id !== id));
    showToast("规则已删除。");
  };


  const handleParseTemplate = () => {
    setTemplatePreview([
      { id: 't1', type: '实操题', content: '完成传感器数据上报并查看数据看板。', answer: '评分标准', score: 20, chapter: '第5章 行业云平台应用', status: '校验通过' }
    ]);
  };

  const handleConfirmTemplate = () => {
    if (templatePreview.length === 0) return;
    
    const mappedQuestions = templatePreview.map((t, index) => ({
      ...t,
      id: `t${Date.now()}_${index}`,
      difficulty: "困难",
      knowledgePoint: "数据采集",
      entryMethod: "模板导入",
      status: "已启用"
    } as Question));
    
    setQuestions([...questions, ...mappedQuestions]);
    setTemplatePreview([]);
    showToast("模板试题导入完成。");
  };

  const filteredQuestions = questions.filter(q => {
    if (filterType !== '全部' && q.type !== filterType) return false;
    if (filterDiff !== '全部' && q.difficulty !== filterDiff) return false;
    if (filterEntry !== '全部' && q.entryMethod !== filterEntry) return false;
    if (searchKnowledge && !q.knowledgePoint.includes(searchKnowledge)) return false;
    if (searchContent && !q.content.includes(searchContent)) return false;
    return true;
  });

  const questionStats = {
    total: questions.length,
    singleChoice: questions.filter(q => q.type === "单选题").length,
    multipleChoice: questions.filter(q => q.type === "多选题").length,
    trueFalse: questions.filter(q => q.type === "判断题").length,
    shortAnswer: questions.filter(q => q.type === "简答题").length,
    practical: questions.filter(q => q.type === "实操题").length,
    totalScore: questions.reduce((sum, q) => sum + q.score, 0)
  };

  const timeRange = useMemo(() => calculateExamTimeRange(editingExam?.sessions || []), [editingExam]);

  return (
    <div className="bg-[#F8FAF9] min-h-screen text-zinc-800 font-sans antialiased pb-20 animate-in fade-in duration-300">
      
      {/* Top Module Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 -mb-2">
         <div className="flex items-center gap-2 mb-4">
           <button 
             onClick={onBack}
             className="text-xs font-black text-zinc-400 hover:text-[#10A66A] transition-colors"
           >
             考试大厅
           </button>
           <ChevronRight className="w-3 h-3 text-zinc-300" />
           <span className="text-xs font-black text-zinc-600">{activeModule}</span>
         </div>
         <div className="flex items-center gap-8 border-b border-zinc-200 pb-2">
           {(["考试管理", "试题管理", "题库管理", "试卷管理", "考试结果", "阅卷评分", "考试监控"] as const).map(mod => (
              <button
                 key={mod}
                 onClick={() => { setActiveModule(mod); setEditingExamId(null); setIsEditingPaper(false); }}
                 className={`text-sm font-black pb-3 border-b-2 transition-colors -mb-[10px] ${activeModule === mod ? 'border-[#10A66A] text-[#10A66A]' : 'border-transparent text-zinc-500 hover:text-zinc-800'}`}
              >
                 {mod}
              </button>
           ))}
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        
        {activeModule === "考试管理" && (
        <>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-200 pb-6 mb-8">
           <div className="space-y-1">
             <div className="flex items-center gap-2 mb-1">
               <button 
                 onClick={onBack}
                 className="text-xs font-black text-zinc-400 hover:text-[#10A66A] transition-colors"
               >
                 考试大厅
               </button>
               <ChevronRight className="w-3 h-3 text-zinc-300" />
               <button 
                 onClick={() => setEditingExamId(null)}
                 className={`text-xs font-black transition-colors ${editingExamId ? "text-zinc-400 hover:text-[#10A66A]" : "text-[#10A66A]"}`}
               >
                 考试管理
               </button>
               {editingExamId && (
                 <>
                   <ChevronRight className="w-3 h-3 text-zinc-300" />
                   <span className="text-xs font-black text-[#10A66A]">考试配置</span>
                 </>
               )}
             </div>
             <h1 className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
                <Layers className="w-6 h-6 text-[#10A66A]" />
                {editingExamId ? "考试配置" : "考试管理"}
             </h1>
             <p className="text-xs text-zinc-500 font-bold">
                {editingExamId ? `正在对「${editingExam?.name}」进行场次管理与整体时间排程` : "支持为一个考试关联多个考试场次，并自动计算考试整体时间范围。"}
             </p>
           </div>
           {!editingExamId && (
             <button className="px-5 py-2.5 bg-[#10A66A] text-white rounded-xl text-sm font-black shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2">
                <Plus className="w-5 h-5" />
                新增考试
             </button>
           )}
        </div>

        {!editingExamId ? (
          /* List View */
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden animate-in slide-in-from-top-4 duration-500">
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="bg-zinc-50/50 border-b border-zinc-100">
                         <th className="p-4 pl-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">考试名称</th>
                         <th className="p-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">考试类型</th>
                         <th className="p-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">关联场次</th>
                         <th className="p-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">整体开始时间</th>
                         <th className="p-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">整体结束时间</th>
                         <th className="p-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">已关联试卷</th>
                         <th className="p-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">状态</th>
                         <th className="p-4 pr-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">操作</th>
                      </tr>
                   </thead>
                   <tbody>
                      {exams.map(exam => {
                        const { startTime, endTime } = calculateExamTimeRange(exam.sessions);
                        return (
                          <tr key={exam.id} className="border-b border-zinc-50 hover:bg-[#F8FAF9] transition-colors group">
                            <td className="p-4 pl-6">
                               <div className="flex flex-col">
                                  <span className="text-sm font-black text-zinc-900 group-hover:text-[#10A66A] transition-colors">{exam.name}</span>
                                  <span className="text-[10px] text-zinc-400 font-mono">ID: {exam.id}</span>
                               </div>
                            </td>
                            <td className="p-4">
                               <span className="text-[11px] font-black text-[#10A66A] bg-[#EAF8F1] px-2 py-0.5 rounded">
                                  {exam.type}
                               </span>
                            </td>
                            <td className="p-4 text-center">
                               <span className="text-sm font-black text-zinc-700">{exam.sessions.length} 场</span>
                            </td>
                            <td className="p-4 font-mono text-xs text-zinc-500">{startTime}</td>
                            <td className="p-4 font-mono text-xs text-zinc-500">{endTime}</td>
                            <td className="p-4">
                               <div className="flex flex-wrap gap-1">
                                  {exam.associatedPapers?.length ? exam.associatedPapers.map(pid => {
                                      const p = papers.find(pp => pp.id === pid);
                                      return p ? <span key={pid} className="text-[10px] font-bold bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded truncate max-w-[120px] border border-zinc-200" title={p.name}>{p.name}</span> : null;
                                  }) : <span className="text-xs font-bold text-zinc-400">未关联</span>}
                               </div>
                            </td>
                            <td className="p-4 text-center">
                               <div className="flex items-center justify-center gap-1.5">
                                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                  <span className="text-xs font-black text-zinc-600">{exam.status}</span>
                               </div>
                            </td>
                            <td className="p-4 pr-6 text-right">
                               <div className="flex items-center justify-end gap-3 text-xs font-black text-[#10A66A]">
                                  <button className="hover:underline cursor-pointer">查看场次</button>
                                  <div className="w-px h-3 bg-zinc-200" />
                                  <button 
                                    onClick={() => setEditingExamId(exam.id)}
                                    className="hover:underline cursor-pointer flex items-center gap-1.5"
                                  >
                                     <Edit3 className="w-3.5 h-3.5" />
                                     编辑考试
                                  </button>
                               </div>
                            </td>
                          </tr>
                        );
                      })}
                   </tbody>
                </table>
             </div>
          </div>
        ) : (
          /* Edit View */
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
             
             {/* Edit View Tabs */}
             <div className="flex items-center gap-8 border-b border-zinc-200 px-2 lg:px-4">
                {["基础信息", "场次设置", "阅卷设置", "关联试卷"].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setEditingTab(tab as any)}
                    className={`pb-4 text-sm font-black transition-all border-b-2 relative ${
                      editingTab === tab 
                        ? "border-[#10A66A] text-[#10A66A]" 
                        : "border-transparent text-zinc-500 hover:text-zinc-800"
                    }`}
                  >
                     {tab}
                     {editingTab === tab && (
                       <div className="absolute -bottom-[2px] left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[#10A66A] rounded-t-full shadow-[0_0_8px_rgba(16,166,106,0.5)]" />
                     )}
                  </button>
                ))}
             </div>

             {(editingTab === "基础信息" || editingTab === "场次设置" || editingTab === "阅卷设置") && (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-2">
                
                {/* Basic Info Left Column */}
                <div className="lg:col-span-2 space-y-6">
                   <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm space-y-6">
                      <h3 className="text-base font-black text-zinc-900 flex items-center gap-2 border-b border-zinc-100 pb-4">
                         <Info className="w-5 h-5 text-[#10A66A]" />
                         考试基础信息配置
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">考试名称</label>
                            <input 
                              type="text" 
                              className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm font-black text-zinc-800 focus:bg-white focus:border-[#CFEFE0] outline-none transition-all"
                              value={editingExam?.name}
                              disabled
                            />
                         </div>
                         <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">考试类型</label>
                            <input 
                              type="text" 
                              className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm font-black text-zinc-800 focus:bg-white focus:border-[#CFEFE0] outline-none transition-all"
                              value={editingExam?.type}
                              disabled
                            />
                         </div>
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">考试说明</label>
                         <textarea 
                           className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm font-bold text-zinc-600 focus:bg-white focus:border-[#CFEFE0] outline-none transition-all resize-none h-24"
                           value={editingExam?.description}
                           disabled
                         />
                      </div>
                      <div className="flex items-center gap-2 px-4 py-3 bg-[#F8FAF9] rounded-xl border border-zinc-100">
                         <Users className="w-5 h-5 text-zinc-400" />
                         <span className="text-xs font-black text-zinc-500">当前关联场次数量：</span>
                         <span className="text-sm font-black text-[#10A66A]">{editingExam?.sessions.length} 场</span>
                      </div>
                   </div>

                   {/* Associated Sessions Table */}
                   <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
                      <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                         <h3 className="text-base font-black text-zinc-900 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-[#10A66A]" />
                            关联考试场次任务
                         </h3>
                         <button 
                           onClick={() => setShowSessionModal(true)}
                           className="px-4 py-1.8 bg-[#EAF8F1] text-[#10A66A] border border-[#CFEFE0] rounded-lg text-xs font-black hover:bg-[#10A66A] hover:text-white transition-all flex items-center gap-2"
                         >
                            <Plus className="w-4 h-4" />
                            新增场次
                         </button>
                      </div>
                      <div className="overflow-x-auto">
                         <table className="w-full text-left">
                            <thead className="bg-[#F8FAF9]">
                               <tr className="border-b border-zinc-100 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                  <th className="p-4 pl-6">场次名称</th>
                                  <th className="p-4">考试时间</th>
                                  <th className="p-4 text-center">考试时长</th>
                                  <th className="p-4 text-center">限考次数</th>
                                  <th className="p-4 text-center">及格分数</th>
                                  <th className="p-4">批阅类型</th>
                                  <th className="p-4">阅卷方式</th>
                                  <th className="p-4">阅卷人员</th>
                                  <th className="p-4 text-center">状态</th>
                                  <th className="p-4 pr-6 text-right">管理操作</th>
                               </tr>
                            </thead>
                            <tbody>
                               {editingExam?.sessions.length === 0 ? (
                                 <tr>
                                    <td colSpan={10} className="p-12 text-center text-zinc-300 font-bold">暂无关联场次信息</td>
                                 </tr>
                               ) : (
                                 editingExam?.sessions.map(session => (
                                   <tr 
                                     key={session.id} 
                                     onClick={() => setSelectedSessionId(session.id)}
                                     className={`border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors cursor-pointer ${selectedSessionId === session.id ? "bg-[#EAF8F1]/50 shadow-inner" : ""}`}
                                   >
                                      <td className="p-4 pl-6 font-black text-zinc-800 text-xs">
                                         <div className="flex items-center gap-2">
                                            {selectedSessionId === session.id && <div className="w-1 h-3 bg-[#10A66A] rounded-full" />}
                                            {session.name}
                                         </div>
                                      </td>
                                      <td className="p-4">
                                         <div className="flex flex-col font-mono text-[10px] text-zinc-500 whitespace-nowrap">
                                            <span>{session.startTime}</span>
                                            <span className="text-[#10A66A] opacity-30 text-[8px]">-</span>
                                            <span>{session.endTime}</span>
                                         </div>
                                      </td>
                                      <td className="p-4 text-center text-[11px] font-black text-zinc-600">{session.duration}分</td>
                                      <td className="p-4 text-center text-[11px] font-black text-zinc-600">{session.allowedAttempts}次</td>
                                      <td className="p-4 text-center text-[11px] font-black text-[#10A66A]">{session.passingScore}分</td>
                                      <td className="p-4">
                                         <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                                           session.markingSettings?.markingType === "系统批阅" ? "bg-blue-50 text-blue-600" :
                                           session.markingSettings?.markingType === "人工批阅" ? "bg-amber-50 text-amber-600" :
                                           "bg-[#EAF8F1] text-[#10A66A]"
                                         }`}>
                                            {session.markingSettings?.markingType || "混合批阅"}
                                         </span>
                                      </td>
                                      <td className="p-4 text-[10px] font-bold text-zinc-500 whitespace-nowrap">
                                         {session.markingSettings?.markingMethod || "按题目分配"}
                                      </td>
                                      <td className="p-4 text-[10px] font-bold text-zinc-700">
                                         {session.markingSettings?.markingType === "系统批阅" ? "无需人工阅卷" : 
                                          session.markingSettings?.personnel.mainMarkers.join("、") || "--"}
                                      </td>
                                      <td className="p-4 text-center">
                                         <span className="text-[10px] font-black text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded">{session.status}</span>
                                      </td>
                                      <td className="p-4 pr-6 text-right">
                                         <div className="flex items-center justify-end gap-3 text-zinc-400 font-black">
                                            <button 
                                              onClick={(e) => { e.stopPropagation(); handleEditSession(session); }}
                                              className="hover:text-[#10A66A] transition-colors cursor-pointer text-[10px]"
                                            >
                                               编辑
                                            </button>
                                            <div className="w-px h-2.5 bg-zinc-200" />
                                            <button 
                                              onClick={(e) => { 
                                                 e.stopPropagation(); 
                                                 setMarkingSessionId(session.id);
                                                 setMarkingSettings(session.markingSettings || defaultMarkingSettings);
                                                 setShowMarkingModal(true); 
                                              }}
                                              className="hover:text-[#10A66A] transition-colors cursor-pointer text-[10px]"
                                            >
                                               阅卷设置
                                            </button>
                                            <div className="w-px h-2.5 bg-zinc-200" />
                                            <button 
                                              onClick={(e) => { e.stopPropagation(); handleDeleteSession(session.id); }}
                                              className="hover:text-red-500 transition-colors cursor-pointer text-[10px]"
                                            >
                                               删除
                                            </button>
                                         </div>
                                      </td>
                                   </tr>
                                 ))
                               )}
                            </tbody>
                         </table>
                      </div>
                   </div>
                </div>

                {/* Overall Range Card Right Column */}
                <div className="space-y-6">
                   
                   {/* Selected Session Preview Card */}
                    {selectedSession && (
                      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4 animate-in fade-in zoom-in-95 duration-300">
                         <div className="flex items-center gap-2 text-zinc-900 border-b border-zinc-100 pb-4">
                            <FileText className="w-5 h-5 text-[#10A66A]" />
                            <span className="text-base font-black">当前场次参数预览</span>
                         </div>
                         <div className="grid grid-cols-1 gap-y-3.5">
                            <div className="flex justify-between items-center text-xs">
                               <span className="text-zinc-400 font-bold">场次名称</span>
                               <span className="text-zinc-800 font-black">{selectedSession.name}</span>
                            </div>
                            <div className="flex justify-between items-start text-xs">
                               <span className="text-zinc-400 font-bold">考试时间</span>
                               <span className="text-zinc-800 font-black text-right font-mono">
                                  {selectedSession.startTime}<br/>
                                  <span className="text-zinc-300 mx-1">至</span><br/>
                                  {selectedSession.endTime}
                               </span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-[#10A66A]">
                               <span className="opacity-70 font-bold">考试时长</span>
                               <span className="font-black">{selectedSession.duration} 分钟</span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-[#10A66A]">
                               <span className="opacity-70 font-bold">限考次数</span>
                               <span className="font-black">{selectedSession.allowedAttempts} 次</span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-[#10A66A]">
                               <span className="opacity-70 font-bold">及格分数</span>
                               <span className="font-black">{selectedSession.passingScore} 分</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                               <span className="text-zinc-400 font-bold">参考班级</span>
                               <span className="text-zinc-800 font-black">{selectedSession.targetClass}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                               <span className="text-zinc-400 font-bold">参考人数</span>
                               <span className="text-zinc-800 font-black">{selectedSession.studentCount} 人</span>
                            </div>
                            <div className="flex justify-between items-center text-xs border-t border-zinc-50 pt-3 mt-1">
                               <span className="text-zinc-400 font-bold">批阅类型</span>
                               <span className="text-zinc-800 font-black">{selectedSession.markingSettings.markingType}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                               <span className="text-zinc-400 font-bold">阅卷方式</span>
                               <span className="text-zinc-800 font-black">{selectedSession.markingSettings.markingMethod}</span>
                            </div>
                            <div className="flex justify-between items-start text-xs">
                               <span className="text-zinc-400 font-bold">阅卷教师</span>
                               <span className="text-zinc-800 font-black text-right">
                                  {selectedSession.markingSettings.markingType === "系统批阅" ? "系统自动" : selectedSession.markingSettings.personnel.mainMarkers.join(",") || "未分配"}
                               </span>
                            </div>
                            <div className="flex justify-between items-center text-xs pt-3 border-t border-zinc-50">
                               <span className="text-zinc-400 font-bold">状态</span>
                               <span className={`${
                                 selectedSession.status === "进行中" ? "text-[#10A66A]" : 
                                 selectedSession.status === "已结束" ? "text-zinc-400" : "text-amber-500"
                               } font-black`}>{selectedSession.status}</span>
                            </div>
                         </div>
                      </div>
                    )}

                   <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-6 sticky top-24">
                      <div className="flex items-center gap-2 text-zinc-900 border-b border-zinc-100 pb-4">
                         <Clock className="w-5 h-5 text-[#10A66A]" />
                         <span className="text-base font-black">考试整体时间范围</span>
                      </div>
                      
                      <div className="space-y-4">
                         <div className="space-y-1.5 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">整体开始时间</label>
                            <span className="text-base font-black text-zinc-900 font-mono tracking-tight block">
                               {timeRange.startTime}
                            </span>
                            {timeRange.earliestSession && (
                              <div className="text-[9px] text-zinc-400 font-bold mt-1">
                                最早开始场次：{timeRange.earliestSession.name}｜{timeRange.earliestSession.startTime}
                              </div>
                            )}
                            <div className="flex items-center gap-1 mt-1">
                               <CheckCircle2 className="w-3 h-3 text-[#10A66A]" />
                               <span className="text-[9px] font-bold text-[#10A66A]">已根据最早场次自动更新</span>
                            </div>
                         </div>

                         <div className="space-y-1.5 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">整体结束时间</label>
                            <span className="text-base font-black text-zinc-900 font-mono tracking-tight block">
                               {timeRange.endTime}
                            </span>
                            {timeRange.latestSession && (
                              <div className="text-[9px] text-zinc-400 font-bold mt-1">
                                最晚结束场次：{timeRange.latestSession.name}｜{timeRange.latestSession.endTime}
                              </div>
                            )}
                            <div className="flex items-center gap-1 mt-1">
                               <CheckCircle2 className="w-3 h-3 text-[#10A66A]" />
                               <span className="text-[9px] font-bold text-[#10A66A]">已根据最晚场次自动更新</span>
                            </div>
                         </div>
                      </div>

                      <div className="p-4 bg-[#EAF8F1] border border-[#CFEFE0] rounded-xl space-y-3">
                         <div className="flex gap-2">
                            <AlertCircle className="w-5 h-5 text-[#10A66A] shrink-0" />
                            <h4 className="text-[11px] font-black text-[#10A66A]">计算规则说明</h4>
                         </div>
                         <p className="text-[10px] text-zinc-500 font-bold leading-relaxed">
                            考试整体时间由所关联场次自动计算，取最早场次开始时间作为整体开始时间，取最晚场次结束时间作为整体结束时间。不允许手动直接修改整体时间。
                         </p>
                         {editingExam && editingExam.sessions.length > 0 && (
                           <div className="text-[10px] text-[#10A66A] font-black pt-1 border-t border-[#CFEFE0]">
                             当前考试已关联 {editingExam.sessions.length} 个场次
                           </div>
                         )}
                      </div>

                      <div className="pt-2 flex gap-3">
                         <button 
                           onClick={() => setEditingExamId(null)}
                           className="flex-1 py-3 bg-zinc-50 border border-zinc-200 text-zinc-500 text-sm font-black rounded-xl hover:bg-zinc-100 transition-all"
                         >
                            返回
                         </button>
                         <button 
                           onClick={() => { setEditingExamId(null); showToast("考试配置已更新保存。"); }}
                           className="flex-1 py-3 bg-[#10A66A] text-white text-sm font-black rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                         >
                            <Save className="w-4 h-4" />
                            保存考试
                         </button>
                      </div>
                   </div>
                </div>

             </div>
             )}

             {editingTab === "关联试卷" && (
                <div className="space-y-6 pt-2 animate-in fade-in duration-300">
                   <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm">
                      <div className="flex items-center justify-between border-b border-zinc-100 pb-6 mb-6">
                         <div>
                            <h3 className="text-xl font-black text-zinc-900 flex items-center gap-2 mb-1">
                               <FileText className="w-6 h-6 text-[#10A66A]" />
                               已关联试卷
                            </h3>
                            <p className="text-sm font-bold text-zinc-500">
                               当前考试已关联的理论与实操试卷列表。如需管理或新增试卷，请前往试卷管理模块。
                            </p>
                         </div>
                         <button onClick={() => { setActiveModule("试卷管理"); setEditingExamId(null); setIsEditingPaper(false); }} className="px-5 py-2.5 bg-[#EAF8F1] text-[#10A66A] font-black rounded-xl hover:bg-[#10A66A] hover:text-white transition-all text-sm flex items-center gap-2">
                           前往试卷管理
                         </button>
                      </div>
                      
                      {editingExam?.associatedPapers?.length ? (
                         <div className="space-y-3">
                            {editingExam.associatedPapers.map(pid => {
                               const p = papers.find(pp => pp.id === pid);
                               if (!p) return null;
                               return (
                                 <div key={pid} className="flex flex-col md:flex-row items-center justify-between p-4 border border-zinc-100 rounded-xl hover:bg-zinc-50 transition-colors gap-4">
                                     <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-[#EAF8F1] flex items-center justify-center shrink-0">
                                           <BookOpen className="w-5 h-5 text-[#10A66A]"/>
                                        </div>
                                        <div>
                                           <h4 className="text-sm font-black text-zinc-900 mb-1">{p.name}</h4>
                                           <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
                                              <span className="text-[#10A66A] bg-[#10A66A]/10 px-2 py-0.5 rounded">{p.type}</span>
                                              <span className="text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">{p.composeMethod}</span>
                                              <span className="text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">{p.totalScore}分</span>
                                              <span className={`px-2 py-0.5 rounded ${p.status === "已启用" ? "text-green-600 bg-green-50" : "text-zinc-500 bg-zinc-100"}`}>{p.status}</span>
                                           </div>
                                        </div>
                                     </div>
                                     <button className="text-xs font-black text-red-500 hover:text-red-700 px-2">移除关联</button>
                                 </div>
                               );
                            })}
                         </div>
                      ) : (
                         <div className="flex flex-col items-center justify-center p-12 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                             <BookOpen className="w-8 h-8 text-zinc-300 mb-3" />
                             <p className="text-sm font-black text-zinc-500 mb-1">暂无已关联的试卷</p>
                             <p className="text-xs font-bold text-zinc-400">请前往试卷管理并在试卷侧配置关联</p>
                         </div>
                      )}
                   </div>
                </div>
             )}
          </div>

        )}
        </>
        )}

        
        {activeModule === "考试结果" && <ExamResults />}
        {activeModule === "阅卷评分" && <ExamGrading />}
        {activeModule === "考试监控" && <ExamMonitor />}
        
        {activeModule === "试题管理" && (
             <div className="space-y-6 pt-2 animate-in fade-in duration-300">
                <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm">
                   <div className="flex flex-col gap-2 border-b border-zinc-100 pb-6 mb-6">
                      <h3 className="text-xl font-black text-zinc-900 flex items-center gap-2">
                         <FileText className="w-6 h-6 text-[#10A66A]" />
                         试题管理
                      </h3>
                      <p className="text-sm font-bold text-zinc-500">
                         支持单题新增、批量导入和模板导入等方式录入试题，并对试题进行统一管理。
                      </p>
                   </div>

                   {/* Stats */}
                   <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
                      <div className="bg-[#F8FAF9] p-4 rounded-xl border border-zinc-100 flex flex-col items-center justify-center">
                         <span className="text-[10px] uppercase font-black text-zinc-400 mb-1">试题总数</span>
                         <span className="text-2xl font-black text-[#10A66A]">{questionStats.total}</span>
                      </div>
                      <div className="bg-[#F8FAF9] p-4 rounded-xl border border-zinc-100 flex flex-col items-center justify-center">
                         <span className="text-[10px] uppercase font-black text-zinc-400 mb-1">单选题</span>
                         <span className="text-2xl font-black text-[#10A66A]">{questionStats.singleChoice}</span>
                      </div>
                      <div className="bg-[#F8FAF9] p-4 rounded-xl border border-zinc-100 flex flex-col items-center justify-center">
                         <span className="text-[10px] uppercase font-black text-zinc-400 mb-1">多选题</span>
                         <span className="text-2xl font-black text-[#10A66A]">{questionStats.multipleChoice}</span>
                      </div>
                      <div className="bg-[#F8FAF9] p-4 rounded-xl border border-zinc-100 flex flex-col items-center justify-center">
                         <span className="text-[10px] uppercase font-black text-zinc-400 mb-1">判断题</span>
                         <span className="text-2xl font-black text-[#10A66A]">{questionStats.trueFalse}</span>
                      </div>
                      <div className="bg-[#F8FAF9] p-4 rounded-xl border border-zinc-100 flex flex-col items-center justify-center">
                         <span className="text-[10px] uppercase font-black text-zinc-400 mb-1">简答题</span>
                         <span className="text-2xl font-black text-[#10A66A]">{questionStats.shortAnswer}</span>
                      </div>
                      <div className="bg-[#F8FAF9] p-4 rounded-xl border border-zinc-100 flex flex-col items-center justify-center">
                         <span className="text-[10px] uppercase font-black text-zinc-400 mb-1">实操题</span>
                         <span className="text-2xl font-black text-[#10A66A]">{questionStats.practical}</span>
                      </div>
                      <div className="bg-white p-4 rounded-xl border-2 border-[#10A66A]/20 flex flex-col items-center justify-center shadow-sm">
                         <span className="text-[10px] uppercase font-black text-zinc-500 mb-1">总分</span>
                         <span className="text-2xl font-black text-[#10A66A]">{questionStats.totalScore}<span className="text-xs ml-1">分</span></span>
                      </div>
                   </div>

                   {/* Entry Methods Toggle */}
                   <div className="flex gap-2 mb-6">
                      {(["单题新增", "批量导入", "模板导入"] as const).map(method => (
                        <button
                          key={method}
                          onClick={() => {
                             setEntryMethod(method); 
                             setEditingQuestionId(null);
                             if (method !== "单题新增") {
                               setNewQuestion({
                                 type: "单选题", content: "", answer: "", score: 5, difficulty: "中等", knowledgePoint: "", chapter: ""
                               });
                             }
                          }}
                          className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${
                            entryMethod === method 
                              ? "bg-[#EAF8F1] text-[#10A66A] shadow-sm" 
                              : "bg-zinc-50 text-zinc-500 hover:bg-zinc-100"
                          }`}
                        >
                           {method}
                        </button>
                      ))}
                   </div>

                   {/* Entry Area */}
                   <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100 mb-8">
                     {entryMethod === "单题新增" && (
                       <div className="space-y-6 animate-in fade-in duration-300">
                          <h4 className="text-sm font-black text-zinc-900 border-b border-zinc-200 pb-3">
                             {editingQuestionId ? "编辑试题" : "单题新增"}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">题型</label>
                                <select 
                                  className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm font-black text-zinc-800 outline-none focus:border-[#10A66A]"
                                  value={newQuestion.type}
                                  onChange={e => setNewQuestion({ ...newQuestion, type: e.target.value as QuestionType })}
                                >
                                   <option value="单选题">单选题</option>
                                   <option value="多选题">多选题</option>
                                   <option value="判断题">判断题</option>
                                   <option value="填空题">填空题</option>
                                   <option value="简答题">简答题</option>
                                   <option value="实操题">实操题</option>
                                </select>
                             </div>
                             <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">适用考试 (只读)</label>
                                <input 
                                  className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-black text-zinc-500 outline-none cursor-not-allowed"
                                  value="物联网设备接入能力测评" disabled
                                />
                             </div>
                             
                             <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">题干</label>
                                <textarea 
                                  className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-800 outline-none focus:border-[#10A66A] resize-none h-24"
                                  value={newQuestion.content}
                                  placeholder="请输入题干内容..."
                                  onChange={e => setNewQuestion({ ...newQuestion, content: e.target.value })}
                                />
                             </div>

                             {(newQuestion.type === "单选题" || newQuestion.type === "多选题") && (
                               <div className="space-y-1.5 md:col-span-2">
                                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">选项设置</label>
                                  <div className="space-y-3 bg-white p-4 rounded-xl border border-zinc-200">
                                     {["A", "B", "C", "D"].map(opt => (
                                       <div key={opt} className="flex items-center gap-3">
                                          <span className="w-6 h-6 flex items-center justify-center bg-zinc-100 text-zinc-500 font-black rounded-lg text-xs">{opt}</span>
                                          <input type="text" className="flex-1 bg-zinc-50 border border-zinc-100 rounded-lg px-3 py-2 text-sm font-bold focus:border-[#10A66A] outline-none" placeholder={`选项 ${opt} 的内容`} />
                                          <button className="text-zinc-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                       </div>
                                     ))}
                                     <button className="text-xs font-black text-[#10A66A] hover:underline">+ 新增选项</button>
                                  </div>
                               </div>
                             )}

                             <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">正确答案</label>
                                <input 
                                  className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm font-black text-zinc-800 outline-none focus:border-[#10A66A]"
                                  value={newQuestion.answer}
                                  placeholder="请输入正确答案"
                                  onChange={e => setNewQuestion({ ...newQuestion, answer: e.target.value })}
                                />
                             </div>

                             <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">试题解析</label>
                                <textarea 
                                  className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-600 outline-none focus:border-[#10A66A] resize-none h-20"
                                  placeholder="请输入试题解析..."
                                />
                             </div>

                             <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">分值</label>
                                <input 
                                  type="number"
                                  className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm font-black text-zinc-800 outline-none focus:border-[#10A66A]"
                                  value={newQuestion.score}
                                  onChange={e => setNewQuestion({ ...newQuestion, score: parseInt(e.target.value) || 0 })}
                                />
                             </div>
                             
                             <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">难度</label>
                                <select 
                                  className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm font-black text-zinc-800 outline-none focus:border-[#10A66A]"
                                  value={newQuestion.difficulty}
                                  onChange={e => setNewQuestion({ ...newQuestion, difficulty: e.target.value as any })}
                                >
                                   <option value="简单">简单</option>
                                   <option value="中等">中等</option>
                                   <option value="困难">困难</option>
                                </select>
                             </div>

                             <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">知识点</label>
                                <input 
                                  className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm font-black text-zinc-800 outline-none focus:border-[#10A66A]"
                                  value={newQuestion.knowledgePoint}
                                  placeholder="请输入知识点..."
                                  onChange={e => setNewQuestion({ ...newQuestion, knowledgePoint: e.target.value })}
                                />
                             </div>

                             <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">所属章节</label>
                                <select 
                                  className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm font-black text-zinc-800 outline-none focus:border-[#10A66A]"
                                  value={newQuestion.chapter}
                                  onChange={e => setNewQuestion({ ...newQuestion, chapter: e.target.value })}
                                >
                                   <option value="第1章 物联网系统认知">第1章 物联网系统认知</option>
                                   <option value="第2章 传感器与数据采集">第2章 传感器与数据采集</option>
                                   <option value="第3章 MQTT通信协议">第3章 MQTT通信协议</option>
                                   <option value="第4章 设备接入与数据上报">第4章 设备接入与数据上报</option>
                                   <option value="第5章 行业云平台应用">第5章 行业云平台应用</option>
                                </select>
                             </div>
                          </div>

                          <div className="flex gap-3 justify-end pt-4">
                             <button 
                               onClick={() => {
                                 setNewQuestion({ type: "单选题", content: "", answer: "", score: 5, difficulty: "中等", knowledgePoint: "", chapter: "" });
                                 setEditingQuestionId(null);
                               }}
                               className="px-6 py-2.5 bg-white border border-zinc-200 text-zinc-600 text-sm font-black rounded-xl hover:bg-zinc-50 transition-all cursor-pointer"
                             >
                               清空表单
                             </button>
                             <button
                               onClick={handleSaveQuestion}
                               className="px-6 py-2.5 bg-[#10A66A] text-white text-sm font-black rounded-xl hover:bg-[#0e955d] transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                             >
                                <Save className="w-4 h-4" />
                                {editingQuestionId ? "保存修改" : "保存试题"}
                             </button>
                          </div>
                       </div>
                     )}

                     {entryMethod === "批量导入" && (
                       <div className="space-y-6 animate-in fade-in duration-300">
                          <div className="space-y-2 border-b border-zinc-200 pb-3">
                            <h4 className="text-sm font-black text-zinc-900">批量导入</h4>
                            <p className="text-xs font-bold text-zinc-500">可通过粘贴题目文本或上传题目文件的方式批量录入试题。</p>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                             <div className="space-y-4">
                                <h5 className="text-xs font-black text-zinc-800">1. 粘贴题目文本</h5>
                                <textarea 
                                  className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-xs font-bold text-zinc-600 outline-none focus:border-[#10A66A] resize-none h-48"
                                  value={importText}
                                  onChange={e => setImportText(e.target.value)}
                                  placeholder="题型：单选题&#10;题干：MQTT协议中负责消息转发的组件是？&#10;A. Publisher&#10;B. Subscriber&#10;C. Broker&#10;D. Topic&#10;答案：C&#10;解析：Broker负责消息转发。&#10;分值：5&#10;难度：中等&#10;知识点：MQTT通信协议"
                                />
                             </div>

                             <div className="space-y-4">
                                <h5 className="text-xs font-black text-zinc-800">2. 文件导入</h5>
                                <div className="border-2 border-dashed border-zinc-200 rounded-xl h-48 flex flex-col items-center justify-center text-center p-6 bg-white hover:border-[#10A66A] hover:bg-[#EAF8F1]/50 transition-all cursor-pointer">
                                   <UploadCloud className="w-8 h-8 text-zinc-300 mb-3" />
                                   <span className="text-sm font-black text-zinc-600">点击上传或拖拽文件到此处</span>
                                   <span className="text-[10px] font-bold text-zinc-400 mt-2">支持格式: .xlsx, .xls, .csv, .txt</span>
                                </div>
                             </div>
                          </div>

                          <div className="flex gap-3 justify-end">
                             <button
                               onClick={handleParseText}
                               className="px-6 py-2.5 bg-white border border-zinc-200 text-zinc-700 text-sm font-black rounded-xl hover:bg-zinc-50 transition-all cursor-pointer flex items-center gap-2"
                             >
                                <Search className="w-4 h-4" />
                                解析试题
                             </button>
                          </div>

                          {importPreview.length > 0 && (
                            <div className="mt-8 space-y-4 animate-in slide-in-from-bottom-4">
                               <h5 className="text-sm font-black text-zinc-900 border-l-4 border-[#10A66A] pl-3">解析结果预览</h5>
                               <div className="overflow-x-auto border border-zinc-200 rounded-xl bg-white">
                                 <table className="w-full text-left">
                                    <thead className="bg-[#F8FAF9] border-b border-zinc-100">
                                       <tr className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                          <th className="p-3 pl-4">序号</th>
                                          <th className="p-3">题型</th>
                                          <th className="p-3 max-w-[200px]">题干摘要</th>
                                          <th className="p-3">答案</th>
                                          <th className="p-3">分值</th>
                                          <th className="p-3">难度</th>
                                          <th className="p-3">知识点</th>
                                          <th className="p-3 pr-4 text-right">校验状态</th>
                                       </tr>
                                    </thead>
                                    <tbody>
                                       {importPreview.map((item, idx) => (
                                         <tr key={idx} className="border-b border-zinc-50 text-xs font-bold text-zinc-700">
                                            <td className="p-3 pl-4 text-zinc-400">{idx + 1}</td>
                                            <td className="p-3 text-[#10A66A]">{item.type}</td>
                                            <td className="p-3 truncate max-w-[200px]" title={item.content}>{item.content}</td>
                                            <td className="p-3">{item.answer}</td>
                                            <td className="p-3">{item.score}</td>
                                            <td className="p-3">{item.difficulty}</td>
                                            <td className="p-3">{item.knowledgePoint}</td>
                                            <td className="p-3 pr-4 text-right text-[#10A66A] flex items-center justify-end gap-1"><CheckCircle2 className="w-3 h-3"/> {item.status}</td>
                                         </tr>
                                       ))}
                                    </tbody>
                                 </table>
                               </div>
                               <div className="flex justify-end pt-2">
                                  <button
                                    onClick={handleConfirmImport}
                                    className="px-6 py-2.5 bg-[#10A66A] text-white text-sm font-black rounded-xl hover:bg-[#0e955d] transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
                                  >
                                     确认导入
                                  </button>
                               </div>
                            </div>
                          )}
                       </div>
                     )}

                     {entryMethod === "模板导入" && (
                       <div className="space-y-6 animate-in fade-in duration-300">
                          <div className="space-y-2 border-b border-zinc-200 pb-3">
                            <h4 className="text-sm font-black text-zinc-900">模板导入</h4>
                            <p className="text-xs font-bold text-zinc-500">可下载标准试题模板，按模板填写后导入试题。</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm flex flex-col items-center text-center">
                                <FileText className="w-8 h-8 text-[#10A66A] mb-3" />
                                <h5 className="text-sm font-black text-zinc-800 mb-1">通用试题模板</h5>
                                <p className="text-[10px] text-zinc-500 mb-4 px-2">适用于单选题、多选题、判断题、填空题、简答题。</p>
                                <button className="text-xs font-black text-[#10A66A] hover:underline mt-auto">下载模板</button>
                             </div>
                             <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm flex flex-col items-center text-center">
                                <MonitorStop className="w-8 h-8 text-[#10A66A] mb-3" />
                                <h5 className="text-sm font-black text-zinc-800 mb-1">实操题模板</h5>
                                <p className="text-[10px] text-zinc-500 mb-4 px-2">适用于实验操作题、项目任务题和实验报告评分题。</p>
                                <button className="text-xs font-black text-[#10A66A] hover:underline mt-auto">下载模板</button>
                             </div>
                             <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm flex flex-col items-center text-center">
                                <Layers className="w-8 h-8 text-[#10A66A] mb-3" />
                                <h5 className="text-sm font-black text-zinc-800 mb-1">物联网课程试题模板</h5>
                                <p className="text-[10px] text-zinc-500 mb-4 px-2">适用于物联网设备接入、通信协议等课程内容。</p>
                                <button className="text-xs font-black text-[#10A66A] hover:underline mt-auto">下载模板</button>
                             </div>
                          </div>

                          <div className="space-y-4 pt-4 border-t border-zinc-200">
                             <div className="border-2 border-dashed border-[#10A66A]/30 rounded-xl h-32 flex flex-col items-center justify-center text-center p-6 bg-[#EAF8F1]/30 hover:border-[#10A66A] transition-all cursor-pointer" onClick={handleParseTemplate}>
                                <Upload className="w-6 h-6 text-[#10A66A] mb-2" />
                                <span className="text-sm font-black text-zinc-700">请上传已填写完成的试题模板文件</span>
                                <span className="text-[10px] font-bold text-zinc-500 mt-1">点击此处模拟上传并解析</span>
                             </div>
                          </div>

                          {templatePreview.length > 0 && (
                            <div className="mt-8 space-y-4 animate-in slide-in-from-bottom-4">
                               <h5 className="text-sm font-black text-zinc-900 border-l-4 border-[#10A66A] pl-3">导入预览</h5>
                               <div className="overflow-x-auto border border-zinc-200 rounded-xl bg-white">
                                 <table className="w-full text-left">
                                    <thead className="bg-[#F8FAF9] border-b border-zinc-100">
                                       <tr className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                          <th className="p-3 pl-4">题型</th>
                                          <th className="p-3 max-w-[200px]">题干摘要</th>
                                          <th className="p-3">正确答案</th>
                                          <th className="p-3">分值</th>
                                          <th className="p-3">所属章节</th>
                                          <th className="p-3 pr-4 text-right">校验状态</th>
                                       </tr>
                                    </thead>
                                    <tbody>
                                       {templatePreview.map((item, idx) => (
                                         <tr key={idx} className="border-b border-zinc-50 text-xs font-bold text-zinc-700">
                                            <td className="p-3 pl-4 text-[#10A66A]">{item.type}</td>
                                            <td className="p-3 truncate max-w-[200px]" title={item.content}>{item.content}</td>
                                            <td className="p-3">{item.answer}</td>
                                            <td className="p-3">{item.score}</td>
                                            <td className="p-3">{item.chapter}</td>
                                            <td className="p-3 pr-4 text-right text-[#10A66A] flex items-center justify-end gap-1"><CheckCircle2 className="w-3 h-3"/> {item.status}</td>
                                         </tr>
                                       ))}
                                    </tbody>
                                 </table>
                               </div>
                               <div className="flex justify-end pt-2">
                                  <button
                                    onClick={handleConfirmTemplate}
                                    className="px-6 py-2.5 bg-[#10A66A] text-white text-sm font-black rounded-xl hover:bg-[#0e955d] transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
                                  >
                                     导入模板试题
                                  </button>
                               </div>
                            </div>
                          )}
                       </div>
                     )}
                   </div>

                   {/* Questions List */}
                   <div className="space-y-4">
                      <div className="flex flex-col md:flex-row gap-3">
                         <select 
                           className="bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm font-bold text-zinc-700 outline-none focus:border-[#10A66A]"
                           value={filterType}
                           onChange={e => setFilterType(e.target.value)}
                         >
                            <option value="全部">全部题型</option>
                            <option value="单选题">单选题</option>
                            <option value="多选题">多选题</option>
                            <option value="判断题">判断题</option>
                            <option value="简答题">简答题</option>
                            <option value="实操题">实操题</option>
                         </select>
                         <select 
                           className="bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm font-bold text-zinc-700 outline-none focus:border-[#10A66A]"
                           value={filterDiff}
                           onChange={e => setFilterDiff(e.target.value)}
                         >
                            <option value="全部">全部难度</option>
                            <option value="简单">简单</option>
                            <option value="中等">中等</option>
                            <option value="困难">困难</option>
                         </select>
                         <select 
                           className="bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm font-bold text-zinc-700 outline-none focus:border-[#10A66A]"
                           value={filterEntry}
                           onChange={e => setFilterEntry(e.target.value)}
                         >
                            <option value="全部">全部录入方式</option>
                            <option value="单题新增">单题新增</option>
                            <option value="批量导入">批量导入</option>
                            <option value="模板导入">模板导入</option>
                         </select>
                         <input 
                           type="text" 
                           placeholder="请输入知识点" 
                           className="flex-1 bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm font-bold text-zinc-700 outline-none focus:border-[#10A66A]"
                           value={searchKnowledge}
                           onChange={e => setSearchKnowledge(e.target.value)}
                         />
                         <input 
                           type="text" 
                           placeholder="请输入题干关键词" 
                           className="flex-1 bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm font-bold text-zinc-700 outline-none focus:border-[#10A66A]"
                           value={searchContent}
                           onChange={e => setSearchContent(e.target.value)}
                         />
                         <div className="flex gap-2 shrink-0">
                            <button 
                              className="px-4 py-2 bg-[#10A66A] text-white rounded-lg text-sm font-black hover:bg-[#0e955d] transition-colors"
                            >
                               查询
                            </button>
                            <button 
                              onClick={() => { setFilterType('全部'); setFilterDiff('全部'); setFilterEntry('全部'); setSearchContent(''); setSearchKnowledge(''); }}
                              className="px-4 py-2 bg-zinc-100 text-zinc-600 rounded-lg text-sm font-black hover:bg-zinc-200 transition-colors"
                            >
                               重置
                            </button>
                         </div>
                      </div>

                      <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white">
                         <table className="w-full text-left">
                            <thead className="bg-[#F8FAF9] border-b border-zinc-100">
                               <tr className="text-[10px] font-black text-zinc-400 uppercase tracking-widest whitespace-nowrap">
                                  <th className="p-4 pl-6">序号</th>
                                  <th className="p-4">题型</th>
                                  <th className="p-4 max-w-[200px]">题干摘要</th>
                                  <th className="p-4">正确答案</th>
                                  <th className="p-4">分值</th>
                                  <th className="p-4">难度</th>
                                  <th className="p-4">知识点</th>
                                  <th className="p-4">所属章节</th>
                                  <th className="p-4">录入方式</th>
                                  <th className="p-4 text-center">状态</th>
                                  <th className="p-4 pr-6 text-right">操作</th>
                               </tr>
                            </thead>
                            <tbody>
                               {filteredQuestions.length === 0 ? (
                                 <tr><td colSpan={11} className="p-12 text-center text-zinc-400 font-bold text-sm">暂无符合条件的试题。</td></tr>
                               ) : (
                                 filteredQuestions.map((q, idx) => (
                                   <tr key={q.id} className="border-b border-zinc-50 hover:bg-[#F8FAF9] transition-colors text-xs font-bold text-zinc-700">
                                      <td className="p-4 pl-6 text-zinc-400">{idx + 1}</td>
                                      <td className="p-4 text-[#10A66A] whitespace-nowrap">{q.type}</td>
                                      <td className="p-4 truncate max-w-[200px]" title={q.content}>{q.content}</td>
                                      <td className="p-4 truncate max-w-[100px] text-zinc-500">{q.answer}</td>
                                      <td className="p-4 font-black">{q.score}</td>
                                      <td className="p-4">
                                         <span className={`px-2 py-0.5 rounded text-[10px] ${
                                           q.difficulty === "简单" ? "bg-green-50 text-green-600" :
                                           q.difficulty === "中等" ? "bg-blue-50 text-blue-600" :
                                           "bg-orange-50 text-orange-600"
                                         }`}>{q.difficulty}</span>
                                      </td>
                                      <td className="p-4 text-[10px] truncate max-w-[120px]">{q.knowledgePoint}</td>
                                      <td className="p-4 text-[10px] text-zinc-500 truncate max-w-[120px]">{q.chapter}</td>
                                      <td className="p-4 text-[10px] text-zinc-400 whitespace-nowrap">{q.entryMethod}</td>
                                      <td className="p-4 text-center">
                                         <span className="text-[10px] font-black text-[#10A66A] bg-[#EAF8F1] px-2 py-0.5 rounded">{q.status}</span>
                                      </td>
                                      <td className="p-4 pr-6 text-right whitespace-nowrap">
                                         <div className="flex items-center justify-end gap-2 text-[#10A66A]">
                                            <button onClick={() => handleEditQuestion(q)} className="hover:underline">编辑</button>
                                            <div className="w-px h-3 bg-zinc-200 mx-1" />
                                            <button onClick={() => handleDeleteQuestion(q.id)} className="hover:text-red-500">删除</button>
                                         </div>
                                      </td>
                                   </tr>
                                 ))
                               )}
                            </tbody>
                         </table>
                      </div>

                   </div>

                </div>
             </div>
             )}

             {activeModule === "题库管理" && (
             <div className="space-y-6 pt-2 animate-in fade-in duration-300">
                <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm">
                   <div className="flex flex-col gap-2 border-b border-zinc-100 pb-6 mb-6">
                      <h3 className="text-xl font-black text-zinc-900 flex items-center gap-2">
                         <Layers className="w-6 h-6 text-[#10A66A]" />
                         题库管理
                      </h3>
                      <p className="text-sm font-bold text-zinc-500">
                         查看题库试题列表，并通过题型、难度等维度分析题库结构。
                      </p>
                      <p className="text-xs font-bold text-zinc-400">题库名称：物联网设备接入能力测评题库</p>
                   </div>

                   {/* Stats */}
                   <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
                      <div className="bg-white p-5 rounded-2xl border border-zinc-200 flex flex-col justify-center shadow-sm relative overflow-hidden">
                         <span className="text-xs font-black text-zinc-400 mb-2 relative z-10">试题总数</span>
                         <span className="text-3xl font-black text-[#10A66A] relative z-10">{questions.length} <span className="text-sm font-bold">道</span></span>
                         <div className="absolute right-0 bottom-0 opacity-[0.03] transform translate-x-4 translate-y-4">
                            <Layers className="w-24 h-24 text-black" />
                         </div>
                      </div>
                      <div className="bg-white p-5 rounded-2xl border border-[#10A66A]/20 flex flex-col justify-center shadow-sm relative overflow-hidden">
                         <span className="text-xs font-black text-[#10A66A] mb-2 relative z-10">题库总分</span>
                         <span className="text-3xl font-black text-[#10A66A] relative z-10">{totalScore} <span className="text-sm font-bold">分</span></span>
                      </div>
                      <div className="bg-white p-5 rounded-2xl border border-zinc-200 flex flex-col justify-center shadow-sm">
                         <span className="text-xs font-black text-zinc-400 mb-2">题型数量</span>
                         <span className="text-3xl font-black text-zinc-800">{tpTypesCount} <span className="text-sm font-bold">类</span></span>
                      </div>
                      <div className="bg-white p-5 rounded-2xl border border-zinc-200 flex flex-col justify-center shadow-sm">
                         <span className="text-xs font-black text-zinc-400 mb-2">知识点数量</span>
                         <span className="text-3xl font-black text-zinc-800">{tpKnowledgeCount} <span className="text-sm font-bold">个</span></span>
                      </div>
                      <div className="bg-white p-5 rounded-2xl border border-zinc-200 flex flex-col justify-center shadow-sm">
                         <span className="text-xs font-black text-zinc-400 mb-2">平均难度</span>
                         <span className="text-3xl font-black text-zinc-800">中等</span>
                      </div>
                      <div className="bg-white p-5 rounded-2xl border border-zinc-200 flex flex-col justify-center shadow-sm">
                         <span className="text-xs font-black text-zinc-400 mb-2">已启用试题</span>
                         <span className="text-3xl font-black text-[#10A66A]">{activeQuestions.length} <span className="text-sm font-bold text-zinc-400">道</span></span>
                      </div>
                   </div>

                   {/* View Toggles */}
                   <div className="flex flex-col md:flex-row justify-between gap-4 mb-6 bg-zinc-50 p-2 rounded-xl border border-zinc-100">
                      <div className="flex gap-1 items-center">
                         <span className="text-xs font-black text-zinc-400 px-3 shrink-0">统计单位</span>
                         {(['按题数', '按分值', '按占比'] as const).map(u => (
                            <button
                              key={u}
                              onClick={() => setStatUnit(u)}
                              className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${statUnit === u ? 'bg-[#10A66A]/10 text-[#10A66A]' : 'text-zinc-500 hover:bg-zinc-100'}`}
                            >
                               {u}
                            </button>
                         ))}
                      </div>
                      <div className="flex gap-1 items-center flex-wrap">
                         <span className="text-xs font-black text-zinc-400 px-3 shrink-0">展示方式</span>
                         {(['综合展示', '饼图', '柱状图', '条形图', '折线图', '列表'] as const).map(m => (
                            <button
                              key={m}
                              onClick={() => setChartDisplayMode(m)}
                              className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${chartDisplayMode === m ? 'bg-[#10A66A] text-white shadow-sm' : 'text-zinc-500 hover:bg-zinc-100'}`}
                            >
                               {m}
                            </button>
                         ))}
                      </div>
                   </div>

                   {/* Charts Section */}
                   {chartDisplayMode !== "列表" && (
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                       {/* 题型分析 */}
                       <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-6 relative flex flex-col gap-8">
                          <h4 className="text-sm font-black text-zinc-900 flex items-center gap-2"><PieChartIcon className="w-4 h-4 text-[#10A66A]"/> 题型分析</h4>
                          
                          {/* 饼图 */}
                          {(chartDisplayMode === "综合展示" || chartDisplayMode === "饼图") && (
                          <div className="flex flex-col sm:flex-row items-center gap-8">
                              <div className="relative w-32 h-32 flex-shrink-0">
                                 {/* Simple CSS Conic Gradient Pie Chart */}
                                 <div className="w-full h-full rounded-full shadow-inner border-[6px] border-white" style={{
                                    background: typeAnalysis.length > 0 ? `conic-gradient(${
                                        (() => {
                                           let current = 0;
                                           const total = typeAnalysis.reduce((s, t) => s + (statUnit === '按分值' ? t.score : t.count), 0);
                                           return typeAnalysis.map(t => {
                                              const start = current;
                                              const val = statUnit === '按分值' ? t.score : t.count;
                                              const pct = total ? (val / total) * 100 : 0;
                                              current += pct;
                                              return `${t.color} ${start}% ${current}%`;
                                           }).join(", ");
                                        })()
                                    })` : "#f4f4f5"
                                 }}></div>
                                 <div className="absolute inset-4 bg-zinc-50 rounded-full flex items-center justify-center shadow-sm border border-zinc-100">
                                    <span className="text-[10px] font-black text-zinc-500 text-center leading-tight">题型<br/>{statUnit === '按占比' ? '占比' : statUnit === '按分值' ? '分值' : '分布'}</span>
                                 </div>
                              </div>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-3 flex-1 w-full">
                                 {typeAnalysis.map((t, i) => {
                                    const val = statUnit === '按题数' ? t.count : statUnit === '按分值' ? t.score : t.percentageNum;
                                    const formattedVal = statUnit === '按占比' ? t.percentage : val;
                                    const suffix = statUnit === '按题数' ? '道' : statUnit === '按分值' ? '分' : '%';
                                    return (
                                     <div key={i} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                           <div className="w-2.5 h-2.5 rounded-sm box-border shadow-sm border border-black/5" style={{backgroundColor: t.color}}></div>
                                           <span className="font-bold text-zinc-600">{t.type}</span>
                                        </div>
                                        <span className="font-black text-zinc-800">{formattedVal}{suffix}</span>
                                     </div>
                                 )})}
                              </div>
                          </div>
                          )}

                          {/* 条形图 */}
                          {(chartDisplayMode === "综合展示" || chartDisplayMode === "条形图") && (
                             <div className={`flex flex-col gap-4 justify-center w-full ${chartDisplayMode === "综合展示" ? "pt-6 border-t border-zinc-200" : ""}`}>
                                <h5 className="text-[10px] font-black text-zinc-400 mb-1 text-center sm:text-left uppercase tracking-widest hidden sm:block">题型条形图</h5>
                                {allTypeAnalysis.map((t, i) => {
                                   const val = statUnit === '按题数' ? t.count : statUnit === '按分值' ? t.score : t.percentageNum;
                                   const maxVal = Math.max(...allTypeAnalysis.map(x => statUnit === '按题数' ? x.count : statUnit === '按分值' ? x.score : x.percentageNum), 1);
                                   const hPct = val > 0 ? (val / maxVal) * 100 : 0;
                                   const formattedVal = statUnit === '按占比' ? t.percentage : val;
                                   const suffix = statUnit === '按题数' ? '道' : statUnit === '按分值' ? '分' : '%';
                                   return (
                                   <div key={i} className="space-y-1.5">
                                      <div className="flex items-center justify-between text-[10px] font-bold text-zinc-600">
                                         <span className="uppercase">{t.type}</span>
                                         <span className="text-zinc-800 font-black">{t.percentage}% / {formattedVal}{suffix}</span>
                                      </div>
                                      <div className="h-2.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                                         <div className="h-full rounded-full transition-all duration-500" style={{width: `${hPct}%`, backgroundColor: val > 0 ? t.color : 'transparent'}}></div>
                                      </div>
                                   </div>
                                )})}
                             </div>
                          )}

                          {/* 柱状图 */}
                          {(chartDisplayMode === "综合展示" || chartDisplayMode === "柱状图") && (
                          <div className={chartDisplayMode === "综合展示" ? "pt-6 border-t border-zinc-200" : ""}>
                             <h5 className="text-[10px] font-black text-zinc-400 mb-4 text-center uppercase tracking-widest">题型柱状图</h5>
                             <div className="flex items-end justify-between gap-2 h-32 w-full px-2">
                                {allTypeAnalysis.map((t, i) => {
                                   const val = statUnit === '按题数' ? t.count : statUnit === '按分值' ? t.score : t.percentageNum;
                                   const maxVal = Math.max(...allTypeAnalysis.map(x => statUnit === '按题数' ? x.count : statUnit === '按分值' ? x.score : x.percentageNum), 1);
                                   const hPct = val > 0 ? Math.max((val / maxVal) * 100, 10) : 4; // Ensure visible min height
                                   const formattedVal = statUnit === '按占比' ? t.percentage : val;
                                   return (
                                     <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                        <span className="text-[10px] font-black text-zinc-600 transition-opacity">{formattedVal}</span>
                                        <div className="w-full max-w-[24px] bg-zinc-100 rounded-t relative flex-1 flex items-end justify-center">
                                           <div className={`w-full rounded-t transition-all duration-500 min-h-[4px] ${val === 0 ? "bg-zinc-200" : ""}`} style={{height: `${hPct}%`, backgroundColor: val > 0 ? t.color : undefined}}></div>
                                        </div>
                                        <span className="text-[10px] font-bold text-zinc-600 whitespace-nowrap overflow-hidden text-ellipsis max-w-full px-1" title={t.type}>{t.type.replace("题", "")}</span>
                                     </div>
                                   )
                                })}
                             </div>
                          </div>
                          )}

                          {/* 折线图 */}
                          {chartDisplayMode === "折线图" && (() => {
                             const maxVal = Math.max(...allTypeAnalysis.map(x => statUnit === '按题数' ? x.count : statUnit === '按分值' ? x.score : x.percentageNum), 1);
                             const points = allTypeAnalysis.map((t, i) => {
                                const val = statUnit === '按题数' ? t.count : statUnit === '按分值' ? t.score : t.percentageNum;
                                const x = (i / (allTypeAnalysis.length - 1)) * 100;
                                const y = 100 - (val / maxVal) * 100;
                                return `${x},${y}`;
                             }).join(" ");
                             
                             return (
                             <div>
                                <h5 className="text-[10px] font-black text-zinc-400 mb-6 text-center uppercase tracking-widest">题型趋势折线图</h5>
                                <div className="relative h-32 w-full px-6 mb-4">
                                   <svg className="absolute inset-0 w-full h-full overflow-visible preserve-3d" preserveAspectRatio="none">
                                      <polyline points={points} fill="none" stroke="#10A66A" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                                   </svg>
                                   <div className="absolute inset-0 flex justify-between items-end">
                                      {allTypeAnalysis.map((t, i) => {
                                         const val = statUnit === '按题数' ? t.count : statUnit === '按分值' ? t.score : t.percentageNum;
                                         const y = 100 - (val / maxVal) * 100;
                                         const formattedVal = statUnit === '按占比' ? t.percentage : val;
                                         return (
                                            <div key={i} className="absolute flex flex-col items-center -translate-x-1/2" style={{left: `${(i / (allTypeAnalysis.length - 1)) * 100}%`, top: `${y}%`}}>
                                               <span className="text-[10px] font-black text-zinc-600 -mt-5 bg-zinc-50 px-1 rounded">{formattedVal}</span>
                                               <div className="w-2.5 h-2.5 rounded-full bg-white border-2 border-[#10A66A] translate-y-[-50%] shadow-sm"></div>
                                            </div>
                                         );
                                      })}
                                   </div>
                                </div>
                                <div className="flex justify-between px-2">
                                   {allTypeAnalysis.map((t, i) => (
                                      <span key={i} className="text-[10px] font-bold text-zinc-600 whitespace-nowrap">{t.type.replace("题", "")}</span>
                                   ))}
                                </div>
                             </div>
                          )})}
                       </div>
                       
                       {/* 难度分析 */}
                       <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-6 relative flex flex-col gap-8">
                          <h4 className="text-sm font-black text-zinc-900 flex items-center gap-2"><BarChart2 className="w-4 h-4 text-[#10A66A]"/> 难度分析</h4>
                          
                          {/* Top: 饼图 & 条形图 */}
                          {(chartDisplayMode === "综合展示" || chartDisplayMode === "饼图") && (
                          <div className="flex flex-col sm:flex-row gap-8 items-center">
                             {/* 饼图 */}
                             <div className="relative w-32 h-32 flex-shrink-0 mx-auto sm:mx-0">
                                 <div className="w-full h-full rounded-full shadow-inner border-[6px] border-white" style={{
                                    background: diffAnalysis.length > 0 ? `conic-gradient(${
                                        (() => {
                                           let current = 0;
                                           const total = diffAnalysis.reduce((s, t) => s + (statUnit === '按分值' ? t.score : t.count), 0);
                                           return diffAnalysis.map(t => {
                                              const start = current;
                                              const val = statUnit === '按分值' ? t.score : t.count;
                                              const pct = total ? (val / total) * 100 : 0;
                                              current += pct;
                                              return `${t.color} ${start}% ${current}%`;
                                           }).join(", ");
                                        })()
                                    })` : "#f4f4f5"
                                 }}></div>
                                 <div className="absolute inset-4 bg-zinc-50 rounded-full flex items-center justify-center shadow-sm border border-zinc-100">
                                    <span className="text-[10px] font-black text-zinc-500 text-center leading-tight">难度<br/>{statUnit === '按占比' ? '占比' : statUnit === '按分值' ? '分值' : '分布'}</span>
                                 </div>
                             </div>

                             <div className="grid grid-cols-1 gap-x-4 gap-y-3 flex-1 w-full justify-center">
                                 {allDiffAnalysis.map((d, i) => {
                                    const val = statUnit === '按题数' ? d.count : statUnit === '按分值' ? d.score : d.percentageNum;
                                    const formattedVal = statUnit === '按占比' ? d.percentage : val;
                                    const suffix = statUnit === '按题数' ? '道' : statUnit === '按分值' ? '分' : '%';
                                    return (
                                     <div key={i} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                           <div className="w-2.5 h-2.5 rounded-sm box-border shadow-sm border border-black/5" style={{backgroundColor: d.color}}></div>
                                           <span className="font-bold text-zinc-600">{d.diff}</span>
                                        </div>
                                        <span className="font-black text-zinc-800">{formattedVal}{suffix}</span>
                                     </div>
                                 )})}
                              </div>
                          </div>
                          )}

                          {/* 条形图 */}
                          {(chartDisplayMode === "综合展示" || chartDisplayMode === "条形图") && (
                             <div className={`flex flex-col gap-4 justify-center w-full ${chartDisplayMode === "综合展示" ? "pt-6 border-t border-zinc-200" : ""}`}>
                                <h5 className="text-[10px] font-black text-zinc-400 mb-1 text-center sm:text-left uppercase tracking-widest hidden sm:block">难度条形图</h5>
                                {allDiffAnalysis.map((d, i) => {
                                   const val = statUnit === '按题数' ? d.count : statUnit === '按分值' ? d.score : d.percentageNum;
                                   const maxVal = Math.max(...allDiffAnalysis.map(x => statUnit === '按题数' ? x.count : statUnit === '按分值' ? x.score : x.percentageNum), 1);
                                   const hPct = val > 0 ? (val / maxVal) * 100 : 0;
                                   const formattedVal = statUnit === '按占比' ? d.percentage : val;
                                   const suffix = statUnit === '按题数' ? '道' : statUnit === '按分值' ? '分' : '%';
                                   return (
                                   <div key={i} className="space-y-1.5">
                                      <div className="flex items-center justify-between text-[10px] font-bold text-zinc-600">
                                         <span className="uppercase">{d.diff}</span>
                                         <span className="text-zinc-800 font-black">{d.percentage}% / {formattedVal}{suffix}</span>
                                      </div>
                                      <div className="h-2.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                                         <div className="h-full rounded-full transition-all duration-500" style={{width: `${hPct}%`, backgroundColor: val > 0 ? d.color : 'transparent'}}></div>
                                      </div>
                                   </div>
                                )})}
                             </div>
                          )}

                          {/* 柱状图 */}
                          {(chartDisplayMode === "综合展示" || chartDisplayMode === "柱状图") && (
                          <div className={chartDisplayMode === "综合展示" ? "pt-6 border-t border-zinc-200" : ""}>
                             <h5 className="text-[10px] font-black text-zinc-400 mb-4 text-center uppercase tracking-widest">难度数量柱状图</h5>
                             <div className="flex items-end justify-center gap-8 h-32 w-full px-4">
                                {allDiffAnalysis.map((d, i) => {
                                   const val = statUnit === '按题数' ? d.count : statUnit === '按分值' ? d.score : d.percentageNum;
                                   const maxVal = Math.max(...allDiffAnalysis.map(x => statUnit === '按题数' ? x.count : statUnit === '按分值' ? x.score : x.percentageNum), 1);
                                   const hPct = val > 0 ? Math.max((val / maxVal) * 100, 10) : 4;
                                   const formattedVal = statUnit === '按占比' ? d.percentage : val;
                                   return (
                                     <div key={i} className="w-16 flex flex-col items-center gap-2 group">
                                        <span className="text-[10px] font-black text-zinc-600 transition-opacity">{formattedVal}</span>
                                        <div className="w-full max-w-[32px] bg-zinc-100 rounded-t relative flex-1 flex items-end">
                                           <div className={`w-full rounded-t transition-all duration-500 min-h-[4px] ${val === 0 ? "bg-zinc-200" : ""}`} style={{height: `${hPct}%`, backgroundColor: val > 0 ? d.color : undefined}}></div>
                                        </div>
                                        <span className="text-[10px] font-bold text-zinc-600">{d.diff}</span>
                                     </div>
                                   )
                                })}
                             </div>
                          </div>
                          )}

                          {/* 折线图 */}
                          {chartDisplayMode === "折线图" && (() => {
                             const maxVal = Math.max(...allDiffAnalysis.map(x => statUnit === '按题数' ? x.count : statUnit === '按分值' ? x.score : x.percentageNum), 1);
                             const points = allDiffAnalysis.map((d, i) => {
                                const val = statUnit === '按题数' ? d.count : statUnit === '按分值' ? d.score : d.percentageNum;
                                const x = (i / (allDiffAnalysis.length - 1)) * 100;
                                const y = 100 - (val / maxVal) * 100;
                                return `${x},${y}`;
                             }).join(" ");
                             
                             return (
                             <div>
                                <h5 className="text-[10px] font-black text-zinc-400 mb-6 text-center uppercase tracking-widest">难度趋势折线图</h5>
                                <div className="relative h-32 w-full px-8 mb-4">
                                   <svg className="absolute inset-0 w-full h-full overflow-visible preserve-3d" preserveAspectRatio="none">
                                      <polyline points={points} fill="none" stroke="#10A66A" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                                   </svg>
                                   <div className="absolute inset-0 flex justify-between items-end">
                                      {allDiffAnalysis.map((d, i) => {
                                         const val = statUnit === '按题数' ? d.count : statUnit === '按分值' ? d.score : d.percentageNum;
                                         const y = 100 - (val / maxVal) * 100;
                                         const formattedVal = statUnit === '按占比' ? d.percentage : val;
                                         return (
                                            <div key={i} className="absolute flex flex-col items-center -translate-x-1/2" style={{left: `${(i / (allDiffAnalysis.length - 1)) * 100}%`, top: `${y}%`}}>
                                               <span className="text-[10px] font-black text-zinc-600 -mt-5 bg-zinc-50 px-1 rounded">{formattedVal}</span>
                                               <div className="w-2.5 h-2.5 rounded-full bg-white border-2 border-[#10A66A] translate-y-[-50%] shadow-sm"></div>
                                            </div>
                                         );
                                      })}
                                   </div>
                                </div>
                                <div className="flex justify-between px-4">
                                   {allDiffAnalysis.map((d, i) => (
                                      <span key={i} className="text-[10px] font-bold text-zinc-600 whitespace-nowrap">{d.diff}</span>
                                   ))}
                                </div>
                             </div>
                          )})}
                          
                       </div>
                   </div>
                   )}

                   {/* Analysis Lists */}
                   {(chartDisplayMode === "综合展示" || chartDisplayMode === "列表") && (
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                       <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white">
                          <div className="bg-[#F8FAF9] p-3 border-b border-zinc-100 text-xs font-black text-zinc-800">题型结构报表</div>
                          <table className="w-full text-left">
                             <thead className="bg-zinc-50/50 border-b border-zinc-100">
                                <tr className="text-[10px] font-black text-zinc-400 uppercase tracking-widest whitespace-nowrap">
                                   <th className="p-3 pl-4">题型</th>
                                   <th className={`p-3 ${statUnit === '按题数' ? 'text-[#10A66A]' : ''}`}>数量</th>
                                   <th className={`p-3 ${statUnit === '按占比' ? 'text-[#10A66A]' : ''}`}>占比</th>
                                   <th className={`p-3 ${statUnit === '按分值' ? 'text-[#10A66A]' : ''}`}>总分</th>
                                   <th className="p-3">平均分值</th>
                                   <th className="p-3 pr-4">分析说明</th>
                                </tr>
                             </thead>
                             <tbody>
                                {typeAnalysis.map((t, idx) => (
                                  <tr key={idx} className="border-b border-zinc-50 text-xs font-bold text-zinc-700 hover:bg-zinc-50/50">
                                     <td className="p-3 pl-4 text-zinc-800">{t.type}</td>
                                     <td className={`p-3 ${statUnit === '按题数' ? 'font-black text-[#10A66A]' : ''}`}>{t.count}</td>
                                     <td className={`p-3 ${statUnit === '按占比' ? 'font-black text-[#10A66A]' : 'text-zinc-500'}`}>{t.percentage}%</td>
                                     <td className={`p-3 ${statUnit === '按分值' ? 'font-black text-[#10A66A]' : ''}`}>{t.score}分</td>
                                     <td className="p-3">{t.avgScore}分</td>
                                     <td className="p-3 pr-4 text-[10px] text-zinc-500 truncate max-w-[120px]" title={t.desc}>{t.desc}</td>
                                  </tr>
                                ))}
                             </tbody>
                          </table>
                       </div>

                       <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white">
                          <div className="bg-[#F8FAF9] p-3 border-b border-zinc-100 text-xs font-black text-zinc-800">难度分布报表</div>
                          <table className="w-full text-left">
                             <thead className="bg-zinc-50/50 border-b border-zinc-100">
                                <tr className="text-[10px] font-black text-zinc-400 uppercase tracking-widest whitespace-nowrap">
                                   <th className="p-3 pl-4">难度</th>
                                   <th className={`p-3 ${statUnit === '按题数' ? 'text-[#10A66A]' : ''}`}>数量</th>
                                   <th className={`p-3 ${statUnit === '按占比' ? 'text-[#10A66A]' : ''}`}>占比</th>
                                   <th className={`p-3 ${statUnit === '按分值' ? 'text-[#10A66A]' : ''}`}>总分</th>
                                   <th className="p-3">代表题型</th>
                                   <th className="p-3 pr-4">分析建议</th>
                                </tr>
                             </thead>
                             <tbody>
                                {diffAnalysis.map((d, idx) => (
                                  <tr key={idx} className="border-b border-zinc-50 text-xs font-bold text-zinc-700 hover:bg-zinc-50/50">
                                     <td className="p-3 pl-4 text-zinc-800">{d.diff}</td>
                                     <td className={`p-3 ${statUnit === '按题数' ? 'font-black text-[#10A66A]' : ''}`}>{d.count}</td>
                                     <td className={`p-3 ${statUnit === '按占比' ? 'font-black text-[#10A66A]' : 'text-zinc-500'}`}>{d.percentage}%</td>
                                     <td className={`p-3 ${statUnit === '按分值' ? 'font-black text-[#10A66A]' : ''}`}>{d.score}分</td>
                                     <td className="p-3 text-[10px] text-zinc-500 truncate max-w-[100px]" title={d.repTypes}>{d.repTypes}</td>
                                     <td className="p-3 pr-4 text-[10px] text-zinc-500 truncate max-w-[120px]" title={d.desc}>{d.desc}</td>
                                  </tr>
                                ))}
                             </tbody>
                          </table>
                       </div>
                   </div>
                   )}

                   {/* Filters */}
                   <div className="flex flex-col md:flex-row gap-3 mb-4">
                      <select 
                        className="bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm font-bold text-zinc-700 outline-none focus:border-[#10A66A]"
                        value={bankFilterType}
                        onChange={e => setBankFilterType(e.target.value)}
                      >
                         <option value="全部">全部题型</option>
                         <option value="单选题">单选题</option>
                         <option value="多选题">多选题</option>
                         <option value="判断题">判断题</option>
                         <option value="简答题">简答题</option>
                         <option value="实操题">实操题</option>
                      </select>
                      <select 
                        className="bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm font-bold text-zinc-700 outline-none focus:border-[#10A66A]"
                        value={bankFilterDiff}
                        onChange={e => setBankFilterDiff(e.target.value)}
                      >
                         <option value="全部">全部难度</option>
                         <option value="简单">简单</option>
                         <option value="中等">中等</option>
                         <option value="困难">困难</option>
                      </select>
                      <select 
                        className="bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm font-bold text-zinc-700 outline-none focus:border-[#10A66A]"
                        value={bankFilterStatus}
                        onChange={e => setBankFilterStatus(e.target.value)}
                      >
                         <option value="全部">全部状态</option>
                         <option value="已启用">已启用</option>
                         <option value="已停用">未启用</option>
                      </select>
                      <input 
                        type="text" 
                        placeholder="请输入知识点" 
                        className="flex-1 bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm font-bold text-zinc-700 outline-none focus:border-[#10A66A]"
                        value={bankSearchKnowledge}
                        onChange={e => setBankSearchKnowledge(e.target.value)}
                      />
                      <input 
                        type="text" 
                        placeholder="请输入题干关键词" 
                        className="flex-1 bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm font-bold text-zinc-700 outline-none focus:border-[#10A66A]"
                        value={bankSearchContent}
                        onChange={e => setBankSearchContent(e.target.value)}
                      />
                      <div className="flex gap-2 shrink-0">
                         <button 
                           className="px-4 py-2 bg-[#10A66A] text-white rounded-lg text-sm font-black hover:bg-[#0e955d] transition-colors"
                         >
                            查询
                         </button>
                         <button 
                           onClick={() => { setBankFilterType('全部'); setBankFilterDiff('全部'); setBankFilterStatus('全部'); setBankSearchContent(''); setBankSearchKnowledge(''); }}
                           className="px-4 py-2 bg-zinc-100 text-zinc-600 rounded-lg text-sm font-black hover:bg-zinc-200 transition-colors"
                         >
                            重置
                         </button>
                      </div>
                   </div>

                   {/* Question List */}
                   <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white">
                      <table className="w-full text-left">
                         <thead className="bg-[#F8FAF9] border-b border-zinc-100">
                            <tr className="text-[10px] font-black text-zinc-400 uppercase tracking-widest whitespace-nowrap">
                               <th className="p-4 pl-6">序号</th>
                               <th className="p-4">题型</th>
                               <th className="p-4 max-w-[200px]">题干摘要</th>
                               <th className="p-4">正确答案</th>
                               <th className="p-4">分值</th>
                               <th className="p-4">难度</th>
                               <th className="p-4">知识点</th>
                               <th className="p-4">所属章节</th>
                               <th className="p-4 text-center">状态</th>
                               <th className="p-4 pr-6 text-right">操作</th>
                            </tr>
                         </thead>
                         <tbody>
                            {bankFilteredQuestions.length === 0 ? (
                              <tr><td colSpan={10} className="p-12 text-center text-zinc-400 font-bold text-sm">暂无符合条件的试题。</td></tr>
                            ) : (
                              bankFilteredQuestions.map((q, idx) => (
                                <tr key={q.id} className="border-b border-zinc-50 hover:bg-[#F8FAF9] transition-colors text-xs font-bold text-zinc-700">
                                   <td className="p-4 pl-6 text-zinc-400">{idx + 1}</td>
                                   <td className="p-4 text-[#10A66A] whitespace-nowrap">{q.type}</td>
                                   <td className="p-4 truncate max-w-[200px]" title={q.content}>{q.content}</td>
                                   <td className="p-4 truncate max-w-[100px] text-zinc-500">{q.answer}</td>
                                   <td className="p-4 font-black">{q.score}</td>
                                   <td className="p-4">
                                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                                        q.difficulty === "简单" ? "bg-green-50 text-green-600" :
                                        q.difficulty === "中等" ? "bg-blue-50 text-blue-600" :
                                        "bg-orange-50 text-orange-600"
                                      }`}>{q.difficulty}</span>
                                   </td>
                                   <td className="p-4 text-[10px] truncate max-w-[120px]">{q.knowledgePoint}</td>
                                   <td className="p-4 text-[10px] text-zinc-500 truncate max-w-[120px]">{q.chapter}</td>
                                   <td className="p-4 text-center">
                                      <span className={`text-[10px] font-black px-2 py-0.5 rounded ${q.status === "已启用" ? "text-[#10A66A] bg-[#EAF8F1]" : "text-zinc-500 bg-zinc-100"}`}>{q.status}</span>
                                   </td>
                                   <td className="p-4 pr-6 text-right whitespace-nowrap">
                                      <button onClick={() => setViewQuestionId(q.id)} className="text-[#10A66A] hover:underline font-black">查看</button>
                                   </td>
                                </tr>
                              ))
                            )}
                         </tbody>
                      </table>
                   </div>
                   <p className="text-[10px] font-bold text-zinc-400 mt-3 flex items-center justify-between">
                     <span>当前分析范围：筛选结果</span>
                   </p>
                </div>
             </div>
             )}

             
             {activeModule === "试卷管理" && (
             <div className="space-y-6 pt-2 animate-in fade-in duration-300">
                <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm">
                   <div className="flex flex-col gap-2 border-b border-zinc-100 pb-6 mb-6">
                      <h3 className="text-xl font-black text-zinc-900 flex items-center gap-2">
                         <BookOpen className="w-6 h-6 text-[#10A66A]" />
                         试卷管理
                      </h3>
                      <p className="text-sm font-bold text-zinc-500">
                         独立维护理论试卷与实操试卷，并支持与考试进行关联。
                      </p>
                   </div>

                   {/* Stats */}
                   <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                      <div className="bg-white p-5 rounded-2xl border border-zinc-200 flex flex-col justify-center shadow-sm relative overflow-hidden">
                         <span className="text-xs font-black text-zinc-400 mb-2 relative z-10">试卷总数</span>
                         <span className="text-3xl font-black text-[#10A66A] relative z-10">{papers.length} <span className="text-sm font-bold text-zinc-400">套</span></span>
                      </div>
                      <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-100 flex flex-col justify-center">
                         <span className="text-xs font-black text-zinc-400 mb-2">理论试卷</span>
                         <span className="text-3xl font-black text-[#10A66A]">{papers.filter(p => p.type === "理论试卷").length} <span className="text-sm font-bold text-zinc-400">套</span></span>
                      </div>
                      <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-100 flex flex-col justify-center">
                         <span className="text-xs font-black text-zinc-400 mb-2">实操试卷</span>
                         <span className="text-3xl font-black text-[#10A66A]">{papers.filter(p => p.type === "实操试卷").length} <span className="text-sm font-bold text-zinc-400">套</span></span>
                      </div>
                      <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-100 flex flex-col justify-center">
                         <span className="text-xs font-black text-zinc-400 mb-2">固定组卷</span>
                         <span className="text-3xl font-black text-[#10A66A]">{papers.filter(p => p.composeMethod === "固定组卷").length} <span className="text-sm font-bold text-zinc-400">套</span></span>
                      </div>
                      <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-100 flex flex-col justify-center">
                         <span className="text-xs font-black text-zinc-400 mb-2">随机组卷</span>
                         <span className="text-3xl font-black text-[#10A66A]">{papers.filter(p => p.composeMethod === "随机组卷").length} <span className="text-sm font-bold text-zinc-400">套</span></span>
                      </div>
                      <div className="bg-[#10A66A]/5 p-5 rounded-2xl border border-[#10A66A]/20 flex flex-col justify-center">
                         <span className="text-xs font-black text-[#10A66A] mb-2">已启用试卷</span>
                         <span className="text-3xl font-black text-[#10A66A]">{papers.filter(p => p.status === "已启用").length} <span className="text-sm font-bold text-[#10A66A]/50">套</span></span>
                      </div>
                   </div>

                   {isEditingPaper ? (
                      <div className="animate-in slide-in-from-bottom-4 duration-300">
                         <div className="flex items-center justify-between mb-6">
                            <h4 className="text-lg font-black text-zinc-900">{editingPaperId ? "编辑试卷" : "新增试卷"}</h4>
                            <div className="flex items-center bg-zinc-50 border border-zinc-200 rounded-lg p-1">
                               {["基础信息", "组卷配置", "试卷预览"].map(tab => (
                                 <button
                                   key={tab}
                                   onClick={() => { setPaperEditTab(tab as any); }}
                                   className={`px-4 py-1.5 rounded-md text-xs font-black transition-colors ${paperEditTab === tab ? "bg-white shadow-sm text-zinc-900 border border-zinc-200/50" : "text-zinc-500 hover:text-zinc-800"}`}
                                 >
                                    {tab}
                                 </button>
                               ))}
                            </div>
                         </div>
                         <div className="flex flex-col xl:flex-row gap-8">
                            <div className="flex-1 space-y-6">
                               {paperEditTab === "基础信息" && (
                               <div className="bg-zinc-50 border border-zinc-100 p-6 rounded-2xl space-y-5">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                     <div className="space-y-2">
                                        <label className="text-xs font-black text-zinc-500">试卷名称</label>
                                        <input type="text" className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:border-[#10A66A]" value={newPaper.name || ""} onChange={e => setNewPaper({...newPaper, name: e.target.value})} placeholder="例如：物联网设备接入理论试卷A" />
                                     </div>
                                     <div className="space-y-2">
                                        <label className="text-xs font-black text-zinc-500">试卷类型</label>
                                        <select className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:border-[#10A66A]" value={newPaper.type || "理论试卷"} onChange={e => setNewPaper({...newPaper, type: e.target.value as any, composeMethod: e.target.value === "实操试卷" ? "实操任务组卷" : "固定组卷"})}>
                                           <option value="理论试卷">理论试卷</option>
                                           <option value="实操试卷">实操试卷</option>
                                        </select>
                                     </div>
                                  </div>
                                  
                                  <div className="space-y-2">
                                     <label className="text-xs font-black text-zinc-500">试卷说明</label>
                                     <textarea className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:border-[#10A66A] h-20 resize-none" value={newPaper.desc || ""} onChange={e => setNewPaper({...newPaper, desc: e.target.value})} placeholder="用于考察学生对物联网设备接入、通信协议..." />
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                     <div className="space-y-2">
                                      <label className="text-xs font-black text-zinc-500">试卷总分</label>
                                      <div className="relative">
                                         <input type="number" className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:border-[#10A66A]" value={newPaper.totalScore || 100} onChange={e => setNewPaper({...newPaper, totalScore: Number(e.target.value)})} />
                                         <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">分</span>
                                      </div>
                                     </div>
                                     <div className="space-y-2">
                                      <label className="text-xs font-black text-zinc-500">及格分数</label>
                                      <div className="relative">
                                         <input type="number" className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:border-[#10A66A]" value={newPaper.passScore || 60} onChange={e => setNewPaper({...newPaper, passScore: Number(e.target.value)})} />
                                         <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">分</span>
                                      </div>
                                     </div>
                                     <div className="space-y-2">
                                        <label className="text-xs font-black text-zinc-500">试卷状态</label>
                                        <select className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:border-[#10A66A]" value={newPaper.status || "草稿"} onChange={e => setNewPaper({...newPaper, status: e.target.value as any})}>
                                           <option value="草稿">草稿</option>
                                           <option value="已启用">已启用</option>
                                           <option value="已停用">已停用</option>
                                        </select>
                                     </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                     <div className="space-y-2">
                                        <label className="text-xs font-black text-zinc-500">关联考试</label>
                                        <input type="text" className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-4 py-2 text-sm font-bold text-zinc-500 cursor-not-allowed" value={editingExam?.name || "未知"} readOnly />
                                     </div>
                                     <div className="space-y-2">
                                        <label className="text-xs font-black text-zinc-500">关联考试场次 (多选)</label>
                                        <div className="flex flex-wrap gap-2 pt-1.5">
                                           {["第一场", "第二场", "第三场"].map(s => {
                                              const isSel = (newPaper.sessions || []).includes(s);
                                              return (
                                                 <span key={s} onClick={() => {
                                                    const cur = newPaper.sessions || [];
                                                    const next = isSel ? cur.filter(x => x !== s) : [...cur, s];
                                                    setNewPaper({...newPaper, sessions: next});
                                                 }} className={`px-3 py-1 text-xs font-black rounded border cursor-pointer transition-colors ${isSel ? 'bg-[#10A66A]/10 text-[#10A66A] border-[#10A66A]/30' : 'bg-white text-zinc-500 border-zinc-200 hover:border-[#10A66A]/30'}`}>{s}</span>
                                              );
                                           })}
                                        </div>
                                     </div>
                                  </div>

                               </div>
                               )}
                               
                               {paperEditTab === "组卷配置" && (
                               <div className="bg-white border border-[#10A66A]/20 rounded-2xl p-6 shadow-sm space-y-5 relative overflow-hidden">
                                  <div className="absolute top-0 left-0 w-1 h-full bg-[#10A66A]"></div>
                                  <div className="flex items-center justify-between">
                                     <div className="space-y-1">
                                        <h5 className="text-sm font-black text-zinc-800">大题结构配置</h5>
                                        <p className="text-[10px] text-zinc-500 font-bold">可为试卷配置多个大题，每个大题可设置题型、分值、题目数量和选题范围。</p>
                                     </div>
                                     {newPaper.type !== "实操试卷" ? (
                                        <select className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-black text-zinc-700 outline-none focus:border-[#10A66A] w-32" value={newPaper.composeMethod || "固定组卷"} onChange={e => setNewPaper({...newPaper, composeMethod: e.target.value as any})}>
                                           <option value="固定组卷">固定组卷</option>
                                           <option value="随机组卷">随机组卷</option>
                                        </select>
                                     ) : (
                                        <span className="bg-[#10A66A]/10 text-[#10A66A] px-2 py-1 rounded text-[10px] font-black shrink-0">实操试卷</span>
                                     )}
                                  </div>
                                  
                                  {editingSectionId ? (
                                    <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-xl space-y-4 animate-in fade-in duration-300">
                                       <h6 className="text-xs font-black text-zinc-800 border-b border-zinc-200 pb-2 mb-2">{editingSectionId === "new" ? "新增大题" : "编辑大题"}</h6>
                                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                          <div className="space-y-1 lg:col-span-2">
                                             <label className="text-[10px] font-black text-zinc-500">大题名称</label>
                                             <input type="text" className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:border-[#10A66A]" value={newSection.name || ""} onChange={e => setNewSection({...newSection, name: e.target.value})} placeholder="例如：第一大题：单选题" />
                                          </div>
                                          <div className="space-y-1">
                                             <label className="text-[10px] font-black text-zinc-500">大题题型</label>
                                             <select className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:border-[#10A66A]" value={newSection.type || "单选题"} onChange={e => setNewSection({...newSection, type: e.target.value as any})}>
                                                <option value="单选题">单选题</option>
                                                <option value="多选题">多选题</option>
                                                <option value="判断题">判断题</option>
                                                <option value="填空题">填空题</option>
                                                <option value="简答题">简答题</option>
                                                <option value="实操题">实操题</option>
                                                {newPaper.composeMethod === "固定组卷" && <option value="全部题型">混合题型</option>}
                                             </select>
                                          </div>
                                          {newPaper.composeMethod === "随机组卷" && (
                                             <>
                                             <div className="space-y-1">
                                                <label className="text-[10px] font-black text-zinc-500">题库</label>
                                                <select className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:border-[#10A66A]" value={newSection.randomBank || "全部题库"} onChange={e => setNewSection({...newSection, randomBank: e.target.value})}>
                                                   <option value="全部题库">全部题库</option>
                                                   <option value="物联网设备接入能力测评题库">物联网设备接入能力测评题库</option>
                                                   <option value="Linux基础命令题库">Linux基础命令题库</option>
                                                </select>
                                             </div>
                                             <div className="space-y-1">
                                                <label className="text-[10px] font-black text-zinc-500">难度</label>
                                                <select className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:border-[#10A66A]" value={newSection.randomDifficulty || "全部难度"} onChange={e => setNewSection({...newSection, randomDifficulty: e.target.value})}>
                                                   <option value="全部难度">全部难度</option>
                                                   <option value="简单">简单</option>
                                                   <option value="中等">中等</option>
                                                   <option value="困难">困难</option>
                                                </select>
                                             </div>
                                             <div className="space-y-1">
                                                <label className="text-[10px] font-black text-zinc-500">知识点</label>
                                                <select className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:border-[#10A66A]" value={newSection.randomKnowledge || "全部知识点"} onChange={e => setNewSection({...newSection, randomKnowledge: e.target.value})}>
                                                   <option value="全部知识点">全部知识点</option>
                                                   <option value="MQTT通信协议">MQTT通信协议</option>
                                                   <option value="设备接入">设备接入</option>
                                                </select>
                                             </div>
                                             </>
                                          )}
                                          <div className="space-y-1">
                                             <label className="text-[10px] font-black text-zinc-500">题目数量</label>
                                             <input type="number" min="1" className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:border-[#10A66A]" value={newSection.targetCount || 5} onChange={e => setNewSection({...newSection, targetCount: Number(e.target.value)})} />
                                          </div>
                                          <div className="space-y-1">
                                             <label className="text-[10px] font-black text-zinc-500">每题分值</label>
                                             <input type="number" min="1" className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:border-[#10A66A]" value={newSection.scorePerQuestion || 10} onChange={e => setNewSection({...newSection, scorePerQuestion: Number(e.target.value)})} />
                                          </div>
                                          <div className="space-y-1">
                                             <label className="text-[10px] font-black text-zinc-500">小计分值</label>
                                             <input type="text" className="w-full bg-zinc-100 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-bold text-[#10A66A] cursor-not-allowed" value={`${(newSection.targetCount || 0) * (newSection.scorePerQuestion || 0)} 分`} readOnly />
                                          </div>
                                       </div>
                                       <div className="space-y-1">
                                          <label className="text-[10px] font-black text-zinc-500">大题说明</label>
                                          <textarea className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:border-[#10A66A] h-12 resize-none" value={newSection.description || ""} onChange={e => setNewSection({...newSection, description: e.target.value})} placeholder="例如：本大题用于考察..." />
                                       </div>
                                       <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200">
                                          <button onClick={() => setEditingSectionId(null)} className="px-4 py-1.5 rounded-lg border border-zinc-200 text-zinc-500 text-xs font-black hover:bg-zinc-100 transition-colors">取消</button>
                                          <button onClick={() => {
                                             if (!newSection.name) { showToast("请输入大题名称"); return; }
                                             let updated = [...paperSections];
                                             if (editingSectionId === "new") {
                                                updated.push({ ...newSection, id: "sec_" + Date.now() } as PaperSection);
                                             } else {
                                                updated = updated.map(s => s.id === editingSectionId ? { ...s, ...newSection } as PaperSection : s);
                                             }
                                             setPaperSections(updated);
                                             setEditingSectionId(null);
                                          }} className="px-4 py-1.5 rounded-lg bg-[#10A66A] text-white text-xs font-black hover:bg-[#0e955f] transition-colors">保存大题</button>
                                       </div>
                                    </div>
                                  ) : (
                                     <button onClick={() => {
                                        setEditingSectionId("new");
                                        setNewSection({ type: "单选题", targetCount: 5, scorePerQuestion: 10, name: `第${["一","二","三","四","五","六"][paperSections.length] || ""}大题：单选题`, randomBank: "全部题库", randomDifficulty: "全部难度", randomKnowledge: "全部知识点" });
                                     }} className="bg-white border text-sm border-[#10A66A] text-[#10A66A] hover:bg-[#10A66A]/5 px-4 py-2 rounded-xl font-black transition-colors flex items-center gap-2 w-fit">
                                        <Plus className="w-4 h-4" /> 新增大题
                                     </button>
                                  )}

                                  <div className="border border-zinc-200 rounded-xl overflow-hidden mt-4">
                                     <table className="w-full text-left">
                                        <thead className="bg-[#F8FAF9] border-b border-zinc-200">
                                           <tr className="text-[10px] font-black text-zinc-400 uppercase tracking-widest whitespace-nowrap">
                                              <th className="p-3 pl-4 w-12">序号</th>
                                              <th className="p-3">大题名称</th>
                                              <th className="p-3">题型</th>
                                              <th className="p-3">随机范围</th>
                                              <th className="p-3 w-16">数量</th>
                                              <th className="p-3 w-16">每题分值</th>
                                              <th className="p-3 w-16">小计</th>
                                              <th className="p-3 w-16">已选题数</th>
                                              <th className="p-3 pr-4 text-right">操作</th>
                                           </tr>
                                        </thead>
                                        <tbody>
                                           {paperSections.length === 0 ? (
                                              <tr><td colSpan={9} className="p-6 text-center text-xs font-bold text-zinc-400">暂无大题，请新增。</td></tr>
                                           ) : paperSections.map((sec, idx) => {
                                              const subTotal = sec.targetCount * sec.scorePerQuestion;
                                              const pickedCnt = sec.questions?.length || 0;
                                              return (
                                              <tr key={sec.id} className="border-b border-zinc-100 text-xs font-bold text-zinc-700 hover:bg-zinc-50">
                                                 <td className="p-3 pl-4 text-zinc-400">{idx + 1}</td>
                                                 <td className="p-3 truncate max-w-[150px]" title={sec.name}>{sec.name}</td>
                                                 <td className="p-3 text-[#10A66A]">{sec.type}</td>
                                                 <td className="p-3 text-[10px] leading-tight text-zinc-500">
                                                    {newPaper.composeMethod === "随机组卷" ? (
                                                       <>
                                                       <div>{sec.randomBank}</div>
                                                       <div className="space-x-1"><span className="bg-zinc-100 px-1 rounded">{sec.randomDifficulty}</span><span className="bg-zinc-100 px-1 rounded">{sec.randomKnowledge}</span></div>
                                                       </>
                                                    ) : (
                                                       <span>-</span>
                                                    )}
                                                 </td>
                                                 <td className="p-3">{sec.targetCount}</td>
                                                 <td className="p-3">{sec.scorePerQuestion}分</td>
                                                 <td className="p-3 font-black text-[#10A66A]">{subTotal}分</td>
                                                 <td className="p-3">
                                                    {newPaper.composeMethod === "固定组卷" ? (
                                                       <span className={`px-2 py-0.5 rounded ${pickedCnt >= sec.targetCount ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                                                          {pickedCnt}/{sec.targetCount}
                                                       </span>
                                                    ) : (
                                                       <span className="text-zinc-400">-</span>
                                                    )}
                                                 </td>
                                                 <td className="p-3 pr-4 text-right space-x-2 whitespace-nowrap">
                                                    {newPaper.composeMethod === "固定组卷" && (
                                                       <button onClick={() => { setPickingForSectionId(sec.id); setPickerType(sec.type); setBatchSelectedQuestionIds([]); }} className="text-[#10A66A] hover:underline font-black">选择试题</button>
                                                    )}
                                                    <button onClick={() => { setEditingSectionId(sec.id); setNewSection(sec); }} className="text-[#10A66A] hover:underline">编辑</button>
                                                    <button onClick={() => setPaperSections(paperSections.filter(s => s.id !== sec.id))} className="text-red-500 hover:underline">删除</button>
                                                 </td>
                                              </tr>
                                              );
                                           })}
                                        </tbody>
                                     </table>
                                     <div className="bg-zinc-50 border-t border-zinc-200 p-3 flex justify-between items-center px-4">
                                        <div className="text-xs font-bold text-zinc-500 flex gap-4">
                                           <span>题目总数：<strong className="text-zinc-800">{paperSections.reduce((a, b) => a + b.targetCount, 0)} 道</strong></span>
                                           <span>试卷总分：<strong className="text-[#10A66A]">{paperSections.reduce((a, b) => a + (b.targetCount * b.scorePerQuestion), 0)} 分</strong></span>
                                        </div>
                                     </div>
                                  </div>
                               </div>
                               )}
                               
                               {paperEditTab === "组卷配置" && pickingForSectionId && (
                               <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm relative animate-in fade-in slide-in-from-bottom-4">
                                   <div className="flex justify-between items-center mb-6 border-b border-zinc-100 pb-4">
                                      <div>
                                         <h5 className="text-lg font-black text-zinc-900 flex items-center gap-2">选择试题</h5>
                                         <p className="text-xs text-zinc-500 font-bold mt-1">可按题库、题型、难度、知识点和试题内容进行筛选选题。</p>
                                      </div>
                                      <button onClick={() => setPickingForSectionId(null)} className="text-xs text-zinc-400 hover:text-zinc-600 font-black">关闭选题</button>
                                   </div>
                                   
                                   {(() => {
                                      const sec = paperSections.find(s => s.id === pickingForSectionId);
                                      if (!sec) return null;
                                      const pickedQ = sec.questions || [];
                                      const subTotal = sec.targetCount * sec.scorePerQuestion;
                                      
                                      const filteredForPicking = questions.filter(q => {
                                         const bankName = (q as any).bank || "物联网设备接入能力测评题库";
                                         if (pickerBank !== "全部题库" && pickerBank !== bankName) return false;
                                         if (pickerType !== "全部题型" && pickerType !== q.type) return false;
                                         if (pickerDifficulty !== "全部难度" && pickerDifficulty !== q.difficulty) return false;
                                         if (pickerKnowledge !== "全部知识点" && pickerKnowledge !== q.knowledgePoint) return false;
                                         if (pickerChapter !== "全部章节" && pickerChapter !== q.chapter) return false;
                                         if (pickerSearch.trim() && !q.content.includes(pickerSearch.trim()) && !q.knowledgePoint.includes(pickerSearch.trim()) && !(q.answer||"").includes(pickerSearch.trim())) return false;
                                         return true;
                                      });

                                      return (
                                        <>
                                        <div className="flex flex-wrap gap-4 mb-4 bg-zinc-50 p-4 rounded-xl border border-zinc-100 items-center">
                                           <span className="text-xs font-black text-zinc-500">当前大题：<strong className="text-zinc-900">{sec.name}</strong></span>
                                           <span className="text-xs font-black text-zinc-500">大题题型：<strong className="text-zinc-900">{sec.type}</strong></span>
                                           <span className="text-xs font-black text-zinc-500">目标题数：<strong className="text-zinc-900">{sec.targetCount} 道</strong></span>
                                           <span className="text-xs font-black text-zinc-500">已选题数：<strong className={`${pickedQ.length >= sec.targetCount ? "text-[#10A66A]" : "text-amber-600"}`}>{pickedQ.length} / {sec.targetCount}</strong></span>
                                           <span className="text-xs font-black text-zinc-500">每题分值：<strong className="text-zinc-900">{sec.scorePerQuestion} 分</strong></span>
                                           <span className="text-xs font-black text-zinc-500">小计分值：<strong className="text-zinc-900">{subTotal} 分</strong></span>
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-3 mb-4 bg-white p-4 rounded-xl border border-zinc-200">
                                            <select className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-[#10A66A]" value={pickerBank} onChange={e => setPickerBank(e.target.value)}>
                                               <option value="全部题库">全部题库</option>
                                               <option value="物联网设备接入能力测评题库">物联网设备接入能力测评题库</option>
                                               <option value="Linux基础命令题库">Linux基础命令题库</option>
                                               <option value="工业互联网应用题库">工业互联网应用题库</option>
                                            </select>
                                            <select className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-[#10A66A]" value={pickerType} onChange={e => setPickerType(e.target.value as any)}>
                                               <option value="全部题型">全部题型</option>
                                               <option value="单选题">单选题</option>
                                               <option value="多选题">多选题</option>
                                               <option value="判断题">判断题</option>
                                               <option value="填空题">填空题</option>
                                               <option value="简答题">简答题</option>
                                               <option value="实操题">实操题</option>
                                            </select>
                                            <select className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-[#10A66A]" value={pickerDifficulty} onChange={e => setPickerDifficulty(e.target.value)}>
                                               <option value="全部难度">全部难度</option>
                                               <option value="简单">简单</option>
                                               <option value="中等">中等</option>
                                               <option value="困难">困难</option>
                                            </select>
                                            <select className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-[#10A66A]" value={pickerKnowledge} onChange={e => setPickerKnowledge(e.target.value)}>
                                               <option value="全部知识点">全部知识点</option>
                                               <option value="MQTT通信协议">MQTT通信协议</option>
                                               <option value="设备接入">设备接入</option>
                                               <option value="物模型配置">物模型配置</option>
                                               <option value="数据采集">数据采集</option>
                                               <option value="平台应用">平台应用</option>
                                            </select>
                                            <select className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-[#10A66A]" value={pickerChapter} onChange={e => setPickerChapter(e.target.value)}>
                                               <option value="全部章节">全部章节</option>
                                               <option value="第1章 物联网系统认知">第1章 物联网系统认知</option>
                                               <option value="第2章 传感器与数据采集">第2章 传感器与数据采集</option>
                                               <option value="第3章 MQTT通信协议">第3章 MQTT通信协议</option>
                                               <option value="第4章 设备接入与数据上报">第4章 设备接入与数据上报</option>
                                               <option value="第5章 行业云平台应用">第5章 行业云平台应用</option>
                                            </select>
                                            <input type="text" className="flex-1 min-w-[300px] bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-[#10A66A]" value={pickerSearch} onChange={e => setPickerSearch(e.target.value)} placeholder="请输入试题内容关键词进行模糊搜索" />
                                            <button className="px-4 py-2 bg-[#10A66A] text-white rounded-lg text-xs font-black transition-colors">查询</button>
                                            <button onClick={() => { setPickerBank("全部题库"); setPickerType(sec.type); setPickerDifficulty("全部难度"); setPickerKnowledge("全部知识点"); setPickerChapter("全部章节"); setPickerSearch(""); setBatchSelectedQuestionIds([]); }} className="px-4 py-2 bg-zinc-100 text-zinc-600 rounded-lg text-xs font-black transition-colors hover:bg-zinc-200">重置</button>
                                        </div>
                                        
                                        <div className="flex justify-between items-end mb-2">
                                           <div className="text-xs font-bold text-zinc-500">
                                              {pickerSearch.trim() ? (
                                                 <span>关键词：<strong className="text-[#10A66A]">{pickerSearch.trim()}</strong>，当前筛选 <strong className="text-zinc-900">{filteredForPicking.length}</strong> 道</span>
                                              ) : (
                                                 <span>共 <strong className="text-zinc-900">{questions.length}</strong> 道试题，当前筛选 <strong className="text-zinc-900">{filteredForPicking.length}</strong> 道</span>
                                              )}
                                           </div>
                                           <div className="space-x-3">
                                              <button onClick={() => {
                                                  if (batchSelectedQuestionIds.length === 0) { showToast("请先勾选试题。"); return; }
                                                  const newQIds = [...pickedQ];
                                                  let typeMismatch = false;
                                                  let limitReached = false;
                                                  
                                                  for (const qid of batchSelectedQuestionIds) {
                                                     const qInfo = questions.find(x => x.id === qid);
                                                     if (!qInfo) continue;
                                                     if (newQIds.includes(qid)) continue;
                                                     
                                                     if (sec.type !== "全部题型" && sec.type !== qInfo.type) {
                                                        typeMismatch = true;
                                                        continue;
                                                     }
                                                     
                                                     if (newQIds.length >= sec.targetCount) {
                                                        limitReached = true;
                                                        break;
                                                     }
                                                     
                                                     newQIds.push(qid);
                                                  }
                                                  
                                                  if (newQIds.length === pickedQ.length) {
                                                     if (limitReached) {
                                                        showToast("当前大题已达到目标题数。");
                                                     } else if (typeMismatch) {
                                                        showToast("试题题型与当前大题不一致。");
                                                     } else {
                                                        showToast("试题已经全都在当前大题中了。");
                                                     }
                                                     return;
                                                  }
                                                  
                                                  setPaperSections(paperSections.map(s => s.id === sec.id ? { ...s, questions: newQIds } : s));
                                                  setBatchSelectedQuestionIds([]);
                                                  showToast("试题已加入当前大题。");
                                              }} className="px-4 py-2 bg-[#10A66A] text-white rounded-lg text-xs font-black hover:bg-[#0e955f] transition-colors inline-block">加入当前大题</button>
                                           </div>
                                        </div>
                                        
                                        <div className="border border-zinc-200 rounded-xl overflow-hidden max-h-96 overflow-y-auto">
                                            <table className="w-full text-left relative">
                                               <thead className="bg-[#F8FAF9] border-b border-zinc-200 sticky top-0 z-10">
                                                  <tr className="text-[10px] font-black text-zinc-400 uppercase tracking-widest whitespace-nowrap">
                                                     <th className="p-3 pl-4 w-12"><input type="checkbox" checked={filteredForPicking.length > 0 && batchSelectedQuestionIds.length === filteredForPicking.length} onChange={(e) => {
                                                        if (e.target.checked) {
                                                           setBatchSelectedQuestionIds(filteredForPicking.map(x => x.id));
                                                        } else {
                                                           setBatchSelectedQuestionIds([]);
                                                        }
                                                     }} className="accent-[#10A66A] cursor-pointer" /></th>
                                                     <th className="p-3 w-20">题型</th>
                                                     <th className="p-3">题干摘要</th>
                                                     <th className="p-3 w-16">难度</th>
                                                     <th className="p-3">知识点</th>
                                                     <th className="p-3">所属题库</th>
                                                     <th className="p-3">所属章节</th>
                                                     <th className="p-3 w-16">分值</th>
                                                     <th className="p-3 w-16">状态</th>
                                                     <th className="p-3 w-16 text-right pr-4">操作</th>
                                                  </tr>
                                               </thead>
                                               <tbody>
                                                  {filteredForPicking.length === 0 ? (
                                                     <tr><td colSpan={10} className="p-8 text-center text-xs font-bold text-zinc-400">暂无符合条件的试题。</td></tr>
                                                  ) : filteredForPicking.map(q => {
                                                     const isPicked = pickedQ.includes(q.id);
                                                     const isBatchSelected = batchSelectedQuestionIds.includes(q.id);
                                                     return (
                                                     <tr key={q.id} className={`border-b border-zinc-100 text-xs font-bold ${isPicked ? "bg-[#10A66A]/5" : "hover:bg-zinc-50 text-zinc-700"}`}>
                                                        <td className="p-3 pl-4">
                                                           {isPicked ? (
                                                              <span className="text-[10px] font-bold text-[#10A66A] bg-green-100 px-1.5 rounded">已选</span>
                                                           ) : (
                                                              <input type="checkbox" className="accent-[#10A66A] cursor-pointer" checked={isBatchSelected} onChange={(e) => {
                                                                 if (e.target.checked) setBatchSelectedQuestionIds([...batchSelectedQuestionIds, q.id]);
                                                                 else setBatchSelectedQuestionIds(batchSelectedQuestionIds.filter(id => id !== q.id));
                                                              }} />
                                                           )}
                                                        </td>
                                                        <td className="p-3 text-[#10A66A]">{q.type}</td>
                                                        <td className="p-3 truncate max-w-[200px]" title={q.content}>{q.content}</td>
                                                        <td className="p-3">{q.difficulty}</td>
                                                        <td className="p-3 truncate max-w-[100px] text-zinc-500">{q.knowledgePoint}</td>
                                                        <td className="p-3 truncate max-w-[120px] text-zinc-500">{(q as any).bank || "物联网设备接入能力测评题库"}</td>                                      <td className="p-3 truncate max-w-[100px] text-zinc-500">{q.chapter || "第3章 默认"}</td>
                                                        <td className="p-3 text-zinc-500">{q.score}分</td>
                                                        <td className="p-3 text-[#10A66A]">已启用</td>
                                                        <td className="p-3 pr-4 text-right">
                                                           <button className="text-[#10A66A] hover:underline">查看</button>
                                                        </td>
                                                     </tr>
                                                     );
                                                  })}
                                               </tbody>
                                            </table>
                                        </div>
                                        
                                        <div className="mt-8 border-t border-zinc-100 pt-6">
                                           <h6 className="text-sm font-black text-zinc-800 mb-4">当前大题已选试题</h6>
                                           <div className="border border-zinc-200 rounded-xl overflow-hidden">
                                            <table className="w-full text-left">
                                               <thead className="bg-[#F8FAF9] border-b border-zinc-200">
                                                  <tr className="text-[10px] font-black text-zinc-400 uppercase tracking-widest whitespace-nowrap">
                                                     <th className="p-3 pl-4 w-12">序号</th>
                                                     <th className="p-3 w-20">题型</th>
                                                     <th className="p-3">题干摘要</th>
                                                     <th className="p-3 w-16">分值</th>
                                                     <th className="p-3 w-16">难度</th>
                                                     <th className="p-3">知识点</th>
                                                     <th className="p-3 pr-4 w-16 text-right">操作</th>
                                                  </tr>
                                               </thead>
                                               <tbody>
                                                  {pickedQ.length === 0 ? (
                                                     <tr><td colSpan={7} className="p-6 text-center text-xs font-bold text-zinc-400">目前暂未选题</td></tr>
                                                  ) : pickedQ.map((qid, idx) => {
                                                     const q = questions.find(x => x.id === qid);
                                                     if (!q) return null;
                                                     return (
                                                     <tr key={q.id} className="border-b border-zinc-100 text-xs font-bold text-zinc-700 hover:bg-zinc-50">
                                                        <td className="p-3 pl-4 text-zinc-400">{idx + 1}</td>
                                                        <td className="p-3 text-[#10A66A]">{q.type}</td>
                                                        <td className="p-3 truncate max-w-[250px]" title={q.content}>{q.content}</td>
                                                        <td className="p-3 text-zinc-500">{sec.scorePerQuestion}分</td>
                                                        <td className="p-3">{q.difficulty}</td>
                                                        <td className="p-3 text-zinc-500">{q.knowledgePoint}</td>
                                                        <td className="p-3 pr-4 text-right">
                                                           <button onClick={() => {
                                                              setPaperSections(paperSections.map(s => s.id === sec.id ? { ...s, questions: (s.questions || []).filter(x => x !== q.id) } : s));
                                                           }} className="text-red-500 hover:text-red-700">移除</button>
                                                        </td>
                                                     </tr>
                                                     );
                                                  })}
                                               </tbody>
                                            </table>
                                           </div>
                                        </div>
                                        </>
                                      );
                                   })()}
                               </div>
                               )}
                               
                               {paperEditTab === "试卷预览" && (
                               <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm relative animate-in fade-in max-h-[800px] overflow-y-auto">
                                  <div className="text-center mb-8">
                                     <h2 className="text-2xl font-black text-zinc-900">{newPaper.name || "未命名试卷"}</h2>
                                     <p className="text-sm font-bold text-zinc-500 mt-2">
                                        考试类型：{newPaper.type} | 组卷方式：{newPaper.composeMethod} | 总分：{paperSections.reduce((acc, sec) => acc + (sec.targetCount * sec.scorePerQuestion), 0)}分 | 及格分：{newPaper.passScore || 60}分
                                     </p>
                                     <p className="text-xs font-bold text-zinc-400 mt-1 max-w-xl mx-auto">{newPaper.desc || "暂无试卷说明。"}</p>
                                  </div>
                                  
                                  {paperSections.length === 0 ? (
                                    <div className="text-center py-20 text-zinc-400 font-bold">请先在“组卷配置”中添加大题。</div>
                                  ) : (
                                    <div className="space-y-12">
                                       {paperSections.map((sec, i) => {
                                          let secQuestions = sec.questions?.map(qid => questions.find(x => x.id === qid)!) || [];
                                          if (newPaper.composeMethod === "随机组卷" || secQuestions.length === 0) {
                                             secQuestions = Array.from({ length: sec.targetCount }).map((_, dqIdx) => ({
                                               id: `mock-${sec.id}-${dqIdx}`,
                                               type: sec.type === "全部题型" ? "单选题" : sec.type,
                                               content: `这是系统自动根据题库、知识点、难度（${sec.randomDifficulty || '匹配'}）生成的第 ${dqIdx+1} 道模拟试题题干内容，以供预览。`,
                                               score: sec.scorePerQuestion,
                                               answer: "A",
                                               knowledgePoint: sec.randomKnowledge || "某随机知识点",
                                               difficulty: sec.randomDifficulty || "中等",
                                             } as unknown as Question));
                                          }

                                          return (
                                          <div key={sec.id} className="space-y-6">
                                             <div className="border-b-2 border-zinc-900 pb-2 flex items-baseline gap-4">
                                                <h3 className="text-lg font-black text-zinc-900">{['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'][i] || i + 1}、{sec.name}</h3>
                                                <span className="text-sm font-bold text-zinc-500">（共 {sec.targetCount} 题，每题 {sec.scorePerQuestion} 分，共 {sec.targetCount * sec.scorePerQuestion} 分）</span>
                                             </div>
                                             {sec.description && <p className="text-sm text-zinc-500 font-bold bg-zinc-50 p-3 rounded-lg">{sec.description}</p>}
                                             
                                             <div className="space-y-8 pl-2">
                                                {secQuestions.map((q, idx) => (
                                                  <div key={idx} className="space-y-3">
                                                     <div className="flex gap-2">
                                                        <span className="font-black text-zinc-900">{idx + 1}.</span>
                                                        <span className="text-xs font-bold bg-[#10A66A]/10 text-[#10A66A] px-1 lg:px-2 py-0.5 rounded shrink-0">{q.type}</span>
                                                        <p className="font-bold text-zinc-800 text-sm leading-relaxed">{q.content}</p>
                                                     </div>
                                                     {['单选题', '多选题'].includes(q.type) && (
                                                        <div className="pl-6 space-y-2">
                                                           {['选项 A 配置内容', '选项 B 配置内容', '选项 C 配置内容', '选项 D 配置内容'].map((opt, optIdx) => (
                                                              <div key={optIdx} className="flex items-center gap-2 text-sm font-bold text-zinc-600">
                                                                 <div className="w-5 h-5 rounded-full border border-zinc-300 flex items-center justify-center text-[10px] text-zinc-400">{String.fromCharCode(65 + optIdx)}</div>
                                                                 <span>{opt}</span>
                                                              </div>
                                                           ))}
                                                        </div>
                                                     )}
                                                     {q.type === '判断题' && (
                                                        <div className="pl-6 flex gap-4 text-sm font-bold text-zinc-600">
                                                           <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-full border border-zinc-300"></div>正确</div>
                                                           <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-full border border-zinc-300"></div>错误</div>
                                                        </div>
                                                     )}
                                                     <div className="pl-6 text-xs text-zinc-400 font-black pt-2">
                                                        标准答案：<span className="text-[#10A66A] mr-4">{q.answer || "C"}</span>
                                                        涉及知识点：<span className="text-zinc-500">{q.knowledgePoint || "综合测试"}</span>
                                                     </div>
                                                  </div>
                                                ))}
                                             </div>
                                          </div>
                                          );
                                       })}
                                    </div>
                                  )}
                               </div>
                               )}
                               
                               <div className="flex justify-end gap-3 pt-4">
                                  <button onClick={() => { setIsEditingPaper(false); setEditingPaperId(null); }} className="px-6 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-600 text-sm font-black hover:bg-zinc-50 transition-colors">取消</button>
                                  <button onClick={() => { setNewPaper({...newPaper, status: "草稿"}); setTimeout(savePaper, 10); }} className="px-6 py-2.5 rounded-xl border border-[#10A66A]/20 bg-[#10A66A]/10 text-[#10A66A] text-sm font-black hover:bg-[#10A66A]/20 transition-colors">保存为草稿</button>
                                  <button onClick={savePaper} className="px-6 py-2.5 rounded-xl bg-[#10A66A] text-white text-sm font-black hover:bg-[#0e955f] transition-colors shadow-sm">保存试卷</button>
                               </div>
                            </div>
                            
                            {/* Preview section */}
                            <div className="w-full xl:w-80 shrink-0">
                               <div className="sticky top-6 bg-zinc-50 border border-zinc-200 rounded-2xl p-6 shadow-sm">
                                  <h5 className="text-sm font-black text-zinc-900 mb-4 pb-4 border-b border-zinc-200">试卷预览</h5>
                                  {newPaper.type !== "实操试卷" ? (
                                    <div className="space-y-4">
                                       <div className="space-y-1">
                                          <span className="text-[10px] font-black text-zinc-400">试卷名称</span>
                                          <p className="text-sm font-bold text-zinc-800">{newPaper.name || "--"}</p>
                                       </div>
                                       <div className="flex justify-between">
                                          <div className="space-y-1">
                                            <span className="text-[10px] font-black text-zinc-400">试卷类型</span>
                                            <p className="text-xs font-bold text-zinc-800">{newPaper.type || "--"}</p>
                                          </div>
                                          <div className="space-y-1 text-right">
                                            <span className="text-[10px] font-black text-zinc-400">组卷方式</span>
                                            <p className="text-xs font-bold text-[#10A66A]">{newPaper.composeMethod || "--"}</p>
                                          </div>
                                       </div>
                                       <div className="flex justify-between pt-2 border-t border-zinc-100">
                                          <div className="space-y-1">
                                            <span className="text-[10px] font-black text-zinc-400">试卷总分</span>
                                            <p className="text-lg font-black text-zinc-900">{paperSections.reduce((acc, sec) => acc + (sec.targetCount * sec.scorePerQuestion), 0)}</p>
                                          </div>
                                          <div className="space-y-1 text-right">
                                            <span className="text-[10px] font-black text-zinc-400">及格分数</span>
                                            <p className="text-lg font-black text-zinc-900">{newPaper.passScore || 0}</p>
                                          </div>
                                       </div>
                                       <div className="space-y-1 pt-2 border-t border-zinc-100">
                                          <span className="text-[10px] font-black text-zinc-400">题目数量</span>
                                          <p className="text-sm font-black text-zinc-800">{paperSections.reduce((acc, sec) => acc + sec.targetCount, 0)} 道</p>
                                       </div>
                                       <div className="space-y-1 bg-white p-3 rounded-lg border border-zinc-100 mt-2 max-h-48 overflow-y-auto">
                                          <span className="text-[10px] font-black text-zinc-400">大题结构</span>
                                          {paperSections.length === 0 ? (
                                             <p className="text-xs font-bold text-zinc-400 mt-1">暂无大题配置</p>
                                          ) : (
                                             <div className="mt-2 space-y-2">
                                                {paperSections.map((sec, i) => (
                                                   <div key={sec.id} className="text-xs flex justify-between items-center text-zinc-600">
                                                      <span className="truncate max-w-[120px]" title={sec.name}>{i + 1}. {sec.name}</span>
                                                      <span className="font-bold shrink-0">
                                                         {newPaper.composeMethod === "固定组卷" ? `已选 ${sec.questions?.length || 0} / ${sec.targetCount}` : `${sec.targetCount} 道`} ｜ {sec.targetCount * sec.scorePerQuestion} 分
                                                      </span>
                                                   </div>
                                                ))}
                                             </div>
                                          )}
                                       </div>
                                       {paperSections.length > 0 && (
                                          <div className="pt-2">
                                             <button onClick={() => setPaperEditTab("试卷预览")} className="w-full bg-[#10A66A]/10 text-[#10A66A] hover:bg-[#10A66A]/20 py-2 rounded-lg text-xs font-black transition-colors">生成完整预览</button>
                                          </div>
                                       )}
                                    </div>
                                  ) : (
                                    <div className="space-y-4">
                                       <div className="space-y-1">
                                          <span className="text-[10px] font-black text-zinc-400">试卷名称</span>
                                          <p className="text-sm font-bold text-zinc-800">{newPaper.name || "--"}</p>
                                       </div>
                                       <div className="flex justify-between">
                                          <div className="space-y-1">
                                            <span className="text-[10px] font-black text-zinc-400">试卷类型</span>
                                            <p className="text-xs font-bold text-zinc-800">{newPaper.type || "--"}</p>
                                          </div>
                                          <div className="space-y-1 text-right">
                                            <span className="text-[10px] font-black text-zinc-400">评分方式</span>
                                            <p className="text-xs font-bold text-[#10A66A]">{newPaper.scoreMethod || "混合评分"}</p>
                                          </div>
                                       </div>
                                       <div className="flex justify-between pt-2 border-t border-zinc-100">
                                          <div className="space-y-1">
                                            <span className="text-[10px] font-black text-zinc-400">试卷总分</span>
                                            <p className="text-lg font-black text-zinc-900">{newPaper.totalScore || 0}</p>
                                          </div>
                                          <div className="space-y-1 text-right">
                                            <span className="text-[10px] font-black text-zinc-400">及格分数</span>
                                            <p className="text-lg font-black text-zinc-900">{newPaper.passScore || 0}</p>
                                          </div>
                                       </div>
                                       <div className="space-y-1 pt-2 border-t border-zinc-100">
                                          <span className="text-[10px] font-black text-zinc-400">实验环境</span>
                                          <p className="text-sm font-bold text-zinc-800">{newPaper.env || "工程虚拟仿真"}</p>
                                       </div>
                                       <div className="space-y-1 pt-2">
                                          <span className="text-[10px] font-black text-zinc-400">评分项数量</span>
                                          <p className="text-sm font-bold text-zinc-800">{newPaper.questionCount || 5} 项</p>
                                       </div>
                                    </div>
                                  )}
                               </div>
                            </div>
                         </div>
                      </div>
                   ) : (
                      <div className="animate-in fade-in duration-300">
                         {/* Filter Bar */}
                         <div className="flex flex-col xl:flex-row gap-4 mb-6 justify-between items-start xl:items-center bg-zinc-50 p-2 rounded-xl border border-zinc-100">
                            <div className="flex flex-wrap gap-2 items-center w-full xl:w-auto p-1">
                               <input type="text" placeholder="请输入试卷名称" className="w-[180px] bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-bold focus:border-[#10A66A] outline-none placeholder:text-zinc-400" value={paperFilterName} onChange={e => setPaperFilterName(e.target.value)} />
                               <select className="w-[120px] bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-bold text-zinc-600 outline-none focus:border-[#10A66A]" value={paperFilterType} onChange={e => setPaperFilterType(e.target.value)}>
                                  <option value="全部">全部类型</option>
                                  <option value="理论试卷">理论试卷</option>
                                  <option value="实操试卷">实操试卷</option>
                               </select>
                               <select className="w-[140px] bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-bold text-zinc-600 outline-none focus:border-[#10A66A]" value={paperFilterMethod} onChange={e => setPaperFilterMethod(e.target.value)}>
                                  <option value="全部">全部组卷方式</option>
                                  <option value="固定组卷">固定组卷</option>
                                  <option value="随机组卷">随机组卷</option>
                                  <option value="实操任务组卷">实操任务组卷</option>
                               </select>
                               <select className="w-[120px] bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-bold text-zinc-600 outline-none focus:border-[#10A66A]" value={paperFilterStatus} onChange={e => setPaperFilterStatus(e.target.value)}>
                                  <option value="全部">全部状态</option>
                                  <option value="已启用">已启用</option>
                                  <option value="已停用">已停用</option>
                                  <option value="草稿">草稿</option>
                               </select>
                               <div className="flex items-center gap-1 ml-1 border-l border-zinc-200 pl-3">
                                  <button className="bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 px-4 py-1.5 rounded-lg text-xs font-black transition-colors shadow-sm">查询</button>
                                  <button className="text-zinc-500 hover:text-zinc-800 px-3 py-1.5 text-xs font-bold" onClick={() => { setPaperFilterName(""); setPaperFilterType("全部"); setPaperFilterMethod("全部"); setPaperFilterStatus("全部"); }}>重置</button>
                               </div>
                            </div>
                            <button onClick={handleCreatePaper} className="bg-[#10A66A] hover:bg-[#0e955f] text-white px-5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-sm shrink-0 mx-2 mb-2 xl:mx-0 xl:mb-0">
                               <Plus className="w-4 h-4" /> 新增试卷
                            </button>
                         </div>
                         
                         {/* Papers Table */}
                         <div className="border border-zinc-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                            <table className="w-full text-left">
                               <thead className="bg-[#F8FAF9] border-b border-zinc-200">
                                  <tr className="text-[10px] font-black text-zinc-400 uppercase tracking-widest whitespace-nowrap">
                                     <th className="p-4 pl-6">试卷名称</th>
                                     <th className="p-4 w-24">试卷类型</th>
                                     <th className="p-4 w-28">组卷方式</th>
                                     <th className="p-4 w-20">题数/项</th>
                                     <th className="p-4 w-24">总分/及格</th>
                                     <th className="p-4 w-32">关联考试场次</th>
                                     <th className="p-4 w-24">状态</th>
                                     <th className="p-4 w-32">创建时间</th>
                                     <th className="p-4 pr-6 text-right w-40">操作</th>
                                  </tr>
                               </thead>
                               <tbody>
                                  {filteredPapers.length === 0 ? (
                                    <tr>
                                       <td colSpan={9} className="p-8 text-center text-sm font-bold text-zinc-400">暂无符合条件的试卷。</td>
                                    </tr>
                                  ) : (
                                    filteredPapers.map(p => (
                                     <tr key={p.id} className="border-b border-zinc-50 text-xs font-bold text-zinc-700 hover:bg-zinc-50/50 transition-colors">
                                        <td className="p-4 pl-6 font-black text-zinc-900">{p.name}</td>
                                        <td className="p-4">{p.type}</td>
                                        <td className="p-4"><span className="bg-zinc-100 text-zinc-600 px-2 py-1 rounded text-[10px]">{p.composeMethod}</span></td>
                                        <td className="p-4">{p.questionCount} {p.type === "理论试卷" ? "道" : "项"}</td>
                                        <td className="p-4">
                                           <div className="flex flex-col gap-0.5">
                                              <span className="text-[#10A66A] font-black">{p.totalScore}分</span>
                                              <span className="text-[10px] text-zinc-400">及格 {p.passScore}</span>
                                           </div>
                                        </td>
                                        <td className="p-4 text-[10px] text-zinc-500 truncate max-w-[120px]">{p.sessions && p.sessions.length > 0 ? p.sessions.join("、") : "未关联"}</td>
                                        <td className="p-4">
                                          <span className={`px-2 py-1 rounded text-[10px] font-black ${
                                            p.status === "已启用" ? "bg-[#EAF8F1] text-[#10A66A]" : 
                                            p.status === "已停用" ? "bg-zinc-100 text-zinc-400" :
                                            "bg-zinc-50 border border-zinc-200 text-zinc-500"
                                          }`}>{p.status}</span>
                                        </td>
                                        <td className="p-4 text-zinc-400 font-normal">{p.createTime}</td>
                                        <td className="p-4 pr-6 text-right space-x-3 whitespace-nowrap">
                                           <button onClick={() => handleEditPaper(p)} className="text-[#10A66A] hover:underline font-black">查看</button>
                                           <button onClick={() => handleEditPaper(p)} className="text-[#10A66A] hover:underline font-black">编辑</button>
                                           <button onClick={() => copyPaper(p)} className="text-blue-500 hover:underline font-black">复制</button>
                                           <button onClick={() => togglePaperStatus(p, p.status === "已启用" ? "已停用" : "已启用")} className={`hover:underline font-black ${p.status === "已启用" ? "text-zinc-500" : "text-[#10A66A]"}`}>
                                              {p.status === "已启用" ? "停用" : "启用"}
                                           </button>
                                        </td>
                                     </tr>
                                    ))
                                  )}
                               </tbody>
                            </table>
                         </div>
                      </div>
                   )}

                </div>
             </div>
             )}

        {/* Modal for Viewing Question Detail */}
        {viewQuestionId && viewQuestion && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
              <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                 <div className="p-6 border-b border-zinc-100 flex items-center justify-between shrink-0">
                    <h3 className="text-xl font-black text-zinc-900 flex items-center gap-2">
                       <FileText className="w-5 h-5 text-[#10A66A]" />
                       试题详情
                    </h3>
                    <button onClick={() => setViewQuestionId(null)} className="text-zinc-400 hover:text-zinc-600 transition-colors p-2 hover:bg-zinc-100 rounded-full">
                       <X className="w-5 h-5" />
                    </button>
                 </div>
                 
                 <div className="p-8 space-y-6 overflow-y-auto">
                    <div className="flex flex-wrap gap-2 mb-2">
                       <span className="px-3 py-1 rounded bg-[#EAF8F1] text-[#10A66A] text-xs font-black">{viewQuestion.type}</span>
                       <span className={`px-3 py-1 rounded text-xs font-black ${
                          viewQuestion.difficulty === "简单" ? "bg-green-50 text-green-600" :
                          viewQuestion.difficulty === "中等" ? "bg-blue-50 text-blue-600" :
                          "bg-orange-50 text-orange-600"
                        }`}>{viewQuestion.difficulty}</span>
                       <span className="px-3 py-1 rounded bg-zinc-100 text-zinc-600 text-xs font-black">{viewQuestion.score} 分</span>
                       <span className={`px-3 py-1 rounded text-xs font-black ${viewQuestion.status === "已启用" ? "text-green-600 bg-green-50" : "text-zinc-500 bg-zinc-100"}`}>{viewQuestion.status}</span>
                    </div>

                    <div className="space-y-2">
                       <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">题干</h4>
                       <div className="text-sm font-bold text-zinc-800 bg-zinc-50 p-4 rounded-xl leading-relaxed whitespace-pre-wrap">{viewQuestion.content}</div>
                    </div>

                    {(viewQuestion.type === "单选题" || viewQuestion.type === "多选题") && (
                       <div className="space-y-2">
                          <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">选项</h4>
                          <div className="bg-white border border-zinc-200 rounded-xl divide-y divide-zinc-100">
                             {['A. Publisher', 'B. Subscriber', 'C. Broker', 'D. Topic'].map((opt, i) => (
                               <div key={i} className="px-4 py-3 text-sm font-bold text-zinc-700">{opt}</div>
                             ))}
                          </div>
                          <p className="text-[10px] text-zinc-400 pl-1 mt-1">*注：选项内容为演示数据</p>
                       </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">正确答案</h4>
                          <div className="text-sm font-black text-[#10A66A] bg-[#EAF8F1] p-3 rounded-xl border border-[#10A66A]/20">{viewQuestion.answer}</div>
                       </div>
                       <div className="space-y-2">
                          <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">试题解析</h4>
                          <div className="text-sm border border-zinc-200 text-zinc-600 bg-white p-3 rounded-xl">{viewQuestion.type === '单选题' ? 'Broker负责接收发布者消息并转发给订阅者。' : '参考相关知识点解析。'}</div>
                       </div>
                       <div className="space-y-2">
                          <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">知识点</h4>
                          <div className="text-sm font-bold text-zinc-700 bg-zinc-50 p-3 rounded-xl border border-zinc-200">{viewQuestion.knowledgePoint}</div>
                       </div>
                       <div className="space-y-2">
                          <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">所属章节</h4>
                          <div className="text-sm font-bold text-zinc-700 bg-zinc-50 p-3 rounded-xl border border-zinc-200">{viewQuestion.chapter}</div>
                       </div>
                    </div>

                 </div>
                 
                 <div className="p-6 border-t border-zinc-100 shrink-0 flex justify-end">
                    <button 
                      onClick={() => setViewQuestionId(null)}
                      className="px-8 py-3 bg-[#10A66A] text-white font-black rounded-xl hover:bg-[#0e955d] transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
                    >
                       关闭
                    </button>
                 </div>
              </div>
           </div>
        )}

        {/* Modal for Adding/Editing Session */}
        {showSessionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
             <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                   <h3 className="text-lg font-black text-zinc-900">{editingSessionId ? "场次基础设置" : "新增考试场次"}</h3>
                   <button 
                     onClick={() => { setShowSessionModal(false); setEditingSessionId(null); }}
                     className="p-2 hover:bg-zinc-50 rounded-full transition-colors cursor-pointer"
                   >
                      <X className="w-5 h-5 text-zinc-400" />
                   </button>
                </div>
                <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
                   
                   <div className="flex items-center gap-2 mb-2 p-3 bg-[#EAF8F1] rounded-xl border border-[#CFEFE0]">
                      <Info className="w-4 h-4 text-[#10A66A]" />
                      <p className="text-[10px] text-zinc-500 font-bold">
                        配置场次的基础参数、参考范围及通过标准，保存后将自动更新考试整体时间。
                      </p>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5 md:col-span-2">
                         <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">场次名称</label>
                         <input 
                           type="text" 
                           placeholder="第一场"
                           className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm font-black outline-none focus:bg-white focus:border-[#10A66A] transition-all"
                           value={newSession.name}
                           onChange={e => setNewSession({...newSession, name: e.target.value})}
                         />
                      </div>

                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">开始时间</label>
                         <input 
                           type="text" 
                           placeholder="2026-06-10 09:00"
                           className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-xs font-mono font-bold outline-none focus:bg-white focus:border-[#10A66A] transition-all"
                           value={newSession.startTime}
                           onChange={e => {
                             const val = e.target.value;
                             const dur = calculateDuration(val, newSession.endTime || "");
                             setNewSession({...newSession, startTime: val, duration: dur > 0 ? dur : newSession.duration});
                           }}
                         />
                      </div>

                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">结束时间</label>
                         <input 
                           type="text" 
                           placeholder="2026-06-10 11:00"
                           className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-xs font-mono font-bold outline-none focus:bg-white focus:border-[#10A66A] transition-all"
                           value={newSession.endTime}
                           onChange={e => {
                             const val = e.target.value;
                             const dur = calculateDuration(newSession.startTime || "", val);
                             setNewSession({...newSession, endTime: val, duration: dur > 0 ? dur : newSession.duration});
                           }}
                         />
                      </div>

                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">
                            考试时长 <span className="text-zinc-300 font-medium lowercase">(分钟)</span>
                         </label>
                         <div className="relative">
                            <input 
                              type="number" 
                              className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm font-black outline-none focus:bg-white focus:border-[#10A66A] transition-all"
                              value={newSession.duration}
                              onChange={e => setNewSession({...newSession, duration: parseInt(e.target.value) || 0})}
                            />
                            <Clock className="w-4 h-4 text-zinc-300 absolute right-4 top-1/2 -translate-y-1/2" />
                         </div>
                      </div>

                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">
                            限考次数 <span className="text-zinc-300 font-medium lowercase">(次)</span>
                         </label>
                         <div className="space-y-1">
                            <input 
                              type="number" 
                              className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm font-black outline-none focus:bg-white focus:border-[#10A66A] transition-all"
                              value={newSession.allowedAttempts}
                              onChange={e => setNewSession({...newSession, allowedAttempts: parseInt(e.target.value) || 0})}
                            />
                            <p className="text-[9px] text-zinc-400 font-bold pl-1">学生在本场次中最多可参加考试的次数。</p>
                         </div>
                      </div>

                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">
                            及格分数 <span className="text-zinc-300 font-medium lowercase">(分)</span>
                         </label>
                         <div className="space-y-1">
                            <input 
                              type="number" 
                              className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm font-black outline-none focus:bg-white focus:border-[#10A66A] transition-all"
                              value={newSession.passingScore}
                              onChange={e => setNewSession({...newSession, passingScore: parseInt(e.target.value) || 0})}
                            />
                            <p className="text-[9px] text-zinc-400 font-bold pl-1">成绩达到及格分数后，视为本场次考试通过。</p>
                         </div>
                      </div>

                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">考试地点 / 方式</label>
                         <select 
                           className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm font-black outline-none focus:bg-white focus:border-[#10A66A] transition-all appearance-none cursor-pointer"
                           value={newSession.location}
                           onChange={e => setNewSession({...newSession, location: e.target.value})}
                         >
                            <option value="线上考试环境">线上考试环境</option>
                            <option value="线下机房">线下机房</option>
                            <option value="混合考试">混合考试</option>
                         </select>
                      </div>

                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">参考班级</label>
                         <select 
                           className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm font-black outline-none focus:bg-white focus:border-[#10A66A] transition-all appearance-none cursor-pointer"
                           value={newSession.targetClass}
                           onChange={e => setNewSession({...newSession, targetClass: e.target.value})}
                         >
                            <option value="物联网2301班">物联网2301班</option>
                            <option value="物联网2302班">物联网2302班</option>
                            <option value="工业互联网2301班">工业互联网2301班</option>
                            <option value="人工智能2301班">人工智能2301班</option>
                         </select>
                      </div>

                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">参考人数</label>
                         <input 
                           type="number" 
                           className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm font-black outline-none focus:bg-white focus:border-[#10A66A] transition-all"
                           value={newSession.studentCount}
                           onChange={e => setNewSession({...newSession, studentCount: parseInt(e.target.value) || 0})}
                         />
                      </div>

                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">场次状态</label>
                         <select 
                           className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm font-black outline-none focus:bg-white focus:border-[#10A66A] transition-all appearance-none cursor-pointer"
                           value={newSession.status}
                           onChange={e => setNewSession({...newSession, status: e.target.value as any})}
                         >
                            <option value="未开始">未开始</option>
                            <option value="进行中">进行中</option>
                            <option value="已结束">已结束</option>
                         </select>
                      </div>
                   </div>

                   {/* Anti-Cheat Config Section */}
                   <div className="mt-8 pt-8 border-t border-zinc-100 grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6 flex-1">
                         <div>
                           <h4 className="text-[14px] font-black text-zinc-900 mb-1 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#10A66A]"/> 防作弊设置</h4>
                           <p className="text-[10px] text-zinc-500 font-bold">配置当前考试场次的切屏限制、复制粘贴限制、考试时间控制和考试次数限制。</p>
                         </div>

                         <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                               <div className="space-y-1">
                                  <span className="text-xs font-black text-zinc-800 block">禁止屏幕切换</span>
                                  <p className="text-[10px] text-zinc-500 font-bold">开启后，学生切换浏览器标签页、最小化窗口或离开考试页面时将被记录。</p>
                               </div>
                               <button 
                                 onClick={() => {
                                    if(newSession.antiCheatConfig) setNewSession({...newSession, antiCheatConfig: {...newSession.antiCheatConfig, preventSwitch: !newSession.antiCheatConfig.preventSwitch}});
                                 }}
                                 className={`w-12 h-6 rounded-full transition-colors relative ${newSession.antiCheatConfig?.preventSwitch ? "bg-[#10A66A]" : "bg-zinc-200"}`}>
                                 <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${newSession.antiCheatConfig?.preventSwitch ? "left-6" : "left-1"}`} />
                               </button>
                            </div>

                            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 space-y-2">
                               <div className="flex items-center gap-2">
                                  <label className="text-xs font-black text-zinc-800 w-24">允许切屏次数</label>
                                  <input 
                                     type="number"
                                     value={newSession.antiCheatConfig?.maxSwitch || 2}
                                     onChange={e => {
                                        if(newSession.antiCheatConfig) setNewSession({...newSession, antiCheatConfig: {...newSession.antiCheatConfig, maxSwitch: parseInt(e.target.value) || 0}});
                                     }}
                                     className="w-20 bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-xs font-black outline-none focus:border-[#10A66A]"
                                  />
                               </div>
                               <p className="text-[10px] text-zinc-500 font-bold">超过允许次数后，系统将标记考试异常。</p>
                            </div>

                            <div className="flex gap-4">
                               <div className="flex-1 flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                                 <span className="text-xs font-black text-zinc-800">禁止复制</span>
                                 <button 
                                   onClick={() => {
                                      if(newSession.antiCheatConfig) setNewSession({...newSession, antiCheatConfig: {...newSession.antiCheatConfig, preventCopy: !newSession.antiCheatConfig.preventCopy}});
                                   }}
                                   className={`w-10 h-5 rounded-full transition-colors relative ${newSession.antiCheatConfig?.preventCopy ? "bg-[#10A66A]" : "bg-zinc-200"}`}>
                                   <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${newSession.antiCheatConfig?.preventCopy ? "left-5" : "left-0.5"}`} />
                                 </button>
                               </div>
                               <div className="flex-1 flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                                 <span className="text-xs font-black text-zinc-800">禁止粘贴</span>
                                 <button 
                                   onClick={() => {
                                      if(newSession.antiCheatConfig) setNewSession({...newSession, antiCheatConfig: {...newSession.antiCheatConfig, preventPaste: !newSession.antiCheatConfig.preventPaste}});
                                   }}
                                   className={`w-10 h-5 rounded-full transition-colors relative ${newSession.antiCheatConfig?.preventPaste ? "bg-[#10A66A]" : "bg-zinc-200"}`}>
                                   <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${newSession.antiCheatConfig?.preventPaste ? "left-5" : "left-0.5"}`} />
                                 </button>
                               </div>
                            </div>
                            
                            <div className="flex gap-4">
                               <div className="flex-1 flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                                 <span className="text-xs font-black text-zinc-800">禁止右键菜单</span>
                                 <button 
                                   onClick={() => {
                                      if(newSession.antiCheatConfig) setNewSession({...newSession, antiCheatConfig: {...newSession.antiCheatConfig, preventRightClick: !newSession.antiCheatConfig.preventRightClick}});
                                   }}
                                   className={`w-10 h-5 rounded-full transition-colors relative ${newSession.antiCheatConfig?.preventRightClick ? "bg-[#10A66A]" : "bg-zinc-200"}`}>
                                   <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${newSession.antiCheatConfig?.preventRightClick ? "left-5" : "left-0.5"}`} />
                                 </button>
                               </div>
                               <div className="flex-1 flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                                 <span className="text-xs font-black text-zinc-800">强制全屏考试</span>
                                 <button 
                                   onClick={() => {
                                      if(newSession.antiCheatConfig) setNewSession({...newSession, antiCheatConfig: {...newSession.antiCheatConfig, forceFullScreen: !newSession.antiCheatConfig.forceFullScreen}});
                                   }}
                                   className={`w-10 h-5 rounded-full transition-colors relative ${newSession.antiCheatConfig?.forceFullScreen ? "bg-[#10A66A]" : "bg-zinc-200"}`}>
                                   <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${newSession.antiCheatConfig?.forceFullScreen ? "left-5" : "left-0.5"}`} />
                                 </button>
                               </div>
                            </div>

                            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 space-y-3">
                               <div className="flex items-center gap-2">
                                  <label className="text-[10px] font-black text-zinc-400 w-20">考试时长 (分钟)</label>
                                  <input 
                                     type="number"
                                     value={newSession.duration} 
                                     disabled
                                     className="w-full bg-zinc-100 text-zinc-500 border border-zinc-200 rounded-lg px-2 py-1.5 text-xs font-black cursor-not-allowed"
                                  />
                               </div>
                               <div className="flex items-center gap-2">
                                  <label className="text-[10px] font-black text-zinc-400 w-20">进入考试范围</label>
                                  <input 
                                     type="text"
                                     value={`${newSession.startTime} - ${newSession.endTime}`}
                                     disabled
                                     className="w-full bg-zinc-100 text-zinc-500 border border-zinc-200 rounded-lg px-2 py-1.5 text-[10px] font-mono font-black cursor-not-allowed"
                                  />
                               </div>
                               <div className="flex items-center gap-2">
                                  <label className="text-[10px] font-black text-zinc-400 w-20">限考次数</label>
                                  <input 
                                     type="number"
                                     value={newSession.allowedAttempts}
                                     disabled
                                     className="w-full bg-zinc-100 text-zinc-500 border border-zinc-200 rounded-lg px-2 py-1.5 text-xs font-black cursor-not-allowed"
                                  />
                               </div>
                            </div>

                            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 space-y-2">
                               <label className="text-xs font-black text-zinc-800">超时处理</label>
                               <select 
                                 value={newSession.antiCheatConfig?.timeoutAction}
                                 onChange={e => {
                                   if(newSession.antiCheatConfig) setNewSession({...newSession, antiCheatConfig: {...newSession.antiCheatConfig, timeoutAction: e.target.value as any}});
                                 }}
                                 className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-black outline-none focus:border-[#10A66A]">
                                 <option value="自动交卷">自动交卷</option>
                                 <option value="禁止继续作答">禁止继续作答</option>
                                 <option value="标记异常后允许提交">标记异常后允许提交</option>
                               </select>
                            </div>
                         </div>
                      </div>

                      <div className="flex-1 bg-[#F8FAF9] rounded-2xl p-5 border border-zinc-200 shadow-3xs h-fit sticky top-0">
                         <h4 className="text-sm font-black text-zinc-900 mb-4 pb-3 border-b border-zinc-200">规则预览</h4>
                         <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-xs font-bold text-zinc-600"><span className="text-zinc-500">当前场次：</span> <span className="text-zinc-900 font-black">{newSession.name || "未命名场次"}</span></div>
                            <div className="flex justify-between text-xs font-bold text-zinc-600"><span className="text-zinc-500">禁止屏幕切换：</span> <span className="text-zinc-900 font-black">{newSession.antiCheatConfig?.preventSwitch ? "已开启" : "未开启"}</span></div>
                            <div className="flex justify-between text-xs font-bold text-zinc-600"><span className="text-zinc-500">允许切屏次数：</span> <span className="text-zinc-900 font-black">{newSession.antiCheatConfig?.maxSwitch} 次</span></div>
                            <div className="flex justify-between text-xs font-bold text-zinc-600"><span className="text-zinc-500">禁止复制：</span> <span className="text-zinc-900 font-black">{newSession.antiCheatConfig?.preventCopy ? "已开启" : "未开启"}</span></div>
                            <div className="flex justify-between text-xs font-bold text-zinc-600"><span className="text-zinc-500">禁止粘贴：</span> <span className="text-zinc-900 font-black">{newSession.antiCheatConfig?.preventPaste ? "已开启" : "未开启"}</span></div>
                            <div className="flex justify-between text-xs font-bold text-zinc-600"><span className="text-zinc-500">禁止右键菜单：</span> <span className="text-zinc-900 font-black">{newSession.antiCheatConfig?.preventRightClick ? "已开启" : "未开启"}</span></div>
                            <div className="flex justify-between text-xs font-bold text-zinc-600"><span className="text-zinc-500">考试时长：</span> <span className="text-zinc-900 font-black">{newSession.duration} 分钟</span></div>
                            <div className="flex justify-between text-xs font-bold text-zinc-600"><span className="text-zinc-500">限考次数：</span> <span className="text-zinc-900 font-black">{newSession.allowedAttempts} 次</span></div>
                            <div className="flex justify-between text-xs font-bold text-zinc-600"><span className="text-zinc-500">超时处理：</span> <span className="text-zinc-900 font-black">{newSession.antiCheatConfig?.timeoutAction}</span></div>
                         </div>
                         <div className="bg-[#EAF8F1] border border-[#CFEFE0] p-3 rounded-lg flex gap-2">
                           <Info className="w-4 h-4 text-[#10A66A] shrink-0" />
                           <p className="text-[10px] text-[#10A66A] font-bold">学生考试过程中触发切屏、复制、粘贴等行为时，系统将记录异常行为并同步到考试监控。</p>
                         </div>
                      </div>
                   </div>

                </div>
                <div className="p-6 bg-zinc-50/50 flex gap-3 border-t border-zinc-100">
                   <button 
                     onClick={() => { setShowSessionModal(false); setEditingSessionId(null); }}
                     className="flex-1 py-3 bg-white border border-zinc-200 text-zinc-500 text-sm font-black rounded-xl hover:bg-zinc-50 transition-all cursor-pointer"
                   >
                      取消
                   </button>
                   <button 
                     onClick={handleAddSession}
                     className="flex-1 py-3 bg-[#10A66A] text-white text-sm font-black rounded-xl shadow-lg shadow-emerald-500/10 active:scale-95 transition-all font-black cursor-pointer"
                   >
                      保存场次
                   </button>
                </div>
             </div>
          </div>
        )}

        {/* Modal for Marking Settings */}
        {showMarkingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
             <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                   <div>
                      <h3 className="text-lg font-black text-zinc-900">场次阅卷设置</h3>
                      <p className="text-[10px] text-zinc-400 font-bold mt-0.5">配置当前考试场次的批阅类型、审阅规则、阅卷方式和阅卷人员。</p>
                   </div>
                   <button 
                     onClick={() => setShowMarkingModal(false)}
                     className="p-2 hover:bg-zinc-100 rounded-full transition-colors cursor-pointer"
                   >
                      <X className="w-5 h-5 text-zinc-400" />
                   </button>
                </div>
                
                <div className="p-0 flex h-[70vh]">
                   {/* Left Side: Configuration */}
                   <div className="flex-1 overflow-y-auto p-8 space-y-8 border-r border-zinc-100">
                      
                      {/* Session Info Summary */}
                      <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 grid grid-cols-2 gap-4">
                         <div className="space-y-0.5">
                            <span className="text-[9px] text-zinc-400 font-black uppercase">考试名称</span>
                            <span className="text-xs font-black text-zinc-800 block">{editingExam?.name}</span>
                         </div>
                         <div className="space-y-0.5">
                            <span className="text-[9px] text-zinc-400 font-black uppercase">场次名称</span>
                            <span className="text-xs font-black text-zinc-800 block">
                               {editingExam?.sessions.find(s => s.id === markingSessionId)?.name}
                            </span>
                         </div>
                         <div className="space-y-0.5">
                            <span className="text-[9px] text-zinc-400 font-black uppercase">参考班级</span>
                            <span className="text-xs font-black text-zinc-800 block">
                               {editingExam?.sessions.find(s => s.id === markingSessionId)?.targetClass}
                            </span>
                         </div>
                         <div className="space-y-0.5">
                            <span className="text-[9px] text-zinc-400 font-black uppercase">参考人数</span>
                            <span className="text-xs font-black text-zinc-800 block">
                               {editingExam?.sessions.find(s => s.id === markingSessionId)?.studentCount} 人
                            </span>
                         </div>
                      </div>

                      {/* 1. Marking Type */}
                      <div className="space-y-4">
                         <h4 className="text-sm font-black text-zinc-900 flex items-center gap-2">
                            <CheckSquare className="w-4 h-4 text-[#10A66A]" />
                            批阅类型设置
                         </h4>
                         <div className="grid grid-cols-3 gap-3">
                            {(["系统批阅", "人工批阅", "混合批阅"] as const).map(type => (
                              <button
                                key={type}
                                onClick={() => {
                                  let updatedSettings = { ...markingSettings, markingType: type };
                                  if (type === "系统批阅") {
                                    updatedSettings = { 
                                       ...updatedSettings, 
                                       markingMethod: "系统自动判分" as const,
                                       personnel: { ...updatedSettings.personnel, mainMarkers: [] }
                                    };
                                  } else if (markingSettings.markingMethod === "系统自动判分") {
                                    updatedSettings = { ...updatedSettings, markingMethod: "按题目分配" as const };
                                  }
                                  setMarkingSettings(updatedSettings);
                                }}
                                className={`p-4 rounded-xl border text-left transition-all ${
                                  markingSettings.markingType === type 
                                    ? "bg-[#EAF8F1] border-[#10A66A] shadow-sm" 
                                    : "bg-white border-zinc-100 hover:border-zinc-200"
                                }`}
                              >
                                 <div className={`w-3.5 h-3.5 rounded-full border-2 mb-2 flex items-center justify-center ${
                                   markingSettings.markingType === type ? "border-[#10A66A] bg-white" : "border-zinc-200"
                                 }`}>
                                    {markingSettings.markingType === type && <div className="w-1.5 h-1.5 rounded-full bg-[#10A66A]" />}
                                 </div>
                                 <span className={`text-xs font-black block ${markingSettings.markingType === type ? "text-[#10A66A]" : "text-zinc-700"}`}>
                                    {type}
                                 </span>
                                 <p className="text-[9px] text-zinc-400 font-bold mt-1 leading-tight">
                                    {type === "系统批阅" && "客观题由系统自动判分"}
                                    {type === "人工批阅" && "全部题目由教师人工评分"}
                                    {type === "混合批阅" && "客观题系统阅，主观题人阅"}
                                 </p>
                              </button>
                            ))}
                         </div>
                      </div>

                      {/* 2. Audit Config */}
                      <div className="space-y-4">
                         <h4 className="text-sm font-black text-zinc-900 flex items-center gap-2">
                            <Settings className="w-4 h-4 text-[#10A66A]" />
                            审阅配置
                         </h4>
                         <div className="grid grid-cols-2 gap-x-8 gap-y-4 bg-zinc-50/50 p-6 rounded-2xl border border-zinc-100">
                            <div className="flex items-center justify-between">
                               <div className="space-y-0.5">
                                  <span className="text-xs font-black text-zinc-700">开启复核</span>
                                  <p className="text-[9px] text-zinc-400 font-bold">设置是否需要复核阅卷结果</p>
                               </div>
                               <button 
                                 onClick={() => setMarkingSettings({
                                   ...markingSettings, 
                                   auditMode: { ...markingSettings.auditMode, enableReview: !markingSettings.auditMode.enableReview }
                                 })}
                                 className={`w-9 h-5 rounded-full transition-colors relative ${markingSettings.auditMode.enableReview ? "bg-[#10A66A]" : "bg-zinc-200"}`}
                               >
                                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${markingSettings.auditMode.enableReview ? "left-5" : "left-1"}`} />
                               </button>
                            </div>

                            <div className={`flex items-center justify-between transition-opacity ${!markingSettings.auditMode.enableReview ? "opacity-30 pointer-events-none" : ""}`}>
                               <div className="space-y-0.5">
                                  <span className="text-xs font-black text-zinc-700">复核比例 (%)</span>
                                  <p className="text-[9px] text-zinc-400 font-bold">设定复核的样本百分比</p>
                               </div>
                               <input 
                                 type="number" 
                                 className="w-20 bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-black outline-none focus:border-[#10A66A]"
                                 value={markingSettings.auditMode.reviewRatio}
                                 onChange={e => setMarkingSettings({
                                   ...markingSettings, 
                                   auditMode: { ...markingSettings.auditMode, reviewRatio: parseInt(e.target.value) || 0 }
                                 })}
                               />
                            </div>

                            <div className="flex items-center justify-between">
                               <div className="space-y-0.5">
                                  <span className="text-xs font-black text-zinc-700">异常卷审阅</span>
                                  <p className="text-[9px] text-zinc-400 font-bold">开启分差超过阈值的强制审阅</p>
                               </div>
                               <button 
                                 onClick={() => setMarkingSettings({
                                   ...markingSettings, 
                                   auditMode: { ...markingSettings.auditMode, enableAbnormalAudit: !markingSettings.auditMode.enableAbnormalAudit }
                                 })}
                                 className={`w-9 h-5 rounded-full transition-colors relative ${markingSettings.auditMode.enableAbnormalAudit ? "bg-[#10A66A]" : "bg-zinc-200"}`}
                               >
                                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${markingSettings.auditMode.enableAbnormalAudit ? "left-5" : "left-1"}`} />
                               </button>
                            </div>

                            <div className="flex items-center justify-between">
                               <div className="space-y-0.5">
                                  <span className="text-xs font-black text-zinc-700">发布前审核</span>
                                  <p className="text-[9px] text-zinc-400 font-bold">成绩发布前需人工终审</p>
                               </div>
                               <button 
                                 onClick={() => setMarkingSettings({
                                   ...markingSettings, 
                                   auditMode: { ...markingSettings.auditMode, requireAuditBeforeRelease: !markingSettings.auditMode.requireAuditBeforeRelease }
                                 })}
                                 className={`w-9 h-5 rounded-full transition-colors relative ${markingSettings.auditMode.requireAuditBeforeRelease ? "bg-[#10A66A]" : "bg-zinc-200"}`}
                               >
                                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${markingSettings.auditMode.requireAuditBeforeRelease ? "left-5" : "left-1"}`} />
                               </button>
                            </div>

                            <div className="flex items-center justify-between">
                               <div className="space-y-0.5">
                                  <span className="text-xs font-black text-zinc-700">匿名阅卷</span>
                                  <p className="text-[9px] text-zinc-400 font-bold">阅卷时隐藏学生姓名信息</p>
                               </div>
                               <button 
                                 onClick={() => setMarkingSettings({
                                   ...markingSettings, 
                                   auditMode: { ...markingSettings.auditMode, hideStudentInfo: !markingSettings.auditMode.hideStudentInfo }
                                 })}
                                 className={`w-9 h-5 rounded-full transition-colors relative ${markingSettings.auditMode.hideStudentInfo ? "bg-[#10A66A]" : "bg-zinc-200"}`}
                               >
                                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${markingSettings.auditMode.hideStudentInfo ? "left-5" : "left-1"}`} />
                               </button>
                            </div>

                            <div className={`flex items-center justify-between transition-opacity ${!markingSettings.auditMode.enableAbnormalAudit ? "opacity-30 pointer-events-none" : ""}`}>
                               <div className="space-y-0.5">
                                  <span className="text-xs font-black text-zinc-700">异常分差阈值</span>
                                  <p className="text-[9px] text-zinc-400 font-bold">超过此分差标记为异常卷</p>
                               </div>
                               <div className="flex items-center gap-1.5">
                                  <input 
                                    type="number" 
                                    className="w-20 bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-black outline-none focus:border-[#10A66A]"
                                    value={markingSettings.auditMode.abnormalThreshold}
                                    onChange={e => setMarkingSettings({
                                      ...markingSettings, 
                                      auditMode: { ...markingSettings.auditMode, abnormalThreshold: parseInt(e.target.value) || 0 }
                                    })}
                                  />
                                  <span className="text-[10px] text-zinc-400 font-bold">分</span>
                               </div>
                            </div>
                         </div>
                      </div>

                      {/* 3. Marking Method */}
                      <div className="space-y-4">
                         <h4 className="text-sm font-black text-zinc-900 flex items-center gap-2">
                            <Layout className="w-4 h-4 text-[#10A66A]" />
                            阅卷方式
                         </h4>
                         <div className="grid grid-cols-2 gap-3">
                            {(["按整卷分配", "按题目分配", "按班级分配", "按场次分配", "系统自动判分"] as const).map(method => {
                               const isDisabled = markingSettings.markingType === "系统批阅" && method !== "系统自动判分";
                               const isMethodDisabled = markingSettings.markingType !== "系统批阅" && method === "系统自动判分";
                               return (
                                 <button
                                   key={method}
                                   disabled={isDisabled || isMethodDisabled}
                                   onClick={() => setMarkingSettings({ ...markingSettings, markingMethod: method })}
                                   className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 ${
                                     markingSettings.markingMethod === method 
                                       ? "bg-[#EAF8F1] border-[#10A66A] text-[#10A66A]" 
                                       : (isDisabled || isMethodDisabled)
                                          ? "bg-zinc-50 border-zinc-50 text-zinc-300 cursor-not-allowed"
                                          : "bg-white border-zinc-100 hover:border-zinc-200 text-zinc-600"
                                   }`}
                                 >
                                    <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                      markingSettings.markingMethod === method ? "border-[#10A66A] bg-white" : "border-zinc-200"
                                    }`}>
                                       {markingSettings.markingMethod === method && <div className="w-1.5 h-1.5 rounded-full bg-[#10A66A]" />}
                                    </div>
                                    <span className="text-xs font-black">{method}</span>
                                 </button>
                               );
                            })}
                         </div>
                      </div>

                      {/* 4. Personnel */}
                      <div className="space-y-4">
                         <h4 className="text-sm font-black text-zinc-900 flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-[#10A66A]" />
                            阅卷人员
                         </h4>
                         <div className={`space-y-5 bg-zinc-50/50 p-6 rounded-2xl border border-zinc-100 transition-opacity ${markingSettings.markingType === "系统批阅" ? "opacity-30 pointer-events-none" : ""}`}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">主阅卷教师 (多选)</label>
                                  <div className="flex flex-wrap gap-2">
                                     {["教师1", "教师2", "教师3", "教师4"].map(teacher => {
                                       const isSelected = markingSettings.personnel.mainMarkers.includes(teacher);
                                       return (
                                         <button
                                           key={teacher}
                                           onClick={() => {
                                             const current = markingSettings.personnel.mainMarkers;
                                             const next = isSelected ? current.filter(t => t !== teacher) : [...current, teacher];
                                             setMarkingSettings({
                                               ...markingSettings,
                                               personnel: { ...markingSettings.personnel, mainMarkers: next }
                                             });
                                           }}
                                           className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all border ${
                                             isSelected 
                                               ? "bg-[#10A66A] border-[#10A66A] text-white" 
                                               : "bg-white border-zinc-200 text-zinc-500 hover:border-[#10A66A]"
                                           }`}
                                         >
                                            {teacher}
                                         </button>
                                       );
                                     })}
                                  </div>
                               </div>

                               <div className="space-y-2">
                                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">复核教师 (多选)</label>
                                  <div className="flex flex-wrap gap-2">
                                     {["教师1", "教师2", "教师3", "教师4"].map(teacher => {
                                       const isSelected = markingSettings.personnel.reviewMarkers.includes(teacher);
                                       return (
                                         <button
                                           key={teacher}
                                           onClick={() => {
                                             const current = markingSettings.personnel.reviewMarkers;
                                             const next = isSelected ? current.filter(t => t !== teacher) : [...current, teacher];
                                             setMarkingSettings({
                                               ...markingSettings,
                                               personnel: { ...markingSettings.personnel, reviewMarkers: next }
                                             });
                                           }}
                                           className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all border ${
                                             isSelected 
                                               ? "bg-amber-100 border-amber-300 text-amber-700" 
                                               : "bg-white border-zinc-200 text-zinc-500 hover:border-amber-300"
                                           }`}
                                         >
                                            {teacher}
                                         </button>
                                       );
                                     })}
                                  </div>
                               </div>

                               <div className="space-y-2">
                                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">仲裁教师 (单选)</label>
                                  <select 
                                    className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2 text-xs font-black outline-none focus:border-[#10A66A]"
                                    value={markingSettings.personnel.arbitrationMarker}
                                    onChange={e => setMarkingSettings({
                                      ...markingSettings,
                                      personnel: { ...markingSettings.personnel, arbitrationMarker: e.target.value }
                                    })}
                                  >
                                     <option value="">未设置</option>
                                     <option value="教师1">教师1</option>
                                     <option value="教师2">教师2</option>
                                     <option value="教师3">教师3</option>
                                     <option value="教师4">教师4</option>
                                  </select>
                               </div>

                               <div className="space-y-2">
                                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">任务分配说明</label>
                                  <textarea 
                                    className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2 text-xs font-bold text-zinc-600 outline-none focus:border-[#10A66A] resize-none h-12"
                                    value={markingSettings.personnel.taskInstruction}
                                    onChange={e => setMarkingSettings({
                                      ...markingSettings,
                                      personnel: { ...markingSettings.personnel, taskInstruction: e.target.value }
                                    })}
                                    placeholder="客观题由系统自动批阅，主观题按题目分配给主阅卷教师..."
                                  />
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Right Side: Preview Summary */}
                   <div className="w-[320px] bg-[#F8FAF9] p-8 flex flex-col justify-between">
                      <div className="space-y-6">
                         <div className="flex items-center gap-2 border-b border-zinc-200 pb-4">
                            <ClipboardList className="w-5 h-5 text-[#10A66A]" />
                            <h5 className="text-sm font-black text-zinc-900 tracking-tight">阅卷设置预览</h5>
                         </div>

                         <div className="space-y-5">
                            <div className="space-y-0.5">
                               <span className="text-[9px] text-zinc-400 font-black uppercase">场次</span>
                               <span className="text-xs font-black text-[#10A66A] block">
                                  {editingExam?.sessions.find(s => s.id === markingSessionId)?.name}
                               </span>
                            </div>
                            <div className="space-y-0.5">
                               <span className="text-[9px] text-zinc-400 font-black uppercase">批阅类型</span>
                               <span className="text-xs font-black text-[#10A66A] block">{markingSettings.markingType}</span>
                            </div>
                            <div className="space-y-0.5">
                               <span className="text-[9px] text-zinc-400 font-black uppercase">阅卷方式</span>
                               <span className="text-xs font-black text-[#10A66A] block">{markingSettings.markingMethod}</span>
                            </div>
                            <div className="space-y-0.5">
                               <span className="text-[9px] text-zinc-400 font-black uppercase">审阅配置摘要</span>
                               <p className="text-[10px] text-zinc-600 font-bold leading-relaxed">
                                  {markingSettings.auditMode.enableReview ? `开启复核 (${markingSettings.auditMode.reviewRatio}%)` : "关闭常规复核"}，
                                  {markingSettings.auditMode.enableAbnormalAudit ? "开启异常卷审阅" : "禁用异常审阅"}，
                                  {markingSettings.auditMode.requireAuditBeforeRelease ? "成绩发布前审核" : "成绩直接发布"}，
                                  {markingSettings.auditMode.hideStudentInfo ? "开启匿名阅卷" : "明面阅卷"}。
                               </p>
                            </div>
                            <div className="space-y-0.5">
                               <span className="text-[9px] text-zinc-400 font-black uppercase">阅卷团队</span>
                               <div className="space-y-1 mt-1">
                                  <div className="text-[10px] flex justify-between">
                                     <span className="text-zinc-500 font-bold">主阅教师：</span>
                                     <span className="text-zinc-900 font-black">
                                        {markingSettings.markingType === "系统批阅" ? "无需人工" : markingSettings.personnel.mainMarkers.join(",") || "未分配"}
                                     </span>
                                  </div>
                                  <div className="text-[10px] flex justify-between">
                                     <span className="text-zinc-500 font-bold">复核教师：</span>
                                     <span className="text-zinc-900 font-black">
                                        {markingSettings.personnel.reviewMarkers.join(",") || "未分配"}
                                     </span>
                                  </div>
                                  <div className="text-[10px] flex justify-between">
                                     <span className="text-zinc-500 font-bold">仲裁教师：</span>
                                     <span className="text-zinc-900 font-black">{markingSettings.personnel.arbitrationMarker || "未分配"}</span>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>

                      <div className="space-y-3">
                         <button 
                           onClick={handleSaveMarkingSettings}
                           className="w-full py-3 bg-[#10A66A] text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                         >
                            <Save className="w-4 h-4" />
                            保存阅卷设置
                         </button>
                         <button 
                           onClick={() => setShowMarkingModal(false)}
                           className="w-full py-3 bg-white border border-zinc-200 text-zinc-500 text-xs font-black rounded-xl hover:bg-zinc-50 transition-all cursor-pointer"
                         >
                            取消
                         </button>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
}
