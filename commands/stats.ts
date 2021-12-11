import {runEvent} from "../index";
const { MessageEmbed } = require('discord.js');

type ServerParam = {
    gametype: String,
    host_name: String,
    joinlink: String,
    map: String,
    max_slots: String,
    password: Boolean,
    players: Array<Object>,
    plugins: String,
    teams: Array<Object>
    type: String,
    used_slots: String,
    version: String,
}

type ServerData = {
    is_online: Boolean,
    ip?: String,
    port?: String,
    game?: String,
    params?: ServerParam

}

export function run(e:runEvent) {

}

export const names = ["stats"];
