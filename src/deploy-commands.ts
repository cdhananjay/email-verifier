import { readdirSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";
// epic name
import type { RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord.js";
import { REST, Routes } from "discord.js";

const clientId = process.env.CLIENT_ID || "";
const guildId = process.env.GUILD_ID || "";
const token = process.env.TOKEN || "";

interface Command {
	data: {
		toJSON(): RESTPostAPIChatInputApplicationCommandsJSONBody;
	};
	// biome-ignore-start lint: args can be any
	execute: (...args: any[]) => Promise<void> | void;
	// biome-ignore-end lint: args can be any
}

const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

const foldersPath = join(import.meta.dirname, "commands");
const commandFolders = readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = join(foldersPath, folder);

	const commandFiles = readdirSync(commandsPath).filter((file) =>
		file.endsWith(".ts"),
	);

	for (const file of commandFiles) {
		const filePath = join(commandsPath, file);

		const commandModule = await import(filePath);
		const command = (commandModule.default ?? commandModule) as Command;

		if ("data" in command && "execute" in command) {
			commands.push(command.data.toJSON());
		} else {
			console.warn(
				`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
			);
		}
	}
}

const rest = new REST().setToken(token);

try {
	console.log(
		`Started refreshing ${commands.length} application (/) commands.`,
	);

	if (process.env.BUN_ENV !== "production") {
		const data = await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{
				body: commands,
			},
		);
		console.log(
			`Successfully reloaded ${
				(data as RESTPostAPIChatInputApplicationCommandsJSONBody[]).length
			} application (/) commands for guild id: ${guildId}.`,
		);
	} else {
		const data = await rest.put(Routes.applicationCommands(clientId), {
			body: commands,
		});
		console.log(
			`Successfully reloaded ${
				(data as RESTPostAPIChatInputApplicationCommandsJSONBody[]).length
			} application (/) commands globally.`,
		);
	}
} catch (error) {
	console.error(error);
}
