"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Home, Building2, Library, MapPin, ArrowRight, Check, X, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Breadcrumb } from "@/components/breadcrumb"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

interface PalaceLocation {
  id: string
  name: string
  description: string
  image: string
}

interface PalaceWord {
  id: string
  word: string
  definition: string
  locationId: string
  visualDescription: string
}

// Sample palace themes
const palaceThemes = [
  {
    id: "house",
    name: "House",
    locations: [
      {
        id: "kitchen",
        name: "Kitchen",
        description: "A warm, busy kitchen with appliances and a central island.",
        image: "/placeholder.svg?height=100&width=100",
      },
      {
        id: "bedroom",
        name: "Bedroom",
        description: "A peaceful bedroom with a bed, nightstand, and window.",
        image: "/placeholder.svg?height=100&width=100",
      },
      {
        id: "bathroom",
        name: "Bathroom",
        description: "A clean bathroom with a shower, sink, and mirror.",
        image: "/placeholder.svg?height=100&width=100",
      },
      {
        id: "livingroom",
        name: "Living Room",
        description: "A cozy living room with a sofa, TV, and fireplace.",
        image: "/placeholder.svg?height=100&width=100",
      },
    ],
  },
  {
    id: "library",
    name: "Library",
    locations: [
      {
        id: "entrance",
        name: "Entrance",
        description: "Grand entrance with a reception desk and directory.",
        image: "/placeholder.svg?height=100&width=100",
      },
      {
        id: "fiction",
        name: "Fiction Section",
        description: "Rows of fiction books with comfortable reading nooks.",
        image: "/placeholder.svg?height=100&width=100",
      },
      {
        id: "reference",
        name: "Reference Section",
        description: "Tall shelves with encyclopedias and reference materials.",
        image: "/placeholder.svg?height=100&width=100",
      },
      {
        id: "study",
        name: "Study Area",
        description: "Quiet study area with tables, chairs, and desk lamps.",
        image: "/placeholder.svg?height=100&width=100",
      },
    ],
  },
  {
    id: "city",
    name: "City",
    locations: [
      {
        id: "park",
        name: "Park",
        description: "A green park with trees, benches, and a fountain.",
        image: "/placeholder.svg?height=100&width=100",
      },
      {
        id: "museum",
        name: "Museum",
        description: "An elegant museum with exhibits and artwork.",
        image: "/placeholder.svg?height=100&width=100",
      },
      {
        id: "cafe",
        name: "Café",
        description: "A bustling café with tables, chairs, and a counter.",
        image: "/placeholder.svg?height=100&width=100",
      },
      {
        id: "office",
        name: "Office Building",
        description: "A tall office building with a lobby and elevators.",
        image: "/placeholder.svg?height=100&width=100",
      },
    ],
  },
]

// Sample vocabulary words
const vocabularyWords = [
  {
    id: "1",
    word: "Eloquent",
    definition: "Fluent or persuasive in speaking or writing",
    locationId: "",
    visualDescription: "",
  },
  { id: "2", word: "Ephemeral", definition: "Lasting for a very short time", locationId: "", visualDescription: "" },
  {
    id: "3",
    word: "Perseverance",
    definition: "Persistence in doing something despite difficulty",
    locationId: "",
    visualDescription: "",
  },
  {
    id: "4",
    word: "Ubiquitous",
    definition: "Present, appearing, or found everywhere",
    locationId: "",
    visualDescription: "",
  },
  {
    id: "5",
    word: "Serendipity",
    definition: "The occurrence of events by chance in a happy or beneficial way",
    locationId: "",
    visualDescription: "",
  },
]

