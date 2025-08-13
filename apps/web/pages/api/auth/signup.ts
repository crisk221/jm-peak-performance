import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@jmpp/db';
import { UserCreateSchema } from '@jmpp/types';
import bcrypt from 'bcryptjs';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Validate input
    const validated = UserCreateSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: validated.email,
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(validated.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validated.email,
        name: validated.name,
        passwordHash,
        role: validated.role || 'COACH', // Default to COACH role
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      message: 'User created successfully',
      user,
    });
  } catch (error) {
    console.error('Sign-up error:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ 
        message: 'Invalid input data',
        errors: (error as any).errors,
      });
    }

    res.status(500).json({ message: 'Internal server error' });
  }
}
