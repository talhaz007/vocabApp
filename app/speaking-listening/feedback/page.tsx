"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Check, X, ArrowLeft, Award, Mic, Loader2, Sparkles, Headphones, CheckCircle2, Edit, CheckSquare, FileText, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Breadcrumb } from "@/components/breadcrumb"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

// App recommendation metadata
const appMetadata = {
  "Grammarly": {
    icon: "pencil",
    url: "http://textly.scholarlytraining.com/",
    color: "blue"
  },
  "Spelling Pro": {
    icon: "check-square",
    url: "http://textly.scholarlytraining.com/",
    color: "green"
  },
  "Writely": {
    icon: "file-text",
    url: "http://textly.scholarlytraining.com/",
    color: "purple"
  },
  "Readly": {
    icon: "book-open",
    url: "https://readly.scholarlytraining.com/dashboard",
    color: "amber"
  },
  "Speakify": {
    icon: "mic",
    url: "https://speakify.scholarlytraining.com/",
    color: "red"
  }
};

const SpeakingListeningFeedback = () => {
  const router = useRouter()
  const [feedbackData, setFeedbackData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const { toast } = useToast()
  
  useEffect(() => {
    // Get feedback data or savedExercises from localStorage
    const storedFeedback = localStorage.getItem('speakingListeningFeedback')
    const savedExercises = localStorage.getItem('savedSpeakingListeningExercises')
    
    if (storedFeedback) {
      try {
        const parsedData = JSON.parse(storedFeedback)
        setFeedbackData(parsedData)
        // Clear the localStorage after retrieving the data to avoid stale data on refreshes
        localStorage.removeItem('speakingListeningFeedback')
        setLoading(false)
      } catch (error) {
        console.error("Error parsing feedback data:", error)
        setLoading(false)
      }
    } else if (savedExercises) {
      // If we have saved exercises but no feedback yet, process them
      try {
        setProcessing(true)
        const parsedExercises = JSON.parse(savedExercises)
        
        // Call the API to process the exercises
        fetch('/api/feedback/speaking-listening', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ savedExercises: parsedExercises })
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to process feedback')
          }
          return response.json()
        })
        .then(data => {
          setFeedbackData(data)
          localStorage.removeItem('savedSpeakingListeningExercises') // Clear saved exercises
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
        console.error("Error parsing saved exercises:", error)
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
            { label: "Speaking & Listening", href: "/speaking-listening", active: false },
            { label: "Feedback", href: "/speaking-listening/feedback", active: true },
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
              {processing ? "Analyzing your speaking and listening skills..." : "Almost there..."}
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
            { label: "Speaking & Listening", href: "/speaking-listening", active: false },
            { label: "Feedback", href: "/speaking-listening/feedback", active: true },
          ]}
        />
        <Card className="shadow-lg border border-border">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Headphones className="h-6 w-6 text-amber-500 dark:text-amber-400" />
              No feedback available
            </CardTitle>
            <CardDescription>
              Complete a speaking or listening practice session to see your personalized feedback and progress.
            </CardDescription>
          </CardHeader>
          <CardContent className="py-8 flex flex-col items-center">
            <div className="mb-6 text-center max-w-md">
              <p className="text-muted-foreground mb-4">
                Practice pronunciation, shadowing, audio learning, or speaking challenges to receive detailed feedback on your skills
                and suggestions for improvement.
              </p>
            </div>
            <Button 
              size="lg"
              onClick={() => router.push("/speaking-listening")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Start Practicing
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { exerciseFeedback, overallFeedback, speakingListeningScore } = feedbackData

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
    switch (quality?.toLowerCase()) {
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

  // Helper function for exercise type icons
  const getExerciseTypeIcon = (type) => {
    switch (type) {
      case "pronunciation":
        return <Mic className="h-5 w-5 text-blue-500 dark:text-blue-400" />
      case "shadowing":
        return <Headphones className="h-5 w-5 text-purple-500 dark:text-purple-400" />
      case "audioLearning":
        return <Headphones className="h-5 w-5 text-green-500 dark:text-green-400" />
      case "speakingChallenge":
        return <Mic className="h-5 w-5 text-amber-500 dark:text-amber-400" />
      default:
        return <Mic className="h-5 w-5 text-primary" />
    }
  }

  // Helper function for exercise type labels
  const getExerciseTypeLabel = (type) => {
    switch (type) {
      case "pronunciation":
        return "Pronunciation"
      case "shadowing":
        return "Shadowing"
      case "audioLearning":
        return "Audio Learning"
      case "speakingChallenge":
        return "Speaking Challenge"
      default:
        return type
    }
  }

  // Count correct answers
  const correctExercises = exerciseFeedback.filter(item => item.isCorrect).length
  const correctPercentage = Math.round((correctExercises / exerciseFeedback.length) * 100)

  return (
    <div className="container max-w-4xl py-12 space-y-8">
      <Breadcrumb
        items={[
          { label: "Speaking & Listening", href: "/speaking-listening", active: false },
          { label: "Feedback", href: "/speaking-listening/feedback", active: true },
        ]}
      />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">
          Your Speaking & Listening Results
        </h1>
      </div>

      <Card className="shadow-lg border border-border">
        <CardHeader className="pb-6 border-b border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <CardTitle className="text-2xl">Practice Results</CardTitle>
              <CardDescription className="mt-1">
                See how well you performed in speaking and listening exercises
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-card rounded-lg p-3 shadow-sm flex items-center gap-3 border border-border">
                <div className="w-12 h-12 rounded-full bg-green-600 dark:bg-green-500 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">{correctPercentage}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Accuracy</span>
                  <span className="text-sm font-medium">{correctExercises} of {exerciseFeedback.length}</span>
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
            
            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                  <span className="font-medium">Speaking & Listening Mastery:</span>
                  <span className="font-bold">{getMasteryLevel(speakingListeningScore)}</span>
                </div>
                <div className="w-full sm:w-48">
                  <Progress 
                    value={speakingListeningScore} 
                    className={`h-2 ${
                      speakingListeningScore >= 80 ? "bg-green-600" : 
                      speakingListeningScore >= 60 ? "bg-blue-600" : 
                      speakingListeningScore >= 40 ? "bg-amber-600" : "bg-red-600"
                    }`} 
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-muted-foreground">Beginner</span>
                    <span className="text-xs font-medium">{speakingListeningScore}/100</span>
                    <span className="text-xs text-muted-foreground">Expert</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* App Recommendations Section */}
          {feedbackData?.appRecommendations && feedbackData.appRecommendations.length > 0 && (
            <div className="bg-muted/50 p-6 rounded-xl border border-border shadow-sm mt-8">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                Recommended Apps for You
              </h3>
              <p className="mb-6">Based on your performance, these apps can help you improve further:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {feedbackData.appRecommendations.map((recommendation, index) => {
                  const app = appMetadata[recommendation.appName];
                  let AppIcon;
                  let iconColor;
                  
                  // Determine which icon to use
                  switch (app.icon) {
                    case "pencil":
                      AppIcon = Edit;
                      iconColor = "text-blue-500";
                      break;
                    case "check-square":
                      AppIcon = CheckSquare;
                      iconColor = "text-green-500";
                      break;
                    case "file-text":
                      AppIcon = FileText;
                      iconColor = "text-purple-500";
                      break;
                    case "book-open":
                      AppIcon = BookOpen;
                      iconColor = "text-amber-500";
                      break;
                    case "mic":
                      AppIcon = Mic;
                      iconColor = "text-red-500";
                      break;
                    default:
                      AppIcon = Sparkles;
                      iconColor = "text-indigo-500";
                  }
                  
                  return (
                    <Card key={index} className="overflow-hidden">
                      <div className="flex items-start p-4">
                        <div className="bg-primary/10 p-3 rounded-full mr-4">
                          <AppIcon className={`h-5 w-5 ${iconColor}`} />
                        </div>
                        <div>
                          <h4 className="font-semibold">{recommendation.appName}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{recommendation.reason}</p>
                        </div>
                      </div>
                      <CardFooter className="bg-muted/30 px-4 py-3 border-t">
                        <a 
                          href={app.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center"
                        >
                          Try {recommendation.appName} <ArrowRight className="h-3 w-3 ml-1" />
                        </a>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Individual Exercise Feedback */}
          <div className="pt-2">
            <h3 className="font-medium mb-4 flex items-center gap-2 text-lg">
              <Headphones className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
              Detailed Exercise Analysis
            </h3>
            <Accordion type="single" collapsible className="w-full bg-card rounded-xl divide-y divide-border">
              {exerciseFeedback.map((item, index) => (
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
                      <div className="flex-1 text-left flex items-center gap-2">
                        {getExerciseTypeIcon(item.exerciseType)}
                        <span className="font-semibold">{getExerciseTypeLabel(item.exerciseType)}</span>
                        {item.word && <span className="text-muted-foreground">- {item.word}</span>}
                      </div>
                      {item.usageQuality && (
                        <Badge className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${getQualityColor(item.usageQuality)}`}>
                          {item.usageQuality}
                        </Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-5">
                    <div className="space-y-4 pl-12 pt-2">
                      {item.text && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Exercise content:</h4>
                          <p className="text-base bg-muted/50 p-3 rounded-lg border border-border">"{item.text}"</p>
                        </div>
                      )}
                      
                      {item.detectedWords && item.detectedWords.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Words detected:</h4>
                          <div className="flex flex-wrap gap-2">
                            {item.detectedWords.map((word, i) => (
                              <Badge key={i} variant="outline" className="bg-muted/50">
                                {word}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
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
            onClick={() => router.push("/speaking-listening")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Speaking & Listening
          </Button>
          <Button 
            onClick={() => router.push("/speaking-listening/pronunciation")}
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

export default SpeakingListeningFeedback 