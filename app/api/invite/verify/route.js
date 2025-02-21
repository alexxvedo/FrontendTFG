import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    const { token } = await request.json();
    const decoded = jwt.verify(token, process.env.AUTH_SECRET);
    return NextResponse.json({ decoded });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json({ error: "Token ha expirado" }, { status: 400 });
    }
    return NextResponse.json({ error: "Token inválido" }, { status: 400 });
  }
}
