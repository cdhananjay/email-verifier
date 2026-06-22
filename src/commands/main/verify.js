import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { prisma } from "../../lib/prisma";
export const data = new SlashCommandBuilder()
	.setName("verify")
	.setDescription("Gives you the verified role.");
export async function execute(interaction) {
	const guildId = interaction.guild.id;
	const username = interaction.user.username;
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

		const profile = await prisma.profile.findFirst({
			where: { guildId: guildId, username: username },
		});
		if (!profile?.isVerified) {
			return interaction.reply({
				content:
					`**Steps to verify:**` +
					`\n1. Visit ${process.env.AUTH_SITE_URL}.` +
					`\n2. Login with your discord account.` +
					`\n3. Set server id as \`${guildId}\`.` +
					`\n-# tip: Discord app running on mobile devices lets you click on \`inline code blocks\` to copy them.` +
					`\n4. Add your email that exists on \`${config.domain}\` domain.` +
					`\n5. Run \`/verify\` again on this discord server.`,
				flags: MessageFlags.Ephemeral,
			});
		}

		await member.roles.add(config.verifiedRoleId);
		return interaction.reply({
			content: `Gave you the <@&${role.id}> role`,
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
