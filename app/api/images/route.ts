import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tagsParam = searchParams.get('tags');
  let where = {};

  if (tagsParam) {
    const tags = tagsParam.split(',').map((t) => t.trim());
    // Find images that have at least one of the tags
    where = {
      tags: {
        hasSome: tags,
      },
    };
  }

  const images = await prisma.image.findMany({
    where,
    select: {
      id: true,
      url: true,
      name: true,
      description: true,
      tags: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  // Map to frontend format
  const result = images.map((img) => ({
    id: img.id,
    url: img.url,
    title: img.name,
    description: img.description,
    tags: img.tags,
  }));

  return NextResponse.json(result);
} 