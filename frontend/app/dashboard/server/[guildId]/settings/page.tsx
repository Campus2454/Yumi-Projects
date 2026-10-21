'use client';
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useGuildSettings } from "@/src/utils/hooks/useGuildData";
import { DashPageServerGeneralSettings, Select, InputField, ChangePopup, PopupStatusSaving } from "@/src/utils/styles";
import { localeLabels, GuildConfig } from "@/src/utils/types";
import { Locale } from "discord-api-types/v10";
import { PulseLoader } from "react-spinners";
import { saveGuildConfig } from "../../saveGuildConfig";
import { SettingsSkeleton } from "@/src/components/DashboardSkeleton";

export default function ServerSettingsPage() {
    const guildId = useParams().guildId as string;
    const { data, mutate } = useGuildSettings(guildId);
    const [changePopup, setChangePopup] = useState<boolean | null>(null);
    const [popupStatusSaving, setPopupStatusSaving] = useState<boolean | null>(null);
    const [savingChangesLoading, setSavingChangesLoading] = useState(false);

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

    if (!data) return <SettingsSkeleton />;

    const buttonSaveChange = async (type: 'save' | 'cancel') => {
        const eLang = document.querySelector('select[name="language"]') as HTMLSelectElement;
        const ePrefix = document.querySelector('input[name="prefix"]') as HTMLInputElement;

        if (eLang && ePrefix && data) {
            if (type === 'cancel') {
                eLang.value = data.preferred_locale || 'en_US';
                ePrefix.value = data.prefix || '!';
                setChangePopup(false);
                return;
            } else if (type === 'save') {
                let isSave = false;
                [eLang, ePrefix].forEach((e) => {
                    if (!e.value) {
                        e.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        e.style.transition = '0.5s';
                        e.style.position = 'fixed';
                        e.style.animation = 'shake 0.1s infinite';
                        e.style.backgroundColor = 'red';
                        setTimeout(() => {
                            e.style.position = 'static';
                            e.style.animation = '';
                            e.style.backgroundColor = '';
                        }, 500);
                        isSave = false;
                    } else if (e.value) {
                        isSave = true;
                    }
                });

                if (isSave) {
                    setPopupStatusSaving(true);
                    setSavingChangesLoading(true);

                    const guildConfig: GuildConfig = {
                        guildId,
                        guildSettings: {
                            language: eLang.value as Locale,
                            prefix: ePrefix.value,
                        },
                    };

                    try {
                        const saveStatus = await saveGuildConfig(guildConfig);
                        setChangePopup(false);
                        setSavingChangesLoading(false);

                        setTimeout(() => {
                            const e = document.getElementById('statusSavingText');
                            if (e) e.textContent = saveStatus.statusText;
                            mutate({ ...data, prefix: saveStatus.config.prefix, preferred_locale: saveStatus.config.language }, { revalidate: false });
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
        }
    };

    return (
        <div>
            <div id='title'>Server Settings</div>

            <div id="line" style={{ borderBottom: '1px #fff solid', margin: '20px 50px' }} />

            <DashPageServerGeneralSettings>
                <div id="language">
                    Language
                    <div>
                        <Select key={data.preferred_locale} translate="no" name="language" defaultValue={data.preferred_locale} onChange={() => setChangePopup(true)}>
                            {Object.entries(localeLabels).map(([code, label]) => (
                                <option key={code} value={code}>
                                    {label}
                                </option>
                            ))}
                        </Select>
                    </div>
                </div>

                <br />

                <div id="prefix">
                    Prefix
                    <div>
                        <InputField key={data.prefix} name="prefix" minLength={1} maxLength={1} placeholder='Example: ?' defaultValue={data.prefix} onChange={() => setChangePopup(true)} />
                    </div>
                </div>
            </DashPageServerGeneralSettings>

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
