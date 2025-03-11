import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/notes/[noteId]
export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const noteId = parseInt(params.noteId);
    const note = await prisma.note.findUnique({
      where: {
        id: noteId,
      },
    });

    if (!note) {
      return NextResponse.json({ error: "Nota no encontrada" }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error("Error getting note:", error);
    return NextResponse.json(
      { error: "Error al obtener la nota" },
      { status: 500 }
    );
  }
}

// PUT /api/notes/[noteId]
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { noteName, content } = await req.json();
    const noteId = parseInt(params.noteId);

    const note = await prisma.note.update({
      where: {
        id: noteId,
      },
      data: {
        noteName,
        content,
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error("Error updating note:", error);
    return NextResponse.json(
      { error: "Error al actualizar la nota" },
      { status: 500 }
    );
  }
}

// DELETE /api/notes/[noteId]
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const noteId = parseInt(params.noteId);
    await prisma.note.delete({
      where: {
        id: noteId,
      },
    });

    return NextResponse.json({ message: "Nota eliminada correctamente" });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json(
      { error: "Error al eliminar la nota" },
      { status: 500 }
    );
  }
}
