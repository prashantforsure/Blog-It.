import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth/auth';

export async function GET(
  request: Request,
  { params }: {
    params: Promise<{ id: string }>
  } 
) {
    const Id = (await params).id
  const blog = await prisma.blog.findUnique({
    where: { id: Id },
    include: {
      author: {
        select: { name: true, username: true, image: true },
      },
      tags: true,
      comments: {
        include: {
          author: {
            select: { name: true, username: true, image: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      likes: {
        select: { userId: true },
      },
    },
  });

  if (!blog) {
    return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
  }

  return NextResponse.json(blog);
}

export async function PUT(
  request: Request,
  { params }: {
    params: Promise<{ id: string }>
  } 
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const Id = (await params).id
  const { title, content, excerpt, tags, published } = await request.json();

  try {
    const blog = await prisma.blog.update({
      where: { id : Id },
      data: {
        title,
        content,
        excerpt,
        slug: generateSlug(title),
        published,
        tags: {
          set: [],
          connectOrCreate: tags.map((tag: string) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      },
      include: {
        author: {
          select: { name: true, username: true, image: true },
        },
        tags: true,
      },
    });

    return NextResponse.json(blog);
  } catch (error) {
    console.error('Error updating blog:', error);
    return NextResponse.json({ error: 'Failed to update blog post' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await prisma.blog.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    return NextResponse.json({ error: 'Failed to delete blog post' }, { status: 500 });
  }
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}