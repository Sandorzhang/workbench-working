import React from 'react';
import { Clock, Calendar, Heart, Award, User, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/shared/lib/utils';
import { ClassRecord } from '@/mocks/handlers/classroom-timemachine';
import { motion } from 'framer-motion';

// 学科颜色映射
const subjectColors: Record<string, string> = {
  '语文': 'text-red-500 border-red-200',
  '数学': 'text-purple-500 border-purple-200',
  '英语': 'text-blue-500 border-blue-200',
  '物理': 'text-sky-500 border-sky-200',
  '化学': 'text-green-500 border-green-200',
  '生物': 'text-emerald-500 border-emerald-200',
  '历史': 'text-amber-500 border-amber-200',
  '地理': 'text-rose-500 border-rose-200',
  '政治': 'text-indigo-500 border-indigo-200',
};

interface RecordCardProps {
  record: ClassRecord;
  isSelected?: boolean;
  isTopLiked?: boolean;
  onClick?: (id: string) => void;
}

export const RecordCard: React.FC<RecordCardProps> = ({
  record,
  isSelected = false,
  isTopLiked = false,
  onClick
}) => {
  const handleClick = () => {
    if (onClick) onClick(record.id);
  };

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className={cn(
          "overflow-hidden cursor-pointer transition-all duration-300 border border-gray-200",
          isSelected ? "ring-2 ring-primary shadow-md" : "hover:shadow-md"
        )}
        onClick={handleClick}
      >
        <div className="relative h-32 w-full group">
          <div className="absolute inset-0 overflow-hidden">
            <motion.img 
              src={record.thumbnail} 
              alt={record.title} 
              className="absolute inset-0 w-full h-full object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.4 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
              <div className="absolute bottom-2 left-2 right-2">
                <div className="flex items-center gap-1 mb-1">
                  <Badge className={record.isMine ? "bg-sky-600 hover:bg-sky-700" : "bg-indigo-600 hover:bg-indigo-700"}>
                    <User className="h-3 w-3 mr-1" />
                    {record.class}
                  </Badge>
                  {record.isMine && (
                    <Badge variant="secondary" className="bg-sky-100 text-sky-800 hover:bg-sky-200 text-xs">
                      <BookOpen className="h-3 w-3 mr-1" />
                      我的
                    </Badge>
                  )}
                  {isTopLiked && (
                    <Badge variant="secondary" className="bg-rose-100 text-rose-800 hover:bg-rose-200 text-xs">
                      <Award className="h-3 w-3 mr-1" />
                      热门
                    </Badge>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-white line-clamp-1">{record.title}</h3>
              </div>
            </div>
            
            {/* 学科标签 */}
            <div className="absolute top-2 right-2">
              <Badge variant="outline" className={cn("border px-2 py-0.5 text-xs", subjectColors[record.subject])}>
                {record.subject}
              </Badge>
            </div>
          </div>
        </div>
        <CardContent className="p-3">
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center">
              <Clock className="h-3 w-3 text-gray-500 mr-1" />
              <span className="text-gray-500">{record.duration}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-3 w-3 text-gray-500 mr-1" />
              <span className="text-gray-500">{record.date}</span>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <div className="flex items-center">
              <Avatar className="h-5 w-5 mr-1">
                <AvatarFallback>{record.teacher.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="font-medium">{record.teacher}</span>
            </div>
            <div className="flex items-center text-rose-500">
              <Heart className="h-3 w-3 mr-1 fill-rose-500" />
              <span>{record.likes}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RecordCard; 