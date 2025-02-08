// /lib/notion.ts

import { Client } from '@notionhq/client';
import { BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';

/**
 * Converts Notion blocks to HTML content
 * @param notion Notion client instance
 * @param blocks Array of Notion blocks
 * @returns HTML string
 */
export async function convertNotionToHtml(
  notion: Client,
  blocks: BlockObjectResponse[]
): Promise<string> {
  let html = '';

  for (const block of blocks) {
    switch (block.type) {
      case 'paragraph':
        if (block.paragraph.rich_text.length) {
          html += `<p>${block.paragraph.rich_text.map(text => text.plain_text).join('')}</p>`;
        }
        break;
      case 'heading_1':
        if (block.heading_1.rich_text.length) {
          html += `<h1>${block.heading_1.rich_text.map(text => text.plain_text).join('')}</h1>`;
        }
        break;
      case 'heading_2':
        if (block.heading_2.rich_text.length) {
          html += `<h2>${block.heading_2.rich_text.map(text => text.plain_text).join('')}</h2>`;
        }
        break;
      case 'heading_3':
        if (block.heading_3.rich_text.length) {
          html += `<h3>${block.heading_3.rich_text.map(text => text.plain_text).join('')}</h3>`;
        }
        break;
      case 'bulleted_list_item':
        if (block.bulleted_list_item.rich_text.length) {
          html += `<li>${block.bulleted_list_item.rich_text.map(text => text.plain_text).join('')}</li>`;
        }
        break;
      case 'numbered_list_item':
        if (block.numbered_list_item.rich_text.length) {
          html += `<li>${block.numbered_list_item.rich_text.map(text => text.plain_text).join('')}</li>`;
        }
        break;
      case 'image':
        if ('file' in block.image) {
          html += `<img src="${block.image.file.url}" alt="Notion image" />`;
        } else if ('external' in block.image) {
          html += `<img src="${block.image.external.url}" alt="Notion image" />`;
        }
        break;
      // Add more cases for other block types as needed
    }
  }

  return html;
}