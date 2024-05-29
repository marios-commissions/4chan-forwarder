import { NodeHtmlMarkdown } from 'node-html-markdown';
import { createLogger } from '~/structures/logger';
import { parseHtmlEntities } from '~/utilities';

const logger = createLogger('4chan');

export interface Thread {
	no: number;
	now: string;
	name: string;
	sub: string;
	com: string;
	filename: string;
	ext: string;
	w: number;
	h: number;
	tn_w: number;
	tn_h: number;
	tim: number;
	time: number;
	md5: string;
	fsize: number;
	resto: number;
	id: string;
	bumplimit: number;
	imagelimit: number;
	semantic_url: string;
	replies: number;
	images: number;
}

export interface File {
	name: string;
	buffer: Buffer;
}

export async function getBoardThreads(board: string) {
	const result = [];

	try {
		const data = await fetch(`https://a.4cdn.org/${board}/threads.json`).then(r => r.json());

		if (Array.isArray(data)) {
			for (const page of data) {
				result.push(...page.threads);
			}
		}
	} catch (error) {
		logger.error('Failed to fetch board threads:', error);
	}

	return result;
}

export async function getThread(board: string, thread: number) {
	try {
		return await fetch(`https://a.4cdn.org/${board}/thread/${thread}.json`).then(r => r.json());
	} catch (error) {
		logger.error('Failed to fetch individual board thread:', error);
	}
}

export async function getContentFromComment(thread: Thread) {
	if (!thread.com) return;

	return NodeHtmlMarkdown.translate(parseHtmlEntities(thread.com));
}

export async function getThreadURL(board: string, thread: Thread) {
	console.log(thread);
	return `https://boards.4chan.org/${board}/thread/${thread.no}/`;
}

export async function getFileFromComment(board: string, thread: Thread): Promise<File> {
	const url = `https://i.4cdn.org/${board}/${thread.tim}${thread.ext}`;

	const buf = await fetch(url).then(r => r.arrayBuffer());

	return {
		name: thread.filename + thread.ext,
		buffer: Buffer.from(buf)
	};
}