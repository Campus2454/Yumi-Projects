// components/RenderDiscordMarkdown.tsx
import { parse } from 'discord-markdown-parser';
import { JSX } from 'react';

export function renderDiscordMarkdown(text: string): JSX.Element {
  const parsed = parse(text);

  const render = (nodes: any[]): JSX.Element[] => {
    return nodes.map((node, i) => {
      const content = Array.isArray(node.content) ? render(node.content) : node.content;

      switch (node.type) {
        case 'text':
          return <span key={i}>{node.content}</span>;
        case 'bold':
        case 'strong':
          return <strong key={i}>{content}</strong>;
        case 'italic':
        case 'em':
          return <em key={i}>{content}</em>;
        case 'underline':
          return <u key={i}>{content}</u>;
        case 'strikethrough':
          return <s key={i}>{content}</s>;
        case 'spoiler':
          return (
            <span
              key={i}
              style={{
                backgroundColor: 'gray',
                color: '#808080',
                cursor: 'pointer',
                borderRadius: '5px',
              }}
              onClick={(e) => {
                const el = e.currentTarget;
                el.style.color = el.style.color === 'inherit' ? '#808080' : 'inherit';
                el.style.backgroundColor = el.style.backgroundColor === 'gray' ? '#525252' : 'gray';
              }}
            >
              {content}
            </span>
          );
        case 'inlineCode':
          return (
            <code
              key={i}
              style={{
                backgroundColor: '#2e3138',
                padding: '2px 4px',
                border: '1px solid #4d525c',
                borderRadius: 4,
              }}
            >
              {node.content}
            </code>
          );
        case 'codeBlock':
          return (
            <pre
              key={i}
              style={{
                backgroundColor: '#2e3138',
                padding: '10px',
                borderRadius: 4,
                border: '1px solid #4d525c',
                whiteSpace: 'pre-wrap',
              }}
            >
              <code>{node.content}</code>
            </pre>
          );
        case 'blockQuote':
          return (
            <blockquote key={i} style={{ borderLeft: '4px solid gray', paddingLeft: '10px' }}>
              {content}
            </blockquote>
          );
        case 'inlineQuote':
          return <q key={i}>{content}</q>;
        case 'link':
        case 'url':
          return (
            <a key={i} href={node.target} target="_blank" rel="noopener noreferrer">
              {render(node.content)}
            </a>
          );
        case 'emoji':
          return <span key={i}>{node.name}</span>;
        case 'mention':
          return <span key={i} style={{ color: '#7289da' }}>@{node.id}</span>;
        case 'channel':
          return <span key={i} style={{ color: '#7289da' }}>#{node.name || 'channel'}</span>;
        case 'role':
          return <span key={i} style={{ color: '#43b581' }}>@{node.name || 'role'}</span>;
        case 'everyone':
        case 'here':
          return <span key={i} style={{ color: '#faa61a' }}>@{node.type}</span>;
        case 'timestamp':
          return <span key={i}>{new Date(node.timestamp * 1000).toLocaleString()}</span>;
        case 'br':
          return <br key={i} />;
        case 'heading':
          const level = node.level || 1;
          const HeadingTag = `h${level == 1 ? 6 : level == 2 ? 3 : 1}` as keyof JSX.IntrinsicElements;
          return <strong key={i} style={{ fontSize: level == 1 ? 'x-large' : level == 2 ? 'larger' : '', }}>{content}<br key={i} /></strong>;
        default:
          return <span key={i}>{content}</span>;
      }
    });
  };

  // console.log(parsed);
  return <>{render(parsed)}</>;
}
