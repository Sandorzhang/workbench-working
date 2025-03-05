import { http } from 'msw';

import { authHandlers } from './auth';
import { aiLibraryHandlers } from './ai-library';
import { conceptMapHandlers } from './concept-map';
import { academicJourneyHandlers } from './academic-journey';
import { examHandlers } from './exam';
import { questionsHandlers } from './question';
import { studentHandlers } from './student';
import { teacherHandlers } from './teacher';
import { testHandlers } from './test';
import { studentEvaluationHandlers } from './student-evaluation';
import { 
  getStudentRecordsHandler, 
  addStudentRecordHandler, 
  addStudentRecordByIdHandler,
  updateStudentRecordHandler, 
  deleteStudentRecordHandler,
  getDefaultStudentHandler
} from './student-records';
import { educationManagementHandlers } from './education-management';
import { teacherManagementHandlers } from './teacher-management';
import { studentManagementHandlers } from './student-management';
import { gradeManagementHandlers, classManagementHandlers } from './grade-class-management';
import { regionHandlers } from './region';
import { schoolHandlers } from './school';
import { userHandlers } from './user';
import { superadminHandlers } from './superadmin';
import { applicationHandlers } from './application';
import { permissionHandlers } from './permission';
// 导入其他处理器...

export const handlers = [
  ...authHandlers,
  ...aiLibraryHandlers,
  ...conceptMapHandlers,
  ...academicJourneyHandlers,
  ...examHandlers,
  ...questionsHandlers,
  ...studentHandlers,
  ...teacherHandlers,
  ...testHandlers,
  ...studentEvaluationHandlers,
  // 学生记录处理程序
  getStudentRecordsHandler,
  addStudentRecordHandler,
  addStudentRecordByIdHandler,
  updateStudentRecordHandler,
  deleteStudentRecordHandler,
  getDefaultStudentHandler,
  // 其他处理器...
  
  // 处理默认头像
  http.get('*/avatars/default.png', () => {
    // 返回一个简单的透明图片数据
    return new Response(new Blob(), { 
      status: 200, 
      headers: {
        'Content-Type': 'image/png'
      }
    });
  }),
  ...educationManagementHandlers,
  ...teacherManagementHandlers,
  ...studentManagementHandlers,
  ...gradeManagementHandlers,
  ...classManagementHandlers,
  ...regionHandlers,
  ...schoolHandlers,
  ...userHandlers,
  ...superadminHandlers,
  ...applicationHandlers,
  ...permissionHandlers,
]; 