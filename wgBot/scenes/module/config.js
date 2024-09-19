import fetch from 'node-fetch';
import fs from 'fs';
import { Markup } from 'telegraf';
import { v4 as uuidv4 } from 'uuid';

export function config(bot) {
	bot.hears('Инструкция', async ctx => {
		try {
			ctx.reply(
				'Инструкцию вы найдете здесь https://lastseenvpn.gitbook.io/vpn-setup-guide/tutorial/ustanovka-i-nastroika-vpn/wireguard'
			);
		} catch (error) {
			console.error('Ошибка при отправке инструкции:', error);
			ctx.reply('Произошла ошибка при отправке инструкции.');
		}
	});

	bot.hears('Сделать конфиг', async ctx => {
		ctx.session.waitingForConfig = true;
		let configId = '';
		if (ctx.session.waitingForConfig) {
			const config = `${ctx.from.username}_${uuidv4()}`;

			try {
				// Отправка запроса на создание конфига
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
				console.error('Ошибка при добавлении конфигурации:', error);
				ctx.reply('Произошла ошибка при добавлении конфигурации.');
			}

			try {
				// Запрос всех клиентов WireGuard
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
				console.error('Ошибка при получении списка конфигураций:', error);
				ctx.reply('Произошла ошибка при получении списка конфигураций.');
			}

			// Обработчик для сообщения от пользователя
			bot.on('message', ctx => {
				try {
					ctx.reply('Спасибо за ваш ответ.');
				} catch (error) {
					console.error('Ошибка при отправке ответа:', error);
					ctx.reply('Произошла ошибка при обработке сообщения.');
				}
			});

			// Функция для получения конфигурации по ID
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
					console.error(
						`Ошибка при получении конфигурации с ID ${configId}:`,
						error
					);
					return null;
				}
			};

			// Функция для создания и отправки файла конфигурации
			const createFileForSend = async () => {
				try {
					const configData = await getConfigById();
					if (configData) {
						const filePath = './config.conf';
						fs.writeFileSync(filePath, configData); // Сохранение файла
						await ctx.replyWithDocument({ source: filePath }); // Отправка файла пользователю
						fs.unlinkSync(filePath); // Удаление файла после отправки

						ctx.reply(
							'Вы можете посмотреть инструкцию',
							Markup.keyboard([['Инструкция']])
								.oneTime()
								.resize()
						);
					} else {
						ctx.reply('Не удалось получить конфигурацию.');
					}
				} catch (error) {
					console.error('Ошибка при создании или отправке файла:', error);
					ctx.reply('Произошла ошибка при создании или отправке конфигурации.');
				}
			};

			// Вызов функции для создания и отправки конфигурации
			createFileForSend();

			ctx.session.waitingForConfig = false;
		}
	});
}
