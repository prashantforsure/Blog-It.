

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { Client } from '@notionhq/client';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth/auth';
import { 
  GetPageResponse, 
  PageObjectResponse,
  BlockObjectResponse,
  RichTextItemResponse
} from '@notionhq/client/build/src/api-endpoints';

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
    });

    return NextResponse.json(response.results);
  } catch (error) {
    console.error('Error fetching Notion pages:', error);
    return NextResponse.json({ error: 'Failed to fetch Notion pages' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { pageId } = await request.json();

  const notionToken = await prisma.notionToken.findUnique({
    where: { userId: session.user.id },
  });

  if (!notionToken) {
    return NextResponse.json({ error: 'Notion not connected' }, { status: 400 });
  }

  const notion = new Client({ auth: notionToken.accessToken });

  try {
    const page = await notion.pages.retrieve({ page_id: pageId });
    const blocks = await notion.blocks.children.list({ block_id: pageId });

   
    if (!('properties' in page)) {
      throw new Error('Received partial page response');
    }

    const pageWithProperties = page as PageObjectResponse;
  
    const titleProperty = pageWithProperties.properties.title;
    if (!('title' in titleProperty) || !titleProperty.title[0]?.plain_text) {
      throw new Error('Invalid page title structure');
    }

    const pageTitle = titleProperty.title[0].plain_text;
    const content = await convertNotionToHtml(notion, blocks.results as BlockObjectResponse[]);

    const blog = await prisma.blog.create({
      data: {
        title: pageTitle,
        content,
        slug: generateSlug(pageTitle),
        authorId: session.user.id,
        notionPageId: pageId,
      },
    });

    return NextResponse.json(blog);
  } catch (error) {
    console.error('Error importing Notion page:', error);
    return NextResponse.json({ error: 'Failed to import Notion page' }, { status: 500 });
  }
}

async function convertNotionToHtml(notion: Client, blocks: BlockObjectResponse[]): Promise<string> {
  let html = '';
  let currentList: string | null = null;
  
  for (const block of blocks) {
    try {
      switch (block.type) {
        case 'paragraph':
          if (currentList) {
            html += `</${currentList}>`;
            currentList = null;
          }
          html += `<p>${await convertRichTextToHtml(block.paragraph.rich_text)}</p>`;
          break;
        case 'heading_1':
          if (currentList) {
            html += `</${currentList}>`;
            currentList = null;
          }
          html += `<h1>${await convertRichTextToHtml(block.heading_1.rich_text)}</h1>`;
          break;
        case 'heading_2':
          if (currentList) {
            html += `</${currentList}>`;
            currentList = null;
          }
          html += `<h2>${await convertRichTextToHtml(block.heading_2.rich_text)}</h2>`;
          break;
        case 'heading_3':
          if (currentList) {
            html += `</${currentList}>`;
            currentList = null;
          }
          html += `<h3>${await convertRichTextToHtml(block.heading_3.rich_text)}</h3>`;
          break;
        case 'bulleted_list_item':
          if (currentList !== 'ul') {
            if (currentList) html += `</${currentList}>`;
            html += '<ul>';
            currentList = 'ul';
          }
          html += `<li>${await convertRichTextToHtml(block.bulleted_list_item.rich_text)}</li>`;
          break;
        case 'numbered_list_item':
          if (currentList !== 'ol') {
            if (currentList) html += `</${currentList}>`;
            html += '<ol>';
            currentList = 'ol';
          }
          html += `<li>${await convertRichTextToHtml(block.numbered_list_item.rich_text)}</li>`;
          break;
        case 'to_do':
          if (currentList) {
            html += `</${currentList}>`;
            currentList = null;
          }
          const checked = block.to_do.checked ? 'checked' : '';
          html += `<div class="notion-todo"><input type="checkbox" ${checked} disabled><span>${await convertRichTextToHtml(block.to_do.rich_text)}</span></div>`;
          break;
        case 'image':
          if (currentList) {
            html += `</${currentList}>`;
            currentList = null;
          }
          if ('file' in block.image) {
            html += `<img src="${block.image.file.url}" alt="Notion image" />`;
          } else if ('external' in block.image) {
            html += `<img src="${block.image.external.url}" alt="Notion image" />`;
          }
          break;
      }
    } catch (error) {
      console.error(`Error processing block of type ${block.type}:`, error);
      continue;
    }
  }

  if (currentList) {
    html += `</${currentList}>`;
  }

  return html;
}

async function convertRichTextToHtml(richText: RichTextItemResponse[]): Promise<string> {
  let html = '';
  for (const text of richText) {
    try {
      let content = text.plain_text;
      
      if (text.annotations.code) {
        content = `<code>${content}</code>`;
      }
      if (text.annotations.bold) {
        content = `<strong>${content}</strong>`;
      }
      if (text.annotations.italic) {
        content = `<em>${content}</em>`;
      }
      if (text.annotations.strikethrough) {
        content = `<del>${content}</del>`;
      }
      if (text.annotations.underline) {
        content = `<u>${content}</u>`;
      }
      if (text.href) {
        content = `<a href="${text.href}" target="_blank" rel="noopener noreferrer">${content}</a>`;
      }
      
      html += content;
    } catch (error) {
      console.error('Error processing rich text:', error);
      continue;
    }
  }
  return html;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') 
    .replace(/\s+/g, '-') 
    .replace(/-+/g, '-') 
    .replace(/^-+|-+$/g, ''); 
}