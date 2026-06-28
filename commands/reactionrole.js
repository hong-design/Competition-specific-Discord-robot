const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const path = require('path');
const { ensureJsonFile, readJsonFile, writeJsonFile } = require('../utils/jsonStore');

const DATA_DIR = path.join(__dirname, '..', 'data');
const FILE = path.join(DATA_DIR, 'reactionroles.json');

function ensureData() {
  ensureJsonFile(FILE, []);
}

function readBindings() {
  ensureData();
  return readJsonFile(FILE, []);
}

function writeBindings(data) {
  ensureData();
  writeJsonFile(FILE, data);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reactionrole')
    .setDescription('管理反應身分綁定')
    .addSubcommand(sub => sub.setName('create')
      .setDescription('建立反應身分綁定')
      .addChannelOption(o => o.setName('channel').setDescription('頻道（用於發新訊息或指定訊息所在頻道）').setRequired(true))
      .addRoleOption(o => o.setName('role').setDescription('要指派的身分').setRequired(true))
      .addStringOption(o => o.setName('emoji').setDescription('表情（unicode 或 <:name:id>）').setRequired(true))
      .addStringOption(o => o.setName('messageid').setDescription('要綁定的現有訊息 ID（可選）').setRequired(false))
      .addStringOption(o => o.setName('message').setDescription('若不指定 messageId，可由機器人發佈此訊息').setRequired(false)))
    .addSubcommand(sub => sub.setName('remove')
      .setDescription('移除已存在的綁定')
      .addStringOption(o => o.setName('id').setDescription('綁定 ID').setRequired(true)))
    .addSubcommand(sub => sub.setName('list')
      .setDescription('列出本伺服器的綁定'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles | PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'create') {
      const channel = interaction.options.getChannel('channel');
      const messageId = interaction.options.getString('messageid');
      const messageText = interaction.options.getString('message');
      const role = interaction.options.getRole('role');
      const emoji = interaction.options.getString('emoji');

      if (!channel || !channel.isTextBased()) return interaction.reply({ content: '請提供有效文字頻道。', ephemeral: true });

      let targetMessage = null;
      try {
        if (messageId) {
          targetMessage = await channel.messages.fetch(messageId);
          if (!targetMessage) return interaction.reply({ content: '找不到指定 messageId。', ephemeral: true });
        } else {
          if (!messageText) return interaction.reply({ content: '若未指定 messageId，請提供 message 內容讓機器人發佈。', ephemeral: true });
          targetMessage = await channel.send(messageText);
        }

        await targetMessage.react(emoji).catch(() => {});

        const bindings = readBindings();
        const id = String(Date.now());
        bindings.push({ id, guildId: interaction.guildId, channelId: channel.id, messageId: targetMessage.id, roleId: role.id, emoji });
        writeBindings(bindings);

        const embed = new EmbedBuilder()
          .setTitle('✅ 已建立反應身分綁定')
          .addFields(
            { name: '綁定 ID', value: id },
            { name: '頻道', value: `<#${channel.id}>` },
            { name: '訊息 ID', value: targetMessage.id },
            { name: '身分', value: `<@&${role.id}>` },
            { name: '表情', value: emoji }
          );

        return interaction.reply({ embeds: [embed], ephemeral: true });
      } catch (err) {
        console.error('reactionrole create error', err);
        return interaction.reply({ content: '建立綁定時發生錯誤，請確認權限與輸入。', ephemeral: true });
      }
    }

    if (sub === 'remove') {
      const id = interaction.options.getString('id');
      const bindings = readBindings();
      const idx = bindings.findIndex(b => b.id === id && b.guildId === interaction.guildId);
      if (idx === -1) return interaction.reply({ content: '找不到該綁定 ID。', ephemeral: true });
      bindings.splice(idx, 1);
      writeBindings(bindings);
      return interaction.reply({ content: '✅ 綁定已移除。', ephemeral: true });
    }

    if (sub === 'list') {
      const bindings = readBindings().filter(b => b.guildId === interaction.guildId);
      if (!bindings.length) return interaction.reply({ content: '本伺服器沒有任何反應身分綁定。', ephemeral: true });

      const lines = bindings.map(b => `ID: ${b.id} — 頻道: <#${b.channelId}> — 訊息: ${b.messageId} — 身分: <@&${b.roleId}> — 表情: ${b.emoji}`);
      const embed = new EmbedBuilder()
        .setTitle('🔁 反應身分綁定列表')
        .setDescription(lines.join('\n'));
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
};
