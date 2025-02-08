import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
  
    const blogs = await prisma.blog.findMany({
      where: {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ],
        published: true,
      },
      include: {
        author: {
          select: { name: true, username: true, image: true },
        },
        tags: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
  
    const total = await prisma.blog.count({
      where: {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ],
        published: true,
      },
    });
  
    return NextResponse.json({
      blogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
}

export async function POST(request: Request){
  const session = await getServerSession();
  if(!session){
    return NextResponse.json({
        error: "unauth"
    }, {
      status: 401
    })
  }
  const { title, content, excerpt, tags, notionPageId } = await request.json();
  try{
   // yo yo this is the blog that... 
   // wait a minute
    const blog = await prisma.blog.create({
      data: {
        title,
        content,
        excerpt,
        slug: generateSlug(title),
        author: { connect: { id: session.user.id } },
        tags: {
          connectOrCreate: tags.map((tag: string) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
        notionPageId,
      },
      include: {
        author: {
          select: { name: true, username: true, image: true },
        },
        tags: true,
      },
    });
    return NextResponse.json(blog);
  }catch(error){

  }
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}