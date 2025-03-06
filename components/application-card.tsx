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

// 应用类型定义
interface Application {
  id: string;
  name: string;
  description: string;
  icon: string;
  url: string;
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

// 颜色映射 - 更新为渐变色
const colorMap: Record<string, string> = {
  'users': 'from-blue-500 to-blue-600',
  'database': 'from-green-500 to-green-600',
  'file-text': 'from-yellow-500 to-amber-600',
  'map': 'from-purple-500 to-purple-600',
  'clock': 'from-pink-500 to-pink-600',
  'book-open': 'from-indigo-500 to-indigo-600',
  'graduation-cap': 'from-red-500 to-red-600',
  'layout': 'from-orange-500 to-orange-600',
  'user-check': 'from-teal-500 to-teal-600',
  'home': 'from-cyan-500 to-cyan-600',
  'calendar': 'from-lime-500 to-lime-600',
  'briefcase': 'from-emerald-500 to-emerald-600',
  'dollar-sign': 'from-amber-500 to-amber-600',
  'settings': 'from-slate-500 to-slate-600',
  'bar-chart': 'from-violet-500 to-violet-600',
  'activity': 'from-fuchsia-500 to-fuchsia-600',
  'layers': 'from-rose-500 to-rose-600',
  'shield': 'from-sky-500 to-sky-600',
  'bell': 'from-blue-600 to-indigo-700',
  'search': 'from-green-600 to-emerald-700',
  'zap': 'from-yellow-600 to-amber-700',
  'compass': 'from-purple-600 to-violet-700',
  'heart': 'from-pink-600 to-rose-700',
  'inbox': 'from-indigo-600 to-blue-700',
  'mail': 'from-red-600 to-rose-700',
  'message-square': 'from-orange-600 to-amber-700',
  'phone': 'from-teal-600 to-green-700',
  'pie-chart': 'from-cyan-600 to-sky-700',
  'smartphone': 'from-lime-600 to-green-700',
  'star': 'from-emerald-600 to-teal-700',
  'target': 'from-amber-600 to-orange-700',
  'truck': 'from-slate-600 to-gray-700',
  'upload': 'from-violet-600 to-purple-700',
  'video': 'from-fuchsia-600 to-pink-700',
  'wifi': 'from-rose-600 to-red-700',
  'award': 'from-sky-600 to-cyan-700'
};

export function ApplicationCard({ application }: { application: Application }) {
  const Icon = iconMap[application.icon] || Users;
  const gradientColor = colorMap[application.icon] || 'from-gray-500 to-gray-600';
  
  return (
    <Link href={application.url} className="block h-full">
      <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:translate-y-[-2px] border-gray-100/80 group">
        <CardContent className="p-5">
          <div className="flex items-start mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${gradientColor} mr-4 shadow-sm group-hover:shadow group-hover:scale-105 transition-all duration-300`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors duration-200">{application.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{application.description}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/30 px-5 py-3 border-t border-gray-100/80">
          <Button 
            variant="ghost" 
            className="w-full group-hover:bg-primary/10 group-hover:text-primary transition-all duration-200"
          >
            进入应用
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200"
            >
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
} 