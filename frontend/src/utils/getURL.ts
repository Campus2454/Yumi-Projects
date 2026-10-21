import { PartialGuild, User } from './types';

export const getIconURL = (guild: Pick<PartialGuild, 'id' | 'icon'>) => {
  const extension = guild.icon.startsWith('a_') ? 'gif' : 'png';
  return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${extension}`;
}

export const getAvatarURL = (profile: User) => {
  const extension = profile.avatar.startsWith('a_') ? 'gif' : 'png';
  return `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${extension}`;
}
