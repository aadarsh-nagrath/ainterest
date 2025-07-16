import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tagsParam = searchParams.get('tags');
  const cursorParam = searchParams.get('cursor');
  let where = {};

  if (tagsParam) {
    const tags = tagsParam.split(',').map((t) => t.trim());
    where = {
      tags: {
        hasSome: tags,
      },
    };
  }

  const take = 50;
  let cursor = undefined;
  if (cursorParam) {
    cursor = { id: cursorParam };
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
    take: take + 1, // Fetch one extra to check if there's more
    ...(cursor ? { cursor, skip: 1 } : {}),
  });

  let nextCursor = null;
  let resultImages = images;
  if (images.length > take) {
    nextCursor = images[images.length - 1].id;
    resultImages = images.slice(0, take);
  }

  // Map to frontend format
  const result = resultImages.map((img) => ({
    id: img.id,
    url: img.url,
    title: img.name,
    description: img.description,
    tags: img.tags,
  }));

  return NextResponse.json({ images: result, nextCursor });
} 