import React, { useEffect, useRef, useState } from 'react';
import './NoteBlock.css';

export default function NoteBlock({ value, onChange, collapsed = false }) {
    const [title, setTitle] = useState(value?.title ?? '');
    const [notes, setNotes] = useState(value?.notes ?? '');
    const taRef = useRef(null);

    useEffect(() => {
        if (value) {
            setTitle(value.title ?? '');
            setNotes(value.notes ?? '');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value?.title, value?.notes]);

    const handleChange = (e) => {
        const newVal = e.target.value;
        setNotes(newVal);
        autoResize(e.target);
        if (onChange) onChange({ title, notes: newVal });
    };

    const autoResize = (el) => {
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
    };

    useEffect(() => {
        if (!collapsed && taRef.current) {
            autoResize(taRef.current);
        }
    }, [notes, collapsed]);

    return (
        <div className="note-block">
            <input
                className="note-title"
                type="text"
                value={title}
                onChange={(e) => {
                    const t = e.target.value;
                    setTitle(t);
                    if (onChange) onChange({ title: t, notes });
                }}
                placeholder="Titolo"
            />
            <textarea
                ref={taRef}
                value={notes}
                onChange={handleChange}
                placeholder="Enter your notes here..."
                rows={1}
                style={{ display: collapsed ? 'none' : 'block' }}
            />
        </div>
    );
}
