'use client';
import { useEffect, useContext, useState, useRef, useLayoutEffect } from "react";
import { ErrorPopupContext, GuildContext, MapGuildsContext, UserContext } from "../../../src/utils/contexts/Contexts";
import { FeatureDropdown, BackgroundFixed, ChangePopup, Container, DashCategoryMenu, DashPageServerFunctionSend, DashPageServerFunctionWelcomeGoodBye, DashPageServerGeneralInfo, DashPageServerGeneralPremium, DashPageServerGeneralSettings, DashPanel, InputField, InputRadio, PopupStatusSaving, Select, TextArea, TextLimit, Title, PricingTable, PricingTH, PricingTD, PlanName, HighlightTD, PricingTableWrapper, DashPageServerOverview, DashPage} from "../../../src/utils/styles";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { getAvatarURL, getIconURL } from "../../../src/utils/getURL";
import { GuildConfig, PartialGuild, discord_limits, localeLabels, textChannelTypes, welcome_limits } from "../../../src/utils/types";
import { PulseLoader } from "react-spinners";

import axios from "axios";
import { postAuthLogout, postAuthLogoutLocalhost } from "../../../src/utils/api";
import { TbArrowBigLeftFilled, TbArrowBigUpLines, TbCrown, TbDiamond, TbHandStop, TbIcons, TbInfoCircle, TbLogout, TbMessage, TbPencil, TbPlus, TbSettings, TbStar, TbStarFilled } from "react-icons/tb";
import { BsStars } from "react-icons/bs";
import { Locale, APIEmbed, RESTPostAPIChannelMessageJSONBody, ChannelType } from "discord-api-types/v10";
import MessagePreview from "../../../src/components/MessagePreview";
import EmbedEditor from "../../../src/components/EmbedEditor";
import { DiscordFormatterWrapper } from "../../../src/components/DiscordFormatterWrapper";
import { FaHashtag, FaUsers } from "react-icons/fa";
import { FaBars, FaShield } from "react-icons/fa6";
import { PiCaretUpDownBold } from "react-icons/pi";
import { Spinner_ring } from "../../../src/components/Spinner";
import { useFetchGuilds } from "../../../src/utils/hooks/useFetchGuilds";
import Link from "next/link";

// interface BaseMessageOptions {
//     content?: string;
//     embeds?: readonly APIEmbed[];
//     components?: any;
// };

