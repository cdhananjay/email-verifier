import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { prisma } from "../../lib/prisma";
export const data = new SlashCommandBuilder()
	.setName("verify")
	.setDescription("Gives you the verified role.");
export async function execute(interaction) {
	const guildId = interaction.guild.id;
	const member = interaction.member;

	try {
		const config = await prisma.config.findUnique({
			where: { guildId: guildId },
		});

		// to check if the role with verified role id is deleted from the server or not
		const verifiedRoleExists = await interaction.guild.roles.fetch(
			config?.verifiedRoleId,
		);

		if (!config?.verifiedRoleId || !config?.domain || !verifiedRoleExists) {
			return interaction.reply({
				content: `Domain or Verified Role not set for this server. If you are an admin, run the \`/config\` commands to set them.`,
				flags: MessageFlags.Ephemeral,
			});
		}

		if (member.roles.cache.has(config.verifiedRoleId)) {
			return interaction.reply({
				content: "You are already verified.",
				flags: MessageFlags.Ephemeral,
			});
		}

		const linkedAcc = await prisma.account.findFirst({
			where: { accountId: interaction.user.id },
		});
		const dbUser = await prisma.user.findUnique({
			where: { id: linkedAcc?.userId },
		});

		const verified =
			dbUser?.emailVerified === true &&
			dbUser?.email.split("@")[1] === config.domain;

		if (!verified) {
			return interaction.reply({
				content:
					`**Steps to verify:**` +
					`\n1. Visit ${process.env.AUTH_SITE_URL}.` +
					`\n2. Login with an email registered on the \`${config.domain}\` domain.` +
					`\n3. Link your discord account.` +
					`\n4. Run \`/verify\` again on this discord server.`,
				flags: MessageFlags.Ephemeral,
				embeds: [],
			});
		}

		await member.roles.add(config.verifiedRoleId);

		return interaction.reply({
			content: `Gave you the <@&${config.verifiedRoleId}> role.`,
			flags: MessageFlags.Ephemeral,
		});
	} catch (err) {
		console.log(err);
		return interaction.reply({
			content: "please try agian later",
			flags: MessageFlags.Ephemeral,
		});
	}
}
