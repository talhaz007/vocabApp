"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Calendar, BarChart3, PieChart, TrendingUp, BookOpen, Award, ArrowRight, ChevronRight, Pencil } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getUserStats } from "@/lib/stats-service"

// Mock data for the dashboard
const stats = {
  wordsLearned: 42,
  wordsInProgress: 18,
  totalWords: 100,
  streak: 7,
  accuracy: 78,
  lastWeekProgress: [5, 8, 3, 7, 10, 6, 3],
  categories: {
    synonyms: { mastered: 12, total: 25 },
    antonyms: { mastered: 8, total: 20 },
    academic: { mastered: 15, total: 30 },
    idioms: { mastered: 7, total: 25 },
  },
  recentWords: [
    { word: "Eloquent", mastered: true, lastPracticed: "2 days ago" },
    { word: "Ephemeral", mastered: false, lastPracticed: "1 day ago" },
    { word: "Perseverance", mastered: true, lastPracticed: "3 days ago" },
    { word: "Ubiquitous", mastered: false, lastPracticed: "Today" },
    { word: "Serendipity", mastered: true, lastPracticed: "4 days ago" },
  ],
  achievements: [
    { name: "Word Master", description: "Learn 50 words", progress: 84, icon: BookOpen },
    { name: "Perfect Streak", description: "7 days in a row", progress: 100, icon: TrendingUp },
    { name: "Pronunciation Pro", description: "Perfect pronunciation 10 times", progress: 60, icon: Award },
  ],
}