function DashboardPageContent() {
    const { guild, updateGuild } = useContext(GuildContext);
    const { user: profile, loadingUser, userError } = useContext(UserContext);
    const { loadingGuilds, errorGuilds, guilds, updateLoadingGuilds } = useContext(MapGuildsContext);
    const { errorPopup, updateErrorPopup: setErrorPopup } = useContext(ErrorPopupContext);
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const pathname = usePathname();
    const router = useRouter();
    const dashboardType = pathname.startsWith('/dashboard/server') ? 'server'
        : pathname.startsWith('/dashboard/user') ? 'user'
            : null;
    const [changePopup, setChangePopup] = useState<boolean | null>(null);
    const [popupStatusSaving, setPopupStatusSaving] = useState<boolean | null>(null);
    const [savingChangesLoading, setSavingChangesLoading] = useState(false);
    const [welcomeStatus, setWelcomeStatus] = useState([false, false, false]);
    const [goodbyeStatus, setGoodbyeStatus] = useState([false, false, false]);
    const [welMessages, setWelMessages] = useState<RESTPostAPIChannelMessageJSONBody[]>([{}, {}]);
    const [goodMessages, setGoodMessages] = useState<RESTPostAPIChannelMessageJSONBody[]>([{}, {}]);
    const [sendMessages, setSendMessages] = useState<RESTPostAPIChannelMessageJSONBody[]>([]);
    const [logging_out, setLogging_out] = useState(false);
    const [premiumType, setPremiumType] = useState<0 | 1>(0);
    const [changePanelLoading, setChangePanelLoading] = useState(false);
    const notPublishedPath = ['/dashboard/server/'+`${guild?.id || '0'}`+'/send'];
    
    const apiDomain = process.env.NEXT_PUBLIC_API_DOMAIN;
    const hostname = process.env.NEXT_PUBLIC_HOSTNAME;
    const apiIp = process.env.NEXT_PUBLIC_API_IP_URL;
    const ip = process.env.NEXT_PUBLIC_API_IP;

    const fetchGuilds = useFetchGuilds();
    const checkData = () => {
        if(dashboardType === 'user' && !profile){
            const path = `/dashboard?to=user/${window.location.pathname.split('/')[3] || ''}`;
            try {
                if (loadingUser && !userError) return;
                else if (userError) { throw setErrorPopup({ title: 'Loading User Error', message: `${userError}`, show: true }); }
            } catch { return router.push(path); };
        };
        if(dashboardType === 'server' && !guild){
            const path = `/dashboard?to=server/${window.location.pathname.split('/')[3]}/${window.location.pathname.split('/')[4] || ''}`;
            try {
                fetchGuilds();
                if (loadingGuilds && !errorGuilds) return;
                else if (guilds && guilds.length > 0) {
                    if (isNaN(Number(pathname.split('/')[3]))) throw 'Invalid Dashboard Context';
                    const g = guilds.find(g => g.id == pathname.split('/')[3]);
                    if(!g) throw setErrorPopup({ title: 'Loading Guild Error', message: 'No guilds found', show: true });
                    updateGuild(g);
                    setGConfig(g);
                }
                else if (errorGuilds) { throw setErrorPopup({ title: 'Loading Guild Error', message: `${errorGuilds}`, show: true }); }
                else throw 'Loading Guild Error';
            } catch { return router.push(path); };
        };
    };
    const setGConfig = (g: PartialGuild | undefined) => {
        if (g?.database.config) {
            const guildConfig = g.database.config;
            const guildMembership = g.database.membership;
            const membership = g.database.membership;

            if (guildConfig.welcomeSetting) {
                setWelMessages([guildConfig?.welcomeSetting?.welcome?.channel?.message || {}, guildConfig?.welcomeSetting?.welcome?.user?.message || {}]);
                setWelcomeStatus([guildConfig?.welcomeSetting?.welcome?.isEnabled || false, guildConfig?.welcomeSetting?.welcome?.channel?.isEnabled || false, guildConfig?.welcomeSetting?.welcome?.user?.isEnabled || false]);

                setGoodMessages([guildConfig?.welcomeSetting?.goodbye?.channel?.message || {}, guildConfig?.welcomeSetting?.goodbye?.user?.message || {}]);
                setGoodbyeStatus([guildConfig?.welcomeSetting?.goodbye?.isEnabled || false, guildConfig?.welcomeSetting?.goodbye?.channel?.isEnabled || false, guildConfig?.welcomeSetting?.goodbye?.user?.isEnabled || false]);
            };
        };
    };

    useEffect(() => {
        checkData();

        console.info(guild);

        if (window.location.href.endsWith('/')) { router.push(`${window.location.href.slice(0, -1)}`) };

        setChangePanelLoading(true);
        setTimeout(() => {
            setChangePanelLoading(false);
        }, 200);
    }, []);
    useEffect(() => {
        setChangePopup(null);
        setPopupStatusSaving(null);

        const g = guilds?.find(g => g.id == pathname.split('/')[3]);
        if(g)updateGuild(g);
        setGConfig(g);

        if (window.location.hostname != ip) {
            notPublishedPath.map(path => {
                if (location.pathname == path) {
                    router.push(location.pathname.startsWith('/dashboard/user') ? '/dashboard/user/overview' : '/dashboard/server/'+`${guild?.id || '0'}`+'/overview');
                    return setErrorPopup({
                        title: 'Sorry!',
                        message: 'This function is currently unavailable.',
                        show: true
                    });
                };
            });
        };

        // if(dashboardType == 'server' && guild?.id !== location.pathname.split('/')[3]){
        //     const nG = guilds?.find(g=>g.id == location.pathname.split('/')[3]);
        //     if(nG)updateGuild(nG);
        // }
    }, [pathname]);
    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (changePopup) {
                event.preventDefault();
                event.returnValue = "";
            };
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [changePopup]);
    useEffect(() => {
        //     if(welcomeStatus[1] === true || welcomeStatus[2] === true){setWelcomeStatus((v)=>[true, v[1], v[2]])}else{setWelcomeStatus((v)=>[false, v[1], v[2]])};
        //     if(goodbyeStatus[1] === true || goodbyeStatus[2] === true){setGoodbyeStatus((v)=>[true, v[1], v[2]])}else{setGoodbyeStatus((v)=>[false, v[1], v[2]])};
    }, [welcomeStatus[1], welcomeStatus[2], goodbyeStatus[1], goodbyeStatus[2]]);
    useEffect(() => {
        checkData();
    }, [profile, loadingUser, userError, guild, guilds, errorGuilds, loadingGuilds]);

    useEffect(() => {
        if (dashboardType === 'server' && guild) {
            const page = pathname.split('/')[4] || 'Overview';
            const formattedPage = page.charAt(0).toUpperCase() + page.slice(1);
            document.title = `${formattedPage}・${guild.name}`;
        } else if (dashboardType === 'user' && profile) {
            const page = pathname.split('/')[3] || 'Overview';
            const formattedPage = page.charAt(0).toUpperCase() + page.slice(1);
            document.title = `${formattedPage}・${profile.global_name || profile.username}`;
        }
    }, [pathname, guild, profile, dashboardType]);

    const saveGuildConfig = async (config: GuildConfig) => {
        try {
            const res = await axios.post<{ config: any, statusText: string | null, error: string | null }>(
                window.location.hostname == hostname ? `${apiDomain}/discord/guilds/settings` : `${apiIp}/discord/guilds/settings`, config, { withCredentials: true, }
            );
            if (res.status == 200) {
                if (!guild) return res.data;
                if (config.guildSettings) {
                    const newGuild = {
                        ...guild,
                        data: {
                            ...guild.data,
                            preferred_locale: res.data.config.language
                        },
                        database: {
                            ...guild.database,
                            prefix: res.data.config.prefix
                        }
                    };
                    // console.log(`newConfig:`, config.guildSettings);
                    // console.log(`resReturn:`, res.data.config);
                    // console.log(`NewGuild:`, newGuild);
                    // console.log(`guild:`, guild);
                    updateGuild(newGuild);
                } if (config.welcomeSetting) {
                    const newGuild = {
                        ...guild,
                        database: {
                            ...guild.database,
                            config: {
                                ...guild.database.config,
                                welcomeSetting: { ...config.welcomeSetting }
                            }
                        }
                    };
                    // console.log(`newConfig:`, config.welcomeSetting);
                    // console.log(`resReturn:`, res.data.config);
                    // console.log(`NewGuild:`, newGuild);
                    // console.log(`guild:`, guild);
                    updateGuild(newGuild);
                };
                return res.data;
            } else {
                throw res.data;
            }
        } catch (error) {
            throw axios.isAxiosError(error) && error.response ? error.response.data : `SaveGuildConfigError: ${error}`;
        };
    };
    const buttonSaveChange = async (type: 'save' | 'cancel') => {
        const guildConfig = guild?.database.config;
        const ePanel = document.querySelector('div[id="panel"]') as HTMLDivElement;
        if (location.pathname.split('/')[4] == ('settings') && guild) {
            const eLang = document.querySelector('select[name="language"]') as HTMLSelectElement;
            const ePrefix = document.querySelector('input[name="prefix"]') as HTMLInputElement;
            if (eLang && ePrefix) {
                if (type == 'cancel') {
                    eLang.value = guild.data.preferred_locale || 'en_US';
                    ePrefix.value = guild.database?.config.prefix || '!';
                    setChangePopup(false);
                    return;
                } else if (type == 'save') {
                    let isSave = false;
                    (await Promise.all([eLang, ePrefix])).forEach((e) => {
                        if (!e.value) {
                            e.scrollIntoView({
                                behavior: 'smooth',
                                block: 'center'
                            });
                            e.style.transition = '0.5s';
                            e.style.position = 'fixed';
                            e.style.animation = 'shake 0.1s infinite';
                            e.style.backgroundColor = 'red';
                            setTimeout(() => {
                                e.style.position = 'static';
                                e.style.animation = '';
                                e.style.backgroundColor = '';
                            }, 500);
                            return isSave = false;
                        } else if (e.value) return isSave = true;
                    });
                    if (isSave) {
                        setPopupStatusSaving(true);
                        setSavingChangesLoading(true);
                        const guildConfig: GuildConfig = {
                            guildId: guild.id,
                            guildSettings: {
                                language: eLang.value as Locale,
                                prefix: ePrefix.value
                            }
                        };
                        try {
                            const saveStatus = await saveGuildConfig(guildConfig);
                            updateGuild({ ...guild });

                            setChangePopup(false);
                            setSavingChangesLoading(false);
                            console.info(saveStatus);
                            setTimeout(() => {
                                const e = document.getElementById('statusSavingText');
                                if (e) e.textContent = saveStatus.statusText;
                                updateGuild({
                                    ...guild,
                                    database: {
                                        ...guild.database,
                                        config: {
                                            ...guild.database.config,
                                            prefix: saveStatus.config.prefix,
                                        },
                                    },
                                    data: {
                                        ...(guild.data || {}),
                                        preferred_locale: saveStatus.config.language,
                                    },
                                });
                            }, 500);
                            setTimeout(() => {
                                setPopupStatusSaving(false);
                            }, 2000);
                        } catch (error) {
                            setSavingChangesLoading(false);
                            console.error(error);
                            setTimeout(() => {
                                const e = document.getElementById('statusSavingText');
                                if (e) e.textContent = `${error}`;
                            }, 500);
                            setTimeout(() => {
                                setPopupStatusSaving(false);
                            }, 5000);
                        };
                    }
                };
            };
        } else
            if (location.pathname.split('/')[4] == ('welcome') && guild) {
                const eWelcome = ePanel.querySelector('div[id="welcome"]') as HTMLSelectElement;
                const eGoodbye = ePanel.querySelector('div[id="goodbye"]') as HTMLSelectElement;
                const eWChannel = eWelcome.querySelector('select[name="channel"]') as HTMLSelectElement;
                const eGChannel = eGoodbye.querySelector('select[name="channel"]') as HTMLSelectElement;
                if (eWChannel && eGChannel) {
                    if (type == 'cancel') {
                        eWChannel.value = guildConfig?.welcomeSetting?.welcome?.channel?.id || '';
                        setWelMessages([guildConfig?.welcomeSetting?.welcome?.channel?.message || {}, guildConfig?.welcomeSetting?.welcome?.user?.message || {}]);
                        setWelcomeStatus([guildConfig?.welcomeSetting?.welcome?.isEnabled || false, guildConfig?.welcomeSetting?.welcome?.channel?.isEnabled || false, guildConfig?.welcomeSetting?.welcome?.user?.isEnabled || false]);
                        eGChannel.value = guildConfig?.welcomeSetting?.goodbye?.channel?.id || '';
                        setGoodMessages([guildConfig?.welcomeSetting?.goodbye?.channel?.message || {}, guildConfig?.welcomeSetting?.goodbye?.user?.message || {}]);
                        setGoodbyeStatus([guildConfig?.welcomeSetting?.goodbye?.isEnabled || false, guildConfig?.welcomeSetting?.goodbye?.channel?.isEnabled || false, guildConfig?.welcomeSetting?.goodbye?.user?.isEnabled || false]);
                        setChangePopup(false);
                        return;
                    } else if (type == 'save') {
                        setPopupStatusSaving(true);
                        setSavingChangesLoading(true);
                        const newGuildConfig: GuildConfig = {
                            guildId: guild.id,
                            welcomeSetting: {
                                welcome: {
                                    isEnabled: welcomeStatus[0],
                                    channel: {
                                        isEnabled: welcomeStatus[1],
                                        id: eWChannel.value,
                                        message: welMessages[0]
                                    },
                                    user: {
                                        isEnabled: welcomeStatus[2],
                                        message: welMessages[1]
                                    }
                                },
                                goodbye: {
                                    isEnabled: goodbyeStatus[0],
                                    channel: {
                                        isEnabled: goodbyeStatus[1],
                                        id: eGChannel.value,
                                        message: goodMessages[0]
                                    },
                                    user: {
                                        isEnabled: goodbyeStatus[2],
                                        message: goodMessages[1]
                                    }
                                },
                            }
                        }
                        try {
                            const saveStatus = await saveGuildConfig(newGuildConfig);

                            setChangePopup(false);
                            setSavingChangesLoading(false);
                            console.info(saveStatus);
                            setTimeout(() => {
                                const e = document.getElementById('statusSavingText');
                                if (e) e.textContent = saveStatus.statusText;
                            }, 500);
                            setTimeout(() => {
                                setPopupStatusSaving(false);
                            }, 2000);
                        } catch (error) {
                            setSavingChangesLoading(false);
                            console.error(error);
                            setTimeout(() => {
                                const e = document.getElementById('statusSavingText');
                                if (e) e.textContent = `${error}`;
                            }, 500);
                            setTimeout(() => {
                                setPopupStatusSaving(false);
                            }, 5000);
                        };
                    };
                };
            }
    };
    // const changeGuild = (g: PartialGuild) => {
    //     const oldType = dashboardType;
    //     const nG = guilds?.find(x => x.id === g.id) || guild;
    //     if(oldType == 'user')setChangePanelLoading(true);
    //     console.log(oldType, changePanelLoading);
    //     // router.push(`/dashboard/server/${oldType == 'user' ? 'loading' : nG?.id}`);
    //     router.push(`/dashboard/server/${nG?.id}`);
    //     setTimeout(() => {
    //         if(nG){
    //             updateGuild(nG);
    //             setGConfig(nG);
    //         };
    //     }, 50);
    //     setTimeout(() => {
    //         // if(oldType == 'user')router.push(`/dashboard/server/${nG?.id}`);
    //         setChangePanelLoading(false);
    //     }, 200);
    //     fetchGuilds();
    // };
    const logout = async () => {
        setLogging_out(true);
        try{
            if(window.location.hostname === hostname){await postAuthLogout();}
            else await postAuthLogoutLocalhost();

            window.location.pathname = '/dashboard';
            setLogging_out(false);

        }catch(error){
            console.error(error);
            setErrorPopup({ title: 'Logout failed!', message: 'Please try refreshing the page.', show: true });
            setLogging_out(false);
        }
    };

    // const exampleMessage: BaseMessageOptions = {
    //     content: "Hello world! This is a test message.\nIt has multiple lines.",
    //     embeds: [
    //         {
    //             title: "Example Embed 1",
    //             description: "This is the description for the first embed.",
    //             color: 0x5865F2, // Discord Blurple
    //             author: { name: "Author Name", icon_url: "https://placehold.co/40x40/7289da/ffffff?text=A" },
    //             fields: [
    //                 { name: "Field 1 (Inline)", value: "Value 1", inline: true },
    //                 { name: "Field 2 (Inline)", value: "Value 2", inline: true },
    //                 { name: "Field 3 (Not Inline)", value: "This field takes the full width.", inline: false },
    //             ],
    //             footer: { text: "Footer Text", icon_url: "https://placehold.co/40x40/43b581/ffffff?text=F" },
    //             timestamp: new Date().toISOString(),
    //              thumbnail: { url: "https://placehold.co/80x80/f04747/ffffff?text=Thumb" },
    //         },
    //          {
    //              title: "Example Embed 2 (No Color)",
    //              description: "This embed has no color specified and includes an image.",
    //              image: { url: "https://placehold.co/600x200/ffffff/000000?text=Image+Placeholder" }
    //          }
    //     ],
    //     components: [
    //         {
    //             type: ComponentType.ActionRow,
    //             components: [
    //                 { type: ComponentType.Button, style: ButtonStyle.Primary, label: "Primary Button" },
    //                 { type: ComponentType.Button, style: ButtonStyle.Success, label: "Success" },
    //                 { type: ComponentType.Button, style: ButtonStyle.Danger, label: "Danger", disabled: true },
    //             ]
    //         },
    //         {
    //             type: ComponentType.ActionRow,
    //             components: [
    //                  { type: ComponentType.Button, style: ButtonStyle.Link, label: "Link Button", url: "https://google.com" },
    //                  { type: ComponentType.Button, style: ButtonStyle.Secondary, label: "Secondary" },
    //             ]
    //         }
    //     ]
    // };

    type messageChangeType = 'wel' | 'good' | 'send';
    const handleMessageChange = (
        type: messageChangeType,
        index: number,
        message: RESTPostAPIChannelMessageJSONBody,
        indexElements?: number,
        deleteElements?: boolean
    ) => {
        if (indexElements === undefined) indexElements = 0;

        const updateList = (setter: React.Dispatch<React.SetStateAction<RESTPostAPIChannelMessageJSONBody[]>>) => {
            setter(list => {
                const updated = [...list];
                const target = { ...updated[index] };

                if (deleteElements) {
                    if (!target.embeds) return list;

                    target.embeds = typeof indexElements === 'number'
                        ? target.embeds.filter((_, i) => i !== indexElements)
                        : [];

                    updated[index] = target;
                    return updated;
                }

                if (message.content !== undefined) {
                    target.content = message.content;
                }

                if (message.embeds !== undefined) {
                    const embeds = target.embeds ?? [];
                    embeds[indexElements] = message.embeds[0] ?? {};
                    target.embeds = embeds;
                }

                if (message.components !== undefined) {
                    const components = target.components ?? [];
                    components[indexElements] = message.components[0] ?? {};
                    target.components = components;
                }

                if (message.allowed_mentions !== undefined) {
                    target.allowed_mentions = message.allowed_mentions;
                }

                if (message.tts !== undefined) {
                    target.tts = message.tts;
                }

                updated[index] = target;
                return updated;
            });
        };

        if (type === 'wel') updateList(setWelMessages);
        if (type === 'good') updateList(setGoodMessages);
        if (type === 'send') updateList(setSendMessages);
        setChangePopup(true);
    };
    
    return (pathname.split('/')[2] == 'invite' || (dashboardType == 'server' && guild && !guild.bot_here)) ? (<div className="page" id="page">
            <BackgroundFixed id="background" />
            <div style={{ height: "100vh", width: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", }}>
                <div id="page" style={{ width: '100%', }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                        <div style={{ fontSize: '1.5rem' }}>This server does not have Yumi Bot.</div>
                        <br />
                        <div style={{ fontSize: '1.2rem' }}>Please invite Yumi Bot to this server.</div>
                        <br />
                        <Link href={`https://discord.com/oauth2/authorize?client_id=1210178730836893719&scope=bot+applications.commands&guild_id=${guild?.id}&response_type=code&redirect_uri=${origin}/dashboard/invite_fallback`} style={{ color: '#fff', textDecoration: 'none', backgroundColor: '#4d7cff', padding: '10px 10px', borderRadius: 5, }}>Invite Yumi Bot</Link>
                        <span>or</span>
                        <Link href={'/dashboard'} style={{ color: '#fff', textDecoration: 'none', backgroundColor: '#ff3333', padding: '10px 40px', borderRadius: 5, marginTop: 10, cursor: 'pointer', }}>Back</Link>
                    </div>
                </div>
            </div>
        </div>) : pathname.split('/')[2] == 'invite_fallback' ? (<div className="page" id="page">
            {(()=>{
                const searchParamUrl = useSearchParams();

                useEffect(() => {
                    const guildId = searchParamUrl.get('guild_id');
                    const code = searchParamUrl.get('code');
                    
                    if(guildId && code){
                        router.push(`/dashboard/server/${guildId}/overview`);
                    }else{
                        router.push(`/dashboard`);
                    };
                }, []);
                
                return (<>
                <BackgroundFixed id="background" />
                <div style={{ height: "100vh", width: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", }}>
                    <Spinner_ring />
                </div></>)})()}
        </div>) : dashboardType ? (
        <div className="page" id="page">
            {/* Background Fixed */}
            <BackgroundFixed id="background" />

            {/* Top */}
            <div style={{ marginTop: '60px', }} />

            {/* Menu */}
            <DashPage><div>
                {!changePanelLoading && <DashPanel id="panel" key={pathname}><div>
                    {guild ?
                        <div id="server" className={dashboardType == 'server' ? 'show' : 'hide'}>{
                            // general
                            location.pathname.split('/')[4] == undefined || location.pathname.split('/')[4] == 'overview' ?
                            <div>
                                <div id='title'>Overview</div>

                                <div id="line" style={{ borderBottom: '1px #fff solid', margin: '20px 50px', }} />

                                <DashPageServerOverview>
                                    <div id='total_members' style={{ backgroundColor: 'rgba(137, 43, 226, 0.3)', borderColor: 'blueviolet', }}>
                                        <div id="title">
                                            <FaUsers id="icon" style={{ backgroundColor: '#bd24ff', }} />
                                            <h1>Total Members</h1>
                                        </div>
                                        <div id="main">{guild.data.members?.length || 0}</div>
                                        <div id="sub">
                                            <h4>Bots: {guild.data.members?.filter(m=>m.user.bot == true)?.length || 0}</h4>
                                        </div>
                                    </div>
                                    <div id='channels' style={{ backgroundColor: 'rgba(43, 226, 61, 0.3)', borderColor: '#00fa00', }}>
                                        <div id="title">
                                            <FaHashtag id="icon" style={{ backgroundColor: '#0a7e18ff', }} />
                                            <h1>Channels</h1>
                                        </div>
                                        <div id="sub">
                                            <h4>Text channels: {guild.data.channels.filter(c=>c.type == 0).length || 0}</h4>
                                            <h4>Voice channels: {guild.data.channels.filter(c=>c.type == 2).length || 0}</h4>
                                        </div>
                                    </div>
                                    <div id='security' style={{ backgroundColor: 'rgba(226, 43, 147, 0.3)', borderColor: 'pink', }}>
                                        <div id="title">
                                            <FaShield id="icon" style={{ backgroundColor: '#ff24d3ff', }} />
                                            <h1>Security</h1>
                                        </div>
                                        <div id="sub">
                                            <h4>Status: disabled</h4>
                                            <h4>Warnings Count: 0</h4>
                                        </div>
                                    </div>
                                </DashPageServerOverview>
                            </div> :

                            location.pathname.split('/')[4] == ('settings') ?
                            <div>
                                <div id='title'>Server Settings</div>

                                <div id="line" style={{ borderBottom: '1px #fff solid', margin: '20px 50px', }} />

                                <DashPageServerGeneralSettings>
                                    <div id="language">
                                        Language
                                        <div>
                                            <Select translate="no" name="language" defaultValue={guild.data.preferred_locale} onChange={() => setChangePopup(true)}>
                                                {Object.entries(localeLabels).map(([code, label]) => (
                                                    <option key={code} value={code}>
                                                        {label}
                                                    </option>
                                                ))}
                                            </Select>
                                        </div>
                                    </div>

                                    {/* <div id="line" style={{ borderBottom: '1px #ffffff80 solid', margin: '20px 50px', }} /> */}
                                    <br />

                                    <div id="prefix">
                                        Prefix
                                        <div>
                                            <InputField name="prefix" minLength={1} maxLength={1} placeholder='Example: ?' defaultValue={guild.database.config.prefix} onChange={() => setChangePopup(true)} />
                                        </div>
                                    </div>
                                </DashPageServerGeneralSettings>
                            </div> :

                            location.pathname.split('/')[4] == ('premium') ?
                            <div>
                                <div id='title'>Bot Premium</div>

                                <div id="line" style={{ borderBottom: '1px #fff solid', margin: '20px 50px', }} />

                                {(()=>{
                                const check_mark = <h3 style={{ color: '#86ffa3', fontWeight: 900, fontSize: 'larger' }}>✔</h3>;
                                const wrong_mark = <h3 style={{ color: '#ff4141', fontWeight: 900, fontSize: 'larger' }}>✘</h3>;
                                return(<DashPageServerGeneralPremium $premiumType={premiumType}>
                                    <div id="type" onClick={() => setPremiumType(premiumType == 0 ? 1 : 0)}>
                                        <div id="Monthly">Monthly</div>
                                        <div id="Yearly">Yearly</div>
                                        <div id="switch" />
                                    </div>

                                    <div id="pricing">
                                        <div id="free">
                                            <h1>Free</h1>
                                            <h3>{premiumType == 0 ? '฿0/lifetime' : '฿0/lifetime'}</h3>
                                            <div>
                                                {check_mark}
                                                <h3 id='text'>Up maximum <b>message limit</b> to 100</h3>
                                            </div>
                                            <hr />
                                            <div>
                                                {wrong_mark}
                                                <h3 id='text'>More customizable <b>audit log</b></h3>
                                            </div>
                                            <hr />
                                            <div>
                                                {wrong_mark}
                                                <h3 id='text'>More <b>temporary queue</b> slots available</h3>
                                            </div>
                                            <hr />
                                            <div>
                                                {wrong_mark}
                                                <h3 id='text'>More <b>saved queue lists</b></h3>
                                            </div>
                                            <hr />
                                            <div>
                                                {check_mark}
                                                <h3 id='text'><b>Standard</b> Music Server in CA</h3>
                                            </div>
                                            <button>Try Now!</button>
                                        </div>
                                        <div id="tier1">
                                            <h1>Tier 1</h1>
                                            <h3>{premiumType == 0 ? '฿99/Monthly' : '฿699/Yearly'}</h3>
                                            <div>
                                                {check_mark}
                                                <h3 id='text'>Up maximum <b>message limit</b> to 200</h3>
                                            </div>
                                            <hr />
                                            <div>
                                                {check_mark}
                                                <h3 id='text'>More customizable <b>audit log</b></h3>
                                            </div>
                                            <hr />
                                            <div>
                                                {check_mark}
                                                <h3 id='text'>More <b>temporary queue</b> slots available</h3>
                                            </div>
                                            <hr />
                                            <div>
                                                {check_mark}
                                                <h3 id='text'>More <b>saved queue lists</b></h3>
                                            </div>
                                            <hr />
                                            <div>
                                                {check_mark}
                                                <h3 id='text'><b>Standard</b> Music Server in CA</h3>
                                                {/* <div data-tag="unavailable" /> */}
                                            </div>
                                            <button>Try Now!</button>
                                        </div>
                                        <div id="tier2">
                                            <h1>Tier 2</h1>
                                            <h3>{premiumType == 0 ? '฿119/Monthly' : '฿1399/Yearly'}</h3>
                                            <div>
                                                {check_mark}
                                                <h3 id='text'>Up maximum <b>message limit</b> to 300</h3>
                                            </div>
                                            <hr />
                                            <div>
                                                {check_mark}
                                                <h3 id='text'>More customizable <b>audit log</b></h3>
                                            </div>
                                            <hr />
                                            <div>
                                                {check_mark}
                                                <h3 id='text'>More <b>temporary queue</b> slots available</h3>
                                            </div>
                                            <hr />
                                            <div>
                                                {check_mark}
                                                <h3 id='text'>More <b>saved queue lists</b></h3>
                                            </div>
                                            <hr />
                                            <div>
                                                {check_mark}
                                                <h3 id='text'><b>Premium</b> Music Server</h3>
                                                {/* <p>{'['}Global{']'}</p> */}
                                                <div data-tag='not_support' data-text='Function is not supported'></div>
                                                {/* <div data-tag="unavailable" /> */}
                                            </div>
                                            <button>Try Now!</button>
                                        </div>
                                    </div>

                                    <div id="table">
                                        {/* <div style={{ marginTop: '35px', fontSize: '25px' }} id= 'title'>Premium plan comparison table</div> */}

                                        <div id="line" />

                                        <div id="ptable">
                                            <PricingTableWrapper>
                                                <PricingTable>
                                                    <thead>
                                                        <tr>
                                                            <PricingTH>Features</PricingTH>
                                                            <PricingTH>Free</PricingTH>
                                                            <PricingTH>Tier 1</PricingTH>
                                                            <PricingTH>Tier 2</PricingTH>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <PlanName>Price</PlanName>
                                                            <PricingTD>{premiumType == 0 ? '฿0/lifetime' : '฿0/lifetime'}</PricingTD>
                                                            <PricingTD>{premiumType == 0 ? '฿99/Monthly' : '฿699/Yearly'}</PricingTD>
                                                            <HighlightTD>{premiumType == 0 ? '฿199/Monthly' : '฿1399/Yearly'}</HighlightTD>
                                                        </tr>
                                                        <tr>
                                                            <PlanName>Maximum Message Limit</PlanName>
                                                            <PricingTD>200</PricingTD>
                                                            <PricingTD>1000</PricingTD>
                                                            <HighlightTD>Max</HighlightTD> 
                                                        </tr>
                                                        <tr>
                                                            <PlanName>More customizable audit log</PlanName>
                                                            <PricingTD>✘</PricingTD>
                                                            <PricingTD>✔</PricingTD>
                                                            <HighlightTD>✔</HighlightTD>
                                                        </tr>
                                                        <tr>
                                                            <PlanName>DM users a welcome/goodbye message</PlanName>
                                                            <PricingTD>✘</PricingTD>
                                                            <PricingTD>✔</PricingTD>
                                                            <HighlightTD>✔</HighlightTD>
                                                        </tr>
                                                        <tr>
                                                            <PlanName>More embeds for Welcome/Goodbye messages</PlanName>
                                                            <PricingTD>1</PricingTD>
                                                            <PricingTD>3</PricingTD>
                                                            <HighlightTD>Max</HighlightTD>
                                                        </tr>
                                                        <tr>
                                                            <PlanName>More temporary queue slots available</PlanName>
                                                            <PricingTD>✘</PricingTD>
                                                            <PricingTD>✔</PricingTD>
                                                            <HighlightTD>✔</HighlightTD>
                                                        </tr>
                                                        <tr>
                                                            <PlanName>More saved queue lists</PlanName>
                                                            <PricingTD>✘</PricingTD>
                                                            <PricingTD>✔</PricingTD>
                                                            <HighlightTD>✔</HighlightTD>
                                                        </tr>
                                                        <tr>
                                                            <PlanName>Music Server</PlanName>
                                                            <PricingTD>Standard</PricingTD>
                                                            <PricingTD>Premium</PricingTD>
                                                            <HighlightTD>Premium</HighlightTD>
                                                        </tr>
                                                    </tbody>
                                                </PricingTable>
                                            </PricingTableWrapper>
                                        </div>
                                    </div>
                                </DashPageServerGeneralPremium>)
                                })()}
                            </div> :

                            location.pathname.split('/')[4] == ('upgrade') ?
                            <div>
                                <div id='title'>Upgrade Yumi Bot</div>

                                <div id="line" style={{ borderBottom: '1px #fff solid', margin: '20px 50px', }} />

                                <div>There are no subscription plans at this time.</div>
                            </div> :

                            // functionSettings
                            location.pathname.split('/')[4] == ('welcome') ?
                            <div>
                                <div id='title'>Welcome & Goodbye</div>

                                <div id="line" style={{ borderBottom: '1px #fff solid', margin: '20px 50px', }} />

                                <DashPageServerFunctionWelcomeGoodBye $isEnabled={welcomeStatus} id="welcome">
                                    <div>
                                        <div id="title">
                                            <div id="name">Welcome</div>
                                            <div id="status" onClick={() => { setWelcomeStatus((v) => [!welcomeStatus[0], v[1], v[2]]); setChangePopup(true) }}>
                                                <div id="background" />
                                                <div id="text">{welcomeStatus[0] ? 'On' : 'off'}</div>
                                                <div id="switch" />
                                            </div>
                                        </div>

                                        <div>
                                            {/* <div id="line"/> */}
                                            <br />

                                            <div id="channel">
                                                <div id="title">
                                                    <div id="name">Send to channel</div>
                                                    <div id="status" onClick={() => { setWelcomeStatus((v) => [v[0], !welcomeStatus[1], v[2]]); setChangePopup(true) }}>
                                                        <div id="background" />
                                                        <div id="switch" />
                                                    </div>
                                                </div>
                                                <div id="message">
                                                    <div>
                                                        <div id="channel">
                                                            <h5>Channel</h5>
                                                            <Select translate="no" name="channel" defaultValue={guild.database.config.welcomeSetting?.welcome?.channel?.id || undefined} onChange={() => setChangePopup(true)} >
                                                                {guild.data.channels.filter((channel) => textChannelTypes.includes(channel.type)).map((channel) => <option key={channel.id} value={channel.id}>{channel.name}</option>)}
                                                            </Select>
                                                        </div>
                                                    </div>
                                                    {(() => {
                                                        const index: number = 0;
                                                        const tier = guild.database.membership?.tier || 'free';
                                                        const limits = typeof tier === 'number' ? welcome_limits[index == 0 ? 'c' : 'u'][`tier${tier}` as keyof typeof welcome_limits.c] : welcome_limits[index == 0 ? 'c' : 'u'].free;
                                                        const isLimit = (e: keyof typeof limits) => {
                                                            switch (e) {
                                                                case 'content':
                                                                    return (welMessages[index].content?.length || 0) > limits.content;
                                                                case 'embeds':
                                                                    return (welMessages[index].embeds?.length || 0) == limits.embeds.total;
                                                                default:
                                                                    return false;
                                                            };
                                                        };
                                                        const addEmbed = () => {
                                                            (!welMessages[index].embeds?.length || welMessages[index].embeds.length < limits.embeds.total) && setWelMessages(messages => {
                                                                if (!messages.length) return messages;
                                                                const updated = [...messages];
                                                                const first = { ...updated[index] };
                                                                const embeds = first.embeds ?? [];
                                                                first.embeds = [...embeds, {}];
                                                                updated[index] = first;
                                                                setChangePopup(true);
                                                                return updated;
                                                            });
                                                        }
                                                        return (<div>
                                                            <div id="editor">
                                                                <h5>Message</h5>
                                                                <TextLimit id="message" $isLimit={isLimit('content')} $textbg="unset">
                                                                    <DiscordFormatterWrapper>
                                                                        <TextArea onChange={(t) => { handleMessageChange('wel', index, { content: t.target.value }); setChangePopup(true) }} value={welMessages[index]?.content || ''} maxLength={discord_limits.content} />
                                                                    </DiscordFormatterWrapper>
                                                                    <div id="count">{(limits.content - (welMessages[index]?.content?.length || 0)) <= 50 && limits.content - (welMessages[index]?.content?.length || 0)}</div>
                                                                    <div id="text">{(limits.content - (welMessages[index]?.content?.length || 0)) <= 50 && <>Unlock the limits with <span onClick={() => router.push(`/dashboard/server/premium`)}>Premium</span></>}</div>
                                                                </TextLimit>
                                                                <h5>Embeds <div style={{ color: welMessages[index].embeds?.length == limits.embeds.total ? '#fa0000' : '#cfcfcf', }} data-text={isLimit('embeds') && 'Unlock the limits with Premium' || undefined} >{welMessages[index].embeds?.length || 0}/{limits.embeds.total}{isLimit('embeds') ? <TbCrown color='#e1ff00' /> : <TbPlus color='#fff' style={{ cursor: 'pointer' }} onClick={() => addEmbed()} />}</div></h5>
                                                                {welMessages[index]?.embeds ? welMessages[index].embeds.map(
                                                                    (embed, i) => <EmbedEditor key={i} id="embed" name={`Embed ${i + 1}`} onChange={(e, l) => { handleMessageChange('wel', index, { embeds: [e] }, i) }} initialEmbed={embed} deleteButton={true} onDelete={() => handleMessageChange('wel', index, {}, i, true)} defaultLimit={true} limits={limits.embeds} type={`wel${i + 1}` as "wel1" | "wel2"} tier={tier} />
                                                                ) : <></>}
                                                            </div>
                                                            <div id="preview-panel">
                                                                <h5>Preview</h5>
                                                                <MessagePreview id="preview" message={welMessages[index]} />
                                                                <h5>Variables</h5>
                                                                <div id="variables">
                                                                    <div><code>{'{userTag}'}</code>Mention of the user</div>
                                                                    <div><code>{'{userName}'}</code>User's name only (no tag)</div>
                                                                    <div><code>{'{userAvatar}'}</code>URL of the user's avatar</div>
                                                                    <div><code>{'{memberCount}'}</code>Total members in the server</div>
                                                                    <div><code>{'{serverName}'}</code>Name of the server</div>
                                                                    <div><code>{'{serverIcon}'}</code>URL of the server's icon</div>
                                                                </div>
                                                            </div>
                                                        </div>)
                                                    })()}
                                                </div>
                                            </div>

                                            <div id="line" />

                                            <div id="user">
                                                <div id="title">
                                                    <div id="name">Send to new user <div data-tag="premium" data-text="tier 1 or higher" /></div>
                                                    <div id="status" onClick={() => { setWelcomeStatus((v) => [v[0], v[1], !welcomeStatus[2]]); setChangePopup(true) }}>
                                                        <div id="background" />
                                                        <div id="switch" />
                                                    </div>
                                                </div>
                                                <div id="message">
                                                    {(() => {
                                                        const index: number = 1;
                                                        const tier = guild.database.membership?.tier || 'free';
                                                        const limits = typeof tier === 'number' ? welcome_limits[index == 0 ? 'c' : 'u'][`tier${tier}` as keyof typeof welcome_limits.u] : welcome_limits[index == 0 ? 'c' : 'u'].free;
                                                        const isLimit = (e: keyof typeof limits) => {
                                                            switch (e) {
                                                                case 'content':
                                                                    return (welMessages[index].content?.length || 0) > limits.content;
                                                                case 'embeds':
                                                                    return (welMessages[index].embeds?.length || 0) == limits.embeds.total;
                                                                default:
                                                                    return false;
                                                            };
                                                        };
                                                        const addEmbed = () => {
                                                            (!welMessages[index].embeds?.length || welMessages[index].embeds.length < limits.embeds.total) && setWelMessages(messages => {
                                                                if (!messages.length) return messages;
                                                                const updated = [...messages];
                                                                const first = { ...updated[index] };
                                                                const embeds = first.embeds ?? [];
                                                                first.embeds = [...embeds, {}];
                                                                updated[index] = first;
                                                                setChangePopup(true);
                                                                return updated;
                                                            });
                                                        }
                                                        return (<div>
                                                            <div id="editor">
                                                                <h5>Message</h5>
                                                                <TextLimit id="message" $isLimit={isLimit('content')} $textbg="unset">
                                                                    <DiscordFormatterWrapper>
                                                                        <TextArea onChange={(t) => { handleMessageChange('wel', index, { content: t.target.value }); setChangePopup(true) }} value={welMessages[index]?.content} maxLength={discord_limits.content} />
                                                                    </DiscordFormatterWrapper>
                                                                    <div id="count">{(limits.content - (welMessages[index]?.content?.length || 0)) <= 50 && limits.content - (welMessages[index]?.content?.length || 0)}</div>
                                                                    <div id="text">{(limits.content - (welMessages[index]?.content?.length || 0)) <= 50 && <>Unlock the limits with <span onClick={() => router.push(`/dashboard/server/premium`)}>Premium</span></>}</div>
                                                                </TextLimit>
                                                                <h5>Embeds <div style={{ color: welMessages[index].embeds?.length == limits.embeds.total ? '#fa0000' : '#cfcfcf', }} data-text={isLimit('embeds') && 'Unlock the limits with Premium' || undefined} >{welMessages[index].embeds?.length || 0}/{limits.embeds.total}{isLimit('embeds') ? <TbCrown color='#e1ff00' /> : <TbPlus color='#fff' style={{ cursor: 'pointer' }} onClick={() => addEmbed()} />}</div></h5>
                                                                {welMessages[index]?.embeds ? welMessages[index].embeds.map(
                                                                    (embed, i) => <EmbedEditor key={i} id="embed" name={`Embed ${i + 1}`} onChange={(e, l) => { handleMessageChange('wel', index, { embeds: [e] }, i) }} initialEmbed={embed} deleteButton={true} onDelete={() => handleMessageChange('wel', index, {}, i, true)} defaultLimit={true} limits={limits.embeds} type={`wel${i + 1}` as "wel1" | "wel2"} tier={tier} />
                                                                ) : <></>}
                                                            </div>
                                                            <div id="preview-panel">
                                                                <h5>Preview</h5>
                                                                <MessagePreview id="preview" message={welMessages[index]} />
                                                                <h5>Variables</h5>
                                                                <div id="variables">
                                                                    <div><code>{'{userTag}'}</code>Mention of the user</div>
                                                                    <div><code>{'{userName}'}</code>User's name only (no tag)</div>
                                                                    <div><code>{'{userAvatar}'}</code>URL of the user's avatar</div>
                                                                    <div><code>{'{memberCount}'}</code>Total members in the server</div>
                                                                    <div><code>{'{serverName}'}</code>Name of the server</div>
                                                                    <div><code>{'{serverIcon}'}</code>URL of the server's icon</div>
                                                                </div>
                                                            </div>
                                                        </div>)
                                                    })()}
                                                </div>
                                            </div>
                                            <br />
                                        </div>
                                    </div>
                                </DashPageServerFunctionWelcomeGoodBye>

                                {/* <div id="line" style={{ borderBottom: '1px #fff solid', margin: '20px 50px', }}/> */}
                                {/* <div id="line" style={{ height: 20, }}/> */}

                                <DashPageServerFunctionWelcomeGoodBye $isEnabled={goodbyeStatus} id="goodbye">
                                    <div>
                                        <div id="title">
                                            <div id="name">Goodbye</div>
                                            <div id="status" onClick={() => { setGoodbyeStatus((v) => [!goodbyeStatus[0], v[1], v[2]]); setChangePopup(true) }}>
                                                <div id="background" />
                                                <div id="text">{goodbyeStatus[0] ? 'On' : 'off'}</div>
                                                <div id="switch" />
                                            </div>
                                        </div>

                                        <div>
                                            {/* <div id="line"/> */}
                                            <br />

                                            <div id="channel">
                                                <div id="title">
                                                    <div id="name">Send to channel</div>
                                                    <div id="status" onClick={() => { setGoodbyeStatus((v) => [v[0], !goodbyeStatus[1], v[2]]); setChangePopup(true) }}>
                                                        <div id="background" />
                                                        <div id="switch" />
                                                    </div>
                                                </div>
                                                <div id="message">
                                                    <div>
                                                        <div id="channel">
                                                            <h5>Channel</h5>
                                                            <Select translate="no" name="channel" defaultValue={guild.database.config.welcomeSetting?.goodbye?.channel?.id || undefined} onChange={() => setChangePopup(true)} >
                                                                {guild.data.channels.filter((channel) => textChannelTypes.includes(channel.type)).map((channel) => <option key={channel.id} value={channel.id}>{channel.name}</option>)}
                                                            </Select>
                                                        </div>
                                                    </div>
                                                    {(() => {
                                                        const index: number = 0;
                                                        const tier = guild.database.membership?.tier || 'free';
                                                        const limits = typeof tier === 'number' ? welcome_limits[index == 0 ? 'c' : 'u'][`tier${tier}` as keyof typeof welcome_limits.c] : welcome_limits[index == 0 ? 'c' : 'u'].free;
                                                        const isLimit = (e: keyof typeof limits) => {
                                                            switch (e) {
                                                                case 'content':
                                                                    return (goodMessages[index].content?.length || 0) > limits.content;
                                                                case 'embeds':
                                                                    return (goodMessages[index].embeds?.length || 0) == limits.embeds.total;
                                                                default:
                                                                    return false;
                                                            };
                                                        };
                                                        const addEmbed = () => {
                                                            (!goodMessages[index].embeds?.length || goodMessages[index].embeds.length < limits.embeds.total) && setGoodMessages(messages => {
                                                                if (!messages.length) return messages;
                                                                const updated = [...messages];
                                                                const first = { ...updated[index] };
                                                                const embeds = first.embeds ?? [];
                                                                first.embeds = [...embeds, {}];
                                                                updated[index] = first;
                                                                setChangePopup(true);
                                                                return updated;
                                                            });
                                                        }
                                                        return (<div>
                                                            <div id="editor">
                                                                <h5>Message</h5>
                                                                <TextLimit id="message" $isLimit={isLimit('content')} $textbg="unset">
                                                                    <DiscordFormatterWrapper>
                                                                        <TextArea onChange={(t) => { handleMessageChange('good', index, { content: t.target.value }); setChangePopup(true) }} defaultValue={guild.database.config.welcomeSetting?.goodbye?.channel?.message?.content || undefined} value={goodMessages[index]?.content || ''} maxLength={discord_limits.content} />
                                                                    </DiscordFormatterWrapper>
                                                                    <div id="count">{(limits.content - (goodMessages[index]?.content?.length || 0)) <= 50 && limits.content - (goodMessages[index]?.content?.length || 0)}</div>
                                                                    <div id="text">{(limits.content - (goodMessages[index]?.content?.length || 0)) <= 50 && <>Unlock the limits with <span onClick={() => router.push(`/dashboard/server/premium`)}>Premium</span></>}</div>
                                                                </TextLimit>
                                                                <h5>Embeds <div style={{ color: goodMessages[index].embeds?.length == limits.embeds.total ? '#fa0000' : '#cfcfcf', }} data-text={isLimit('embeds') && 'Unlock the limits with Premium' || undefined} >{goodMessages[index].embeds?.length || 0}/{limits.embeds.total}{isLimit('embeds') ? <TbCrown color='#e1ff00' /> : <TbPlus color='#fff' style={{ cursor: 'pointer' }} onClick={() => addEmbed()} />}</div></h5>
                                                                {goodMessages[index]?.embeds ? goodMessages[index].embeds.map(
                                                                    (embed, i) => <EmbedEditor key={i} id="embed" name={`Embed ${i + 1}`} onChange={(e, l) => { handleMessageChange('good', index, { embeds: [e] }, i); console.log(l) }} initialEmbed={embed} deleteButton={true} onDelete={() => handleMessageChange('good', index, {}, i, true)} defaultLimit={true} limits={limits.embeds} type={`good${i + 1}` as "good1" | "good2"} tier={tier} />
                                                                ) : <></>}
                                                            </div>
                                                            <div id="preview-panel">
                                                                <h5>Preview</h5>
                                                                <MessagePreview id="preview" message={goodMessages[index]} />
                                                                <h5>Variables</h5>
                                                                <div id="variables">
                                                                    <div><code>{'{userTag}'}</code>Mention of the user</div>
                                                                    <div><code>{'{userName}'}</code>User's name only (no tag)</div>
                                                                    <div><code>{'{userAvatar}'}</code>URL of the user's avatar</div>
                                                                    <div><code>{'{memberCount}'}</code>Total members in the server</div>
                                                                    <div><code>{'{serverName}'}</code>Name of the server</div>
                                                                    <div><code>{'{serverIcon}'}</code>URL of the server's icon</div>
                                                                </div>
                                                            </div>
                                                        </div>)
                                                    })()}
                                                </div>
                                            </div>

                                            <div id="line" />

                                            <div id="user">
                                                <div id="title">
                                                    <div id="name">Send to new user <div data-tag="premium" data-text="tier 1 or higher" /></div>
                                                    <div id="status" onClick={() => { setGoodbyeStatus((v) => [v[0], v[1], !goodbyeStatus[2]]); setChangePopup(true) }}>
                                                        <div id="background" />
                                                        <div id="switch" />
                                                    </div>
                                                </div>
                                                <div id="message">
                                                    {(() => {
                                                        const index: number = 1;
                                                        const tier = guild.database.membership?.tier || 'free';
                                                        const limits = typeof tier === 'number' ? welcome_limits[index == 0 ? 'c' : 'u'][`tier${tier}` as keyof typeof welcome_limits.u] : welcome_limits[index == 0 ? 'c' : 'u'].free;
                                                        const isLimit = (e: keyof typeof limits) => {
                                                            switch (e) {
                                                                case 'content':
                                                                    return (goodMessages[index].content?.length || 0) > limits.content;
                                                                case 'embeds':
                                                                    return (goodMessages[index].embeds?.length || 0) == limits.embeds.total;
                                                                default:
                                                                    return false;
                                                            };
                                                        };
                                                        const addEmbed = () => {
                                                            (!goodMessages[index].embeds?.length || goodMessages[index].embeds.length < limits.embeds.total) && setGoodMessages(messages => {
                                                                if (!messages.length) return messages;
                                                                const updated = [...messages];
                                                                const first = { ...updated[index] };
                                                                const embeds = first.embeds ?? [];
                                                                first.embeds = [...embeds, {}];
                                                                updated[index] = first;
                                                                setChangePopup(true);
                                                                return updated;
                                                            });
                                                        }
                                                        return (<div>
                                                            <div id="editor">
                                                                <h5>Message</h5>
                                                                <TextLimit id="message" $isLimit={isLimit('content')} $textbg="unset">
                                                                    <DiscordFormatterWrapper>
                                                                        <TextArea onChange={(t) => { handleMessageChange('good', index, { content: t.target.value }); setChangePopup(true) }} value={goodMessages[index]?.content} maxLength={discord_limits.content} />
                                                                    </DiscordFormatterWrapper>
                                                                    <div id="count">{(limits.content - (goodMessages[index]?.content?.length || 0)) <= 50 && limits.content - (goodMessages[index]?.content?.length || 0)}</div>
                                                                    <div id="text">{(limits.content - (goodMessages[index]?.content?.length || 0)) <= 50 && <>Unlock the limits with <span onClick={() => router.push(`/dashboard/server/premium`)}>Premium</span></>}</div>
                                                                </TextLimit>
                                                                <h5>Embeds <div style={{ color: goodMessages[index].embeds?.length == limits.embeds.total ? '#fa0000' : '#cfcfcf', }} data-text={isLimit('embeds') && 'Unlock the limits with Premium' || undefined} >{goodMessages[index].embeds?.length || 0}/{limits.embeds.total}{isLimit('embeds') ? <TbCrown color='#e1ff00' /> : <TbPlus color='#fff' style={{ cursor: 'pointer' }} onClick={() => addEmbed()} />}</div></h5>
                                                                {goodMessages[index]?.embeds ? goodMessages[index].embeds.map(
                                                                    (embed, i) => <EmbedEditor key={i} id="embed" name={`Embed ${i + 1}`} onChange={(e, l) => { handleMessageChange('good', index, { embeds: [e] }, i); console.log(l) }} initialEmbed={embed} deleteButton={true} onDelete={() => handleMessageChange('good', index, {}, i, true)} defaultLimit={true} limits={limits.embeds} type={`good${i + 1}` as "good1" | "good2"} tier={tier} />
                                                                ) : <></>}
                                                            </div>
                                                            <div id="preview-panel">
                                                                <h5>Preview</h5>
                                                                <MessagePreview id="preview" message={goodMessages[index]} />
                                                                <h5>Variables</h5>
                                                                <div id="variables">
                                                                    <div><code>{'{userTag}'}</code>Mention of the user</div>
                                                                    <div><code>{'{userName}'}</code>User's name only (no tag)</div>
                                                                    <div><code>{'{userAvatar}'}</code>URL of the user's avatar</div>
                                                                    <div><code>{'{memberCount}'}</code>Total members in the server</div>
                                                                    <div><code>{'{serverName}'}</code>Name of the server</div>
                                                                    <div><code>{'{serverIcon}'}</code>URL of the server's icon</div>
                                                                </div>
                                                            </div>
                                                        </div>)
                                                    })()}
                                                </div>
                                            </div>
                                            <br />
                                        </div>
                                    </div>
                                </DashPageServerFunctionWelcomeGoodBye>
                            </div> :

                            location.pathname.split('/')[4] == ('send') ?
                            <div>
                                <div id='title'>Embeds</div>

                                <div id="line" style={{ borderBottom: '1px #fff solid', margin: '20px 50px', }} />

                                <DashPageServerFunctionSend>
                                    <div id="new"><TbPlus />Create a new embed</div>
                                </DashPageServerFunctionSend>
                            </div>


                            // : dashboardType == 'server' && null
                            : dashboardType == 'server' && <div>
                                <div>No Page</div>
                            </div>
                        }</div> : null
                    }{profile ?
                        <div id="user" className={dashboardType == 'user' ? 'show' : 'hide'}>{
                            // general
                            location.pathname.split('/')[3] == undefined || location.pathname.split('/')[3] == 'overview' ?
                                <div>
                                    <div id='title'>User Info</div>

                                    <div id="line" style={{ borderBottom: '1px #fff solid', margin: '20px 50px', }} />

                                    <DashPageServerGeneralInfo>
                                        <div id="name">Name : {profile.username}</div>
                                        {profile.avatar ? <div id="icon">Icon : <a href={getAvatarURL(profile)} target="_blank" style={{ color: '#8abbff', }}>{profile.avatar}</a></div> : ''}
                                        <div id="id">Id : {profile.id}</div>
                                    </DashPageServerGeneralInfo>
                                </div> :

                            location.pathname.split('/')[3] == 'membership' ?
                                <div>
                                    <div id='title'>Membership</div>

                                    <div id="line" style={{ borderBottom: '1px #fff solid', margin: '20px 50px', }} />

                                    <div>There are no subscription plans at this time.</div>
                                </div> :

                            location.pathname.split('/')[3] == 'premium' ?
                                <div>
                                    <div id='title'>Manage Premium</div>

                                    <div id="line" style={{ borderBottom: '1px #fff solid', margin: '20px 50px', }} />

                                    <div>There are no subscription plans at this time.</div>
                                </div> :

                            // other
                            location.pathname.split('/')[3] == 'logout' ?
                                <div>
                                    <div id='title'>Logout</div>

                                    <div id="line" style={{ borderBottom: '1px #fff solid', margin: '20px 50px', }} />

                                    <div style={{ fontSize: 20, }}>Do you want to log out?</div>
                                    <button onClick={logout} style={{ padding: '10px 20px', border: '#e02424 2px solid', borderRadius: 5, backgroundColor: '#e34545', color: logging_out ? '#e34545' : '#fff', cursor: 'pointer', fontWeight: 'bold', fontSize: 20, position: 'relative', }}>
                                        Logout
                                        {logging_out ? <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', }}><Spinner_ring size={45} border={5} color="#fff"/></div> : <></>}
                                    </button>
                                    <div style={{ marginTop: 50, }}>Note: If you have any problems logging out, please contact the developer.</div>
                                </div>

                            : dashboardType == 'user' && <div>
                                <div>No Page</div>
                            </div>
                        }</div> : null
                    }

                    <ChangePopup id="changePopup" $isShow={changePopup}>
                        <div>
                            <div>There are unsaved changes!</div>
                            <div>
                                <div onClick={() => buttonSaveChange('cancel')}>Cancel</div>
                                <div onClick={() => buttonSaveChange('save')}>Save Changes</div>
                            </div>
                        </div>
                    </ChangePopup>
                </div></DashPanel>}
                <div id="loading" className={((dashboardType == 'server' && !guild) || (dashboardType == 'user' && !profile)) || changePanelLoading ? 'show' : ''}><Spinner_ring size={100} border={7}/></div>
            </div></DashPage>

            <PopupStatusSaving id="statusSaving" $isShow={popupStatusSaving}>
                <div>
                    <div style={{ fontSize: 40, fontWeight: 900, }}>Saving changes...</div>
                    <div>Please wait a moment.</div>
                    {savingChangesLoading ? <PulseLoader color='#fff' /> : <div id="statusSavingText" style={{ fontSize: 20, }}>Connecting to server...</div>}
                </div>
            </PopupStatusSaving>
        </div>
    ) : (<div>
        <BackgroundFixed id="background" />
        <div style={{ height: "100vh", width: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", }}>
            <div style={{ fontSize: "x-large", marginBottom: 15, }}>Invalid Dashboard Context</div>
            {(() => {
                const [count, setCount] = useState(5);
                useEffect(() => {
                    const interval = setInterval(() => {
                        setCount(prevCount => {
                            if (prevCount <= 1) {
                                clearInterval(interval);
                                window.location.href = '/dashboard';
                            }
                            return prevCount - 1;
                        });
                    }, 1000);
                    return () => clearInterval(interval);
                }, []);
                return <div style={{ fontSize: "medium", }}>Return to the home page in <span id="count" style={{ fontSize: "medium", }}>{count}</span></div>;
            })()}
        </div>
    </div>);
}

export default function DashboardSlugPage() {
    return (
        <Suspense fallback={<div>Loading dashboard...</div>}>
            <DashboardPageContent />
        </Suspense>
    );
}
