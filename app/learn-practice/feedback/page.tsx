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
        <Card className="shadow-lg border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="text-2xl">
              {processing ? "Generating your feedback..." : "Loading your feedback..."}
            </CardTitle>
            <CardDescription className="text-slate-600">
              {processing ? "Please wait while we analyze your practice session" : "Please wait while we load your results"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
            <p className="text-slate-500 animate-pulse">
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
        <Card className="shadow-lg border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Brain className="h-6 w-6 text-amber-500" />
              No feedback available
            </CardTitle>
            <CardDescription className="text-slate-600">
              Complete a practice session to see your personalized feedback and progress.
            </CardDescription>
          </CardHeader>
          <CardContent className="py-8 flex flex-col items-center">
            <div className="mb-6 text-center max-w-md">
              <p className="text-slate-600 mb-4">
                Practice using vocabulary words in sentences to receive detailed feedback on your usage
                and suggestions for improvement.
              </p>
            </div>
            <Button 
              size="lg"
              onClick={() => router.push("/learn-practice")}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
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
      case "excellent": return "bg-gradient-to-r from-green-50 to-emerald-50 text-emerald-700 border-emerald-200"
      case "good": return "bg-gradient-to-r from-blue-50 to-sky-50 text-blue-700 border-blue-200"
      case "fair": return "bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border-amber-200"
      case "poor": return "bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-200"
      default: return "bg-gradient-to-r from-slate-50 to-gray-50 text-slate-700 border-slate-200"
    }
  }

  // Helper function for progress bar color
  const getProgressColor = (score) => {
    if (score >= 80) return "bg-gradient-to-r from-green-500 to-emerald-500"
    if (score >= 60) return "bg-gradient-to-r from-blue-500 to-sky-500"
    if (score >= 40) return "bg-gradient-to-r from-amber-500 to-yellow-500"
    return "bg-gradient-to-r from-red-500 to-rose-500"
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
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          Your Vocabulary Results
        </h1>
      </div>

      <Card className="shadow-lg border-0 overflow-hidden">
        <CardHeader className="pb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <CardTitle className="text-2xl text-slate-800">Practice Results</CardTitle>
              <CardDescription className="text-slate-600 mt-1">
                See how well you used vocabulary words in context
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {/* <div className="bg-white rounded-lg p-3 shadow-sm flex items-center gap-3 border">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">{vocabularyMastery}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500">Mastery Score</span>
                  <span className="font-medium text-slate-800">{getMasteryLevel(vocabularyMastery)}</span>
                </div>
              </div> */}
              <div className="bg-white rounded-lg p-3 shadow-sm flex items-center gap-3 border">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">{correctPercentage}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500">Accuracy</span>
                  <span className="text-sm font-medium text-slate-800">{correctAnswers} of {sentenceFeedback.length}</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 p-6">
          {/* Mastery Progress */}
          {/* <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center">
              <h3 className="font-medium flex items-center gap-2">
                <Brain className="h-5 w-5 text-indigo-500" />
                <span>Vocabulary Mastery</span>
              </h3>
              <span className="text-sm font-medium bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md">
                {vocabularyMastery}%
              </span>
            </div>
            <Progress 
              value={vocabularyMastery} 
              className="h-3 rounded-full bg-slate-100"
              indicatorClassName={getProgressColor(vocabularyMastery)}
            />
            <p className="text-sm text-slate-500">{getMasteryLevel(vocabularyMastery)} level - {100-vocabularyMastery}% to reach the next level</p>
          </div> */}

          {/* Overall Feedback */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 shadow-sm">
            <h3 className="font-medium mb-3 flex items-center gap-2 text-slate-800">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              Personalized Feedback
            </h3>
            <p className="text-slate-700 leading-relaxed">{overallFeedback}</p>
          </div>

          {/* Individual Word Feedback */}
          <div className="pt-2">
            <h3 className="font-medium mb-4 flex items-center gap-2 text-slate-800 text-lg">
              <BookOpen className="h-5 w-5 text-indigo-500" />
              Detailed Sentence Analysis
            </h3>
            <Accordion type="single" collapsible className="w-full bg-white rounded-xl divide-y">
              {sentenceFeedback.map((item, index) => (
                <AccordionItem value={`item-${index}`} key={index} className="border-0">
                  <AccordionTrigger className="py-5 px-6 hover:no-underline hover:bg-slate-50 rounded-t-xl">
                    <div className="flex items-center w-full">
                      <div className="mr-4">
                        {item.isCorrect ? (
                          <div className="bg-green-100 p-2 rounded-full">
                            <Check className="h-5 w-5 text-green-600" />
                          </div>
                        ) : (
                          <div className="bg-red-100 p-2 rounded-full">
                            <X className="h-5 w-5 text-red-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <span className="font-semibold text-slate-800">{item.word}</span>
                      </div>
                      <Badge className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${getQualityColor(item.usageQuality)}`}>
                        {item.usageQuality}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-5">
                    <div className="space-y-4 pl-12 pt-2">
                      <div>
                        <h4 className="text-sm font-medium mb-2 text-slate-700">Your sentence:</h4>
                        <p className="text-base bg-slate-50 p-3 rounded-lg border border-slate-200">"{item.sentence}"</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2 text-slate-700">Feedback:</h4>
                        <p className="text-base text-slate-700">{item.feedback}</p>
                      </div>
                      {item.improvementSuggestions && item.improvementSuggestions.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2 text-slate-700">Suggestions for improvement:</h4>
                          <ul className="space-y-2">
                            {item.improvementSuggestions.map((suggestion, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-slate-700">{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {item.exampleUsage && (
                        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                          <h4 className="text-sm font-medium mb-2 text-slate-700 flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-indigo-500" />
                            Example Usage:
                          </h4>
                          <p className="text-base text-slate-700 italic">"{item.exampleUsage}"</p>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </CardContent>

        <CardFooter className="py-5 px-6 border-t bg-gradient-to-r from-slate-50 to-gray-50 flex flex-col sm:flex-row gap-3 justify-between">
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
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 gap-2"
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