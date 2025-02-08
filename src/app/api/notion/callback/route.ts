import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth';
import prisma from '@/lib/prisma';


export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  // Verify the state to prevent CSRF attacks
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { notionState: true },
  });

  if (!user || user.notionState !== state) {
    return NextResponse.json({ error: 'Invalid state' }, { status: 400 });
  }

  try {
    const response = await fetch('https://api.notion.com/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(
          `${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/notion/callback`,
      }),
    });

    if (!response.ok) {
      throw new Error(`Notion API error: ${response.statusText}`);
    }

    const { access_token, workspace_id, bot_id } = await response.json();

    await prisma.notionToken.upsert({
      where: { userId: session.user.id },
      update: {
        accessToken: access_token,
        workspaceId: workspace_id,
        botId: bot_id,
      },
      create: {
        userId: session.user.id,
        accessToken: access_token,
        workspaceId: workspace_id,
        botId: bot_id,
      },
    });
    await prisma.user.update({
      where: { id: session.user.id },
      data: { notionState: null },
    });

    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?notion_connected=true`);
  } catch (error) {
    console.error('Error exchanging Notion code for token:', error);
    return NextResponse.json({ error: 'Failed to connect Notion account' }, { status: 500 });
  }
}