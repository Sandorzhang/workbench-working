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

// 颜色映射
const colorMap: Record<string, string> = {
  'users': 'bg-blue-500',
  'database': 'bg-green-500',
  'file-text': 'bg-yellow-500',
  'map': 'bg-purple-500',
  'clock': 'bg-pink-500',
  'book-open': 'bg-indigo-500',
  'graduation-cap': 'bg-red-500',
  'layout': 'bg-orange-500',
  'user-check': 'bg-teal-500',
  'home': 'bg-cyan-500',
  'calendar': 'bg-lime-500',
  'briefcase': 'bg-emerald-500',
  'dollar-sign': 'bg-amber-500',
  'settings': 'bg-slate-500',
  'bar-chart': 'bg-violet-500',
  'activity': 'bg-fuchsia-500',
  'layers': 'bg-rose-500',
  'shield': 'bg-sky-500',
  'bell': 'bg-blue-600',
  'search': 'bg-green-600',
  'zap': 'bg-yellow-600',
  'compass': 'bg-purple-600',
  'heart': 'bg-pink-600',
  'inbox': 'bg-indigo-600',
  'mail': 'bg-red-600',
  'message-square': 'bg-orange-600',
  'phone': 'bg-teal-600',
  'pie-chart': 'bg-cyan-600',
  'smartphone': 'bg-lime-600',
  'star': 'bg-emerald-600',
  'target': 'bg-amber-600',
  'truck': 'bg-slate-600',
  'upload': 'bg-violet-600',
  'video': 'bg-fuchsia-600',
  'wifi': 'bg-rose-600',
  'award': 'bg-sky-600'
};

export function ApplicationCard({ application }: { application: Application }) {
  const Icon = iconMap[application.icon] || Users;
  const bgColor = colorMap[application.icon] || 'bg-gray-500';
  
  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start mb-4">
          <div className={`p-3 rounded-lg ${bgColor} mr-4`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-lg">{application.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{application.description}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 px-6 py-3">
        <Link href={application.url} className="w-full">
          <Button variant="outline" className="w-full">
            进入应用
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
} 