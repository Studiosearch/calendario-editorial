import React, { useState } from 'react';
import { Calendar, CheckCircle, AlertCircle, Send, X, Share2, ShieldCheck } from 'lucide-react';
import FilePreview from './FilePreview';

export default function ApprovalDetailView({ post, metadata, onClose, onApprove, onRevision }) {
    const [revisionOpen, setRevisionOpen] = useState(false);
    const [revisionCategories, setRevisionCategories] = useState([]);
    const [revisionText, setRevisionText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleApprove = async () => {
        setIsSubmitting(true);
        try {
            await onApprove(post.id, 'Aprovado');
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRevisionSubmit = async () => {
        if (!revisionText.trim() && revisionCategories.length === 0) return;
        setIsSubmitting(true);
        try {
            await onRevision(post.id, revisionCategories, revisionText);
            setRevisionOpen(false);
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleCategory = (cat) => {
        setRevisionCategories((prev) =>
            prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
        );
    };

    return (
        <div className="animate-slide-fade-in" style={{ background: '#f7fafc', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{
                background: 'white', borderBottom: '1px solid #e2e8f0',
                padding: '12px 16px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <button onClick={onClose} style={{
                        width: '32px', height: '32px', border: 'none', background: 'transparent',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#718096',
                    }}>
                        <X size={20} />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#319795' }}>
                        <ShieldCheck size={14} />
                        <span style={{
                            fontWeight: 700,
                            fontSize: window.innerWidth >= 768 ? '1.1rem' : '0.75rem',
                            whiteSpace: 'nowrap',
                        }}>
                            Aprovação - {metadata.boardName}
                        </span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div style={{
                display: 'flex', justifyContent: 'center',
                padding: window.innerWidth >= 768 ? '40px 16px' : '16px',
            }}>
                <div style={{
                    maxWidth: '500px', width: '100%', background: 'white',
                    borderRadius: window.innerWidth >= 768 ? '16px' : '12px',
                    overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.12)',
                    border: '1px solid #e2e8f0',
                }}>
                    {/* Images Carousel */}
                    <div style={{
                        display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory',
                        background: '#000', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
                    }}>
                        {post.postagem?.length > 0 ? (
                            post.postagem.map((file, idx) => (
                                <div key={idx} style={{
                                    minWidth: '100%', aspectRatio: '1080 / 1350',
                                    position: 'relative', scrollSnapAlign: 'start',
                                }}>
                                    <FilePreview file={file} height="100%" objectFit="contain" disableViewer />
                                    {post.postagem.length > 1 && (
                                        <div style={{
                                            position: 'absolute', top: '16px', right: '16px',
                                            background: 'rgba(0,0,0,0.6)', color: 'white',
                                            padding: '4px 10px', borderRadius: '999px',
                                            fontSize: '11px', fontWeight: 700, backdropFilter: 'blur(4px)',
                                            pointerEvents: 'none', border: '1px solid rgba(255,255,255,0.2)'
                                        }}>
                                            {idx + 1} / {post.postagem.length}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div style={{ minWidth: '100%', aspectRatio: '1080 / 1350', borderBottom: '1px solid #2d3748', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ color: 'rgba(255,255,255,0.5)' }}>Arte em desenvolvimento</span>
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div style={{
                        padding: window.innerWidth >= 768 ? '28px' : '20px',
                        display: 'flex', flexDirection: 'column', gap: window.innerWidth >= 768 ? '20px' : '16px',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#718096' }}>
                                <Calendar size={16} />
                                <span style={{ fontSize: '13px', fontWeight: 700 }}>
                                    {post.dataPostagem?.toLocaleDateString('pt-BR') || 'Data a definir'}
                                </span>
                            </div>
                            <span style={{
                                padding: '4px 12px', borderRadius: '999px',
                                background: post.statusColor || '#c4c4c4', color: 'white',
                                fontSize: '12px', fontWeight: 600,
                            }}>
                                {post.status}
                            </span>
                        </div>

                        {/* Plataformas */}
                        {post.plataformas?.length > 0 && (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#718096', marginBottom: '8px' }}>
                                    <Share2 size={14} />
                                    <span style={{ fontSize: '11px', fontWeight: 700 }}>PLATAFORMAS</span>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {post.plataformas.map((p) => (
                                        <span key={p} style={{
                                            padding: '2px 10px', borderRadius: '6px',
                                            background: '#ebf8ff', color: '#3182ce',
                                            fontSize: '11px', fontWeight: 600,
                                        }}>
                                            {p}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <p style={{
                            fontSize: '14px', lineHeight: 1.7, whiteSpace: 'pre-wrap',
                            color: '#2d3748', margin: 0,
                        }}>
                            {post.legenda || 'Sem legenda.'}
                        </p>

                        <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: 0 }} />

                        {/* Action buttons */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <button
                                onClick={handleApprove}
                                disabled={post.status === 'Aprovado' || isSubmitting}
                                style={{
                                    width: '100%',
                                    padding: window.innerWidth >= 768 ? '16px' : '14px',
                                    border: 'none', borderRadius: '12px',
                                    background: post.status === 'Aprovado' ? '#c6f6d5' : 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                                    color: 'white', fontSize: '16px', fontWeight: 700,
                                    cursor: post.status === 'Aprovado' ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    boxShadow: '0 4px 6px rgba(72,187,120,0.3)',
                                    transition: 'all 0.2s', opacity: isSubmitting ? 0.7 : 1,
                                }}
                            >
                                <CheckCircle size={20} /> Aprovar Conteúdo
                            </button>
                            <button
                                onClick={() => setRevisionOpen(true)}
                                disabled={post.status === 'Aprovado' || isSubmitting}
                                style={{
                                    width: '100%', padding: window.innerWidth >= 768 ? '12px' : '10px',
                                    borderRadius: '12px', border: '2px solid #ecc94b',
                                    background: 'transparent', color: '#d69e2e',
                                    fontSize: '14px', fontWeight: 600,
                                    cursor: post.status === 'Aprovado' ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    transition: 'all 0.2s',
                                }}
                            >
                                <AlertCircle size={20} /> Solicitar Alterações
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Revision Modal */}
            {revisionOpen && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 2000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <div
                        onClick={() => setRevisionOpen(false)}
                        style={{
                            position: 'absolute', inset: 0,
                            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                        }}
                    />
                    <div style={{
                        position: 'relative', zIndex: 1,
                        width: '90%', maxWidth: '480px', padding: '28px',
                        background: 'white', borderRadius: '16px',
                        boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                            <div>
                                <h3 style={{ margin: '0 0 4px', fontSize: '1.2rem', fontWeight: 700 }}>
                                    O que deseja revisar?
                                </h3>
                                <p style={{ margin: 0, fontSize: '14px', color: '#718096' }}>
                                    Selecione e descreva o ajuste.
                                </p>
                            </div>
                            <button onClick={() => setRevisionOpen(false)} style={{
                                width: '30px', height: '30px', border: 'none', background: 'transparent',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#718096',
                            }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div>
                                <span style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '12px' }}>
                                    Categorias
                                </span>
                                <div style={{ display: 'flex', gap: '20px' }}>
                                    {['Legenda', 'Conteúdo', 'Data'].map((cat) => (
                                        <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px' }}>
                                            <input
                                                type="checkbox"
                                                checked={revisionCategories.includes(cat)}
                                                onChange={() => toggleCategory(cat)}
                                                style={{ accentColor: '#ecc94b' }}
                                            />
                                            {cat}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                                    Feedback
                                </label>
                                <textarea
                                    placeholder="Ajustes desejados..."
                                    value={revisionText}
                                    onChange={(e) => setRevisionText(e.target.value)}
                                    style={{
                                        width: '100%', minHeight: '120px', padding: '12px',
                                        border: '1px solid #e2e8f0', borderRadius: '12px',
                                        background: '#f7fafc', fontSize: '14px', fontFamily: 'inherit',
                                        resize: 'vertical', outline: 'none',
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                            <button onClick={() => setRevisionOpen(false)} style={{
                                padding: '8px 20px', border: 'none', background: 'transparent',
                                fontSize: '14px', fontWeight: 600, cursor: 'pointer', color: '#4a5568',
                                borderRadius: '8px',
                            }}>
                                Cancelar
                            </button>
                            <button
                                onClick={handleRevisionSubmit}
                                disabled={isSubmitting}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    padding: '10px 24px', border: 'none', borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #ecc94b 0%, #d69e2e 100%)',
                                    color: 'white', fontSize: '14px', fontWeight: 600,
                                    cursor: 'pointer', opacity: isSubmitting ? 0.7 : 1,
                                }}
                            >
                                <Send size={16} /> Enviar Feedback
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
