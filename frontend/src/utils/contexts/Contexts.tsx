import { createContext } from "react";
import { GuildInfo, User } from "../types";

type GuildContextType = {
    guild?: GuildInfo;
    updateGuild: (guild: GuildInfo) => void;
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