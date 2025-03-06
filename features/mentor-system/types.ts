// 记录类型定义
export type RecordType = 
  | "intervention" 
  | "referral" 
  | "note" 
  | "plan504" 
  | "reportCardNotes" 
  | "minorBehavior" 
  | "elementaryReportCard" 
  | "attendance" 
  | "counselorMeeting" 
  | "task" 
  | "studentSupportMeeting" 
  | "accommodations";

// 记录类型中文名称映射
export const recordTypeNames: Record<RecordType, string> = {
  intervention: "干预",
  referral: "转介",
  note: "笔记",
  plan504: "504计划",
  reportCardNotes: "成绩单备注",
  minorBehavior: "轻微行为问题",
  elementaryReportCard: "小学成绩单",
  attendance: "出勤",
  counselorMeeting: "辅导员会议",
  task: "任务",
  studentSupportMeeting: "学生支持会议",
  accommodations: "特殊照顾"
};

// 记录状态类型
export type RecordStatus = 
  | "notStarted"  // 未开始
  | "inProgress"  // 有进度
  | "noProgress"  // 没有进度
  | "completed";  // 目标达成

// 记录状态中文名称映射
export const recordStatusNames: Record<RecordStatus, string> = {
  notStarted: "未开始",
  inProgress: "有进度",
  noProgress: "没有进度",
  completed: "目标达成"
};

// 记录状态颜色映射
export const recordStatusColors: Record<RecordStatus, string> = {
  notStarted: "bg-gray-100 text-gray-500 border-gray-200",
  inProgress: "bg-blue-100 text-blue-700 border-blue-200",
  noProgress: "bg-amber-100 text-amber-700 border-amber-200",
  completed: "bg-green-100 text-green-700 border-green-200"
};

// 记录接口
export interface StudentRecord {
  id: string;
  studentId: string;
  type: RecordType;
  status: RecordStatus;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  // 根据不同记录类型可能有不同字段
  metadata?: Record<string, any>;
} 