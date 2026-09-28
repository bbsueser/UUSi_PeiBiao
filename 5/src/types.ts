/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ActiveTab = 
  | "dashboard" 
  | "courses" 
  | "labs" 
  | "exams" 
  | "specs" 
  | "exams_tab" 
  | "best_practices" 
  | "product_center" 
  | "about_platform"
  | "ai_assistant"
  | "ai_skills_config"
  | "ai_analysis"
  | "hardware_agent"
  | "personal_center"
  | "task_assignment";

export interface AiAssistantInitContext {
  courseName?: string;
  presetPrompts?: Array<{ q: string; sub: string }>;
  welcomeMessage?: string;
}

export interface UserSession {
  id: string;
  username: string;
  realName: string;
  role: "student" | "teacher" | "admin";
  className?: string;
  classId?: string;
  schoolName?: string;
  department?: string;
}

export interface Course {
  id: string;
  title: string;
  specialty: string;
  category: string;
  studentsCount: number;
  type: string;
  desc: string;
  envIcons: string[];
  badge: "AI" | "TB" | string;
  color: string;
  accent: string;
  techIcon: string;
  tags?: string[];
}

export interface Lab {
  id: string;
  title: string;
  type: string;
  desc: string;
  coursesCount: number;
  durationHours: number;
  viewsCount: number;
  tagColor: string;
  accent: string;
  avatarLogo: string;
}

export interface Exam {
  id: string;
  title: string;
  code: string;
  duration: number;
  questionCount: number;
  totalPoints: number;
  passingPoints: number;
  status: "coming" | "ongoing" | "ended";
}
