import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

import { Client } from '@notionhq/client';
import { authOptions } from '@/lib/auth/auth';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const notionToken = await prisma.notionToken.findUnique({
    where: { userId: session.user.id },
  });

  if (!notionToken) {
    return NextResponse.json({ error: 'Notion not connected' }, { status: 400 });
  }

  const notion = new Client({ auth: notionToken.accessToken });

  try {
    const response = await notion.search({
      filter: { property: 'object', value: 'page' },
      sort: { direction: 'descending', timestamp: 'last_edited_time' },
    });

    const pages = response.results.map((page: any) => ({
      id: page.id,
      title: page.properties.title?.title[0]?.plain_text || 'Untitled',
      lastEditedTime: page.last_edited_time,
      url: page.url,
    }));

    return NextResponse.json(pages);
  } catch (error) {
    console.error('Error fetching Notion pages:', error);
    return NextResponse.json({ error: 'Failed to fetch Notion pages' }, { status: 500 });
  }
}