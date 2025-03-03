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
        className={`flex mb-5 ${isUser ? 'justify-end' : 'justify-start'} group`}
      >
        {!isUser && (
          <Avatar className="h-8 w-8 mr-2.5 flex-shrink-0 self-start mt-0.5 bg-background ring-1 ring-border/30">
            <div className="flex items-center justify-center w-full h-full">
              <Bot className="h-4 w-4 text-primary" />
            </div>
          </Avatar>
        )}
        <div 
          className={cn(
            "max-w-[75%] rounded-xl px-4 py-2.5 shadow-sm transition-all group-hover:shadow-md",
            isUser 
              ? "bg-primary text-primary-foreground rounded-tr-none group-hover:bg-primary/95" 
              : "bg-muted/60 rounded-tl-none border border-border/10 group-hover:bg-muted/70"
          )}
        >
          <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
            {message.content}
          </div>
          <div className={cn(
            "text-[10px] mt-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-70 transition-opacity", 
            isUser ? "text-primary-foreground justify-end" : "text-muted-foreground"
          )}>
            {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            {isUser && (
              <CheckCheck className="h-3 w-3 ml-0.5" />
            )}
          </div>
        </div>
        {isUser && (
          <Avatar className="h-8 w-8 ml-2.5 flex-shrink-0 self-start mt-0.5 bg-primary/5 ring-1 ring-border/30">
            <div className="flex items-center justify-center w-full h-full">
              <UserCircle className="h-4 w-4 text-primary" />
            </div>
          </Avatar>
        )}
      </div>
    );
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] md:max-w-[80vw] h-[85vh] p-0 flex flex-row gap-0 overflow-hidden rounded-lg border border-border/20 shadow-lg" hideCloseButton>
        {/* 左侧会话导航 */}
        <div className={cn(
          "border-r border-border/20 flex flex-col h-full bg-background/95 transition-all duration-300 ease-in-out overflow-hidden",
          showNav ? "w-64" : "w-0"
        )}>
          <div className="p-3 border-b border-border/10 flex justify-between items-center bg-muted/30">
            <h3 className="font-medium text-sm text-foreground/80">{agentName}的会话</h3>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={createNewConversation}>
              <Plus className="h-3.5 w-3.5" />
              <span className="sr-only">新建会话</span>
            </Button>
          </div>
          
          <div className="px-3 py-2.5">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground/70" />
              <Input
                placeholder="搜索会话..."
                className="pl-9 h-9 text-sm rounded-lg border-border/20 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <ScrollArea className="flex-1 pr-2">
            <div className="p-2 space-y-1.5">
              {isLoading && conversations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <div className="animate-spin h-5 w-5 border-2 border-primary/20 border-t-primary rounded-full mx-auto mb-2"></div>
                  <span className="text-xs">加载中...</span>
                </div>
              ) : filteredConversations.length > 0 ? (
                filteredConversations.map(conversation => (
                  <div key={conversation.id} className="relative">
                    {isRenaming === conversation.id ? (
                      <div className="p-2 space-y-2 bg-muted/40 rounded-lg border border-border/20">
                        <Input
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          placeholder="输入新标题"
                          autoFocus
                          className="text-sm h-8 border-border/20"
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
                            className="flex-1 text-xs h-7 rounded-md"
                            onClick={() => {
                              setIsRenaming(null);
                              setNewTitle("");
                            }}
                          >
                            取消
                          </Button>
                          <Button 
                            size="sm" 
                            className="flex-1 text-xs h-7 rounded-md"
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
                            ? "bg-primary/10 text-primary ring-1 ring-primary/20" 
                            : "hover:bg-muted/50"
                        )}
                        onClick={() => switchConversation(conversation.id)}
                      >
                        <div className="flex justify-between items-center">
                          <div className="font-medium truncate text-xs">{conversation.title}</div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                setIsRenaming(conversation.id);
                                setNewTitle(conversation.title);
                              }}>
                                <Edit className="mr-2 h-3.5 w-3.5" />
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
                                <Trash className="mr-2 h-3.5 w-3.5" />
                                删除会话
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="text-xs text-muted-foreground truncate mt-1.5 line-clamp-1 opacity-80">
                          {conversation.lastMessage || "暂无消息"}
                        </div>
                        <div className="text-[10px] text-muted-foreground/60 mt-1">
                          {new Date(conversation.lastUpdated).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 px-2">
                  <div className="text-muted-foreground text-xs mb-3">
                    {searchQuery ? "未找到匹配的会话" : "暂无会话历史"}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs h-8 mx-auto rounded-full border-dashed border-border/40"
                    onClick={createNewConversation}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    新建会话
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
        
        {/* 右侧聊天区域 */}
        <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-background/95 to-background">
          <DialogHeader className="border-b border-border/10 p-3 flex flex-row justify-between items-center bg-muted/10">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="mr-2 md:mr-1 lg:hidden rounded-full h-7 w-7"
                onClick={() => setShowNav(!showNav)}
              >
                <MessageSquare className="h-3.5 w-3.5" />
              </Button>
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2.5 bg-primary/5 ring-1 ring-border/20">
                  <div className="flex items-center justify-center w-full h-full">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                </Avatar>
                <div>
                  <DialogTitle className="text-sm font-medium">{agentName}</DialogTitle>
                  {agentDescription && (
                    <DialogDescription className="line-clamp-1 text-[10px] mt-0.5">{agentDescription}</DialogDescription>
                  )}
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onOpenChange(false)} 
              className="opacity-70 hover:opacity-100 rounded-full h-7 w-7"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </DialogHeader>
          
          <ScrollArea className="flex-1 p-4 md:p-6 overflow-y-auto" scrollHideDelay={300}>
            <div className="space-y-4 max-w-3xl mx-auto pb-6">
              {messages.length === 0 ? (
                <div className="text-center py-12 px-4 animate-fadeIn">
                  <Bot className="h-10 w-10 mx-auto text-primary/40 mb-4" />
                  <h3 className="text-base font-medium mb-2">开始与{agentName}的对话</h3>
                  <p className="text-muted-foreground text-xs max-w-md mx-auto mb-8 leading-relaxed">
                    {agentDescription || `${agentName}可以回答您的问题并提供帮助。`}
                  </p>
                  {conversations.length > 1 && (
                    <p className="text-[10px] text-muted-foreground/60">
                      您可以从左侧切换不同的会话
                    </p>
                  )}
                </div>
              ) : (
                <>
                  {/* 开场白和时间显示 */}
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center rounded-full bg-muted/50 px-3 py-1 text-[10px] text-muted-foreground border border-border/10">
                      {new Date(messages[0]?.timestamp || Date.now()).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="space-y-5">
                    {messages.map(renderMessage)}
                  </div>
                </>
              )}
              <div ref={messageEndRef} className="h-1" />
            </div>
          </ScrollArea>
          
          <Separator className="h-px bg-border/10" />
          
          <div className="p-3 md:p-4 bg-background/50">
            <div className="flex items-center max-w-3xl mx-auto relative rounded-xl overflow-hidden border border-border/20 transition-all duration-200 shadow-sm focus-within:shadow-md focus-within:ring-1 focus-within:ring-primary/20 focus-within:border-primary/30 bg-background/70">
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none border-none flex-shrink-0 opacity-70">
                <Paperclip className="h-4 w-4 text-muted-foreground/70" />
              </Button>
              <Textarea
                className="flex-1 resize-none h-10 min-h-[40px] max-h-[180px] border-none rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 py-[10px] px-2.5 text-sm leading-tight placeholder:text-muted-foreground/60 bg-transparent"
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
                className={cn(
                  "h-9 w-9 rounded-full mr-1 flex-shrink-0 transition-all",
                  inputMessage.trim() 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                    : "bg-muted text-muted-foreground"
                )}
              >
                {isSending ? (
                  <div className="flex items-center justify-center">
                    <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
            <div className="text-[10px] text-muted-foreground/60 text-center mt-2 max-w-3xl mx-auto">
              按 <kbd className="px-1 py-0.5 bg-muted/60 rounded text-[10px] font-mono border border-border/10">Enter</kbd> 发送，<kbd className="px-1 py-0.5 bg-muted/60 rounded text-[10px] font-mono border border-border/10">Shift + Enter</kbd> 换行
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 