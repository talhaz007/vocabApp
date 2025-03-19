"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { CheckCircle, RefreshCw, ArrowRight, Check, X, Bell } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Breadcrumb } from "@/components/breadcrumb"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { generateWritingPrompt, saveLearnedWord } from "@/lib/ai-word-service"
import { incrementWordLearned, incrementExerciseCompleted } from "@/lib/stats-service"

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
  const [isLoading, setIsLoading] = useState(false)
  const [allPrompts, setAllPrompts] = useState<WritingPrompt[]>([]) // Store all generated prompts
  const [filteredPrompts, setFilteredPrompts] = useState<WritingPrompt[]>([]) // Store filtered prompts
  const [grammarSuggestions, setGrammarSuggestions] = useState<string[]>([])
  const [styleSuggestions, setStyleSuggestions] = useState<string[]>([])
  const [feedbackType, setFeedbackType] = useState<"success" | "error" | null>(null)
  const [result, setResult] = useState<any>(null) // Store the full API response
  const { toast } = useToast()
  const isInitialized = useRef(false)
  const [activeTab, setActiveTab] = useState<string>("write")

  // Categories for random selection
  const categories = ["Creative Writing", "Academic", "Persuasive", "Reflective", "Speculative", "Business", "Travel", "Technology", "Environment", "Culture"]

  // Load writing prompts only once at initialization
  useEffect(() => {
    async function loadWritingPrompts() {
      if (allPrompts.length > 0) return // Skip if we already have prompts
      
      setIsLoading(true)
      try {
        const newPrompts: WritingPrompt[] = []
        
        // Generate 2 easy prompts
        for (let i = 0; i < 2; i++) {
          const randomCategory = categories[Math.floor(Math.random() * categories.length)]
          const prompt = await generateWritingPrompt({ 
            difficulty: "easy", 
            category: randomCategory 
          })
          
          const writingPrompt: WritingPrompt = {
            id: `prompt-easy-${i}`,
            title: prompt.title,
            description: prompt.description,
            targetWords: prompt.targetWords,
            category: prompt.category,
            difficulty: prompt.difficulty,
            minWords: prompt.minWords
          }
          newPrompts.push(writingPrompt)
          
          // Update the state immediately with each new prompt
          setAllPrompts([...newPrompts])
          setFilteredPrompts([...newPrompts])
        }
        
        // Generate 2 medium prompts
        for (let i = 0; i < 2; i++) {
          const randomCategory = categories[Math.floor(Math.random() * categories.length)]
          const prompt = await generateWritingPrompt({ 
            difficulty: "medium", 
            category: randomCategory 
          })
          
          const writingPrompt: WritingPrompt = {
            id: `prompt-medium-${i}`,
            title: prompt.title,
            description: prompt.description,
            targetWords: prompt.targetWords,
            category: prompt.category,
            difficulty: prompt.difficulty,
            minWords: prompt.minWords
          }
          newPrompts.push(writingPrompt)
          
          // Update the state immediately with each new prompt
          setAllPrompts([...newPrompts])
          setFilteredPrompts([...newPrompts])
        }
        
        // Generate 1 hard prompt
        const randomCategory = categories[Math.floor(Math.random() * categories.length)]
        const prompt = await generateWritingPrompt({ 
          difficulty: "hard", 
          category: randomCategory 
        })
        
        const writingPrompt: WritingPrompt = {
          id: `prompt-hard-0`,
          title: prompt.title,
          description: prompt.description,
          targetWords: prompt.targetWords,
          category: prompt.category,
          difficulty: prompt.difficulty,
          minWords: prompt.minWords
        }
        newPrompts.push(writingPrompt)
        
        // Final update with all prompts
        setAllPrompts(newPrompts)
        setFilteredPrompts(newPrompts)
        
        toast({
          title: "Writing prompts loaded",
          description: "Your writing prompts are ready",
        })
      } catch (error) {
        console.error("Error loading writing prompts:", error)
        toast({
          title: "Error loading prompts",
          description: "Please try again later",
          variant: "destructive",
        })
        // Fall back to sample prompts if loading fails
        setAllPrompts(sampleWritingPrompts)
        setFilteredPrompts(sampleWritingPrompts)
      } finally {
        setIsLoading(false)
      }
    }

    if (!isInitialized.current) {
      isInitialized.current = true
      loadWritingPrompts()
    }
  }, [toast])

  // Filter prompts when category or difficulty changes
  useEffect(() => {
    if (allPrompts.length === 0) return
    
    let filtered = [...allPrompts]
    
    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(prompt => prompt.category === selectedCategory)
    }
    
    // Apply difficulty filter
    if (selectedDifficulty !== "all") {
      filtered = filtered.filter(prompt => prompt.difficulty === selectedDifficulty)
    }
    
    setFilteredPrompts(filtered)
  }, [selectedCategory, selectedDifficulty, allPrompts])

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

  const handleSubmit = async () => {
    if (!selectedPrompt) return

    const wordCount = userResponse.split(/\s+/).filter((word) => word.length > 0).length
    
    if (wordCount < selectedPrompt.minWords) {
      toast({
        title: "Response too short",
        description: `Please write at least ${selectedPrompt.minWords} words. Current count: ${wordCount}`,
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // Send the response to the API for evaluation
      const response = await fetch('/api/writing/evaluate-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          response: userResponse,
          targetWords: selectedPrompt.targetWords,
          minWords: selectedPrompt.minWords,
          prompt: selectedPrompt.description
        }),
      })
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const result = await response.json()
      
      // Store the full result
      setResult(result)
      
      // Set individual pieces of state for backward compatibility
      setFeedback(result.feedback)
      setUsedWords(result.usedWords)
      setGrammarSuggestions(result.grammarSuggestions || [])
      setStyleSuggestions(result.styleSuggestions || [])
      setFeedbackType(result.isValid ? "success" : "error")
      setIsSubmitted(true)
      
      // Explicitly set the active tab to "feedback" after setting feedback
      setActiveTab("feedback")
      
      // Save used words to learned_words if the response is valid
      if (result.isValid && result.usedWords.length > 0) {
        try {
          // Save each used word to the learned_words table
          for (const word of result.usedWords) {
            await saveLearnedWord(
              {
                word: word,
                definition: "Used in writing exercise",
                mnemonic: "",
                difficulty: selectedPrompt.difficulty,
                hints: [],
                examples: [userResponse.substring(0, 200) + "..."], // Use part of the response as an example
                synonyms: [],
                antonyms: []
              },
              {
                mastery: result.overallQuality === "excellent" ? 90 : 70, // Higher mastery for excellent quality
                lastPracticed: new Date(),
                notes: `Used in writing prompt: "${selectedPrompt.title}"`
              }
            )
            incrementWordLearned();
          }
          await incrementExerciseCompleted(10);
          toast({
            title: `${result.usedWords.length} words saved to your vocabulary`,
            description: "Your writing progress has been recorded",
          })
        } catch (error) {
          console.error("Error saving words to vocabulary:", error)
        }
      }
    } catch (error) {
      console.error("Error evaluating writing:", error)
      toast({
        title: "Error evaluating writing",
        description: "Please try again later",
        variant: "destructive",
      })
      setFeedback("Unable to evaluate your writing at this time.")
      setFeedbackType("error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewPrompt = () => {
    setSelectedPrompt(null)
    setUserResponse("")
    setFeedback(null)
    setUsedWords([])
    setIsSubmitted(false)
  }

  // Add sample writing prompts for fallback
  const sampleWritingPrompts: WritingPrompt[] = [
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
      difficulty: "easy",
      minWords: 80,
    },
    {
      id: "5",
      title: "Future Technology",
      description: "Imagine and describe a new technology that might exist 50 years from now.",
      targetWords: ["Innovative", "Revolutionary", "Paradigm", "Integrate", "Enhance"],
      category: "Speculative",
      difficulty: "easy",
      minWords: 80,
    },
  ]

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
            
            {/* Show loading skeletons for remaining slots */}
            {isLoading && Array(5 - filteredPrompts.length).fill(0).map((_, index) => (
              <Card key={`skeleton-${index}`} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded w-full mb-2"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                </CardContent>
                <CardFooter>
                  <div className="flex gap-2">
                    <div className="h-6 bg-muted rounded w-16"></div>
                    <div className="h-6 bg-muted rounded w-16"></div>
                  </div>
                </CardFooter>
              </Card>
            ))}
            
            {!isLoading && filteredPrompts.length === 0 && (
              <div className="col-span-2 text-center py-8">
                <p className="text-muted-foreground">No prompts match your filters. Try different criteria.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSelectedCategory("all")
                    setSelectedDifficulty("all")
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            )}
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

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="write" disabled={isSubmitted}>
                  Write
                </TabsTrigger>
                <TabsTrigger value="feedback" disabled={!isSubmitted}>
                  Feedback
                  {isSubmitted && feedback && (
                    <span className="ml-2 relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                  )}
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
                  <Button onClick={handleSubmit} disabled={isLoading || isSubmitted || userResponse.trim().length === 0}>
                    Submit for Feedback
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="feedback" className="space-y-4 pt-4">
                {feedback && (
                  <div
                    className={`p-4 rounded-md ${
                      feedbackType === "success" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {feedbackType === "success" ? (
                        <Check className="h-5 w-5 text-green-500 mt-0.5" />
                      ) : (
                        <X className="h-5 w-5 text-red-500 mt-0.5" />
                      )}
                      <div>
                        <h3 className={`font-medium ${feedbackType === "success" ? "text-green-800" : "text-red-800"}`}>
                          {feedbackType === "success" ? "Well done!" : "Keep improving"}
                        </h3>
                        <p className={feedbackType === "success" ? "text-green-700" : "text-red-700"}>{feedback}</p>
                        
                        {/* Add Writing Score */}
                        {result?.writingScore !== undefined && (
                          <div className="mt-3">
                            <p className="font-medium text-sm">Writing Score:</p>
                            <div className="mt-1 flex items-center">
                              <div className="h-2.5 w-full bg-gray-200 rounded-full">
                                <div 
                                  className={`h-2.5 rounded-full ${
                                    result.writingScore >= 80 ? "bg-green-500" : 
                                    result.writingScore >= 60 ? "bg-yellow-500" : "bg-red-500"
                                  }`} 
                                  style={{ width: `${result.writingScore}%` }}
                                ></div>
                              </div>
                              <span className="ml-2 text-sm font-medium">{result.writingScore}/100</span>
                            </div>
                          </div>
                        )}
                        
                        {usedWords.length > 0 && (
                          <div className="mt-3">
                            <p className="font-medium text-sm">Target words used:</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {usedWords.map((word) => (
                                <div 
                                  key={word} 
                                  className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200"
                                >
                                  {word}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {grammarSuggestions.length > 0 && (
                          <div className="mt-3">
                            <p className="font-medium text-sm">Grammar suggestions:</p>
                            <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                              {grammarSuggestions.map((suggestion, index) => (
                                <li key={index} className="text-amber-700">{suggestion}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {styleSuggestions.length > 0 && (
                          <div className="mt-3">
                            <p className="font-medium text-sm">Style suggestions:</p>
                            <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                              {styleSuggestions.map((suggestion, index) => (
                                <li key={index} className="text-blue-700">{suggestion}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Add App Recommendations */}
                        {result?.appRecommendations && result.appRecommendations.length > 0 && (
                          <div className="mt-4">
                            <p className="font-medium text-sm">Recommended Tools:</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                              {result.appRecommendations.map((app, index) => (
                                <div key={index} className="flex items-start p-2 rounded-md bg-blue-50 border border-blue-100">
                                  <Bell className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                                  <div>
                                    <p className="text-sm font-medium text-blue-700">{app.appName}</p>
                                    <p className="text-xs text-blue-600">{app.reason}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-primary/5 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Your Response</h3>
                  <p className="whitespace-pre-wrap">{userResponse}</p>
                </div>

                <div className="flex justify-end">
                  {/* <Button onClick={() => setIsSubmitted(false)}>
                    Revise Response
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button> */}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

