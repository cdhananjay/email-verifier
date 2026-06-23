import {
	type Client,
	type Collection,
	Events,
	type Interaction,
	MessageFlags,
} from "discord.js";

interface Command {
	execute: (interaction: Interaction) => Promise<void>;
}

export const name = Events.InteractionCreate;

export async function execute(interaction: Interaction): Promise<void> {
	if (!interaction.isChatInputCommand()) return;

	const command = (
		interaction.client as Client & { commands: Collection<string, Command> }
	).commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);

		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({
				content: "There was an error while executing this command!",
				flags: MessageFlags.Ephemeral,
			});
		} else {
			await interaction.reply({
				content: "There was an error while executing this command!",
				flags: MessageFlags.Ephemeral,
			});
		}
	}
}
