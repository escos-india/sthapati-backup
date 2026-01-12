import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { AnnouncementModel } from "@/models/Announcement";
import { UserModel } from "@/models/User";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const user = await UserModel.findOne({ email: session.user.email });

        if (!user || !user.isAdmin) {
            return NextResponse.json({ message: "Forbidden: Admins only" }, { status: 403 });
        }

        const body = await req.json();
        const { title, message, isActive } = body;

        if (!message) {
            return NextResponse.json({ message: "Message is required" }, { status: 400 });
        }

        const newAnnouncement = await AnnouncementModel.create({
            title,
            message,
            isActive: isActive !== undefined ? isActive : true,
        });

        return NextResponse.json(newAnnouncement, { status: 201 });

    } catch (error) {
        console.error("Error creating announcement:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const user = await UserModel.findOne({ email: session.user.email });

        if (!user || (!user.isAdmin && user.category !== 'Admin')) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const announcements = await AnnouncementModel.find().sort({ createdAt: -1 });
        return NextResponse.json(announcements);

    } catch (error) {
        console.error("Error fetching announcements:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ message: "ID is required" }, { status: 400 });
        }

        await connectDB();
        const user = await UserModel.findOne({ email: session.user.email });

        if (!user || (!user.isAdmin && user.category !== 'Admin')) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        await AnnouncementModel.findByIdAndDelete(id);
        return NextResponse.json({ message: "Announcement deleted" });

    } catch (error) {
        console.error("Error deleting announcement:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
