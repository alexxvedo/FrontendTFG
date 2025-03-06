import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const body = await req.json();
    const { workspaceId, permissionType } = body;

    if (!workspaceId || !permissionType) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const token = jwt.sign(
      { workspaceId, permissionType },
      process.env.AUTH_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return NextResponse.json({ token });
  } catch (err) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
