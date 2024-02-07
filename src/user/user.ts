import { Prisma, users } from "@prisma/client"
import TelegramBot from "node-telegram-bot-api"
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()


const getUser = async (chat_id: number, name?: string, group?: string):Promise<{user:users | null, new_user:boolean}> => {
    let is_user:users | null  = await prisma.users.findFirst({where: {
        AND :{ 
            chat_id: BigInt(chat_id),
            group
        }
    }})

    if (name) {
        let new_user = await prisma.users.create({
            data:{
                chat_id:BigInt(chat_id),
                name: name || 'Foydalanuvchi',
                group
            }
        })
        return {user: new_user, new_user: true}
    } 

    return {
        user: is_user, 
        new_user: false
    }
}

const updateUser = async (data: Prisma.usersUpdateArgs):Promise<users> => {
    return await prisma.users.update(data)
}

const getUserBalances = async(page:number, group:string):Promise<{text: string, button: TelegramBot.InlineKeyboardMarkup}> => {
    let users = await prisma.users.findMany({where: {group}})
    let size = 4
    let paginationUsers = users.slice(page * size - size, size * page)
    let text = ``
    
    let button: TelegramBot.InlineKeyboardMarkup = {
        inline_keyboard: [
            paginationUsers.length == size ? [{text: 'Keyingi ➡️', callback_data: 'next:'+ Number(page+1)}] : []
        ]
    } 
    
    for (const user of paginationUsers) {
        let name = user?.name?.replaceAll(/<|>/g, '')
        text += `🆔 <a href="tg://user?id=${user.chat_id}">${user.chat_id}</a>\n👤 Name: ${name}\n💰Balance: ${user.balance}\n🟰🟰🟰🟰🟰🟰🟰🟰\n`
    }

    return { button, text } 
}

export { getUser, updateUser, getUserBalances}