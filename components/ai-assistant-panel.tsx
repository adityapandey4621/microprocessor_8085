'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { useState, useRef, useEffect } from 'react';
import { useAIAssistant } from '@/hooks/use-ai-assistant';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Send, RefreshCw, Zap, MessageCircle, LogIn, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSession, signIn } from 'next-auth/react';

interface AIAssistantPanelProps {
  code?: string
  registers?: any
  flags?: any
  onApplyCode?: (code: string) => void
  consoleOutput?: string[]
  assembledCode?: any
  isRunning?: boolean
  isAssembled?: boolean
  memory?: Uint8Array
  ioPorts?: Record<string, string>
  ledValue?: number
  segmentValue?: string
}

export function AIAssistantPanel({ 
  code, registers, flags, onApplyCode, 
  consoleOutput, assembledCode, isRunning, isAssembled,
  memory, ioPorts, ledValue, segmentValue
}: AIAssistantPanelProps) {
  const { data: session } = useSession()
  // @ts-ignore
  const isGuest = session?.user?.id === "guest-user"
  const {
    tokens,
    messagesUsed,
    maxMessagesPerSession,
    conversation,
    loading,
    error,
    startSession,
    addTokens,
    resetSession,
    canUseAssistant,
    statusMessage,
  } = useAIAssistant();

  const [inputValue, setInputValue] = useState('');
  const [assistantType, setAssistantType] = useState<'guided' | 'review' | 'debug'>('guided');
  const [showTokenShop, setShowTokenShop] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadingStatuses = [
    "Analyzing editor assembly code...",
    "Reading register states...",
    "Evaluating CPU flag status...",
    "Checking memory grid & I/O ports...",
    "Inspecting console & output screen...",
    "Formulating optimized solution...",
    "Generating standard 8085 instructions...",
    "Finalizing explanation..."
  ];

  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (loading) {
      setCurrentStatusIndex(0);
      intervalId = setInterval(() => {
        setCurrentStatusIndex((prev) => (prev + 1) % loadingStatuses.length);
      }, 1500);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    if (!canUseAssistant()) {
      return;
    }

    const message = inputValue;
    setInputValue('');
    await startSession(message, assistantType, {
      code: code || '',
      registers: registers || {},
      flags: flags || {},
      consoleOutput,
      assembledCode,
      isRunning,
      isAssembled,
      memory,
      ioPorts,
      ledValue,
      segmentValue
    });
  };

  const remainingFreeMessages = maxMessagesPerSession - messagesUsed;
  const usagePercentage = (messagesUsed / maxMessagesPerSession) * 100;

  return (
    <div className="w-full h-full flex flex-col text-foreground">
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {isGuest && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center">
            <Lock className="w-12 h-12 text-purple-600 mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">AI Features Locked</h3>
            <p className="text-foreground mb-6 max-w-xs">
              Guest users cannot access the AI Assist features. Please sign in with Google to continue learning.
            </p>
            <Button
              onClick={() => signIn("google")}
              className="bg-purple-600 hover:bg-purple-700 text-foreground"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In with Google
            </Button>
          </div>
        )}
        <div className="px-4 py-2 flex items-center justify-between border-b border-border bg-muted/50">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-purple-400" />
            <span className="font-semibold text-sm">AI Assembly Tutor</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded bg-purple-900/40 border border-purple-500/30 px-2 py-1">
              <Zap className="h-3 w-3 text-yellow-500" />
              <span className="text-xs font-semibold text-purple-200">{tokens}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTokenShop(!showTokenShop)}
              className="h-7 text-xs border-border/60 hover:bg-muted"
            >
              Buy Tokens
            </Button>
          </div>
        </div>

        <div className="flex-1 flex flex-col p-4 space-y-4 overflow-hidden">
          {/* Token Shop */}
          {showTokenShop && (
            <Card className="border-yellow-500/30 bg-yellow-900/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-yellow-500">Purchase Tokens</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10"
                    onClick={() => {
                      addTokens(5);
                      setShowTokenShop(false);
                    }}
                  >
                    5 Tokens - $1.99
                  </Button>
                  <Button
                    variant="outline"
                    className="border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10"
                    onClick={() => {
                      addTokens(20);
                      setShowTokenShop(false);
                    }}
                  >
                    20 Tokens - $5.99
                  </Button>
                </div>
                <p className="text-xs text-yellow-500/70">
                  Each message uses 1 token. Your first message is free!
                </p>
              </CardContent>
            </Card>
          )}

          {/* Usage Status */}
          {remainingFreeMessages > 0 && tokens === 0 && (
            <Alert className="border-green-500/30 bg-green-900/20">
              <AlertCircle className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-300">
                Free trial: {remainingFreeMessages} message(s) remaining before tokens required
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="border-red-500/30 bg-red-900/20">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-300">{error}</AlertDescription>
            </Alert>
          )}

          {/* Assistant Type Selection */}
          <Tabs value={assistantType} onValueChange={(val) => setAssistantType(val as any)}>
            <TabsList className="grid w-full grid-cols-3 bg-muted/50 border border-border/60">
              <TabsTrigger value="guided" className="data-[state=active]:bg-purple-600 data-[state=active]:text-foreground">Guided Help</TabsTrigger>
              <TabsTrigger value="review" className="data-[state=active]:bg-purple-600 data-[state=active]:text-foreground">Code Review</TabsTrigger>
              <TabsTrigger value="debug" className="data-[state=active]:bg-purple-600 data-[state=active]:text-foreground">Debugging</TabsTrigger>
            </TabsList>

            <TabsContent value="guided" className="text-xs text-muted-foreground mt-2 text-center">
              Step-by-step guidance on learning 8085 assembly programming
            </TabsContent>
            <TabsContent value="review" className="text-xs text-muted-foreground mt-2 text-center">
              Get feedback on your assembly code quality and correctness
            </TabsContent>
            <TabsContent value="debug" className="text-xs text-muted-foreground mt-2 text-center">
              Debug your programs with step-by-step analysis
            </TabsContent>
          </Tabs>

          {/* Conversation Display */}
          <div className="flex-1 space-y-3 overflow-y-auto rounded-lg bg-black/40 border border-border p-3 custom-scrollbar min-h-0">
            {conversation.length === 0 && (
              <div className="flex h-[200px] flex-col items-center justify-center gap-2 text-muted-foreground">
                <MessageCircle className="h-8 w-8 opacity-30" />
                <p className="text-sm">Start a conversation with the AI tutor</p>
              </div>
            )}

            {conversation.map((msg, idx) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`min-w-0 rounded-lg px-3 py-2 text-sm ${msg.role === 'user'
                    ? 'max-w-[85%] bg-purple-600/30 border border-purple-500/30 text-purple-100'
                    : 'max-w-[95%] bg-muted/50 border border-border/60 text-foreground'
                    }`}
                >
                  <div className="text-sm prose prose-sm dark:prose-invert max-w-none break-words min-w-0 overflow-hidden whitespace-pre-wrap">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ node, inline, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || '');
                          const codeStr = String(children).replace(/\n$/, '');
                          const isAssembly = match && (match[1] === 'assembly' || match[1] === '8085');
                          
                          if (match) {
                            return (
                              <span className="block my-2 w-full max-w-full overflow-hidden" data-type="code-block">
                                <span className="flex flex-col border border-purple-200/40 rounded-md bg-background/50 text-foreground overflow-hidden text-left relative w-full">
                                  <span className="bg-muted border-b border-border/60 px-3 py-1.5 text-[10px] text-muted-foreground flex justify-between items-center uppercase tracking-wider font-semibold w-full">
                                    <span>{match?.[1] || 'Code'}</span>
                                    {onApplyCode && isAssembly && (
                                      <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        className="h-6 px-2 text-[10px] hover:bg-purple-600 hover:text-white transition-colors"
                                        onClick={() => onApplyCode(codeStr)}
                                      >
                                        Apply to Editor
                                      </Button>
                                    )}
                                  </span>
                                  <span className="p-3 overflow-x-auto text-[11px] font-mono leading-relaxed bg-black/30 text-purple-100 block whitespace-pre w-full">
                                    <code className={className} {...props}>
                                      {children}
                                    </code>
                                  </span>
                                </span>
                              </span>
                            );
                          }
                          
                          return (
                            <code className="bg-black/40 text-purple-200 rounded px-1 py-0.5 text-[11px] font-mono" {...props}>
                              {children}
                            </code>
                          );
                        }
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                  <span className="text-xs opacity-60 mt-1 block text-right">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2">
                <div className="rounded-lg bg-muted/50 border border-border/60 px-3 py-2 flex items-center gap-2">
                  <div className="flex gap-1 shrink-0">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-purple-400" />
                    <div className="animation-delay-100 h-2 w-2 animate-bounce rounded-full bg-purple-400" />
                    <div className="animation-delay-200 h-2 w-2 animate-bounce rounded-full bg-purple-400" />
                  </div>
                  <span className="text-xs text-purple-300 italic ml-2 animate-pulse">
                    {loadingStatuses[currentStatusIndex]}
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="flex gap-2 pt-2 border-t border-border">
            <Input
              placeholder="Ask about 8085 assembly..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={!canUseAssistant() || loading}
              className="text-sm bg-black/40 border-border/60 text-foreground placeholder:text-muted-foreground text-left"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!canUseAssistant() || loading || !inputValue.trim()}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Reset Button */}
          {conversation.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetSession}
              className="w-full bg-muted/50 border-border/60 hover:bg-muted text-foreground"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Start New Conversation
            </Button>
          )}

          <p className="text-xs text-muted-foreground text-center">
            {tokens > 0
              ? `${tokens} tokens available`
              : remainingFreeMessages > 0
                ? `${remainingFreeMessages} free message(s) left before tokens required`
                : 'Purchase tokens to continue using the AI assistant'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default AIAssistantPanel;

