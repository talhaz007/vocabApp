"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Check, X, ArrowLeft, Award, BookOpen, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Breadcrumb } from "@/components/breadcrumb"
import { useToast } from "@/hooks/use-toast"

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
      <div className="container max-w-4xl py-8 space-y-6">
        <Breadcrumb
          items={[
            { label: "Learn & Practice", href: "/learn-practice", active: false },
            { label: "Feedback", href: "/learn-practice/feedback", active: true },
          ]}
        />
        <Card>
          <CardHeader>
            <CardTitle>
              {processing ? "Generating feedback..." : "Loading feedback..."}
            </CardTitle>
            <CardDescription>
              {processing ? "Please wait while we generate your feedback" : "Please wait while we load your feedback"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!feedbackData) {
    return (
      <div className="container max-w-4xl py-8 space-y-6">
        <Breadcrumb
          items={[
            { label: "Learn & Practice", href: "/learn-practice", active: false },
            { label: "Feedback", href: "/learn-practice/feedback", active: true },
          ]}
        />
        <Card>
          <CardHeader>
            <CardTitle>No feedback available</CardTitle>
            <CardDescription>
              Please complete your practice to see feedback.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/learn-practice")}>
              Return to Practice
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const { sentenceFeedback, overallFeedback } = feedbackData
  // Extract vocabulary mastery score from the overallFeedback
  const masteryScoreMatch = overallFeedback.match(/Vocabulary Mastery Score: (\d+)/)
  const vocabularyMastery = masteryScoreMatch ? parseInt(masteryScoreMatch[1]) : 0

  // Helper function for quality colors
  const getQualityColor = (quality) => {
    switch (quality.toLowerCase()) {
      case "excellent": return "bg-green-100 text-green-800 border-green-200"
      case "good": return "bg-blue-100 text-blue-800 border-blue-200"
      case "fair": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "poor": return "bg-red-100 text-red-800 border-red-200"
      default: return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }

  // Helper function for progress bar color
  const getProgressColor = (score) => {
    if (score >= 80) return "bg-green-600"
    if (score >= 60) return "bg-blue-600"
    if (score >= 40) return "bg-yellow-600"
    return "bg-red-600"
  }

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <Breadcrumb
        items={[
          { label: "Learn & Practice", href: "/learn-practice", active: false },
          { label: "Feedback", href: "/learn-practice/feedback", active: true },
        ]}
      />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Practice Feedback</h1>
      </div>

      <Card className="w-full">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">Vocabulary Practice Results</CardTitle>
              <CardDescription>
                See how well you used the vocabulary words in sentences
              </CardDescription>
            </div>
            {/* <div className="flex flex-col items-center">
              <Award className="h-10 w-10 text-amber-500 mb-1" />
              <span className="text-2xl font-bold">{vocabularyMastery}</span>
              <span className="text-xs text-muted-foreground">Mastery Score</span>
            </div> */}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Mastery Progress */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Vocabulary Mastery</h3>
              {/* <span className="text-sm">{vocabularyMastery}%</span> */}
            </div>
            <Progress 
              value={vocabularyMastery} 
              className="h-2"
              indicatorClassName={getProgressColor(vocabularyMastery)}
            />
          </div>

          {/* Overall Feedback */}
          <div className="bg-slate-50 p-4 rounded-md border">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Overall Feedback
            </h3>
            <p className="text-slate-700">{overallFeedback}</p>
          </div>

          {/* Individual Word Feedback */}
          <div>
            <h3 className="font-medium mb-2">Sentence Analysis</h3>
            <Accordion type="single" collapsible className="w-full">
              {sentenceFeedback.map((item, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="py-4 px-4 hover:no-underline">
                    <div className="flex items-center w-full">
                      <div className="mr-3">
                        {item.isCorrect ? (
                          <div className="bg-green-100 p-1 rounded-full">
                            <Check className="h-4 w-4 text-green-600" />
                          </div>
                        ) : (
                          <div className="bg-red-100 p-1 rounded-full">
                            <X className="h-4 w-4 text-red-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <span className="font-medium">{item.word}</span>
                      </div>
                      <Badge className={`ml-2 ${getQualityColor(item.usageQuality)}`}>
                        {item.usageQuality}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-3 pl-8">
                      <div>
                        <h4 className="text-sm font-medium mb-1">Your sentence:</h4>
                        <p className="text-sm bg-slate-50 p-2 rounded border">"{item.sentence}"</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-1">Feedback:</h4>
                        <p className="text-sm">{item.feedback}</p>
                      </div>
                      {item.improvementSuggestions && item.improvementSuggestions.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Suggestions for improvement:</h4>
                          <ul className="list-disc pl-5 text-sm space-y-1">
                            {item.improvementSuggestions.map((suggestion, i) => (
                              <li key={i}>{suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {item.exampleUsage && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Example Usage:</h4>
                          <p className="text-sm italic">"{item.exampleUsage}"</p>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </CardContent>

        <CardFooter className="pt-4 flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => router.push("/learn-practice")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Practice
          </Button>
          <Button 
            onClick={() => router.push("/learn-practice/sentence-usage")}
          >
            Practice Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default VocabularyFeedback