import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/collection/[collectionId]/notes
export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const collectionId = parseInt(params.collectionId);
    const notes = await prisma.note.findMany({
      where: {
        collectionId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Error getting notes:", error);
    return NextResponse.json(
      { error: "Error al obtener las notas" },
      { status: 500 }
    );
  }
}

// POST /api/collection/[collectionId]/notes
export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { noteName, content } = await req.json();
    const collectionId = parseInt(params.collectionId);

    const note = await prisma.note.create({
      data: {
        noteName,
        content,
        collectionId,
        userId: session.user.id,
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json(
      { error: "Error al crear la nota" },
      { status: 500 }
    );
  }
}
