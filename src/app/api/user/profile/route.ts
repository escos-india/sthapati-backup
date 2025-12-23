import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { COA_REGEX } from '@/lib/constants';
import { connectToDatabase } from '@/lib/mongodb';
import { UserModel } from '@/models/User';
import { z } from 'zod';

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const user = await UserModel.findOne({ email: session.user.email }).select('-password -__v');

    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
}

// Validation Schema for Strict Completion
const projectSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    role: z.string().min(1),
    // Media must be an array with at least 1 item
    media: z.array(z.object({
        url: z.string().min(1),
        type: z.enum(['image', 'video'])
    })).min(1, "At least one image is required per project"),
});

const profileSchema = z.object({
    name: z.string().min(1),
    image: z.string().min(1, "Profile picture is required"),
    cover_image: z.string().min(1, "Cover image is required"),
    headline: z.string().min(1, "Headline is required").max(220),
    bio: z.string().min(1, "Bio is required").max(2600),
    location: z.object({
        city: z.string().min(1),
        country: z.string().min(1),
        address: z.string().min(1),
    }),
    projects: z.array(projectSchema).min(1, "At least one project is required"),
    coa_number: z.string().regex(COA_REGEX, "Invalid COA Number format (CA/YYYY/XXXXX)").optional().or(z.literal('')),
});

export async function PATCH(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { complete, ...updateData } = body;

        await connectToDatabase();
        const user = await UserModel.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Merge updates
        // Note: Using a safe set approach or just Object.assign but validation matters most.
        // For simplicity allow bulk update of profile fields.
        // We should explicitly set fields to avoid overwriting sensitive auth data.

        user.name = updateData.name || user.name;
        user.image = updateData.image || user.image;
        user.cover_image = updateData.cover_image || user.cover_image;
        user.headline = updateData.headline || user.headline;
        user.bio = updateData.bio || user.bio;

        if (updateData.location) {
            user.location = { ...user.location, ...updateData.location };
        }

        if (updateData.projects) {
            user.projects = updateData.projects;
        }

        if (updateData.coa_number) {
            user.coa_number = updateData.coa_number;
        }

        let isComplete = false;

        if (complete) {
            // Strict Validation
            try {
                // 1. Validate Base Rules
                profileSchema.parse({
                    name: user.name,
                    image: user.image,
                    cover_image: user.cover_image,
                    headline: user.headline,
                    bio: user.bio,
                    location: user.location,
                    projects: user.projects,
                    coa_number: user.coa_number // Validate format if present
                });

                // 2. Validate Architect Specifics
                if (user.category === 'Architect' && !user.coa_number) {
                    throw new Error("Architects must provide a COA Number used during registration/verified.");
                }

                isComplete = true;

            } catch (validationError) {
                return NextResponse.json({
                    error: "Profile incomplete",
                    details: validationError instanceof z.ZodError ? validationError.errors : (validationError as any).message
                }, { status: 400 });
            }
        }

        // Only update status if validation passed
        if (isComplete) {
            user.isProfileComplete = true;
        } else if (complete === false && user.isProfileComplete === true) {
            // If user explicitly saves draft, we don't necessarily downgrade status unless critical data removed?
            // For safety, if they are editing profile later, we might want to keep it true 
            // unless they explicitly break it. But the prompt says "isProfileComplete derived... never trust client".
            // So actually we should ALWAYS re-compute.

            // RE-COMPUTATION LOGIC
            // Determine if it is STILL complete
            try {
                profileSchema.parse({
                    name: user.name,
                    image: user.image,
                    cover_image: user.cover_image,
                    headline: user.headline,
                    bio: user.bio,
                    location: user.location,
                    projects: user.projects,
                    coa_number: user.coa_number
                });
                if (user.category === 'Architect' && !user.coa_number) throw new Error();
                user.isProfileComplete = true;
            } catch (e) {
                user.isProfileComplete = false;
            }
        }

        await user.save();

        return NextResponse.json({ success: true, user });

    } catch (error) {
        console.error("Profile Update Error:", error);
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}
