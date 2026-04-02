import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { STATUS_OPTIONS, STATUS_COLORS } from '../constants';
import PostDetailCreative from './PostDetailCreative';
import PostDetailPlanning from './PostDetailPlanning';
import PostDetailFooter from './PostDetailFooter';

export default function PostDetail({ item, open, onClose, onUpdate, onUpload, onDeleteFile, onReorder, onDelete }) {
    const [draftLegenda, setDraftLegenda] = useState('');
    const [draftRoteiro, setDraftRoteiro] = useState('');
    const [draftStatus, setDraftStatus] = useState('');
    const [draftDesenvolvimento, setDraftDesenvolvimento] = useState('');
    const [draftTipoDePost, setDraftTipoDePost] = useState('');
    const [draftPlataformas, setDraftPlataformas] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (item && open) {
            setDraftLegenda(item.legenda || '');
            setDraftRoteiro(item.roteiro || '');
            setDraftStatus(item.status || '');
            setDraftDesenvolvimento(item.desenvolvimento || '');
            setDraftTipoDePost(item.tipoDePost || '');
            setDraftPlataformas(Array.isArray(item.plataformas) ? [...item.plataformas] : []);
        }
    }, [item, open]);

    if (!item || !open) return null;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onUpdate(item.id, {
                legenda: draftLegenda,
                roteiro: draftRoteiro,
                status: draftStatus,
                desenvolvimento: draftDesenvolvimento,
                tipoDePost: draftTipoDePost,
                plataformas: draftPlataformas
            });
            onClose();
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Você tem certeza que deseja excluir este post?")) {
            await onDelete(item.id);
            onClose();
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                }}
            />

            {/* Modal */}
            <div style={{
                position: 'relative', zIndex: 1,
                width: '90%', maxWidth: '900px', maxHeight: '90vh',
                background: 'white', borderRadius: '16px',
                overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
                display: 'flex', flexDirection: 'column',
                animation: 'scale-fade-in 0.3s ease-out',
            }}>
                {/* Header */}
                <div style={{
                    padding: '20px 24px', borderBottom: '1px solid #e2e8f0',
                    background: '#f7fafc', display: 'flex', justifyContent: 'space-between',
                    alignItems: 'flex-start',
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                            <select
                                value={draftStatus}
                                onChange={(e) => setDraftStatus(e.target.value)}
                                style={{
                                    padding: '6px 14px', borderRadius: '999px',
                                    border: '1px solid #e2e8f0', background: 'white',
                                    fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)', color: '#1a202c'
                                }}
                            >
                                {STATUS_OPTIONS.map((s) => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>
                            <span style={{
                                display: 'inline-flex', alignItems: 'center',
                                padding: '4px 14px', borderRadius: '999px', height: '32px',
                                background: STATUS_COLORS[draftStatus] || '#c4c4c4',
                                color: 'white', fontSize: '13px', fontWeight: 600,
                            }}>
                                {draftStatus}
                            </span>
                        </div>
                        <h2 style={{
                            margin: 0,
                            fontSize: '1.4rem',
                            fontWeight: 700,
                            color: '#202325',
                            fontFamily: "'Gastromond', 'Playfair Display', serif"
                        }}>{item.name}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            width: '32px', height: '32px', borderRadius: '8px',
                            border: 'none', background: 'transparent', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#718096',
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div style={{
                    padding: '24px', overflowY: 'auto', flex: 1,
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: window.innerWidth >= 768 ? '1.2fr 0.8fr' : '1fr',
                        gap: '36px',
                    }}>
                        <PostDetailCreative
                            item={item}
                            legenda={draftLegenda}
                            onLegendaChange={setDraftLegenda}
                            onUpload={onUpload}
                            onDeleteFile={(fileId) => onDeleteFile(item.id, fileId)}
                            onReorder={(newArr) => onReorder(item.id, newArr)}
                        />
                        <PostDetailPlanning
                            item={item}
                            roteiro={draftRoteiro}
                            onRoteiroChange={setDraftRoteiro}
                            desenvolvimento={draftDesenvolvimento}
                            onDesenvolvimentoChange={setDraftDesenvolvimento}
                            tipoDePost={draftTipoDePost}
                            onTipoDePostChange={setDraftTipoDePost}
                            plataformas={draftPlataformas}
                            onPlataformasChange={setDraftPlataformas}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    padding: '16px 24px', borderTop: '1px solid #e2e8f0',
                    background: '#f7fafc',
                }}>
                    <PostDetailFooter onSave={handleSave} isSaving={isSaving} onDelete={handleDelete} />
                </div>
            </div>
        </div>
    );
}
