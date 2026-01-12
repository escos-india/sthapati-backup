import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { PostModel } from "@/models/Post";

export async function GET(req: Request) {
    try {
        await connectDB();

        // Fetch latest posts, populated with author details
        const posts = await PostModel.find({})
            .sort({ createdAt: -1 })
            .limit(6)
            .populate("author", "name image")
            .lean();

        return NextResponse.json(posts);
    } catch (error) {
        console.error("Error fetching public posts:", error);
        return NextResponse.json({ message: "Failed to fetch posts" }, { status: 500 });
    }
}
