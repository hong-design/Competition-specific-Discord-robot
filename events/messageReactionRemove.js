const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'messageReactionRemove',
  async execute(reaction, user) {
    try {
      if (user.bot) return;

      if (reaction.partial) {
        try { await reaction.fetch(); } catch (err) { return; }
      }

      const guild = reaction.message.guild;
      if (!guild) return;

      const DATA_FILE = path.join(__dirname, '..', 'data', 'reactionroles.json');
      if (!fs.existsSync(DATA_FILE)) return;
      const bindings = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) || [];

      const emojiKey = reaction.emoji.id ? `<:${reaction.emoji.name}:${reaction.emoji.id}>` : reaction.emoji.name;

      const exact = bindings.find(b => b.guildId === guild.id && b.messageId === reaction.message.id && (b.emoji === emojiKey || b.emoji === reaction.emoji.name));
      const binding = exact;
      if (!binding) return;

      const member = await guild.members.fetch(user.id).catch(() => null);
      if (!member) return;

      const role = guild.roles.cache.get(binding.roleId) || await guild.roles.fetch(binding.roleId).catch(() => null);
      if (!role) return;

      await member.roles.remove(role).catch(() => {});
    } catch (err) {
      console.error('messageReactionRemove handler error', err);
    }
  }
};
