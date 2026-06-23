import type { ChatInputCommandInteraction } from "discord.js";
import {
	type GuildMember,
	MessageFlags,
	SlashCommandBuilder,
} from "discord.js";
import { prisma } from "../../lib/prisma";

export const data = new SlashCommandBuilder()
	.setName("verify")
	.setDescription("Gives you the verified role.");

export async function execute(
	interaction: ChatInputCommandInteraction,
): Promise<void> {
	if (!interaction.guild) {
		await interaction.reply({
			content: "This command can only be executed in a server.",
			flags: MessageFlags.Ephemeral,
		});
		return;
	}
	const guildId = interaction.guild.id;
	const member = interaction.member as GuildMember;

	try {
		const config = await prisma.config.findUnique({
			where: { guildId },
		});

		const verifiedRoleExists = config?.verifiedRoleId
			? await interaction.guild.roles.fetch(config.verifiedRoleId)
			: null;

		if (!config?.verifiedRoleId || !config.domain || !verifiedRoleExists) {
			await interaction.reply({
				content:
					"Domain or Verified Role not set for this server. If you are an admin, run the `/config` commands to set them.",
				flags: MessageFlags.Ephemeral,
			});
			return;
		}

		if (member.roles.cache.has(config.verifiedRoleId)) {
			await interaction.reply({
				content: "You are already verified.",
				flags: MessageFlags.Ephemeral,
			});
			return;
		}

		const linkedAcc = await prisma.account.findFirst({
			where: {
				accountId: interaction.user.id,
			},
		});

		const dbUser = await prisma.user.findUnique({
			where: {
				id: linkedAcc?.userId || "",
			},
		});

		const verified =
			dbUser?.emailVerified === true &&
			dbUser.email.split("@")[1] === config.domain;

		if (!verified) {
			await interaction.reply({
				content:
					`**Steps to verify:**\n` +
					`1. Visit ${process.env.AUTH_SITE_URL}.\n` +
					`2. Login with an email registered on the \`${config.domain}\` domain.\n` +
					`3. Link your Discord account.\n` +
					`4. Run \`/verify\` again on this Discord server.`,
				flags: MessageFlags.Ephemeral,
				embeds: [],
			});
			return;
		}

		await member.roles.add(config.verifiedRoleId);

		await interaction.reply({
			content: `Gave you the <@&${config.verifiedRoleId}> role.`,
			flags: MessageFlags.Ephemeral,
		});
	} catch (err) {
		console.error(err);

		await interaction.reply({
			content: "Please try again later.",
			flags: MessageFlags.Ephemeral,
		});
	}
}
