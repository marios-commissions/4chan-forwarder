import { getBoardThreads, getContentFromComment, getFileFromComment, getThread, getThreadURL, type Thread } from '~/4chan';
import config from '~/../config.json';
import store from '~/structures/store';
import webhook from '~/structures/webhook';
import { parseHtmlEntities, sleep } from '~/utilities';
import { createLogger } from '~/structures/logger';

require('source-map-support').install();

const logger = createLogger('Forwarder');

async function check() {
	const threads = await getBoardThreads(config.board);

	for (const t of threads) {
		const id = t.no;

		const thread = await getThread(config.board, id);
		if (!thread || !thread.posts || store.data[id]) continue;

		logger.info(`Forwarding thread ${id}...`);

		const { posts } = thread;

		const [op] = posts as Thread[];

		const file = await getFileFromComment(config.board, op);
		const content = await getContentFromComment(op);

		await webhook.send({
			content: [
				op.sub && '**' + parseHtmlEntities(op.sub) + '**',
				' ',
				content,
				`[\`↖\`](${await getThreadURL(config.board, op)})`
			].filter(Boolean).join('\n')
		}, [file]);

		store.data[id] = op;

		logger.info(`Forwarded thread ${id}.`);
	}

	await sleep(config.delay);
	check();
}

check();