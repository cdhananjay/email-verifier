import {
	type ChatInputCommandInteraction,
	MessageFlags,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from "discord.js";
import { prisma } from "../../lib/prisma";

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
	)

	.addSubcommand((subcommand) =>
		subcommand.setName("reset").setDescription("Reset the server config."),
	);

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

	await interaction.deferReply({ flags: MessageFlags.Ephemeral });

	const guildId = interaction.guild.id;
	const subcommand = interaction.options.getSubcommand();

	if (subcommand === "domain") {
		const domain = interaction.options.getString("domain", true);

		try {
			const config = await prisma.config.findUnique({
				where: { guildId: guildId },
			});

			if (!config) {
				await prisma.config.create({
					data: {
						guildId,
						domain,
					},
				});
			} else {
				await prisma.config.update({
					where: { guildId },
					data: { domain },
				});
			}

			await interaction.editReply({
				content: `Verification domain set to \`${domain}\``,
			});
		} catch (err) {
			console.error(err);

			await interaction.editReply({
				content: "Please try again later.",
			});
		}

		return;
	}

	if (subcommand === "verified-role") {
		const role = interaction.options.getRole("role", true);

		try {
			const config = await prisma.config.findUnique({
				where: { guildId },
			});

			if (!config) {
				await prisma.config.create({
					data: {
						guildId,
						verifiedRoleId: role.id,
					},
				});
			} else {
				await prisma.config.update({
					where: { guildId },
					data: {
						verifiedRoleId: role.id,
					},
				});
			}

			await interaction.editReply({
				content: `Verified role set to <@&${role.id}>`,
			});
		} catch (err) {
			console.error(err);

			await interaction.editReply({
				content: "Please try again later.",
			});
		}

		return;
	}

	if (subcommand === "view") {
		try {
			const config = await prisma.config.findUnique({
				where: { guildId },
				select: {
					domain: true,
					verifiedRoleId: true,
				},
			});

			const verifiedRoleExists = config?.verifiedRoleId
				? await interaction.guild.roles.fetch(config.verifiedRoleId)
				: null;

			await interaction.editReply({
				content: `Domain: ${
					config?.domain ? `\`${config.domain}\`` : "NOT SET"
				}\nVerified Role: ${
					config?.verifiedRoleId && verifiedRoleExists
						? `<@&${config.verifiedRoleId}>`
						: "NOT SET"
				}`,
			});
		} catch (err) {
			console.error(err);

			await interaction.editReply({
				content: "Please try again later.",
			});
		}

		return;
	}

	if (subcommand === "reset") {
		try {
			await prisma.config.delete({
				where: { guildId },
			});

			await interaction.editReply({
				content: "The config domain & verified role has been reset.",
			});
		} catch (err) {
			console.error(err);

			await interaction.editReply({
				content: "Please try again later.",
			});
		}
	}
}
