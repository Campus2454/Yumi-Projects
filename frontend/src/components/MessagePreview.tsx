import React from 'react';
import { APIEmbed, APIButtonComponent, ButtonStyle, ComponentType, RESTPostAPIChannelMessageJSONBody, } from 'discord-api-types/v10';
import { renderDiscordMarkdown } from './parseDiscordMarkdownToHtml';


// interface Props {
//     content?: string;
//     embeds?: readonly APIEmbed[];
//     components?: any;
// }

const formatTimestamp = (ts: string | undefined | null): string => {
    if (!ts) return '';
    try {
        const date = new Date(ts);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        }) + ' ' + date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    } catch (e) {
        console.error("Error formatting timestamp:", e);
        return 'Invalid Date';
    }
};

const getBorderColor = (color: number | undefined | null): string => {
    if (color === undefined || color === null) {
        return '#2f3136';
    }
    const hexColor = `#${color.toString(16).padStart(6, '0')}`;
    return hexColor;
};

const getButtonStyle = (style: ButtonStyle): string => {
    switch (style) {
        case ButtonStyle.Primary: return 'bg-indigo-500 hover:bg-indigo-600';
        case ButtonStyle.Secondary: return 'bg-gray-500 hover:bg-gray-600';
        case ButtonStyle.Success: return 'bg-green-500 hover:bg-green-600';
        case ButtonStyle.Danger: return 'bg-red-500 hover:bg-red-600';
        case ButtonStyle.Link: return 'bg-transparent text-blue-400 hover:underline';
        default: return 'bg-gray-500 hover:bg-gray-600';
    }
}

const EmbedImage: React.FC<{ src: string, alt: string, className?: string }> = ({src, alt, className}) => {
  const [display, setDisplay] = React.useState<'block' | 'none'>('block');
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{ display }}
      onError={() => setDisplay('none')}
    />
  );
};

