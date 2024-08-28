import fetch from 'node-fetch';
import fs from 'fs';
import { Markup } from 'telegraf';
import { v4 as uuidv4 } from 'uuid';

export function config(bot) {
	bot.hears('Инструкция', async ctx => {
		ctx.reply(
			'Инструкцию вы найдете здесь https://lastseenvpn.gitbook.io/vpn-setup-guide/tutorial/ustanovka-i-nastroika-vpn/wireguard'
		);
	});

	bot.hears('Сделать конфиг', async ctx => {
		ctx.session.waitingForConfig = true;
		let configId = '';
		if (ctx.session.waitingForConfig) {
			const config = `${ctx.from.username}_${uuidv4()}`;
			try {
				const response = await fetch(
					'http://31.128.35.96:500/api/wireguard/clientCreateTg',
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({ name: config }),
					}
				);

				const data = await response.json();

				if (data.success) {
					ctx.reply('Конфиг добавлен. Высылаю конфиг...');
				} else {
					ctx.reply('Не удалось добавить конфигурацию.');
				}
			} catch (error) {
				ctx.reply('Произошла ошибка при добавлении конфигурации.');
			}

			try {
				const response = await fetch(
					'http://31.128.35.96:500/api/wireguard/client',
					{
						method: 'GET',
					}
				);
				const data = await response.json();

				data.map(item => {
					if (item.name === config) {
						configId = item.id;
						return;
					}
				});
			} catch (error) {
				console.log(error);
			}

			bot.on('message', ctx => {
				ctx.reply('Спасибо за ваш ответ.');
			});

			const getConfigById = async () => {
				try {
					const response = await fetch(
						`http://31.128.35.96:500/api/wireguard/client/${configId}/configuration`,
						{
							method: 'GET',
						}
					);
					return response.text();
				} catch (error) {
					console.log(error);
				}
			};

			const createFileForSend = async () => {
				const configData = await getConfigById();
				if (configData) {
					const filePath = './config.conf';
					fs.writeFileSync(filePath, configData);
					await ctx.replyWithDocument({ source: filePath });
					fs.unlinkSync(filePath);
					ctx.reply(
						'Вы можете посмотреть инструкцию',
						Markup.keyboard([['Инструкция']])
							.oneTime()
							.resize()
					);
				} else {
					ctx.reply('Не удалось получить конфигурацию.');
				}
			};

			createFileForSend();

			ctx.session.waitingForConfig = false;
		}
	});
}
