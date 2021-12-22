import { RichEmbed } from "discord.js";
import {runEvent} from "../index";
const jsftp = require("jsftp");

export async function run(e:runEvent) {
    if (! e.message.mentions.users.first()) { return }
    const db = require('monk')(process.env.MongoURL)

    const Players = db.get('Players')
    const playa = await Players.find({DiscordID: e.message.mentions.users.first().id})
    console.log(playa)
    if (playa.length == 0) {
        e.message.reply("Le joueur chercher n'est pas dans notre basse de donner ")
        return
    }
    console.log(e.message.mentions.users.first().username)
    const Ftp = new jsftp({
        host: "178.33.252.159",
        port: 21, // defaults to 21
        user: process.env.FTPUsr ?? "user", // defaults to "anonymous"
        pass: process.env.FTPPass ?? "1234" // defaults to "@anonymous"
      });
    let strdata = ""
    await Ftp.get(`world/stats/${playa[0].uuid}.json`, async (err:any, socket:any) => {
        if (err) {
            console.log(err);
            return
        }      
        socket.on("data", async (d:string) => {
            strdata += d.toString()            
            // console.log( data.stats["minecraft:custom"]["minecraft:deaths"] || "0");
            
            // const MsgEmbed = new RichEmbed()
            // .setTitle("Stats sur :" + playa[0].McName )
            // .addField( "Nombre de mort : ", data.stats["minecraft:custom"]["minecraft:deaths"] || "0")
            // .setTimestamp()

            // e.message.channel.send(MsgEmbed)
        })
        socket.on("close", (err: any) => {
            if (err) {
              console.error("There was an error retrieving the file.");
            }

            const data = JSON.parse(strdata)
            //console.log(data);

            //console.log( data.stats["minecraft:custom"]["minecraft:deaths"] || "0");
            const DataDeath = data.stats["minecraft:custom"]["minecraft:deaths"] || "0"
            let sum = 0
            for (const key in data.stats["minecraft:mined"]) {
                sum += data.stats["minecraft:mined"][key];
              }
            const DataBroken = sum
            const MsgEmbed = new RichEmbed()
            .setTitle("Stats sur : " + playa[0].McName )
            .addField( "Nombre de mort : ", DataDeath)
            .addField( "Nombre de blocs casser : ", DataBroken)
            .setTimestamp()

            e.message.channel.send(MsgEmbed)
            
          });
        socket.resume()
    })
    done(db)
}


function done(DB:any) :void {
    DB.close()
}

export const names = ["stats"];
