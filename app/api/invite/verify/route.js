import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { API_BASE_URL } from "@/lib/config";

export async function POST(request) {
  try {
    const { token } = await request.json();
    const decoded = jwt.verify(token, process.env.AUTH_SECRET);
    
    // Fetch workspace details to get the name
    const workspaceResponse = await fetch(`${API_BASE_URL}/workspaces/${decoded.workspaceId}`);
    const workspaceData = await workspaceResponse.json();
    
    // Add workspace name to the decoded data
    const decodedWithWorkspaceName = {
      ...decoded,
      workspaceName: workspaceData.data?.name || "Workspace"
    };
    
    return NextResponse.json({ decoded: decodedWithWorkspaceName });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json({ error: "Token ha expirado" }, { status: 400 });
    }
    return NextResponse.json({ error: "Token inválido" }, { status: 400 });
  }
}
