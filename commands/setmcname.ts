import {runEvent} from "../index";
const jsftp = require("jsftp");
import { Rcon } from "rcon-client"
var crypto = require('crypto');

type WhitelistJsonFormat = {
    name: string,
    uuid: string
}


function javaHash(input:string) { // this function saved my fuking life HAAAAAAAA
    // *releaved ougabunga*
    let md5Bytes = crypto.createHash('md5').update(input).digest();
    md5Bytes[6]  &= 0x0f;  /* clear version        */
    md5Bytes[6]  |= 0x30;  /* set to version 3     */
    md5Bytes[8]  &= 0x3f;  /* clear variant        */
    md5Bytes[8]  |= 0x80;  /* set to IETF variant  */
    const uuid = md5Bytes.toString('hex')
    const arr = [
        uuid.substr(0, 8),
        uuid.substr(8, 4),
        uuid.substr(12, 4),
        uuid.substr(16, 4),
        uuid.substr(20)
    ]
    console.log({uuid, arr});
    return arr.join("-")
}

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
            Players.findOneAndUpdate({DiscordID: e.message.author.id}, { $set: { McName: e.args[0], whitelisted: false  } }).then( async (data: any) => {
                e.message.reply("Ton profil a été mis a jours " + e.args[0] + " tu devrait donc être whitelist")
                
                const Ftp = new jsftp({
                    host: "178.33.252.159",
                    port: 21, // defaults to 21
                    user: process.env.FTPUsr ?? "user", // defaults to "anonymous"
                    pass: process.env.FTPPass ?? "1234" // defaults to "@anonymous"
                  });
                let jsonWhitelist:Array<WhitelistJsonFormat>
                Ftp.get("whitelist.json", async (err:any, socket:any) => {
                    if (err) {
                      return;
                    }
                  
                    socket.on("data", async (d:string) => {
                        jsonWhitelist = JSON.parse(d)
                        const oldname = playa[0].McName
                        console.log({oldname, newname: e.args[0]})
                        jsonWhitelist = jsonWhitelist.filter((item:WhitelistJsonFormat) => item.name !== playa[0].McName);
                        let newuuid = javaHash("OfflinePlayer:"+e.args[0])
                        
                        jsonWhitelist.push( {name: e.args[0], uuid:newuuid })
                        Ftp.put(Buffer.from(JSON.stringify(jsonWhitelist), 'utf8'), "whitelist.json" )
                        
                        const rcon = await Rcon.connect({
                            host: "178.33.252.159", port: 27036, password: process.env.RconPass ?? "password"
                        })
                             
                        let responses = rcon.send("whitelist reload")
                            
                        console.log(responses)
            
                        rcon.end()
                    });
                  
                    socket.resume();
                } )
                

                done(db)
            } )
        }
        

        
    }
}

function done(DB:any) :void {
    DB.close()
}

export const names = ["set", "setmcname"];
