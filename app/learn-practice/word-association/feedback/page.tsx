"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Check, X, ArrowLeft, Award, BookOpen, Loader2, Sparkles, Brain, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Breadcrumb } from "@/components/breadcrumb"
import { useToast } from "@/hooks/use-toast"

const WordAssociationFeedback = () => {
  const router = useRouter()
  const [feedbackData, setFeedbackData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { toast } = useToast()
  
  useEffect(() => {
    const processFeedback = async () => {
      try {
        setLoading(true);
        
        // First check if we already have results
        const storedResults = localStorage.getItem('wordAssociationResults')
        
        if (storedResults) {
          // We already have processed results
          const parsedData = JSON.parse(storedResults)
          setFeedbackData(parsedData)
          // Clear the localStorage after retrieving the data
          localStorage.removeItem('wordAssociationResults')
          setLoading(false)
          return
        }
        
        // If no results, check if we have exercises to process
        const storedExercises = localStorage.getItem('wordAssociationExercises')
        
        if (!storedExercises) {
          // No exercises to process
          setLoading(false)
          return
        }
        
        // We have exercises to process
        const exercises = JSON.parse(storedExercises)
        
        // Call the API to evaluate exercises
        const response = await fetch('/api/feedback/word-association', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ exercises }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to evaluate word association exercises')
        }
        
        const result = await response.json()
        
        // Update state with results
        setFeedbackData(result)
        
        // Store in localStorage temporarily in case user refreshes the page
        localStorage.setItem('wordAssociationResults', JSON.stringify(result))
        
        // Clean up the exercises to prevent reprocessing
        localStorage.removeItem('wordAssociationExercises')
        
      } catch (error) {
        console.error("Error processing feedback:", error)
        setError(error.message || "An error occurred while processing your feedback")
        toast({
          title: "Error processing feedback",
          description: "There was a problem evaluating your exercises. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    processFeedback()
    
    // Cleanup function to ensure we don't have stale data
    return () => {
      // Set a timeout to remove results data when navigating away
      const timeout = setTimeout(() => {
        localStorage.removeItem('wordAssociationResults');
      }, 500);
      
      return () => clearTimeout(timeout);
    }
  }, [toast])

  // Clear all data when returning to practice or practicing again
  const handleReturnToPractice = () => {
    localStorage.removeItem('wordAssociationResults');
    localStorage.removeItem('wordAssociationExercises');
    router.push("/learn-practice");
  }

  const handlePracticeAgain = () => {
    localStorage.removeItem('wordAssociationResults');
    localStorage.removeItem('wordAssociationExercises');
    router.push("/learn-practice/word-association");
  }

  if (loading) {
    return (
      <div className="container max-w-4xl py-12 space-y-8">
        <Breadcrumb
          items={[
            { label: "Learn & Practice", href: "/learn-practice", active: false },
            { label: "Word Association", href: "/learn-practice/word-association", active: false },
            { label: "Feedback", href: "/learn-practice/word-association/feedback", active: true },
          ]}
        />
        <Card className="shadow-lg border border-border">
          <CardHeader className="bg-card dark:bg-card/60 border-b border-border">
            <CardTitle className="text-2xl">
              Processing your feedback...
            </CardTitle>
            <CardDescription>
              Please wait while we analyze your results
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground animate-pulse">
              Analyzing your word associations...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container max-w-4xl py-12 space-y-8">
        <Breadcrumb
          items={[
            { label: "Learn & Practice", href: "/learn-practice", active: false },
            { label: "Word Association", href: "/learn-practice/word-association", active: false },
            { label: "Feedback", href: "/learn-practice/word-association/feedback", active: true },
          ]}
        />
        <Card className="shadow-lg border border-border">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-2xl flex items-center gap-2 text-red-600">
              <X className="h-6 w-6" />
              Error Processing Feedback
            </CardTitle>
            <CardDescription>
              We encountered a problem while analyzing your exercises.
            </CardDescription>
          </CardHeader>
          <CardContent className="py-8 flex flex-col items-center">
            <div className="mb-6 text-center max-w-md">
              <p className="text-muted-foreground mb-4">
                {error}
              </p>
            </div>
            <Button 
              size="lg"
              onClick={handlePracticeAgain}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!feedbackData) {
    return (
      <div className="container max-w-4xl py-12 space-y-8">
        <Breadcrumb
          items={[
            { label: "Learn & Practice", href: "/learn-practice", active: false },
            { label: "Word Association", href: "/learn-practice/word-association", active: false },
            { label: "Feedback", href: "/learn-practice/word-association/feedback", active: true },
          ]}
        />
        <Card className="shadow-lg border border-border">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Brain className="h-6 w-6 text-amber-500 dark:text-amber-400" />
              No feedback available
            </CardTitle>
            <CardDescription>
              Complete word association exercises to see your personalized feedback and progress.
            </CardDescription>
          </CardHeader>
          <CardContent className="py-8 flex flex-col items-center">
            <div className="mb-6 text-center max-w-md">
              <p className="text-muted-foreground mb-4">
                Practice creating sentences with connected words to receive detailed feedback on your 
                creativity, coherence, and word usage skills.
              </p>
            </div>
            <Button 
              size="lg"
              onClick={handlePracticeAgain}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Start Practicing
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { exercisesEvaluation, overallFeedback, masteryScore, strengths, areasForImprovement } = feedbackData

  // Helper function for score colors
  const getScoreColor = (score) => {
    if (score >= 9) return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
    if (score >= 7) return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
    if (score >= 5) return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
    return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
  }

  // Helper function for progress bar color
  const getProgressColor = (score) => {
    if (score >= 80) return "bg-green-600 dark:bg-green-500"
    if (score >= 60) return "bg-blue-600 dark:bg-blue-500"
    if (score >= 40) return "bg-amber-600 dark:bg-amber-500"
    return "bg-red-600 dark:bg-red-500"
  }

  // Get mastery level based on score
  const getMasteryLevel = (score) => {
    if (score >= 90) return "Expert"
    if (score >= 75) return "Advanced"
    if (score >= 60) return "Intermediate"
    if (score >= 40) return "Developing"
    return "Beginner"
  }

  return (
    <div className="container max-w-4xl py-12 space-y-8">
      <Breadcrumb
        items={[
          { label: "Learn & Practice", href: "/learn-practice", active: false },
          { label: "Word Association", href: "/learn-practice/word-association", active: false },
          { label: "Feedback", href: "/learn-practice/word-association/feedback", active: true },
        ]}
      />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">
          Word Association Results
        </h1>
      </div>

      <Card className="shadow-lg border border-border">
        <CardHeader className="pb-6 border-b border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <CardTitle className="text-2xl">Practice Results</CardTitle>
              <CardDescription className="mt-1">
                See how well you connected words in meaningful sentences
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-card rounded-lg p-3 shadow-sm flex items-center gap-3 border border-border">
                <div className={`w-12 h-12 rounded-full ${getProgressColor(masteryScore)} flex items-center justify-center`}>
                  <span className="text-xl font-bold text-white">{masteryScore}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Mastery Score</span>
                  <span className="text-sm font-medium">{getMasteryLevel(masteryScore)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 p-6">
          {/* Overall Feedback */}
          <div className="bg-muted p-6 rounded-xl border border-border shadow-sm">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
              Overall Feedback
            </h3>
            <p className="leading-relaxed">{overallFeedback}</p>
          </div>

          {/* Strengths and Areas for Improvement */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Removed strengths section */}
            {/* {strengths && strengths.length > 0 && (
              <div className="border rounded-lg p-5 shadow-sm">
                <h3 className="font-medium mb-3 flex items-center gap-2 text-green-600 dark:text-green-400">
                  <Award className="h-5 w-5" />
                  Your Strengths
                </h3>
                <ul className="space-y-2">
                  {strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 dark:text-green-400 mt-0.5" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )} */}
          </div>

          {/* Individual Exercise Feedback */}
          <div className="pt-2">
            <h3 className="font-medium mb-4 flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
              Detailed Exercise Analysis
            </h3>
            <Accordion type="single" collapsible className="w-full bg-card rounded-xl divide-y divide-border">
              {exercisesEvaluation.map((exercise, index) => (
                <AccordionItem value={`item-${index}`} key={index} className="border-0">
                  <AccordionTrigger className="py-5 px-6 hover:no-underline hover:bg-muted/50 rounded-t-xl">
                    <div className="flex items-center w-full">
                      <div className="mr-4">
                        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-full">
                          <span className="h-5 w-5 text-indigo-600 dark:text-indigo-400 font-bold">
                            {index + 1}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 text-left">
                        <span className="font-semibold">{exercise.category}</span>
                        <span className="text-muted-foreground text-sm ml-2">
                          {exercise.difficulty}
                        </span>
                      </div>
                      <Badge className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${getScoreColor(exercise.evaluation.overallScore)}`}>
                        Score: {exercise.evaluation.overallScore}/10
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-5">
                    <div className="space-y-4 pl-12 pt-2">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Selected Words:</h4>
                        <div className="flex flex-wrap gap-2">
                          {exercise.selectedWords.map((word, i) => (
                            <Badge key={i} variant="outline" className="px-3 py-1">
                              {word}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Your Sentence:</h4>
                        <p className="text-base bg-muted/50 p-3 rounded-lg border border-border">"{exercise.userSentence}"</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Evaluation:</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm">Coherence</span>
                              <span className="text-sm font-medium">{exercise.evaluation.coherence}/10</span>
                            </div>
                            <Progress value={exercise.evaluation.coherence * 10} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm">Creativity</span>
                              <span className="text-sm font-medium">{exercise.evaluation.creativity}/10</span>
                            </div>
                            <Progress value={exercise.evaluation.creativity * 10} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm">Grammar</span>
                              <span className="text-sm font-medium">{exercise.evaluation.grammaticalAccuracy}/10</span>
                            </div>
                            <Progress value={exercise.evaluation.grammaticalAccuracy * 10} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm">Word Usage</span>
                              <span className="text-sm font-medium">{exercise.evaluation.wordUsage}/10</span>
                            </div>
                            <Progress value={exercise.evaluation.wordUsage * 10} className="h-2" />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Feedback:</h4>
                        <p className="text-base">{exercise.feedback}</p>
                      </div>
                      
                      {exercise.improvementSuggestions && exercise.improvementSuggestions.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Suggestions for improvement:</h4>
                          <ul className="space-y-2">
                            {exercise.improvementSuggestions.map((suggestion, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                <span>{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </CardContent>

        <CardFooter className="py-5 px-6 border-t border-border bg-card/60 flex flex-col sm:flex-row gap-3 justify-between">
          <Button 
            variant="outline" 
            onClick={handleReturnToPractice}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Practice
          </Button>
          <Button 
            onClick={handlePracticeAgain}
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Sparkles className="h-4 w-4" />
            Practice Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default WordAssociationFeedback