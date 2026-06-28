const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  EmbedBuilder,
} = require('discord.js');
const { logAction } = require('../utils/logger');

const POLL_EMOJIS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Create a quick poll with 2 to 5 options')
    .addStringOption((option) =>
      option.setName('question').setDescription('Poll question').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('option1').setDescription('Option 1').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('option2').setDescription('Option 2').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('option3').setDescription('Option 3').setRequired(false)
    )
    .addStringOption((option) =>
      option.setName('option4').setDescription('Option 4').setRequired(false)
    )
    .addStringOption((option) =>
      option.setName('option5').setDescription('Option 5').setRequired(false)
    )
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('Channel to post the poll (defaults to current)')
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
    .setDMPermission(false),

  async execute(interaction) {
    const question = interaction.options.getString('question');
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    const options = [
      interaction.options.getString('option1'),
      interaction.options.getString('option2'),
      interaction.options.getString('option3'),
      interaction.options.getString('option4'),
      interaction.options.getString('option5'),
    ].filter(Boolean);

    if (!channel || !channel.isTextBased()) {
      return interaction.reply({
        content: 'Please choose a valid text channel.',
        ephemeral: true,
      });
    }

    if (options.length < 2) {
      return interaction.reply({
        content: 'You need at least 2 options.',
        ephemeral: true,
      });
    }

    try {
      const embed = new EmbedBuilder()
        .setColor('#9B59B6')
        .setTitle(`Poll: ${question}`)
        .setDescription(
          options.map((opt, idx) => `${POLL_EMOJIS[idx]} ${opt}`).join('\n')
        )
        .setFooter({ text: `Created by ${interaction.user.tag}` })
        .setTimestamp();

      const pollMessage = await channel.send({ embeds: [embed] });
      for (let i = 0; i < options.length; i += 1) {
        await pollMessage.react(POLL_EMOJIS[i]);
      }

      logAction({
        type: 'POLL',
        userId: interaction.user.id,
        userTag: interaction.user.tag,
        guildId: interaction.guildId,
        guildName: interaction.guild?.name,
        reason: `Created poll in #${channel.name}: ${question}`,
        details: { channelId: channel.id, messageId: pollMessage.id, optionCount: options.length },
      });

      await interaction.reply({
        content: `Poll posted in <#${channel.id}>.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error('poll command failed:', error);
      await interaction.reply({
        content: 'Failed to create poll. Check my Send Messages/Add Reactions permissions.',
        ephemeral: true,
      });
    }
  },
};
