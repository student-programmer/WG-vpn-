import { Markup } from 'telegraf';
import { bot } from '../../index.js';

export async function startCommand(ctx) {
	const chanelId = '@wireguardvpntop';
	const member = await ctx.telegram.getChatMember(chanelId, ctx.from.id);

	bot.action('check_membership', async ctx => {
		const memberAction = await ctx.telegram.getChatMember(
			chanelId,
			ctx.from.id
		);

		if (
			memberAction.status === 'member' ||
			memberAction.status === 'administrator' ||
			memberAction.status === 'creator'
		) {
			ctx.reply(
				'Нажмите сделать конфиг',
				Markup.keyboard([['Сделать конфиг']])
					.oneTime()
					.resize()
			);
		} else {
			ctx.answerCbQuery();
			ctx.deleteMessage();
			ctx.reply(
				'Подпишитесь на наш ТГ канал, чтобы получить бесплатный конфиг https://t.me/wireguardvpntop. После подписки нажмите кнопку ниже.',
				Markup.inlineKeyboard([
					Markup.button.callback('Я подписался', 'check_membership'),
				]),
				{ parse_mode: 'Markdown' }
			);
		}
	});

	if (
		member.status === 'member' ||
		member.status === 'administrator' ||
		member.status === 'creator'
	) {
		ctx.reply(
			'Нажмите сделать конфиг',
			Markup.keyboard([['Сделать конфиг']])
				.oneTime()
				.resize()
		);
	} else {
		ctx.reply(
			'Подпишитесь на наш ТГ канал, чтобы получить бесплатный конфиг https://t.me/wireguardvpntop. После подписки нажмите кнопку ниже.',
			Markup.inlineKeyboard([
				Markup.button.callback('Я подписался', 'check_membership'),
			]),
			{ parse_mode: 'Markdown' }
		);
	}
}
