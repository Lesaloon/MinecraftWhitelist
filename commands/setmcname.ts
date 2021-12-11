import { cpuUsage } from "process";
import {runEvent} from "../index";
const { MessageEmbed } = require('discord.js');
export async function run(e:runEvent) {
   
    if (e.args[0] != "")  {
        const db = require('monk')(process.env.MongoURL)
        const Players = db.get('Players')
        
        const playa = await Players.find({DiscordID: e.message.author.id})
        const doPseudoTaken = await Players.find({McName: e.args[0]})
        if (doPseudoTaken.length != 0 ) {
            console.log(doPseudoTaken)
            e.message.reply(`Ce pseudo ( ${e.args[0]} ) a deja été pris par  <@${doPseudoTaken[0].DiscordID}> si tu pence que c'est un erreur contacte un administrateur` )
            done(db)
            return
        }
        console.log(playa)
        if (!playa) {
            Players.insert({DiscordID: e.message.author.id, McName: e.args[0], faction: "Nomade", whitelisted: false, UUID: null })
            e.message.reply("Ton profil a été crée " + e.args[0] +" pour te faire whiteliste tape !whitelist quand tu sera prêt a jouer")
            done(db)
        } else {
            Players.findOneAndUpdate({DiscordID: e.message.author.id}, { $set: { McName: e.args[0], whitelisted: false  } }).then( (data: any) => {
                e.message.reply("Ton profil a été mis a jours " + e.args[0] +" pour te faire whiteliste tape !whitelist quand tu sera prêt a jouer")
                
                // TODO: remove old pseudo from whitelist 

                done(db)
            } )
        }
        

        
    }
}

function done(DB:any) :void {
    DB.close()
}

export const names = ["setmcname"];
