'use client';
import React, { useState, useEffect, useRef } from 'react';
import { APIEmbed, APIEmbedField } from 'discord-api-types/v10';
import { TbTrashX } from 'react-icons/tb';
import { discord_limits, welcome_limits } from '../utils/types';
import { TextLimit } from '../utils/styles';
import { useRouter } from 'next/navigation';
import { DiscordFormatterWrapper } from './DiscordFormatterWrapper';

type limits = {
    total_chars: boolean,
    author: boolean,
    title: boolean,
    description: boolean,
    fields: { name: boolean, value: boolean }[],
    footer: boolean,
};

interface EmbedEditorProps {
    onChange: (embed: APIEmbed, isLimits?: limits) => void;
    initialEmbed?: APIEmbed;
    name?: string;
    onDelete?: () => void;
    deleteButton?: boolean;
    defaultLimit?: boolean;
    limits?: typeof discord_limits.embeds;
    type?: 'wel1' | 'wel2' | 'good1' | 'good2' | 'send';
    tier?: 'free' | number;
}

const EmbedEditor: React.FC<EmbedEditorProps & Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>> = ({ onChange, initialEmbed, name, onDelete, deleteButton, defaultLimit, limits = discord_limits.embeds, type, tier = 'free', ...rest }) => {
    const [embed, setEmbed] = useState<APIEmbed>(initialEmbed || {
        title: '',
        url: '',
        description: '',
        color: 0x4f545c,
        footer: { text: '' },
        fields: [],
        author: { name: '', url: '', icon_url: '' },
        image: { url: '' },
        thumbnail: { url: '' },
        timestamp: '',
    });
    const [isLimits, setIsLimits] = useState<limits>();

    const [isMobile, setIsMobile] = useState<boolean>(false);
    const previousEmbedRef = useRef<APIEmbed>(initialEmbed || {
        title: '',
        url: '',
        description: '',
        color: 0x4f545c,
        footer: { text: '' },
        fields: [],
        author: { name: '', url: '', icon_url: '' },
        image: { url: '' },
        thumbnail: { url: '' },
        timestamp: '',
    });

    const [showEmbed, setShowEmbed] = useState(false);
    const [showFields, setShowFields] = useState<boolean[]>([]);
    const [showSections, setShowSections] = useState({
        author: false,
        footer: false,
        fields: false,
        image: false,
        thumbnail: false,
        timestamp: false,
        title: false,
        description: false,
        color: false,
        url: false,
    });
    const router = useRouter();

    useEffect(() => {
        const checkSize = () => setIsMobile(window.innerWidth < 1000);
        checkSize();
        window.addEventListener('resize', checkSize);
        return () => window.removeEventListener('resize', checkSize);
    }, []);


    const deepCompare = (obj1: any, obj2: any): boolean => {
        if (obj1 === obj2) {
            return true;
        }
        if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
            return false;
        }

        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);

        if (keys1.length !== keys2.length) {
            return false;
        }

        for (const key of keys1) {
            if (!obj2.hasOwnProperty(key) || !deepCompare(obj1[key], obj2[key])) {
                return false;
            }
        }
        return true;
    };

    useEffect(() => {
        // เปรียบเทียบ embed ใหม่กับ embed ก่อนหน้า โดยใช้ deepCompare
        if (!deepCompare(embed, previousEmbedRef.current)) {

            if(type && tier){
                let currentLimit = limits;
                if(type == 'wel1'){
                    currentLimit = welcome_limits.c[typeof tier == 'string' ? tier : `tier${tier}` as keyof typeof welcome_limits.c].embeds;
                }
                const defaultLimit = discord_limits.embeds; // max
    
                const isLimits: limits = {
                    title: embed.title ? embed.title.length > currentLimit.title && currentLimit.title < defaultLimit.title : false,
                    description: embed.description ? embed.description.length > currentLimit.description && currentLimit.description < defaultLimit.description : false,
                    fields: embed.fields ? [
                        ...embed.fields.map((f, i)=>{return{
                            name: f.name.length ? f.name.length > currentLimit.field_name && currentLimit.field_name < defaultLimit.field_name : false,
                            value: f.value.length ? f.value.length > currentLimit.field_value && currentLimit.field_value < defaultLimit.field_value : false
                        }})
                    ] : [],
                    footer: embed.footer?.text ? embed.footer.text.length > currentLimit.footer_text && currentLimit.footer_text < defaultLimit.footer_text : false,
                    author: embed.author?.name ? embed.author.name.length > currentLimit.author_name && currentLimit.author_name < defaultLimit.author_name : false,
                    total_chars: (() => {
                        const titleLen = embed.title?.length || 0;
                        const descLen = embed.description?.length || 0;
                        const footerLen = embed.footer?.text?.length || 0;
                        const authorLen = embed.author?.name?.length || 0;
                        const fieldsLen = embed.fields?.reduce((acc, f) => acc + (f.name?.length || 0) + (f.value?.length || 0), 0) || 0;
                    
                        const total = titleLen + descLen + footerLen + authorLen + fieldsLen;
                    
                        return total > currentLimit.total_chars && currentLimit.total_chars < defaultLimit.total_chars;
                    })(),
                };
    
                const anyLimits = Object.values(isLimits).some(Boolean);

                previousEmbedRef.current = embed;
                setIsLimits(anyLimits ? isLimits : undefined);
                return onChange(embed, anyLimits ? isLimits : undefined);
            };
            
            previousEmbedRef.current = embed; // อัปเดตค่า ref ด้วยค่า embed ใหม่
            onChange(embed);
        }
    }, [embed, onChange]);

    const updateField = (index: number, key: keyof APIEmbedField, value: string | boolean) => { // ใช้ APIEmbedField
        const updated = [...(embed.fields || [])];
        updated[index] = { ...updated[index], [key]: value };
        setEmbed({ ...embed, fields: updated });
    };

    const removeField = (index: number) => {
        const filtered = embed.fields?.filter((_, i) => i !== index) || [];
        setEmbed({ ...embed, fields: filtered });
        setShowFields(prev => prev.filter((_, i) => i !== index)); // update showFields
    };

    const moveField = (index: number, to: 'up' | 'down') => {
        if (!embed.fields) return;
        const newIndex = to === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= embed.fields.length) return;

        const updatedFields = [...embed.fields];
        [updatedFields[index], updatedFields[newIndex]] = [updatedFields[newIndex], updatedFields[index]];

        const updatedShowFields = [...showFields];
        [updatedShowFields[index], updatedShowFields[newIndex]] = [updatedShowFields[newIndex], updatedShowFields[index]];

        setEmbed({ ...embed, fields: updatedFields });
        setShowFields(updatedShowFields);
    };

    const handleAddField = () => {
        setEmbed({ ...embed, fields: [...(embed.fields || []), { name: '', value: '' }] });
        setShowFields(prev => [...prev, true]); // add to showFields
    };



    const toggleSection = (key: keyof typeof showSections) => {
        setShowSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const toggleFieldVisibility = (index: number) => {
        setShowFields(prev => {
            const newState = [...prev];
            newState[index] = !newState[index];
            return newState;
        });
    };

    const inputStyle: React.CSSProperties = {
        padding: '8px',
        margin: '4px 0',
        borderRadius: '8px',
        border: 'none',
        boxShadow: 'inset #00000033 2px 3px 2px 0px',
        width: '100%',
        boxSizing: 'border-box',
        backgroundColor: '#ad2e2e',
        color: '#fff',
        fontWeight: 'bold',
        resize: 'vertical',
        transition: 'all 0.5s, height 0s',
    };
    const buttonStyle: React.CSSProperties = {
        padding: '7px 16px',
        borderRadius: '10px',
        boxShadow: '#00000033 1px 2px 2px 2px',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        margin: '4px 0',
        transition: 'all 0.5s',
    };
    const sectionStyle: React.CSSProperties = {
        // border: '1px solid #ccc',
        backgroundColor: '#bd2e2e',
        borderRadius: '8px',
        padding: '8px',
        marginBottom: '8px',
        transition: 'all 0.5s',
    };
    const headerStyle: React.CSSProperties = {
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'all 0.5s',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
    };

    const [fieldValues, setFieldValues] = useState<{ [key: number]: { name: string; value: string; inline: boolean } }>({});

    useEffect(() => {
        const initialFieldValues: { [key: number]: { name: string; value: string; inline: boolean } } = {};
        embed.fields?.forEach((field, index) => {
            initialFieldValues[index] = {
                name: field.name || '',
                value: field.value || '',
                inline: field.inline || false,
            };
        });
        setFieldValues(initialFieldValues);
    }, [embed.fields]);

    const handleInputChange = (index: number, key: keyof APIEmbedField, value: string | boolean) => {
        setFieldValues(prev => ({
            ...prev,
            [index]: {
                ...prev[index],
                [key]: value,
            },
        }));

        updateField(index, key, value); // Update the actual embed state
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#d813134d', borderRadius: 10, padding: '0 20px', }} {...rest}>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold', padding: 10, width: '100%', cursor: 'pointer', transition: '0.3s', }} className='text-white hover:text-red-300' onClick={() => setShowEmbed(!showEmbed)}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <div style={{ transform: `rotate(${showEmbed ? 90 : 0}deg)`, transition: '0.3s', }}>{'>'}</div>
                    <div style={{ paddingLeft: 10, }}>{name || 'Embed'}</div>
                </div>
                {deleteButton && (
                    <TbTrashX className="text-white hover:text-red-400 transition duration-300 text-lg" onClick={(e) => {e.stopPropagation(); onDelete?.();}} />
                )}
            </div>
            {showEmbed && <div style={{ flex: 1, marginBottom: 20, }}>
                <div id='author' style={sectionStyle}>
                    <div style={headerStyle} onClick={() => toggleSection('author')}>
                        <img src="https://cdn.discordapp.com/emojis/1356522924500058122.webp?size=20" alt="" style={{ paddingRight: 5 }} />
                        Author
                        <div style={{ display: 'flex', justifyContent: 'center', position: 'absolute', right: 0, width: 24, height: 24, alignContent: 'center', transform: `rotateZ(90deg) rotateY(${showSections.author ? 0 : 180}deg)`, transition: '0.5s', }}>{'>'}</div>
                    </div>
                    {showSections.author && (
                        <>
                            <TextLimit $isLimit={isLimits?.author || false} $color='#bd2e2e'>
                                <DiscordFormatterWrapper>
                                    <input style={inputStyle} placeholder="Author Name" value={embed.author?.name || ''} onChange={e => setEmbed({ ...embed, author: { ...embed.author, name: e.target.value } })} maxLength={defaultLimit ? discord_limits.embeds.author_name : limits.author_name} />
                                </DiscordFormatterWrapper>
                                <div id="count">{(limits.author_name - (embed.author?.name.length || 0)) <= 20 && limits.author_name - (embed.author?.name.length || 0)}</div>
                                <div id="text">{(limits.author_name - (embed.author?.name.length || 0)) <= 20 && <>Unlock the limits with <span onClick={()=>router.push(`/dashboard/server/premium`)}>Premium</span></>}</div>
                            </TextLimit>
                            <input style={inputStyle} placeholder="Author URL" value={embed.author?.url || ''} onChange={e => setEmbed({ ...embed, author: embed.author && { ...embed.author, url: e.target.value } })} maxLength={512} />
                            <input style={inputStyle} placeholder="Author Icon URL" value={embed.author?.icon_url || ''} onChange={e => setEmbed({ ...embed, author: embed.author && { ...embed.author, icon_url: e.target.value } })} maxLength={512} />
                        </>
                    )}
                </div>

                <div id='title' style={sectionStyle}>
                    <div style={headerStyle} onClick={() => toggleSection('title')}>
                        <img src="https://cdn.discordapp.com/emojis/1356491259388104754.webp?size=20" alt="" style={{ paddingRight: 5 }} />
                        Title
                        <div style={{ display: 'flex', justifyContent: 'center', position: 'absolute', right: 0, width: 24, height: 24, alignContent: 'center', transform: `rotateZ(90deg) rotateY(${showSections.title ? 0 : 180}deg)`, transition: '0.5s', }}>{'>'}</div>
                    </div>
                    {showSections.title && (
                        <TextLimit $isLimit={isLimits?.title || false} $color='#bd2e2e'>
                            <input style={inputStyle} placeholder="Title" value={embed.title || ''} onChange={e => setEmbed({ ...embed, title: e.target.value })} maxLength={defaultLimit ? discord_limits.embeds.title : limits.title} />
                            <div id="count">{(limits.title - (embed.title?.length || 0)) <= 20 && limits.title - (embed.title?.length || 0)}</div>
                            <div id="text">{(limits.title - (embed.title?.length || 0)) <= 20 && <>Unlock the limits with <span onClick={()=>router.push(`/dashboard/server/premium`)}>Premium</span></>}</div>
                        </TextLimit>
                    )}
                </div>

                <div id='url' style={sectionStyle}>
                    <div style={headerStyle} onClick={() => toggleSection('url')}>
                        <img src="https://cdn.discordapp.com/emojis/1363843632905457664.webp?size=20" alt="" style={{ paddingRight: 5 }} />
                        URL
                        <div style={{ display: 'flex', justifyContent: 'center', position: 'absolute', right: 0, width: 24, height: 24, alignContent: 'center', transform: `rotateZ(90deg) rotateY(${showSections.url ? 0 : 180}deg)`, transition: '0.5s', }}>{'>'}</div>
                    </div>
                    {showSections.url && (
                        <input
                            style={inputStyle}
                            placeholder="URL"
                            value={embed.url || ''}
                            onChange={e => setEmbed({ ...embed, url: e.target.value })}
                            maxLength={512}
                        />
                    )}
                </div>

                <div id='description' style={sectionStyle}>
                    <div style={headerStyle} onClick={() => toggleSection('description')}>
                        <img src="https://cdn.discordapp.com/emojis/1356491257081499689.webp?size=20" alt="" style={{ paddingRight: 5 }} />
                        Description
                        <div style={{ display: 'flex', justifyContent: 'center', position: 'absolute', right: 0, width: 24, height: 24, alignContent: 'center', transform: `rotateZ(90deg) rotateY(${showSections.description ? 0 : 180}deg)`, transition: '0.5s', }}>{'>'}</div>
                    </div>
                    {showSections.description && (
                        <TextLimit $isLimit={isLimits?.description || false} $color='#bd2e2e'>
                            <DiscordFormatterWrapper>
                                <textarea style={inputStyle} placeholder="Description" value={embed.description || ''} onChange={e => setEmbed({ ...embed, description: e.target.value })} maxLength={defaultLimit ? discord_limits.embeds.description : limits.description} />
                            </DiscordFormatterWrapper>
                            <div id="count">{(limits.description - (embed.description?.length || 0)) <= 50 && limits.description - (embed.description?.length || 0)}</div>
                            <div id="text">{(limits.description - (embed.description?.length || 0)) <= 50 && <>Unlock the limits with <span onClick={()=>router.push(`/dashboard/server/premium`)}>Premium</span></>}</div>
                        </TextLimit>
                    )}
                </div>

                <div id='fields' style={sectionStyle}>
                    <div style={headerStyle} onClick={() => toggleSection('fields')}>
                        <img src="https://cdn.discordapp.com/emojis/1356491262349414400.webp?size=20" alt="" style={{ paddingRight: 5 }} />
                        Fields
                        <div style={{ display: 'flex', justifyContent: 'center', position: 'absolute', right: 0, width: 24, height: 24, alignContent: 'center', transform: `rotateZ(90deg) rotateY(${showSections.fields ? 0 : 180}deg)`, transition: '0.5s', }}>{'>'}</div>
                    </div>
                    {showSections.fields && (
                        <>
                            <div style={{ color: embed.fields?.length == limits.fields ? '#fa0000' : '#cfcfcf', }}>{embed.fields?.length || 0}/{limits.fields}</div>
                            <button className='bg-[#646fe8] hover:bg-[#535fe4]' style={{ ...buttonStyle, cursor: embed.fields?.length == limits.fields ? 'not-allowed' : 'pointer' }} onClick={() => !embed.fields ? handleAddField() : embed.fields.length < limits.fields && handleAddField()}>+ Add Field</button>
                            {(embed.fields || []).map((_, i, a) => (
                                <div key={i} style={{ border: '2px solid #e63d3d', boxShadow: '#00000033 2px 3px 2px 2px', padding: '5px 10px', margin: '10px 0', borderRadius: '8px', transition: 'height 0.5s', }}>
                                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => toggleFieldVisibility(i)}>
                                        <button style={{ transform: `rotate(${showFields[i] ? 90 : 0}deg)`, transition: '0.2s', }}>{'>'}</button>
                                        <input className='bg-transparent hover:bg-[#ad2e2e] hover:shadow-[inset_2px_3px_2px_0px_#00000033] focus:bg-[#ad2e2e] focus:shadow-[inset_2px_3px_2px_0px_#00000033]' style={{ padding: '8px', margin: 0, height: 20, textAlign: 'center', borderRadius: '8px', border: 'none', width: '80%', boxSizing: 'border-box', color: '#fff', fontWeight: 'bold', resize: 'vertical', transition: 'all 0.3s, height 0s', }} onClick={(e) => e.stopPropagation()} placeholder="Field Name" value={fieldValues[i]?.name || ''} onChange={(e) => handleInputChange(i, 'name', e.target.value)} required={true} maxLength={limits.field_name} />
                                        <div style={{ display: 'flex', flexDirection: 'row' }} onClick={(e) => e.stopPropagation()}>
                                            <button style={{ display: 'flex', justifyContent: 'center', padding: '2px 4px', fontSize: '0.7rem', color: i == 0 ? '#aaa' : '#fff', cursor: i == 0 || a.length <= i ? 'not-allowed' : 'pointer', }} onClick={() => moveField(i, 'up')}>▲</button>
                                            <button style={{ display: 'flex', justifyContent: 'center', padding: '2px 4px', fontSize: '0.7rem', color: i == 24 || i >= a.length - 1 ? '#aaa' : '#fff', cursor: i == 24 || i >= a.length - 1 ? 'not-allowed' : 'pointer', }} onClick={() => moveField(i, 'down')}>▼</button>
                                        </div>
                                    </div>
                                    {showFields[i] && (
                                        <>
                                            <TextLimit $isLimit={isLimits?.fields?.[i]?.value || false} $color='#bd2e2e'>
                                                <input style={inputStyle} placeholder="Field Value" value={fieldValues[i]?.value || ''} onChange={(e) => handleInputChange(i, 'value', e.target.value)} required={true} maxLength={defaultLimit ? discord_limits.embeds.field_value : limits.field_value} />
                                                <div id="count">{(limits.field_value - (embed.fields?.[i]?.value?.length || 0)) <= 20 && limits.field_value - (embed.fields?.[i]?.value?.length || 0)}</div>
                                                <div id="text">{(limits.field_value - (embed.fields?.[i]?.value?.length || 0)) <= 20 && <>Unlock the limits with <span onClick={()=>router.push(`/dashboard/server/premium`)}>Premium</span></>}</div>
                                            </TextLimit>
                                            {/* <input style={inputStyle} placeholder="Field Value" value={fieldValues[i]?.value || ''} onChange={(e) => handleInputChange(i, 'value', e.target.value)} required={true} maxLength={defaultLimit ? discord_limits.embeds.field_value : limits.field_value} /> */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'row', margin: '4px 0' }}>
                                                <label style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', cursor: 'pointer', transition: '0.3s' }} className='hover:text-red-300'>
                                                    Inline
                                                    <input style={{ marginLeft: 5 }} type="checkbox" checked={fieldValues[i]?.inline || false} onClick={() => handleInputChange(i, 'inline', !fieldValues[i].inline)} />
                                                </label>
                                                <div style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', cursor: 'pointer', transition: '0.3s' }} className='hover:text-red-300' onClick={() => removeField(i)}>
                                                    Remove
                                                    <TbTrashX style={{ marginRight: 5 }} />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </>
                    )}
                </div>

                <div id='color' style={sectionStyle}>
                    <div style={headerStyle} onClick={() => toggleSection('color')}>
                        <img src="https://cdn.discordapp.com/emojis/1356491264954208306.webp?size=20" alt="" style={{ paddingRight: 5 }} />
                        Color
                        <div style={{ display: 'flex', justifyContent: 'center', position: 'absolute', right: 0, width: 24, height: 24, alignContent: 'center', transform: `rotateZ(90deg) rotateY(${showSections.color ? 0 : 180}deg)`, transition: '0.5s', }}>{'>'}</div>
                    </div>
                    {showSections.color && (
                        <input
                            type='color'
                            style={{ background: 'none', border: 'none', padding: 0, width: '100%', cursor: 'pointer', }}
                            value={'#' + embed.color?.toString(16) || ''}
                            onChange={e => setEmbed({ ...embed, color: parseInt(e.target.value.replace('#', ''), 16) || 0 })}
                        />
                    )}
                </div>

                <div id='image' style={sectionStyle}>
                    <div style={headerStyle} onClick={() => toggleSection('image')}>
                        <img src="https://cdn.discordapp.com/emojis/1356491247887323156.webp?size=20" alt="" style={{ paddingRight: 5 }} />
                        Image
                        <div style={{ display: 'flex', justifyContent: 'center', position: 'absolute', right: 0, width: 24, height: 24, alignContent: 'center', transform: `rotateZ(90deg) rotateY(${showSections.image ? 0 : 180}deg)`, transition: '0.5s', }}>{'>'}</div>
                    </div>
                    {showSections.image && (
                        <input
                            type='url'
                            style={inputStyle}
                            placeholder="Image URL"
                            value={embed.image?.url || ''}
                            onChange={e => setEmbed({ ...embed, image: { url: e.target.value } })}
                            maxLength={512}
                        />
                    )}
                </div>

                <div id='thumbnail' style={sectionStyle}>
                    <div style={headerStyle} onClick={() => toggleSection('thumbnail')}>
                        <img src="https://cdn.discordapp.com/emojis/1356491270196957235.webp?size=20" alt="" style={{ paddingRight: 5 }} />
                        Thumbnail
                        <div style={{ display: 'flex', justifyContent: 'center', position: 'absolute', right: 0, width: 24, height: 24, alignContent: 'center', transform: `rotateZ(90deg) rotateY(${showSections.thumbnail ? 0 : 180}deg)`, transition: '0.5s', }}>{'>'}</div>
                    </div>
                    {showSections.thumbnail && (
                        <input
                            type='url'
                            style={inputStyle}
                            placeholder="Thumbnail URL"
                            value={embed.thumbnail?.url || ''}
                            onChange={e => setEmbed({ ...embed, thumbnail: { url: e.target.value } })}
                            maxLength={512}
                        />
                    )}
                </div>

                <div id='footer' style={sectionStyle}>
                    <div style={headerStyle} onClick={() => toggleSection('footer')}>
                        <img src="https://cdn.discordapp.com/emojis/1356491276333088801.webp?size=20" alt="" style={{ paddingRight: 5 }} />
                        Footer
                        <div style={{ display: 'flex', justifyContent: 'center', position: 'absolute', right: 0, width: 24, height: 24, alignContent: 'center', transform: `rotateZ(90deg) rotateY(${showSections.footer ? 0 : 180}deg)`, transition: '0.5s', }}>{'>'}</div>
                    </div>
                    {showSections.footer && (
                        <>
                            <TextLimit $isLimit={isLimits?.footer || false} $color='#bd2e2e'>
                                <input style={inputStyle} placeholder="Footer Text" value={embed.footer?.text || ''} onChange={e => setEmbed({ ...embed, footer: { ...embed.footer, text: e.target.value } })} maxLength={defaultLimit ? discord_limits.embeds.footer_text : limits.footer_text} />
                                <div id="count">{(limits.footer_text - (embed.footer?.text?.length || 0)) <= 20 && limits.footer_text - (embed.footer?.text?.length || 0)}</div>
                                <div id="text">{(limits.footer_text - (embed.footer?.text?.length || 0)) <= 20 && <>Unlock the limits with <span onClick={()=>router.push(`/dashboard/server/premium`)}>Premium</span></>}</div>
                            </TextLimit>
                            <input style={inputStyle} placeholder="Footer Icon URL" type='url' value={embed.footer?.icon_url || ''} onChange={e => setEmbed({ ...embed, footer: embed.footer && { ...embed.footer, icon_url: e.target.value } })} maxLength={512} />
                        </>
                    )}
                </div>

                <div id='timestamp' style={sectionStyle}>
                    <div style={headerStyle} onClick={() => toggleSection('timestamp')}>
                        <img src="https://cdn.discordapp.com/emojis/1356491274156511273.webp?size=20" alt="" style={{ paddingRight: 5 }} />
                        Timestamp
                        <div style={{ display: 'flex', justifyContent: 'center', position: 'absolute', right: 0, width: 24, height: 24, alignContent: 'center', transform: `rotateZ(90deg) rotateY(${showSections.timestamp ? 0 : 180}deg)`, transition: '0.5s', }}>{'>'}</div>
                    </div>
                    {showSections.timestamp && (
                        <input
                            style={inputStyle}
                            type='datetime-local'
                            value={embed.timestamp || ''}
                            onChange={e => setEmbed({ ...embed, timestamp: e.target.value })}
                        />
                    )}
                </div>
            </div>}
        </div>
    );
};

export default EmbedEditor;