export default function MemoryPalacePage() {
  const [selectedTheme, setSelectedTheme] = useState<string>("house")
  const [currentPhase, setCurrentPhase] = useState<"setup" | "placement" | "recall">("setup")
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentLocationIndex, setCurrentLocationIndex] = useState(0)
  const [placedWords, setPlacedWords] = useState<PalaceWord[]>([])
  const [userAnswer, setUserAnswer] = useState("")
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [progress, setProgress] = useState(0)
  const { toast } = useToast()

  const theme = palaceThemes.find((theme) => theme.id === selectedTheme)!
  const currentWord = vocabularyWords[currentWordIndex]
  const currentLocation = theme.locations[currentLocationIndex]

  useEffect(() => {
    if (currentPhase === "placement") {
      setProgress((currentWordIndex / vocabularyWords.length) * 100)
    } else if (currentPhase === "recall") {
      setProgress((currentWordIndex / placedWords.length) * 100)
    }
  }, [currentPhase, currentWordIndex, placedWords.length])

  const handleThemeSelect = (value: string) => {
    setSelectedTheme(value)
  }

  const startPlacement = () => {
    setCurrentPhase("placement")
    setCurrentWordIndex(0)
    setCurrentLocationIndex(0)
    setPlacedWords([])
    setProgress(0)

    toast({
      title: "Memory Palace Setup",
      description: `You've selected the ${theme.name} theme. Let's start placing words!`,
    })
  }

  const placeWord = (locationId: string, visualDescription: string) => {
    const newPlacedWord = {
      ...currentWord,
      locationId,
      visualDescription,
    }

    setPlacedWords([...placedWords, newPlacedWord])

    if (currentWordIndex < vocabularyWords.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1)
      // Optionally move to next location
      if (currentLocationIndex < theme.locations.length - 1) {
        setCurrentLocationIndex(currentLocationIndex + 1)
      } else {
        setCurrentLocationIndex(0) // Loop back to first location
      }
    } else {
      // All words placed, move to recall phase
      setCurrentPhase("recall")
      setCurrentWordIndex(0)
      setProgress(0)

      toast({
        title: "Placement Complete",
        description: "Now let's test your recall of the words in your memory palace!",
      })
    }
  }

  const handlePlaceSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const visualDescription = (form.elements.namedItem("visualDescription") as HTMLInputElement).value

    if (!visualDescription.trim()) {
      toast({
        title: "Description needed",
        description: "Please provide a visual description to help you remember this word.",
        variant: "destructive",
      })
      return
    }

    placeWord(currentLocation.id, visualDescription)
    form.reset()
  }

  const handleRecallSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const currentPlacedWord = placedWords[currentWordIndex]
    const isAnswerCorrect = userAnswer.toLowerCase().trim() === currentPlacedWord.word.toLowerCase()

    setIsCorrect(isAnswerCorrect)

    if (isAnswerCorrect) {
      toast({
        title: "Correct!",
        description: "You've successfully recalled the word!",
      })
    } else {
      toast({
        title: "Not quite right",
        description: "Try using the hint to help you remember.",
        variant: "destructive",
      })
    }
  }

  const handleNextRecall = () => {
    if (currentWordIndex < placedWords.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1)
      setUserAnswer("")
      setIsCorrect(null)
      setShowHint(false)
    } else {
      // Exercise complete
      toast({
        title: "Memory Palace Complete!",
        description: "You've completed the memory palace exercise.",
      })

      // Reset for a new session
      setCurrentPhase("setup")
    }
  }

  const getCurrentLocationForRecall = () => {
    const currentPlacedWord = placedWords[currentWordIndex]
    return theme.locations.find((loc) => loc.id === currentPlacedWord.locationId)!
  }

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <Breadcrumb
        items={[
          { label: "Memory", href: "/memory", active: false },
          { label: "Memory Palace", href: "/memory/memory-palace", active: true },
        ]}
      />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Memory Palace</h1>
        {currentPhase !== "setup" && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {currentWordIndex + 1} of {currentPhase === "placement" ? vocabularyWords.length : placedWords.length}
            </span>
            <Progress value={progress} className="w-32" />
          </div>
        )}
      </div>

      {currentPhase === "setup" && (
        <Card>
          <CardHeader>
            <CardTitle>Choose Your Memory Palace</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="theme" className="text-sm font-medium">
                Select a theme for your memory palace:
              </label>
              <Select value={selectedTheme} onValueChange={handleThemeSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a theme" />
                </SelectTrigger>
                <SelectContent>
                  {palaceThemes.map((theme) => (
                    <SelectItem key={theme.id} value={theme.id}>
                      {theme.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {theme.locations.map((location) => (
                <div key={location.id} className="border rounded-md p-3 text-center">
                  <div className="flex justify-center mb-2">
                    {location.id === "kitchen" && <Home className="h-8 w-8 text-amber-500" />}
                    {location.id === "bedroom" && <Home className="h-8 w-8 text-blue-500" />}
                    {location.id === "bathroom" && <Home className="h-8 w-8 text-cyan-500" />}
                    {location.id === "livingroom" && <Home className="h-8 w-8 text-green-500" />}
                    {location.id === "entrance" && <Library className="h-8 w-8 text-purple-500" />}
                    {location.id === "fiction" && <Library className="h-8 w-8 text-indigo-500" />}
                    {location.id === "reference" && <Library className="h-8 w-8 text-blue-500" />}
                    {location.id === "study" && <Library className="h-8 w-8 text-teal-500" />}
                    {location.id === "park" && <MapPin className="h-8 w-8 text-green-500" />}
                    {location.id === "museum" && <Building2 className="h-8 w-8 text-amber-500" />}
                    {location.id === "cafe" && <Building2 className="h-8 w-8 text-red-500" />}
                    {location.id === "office" && <Building2 className="h-8 w-8 text-blue-500" />}
                  </div>
                  <h3 className="font-medium text-sm">{location.name}</h3>
                </div>
              ))}
            </div>

            <div className="bg-muted p-4 rounded-md mt-4">
              <h3 className="font-medium mb-2">How Memory Palace Works</h3>
              <p className="text-sm text-muted-foreground">
                You'll place vocabulary words in different locations within your memory palace. For each word, create a
                vivid mental image that connects the word to the location. Later, you'll mentally walk through your
                palace to recall the words.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={startPlacement} className="w-full">
              Start Building Your Memory Palace
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {currentPhase === "placement" && (
        <Card>
          <CardHeader>
            <CardTitle>Place Words in Your Memory Palace</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="word" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="word">Word Information</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
              </TabsList>
              <TabsContent value="word" className="space-y-4 pt-4">
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-medium text-lg mb-1">{currentWord.word}</h3>
                  <p className="text-muted-foreground">{currentWord.definition}</p>
                </div>
                <p className="text-sm">
                  Imagine how you would visualize this word in the {currentLocation.name}. Create a vivid, memorable
                  mental image that connects the word to this location.
                </p>
              </TabsContent>
              <TabsContent value="location" className="space-y-4 pt-4">
                <div className="flex items-center gap-4">
                  <div className="bg-muted rounded-md p-4 flex items-center justify-center">
                    {currentLocation.id.includes("kitchen") && <Home className="h-12 w-12 text-amber-500" />}
                    {currentLocation.id.includes("bedroom") && <Home className="h-12 w-12 text-blue-500" />}
                    {currentLocation.id.includes("bathroom") && <Home className="h-12 w-12 text-cyan-500" />}
                    {currentLocation.id.includes("livingroom") && <Home className="h-12 w-12 text-green-500" />}
                    {currentLocation.id.includes("entrance") && <Library className="h-12 w-12 text-purple-500" />}
                    {currentLocation.id.includes("fiction") && <Library className="h-12 w-12 text-indigo-500" />}
                    {currentLocation.id.includes("reference") && <Library className="h-12 w-12 text-blue-500" />}
                    {currentLocation.id.includes("study") && <Library className="h-12 w-12 text-teal-500" />}
                    {currentLocation.id.includes("park") && <MapPin className="h-12 w-12 text-green-500" />}
                    {currentLocation.id.includes("museum") && <Building2 className="h-12 w-12 text-amber-500" />}
                    {currentLocation.id.includes("cafe") && <Building2 className="h-12 w-12 text-red-500" />}
                    {currentLocation.id.includes("office") && <Building2 className="h-12 w-12 text-blue-500" />}
                  </div>
                  <div>
                    <h3 className="font-medium">{currentLocation.name}</h3>
                    <p className="text-sm text-muted-foreground">{currentLocation.description}</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <form onSubmit={handlePlaceSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="visualDescription" className="text-sm font-medium">
                  Describe how you visualize "{currentWord.word}" in the {currentLocation.name}:
                </label>
                <Textarea
                  id="visualDescription"
                  name="visualDescription"
                  placeholder="Describe your mental image in detail..."
                  className="min-h-[100px]"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Place Word & Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {currentPhase === "recall" && (
        <Card>
          <CardHeader>
            <CardTitle>Recall Words from Your Memory Palace</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-medium mb-2">You are now in the {getCurrentLocationForRecall().name}</h3>
              <p>{getCurrentLocationForRecall().description}</p>
            </div>

            <form onSubmit={handleRecallSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="answer" className="text-sm font-medium">
                  What word did you place in this location?
                </label>
                <Input
                  id="answer"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type the word you remember..."
                  className={
                    isCorrect === true
                      ? "border-green-500 focus-visible:ring-green-500"
                      : isCorrect === false
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                  }
                  disabled={isCorrect === true}
                />
              </div>

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowHint(true)}
                  disabled={showHint || isCorrect === true}
                >
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Show Hint
                </Button>

                {isCorrect !== true && (
                  <Button type="submit" disabled={!userAnswer.trim()}>
                    Check Answer
                  </Button>
                )}
              </div>
            </form>

            {showHint && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-md">
                <h3 className="font-medium text-amber-800 mb-1">Hint</h3>
                <p className="text-amber-700">You visualized: {placedWords[currentWordIndex].visualDescription}</p>
                <p className="text-amber-700 mt-2">The word means: {placedWords[currentWordIndex].definition}</p>
              </div>
            )}

            {isCorrect === true && (
              <div className="flex items-center gap-2 text-green-600 mt-4">
                <Check className="h-5 w-5" />
                <span>Correct! The word is "{placedWords[currentWordIndex].word}".</span>
              </div>
            )}

            {isCorrect === false && (
              <div className="flex items-center gap-2 text-red-600 mt-4">
                <X className="h-5 w-5" />
                <span>Not quite right. Try using the hint to help you remember.</span>
              </div>
            )}
          </CardContent>
          <CardFooter>
            {isCorrect === true && (
              <Button onClick={handleNextRecall} className="w-full">
                Continue to Next Location
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