export default function DashboardPage() {
  const [timeframe, setTimeframe] = useState<"week" | "month" | "all">("week")
  const [stats, setStats] = useState({
    wordsLearned: 0,
    streak: 0,
    totalExercises: 0,
    totalPoints: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load stats when component mounts
    async function loadStats() {
      try {
        setIsLoading(true);
        const userStats = await getUserStats();
        setStats({
          wordsLearned: userStats.wordsLearned,
          streak: userStats.streak,
          totalExercises: userStats.totalExercises,
          totalPoints: userStats.totalPoints,
        });
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadStats();
  }, []);

  return (
    <div className="container py-8">
      {/* Welcome Section */}
      <section className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Vocabulary</h1>
        <p className="text-muted-foreground max-w-[600px] mx-auto">
          Enhance your vocabulary with flashcards, mnemonics, adaptive learning, and progress feedback.
        </p>
      </section>

      {/* Learning Tools Section */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Learning Modes</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle>Learn and Practice</CardTitle>
              <CardDescription></CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside">
                <li>Flashcards</li>
                <li>Sentence Usage</li>
                <li>Word Association </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/learn-practice" className="w-full">
                <Button className="w-full">
                  Start Learning
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle>Memory</CardTitle>
              <CardDescription></CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside">
                  <li>Memory Palace</li>
                  <li>Sound Mnemonics </li>
                  <li>Chunking </li>
                </ul>
            </CardContent>
            <CardFooter>
              <Link href="/memory" className="w-full">
                <Button className="w-full" variant="outline">
                  Practice Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader>
              <CardTitle>Speaking and Listening</CardTitle>
              <CardDescription></CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside">
                  <li>Pronunciation Feedback</li>
                  <li>Audio Learning </li>
                  <li>Speaking Challenges</li>
                  <li>Shadowing Practice</li>
                </ul>
            </CardContent>
            <CardFooter>
              <Link href="/speaking-listening" className="w-full">
                <Button className="w-full" variant="outline">
                  Start Speaking
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardHeader>
              <CardTitle>Writing Prompts</CardTitle>
              <CardDescription></CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside">
                  <li>Creative Writing</li>
                  <li>Real-time Feedback</li>
                  <li>Writing Exercises</li>
                </ul>
            </CardContent>
            <CardFooter>
              <Link href="/writing-prompts" className="w-full">
                <Button className="w-full" variant="outline">
                  Start Writing
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </section>

      <Separator className="my-8" />

      {/* Stats Overview Section */}
      <section className="mb-12">
        {/* <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Your Progress</h2>
          <div className="flex items-center gap-2 bg-muted p-1 rounded-md">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTimeframe("week")}
              className={timeframe === "week" ? "bg-background shadow-sm" : ""}
            >
              Week
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTimeframe("month")}
              className={timeframe === "month" ? "bg-background shadow-sm" : ""}
            >
              Month
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTimeframe("all")}
              className={timeframe === "all" ? "bg-background shadow-sm" : ""}
            >
              All Time
            </Button>
          </div>
        </div> */}
        <h2 className="text-2xl font-bold mb-6">Stats</h2>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-r from-blue-100 to-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Words Learned</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-6 w-12 bg-muted animate-pulse rounded" />
              ) : (
                <div className="text-2xl font-bold">{stats.wordsLearned}</div>
              )}
              {/* <p className="text-xs text-muted-foreground">
                +5 from last week
              </p> */}
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-100 to-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-6 w-12 bg-muted animate-pulse rounded" />
              ) : (
                <div className="text-2xl font-bold">{stats.streak} days</div>
              )}
              <p className="text-xs text-muted-foreground">
                Keep practicing daily!
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-100 to-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Exercises Completed</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-6 w-12 bg-muted animate-pulse rounded" />
              ) : (
                <div className="text-2xl font-bold">{stats.totalExercises}</div>
              )}
              <p className="text-xs text-muted-foreground">
                Across all learning modes
              </p>
            </CardContent>
          </Card>
          
          {/* <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-6 w-12 bg-muted animate-pulse rounded" />
              ) : (
                <div className="text-2xl font-bold">{stats.totalPoints}</div>
              )}
              <p className="text-xs text-muted-foreground">
                Earn more by completing exercises
              </p>
            </CardContent>
          </Card> */}
        </div>
      </section>

      {/* Detailed Analytics Section */}
      {/* <section> */}
        {/* <h2 className="text-2xl font-bold mb-6">Detailed Analytics</h2>
        <Tabs defaultValue="progress" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="progress">Learning Progress</TabsTrigger>
            <TabsTrigger value="recent">Recent Words</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {stats?.categories && Object.entries(stats.categories)?.map(([category, data]) => (
                <Card key={category} className="overflow-hidden">
                  <div
                    className="h-1 bg-gradient-to-r from-primary to-primary/20"
                    style={{ width: `${(data.mastered / data.total) * 100}%` }}
                  />
                  <CardHeader>
                    <CardTitle className="capitalize">{category}</CardTitle>
                    <CardDescription>
                      {data.mastered} of {data.total} words mastered
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Progress value={(data.mastered / data.total) * 100} className="h-2" />
                    <div className="flex justify-between mt-2">
                      <p className="text-sm text-muted-foreground">
                        {Math.round((data.mastered / data.total) * 100)}% complete
                      </p>
                      <p className="text-sm font-medium">{data.total - data.mastered} remaining</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div> */}

            {/* <Card>
              <CardHeader>
                <CardTitle>Weekly Activity</CardTitle>
                <CardDescription>Words learned in the past week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-end gap-2">
                  {stats.lastWeekProgress.map((count, index) => (
                    <div key={index} className="relative flex-1 group">
                      <div
                        className="absolute inset-x-0 bottom-0 bg-primary rounded-t-md transition-all duration-300 group-hover:opacity-80"
                        style={{ height: `${(count / Math.max(...stats.lastWeekProgress)) * 100}%` }}
                      />
                      <div className="absolute inset-x-0 bottom-0 flex justify-center -mb-6">
                        <span className="text-xs font-medium">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-8 text-xs text-muted-foreground">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </CardContent>
            </Card> */}
          {/* </TabsContent>

          <TabsContent value="recent">
            <Card>
              <CardHeader>
                <CardTitle>Recently Practiced Words</CardTitle>
                <CardDescription>Your most recent learning activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.recentWords?.map((word) => (
                    <div
                      key={word.word}
                      className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${word.mastered ? "bg-green-500" : "bg-yellow-500"}`} />
                        <div>
                          <p className="font-medium">{word.word}</p>
                          <p className="text-xs text-muted-foreground">Last practiced: {word.lastPracticed}</p>
                        </div>
                      </div>
                      <Badge variant={word.mastered ? "default" : "outline"}>
                        {word.mastered ? "Mastered" : "In Progress"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements">
            <div className="grid gap-6 md:grid-cols-3">
              {stats?.achievements?.map((achievement) => (
                <Card key={achievement.name} className="overflow-hidden">
                  <div
                    className="h-1 bg-gradient-to-r from-primary to-primary/20"
                    style={{ width: `${achievement.progress}%` }}
                  />
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <achievement.icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{achievement.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-3">{achievement.description}</CardDescription>
                    <Progress value={achievement.progress} className="h-2" />
                    <div className="flex justify-between mt-2">
                      <p className="text-sm text-muted-foreground">{achievement.progress}% complete</p>
                      {achievement.progress === 100 && <Badge variant="default">Completed</Badge>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section> */}
    </div>
  )
}