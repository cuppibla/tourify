
"use client";

import React, { useState, useRef, ChangeEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, UploadCloud, MapPin, Loader2, Sparkles, Film } from 'lucide-react';
import Image from 'next/image';

interface TourFormProps {
  onSubmit: (photoDataUri: string, location: string) => void;
  isLoading: boolean;
}

const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export function TourForm({ onSubmit, isLoading }: TourFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("Image size should be less than 5MB.");
        setImageFile(null);
        setImagePreview(null);
        return;
      }
      setError(null);
      setImageFile(file);
      try {
        const dataUri = await fileToDataUri(file);
        setImagePreview(dataUri);
      } catch (err) {
        setError("Failed to load image preview.");
        setImagePreview(null);
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!imageFile) {
      setError("Please select an image.");
      return;
    }
    if (!location.trim()) {
      setError("Please enter a location.");
      return;
    }
    setError(null);
    try {
      const photoDataUri = await fileToDataUri(imageFile);
      onSubmit(photoDataUri, location);
    } catch (err) {
      setError("Failed to process image.");
    }
  };

  return (
    <Card className="w-full max-w-lg shadow-xl">
      <CardHeader>
        <div className="flex items-center space-x-2 mb-2">
          <Film className="h-8 w-8 text-primary" />
          <CardTitle className="text-3xl font-headline">Tourify</CardTitle>
        </div>
        <CardDescription className="font-body">
          Upload a photo and enter a location to generate an AI video tour.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="image-upload" className="flex items-center space-x-1 font-semibold">
              <UploadCloud className="h-5 w-5" />
              <span>Upload Image or Use Camera</span>
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                <UploadCloud className="mr-2 h-4 w-4" /> Upload Photo
              </Button>
              <Input
                id="image-upload-file"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <Button type="button" variant="outline" onClick={() => cameraInputRef.current?.click()}>
                <Camera className="mr-2 h-4 w-4" /> Take Photo
              </Button>
              <Input
                id="image-upload-camera"
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            {imagePreview && (
              <div className="mt-4 border rounded-md overflow-hidden aspect-video relative">
                <Image src={imagePreview} alt="Selected preview" layout="fill" objectFit="contain" data-ai-hint="landmark building" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center space-x-1 font-semibold">
              <MapPin className="h-5 w-5" />
              <span>Location</span>
            </Label>
            <Input
              id="location"
              type="text"
              placeholder="e.g., Eiffel Tower, Paris or Your Favorite Cafe"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              className="text-base"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-lg py-3" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-5 w-5" />
            )}
            {isLoading ? 'Generating Tour...' : 'Generate Video Tour'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
