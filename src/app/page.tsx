
"use client";

import React, { useState, useEffect } from 'react';
import { TourForm } from '@/components/TourForm';
import { VideoDisplay } from '@/components/VideoDisplay';
import { generateVideoTour, type GenerateVideoTourOutput } from '@/ai/flows/generate-video-tour';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoResult, setVideoResult] = useState<GenerateVideoTourOutput | null>(null);
  const [currentLocation, setCurrentLocation] = useState<string>("");
  const [isClient, setIsClient] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleFormSubmit = async (photoDataUri: string, location: string) => {
    setIsLoading(true);
    setError(null);
    setVideoResult(null);
    setCurrentLocation(location);

    try {
      const result = await generateVideoTour({ photoDataUri, location });
      setVideoResult(result);
      toast({
        title: "Video Tour Generated!",
        description: `Your video tour for ${location} is ready.`,
      });
    } catch (err: any) {
      console.error("Error generating video tour:", err);
      const errorMessage = err.message || "Failed to generate video tour. Please try again.";
      setError(errorMessage);
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isClient) {
    // Render a loading state or null during SSR and pre-hydration
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8">
        <Card className="w-full max-w-lg animate-pulse">
          <CardHeader>
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="h-6 bg-muted rounded w-1/4"></div>
              <div className="h-10 bg-muted rounded w-full"></div>
            </div>
            <div className="space-y-2">
              <div className="h-6 bg-muted rounded w-1/4"></div>
              <div className="h-10 bg-muted rounded w-full"></div>
            </div>
            <div className="h-12 bg-muted rounded w-full"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8 selection:bg-accent selection:text-accent-foreground">
      <TourForm onSubmit={handleFormSubmit} isLoading={isLoading} />

      {error && (
        <Alert variant="destructive" className="mt-8 w-full max-w-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {videoResult && (
        <VideoDisplay
          videoSrc={videoResult.videoDataUri}
          description={videoResult.description}
          locationName={currentLocation}
        />
      )}
       <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Tourify. Create amazing video tours with AI.</p>
      </footer>
    </main>
  );
}
