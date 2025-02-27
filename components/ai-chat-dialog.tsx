"use client"

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Bot, X, Paperclip, Send, MessageSquare, Plus, Search, MoreHorizontal, Trash, Edit, CheckCheck, UserCircle } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

// 对话框属性
interface AIChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentId: string;
  agentName: string;
  agentDescription?: string;
}

export function AIChatDialog({ 
  open, 
  onOpenChange, 
  agentId, 
  agentName, 
  agentDescription 
}: AIChatDialogProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRenaming, setIsRenaming] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [showNav, setShowNav] = useState(true);
  
  const messageEndRef = useRef<HTMLDivElement>(null);
  
  // 获取会话列表
  const fetchConversations = async () => {
    try {
      const response = await fetch(`/api/ai-assistant/conversations?agentId=${agentId}`);
      
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('获取会话列表失败:', error);
    }
  };
  
  // 创建或获取会话
  useEffect(() => {
    if (!open) return;
    
    const initializeConversation = async () => {
      try {
        setIsLoading(true);
        // 获取所有会话
        await fetchConversations();
        
        // 先检查是否有此智能体的现有会话
        const response = await fetch(`/api/ai-assistant/conversations?agentId=${agentId}`);
        
        if (response.ok) {
          const conversations = await response.json();
          
          if (conversations.length > 0) {
            // 使用现有会话
            setConversationId(conversations[0].id);
            setMessages(conversations[0].messages);
          } else {
            // 创建新会话
            const createResponse = await fetch('/api/ai-assistant/conversations', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ agentId })
            });
            
            if (createResponse.ok) {
              const newConversation = await createResponse.json();
              setConversationId(newConversation.id);
              setMessages(newConversation.messages || []);
              // 刷新会话列表
              await fetchConversations();
            }
          }
        }
      } catch (error) {
        console.error('初始化会话失败:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeConversation();
  }, [open, agentId]);
  
  // 消息发送后自动滚动到底部
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // 发送消息
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !conversationId) return;
    
    const tempMessage = inputMessage;
    setInputMessage("");
    setIsSending(true);
    
    // 先在UI中显示用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      content: tempMessage,
      role: 'user',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    try {
      const response = await fetch('/api/ai-assistant/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: tempMessage,
          conversationId,
          agentId
        })
      });
      
      if (response.ok) {
        const aiResponse = await response.json();
        setMessages(prev => [...prev, aiResponse]);
        // 刷新会话列表
        await fetchConversations();
      }
    } catch (error) {
      console.error('发送消息失败:', error);
    } finally {
      setIsSending(false);
    }
  };
  
  // 切换会话
  const switchConversation = async (id: string) => {
    if (id === conversationId) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/ai-assistant/conversations/${id}`);
      
      if (response.ok) {
        const conversation = await response.json();
        setConversationId(id);
        setMessages(conversation.messages);
      }
    } catch (error) {
      console.error('切换会话失败:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 创建新会话
  const createNewConversation = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/ai-assistant/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ agentId })
      });
      
      if (response.ok) {
        const newConversation = await response.json();
        setConversationId(newConversation.id);
        setMessages(newConversation.messages || []);
        // 刷新会话列表
        await fetchConversations();
      }
    } catch (error) {
      console.error('创建新会话失败:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 删除会话
  const deleteConversation = async (id: string) => {
    try {
      const response = await fetch(`/api/ai-assistant/conversations/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // 如果删除的是当前会话，切换到另一个会话
        if (id === conversationId) {
          const otherConversation = conversations.find(c => c.id !== id);
          if (otherConversation) {
            await switchConversation(otherConversation.id);
          } else {
            // 如果没有其他会话，创建一个新的
            await createNewConversation();
          }
        }
        // 刷新会话列表
        await fetchConversations();
      }
    } catch (error) {
      console.error('删除会话失败:', error);
    }
  };
  
  // 重命名会话
  const handleRenameConversation = async (id: string) => {
    if (!newTitle.trim()) {
      setIsRenaming(null);
      return;
    }
    
    try {
      const response = await fetch(`/api/ai-assistant/conversations/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: newTitle })
      });
      
      if (response.ok) {
        // 刷新会话列表
        await fetchConversations();
      }
    } catch (error) {
      console.error('重命名会话失败:', error);
    } finally {
      setIsRenaming(null);
      setNewTitle("");
    }
  };
  
  // 过滤会话
  const filteredConversations = conversations
    .filter(conv => 
      searchQuery === '' || 
      conv.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
  
  // 格式化日期显示
  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return '今天';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '昨天';
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    }
  };
  
  // 渲染消息
  const renderMessage = (message: Message) => {
    const isUser = message.role === 'user';
    
    return (
      <div 
        key={message.id} 
        className={`flex mb-6 ${isUser ? 'justify-end' : 'justify-start'} group`}
      >
        {!isUser && (
          <Avatar className="h-8 w-8 mr-2 flex-shrink-0 self-start mt-1 bg-secondary/50 ring-1 ring-background">
            <Bot className="h-4 w-4 text-primary" />
          </Avatar>
        )}
        <div 
          className={cn(
            "max-w-[80%] rounded-2xl px-4 py-3 shadow-sm transition-all",
            isUser 
              ? "bg-primary text-primary-foreground rounded-tr-sm" 
              : "bg-muted rounded-tl-sm"
          )}
        >
          <div className="whitespace-pre-wrap break-words text-sm">
            {message.content}
          </div>
          <div className={cn(
            "text-xs mt-2 flex items-center gap-1", 
            isUser ? "text-primary-foreground/70 justify-end" : "text-muted-foreground"
          )}>
            {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            {isUser && (
              <CheckCheck className="h-3 w-3" />
            )}
          </div>
        </div>
        {isUser && (
          <Avatar className="h-8 w-8 ml-2 flex-shrink-0 self-start mt-1 bg-primary/10 ring-1 ring-background">
            <UserCircle className="h-4 w-4 text-primary" />
          </Avatar>
        )}
      </div>
    );
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] md:max-w-[80vw] h-[85vh] p-0 flex flex-row gap-0 overflow-hidden rounded-xl" hideCloseButton>
        {/* 左侧会话导航 */}
        <div className={cn(
          "border-r border-border flex flex-col h-full bg-background transition-all duration-300 overflow-hidden",
          showNav ? "w-64" : "w-0"
        )}>
          <div className="p-3 border-b flex justify-between items-center bg-muted/50">
            <h3 className="font-medium text-sm">{agentName}的会话</h3>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={createNewConversation}>
                <Plus className="h-4 w-4" />
                <span className="sr-only">新建会话</span>
              </Button>
            </div>
          </div>
          
          <div className="px-3 py-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索会话..."
                className="pl-9 h-9 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <ScrollArea className="flex-1 pr-2">
            <div className="p-2 space-y-1.5">
              {isLoading && conversations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <div className="animate-spin h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full mx-auto mb-2"></div>
                  加载中...
                </div>
              ) : filteredConversations.length > 0 ? (
                filteredConversations.map(conversation => (
                  <div key={conversation.id} className="relative">
                    {isRenaming === conversation.id ? (
                      <div className="p-2 space-y-2 bg-muted/60 rounded-lg">
                        <Input
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          placeholder="输入新标题"
                          autoFocus
                          className="text-sm h-9"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleRenameConversation(conversation.id);
                            } else if (e.key === 'Escape') {
                              setIsRenaming(null);
                              setNewTitle("");
                            }
                          }}
                        />
                        <div className="flex space-x-1">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 text-xs h-8"
                            onClick={() => {
                              setIsRenaming(null);
                              setNewTitle("");
                            }}
                          >
                            取消
                          </Button>
                          <Button 
                            size="sm" 
                            className="flex-1 text-xs h-8"
                            onClick={() => handleRenameConversation(conversation.id)}
                          >
                            保存
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <button
                        className={cn(
                          "w-full text-left p-2.5 rounded-lg group text-sm transition-all",
                          conversationId === conversation.id 
                            ? "bg-primary/10 text-primary" 
                            : "hover:bg-muted"
                        )}
                        onClick={() => switchConversation(conversation.id)}
                      >
                        <div className="flex justify-between items-center">
                          <div className="font-medium truncate text-sm">{conversation.title}</div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                setIsRenaming(conversation.id);
                                setNewTitle(conversation.title);
                              }}>
                                <Edit className="mr-2 h-4 w-4" />
                                重命名
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteConversation(conversation.id);
                                }}
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                删除会话
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="text-xs text-muted-foreground truncate mt-1.5 line-clamp-1">
                          {conversation.lastMessage || "暂无消息"}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(conversation.lastUpdated).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  {searchQuery ? "未找到匹配的会话" : "暂无会话历史"}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3 mx-auto"
                    onClick={createNewConversation}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    新建会话
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
        
        {/* 右侧聊天区域 */}
        <div className="flex-1 flex flex-col h-full bg-background/95">
          <DialogHeader className="border-b p-3 flex flex-row justify-between items-center bg-muted/30">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="mr-2 md:mr-1 lg:hidden"
                onClick={() => setShowNav(!showNav)}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2 bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </Avatar>
                <div>
                  <DialogTitle className="text-base">{agentName}</DialogTitle>
                  {agentDescription && (
                    <DialogDescription className="line-clamp-1 text-xs">{agentDescription}</DialogDescription>
                  )}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="opacity-70 hover:opacity-100">
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          
          <ScrollArea className="flex-1 p-4 md:p-6 overflow-y-auto" scrollHideDelay={300}>
            <div className="space-y-4 max-w-3xl mx-auto pb-6">
              {messages.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <Bot className="h-12 w-12 mx-auto text-primary/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">开始与{agentName}的对话</h3>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
                    {agentDescription || `${agentName}可以回答您的问题并提供帮助。`}
                  </p>
                  {conversations.length > 1 && (
                    <p className="text-xs text-muted-foreground">
                      您可以从左侧切换不同的会话
                    </p>
                  )}
                </div>
              ) : (
                <>
                  {/* 开场白和时间显示 */}
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                      {new Date(messages[0]?.timestamp || Date.now()).toLocaleDateString()}
                    </div>
                  </div>
                  {messages.map(renderMessage)}
                </>
              )}
              <div ref={messageEndRef} className="h-1" />
            </div>
          </ScrollArea>
          
          <Separator />
          
          <div className="p-3 md:p-4 bg-background">
            <div className="flex items-center max-w-3xl mx-auto relative rounded-lg overflow-hidden border focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none border-none flex-shrink-0">
                <Paperclip className="h-4 w-4 text-muted-foreground" />
              </Button>
              <Textarea
                className="flex-1 resize-none h-9 min-h-[36px] max-h-[180px] border-none rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 py-[9px] px-2 text-sm leading-tight"
                placeholder="输入消息..."
                value={inputMessage}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInputMessage(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={isSending || !inputMessage.trim()}
                size="icon"
                className="h-9 w-9 rounded-none border-none flex-shrink-0 bg-transparent hover:bg-muted"
              >
                {isSending ? (
                  <span className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="h-4 w-4 text-primary" />
                )}
              </Button>
            </div>
            <div className="text-xs text-muted-foreground text-center mt-2 max-w-3xl mx-auto">
              按 <kbd className="px-1 py-0.5 bg-muted rounded text-xs font-mono">Enter</kbd> 发送，<kbd className="px-1 py-0.5 bg-muted rounded text-xs font-mono">Shift + Enter</kbd> 换行
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 