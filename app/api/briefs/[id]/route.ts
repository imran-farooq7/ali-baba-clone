// app/api/briefs/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/prisma/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: briefId } = await params;

    // Check if brief exists and belongs to user
    const brief = await prisma.brief.findUnique({
      where: { id: briefId },
      include: { brand: true },
    });

    if (!brief) {
      return NextResponse.json({ error: "Brief not found" }, { status: 404 });
    }

    if (brief.brandId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized to delete this brief" },
        { status: 403 }
      );
    }

    // Delete brief (cascade will delete proposals)
    await prisma.brief.delete({
      where: { id: briefId },
    });

    return NextResponse.json({
      success: true,
      message: "Brief deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting brief:", error);
    return NextResponse.json(
      { error: "Failed to delete brief" },
      { status: 500 }
    );
  }
}
