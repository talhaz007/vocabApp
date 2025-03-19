"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Check, X, ArrowLeft, Award, Brain, Loader2, Sparkles, Building, CheckCircle2,
  Edit, CheckSquare, FileText, BookOpen, ArrowRight, Mic
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Breadcrumb } from "@/components/breadcrumb"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"

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

const MemoryFeedback = () => {
  const router = useRouter()
  const [feedbackData, setFeedbackData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const { toast } = useToast()
  
  useEffect(() => {
    // Get feedback data or savedExercises from localStorage
    const storedFeedback = localStorage.getItem('memoryFeedback')
    const savedExercises = localStorage.getItem('savedMemoryExercises')
    
    if (storedFeedback) {
      try {
        const parsedData = JSON.parse(storedFeedback)
        setFeedbackData(parsedData)
        // Clear the localStorage after retrieving the data to avoid stale data on refreshes
        localStorage.removeItem('memoryFeedback')
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
        fetch('/api/feedback/memory', {
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
          // Store the feedback data in localStorage first
          localStorage.setItem('memoryFeedback', JSON.stringify(data))
          // Clear saved exercises
          localStorage.removeItem('savedMemoryExercises')
          
          // Update state AFTER localStorage operations
          setFeedbackData(data)
          setProcessing(false)
          setLoading(false)
        })
        .catch(error => {
          console.error("Error fetching feedback:", error)
          toast({
            title: "Error",
            description: "Failed to generate feedback. Please try again.",
            variant: "destructive",
          })
          setProcessing(false)
          setLoading(false)
        })
      } catch (error) {
        console.error("Error processing saved exercises:", error)
        setProcessing(false)
        setLoading(false)
      }
    } else {
      // No data available
      setLoading(false)
    }
  }, [toast])

  if (loading || processing) {
    return (
      <div className="container max-w-4xl py-12 space-y-8">
        <Breadcrumb items={[
          { label: "Memory", href: "/memory", active: false },
          { label: "Feedback", href: "/memory/feedback", active: true }
        ]} />
        
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            {processing ? "Analyzing your memory exercises..." : "Loading feedback..."}
          </h2>
          <p className="text-muted-foreground text-center max-w-md">
            Retrieving your memory exercise feedback.
          </p>
        </div>
      </div>
    )
  }

  if (!feedbackData) {
    return (
      <div className="container max-w-4xl py-12 space-y-8">
        <Breadcrumb items={[
          { label: "Memory", href: "/memory", active: false },
          { label: "Feedback", href: "/memory/feedback", active: true }
        ]} />
        
        <Card className="shadow-lg border border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Brain className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Feedback Available</h2>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              You haven't completed any memory exercises yet. Try some exercises to get personalized feedback.
            </p>
            <Button onClick={() => router.push("/memory")}>
              Go to Memory Exercises
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-12 space-y-8">
      <Breadcrumb items={[
        { label: "Memory", href: "/memory", active: false },
        { label: "Feedback", href: "/memory/feedback", active: true }
      ]} />
      
      <div
      >
        <h1 className="text-3xl font-bold">Memory Exercise Feedback</h1>
      </div>

      <Card className="shadow-lg border border-border">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            Memory Performance
          </CardTitle>
          <CardDescription>
            Analysis of your memory techniques and retention skills
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8 p-6">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="bg-muted/50 rounded-lg p-6 flex flex-col items-center justify-center w-full md:w-1/3">
              <h3 className="text-lg font-medium mb-2">Memory Score</h3>
              <div className="relative w-32 h-32 mb-2">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle 
                    className="text-muted stroke-current" 
                    strokeWidth="10" 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    fill="transparent"
                  />
                  <circle 
                    className="text-primary stroke-current" 
                    strokeWidth="10" 
                    strokeLinecap="round" 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - feedbackData.memoryScore / 100)}`}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold">{feedbackData.memoryScore}</span>
                </div>
              </div>
              <p className="text-sm text-center text-muted-foreground">
                {feedbackData.memoryScore >= 90 ? "Excellent" : 
                 feedbackData.memoryScore >= 75 ? "Good" : 
                 feedbackData.memoryScore >= 60 ? "Fair" : "Needs Improvement"}
              </p>
            </div>
            
            <div className="w-full md:w-2/3 bg-muted/30 p-6 rounded-lg border border-border">
              <h3 className="font-medium mb-3">Overall Feedback</h3>
              <p className="text-base">{feedbackData.overallFeedback}</p>
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
          
          <div className="space-y-4">
            <h3 className="font-medium">Exercise Details</h3>
            <Accordion type="single" collapsible className="w-full">
              {feedbackData.exerciseFeedback.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      {item.isCorrect ? (
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                          <Check className="h-3 w-3 mr-1" /> Correct
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-200">
                          <X className="h-3 w-3 mr-1" /> Needs Improvement
                        </Badge>
                      )}
                      <span>
                        {item.exerciseType === "soundMnemonic" ? "Sound Mnemonic" : 
                         item.exerciseType === "memoryPalace" ? "Memory Palace" : 
                         "Chunking"} - {item.word || ""}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4 px-4">
                    <div className="space-y-4">
                      {item.word && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Word:</h4>
                          <p className="text-base font-medium">{item.word}</p>
                        </div>
                      )}
                      
                      {item.mnemonic && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Mnemonic:</h4>
                          <p className="text-base">{item.mnemonic}</p>
                        </div>
                      )}
                      
                      {item.definition && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Definition:</h4>
                          <p className="text-base">{item.definition}</p>
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
            onClick={() => router.push("/memory")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Memory
          </Button>
          <Button 
            onClick={() => router.push("/memory/sound-mnemonics")}
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

export default MemoryFeedback 