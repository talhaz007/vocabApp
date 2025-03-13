"use client"

import type React from "react"

import { useState } from "react"
import { CheckCircle, RefreshCw, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Breadcrumb } from "@/components/breadcrumb"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface WritingPrompt {
  id: string
  title: string
  description: string
  targetWords: string[]
  category: string
  difficulty: "easy" | "medium" | "hard"
  minWords: number
}

// Sample writing prompts
const writingPrompts: WritingPrompt[] = [
  {
    id: "1",
    title: "A Surprising Discovery",
    description: "Write about a character who makes an unexpected discovery while traveling abroad.",
    targetWords: ["Serendipity", "Astonish", "Venture", "Peculiar", "Revelation"],
    category: "Creative Writing",
    difficulty: "medium",
    minWords: 100,
  },
  {
    id: "2",
    title: "Technology in Education",
    description: "Discuss the benefits and challenges of integrating technology in modern classrooms.",
    targetWords: ["Implement", "Enhance", "Ubiquitous", "Facilitate", "Drawback"],
    category: "Academic",
    difficulty: "medium",
    minWords: 150,
  },
  {
    id: "3",
    title: "Environmental Conservation",
    description: "Propose solutions to address a specific environmental issue in your community.",
    targetWords: ["Sustainable", "Initiative", "Mitigate", "Collaborate", "Impact"],
    category: "Persuasive",
    difficulty: "hard",
    minWords: 200,
  },
  {
    id: "4",
    title: "A Memorable Conversation",
    description: "Describe a conversation that changed your perspective on an important topic.",
    targetWords: ["Eloquent", "Perspective", "Profound", "Enlighten", "Discourse"],
    category: "Reflective",
    difficulty: "medium",
    minWords: 120,
  },
  {
    id: "5",
    title: "Future Technology",
    description: "Imagine and describe a new technology that might exist 50 years from now.",
    targetWords: ["Innovative", "Revolutionary", "Paradigm", "Integrate", "Enhance"],
    category: "Speculative",
    difficulty: "hard",
    minWords: 180,
  },
]

