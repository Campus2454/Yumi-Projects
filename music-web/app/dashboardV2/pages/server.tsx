import { useGuildStore as uGS } from "../utils/zustand";
import { useShallow } from "zustand/react/shallow";
import { Server as SServer } from "../utils/styles";
import { FaPlus } from "react-icons/fa6";

export const Server = () => {
  const [guild, setGuild, isGuildsFetching, setIsGuildsFetching] = uGS(useShallow(s => [s.guild, s.setGuild, s.isGuildsFetching, s.setIsGuildsFetching]));
  const [guilds, setGuilds] = uGS(useShallow(s => [s.guilds, s.setGuilds]));

  return <>
    <SServer>
      <div id="header">
        <h1>My Servers</h1>
        <div id="add_server"><FaPlus /></div>
      </div>
      <div id="servers">
        {guilds?.map((guild) => (
          <div key={guild.id} id="server">
            <img src={guild.icon} alt="" />
            <p>{guild.name}</p>
          </div>
        ))}
      </div>
    </SServer>
  </>;
};
