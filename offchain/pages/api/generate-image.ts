import type { NextApiRequest, NextApiResponse } from 'next';
import { fal } from "@fal-ai/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ message: 'Prompt is required' });
    }

    try {
        fal.config({
            credentials: process.env.FAL_KEY
        });

        const result = await fal.subscribe("fal-ai/flux/schnell", {
            input: {
                prompt,
                image_size: "landscape_4_3",
                num_inference_steps: 4,
                num_images: 1,
                enable_safety_checker: true
            }
        });

        return res.status(200).json(result.data);
    } catch (error) {
        console.error('Error generating image:', error);
        return res.status(500).json({ message: 'Failed to generate image' });
    }
} 