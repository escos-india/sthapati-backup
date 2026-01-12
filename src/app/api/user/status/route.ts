import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { UserModel } from "@/models/User";

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { isOpenToWork, resume } = body;

        await connectDB();

        const updateData: any = {};
        if (typeof isOpenToWork === 'boolean') {
            updateData.isOpenToWork = isOpenToWork;
        }
        if (resume !== undefined) {
            updateData.resume = resume;
        }

        const user = await UserModel.findOneAndUpdate(
            { email: session.user.email },
            { $set: updateData },
            { new: true }
        ).select("isOpenToWork resume");

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("Error updating status:", error);
        return NextResponse.json(
            { message: "Failed to update status" },
            { status: 500 }
        );
    }
}
