import { Events } from "discord.js";

export const name = Events.GuildMemberAdd;
export function execute(member) {
	console.log("a member joined", member.user.tag);
}
