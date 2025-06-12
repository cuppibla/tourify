
"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2, Download } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface VideoDisplayProps {
  videoSrc: string;
  description: string;
  locationName: string;
}

export function VideoDisplay({ videoSrc, description, locationName }: VideoDisplayProps) {
  const { toast } = useToast();

  const handleShare = async () => {
    if (!navigator.share) {
      toast({
        title: "Share Not Supported",
        description: "Web Share API is not supported in your browser. Try downloading the video.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(videoSrc);
      const blob = await response.blob();
      let fileName = 'tour-video.mp4'; // Default filename
      const mimeTypeParts = blob.type.split('/');
      if (mimeTypeParts[0] === 'video' && mimeTypeParts[1]) {
        fileName = `tour-video.${mimeTypeParts[1]}`;
      }
      
      const file = new File([blob], fileName, { type: blob.type });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Video Tour of ${locationName}`,
          text: `Check out this AI-generated video tour of ${locationName}: ${description}`,
        });
        toast({ title: "Video Shared!", description: "The video tour has been shared." });
      } else {
         // Fallback for browsers that canShare files: false but still have navigator.share
        await navigator.share({
          title: `Video Tour of ${locationName}`,
          text: `Check out this AI-generated video tour of ${locationName}: ${description}. (Video attached if supported by target app)`,
          // url: window.location.href, // Could share URL to current page if video was viewable by link
        });
        toast({ title: "Shared information!", description: "Video details shared. Direct video file sharing might not be supported with the chosen app." });
      }
    } catch (error: any) {
      console.error('Error sharing video:', error);
      toast({
        title: "Sharing Failed",
        description: error.message || "Could not share the video at this time.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = videoSrc;
    
    let fileName = 'tour-video.mp4';
    // Try to infer extension from data URI MIME type
    const match = videoSrc.match(/^data:(video\/[^;]+);base64,/);
    if (match && match[1]) {
        const extension = match[1].split('/')[1];
        if (extension) fileName = `tour-video.${extension}`;
    }

    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Download Started", description: "Your video tour is downloading." });
  };

  return (
    <Card className="w-full max-w-lg mt-8 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Your Video Tour of {locationName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-video border rounded-md overflow-hidden bg-muted">
          <video src={videoSrc} controls className="w-full h-full" preload="metadata">
            Your browser does not support the video tag.
          </video>
        </div>
        <CardDescription className="font-body text-base">{description}</CardDescription>
        <div className="flex space-x-4">
          <Button onClick={handleShare} variant="outline" className="flex-1">
            <Share2 className="mr-2 h-4 w-4" /> Share Video
          </Button>
          <Button onClick={handleDownload} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
            <Download className="mr-2 h-4 w-4" /> Download Video
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
