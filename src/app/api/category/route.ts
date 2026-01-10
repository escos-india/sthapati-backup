import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { UserModel } from "@/models/User";

const CATEGORY_MAPPING: Record<string, string[]> = {
    "professionals": ["Architect", "Trade Professional"],
    "agencies": ["Agency"],
    "builders": ["Builder"],
    "contractors": ["Contractor"],
    "material-suppliers": ["Material Supplier"],
    "educational-institutes": ["Educational Institute"],
};

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get("category");

        if (!category) {
            return NextResponse.json(
                { message: "Category parameter required" },
                { status: 400 }
            );
        }

        const mappedCategories = CATEGORY_MAPPING[category];
        if (!mappedCategories) {
            return NextResponse.json(
                { message: "Invalid category" },
                { status: 400 }
            );
        }

        await connectDB();
        const users = await UserModel.find({
            category: { $in: mappedCategories },
            isProfileComplete: true,
        })
            .select("name image headline category location bio")
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json(users);
    } catch (error) {
        console.error("Error fetching category users:", error);
        return NextResponse.json(
            { message: "Failed to fetch users" },
            { status: 500 }
        );
    }
}
