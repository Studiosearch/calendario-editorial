import React, { useState, useEffect } from 'react';
import { CheckCircle, ShieldCheck, MessageSquareText, ChevronLeft, Images, PlayCircle } from 'lucide-react';
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

export default function ApprovalGridView({ posts, metadata, onPostClick, onBack }) {
    const iconSize = useBreakpointValue({ base: 14, md: 20 });
    const statusIconSize = useBreakpointValue({ base: 10, md: 18 });

    const [filterMonth, setFilterMonth] = useState('all');
    const [visibleMonthLimit, setVisibleMonthLimit] = useState(1);

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

    // Agrupamento por Mês
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
            <div style={{
                background: 'white', borderBottom: '1px solid #e2e8f0',
                padding: '12px 0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#319795' }}>
                            <ShieldCheck size={iconSize} />
                            <span style={{
                                fontWeight: 700,
                                fontSize: window.innerWidth >= 768 ? '1.1rem' : '0.75rem',
                                whiteSpace: 'nowrap',
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
                                        setVisibleMonthLimit(1);
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
                    {/* Hero text */}
                    <div style={{ textAlign: 'center', padding: '0 16px' }}>
                        <h1 style={{
                            fontSize: 'clamp(1.25rem, 4vw, 2.5rem)', fontWeight: 800,
                            margin: '0 0 8px', lineHeight: 1.15,
                            color: '#202325',
                            fontFamily: "'Gastromond', 'Playfair Display', serif"
                        }}>
                            Bem-vindo à sua nova vitrine de conversão.
                        </h1>
                        <p style={{
                            color: '#718096', fontSize: 'clamp(0.875rem, 2vw, 1.125rem)', margin: 0,
                        }}>
                            Confira e aprove o cronograma estratégico da sua rede social.
                        </p>
                    </div>

                    {/* Groups */}
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
                                {post.postagem?.[0] ? (
                                    <FilePreview file={post.postagem[0]} height="100%" objectFit="cover" disableViewer />
                                ) : (
                                    <div style={{
                                        height: '100%', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', padding: '8px', textAlign: 'center',
                                    }}>
                                        <span style={{
                                            fontSize: window.innerWidth >= 768 ? '12px' : '10px',
                                            color: '#a0aec0', fontWeight: 700,
                                        }}>
                                            {post.name}
                                        </span>
                                    </div>
                                )}

                                {/* Right Top Media Indicators */}
                                <div style={{
                                    position: 'absolute', top: '8px', right: '8px',
                                    display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 10
                                }}>
                                    {post.postagem?.length > 1 && (
                                        <div style={{
                                            background: 'rgba(0,0,0,0.6)', padding: '6px',
                                            borderRadius: '50%', color: 'white', backdropFilter: 'blur(4px)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <Images size={14} />
                                        </div>
                                    )}
                                </div>

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

                                {/* Máscara Escura para Destaque */}
                                {(post.status === 'Aprovado' || post.status === 'Revisão') && (
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.7) 100%)',
                                        zIndex: 5, pointerEvents: 'none'
                                    }} />
                                )}

                                {/* Status text label (Botton Left) */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: window.innerWidth >= 768 ? '12px' : '8px',
                                    left: window.innerWidth >= 768 ? '12px' : '8px',
                                    display: 'flex', gap: '4px',
                                    zIndex: 10,
                                }}>
                                    {post.status === 'Aprovado' && (
                                        <div style={{
                                            background: 'rgba(72,187,120,0.95)', padding: '6px 12px',
                                            borderRadius: '6px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                                            color: 'white', display: 'flex', alignItems: 'center', gap: '6px',
                                            border: '1px solid #38a169', backdropFilter: 'blur(4px)'
                                        }}>
                                            <CheckCircle size={14} color="white" />
                                            <span style={{ fontSize: window.innerWidth >= 768 ? '12px' : '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                Aprovado
                                            </span>
                                        </div>
                                    )}
                                    {post.status === 'Revisão' && (
                                        <div style={{
                                            background: 'rgba(236,201,75,0.95)', padding: '6px 12px',
                                            borderRadius: '6px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                                            color: '#744210', display: 'flex', alignItems: 'center', gap: '6px',
                                            border: '1px solid #d69e2e', backdropFilter: 'blur(4px)'
                                        }}>
                                            <MessageSquareText size={14} color="#744210" />
                                            <span style={{ fontSize: window.innerWidth >= 768 ? '12px' : '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                Revisão
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                                    </div>
                                </div>
                            ))}

                        {/* Ver Mais Button */}
                        {filterMonth === 'all' && visibleMonthLimit < monthGroups.length && (
                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                                <button 
                                    onClick={() => setVisibleMonthLimit(prev => prev + 1)}
                                    style={{
                                        padding: '12px 24px', borderRadius: '8px', border: 'none',
                                        background: '#319795', color: 'white', fontWeight: 600,
                                        fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                                        boxShadow: '0 4px 6px rgba(49,151,149,0.3)', transition: 'background 0.2s', width: window.innerWidth >= 768 ? 'auto' : '100%', justifyContent: 'center'
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = '#285e61'}
                                    onMouseLeave={(e) => e.target.style.background = '#319795'}
                                >
                                    Ver próximo mês
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
