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
    media: z.array(z.object({
        url: z.string().min(1),
        type: z.enum(['image', 'video'])
    })).min(1, "At least one image is required per project"),
});

const gallerySchema = z.object({
    url: z.string().min(1),
    type: z.enum(['image', 'video']),
    title: z.string().optional()
});

const profileSchema = z.object({
    name: z.string().min(1),
    image: z.string().min(1, "Profile picture is required"),
    cover_image: z.string().min(1, "Cover image is required"),
    headline: z.string().min(1, "Headline is required").max(220),
    bio: z.string().min(1, "Bio is required").max(2600),
    email: z.string().email("Valid email is required"),
    phone: z.string().min(10, "Valid phone number is required"),
    location: z.object({
        city: z.string().min(1, "City is required"),
        country: z.string().min(1, "Country is required"),
        address: z.string().min(1, "Address is required"),
    }),
    projects: z.array(projectSchema).min(1, "At least one project is required"),
    gallery: z.array(gallerySchema).min(1, "At least one gallery item is required"),
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

        // Update Fields
        if (updateData.name) user.name = updateData.name;
        if (updateData.image) user.image = updateData.image;
        if (updateData.cover_image) user.cover_image = updateData.cover_image;
        if (updateData.headline) user.headline = updateData.headline;
        if (updateData.bio) user.bio = updateData.bio;
        if (updateData.phone) user.phone = updateData.phone;

        if (updateData.location) {
            user.location = { ...user.location, ...updateData.location };
        }

        if (updateData.projects) {
            user.projects = updateData.projects;
        }

        if (updateData.gallery) {
            user.gallery = updateData.gallery;
        }

        if (updateData.coa_number) {
            user.coa_number = updateData.coa_number;
        }

        if (updateData.certificatesStatus) {
            user.certificatesStatus = updateData.certificatesStatus;
        }

        if (updateData.specialization) {
            user.specialization = updateData.specialization;
        }

        if (updateData.resume) {
            user.resume = updateData.resume;
        }

        if (updateData.materials) {
            user.materials = updateData.materials;
        }

        let isComplete = false;

        if (complete) {
            // Student Exemption
            if (user.category === 'Student') {
                // Student Mandatory Fields: All except Gallery
                if (!user.image || !user.cover_image || !user.headline || !user.bio || !user.phone ||
                    !user.location?.city || !user.location?.country || !user.location?.address ||
                    !user.projects?.length || !user.certificatesStatus || !user.specialization || !user.resume) {
                    return NextResponse.json({
                        error: "Profile incomplete",
                        details: "Students must complete all fields including certificates, specialization, and resume. Gallery is optional."
                    }, { status: 400 });
                }
                isComplete = true;
            } else {
                // Strict Validation for Non-Students
                try {
                    profileSchema.parse({
                        name: user.name,
                        image: user.image,
                        cover_image: user.cover_image,
                        headline: user.headline,
                        bio: user.bio,
                        email: user.email,
                        phone: user.phone,
                        location: user.location,
                        projects: user.projects,
                        gallery: user.gallery || [],
                        coa_number: user.coa_number
                    });

                    // Architect Specific
                    if (user.category === 'Architect' && !user.coa_number) {
                        throw new Error("Architects must provide a COA Number.");
                    }

                    isComplete = true;

                } catch (validationError) {
                    return NextResponse.json({
                        error: "Profile incomplete",
                        details: validationError instanceof z.ZodError ? validationError.errors : (validationError as any).message
                    }, { status: 400 });
                }
            }
        }

        // Update Status
        if (isComplete) {
            user.isProfileComplete = true;
        } else if (complete === false) {
            // Re-validate to check if it's STILL complete (e.g. user removed a field)
            // If user is Student, it's always complete if they say so? 
            // Or should we allow them to be incomplete? 
            // Let's stick to: if they were complete, and they remove a mandatory field, they become incomplete.

            if (user.category === 'Student') {
                // Students stay complete unless they explicitly want to un-complete? 
                // Actually, for students, there are no mandatory fields, so they are always "technically" complete if they want to be.
                // But we only set isProfileComplete=true when they click "Complete".
                // If they are just saving, we don't change status unless we want to auto-downgrade.
                // Let's leave it as is for now.
            } else {
                try {
                    profileSchema.parse({
                        name: user.name,
                        image: user.image,
                        cover_image: user.cover_image,
                        headline: user.headline,
                        bio: user.bio,
                        email: user.email,
                        phone: user.phone,
                        location: user.location,
                        projects: user.projects,
                        gallery: user.gallery || [],
                        coa_number: user.coa_number
                    });
                    if (user.category === 'Architect' && !user.coa_number) throw new Error();
                    // Still valid
                } catch (e) {
                    user.isProfileComplete = false;
                }
            }
        }

        await user.save();

        return NextResponse.json({ success: true, user });

    } catch (error) {
        console.error("Profile Update Error:", error);
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}
