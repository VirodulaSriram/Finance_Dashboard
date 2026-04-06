import { auth } from "@/auth";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";
import crypto from "crypto";

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Toggle sharing
    user.isSharing = !user.isSharing;

    // Generate token if enabling and none exists
    if (user.isSharing && !user.shareToken) {
      user.shareToken = crypto.randomUUID();
    }

    await user.save();

    return NextResponse.json({
      isSharing: user.isSharing,
      shareToken: user.shareToken,
      shareUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/share/${user.shareToken}`
    });
  } catch (error: any) {
    console.error("Share Toggle Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
