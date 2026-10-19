import { useContext, useEffect, useState } from "react";
import { getMutualGuilds, getMutualGuildsLocalhost } from "../api";
import { PartialGuild } from "../types";
import { MapGuildsContext } from "../contexts/Contexts";

export function useFetchGuilds() {
    const { guilds, loadingGuilds, errorGuilds, updateGuilds, updateLoadingGuilds, updateErrorGuilds } = useContext(MapGuildsContext);
    const hostname = process.env.NEXT_PUBLIC_HOSTNAME;

    const fetchGuilds = () => {
        updateLoadingGuilds(true);
        if (window.location.hostname == hostname) {
            getMutualGuilds()
            .then(({ data }) => {
                // console.info('Guilds:', data);
                updateGuilds(data);
                updateLoadingGuilds(false);
            })
            .catch(error => {
                setTimeout(() => {
                    getMutualGuilds()
                    .then(({ data }) => {
                        // console.info('Guilds:', data);
                        updateGuilds(data);
                        updateLoadingGuilds(false);
                    })
                    .catch(error => {
                        // setErrorGuildsCount(prev => prev + 1);
                        updateLoadingGuilds(false);
                        console.error(error);
                        updateErrorGuilds(`${error}`);
                    })
                }, 5000);
            })
        } else if (window.location.hostname != hostname)  {
            getMutualGuildsLocalhost()
            .then(({ data }) => {
                // console.info('Guilds:', data);
                updateGuilds(data);
                updateLoadingGuilds(false);
            })
            .catch(error => {
                setTimeout(() => {
                    getMutualGuildsLocalhost()
                    .then(({ data }) => {
                        // console.info('Guilds:', data);
                        updateGuilds(data);
                        updateLoadingGuilds(false);
                    })
                    .catch(error => {
                        // setErrorGuildsCount(prev => prev + 1);
                        updateLoadingGuilds(false);
                        console.error(error);
                        updateErrorGuilds(`${error}`);
                    })
                }, 5000);
            })
        }
    };
    return fetchGuilds;
};