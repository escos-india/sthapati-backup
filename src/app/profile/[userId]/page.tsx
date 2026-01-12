import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { PostModel } from "@/models/Post";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardFeed } from "@/components/dashboard/dashboard-feed";
import { DashboardRightPanel } from "@/components/dashboard/dashboard-right-panel";

export default async function ProfilePage({ params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params;

    try {
        await connectDB();
        const rawUser = await UserModel.findById(userId)
            .select("-password -verificationToken -resetPasswordToken")
            .lean();

        if (!rawUser) {
            redirect("/");
            return null;
        }

        // Get article count
        const articleCount = await PostModel.countDocuments({ author: userId });

        const user = JSON.parse(JSON.stringify({
            ...rawUser,
            articleCount,
        }));

        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Left Sidebar */}
                        <div className="lg:col-span-3">
                            <DashboardSidebar user={user} readOnly={true} />
                        </div>

                        {/* Main Feed */}
                        <div className="lg:col-span-6">
                            <DashboardFeed user={user} readOnly={true} />
                        </div>

                        {/* Right Panel */}
                        <div className="lg:col-span-3">
                            <DashboardRightPanel user={user} readOnly={true} />
                        </div>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error("Error loading profile:", error);
        redirect("/");
        return null;
    }
}