export default function WritingPromptsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all")
  const [selectedPrompt, setSelectedPrompt] = useState<WritingPrompt | null>(null)
  const [userResponse, setUserResponse] = useState("")
  const [feedback, setFeedback] = useState<string | null>(null)
  const [usedWords, setUsedWords] = useState<string[]>([])
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()

  const filteredPrompts = writingPrompts.filter((prompt) => {
    if (selectedCategory !== "all" && prompt.category !== selectedCategory) return false
    if (selectedDifficulty !== "all" && prompt.difficulty !== selectedDifficulty) return false
    return true
  })

  const handlePromptSelect = (prompt: WritingPrompt) => {
    setSelectedPrompt(prompt)
    setUserResponse("")
    setFeedback(null)
    setUsedWords([])
    setIsSubmitted(false)
  }

  const handleResponseChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserResponse(e.target.value)

    // Check which target words are used
    const response = e.target.value.toLowerCase()
    const used = selectedPrompt?.targetWords.filter((word) => response.includes(word.toLowerCase())) || []

    setUsedWords(used)
  }

  const handleSubmit = () => {
    if (!selectedPrompt) return

    const wordCount = userResponse.split(/\s+/).filter((word) => word.length > 0).length
    const usedWordCount = usedWords.length

    if (wordCount < selectedPrompt.minWords) {
      toast({
        title: "Response too short",
        description: `Please write at least ${selectedPrompt.minWords} words. Current count: ${wordCount}`,
        variant: "destructive",
      })
      return
    }

    setIsSubmitted(true)

    // Generate feedback based on word usage and length
    let feedbackText = ""

    if (usedWordCount === selectedPrompt.targetWords.length) {
      feedbackText = "Excellent work! You've used all the target vocabulary words effectively in your response."
    } else if (usedWordCount >= selectedPrompt.targetWords.length * 0.7) {
      feedbackText = `Good job! You've used ${usedWordCount} out of ${selectedPrompt.targetWords.length} target words. Try incorporating the remaining words in your next revision.`
    } else {
      feedbackText = `You've used ${usedWordCount} out of ${selectedPrompt.targetWords.length} target words. Try to incorporate more vocabulary in your writing to strengthen your language skills.`
    }

    // Add grammar and style feedback
    if (wordCount > selectedPrompt.minWords * 1.5) {
      feedbackText += "\n\nYour response is well-developed with good length. "
    }

    // Add suggestions for unused words
    if (usedWordCount < selectedPrompt.targetWords.length) {
      const unusedWords = selectedPrompt.targetWords.filter((word) => !usedWords.includes(word))
      feedbackText += `\n\nConsider incorporating these words in your revision: ${unusedWords.join(", ")}.`
    }

    setFeedback(feedbackText)
  }

  const handleNewPrompt = () => {
    setSelectedPrompt(null)
    setUserResponse("")
    setFeedback(null)
    setUsedWords([])
    setIsSubmitted(false)
  }

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <Breadcrumb items={[{ label: "Writing Prompts", href: "/writing-prompts", active: true }]} />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Writing Prompts</h1>
      </div>

      <p className="text-muted-foreground max-w-3xl">
        Practice using vocabulary in creative and structured writing exercises. Our AI provides real-time feedback and
        tracks your word usage and grammar improvements.
      </p>

      {!selectedPrompt ? (
        <>
          <div className="flex flex-col md:flex-row gap-4 mt-8">
            <div className="flex-1">
              <label htmlFor="category" className="text-sm font-medium block mb-2">
                Filter by Category
              </label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Creative Writing">Creative Writing</SelectItem>
                  <SelectItem value="Academic">Academic</SelectItem>
                  <SelectItem value="Persuasive">Persuasive</SelectItem>
                  <SelectItem value="Reflective">Reflective</SelectItem>
                  <SelectItem value="Speculative">Speculative</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label htmlFor="difficulty" className="text-sm font-medium block mb-2">
                Filter by Difficulty
              </label>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {filteredPrompts.map((prompt) => (
              <Card
                key={prompt.id}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => handlePromptSelect(prompt)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{prompt.title}</CardTitle>
                    <Badge
                      variant={
                        prompt.difficulty === "easy"
                          ? "outline"
                          : prompt.difficulty === "medium"
                            ? "secondary"
                            : "default"
                      }
                    >
                      {prompt.difficulty}
                    </Badge>
                  </div>
                  <CardDescription>{prompt.category}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2">{prompt.description}</p>
                </CardContent>
                <CardFooter>
                  <div className="flex flex-wrap gap-2">
                    {prompt.targetWords.slice(0, 3).map((word) => (
                      <Badge key={word} variant="outline" className="bg-primary/5">
                        {word}
                      </Badge>
                    ))}
                    {prompt.targetWords.length > 3 && (
                      <Badge variant="outline" className="bg-primary/5">
                        +{prompt.targetWords.length - 3} more
                      </Badge>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{selectedPrompt.title}</CardTitle>
                <CardDescription className="mt-1">
                  {selectedPrompt.category} • {selectedPrompt.difficulty} • Min. {selectedPrompt.minWords} words
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleNewPrompt}>
                <RefreshCw className="mr-2 h-3 w-3" />
                New Prompt
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-medium mb-2">Prompt</h3>
              <p>{selectedPrompt.description}</p>
            </div>

            <div>
              <h3 className="font-medium mb-2">Target Vocabulary</h3>
              <div className="flex flex-wrap gap-2">
                {selectedPrompt.targetWords.map((word) => (
                  <Badge
                    key={word}
                    variant={usedWords.includes(word) ? "default" : "outline"}
                    className={usedWords.includes(word) ? "" : "bg-primary/5"}
                  >
                    {word}
                    {usedWords.includes(word) && <CheckCircle className="ml-1 h-3 w-3" />}
                  </Badge>
                ))}
              </div>
            </div>

            <Tabs defaultValue="write" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="write">Write</TabsTrigger>
                <TabsTrigger value="feedback" disabled={!isSubmitted}>
                  Feedback
                </TabsTrigger>
              </TabsList>
              <TabsContent value="write" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label htmlFor="response" className="text-sm font-medium">
                      Your Response
                    </label>
                    <span className="text-xs text-muted-foreground">
                      {userResponse.split(/\s+/).filter((word) => word.length > 0).length} words
                      {selectedPrompt.minWords > 0 && ` (min. ${selectedPrompt.minWords})`}
                    </span>
                  </div>
                  <Textarea
                    id="response"
                    value={userResponse}
                    onChange={handleResponseChange}
                    placeholder="Start writing your response here..."
                    className="min-h-[300px]"
                    disabled={isSubmitted}
                  />
                </div>

                <div className="flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    {usedWords.length} of {selectedPrompt.targetWords.length} target words used
                  </div>
                  <Button onClick={handleSubmit} disabled={isSubmitted || userResponse.trim().length === 0}>
                    Submit for Feedback
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="feedback" className="space-y-4 pt-4">
                {feedback && (
                  <div className="bg-muted p-4 rounded-md">
                    <h3 className="font-medium mb-2">AI Feedback</h3>
                    <div className="space-y-2">
                      {feedback.split("\n\n").map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-primary/5 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Your Response</h3>
                  <p className="whitespace-pre-wrap">{userResponse}</p>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => setIsSubmitted(false)}>
                    Revise Response
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

