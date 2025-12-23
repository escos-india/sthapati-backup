"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2 } from "lucide-react";

import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileInfo } from "@/components/profile/profile-info";
import { ProfileAbout } from "@/components/profile/profile-about";
import { ProfileProjects } from "@/components/profile/profile-projects";
import { COA_REGEX } from "@/lib/constants";

// Types
interface ProfileProject {
    title: string;
    description: string;
    role: string;
    location: string;
    year: string;
    budget_range: string;
    tags: string;
    media: { url: string; type: 'image' | 'video' }[];
}

interface EditProfileFormState {
    name: string;
    phone?: string;
    email?: string;
    image: string;
    cover_image: string;
    headline: string;
    bio: string;
    location: {
        city: string;
        state: string;
        country: string;
        address: string;
    };
    coa_number?: string;
    projects: ProfileProject[];
}

export default function EditProfilePage() {
    const router = useRouter();
    const { data: session, status, update } = useSession();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [profile, setProfile] = useState<EditProfileFormState>({
        name: "",
        phone: "",
        email: "",
        image: "",
        cover_image: "",
        headline: "",
        bio: "",
        location: { city: "", state: "", country: "", address: "" },
        coa_number: "",
        projects: []
    });

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }

        if (session?.user) {
            setProfile(prev => ({
                ...prev,
                name: session.user?.name || "",
                email: session.user?.email || "",
                image: session.user?.image || "",
            }));
            fetchProfile();
        }
    }, [session, status]);

    const fetchProfile = async () => {
        try {
            const res = await fetch("/api/user/profile");
            if (res.ok) {
                const data = await res.json();
                setProfile(prev => ({ ...prev, ...data }));
            }
        } catch (error) {
            console.error("Failed to fetch profile");
        }
    };

    // Generic Save Function
    const saveProfile = async (updatedProfile: EditProfileFormState, complete: boolean = false) => {
        // Validate COA if present
        if (updatedProfile.coa_number && !COA_REGEX.test(updatedProfile.coa_number)) {
            toast({
                title: "Invalid COA Number",
                description: "Format must be CA/YYYY/XXXXX",
                variant: "destructive"
            });
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch("/api/user/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...updatedProfile, complete }),
            });

            if (!res.ok) throw new Error("Failed to save");

            const data = await res.json();
            setProfile(updatedProfile); // Update local state with latest

            if (complete) {
                await update(); // Refresh session
                toast({ title: "Profile Completed!", description: "Welcome to your dashboard." });
                router.push("/dashboard");
            } else {
                toast({ title: "Saved", description: "Changes saved successfully." });
            }
        } catch (error) {
            toast({ title: "Error", description: "Could not save profile.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    // Component Handlers
    const handleImageUpdate = (url: string) => {
        const newProfile = { ...profile, image: url };
        setProfile(newProfile); // Optimistic update
        saveProfile(newProfile);
    };

    const handleCoverUpdate = (url: string) => {
        const newProfile = { ...profile, cover_image: url };
        setProfile(newProfile);
        saveProfile(newProfile);
    };

    const handleInfoUpdate = (headline: string, location: any) => {
        const newProfile = { ...profile, headline, location };
        setProfile(newProfile);
        saveProfile(newProfile);
    };

    const handleAboutUpdate = (bio: string) => {
        const newProfile = { ...profile, bio };
        setProfile(newProfile);
        saveProfile(newProfile);
    };

    const handleProjectsUpdate = (projects: ProfileProject[]) => {
        const newProfile = { ...profile, projects };
        setProfile(newProfile);
        saveProfile(newProfile);
    };

    // Completion Logic
    const isBasicValid = profile.name && profile.image && profile.headline;
    // Cover image optional? LinkedIn usually has default. But our requirements said "Profile Header (PFP + Cover)". Let's make Cover mandatory for "Complete" status if previously enforced.
    // Previous code: isBasicValid = ... && profile.cover_image ...
    const isCoverValid = !!profile.cover_image;
    const isDetailsValid = profile.location.city && profile.location.country && profile.bio && profile.location.address;
    const isProjectValid = profile.projects.length > 0 && profile.projects.every(p => p.title && p.description && p.media.length > 0);

    const canFinish = isBasicValid && isCoverValid && isDetailsValid && isProjectValid;

    // Calculate Percentage
    const totalSteps = 5; // PFP, Cover, Headline/Info, Bio, Projects
    let completedSteps = 0;
    if (profile.image) completedSteps++;
    if (profile.cover_image) completedSteps++;
    if (profile.headline && profile.location.city) completedSteps++;
    if (profile.bio) completedSteps++;
    if (isProjectValid) completedSteps++;

    const progress = Math.round((completedSteps / totalSteps) * 100);

    if (status === "loading") return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-cyan-500" /></div>;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 font-sans transition-colors duration-300">
            {/* Sticky Header */}
            <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4 shadow-sm">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Edit Profile</h1>
                        <p className="text-xs text-slate-500">Profile Completion: <span className="font-medium text-cyan-600">{progress}%</span></p>
                    </div>
                    <Button
                        onClick={() => saveProfile(profile, true)}
                        disabled={!canFinish || isSaving}
                        className={`min-w-[140px] ${canFinish ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-400 cursor-not-allowed'} text-white shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]`}
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                        {canFinish ? "Complete" : "Incomplete"}
                    </Button>
                </div>
                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800">
                    <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 md:px-0 pt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* 1. Header & Identity + 2. Basic Info (Merged) */}
                <div className="flex flex-col">
                    <ProfileHeader
                        cover_image={profile.cover_image}
                        onCoverChange={handleCoverUpdate}
                    />
                    <ProfileInfo
                        name={profile.name}
                        headline={profile.headline}
                        location={profile.location}
                        image={profile.image}
                        onImageChange={handleImageUpdate}
                        onSave={handleInfoUpdate}
                    />
                </div>

                {/* 3. About Section */}
                <ProfileAbout
                    bio={profile.bio}
                    onSave={handleAboutUpdate}
                />

                {/* 4. Projects Section */}
                <ProfileProjects
                    projects={profile.projects}
                    onUpdate={handleProjectsUpdate}
                />

                <div className="h-12"></div> {/* Spacer */}
            </div>
        </div>
    );
}

// Helper icon
function X({ className }: { className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18" /><path d="m6 6 18 18" /></svg>;
}
