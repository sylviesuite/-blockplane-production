/**
 * AI Assistant Dialog
 * 
 * Reusable dialog for AI interactions with material context
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Loader2, Send, Sparkles } from 'lucide-react';
import { trpc } from '../lib/trpc';
import { Streamdown } from 'streamdown';
import type { Material } from '../types';

interface AIAssistantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material?: Material;
  context?: string;
  initialPrompt?: string;
}

export function AIAssistantDialog({
  open,
  onOpenChange,
  material,
  context,
  initialPrompt,
}: AIAssistantDialogProps) {
  const [question, setQuestion] = useState('');
  const [conversation, setConversation] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);

  const askMutation = trpc.ai.ask.useMutation({
    onSuccess: (data) => {
      setConversation(prev => [...prev, { role: 'assistant', content: data.answer }]);
      setQuestion('');
    },
  });

  const handleAsk = () => {
    if (!question.trim()) return;

    // Build context-aware question
    let contextualQuestion = question;
    
    if (material && !question.toLowerCase().includes(material.name.toLowerCase())) {
      contextualQuestion = `Regarding ${material.name}: ${question}`;
    }

    if (context) {
      contextualQuestion = `${context}\n\n${contextualQuestion}`;
    }

    setConversation(prev => [...prev, { role: 'user', content: question }]);
    askMutation.mutate({ question: contextualQuestion });
  };

  const quickPrompts = material ? [
    `What are better alternatives to ${material.name}?`,
    `Why is ${material.name} ${material.ris > 70 ? 'regenerative' : 'not very sustainable'}?`,
    `What are the best use cases for ${material.name}?`,
    `How does ${material.name} compare to other ${material.category} materials?`,
  ] : [
    "What makes a material regenerative?",
    "How do I choose between materials?",
    "What is the RIS score?",
    "Explain lifecycle carbon phases",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            AI Material Assistant
          </DialogTitle>
          <DialogDescription>
            {material 
              ? `Ask questions about ${material.name} or get recommendations for better alternatives`
              : "Ask questions about sustainable materials and get expert guidance"
            }
          </DialogDescription>
        </DialogHeader>

        {/* Conversation History */}
        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {conversation.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <p className="mb-4">Start a conversation or try a quick prompt below</p>
            </div>
          )}
          
          {conversation.map((message, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 ml-8'
                  : 'bg-gray-50 dark:bg-gray-900 mr-8'
              }`}
            >
              <p className="text-xs font-semibold mb-1 text-gray-600 dark:text-gray-400">
                {message.role === 'user' ? 'You' : 'AI Assistant'}
              </p>
              {message.role === 'assistant' ? (
                <Streamdown>{message.content}</Streamdown>
              ) : (
                <p className="text-sm">{message.content}</p>
              )}
            </div>
          ))}

          {askMutation.isLoading && (
            <div className="flex items-center gap-2 text-gray-500 mr-8">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">AI is thinking...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        {conversation.length === 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Quick prompts:</p>
            <div className="grid grid-cols-2 gap-2">
              {quickPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuestion(prompt);
                    setTimeout(() => handleAsk(), 100);
                  }}
                  className="text-left text-xs p-2 rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2 pt-4 border-t">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAsk()}
            placeholder="Ask a question..."
            disabled={askMutation.isLoading}
          />
          <Button
            onClick={handleAsk}
            disabled={!question.trim() || askMutation.isLoading}
            size="icon"
          >
            {askMutation.isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
