import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ApplicationModel } from "@/models/Application";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserModel } from "@/models/User";

export async function POST(req: Request) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const user = await UserModel.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const body = await req.json();
        const { jobId, resume, coverLetter } = body;

        if (!jobId || !resume) {
            return NextResponse.json({ message: "Job ID and Resume are required" }, { status: 400 });
        }

        // Check if already applied
        const existingApplication = await ApplicationModel.findOne({
            job: jobId,
            applicant: user._id
        });

        if (existingApplication) {
            return NextResponse.json({ message: "You have already applied for this job" }, { status: 400 });
        }

        const application = await ApplicationModel.create({
            job: jobId,
            applicant: user._id,
            resume,
            coverLetter
        });

        return NextResponse.json(application, { status: 201 });

    } catch (error) {
        console.error("Error submitting application:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
