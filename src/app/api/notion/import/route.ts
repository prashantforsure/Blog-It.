import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import {
  GetPageResponse,
  PageObjectResponse,
  BlockObjectResponse,
  RichTextItemResponse
} from '@notionhq/client/build/src/api-endpoints';
import { Client } from '@notionhq/client';
import { authOptions } from '@/lib/auth/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { pageId } = await request.json();

  if (!pageId) {
    return NextResponse.json({ error: 'No page ID provided' }, { status: 400 });
  }

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
    
    let title = 'Untitled';
    const titleProperty = pageWithProperties.properties.title;
    if ('title' in titleProperty && titleProperty.title.length > 0) {
      title = titleProperty.title[0].plain_text;
    }

    const content = await convertNotionToHtml(notion, blocks.results as BlockObjectResponse[]);

    const blog = await prisma.blog.create({
      data: {
        title,
        content,
        slug: generateSlug(title),
        excerpt: content.substring(0, 150) + '...',
        authorId: session.user.id,
        notionPageId: pageId,
        published: false, 
      },
    });

    return NextResponse.json(blog);
  } catch (error) {
    console.error('Error importing Notion page:', error);
    return NextResponse.json({ error: 'Failed to import Notion page' }, { status: 500 });
  }
}

async function convertNotionToHtml(notion: Client, blocks: any[]): Promise<string> {
  let html = '';
  for (const block of blocks) {
    switch (block.type) {
      case 'paragraph':
        html += `<p>${await convertRichTextToHtml(notion, block.paragraph.rich_text)}</p>`;
        break;
      case 'heading_1':
        html += `<h1>${await convertRichTextToHtml(notion, block.heading_1.rich_text)}</h1>`;
        break;
      case 'heading_2':
        html += `<h2>${await convertRichTextToHtml(notion, block.heading_2.rich_text)}</h2>`;
        break;
      case 'heading_3':
        html += `<h3>${await convertRichTextToHtml(notion, block.heading_3.rich_text)}</h3>`;
        break;
      case 'bulleted_list_item':
        html += `<ul><li>${await convertRichTextToHtml(notion, block.bulleted_list_item.rich_text)}</li></ul>`;
        break;
      case 'numbered_list_item':
        html += `<ol><li>${await convertRichTextToHtml(notion, block.numbered_list_item.rich_text)}</li></ol>`;
        break;
      case 'to_do':
        const checked = block.to_do.checked ? 'checked' : '';
        html += `<div><input type="checkbox" ${checked} disabled> ${await convertRichTextToHtml(notion, block.to_do.rich_text)}</div>`;
        break;
      case 'image':
        const imageUrl = block.image.type === 'external' ? block.image.external.url : block.image.file.url;
        html += `<img src="${imageUrl}" alt="Notion image" />`;
        break;
      case 'code':
        html += `<pre><code class="language-${block.code.language}">${block.code.rich_text[0].plain_text}</code></pre>`;
        break;
      case 'quote':
        html += `<blockquote>${await convertRichTextToHtml(notion, block.quote.rich_text)}</blockquote>`;
        break;
      case 'divider':
        html += '<hr />';
        break;
      // Add more cases for other block types as needed
    }
  }
  return html;
}

async function convertRichTextToHtml(notion: Client, richText: any[]): Promise<string> {
  let html = '';
  for (const text of richText) {
    let content = text.plain_text;
    if (text.href) {
      content = `<a href="${text.href}">${content}</a>`;
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
    if (text.annotations.code) {
      content = `<code>${content}</code>`;
    }
    html += content;
  }
  return html;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}