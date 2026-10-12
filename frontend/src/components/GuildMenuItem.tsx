import { getIconURL } from "../utils/getURL";
import { Container, GuildMenuItemStyle } from "../utils/styles"
import { PartialGuild } from "../utils/types";

type Props = {
    guild: PartialGuild;
    href: string;
}

export const GuildMenuItem = ({ guild, href }: Props) => (
    <GuildMenuItemStyle href={href}>
        {guild.icon && (
            <img
                src={getIconURL(guild)}
                alt={guild.name}
                width={40}
                height={40}
            />
        )}
        {!guild.icon && (
            <div style={{ width: '40px',  height: '40px', backgroundColor: 'rgba(255, 0, 0, 0.5)', alignContent: 'center', textAlign: 'center' }}>
                {guild.name.slice(0, 1)}
            </div>
        )}
        <p translate="no" style={{ display: 'flex', alignItems: 'center', justifyContent: 'right', height: '25px', width: '250px', margin: '16px 0', textAlign: 'end', }}>{guild.name}</p>
    </GuildMenuItemStyle>
  );