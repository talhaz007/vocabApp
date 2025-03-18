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
import { motion } from "framer-motion"

const VocabularyFeedback = () => {
  const router = useRouter()
  const [feedbackData, setFeedbackData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const { toast } = useToast()
  
  useEffect(() => {
    // Get feedback data or savedAnswers from localStorage
    const storedFeedback = localStorage.getItem('vocabularyFeedback')
    const savedAnswers = localStorage.getItem('savedVocabularyAnswers')
    
    if (storedFeedback) {
      try {
        const parsedData = JSON.parse(storedFeedback)
        setFeedbackData(parsedData)
        // Clear the localStorage after retrieving the data to avoid stale data on refreshes
        localStorage.removeItem('vocabularyFeedback')
        setLoading(false)
      } catch (error) {
        console.error("Error parsing feedback data:", error)
        setLoading(false)
      }
    } else if (savedAnswers) {
      // If we have saved answers but no feedback yet, process them
      try {
        setProcessing(true)
        const parsedAnswers = JSON.parse(savedAnswers)
        
        // Call the API to process the answers
        fetch('/api/feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ savedAnswers: parsedAnswers })
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to process feedback')
          }
          return response.json()
        })
        .then(data => {
          setFeedbackData(data)
          localStorage.removeItem('savedVocabularyAnswers') // Clear saved answers
          setProcessing(false)
          setLoading(false)
        })
        .catch(error => {
          console.error("Error processing feedback:", error)
          toast({
            title: "Error generating feedback",
            description: "Please try again later",
            variant: "destructive",
          })
          setProcessing(false)
          setLoading(false)
        })
      } catch (error) {
        console.error("Error parsing saved answers:", error)
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [toast])

  if (loading || processing) {
    return (
      <div className="container max-w-4xl py-12 space-y-8">
        <Breadcrumb
          items={[
            { label: "Learn & Practice", href: "/learn-practice", active: false },
            { label: "Feedback", href: "/learn-practice/feedback", active: true },
          ]}
        />
        <Card className="shadow-lg border border-border">
          <CardHeader className="bg-card dark:bg-card/60 border-b border-border">
            <CardTitle className="text-2xl">
              {processing ? "Generating your feedback..." : "Loading your feedback..."}
            </CardTitle>
            <CardDescription>
              {processing ? "Please wait while we analyze your practice session" : "Please wait while we load your results"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground animate-pulse">
              {processing ? "Analyzing your vocabulary usage..." : "Almost there..."}
            </p>
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
            { label: "Feedback", href: "/learn-practice/feedback", active: true },
          ]}
        />
        <Card className="shadow-lg border border-border">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Brain className="h-6 w-6 text-amber-500 dark:text-amber-400" />
              No feedback available
            </CardTitle>
            <CardDescription>
              Complete a practice session to see your personalized feedback and progress.
            </CardDescription>
          </CardHeader>
          <CardContent className="py-8 flex flex-col items-center">
            <div className="mb-6 text-center max-w-md">
              <p className="text-muted-foreground mb-4">
                Practice using vocabulary words in sentences to receive detailed feedback on your usage
                and suggestions for improvement.
              </p>
            </div>
            <Button 
              size="lg"
              onClick={() => router.push("/learn-practice")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Start Practicing
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { sentenceFeedback, overallFeedback } = feedbackData
  // Extract vocabulary mastery score from the overallFeedback
  const masteryScoreMatch = overallFeedback.match(/Vocabulary Mastery Score: (\d+)/)
  const vocabularyMastery = masteryScoreMatch ? parseInt(masteryScoreMatch[1]) : 0

  // Get mastery level based on score
  const getMasteryLevel = (score) => {
    if (score >= 90) return "Expert"
    if (score >= 75) return "Advanced"
    if (score >= 60) return "Intermediate"
    if (score >= 40) return "Developing"
    return "Beginner"
  }

  // Helper function for quality colors
  const getQualityColor = (quality) => {
    switch (quality.toLowerCase()) {
      case "excellent": 
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
      case "good": 
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
      case "fair": 
        return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
      case "poor": 
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
      default: 
        return "bg-slate-100 dark:bg-slate-800 text-foreground border-border"
    }
  }

  // Helper function for progress bar color
  const getProgressColor = (score) => {
    if (score >= 80) return "bg-green-600 dark:bg-green-500"
    if (score >= 60) return "bg-blue-600 dark:bg-blue-500"
    if (score >= 40) return "bg-amber-600 dark:bg-amber-500"
    return "bg-red-600 dark:bg-red-500"
  }

  // Count correct answers
  const correctAnswers = sentenceFeedback.filter(item => item.isCorrect).length
  const correctPercentage = Math.round((correctAnswers / sentenceFeedback.length) * 100)

  return (
    <div className="container max-w-4xl py-12 space-y-8">
      <Breadcrumb
        items={[
          { label: "Learn & Practice", href: "/learn-practice", active: false },
          { label: "Feedback", href: "/learn-practice/feedback", active: true },
        ]}
      />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">
          Your Vocabulary Results
        </h1>
      </div>

      <Card className="shadow-lg border border-border">
        <CardHeader className="pb-6 border-b border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <CardTitle className="text-2xl">Practice Results</CardTitle>
              <CardDescription className="mt-1">
                See how well you used vocabulary words in context
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-card rounded-lg p-3 shadow-sm flex items-center gap-3 border border-border">
                <div className="w-12 h-12 rounded-full bg-green-600 dark:bg-green-500 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">{correctPercentage}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Accuracy</span>
                  <span className="text-sm font-medium">{correctAnswers} of {sentenceFeedback.length}</span>
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
              Personalized Feedback
            </h3>
            <p className="leading-relaxed">{overallFeedback}</p>
          </div>

          {/* Individual Word Feedback */}
          <div className="pt-2">
            <h3 className="font-medium mb-4 flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
              Detailed Sentence Analysis
            </h3>
            <Accordion type="single" collapsible className="w-full bg-card rounded-xl divide-y divide-border">
              {sentenceFeedback.map((item, index) => (
                <AccordionItem value={`item-${index}`} key={index} className="border-0">
                  <AccordionTrigger className="py-5 px-6 hover:no-underline hover:bg-muted/50 rounded-t-xl">
                    <div className="flex items-center w-full">
                      <div className="mr-4">
                        {item.isCorrect ? (
                          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                            <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                        ) : (
                          <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
                            <X className="h-5 w-5 text-red-600 dark:text-red-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <span className="font-semibold">{item.word}</span>
                      </div>
                      <Badge className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${getQualityColor(item.usageQuality)}`}>
                        {item.usageQuality}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-5">
                    <div className="space-y-4 pl-12 pt-2">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Your sentence:</h4>
                        <p className="text-base bg-muted/50 p-3 rounded-lg border border-border">"{item.sentence}"</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2">Feedback:</h4>
                        <p className="text-base">{item.feedback}</p>
                      </div>
                      {item.improvementSuggestions && item.improvementSuggestions.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Suggestions for improvement:</h4>
                          <ul className="space-y-2">
                            {item.improvementSuggestions.map((suggestion, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                <span>{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {item.exampleUsage && (
                        <div className="bg-muted border border-border p-4 rounded-lg">
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                            Example Usage:
                          </h4>
                          <p className="text-base italic">"{item.exampleUsage}"</p>
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
            onClick={() => router.push("/learn-practice")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Practice
          </Button>
          <Button 
            onClick={() => router.push("/learn-practice/sentence-usage")}
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

export default VocabularyFeedback