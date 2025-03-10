"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Bot,
  X,
  Paperclip,
  Send,
  MessageSquare,
  Plus,
  Search,
  Trash,
  Edit,
  CheckCheck,
  UserCircle,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// 消息类型定义
interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
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
  agentDescription,
}: AIChatDialogProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRenaming, setIsRenaming] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [showNav, setShowNav] = useState(true);

  const messageEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 监听inputMessage变化，当为空时重置高度
  useEffect(() => {
    if (textareaRef.current && !inputMessage) {
      textareaRef.current.style.height = "40px";
    }
  }, [inputMessage]);

  // 获取会话列表
  const fetchConversations = async () => {
    try {
      const response = await fetch(
        `/api/ai-assistant/conversations?agentId=${agentId}`
      );

      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("获取会话列表失败:", error);
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
        const response = await fetch(
          `/api/ai-assistant/conversations?agentId=${agentId}`
        );

        if (response.ok) {
          const conversations = await response.json();

          if (conversations.length > 0) {
            // 使用现有会话
            setConversationId(conversations[0].id);
            setMessages(conversations[0].messages);
          } else {
            // 创建新会话
            const createResponse = await fetch(
              "/api/ai-assistant/conversations",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ agentId }),
              }
            );

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
        console.error("初始化会话失败:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, agentId]);

  // 消息发送后自动滚动到底部
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
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
      role: "user",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await fetch("/api/ai-assistant/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: tempMessage,
          conversationId,
          agentId,
        }),
      });

      if (response.ok) {
        const aiResponse = await response.json();
        setMessages((prev) => [...prev, aiResponse]);
        // 刷新会话列表
        await fetchConversations();
      }
    } catch (error) {
      console.error("发送消息失败:", error);
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
      console.error("切换会话失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 创建新会话
  const createNewConversation = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/ai-assistant/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ agentId }),
      });

      if (response.ok) {
        const newConversation = await response.json();
        setConversationId(newConversation.id);
        setMessages(newConversation.messages || []);
        // 刷新会话列表
        await fetchConversations();
      }
    } catch (error) {
      console.error("创建新会话失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 删除会话
  const deleteConversation = async (id: string) => {
    try {
      const response = await fetch(`/api/ai-assistant/conversations/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // 如果删除的是当前会话，切换到另一个会话
        if (id === conversationId) {
          const otherConversation = conversations.find((c) => c.id !== id);
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
      console.error("删除会话失败:", error);
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
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: newTitle }),
      });

      if (response.ok) {
        // 刷新会话列表
        await fetchConversations();
      }
    } catch (error) {
      console.error("重命名会话失败:", error);
    } finally {
      setIsRenaming(null);
      setNewTitle("");
    }
  };

  // 过滤会话
  const filteredConversations = conversations
    .filter(
      (conv) =>
        searchQuery === "" ||
        conv.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort(
      (a, b) =>
        new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    );

  // 格式化日期显示
  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // 获取时间部分
    const timeString = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    // 检查是否是今天
    if (date.toDateString() === today.toDateString()) {
      return `今天 ${timeString}`;
    }

    // 检查是否是昨天
    if (date.toDateString() === yesterday.toDateString()) {
      return `昨天 ${timeString}`;
    }

    // 检查是否是今年
    if (date.getFullYear() === today.getFullYear()) {
      return date.toLocaleDateString("zh-CN", {
        month: "numeric",
        day: "numeric",
      });
    }

    // 不是今年
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
  };

  // 渲染消息
  const renderMessage = (message: Message) => {
    const isUser = message.role === "user";

    return (
      <div
        key={message.id}
        className={`flex mb-5 ${
          isUser ? "justify-end" : "justify-start"
        } group`}
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
          <div
            className={cn(
              "text-[10px] mt-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-70 transition-opacity",
              isUser
                ? "text-primary-foreground justify-end"
                : "text-muted-foreground"
            )}
          >
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
            {isUser && <CheckCheck className="h-3 w-3 ml-0.5" />}
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
      <DialogContent
        className="sm:max-w-[900px] md:max-w-[80vw] h-[85vh] p-0 flex flex-row gap-0 overflow-hidden rounded-xl border border-border/20 shadow-lg"
        hideCloseButton
      >
        {/* 左侧会话导航 */}
        <div
          className={cn(
            "border-r border-border/20 flex flex-col h-full bg-background/95 transition-all duration-300 ease-in-out overflow-hidden",
            showNav ? "w-72" : "w-0"
          )}
        >
          <div className="p-3 border-b border-border/10 flex justify-between items-center bg-muted/20">
            <h3 className="font-medium text-sm text-foreground/80">
              {agentName}的会话
            </h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={createNewConversation}
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="sr-only">新建会话</span>
            </Button>
          </div>

          <div className="px-3 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground/60" />
              <Input
                placeholder="搜索会话..."
                className="pl-9 h-9 text-sm rounded-full border-border/15 bg-muted/10 focus-visible:ring-primary/20 focus-visible:ring-offset-0 focus-visible:border-primary/30"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <ScrollArea className="flex-1 px-1">
            <div className="py-1 space-y-1">
              {isLoading && conversations.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  <div className="inline-flex items-center justify-center p-2 bg-muted/30 rounded-full mb-3">
                    <div className="animate-spin h-4 w-4 border-2 border-primary/20 border-t-primary rounded-full"></div>
                  </div>
                  <p className="text-xs text-muted-foreground/70">
                    正在加载会话...
                  </p>
                </div>
              ) : filteredConversations.length > 0 ? (
                filteredConversations.map((conversation) => (
                  <div key={conversation.id} className="relative px-2">
                    {isRenaming === conversation.id ? (
                      <div className="p-3 space-y-2 bg-muted/20 rounded-xl border border-border/15 shadow-sm">
                        <Input
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          placeholder="输入新标题"
                          autoFocus
                          className="text-sm h-8 border-border/15 rounded-lg bg-background/80 focus-visible:ring-primary/20 focus-visible:border-primary/30"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleRenameConversation(conversation.id);
                            } else if (e.key === "Escape") {
                              setIsRenaming(null);
                              setNewTitle("");
                            }
                          }}
                        />
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs h-7 rounded-lg border-border/15 hover:bg-background/50 hover:text-muted-foreground"
                            onClick={() => {
                              setIsRenaming(null);
                              setNewTitle("");
                            }}
                          >
                            取消
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 text-xs h-7 rounded-lg"
                            onClick={() =>
                              handleRenameConversation(conversation.id)
                            }
                          >
                            保存
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={cn(
                          "w-full text-left p-3 rounded-xl overflow-hidden group text-sm transition-all cursor-pointer",
                          conversationId === conversation.id
                            ? "bg-primary/10 text-primary shadow-sm"
                            : "hover:bg-muted/30"
                        )}
                        onClick={() => switchConversation(conversation.id)}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div className="font-medium truncate text-xs flex-1 pr-2">
                            {conversation.title}
                          </div>
                          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-full hover:bg-muted"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsRenaming(conversation.id);
                                setNewTitle(conversation.title);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                              <span className="sr-only">重命名</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-full hover:bg-destructive/10 hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteConversation(conversation.id);
                              }}
                            >
                              <Trash className="h-3 w-3" />
                              <span className="sr-only">删除</span>
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-end justify-between gap-2 text-xs text-muted-foreground">
                          <div className="truncate opacity-70 line-clamp-1 text-[10px] flex-1">
                            {conversation.lastMessage || "暂无消息"}
                          </div>
                          <div className="text-[10px] opacity-60 flex-shrink-0">
                            {formatMessageDate(conversation.lastUpdated)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-14 px-2">
                  <div className="inline-flex items-center justify-center p-3 rounded-full bg-muted/20 mb-4">
                    <MessageSquare className="h-5 w-5 text-muted-foreground/40" />
                  </div>
                  <div className="text-muted-foreground/70 text-xs mb-5">
                    {searchQuery ? "未找到匹配的会话" : "暂无会话历史"}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 mx-auto rounded-full border-dashed border-border/30 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-colors"
                    onClick={createNewConversation}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    开始新对话
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
                  <DialogTitle className="text-sm font-medium">
                    {agentName}
                  </DialogTitle>
                  {agentDescription && (
                    <DialogDescription className="line-clamp-1 text-[10px] mt-0.5">
                      {agentDescription}
                    </DialogDescription>
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

          <ScrollArea
            className="flex-1 p-4 md:p-6 overflow-y-auto"
            scrollHideDelay={300}
          >
            <div className="space-y-4 max-w-3xl mx-auto pb-6">
              {messages.length === 0 ? (
                <div className="text-center py-12 px-4 animate-fadeIn">
                  <div className="inline-flex items-center justify-center p-4 rounded-full bg-primary/5 mb-6">
                    <Bot className="h-8 w-8 text-primary/60" />
                  </div>
                  <h3 className="text-base font-medium mb-3">
                    开始与{agentName}的对话
                  </h3>
                  <p className="text-muted-foreground text-xs max-w-md mx-auto mb-8 leading-relaxed">
                    {agentDescription ||
                      `${agentName}可以回答您的问题并提供帮助。`}
                  </p>
                  {conversations.length > 1 && (
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-8 rounded-full border-dashed border-border/30"
                        onClick={() => setShowNav(true)}
                      >
                        <MessageSquare className="h-3 w-3 mr-1.5" />
                        浏览历史会话
                      </Button>
                      <Button
                        size="sm"
                        className="text-xs h-8 rounded-full"
                        onClick={createNewConversation}
                      >
                        <Plus className="h-3 w-3 mr-1.5" />
                        新对话
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* 开场白和时间显示 */}
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center rounded-full bg-muted/50 px-3 py-1 text-[10px] text-muted-foreground border border-border/10">
                      {new Date(
                        messages[0]?.timestamp || Date.now()
                      ).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="space-y-5">
                    {messages.map(renderMessage)}
                    {isSending && (
                      <div className="flex justify-start group mb-5">
                        <Avatar className="h-8 w-8 mr-2.5 flex-shrink-0 self-start mt-0.5 bg-background ring-1 ring-border/30">
                          <div className="flex items-center justify-center w-full h-full">
                            <Bot className="h-4 w-4 text-primary" />
                          </div>
                        </Avatar>
                        <div className="max-w-[75%] rounded-xl px-4 py-2.5 shadow-sm bg-muted/60 rounded-tl-none border border-border/10">
                          <div className="flex items-center space-x-2 py-1.5">
                            <div className="h-2 w-2 rounded-full bg-primary/40 animate-bounce"></div>
                            <div
                              className="h-2 w-2 rounded-full bg-primary/40 animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                            <div
                              className="h-2 w-2 rounded-full bg-primary/40 animate-bounce"
                              style={{ animationDelay: "0.4s" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
              <div ref={messageEndRef} className="h-1" />
            </div>
          </ScrollArea>

          <Separator className="h-px bg-border/10" />

          <div className="p-3 md:p-4 bg-background/50">
            <div className="flex items-center max-w-3xl mx-auto relative rounded-xl overflow-hidden border border-border/20 transition-all duration-200 shadow-sm focus-within:shadow-md focus-within:ring-1 focus-within:ring-primary/20 focus-within:border-primary/30 bg-background/70">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-none border-none flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
              >
                <Paperclip className="h-3.5 w-3.5 text-muted-foreground/70" />
              </Button>
              <Textarea
                ref={textareaRef}
                className="flex-1 resize-none h-10 min-h-[40px] max-h-[120px] border-none rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 py-[10px] px-2.5 text-sm leading-tight placeholder:text-muted-foreground/60 bg-transparent scrollbar"
                placeholder="输入消息..."
                value={inputMessage}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  setInputMessage(e.target.value);
                  // 自动调整高度，但不超过最大高度
                  const textarea = e.target;
                  textarea.style.height = "40px"; // 先重置高度
                  const scrollHeight = textarea.scrollHeight;
                  const newHeight = Math.min(120, scrollHeight);
                  textarea.style.height = `${newHeight}px`;

                  // 当内容高度超过最大高度时，设置overflow-y为auto
                  if (scrollHeight > 120) {
                    textarea.style.overflowY = "auto";
                  } else {
                    textarea.style.overflowY = "hidden";
                  }
                }}
                onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                style={{
                  overflowY: "hidden", // 默认隐藏滚动条，在onChange事件中动态控制
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
                    : "bg-muted/70 text-muted-foreground"
                )}
              >
                {isSending ? (
                  <div className="flex items-center justify-center">
                    <span className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin opacity-70" />
                  </div>
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
            <div className="flex items-center justify-center gap-3 max-w-3xl mx-auto mt-2">
              <div className="text-[10px] text-muted-foreground/50 flex items-center">
                <kbd className="px-1.5 py-0.5 bg-muted/50 rounded text-[10px] font-mono border border-border/10 mr-1">
                  Enter
                </kbd>
                发送
              </div>
              <div className="text-[10px] text-muted-foreground/50 flex items-center">
                <kbd className="px-1.5 py-0.5 bg-muted/50 rounded text-[10px] font-mono border border-border/10 mr-1">
                  Shift + Enter
                </kbd>
                换行
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
