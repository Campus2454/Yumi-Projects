import React, {
  useRef,
  useState,
  useEffect,
  cloneElement,
  ReactElement,
} from 'react';
import { PiTextBBold } from "react-icons/pi";
import {
  TbCode,
  TbEye,
  TbItalic,
  TbStrikethrough,
  TbUnderline,
} from 'react-icons/tb';

type Props<T extends HTMLElement> = {
  children: React.ReactElement<
    React.DetailedHTMLProps<React.InputHTMLAttributes<T>, T>
  >;
};

export function DiscordFormatterWrapper<
  T extends HTMLInputElement | HTMLTextAreaElement
>({ children }: Props<T>) {
  const inputRef = useRef<T>(null);
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [selection, setSelection] = useState({ start: 0, end: 0 });

  const value = typeof children.props.value === 'string' ? children.props.value : '';
  const onChange = children.props.onChange;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        toolbarRef.current &&
        !toolbarRef.current.contains(e.target as Node)
      ) {
        setShowToolbar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const onSelect = (
    e: React.SyntheticEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const el = e.currentTarget;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    setSelection({ start, end });
    setShowToolbar(start !== end);
    children.props.onSelect?.(e as any);
  };

  // ตรวจสอบว่าถูก format ด้วย wrap ภายใน selected หรือไม่
  const isFormatted = (wrap: string) => {
    const { start, end } = selection;
    const selected = value.slice(start, end);
    
    // ถ้าเป็นตัวเอียง เราต้องเช็คให้ละเอียดขึ้น
    if (wrap === '*') {
        const isSingleWrap = selected.startsWith('*') && selected.endsWith('*') && !selected.startsWith('**');
        const isTripleWrap = selected.startsWith('***') && selected.endsWith('***');
        return isSingleWrap || isTripleWrap;
    }

    // กรณีอื่นๆ ก็เช็คตามปกติ
    return selected.includes(wrap);
  };

const toggleFormat = (wrap: string) => {
  const { start, end } = selection;
  const before = value.slice(0, start);
  const selected = value.slice(start, end);
  const after = value.slice(end);

  // เช็คว่า selected มี wrap หรือไม่
  const hasWrap = selected.startsWith(wrap) && selected.endsWith(wrap);

  let newSelected = selected;

  if (hasWrap) {
    // 1. ถ้ามี wrap อยู่แล้วให้ลบออก
    newSelected = selected.slice(wrap.length, selected.length - wrap.length);
  } else {
    // 2. ถ้ายังไม่มี wrap ก็เพิ่มเข้าไป
    newSelected = `${wrap}${selected}${wrap}`;
  }

  // สร้างค่าใหม่
  const newValue = `${before}${newSelected}${after}`;
  onChange?.({
    ...({} as any),
    target: { value: newValue },
  });

  // ปรับ selection
  setTimeout(() => {
    const el = inputRef.current;
    if (el) {
      el.focus();
      const delta = hasWrap ? -wrap.length : wrap.length;
      const newStart = start;
      const newEnd = end + delta * 2;  // ต้องปรับตำแหน่ง selection
      setSelection({ start: newStart, end: newEnd });
      el.setSelectionRange(newStart, newEnd);
    }
  }, 0);
};

  const cloned = cloneElement(children, {
    ref: inputRef,
    onSelect,
  });

  const style: React.CSSProperties = {
    fontSize: 32,
    cursor: 'pointer',
    padding: 5,
    borderRadius: 5,
  };

  return (
    <>
      {showToolbar && (
        <div
          ref={toolbarRef}
          style={{
            position: 'absolute',
            top: '-35px',
            right: '10px',
            backgroundColor: '#b50d0dbf',
            padding: 0,
            borderRadius: 5,
            display: 'flex',
            gap: 4,
            zIndex: 5,
            color: 'white',
          }}
        >
          <PiTextBBold
            style={{
              ...style,
              backgroundColor: isFormatted('**') ? '#ff4c4c80' : 'transparent',
            }}
            onClick={() => toggleFormat('**')}
          />
          <TbItalic
            style={{
              ...style,
              backgroundColor: isFormatted('*') ? '#ff4c4c80' : 'transparent',
            }}
            onClick={() => toggleFormat('*')}
          />
          <TbStrikethrough
            style={{
              ...style,
              backgroundColor: isFormatted('~~') ? '#ff4c4c80' : 'transparent',
            }}
            onClick={() => toggleFormat('~~')}
          />
          <TbUnderline
            style={{
              ...style,
              backgroundColor: isFormatted('__') ? '#ff4c4c80' : 'transparent',
            }}
            onClick={() => toggleFormat('__')}
          />
          <TbCode
            style={{
              ...style,
              backgroundColor: isFormatted('`') ? '#ff4c4c80' : 'transparent',
            }}
            onClick={() => toggleFormat('`')}
          />
          <TbEye
            style={{
              ...style,
              backgroundColor: isFormatted('||') ? '#ff4c4c80' : 'transparent',
            }}
            onClick={() => toggleFormat('||')}
          />
        </div>
      )}
      {cloned}
    </>
  );
}
