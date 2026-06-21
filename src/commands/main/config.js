import { prisma } from "../../lib/prisma";

const {
	PermissionFlagsBits,
	SlashCommandBuilder,
	MessageFlags,
} = require("discord.js");

export const data = new SlashCommandBuilder()
	.setName("config")
	.setDescription("Configure the server")
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

	.addSubcommand((subcommand) =>
		subcommand
			.setName("domain")
			.setDescription("Set the verification domain")
			.addStringOption((option) =>
				option
					.setName("domain")
					.setDescription("Example: iiitn.ac.in")
					.setRequired(true),
			),
	)

	.addSubcommand((subcommand) =>
		subcommand
			.setName("verified-role")
			.setDescription("Set the verified role")
			.addRoleOption((option) =>
				option
					.setName("role")
					.setDescription("Role to give verified users")
					.setRequired(true),
			),
	)

	.addSubcommand((subcommand) =>
		subcommand.setName("view").setDescription("View current configuration"),
	);

export async function execute(interaction) {
	const guildId = interaction.guild.id;
	const subcommand = interaction.options.getSubcommand();

	if (subcommand === "domain") {
		const domain = interaction.options.getString("domain");

		try {
			const config = await prisma.config.findUnique({
				where: { guildId: guildId },
			});

			if (!config) {
				await prisma.config.create({
					data: {
						guildId: guildId,
						domain: domain,
					},
				});
				return interaction.reply({
					content: `Verification domain set to \`${domain}\``,
					flags: MessageFlags.Ephemeral,
				});
			}

			await prisma.config.update({
				where: { guildId: guildId },
				data: { domain: domain },
			});
		} catch (err) {
			console.log(err);
			return interaction.reply({
				content: "please try again later",
				flags: MessageFlags.Ephemeral,
			});
		}
		return interaction.reply({
			content: `Verification domain set to \`${domain}\``,
			flags: MessageFlags.Ephemeral,
		});
	}

	if (subcommand === "verified-role") {
		const role = interaction.options.getRole("role");
		try {
			const config = await prisma.config.findUnique({
				where: { guildId: guildId },
			});

			if (!config) {
				await prisma.config.create({
					data: {
						guildId: guildId,
						verifiedRoleId: role.id,
					},
				});
				return interaction.reply({
					content: `Verified role set to <@&${role.id}>`,
					flags: MessageFlags.Ephemeral,
				});
			}

			await prisma.config.update({
				where: { guildId: guildId },
				data: { verifiedRoleId: role.id },
			});
		} catch (err) {
			console.log(err);
			return interaction.reply({
				content: "please try again later",
				flags: MessageFlags.Ephemeral,
			});
		}
		return interaction.reply({
			content: `Verified role set to <@&${role.id}>`,
			flags: MessageFlags.Ephemeral,
		});
	}

	if (subcommand === "view") {
		try {
			const config = await prisma.config.findUnique({
				where: { guildId: guildId },
				select: { domain: true, verifiedRoleId: true },
			});
			const domain = config?.domain;
			const verifiedRoleId = config?.verifiedRoleId;
			return interaction.reply({
				content: `Domain: ${domain ? `\`${domain}\`` : "NOT SET"}\nVerified Role: ${verifiedRoleId ? `<@&${verifiedRoleId}>` : "NOT SET"}`,
				flags: MessageFlags.Ephemeral,
			});
		} catch (err) {
			console.log(err);
			return interaction.reply({
				content: "please try again later",
				flags: MessageFlags.Ephemeral,
			});
		}
	}
}
