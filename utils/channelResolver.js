function normalizeName(name) {
  return String(name || '').trim().toLowerCase();
}

async function fetchChannel(guild, channelId) {
  if (!guild || !channelId) return null;

  const cached = guild.channels.cache.get(channelId);
  if (cached) return cached;

  return guild.channels.fetch(channelId).catch(() => null);
}

async function resolveTextChannel(guild, options = {}) {
  const { channelId, fallbackNames = [] } = options;

  const direct = await fetchChannel(guild, channelId);
  if (direct?.isTextBased?.()) return direct;

  const wantedNames = fallbackNames.map(normalizeName);
  if (!wantedNames.length) return null;

  return (
    guild.channels.cache.find(
      (channel) =>
        channel?.isTextBased?.() && wantedNames.includes(normalizeName(channel.name))
    ) || null
  );
}

module.exports = {
  resolveTextChannel,
};
