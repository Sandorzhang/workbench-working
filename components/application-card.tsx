import Link from 'next/link';
import { 
  Users, Database, FileText, Map, Clock, BookOpen, 
  GraduationCap, Layout, UserCheck, Home, Calendar, 
  Briefcase, DollarSign, Settings, BarChart, Activity,
  Layers, Shield, Bell, Search, Zap, Compass, Heart,
  Inbox, Mail, MessageSquare, Phone, PieChart, Smartphone,
  Star, Target, Truck, Upload, Video, Wifi, Award
} from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// 应用类型定义
interface Application {
  id: string;
  name: string;
  description: string;
  icon: string;
  url: string;
  isNew?: boolean;
  isRecommended?: boolean;
}

// 图标映射
const iconMap: Record<string, React.ElementType> = {
  'users': Users,
  'database': Database,
  'file-text': FileText,
  'map': Map,
  'clock': Clock,
  'book-open': BookOpen,
  'graduation-cap': GraduationCap,
  'layout': Layout,
  'user-check': UserCheck,
  'home': Home,
  'calendar': Calendar,
  'briefcase': Briefcase,
  'dollar-sign': DollarSign,
  'settings': Settings,
  'bar-chart': BarChart,
  'activity': Activity,
  'layers': Layers,
  'shield': Shield,
  'bell': Bell,
  'search': Search,
  'zap': Zap,
  'compass': Compass,
  'heart': Heart,
  'inbox': Inbox,
  'mail': Mail,
  'message-square': MessageSquare,
  'phone': Phone,
  'pie-chart': PieChart,
  'smartphone': Smartphone,
  'star': Star,
  'target': Target,
  'truck': Truck,
  'upload': Upload,
  'video': Video,
  'wifi': Wifi,
  'award': Award
};

// 高级渐变色映射 - 使用更精致的渐变方案
const colorMap: Record<string, string> = {
  'users': 'from-blue-500 via-blue-400 to-blue-600',
  'database': 'from-emerald-500 via-emerald-400 to-green-600',
  'file-text': 'from-amber-500 via-yellow-400 to-yellow-600',
  'map': 'from-violet-500 via-purple-400 to-purple-600',
  'clock': 'from-pink-500 via-pink-400 to-pink-600',
  'book-open': 'from-indigo-500 via-indigo-400 to-indigo-600',
  'graduation-cap': 'from-rose-500 via-red-400 to-red-600',
  'layout': 'from-orange-500 via-orange-400 to-orange-600',
  'user-check': 'from-teal-500 via-teal-400 to-teal-600',
  'home': 'from-cyan-500 via-cyan-400 to-cyan-600',
  'calendar': 'from-lime-500 via-lime-400 to-lime-600',
  'briefcase': 'from-emerald-500 via-emerald-400 to-emerald-600',
  'dollar-sign': 'from-amber-500 via-amber-400 to-amber-600',
  'settings': 'from-slate-500 via-slate-400 to-slate-600',
  'bar-chart': 'from-violet-500 via-violet-400 to-violet-600',
  'activity': 'from-fuchsia-500 via-fuchsia-400 to-fuchsia-600',
  'layers': 'from-rose-500 via-rose-400 to-rose-600',
  'shield': 'from-sky-500 via-sky-400 to-sky-600',
  'bell': 'from-blue-600 via-blue-500 to-blue-700',
  'search': 'from-green-600 via-green-500 to-green-700',
  'zap': 'from-yellow-600 via-yellow-500 to-yellow-700',
  'compass': 'from-purple-600 via-purple-500 to-purple-700',
  'heart': 'from-pink-600 via-pink-500 to-pink-700',
  'inbox': 'from-indigo-600 via-indigo-500 to-indigo-700',
  'mail': 'from-red-600 via-red-500 to-red-700',
  'message-square': 'from-orange-600 via-orange-500 to-orange-700',
  'phone': 'from-teal-600 via-teal-500 to-teal-700',
  'pie-chart': 'from-cyan-600 via-cyan-500 to-cyan-700',
  'smartphone': 'from-lime-600 via-lime-500 to-lime-700',
  'star': 'from-yellow-500 via-amber-400 to-amber-600',
  'target': 'from-amber-600 via-amber-500 to-amber-700',
  'truck': 'from-slate-600 via-slate-500 to-slate-700',
  'upload': 'from-violet-600 via-violet-500 to-violet-700',
  'video': 'from-fuchsia-600 via-fuchsia-500 to-fuchsia-700',
  'wifi': 'from-rose-600 via-rose-500 to-rose-700',
  'award': 'from-sky-600 via-sky-500 to-sky-700'
};

export function ApplicationCard({ application }: { application: Application }) {
  const Icon = iconMap[application.icon] || Users;
  const gradientColor = colorMap[application.icon] || 'from-gray-500 via-gray-400 to-gray-600';
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      window.location.href = application.url;
    }
  };
  
  return (
    <Card className="group h-full flex flex-col overflow-hidden bg-white/80 backdrop-blur-sm backdrop-filter transition-all duration-300 hover:shadow-xl border border-gray-100 hover:border-gray-200/80 dark:border-gray-800 dark:hover:border-gray-700/80">
      <CardContent className="p-5 flex-grow">
        <div className="flex items-start space-x-4">
          <div 
            className={cn(
              `bg-gradient-to-br ${gradientColor} p-3.5 rounded-xl`,
              "shadow-md transform transition-all duration-500",
              "group-hover:scale-105 group-hover:shadow-lg",
              "relative overflow-hidden"
            )}
          >
            {/* Glowing effect overlay */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-60 transition-opacity duration-500 bg-white mix-blend-overlay rounded-xl"></div>
            
            {/* Shimmer effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-70 transition-opacity duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transform transition-transform ease-in-out duration-1500"></div>
            
            <Icon className="h-5 w-5 text-white relative z-10" />
          </div>
          
          <div className="flex-grow">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-lg tracking-tight text-gray-900 dark:text-gray-100 group-hover:text-gray-700 transition-colors dark:group-hover:text-white">
                {application.name}
              </h3>
              
              <div className="flex space-x-1.5">
                {application.isNew && (
                  <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs px-2 py-0.5 border border-blue-200/50 shadow-sm dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/40 dark:hover:bg-blue-900/30">
                    新
                  </Badge>
                )}
                
                {application.isRecommended && (
                  <Badge className="bg-amber-50 text-amber-600 hover:bg-amber-100 text-xs px-2 py-0.5 border border-amber-200/50 shadow-sm dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800/40 dark:hover:bg-amber-900/30">
                    推荐
                  </Badge>
                )}
              </div>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2 leading-relaxed">
              {application.description}
            </p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-gray-50/80 dark:bg-gray-900/40 group-hover:bg-gray-100/80 dark:group-hover:bg-gray-800/60 px-5 py-3.5 transition-colors border-t border-gray-100 dark:border-gray-800">
        <Link 
          href={application.url} 
          className="w-full" 
          tabIndex={0}
          aria-label={`进入${application.name}应用`}
          onKeyDown={handleKeyDown}
        >
          <Button 
            variant="outline" 
            className={cn(
              "w-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700",
              "group-hover:border-gray-300 dark:group-hover:border-gray-600 group-hover:shadow-sm",
              "flex items-center justify-center font-medium",
              "relative overflow-hidden"
            )}
          >
            {/* Button highlight effect */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transform transition-transform ease-in-out duration-1000"></div>
            
            <span className="relative z-10">进入应用</span>
            <svg className="w-4 h-4 ml-2 transition-transform duration-300 transform group-hover:translate-x-1 relative z-10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
} 