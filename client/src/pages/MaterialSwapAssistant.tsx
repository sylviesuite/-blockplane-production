import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, Send, Loader2, ArrowRight, DollarSign, Leaf, 
  TrendingDown, FileText, Plus, Mail, ArrowLeft 
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

interface Message {
  role: "user" | "assistant";
  content: string;
  recommendations?: any[];
  region?: string;
  projectArea?: number;
}

const EXAMPLE_QUERIES = [
  "I'm specifying 2x6 studs for a 2,000 sq ft house in Seattle. What's better?",
  "Need insulation for a commercial building in NYC. R-value 19 minimum.",
  "Looking for sustainable concrete for a residential foundation in Denver.",
  "What's the best steel option for structural framing in Boston?",
  "I need earth-based materials for a 5,000 sq ft project in rural California.",
];

export default function MaterialSwapAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 Hi! I'm your Material Swap Assistant. Tell me what material you're specifying, and I'll recommend better sustainable alternatives with carbon savings and cost analysis.\n\nTry asking something like: *\"I'm using 2x6 SPF studs for a house in Seattle. What should I use instead?\"*"
    }
  ]);
  const [input, setInput] = useState("");
  const [region, setRegion] = useState("national");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const recommendationsMutation = trpc.swapAssistant.getRecommendations.useMutation({
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.explanation,
        recommendations: data.recommendations,
        region: data.region,
        projectArea: data.projectArea,
      }]);
    },
    onError: (error) => {
      toast.error("Failed to get recommendations: " + error.message);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I'm sorry, I encountered an error processing your request. Please try rephrasing your question or try again later."
      }]);
    }
  });

  const specMutation = trpc.swapAssistant.generateSpec.useMutation({
    onSuccess: (data) => {
      // Download spec as text file
      const blob = new Blob([data.specText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${data.materialName.replace(/\s+/g, "_")}_Specification.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Specification downloaded!");
    },
    onError: (error) => {
      toast.error("Failed to generate specification: " + error.message);
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || recommendationsMutation.isPending) return;

    const userMessage = input.trim();
    setInput("");

    // Add user message
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);

    // Get recommendations
    recommendationsMutation.mutate({
      query: userMessage,
      region,
      projectArea: 1000,
    });
  };

  const handleExampleClick = (example: string) => {
    setInput(example);
  };

  const handleGenerateSpec = (materialId: number) => {
    specMutation.mutate({ materialId });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Sparkles className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Material Swap Assistant</h1>
              <p className="text-muted-foreground">
                AI-powered recommendations for sustainable material alternatives
              </p>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="p-0">
            {/* Messages */}
            <div className="h-[500px] overflow-y-auto p-6 space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] ${
                      message.role === "user"
                        ? "bg-purple-600 text-white rounded-2xl rounded-tr-sm px-4 py-3"
                        : "bg-muted rounded-2xl rounded-tl-sm px-4 py-3"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <Streamdown>{message.content}</Streamdown>
                      </div>
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}

                    {/* Recommendations */}
                    {message.recommendations && message.recommendations.length > 0 && (
                      <div className="mt-4 space-y-3">
                        {message.recommendations.map((rec, recIndex) => (
                          <div
                            key={recIndex}
                            className="bg-background rounded-lg p-4 border shadow-sm"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 font-bold text-sm">
                                  {recIndex + 1}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-foreground">{rec.name}</h4>
                                  <p className="text-xs text-muted-foreground">{rec.category}</p>
                                </div>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                RIS {rec.risScore}
                              </Badge>
                            </div>

                            {/* Metrics */}
                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <div className="flex items-center gap-2 text-sm">
                                <Leaf className="w-4 h-4 text-green-600" />
                                <div>
                                  <div className="text-xs text-muted-foreground">Carbon</div>
                                  <div className="font-semibold">{rec.totalCarbon.toFixed(1)} kg CO₂e</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <DollarSign className="w-4 h-4 text-blue-600" />
                                <div>
                                  <div className="text-xs text-muted-foreground">Cost</div>
                                  <div className="font-semibold">${rec.cost.toFixed(2)}</div>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap gap-2">
                              <Link href={`/material/${rec.id}`}>
                                <Button size="sm" variant="outline">
                                  <ArrowRight className="w-3 h-3 mr-1" />
                                  View Details
                                </Button>
                              </Link>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleGenerateSpec(rec.id)}
                                disabled={specMutation.isPending}
                              >
                                <FileText className="w-3 h-3 mr-1" />
                                Generate Spec
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {recommendationsMutation.isPending && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Analyzing materials...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t p-4 bg-muted/30">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about materials... (e.g., '2x6 studs for a house in Seattle')"
                  className="flex-1"
                  disabled={recommendationsMutation.isPending}
                />
                <Button
                  type="submit"
                  disabled={!input.trim() || recommendationsMutation.isPending}
                  size="icon"
                >
                  {recommendationsMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* Example Queries */}
        {messages.length === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Try these examples:</CardTitle>
              <CardDescription>Click any example to get started</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_QUERIES.map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleExampleClick(example)}
                    className="text-left h-auto py-2 px-3 whitespace-normal"
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
