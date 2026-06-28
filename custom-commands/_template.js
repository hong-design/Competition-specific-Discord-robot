const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('example')
    .setDescription('這是一個自訂指令範本'),

  async execute(interaction) {
    await interaction.reply({
      content: '把 custom-commands/_template.js 複製成新的檔案後再修改。',
      ephemeral: true,
    });
  },
};
