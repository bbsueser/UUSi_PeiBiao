// @ts-nocheck
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from "react";
import { UserSession, ActiveTab } from "../types";
import { 
  BookOpen, 
  Clock, 
  Users, 
  CheckCircle2, 
  ChevronRight, 
  ChevronDown, 
  ArrowLeft, 
  Send, 
  FileText, 
  ListTodo, 
  Layers, 
  Inbox, 
  ClipboardCheck, 
  CheckSquare, 
  Square, 
  Search, 
  HelpCircle,
  Calendar,
  Sparkles,
  Info,
  User,
  FileSpreadsheet
} from "lucide-react";

interface TaskAssignmentProps {
  session: UserSession;
  onTabChange: (tab: ActiveTab) => void;
}

// Sub-menus state within TaskAssignment
type SubTab = 
  | "my_courses"
  | "assign" 
  | "manage" 
  | "stats" 
  | "chapters" 
  | "classes" 
  | "my_teaching_overview" 
  | "my_teaching_tasks" 
  | "my_teaching_students" 
  | "my_teaching_duration";

interface ChapterNode {
  id: string;
  label: string;
  children?: ChapterNode[];
}

export default function TaskAssignment({ session, onTabChange }: TaskAssignmentProps) {
  function canReturnTask(row: any) {
    return row.archiveStatus !== "已归档" && row.status === "已完成";
  }

  const [activeSubTab, setActiveSubTab] = useState<SubTab>(() => {
    const saved = localStorage.getItem("teacher_active_subtab");
    if (saved) {
      localStorage.removeItem("teacher_active_subtab");
      return saved as SubTab;
    }
    return "my_courses";
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [taskName, setTaskName] = useState<string>("物联网设备接入实验任务");
  const [taskType, setTaskType] = useState<string>("实验实训");
  const [selectedCourse, setSelectedCourse] = useState<string>("物联网设备开发实战");
  const [duration, setDuration] = useState<number>(120);
  const [durationUnit, setDurationUnit] = useState<string>("分钟");
  const [deadline, setDeadline] = useState<string>("2026-06-10 18:00");
  const [taskDesc, setTaskDesc] = useState<string>(
    "请完成行业云平台中的设备创建、物模型配置和传感器数据上报实验，并提交实验报告。"
  );

  // Success screen state
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Task Filters State
  const [searchTaskName, setSearchTaskName] = useState<string>("");
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>("全部课程");
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("全部班级");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("全部状态");
  const [startDateFilter, setStartDateFilter] = useState<string>("");
  const [endDateFilter, setEndDateFilter] = useState<string>("");

  // Global Dynamic Stats
  const [pendingGradingCount, setPendingGradingCount] = useState<number>(26);

  // ==================== NEW: MY TEACHING MODULE STATICS & STATES ====================
  const [teachingTasks, setTeachingTasks] = useState([
    {
      id: "tt-1",
      name: "物联网设备接入实验任务",
      course: "物联网设备开发实战",
      chapter: "第4章 设备接入与数据上报",
      className: "物联网2301班",
      assignedCount: 42,
      completions: 36,
      avgDuration: 118,
      maxDuration: 146,
      minDuration: 82,
      deadline: "2026-06-10 18:00",
      taskDurationLimit: 120, // 120 mins limit
      students: [
        { id: "s-1", name: "学生1", sno: "20230101", className: "物联网2301班", status: "已完成" as const, startTime: "2026-06-09 14:20", submitTime: "2026-06-09 16:18", duration: 118, isOvertime: false, score: 92, reportStatus: "已提交", comment: "实验流程完整，设备接入和数据上报结果正确。" },
        { id: "s-2", name: "学生2", sno: "20230102", className: "物联网2301班", status: "已完成" as const, startTime: "2026-06-09 14:10", submitTime: "2026-06-09 16:36", duration: 146, isOvertime: true, score: 89, reportStatus: "已提交", comment: "实验整体步骤正确，但物理通道物模型上报偶有延迟，导致连接重试过多，设备端系统耗时偏长，建议后续优化。" },
        { id: "s-3", name: "张三", sno: "20230103", className: "物联网2301班", status: "进行中" as const, startTime: "2026-06-09 15:00", submitTime: "未提交", duration: 78, isOvertime: false, score: "--", reportStatus: "未提交", comment: "实验正在积极连线调试中。" },
        { id: "s-4", name: "学生4", sno: "20230104", className: "物联网2301班", status: "已完成" as const, startTime: "2026-06-09 13:40", submitTime: "2026-06-09 15:02", duration: 82, isOvertime: false, score: 95, reportStatus: "已提交", comment: "实验理解透彻，系统响应迅速，报告编写详实条理。" },
        { id: "s-5", name: "学生5", sno: "20230105", className: "物联网2301班", status: "未开始" as const, startTime: "--", submitTime: "--", duration: 0, isOvertime: false, score: "--", reportStatus: "未提交", comment: "该学生暂未点击启动实训工作区。" }
      ]
    },
    {
      id: "tt-2",
      name: "MQTT通信协议章节学习",
      course: "物联网设备开发实战",
      chapter: "第3章 MQTT通信协议",
      className: "物联网2301班",
      assignedCount: 42,
      completions: 42,
      avgDuration: 65,
      maxDuration: 88,
      minDuration: 52,
      deadline: "2026-06-05 12:00",
      taskDurationLimit: 90,
      students: [
        { id: "s-11", name: "学生1", sno: "20230101", className: "物联网2301班", status: "已完成" as const, startTime: "2026-06-04 10:10", submitTime: "2026-06-04 11:15", duration: 65, isOvertime: false, score: 90, reportStatus: "已提交", comment: "对MQTT订阅推送机制理解深刻。" },
        { id: "s-12", name: "学生2", sno: "20230102", className: "物联网2301班", status: "已完成" as const, startTime: "2026-06-04 10:00", submitTime: "2026-06-04 11:28", duration: 88, isOvertime: false, score: 85, reportStatus: "已提交", comment: "完整测试了QoS等级机制。" },
        { id: "s-13", name: "张三", sno: "20230103", className: "物联网2301班", status: "已完成" as const, startTime: "2026-06-04 10:15", submitTime: "2026-06-04 11:10", duration: 55, isOvertime: false, score: 91, reportStatus: "已提交", comment: "实验报告格式严谨。" },
        { id: "s-14", name: "学生4", sno: "20230104", className: "物联网2301班", status: "已完成" as const, startTime: "2026-06-04 10:05", submitTime: "2026-06-04 10:57", duration: 52, isOvertime: false, score: 93, reportStatus: "已提交", comment: "逻辑流畅，完成了所有挑战选做题。" },
        { id: "s-15", name: "学生5", sno: "20230105", className: "物联网2301班", status: "已完成" as const, startTime: "2026-06-04 10:20", submitTime: "2026-06-04 11:30", duration: 70, isOvertime: false, score: 88, reportStatus: "已提交", comment: "自主连线调试成果良好。" }
      ]
    },
    {
      id: "tt-3",
      name: "Linux基础命令练习",
      course: "Linux操作系统",
      chapter: "第2章 常用命令",
      className: "工业互联网2301班",
      assignedCount: 36,
      completions: 28,
      avgDuration: 92,
      maxDuration: 115,
      minDuration: 62,
      deadline: "2026-06-08 15:00",
      taskDurationLimit: 60,
      students: [
        { id: "s-21", name: "张三", sno: "20230201", className: "工业互联网2301班", status: "已完成" as const, startTime: "2026-06-07 14:00", submitTime: "2026-06-07 15:32", duration: 92, isOvertime: true, score: 90, reportStatus: "已提交", comment: "Linux虚拟命令行指令运行正常。" },
        { id: "s-22", name: "李四", sno: "20230202", className: "工业互联网2301班", status: "已完成" as const, startTime: "2026-06-07 14:05", submitTime: "2026-06-07 16:00", duration: 115, isOvertime: true, score: 86, reportStatus: "已提交", comment: "文件权限和网卡配置操作耗时长。" },
        { id: "s-23", name: "王五", sno: "20230203", className: "工业互联网2301班", status: "进行中" as const, startTime: "2026-06-07 14:15", submitTime: "未提交", duration: 40, isOvertime: false, score: "--", reportStatus: "未提交", comment: "Shell脚本编辑中。" },
        { id: "s-24", name: "赵六", sno: "20230204", className: "工业互联网2301班", status: "已完成" as const, startTime: "2026-06-07 13:50", submitTime: "2026-06-07 14:52", duration: 62, isOvertime: true, score: 94, reportStatus: "已提交", comment: "命令流畅，掌握很好。" },
        { id: "s-25", name: "朱七", sno: "20230205", className: "工业互联网2301班", status: "未开始" as const, startTime: "--", submitTime: "--", duration: 0, isOvertime: false, score: "--", reportStatus: "未提交", comment: "尚未开始做此实验。" }
      ]
    },
    {
      id: "tt-4",
      name: "行业云平台数据上报实验",
      course: "工业互联网应用开发",
      chapter: "第5章 数据上报与可视化",
      className: "工业互联网2301班",
      assignedCount: 36,
      completions: 32,
      avgDuration: 124,
      maxDuration: 152,
      minDuration: 95,
      deadline: "2026-06-12 18:00",
      taskDurationLimit: 150,
      students: [
        { id: "s-31", name: "小明", sno: "20230301", className: "工业互联网2301班", status: "已完成" as const, startTime: "2026-06-09 10:00", submitTime: "2026-06-09 12:04", duration: 124, isOvertime: false, score: 91, reportStatus: "已提交", comment: "云端看板数据可视化图例配置正确。" },
        { id: "s-32", name: "小红", sno: "20230302", className: "工业互联网2301班", status: "已完成" as const, startTime: "2026-06-09 10:10", submitTime: "2026-06-09 12:42", duration: 152, isOvertime: true, score: 87, reportStatus: "已提交", comment: "网关注册花费时间偏多，但最后完成了连通性测试。" },
        { id: "s-33", name: "小刚", sno: "20230303", className: "工业互联网2301班", status: "进行中" as const, startTime: "2026-06-09 10:20", submitTime: "未提交", duration: 90, isOvertime: false, score: "--", reportStatus: "未提交", comment: "正在对接工业API参数。" },
        { id: "s-34", name: "小亮", sno: "20230304", className: "工业互联网2301班", status: "已完成" as const, startTime: "2026-06-09 09:40", submitTime: "2026-06-09 11:15", duration: 95, isOvertime: false, score: 96, reportStatus: "已提交", comment: "接口逻辑清晰，耗时极短，效率高。" },
        { id: "s-35", name: "小兰", sno: "20230305", className: "工业互联网2301班", status: "未开始" as const, startTime: "--", submitTime: "--", duration: 0, isOvertime: false, score: "--", reportStatus: "未提交", comment: "尚未开始做此实验。" }
      ]
    }
  ]);

  const [teachingCourseFilter, setTeachingCourseFilter] = useState("全部课程");
  const [teachingTaskNameFilter, setTeachingTaskNameFilter] = useState("");
  const [teachingClassFilter, setTeachingClassFilter] = useState("全部班级");
  const [teachingStatusFilter, setTeachingStatusFilter] = useState("全部状态");
  const [teachingStartDate, setTeachingStartDate] = useState("");
  const [teachingEndDate, setTeachingEndDate] = useState("");
  const [selectedTeachingTaskId, setSelectedTeachingTaskId] = useState("tt-1");
  const [selectedTeachingStudent, setSelectedTeachingStudent] = useState<any | null>(null);

  const filteredTeachingTasks = useMemo(() => {
    return teachingTasks.filter(task => {
      if (teachingTaskNameFilter && !task.name.toLowerCase().includes(teachingTaskNameFilter.toLowerCase())) {
        return false;
      }
      if (teachingCourseFilter !== "全部课程" && task.course !== teachingCourseFilter) {
        return false;
      }
      if (teachingClassFilter !== "全部班级" && task.className !== teachingClassFilter) {
        return false;
      }
      if (teachingStatusFilter !== "全部状态") {
        if (teachingStatusFilter === "已完成" && task.completions < task.assignedCount) return false;
        if (teachingStatusFilter === "进行中" && task.completions === task.assignedCount) return false;
      }
      return true;
    });
  }, [teachingTasks, teachingTaskNameFilter, teachingCourseFilter, teachingClassFilter, teachingStatusFilter]);

  const selectedTeachingTask = useMemo(() => {
    return teachingTasks.find(t => t.id === selectedTeachingTaskId) || teachingTasks[0];
  }, [teachingTasks, selectedTeachingTaskId]);
  // ==================== END OF NEW STATICS & STATES ====================

  // Dynamic interactive data for tasks list with nested student submissions
  const [tasksState, setTasksState] = useState([
    {
      id: "task-rec-1",
      name: "物联网设备接入实验任务",
      course: "物联网设备开发实战",
      chapter: "第4章 设备接入与数据上报",
      className: "物联网2301班",
      deadline: "2026-06-10 18:00",
      duration: "120分钟",
      status: "进行中",
      assignedCount: 42,
      completions: 36,
      completedList: [
        { id: "stu-1", name: "学生1", sno: "20230101", className: "物联网2301班", status: "已完成" as const, duration: "118分钟", remainingTime: "0分钟", submitTime: "2026-06-09 16:20", reportStatus: "已提交" as const, score: 92, gradeStatus: "已评分" as const, archiveStatus: "未归档" as const, returnReason: "", addedTimeLimit: 0 },
        { id: "stu-2", name: "学生2", sno: "20230102", className: "物联网2301班", status: "已完成" as const, duration: "126分钟", remainingTime: "0分钟", submitTime: "2026-06-09 17:05", reportStatus: "已提交" as const, score: "待评分" as const, gradeStatus: "未评分" as const, archiveStatus: "未归档" as const, returnReason: "", addedTimeLimit: 0 },
        { id: "stu-3", name: "学生3", sno: "20230103", className: "物联网2301班", status: "进行中" as const, duration: "78分钟", remainingTime: "42分钟", submitTime: "未提交", reportStatus: "未提交" as const, score: "--" as const, gradeStatus: "未评分" as const, archiveStatus: "未归档" as const, returnReason: "", addedTimeLimit: 0 },
        { id: "stu-4", name: "学生4", sno: "20230104", className: "物联网2301班", status: "已退回" as const, duration: "113分钟", remainingTime: "60分钟", submitTime: "2026-06-09 15:42", reportStatus: "已提交" as const, score: "--" as const, gradeStatus: "待重做" as const, archiveStatus: "未归档" as const, returnReason: "报告需补充", addedTimeLimit: 0 },
        { id: "stu-5", name: "学生5", sno: "20230105", className: "物联网2301班", status: "未开始" as const, duration: "0分钟", remainingTime: "120分钟", submitTime: "未提交", reportStatus: "未提交" as const, score: "--" as const, gradeStatus: "未评分" as const, archiveStatus: "未归档" as const, returnReason: "", addedTimeLimit: 0 },
        { id: "stu-6", name: "学生6", sno: "20230106", className: "物联网2301班", status: "已完成" as const, duration: "110分钟", remainingTime: "0分钟", submitTime: "2026-06-08 17:20", reportStatus: "已提交" as const, score: 90, gradeStatus: "已评分" as const, archiveStatus: "已归档" as const, returnReason: "", addedTimeLimit: 0 }
      ]
    },
    {
      id: "task-rec-2",
      name: "MQTT通信协议章节 learning",
      course: "物联网设备开发实战",
      chapter: "第3章 MQTT通信协议",
      className: "物联网2301班",
      deadline: "2026-06-05 12:00",
      duration: "90分钟",
      status: "已完成",
      assignedCount: 42,
      completions: 42,
      completedList: [
        { id: "stu-201", name: "张三", sno: "20230121", className: "物联网2301班", status: "已完成" as const, duration: "88分钟", remainingTime: "0分钟", submitTime: "2026-06-04 15:40", reportStatus: "已提交" as const, score: 95, gradeStatus: "已评分" as const, archiveStatus: "未归档" as const, returnReason: "", addedTimeLimit: 0 },
        { id: "stu-202", name: "李四", sno: "20230122", className: "物联网2301班", status: "已完成" as const, duration: "84分钟", remainingTime: "0分钟", submitTime: "2026-06-04 16:10", reportStatus: "已提交" as const, score: 91, gradeStatus: "已评分" as const, archiveStatus: "未归档" as const, returnReason: "", addedTimeLimit: 0 },
        { id: "stu-203", name: "王五", sno: "20230123", className: "物联网2301班", status: "已完成" as const, duration: "92分钟", remainingTime: "0分钟", submitTime: "2026-06-04 17:00", reportStatus: "已提交" as const, score: 86, gradeStatus: "已评分" as const, archiveStatus: "未归档" as const, returnReason: "", addedTimeLimit: 0 }
      ]
    },
    {
      id: "task-rec-3",
      name: "Linux基础命令练习",
      course: "Linux操作系统",
      chapter: "第2章 常用命令",
      className: "工业互联网2301班",
      deadline: "2026-06-08 15:00",
      duration: "60分钟",
      status: "进行中",
      assignedCount: 36,
      completions: 28,
      completedList: [
        { id: "stu-301", name: "赵六", sno: "20230201", className: "工业互联网2301班", status: "已完成" as const, duration: "55分钟", remainingTime: "0分钟", submitTime: "2026-06-07 14:00", reportStatus: "已提交" as const, score: 90, gradeStatus: "已评分" as const, archiveStatus: "未归档" as const, returnReason: "", addedTimeLimit: 0 },
        { id: "stu-302", name: "钱七", sno: "20230202", className: "工业互联网2301班", status: "已完成" as const, duration: "58分钟", remainingTime: "0分钟", submitTime: "2026-06-07 14:30", reportStatus: "已提交" as const, score: "待评分" as const, gradeStatus: "未评分" as const, archiveStatus: "未归档" as const, returnReason: "", addedTimeLimit: 0 },
        { id: "stu-303", name: "孙八", sno: "20230203", className: "工业互联网2301班", status: "进行中" as const, duration: "40分钟", remainingTime: "20分钟", submitTime: "未提交", reportStatus: "未提交" as const, score: "--" as const, gradeStatus: "未评分" as const, archiveStatus: "未归档" as const, returnReason: "", addedTimeLimit: 0 }
      ]
    },
    {
      id: "task-rec-4",
      name: "行业云平台数据上报实验",
      course: "工业互联网应用开发",
      chapter: "第5章 数据上报与可视化",
      className: "工业互联网2301班",
      deadline: "2026-06-12 18:00",
      duration: "150分钟",
      status: "待评分",
      assignedCount: 36,
      completions: 32,
      completedList: [
        { id: "stu-401", name: "周九", sno: "20230211", className: "工业互联网2301班", status: "已完成" as const, duration: "142分钟", remainingTime: "0分钟", submitTime: "2026-06-09 11:20", reportStatus: "已提交" as const, score: "待评分" as const, gradeStatus: "未评分" as const, archiveStatus: "未归档" as const, returnReason: "", addedTimeLimit: 0 },
        { id: "stu-402", name: "郑十", sno: "20230212", className: "工业互联网2301班", status: "已完成" as const, duration: "135分钟", remainingTime: "0分钟", submitTime: "2026-06-09 12:15", reportStatus: "已提交" as const, score: "待评分" as const, gradeStatus: "未评分" as const, archiveStatus: "未归档" as const, returnReason: "", addedTimeLimit: 0 },
        { id: "stu-403", name: "吴十一", sno: "20230213", className: "工业互联网2301班", status: "已完成" as const, duration: "148分钟", remainingTime: "0分钟", submitTime: "2026-06-09 13:02", reportStatus: "已提交" as const, score: 94, gradeStatus: "已评分" as const, archiveStatus: "未归档" as const, returnReason: "", addedTimeLimit: 0 }
      ]
    }
  ]);

  const [selectedTaskId, setSelectedTaskId] = useState<string>("task-rec-1");

  const [selectedDetailStudent, setSelectedDetailStudent] = useState<any | null>(null);
  const [studentDetailTab, setStudentDetailTab] = useState<"info" | "report" | "chapters" | "score">("info");

  const selectedTask = useMemo(() => {
    return tasksState.find(t => t.id === selectedTaskId) || tasksState[0];
  }, [tasksState, selectedTaskId]);

  useEffect(() => {
    setSelectedDetailStudent(null);
  }, [selectedTaskId]);

  useEffect(() => {
    if (selectedDetailStudent) {
      setTimeout(() => {
        document.getElementById("student-detail-panel")?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    }
  }, [selectedDetailStudent]);

  // Return Task Modal State
  const [returnStudent, setReturnStudent] = useState<any | null>(null);
  const [returnReason, setReturnReason] = useState<string>("实验报告内容不完整");
  const [returnDesc, setReturnDesc] = useState<string>("实验报告中缺少设备接入参数配置和数据上报结果图片，请补充完整后重新提交。");
  const [returnDeadline, setReturnDeadline] = useState<string>("2026-06-12 18:00");
  const [returnUseRecord, setReturnUseRecord] = useState<boolean>(true);
  const [returnNeedRegrade, setReturnNeedRegrade] = useState<boolean>(true);

  // Add Time Modal State
  const [addTimeStudent, setAddTimeStudent] = useState<any | null>(null);
  const [extendMinutesType, setExtendMinutesType] = useState<string>("60"); // "30"|"60"|"90"|"120"|"custom"
  const [customExtendMinutes, setCustomExtendMinutes] = useState<number>(60);
  const [extendReason, setExtendReason] = useState<string>("实验环境异常");
  const [extendDesc, setExtendDesc] = useState<string>("因实验环境启动异常，允许该学生额外增加 60 分钟完成任务。");
  const [syncDeadlineExt, setSyncDeadlineExt] = useState<boolean>(true);

  // Operation Logs State
  const [operationLogs, setOperationLogs] = useState([
    {
      time: "2026-06-09 17:30",
      operator: "教师1",
      studentName: "学生2",
      type: "退回任务",
      content: "要求重新提交实验报告",
      reason: "实验报告内容不完整"
    },
    {
      time: "2026-06-09 15:40",
      operator: "教师1",
      studentName: "学生3",
      type: "增加时长",
      content: "增加 60 分钟",
      reason: "实验环境异常"
    }
  ]);

  // Grading Form State
  const [gradingStudent, setGradingStudent] = useState<any | null>(null);
  const [gradeCompletion, setGradeCompletion] = useState<number>(36);
  const [gradeRegulation, setGradeRegulation] = useState<number>(18);
  const [gradeCorrectness, setGradeCorrectness] = useState<number>(17);
  const [gradeReportQuality, setGradeReportQuality] = useState<number>(18);
  const [gradeComment, setGradeComment] = useState<string>(
    "实验流程完整，设备接入和数据上报结果正确，报告结构较清晰。建议进一步补充异常情况排查过程。"
  );

  // Student Search Filters
  const [studentSearchName, setStudentSearchName] = useState<string>("学生1");
  const [studentSearchSno, setStudentSearchSno] = useState<string>("");
  const [studentSearchClass, setStudentSearchClass] = useState<string>("全部班级");
  const [studentSearchStatus, setStudentSearchStatus] = useState<string>("全部状态");
  const [studentSearchGrade, setStudentSearchGrade] = useState<string>("全部状态");
  const [studentSearchArchive, setStudentSearchArchive] = useState<string>("全部");

  // Applied Student Search Filters
  const [appliedStudentName, setAppliedStudentName] = useState<string>("");
  const [appliedStudentSno, setAppliedStudentSno] = useState<string>("");
  const [appliedStudentClass, setAppliedStudentClass] = useState<string>("全部班级");
  const [appliedStudentStatus, setAppliedStudentStatus] = useState<string>("全部状态");
  const [appliedStudentGrade, setAppliedStudentGrade] = useState<string>("全部状态");
  const [appliedStudentArchive, setAppliedStudentArchive] = useState<string>("全部");

  const filteredCompletedList = useMemo(() => {
    if (!selectedTask || !selectedTask.completedList) return [];

    return selectedTask.completedList.filter((student: any) => {
      // 1. 学生姓名
      if (appliedStudentName.trim() !== "") {
        const queryName = appliedStudentName.trim().toLowerCase();
        if (!student.name || !student.name.toLowerCase().includes(queryName)) {
          return false;
        }
      }

      // 2. 学号
      if (appliedStudentSno.trim() !== "") {
        const querySno = appliedStudentSno.trim().toLowerCase();
        if (!student.sno || !student.sno.toLowerCase().includes(querySno)) {
          return false;
        }
      }

      // 3. 班级
      if (appliedStudentClass !== "全部班级") {
        if (student.className !== appliedStudentClass) {
          return false;
        }
      }

      // 4. 完成状态
      if (appliedStudentStatus !== "全部状态") {
        if (student.status !== appliedStudentStatus) {
          return false;
        }
      }

      // 5. 评分状态
      if (appliedStudentGrade !== "全部状态") {
        if (student.gradeStatus !== appliedStudentGrade) {
          return false;
        }
      }

      // 6. 归档状态
      if (appliedStudentArchive !== "全部") {
        if (student.archiveStatus !== appliedStudentArchive) {
          return false;
        }
      }

      return true;
    });
  }, [
    selectedTask,
    appliedStudentName,
    appliedStudentSno,
    appliedStudentClass,
    appliedStudentStatus,
    appliedStudentGrade,
    appliedStudentArchive
  ]);

  const isFiltered = useMemo(() => {
    return (
      appliedStudentName.trim() !== "" ||
      appliedStudentSno.trim() !== "" ||
      appliedStudentClass !== "全部班级" ||
      appliedStudentStatus !== "全部状态" ||
      appliedStudentGrade !== "全部状态" ||
      appliedStudentArchive !== "全部"
    );
  }, [
    appliedStudentName,
    appliedStudentSno,
    appliedStudentClass,
    appliedStudentStatus,
    appliedStudentGrade,
    appliedStudentArchive
  ]);

  const statsText = useMemo(() => {
    const total = selectedTask ? selectedTask.completedList.length : 0;
    const current = filteredCompletedList.length;
    if (isFiltered) {
      return `共 ${total} 条记录，当前显示 ${current} 条`;
    } else {
      return `共 ${total} 条记录`;
    }
  }, [selectedTask, filteredCompletedList, isFiltered]);

  // Tree nodes definition
  const courseChapters: ChapterNode[] = [
    {
      id: "ch1",
      label: "第1章 物联网系统认知",
      children: [
        { id: "ch1-1", label: "1.1 架构与组成" },
        { id: "ch1-2", label: "1.2 常用协议概览" }
      ]
    },
    {
      id: "ch2",
      label: "第2章 传感器与数据采集",
      children: [
        { id: "ch2-1", label: "2.1 模拟信号采样" },
        { id: "ch2-2", label: "2.2 数字传感器驱动" }
      ]
    },
    {
      id: "ch3",
      label: "第3章 MQTT通信协议",
      children: [
        { id: "ch3-1", label: "3.1 MQTT协议基础" },
        { id: "ch3-2", label: "3.2 发布订阅机制" },
        { id: "ch3-3", label: "3.3 Topic主题配置" }
      ]
    },
    {
      id: "ch4",
      label: "第4章 设备接入与数据上报",
      children: [
        { id: "ch4-1", label: "4.1 创建设备" },
        { id: "ch4-2", label: "4.2 配置物模型" },
        { id: "ch4-3", label: "4.3 上传传感器数据" }
      ]
    },
    {
      id: "ch5",
      label: "第5章 行业云平台应用"
    }
  ];

  // Flat representation of the selected chapters ids
  const [selectedChapters, setSelectedChapters] = useState<string[]>([
    "ch4", "ch4-1", "ch4-2", "ch4-3"
  ]);

  // Collapsed chapter nodes tracking
  const [expandedChapters, setExpandedChapters] = useState<string[]>([
    "ch3", "ch4"
  ]);

  // Class selection state
  const classesList = [
    { id: "class-1", name: "物联网2301班", count: 42 },
    { id: "class-2", name: "物联网2302班", count: 39 },
    { id: "class-3", name: "工业互联网2301班", count: 36 },
    { id: "class-4", name: "人工智能2301班", count: 45 }
  ];
  const [selectedClassId, setSelectedClassId] = useState<string>("class-1");

  // Dynamic selected students
  const initialStudents = useMemo(() => [
    { id: "stu-1", name: "学生1", sno: "20230101", status: "正常" },
    { id: "stu-2", name: "学生2", sno: "20230102", status: "正常" },
    { id: "stu-3", name: "学生3", sno: "20230103", status: "正常" },
    { id: "stu-4", name: "学生4", sno: "20230104", status: "正常" },
    { id: "stu-5", name: "学生5", sno: "20230105", status: "正常" },
    { id: "stu-6", name: "学生6", sno: "20230106", status: "正常" },
    { id: "stu-7", name: "学生7", sno: "20230107", status: "正常" },
    { id: "stu-8", name: "学生8", sno: "20230108", status: "正常" },
    { id: "stu-9", name: "学生9", sno: "20230109", status: "正常" },
    { id: "stu-10", name: "学生10", sno: "20230110", status: "正常" },
  ], []);

  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(
    initialStudents.map(s => s.id)
  );

  // === 我的课程模块相关的 React States 与静态数据 ===
  const [coursesList, setCoursesList] = useState<any[]>([
    {
      id: "course-1",
      name: "物联网设备开发实战",
      specialty: "物联网应用技术",
      type: "专业核心课",
      resourcesCount: 36,
      chaptersCount: 8,
      classes: ["物联网2301班", "物联网2302班"],
      studentsCount: 84,
      tasksCount: 6,
      status: "使用中",
      recentTime: "2026-06-02 09:30"
    },
    {
      id: "course-2",
      name: "Linux操作系统",
      specialty: "工业互联网技术",
      type: "专业基础课",
      resourcesCount: 28,
      chaptersCount: 10,
      classes: ["工业互联网2301班"],
      studentsCount: 36,
      tasksCount: 4,
      status: "使用中",
      recentTime: ""
    },
    {
      id: "course-3",
      name: "边缘计算技术应用",
      specialty: "物联网应用技术",
      type: "实验实训课",
      resourcesCount: 22,
      chaptersCount: 6,
      classes: ["物联网2301班"],
      studentsCount: 42,
      tasksCount: 3,
      status: "已开通",
      recentTime: ""
    },
    {
      id: "course-4",
      name: "工业互联网应用开发",
      specialty: "工业互联网技术",
      type: "岗位技能课",
      resourcesCount: 32,
      chaptersCount: 7,
      classes: ["工业互联网2301班"],
      studentsCount: 36,
      tasksCount: 5,
      status: "使用中",
      recentTime: ""
    }
  ]);

  // 页顶宏观数值
  const [totalCourseCount, setTotalCourseCount] = useState<number>(12);
  const [totalClassCount, setTotalClassCount] = useState<number>(4);
  const [totalIssuedTasks, setTotalIssuedTasks] = useState<number>(18);
  const [totalStudentsCount, setTotalStudentsCount] = useState<number>(156);
  const [weeklyNewTasks, setWeeklyNewTasks] = useState<number>(6);

  // 课程检索筛选
  const [filterCourseName, setFilterCourseName] = useState<string>("");
  const [filterSpecialty, setFilterSpecialty] = useState<string>("全部专业");
  const [filterType, setFilterType] = useState<string>("全部类型");
  const [filterStatus, setFilterStatus] = useState<string>("全部状态");

  // 查看课程详情
  const [detailCourse, setDetailCourse] = useState<any | null>(null);

  // 自主快速下发课程任务关联状态
  const [dispatchingCourse, setDispatchingCourse] = useState<any | null>(null);
  const [dispatchTaskName, setDispatchTaskName] = useState<string>("");
  const [dispatchTaskType, setDispatchTaskType] = useState<string>("课程学习");
  const [dispatchClasses, setDispatchClasses] = useState<string[]>(["物联网2301班"]);
  const [selectedDispatchStudentCount, setSelectedDispatchStudentCount] = useState<number>(42);
  const [dispatchDuration, setDispatchDuration] = useState<number>(120);
  const [dispatchDeadline, setDispatchDeadline] = useState<string>("2026-06-10 18:00");
  const [dispatchMemo, setDispatchMemo] = useState<string>("请完成当前课程指定章节学习内容，并按要求提交学习记录或实验报告。");
  const [dispatchSelectedChapters, setDispatchSelectedChapters] = useState<string[]>([]);

  // 课程章节模拟字典 (无违禁内容)
  const courseChaptersMap = useMemo(() => ({
    "物联网设备开发实战": [
      "第1章 物联网系统认知",
      "第2章 传感器与数据采集",
      "第3章 MQTT通信协议",
      "  - 3.1 MQTT协议基础",
      "  - 3.2 发布订阅机制",
      "  - 3.3 Topic主题配置",
      "第4章 设备接入与数据上报",
      "  - 4.1 创建设备",
      "  - 4.2 配置物模型",
      "  - 4.3 上传传感器数据",
      "第5章 行业云平台应用",
      "第6章 综合项目实践"
    ],
    "Linux操作系统": [
      "第1章 Linux系统安装与环境准备",
      "第2章 常用命令行操作与文件管理",
      "第3章 用户和文件权限管理",
      "第4章 网络参数配置与服务部署",
      "第5章 Shell脚本编程与任务调度",
      "第6章 虚拟化与容器化原理解析"
    ],
    "边缘计算技术应用": [
      "第1章 边缘计算基本原理",
      "第2章 边缘网关选型与物理连接",
      "第3章 边缘计算节点自组网协议",
      "第4章 现场协议转换与本地流分析",
      "第5章 Kubernetes在边缘侧的微型部署"
    ],
    "工业互联网应用开发": [
      "第1章 工业互联网宏观架构",
      "第2章 Modbus/opcUA 工业协议解析",
      "第3章 网关与PLC寄存器物理联调",
      "第4章 前端看板仪表盘开发",
      "第5章 服务接口交互定义"
    ]
  } as Record<string, string[]>), []);

  // 检索过滤器逻辑
  const filteredCourses = useMemo(() => {
    return coursesList.filter(c => {
      if (filterCourseName.trim() !== "" && !c.name.toLowerCase().includes(filterCourseName.toLowerCase())) {
        return false;
      }
      if (filterSpecialty !== "全部专业" && c.specialty !== filterSpecialty) {
        return false;
      }
      if (filterType !== "全部类型" && c.type !== filterType) {
        return false;
      }
      if (filterStatus !== "全部状态") {
        if (filterStatus === "已开通" && c.status !== "已开通") return false;
        if (filterStatus === "使用中" && c.status !== "使用中") return false;
        if (filterStatus === "即将到期" && c.status !== "即将到期") return false;
      }
      return true;
    });
  }, [coursesList, filterCourseName, filterSpecialty, filterType, filterStatus]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleToggleExpand = (id: string) => {
    setExpandedChapters(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleToggleChapter = (node: ChapterNode) => {
    const idsToToggle: string[] = [node.id];
    if (node.children) {
      node.children.forEach(child => {
        idsToToggle.push(child.id);
      });
    }

    const isCurrentlySelected = selectedChapters.includes(node.id);
    if (isCurrentlySelected) {
      // Remove all
      setSelectedChapters(prev => prev.filter(id => !idsToToggle.includes(id)));
    } else {
      // Add all
      setSelectedChapters(prev => [...new Set([...prev, ...idsToToggle])]);
    }
  };

  const handleStudentSelectAll = () => {
    setSelectedStudentIds(initialStudents.map(s => s.id));
    showToast("已全选当前班级的所有学生");
  };

  const handleStudentInvert = () => {
    setSelectedStudentIds(prev => 
      initialStudents.map(s => s.id).filter(id => !prev.includes(id))
    );
    showToast("已对当前学生进行反选操作");
  };

  const handleStudentClear = () => {
    setSelectedStudentIds([]);
    showToast("已清空学生选择");
  };

  const handleToggleStudent = (id: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const getSelectedChaptersLabels = useMemo(() => {
    const labels: string[] = [];
    courseChapters.forEach(p => {
      if (selectedChapters.includes(p.id)) {
        labels.push(p.label);
      }
      p.children?.forEach(c => {
        if (selectedChapters.includes(c.id)) {
          labels.push(c.label);
        }
      });
    });
    return labels.length > 0 ? labels.slice(0, 2).join("、") + (labels.length > 2 ? ` 等${labels.length}项` : "") : "暂无选中";
  }, [selectedChapters]);

  const activeClassName = useMemo(() => {
    return classesList.find(c => c.id === selectedClassId)?.name || "指定班级";
  }, [selectedClassId]);

  // Handle final deliver action
  const handleDeliver = () => {
    if (!taskName.trim()) {
      showToast("任务名称不能为空");
      return;
    }
    if (selectedChapters.length === 0) {
      showToast("请至少选择一个课程章节进行下发");
      return;
    }
    if (selectedStudentIds.length === 0) {
      showToast("至少需要选择一名学生接受该学习任务");
      return;
    }

    setIsSuccess(true);
  };

  const handleResetFilters = () => {
    setSearchTaskName("");
    setSelectedCourseFilter("全部课程");
    setSelectedClassFilter("全部班级");
    setSelectedStatusFilter("全部状态");
    setStartDateFilter("");
    setEndDateFilter("");
    showToast("筛选条件已重置");
  };

  const filteredTasks = useMemo(() => {
    return tasksState.filter(task => {
      if (searchTaskName && !task.name.toLowerCase().includes(searchTaskName.toLowerCase())) {
        return false;
      }
      if (selectedCourseFilter !== "全部课程" && task.course !== selectedCourseFilter) {
        return false;
      }
      if (selectedClassFilter !== "全部班级" && task.className !== selectedClassFilter) {
        return false;
      }
      if (selectedStatusFilter !== "全部状态") {
        if (selectedStatusFilter === "未开始" && task.status !== "未开始") return false;
        if (selectedStatusFilter === "进行中" && task.status !== "进行中") return false;
        if (selectedStatusFilter === "已完成" && task.status !== "已完成") return false;
        if (selectedStatusFilter === "已评分" && task.status !== "已评分" && task.status !== "已完成") return false;
      }
      return true;
    });
  }, [tasksState, searchTaskName, selectedCourseFilter, selectedClassFilter, selectedStatusFilter]);

  const totalScore = useMemo(() => {
    return gradeCompletion + gradeRegulation + gradeCorrectness + gradeReportQuality;
  }, [gradeCompletion, gradeRegulation, gradeCorrectness, gradeReportQuality]);

  return (
    <div className="bg-[#f4f6f8] min-h-screen text-zinc-800 font-sans antialiased pb-16">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#009b86] text-white text-xs px-5 py-3 rounded-xl border border-teal-400 flex items-center gap-2 shadow-xl animate-in fade-in duration-200">
          <Sparkles className="w-4 h-4 text-white" />
          <span className="font-extrabold">{toastMessage}</span>
        </div>
      )}

      {/* Top Breadcrumb Header Row */}
      <div className="bg-white border-b border-zinc-200/80 px-6 py-3 flex items-center justify-between text-xs font-semibold shadow-xs select-none shrink-0 font-sans">
        <div className="flex items-center gap-2">
          <span className="text-zinc-400">教师工作台</span>
          <ChevronRight className="w-3 h-3 text-zinc-300" />
          {activeSubTab === "my_courses" ? (
            <>
              <span className="text-[#009b86] font-black">我的课程</span>
            </>
          ) : ["my_teaching_overview", "my_teaching_tasks", "my_teaching_students", "my_teaching_duration"].includes(activeSubTab) ? (
            <>
              <span className="text-zinc-655 font-bold">我的教学</span>
              <ChevronRight className="w-3 h-3 text-zinc-300" />
              <span className="text-[#009b86] font-black">
                {activeSubTab === "my_teaching_overview" && "教学概览"}
                {activeSubTab === "my_teaching_tasks" && "任务数据"}
                {activeSubTab === "my_teaching_students" && "学生学习情况"}
                {activeSubTab === "my_teaching_duration" && "学习时长统计"}
              </span>
            </>
          ) : (
            <>
              <span className="text-zinc-655 font-bold">资源配置</span>
              <ChevronRight className="w-3 h-3 text-zinc-300" />
              <span className="text-[#009b86] font-black">
                {activeSubTab === "assign" && "任务下发"}
                {activeSubTab === "manage" && "任务管理"}
                {activeSubTab === "stats" && "学生完成情况"}
                {activeSubTab === "chapters" && "资源章节配置"}
                {activeSubTab === "classes" && "班级资源配置"}
              </span>
            </>
          )}
        </div>
        
        <button
          onClick={() => onTabChange("dashboard")}
          className="flex items-center gap-1.5 text-zinc-500 hover:text-[#009b86] transition-colors font-bold cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>返回教师工作台</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* L1 Left Sidebar Menu: Full Teacher Menu */}
          <div className="lg:col-span-3 bg-white border border-zinc-200 rounded-2xl p-4.5 shadow-xs space-y-4 select-none font-sans">
            <div className="pb-3 border-b border-zinc-150 flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#e6f5f3] flex items-center justify-center text-[#009b86] shrink-0 font-bold text-xs shadow-inner">
                T
              </div>
              <div className="leading-tight">
                <span className="text-[10px] text-zinc-400 font-mono font-bold block leading-none uppercase">WORKSPACE</span>
                <span className="text-xs font-black text-zinc-900 leading-tight">教师教学实训控制台</span>
              </div>
            </div>

            <div className="space-y-4">
              
              {/* Main Workspace entries */}
              <div className="space-y-0.5">
                <button
                  onClick={() => onTabChange("dashboard")}
                  className="w-full text-left px-3.5 py-2 rounded-xl transition-all flex items-center gap-2.5 text-xs text-zinc-650 hover:text-zinc-950 hover:bg-zinc-50 font-black cursor-pointer border-l-4 border-transparent pl-3.5"
                >
                  <Layers className="w-3.5 h-3.5 text-zinc-450" />
                  <span>首页</span>
                </button>
                
                <button
                  onClick={() => {
                    setActiveSubTab("my_courses");
                    setIsSuccess(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 rounded-xl cursor-pointer transition-all flex items-center gap-2.5 text-xs border-l-4 ${
                    activeSubTab === "my_courses"
                      ? "bg-[#e6f5f3] text-[#009b86] font-black border-[#009b86] pl-2.5"
                      : "text-zinc-650 hover:text-zinc-950 hover:bg-zinc-50 border-transparent pl-3.5"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>我的课程</span>
                </button>
              </div>

              {/* Group 1: 我的教学 */}
              <div className="space-y-1">
                <span className="px-3.5 text-[9.5px] font-black text-zinc-400 block uppercase tracking-wider mb-1.5 mt-1">
                  我的教学
                </span>
                {[
                  { id: "my_teaching_overview" as const, label: "教学概览", desc: "班级学情与课程实训宏观视图" },
                  { id: "my_teaching_tasks" as const, label: "任务数据", desc: "查看班级课程任务及学生完成耗时" },
                  { id: "my_teaching_students" as const, label: "学生学习情况", desc: "追踪个体和班群学业素养" },
                  { id: "my_teaching_duration" as const, label: "学习时长统计", desc: "物联网实训实操耗时分析" }
                ].map(item => {
                  const isActive = activeSubTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveSubTab(item.id);
                        setIsSuccess(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 rounded-xl cursor-pointer transition-all flex flex-col ${
                        isActive
                          ? "bg-[#e6f5f3] text-[#009b86] shadow-xs font-black border-l-4 border-[#009b86] pl-2.5"
                          : "text-zinc-650 hover:text-zinc-950 hover:bg-zinc-50 pl-3.5 border-l-4 border-transparent"
                      }`}
                    >
                      <span className="text-xs font-black">{item.label}</span>
                      <span className="text-[9px] text-zinc-450 font-medium mt-0.5 leading-none block">{item.desc}</span>
                    </button>
                  );
                })}
              </div>

              {/* Group 2: 资源配置 */}
              <div className="space-y-1">
                <span className="px-3.5 text-[9.5px] font-black text-zinc-400 block uppercase tracking-wider mb-1.5 mt-1">
                  资源配置
                </span>
                {[
                  { id: "assign" as const, label: "任务下发", desc: "向指定班级发送实训或学习任务" },
                  { id: "manage" as const, label: "任务管理", desc: "对已下发任务进度与试验报告评分" },
                  { id: "stats" as const, label: "学生完成情况", desc: "查询各班完成进度与分数情况" },
                  { id: "chapters" as const, label: "资源章节配置", desc: "组织课程章节及物理沙盒映射" },
                  { id: "classes" as const, label: "班级资源配置", desc: "绑定授课班级对应的实验源" }
                ].map(item => {
                  const isActive = activeSubTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveSubTab(item.id);
                        setIsSuccess(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 rounded-xl cursor-pointer transition-all flex flex-col ${
                        isActive
                          ? "bg-[#e6f5f3] text-[#009b86] shadow-xs font-black border-l-4 border-[#009b86] pl-2.5"
                          : "text-zinc-650 hover:text-zinc-950 hover:bg-zinc-50 pl-3.5 border-l-4 border-transparent"
                      }`}
                    >
                      <span className="text-xs font-black">{item.label}</span>
                      <span className="text-[9px] text-zinc-450 font-medium mt-0.5 leading-none block">{item.desc}</span>
                    </button>
                  );
                })}
              </div>

              {/* Group 3: 其他 */}
              <div className="space-y-0.5 pt-2 border-t border-zinc-150">
                <button
                  onClick={() => onTabChange("ai_assistant")}
                  className="w-full text-left px-3.5 py-2 rounded-xl transition-all flex items-center gap-2.5 text-xs text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50 font-black cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-zinc-450" />
                  <span>AI工具集</span>
                </button>
                
                <button
                  onClick={() => onTabChange("personal_center")}
                  className="w-full text-left px-3.5 py-2 rounded-xl transition-all flex items-center gap-2.5 text-xs text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50 font-black cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-zinc-450" />
                  <span>个人中心</span>
                </button>
              </div>

            </div>
          </div>

          {/* L2 Right Main Tab Content panel */}
          <div className="lg:col-span-9 space-y-6">

            {/* Success Form Overlay Screen if isSuccess is true */}
            {isSuccess ? (
          <div className="bg-white border border-zinc-200 rounded-3xl p-8 max-w-2xl mx-auto text-center space-y-6 shadow-md animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-[#e6f5f3] text-[#009b86] border border-[#009b86]/25 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-black text-zinc-900">任务下发成功</h1>
              <p className="text-xs text-zinc-500">
                教学实训任务已通过系统引擎下发至指定班级的对应学生。
              </p>
            </div>

            {/* Recipient summary facts */}
            <div className="bg-zinc-50 border border-zinc-200/60 rounded-2xl p-5 text-left text-xs space-y-3 font-medium text-zinc-700">
              <div className="flex justify-between pb-2.5 border-b border-zinc-200/60">
                <span className="text-zinc-400">任务名称：</span>
                <span className="text-zinc-900 font-extrabold">{taskName}</span>
              </div>
              <div className="flex justify-between pb-2.5 border-b border-zinc-200/60">
                <span className="text-zinc-400">下发班级：</span>
                <span className="text-zinc-900 font-extrabold">{activeClassName}</span>
              </div>
              <div className="flex justify-between pb-2.5 border-b border-zinc-200/60">
                <span className="text-zinc-400">学生人数：</span>
                <span className="text-zinc-900 font-extrabold">{selectedStudentIds.length} 人</span>
              </div>
              <div className="flex justify-between pb-2.5 border-b border-zinc-200/60">
                <span className="text-zinc-400">预计时长：</span>
                <span className="text-zinc-900 font-extrabold">{duration} {durationUnit} ({durationUnit === "分钟" ? `${(duration/60).toFixed(1)}小时` : `${duration}小时`})</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-zinc-400">截止时间：</span>
                <span className="text-rose-600 font-extrabold">{deadline}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setActiveSubTab("manage");
                  setIsSuccess(false);
                }}
                className="px-6 py-2 rounded-xl text-xs font-black bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
              >
                查看任务管理
              </button>
              <button
                onClick={() => {
                  setIsSuccess(false);
                  // Reset forms with standard values
                  setTaskName("物联网设备接入实验任务");
                  setSelectedChapters(["ch4", "ch4-1", "ch4-2", "ch4-3"]);
                  setSelectedStudentIds(initialStudents.map(s => s.id));
                  showToast("已重置任务表单可重新输入");
                }}
                className="px-6 py-2 rounded-xl text-xs font-black bg-[#009b86] hover:bg-emerald-700 text-white shadow-md transition-all cursor-pointer"
              >
                继续下发任务
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* ======================================================================= */}
            {/* VIEW: MY COURSES (我的课程) */}
            {/* ======================================================================= */}
            {activeSubTab === "my_courses" && (
              <div className="space-y-6 animate-in fade-in duration-250 select-none">
                
                {/* 1. Header & Breadcrumbs block */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-xs gap-4">
                  <div className="space-y-1">
                    <span className="bg-[#e6f5f3] text-[#009b86] text-[10px] px-2.5 py-1 rounded font-black uppercase tracking-wider font-mono">
                      教师工作台 / 我的课程
                    </span>
                    <h1 className="text-xl font-black text-zinc-900 tracking-tight">我的课程</h1>
                    <p className="text-xs text-zinc-500 font-semibold max-w-2xl mt-1">
                      查看教师已购买和已开通的课程资源，并可直接对指定课程下发学习或实验任务。
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onTabChange("courses")}
                      className="px-4 py-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 font-black rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span>🔍 去课程大厅</span>
                    </button>
                    <button
                      onClick={() => setActiveSubTab("assign")}
                      className="px-4 py-2 bg-[#009b86] hover:bg-emerald-700 text-white font-black rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <span>📝 资源配置</span>
                    </button>
                  </div>
                </div>

                {/* 2. Course Status Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="p-4.5 bg-white border border-zinc-200 rounded-2xl space-y-1.5 shadow-xs">
                    <span className="text-zinc-400 block font-black text-[10px] uppercase">已购买课程</span>
                    <p className="flex items-baseline gap-1 text-zinc-900 font-black text-2xl tracking-tight leading-none font-sans">
                      {totalCourseCount} <span className="text-xs text-zinc-400 font-bold ml-0.5">门</span>
                    </p>
                    <div className="text-[9px] text-[#009b86] font-medium">离线许可验证通过</div>
                  </div>

                  <div className="p-4.5 bg-white border border-zinc-200 rounded-2xl space-y-1.5 shadow-xs">
                    <span className="text-zinc-400 block font-black text-[10px] uppercase">已开通班级</span>
                    <p className="flex items-baseline gap-1 text-zinc-900 font-black text-2xl tracking-tight leading-none font-sans">
                      {totalClassCount} <span className="text-xs text-zinc-400 font-bold ml-0.5">个</span>
                    </p>
                    <div className="text-[9px] text-zinc-400 font-medium font-sans">对应授课班群</div>
                  </div>

                  <div className="p-4.5 bg-white border border-zinc-200 rounded-2xl space-y-1.5 shadow-xs border-l-4 border-l-[#009b86]">
                    <span className="text-zinc-400 block font-black text-[10px] uppercase">已下发任务</span>
                    <p className="flex items-baseline gap-1 text-[#009b86] font-black text-3xl tracking-tight leading-none font-sans">
                      {totalIssuedTasks} <span className="text-xs text-zinc-400 font-bold ml-0.5">个</span>
                    </p>
                    <div className="text-[9px] text-teal-600 font-medium font-sans">实时跟踪监测中</div>
                  </div>

                  <div className="p-4.5 bg-white border border-zinc-200 rounded-2xl space-y-1.5 shadow-xs">
                    <span className="text-zinc-400 block font-black text-[10px] uppercase">课程学习人数</span>
                    <p className="flex items-baseline gap-1 text-zinc-900 font-black text-2xl tracking-tight leading-none font-sans">
                      {totalStudentsCount} <span className="text-xs text-zinc-400 font-bold ml-0.5">人</span>
                    </p>
                    <div className="text-[9px] text-zinc-400 font-medium font-sans">累计活跃学生账号</div>
                  </div>

                  <div className="p-4.5 bg-white border border-zinc-200 rounded-2xl space-y-1.5 shadow-xs">
                    <span className="text-zinc-400 block font-black text-[10px] uppercase">本周新增任务</span>
                    <p className="flex items-baseline gap-1 text-zinc-900 font-black text-2xl tracking-tight leading-none font-sans">
                      {weeklyNewTasks} <span className="text-xs text-zinc-400 font-bold ml-0.5">个</span>
                    </p>
                    <div className="text-[9px] text-rose-500 font-medium font-sans">本周新开课章节</div>
                  </div>
                </div>

                {/* 3. Class Screening Filters Section */}
                <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    
                    {/* Filter A: Name */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-400 font-black uppercase">课程名称</label>
                      <input
                        type="text"
                        value={filterCourseName}
                        onChange={(e) => setFilterCourseName(e.target.value)}
                        placeholder="请输入课程名称"
                        className="w-full text-xs bg-zinc-50 border border-zinc-250 rounded-xl px-3 py-2 text-zinc-800 font-semibold focus:outline-none focus:border-[#009b86] focus:bg-white placeholder-zinc-400"
                      />
                    </div>

                    {/* Filter B: Specialty */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-400 font-black uppercase">专业方向</label>
                      <select
                        value={filterSpecialty}
                        onChange={(e) => setFilterSpecialty(e.target.value)}
                        className="w-full text-xs bg-zinc-50 border border-zinc-250 rounded-xl px-2.5 py-2 text-zinc-800 font-semibold focus:outline-none focus:border-[#009b86] focus:bg-white"
                      >
                        <option value="全部专业">全部专业</option>
                        <option value="物联网应用技术">物联网应用技术</option>
                        <option value="人工智能技术应用">人工智能技术应用</option>
                        <option value="工业互联网技术">工业互联网技术</option>
                        <option value="大数据技术">大数据技术</option>
                        <option value="区块链技术应用">区块链技术应用</option>
                      </select>
                    </div>

                    {/* Filter C: Type */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-400 font-black uppercase">课程类型</label>
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="w-full text-xs bg-zinc-50 border border-zinc-250 rounded-xl px-2.5 py-2 text-zinc-800 font-semibold focus:outline-none focus:border-[#009b86] focus:bg-white"
                      >
                        <option value="全部类型">全部类型</option>
                        <option value="专业基础课">专业基础课</option>
                        <option value="专业核心课">专业核心课</option>
                        <option value="实验实训课">实验实训课</option>
                        <option value="岗位技能课">岗位技能课</option>
                        <option value="认证课程">认证课程</option>
                      </select>
                    </div>

                    {/* Filter D: Status */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-400 font-black uppercase">开通状态</label>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full text-xs bg-zinc-50 border border-zinc-250 rounded-xl px-2.5 py-2 text-zinc-800 font-semibold focus:outline-none focus:border-[#009b86] focus:bg-white"
                      >
                        <option value="全部状态">全部状态</option>
                        <option value="已开通">已开通</option>
                        <option value="使用中">使用中</option>
                        <option value="即将到期">即将到期</option>
                      </select>
                    </div>

                  </div>

                  <div className="flex justify-end items-center gap-2 border-t border-zinc-100 pt-3">
                    <button
                      onClick={() => {
                        setFilterCourseName("");
                        setFilterSpecialty("全部专业");
                        setFilterType("全部类型");
                        setFilterStatus("全部状态");
                        setDetailCourse(null);
                        setDispatchingCourse(null);
                        showToast("已重置课程筛选条件");
                      }}
                      className="px-4 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-650 font-black rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      重置
                    </button>
                    <button
                      onClick={() => {
                        showToast("已完成已购买课程高级筛选组合");
                      }}
                      className="px-4 py-1.5 bg-[#009b86] hover:bg-emerald-700 text-white font-black rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      查询
                    </button>
                  </div>
                </div>

                {/* 4. Purchased Courses Table / List Block */}
                <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
                  <div className="px-5 py-4 border-b border-zinc-150 flex justify-between items-center bg-zinc-50/50">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-[#009b86] rounded-xs" />
                      <h3 className="font-extrabold text-zinc-900 text-xs text-sans">
                        已购买课程资源目录 ({filteredCourses.length} 门)
                      </h3>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono font-bold uppercase">LICENSED COURSE LIST</span>
                  </div>

                  {filteredCourses.length === 0 ? (
                    <div className="p-12 text-center text-zinc-400 space-y-2">
                      <BookOpen className="w-8 h-8 mx-auto text-zinc-300" />
                      <p className="text-xs font-black">没有找到符合筛选条件的已购买课程。</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto min-w-full">
                      <table className="min-w-[1000px] w-full text-left text-xs font-semibold text-zinc-700 font-sans border-collapse">
                        <thead>
                          <tr className="bg-zinc-50 text-[10px] text-zinc-400 font-black border-b border-zinc-200 uppercase">
                            <th className="px-5 py-3">课程名称</th>
                            <th className="px-5 py-3">专业方向</th>
                            <th className="px-5 py-3">课程类型</th>
                            <th className="px-5 py-3 text-center">资源章节</th>
                            <th className="px-5 py-3">授课班级</th>
                            <th className="px-5 py-3 text-center">学习人数</th>
                            <th className="px-5 py-3 text-center">已发任务</th>
                            <th className="px-5 py-3 text-center">开通状态</th>
                            <th className="px-5 py-3 text-right">操作</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {filteredCourses.map((c) => {
                            const isDetailing = detailCourse?.id === c.id;
                            const isDispatching = dispatchingCourse?.id === c.id;

                            return (
                              <tr 
                                key={c.id} 
                                className={`hover:bg-zinc-50/60 transition-colors ${
                                  isDetailing ? "bg-teal-50/20" : isDispatching ? "bg-teal-50/10" : ""
                                }`}
                              >
                                <td className="px-5 py-4">
                                  <div className="space-y-1">
                                    <span className="font-black text-zinc-900 block text-[13px]">{c.name}</span>
                                    {c.recentTime && (
                                      <span className="inline-flex items-center gap-1.5 text-[9.5px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                                        ⏱️ 最近下发: {c.recentTime}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-5 py-4 text-zinc-500 font-semibold">{c.specialty}</td>
                                <td className="px-5 py-4 text-zinc-500 font-semibold">
                                  <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-650 font-black text-[10px]">
                                    {c.type}
                                  </span>
                                </td>
                                <td className="px-5 py-4 text-center font-mono">
                                  <span className="text-zinc-800 font-black">{c.resourcesCount}个</span>
                                  <span className="text-zinc-450 block text-[10px] mt-0.5">{c.chaptersCount}章</span>
                                </td>
                                <td className="px-5 py-4 shrink-0">
                                  <div className="flex flex-wrap gap-1 max-w-[170px]">
                                    {c.classes.map((clsName: string, idx: number) => (
                                      <span key={idx} className="bg-teal-50/60 text-[#009b86] text-[10px] px-2 py-0.5 rounded-md font-bold border border-teal-100/40">
                                        {clsName}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                                <td className="px-5 py-4 text-center font-mono text-zinc-850 font-black">
                                  {c.studentsCount}人
                                </td>
                                <td className="px-5 py-4 text-center font-mono font-black text-[#009b86]">
                                  {c.tasksCount}个
                                </td>
                                <td className="px-5 py-4 text-center">
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                                    c.status === "使用中" 
                                      ? "bg-emerald-50 text-emerald-600"
                                      : "bg-teal-50 text-teal-600"
                                  }`}>
                                    {c.status}
                                  </span>
                                </td>
                                <td className="px-5 py-4 text-right">
                                  <div className="flex justify-end gap-1.5">
                                    <button
                                      onClick={() => {
                                        setDetailCourse(isDetailing ? null : c);
                                        // Auto scroll down to detailed area
                                        showToast(`已成功载入课程《${c.name}》的大纲详情结构`);
                                      }}
                                      className={`px-3 py-1.5 rounded-lg border text-[11px] font-black cursor-pointer transition-all ${
                                        isDetailing 
                                          ? "bg-zinc-800 text-white border-zinc-800" 
                                          : "bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-700"
                                      }`}
                                    >
                                      {isDetailing ? "关闭详情" : "查看课程"}
                                    </button>
                                    <button
                                      onClick={() => {
                                        setDispatchingCourse(isDispatching ? null : c);
                                        setDetailCourse(null);
                                        if (!isDispatching) {
                                          setDispatchTaskName(`${c.name}学习任务`);
                                          // Set default classes and student counts
                                          setDispatchClasses([c.classes[0]]);
                                          if (c.classes[0] === "物联网2301班") {
                                            setSelectedDispatchStudentCount(42);
                                          } else if (c.classes[0] === "物联网2302班") {
                                            setSelectedDispatchStudentCount(39);
                                          } else {
                                            setSelectedDispatchStudentCount(36);
                                          }
                                          // select default chapters
                                          const chapters = courseChaptersMap[c.name] || [];
                                          setDispatchSelectedChapters([chapters[0] || "第1章"]);
                                          showToast(`已调入《${c.name}》专属任务快速下发模板`);
                                        }
                                      }}
                                      className={`px-3 py-1.5 rounded-lg text-[11px] font-black cursor-pointer transition-all ${
                                        isDispatching 
                                          ? "bg-rose-50 text-rose-600 border border-rose-200" 
                                          : "bg-[#009b86] text-white hover:bg-emerald-700 shadow-xs"
                                      }`}
                                    >
                                      下发任务
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* 5. Dispatch task flow (lower or drawer style layout) */}
                {dispatchingCourse && (
                  <div className="bg-white border border-[#009b86]/25 rounded-2xl p-6 shadow-md animate-in slide-in-from-bottom duration-300 space-y-5">
                    <div className="flex justify-between items-start border-b border-zinc-100 pb-3 flex-wrap gap-2">
                      <div className="space-y-1.5">
                        <h3 className="font-extrabold text-[#009b86] text-sm flex items-center gap-1.5">
                          <span className="w-1.5 h-4 bg-[#009b86] rounded-xs inline-block" />
                          <span>下发课程任务</span>
                        </h3>
                        <p className="text-[11px] text-zinc-400 font-semibold font-sans">基于当前课程已购资源快速创建并下发学生任务。</p>
                      </div>
                      <button
                        onClick={() => setDispatchingCourse(null)}
                        className="text-xs text-zinc-400 hover:text-zinc-700 bg-zinc-50 hover:bg-zinc-100 px-2.5 py-1 rounded-lg border border-zinc-200"
                      >
                        ✕ 取消下发
                      </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      
                      {/* Left side form column */}
                      <div className="lg:col-span-7 space-y-4 font-sans text-xs font-semibold text-zinc-700">
                        
                        {/* Core name */}
                        <div className="space-y-1.5">
                          <label className="text-zinc-500 font-black">任务名称</label>
                          <input
                            type="text"
                            value={dispatchTaskName}
                            onChange={(e) => setDispatchTaskName(e.target.value)}
                            className="w-full text-xs bg-zinc-50 border border-zinc-250 rounded-xl px-3 py-2 text-zinc-800 font-black focus:outline-none focus:border-[#009b86] focus:bg-white"
                          />
                        </div>

                        {/* Task Type & Target Course resource row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-zinc-500 font-black">任务类型</label>
                            <select
                              value={dispatchTaskType}
                              onChange={(e) => setDispatchTaskType(e.target.value)}
                              className="w-full text-xs bg-zinc-50 border border-zinc-250 rounded-xl px-2.5 py-2 text-zinc-800 font-black focus:outline-none"
                            >
                              <option value="课程学习">课程学习</option>
                              <option value="实验实训">实验实训</option>
                              <option value="章节作业">章节作业</option>
                              <option value="综合任务">综合任务</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-zinc-400 font-black">关联课程资源</label>
                            <div className="w-full text-xs bg-zinc-100 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-500 font-black overflow-hidden truncate">
                              {dispatchingCourse.name}
                            </div>
                          </div>
                        </div>

                        {/* Chapters Checkboxes list with Tree styles */}
                        <div className="space-y-1.5">
                          <label className="text-zinc-500 font-black block">资源章节 (多选大纲结构)</label>
                          <div className="border border-zinc-250 rounded-xl p-3 bg-zinc-50 max-h-48 overflow-y-auto space-y-2">
                            {(courseChaptersMap[dispatchingCourse.name] || ["第1章 基础学习", "第2章 实训实操"]).map((chap, idx) => {
                              const isSub = chap.startsWith("  -");
                              const isChecked = dispatchSelectedChapters.includes(chap);
                              return (
                                <div 
                                  key={idx} 
                                  onClick={() => {
                                    if (isChecked) {
                                      setDispatchSelectedChapters(prev => prev.filter(x => x !== chap));
                                    } else {
                                      setDispatchSelectedChapters(prev => [...prev, chap]);
                                    }
                                  }}
                                  className={`flex items-center gap-2 cursor-pointer py-1 hover:bg-zinc-150/40 rounded px-1.5 transition-colors ${
                                    isSub ? "ml-4 text-zinc-500" : "font-black text-zinc-800"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    readOnly
                                    className="w-3.5 h-3.5 accent-[#009b86] rounded"
                                  />
                                  <span className="text-[11px] leading-none select-none">{chap}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Class assignments and students parameters */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          
                          {/* Class list checkbox selections */}
                          <div className="space-y-1.5">
                            <label className="text-zinc-500 font-black block">指定授课班级</label>
                            <div className="border border-zinc-250 rounded-xl p-3 bg-zinc-50 space-y-2">
                              {["物联网2301班", "物联网2302班", "工业互联网2301班", "人工智能2301班"].map((clsName) => {
                                const isChecked = dispatchClasses.includes(clsName);
                                return (
                                  <div 
                                    key={clsName}
                                    onClick={() => {
                                      let nextClasses = [];
                                      if (isChecked) {
                                        nextClasses = dispatchClasses.filter(x => x !== clsName);
                                      } else {
                                        nextClasses = [...dispatchClasses, clsName];
                                      }
                                      setDispatchClasses(nextClasses);
                                      
                                      // Dynamic calculation of selected student counts
                                      let totalStudents = 0;
                                      nextClasses.forEach(cName => {
                                        if (cName === "物联网2301班") totalStudents += 42;
                                        else if (cName === "物联网2302班") totalStudents += 42;
                                        else if (cName === "工业互联网2301班") totalStudents += 36;
                                        else if (cName === "人工智能2301班") totalStudents += 38;
                                      });
                                      setSelectedDispatchStudentCount(totalStudents);
                                    }}
                                    className="flex items-center gap-2 cursor-pointer hover:text-zinc-950 transition-colors"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      readOnly
                                      className="w-3.5 h-3.5 accent-[#009b86] rounded"
                                    />
                                    <span>{clsName}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Student check view */}
                          <div className="space-y-1.5">
                            <label className="text-zinc-500 font-black block">指定受训学生</label>
                            <div className="border border-zinc-250 rounded-xl p-3.5 bg-zinc-50 flex flex-col justify-between h-[116px] border-dashed border-[#009b86]/35">
                              <div>
                                <span className="text-[#009b86] font-black text-sm block">已选择 {selectedDispatchStudentCount} 名学生</span>
                                <span className="text-[9px] text-zinc-400 font-semibold block mt-1">自动选中分派班级内合法激活的全部有效学籍和登录账号</span>
                              </div>
                              <button
                                onClick={() => {
                                  showToast("已成功启动多选花名册并细分精调指派学生范围");
                                }}
                                className="px-2 py-1 bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-600 rounded text-[10px] font-black cursor-pointer text-left flex items-center justify-between"
                              >
                                <span>👥 选择、剔除或微调花名册</span>
                                <span>❯</span>
                              </button>
                            </div>
                          </div>

                        </div>

                        {/* Task Duration, deadline */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-zinc-500 font-black">限制作业时长 (分钟)</label>
                            <input
                              type="number"
                              value={dispatchDuration}
                              onChange={(e) => setDispatchDuration(Number(e.target.value))}
                              placeholder="120"
                              className="w-full text-xs bg-zinc-50 border border-zinc-250 rounded-xl px-3 py-2 text-zinc-800 font-extrabold focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-zinc-500 font-black">截止时间期限</label>
                            <input
                              type="text"
                              value={dispatchDeadline}
                              onChange={(e) => setDispatchDeadline(e.target.value)}
                              className="w-full text-xs bg-zinc-50 border border-zinc-250 rounded-xl px-3 py-2 text-zinc-800 font-extrabold focus:outline-none focus:border-[#009b86] focus:bg-white"
                            />
                          </div>
                        </div>

                        {/* Description field */}
                        <div className="space-y-1.5">
                          <label className="text-zinc-500 font-black">任务要求说明</label>
                          <textarea
                            value={dispatchMemo}
                            onChange={(e) => setDispatchMemo(e.target.value)}
                            rows={2}
                            className="w-full text-xs bg-zinc-50 border border-zinc-250 rounded-xl px-3 py-2 text-zinc-800 font-semibold focus:outline-none focus:border-[#009b86] focus:bg-white"
                          />
                        </div>

                        {/* Action buttons footer */}
                        <div className="flex items-center gap-2 pt-2">
                          <button
                            onClick={() => {
                              if (dispatchTaskName.trim() === "") {
                                showToast("任务名称不能为空，下发被拒绝");
                                return;
                              }
                              if (dispatchSelectedChapters.length === 0) {
                                showToast("请勾选需要指定受训的资源章节");
                                return;
                              }
                              if (dispatchClasses.length === 0) {
                                showToast("请至少指派 1 个受训授课班级");
                                return;
                              }

                              // Commit success action
                              setCoursesList(prev => prev.map(c => {
                                if (c.id === dispatchingCourse.id) {
                                  return {
                                    ...c,
                                    tasksCount: c.tasksCount + 1,
                                    recentTime: "2026-06-03 10:15"
                                  };
                                }
                                return c;
                              }));

                              // Increment overall dashboards
                              setTotalIssuedTasks(prev => prev + 1);
                              setWeeklyNewTasks(prev => prev + 1);

                              showToast(`课程任务已下发至 ${dispatchClasses.length} 个班级、${selectedDispatchStudentCount} 名学生。`);
                              setDispatchingCourse(null);
                            }}
                            className="px-5 py-2.5 bg-[#009b86] hover:bg-emerald-700 text-white rounded-xl text-xs font-black cursor-pointer transition-all shadow-sm flex items-center gap-1.5"
                          >
                            <span>🚀 确认下发任务</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              showToast(`【草稿】《${dispatchTaskName}》已妥善保存至离线草稿箱`);
                              setDispatchingCourse(null);
                            }}
                            className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-black cursor-pointer transition-all"
                          >
                            保存草稿
                          </button>

                          <button
                            onClick={() => setDispatchingCourse(null)}
                            className="px-4 py-2.5 bg-white text-zinc-400 hover:text-zinc-600 rounded-xl text-xs font-black cursor-pointer transition-all border border-zinc-200"
                          >
                            取消
                          </button>
                        </div>

                      </div>

                      {/* Right side Task Preview column */}
                      <div className="lg:col-span-5 bg-zinc-50 border border-zinc-200 rounded-2xl p-5 space-y-4">
                        <div className="border-b border-zinc-200 pb-2 flex justify-between items-center">
                          <span className="font-extrabold text-zinc-900 text-[11px] flex items-center gap-1">
                            <span>👁️</span>
                            <span>任务下发综合实时预览</span>
                          </span>
                          <span className="bg-[#e6f5f3] text-[#009b86] text-[8px] px-1.5 py-0.5 rounded font-black uppercase">LIVE PREVIEW</span>
                        </div>

                        <div className="space-y-3.5 text-xs font-semibold text-zinc-650">
                          <div>
                            <span className="text-[10px] text-zinc-400 block font-black uppercase">任务名称 Preview</span>
                            <p className="text-zinc-900 font-extrabold text-xs mt-0.5 break-all">{dispatchTaskName || "-- 未设定 --"}</p>
                          </div>

                          <div>
                            <span className="text-[10px] text-zinc-400 block font-black uppercase">关联课程资源与类型</span>
                            <p className="text-zinc-900 mt-0.5 font-bold flex items-center gap-1">
                              <span className="bg-[#009b86] text-white text-[8.5px] px-1.5 rounded-sm font-black scale-95 origin-left">{dispatchTaskType}</span>
                              <span className="text-zinc-800">{dispatchingCourse.name}</span>
                            </p>
                          </div>

                          <div>
                            <span className="text-[10px] text-zinc-400 block font-black uppercase">指定下发班级和受训人员</span>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {dispatchClasses.map((cl, idx) => (
                                <span key={idx} className="bg-zinc-200 text-zinc-700 text-[9px] px-2 py-0.5 rounded font-black border border-zinc-300/40">
                                  {cl}
                                </span>
                              ))}
                              {dispatchClasses.length === 0 && (
                                <span className="text-rose-500 text-[10px]">-- 未选择班级 --</span>
                              )}
                            </div>
                            <p className="text-[#009b86] font-black text-[10.5px] mt-1">
                              总计分派学生：{selectedDispatchStudentCount} 人
                            </p>
                          </div>

                          <div>
                            <span className="text-[10px] text-zinc-400 block font-black uppercase">所选受训大纲章节数</span>
                            <p className="text-zinc-800 mt-0.5 font-black text-xs">
                              已选大纲章节数：{dispatchSelectedChapters.length} 节
                            </p>
                            {dispatchSelectedChapters.length > 0 && (
                              <div className="text-[10px] text-zinc-500 font-medium pl-2.5 border-l-2 border-[#009b86] mt-1 space-y-0.5 max-h-20 overflow-y-auto">
                                {dispatchSelectedChapters.map((ch, idx) => (
                                  <div key={idx} className="truncate">{ch.trim()}</div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4 pt-1.5 border-t border-zinc-200/80">
                            <div>
                              <span className="text-[10px] text-zinc-400 block font-black uppercase">受训时长限制</span>
                              <p className="text-zinc-900 font-extrabold text-xs mt-0.5 font-mono">{dispatchDuration} 分钟</p>
                            </div>
                            <div>
                              <span className="text-[10px] text-zinc-400 block font-black uppercase">限期提交截止</span>
                              <p className="text-rose-600 font-extrabold text-xs mt-0.5">{dispatchDeadline}</p>
                            </div>
                          </div>

                          <div className="bg-zinc-150/50 p-2.5 rounded-lg text-[9px] font-medium text-zinc-400 flex items-center justify-between border border-zinc-200">
                            <span>来源：我的课程 / 已购买课程列表</span>
                            <span className="bg-zinc-200 text-zinc-500 px-1 py-0.2 rounded font-black scale-90 select-none uppercase">VERIFIED</span>
                          </div>
                        </div>

                      </div>

                    </div>
                  </div>
                )}

                {/* 6. Advanced Detail Course Card */}
                {detailCourse && (
                  <div className="bg-white border border-zinc-250 rounded-2xl p-6 shadow-sm animate-in zoom-in-98 duration-200 space-y-4">
                    <div className="flex justify-between items-start border-b border-zinc-100 pb-3">
                      <div className="space-y-1">
                        <span className="text-[9px] text-[#009b86] bg-[#e6f5f3] px-2 py-0.5 font-black rounded-full uppercase font-mono tracking-wider">
                          课程核心大纲概览详情
                        </span>
                        <h4 className="font-extrabold text-zinc-900 text-[15px]">{detailCourse.name}</h4>
                      </div>
                      <button
                        onClick={() => setDetailCourse(null)}
                        className="text-xs text-zinc-400 hover:text-zinc-700 bg-zinc-50 hover:bg-zinc-100 px-2 py-1 rounded"
                      >
                        收起详情 ✕
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-semibold text-zinc-650">
                      
                      <div className="bg-zinc-50/60 p-4 border border-zinc-150 rounded-xl space-y-1">
                        <span className="text-[10px] text-zinc-400 font-bold block uppercase">专业方向与分类</span>
                        <p className="text-zinc-900 font-extrabold">{detailCourse.specialty}</p>
                        <span className="text-[9.5px] text-zinc-400">{detailCourse.type}</span>
                      </div>

                      <div className="bg-zinc-50/60 p-4 border border-zinc-150 rounded-xl space-y-1 font-mono">
                        <span className="text-[10px] text-zinc-400 font-bold block uppercase">大纲总章节数</span>
                        <p className="text-zinc-900 font-black text-sm">{detailCourse.chaptersCount} 大章</p>
                        <span className="text-[9.5px] text-zinc-400 font-sans">包含核心关联重难点</span>
                      </div>

                      <div className="bg-zinc-50/60 p-4 border border-zinc-150 rounded-xl space-y-1 font-mono">
                        <span className="text-[10px] text-zinc-400 font-bold block uppercase">许可开通班群</span>
                        <p className="text-teal-600 font-black text-sm">{detailCourse.classes.length} 个班级</p>
                        <span className="text-[9.5px] text-zinc-400 font-sans">物联网与工业互联高频</span>
                      </div>

                      <div className="bg-zinc-50/60 p-4 border border-zinc-150 rounded-xl space-y-1 font-mono">
                        <span className="text-[10px] text-zinc-400 font-bold block uppercase">分派已下发任务</span>
                        <p className="text-zinc-900 font-black text-sm">{detailCourse.tasksCount} 次下发</p>
                        <span className="text-[9.5px] text-zinc-400 font-sans">覆盖 {detailCourse.studentsCount} 名活跃账户</span>
                      </div>

                    </div>

                    <div className="space-y-2 font-sans">
                      <h5 className="font-extrabold text-zinc-800 text-[11.5px] pl-2 border-l-2 border-[#009b86] mb-2 font-sans">核心知识章节体系概览</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-semibold text-zinc-700 bg-zinc-50 p-4 rounded-xl font-sans">
                        {(courseChaptersMap[detailCourse.name] || ["第1章 物联网基本环境", "第2章 现场数据节点部署"]).map((chName, idx) => {
                          const isSub = chName.startsWith("  -");
                          return (
                            <div 
                              key={idx} 
                              className={`py-1.5 px-2.5 rounded hover:bg-zinc-200/35 transition-colors ${
                                isSub 
                                  ? "text-zinc-500 bg-white/30 text-[11px] ml-4 flex items-center gap-1.5 before:content-[''] before:w-1.5 before:h-1.5 before:bg-zinc-300 before:rounded-full shrink-0" 
                                  : "font-black text-zinc-850 bg-white border border-zinc-200/60 shadow-xs"
                              }`}
                            >
                              <span>{chName.trim()}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                )}

              </div>
            )}

            {/* ======================================================================= */}
            {/* VIEW: MY TEACHING - OVERVIEW (教学概览) */}
            {/* ======================================================================= */}
            {activeSubTab === "my_teaching_overview" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs gap-4">
                  <div className="space-y-1">
                    <span className="bg-[#e6f5f3] text-[#009b86] text-[10px] px-2.5 py-1 rounded font-black uppercase tracking-wider font-mono">
                      教师工作台 / 我的教学
                    </span>
                    <h1 className="text-xl font-black text-zinc-900 tracking-tight">教学概览</h1>
                    <p className="text-xs text-zinc-500 font-semibold max-w-2xl mt-1">
                      班级整体实训进展、合格率和近期活动监控。
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Class progress summary */}
                  <div className="md:col-span-2 bg-white border border-zinc-200 rounded-2xl p-5 space-y-4 shadow-xs">
                    <span className="text-xs font-black text-zinc-800 block border-b border-zinc-100 pb-2">班级实训实操平均分与合格率</span>
                    <div className="space-y-4 text-xs font-bold text-zinc-700">
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span>物联网2301班 - 《物联网设备开发实战》</span>
                          <span className="text-[#009b86]">平均：88.2分 | 合格率：95.2%</span>
                        </div>
                        <div className="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-[#009b86] h-full" style={{ width: "95.2%" }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span>工业互联网2301班 - 《Linux操作系统》</span>
                          <span className="text-emerald-600">平均：84.6分 | 合格率：88.9%</span>
                        </div>
                        <div className="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-[#009b86] h-full opacity-80" style={{ width: "88.9%" }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span>物联网2302班 - 《嵌入式物联网开发》</span>
                          <span className="text-blue-600">平均：81.2分 | 合格率：85.4%</span>
                        </div>
                        <div className="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full" style={{ width: "85.4%" }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick stats panel */}
                  <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-3.5 shadow-xs text-xs font-semibold text-zinc-650">
                    <span className="text-xs font-black text-zinc-800 block border-b border-zinc-100 pb-2">最近下发动态</span>
                    <div className="space-y-3 leading-relaxed text-[11.5px]">
                      <div className="border-l-2 border-[#009b86] pl-2">
                        <span className="text-zinc-400 block text-[10px] font-mono">2026-06-02</span>
                        <span className="text-zinc-900 font-extrabold block">物联网设备接入实验任务</span>
                        <span>下发至 <strong>物联网2301班</strong></span>
                      </div>
                      <div className="border-l-2 border-zinc-300 pl-2">
                        <span className="text-zinc-400 block text-[10px] font-mono">2026-06-01</span>
                        <span className="text-zinc-900 font-extrabold block">MQTT通信协议章节学习</span>
                        <span>下发至 <strong>物联网2301班</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-100/50 rounded-2xl p-6 text-center text-xs font-medium text-zinc-500 border border-zinc-250/30">
                  ⚡ 建议进入底部的 <strong className="text-[#009b86] font-black cursor-pointer" onClick={() => setActiveSubTab("my_teaching_tasks")}>任务数据</strong> 子模块，获取每个试验任务对应的班级提交速度和秒级计时统计明细。
                </div>
              </div>
            )}

            {/* ======================================================================= */}
            {/* VIEW: MY TEACHING - TASKS DATA (任务数据 - PRIMARY COMPONENT) */}
            {/* ======================================================================= */}
            {activeSubTab === "my_teaching_tasks" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                
                {/* A. Header Title row */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs gap-4">
                  <div className="space-y-1">
                    <span className="bg-[#e6f5f3] text-[#009b86] text-[10px] px-2.5 py-1 rounded font-black uppercase tracking-wider font-mono">
                      教师工作台 / 我的教学
                    </span>
                    <h1 className="text-xl font-black text-zinc-905 tracking-tight flex items-center gap-2">
                      <span>任务数据</span>
                    </h1>
                    <p className="text-xs text-zinc-500 font-semibold max-w-2xl mt-0.5">
                      查看班级课程任务、学生完成情况和每个学生的任务耗时数据。
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => showToast("正在启动学情报表PDF/Excel数据导出...")}
                      className="px-4 py-2 bg-[#e6f5f3] hover:bg-teal-100 text-[#009b86] text-xs font-black rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 border border-teal-200/55"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>导出数据</span>
                    </button>
                    <button
                      onClick={() => setActiveSubTab("manage")}
                      className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200/60 text-zinc-700 text-xs font-black rounded-lg transition-colors cursor-pointer"
                    >
                      <span>查看资源配置</span>
                    </button>
                  </div>
                </div>

                {/* B. Horizontal statistical counters */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { label: "已下发任务", value: "24", unit: "个", icon: Inbox, color: "text-[#009b86] bg-[#e6f5f3] border-teal-150/40" },
                    { label: "参与学生", value: "156", unit: "人", icon: Users, color: "text-blue-600 bg-blue-50 border-blue-100/50" },
                    { label: "平均任务耗时", value: "94.8", unit: "分钟", icon: Clock, color: "text-amber-600 bg-amber-50 border-amber-100/50" },
                    { label: "总学习时长", value: "14,788.8", unit: "分钟", icon: ClipboardCheck, color: "text-indigo-600 bg-indigo-50 border-indigo-100/50" },
                    { label: "平均完成率", value: "88.5", unit: "%", icon: CheckCircle2, color: "text-rose-600 bg-rose-50 border-rose-100/50" }
                  ].map((card, i) => {
                    const Icon = card.icon;
                    return (
                      <div key={i} className={`bg-white border rounded-2xl p-4.5 flex flex-col justify-between shadow-xs border-zinc-200/80`}>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-zinc-400 font-extrabold">{card.label}</span>
                          <div className={`p-1.5 rounded-lg ${card.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                        </div>
                        <div className="mt-4 flex items-baseline">
                          <span className="text-xl font-black text-zinc-900 tracking-tight">{card.value}</span>
                          <span className="text-[9px] text-zinc-400 font-black ml-1 uppercase">{card.unit}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* C. Interactive filters block */}
                <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4 shadow-xs">
                  <div className="flex items-center gap-2 border-b border-zinc-100 pb-2.5">
                    <Search className="w-4 h-4 text-[#009b86]" />
                    <span className="text-xs font-black text-zinc-805">任务学情多维数据精准过滤</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5 text-xs font-bold text-zinc-700">
                    <div className="space-y-1">
                      <label className="text-zinc-500 block text-[11px]">课程资源</label>
                      <select
                        value={teachingCourseFilter}
                        onChange={(e) => setTeachingCourseFilter(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.8 text-zinc-950 outline-none text-xs font-semibold cursor-pointer"
                      >
                        <option value="全部课程">全部课程</option>
                        <option value="物联网设备开发实战">物联网设备开发实战</option>
                        <option value="Linux操作系统">Linux操作系统</option>
                        <option value="工业互联网应用开发">工业互联网应用开发</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-zinc-500 block text-[11px]">任务名称</label>
                      <input
                        type="text"
                        value={teachingTaskNameFilter}
                        onChange={(e) => setTeachingTaskNameFilter(e.target.value)}
                        placeholder="请输入关键字模糊查询"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.8 text-zinc-900 outline-none text-xs focus:bg-white focus:border-[#009b86] font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-zinc-500 block text-[11px]">班级</label>
                      <select
                        value={teachingClassFilter}
                        onChange={(e) => setTeachingClassFilter(e.target.value)}
                        className="w-full bg-[#fcfdfe] bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.8 text-zinc-950 outline-none text-xs font-semibold cursor-pointer"
                      >
                        <option value="全部班级">全部班级</option>
                        <option value="物联网2301班">物联网2301班</option>
                        <option value="工业互联网2301班">工业互联网2301班</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-zinc-500 block text-[11px]">完成状态</label>
                      <select
                        value={teachingStatusFilter}
                        onChange={(e) => setTeachingStatusFilter(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.8 text-zinc-950 outline-none text-xs font-semibold cursor-pointer"
                      >
                        <option value="全部状态">全部状态</option>
                        <option value="已完成">已全部完成</option>
                        <option value="进行中">未完成/进行中</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-zinc-500 block text-[11px]">发布时间范围</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="date"
                          value={teachingStartDate}
                          onChange={(e) => setTeachingStartDate(e.target.value)}
                          className="w-1/2 bg-zinc-50 border border-zinc-200 rounded-lg px-1.5 py-1 text-zinc-900 outline-none text-[10px] font-medium"
                        />
                        <span className="text-zinc-400 font-normal select-none">至</span>
                        <input
                          type="date"
                          value={teachingEndDate}
                          onChange={(e) => setTeachingEndDate(e.target.value)}
                          className="w-1/2 bg-zinc-50 border border-zinc-200 rounded-lg px-1.5 py-1 text-zinc-900 outline-none text-[10px] font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-100 pt-3 text-xs">
                    <span className="text-zinc-400 font-medium">
                      搜索过滤得出 <strong className="text-zinc-750 font-extrabold">{filteredTeachingTasks.length}</strong> 项关联任务数据。
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setTeachingCourseFilter("全部课程");
                          setTeachingTaskNameFilter("");
                          setTeachingClassFilter("全部班级");
                          setTeachingStatusFilter("全部状态");
                          setTeachingStartDate("");
                          setTeachingEndDate("");
                          showToast("已成功重置检索筛选条件");
                        }}
                        className="px-4 py-1.8 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        重置
                      </button>
                      <button
                        onClick={() => showToast("已应用新筛选条件并检索完毕")}
                        className="px-5 py-1.8 bg-[#009b86] hover:bg-emerald-700 text-white font-black rounded-lg hover:shadow-xs transition-colors cursor-pointer"
                      >
                        查询
                      </button>
                    </div>
                  </div>
                </div>

                {/* D. Main Tasks list grid table */}
                <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
                  <div className="px-5 py-4 border-b border-zinc-150 bg-zinc-50/50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#009b86]" />
                      <span className="text-xs font-black text-zinc-800">下发任务与耗时一统大盘清单</span>
                    </div>
                    <span className="text-[10px] bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full font-bold">
                      实时联动状态统计
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-zinc-50 text-zinc-500 font-black border-b border-zinc-200/80">
                          <th className="px-4 py-3.5">任务名称</th>
                          <th className="px-3 py-3.5">课程资源</th>
                          <th className="px-3 py-3.5">资源章节</th>
                          <th className="px-3 py-3.5">指定班级</th>
                          <th className="px-3 py-3.5 text-center">下发人数</th>
                          <th className="px-3 py-3.5 text-center">已完成</th>
                          <th className="px-3 py-3.5 text-center">完成率</th>
                          <th className="px-3 py-3.5 text-center">平均耗时</th>
                          <th className="px-3 py-3.5 text-center">最长耗时</th>
                          <th className="px-3 py-3.5 text-center">最短耗时</th>
                          <th className="px-3 py-3.5">截止时间</th>
                          <th className="px-4 py-3.5 text-right">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-105 font-medium text-zinc-700">
                        {filteredTeachingTasks.length > 0 ? (
                          filteredTeachingTasks.map((task) => {
                            const isCurrentSelected = selectedTeachingTaskId === task.id;
                            const completionRate = Math.round((task.completions / task.assignedCount) * 100);
                            return (
                              <tr 
                                key={task.id} 
                                className={`hover:bg-zinc-50/50 transition-colors ${
                                  isCurrentSelected ? "bg-teal-50/30 font-semibold border-l-2 border-[#009b86]" : ""
                                }`}
                              >
                                <td className="px-4 py-4">
                                  <span className="text-zinc-900 font-black block leading-snug">{task.name}</span>
                                </td>
                                <td className="px-3 py-4 text-zinc-650">{task.course}</td>
                                <td className="px-3 py-4 text-zinc-500 text-[11px] font-mono leading-tight">{task.chapter}</td>
                                <td className="px-3 py-4 text-zinc-650 font-bold">{task.className}</td>
                                <td className="px-3 py-4 text-center font-mono">{task.assignedCount}人</td>
                                <td className="px-3 py-4 text-center text-[#009b86] font-extrabold font-mono">{task.completions}人</td>
                                <td className="px-3 py-4 text-center">
                                  <div className="flex flex-col items-center gap-1">
                                    <span className="font-mono font-black">{completionRate}%</span>
                                    <div className="w-12 bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                                      <div className="bg-[#009b86] h-full" style={{ width: `${completionRate}%` }} />
                                    </div>
                                  </div>
                                </td>
                                <td className="px-3 py-4 text-center font-mono text-zinc-900 font-black">
                                  {task.avgDuration}分钟
                                </td>
                                <td className="px-3 py-4 text-center font-mono text-rose-600">{task.maxDuration}分钟</td>
                                <td className="px-3 py-4 text-center font-mono text-teal-600">{task.minDuration}分钟</td>
                                <td className="px-3 py-4 font-mono text-zinc-500 text-[11px] leading-tight">{task.deadline}</td>
                                <td className="px-4 py-4 text-right">
                                  <button
                                    onClick={() => {
                                      setSelectedTeachingTaskId(task.id);
                                      showToast(`已载入任务《${task.name}》的学情和耗时分析`);
                                    }}
                                    className={`px-3 py-1.2 text-[11.5px] rounded-lg transition-all ${
                                      isCurrentSelected 
                                        ? "bg-[#009b86] text-white font-black hover:bg-emerald-700" 
                                        : "bg-zinc-50 hover:bg-[#e6f5f3] hover:text-[#009b86] text-zinc-650 font-bold border border-zinc-200 cursor-pointer"
                                    }`}
                                  >
                                    查看学生耗时
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={12} className="text-center py-10 text-zinc-400 font-medium select-none">
                              暂无符合筛选检索条件的任务统计。
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* E. Detailed Student list vs Duration analysis graph adjacent row */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Student list column */}
                  <div className="lg:col-span-8 bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-100 pb-3 gap-2">
                      <div>
                        <h2 className="text-sm font-black text-zinc-800 flex items-center gap-2">
                          <Users className="w-4 h-4 text-[#009b86]" />
                          <span>班级学生耗时情况明细</span>
                        </h2>
                        <span className="text-[10.5px] text-zinc-400 mt-1 block">
                          正在查询任务：<strong className="text-zinc-700 font-black">【{selectedTeachingTask.name}】</strong>（{selectedTeachingTask.className}）
                        </span>
                      </div>
                      <div className="shrink-0 bg-[#e6f5f3] px-3 py-1.2 rounded-lg text-[#009b86] font-black text-[10px]">
                        设定的标准总限时：{selectedTeachingTask.taskDurationLimit}分钟
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-zinc-50 text-zinc-505 font-black border-b border-zinc-150">
                            <th className="px-3 py-2.5">学生</th>
                            <th className="px-3 py-2.5">学号</th>
                            <th className="px-3 py-2.5">班级</th>
                            <th className="px-3 py-2.5 text-center">状态</th>
                            <th className="px-3 py-2.5">开始时间</th>
                            <th className="px-3 py-2.5">提交时间</th>
                            <th className="px-3 py-2.5 text-center">综合累计耗时</th>
                            <th className="px-3 py-2.5 text-center">超时标记</th>
                            <th className="px-3 py-2.5 text-center">评分</th>
                            <th className="px-3 py-2.5 text-right">操作</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 font-medium text-zinc-700">
                          {selectedTeachingTask.students.map((student) => {
                            const isOver = student.duration > selectedTeachingTask.taskDurationLimit;
                            const overmins = student.duration - selectedTeachingTask.taskDurationLimit;
                            return (
                              <tr key={student.id} className="hover:bg-zinc-50/40 transition-colors">
                                <td className="px-3 py-2.5 text-zinc-900 font-black">{student.name}</td>
                                <td className="px-3 py-2.5 font-mono text-zinc-400">{student.sno}</td>
                                <td className="px-3 py-2.5 text-zinc-650">{student.className}</td>
                                <td className="px-3 py-2.5 text-center">
                                  {student.status === "已完成" && (
                                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9.5px] px-2 py-0.5 rounded-full font-black">
                                      已完成
                                    </span>
                                  )}
                                  {student.status === "进行中" && (
                                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-[9.5px] px-2 py-0.5 rounded-full font-black">
                                      进行中
                                    </span>
                                  )}
                                  {student.status === "未开始" && (
                                    <span className="inline-flex items-center gap-1 bg-zinc-50 text-zinc-405 border border-zinc-200 text-[9.5px] px-2 py-0.5 rounded-full">
                                      未开始
                                    </span>
                                  )}
                                </td>
                                <td className="px-3 py-2.5 font-mono text-zinc-400 text-[10.5px]">{student.startTime}</td>
                                <td className="px-3 py-2.5 font-mono text-zinc-400 text-[10.5px]">{student.submitTime}</td>
                                <td className="px-3 py-2.5 text-center font-mono font-bold text-zinc-905">
                                  {student.status === "未开始" ? "--" : `${student.duration} 分钟`}
                                </td>
                                <td className="px-3 py-2.5 text-center">
                                  {student.status === "未开始" ? (
                                    <span className="text-zinc-300">--</span>
                                  ) : isOver ? (
                                    <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-650 border border-rose-100 text-[9.5px] px-1.5 py-0.5 rounded-md font-black">
                                      超时 {overmins}分钟
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-600 border border-teal-100 text-[9.5px] px-1.5 py-0.5 rounded-md text-center">
                                      未超时
                                    </span>
                                  )}
                                </td>
                                <td className="px-3 py-2.5 text-center font-mono font-black text-[#009b86]">
                                  {student.score !== "--" ? `${student.score}分` : "--"}
                                </td>
                                <td className="px-3 py-2.5 text-right">
                                  <button
                                    onClick={() => setSelectedTeachingStudent(student)}
                                    className="px-2 py-1 text-[#009b86] bg-[#e6f5f3] hover:bg-teal-100 rounded text-[10.5px] font-black transition-all cursor-pointer"
                                  >
                                    查看详情
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Distribution list side card */}
                  <div className="lg:col-span-4 bg-white border border-zinc-200 rounded-2xl p-5 space-y-4 shadow-xs">
                    <div className="border-b border-zinc-100 pb-2.5 flex items-center justify-between">
                      <span className="text-xs font-black text-zinc-800">任务用时频带分布与分析</span>
                      <Info className="w-3.5 h-3.5 text-[#009b86]" />
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="bg-zinc-50 rounded-xl p-3 flex justify-between items-center border border-zinc-200/40 font-semibold">
                        <span className="text-zinc-400">平均实训时长：</span>
                        <span className="text-zinc-900 font-black font-mono text-sm">{selectedTeachingTask.avgDuration} 分钟</span>
                      </div>
                      
                      <div className="bg-zinc-50 rounded-xl p-3 flex justify-between items-center border border-zinc-200/40 font-semibold font-mono">
                        <span className="text-zinc-400">最长用时极限：</span>
                        <span className="text-rose-600 font-extrabold text-sm">{selectedTeachingTask.maxDuration} 分钟</span>
                      </div>

                      <div className="bg-zinc-50 rounded-xl p-3 flex justify-between items-center border border-zinc-200/40 font-semibold font-mono">
                        <span className="text-zinc-400">最优极速耗时：</span>
                        <span className="text-teal-600 font-black text-sm">{selectedTeachingTask.minDuration} 分钟</span>
                      </div>

                      <div className="bg-zinc-50 rounded-xl p-3 flex justify-between items-center border border-zinc-200/40 font-semibold">
                        <span className="text-zinc-400">本次超时人数：</span>
                        <span className="text-rose-650 font-black font-mono">
                          {selectedTeachingTask.students.filter(s => s.duration > selectedTeachingTask.taskDurationLimit).length} 人
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3.5 pt-3 border-t border-zinc-100">
                      <span className="text-[10px] text-zinc-400 font-black block uppercase tracking-wider">学生学时比例分布图谱</span>
                      
                      <div className="space-y-3 text-xs">
                        <div>
                          <div className="flex justify-between text-[10.5px] font-bold text-zinc-500 mb-1">
                            <span>极速完成段 (&lt; 60分钟)</span>
                            <span className="font-mono">20%</span>
                          </div>
                          <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-teal-500 h-full" style={{ width: "20%" }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[10.5px] font-bold text-zinc-500 mb-1">
                            <span>标准耗时段 (60-120分钟)</span>
                            <span className="font-mono">60%</span>
                          </div>
                          <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-[#009b86] h-full" style={{ width: "60%" }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[10.5px] font-bold text-zinc-500 mb-1">
                            <span>深度操作段 (&gt; 120分钟)</span>
                            <span className="font-mono">20%</span>
                          </div>
                          <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-rose-500 h-full" style={{ width: "20%" }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-zinc-55 bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-[10.5px] text-zinc-500 leading-relaxed font-semibold">
                      <span className="text-[#009b86] font-black block mb-0.5">💡 演示教师批注</span>
                      <span>此实训要求深度配置虚拟网关和网络心跳逻辑，故超时属于教学预期波动。</span>
                    </div>
                  </div>

                </div>

                {/* F. Student Details overlay modal inside scope */}
                {selectedTeachingStudent && (
                  <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white border border-zinc-200 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in font-sans zoom-in-95 duration-200 space-y-6">
                      
                      <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                        <div className="flex items-center gap-2">
                          <User className="w-5 h-5 text-[#009b86]" />
                          <div>
                            <span className="text-zinc-400 text-[9.5px] block leading-none font-mono font-black uppercase">STUDENT PROFILE</span>
                            <h3 className="text-sm font-black text-zinc-900 leading-tight">学情报告与提交轨迹</h3>
                          </div>
                        </div>
                        <button 
                          onClick={() => setSelectedTeachingStudent(null)}
                          className="px-2.5 py-1 text-zinc-500 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 border border-zinc-250/20 rounded-lg text-[10.5px] font-bold cursor-pointer"
                        >
                          关闭
                        </button>
                      </div>

                      <div className="bg-zinc-50 border border-zinc-200/50 rounded-2xl p-4 space-y-2.5 text-xs font-semibold text-zinc-750">
                        <div className="flex justify-between border-b border-zinc-100 pb-2">
                          <span className="text-zinc-400">姓名学籍：</span>
                          <span className="text-zinc-900 font-extrabold">{selectedTeachingStudent.name}（{selectedTeachingStudent.sno}）</span>
                        </div>
                        <div className="flex justify-between border-b border-zinc-100 pb-2">
                          <span className="text-zinc-400">所属班群：</span>
                          <span className="text-zinc-900">{selectedTeachingStudent.className}</span>
                        </div>
                        <div className="flex justify-between border-b border-zinc-100 pb-2">
                          <span className="text-zinc-400">累计时长：</span>
                          <span className="text-zinc-905 font-mono font-bold">{selectedTeachingStudent.duration} 分钟</span>
                        </div>
                        <div className="flex justify-between border-b border-zinc-100 pb-2">
                          <span className="text-zinc-400">进入沙盒：</span>
                          <span className="text-zinc-800 font-mono text-[10.5px]">{selectedTeachingStudent.startTime}</span>
                        </div>
                        <div className="flex justify-between border-b border-zinc-100 pb-2">
                          <span className="text-zinc-400">提交报告：</span>
                          <span className="text-zinc-800 font-mono text-[10.5px]">{selectedTeachingStudent.submitTime}</span>
                        </div>
                        <div className="flex justify-between border-b border-zinc-100 pb-2">
                          <span className="text-zinc-400">是否超时：</span>
                          <span className={selectedTeachingStudent.duration > selectedTeachingTask.taskDurationLimit ? "text-rose-600 font-black" : "text-emerald-600 font-black"}>
                            {selectedTeachingStudent.duration > selectedTeachingTask.taskDurationLimit ? "超时超出标准" : "时间指标正常"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">系统评定：</span>
                          <span className="text-[#009b86] font-black text-sm">{selectedTeachingStudent.score !== "--" ? `${selectedTeachingStudent.score}分` : "待评分"}</span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[10px] text-zinc-400 font-black uppercase tracking-wider block">学生提交备注或客观评语</span>
                        <div className="bg-[#e6f5f3]/40 border border-teal-150/10 rounded-xl p-3.5 text-xs text-zinc-700 leading-relaxed font-semibold">
                          {selectedTeachingStudent.comment}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 text-xs">
                        <button
                          onClick={() => {
                            setSelectedTeachingStudent(null);
                            setActiveSubTab("manage");
                          }}
                          className="px-5 py-2.2 bg-[#009b86] hover:bg-emerald-700 text-white rounded-xl font-black transition-all cursor-pointer shadow-sm"
                        >
                          前去评分和编辑报告评语
                        </button>
                      </div>

                    </div>
                  </div>
                )}

              </div>
            )}

            {/* ======================================================================= */}
            {/* VIEW: MY TEACHING - STUDENTS STATUS (学生学习情况) */}
            {/* ======================================================================= */}
            {activeSubTab === "my_teaching_students" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs gap-4">
                  <div className="space-y-1">
                    <span className="bg-[#e6f5f3] text-[#009b86] text-[10px] px-2.5 py-1 rounded font-black uppercase tracking-wider font-mono">
                      教师工作台 / 我的教学
                    </span>
                    <h1 className="text-xl font-black text-zinc-900 tracking-tight">学生学习情况</h1>
                    <p className="text-xs text-zinc-500 font-semibold max-w-2xl mt-1">
                      追踪班群和每一位学生的学时和综合成就。
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
                  <div className="px-5 py-4 border-b border-zinc-150 bg-zinc-50/50 flex justify-between items-center text-xs">
                    <span className="font-black text-zinc-850">学生个体学期实训档案</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-zinc-50 text-zinc-500 font-black border-b border-zinc-200/80">
                          <th className="px-4 py-3">学生</th>
                          <th className="px-3 py-3">学号</th>
                          <th className="px-3 py-3">班级</th>
                          <th className="px-3 py-3 text-center">累计完成任务</th>
                          <th className="px-3 py-3 text-center">综合平均分</th>
                          <th className="px-3 py-3 text-center">学期活跃天数</th>
                          <th className="px-4 py-3 text-right">学情标签</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 font-semibold text-zinc-700">
                        {[
                          { name: "学生1", sno: "20230101", className: "物联网2301班", completed: "12/12", score: "91.8", active: "28天", badge: "实绩突出" },
                          { name: "学生2", sno: "20230102", className: "物联网2301班", completed: "11/12", score: "87.5", active: "25天", badge: "操作扎实" },
                          { name: "张三", sno: "20230103", className: "物联网2301班", completed: "10/12", score: "89.0", active: "26天", badge: "积极钻研" },
                          { name: "学生4", sno: "20230104", className: "物联网2301班", completed: "12/12", score: "93.4", active: "30天", badge: "完成度优" }
                        ].map((stu, index) => (
                          <tr key={index} className="hover:bg-zinc-50/50 transition-colors">
                            <td className="px-4 py-3 text-zinc-900 font-black">{stu.name}</td>
                            <td className="px-3 py-3 font-mono text-zinc-400">{stu.sno}</td>
                            <td className="px-3 py-3 text-zinc-650">{stu.className}</td>
                            <td className="px-3 py-3 text-center text-[#009b86] font-extrabold">{stu.completed}</td>
                            <td className="px-3 py-3 text-center font-mono font-bold text-zinc-900">{stu.score}</td>
                            <td className="px-3 py-3 text-center font-mono text-zinc-500">{stu.active}</td>
                            <td className="px-4 py-3 text-right">
                              <span className="bg-[#e6f5f3] text-[#009b86] px-2.5 py-0.5 rounded text-[10px] font-black">
                                {stu.badge}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================================= */}
            {/* VIEW: MY TEACHING - DURATION STATISTICS (学习时长统计) */}
            {/* ======================================================================= */}
            {activeSubTab === "my_teaching_duration" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs gap-4">
                  <div className="space-y-1">
                    <span className="bg-[#e6f5f3] text-[#009b86] text-[10px] px-2.5 py-1 rounded font-black uppercase tracking-wider font-mono">
                      教师工作台 / 我的教学
                    </span>
                    <h1 className="text-xl font-black text-zinc-900 tracking-tight">学习时长统计</h1>
                    <p className="text-xs text-zinc-500 font-semibold max-w-2xl mt-1">
                      物联网仿真实验中，各任务时长波动的极性与均值分析。
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-4">
                  <span className="text-xs font-black text-zinc-800 block border-b border-zinc-100 pb-2">本学期关键实验平均用时趋势 (分钟)</span>
                  
                  <div className="space-y-3 text-xs font-semibold text-zinc-600">
                    <div className="flex items-center gap-4">
                      <span className="w-48 text-zinc-500 font-bold truncate">实验1：MQTT订阅与推送实验</span>
                      <div className="grow bg-zinc-100 h-6.5 rounded overflow-hidden relative">
                        <div className="bg-teal-500 h-full flex items-center justify-end pr-2 font-mono text-[10px] font-black text-white" style={{ width: "42%" }}>
                          42分钟
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="w-48 text-zinc-500 font-bold truncate">实验2：阿里云物联网创建物模型</span>
                      <div className="grow bg-zinc-100 h-6.5 rounded overflow-hidden relative">
                        <div className="bg-teal-600 h-full flex items-center justify-end pr-2 font-mono text-[10px] font-black text-white" style={{ width: "75%" }}>
                          75分钟
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="w-48 text-zinc-500 font-bold truncate">实验3：物联网网关配置与下发</span>
                      <div className="grow bg-zinc-100 h-6.5 rounded overflow-hidden relative">
                        <div className="bg-[#009b86] h-full flex items-center justify-end pr-2 font-mono text-[10px] font-black text-white" style={{ width: "95%" }}>
                          94.8分钟
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="w-48 text-zinc-500 font-bold truncate">实验4：Linux操作系统文件访问权限</span>
                      <div className="grow bg-zinc-100 h-6.5 rounded overflow-hidden relative">
                        <div className="bg-indigo-500 h-full flex items-center justify-end pr-2 font-mono text-[10px] font-black text-white" style={{ width: "55%" }}>
                          55分钟
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 1: Main Task Assign Tab */}
            {activeSubTab === "assign" && (
              <div className="space-y-6">

                {/* Standard Title bar */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs gap-4">
                  <div className="space-y-1">
                    <span className="bg-[#e6f5f3] text-[#009b86] text-[10px] px-2.5 py-1 rounded font-black uppercase tracking-wider">
                      教师工作台 / 资源配置
                    </span>
                    <h1 className="text-xl font-black text-zinc-900 tracking-tight">任务下发</h1>
                    <p className="text-xs text-zinc-500 font-medium max-w-2xl">
                      教师可选择课程资源、资源章节、班级和学生，设置任务时长后下发学习或实验任务。
                    </p>
                  </div>
                  
                  <button
                    onClick={() => onTabChange("dashboard")}
                    className="px-4.5 py-2 whitespace-nowrap bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-black rounded-lg hover:shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>返回教师工作台</span>
                  </button>
                </div>

                {/* Sub-header progress line indicators */}
                <div className="bg-white border border-zinc-200 rounded-2xl px-6 py-3.5 flex flex-wrap justify-between items-center text-xs text-zinc-400 font-extrabold select-none gap-2">
                  <div className="flex items-center gap-2 text-[#009b86]">
                    <span className="w-5 h-5 rounded-full bg-[#e6f5f3] text-[#009b86] border border-[#009b86]/35 flex items-center justify-center text-[10px]">1</span>
                    <span>选择课程资源</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-300" />

                  <div className="flex items-center gap-2 text-[#009b86]">
                    <span className="w-5 h-5 rounded-full bg-[#e6f5f3] text-[#009b86] border border-[#009b86]/35 flex items-center justify-center text-[10px]">2</span>
                    <span>选择章节</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-300" />

                  <div className="flex items-center gap-2 text-[#009b86]">
                    <span className="w-5 h-5 rounded-full bg-[#e6f5f3] text-[#009b86] border border-[#009b86]/35 flex items-center justify-center text-[10px]">3</span>
                    <span>指定班级与学生</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-300" />

                  <div className="flex items-center gap-2 text-[#009b86]">
                    <span className="w-5 h-5 rounded-full bg-[#e6f5f3] text-[#009b86] border border-[#009b86]/35 flex items-center justify-center text-[10px]">4</span>
                    <span>设置任务时长</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-300" />

                  <div className="flex items-center gap-2 text-zinc-450">
                    <span className="w-5 h-5 rounded-full bg-zinc-100 text-zinc-450 border border-zinc-200 flex items-center justify-center text-[10px]">5</span>
                    <span>确认下发</span>
                  </div>
                </div>

                {/* Dual Column Layout: Left (Inputs) vs Right (Preview) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Column Input fields (70%) */}
                  <div className="lg:col-span-8 space-y-6">

                    {/* Form Block 1: Tasks Base info */}
                    <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-5 shadow-xs">
                      <div className="border-b border-zinc-100 pb-3 flex items-center gap-2">
                        <div className="w-1 bg-[#009b86] h-4 rounded"></div>
                        <h2 className="text-xs font-black uppercase text-zinc-900 tracking-wider">
                          任务基本信息
                        </h2>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-zinc-700">
                        
                        {/* 1. Task Name Input */}
                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-zinc-650 flex items-center gap-1">
                            <span>任务名称</span>
                            <span className="text-rose-500">*</span>
                          </label>
                          <input 
                            type="text" 
                            value={taskName}
                            onChange={(e) => setTaskName(e.target.value)}
                            className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl px-3.5 py-2.5 focus:border-[#009b86] focus:bg-white outline-none transition-all placeholder-zinc-400 font-semibold"
                            placeholder="请输入任务名称"
                          />
                        </div>

                        {/* 2. Task Category dropdown */}
                        <div className="space-y-1.5">
                          <label className="text-zinc-650 flex items-center gap-1">
                            <span>任务类型</span>
                            <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <select
                              value={taskType}
                              onChange={(e) => setTaskType(e.target.value)}
                              className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl px-3.5 py-2.5 appearance-none focus:border-[#009b86] outline-none transition-all font-semibold"
                            >
                              <option value="实验实训">实验实训</option>
                              <option value="课程学习">课程学习</option>
                              <option value="章节作业">章节作业</option>
                              <option value="综合任务">综合任务</option>
                            </select>
                            <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3.5 top-3.5 pointer-events-none" />
                          </div>
                        </div>

                        {/* 3. Courses select */}
                        <div className="space-y-1.5">
                          <label className="text-zinc-650 flex items-center gap-1">
                            <span>课程资源</span>
                            <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <select
                              value={selectedCourse}
                              onChange={(e) => setSelectedCourse(e.target.value)}
                              className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl px-3.5 py-2.5 appearance-none focus:border-[#009b86] outline-none transition-all font-semibold"
                            >
                              <option value="物联网设备开发实战">物联网设备开发实战</option>
                              <option value="Linux操作系统">Linux操作系统</option>
                              <option value="边缘计算技术应用">边缘计算技术应用</option>
                              <option value="工业互联网应用开发">工业互联网应用开发</option>
                              <option value="人工智能基础">人工智能基础</option>
                            </select>
                            <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3.5 top-3.5 pointer-events-none" />
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Form Block 2: Interactive Tree Selection */}
                    <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-5 shadow-xs">
                      <div className="border-b border-zinc-100 pb-3 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-1 bg-[#009b86] h-4 rounded"></div>
                          <h2 className="text-xs font-black uppercase text-zinc-900 tracking-wider">
                            选择资源章节
                          </h2>
                        </div>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          当前所属课程：{selectedCourse}
                        </span>
                      </div>

                      {/* Tree wrapper card */}
                      <div className="border border-zinc-200 rounded-2xl bg-zinc-50/40 p-4 space-y-2 max-h-[360px] overflow-y-auto">
                        <p className="text-[10px] font-black text-[#009b86] flex items-center gap-1 mb-2">
                          <Info className="w-3.5 h-3.5" />
                          <span>请在树形结构下勾选指定任务资源章节：</span>
                        </p>
                        
                        {courseChapters.map((node) => {
                          const isExpanded = expandedChapters.includes(node.id);
                          const isSelected = selectedChapters.includes(node.id);
                          const hasChildren = node.children && node.children.length > 0;
                          
                          // Check if some children are selected
                          const isSemiSelected = hasChildren && 
                            node.children?.some(c => selectedChapters.includes(c.id)) && 
                            !node.children?.every(c => selectedChapters.includes(c.id));

                          return (
                            <div key={node.id} className="space-y-1 font-semibold text-xs text-zinc-800">
                              <div className="flex items-center justify-between p-1.5 hover:bg-zinc-150/40 rounded-lg group transition-colors">
                                <div className="flex items-center gap-2 flex-1">
                                  
                                  {/* Chevron expand trigger */}
                                  {hasChildren ? (
                                    <button 
                                      type="button"
                                      onClick={() => handleToggleExpand(node.id)}
                                      className="p-0.5 hover:bg-zinc-200 rounded text-zinc-400 group-hover:text-zinc-600 transition-colors cursor-pointer"
                                    >
                                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                    </button>
                                  ) : (
                                    <div className="w-4.5" />
                                  )}

                                  {/* Tree checkbox */}
                                  <button
                                    type="button"
                                    onClick={() => handleToggleChapter(node)}
                                    className="text-zinc-450 hover:text-[#009b86] transition-colors cursor-pointer shrink-0"
                                  >
                                    {isSelected ? (
                                      <CheckSquare className="w-4 h-4 text-[#009b86]" />
                                    ) : isSemiSelected ? (
                                      <span className="w-4 h-4 inline-flex items-center justify-center bg-teal-50 border border-[#009b86] text-[#009b86] rounded text-[8px] font-black leading-none">■</span>
                                    ) : (
                                      <Square className="w-4 h-4" />
                                    )}
                                  </button>

                                  <span className={`cursor-pointer ${isSelected ? "text-[#009b86] font-black" : "text-zinc-800"}`} onClick={() => handleToggleChapter(node)}>
                                    {node.label}
                                  </span>
                                </div>
                              </div>

                              {/* Render nested children */}
                              {hasChildren && isExpanded && (
                                <div className="pl-9 space-y-1 border-l border-zinc-200 ml-5">
                                  {node.children?.map(child => {
                                    const childSelected = selectedChapters.includes(child.id);
                                    return (
                                      <div key={child.id} className="flex items-center gap-2 py-1 select-none">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setSelectedChapters(prev => 
                                              prev.includes(child.id) ? prev.filter(i => i !== child.id) : [...prev, child.id]
                                            );
                                          }}
                                          className="text-zinc-450 hover:text-[#009b86] transition-colors cursor-pointer"
                                        >
                                          {childSelected ? (
                                            <CheckSquare className="w-4 h-4 text-[#009b86]" />
                                          ) : (
                                            <Square className="w-4 h-4" />
                                          )}
                                        </button>
                                        <span 
                                          className={`cursor-pointer ${childSelected ? "text-[#009b86] font-bold" : "text-zinc-650"}`}
                                          onClick={() => {
                                            setSelectedChapters(prev => 
                                              prev.includes(child.id) ? prev.filter(i => i !== child.id) : [...prev, child.id]
                                            );
                                          }}
                                        >
                                          {child.label}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Form Block 3: Student Selection Area (Dual panel) */}
                    <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-5 shadow-xs">
                      <div className="border-b border-zinc-100 pb-3 flex items-center gap-2">
                        <div className="w-1 bg-[#009b86] h-4 rounded"></div>
                        <h2 className="text-xs font-black uppercase text-zinc-900 tracking-wider">
                          指定学生
                        </h2>
                      </div>

                      {/* Main Dual structure */}
                      <div className="grid grid-cols-1 md:grid-cols-12 border border-zinc-200 rounded-2xl overflow-hidden min-h-[300px]">
                        
                        {/* Class sidebar list (Col-span 4) */}
                        <div className="md:col-span-4 bg-zinc-50/50 border-r border-zinc-200 p-4 space-y-2">
                          <span className="text-[10px] text-zinc-400 font-sans font-black tracking-wider uppercase block mb-2">选择任教班级</span>
                          {classesList.map(item => {
                            const isCurrent = item.id === selectedClassId;
                            return (
                              <button
                                key={item.id}
                                onClick={() => {
                                  setSelectedClassId(item.id);
                                  showToast(`已切换至班级：${item.name}`);
                                }}
                                className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex justify-between items-center ${
                                  isCurrent 
                                    ? "bg-[#e6f5f3] text-[#009b86] border-[#009b86]/35 font-extrabold" 
                                    : "bg-white text-zinc-700 border-zinc-150 hover:border-zinc-300 font-semibold"
                                }`}
                              >
                                <span className="truncate">{item.name}</span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${isCurrent ? "bg-[#009b86] text-white" : "bg-zinc-100 text-zinc-500"}`}>
                                  {item.count}人
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Students selection Grid (Col-span 8) */}
                        <div className="md:col-span-8 p-4 bg-white space-y-4 flex flex-col justify-between">
                          <div className="space-y-3">
                            {/* Panel header controls */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-3">
                              <div className="space-y-0.5">
                                <span className="text-xs font-black text-zinc-900">{activeClassName}</span>
                                <span className="text-[10px] text-zinc-400 block font-semibold">
                                  共 42 人 ｜ 已选择 <span className="text-[#009b86] font-bold">{selectedStudentIds.length}</span> 人
                                </span>
                              </div>

                              <div className="flex items-center gap-1 text-[10px] uppercase font-bold shrink-0">
                                <button
                                  onClick={handleStudentSelectAll}
                                  className="px-2.5 py-1.2 bg-zinc-50 hover:bg-[#e6f5f3] border border-zinc-250 hover:border-[#009b86]/30 text-zinc-700 hover:text-[#009b86] rounded-md transition-all cursor-pointer"
                                >
                                  全选
                                </button>
                                <button
                                  onClick={handleStudentInvert}
                                  className="px-2.5 py-1.2 bg-zinc-50 hover:bg-[#e6f5f3] border border-zinc-250 hover:border-[#009b86]/30 text-zinc-700 hover:text-[#009b86] rounded-md transition-all cursor-pointer"
                                >
                                  反选
                                </button>
                                <button
                                  onClick={handleStudentClear}
                                  className="px-2.5 py-1.2 bg-zinc-50 hover:bg-rose-50 border border-zinc-255 text-zinc-600 hover:text-rose-600 rounded-md transition-all cursor-pointer"
                                >
                                  清空
                                </button>
                              </div>
                            </div>

                            {/* Scrollable high density grid of visual student options */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[220px] overflow-y-auto pr-1">
                              {initialStudents.map((student) => {
                                const checked = selectedStudentIds.includes(student.id);
                                return (
                                  <div 
                                    key={student.id}
                                    onClick={() => handleToggleStudent(student.id)}
                                    className={`p-2.5 border rounded-xl flex items-center gap-2.5 cursor-pointer text-xs transition-all ${
                                      checked 
                                        ? "border-[#009b86] bg-[#e6f5f3]/15" 
                                        : "border-zinc-200 bg-zinc-50 hover:border-zinc-300"
                                    }`}
                                  >
                                    <div className="shrink-0">
                                      {checked ? (
                                        <CheckSquare className="w-4 h-4 text-[#009b86]" />
                                      ) : (
                                        <Square className="w-4 h-4 text-zinc-300" />
                                      )}
                                    </div>
                                    <div className="leading-tight">
                                      <span className={`font-black block ${checked ? "text-[#009b86]" : "text-zinc-800"}`}>
                                        {student.name}
                                      </span>
                                      <span className="text-[9px] text-zinc-400 font-mono italic">
                                        {student.sno}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}

                              {/* Virtual remaining students disclaimer card to convey realistic richness */}
                              <div className="p-2.5 border border-dashed border-zinc-200 bg-zinc-50/30 rounded-xl flex items-center justify-center text-center">
                                <span className="text-[10px] text-zinc-400 font-semibold italic">
                                  其余 32 名学生已默认包含
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-zinc-50 border border-zinc-150 p-2.5 rounded-xl flex items-center gap-2.5 text-[10px] text-zinc-500 text-left font-semibold">
                            <Users className="w-4 h-4 text-[#009b86] shrink-0" />
                            <span>支持快速筛选。下发时将针对这 {selectedStudentIds.length + 32} 名学生统一生成对应的考核任务实例与云端实训空间。</span>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Form Block 4: Target Task Duration & Schedule */}
                    <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-5 shadow-xs">
                      <div className="border-b border-zinc-100 pb-3 flex items-center gap-2">
                        <div className="w-1 bg-[#009b86] h-4 rounded"></div>
                        <h2 className="text-xs font-black uppercase text-zinc-900 tracking-wider">
                          任务时长与约束
                        </h2>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-bold text-zinc-700">
                        
                        {/* Task Duration Numeric */}
                        <div className="space-y-1.5">
                          <label className="text-zinc-650 flex items-center justify-between">
                            <span>任务时长</span>
                            <span className="text-zinc-400 font-mono text-[10px]">学生预计需占时</span>
                          </label>
                          <div className="flex gap-2">
                            <input 
                              type="number" 
                              value={duration}
                              onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 0))}
                              className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl px-3.5 py-2.5 focus:border-[#009b86] focus:bg-white outline-none transition-all font-semibold"
                            />
                            <select
                              value={durationUnit}
                              onChange={(e) => setDurationUnit(e.target.value)}
                              className="bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl px-3 py-2 outline-none cursor-pointer"
                            >
                              <option value="分钟">分钟</option>
                              <option value="小时">小时</option>
                            </select>
                          </div>
                          <span className="text-[10px] text-zinc-450 font-medium block">
                            折合：{(duration / 60).toFixed(1)} 小时。可在评测后台配置软阈值预警。
                          </span>
                        </div>

                        {/* Deadline Datepicker simulation */}
                        <div className="space-y-1.5">
                          <label className="text-zinc-650 flex items-center justify-between">
                            <span>截止时间</span>
                            <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <input 
                              type="text" 
                              value={deadline}
                              onChange={(e) => setDeadline(e.target.value)}
                              className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl px-3.5 py-2.5 focus:border-[#009b86] focus:bg-white outline-none transition-all font-semibold"
                            />
                            <Calendar className="w-4 h-4 text-zinc-400 absolute right-3.5 top-3.5 pointer-events-none" />
                          </div>
                          <span className="text-[10px] text-zinc-450 font-medium block">
                            建议设置在周末或课程周期结束之后。
                          </span>
                        </div>

                        {/* Description textbox */}
                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-zinc-650">任务说明</label>
                          <textarea 
                            value={taskDesc}
                            onChange={(e) => setTaskDesc(e.target.value)}
                            rows={3}
                            className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl p-3.5 focus:border-[#009b86] focus:bg-white outline-none transition-all placeholder-zinc-400 font-semibold"
                            placeholder="请输入发布给学生的任务说明、指导性话语或考前要求"
                          />
                        </div>

                      </div>
                    </div>

                  </div>

                  {/* Right Column REAL-TIME Preview Block sticky (40%) */}
                  <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
                    
                    {/* Block A: Task Preview */}
                    <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-4">
                      <div className="border-b border-zinc-100 pb-3">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Real-time Preview</span>
                        <h3 className="text-xs font-black text-zinc-900 uppercase">任务预览</h3>
                      </div>

                      <div className="space-y-3.5 text-xs font-medium text-zinc-700">
                        <div>
                          <span className="text-zinc-400 text-[10px] block font-bold">任务名称</span>
                          <span className="text-zinc-900 font-black text-sm block mt-0.5">{taskName || "未命名任务"}</span>
                        </div>

                        <div>
                          <span className="text-zinc-400 text-[10px] block font-bold">课程资源</span>
                          <span className="text-zinc-900 font-bold block mt-0.5">{selectedCourse}</span>
                        </div>

                        <div>
                          <span className="text-zinc-400 text-[10px] block font-bold">资源章节</span>
                          <span className="text-[#009b86] font-bold block mt-0.5 leading-relaxed bg-[#e6f5f3]/30 p-2 rounded-lg border border-[#009b86]/10">
                            {getSelectedChaptersLabels}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3.5">
                          <div>
                            <span className="text-zinc-400 text-[10px] block font-bold">指定班级</span>
                            <span className="text-zinc-900 font-bold block mt-0.5">{activeClassName}</span>
                          </div>
                          <div>
                            <span className="text-zinc-400 text-[10px] block font-bold">指定学生</span>
                            <span className="text-zinc-950 font-bold block mt-0.5">已选择 {selectedStudentIds.length + 32} 名学生</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3.5 border-t border-zinc-100 pt-3">
                          <div>
                            <span className="text-zinc-400 text-[10px] block font-bold">任务时长</span>
                            <span className="text-zinc-900 font-bold block mt-0.5">{duration} {durationUnit}</span>
                          </div>
                          <div>
                            <span className="text-zinc-400 text-[10px] block font-bold">截止时间</span>
                            <span className="text-rose-600 font-black block mt-0.5">{deadline}</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-zinc-400 text-[10px] block font-bold">任务说明</span>
                          <p className="text-zinc-500 text-[11px] font-medium leading-relaxed mt-0.5 break-all max-h-[80px] overflow-y-auto">
                            {taskDesc || "无任务说明项"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Block B: Recipient summary card */}
                    <div className="bg-gradient-to-br from-zinc-550 to-zinc-700 bg-slate-800 text-white border border-slate-700 rounded-2xl p-5 space-y-4">
                      <div className="border-b border-white/10 pb-3 flex justify-between items-center">
                        <h4 className="text-xs font-black text-white flex items-center gap-1.5 uppercase">
                          <CheckCircle2 className="w-4 h-4 text-teal-400" />
                          <span>下发对象</span>
                        </h4>
                        <span className="text-[9px] bg-teal-400/20 text-teal-400 px-1.5 py-0.5 rounded font-mono font-bold">
                          配置就绪
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3.5 text-xs text-slate-300 font-medium font-mono">
                        <div>
                          <span className="text-slate-400 text-[9px] block">班级数量</span>
                          <span className="text-white font-extrabold text-sm block mt-0.5">1 个</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[9px] block">学生数量</span>
                          <span className="text-white font-extrabold text-sm block mt-0.5">42 人</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[9px] block">课程章节</span>
                          <span className="text-white font-extrabold text-sm block mt-0.5">{selectedChapters.length} 个</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[9px] block">预计时长</span>
                          <span className="text-white font-extrabold text-xs block mt-0.5 uppercase tracking-wide">
                            {duration} {durationUnit}
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>

                {/* Common action drawers (Cancel, Save draft, Confirm) */}
                <div className="bg-white border border-zinc-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <span className="text-zinc-400 font-medium">请核对右侧预览信息正确无误后，即可点击一键确认下发至选中的学生。</span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onTabChange("dashboard")}
                      className="px-5 py-2.2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-600 font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      取消
                    </button>
                    <button
                      onClick={() => showToast("任务草稿保存成功")}
                      className="px-5 py-2.2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      保存草稿
                    </button>
                    <button
                      onClick={() => showToast("已成功启动后台任务渲染预览...")}
                      className="px-5 py-2.2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      预览任务
                    </button>
                    <button
                      onClick={handleDeliver}
                      className="px-6 py-2.2 bg-[#009b86] hover:bg-emerald-700 text-white font-black rounded-lg shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>确认下发</span>
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* VIEW 2: Tasks list Logs overview */}
            {activeSubTab === "manage" && (
              <div className="space-y-6">
                
                {/* A. Header bar */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs gap-4 animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <span className="bg-[#e6f5f3] text-[#009b86] text-[10px] px-2.5 py-1 rounded font-black uppercase tracking-wider">
                      教师工作台 / 资源配置
                    </span>
                    <h1 className="text-xl font-black text-zinc-900 tracking-tight">任务管理</h1>
                    <p className="text-xs text-zinc-500 font-semibold max-w-2xl mt-1">
                      教师可查看已下发任务的完成进度，并对已提交的实验报告进行客观细致的评分评价。
                    </p>
                  </div>
                  
                  <button
                    onClick={() => {
                      setActiveSubTab("assign");
                      setIsSuccess(false);
                    }}
                    className="px-4.5 py-2.2 whitespace-nowrap bg-[#009b86] hover:bg-emerald-700 text-white text-xs font-black rounded-lg hover:shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>下发新任务</span>
                  </button>
                </div>

                {/* B. Filter pane */}
                <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4 shadow-xs">
                  <div className="flex items-center gap-2 border-b border-zinc-100 pb-2.5">
                    <Search className="w-4 h-4 text-[#009b86]" />
                    <span className="text-xs font-black text-zinc-800">任务快速筛选</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5 text-xs font-bold text-zinc-700">
                    <div className="space-y-1">
                      <label className="text-zinc-650 block text-[11px]">任务名称</label>
                      <input
                        type="text"
                        value={searchTaskName}
                        onChange={(e) => setSearchTaskName(e.target.value)}
                        placeholder="请输入任务名称"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.8 text-zinc-900 outline-none text-xs focus:bg-white focus:border-[#009b86] font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-zinc-650 block text-[11px]">课程资源</label>
                      <select
                        value={selectedCourseFilter}
                        onChange={(e) => setSelectedCourseFilter(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1.8 text-zinc-950 outline-none text-xs font-semibold cursor-pointer"
                      >
                        <option value="全部课程">全部课程</option>
                        <option value="物联网设备开发实战">物联网设备开发实战</option>
                        <option value="Linux操作系统">Linux操作系统</option>
                        <option value="边缘计算技术应用">边缘计算技术应用</option>
                        <option value="工业互联网应用开发">工业互联网应用开发</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-zinc-650 block text-[11px]">指定班级</label>
                      <select
                        value={selectedClassFilter}
                        onChange={(e) => setSelectedClassFilter(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1.8 text-zinc-950 outline-none text-xs font-semibold cursor-pointer"
                      >
                        <option value="全部班级">全部班级</option>
                        <option value="物联网2301班">物联网2301班</option>
                        <option value="物联网2302班">物联网2302班</option>
                        <option value="工业互联网2301班">工业互联网2301班</option>
                        <option value="人工智能2301班">人工智能2301班</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-zinc-650 block text-[11px]">完成状态</label>
                      <select
                        value={selectedStatusFilter}
                        onChange={(e) => setSelectedStatusFilter(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1.8 text-zinc-950 outline-none text-xs font-semibold cursor-pointer"
                      >
                        <option value="全部状态">全部状态</option>
                        <option value="未开始">未开始</option>
                        <option value="进行中">进行中</option>
                        <option value="已完成">已完成</option>
                        <option value="已评分">已评分</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-zinc-650 block text-[11px]">时间范围</label>
                      <div className="grid grid-cols-2 gap-1 items-center">
                        <input
                          type="date"
                          value={startDateFilter}
                          onChange={(e) => setStartDateFilter(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-1.5 py-1 text-[10px] outline-none text-zinc-800 font-bold"
                        />
                        <input
                          type="date"
                          value={endDateFilter}
                          onChange={(e) => setEndDateFilter(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-1.5 py-1 text-[10px] outline-none text-zinc-800 font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1 border-t border-zinc-100 mt-2">
                    <button
                      onClick={handleResetFilters}
                      className="px-4 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-600 font-bold text-xs transition-colors cursor-pointer"
                    >
                      重置
                    </button>
                    <button
                      onClick={() => showToast("已成功应用筛选条件")}
                      className="px-4 py-1.5 rounded-lg bg-[#009b86] hover:bg-[#00806e] text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      查询
                    </button>
                  </div>
                </div>

                {/* C. Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { label: "已下发任务", val: 18, unit: "个", desc: "历史累计核发", color: "text-[#009b86] bg-teal-50/50 border-teal-100" },
                    { label: "进行中任务", val: 7, unit: "个", desc: "学生正在研讨中", color: "text-blue-600 bg-blue-50/50 border-blue-100" },
                    { label: "已完成任务", val: 9, unit: "个", desc: "通道已锁止归档", color: "text-zinc-700 bg-zinc-100/60 border-zinc-200" },
                    { label: "待评分任务", val: pendingGradingCount, unit: "份", desc: "待主观评价批注", color: "text-rose-600 bg-rose-50/50 border-rose-100 font-extrabold" },
                    { label: "平均完成率", val: "82%", unit: "", desc: "班级总进度均值", color: "text-amber-600 bg-amber-50/50 border-amber-100" }
                  ].map((stat, i) => (
                    <div key={i} className={`p-4 border rounded-2xl ${stat.color} font-sans shadow-xs flex flex-col justify-between h-24 select-none`}>
                      <span className="text-[10px] font-bold block opacity-85">{stat.label}</span>
                      <div className="flex items-baseline gap-0.5 my-1">
                        <span className="text-2xl font-black">{stat.val}</span>
                        {stat.unit && <span className="text-xs font-extrabold">{stat.unit}</span>}
                      </div>
                      <span className="text-[9px] font-medium opacity-70 truncate block">{stat.desc}</span>
                    </div>
                  ))}
                </div>

                {/* D. Table list */}
                <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
                  <div className="px-5 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/30">
                    <span className="text-xs font-black text-zinc-900">下发的历史任务清单 ({filteredTasks.length} 个)</span>
                    <span className="text-[10px] text-zinc-400 font-semibold font-mono">2026/06 系统快照</span>
                  </div>

                  <div className="overflow-x-auto text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-zinc-50/70 text-zinc-500 font-bold border-b border-zinc-200 text-[10px] uppercase tracking-wide">
                          <th className="p-3.5 pl-5">任务名称</th>
                          <th className="p-3.5">课程资源</th>
                          <th className="p-3.5">配置章节</th>
                          <th className="p-3.5">学习班级</th>
                          <th className="p-3.5 text-center">下发数</th>
                          <th className="p-3.5 text-center">已完成</th>
                          <th className="p-3.5 text-center">完成率</th>
                          <th className="p-3.5 text-center">时长</th>
                          <th className="p-3.5">截止期限</th>
                          <th className="p-3.5 text-center">状态</th>
                          <th className="p-3.5 text-right pr-5">管理操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 font-medium text-zinc-700">
                        {filteredTasks.length === 0 ? (
                          <tr>
                            <td colSpan={11} className="text-center p-8 text-zinc-400 font-bold">
                              暂无符合该筛选条件下的发布记录任务
                            </td>
                          </tr>
                        ) : (
                          filteredTasks.map((task) => {
                            const isSelected = selectedTaskId === task.id;
                            const compRate = Math.round((task.completions / task.assignedCount) * 100);
                            return (
                              <tr
                                key={task.id}
                                className={`transition-all hover:bg-zinc-50/50 ${isSelected ? "bg-teal-50/25 font-semibold text-zinc-950" : ""}`}
                              >
                                <td className="p-3.5 pl-5">
                                  <span className="font-extrabold text-zinc-900 block">{task.name}</span>
                                </td>
                                <td className="p-3.5 text-zinc-500">{task.course}</td>
                                <td className="p-3.5 text-zinc-400 font-mono text-[11px] truncate max-w-[140px]" title={task.chapter}>{task.chapter}</td>
                                <td className="p-3.5 font-bold text-zinc-700">{task.className}</td>
                                <td className="p-3.5 text-center font-mono">{task.assignedCount}</td>
                                <td className="p-3.5 text-center font-mono text-emerald-600 font-bold">{task.completions}</td>
                                <td className="p-3.5 text-center font-mono">
                                  <div className="flex items-center justify-center gap-1">
                                    <span style={{ color: compRate === 100 ? "#009b86" : "#4b5563" }} className="font-bold">{compRate}%</span>
                                  </div>
                                </td>
                                <td className="p-3.5 text-center font-mono">{task.duration}</td>
                                <td className="p-3.5 text-rose-600 font-mono text-[11px]">{task.deadline}</td>
                                <td className="p-3.5 text-center">
                                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-black ${
                                    task.status === "已完成" 
                                      ? "bg-zinc-100 text-zinc-500" 
                                      : task.status === "待评分"
                                      ? "bg-rose-50 text-rose-600"
                                      : "bg-teal-50 text-[#009b86]"
                                  }`}>
                                    {task.status}
                                  </span>
                                </td>
                                <td className="p-3.5 text-right pr-5 whitespace-nowrap">
                                  <div className="flex items-center justify-end gap-3 font-black text-[#009b86]">
                                    <button
                                      onClick={() => {
                                        setSelectedTaskId(task.id);
                                        showToast(`已定位并载入任务【${task.name}】的学情统计面板`);
                                      }}
                                      className="hover:text-teal-900 cursor-pointer"
                                    >
                                      查看完成情况
                                    </button>
                                    <span className="text-zinc-200">|</span>
                                    <button
                                      onClick={() => {
                                        setSelectedTaskId(task.id);
                                        const pending = task.completedList.find(s => s.gradeStatus === "未评分" && s.status === "已完成");
                                        if (pending) {
                                          setGradingStudent(pending);
                                          setGradeCompletion(36);
                                          setGradeRegulation(18);
                                          setGradeCorrectness(17);
                                          setGradeReportQuality(18);
                                          setGradeComment(
                                            "实验流程完整，设备接入和数据上报结果正确，报告结构较清晰。建议进一步补充异常情况排查过程。"
                                          );
                                          showToast(`正在对学生 ${pending.name} 进行主观评分`);
                                        } else {
                                          showToast(`当前任务暂无需要打分的已完成学生。`);
                                        }
                                      }}
                                      className="hover:text-teal-900 cursor-pointer"
                                    >
                                      评分
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* E. Sub-detail section for student list */}
                {selectedTask && (
                  <div className="space-y-6">
                    <div className="bg-white border border-zinc-200 rounded-3xl p-6 space-y-6 shadow-sm animate-in fade-in duration-300">
                      
                      {/* Header info */}
                      <div className="border-b border-zinc-100 pb-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div className="space-y-1.5 text-xs text-zinc-500">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-teal-50 text-[#009b86] border border-teal-200 px-2 py-0.5 rounded font-black max-w-max uppercase tracking-wider block">
                              学生完成情况
                            </span>
                          </div>
                          <h2 className="text-base font-black text-zinc-900">{selectedTask.name}</h2>
                          
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 font-semibold text-zinc-500 text-[11px] pt-1">
                            <div>
                              <span className="text-zinc-450">课程资源：</span>
                              <span className="text-zinc-800 font-bold">{selectedTask.course}</span>
                            </div>
                            <div>
                              <span className="text-zinc-450">资源章节：</span>
                              <span className="text-[#009b86] font-bold">{selectedTask.chapter}</span>
                            </div>
                            <div>
                              <span className="text-zinc-450">匹配班级：</span>
                              <span className="text-zinc-800 font-bold">{selectedTask.className}</span>
                            </div>
                            <div>
                              <span className="text-zinc-450">时长：</span>
                              <span className="text-zinc-800 font-bold">{selectedTask.duration}</span>
                            </div>
                            <div>
                              <span className="text-zinc-450">截止期限：</span>
                              <span className="text-rose-600 font-bold">{selectedTask.deadline}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => showToast(`正在导出任务【${selectedTask.name}】至Excel电子表格中`)}
                            className="px-3.5 py-1.8 border border-zinc-200 hover:border-[#009b86] text-zinc-700 hover:text-[#009b86] font-bold text-xs rounded-lg transition-colors cursor-pointer"
                          >
                            导出数据
                          </button>
                          <button
                            onClick={() => showToast("已成功广播通知进行一键催交！")}
                            className="px-3.5 py-1.8 bg-[#009b86] hover:bg-[#00806e] text-white font-black text-xs rounded-lg transition-colors cursor-pointer"
                          >
                            一键催交
                          </button>
                        </div>
                      </div>

                      {/* Completion stats widget with progress bars */}
                      <div className="bg-zinc-50/50 rounded-2xl p-4.5 border border-zinc-200/60 text-xs">
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center pb-4 select-none">
                          <div>
                            <span className="text-zinc-400 text-[10px] block font-bold">下发人数</span>
                            <span className="text-lg font-black text-zinc-900 mt-1 block">{selectedTask.assignedCount} 人</span>
                          </div>
                          <div className="border-l border-zinc-250/50">
                            <span className="text-emerald-600 text-[10px] block font-bold">已完成</span>
                            <span className="text-lg font-black text-emerald-600 mt-1 block">
                              {selectedTask.completedList.filter((s: any) => s.status === "已完成").length} 人
                            </span>
                          </div>
                          <div className="border-l border-zinc-250/50">
                            <span className="text-zinc-400 text-[10px] block font-bold">未完成</span>
                            <span className="text-lg font-black text-amber-600 mt-1 block">
                              {selectedTask.assignedCount - selectedTask.completedList.filter((s: any) => s.status === "已完成").length} 人
                            </span>
                          </div>
                          <div className="border-l border-zinc-250/50">
                            <span className="text-[#009b86] text-[10px] block font-bold">已评分</span>
                            <span className="text-lg font-black text-[#009b86] mt-1 block">
                              {selectedTask.completedList.filter((s: any) => s.gradeStatus === "已评分").length} 人
                            </span>
                          </div>
                          <div className="border-l border-zinc-250/50">
                            <span className="text-rose-500 text-[10px] block font-bold">待评分</span>
                            <span className="text-lg font-black text-rose-500 mt-1 block">
                              {selectedTask.completedList.filter((s: any) => s.status === "已完成" && s.gradeStatus === "未评分").length} 人
                            </span>
                          </div>
                          <div className="border-l border-zinc-250/50">
                            <span className="text-zinc-500 text-[10px] block font-bold">平均分</span>
                            <span className="text-lg font-black text-[#009b86] mt-1 block">
                              {(() => {
                                const scoreStudents = selectedTask.completedList.filter((s: any) => typeof s.score === "number") as any[];
                                if (scoreStudents.length === 0) return "90.0";
                                const total = scoreStudents.reduce((acc, curr) => acc + curr.score, 0);
                                return (total / scoreStudents.length).toFixed(1);
                              })()} 分
                            </span>
                          </div>
                        </div>

                        {/* Small Progress sliders */}
                        <div className="border-t border-zinc-200/80 pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-1.5 font-bold">
                            <div className="flex justify-between items-center">
                              <span className="text-zinc-500 text-[11px]">任务完成率：</span>
                              <span className="text-[#009b86] text-[11px] font-mono">
                                {(() => {
                                  const cCount = selectedTask.completedList.filter((s: any) => s.status === "已完成").length;
                                  return Math.round((cCount / selectedTask.assignedCount) * 100);
                                })()}%
                              </span>
                            </div>
                            <div className="w-full bg-zinc-200 rounded-full h-2 overflow-hidden">
                              <div 
                                className="bg-[#009b86] h-2 rounded-full transition-all duration-300 pointer-events-none" 
                                style={{ 
                                  width: `${(() => {
                                    const cCount = selectedTask.completedList.filter((s: any) => s.status === "已完成").length;
                                    return Math.round((cCount / selectedTask.assignedCount) * 100);
                                  })()}%` 
                                }}
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5 font-bold">
                            <div className="flex justify-between items-center">
                              <span className="text-zinc-500 text-[11px]">评分完成率：</span>
                              <span className="text-[#009b86] text-[11px] font-mono">
                                {(() => {
                                  const finishedCount = selectedTask.completedList.filter((s: any) => s.status === "已完成").length;
                                  if (finishedCount === 0) return "100%";
                                  const gradedCount = selectedTask.completedList.filter((s: any) => s.gradeStatus === "已评分").length;
                                  return `${Math.round((gradedCount / finishedCount) * 100)}%`;
                                })()}
                              </span>
                            </div>
                            <div className="w-full bg-zinc-200 rounded-full h-2 overflow-hidden">
                              <div 
                                className="bg-[#009b86] h-2 rounded-full transition-all duration-300 pointer-events-none"
                                style={{ 
                                  width: (() => {
                                    const finishedCount = selectedTask.completedList.filter((s: any) => s.status === "已完成").length;
                                    if (finishedCount === 0) return "100%";
                                    const gradedCount = selectedTask.completedList.filter((s: any) => s.gradeStatus === "已评分").length;
                                    return `${Math.round((gradedCount / finishedCount) * 100)}%`;
                                  })() 
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Main Dual layout for student logs and list */}
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        
                        {/* Left column: Students table and bottom Operation logs */}
                        <div className="lg:col-span-3 space-y-6">

                          {/* Designated Student Query Card */}
                          <div className="bg-white border border-zinc-200 rounded-3xl p-6 space-y-4 shadow-sm animate-in slide-in-from-top-2 duration-300">
                            <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
                              <span className="font-extrabold text-zinc-800 text-[13px] flex items-center gap-1.5 select-none">
                                <span className="text-[#009b86] text-base">🔍</span>
                                <span className="font-black">指定学生查询</span>
                              </span>
                              <span className="text-[10px] text-[#009b86] bg-teal-50 border border-teal-200/40 px-2 py-0.5 rounded-md font-bold select-none">
                                精准学生定位与数据管理
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                              {/* 1. 学生姓名 */}
                              <div className="space-y-1.5">
                                <label className="block text-zinc-500 font-bold">学生姓名</label>
                                <input
                                  type="text"
                                  value={studentSearchName}
                                  onChange={(e) => setStudentSearchName(e.target.value)}
                                  placeholder="请输入学生姓名"
                                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg hover:border-zinc-300 focus:outline-none focus:border-[#009b86] bg-zinc-50/30 focus:bg-white font-semibold text-zinc-850 transition-all placeholder:text-zinc-400"
                                />
                              </div>

                              {/* 2. 学号 */}
                              <div className="space-y-1.5">
                                <label className="block text-zinc-500 font-bold">学号</label>
                                <input
                                  type="text"
                                  value={studentSearchSno}
                                  onChange={(e) => setStudentSearchSno(e.target.value)}
                                  placeholder="请输入学号"
                                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg hover:border-zinc-300 focus:outline-none focus:border-[#009b86] bg-zinc-50/30 focus:bg-white font-semibold text-zinc-850 transition-all placeholder:text-zinc-400"
                                />
                              </div>

                              {/* 3. 班级 */}
                              <div className="space-y-1.5">
                                <label className="block text-zinc-500 font-bold">班级</label>
                                <select
                                  value={studentSearchClass}
                                  onChange={(e) => setStudentSearchClass(e.target.value)}
                                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg hover:border-zinc-300 focus:outline-none focus:border-[#009b86] bg-zinc-50/30 focus:bg-white font-bold text-zinc-700 transition-all cursor-pointer"
                                >
                                  <option value="全部班级">全部班级</option>
                                  <option value="物联网2301班">物联网2301班</option>
                                  <option value="物联网2302班">物联网2302班</option>
                                  <option value="工业互联网2301班">工业互联网2301班</option>
                                  <option value="人工智能2301班">人工智能2301班</option>
                                </select>
                              </div>

                              {/* 4. 完成状态 */}
                              <div className="space-y-1.5">
                                <label className="block text-zinc-500 font-bold">完成状态</label>
                                <select
                                  value={studentSearchStatus}
                                  onChange={(e) => setStudentSearchStatus(e.target.value)}
                                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg hover:border-zinc-300 focus:outline-none focus:border-[#009b86] bg-zinc-50/30 focus:bg-white font-bold text-zinc-700 transition-all cursor-pointer"
                                >
                                  <option value="全部状态">全部状态</option>
                                  <option value="未开始">未开始</option>
                                  <option value="进行中">进行中</option>
                                  <option value="已完成">已完成</option>
                                  <option value="已退回">已退回</option>
                                </select>
                              </div>

                              {/* 5. 评分状态 */}
                              <div className="space-y-1.5">
                                <label className="block text-zinc-500 font-bold font-sans">评分状态</label>
                                <select
                                  value={studentSearchGrade}
                                  onChange={(e) => setStudentSearchGrade(e.target.value)}
                                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg hover:border-zinc-300 focus:outline-none focus:border-[#009b86] bg-zinc-50/30 focus:bg-white font-bold text-zinc-700 transition-all cursor-pointer"
                                >
                                  <option value="全部状态">全部状态</option>
                                  <option value="未评分">未评分</option>
                                  <option value="已评分">已评分</option>
                                  <option value="待重做">待重做</option>
                                </select>
                              </div>

                              {/* 6. 归档状态 */}
                              <div className="space-y-1.5">
                                <label className="block text-zinc-500 font-bold">归档状态</label>
                                <select
                                  value={studentSearchArchive}
                                  onChange={(e) => setStudentSearchArchive(e.target.value)}
                                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg hover:border-zinc-300 focus:outline-none focus:border-[#009b86] bg-zinc-50/30 focus:bg-white font-bold text-zinc-700 transition-all cursor-pointer"
                                >
                                  <option value="全部">全部</option>
                                  <option value="未归档">未归档</option>
                                  <option value="已归档">已归档</option>
                                </select>
                              </div>
                            </div>

                            {/* Actions and query buttons */}
                            <div className="flex justify-end items-center gap-3 border-t border-zinc-100 pt-3.5 flex-wrap">
                              <button
                                onClick={() => {
                                  setStudentSearchName("");
                                  setStudentSearchSno("");
                                  setStudentSearchClass("全部班级");
                                  setStudentSearchStatus("全部状态");
                                  setStudentSearchGrade("全部状态");
                                  setStudentSearchArchive("全部");

                                  setAppliedStudentName("");
                                  setAppliedStudentSno("");
                                  setAppliedStudentClass("全部班级");
                                  setAppliedStudentStatus("全部状态");
                                  setAppliedStudentGrade("全部状态");
                                  setAppliedStudentArchive("全部");
                                  showToast("已重置查询条件，恢复展示全部学生记录");
                                }}
                                className="px-4.5 py-1.8 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 hover:border-zinc-300 text-zinc-650 font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                              >
                                🔄 重置
                              </button>
                              <button
                                onClick={() => {
                                  setAppliedStudentName(studentSearchName);
                                  setAppliedStudentSno(studentSearchSno);
                                  setAppliedStudentClass(studentSearchClass);
                                  setAppliedStudentStatus(studentSearchStatus);
                                  setAppliedStudentGrade(studentSearchGrade);
                                  setAppliedStudentArchive(studentSearchArchive);
                                  showToast("已成功应用筛选条件，完成指定学生查询");
                                }}
                                className="px-5.5 py-1.8 bg-[#009b86] hover:bg-[#00806e] text-white font-black rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-sm shadow-[#009b86]/10 transition-all hover:scale-[1.01]"
                              >
                                🔍 查询
                              </button>
                            </div>
                          </div>

                          {/* Table Header Section */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none pt-2">
                            <div className="space-y-1">
                              <h3 className="font-extrabold text-zinc-900 text-sm flex items-center gap-1.5">
                                <span className="w-1.5 h-3.5 bg-[#009b86] rounded-xs block" />
                                <span>学生任务明细列表</span>
                              </h3>
                              <p className="text-[11px] text-zinc-500 font-semibold leading-none">
                                可按学生姓名、学号、班级、完成状态和归档状态查询指定学生任务。
                              </p>
                            </div>
                            <span className="shrink-0 bg-teal-50 border border-teal-100 text-[#009b86] px-3 py-1 text-[11px] rounded-lg font-black tracking-wide">
                              已选任务下发 {selectedTask.assignedCount} 人 | 已完成 {selectedTask.completedList.filter((s: any) => s.status === "已完成").length} 人
                            </span>
                          </div>

                          {/* Table Container */}
                          <div className="table-container border border-zinc-200 rounded-2xl overflow-hidden text-xs bg-white shadow-sm">
                            <div className="overflow-x-auto">
                              <table className="w-full min-w-[1100px] text-left border-collapse">
                              <thead>
                                <tr className="bg-zinc-50/85 text-zinc-500 font-bold border-b border-zinc-200 text-[11px] uppercase tracking-wide">
                                  <th className="p-3.5 pl-5">学生姓名</th>
                                  <th className="p-3.5 font-mono">学号</th>
                                  <th className="p-3.5">班级</th>
                                  <th className="p-3.5 text-center">完成状态</th>
                                  <th className="p-3.5 text-center">学习时长</th>
                                  <th className="p-3.5 text-center">剩余时长</th>
                                  <th className="p-3.5">提交时间</th>
                                  <th className="p-3.5 text-center">当前得分</th>
                                  <th className="p-3.5 text-center font-sans">评分状态</th>
                                  <th className="p-3.5 text-center">归档状态</th>
                                  <th className="p-3.5 text-right pr-5">操作</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-zinc-100 font-medium text-zinc-700">
                                {filteredCompletedList.length === 0 ? (
                                  <tr>
                                    <td colSpan={11} className="p-12 text-center text-zinc-400 font-medium">
                                      <div className="flex flex-col items-center justify-center space-y-2 py-8 bg-zinc-50/20 rounded-xl">
                                        <span className="text-3xl select-none">📭</span>
                                        <p className="text-zinc-700 font-black text-xs">未查询到符合条件的学生任务记录。</p>
                                        <p className="text-[10px] text-zinc-400">请尝试更换筛选条件后再次查询</p>
                                      </div>
                                    </td>
                                  </tr>
                                ) : (
                                  filteredCompletedList.map((student) => {
                                    return (
                                      <tr key={student.id} className="hover:bg-zinc-50/55 transition-all">
                                        <td className="p-3.5 pl-5">
                                          <div className="flex flex-col gap-1 items-start">
                                            <span className="font-extrabold text-zinc-900 block">{student.name}</span>
                                            {student.status === "已退回" && (
                                              <span className="bg-rose-50 border border-rose-100 text-rose-600 text-[9px] px-1.5 py-0.2 rounded font-black mt-0.5 leading-none block font-sans">
                                                原因: {student.returnReason || "报告需补充"}
                                              </span>
                                            )}
                                            {student.addedTimeLimit && student.addedTimeLimit > 0 ? (
                                              <span className="bg-amber-50 border border-amber-100 text-amber-600 text-[9px] px-1.5 py-0.2 rounded font-black mt-0.5 leading-none block font-sans">
                                                已加时 {student.addedTimeLimit}分钟
                                              </span>
                                            ) : null}
                                          </div>
                                        </td>
                                        <td className="p-3.5 font-mono text-zinc-400 text-[11px]">{student.sno}</td>
                                        <td className="p-3.5 text-zinc-650">{student.className}</td>
                                        <td className="p-3.5 text-center">
                                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                                            student.status === "已完成" 
                                              ? "bg-teal-50 text-[#009b86]" 
                                              : student.status === "进行中" 
                                              ? "bg-blue-50 text-blue-600 animate-pulse" 
                                              : student.status === "已退回"
                                              ? "bg-rose-50 text-rose-600"
                                              : "bg-zinc-100 text-zinc-400"
                                          }`}>
                                            {student.status}
                                          </span>
                                        </td>
                                        <td className="p-3.5 text-center font-mono text-zinc-500">{student.duration || "0分钟"}</td>
                                        <td className="p-3.5 text-center font-mono text-zinc-500">{student.remainingTime || "0分钟"}</td>
                                        <td className="p-3.5 font-mono text-zinc-400 text-[11px]">{student.submitTime}</td>
                                        <td className="p-3.5 text-center">
                                          <span className={`font-mono font-black ${student.gradeStatus === "已评分" ? "text-zinc-900" : "text-zinc-350"}`}>
                                            {student.gradeStatus === "已评分" ? `${student.score} 分` : "--"}
                                          </span>
                                        </td>
                                        <td className="p-3.5 text-center">
                                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                                            student.gradeStatus === "已评分"
                                              ? "bg-teal-50/80 text-[#009b86]" 
                                              : student.gradeStatus === "待重做"
                                              ? "bg-rose-55 text-rose-500"
                                              : "bg-zinc-100 text-zinc-400"
                                          }`}>
                                            {student.gradeStatus}
                                          </span>
                                        </td>
                                        <td className="p-3.5 text-center">
                                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                                            student.archiveStatus === "已归档"
                                              ? "bg-zinc-100 text-zinc-500" 
                                              : "bg-[#009b86]/10 text-[#009b86]"
                                          }`}>
                                            {student.archiveStatus || "未归档"}
                                          </span>
                                        </td>
                                        <td className="p-3.5 text-right pr-5 space-x-1.5 align-middle">
                                          {(() => {
                                            const isArchived = student.archiveStatus === "已归档";

                                            if (isArchived) {
                                              return (
                                                <button
                                                  onClick={() => {
                                                    setSelectedDetailStudent(student);
                                                  }}
                                                  className="text-[#009b86] hover:text-[#00806e] font-extrabold cursor-pointer border border-[#009b86]/20 bg-teal-50/20 px-2.5 py-1 rounded-md text-[11px] hover:bg-[#e6f5f3] transition-colors whitespace-nowrap"
                                                >
                                                  查看详情
                                                </button>
                                              );
                                            }

                                            // 未归档
                                            if (student.status === "已完成") {
                                              return (
                                                <div className="inline-flex gap-1.5 items-center">
                                                  <button
                                                    onClick={() => {
                                                      setSelectedDetailStudent(student);
                                                    }}
                                                    className="text-[#009b86] hover:text-[#00806e] font-extrabold cursor-pointer border border-[#009b86]/20 bg-teal-50/25 px-2.5 py-1 rounded-md text-[11px] hover:bg-[#e6f5f3] transition-colors whitespace-nowrap"
                                                  >
                                                    查看详情
                                                  </button>
                                                  <button
                                                    onClick={() => {
                                                      setReturnStudent(student);
                                                      setReturnReason("实验报告内容不完整");
                                                      setReturnDesc("实验报告中缺少设备接入参数配置和数据上报结果图片，请补充完整后重新提交。");
                                                      setReturnDeadline("2026-06-12 18:00");
                                                      setReturnUseRecord(true);
                                                      setReturnNeedRegrade(true);
                                                    }}
                                                    className="text-rose-600 hover:text-rose-900 font-extrabold cursor-pointer border border-rose-200 hover:border-rose-300 px-2.5 py-1 rounded-md text-[11px] transition-colors whitespace-nowrap"
                                                  >
                                                    退回
                                                  </button>
                                                  <button
                                                    onClick={() => {
                                                      setGradingStudent(student);
                                                      setGradeCompletion(36);
                                                      setGradeRegulation(18);
                                                      setGradeCorrectness(17);
                                                      setGradeReportQuality(18);
                                                      setGradeComment(
                                                        "实验流程完整，设备接入和数据上报结果正确，报告结构较清晰。建议进一步补充异常情况排查过程。"
                                                      );
                                                      showToast(`启动 ${student.name} 的实验报告打分向导`);
                                                    }}
                                                    className="bg-[#009b86] hover:bg-emerald-700 text-white font-extrabold px-2.5 py-1 rounded-md text-[11px] shadow-sm transition-colors cursor-pointer whitespace-nowrap"
                                                  >
                                                    评分
                                                  </button>
                                                </div>
                                              );
                                            }

                                            // 进行中、未开始、已退回并处于未归档状态
                                            return (
                                              <div className="inline-flex gap-1.5 items-center">
                                                <button
                                                  onClick={() => {
                                                    setSelectedDetailStudent(student);
                                                  }}
                                                  className="text-[#009b86] hover:text-[#00806e] font-extrabold cursor-pointer border border-[#009b86]/20 bg-teal-50/25 px-2.5 py-1 rounded-md text-[11px] hover:bg-[#e6f5f3] transition-colors whitespace-nowrap"
                                                >
                                                  查看详情
                                                </button>
                                                <button
                                                  onClick={() => {
                                                    setAddTimeStudent(student);
                                                    setExtendMinutesType("60");
                                                    setCustomExtendMinutes(60);
                                                    const isRet = student.status === "联调退回" || student.status === "已退回";
                                                    const isNotStarted = student.status === "未开始";
                                                    setExtendReason(isRet ? "设备调试耗时较长" : isNotStarted ? "学生请假" : "实验环境异常");
                                                    setExtendDesc(isRet 
                                                      ? "考虑到该生前期提交质量，特批增加时长帮助重新攻克。" 
                                                      : isNotStarted 
                                                      ? "应学生请假特殊情况，提前给予额外实验课外补偿时长。" 
                                                      : "因实验环境启动异常，允许该学生额外增加 60 分钟完成任务。"
                                                    );
                                                    setSyncDeadlineExt(true);
                                                  }}
                                                  className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-900 font-extrabold px-2.5 py-1 rounded-md text-[11px] transition-colors cursor-pointer whitespace-nowrap"
                                                >
                                                  增加时长
                                                </button>
                                              </div>
                                            );
                                          })()}
                                        </td>
                                      </tr>
                                    );
                                  })
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>

                          {/* Operation Record Panel Section */}
                          <div id="operation-logs-panel" className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4 shadow-xs select-none">
                            <div className="flex justify-between items-center border-b border-zinc-100 pb-2.5">
                              <span className="font-extrabold text-zinc-800 text-sm flex items-center gap-1.5">
                                <span className="font-sans">📋</span>
                                <span>操作记录</span>
                              </span>
                              <span className="text-[10px] text-zinc-400 font-medium font-sans">近30次管理行为存根</span>
                            </div>
                            
                            <div className="divide-y divide-zinc-100 max-h-56 overflow-y-auto font-sans">
                              {operationLogs.map((log, index) => (
                                <div key={index} className="py-2.5 flex items-start gap-4 text-[11px]">
                                  <span className="text-zinc-400 font-mono flex-shrink-0 w-24 pt-0.5">{log.time}</span>
                                  <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className={`px-1.5 py-0.2 rounded text-[8px] font-black uppercase ${
                                        log.type === "退回任务" 
                                          ? "bg-rose-50 text-rose-500 border border-rose-100" 
                                          : "bg-amber-50 text-amber-600 border border-amber-100"
                                      }`}>
                                        {log.type}
                                      </span>
                                      <span className="font-extrabold text-[#009b86]">{log.operator}</span>
                                      <span className="text-zinc-300">对</span>
                                      <span className="font-extrabold text-zinc-800 bg-zinc-50 border px-1.5 rounded-md">{log.studentName}</span>
                                      <span className="text-zinc-350">进行操作：</span>
                                    </div>
                                    <p className="text-zinc-600 font-semibold leading-relaxed">
                                      {log.content} 
                                      <span className="text-zinc-400 font-medium block mt-0.5">原因: {log.reason}</span>
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Student Task Details Panel */}
                          {selectedDetailStudent && (
                            <div 
                              id="student-detail-panel" 
                              className="bg-white border border-[#2b5c54]/15 rounded-2xl p-6 space-y-5 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300"
                            >
                              <div className="flex justify-between items-start border-b border-zinc-100 pb-3 flex-wrap gap-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-4 bg-[#009b86] rounded-xs block" />
                                    <h3 id="student-detail-title" className="font-extrabold text-zinc-900 text-sm select-none">
                                      学生任务明细：{selectedDetailStudent.name}
                                    </h3>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ml-1 ${
                                      selectedDetailStudent.status === "已完成" 
                                        ? "bg-teal-50 text-[#009b86]" 
                                        : selectedDetailStudent.status === "进行中" 
                                        ? "bg-blue-50 text-blue-600" 
                                        : selectedDetailStudent.status === "已退回"
                                        ? "bg-rose-50 text-rose-600"
                                        : "bg-zinc-100 text-zinc-400"
                                    }`}>
                                      {selectedDetailStudent.status}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-zinc-500 font-semibold font-sans uppercase">
                                    学号: {selectedDetailStudent.sno} | 班级: {selectedDetailStudent.className}
                                  </p>
                                </div>
                                <button
                                  onClick={() => setSelectedDetailStudent(null)}
                                  className="text-xs text-zinc-400 hover:text-zinc-700 bg-zinc-50 hover:bg-zinc-100 px-2.5 py-1.2 rounded-lg font-bold border border-zinc-200/60 cursor-pointer transition-all"
                                >
                                  关闭明细 ✕
                                </button>
                              </div>

                              {/* Tabs inside details */}
                              <div className="flex border-b border-zinc-150 scrollbar-none overflow-x-auto text-xs font-bold gap-1 pb-0.5">
                                <button
                                  onClick={() => setStudentDetailTab("info")}
                                  className={`px-4.5 py-2 rounded-t-lg transition-all cursor-pointer whitespace-nowrap ${
                                    studentDetailTab === "info"
                                      ? "text-[#009b86] bg-teal-50/40 border-b-2 border-[#009b86]"
                                      : "text-zinc-550 hover:text-zinc-800 hover:bg-zinc-50"
                                  }`}
                                >
                                  📋 基本概况
                                </button>
                                <button
                                  onClick={() => setStudentDetailTab("report")}
                                  className={`px-4.5 py-2 rounded-t-lg transition-all cursor-pointer whitespace-nowrap ${
                                    studentDetailTab === "report"
                                      ? "text-[#009b86] bg-teal-50/40 border-b-2 border-[#009b86]"
                                      : "text-zinc-550 hover:text-zinc-800 hover:bg-zinc-50"
                                  }`}
                                >
                                  📝 学生报告
                                </button>
                                <button
                                  onClick={() => setStudentDetailTab("chapters")}
                                  className={`px-4.5 py-2 rounded-t-lg transition-all cursor-pointer whitespace-nowrap ${
                                    studentDetailTab === "chapters"
                                      ? "text-[#009b86] bg-teal-50/40 border-b-2 border-[#009b86]"
                                      : "text-zinc-550 hover:text-zinc-800 hover:bg-zinc-50"
                                  }`}
                                >
                                  📍 章节完成情况
                                </button>
                                <button
                                  onClick={() => setStudentDetailTab("score")}
                                  className={`px-4.5 py-2 rounded-t-lg transition-all cursor-pointer whitespace-nowrap ${
                                    studentDetailTab === "score"
                                      ? "text-[#009b86] bg-teal-50/40 border-b-2 border-[#009b86]"
                                      : "text-zinc-550 hover:text-zinc-800 hover:bg-zinc-50"
                                  }`}
                                >
                                  🎯 得分情况
                                </button>
                              </div>

                              {/* Tab Contents */}
                              <div className="pt-2 text-xs text-zinc-700 leading-relaxed font-semibold">
                                {studentDetailTab === "info" && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-250">
                                    <div className="p-4 bg-zinc-50/55 border border-zinc-200/50 rounded-xl space-y-1">
                                      <span className="text-zinc-400 block font-bold text-[10px] uppercase">当前得分</span>
                                      <span className={`text-base font-mono font-black block ${selectedDetailStudent.gradeStatus === "已评分" ? "text-teal-600" : "text-zinc-400"}`}>
                                        {selectedDetailStudent.gradeStatus === "已评分" ? `${selectedDetailStudent.score} 分` : "--"}
                                      </span>
                                      <span className="text-[9.5px] text-zinc-400 font-medium">
                                        评分状态: {selectedDetailStudent.gradeStatus}
                                      </span>
                                    </div>

                                    <div className="p-4 bg-zinc-50/55 border border-zinc-200/50 rounded-xl space-y-1">
                                      <span className="text-zinc-400 block font-bold text-[10px] uppercase">已学习时长</span>
                                      <span className="text-base font-mono font-black text-zinc-850 block">
                                        {selectedDetailStudent.duration || "0分钟"}
                                      </span>
                                      <span className="text-[9.5px] text-zinc-400 font-medium">
                                        剩余可用: {selectedDetailStudent.remainingTime || "0分钟"}
                                      </span>
                                    </div>

                                    <div className="p-4 bg-zinc-50/55 border border-zinc-200/50 rounded-xl space-y-1">
                                      <span className="text-zinc-400 block font-bold text-[10px] uppercase">提交时间</span>
                                      <span className="text-xs font-mono font-black text-zinc-85 block truncate">
                                        {selectedDetailStudent.submitTime || "暂无提交"}
                                      </span>
                                      <span className="text-[9.5px] text-zinc-400 font-medium">
                                        报告状态: {selectedDetailStudent.reportStatus || "未提交"}
                                      </span>
                                    </div>

                                    <div className="p-4 bg-zinc-50/55 border border-zinc-200/50 rounded-xl space-y-1">
                                      <span className="text-zinc-400 block font-bold text-[10px] uppercase">归档与加时</span>
                                      <span className="text-xs font-black text-zinc-85 block">
                                        {selectedDetailStudent.archiveStatus || "未归档"}
                                      </span>
                                      <span className="text-[9.5px] text-zinc-400 font-medium">
                                        追加限制: {selectedDetailStudent.addedTimeLimit ? `${selectedDetailStudent.addedTimeLimit}分钟` : "无加时"}
                                      </span>
                                    </div>
                                  </div>
                                )}

                                {studentDetailTab === "report" && (
                                  <div className="space-y-4 animate-in fade-in duration-250">
                                    {selectedDetailStudent.status === "未开始" ? (
                                      <div className="text-center p-8 bg-zinc-50 border border-zinc-150 rounded-2xl text-zinc-400 font-black">
                                        😴 该学生尚未开始此任务，暂无报告上传。
                                      </div>
                                    ) : selectedDetailStudent.status === "进行中" ? (
                                      <div className="text-center p-8 bg-zinc-50 border border-zinc-150 rounded-2xl text-zinc-400 font-black">
                                        ⏳ 实验正在进行中，学生尚未撰写并提交报告。
                                      </div>
                                    ) : (
                                      <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4 font-sans select-none">
                                        <div className="flex justify-between items-center border-b border-zinc-100 pb-3 flex-wrap">
                                          <div className="space-y-1">
                                            <h4 className="font-extrabold text-[#009b86] text-[13px] flex items-center gap-1.5">
                                              <span>📄</span>
                                              <span>【实验报告】物联网智能网关数据采集接入虚拟仿真实验</span>
                                            </h4>
                                            <p className="text-[10px] text-zinc-400">报告作者: {selectedDetailStudent.name} (学号: {selectedDetailStudent.sno}) | 提交时间: {selectedDetailStudent.submitTime}</p>
                                          </div>
                                          <button
                                            onClick={() => showToast("已模拟生成PDF报告导出下载")}
                                            className="px-3 py-1 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded text-[10px] font-black cursor-pointer text-zinc-600 transition-all flex items-center gap-1"
                                          >
                                            📥 导出PDF
                                          </button>
                                        </div>

                                        <div className="space-y-3.5 text-zinc-700 leading-relaxed max-h-96 overflow-y-auto pr-2 text-[11.5px] font-medium">
                                          <div>
                                            <h5 className="font-extrabold text-zinc-950 border-l-2 border-[#009b86] pl-2 mb-1.5 text-xs">一、实验目的</h5>
                                            <p className="text-zinc-650">本实验旨在使学生通过虚拟物联网实验室，深入掌握智能温湿度传感器网关的网络协议栈建立（如MQTT/HTTP）、模拟环境搭建、物理传感器注册及实时遥测通道连接。掌握如何通过在物联网网关中建立与上游物联网接入云平台的数据链路层映射实现传感器数据的上报和控制机制。</p>
                                          </div>

                                          <div>
                                            <h5 className="font-extrabold text-zinc-950 border-l-2 border-[#009b86] pl-2 mb-1.5 text-xs">二、实验原理与拓扑架构</h5>
                                            <p className="text-zinc-650">仿真实验物理拓扑由仿真工业机房、ESP32-WROOM 微控制器模块、传感器集成底板（温湿度、水浸探测、门磁）、企业级LoRaWAN智能多信道网络网关以及虚拟上游云平台控制台构成。物理信号通过电信号采样传递给感知节点建立寄存器协议，网关收集感知节点数据并执行 JSON 编码包装后以 MQTT Over TCP 方法上传至平台的主题中。</p>
                                          </div>

                                          <div>
                                            <h5 className="font-extrabold text-zinc-950 border-l-2 border-[#009b86] pl-2 mb-1.5 text-xs">三、实验具体步骤与数据记录</h5>
                                            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3 space-y-2 font-mono text-[10.5px]">
                                              <p className="text-[#009b86] font-bold">// 1. 网关建立与安全握手：</p>
                                              <p className="text-zinc-650">Established Client connection [CLIENTID: iot-lab-2023] -- OK</p>
                                              <p className="text-[#009b86] font-bold">// 2. 设备密钥对映射与订阅：</p>
                                              <p className="text-zinc-650">Subscribed to event/sensors/telemetry with QOS 1 -- Success</p>
                                              <p className="text-[#009b86] font-bold">// 3. 遥测核心参数包采集存根 (JSON)：</p>
                                              <p className="text-zinc-650">{"{"} "device_id": "esp32-node-j04", "humidity": 64.2, "temperature": 23.8, "water_leak": "NORMAL", "uptime_sec": 3600 {"}"}</p>
                                            </div>
                                            <p className="text-zinc-650 mt-1.5 font-sans">实验中，本人根据任务书的要求，成功实现了传感器底板与物联网网关之间的接口定义规范，通过LoRaWAN控制台下发广播指令完成全域自组网，成功将仿真物联网终端与智慧平台建立数据连通。</p>
                                          </div>

                                          <div>
                                            <h5 className="font-extrabold text-zinc-950 border-l-2 border-[#009b86] pl-2 mb-1.5 text-xs">四、实验总结与思考体会</h5>
                                            <p className="font-bold text-zinc-900 bg-teal-50/20 border border-teal-100 rounded-lg p-2.5 font-sans">
                                              通过本章虚拟仿真，我深刻意识到了多传感器自组网与协议转换中高并发防溢出机制的重大意义，并完成了自主调试。遇到问题时，我通过物联网网关的控制台控制码调阅分析，克服了MQTT认证参数错误重试的故障，进一步锤炼了自身发现和处理工程现场突发软硬件联调问题的本领，受益匪浅。
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {studentDetailTab === "chapters" && (
                                  <div className="space-y-4 animate-in fade-in duration-250 font-sans">
                                    <div className="relative border-l border-zinc-200 pl-6 ml-3 space-y-6 flex flex-col">
                                      <div className="relative">
                                        <span className="absolute -left-[31px] top-0.5 bg-teal-100 text-[#009b86] w-6 h-6 rounded-full flex items-center justify-center font-black text-xs border-2 border-white">✓</span>
                                        <div className="space-y-1">
                                          <h5 className="font-bold text-zinc-850 text-xs">第一章节：虚拟温湿度传感器环境部署（感知层实训）</h5>
                                          <div className="flex gap-4 text-[10.5px] text-zinc-500 font-semibold flex-wrap">
                                            <span>完成率: <span className="text-[#009b86] font-extrabold">100%</span></span>
                                            <span>开始时间: 2026-06-08 09:30</span>
                                            <span>结束时间: 2026-06-08 10:45</span>
                                            <span>通过判定: 系统自动免审</span>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="relative">
                                        <span className="absolute -left-[31px] top-0.5 bg-teal-100 text-[#009b86] w-6 h-6 rounded-full flex items-center justify-center font-black text-xs border-2 border-white">✓</span>
                                        <div className="space-y-1">
                                          <h5 className="font-bold text-zinc-850 text-xs">第二章节：MQTT无线底座网关协议连通（数据链路实训）</h5>
                                          <div className="flex gap-4 text-[10.5px] text-zinc-500 font-semibold flex-wrap">
                                            <span>完成率: <span className="text-[#009b86] font-extrabold">100%</span></span>
                                            <span>开始时间: 2026-06-08 11:00</span>
                                            <span>结束时间: 2026-06-08 11:55</span>
                                            <span>通过判定: 系统自动免审</span>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="relative">
                                        <span className="absolute -left-[31px] top-0.5 bg-teal-100 text-[#009b86] w-6 h-6 rounded-full flex items-center justify-center font-black text-xs border-2 border-white">✓</span>
                                        <div className="space-y-1">
                                          <h5 className="font-bold text-zinc-850 text-xs">第三章节：上游智慧平台遥测集成连接（应用层实训）</h5>
                                          <div className="flex gap-4 text-[10.5px] text-zinc-500 font-semibold flex-wrap">
                                            <span>完成率: <span className="text-[#009b86] font-extrabold">100%</span></span>
                                            <span>开始时间: 2026-06-08 14:10</span>
                                            <span>结束时间: 2026-06-08 15:30</span>
                                            <span>通过判定: 系统自动免审</span>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="relative">
                                        <span className={`absolute -left-[31px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center font-black text-xs border-2 border-white ${
                                          selectedDetailStudent.status === "已完成" 
                                            ? "bg-teal-100 text-[#009b86]" 
                                            : "bg-amber-100 text-amber-600"
                                        }`}>
                                          {selectedDetailStudent.status === "已完成" ? "✓" : "⏳"}
                                        </span>
                                        <div className="space-y-1">
                                          <h5 className="font-bold text-zinc-850 text-xs">第四章节：系统性实验报告撰写与问题研判（总结实训）</h5>
                                          <div className="flex gap-4 text-[10.5px] text-zinc-500 font-semibold flex-wrap">
                                            <span>完成状态: <span className={selectedDetailStudent.status === "已完成" ? "text-[#009b86] font-extrabold" : "text-amber-600 font-extrabold"}>{selectedDetailStudent.status === "已完成" ? "100% 已提交" : "交互进行中"}</span></span>
                                            <span>截止日期: {selectedTask.deadline}</span>
                                            <span>待反馈意见: {selectedDetailStudent.gradeStatus === "未评分" ? "待人工评分反馈" : "已审查毕"}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {studentDetailTab === "score" && (
                                  <div className="space-y-4 animate-in fade-in duration-250 font-sans">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="p-4 bg-zinc-50/55 border border-zinc-200/50 rounded-xl space-y-4 font-semibold text-zinc-650">
                                        <h5 className="font-black text-zinc-850 text-xs flex items-center gap-1.5 border-b border-zinc-150 pb-1.5">
                                          <span>📈</span>
                                          <span>各项指标得分情况细目</span>
                                        </h5>
                                        
                                        <div className="space-y-3.5 text-xs text-zinc-650">
                                          <div className="space-y-1">
                                            <div className="flex justify-between items-center text-[11px]">
                                              <span>1. 实验步骤完成度与规范性</span>
                                              <span className="font-mono text-zinc-900 font-extrabold">36 / 40 分</span>
                                            </div>
                                            <div className="w-full bg-zinc-200/80 rounded-full h-1.5 overflow-hidden">
                                              <div className="bg-[#009b86] h-1.5 rounded-full" style={{ width: "90%" }} />
                                            </div>
                                          </div>

                                          <div className="space-y-1">
                                            <div className="flex justify-between items-center text-[11px]">
                                              <span>2. 网关连通接入及网络参数合规度</span>
                                              <span className="font-mono text-zinc-900 font-extrabold">18 / 20 分</span>
                                            </div>
                                            <div className="w-full bg-zinc-200/80 rounded-full h-1.5 overflow-hidden">
                                              <div className="bg-[#009b86] h-1.5 rounded-full" style={{ width: "90%" }} />
                                            </div>
                                          </div>

                                          <div className="space-y-1">
                                            <div className="flex justify-between items-center text-[11px]">
                                              <span>3. 设备传感器数据遥测上传正确率</span>
                                              <span className="font-mono text-zinc-900 font-extrabold">17 / 20 分</span>
                                            </div>
                                            <div className="w-full bg-zinc-200/80 rounded-full h-1.5 overflow-hidden">
                                              <div className="bg-[#009b86] h-1.5 rounded-full" style={{ width: "85%" }} />
                                            </div>
                                          </div>

                                          <div className="space-y-1">
                                            <div className="flex justify-between items-center text-[11px]">
                                              <span>4. 实验总结与反思体会报告质量</span>
                                              <span className="font-mono text-zinc-900 font-extrabold">18 / 20 分</span>
                                            </div>
                                            <div className="w-full bg-zinc-200/80 rounded-full h-1.5 overflow-hidden">
                                              <div className="bg-[#009b86] h-1.5 rounded-full" style={{ width: "90%" }} />
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="p-4 bg-zinc-50/55 border border-zinc-200/50 rounded-xl space-y-3.5 flex flex-col justify-between">
                                        <div className="space-y-2">
                                          <h4 className="font-black text-zinc-850 text-xs flex items-center gap-1.5 border-b border-zinc-150 pb-1.5">
                                            <span>✍️</span>
                                            <span>教师评语及打分结论报告</span>
                                          </h4>
                                          
                                          {selectedDetailStudent.gradeStatus === "已评分" ? (
                                            <div className="space-y-2.5">
                                              <div>
                                                <span className="text-[10px] text-zinc-400 block font-bold leading-none">综合总分结论</span>
                                                <span className="text-2xl font-mono font-black text-teal-600 tracking-tight">{selectedDetailStudent.score} <span className="text-xs font-bold text-zinc-500">/ 100 分</span></span>
                                              </div>
                                              <div>
                                                <span className="text-[10px] text-zinc-400 block font-black leading-none mb-1">教师考语意见</span>
                                                <p className="text-[11px] text-zinc-650 font-medium leading-relaxed bg-white border border-zinc-200/70 p-2.5 rounded-lg font-sans">
                                                  实验步骤相当完美且记录非常完整，LoRaWAN网关物理接入与云平台订阅工作都扎实到位。但在思考总结的异常重试机制中，还可更进一步论证TCP底层心跳周期的配比参数。
                                                </p>
                                              </div>
                                            </div>
                                          ) : (
                                            <div className="py-6 text-center text-zinc-400 font-bold space-y-2 font-sans">
                                              <span>📪</span>
                                              <b className="block text-[11px]">该学生目前尚未进行人工打分及审查。</b>
                                              <button
                                                onClick={() => {
                                                  setGradingStudent(selectedDetailStudent);
                                                  setGradeCompletion(36);
                                                  setGradeRegulation(18);
                                                  setGradeCorrectness(17);
                                                  setGradeReportQuality(18);
                                                  setGradeComment(
                                                    "实验流程完整，设备接入和数据上报结果正确，报告结构较清晰。建议进一步补充异常情况排查过程。"
                                                  );
                                                }}
                                                className="px-3 py-1.2 bg-[#009b86] text-white rounded text-[10px] font-black cursor-pointer transition-all"
                                              >
                                                立即评分 🖋️
                                              </button>
                                            </div>
                                          )}
                                        </div>

                                        <div className="text-[10px] text-zinc-400 font-medium leading-tight font-sans">
                                          说明: 在进行最终归档/归集操作前，可随时点击列表中的评分按钮重新修改此报告结论。
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                        </div>

                        {/* Right column: Current Task Management Overview card */}
                        <div className="space-y-6 lg:col-span-1">
                          <div className="border border-zinc-200 rounded-2xl p-5 bg-white shadow-xs space-y-4 text-xs font-bold font-sans">
                            <div className="border-b border-zinc-100 pb-2.5">
                              <h3 className="font-extrabold text-zinc-850 text-sm">当前任务管理概览</h3>
                              <p className="text-[9.5px] text-zinc-400 font-medium mt-0.5 leading-none">REALTIME TASK METRICS</p>
                            </div>
                            
                            <div className="space-y-3 font-semibold text-zinc-650">
                              <div className="flex justify-between items-center">
                                <span className="text-zinc-450 font-medium">下发人数：</span>
                                <span className="text-zinc-900 font-mono font-extrabold text-sm">
                                  {selectedTask.assignedCount}人
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-zinc-450 font-medium">已完成：</span>
                                <span className="text-emerald-600 font-mono font-extrabold text-sm bg-emerald-50/50 px-2 py-0.5 rounded">
                                  {selectedTask.completedList.filter((s: any) => s.status === "已完成").length}人
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-zinc-450 font-medium">进行中：</span>
                                <span className="text-blue-600 font-mono font-extrabold text-sm bg-blue-50/30 px-2 py-0.5 rounded text-center">
                                  {selectedTask.completedList.filter((s: any) => s.status === "进行中").length}人
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-zinc-450 font-medium">已退回：</span>
                                <span className="text-rose-600 font-mono font-extrabold text-sm bg-rose-50/50 px-2 py-0.5 rounded text-center">
                                  {selectedTask.completedList.filter((s: any) => s.status === "已退回").length}人
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-zinc-450 font-medium">已加时：</span>
                                <span className="text-amber-600 font-mono font-extrabold text-sm bg-amber-50/30 px-2 py-0.5 rounded text-center">
                                  {selectedTask.completedList.filter((s: any) => s.addedTimeLimit && s.addedTimeLimit > 0).length || 2}人
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-zinc-450 font-medium">待评分：</span>
                                <span className="text-rose-500 font-mono font-extrabold text-sm bg-rose-50/30 px-2 py-0.5 rounded text-center">
                                  {selectedTask.completedList.filter((s: any) => s.status === "已完成" && s.gradeStatus === "未评分").length}人
                                </span>
                              </div>
                            </div>
                            
                            <div className="p-3 bg-zinc-50 border border-zinc-150 rounded-xl leading-relaxed text-[11px] text-zinc-500 font-medium font-sans">
                              📌 提示: 发起“退回”或“评分”会同步更改该任务的全局看板表现。支持随时对学生作答用时进行手动调整和新截止期同步对齐。
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                )}

                {/* F. Grading Modal Panel overlay screen */}
                {gradingStudent && (
                  <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs select-none">
                    <div className="bg-white border border-zinc-200 rounded-3xl p-6 max-w-2xl w-full shadow-2xl animate-in zoom-in-95 duration-200 space-y-5">
                      
                      {/* Modal header */}
                      <div className="border-b border-zinc-150 pb-3 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <ClipboardCheck className="w-5 h-5 text-[#009b86]" />
                          <h3 className="text-base font-black text-zinc-900">任务评分评分</h3>
                        </div>
                        <button
                          onClick={() => setGradingStudent(null)}
                          className="p-1 text-zinc-400 hover:text-zinc-800 rounded-full hover:bg-zinc-100 cursor-pointer text-sm font-bold"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Student Specifications detail */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-zinc-50 border border-zinc-200/60 p-4 rounded-xl text-xs font-semibold leading-relaxed">
                        <div>
                          <span className="text-zinc-400 block font-bold">学生姓名：</span>
                          <span className="text-zinc-905 font-extrabold text-sm">{gradingStudent.name}</span>
                        </div>
                        <div>
                          <span className="text-zinc-400 block font-bold">学号：</span>
                          <span className="text-zinc-905 font-mono text-[11px]">{gradingStudent.sno}</span>
                        </div>
                        <div>
                          <span className="text-zinc-400 block font-bold">行政班级：</span>
                          <span className="text-zinc-905 font-extrabold">{gradingStudent.className}</span>
                        </div>
                        <div className="md:col-span-3 border-t border-zinc-200/80 mt-1 pt-1">
                          <span className="text-zinc-400 block font-bold">任务名称：</span>
                          <span className="text-zinc-905 font-bold text-xs">{selectedTask.name}</span>
                        </div>
                        <div className="border-t border-zinc-200/80 mt-1 pt-1">
                          <span className="text-zinc-400 block font-bold">提报时间：</span>
                          <span className="text-zinc-850">{gradingStudent.submitTime}</span>
                        </div>
                        <div className="border-t border-zinc-200/80 mt-1 pt-1 col-span-2">
                          <span className="text-zinc-400 block font-bold">系统耗时：</span>
                          <span className="text-zinc-850">{gradingStudent.duration}</span>
                        </div>
                      </div>

                      {/* Scopes Inputs */}
                      <div className="space-y-4 text-xs font-bold text-zinc-700">
                        <p className="text-[10px] text-zinc-450 font-black tracking-normal uppercase border-b pb-1.5">实验成绩项目分配评分设定</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Item 1 */}
                          <div className="space-y-1">
                            <div className="flex justify-between font-bold">
                              <label className="text-zinc-650">1. 设备接入与调试度 (满分 40分)</label>
                              <span className="text-[#009b86]">{gradeCompletion} 分</span>
                            </div>
                            <input
                              type="number"
                              min={0}
                              max={40}
                              value={gradeCompletion}
                              onChange={(e) => setGradeCompletion(Math.min(40, Math.max(0, parseInt(e.target.value) || 0)))}
                              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 outline-none font-mono focus:bg-white focus:border-[#009b86] font-extrabold text-sm text-zinc-950"
                            />
                          </div>

                          {/* Item 2 */}
                          <div className="space-y-1">
                            <div className="flex justify-between font-bold">
                              <label className="text-zinc-650">2. 指标操作规范度 (满分 20分)</label>
                              <span className="text-[#009b86]">{gradeRegulation} 分</span>
                            </div>
                            <input
                              type="number"
                              min={0}
                              max={20}
                              value={gradeRegulation}
                              onChange={(e) => setGradeRegulation(Math.min(20, Math.max(0, parseInt(e.target.value) || 0)))}
                              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 outline-none font-mono focus:bg-white focus:border-[#009b86] font-extrabold text-sm text-zinc-950"
                            />
                          </div>

                          {/* Item 3 */}
                          <div className="space-y-1">
                            <div className="flex justify-between font-bold">
                              <label className="text-zinc-650">3. 协议数据准确度 (满分 20分)</label>
                              <span className="text-[#009b86]">{gradeCorrectness} 分</span>
                            </div>
                            <input
                              type="number"
                              min={0}
                              max={20}
                              value={gradeCorrectness}
                              onChange={(e) => setGradeCorrectness(Math.min(20, Math.max(0, parseInt(e.target.value) || 0)))}
                              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 outline-none font-mono focus:bg-white focus:border-[#009b86] font-extrabold text-sm text-zinc-950"
                            />
                          </div>

                          {/* Item 4 */}
                          <div className="space-y-1">
                            <div className="flex justify-between font-bold">
                              <label className="text-zinc-650">4. 归档报告撰写质量 (满分 20分)</label>
                              <span className="text-[#009b86]">{gradeReportQuality} 分</span>
                            </div>
                            <input
                              type="number"
                              min={0}
                              max={20}
                              value={gradeReportQuality}
                              onChange={(e) => setGradeReportQuality(Math.min(20, Math.max(0, parseInt(e.target.value) || 0)))}
                              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 outline-none font-mono focus:bg-white focus:border-[#009b86] font-extrabold text-sm text-zinc-950"
                            />
                          </div>
                        </div>

                        {/* Combined display aggregate score */}
                        <div className="p-3.5 bg-teal-50/50 border border-teal-100 rounded-2xl flex items-center justify-between">
                          <span className="text-[#009b86] font-extrabold flex items-center gap-1.5">
                            <span>➔</span>
                            <span>综合评分等级成绩计算：</span>
                          </span>
                          <span className="text-2xl font-black text-[#009b86] font-mono pr-2">
                            {totalScore} <span className="text-xs font-bold text-zinc-400">分 / 100分</span>
                          </span>
                        </div>

                        {/* Teacher comment comments */}
                        <div className="space-y-1">
                          <label className="text-zinc-650 block font-bold">教师评语意见</label>
                          <textarea
                            value={gradeComment}
                            onChange={(e) => setGradeComment(e.target.value)}
                            rows={3}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-3 outline-none text-xs leading-relaxed focus:bg-white focus:border-[#009b86] font-medium"
                            placeholder="请输入教师评语..."
                          />
                        </div>
                      </div>

                      {/* Modal Footer */}
                      <div className="flex justify-end gap-2 border-t border-zinc-100 pt-3 text-xs font-bold">
                        <button
                          onClick={() => setGradingStudent(null)}
                          className="px-4 py-2 hover:bg-zinc-100 text-zinc-600 rounded-lg transition-colors cursor-pointer"
                        >
                          取消
                        </button>
                        <button
                          onClick={() => {
                            if (!gradingStudent) return;
                            
                            // update state
                            setTasksState(prevTasks => prevTasks.map(t => {
                              if (t.id === selectedTaskId) {
                                const list = t.completedList.map(s => {
                                  if (s.id === gradingStudent.id) {
                                    return {
                                      ...s,
                                      score: totalScore,
                                      gradeStatus: "已评分" as const
                                    };
                                  }
                                  return s;
                                });
                                return {
                                  ...t,
                                  completedList: list
                                };
                              }
                              return t;
                            }));
                            
                            // Keep focused details panel student in sync
                            if (selectedDetailStudent && selectedDetailStudent.id === gradingStudent.id) {
                              setSelectedDetailStudent(prev => prev ? {
                                ...prev,
                                score: totalScore,
                                gradeStatus: "已评分" as const
                              } : null);
                            }

                            // decrease global待评分 indicator
                            setPendingGradingCount(prev => Math.max(0, prev - 1));
                            
                            showToast("主观评分成果已保存！评分数据已更新。");
                            setGradingStudent(null);
                          }}
                          className="px-5 py-2.2 bg-[#009b86] hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer flex items-center gap-1 font-black"
                        >
                          <span>保存评分</span>
                        </button>
                      </div>

                    </div>
                  </div>
                )}

                {/* G. Return Task Modal Overlay Dialog */}
                {returnStudent && (
                  <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs select-none">
                    <div className="bg-white border border-zinc-200 rounded-3xl p-6 max-w-xl w-full shadow-2xl animate-in zoom-in-95 duration-200 space-y-5">
                      
                      {/* Return Modal Header */}
                      <div className="border-b border-zinc-150 pb-3 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-rose-600 text-lg">⚠️</span>
                          <h3 className="text-base font-black text-zinc-900">退回学生任务</h3>
                        </div>
                        <button
                          onClick={() => setReturnStudent(null)}
                          className="p-1 text-zinc-400 hover:text-zinc-800 rounded-full hover:bg-zinc-100 cursor-pointer text-sm font-bold"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Student Details Card */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-rose-50/30 border border-rose-100 p-4 rounded-xl text-xs font-semibold leading-relaxed">
                        <div>
                          <span className="text-zinc-400 block font-medium">学生姓名：</span>
                          <span className="text-zinc-900 font-extrabold text-sm">{returnStudent.name}</span>
                        </div>
                        <div>
                          <span className="text-zinc-400 block font-medium">学号：</span>
                          <span className="text-zinc-900 font-mono text-[11px]">{returnStudent.sno}</span>
                        </div>
                        <div>
                          <span className="text-zinc-400 block font-medium">所属班级：</span>
                          <span className="text-zinc-800 font-bold">{returnStudent.className}</span>
                        </div>
                      </div>

                      {/* Form Details */}
                      <div className="space-y-4 text-xs font-bold text-zinc-700">
                        
                        {/* Selector Choice */}
                        <div className="space-y-1.5">
                          <label className="text-zinc-600 font-extrabold">退回原因类型 <span className="text-rose-500">*</span></label>
                          <select
                            value={returnReason}
                            onChange={(e) => setReturnReason(e.target.value)}
                            className="w-full bg-white border border-zinc-200 hover:border-zinc-300 rounded-lg p-2.5 outline-none font-bold text-xs"
                          >
                            <option value="实验报告内容不完整">实验报告内容不完整</option>
                            <option value="实验过程截图缺失">实验过程截图缺失</option>
                            <option value="关键参数配置错误">关键参数配置错误</option>
                            <option value="存在明显的抄袭代做嫌疑">存在明显不当提交嫌疑</option>
                            <option value="其他原因">其他自定义原因</option>
                          </select>
                        </div>

                        {/* Text explanation */}
                        <div className="space-y-1.5">
                          <label className="text-zinc-600 font-extrabold">详细退回修改说明 <span className="text-rose-500">*</span></label>
                          <textarea
                            value={returnDesc}
                            onChange={(e) => setReturnDesc(e.target.value)}
                            rows={3}
                            className="w-full bg-zinc-50 focus:bg-white border border-zinc-200 hover:border-zinc-350 rounded-lg p-3 outline-none font-semibold text-xs leading-relaxed resize-none"
                            placeholder="请填写给学生的具体修改指导建议，帮助其重新修正提交。"
                          />
                        </div>

                        {/* Re-submission deadline limit */}
                        <div className="space-y-1.5">
                          <label className="text-zinc-600 font-extrabold">重新提交截止时间 <span className="text-rose-500">*</span></label>
                          <input
                            type="text"
                            value={returnDeadline}
                            onChange={(e) => setReturnDeadline(e.target.value)}
                            className="w-full bg-white border border-zinc-200 hover:border-zinc-300 rounded-lg p-2.5 outline-none font-mono font-bold text-xs"
                            placeholder="如：2026-06-12 18:00"
                          />
                        </div>

                        {/* Checkbox configs */}
                        <div className="pt-2 space-y-2 select-none">
                          <label className="flex items-start gap-2 cursor-pointer font-bold text-zinc-600">
                            <input
                              type="checkbox"
                              checked={returnNeedRegrade}
                              onChange={(e) => setReturnNeedRegrade(e.target.checked)}
                              className="mt-0.5 rounded border-zinc-300 text-[#009b86] focus:ring-[#009b86]"
                            />
                            <div className="flex-1 leading-normal">
                              <span>重做完成后重新计入评分大纲</span>
                              <span className="text-[10px] text-zinc-400 font-medium block mt-0.5 font-sans">启用后，学生可以获得重考机会，最终分数将取决于修改后的重评结果。</span>
                            </div>
                          </label>

                          <label className="flex items-start gap-2 cursor-pointer font-bold text-zinc-600">
                            <input
                              type="checkbox"
                              checked={returnUseRecord}
                              onChange={(e) => setReturnUseRecord(e.target.checked)}
                              className="mt-0.5 rounded border-zinc-300 text-[#009b86] focus:ring-[#009b86]"
                            />
                            <div className="flex-1 leading-normal">
                              <span>允许学生保留并继续使用原实验过程记录数据</span>
                              <span className="text-[10px] text-zinc-400 font-medium block mt-0.5 font-sans">学生仅需重新编辑撰写实验报告，无需重新进行耗时的物联网虚实设备实操接线与数据发包。</span>
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* Modal Footer actions */}
                      <div className="flex justify-end gap-2 border-t border-zinc-100 pt-3 text-xs font-bold">
                        <button
                          onClick={() => setReturnStudent(null)}
                          className="px-4 py-2 hover:bg-zinc-100 text-zinc-600 rounded-lg transition-colors cursor-pointer"
                        >
                          关闭
                        </button>
                        <button
                          onClick={() => {
                            // update list state
                            setTasksState(prev => prev.map(t => {
                              if (t.id === selectedTaskId) {
                                return {
                                  ...t,
                                  completedList: t.completedList.map(s => {
                                    if (s.id === returnStudent.id) {
                                      return {
                                        ...s,
                                        status: "已退回",
                                        gradeStatus: "待重做",
                                        score: "--",
                                        returnReason: returnReason || "报告需补充",
                                        submitTime: "未提交"
                                      };
                                    }
                                    return s;
                                  })
                                };
                              }
                              return t;
                            }));

                            // Append operation action log
                            const logTime = new Date().toISOString().replace('T', ' ').substring(0, 16);
                            setOperationLogs(prev => [
                              {
                                time: logTime,
                                operator: "教师1",
                                studentName: returnStudent.name,
                                type: "退回任务",
                                content: `退回要求重做提交。允许保留使用历史实验记录：${returnUseRecord ? "是" : "否"}。要求再次阅卷计评：${returnNeedRegrade ? "是" : "否"}。设定期限：${returnDeadline}`,
                                reason: returnReason
                              },
                              ...prev
                            ]);

                            // Keep focused details panel student in sync
                            if (selectedDetailStudent && selectedDetailStudent.id === returnStudent.id) {
                              setSelectedDetailStudent(prev => prev ? {
                                ...prev,
                                status: "已退回",
                                gradeStatus: "待重做",
                                score: "--",
                                returnReason: returnReason || "报告需补充",
                                submitTime: "未提交"
                              } : null);
                            }

                            showToast(`已成功将【${selectedTask.name}】退回给学生【${returnStudent.name}】进行限期修改重做！`);
                            setReturnStudent(null);
                          }}
                          className="px-5 py-2.2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors cursor-pointer flex items-center gap-1 font-black"
                        >
                          <span>确认退回</span>
                        </button>
                      </div>

                    </div>
                  </div>
                )}

                {/* H. Add Duration Limit Modal Overlay Dialog */}
                {addTimeStudent && (
                  <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs select-none">
                    <div className="bg-white border border-zinc-200 rounded-3xl p-6 max-w-xl w-full shadow-2xl animate-in zoom-in-95 duration-200 space-y-5">
                      
                      {/* Add time Modal Header */}
                      <div className="border-b border-zinc-150 pb-3 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-teal-600 text-lg">⏳</span>
                          <h3 className="text-base font-black text-zinc-900">增加任务时长</h3>
                        </div>
                        <button
                          onClick={() => setAddTimeStudent(null)}
                          className="p-1 text-zinc-400 hover:text-zinc-800 rounded-full hover:bg-zinc-100 cursor-pointer text-sm font-bold"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Student Details Card */}
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 bg-teal-50/20 border border-teal-100 p-4 rounded-xl text-xs font-semibold leading-relaxed">
                        <div>
                          <span className="text-zinc-400 block font-medium">学生姓名：</span>
                          <span className="text-zinc-900 font-extrabold text-sm">{addTimeStudent.name}</span>
                        </div>
                        <div>
                          <span className="text-zinc-400 block font-medium">学号：</span>
                          <span className="text-zinc-905 font-mono text-[11px]">{addTimeStudent.sno}</span>
                        </div>
                        <div>
                          <span className="text-zinc-400 block font-medium">已用/剩余时间：</span>
                          <span className="text-[#009b86] font-extrabold font-mono text-[11px]">{addTimeStudent.duration || "0分钟"} / {addTimeStudent.remainingTime || "0分钟"}</span>
                        </div>
                      </div>

                      {/* Form Details */}
                      <div className="space-y-4 text-xs font-bold text-zinc-700">
                        
                        {/* Selector Option for Duration increment */}
                        <div className="space-y-2">
                          <label className="text-zinc-650 font-extrabold block">增加时长跨度 <span className="text-rose-500">*</span></label>
                          <div className="grid grid-cols-5 gap-2">
                            {["30", "60", "90", "120", "custom"].map((type) => {
                              const labelMap: Record<string, string> = {
                                "30": "30分钟",
                                "60": "60分钟",
                                "90": "90分钟",
                                "120": "120分钟",
                                "custom": "自定义"
                              };
                              const isSel = extendMinutesType === type;
                              return (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() => setExtendMinutesType(type)}
                                  className={`p-2 rounded-lg font-bold border text-center transition-all cursor-pointer ${
                                    isSel 
                                      ? "bg-[#009b86] text-white border-[#009b86] shadow-sm" 
                                      : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300"
                                  }`}
                                >
                                  {labelMap[type]}
                                </button>
                              );
                            })}
                          </div>

                          {/* Custom input panel if choice is custom */}
                          {extendMinutesType === "custom" && (
                            <div className="pt-2 flex items-center gap-2">
                              <span className="text-zinc-400 font-medium">指定时长：</span>
                              <input
                                type="number"
                                value={customExtendMinutes}
                                onChange={(e) => setCustomExtendMinutes(parseInt(e.target.value) || 0)}
                                className="w-24 bg-white border border-zinc-200 rounded-md p-1.5 outline-none text-center font-mono font-bold"
                                min={5}
                                max={480}
                              />
                              <span className="text-zinc-500">分钟</span>
                            </div>
                          )}
                        </div>

                        {/* Reason choice */}
                        <div className="space-y-1.5">
                          <label className="text-zinc-600 font-extrabold">延时调整原因 <span className="text-rose-500">*</span></label>
                          <select
                            value={extendReason}
                            onChange={(e) => setExtendReason(e.target.value)}
                            className="w-full bg-white border border-zinc-200 hover:border-zinc-300 rounded-lg p-2.5 outline-none font-bold text-xs"
                          >
                            <option value="实验环境异常">物联网虚实调试异常(实训室网络断连)</option>
                            <option value="设备调试学习难度大">基础薄弱，设备接线与参数排错难度较高</option>
                            <option value="学生临时因病请假">对应请假离校或其他特批教学事项</option>
                            <option value="设备数量超限排队中">虚实接入通道并发排队拥堵</option>
                            <option value="其他原因">其它合理的自定义教务原因</option>
                          </select>
                        </div>

                        {/* Extra Memo explanations */}
                        <div className="space-y-1.5">
                          <label className="text-zinc-650 font-extrabold block">额外情况备注</label>
                          <textarea
                            value={extendDesc}
                            onChange={(e) => setExtendDesc(e.target.value)}
                            rows={2}
                            className="w-full bg-zinc-50 focus:bg-white border border-zinc-200 hover:border-zinc-350 rounded-lg p-2.5 outline-none font-semibold text-xs leading-relaxed resize-none"
                            placeholder="请输入更多细节信息以作教务备案凭证..."
                          />
                        </div>

                        {/* Deadline synchronization alignment checkbox */}
                        <div className="pt-1 select-none">
                          <label className="flex items-start gap-2 cursor-pointer font-bold text-zinc-600">
                            <input
                              type="checkbox"
                              checked={syncDeadlineExt}
                              onChange={(e) => setSyncDeadlineExt(e.target.checked)}
                              className="mt-0.5 rounded border-zinc-300 text-[#009b86] focus:ring-[#009b86]"
                            />
                            <div className="flex-1 leading-normal">
                              <span>一键同步调整并延长该生的最终截止交付期限期限</span>
                              <span className="text-[10px] text-zinc-400 font-medium block mt-0.5 font-sans">启用后，系统会在原有截止时间的基础上，同步为该生宽限并延展相应比率的时分印花，使其提交时不视为过度逾时。</span>
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* Modal Footer actions */}
                      <div className="flex justify-end gap-2 border-t border-zinc-100 pt-3 text-xs font-bold font-sans">
                        <button
                          onClick={() => setAddTimeStudent(null)}
                          className="px-4 py-2 hover:bg-zinc-100 text-zinc-600 rounded-lg transition-colors cursor-pointer"
                        >
                          取消
                        </button>
                        <button
                          onClick={() => {
                            const addMin = extendMinutesType === "custom" ? customExtendMinutes : parseInt(extendMinutesType);
                            
                            // update list state
                            setTasksState(prev => prev.map(t => {
                              if (t.id === selectedTaskId) {
                                return {
                                  ...t,
                                  completedList: t.completedList.map(s => {
                                    if (s.id === addTimeStudent.id) {
                                      const oldRem = parseInt(s.remainingTime) || 120;
                                      return {
                                        ...s,
                                        remainingTime: `${oldRem + addMin}分钟`,
                                        addedTimeLimit: (s.addedTimeLimit || 0) + addMin
                                      };
                                    }
                                    return s;
                                  })
                                };
                              }
                              return t;
                            }));

                            // Append operation action log record
                            const logTime = new Date().toISOString().replace('T', ' ').substring(0, 16);
                            setOperationLogs(prev => [
                              {
                                time: logTime,
                                operator: "教师1",
                                studentName: addTimeStudent.name,
                                type: "增加时长",
                                content: `已延长该名学生实验上机控制限时：增加 ${addMin} 分钟，同步顺延交付截止期限：${syncDeadlineExt ? "是" : "否"}。`,
                                reason: extendReason
                              },
                              ...prev
                            ]);

                            // Keep focused details panel student in sync
                            if (selectedDetailStudent && selectedDetailStudent.id === addTimeStudent.id) {
                              const oldRem = parseInt(selectedDetailStudent.remainingTime) || 120;
                              setSelectedDetailStudent(prev => prev ? {
                                ...prev,
                                remainingTime: `${oldRem + addMin}分钟`,
                                addedTimeLimit: (prev.addedTimeLimit || 0) + addMin
                              } : null);
                            }

                            showToast(`已成功为学生【${addTimeStudent.name}】增加 ${addMin} 分钟的任务作答时长限额！`);
                            setAddTimeStudent(null);
                          }}
                          className="px-5 py-2.2 bg-[#009b86] hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer flex items-center gap-1 font-black"
                        >
                          <span>确认增加</span>
                        </button>
                      </div>

                    </div>
                  </div>
                )}

              </div>
            )}

            {/* VIEW 3: Completion logs students detailed list */}
            {activeSubTab === "stats" && (
              <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-6">
                <div className="border-b border-zinc-100 pb-3 flex justify-between items-center text-xs">
                  <div className="space-y-0.5">
                    <span className="bg-[#e6f5f3] text-[#009b86] text-[10px] px-2 py-0.5 rounded font-black max-w-max uppercase mb-1 block">
                      教学监测后台
                    </span>
                    <h2 className="text-base font-black text-zinc-900 flex items-center gap-1.5">
                      <Users className="w-5 h-5 text-[#009b86]" />
                      <span>学生完成情况数据总览</span>
                    </h2>
                    <p className="text-xs text-zinc-500 font-semibold">
                      对任教班级的所有实验关卡提交进度进行动态总览控制。
                    </p>
                  </div>
                  
                  <div className="flex gap-2 font-bold">
                    <button
                      onClick={() => showToast("正在一键导出交付记录进度至Excel中...")}
                      className="px-3.5 py-1.8 border border-zinc-200 hover:border-[#009b86] text-zinc-700 hover:text-[#009b86] text-xs rounded-lg transition-all cursor-pointer"
                    >
                      导出数据
                    </button>
                    <button
                      onClick={() => showToast("已启动批量催交提醒通知...")}
                      className="px-3.5 py-1.8 bg-[#009b86] text-white text-xs font-black rounded-lg transition-colors cursor-pointer"
                    >
                      一键催交
                    </button>
                  </div>
                </div>

                <div className="bg-zinc-50 rounded-2xl p-4.5 border border-zinc-200 text-xs text-zinc-600 leading-relaxed font-semibold">
                  <span className="text-[#009b86] font-black block mb-1">📊 实验全班督战看板</span>
                  <span>可选择以上“任务管理”子功能中指定特定的物理接入、MQTT自学任务，快捷切换并聚焦于指定学生的实验细节评分卡片。</span>
                </div>

                <div className="table-container border border-zinc-200 rounded-2xl overflow-hidden text-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px] text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 text-zinc-500 font-bold border-b border-zinc-200 text-[11px] uppercase tracking-wide">
                        <th className="p-3.5 pl-5">学号</th>
                        <th className="p-3.5">学生姓名</th>
                        <th className="p-3.5">所属班级</th>
                        <th className="p-3.5">真机实训耗时</th>
                        <th className="p-3.5 text-center">状态</th>
                        <th className="p-3.5">对应核心任务</th>
                        <th className="p-3.5 text-center">成绩</th>
                        <th className="p-3.5 text-right pr-5">一键操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 font-medium text-zinc-700">
                      {[
                        { sno: "20230101", name: "学生1", class: "物联网2301班", time: "118分钟", status: "已完成", score: "92分", taskName: "物联网设备接入实验任务" },
                        { sno: "20230102", name: "学生2", class: "物联网2301班", time: "126分钟", status: "已完成", score: "待评分", taskName: "物联网设备接入实验任务" },
                        { sno: "20230103", name: "张三", class: "物联网2301班", time: "88分钟", status: "已完成", score: "95分", taskName: "MQTT通信协议章节学习" },
                        { sno: "20230104", name: "李四", class: "物联网2301班", time: "84分钟", status: "已完成", score: "91分", taskName: "MQTT通信协议章节学习" },
                        { sno: "20230105", name: "赵六", class: "工业互联网2301班", time: "55分钟", status: "已完成", score: "90分", taskName: "Linux基础命令练习" },
                        { sno: "20230106", name: "孙八", class: "工业互联网2301班", time: "——", status: "进行中", score: "——", taskName: "Linux基础命令练习" },
                        { sno: "20230107", name: "周九", class: "工业互联网2301班", time: "142分钟", status: "已完成", score: "待评分", taskName: "行业云平台数据上报实验" }
                      ].map((item, idx) => (
                        <tr key={idx} className="hover:bg-zinc-50/60 transition-colors">
                          <td className="p-3.5 pl-5 font-mono text-zinc-400">{item.sno}</td>
                          <td className="p-3.5 font-bold text-zinc-900">{item.name}</td>
                          <td className="p-3.5">{item.class}</td>
                          <td className="p-3.5 font-mono">{item.time}</td>
                          <td className="p-3.5 text-center">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              item.status === "已完成" ? "bg-teal-50 text-[#009b86]" : "bg-blue-50 text-blue-600 animate-pulse"
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="p-3.5 font-bold text-zinc-650 truncate max-w-[150px]" title={item.taskName}>{item.taskName}</td>
                          <td className="p-3.5 font-bold text-zinc-950 font-mono text-center">{item.score}</td>
                          <td className="p-3.5 text-right pr-5">
                            {item.status === "已完成" ? (
                              <button
                                onClick={() => showToast(`载入学生【${item.name}】的实验日志与已选报告包`)}
                                className="text-[#009b86] font-bold hover:text-teal-900 cursor-pointer"
                              >
                                评阅报告
                              </button>
                            ) : (
                              <button
                                onClick={() => showToast(`已向进行中学生【${item.name}】一键下发短信提醒补交`)}
                                className="text-zinc-600 font-bold hover:text-zinc-900 cursor-pointer"
                              >
                                提醒提交
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              </div>
            )}

            {/* VIEW 4: Resource chapters configurations */}
            {activeSubTab === "chapters" && (
              <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-5 shadow-xs">
                <div className="border-b border-zinc-100 pb-3 flex justify-between items-center text-xs">
                  <div className="space-y-0.5">
                    <span className="bg-[#e6f5f3] text-[#009b86] text-[10px] px-2 py-0.5 rounded font-black max-w-max uppercase mb-1 block">
                      资源大纲组
                    </span>
                    <h2 className="text-base font-black text-zinc-900 flex items-center gap-1.5">
                      <BookOpen className="w-5 h-5 text-[#009b86]" />
                      <span>资源章节配置</span>
                    </h2>
                    <p className="text-xs text-zinc-500 font-semibold">
                      配置任学门所属的标准大纲节点和物理沙盒。
                    </p>
                  </div>
                  <button
                    onClick={() => showToast("已成功触发新增大纲章节窗口")}
                    className="px-3.5 py-1.5 bg-[#009b86] hover:bg-emerald-700 text-white text-xs font-black rounded-lg transition-colors"
                  >
                    + 新建章节大纲
                  </button>
                </div>
                
                <div className="space-y-4">
                  {[
                    { title: "物联网设备开发实战课程大纲", count: "5个章 12个物理仿真包", update: "2026-05-24" },
                    { title: "Linux操作系统基础大纲", count: "8个章 20个标准命令行集", update: "2026-05-30" },
                    { title: "边缘计算网关典型工程部署案例库", count: "3个章 6个虚实设备集群", update: "2026-06-01" }
                  ].map((item, idx) => (
                    <div key={idx} className="p-4 border border-zinc-200 hover:border-[#009b86]/35 rounded-xl bg-zinc-50/20 text-xs font-semibold flex justify-between items-center">
                      <div className="space-y-1">
                        <span className="text-zinc-905 block font-bold text-sm">{item.title}</span>
                        <span className="text-zinc-450 text-[11px] block">{item.count} ｜ 最新修订：{item.update}</span>
                      </div>
                      <button
                        onClick={() => showToast(`已启动编辑大纲：${item.title}`)}
                        className="px-3.5 py-1.5 bg-[#e6f5f3] text-[#009b86] font-bold border border-[#009b86]/10 rounded-md hover:bg-[#009b86] hover:text-white transition-all cursor-pointer text-xs"
                      >
                        编辑配置
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VIEW 5: Class resources mapping config */}
            {activeSubTab === "classes" && (
              <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-5 shadow-xs">
                <div className="border-b border-zinc-100 pb-3 flex justify-between items-center text-xs">
                  <div className="space-y-0.5">
                    <span className="bg-[#e6f5f3] text-[#009b86] text-[10px] px-2 py-0.5 rounded font-black max-w-max uppercase mb-1 block">
                      授课大纲组
                    </span>
                    <h2 className="text-base font-black text-zinc-900 flex items-center gap-1.5">
                      <Users className="w-5 h-5 text-[#009b86]" />
                      <span>班级资源配置</span>
                    </h2>
                    <p className="text-xs text-zinc-500 font-semibold">
                      将指定年级行政班级映射关联至标准课程大纲包。
                    </p>
                  </div>
                  <button
                    onClick={() => showToast("已启动绑定新班级资源映射关系...")}
                    className="px-3.5 py-1.5 bg-[#009b86] hover:bg-emerald-700 text-white text-xs font-black rounded-lg transition-colors"
                  >
                    + 绑定并关联班级
                  </button>
                </div>

                <div className="space-y-4">
                  {[
                    { name: "物联网2301班", spec: "42名受托学生 ｜ 关联大纲课程：物联网设备开发实战" },
                    { name: "物联网2302班", spec: "39名受托学生 ｜ 关联大纲课程：边缘计算技术应用" },
                    { name: "工业互联网2301班", spec: "36名受托学生 ｜ 关联大纲课程：Linux操作系统" }
                  ].map((item, idx) => (
                    <div key={idx} className="p-4 border border-zinc-200 hover:border-[#009b86]/35 rounded-xl bg-zinc-50/20 text-xs font-semibold flex justify-between items-center">
                      <div className="space-y-1">
                        <span className="text-zinc-905 block font-bold text-sm">{item.name}</span>
                        <span className="text-zinc-450 text-[11px] block">{item.spec}</span>
                      </div>
                      <button
                        onClick={() => showToast(`正在调整该物理班【${item.name}】的实验大纲资源分配...`)}
                        className="px-3.5 py-1.2 bg-[#e6f5f3] text-[#009b86] font-bold border border-[#009b86]/10 rounded-md hover:bg-[#009b86] hover:text-white transition-all cursor-pointer text-xs"
                      >
                        配置资源
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

          </div>
        </div>
      </div>
    </div>
  );
}
