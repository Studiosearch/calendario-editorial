import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, ShieldCheck, MessageSquareText, ChevronLeft, Images, PlayCircle, X, ChevronRight, Send, AlertCircle, ClipboardList } from 'lucide-react';
import FilePreview from './FilePreview';

function useBreakpointValue(values) {
    const [val, setVal] = useState(values.base);
    useEffect(() => {
        const mql = window.matchMedia('(min-width: 768px)');
        const handler = () => setVal(mql.matches ? (values.md || values.base) : values.base);
        mql.addEventListener('change', handler);
        handler();
        return () => mql.removeEventListener('change', handler);
    }, [values.base, values.md]);
    return val;
}

const normalizeStatus = (s) => (s || '').trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export default function ApprovalGridView({ posts, metadata, onPostClick, onBack, onApprove, onRevision }) {
    const iconSize = useBreakpointValue({ base: 14, md: 20 });
    const statusIconSize = useBreakpointValue({ base: 10, md: 18 });

    const [filterMonth, setFilterMonth] = useState('all');
    const [visibleMonthLimit, setVisibleMonthLimit] = useState(2);

    const [revisaoPost, setRevisaoPost] = useState(null);
    const [revisaoIdx, setRevisaoIdx] = useState(0);
    const [revisionOpen, setRevisionOpen] = useState(false);
    const [revisionCategories, setRevisionCategories] = useState([]);
    const [revisionText, setRevisionText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const openRevisaoPopup = (post, e) => {
        e.stopPropagation();
        setRevisaoPost(post);
        setRevisaoIdx(0);
        setRevisionOpen(false);
        setRevisionCategories([]);
        setRevisionText('');
    };

    const handleApprove = async () => {
        if (!revisaoPost || !onApprove) return;
        setIsSubmitting(true);
        try {
            await onApprove(revisaoPost.id, 'Aprovado');
            setRevisaoPost(null); 
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRevisionSubmit = async () => {
        if (!revisionText.trim() && revisionCategories.length === 0) return;
        setIsSubmitting(true);
        try {
            await onRevision(revisaoPost.id, revisionCategories, revisionText);
            setRevisionOpen(false);
            setRevisaoPost(null);
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleCategory = (cat) => {
        setRevisionCategories(prev =>
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        );
    };

    const sorted = [...posts].sort((a, b) => {
        if (!a.dataPostagem) return 1;
        if (!b.dataPostagem) return -1;
        return b.dataPostagem - a.dataPostagem;
    });

    const isVideoFile = (file) => {
        if (!file) return false;
        const url = file.url || '';
        return file.type?.startsWith('video/') || url.match(/\.(mp4|webm|mov)$/i) || file.name?.match(/\.(mp4|mov|webm)$/i);
    };

    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const groupedPosts = {};
    sorted.forEach(post => {
        let key = "Sem Data";
        let sortKey = 0;
        if (post.dataPostagem) {
            const y = post.dataPostagem.getFullYear();
            const m = post.dataPostagem.getMonth();
            key = `${monthNames[m]} ${y}`;
            sortKey = y * 100 + m;
        }
        if (!groupedPosts[key]) groupedPosts[key] = { key, sortKey, posts: [] };
        groupedPosts[key].posts.push(post);
    });

    const monthGroups = Object.values(groupedPosts).sort((a, b) => b.sortKey - a.sortKey);

    return (
        <div className="animate-slide-fade-in" style={{ background: '#E4E1E6', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ background: 'transparent', padding: '24px 0 12px 0' }}>
                <div style={{ padding: '0 16px', maxWidth: '100%', margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ minWidth: window.innerWidth >= 768 ? '140px' : 'auto' }}>
                            {onBack && (
                                <button onClick={onBack} style={{
                                    display: 'flex', alignItems: 'center', gap: '4px',
                                    border: 'none', background: 'transparent', cursor: 'pointer',
                                    fontSize: '13px', color: '#4a5568', fontWeight: 500,
                                    padding: '4px 8px', borderRadius: '6px',
                                }}>
                                    <ChevronLeft size={16} />
                                    {window.innerWidth >= 640 && 'Voltar'}
                                </button>
                            )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#B5A8FF' }}>
                            <ShieldCheck size={iconSize} />
                            <span style={{
                                fontWeight: 800,
                                fontSize: window.innerWidth >= 768 ? '1.5rem' : '0.9rem',
                                whiteSpace: 'nowrap',
                                fontFamily: "'Gastromond', 'Playfair Display', serif"
                            }}>
                                Aprovação - {metadata.boardName}
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <select 
                                value={filterMonth} 
                                onChange={(e) => {
                                    setFilterMonth(e.target.value);
                                    if(e.target.value !== 'all') {
                                        setVisibleMonthLimit(999);
                                    } else {
                                        setVisibleMonthLimit(3);
                                    }
                                }}
                                style={{
                                    padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0',
                                    fontSize: '13px', color: '#4a5568', background: '#f7fafc', outline: 'none',
                                    fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                }}
                            >
                                <option value="all">Filtro de Mês...</option>
                                {monthGroups.map(g => (
                                    <option key={g.key} value={g.key}>{g.key}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'stretch' }}>
                    <div style={{ textAlign: 'center', padding: '0 16px' }}>
                        <h1 style={{
                            fontSize: 'clamp(1.25rem, 4vw, 2.5rem)', fontWeight: 800,
                            margin: '0 0 8px', lineHeight: 1.15,
                            color: '#202325',
                            fontFamily: "'Gastromond', 'Playfair Display', serif"
                        }}>
                            Bem-vindo à sua nova vitrine de conversão.
                        </h1>
                        <p style={{ color: '#718096', fontSize: 'clamp(0.875rem, 2vw, 1.125rem)', margin: 0 }}>
                            Confira e aprove o cronograma estratégico da sua rede social.
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
                        {monthGroups
                            .filter(g => filterMonth === 'all' || g.key === filterMonth)
                            .slice(0, filterMonth === 'all' ? visibleMonthLimit : 999)
                            .map((group) => (
                                <div key={group.key}>
                                    <h2 style={{ 
                                        margin: '0 0 24px', fontSize: '1.25rem', fontWeight: 800, 
                                        color: '#202325', textAlign: 'center',
                                        textTransform: 'uppercase', letterSpacing: '0.05em',
                                        fontFamily: "'Gastromond', 'Playfair Display', serif"
                                    }}>
                                        {group.key}
                                    </h2>
                                    <div style={{
                                        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                                        gap: window.innerWidth >= 768 ? '20px' : '8px',
                                        maxWidth: '935px', margin: '0 auto', width: '100%', padding: '0 4px',
                                    }}>
                                        {group.posts.map((post) => (
                                            <div
                                                key={post.id}
                                                onClick={() => onPostClick(post)}
                                                style={{
                                                    aspectRatio: '1080 / 1350', background: 'white',
                                                    cursor: 'pointer', overflow: 'hidden',
                                                    borderRadius: window.innerWidth >= 768 ? '12px' : '8px',
                                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                                    transition: 'all 0.3s ease-out',
                                                    position: 'relative', border: '1px solid #e2e8f0',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
                                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                }}
                                            >
                                                {(() => {
                                                    const statusUpper = normalizeStatus(post.status);
                                                    const isRevised = statusUpper.includes('REVISADO') || statusUpper.includes('AG. APROVACAO');
                                                    const displayFile = (isRevised && post.revisaoFiles?.length > 0) ? post.revisaoFiles[0] : post.postagem?.[0];

                                                    if (displayFile) {
                                                        return (
                                                            <>
                                                                <FilePreview file={displayFile} height="100%" objectFit="cover" disableViewer />
                                                                {isRevised && (
                                                                    <div style={{
                                                                        position: 'absolute', top: '12px', left: '12px', zIndex: 30,
                                                                        background: 'rgba(181, 168, 255, 0.95)', color: 'white',
                                                                        padding: '4px 10px', borderRadius: '6px', fontSize: '10px',
                                                                        fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px',
                                                                        boxShadow: '0 4px 10px rgba(0,0,0,0.2)', backdropFilter: 'blur(4px)',
                                                                        border: '1px solid rgba(255,255,255,0.2)'
                                                                    }}>
                                                                        Versão Revisada
                                                                    </div>
                                                                )}
                                                            </>
                                                        );
                                                    }
                                                    return (
                                                        <div style={{
                                                            height: '100%', display: 'flex', flexDirection: 'column',
                                                            alignItems: 'center', justifyContent: 'center',
                                                            background: 'rgba(255,255,255,0.4)',
                                                            position: 'relative'
                                                        }}>
                                                            <div style={{
                                                                position: 'absolute', inset: 0,
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                background: 'rgba(255,255,255,0.2)',
                                                                backdropFilter: 'blur(2px)'
                                                            }}>
                                                                <span style={{
                                                                    fontSize: window.innerWidth >= 768 ? '24px' : '16px',
                                                                    color: '#B5A8FF', fontWeight: 900,
                                                                    textTransform: 'uppercase', letterSpacing: '2px',
                                                                    fontFamily: "'Gastromond', 'Playfair Display', serif",
                                                                    opacity: 0.8
                                                                }}>
                                                                    Coming Soon
                                                                </span>
                                                            </div>
                                                            <span style={{
                                                                fontSize: window.innerWidth >= 768 ? '12px' : '10px',
                                                                color: '#4a5568', fontWeight: 600,
                                                                marginTop: '60%', padding: '0 8px'
                                                            }}>
                                                                {post.name}
                                                            </span>
                                                        </div>
                                                    );
                                                })()}

                                                {(() => {
                                                    const statusNorm = normalizeStatus(post.status);
                                                    const isRevised = statusNorm === 'REVISADO AG. APROVACAO' || statusNorm === 'REVISAO';
                                                    const hasRevisedFiles = post.revisaoFiles?.length > 0;
                                                    if (isRevised && hasRevisedFiles && post.postagem?.length > 0) {
                                                        return (
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    window.dispatchEvent(new CustomEvent('open-compare', { detail: post }));
                                                                }}
                                                                style={{
                                                                    position: 'absolute', top: '10px', right: '10px', zIndex: 30,
                                                                    background: 'rgba(255,255,255,0.95)', padding: '6px 12px',
                                                                    borderRadius: '8px', color: '#B5A8FF', border: 'none',
                                                                    fontSize: '10px', fontWeight: 900, cursor: 'pointer',
                                                                    display: 'flex', alignItems: 'center', gap: '6px',
                                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)', transition: 'all 0.2s',
                                                                    backdropFilter: 'blur(4px)'
                                                                }}
                                                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                                                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                                            >
                                                                <ClipboardList size={12} />
                                                                Comparar
                                                            </button>
                                                        );
                                                    }
                                                    return null;
                                                })()}

                                                {/* Center Play Video Indicator */}
                                                {post.postagem?.[0] && isVideoFile(post.postagem[0]) && (
                                                    <div style={{
                                                        position: 'absolute', top: '50%', left: '50%',
                                                        transform: 'translate(-50%, -50%)',
                                                        background: 'rgba(0,0,0,0.5)', padding: '12px',
                                                        borderRadius: '50%', color: 'white', backdropFilter: 'blur(4px)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        zIndex: 10, pointerEvents: 'none', border: '2px solid rgba(255,255,255,0.7)'
                                                    }}>
                                                        <PlayCircle size={32} />
                                                    </div>
                                                )}

                                                {/* Máscara de Destaque */}
                                                {(() => {
                                                    const s = normalizeStatus(post.status);
                                                    if (s === 'REVISAO' || s === 'REVISADO AG. APROVACAO') {
                                                        return (
                                                            <div style={{
                                                                position: 'absolute', inset: 0,
                                                                background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.5) 100%)',
                                                                zIndex: 5, pointerEvents: 'none'
                                                            }} />
                                                        );
                                                    }
                                                    return null;
                                                })()}

                                                {/* Overlay Sutil para Outros Status */}
                                                {(() => {
                                                    const s = normalizeStatus(post.status);
                                                    const clearKeywords = ['APROVADO', 'APROVADA', 'AGENDADO', 'AGENDADA', 'POSTADO', 'REVISAO', 'REVISADO', 'CONCLUIDO', 'AGUARDANDO', 'APROVACAO'];
                                                    const isExcluded = clearKeywords.some(kw => s.includes(kw));

                                                    if (!isExcluded) {
                                                        return (
                                                            <div style={{
                                                                position: 'absolute', inset: 0,
                                                                background: 'rgba(0,0,0,0.45)',
                                                                zIndex: 15, pointerEvents: 'none'
                                                            }} />
                                                        );
                                                    }
                                                    return null;
                                                })()}

                                                {/* Status Label (Bottom Left) */}
                                                <div style={{
                                                    position: 'absolute', bottom: window.innerWidth >= 768 ? '12px' : '8px',
                                                    left: window.innerWidth >= 768 ? '12px' : '8px',
                                                    zIndex: 20, display: 'flex', gap: '8px', alignItems: 'center'
                                                }}>
                                                    {(() => {
                                                        const s = normalizeStatus(post.status);
                                                        if (s === 'REVISADO AG. APROVACAO') {
                                                            return (
                                                                <button
                                                                    onClick={(e) => openRevisaoPopup(post, e)}
                                                                    style={{
                                                                        background: 'rgba(236,201,75,0.95)', padding: '6px 12px',
                                                                        borderRadius: '6px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                                                                        color: '#744210', display: 'flex', alignItems: 'center', gap: '6px',
                                                                        border: '1px solid #ecc94b', backdropFilter: 'blur(4px)',
                                                                        cursor: 'pointer', transition: 'all 0.2s',
                                                                    }}
                                                                >
                                                                    <ClipboardList size={14} color="#744210" />
                                                                    <span style={{ fontSize: window.innerWidth >= 768 ? '12px' : '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                                        Ver Arte Anterior
                                                                    </span>
                                                                </button>
                                                            );
                                                        }
                                                        return (
                                                            <div style={{
                                                                background: (s === 'APROVADO' || s === 'POSTADO') ? 'rgba(72,187,120,0.95)' : 
                                                                            (s === 'REVISAO') ? 'rgba(236,201,75,0.95)' : 
                                                                            post.statusColor || 'rgba(181, 168, 255, 0.95)',
                                                                padding: '6px 12px', borderRadius: '6px',
                                                                color: (s === 'REVISAO') ? '#744210' : 'white',
                                                                fontSize: window.innerWidth >= 768 ? '11px' : '9px',
                                                                fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px',
                                                                boxShadow: '0 4px 10px rgba(0,0,0,0.2)', backdropFilter: 'blur(4px)',
                                                                display: 'flex', alignItems: 'center', gap: '6px',
                                                                border: '1px solid rgba(255,255,255,0.1)'
                                                            }}>
                                                                {s === 'APROVADO' && <CheckCircle size={14} color="white" />}
                                                                {s === 'REVISAO' && <AlertCircle size={14} color="#744210" />}
                                                                <span>{post.status}</span>
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                        {filterMonth === 'all' && visibleMonthLimit < monthGroups.length && (
                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                                <button 
                                    onClick={() => setVisibleMonthLimit(prev => prev + 1)}
                                    style={{
                                        padding: '12px 24px', borderRadius: '8px', border: 'none',
                                        background: '#B5A8FF', color: 'white', fontWeight: 600,
                                        fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s',
                                        boxShadow: '0 4px 6px rgba(181, 168, 255, 0.2)',
                                    }}
                                >
                                    Ver próximo mês
                                </button>
                            </div>
                        )}

                        {revisaoPost && (
                            <div style={{
                                position: 'fixed', inset: 0, zIndex: 3000,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                padding: '16px',
                            }}>
                                <div
                                    onClick={() => { setRevisaoPost(null); setRevisionOpen(false); }}
                                    style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }}
                                />
                                <div style={{
                                    position: 'relative', zIndex: 1,
                                    width: '100%', maxWidth: '520px',
                                    background: 'white', borderRadius: '20px',
                                    boxShadow: '0 30px 80px rgba(0,0,0,0.4)',
                                    overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
                                }}>
                                    <div style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '16px 20px',
                                        background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
                                        borderBottom: '1px solid #fed7aa', flexShrink: 0,
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <ClipboardList size={18} color="#c2410c" />
                                            <div>
                                                <span style={{ fontWeight: 800, fontSize: '15px', color: '#9a3412', display: 'block' }}>
                                                    Arte Anterior (Original)
                                                </span>
                                                <span style={{ fontSize: '11px', color: '#c2410c', fontWeight: 500 }}>
                                                    {revisaoPost.name}
                                                </span>
                                            </div>
                                        </div>
                                        <button onClick={() => { setRevisaoPost(null); setRevisionOpen(false); }} style={{ width: '30px', height: '30px', border: 'none', background: 'rgba(0,0,0,0.06)', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9a3412' }}>
                                            <X size={16} />
                                        </button>
                                    </div>

                                    <div style={{ overflowY: 'auto', flex: 1 }}>
                                        {revisaoPost.postagem?.length > 0 && (
                                            <div style={{ position: 'relative', background: '#111' }}>
                                                <div style={{ width: '100%', aspectRatio: '1 / 1', maxHeight: '320px', overflow: 'hidden' }}>
                                                    <FilePreview file={revisaoPost.postagem[revisaoIdx]} height="100%" objectFit="contain" />
                                                </div>
                                                {revisaoPost.postagem.length > 1 && (
                                                    <>
                                                        <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '3px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 700 }}>
                                                            {revisaoIdx + 1} / {revisaoPost.postagem.length}
                                                        </div>
                                                        <button onClick={() => setRevisaoIdx(i => i > 0 ? i - 1 : revisaoPost.postagem.length - 1)} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.85)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={18} /></button>
                                                        <button onClick={() => setRevisaoIdx(i => i < revisaoPost.postagem.length - 1 ? i + 1 : 0)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.85)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronRight size={18} /></button>
                                                    </>
                                                )}
                                            </div>
                                        )}

                                        {revisaoPost.alteracoesSolicitadas && (
                                            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', marginBottom: '8px' }}>
                                                    <MessageSquareText size={14} />
                                                    <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Feedback do Cliente</span>
                                                </div>
                                                <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, color: '#374151', background: '#fafafa', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', whiteSpace: 'pre-wrap' }}>
                                                    {revisaoPost.alteracoesSolicitadas}
                                                </p>
                                            </div>
                                        )}

                                        {!revisionOpen ? (
                                            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                <button onClick={handleApprove} disabled={isSubmitting} style={{ width: '100%', padding: '14px', border: 'none', borderRadius: '12px', background: 'linear-gradient(135deg, #B5A8FF 0%, #9f91f5 100%)', color: 'white', fontSize: '15px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: isSubmitting ? 0.7 : 1, boxShadow: '0 4px 6px rgba(181,168,255,0.3)' }}>
                                                    <CheckCircle size={18} /> Aprovar Conteúdo
                                                </button>
                                                <button onClick={() => setRevisionOpen(true)} disabled={isSubmitting} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #f97316', background: 'transparent', color: '#f97316', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                    <AlertCircle size={18} /> Solicitar Nova Revisão
                                                </button>
                                            </div>
                                        ) : (
                                            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                <div>
                                                    <span style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '10px' }}>O que deseja revisar?</span>
                                                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                                        {['Legenda', 'Conteúdo', 'Data'].map(cat => (
                                                            <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px' }}>
                                                                <input type="checkbox" checked={revisionCategories.includes(cat)} onChange={() => toggleCategory(cat)} style={{ accentColor: '#f97316' }} />
                                                                {cat}
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Feedback</label>
                                                    <textarea placeholder="Descreva os ajustes desejados..." value={revisionText} onChange={e => setRevisionText(e.target.value)} style={{ width: '100%', minHeight: '100px', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '10px', background: '#f9fafb', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical', outline: 'none' }} />
                                                </div>
                                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                                    <button onClick={() => setRevisionOpen(false)} style={{ padding: '8px 18px', border: 'none', background: 'transparent', fontSize: '14px', fontWeight: 600, cursor: 'pointer', color: '#6b7280', borderRadius: '8px' }}>Cancelar</button>
                                                    <button onClick={handleRevisionSubmit} disabled={isSubmitting} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 22px', border: 'none', borderRadius: '10px', background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
                                                        <Send size={14} /> Enviar Feedback
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
