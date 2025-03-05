// 'use client';

// import { useState, useEffect } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Badge } from '@/components/ui/badge';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Search, RefreshCw } from 'lucide-react';
// import { StudentWithIndicators } from "@/types/student";

// // 使用类型别名简化接口
// type Student = StudentWithIndicators;

// interface StudentListMobileProps {
//   title?: string;
//   onSelectStudent?: (student: Student) => void;
//   className?: string;
//   width?: string;
// }

// export function StudentListMobile({
//   title = "学生列表",
//   onSelectStudent,
//   className,
//   width = "100%"
// }: StudentListMobileProps) {
//   const [students, setStudents] = useState<Student[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState("");
  
//   useEffect(() => {
//     // 从API获取学生数据
//     const fetchStudents = async () => {
//       try {
//         setLoading(true);
//         // 实际项目中应该使用API获取数据
//         const response = await fetch('/api/mentor/students');
//         if (response.ok) {
//           const data = await response.json();
//           setStudents(data);
//         }
//       } catch (error) {
//         console.error('获取学生列表失败:', error);
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     fetchStudents();
//   }, []);
  
//   // 过滤学生
//   const filteredStudents = students.filter(student => 
//     student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
//     student.studentId.toLowerCase().includes(searchQuery.toLowerCase())
//   );
  
//   // 刷新数据
//   const handleRefresh = async () => {
//     try {
//       setLoading(true);
//       // 实际项目中应该使用API获取数据
//       const response = await fetch('/api/mentor/students');
//       if (response.ok) {
//         const data = await response.json();
//         setStudents(data);
//       }
//     } catch (error) {
//       console.error('获取学生列表失败:', error);
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   return (
//     <Card className={`h-full flex flex-col ${className}`} style={{ width }}>
//       <CardHeader className="px-4 py-3 flex flex-row items-center justify-between space-y-0">
//         <CardTitle className="text-base font-medium flex items-center">
//           {title}
//           <Badge variant="outline" className="ml-2 text-xs h-5 px-2 bg-white">
//             {filteredStudents.length}/{students.length}
//           </Badge>
//         </CardTitle>
//         <button 
//           onClick={handleRefresh} 
//           className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
//           disabled={loading}
//         >
//           <RefreshCw className={`h-4 w-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
//         </button>
//       </CardHeader>
      
//       <div className="px-4 py-2 border-b border-t border-gray-100">
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//           <Input 
//             type="text"
//             placeholder="搜索姓名或学号..." 
//             className="h-9 text-sm pl-9 pr-2 rounded-md border-gray-200"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//           />
//           {searchQuery && (
//             <button 
//               className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-gray-700 transition-colors"
//               onClick={() => setSearchQuery("")}
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
//                 <line x1="18" y1="6" x2="6" y2="18"></line>
//                 <line x1="6" y1="6" x2="18" y2="18"></line>
//               </svg>
//             </button>
//           )}
//         </div>
//       </div>
      
//       <CardContent className="flex-1 p-0 overflow-y-auto">
//         {loading ? (
//           <div className="space-y-3 p-4">
//             {[1, 2, 3, 4, 5].map((i) => (
//               <div key={i} className="flex items-center space-x-2">
//                 <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse"></div>
//                 <div className="space-y-2 flex-1">
//                   <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
//                   <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : filteredStudents.length > 0 ? (
//           <div className="student-list">
//             {filteredStudents.map((student, index) => (
//               <div 
//                 key={student.id} 
//                 className={`p-3 ${index !== filteredStudents.length - 1 ? 'border-b border-gray-100' : ''} flex items-center cursor-pointer hover:bg-slate-50 transition-all duration-200`}
//                 onClick={() => onSelectStudent && onSelectStudent(student)}
//               >
//                 <Avatar className="h-12 w-12 mr-3 ring-1 ring-gray-100">
//                   <AvatarImage src={student.avatar} alt={student.name} />
//                   <AvatarFallback className="text-sm bg-slate-100 text-slate-500">{student.name.slice(0, 2)}</AvatarFallback>
//                 </Avatar>
//                 <div className="flex-1 min-w-0 py-1">
//                   <p className="font-medium text-base text-slate-700">
//                     {student.name}
//                   </p>
//                   <p className="text-sm text-muted-foreground mt-0.5">
//                     学号: <span className="font-medium text-slate-600">{student.studentId}</span>
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="flex flex-col items-center justify-center h-40 p-4">
//             <Search className="h-5 w-5 text-muted-foreground opacity-20 mb-2" />
//             <p className="text-sm text-muted-foreground text-center">未找到匹配的学生</p>
//             {searchQuery && (
//               <button 
//                 className="mt-2 text-xs text-primary hover:underline"
//                 onClick={() => setSearchQuery("")}
//               >
//                 清除搜索
//               </button>
//             )}
//           </div>
//         )}
//       </CardContent>
      
//       <style jsx global>{`
//         .student-list::-webkit-scrollbar {
//           width: 4px;
//         }
        
//         .student-list::-webkit-scrollbar-track {
//           background: transparent;
//         }
        
//         .student-list::-webkit-scrollbar-thumb {
//           background-color: rgba(203, 213, 225, 0.4);
//           border-radius: 4px;
//         }
        
//         .student-list::-webkit-scrollbar-thumb:hover {
//           background-color: rgba(203, 213, 225, 0.6);
//         }
//       `}</style>
//     </Card>
//   );
// } 