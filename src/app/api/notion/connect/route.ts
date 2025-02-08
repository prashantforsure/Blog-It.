import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth/auth';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const clientId = process.env.NOTION_CLIENT_ID;
  if (!clientId) {
    throw new Error('NOTION_CLIENT_ID is not defined');
  }

  const nextAuthUrl = process.env.NEXTAUTH_URL;
  if (!nextAuthUrl) {
    throw new Error('NEXTAUTH_URL is not defined');
  }

  const redirectUri = `${nextAuthUrl}/api/notion/callback`;
  const state = generateState();

  try {
    await prisma.user.update({
      where: { 
        id: session.user.id 
      },
      data: {
        notionState: state
      }
    });

    const notionAuthUrl = `https://api.notion.com/v1/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&owner=user&state=${state}`;

    return NextResponse.json({ url: notionAuthUrl });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to initiate Notion authentication' }, { status: 500 });
  }
}

function generateState(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}