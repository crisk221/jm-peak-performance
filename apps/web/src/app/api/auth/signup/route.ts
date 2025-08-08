import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@jmpp/db";
import { UserCreateSchema } from "@jmpp/types";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const validated = UserCreateSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: validated.email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(validated.password as string, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validated.email,
        name: validated.name,
        passwordHash,
        role: validated.role || "COACH", // Default to COACH role
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Sign-up error:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        {
          message: "Invalid input data",
          errors: (error as any).errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
