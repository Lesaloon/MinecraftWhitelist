import { Message, RichEmbed } from "discord.js";
import {runEvent} from "../index";

export async function run(e:runEvent) {
    if (e.args[0] == "") return   
    const db = require('monk')(process.env.MongoURL)

    const Players = db.get('Players')
    const playa = await Players.find({DiscordID: e.message.author.id })
    if (!playa) {
        e.message.reply("Tu n'est pas dans notre basse de donner, fait !set <pseudo mincraft>  ")
        return
    }
    await Players.findOneAndUpdate({DiscordID: e.message.author.id}, { $set: { faction: e.args.join(" ") } }).then(
        () => e.message.reply("Tu est maintenant dans la faction : " + e.args.join(" ") )
    )
    done(db)
}


function done(DB:any) :void {
    DB.close()
}

export const names = ["setfaction", "setf"];
