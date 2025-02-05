import { NextResponse } from 'next/server';
import { fal } from "@fal-ai/client";

export async function POST(request: Request) {
    try {
        const { prompt } = await request.json();

        if (!prompt) {
            return NextResponse.json({ message: 'Prompt is required' }, { status: 400 });
        }

        if (!process.env.FAL_KEY) {
            console.error('FAL_KEY environment variable is missing');
            return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
        }

        // Configure FAL client
        fal.config({
            credentials: process.env.FAL_KEY
        });

        console.log('Making request to FAL API...');
        const result = await fal.subscribe("fal-ai/flux/schnell", {
            input: {
                prompt,
                image_size: "landscape_4_3",
                num_inference_steps: 4,
                num_images: 1,
                enable_safety_checker: true
            }
        });

        console.log('Received response from FAL API');
        if (!result.data) {
            throw new Error('No data received from FAL API');
        }

        return NextResponse.json(result.data);
    } catch (error) {
        console.error('Error in generate-image API:', error);
        return NextResponse.json({ 
            message: 'Failed to generate image',
            error: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
} 