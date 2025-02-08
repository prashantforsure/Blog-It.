import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

import chromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';
import { authOptions } from '@/lib/auth/auth';
import prisma from '@/lib/prisma';

export async function GET(
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
  try {
    const blog = await prisma.blog.findUnique({
      where: { id: Id },
      include: {
        author: {
          select: { name: true, username: true },
        },
        tags: true,
      },
    });

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: true,
    });

    const page = await browser.newPage();

    // Generate HTML content for the PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${blog.title}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          h1 { color: #2c3e50; }
          .meta { color: #7f8c8d; font-size: 0.9em; }
          .tags { margin-top: 20px; }
          .tag { background-color: #ecf0f1; padding: 5px 10px; border-radius: 3px; margin-right: 5px; }
        </style>
      </head>
      <body>
        <h1>${blog.title}</h1>
        <div class="meta">
          <p>By ${blog.author.name} (@${blog.author.username})</p>
          <p>Published on ${new Date(blog.createdAt).toLocaleDateString()}</p>
        </div>
        <div>${blog.content}</div>
        <div class="tags">
          ${blog.tags.map((tag) => `<span class="tag">${tag.name}</span>`).join(' ')}
        </div>
      </body>
      </html>
    `;

    await page.setContent(htmlContent);

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' },
    });

    await browser.close();

    // Set response headers for PDF download
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', `attachment; filename="${blog.slug}.pdf"`);

    return new NextResponse(pdf, { status: 200, headers });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}