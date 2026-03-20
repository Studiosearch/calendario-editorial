import React, { useRef, useState } from 'react';
import { Palette, MessageSquareText, Upload, X } from 'lucide-react';
import FilePreview from './FilePreview';

export default function PostDetailCreative({ item, legenda, onLegendaChange, onUpload, onDeleteFile, onReorder }) {
    const [isUploading, setIsUploading] = useState(false);
    const [draggedIdx, setDraggedIdx] = useState(null);

    const handleDragStart = (e, index) => {
        setDraggedIdx(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index.toString());
    };

    const handleDrop = (e, targetIdx) => {
        e.preventDefault();
        if (draggedIdx === null || draggedIdx === targetIdx) return;

        const newArr = [...item.postagem];
        const draggedItem = newArr[draggedIdx];
        newArr.splice(draggedIdx, 1);
        newArr.splice(targetIdx, 0, draggedItem);

        if (onReorder) onReorder(newArr);
        setDraggedIdx(null);
    };

    const fileRef = useRef(null);

    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        await onUpload(item.id, file);
        setIsUploading(false);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* Arte do Post */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#718096' }}>
                        <Palette size={18} />
                        <span style={{ fontSize: '13px', fontWeight: 700 }}>ARTE DO POST</span>
                    </div>
                    <button
                        onClick={() => fileRef.current?.click()}
                        disabled={isUploading}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '4px 10px', border: 'none', background: 'transparent',
                            color: '#3182ce', fontSize: '12px', fontWeight: 600,
                            cursor: 'pointer', borderRadius: '6px',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#ebf8ff'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        <Upload size={14} /> Anexar Arquivo
                    </button>
                    <input type="file" ref={fileRef} onChange={handleUpload} style={{ display: 'none' }} accept="image/*,video/*" />
                </div>
                <div style={{
                    borderRadius: '12px', overflow: 'hidden',
                    border: '1px solid #e2e8f0', minHeight: '180px',
                    background: '#f7fafc', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                }}>
                    {item.postagem?.length > 0 ? (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                            gap: '12px', padding: '12px',
                        }}>
                            {item.postagem.map((f, idx) => (
                                <div key={f.id}
                                    draggable={true}
                                    onDragStart={(e) => handleDragStart(e, idx)}
                                    onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                                    onDragEnter={(e) => e.preventDefault()}
                                    onDrop={(e) => handleDrop(e, idx)}
                                    onDragEnd={() => setDraggedIdx(null)}
                                    style={{
                                        position: 'relative', borderRadius: '8px', overflow: 'hidden',
                                        cursor: 'grab', opacity: draggedIdx === idx ? 0.4 : 1,
                                        transform: draggedIdx === idx ? 'scale(0.95)' : 'none',
                                        transition: 'transform 0.2s, opacity 0.2s',
                                    }}>
                                    <FilePreview file={f} height="140px" objectFit="cover" />
                                    <button
                                        onClick={() => onDeleteFile(f.id)}
                                        style={{
                                            position: 'absolute', top: '4px', right: '4px',
                                            width: '24px', height: '24px', borderRadius: '50%',
                                            border: 'none', background: 'rgba(255,255,255,0.85)',
                                            cursor: 'pointer', display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', color: '#e53e3e',
                                            backdropFilter: 'blur(4px)', transition: 'all 0.2s',
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = '#e53e3e'; e.currentTarget.style.color = 'white'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.85)'; e.currentTarget.style.color = '#e53e3e'; }}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', flexDirection: 'column', gap: '8px' }}>
                            {isUploading ? (
                                <div className="spinner" style={{ width: '24px', height: '24px', border: '3px solid #e2e8f0', borderTopColor: '#3182ce', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                            ) : (
                                <span style={{ color: '#a0aec0', fontSize: '14px' }}>Sem arte anexada</span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Legenda */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#718096', marginBottom: '12px' }}>
                    <MessageSquareText size={18} />
                    <span style={{ fontSize: '13px', fontWeight: 700 }}>LEGENDA FINAL</span>
                </div>
                <textarea
                    value={legenda}
                    onChange={(e) => onLegendaChange(e.target.value)}
                    placeholder="Legenda do post..."
                    style={{
                        width: '100%', minHeight: '160px', padding: '16px',
                        border: '1px solid #e2e8f0', borderRadius: '12px',
                        background: 'white', fontSize: '14px', fontFamily: 'inherit', color: '#1a202c',
                        resize: 'vertical', outline: 'none', transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3182ce'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
            </div>
        </div>
    );
}
