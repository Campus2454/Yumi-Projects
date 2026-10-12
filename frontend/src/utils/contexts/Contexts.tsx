import { createContext } from "react";
import { PartialGuild, User } from "../types";

type GuildContextType = {
    guild?: PartialGuild;
    updateGuild: (guild: PartialGuild) => void;
};
export const GuildContext = createContext<GuildContextType>({
    updateGuild: () => {},
});

type UserContextType = {
    user?: User;
    loadingUser: boolean;
    userError?: any;
    updateUser: (user: User) => void;
    updateLoadingUser: (loadingUser: boolean) => void;
    updateUserError: (userError: any) => void;
};
export const UserContext = createContext<UserContextType>({
    user: undefined,
    loadingUser: true,
    userError: undefined,
    updateUser: () => {},
    updateLoadingUser: () => {},
    updateUserError: () => {}  
});

type MapGuildContextType = {
    guilds?: PartialGuild[];
    loadingGuilds: boolean;
    errorGuilds?: any;
    updateGuilds: (guild: PartialGuild[]) => void;
    updateLoadingGuilds: (loadingGuilds: boolean) => void;
    updateErrorGuilds: (errorGuilds: any) => void;
};
export const MapGuildsContext = createContext<MapGuildContextType>({
    guilds: undefined,
    loadingGuilds: true,
    errorGuilds: undefined,
    updateGuilds: () => {},
    updateLoadingGuilds: () => {},
    updateErrorGuilds: () => {}
});

type ErrorPopupType = {
    errorPopup?: {
        title?: string, message?: string, show: boolean
    };
    updateErrorPopup: (errorPopup: {title?: string, message?: string, show: boolean}) => void;
};
export const ErrorPopupContext = createContext<ErrorPopupType>({
    errorPopup: { show: false },
    updateErrorPopup: () => {},
});