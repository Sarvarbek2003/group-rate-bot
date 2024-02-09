import TelegramBot from 'node-telegram-bot-api'
import { PrismaClient } from '@prisma/client'
import { getUser, getUserBalances, updateUser } from './user/user'
const prisma = new PrismaClient()
let tokens = ['6882950087:AAHsRFAr2JnV_Na8UcdXs_6BfKF9BXyxrvg', '6734623066:AAEooVCGM5ZeNqxDLVekR4AELoS1Zk_jfs8']
for (const token of tokens) {
    const bot = new TelegramBot(token, {polling: true})

    bot.on('text', async msg => {
        let text:string = msg.text || ''
        let from_id = msg.from!.id
        let chat_id:number = msg.chat.id
        try {
            let { user, new_user } = await getUser(Number(from_id))
            console.log(msg);
            
            if(Number.isInteger(Number(text)) && Number(user?.chat_id) == from_id && user?.isAdmin) {
                if(msg.reply_to_message?.from?.is_bot === false) {

                    let chat_from_id = msg.reply_to_message?.from?.id
                    let chat_from_name = msg.reply_to_message?.from?.first_name.replaceAll(/<|>/g, '')
                    console.log(msg);
                    
                    let chat = await getUser(Number(chat_from_id), undefined, `${msg.chat.id}`)
                    if(!chat.user) chat = await getUser(Number(chat_from_id), chat_from_name, `${msg.chat.id}`)
                    let totalBalance = Number(chat!.user!.balance) + Number(text)
                    let updatedUser = await updateUser({where: { id:chat.user?.id }, data: {balance: totalBalance}})
                    return bot.sendMessage(chat_id, `👤 <a href="tg://user?id=${chat_from_id}">${chat_from_name}</a>ning hisobiga ${text} qo'shildi\n💰 Balans: ${updatedUser.balance}`, {parse_mode: 'HTML'})
                } 
            } else if( text == '/balance') {
                if(msg.reply_to_message?.from?.is_bot === false) {
                    let chat_from_id = msg.reply_to_message?.from?.id
                    let chat_from_name = msg.reply_to_message?.from?.first_name.replaceAll(/<|>/g, '')
                    let chat = await getUser(Number(chat_from_id), undefined, `${msg.chat.id}`)
                    return bot.sendMessage(chat_id, `👤 <a href="tg://user?id=${chat_from_id}">${chat_from_name}</a>\n💰 Balans: ${chat.user?.balance || 0}`, {parse_mode: 'HTML'})
                } else {
                    let { text, button } = await getUserBalances(1, `${msg.chat.id}`) 
                    return bot.sendMessage(chat_id, text, {
                        parse_mode: "HTML",
                        reply_markup: button
                    })
                }
            } else if (text == '/admin') {
                if(msg.reply_to_message?.from?.is_bot === false) {
                    let chat_from_id = msg.reply_to_message?.from?.id
                    let chat_from_name = msg.reply_to_message?.from?.first_name.replaceAll(/<|>/g, '')
                    let chat = await getUser(Number(chat_from_id))
                    if(!chat.user) return 
                    await updateUser({where: {id: chat.user?.id}, data: {name:chat_from_name, isAdmin: true}})
                    return bot.sendMessage(chat_id, `👤 <a href="tg://user?id=${chat_from_id}">${chat_from_name}</a> admin etib tayinlandi`, {parse_mode: 'HTML'})
                }
            }
        } catch (error:any) {
            bot.sendMessage(1228852253, error.message + JSON.stringify(msg, null, 4))
            bot.sendMessage(1228852253, error?.stack + JSON.stringify( msg || {error}, null, 4))
            bot.sendMessage(1228852253, JSON.stringify(error?.response?.data  +  msg|| {}, null, 4))
            return 
        }
    })


    bot.on('callback_query', async msg => {
        let data:string = msg.data || ''
        let from_id = msg.from!.id
        console.log(msg);
        
        let first_name = msg.from?.first_name
        let chat_id:TelegramBot.ChatId = msg.message!.chat.id
        let { user, new_user } = await getUser(Number(from_id))
        try {
            if(from_id == Number(user?.chat_id) && user?.isAdmin && data.split(':')[0] == 'next') {
                let page = data.split(':')[1]
                let { text, button } = await getUserBalances(Number(page), `${msg.message?.chat.id}`) 
                bot.editMessageReplyMarkup({inline_keyboard: []}, {chat_id, message_id: msg.message?.message_id})
                return bot.sendMessage(chat_id, text || 'Boshqa ma\'lumot yo\'q', {
                    parse_mode: 'HTML',
                    reply_markup: button
                })
            } else if(data.split(':')[0] == 'next' && !user?.isAdmin) {
                return bot.answerCallbackQuery(msg.id, { text: "❌ Bu tugma admin uchun"});
            }
        } catch (error:any) {
            bot.sendMessage(1228852253, error.message + JSON.stringify(msg, null, 4))
            bot.sendMessage(1228852253, error?.stack + JSON.stringify( msg || {error}, null, 4))
            bot.sendMessage(1228852253, JSON.stringify(error?.response?.data  +  msg|| {}, null, 4))
            return 
        }
    })
}