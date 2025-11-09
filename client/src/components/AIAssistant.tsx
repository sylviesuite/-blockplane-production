import { useState } from 'react';
import { trpc } from '../lib/trpc';
import type { Material } from '../types';
import { Button } from './ui/button';
import { Loader2, Sparkles, Send } from 'lucide-react';

interface AIAssistantProps {
  materials: Material[];
}

const QUICK_PROMPTS = [
  {
    icon: '🔍',
    label: 'Compare wall types',
    prompt: 'Compare the different wall materials in terms of embodied carbon and sustainability.',
  },
  {
    icon: '📊',
    label: 'Summarize embodied carbon',
    prompt: 'Summarize the embodied carbon footprint of these materials and identify the highest and lowest impact options.',
  },
  {
    icon: '🌍',
    label: 'Explain lifecycle phase impacts',
    prompt: 'Explain which lifecycle phases (production, transport, construction, etc.) contribute most to the carbon footprint.',
  },
  {
    icon: '🌱',
    label: 'Suggest sustainable alternatives',
    prompt: 'Suggest the most sustainable alternatives from these materials and explain why.',
  },
];

export default function AIAssistant({ materials }: AIAssistantProps) {
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ question: string; answer: string }>>([]);
  
  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: (data, variables) => {
      setChatHistory(prev => [...prev, { question: variables.question, answer: data.answer }]);
      setQuestion('');
    },
  });

  const handleQuickPrompt = (prompt: string) => {
    const materialsData = materials.map(m => ({
      name: m.name,
      total: m.total,
      phases: m.phases,
    }));
    
    chatMutation.mutate({
      question: prompt,
      materials: materialsData,
    });
  };

  const handleCustomQuestion = () => {
    if (!question.trim()) return;
    
    const materialsData = materials.map(m => ({
      name: m.name,
      total: m.total,
      phases: m.phases,
    }));
    
    chatMutation.mutate({
      question: question.trim(),
      materials: materialsData,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-emerald-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          AI Assistant — Describe or Refine Your Project
        </h3>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Ask questions or select a quick prompt below
      </p>

      {/* Quick Prompts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {QUICK_PROMPTS.map((item, index) => (
          <button
            key={index}
            onClick={() => handleQuickPrompt(item.prompt)}
            disabled={chatMutation.isPending}
            className="flex items-center gap-2 px-4 py-3 text-left border border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-sm font-medium text-gray-700">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Custom Question Input */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleCustomQuestion()}
          placeholder="Ask the AI to generate or refine your..."
          disabled={chatMutation.isPending}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50"
        />
        <Button
          onClick={handleCustomQuestion}
          disabled={chatMutation.isPending || !question.trim()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {chatMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Chat History */}
      {chatHistory.length > 0 && (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {chatHistory.map((chat, index) => (
            <div key={index} className="space-y-2">
              {/* Question */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <p className="text-sm font-medium text-emerald-900">You asked:</p>
                <p className="text-sm text-emerald-800 mt-1">{chat.question}</p>
              </div>
              
              {/* Answer */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-900 mb-1">AI Response:</p>
                <div className="text-sm text-gray-700 whitespace-pre-wrap">{chat.answer}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading State */}
      {chatMutation.isPending && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          <span className="ml-2 text-sm text-gray-600">Thinking...</span>
        </div>
      )}

      {/* Error State */}
      {chatMutation.isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
          <p className="text-sm text-red-800">
            Error: {chatMutation.error.message}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Powered by Sylvie Intelligence
        </p>
      </div>
    </div>
  );
}
