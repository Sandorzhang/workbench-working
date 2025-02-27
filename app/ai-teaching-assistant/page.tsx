"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Send, 
  Plus, 
  MoreHorizontal, 
  Trash2, 
  Edit, 
  Settings,
  Download,
  Copy,
  Search,
  Image,
  Paperclip,
  UserCircle,
  Bot,
  PlusCircle,
  Trash,
  MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

// 消息类型定义
interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
}

// 会话类型定义
interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  lastUpdated: string;
  messages: Message[];
}

const AITeachingAssistantPage = () => {
  // 状态管理
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const messageEndRef = useRef<HTMLDivElement>(null);
  
  // 获取当前选中的会话
  const activeConversation = activeConversationId 
    ? conversations.find(conv => conv.id === activeConversationId) 
    : null;
  
  // 初始化一些示例会话数据
  useEffect(() => {
    // 模拟从API获取会话列表
    const fetchConversations = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/ai-assistant/conversations');
        if (response.ok) {
          const data = await response.json();
          setConversations(data);
          if (data.length > 0) {
            setActiveConversationId(data[0].id);
          }
        } else {
          console.error('Failed to fetch conversations');
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
        // 添加一些默认会话数据用于演示
        const defaultConversations: Conversation[] = [
          {
            id: "1",
            title: "如何设计有效的课堂活动",
            lastMessage: "你可以尝试小组合作学习方式，这对培养学生的团队协作能力很有帮助。",
            lastUpdated: new Date(2023, 2, 15).toISOString(),
            messages: [
              {
                id: "m1",
                content: "你好，我想了解如何为初中学生设计更有趣的课堂活动？",
                role: "user",
                timestamp: new Date(2023, 2, 15, 10, 30).toISOString()
              },
              {
                id: "m2",
                content: "您好！为初中学生设计有趣的课堂活动需要考虑他们的认知发展和兴趣点。以下是一些建议：\n\n1. **游戏化学习**：将知识点融入游戏中，如知识竞赛、角色扮演或者学科相关的桌游。\n\n2. **小组项目**：设计需要合作完成的项目，培养团队协作能力。\n\n3. **实践活动**：动手实验或创作，如科学实验、艺术创作等。\n\n4. **辩论与讨论**：围绕课程主题进行辩论，培养批判性思维。\n\n5. **技术整合**：使用平板电脑、互动白板或教育应用程序进行互动学习。\n\n您希望我详细展开哪个方向的活动设计呢？",
                role: "assistant",
                timestamp: new Date(2023, 2, 15, 10, 32).toISOString()
              },
              {
                id: "m3",
                content: "小组项目听起来不错，你能详细说说如何组织小组合作学习吗？",
                role: "user",
                timestamp: new Date(2023, 2, 15, 10, 35).toISOString()
              },
              {
                id: "m4",
                content: "小组合作学习是一种非常有效的教学方法，特别适合初中生。以下是如何组织有效的小组合作学习：\n\n**1. 小组组建策略：**\n- 异质分组：将不同能力、学习风格和性格的学生混合，每组4-5人为宜\n- 考虑学生的社交关系，避免小团体或边缘化情况\n- 定期重组小组，让学生有机会与更多同学合作\n\n**2. 明确的角色分配：**\n- 组长：协调组内工作，确保任务进度\n- 记录员：记录讨论内容和决策\n- 材料管理员：负责管理学习资料\n- 报告员：向全班汇报小组成果\n- 鼓励官：给予组员积极反馈，保持团队士气\n\n**3. 项目设计要点：**\n- 设置明确的学习目标和成果要求\n- 任务应具有适当难度，需要团队合作才能完成\n- 提供清晰的评分标准\n- 设计需要不同技能的子任务，使每位学生都能贡献所长\n\n**4. 合作监督与指导：**\n- 巡视各小组，提供必要指导但不过度干预\n- 观察小组互动模式，及时调整不平衡情况\n- 引导学生学会如何有效沟通和解决冲突\n\n**5. 评估方式：**\n- 结合小组整体表现和个人贡献进行评分\n- 使用同伴评价作为参考\n- 让学生进行自我反思\n\n**6. 具体活动示例：**\n- 历史课：小组编写和表演历史事件微剧本\n- 科学课：设计和执行实验，分析结果并展示\n- 语文课：合作创作故事或编辑班级杂志\n- 数学课：解决现实生活中的数学问题并制作展示板\n\n您想要针对哪个具体学科设计一个小组合作学习活动？",
                role: "assistant",
                timestamp: new Date(2023, 2, 15, 10, 38).toISOString()
              }
            ]
          },
          {
            id: "2",
            title: "学生评价系统建议",
            lastMessage: "多元化评价体系可以更全面地反映学生的综合素质...",
            lastUpdated: new Date(2023, 2, 10).toISOString(),
            messages: [
              {
                id: "m1",
                content: "我想建立一个更全面的学生评价系统，有什么建议？",
                role: "user",
                timestamp: new Date(2023, 2, 10, 14, 20).toISOString()
              },
              {
                id: "m2",
                content: "建立全面的学生评价系统是提升教育质量的重要步骤。以下是一些建议：\n\n1. **多元评价维度**：除学术成绩外，还应包括品德表现、创新能力、团队合作、解决问题能力等\n\n2. **形成性与终结性评价结合**：不仅关注期末考试，也重视平时的课堂表现、作业完成情况等\n\n3. **定性与定量方法并用**：数据量化评估与描述性评语相结合\n\n4. **多方参与评价**：教师评价、学生自评、同伴互评、家长参与等\n\n希望这些建议对您有所帮助！",
                role: "assistant",
                timestamp: new Date(2023, 2, 10, 14, 24).toISOString()
              }
            ]
          },
          {
            id: "3",
            title: "个性化学习方案",
            lastMessage: "根据学生的学习风格和需求，我推荐以下个性化学习策略...",
            lastUpdated: new Date(2023, 2, 5).toISOString(),
            messages: []
          }
        ];
        setConversations(defaultConversations);
        setActiveConversationId("1");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchConversations();
  }, []);
  
  // 消息发送后自动滚动到底部
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConversation?.messages]);
  
  // 创建新会话
  const createNewConversation = async () => {
    try {
      const response = await fetch('/api/ai-assistant/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const newConversation = await response.json();
        setConversations(prev => [newConversation, ...prev]);
        setActiveConversationId(newConversation.id);
      }
    } catch (error) {
      console.error('Error creating new conversation:', error);
    }
  };
  
  // 发送消息
  const sendMessage = async () => {
    if (!inputMessage.trim() || !activeConversationId) return;
    
    setIsSending(true);
    try {
      // 更新UI状态
      const tempMessage: Message = {
        id: Date.now().toString(),
        content: inputMessage,
        role: 'user',
        timestamp: new Date().toISOString()
      };
      
      setConversations(prev => 
        prev.map(conv => 
          conv.id === activeConversationId 
            ? {...conv, messages: [...conv.messages, tempMessage]} 
            : conv
        )
      );
      
      setInputMessage('');
      
      // 发送API请求
      const response = await fetch('/api/ai-assistant/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: tempMessage.content,
          conversationId: activeConversationId
        })
      });
      
      if (response.ok) {
        const aiResponse = await response.json();
        
        // 更新会话列表
        setConversations(prev => 
          prev.map(conv => {
            if (conv.id === activeConversationId) {
              return {
                ...conv,
                messages: [...conv.messages, aiResponse],
                lastMessage: aiResponse.content,
                lastUpdated: aiResponse.timestamp
              };
            }
            return conv;
          })
        );
      } else {
        console.error('Failed to get AI response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };
  
  // 删除会话
  const deleteConversation = async (id: string) => {
    try {
      const response = await fetch(`/api/ai-assistant/conversations/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setConversations(prev => prev.filter(conv => conv.id !== id));
        if (activeConversationId === id) {
          const remaining = conversations.filter(conv => conv.id !== id);
          setActiveConversationId(remaining.length > 0 ? remaining[0].id : null);
        }
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };
  
  // 重命名会话
  const renameConversation = async (id: string, newTitle: string) => {
    try {
      const response = await fetch(`/api/ai-assistant/conversations/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: newTitle })
      });
      
      if (response.ok) {
        const updatedConversation = await response.json();
        setConversations(prev => 
          prev.map(conv => conv.id === id ? updatedConversation : conv)
        );
      }
    } catch (error) {
      console.error('Error renaming conversation:', error);
    }
  };
  
  // 过滤搜索结果
  const filteredConversations = searchQuery 
    ? conversations.filter(conv => 
        conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.messages.some(msg => msg.content.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : conversations;
  
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  // 渲染消息
  const renderMessage = (message: Message) => {
    const isUser = message.role === 'user';
    
    return (
      <div 
        key={message.id} 
        className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}
      >
        <div 
          className={`max-w-[80%] rounded-lg px-4 py-2 ${
            isUser 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted'
          }`}
        >
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>
          <div className={`text-xs mt-1 ${isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">智能教学助手</h1>
        <Button onClick={createNewConversation}>
          <PlusCircle className="mr-2 h-4 w-4" />
          新对话
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* 左侧会话列表 */}
        <Card className="md:col-span-1">
          <CardHeader className="px-4 py-3">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索会话..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="px-2">
            <ScrollArea className="h-[calc(100vh-250px)]">
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-2">
                      <Skeleton className="h-6 w-full mb-1" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))}
                </div>
              ) : filteredConversations.length > 0 ? (
                <div className="space-y-1">
                  {filteredConversations.map((convo) => (
                    <div
                      key={convo.id}
                      onClick={() => setActiveConversationId(convo.id)}
                      className={`flex items-start p-2 rounded cursor-pointer ${
                        activeConversationId === convo.id
                          ? 'bg-accent'
                          : 'hover:bg-accent/50'
                      }`}
                    >
                      <MessageSquare className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <p className="font-medium truncate">{convo.title}</p>
                          <div className="flex space-x-1 opacity-60 hover:opacity-100">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                const newTitle = prompt('请输入新标题', convo.title);
                                if (newTitle) renameConversation(convo.id, newTitle);
                              }}
                              className="p-1 hover:bg-background rounded"
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('确定要删除这个会话吗？')) {
                                  deleteConversation(convo.id);
                                }
                              }}
                              className="p-1 hover:bg-background rounded"
                            >
                              <Trash className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {convo.lastMessage || '没有消息'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(convo.lastUpdated).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  {searchQuery ? '没有找到相关会话' : '暂无会话记录'}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
        
        {/* 右侧对话界面 */}
        <Card className="md:col-span-3">
          <CardHeader className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">
              {activeConversation ? activeConversation.title : '开始一个新的对话'}
            </h2>
          </CardHeader>
          <CardContent className="p-6">
            <ScrollArea className="h-[calc(100vh-320px)]">
              {activeConversation && activeConversation.messages.length > 0 ? (
                <div className="px-2">
                  {activeConversation.messages.map(renderMessage)}
                  <div ref={messageEndRef} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <MessageSquare className="h-12 w-12 mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">欢迎使用智能教学助手</h3>
                  <p className="text-muted-foreground mb-4">
                    我可以帮助您解决教学设计、课堂管理、学生评价等方面的问题。
                  </p>
                  <p className="text-sm text-muted-foreground">
                    输入您的问题，开始对话吧！
                  </p>
                </div>
              )}
              {isSending && (
                <div className="flex justify-start mb-4">
                  <div className="max-w-[80%] rounded-lg px-4 py-2 bg-muted">
                    <div className="flex space-x-2 items-center">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse"></div>
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse delay-150"></div>
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse delay-300"></div>
                    </div>
                  </div>
                </div>
              )}
            </ScrollArea>
          </CardContent>
          <CardFooter className="p-4 border-t">
            <div className="flex w-full items-end gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="flex-shrink-0"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <div className="relative flex-1">
                <Textarea
                  placeholder="输入您的问题..."
                  className="min-h-[60px] max-h-[200px] resize-none pr-12"
                  value={inputMessage}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInputMessage(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  disabled={!activeConversationId || isSending}
                />
                <Button
                  size="icon"
                  className="absolute right-2 bottom-2"
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || !activeConversationId || isSending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AITeachingAssistantPage; 