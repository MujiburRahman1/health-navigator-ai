import { useState } from "react";
import { MessageSquare, Volume2, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VF_QUESTION_CATEGORIES, getFeaturedPrompts } from "@/lib/vfAgentQuestions";

interface QuestionInputProps {
  onChatSubmit: (question: string) => void;
  onVoiceSubmit: (question: string) => void;
  isLoading: boolean;
  loadingType: "chat" | "voice" | null;
}

export function QuestionInput({
  onChatSubmit,
  onVoiceSubmit,
  isLoading,
  loadingType,
}: QuestionInputProps) {
  const [question, setQuestion] = useState("");
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const featuredPrompts = getFeaturedPrompts();

  const handleChatClick = () => {
    if (question.trim()) {
      onChatSubmit(question);
    }
  };

  const handleVoiceClick = () => {
    if (question.trim()) {
      onVoiceSubmit(question);
    }
  };

  const handleExampleClick = (prompt: string) => {
    setQuestion(prompt);
  };

  const displayedCategory = selectedCategory 
    ? VF_QUESTION_CATEGORIES.find(c => c.id === selectedCategory)
    : null;

  return (
    <Card className="p-6 space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Ask a Question
        </label>
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask about healthcare access gaps, equipment mismatches, or facility analysis..."
          className="min-h-[120px] resize-none text-base"
          disabled={isLoading}
        />
      </div>

      {/* Featured prompts */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Featured questions:</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllCategories(!showAllCategories)}
            className="text-xs h-6 px-2"
          >
            {showAllCategories ? (
              <>Hide categories <ChevronUp className="h-3 w-3 ml-1" /></>
            ) : (
              <>Show all 11 categories <ChevronDown className="h-3 w-3 ml-1" /></>
            )}
          </Button>
        </div>
        
        {!showAllCategories && (
          <div className="flex flex-wrap gap-2">
            {featuredPrompts.slice(0, 6).map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleExampleClick(prompt)}
                disabled={isLoading}
                className="text-xs px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50 text-left"
              >
                {prompt.length > 50 ? prompt.slice(0, 50) + '...' : prompt}
              </button>
            ))}
          </div>
        )}

        {/* All categories view */}
        {showAllCategories && (
          <div className="space-y-3 pt-2">
            {/* Category tabs */}
            <div className="flex flex-wrap gap-1.5">
              {VF_QUESTION_CATEGORIES.map((category) => (
                <Badge
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "secondary"}
                  className="cursor-pointer text-xs"
                  onClick={() => setSelectedCategory(
                    selectedCategory === category.id ? null : category.id
                  )}
                >
                  {category.icon} {category.name}
                  <span className="ml-1 opacity-60">({category.questions.length})</span>
                </Badge>
              ))}
            </div>

            {/* Questions for selected category */}
            {displayedCategory && (
              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <p className="text-xs font-medium text-foreground">
                  {displayedCategory.icon} {displayedCategory.name} Questions
                </p>
                <div className="space-y-1.5">
                  {displayedCategory.questions.map((q) => (
                    <button
                      key={q.id}
                      onClick={() => handleExampleClick(q.question)}
                      disabled={isLoading}
                      className="w-full text-left text-xs px-3 py-2 rounded bg-background hover:bg-primary/5 transition-colors disabled:opacity-50 flex items-start gap-2"
                    >
                      <Badge 
                        variant="outline" 
                        className={`text-[10px] shrink-0 ${
                          q.priority === 'must' ? 'border-success text-success' :
                          q.priority === 'should' ? 'border-primary text-primary' :
                          'border-muted-foreground text-muted-foreground'
                        }`}
                      >
                        {q.priority}
                      </Badge>
                      <span>{q.question}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!displayedCategory && (
              <p className="text-xs text-muted-foreground text-center py-2">
                Click a category above to see available questions
              </p>
            )}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          onClick={handleChatClick}
          disabled={!question.trim() || isLoading}
          className="flex-1 h-12 text-base font-medium bg-gradient-hero hover:opacity-90 transition-opacity"
        >
          {isLoading && loadingType === "chat" ? (
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          ) : (
            <MessageSquare className="h-5 w-5 mr-2" />
          )}
          Chat Recommendation
        </Button>

        <Button
          onClick={handleVoiceClick}
          disabled={!question.trim() || isLoading}
          variant="outline"
          className="flex-1 h-12 text-base font-medium border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-all"
        >
          {isLoading && loadingType === "voice" ? (
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          ) : (
            <Volume2 className="h-5 w-5 mr-2" />
          )}
          Voice Recommendation
        </Button>
      </div>
    </Card>
  );
}
