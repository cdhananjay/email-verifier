import type { Client } from "discord.js";
import { Events } from "discord.js";

export const name = Events.ClientReady;
export const once = true;

export function execute(client: Client<true>): void {
	console.log(`Ready! Logged in as ${client.user.tag}`);
}
