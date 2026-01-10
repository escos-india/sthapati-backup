import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { UserModel } from "@/models/User";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q");

        if (!query || query.length < 2) {
            return NextResponse.json([]);
        }

        await connectDB();

        const users = await UserModel.find({
            $or: [
                { name: { $regex: query, $options: "i" } },
                { headline: { $regex: query, $options: "i" } },
                { category: { $regex: query, $options: "i" } }
            ],
            status: 'active'
        })
            .select("name image headline category")
            .limit(5)
            .lean();

        return NextResponse.json(users);
    } catch (error) {
        console.error("Error searching users:", error);
        return NextResponse.json(
            { message: "Failed to search users" },
            { status: 500 }
        );
    }
}
