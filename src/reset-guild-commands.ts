// Guild commands shadow global ones in that guild.
// If you previously used guild registration (dev), then switch to global (prod),
// the old guild commands persist and override global commands.
// this code clears them with: rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] })

import process from "node:process";
import type { RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord.js";
import { REST, Routes } from "discord.js";

const clientId = process.env.CLIENT_ID || "";
if (!process.env.GUILD_ID) {
	process.exit(0);
}
const guildId = process.env.GUILD_ID;
const token = process.env.TOKEN || "";
const rest = new REST().setToken(token);

try {
	console.log(`Started removing application (/) commands.`);

	const data = await rest.put(
		Routes.applicationGuildCommands(clientId, guildId),
		{
			body: [],
		},
	);
	console.log(
		`Successfully reloaded ${
			(data as RESTPostAPIChatInputApplicationCommandsJSONBody[]).length
		} application (/) commands for guild id: ${guildId}.`,
	);
} catch (error) {
	console.error(error);
}
