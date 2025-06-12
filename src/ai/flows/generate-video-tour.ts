'use server';

/**
 * @fileOverview Generates a video tour from an image and location.
 *
 * - generateVideoTour - A function that generates a video tour.
 * - GenerateVideoTourInput - The input type for the generateVideoTour function.
 * - GenerateVideoTourOutput - The return type for the generateVideoTour function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateVideoTourInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the location, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  location: z.string().describe('The name of the location to generate a video tour for.'),
});
export type GenerateVideoTourInput = z.infer<typeof GenerateVideoTourInputSchema>;

const GenerateVideoTourOutputSchema = z.object({
  videoDataUri: z.string().describe('The generated video data URI.'),
  description: z.string().describe('A description of the location.'),
});
export type GenerateVideoTourOutput = z.infer<typeof GenerateVideoTourOutputSchema>;

export async function generateVideoTour(input: GenerateVideoTourInput): Promise<GenerateVideoTourOutput> {
  return generateVideoTourFlow(input);
}

const locationDescriptionPrompt = ai.definePrompt({
  name: 'locationDescriptionPrompt',
  input: {schema: GenerateVideoTourInputSchema},
  output: {schema: z.object({description: z.string()})},
  prompt: `You are a tour guide. Provide a short description of the following location: {{{location}}}. Be concise.`,
});

const generateVideoTourFlow = ai.defineFlow(
  {
    name: 'generateVideoTourFlow',
    inputSchema: GenerateVideoTourInputSchema,
    outputSchema: GenerateVideoTourOutputSchema,
  },
  async input => {
    const {output: locationDescriptionOutput} = await locationDescriptionPrompt(input);

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: [
        {media: {url: input.photoDataUri}},
        {
          text:
            `Generate a video tour of the location in the image. The location is ${input.location}. Description of the location: ${locationDescriptionOutput?.description}`,
        },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    return {videoDataUri: media.url, description: locationDescriptionOutput?.description!};
  }
);
