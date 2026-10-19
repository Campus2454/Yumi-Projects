'use client';
import { useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GuildContext } from "@/src/utils/contexts/Contexts";
import { DashPageServerFunctionWelcomeGoodBye, Select, TextArea, TextLimit, ChangePopup, PopupStatusSaving } from "@/src/utils/styles";
import { textChannelTypes, welcome_limits, discord_limits, GuildConfig } from "@/src/utils/types";
import { RESTPostAPIChannelMessageJSONBody } from "discord-api-types/v10";
import { DiscordFormatterWrapper } from "@/src/components/DiscordFormatterWrapper";
import EmbedEditor from "@/src/components/EmbedEditor";
import MessagePreview from "@/src/components/MessagePreview";
import { TbCrown, TbPlus } from "react-icons/tb";
import { PulseLoader } from "react-spinners";
import { saveGuildConfig } from "../../saveGuildConfig";
import { WelcomeSkeleton } from "@/src/components/DashboardSkeleton";

export default function ServerWelcomePage() {
    const { guild, updateGuild } = useContext(GuildContext);
    const router = useRouter();

    const [changePopup, setChangePopup] = useState<boolean | null>(null);
    const [popupStatusSaving, setPopupStatusSaving] = useState<boolean | null>(null);
    const [savingChangesLoading, setSavingChangesLoading] = useState(false);

    const [welcomeStatus, setWelcomeStatus] = useState([false, false, false]);
    const [goodbyeStatus, setGoodbyeStatus] = useState([false, false, false]);
    const [welMessages, setWelMessages] = useState<RESTPostAPIChannelMessageJSONBody[]>([{}, {}]);
    const [goodMessages, setGoodMessages] = useState<RESTPostAPIChannelMessageJSONBody[]>([{}, {}]);

    useEffect(() => {
        if (guild?.database?.config?.welcomeSetting) {
            const ws = guild.database.config.welcomeSetting;
            setWelMessages([ws.welcome?.channel?.message || {}, ws.welcome?.user?.message || {}]);
            setWelcomeStatus([ws.welcome?.isEnabled || false, ws.welcome?.channel?.isEnabled || false, ws.welcome?.user?.isEnabled || false]);
            setGoodMessages([ws.goodbye?.channel?.message || {}, ws.goodbye?.user?.message || {}]);
            setGoodbyeStatus([ws.goodbye?.isEnabled || false, ws.goodbye?.channel?.isEnabled || false, ws.goodbye?.user?.isEnabled || false]);
        }
    }, [guild]);

    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (changePopup) {
                event.preventDefault();
                event.returnValue = "";
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [changePopup]);

    if (!guild) return <WelcomeSkeleton />;

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
        setChangePopup(true);
    };

    const buttonSaveChange = async (type: 'save' | 'cancel') => {
        const guildConfig = guild?.database?.config;
        const eWelcome = document.querySelector('div[id="welcome"]') as HTMLDivElement;
        const eGoodbye = document.querySelector('div[id="goodbye"]') as HTMLDivElement;
        const eWChannel = eWelcome?.querySelector('select[name="channel"]') as HTMLSelectElement;
        const eGChannel = eGoodbye?.querySelector('select[name="channel"]') as HTMLSelectElement;

        if (eWChannel && eGChannel && guild) {
            if (type === 'cancel') {
                eWChannel.value = guildConfig?.welcomeSetting?.welcome?.channel?.id || '';
                setWelMessages([guildConfig?.welcomeSetting?.welcome?.channel?.message || {}, guildConfig?.welcomeSetting?.welcome?.user?.message || {}]);
                setWelcomeStatus([guildConfig?.welcomeSetting?.welcome?.isEnabled || false, guildConfig?.welcomeSetting?.welcome?.channel?.isEnabled || false, guildConfig?.welcomeSetting?.welcome?.user?.isEnabled || false]);
                eGChannel.value = guildConfig?.welcomeSetting?.goodbye?.channel?.id || '';
                setGoodMessages([guildConfig?.welcomeSetting?.goodbye?.channel?.message || {}, guildConfig?.welcomeSetting?.goodbye?.user?.message || {}]);
                setGoodbyeStatus([guildConfig?.welcomeSetting?.goodbye?.isEnabled || false, guildConfig?.welcomeSetting?.goodbye?.channel?.isEnabled || false, guildConfig?.welcomeSetting?.goodbye?.user?.isEnabled || false]);
                setChangePopup(false);
                return;
            } else if (type === 'save') {
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
                        }
                    }
                };

                try {
                    const saveStatus = await saveGuildConfig(newGuildConfig);
                    setChangePopup(false);
                    setSavingChangesLoading(false);

                    setTimeout(() => {
                        const e = document.getElementById('statusSavingText');
                        if (e) e.textContent = saveStatus.statusText;
                        updateGuild({
                            ...guild,
                            database: {
                                ...guild.database,
                                config: {
                                    ...guild.database.config,
                                    welcomeSetting: { ...newGuildConfig.welcomeSetting }
                                }
                            }
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
                }
            }
        }
    };

    return (
        <div>
            <div id='title'>Welcome & Goodbye</div>

            <div id="line" style={{ borderBottom: '1px #fff solid', margin: '20px 50px' }} />

            <DashPageServerFunctionWelcomeGoodBye $isEnabled={welcomeStatus} id="welcome">
                <div>
                    <div id="title">
                        <div id="name">Welcome</div>
                        <div id="status" onClick={() => { setWelcomeStatus((v) => [!welcomeStatus[0], v[1], v[2]]); setChangePopup(true); }}>
                            <div id="background" />
                            <div id="text">{welcomeStatus[0] ? 'On' : 'off'}</div>
                            <div id="switch" />
                        </div>
                    </div>

                    <div>
                        <br />

                        <div id="channel">
                            <div id="title">
                                <div id="name">Send to channel</div>
                                <div id="status" onClick={() => { setWelcomeStatus((v) => [v[0], !welcomeStatus[1], v[2]]); setChangePopup(true); }}>
                                    <div id="background" />
                                    <div id="switch" />
                                </div>
                            </div>
                            <div id="message">
                                <div>
                                    <div id="channel">
                                        <h5>Channel</h5>
                                        <Select translate="no" name="channel" defaultValue={guild.database?.config?.welcomeSetting?.welcome?.channel?.id || undefined} onChange={() => setChangePopup(true)}>
                                            {guild.data.channels?.filter((channel) => textChannelTypes.includes(channel.type)).map((channel) => (
                                                <option key={channel.id} value={channel.id}>{channel.name}</option>
                                            ))}
                                        </Select>
                                    </div>
                                </div>
                                {(() => {
                                    const index: number = 0;
                                    const tier = guild.database?.membership?.tier || 'free';
                                    const limits = typeof tier === 'number' ? welcome_limits[index === 0 ? 'c' : 'u'][`tier${tier}` as keyof typeof welcome_limits.c] : welcome_limits[index === 0 ? 'c' : 'u'].free;
                                    const isLimit = (e: keyof typeof limits) => {
                                        switch (e) {
                                            case 'content':
                                                return (welMessages[index]?.content?.length || 0) > limits.content;
                                            case 'embeds':
                                                return (welMessages[index]?.embeds?.length || 0) === limits.embeds.total;
                                            default:
                                                return false;
                                        }
                                    };
                                    const addEmbed = () => {
                                        (!welMessages[index]?.embeds?.length || welMessages[index].embeds.length < limits.embeds.total) && setWelMessages(messages => {
                                            if (!messages.length) return messages;
                                            const updated = [...messages];
                                            const first = { ...updated[index] };
                                            const embeds = first.embeds ?? [];
                                            first.embeds = [...embeds, {}];
                                            updated[index] = first;
                                            setChangePopup(true);
                                            return updated;
                                        });
                                    };
                                    return (
                                        <div>
                                            <div id="editor">
                                                <h5>Message</h5>
                                                <TextLimit id="message" $isLimit={isLimit('content')} $textbg="unset">
                                                    <DiscordFormatterWrapper>
                                                        <TextArea onChange={(t) => { handleMessageChange('wel', index, { content: t.target.value }); setChangePopup(true); }} value={welMessages[index]?.content || ''} maxLength={discord_limits.content} />
                                                    </DiscordFormatterWrapper>
                                                    <div id="count">{(limits.content - (welMessages[index]?.content?.length || 0)) <= 50 && limits.content - (welMessages[index]?.content?.length || 0)}</div>
                                                    <div id="text">{(limits.content - (welMessages[index]?.content?.length || 0)) <= 50 && <>Unlock the limits with <span onClick={() => router.push(`/dashboard/server/premium`)}>Premium</span></>}</div>
                                                </TextLimit>
                                                <h5>Embeds <div style={{ color: welMessages[index]?.embeds?.length === limits.embeds.total ? '#fa0000' : '#cfcfcf' }} data-text={isLimit('embeds') ? 'Unlock the limits with Premium' : undefined}>{welMessages[index]?.embeds?.length || 0}/{limits.embeds.total}{isLimit('embeds') ? <TbCrown color='#e1ff00' /> : <TbPlus color='#fff' style={{ cursor: 'pointer' }} onClick={() => addEmbed()} />}</div></h5>
                                                {welMessages[index]?.embeds ? welMessages[index].embeds.map(
                                                    (embed, i) => <EmbedEditor key={i} id="embed" name={`Embed ${i + 1}`} onChange={(e) => { handleMessageChange('wel', index, { embeds: [e] }, i); }} initialEmbed={embed} deleteButton={true} onDelete={() => handleMessageChange('wel', index, {}, i, true)} defaultLimit={true} limits={limits.embeds} type={`wel${i + 1}` as "wel1" | "wel2"} tier={tier} />
                                                ) : null}
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
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>

                        <div id="line" />

                        <div id="user">
                            <div id="title">
                                <div id="name">Send to new user <div data-tag="premium" data-text="tier 1 or higher" /></div>
                                <div id="status" onClick={() => { setWelcomeStatus((v) => [v[0], v[1], !welcomeStatus[2]]); setChangePopup(true); }}>
                                    <div id="background" />
                                    <div id="switch" />
                                </div>
                            </div>
                            <div id="message">
                                {(() => {
                                    const index: number = 1;
                                    const tier = guild.database?.membership?.tier || 'free';
                                    const limits = typeof tier === 'number' ? welcome_limits[index === 0 ? 'c' : 'u'][`tier${tier}` as keyof typeof welcome_limits.u] : welcome_limits[index === 0 ? 'c' : 'u'].free;
                                    const isLimit = (e: keyof typeof limits) => {
                                        switch (e) {
                                            case 'content':
                                                return (welMessages[index]?.content?.length || 0) > limits.content;
                                            case 'embeds':
                                                return (welMessages[index]?.embeds?.length || 0) === limits.embeds.total;
                                            default:
                                                return false;
                                        }
                                    };
                                    const addEmbed = () => {
                                        (!welMessages[index]?.embeds?.length || welMessages[index].embeds.length < limits.embeds.total) && setWelMessages(messages => {
                                            if (!messages.length) return messages;
                                            const updated = [...messages];
                                            const first = { ...updated[index] };
                                            const embeds = first.embeds ?? [];
                                            first.embeds = [...embeds, {}];
                                            updated[index] = first;
                                            setChangePopup(true);
                                            return updated;
                                        });
                                    };
                                    return (
                                        <div>
                                            <div id="editor">
                                                <h5>Message</h5>
                                                <TextLimit id="message" $isLimit={isLimit('content')} $textbg="unset">
                                                    <DiscordFormatterWrapper>
                                                        <TextArea onChange={(t) => { handleMessageChange('wel', index, { content: t.target.value }); setChangePopup(true); }} value={welMessages[index]?.content || ''} maxLength={discord_limits.content} />
                                                    </DiscordFormatterWrapper>
                                                    <div id="count">{(limits.content - (welMessages[index]?.content?.length || 0)) <= 50 && limits.content - (welMessages[index]?.content?.length || 0)}</div>
                                                    <div id="text">{(limits.content - (welMessages[index]?.content?.length || 0)) <= 50 && <>Unlock the limits with <span onClick={() => router.push(`/dashboard/server/premium`)}>Premium</span></>}</div>
                                                </TextLimit>
                                                <h5>Embeds <div style={{ color: welMessages[index]?.embeds?.length === limits.embeds.total ? '#fa0000' : '#cfcfcf' }} data-text={isLimit('embeds') ? 'Unlock the limits with Premium' : undefined}>{welMessages[index]?.embeds?.length || 0}/{limits.embeds.total}{isLimit('embeds') ? <TbCrown color='#e1ff00' /> : <TbPlus color='#fff' style={{ cursor: 'pointer' }} onClick={() => addEmbed()} />}</div></h5>
                                                {welMessages[index]?.embeds ? welMessages[index].embeds.map(
                                                    (embed, i) => <EmbedEditor key={i} id="embed" name={`Embed ${i + 1}`} onChange={(e) => { handleMessageChange('wel', index, { embeds: [e] }, i); }} initialEmbed={embed} deleteButton={true} onDelete={() => handleMessageChange('wel', index, {}, i, true)} defaultLimit={true} limits={limits.embeds} type={`wel${i + 1}` as "wel1" | "wel2"} tier={tier} />
                                                ) : null}
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
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                        <br />
                    </div>
                </div>
            </DashPageServerFunctionWelcomeGoodBye>

            <DashPageServerFunctionWelcomeGoodBye $isEnabled={goodbyeStatus} id="goodbye">
                <div>
                    <div id="title">
                        <div id="name">Goodbye</div>
                        <div id="status" onClick={() => { setGoodbyeStatus((v) => [!goodbyeStatus[0], v[1], v[2]]); setChangePopup(true); }}>
                            <div id="background" />
                            <div id="text">{goodbyeStatus[0] ? 'On' : 'off'}</div>
                            <div id="switch" />
                        </div>
                    </div>

                    <div>
                        <br />

                        <div id="channel">
                            <div id="title">
                                <div id="name">Send to channel</div>
                                <div id="status" onClick={() => { setGoodbyeStatus((v) => [v[0], !goodbyeStatus[1], v[2]]); setChangePopup(true); }}>
                                    <div id="background" />
                                    <div id="switch" />
                                </div>
                            </div>
                            <div id="message">
                                <div>
                                    <div id="channel">
                                        <h5>Channel</h5>
                                        <Select translate="no" name="channel" defaultValue={guild.database?.config?.welcomeSetting?.goodbye?.channel?.id || undefined} onChange={() => setChangePopup(true)}>
                                            {guild.data.channels?.filter((channel) => textChannelTypes.includes(channel.type)).map((channel) => (
                                                <option key={channel.id} value={channel.id}>{channel.name}</option>
                                            ))}
                                        </Select>
                                    </div>
                                </div>
                                {(() => {
                                    const index: number = 0;
                                    const tier = guild.database?.membership?.tier || 'free';
                                    const limits = typeof tier === 'number' ? welcome_limits[index === 0 ? 'c' : 'u'][`tier${tier}` as keyof typeof welcome_limits.c] : welcome_limits[index === 0 ? 'c' : 'u'].free;
                                    const isLimit = (e: keyof typeof limits) => {
                                        switch (e) {
                                            case 'content':
                                                return (goodMessages[index]?.content?.length || 0) > limits.content;
                                            case 'embeds':
                                                return (goodMessages[index]?.embeds?.length || 0) === limits.embeds.total;
                                            default:
                                                return false;
                                        }
                                    };
                                    const addEmbed = () => {
                                        (!goodMessages[index]?.embeds?.length || goodMessages[index].embeds.length < limits.embeds.total) && setGoodMessages(messages => {
                                            if (!messages.length) return messages;
                                            const updated = [...messages];
                                            const first = { ...updated[index] };
                                            const embeds = first.embeds ?? [];
                                            first.embeds = [...embeds, {}];
                                            updated[index] = first;
                                            setChangePopup(true);
                                            return updated;
                                        });
                                    };
                                    return (
                                        <div>
                                            <div id="editor">
                                                <h5>Message</h5>
                                                <TextLimit id="message" $isLimit={isLimit('content')} $textbg="unset">
                                                    <DiscordFormatterWrapper>
                                                        <TextArea onChange={(t) => { handleMessageChange('good', index, { content: t.target.value }); setChangePopup(true); }} defaultValue={guild.database?.config?.welcomeSetting?.goodbye?.channel?.message?.content || undefined} value={goodMessages[index]?.content || ''} maxLength={discord_limits.content} />
                                                    </DiscordFormatterWrapper>
                                                    <div id="count">{(limits.content - (goodMessages[index]?.content?.length || 0)) <= 50 && limits.content - (goodMessages[index]?.content?.length || 0)}</div>
                                                    <div id="text">{(limits.content - (goodMessages[index]?.content?.length || 0)) <= 50 && <>Unlock the limits with <span onClick={() => router.push(`/dashboard/server/premium`)}>Premium</span></>}</div>
                                                </TextLimit>
                                                <h5>Embeds <div style={{ color: goodMessages[index]?.embeds?.length === limits.embeds.total ? '#fa0000' : '#cfcfcf' }} data-text={isLimit('embeds') ? 'Unlock the limits with Premium' : undefined}>{goodMessages[index]?.embeds?.length || 0}/{limits.embeds.total}{isLimit('embeds') ? <TbCrown color='#e1ff00' /> : <TbPlus color='#fff' style={{ cursor: 'pointer' }} onClick={() => addEmbed()} />}</div></h5>
                                                {goodMessages[index]?.embeds ? goodMessages[index].embeds.map(
                                                    (embed, i) => <EmbedEditor key={i} id="embed" name={`Embed ${i + 1}`} onChange={(e) => { handleMessageChange('good', index, { embeds: [e] }, i); }} initialEmbed={embed} deleteButton={true} onDelete={() => handleMessageChange('good', index, {}, i, true)} defaultLimit={true} limits={limits.embeds} type={`good${i + 1}` as "good1" | "good2"} tier={tier} />
                                                ) : null}
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
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>

                        <div id="line" />

                        <div id="user">
                            <div id="title">
                                <div id="name">Send to new user <div data-tag="premium" data-text="tier 1 or higher" /></div>
                                <div id="status" onClick={() => { setGoodbyeStatus((v) => [v[0], v[1], !goodbyeStatus[2]]); setChangePopup(true); }}>
                                    <div id="background" />
                                    <div id="switch" />
                                </div>
                            </div>
                            <div id="message">
                                {(() => {
                                    const index: number = 1;
                                    const tier = guild.database?.membership?.tier || 'free';
                                    const limits = typeof tier === 'number' ? welcome_limits[index === 0 ? 'c' : 'u'][`tier${tier}` as keyof typeof welcome_limits.u] : welcome_limits[index === 0 ? 'c' : 'u'].free;
                                    const isLimit = (e: keyof typeof limits) => {
                                        switch (e) {
                                            case 'content':
                                                return (goodMessages[index]?.content?.length || 0) > limits.content;
                                            case 'embeds':
                                                return (goodMessages[index]?.embeds?.length || 0) === limits.embeds.total;
                                            default:
                                                return false;
                                        }
                                    };
                                    const addEmbed = () => {
                                        (!goodMessages[index]?.embeds?.length || goodMessages[index].embeds.length < limits.embeds.total) && setGoodMessages(messages => {
                                            if (!messages.length) return messages;
                                            const updated = [...messages];
                                            const first = { ...updated[index] };
                                            const embeds = first.embeds ?? [];
                                            first.embeds = [...embeds, {}];
                                            updated[index] = first;
                                            setChangePopup(true);
                                            return updated;
                                        });
                                    };
                                    return (
                                        <div>
                                            <div id="editor">
                                                <h5>Message</h5>
                                                <TextLimit id="message" $isLimit={isLimit('content')} $textbg="unset">
                                                    <DiscordFormatterWrapper>
                                                        <TextArea onChange={(t) => { handleMessageChange('good', index, { content: t.target.value }); setChangePopup(true); }} value={goodMessages[index]?.content || ''} maxLength={discord_limits.content} />
                                                    </DiscordFormatterWrapper>
                                                    <div id="count">{(limits.content - (goodMessages[index]?.content?.length || 0)) <= 50 && limits.content - (goodMessages[index]?.content?.length || 0)}</div>
                                                    <div id="text">{(limits.content - (goodMessages[index]?.content?.length || 0)) <= 50 && <>Unlock the limits with <span onClick={() => router.push(`/dashboard/server/premium`)}>Premium</span></>}</div>
                                                </TextLimit>
                                                <h5>Embeds <div style={{ color: goodMessages[index]?.embeds?.length === limits.embeds.total ? '#fa0000' : '#cfcfcf' }} data-text={isLimit('embeds') ? 'Unlock the limits with Premium' : undefined}>{goodMessages[index]?.embeds?.length || 0}/{limits.embeds.total}{isLimit('embeds') ? <TbCrown color='#e1ff00' /> : <TbPlus color='#fff' style={{ cursor: 'pointer' }} onClick={() => addEmbed()} />}</div></h5>
                                                {goodMessages[index]?.embeds ? goodMessages[index].embeds.map(
                                                    (embed, i) => <EmbedEditor key={i} id="embed" name={`Embed ${i + 1}`} onChange={(e) => { handleMessageChange('good', index, { embeds: [e] }, i); }} initialEmbed={embed} deleteButton={true} onDelete={() => handleMessageChange('good', index, {}, i, true)} defaultLimit={true} limits={limits.embeds} type={`good${i + 1}` as "good1" | "good2"} tier={tier} />
                                                ) : null}
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
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                        <br />
                    </div>
                </div>
            </DashPageServerFunctionWelcomeGoodBye>

            <ChangePopup id="changePopup" $isShow={changePopup}>
                <div>
                    <div>There are unsaved changes!</div>
                    <div>
                        <div onClick={() => buttonSaveChange('cancel')}>Cancel</div>
                        <div onClick={() => buttonSaveChange('save')}>Save Changes</div>
                    </div>
                </div>
            </ChangePopup>

            <PopupStatusSaving id="statusSaving" $isShow={popupStatusSaving}>
                <div>
                    <div style={{ fontSize: 40, fontWeight: 900 }}>Saving changes...</div>
                    <div>Please wait a moment.</div>
                    {savingChangesLoading ? <PulseLoader color='#fff' /> : <div id="statusSavingText" style={{ fontSize: 20 }}>Connecting to server...</div>}
                </div>
            </PopupStatusSaving>
        </div>
    );
}
