import React, { useState, useEffect } from 'react';
import { CheckCircle, ShieldCheck, MessageSquareText, ChevronLeft } from 'lucide-react';
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

    const sorted = [...posts].sort((a, b) => {
        if (!a.dataPostagem) return 1;
        if (!b.dataPostagem) return -1;
        return b.dataPostagem - a.dataPostagem;
    });

    return (
        <div className="animate-slide-fade-in" style={{ background: '#f7fafc', minHeight: '100vh' }}>
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
                        <div style={{ width: '140px', display: window.innerWidth >= 768 ? 'block' : 'none' }} />
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
                            background: 'linear-gradient(135deg, #1a365d 0%, #319795 100%)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>
                            Bem-vindo à sua nova vitrine de conversão.
                        </h1>
                        <p style={{
                            color: '#718096', fontSize: 'clamp(0.875rem, 2vw, 1.125rem)', margin: 0,
                        }}>
                            Confira e aprove o cronograma estratégico da sua rede social.
                        </p>
                    </div>

                    {/* Grid */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: window.innerWidth >= 768 ? '20px' : '8px',
                        maxWidth: '935px', margin: '0 auto', width: '100%', padding: '0 4px',
                    }}>
                        {sorted.map((post) => (
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

                                {/* Status badge */}
                                <div style={{
                                    position: 'absolute',
                                    top: window.innerWidth >= 768 ? '12px' : '4px',
                                    right: window.innerWidth >= 768 ? '12px' : '4px',
                                }}>
                                    {post.status === 'Aprovado' && (
                                        <div style={{
                                            background: '#48bb78', padding: window.innerWidth >= 768 ? '6px' : '4px',
                                            borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                            border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <CheckCircle size={statusIconSize} color="white" />
                                        </div>
                                    )}
                                    {post.status === 'Revisão' && (
                                        <div style={{
                                            background: '#ecc94b', padding: window.innerWidth >= 768 ? '6px' : '4px',
                                            borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                            border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <MessageSquareText size={statusIconSize} color="white" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
