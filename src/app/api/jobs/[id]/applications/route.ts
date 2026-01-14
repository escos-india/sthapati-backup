import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { JobModel } from "@/models/Job";
import { ApplicationModel } from "@/models/Application";
import { getUserByEmail } from "@/lib/users";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const user = await getUserByEmail(session.user.email);
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        await connectDB();

        const { id: jobId } = await params;

        // Find the job
        const job = await JobModel.findById(jobId);
        if (!job) {
            return NextResponse.json({ message: "Job not found" }, { status: 404 });
        }

        // Check if the current user is the job poster
        if (job.posted_by.toString() !== user._id.toString()) {
            return NextResponse.json(
                { message: "You are not authorized to view applications for this job" },
                { status: 403 }
            );
        }

        // Fetch applications for this job with applicant details
        const applications = await ApplicationModel.find({ job: jobId })
            .populate("applicant", "name image email headline category phone location")
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json(applications);
    } catch (error) {
        console.error("Error fetching applications:", error);
        return NextResponse.json(
            { message: "Failed to fetch applications" },
            { status: 500 }
        );
    }
}
