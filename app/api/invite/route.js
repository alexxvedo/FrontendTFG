import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    const { workspaceId, permissionType } = await request.json();

    const token = jwt.sign(
      { workspaceId, permissionType },
      process.env.AUTH_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return NextResponse.json({ token });
  } catch (error) {
    return NextResponse.json(
      { error: "Error generating token" },
      { status: 500 }
    );
  }
}