const Embed: React.FC<{ embed: APIEmbed }> = ({ embed }) => {
    const borderColor = getBorderColor(embed.color);
    return (        <div
            className={`relative bg-[#2f3136] border-l-4 p-4 my-2 rounded text-white font-sans w-fit max-w-xl`}
            style={{ borderLeftColor: borderColor, width: '100%' }}
        >
            {embed.author && (
                <div className="mb-2 text-sm text-gray-300 flex items-center">
                    {embed.author.icon_url && (
                      <EmbedImage
                        src={embed.author.icon_url}
                        alt={embed.author.name ? `${embed.author.name}'s icon` : 'author icon'}
                        className="w-5 h-5 rounded-full mr-2"
                      />
                    )}
                    {embed.author.url ? (
                        <a
                            href={embed.author.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white hover:underline font-medium"
                        >
                            {embed.author.name}
                        </a>
                    ) : (
                        <span className="font-medium">{embed.author.name}</span>
                    )}
                </div>
            )}

            {embed.title && (
                <div className="mb-1">
                    {embed.url ? (
                        <a
                            href={embed.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xl font-semibold text-blue-400 hover:underline"
                        >
                            {renderDiscordMarkdown(embed.title)}
                        </a>
                    ) : (
                        <div className="text-xl font-semibold">{renderDiscordMarkdown(embed.title)}</div>
                    )}
                </div>
            )}

            {embed.description && (
                <div className="mb-2 text-gray-300 text-sm whitespace-pre-wrap">{renderDiscordMarkdown(embed.description)}</div>
            )}

            {embed.fields && embed.fields.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-2 gap-y-2 mt-2">
                    {embed.fields.map((field, index) => (
                      field.name && field.value ? (
                        <div key={index} className={field.inline ? 'col-span-1' : 'col-span-1 sm:col-span-2 lg:col-span-3'}>
                            <div className="text-gray-200 font-medium text-sm">{renderDiscordMarkdown(field.name)}</div>
                            <div className="text-gray-400 text-sm mt-1 whitespace-pre-wrap">{renderDiscordMarkdown(field.value)}</div>
                        </div>
                       ) : null
                    ))}
                </div>
            )}

            {embed.image?.url && (
                <div className="mt-3">
                  <EmbedImage
                    src={embed.image.url}
                    alt={embed.description ? `Image for ${embed.title || 'embed'}` : "embed image"}
                    className="max-w-full h-auto rounded max-h-80 object-contain"
                  />
                </div>
            )}

            {embed.thumbnail?.url && (
                <div className="absolute top-4 right-4 hidden sm:block">
                  <EmbedImage
                    src={embed.thumbnail.url}
                    alt={embed.title ? `Thumbnail for ${embed.title}` : "thumbnail"}
                    className="w-20 h-20 rounded object-cover"
                  />
                </div>
            )}

            {embed.footer && (
                <div className="mt-3 text-xs text-gray-400 flex items-center">
                    {embed.footer.icon_url && (
                      <EmbedImage
                        src={embed.footer.icon_url}
                        alt={embed.footer.text ? `Icon for ${embed.footer.text}` : 'footer icon'}
                        className="w-5 h-5 rounded-full mr-2"
                      />
                    )}
                    <span>{embed.footer.text}</span>
                    {embed.timestamp && embed.footer.text && (
                        <span className="mx-1"> • </span>
                    )}
                    {embed.timestamp && embed.footer.text && (
                        <span>{formatTimestamp(embed.timestamp)}</span>
                    )}
                </div>
            )}
        </div>
    );
}

const ComponentsPreview: React.FC<{ components: any }> = ({ components }) => { // Changed type to any
    if (!components || components.length === 0) {
        return null;
    }

    return (
        <div className="mt-2 space-y-2">
            {components?.map((row: any, rowIndex: number) => { // Added : any to row
                if (row.type === ComponentType.ActionRow && row.components && row.components.length > 0) {
                    return (
                        <div key={rowIndex} className="flex flex-wrap gap-2">
                            {row.components.map((component: any, compIndex: number) => {  // Added : any to component
                                if (component.type === ComponentType.Button) {
                                    const button = component as APIButtonComponent;
                                    const styleClasses = getButtonStyle(button.style);
                                    const commonClasses = 'px-4 py-2 rounded text-white text-sm font-medium transition duration-150 ease-in-out inline-flex items-center justify-center space-x-1';
                                    const disabledClasses = button.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md';

                                    if (button.style === 5) {
                                        if (!button.url) return null;
                                        return (
                                            <a
                                                key={compIndex}
                                                href={button.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`${commonClasses} ${styleClasses} ${disabledClasses}`}
                                                title={button.label || 'Link'}
                                            >
                                                {button.emoji && (
                                                    <span className={button.label ? 'mr-1' : ''}>{button.emoji.name}</span>
                                                )}
                                                <span>{button.label}</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </a>
                                        );
                                    } else if (button.style === 6) {
                                        return (
                                            <button
                                                key={compIndex}
                                                type="button"
                                                className={`${commonClasses} bg-purple-500 hover:bg-purple-600 ${disabledClasses}`}
                                                disabled={button.disabled}
                                                title={'Premium'}
                                            >
                                                <span>Premium</span>
                                            </button>
                                        );
                                    } else {
                                        return (
                                            <button
                                                key={compIndex}
                                                type="button"
                                                className={`${commonClasses} ${styleClasses} ${disabledClasses}`}
                                                disabled={button.disabled}
                                                title={button.label || 'Button'}
                                            >
                                                {button.emoji && (
                                                    <span className={button.label ? 'mr-1' : ''}>{button.emoji.name}</span>
                                                )}
                                                <span>{button.label || 'Button'}</span>
                                            </button>
                                        );
                                    }
                                }
                                return null;
                            })}
                        </div>
                    );
                }
                return null;
            })}
        </div>
    );
};


const MessagePreview: React.FC<{message: RESTPostAPIChannelMessageJSONBody | undefined} & React.HTMLAttributes<HTMLDivElement>> = ({ message, ...rest }) => {
    return (
        <div className="bg-[#36393f] p-4 rounded max-w-3xl mx-auto text-white font-sans shadow-md" {...rest}>
            {message?.content && <div className="mb-1 text-gray-200 whitespace-pre-wrap break-words">{renderDiscordMarkdown(message.content)}</div>}
            
            {Array.isArray(message?.embeds) && message.embeds.length > 0 && (
                <div className="mt-1">
                    {message.embeds.map((embed, index) => (
                        <Embed key={index} embed={embed} />
                    ))}
                </div>
            )}

            <ComponentsPreview components={message?.components} />

        </div>
    );
};

export default MessagePreview;

