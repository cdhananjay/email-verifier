import { readdirSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";
import {
	Client,
	Collection,
	type Collection as CollectionType,
	GatewayIntentBits,
} from "discord.js";

const token = process.env.TOKEN;

interface Command {
	data: {
		name: string;
	};
	// biome-ignore-start lint: args can be any
	execute: (...args: any[]) => Promise<void> | void;
	// biome-ignore-end lint: args can be any
}

interface ExtendedClient extends Client {
	commands: CollectionType<string, Command>;
}

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
}) as ExtendedClient;

client.commands = new Collection<string, Command>();

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
		const command = commandModule.default ?? commandModule;

		if ("data" in command && "execute" in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.warn(
				`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
			);
		}
	}
}

const eventsPath = join(import.meta.dirname, "events");
const eventFiles = readdirSync(eventsPath).filter((file) =>
	file.endsWith(".ts"),
);

for (const file of eventFiles) {
	const filePath = join(eventsPath, file);
	const eventModule = await import(filePath);
	const event = eventModule.default ?? eventModule;

	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

await client.login(token);
