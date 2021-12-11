import { Message, RichEmbed } from "discord.js";
import {runEvent} from "../index";

export async function run(e:runEvent) {
    if (! e.message.mentions.users.first()) { return }
    const db = require('monk')(process.env.MongoURL)

    const Players = db.get('Players')
    const playa = await Players.find({DiscordID: e.message.mentions.users.first().id})
    if (!playa) {
        e.message.reply("Le joueur chercher n'est pas dans notre basse de donner ")
        return
    }
    console.log(e.message.mentions.users.first().username)
    const MsgEmbed = new RichEmbed()
        .setTitle("information sur : ")
        .addField("IGN :", playa[0].McName)
        .addField("Whitelist :", playa[0].whitelisted ? "oui" : "non")
        .addField( "Faction :", playa[0].faction)
        .addField("UUID ( unique au serveur ) :",  playa[0].UUID)
        .setTimestamp()
    e.message.channel.send(MsgEmbed)
    done(db)
}


function done(DB:any) :void {
    DB.close()
}

export const names = ["info"];
