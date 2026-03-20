import React, { useState, useRef, useEffect } from 'react';
import { Calendar, X, Copy, ChevronLeft, ChevronRight } from 'lucide-react';
import FilePreview from './FilePreview';

export default function ProfileView({ posts, metadata, open, onClose, onApprove, onRevision }) {
    const [quickPost, setQuickPost] = useState(null);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [isRevising, setIsRevising] = useState(false);
    const [revisionText, setRevisionText] = useState('');
    const carouselRef = useRef(null);

    useEffect(() => {
        if (quickPost) {
            setCurrentSlideIndex(0);
            setIsRevising(false);
            setRevisionText('');
        }
    }, [quickPost]);

    if (!open) return null;

    const sortedPosts = [...posts].sort((a, b) => {
        if (!a.dataPostagem) return 1;
        if (!b.dataPostagem) return -1;
        return b.dataPostagem - a.dataPostagem;
    });

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000 }}>
            <div onClick={onClose} style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
            }} />

            <div style={{
                position: 'relative', zIndex: 1, height: '100vh',
                display: 'flex', flexDirection: 'column', background: 'white',
            }}>
                {/* Header */}
                <div style={{
                    padding: '16px 24px', borderBottom: '1px solid #e2e8f0',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    position: 'relative', background: '#fafbfc',
                }}>
                    <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>{metadata.boardName}</h2>
                    <button onClick={onClose} style={{
                        position: 'absolute', right: '16px',
                        width: '32px', height: '32px', border: 'none', background: 'transparent',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: '8px', color: '#718096',
                    }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Grid */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '8px', maxWidth: '935px', margin: '0 auto', width: '100%',
                    }}>
                        {sortedPosts.map((post) => (
                            <div
                                key={post.id}
                                onClick={() => setQuickPost(post)}
                                style={{
                                    aspectRatio: '1080 / 1350', background: '#f7fafc',
                                    cursor: 'pointer', overflow: 'hidden', position: 'relative',
                                    transition: 'filter 0.2s',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(0.9)'}
                                onMouseLeave={(e) => e.currentTarget.style.filter = 'brightness(1)'}
                            >
                                {post.postagem?.length > 1 && (
                                    <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10, background: 'rgba(0,0,0,0.5)', borderRadius: '4px', padding: '4px', display: 'flex', color: 'white', pointerEvents: 'none' }}>
                                        <Copy size={16} />
                                    </div>
                                )}
                                {post.postagem?.[0] ? (
                                    <FilePreview file={post.postagem[0]} height="100%" objectFit="cover" disableViewer />
                                ) : (
                                    <div style={{
                                        height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        padding: '16px', textAlign: 'center',
                                    }}>
                                        <span style={{ fontSize: '12px', color: '#a0aec0' }}>{post.name}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick preview modal */}
            {quickPost && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 1100,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <div onClick={() => setQuickPost(null)} style={{
                        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)',
                    }} />
                    <div style={{
                        position: 'relative', zIndex: 1,
                        maxWidth: '500px', width: '90%', background: 'white',
                        borderRadius: '12px', overflow: 'hidden',
                    }}>
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setQuickPost(null)}
                                style={{
                                    position: 'absolute', top: '16px', right: '16px', zIndex: 100,
                                    width: '32px', height: '32px', borderRadius: '50%', border: 'none',
                                    background: 'rgba(0,0,0,0.6)', color: 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                    backdropFilter: 'blur(4px)', transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.8)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
                            >
                                <X size={18} />
                            </button>

                            <div
                                ref={carouselRef}
                                onScroll={(e) => {
                                    const idx = Math.round(e.target.scrollLeft / e.target.offsetWidth);
                                    if (idx !== currentSlideIndex) setCurrentSlideIndex(idx);
                                }}
                                className="profile-carousel" style={{ aspectRatio: '1080 / 1350', background: '#000', display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
                            >
                                <style>{`.profile-carousel::-webkit-scrollbar { display: none; } .profile-carousel { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
                                {quickPost.postagem?.length > 0 ? (
                                    quickPost.postagem.map((f, i) => (
                                        <div key={i} style={{ minWidth: '100%', scrollSnapAlign: 'start', position: 'relative' }}>
                                            <FilePreview file={f} height="100%" objectFit="contain" />
                                            {quickPost.postagem.length > 1 && (
                                                <div style={{ position: 'absolute', top: '16px', left: '16px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, pointerEvents: 'none', zIndex: 10 }}>
                                                    {i + 1} / {quickPost.postagem.length}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ minWidth: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <span style={{ color: 'white' }}>Sem imagem</span>
                                    </div>
                                )}
                            </div>
                            {quickPost.postagem?.length > 1 && (
                                <>
                                    {currentSlideIndex > 0 && (
                                        <button onClick={() => carouselRef.current?.scrollBy({ left: -carouselRef.current.offsetWidth, behavior: 'smooth' })} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 20 }}>
                                            <ChevronLeft size={20} color="black" />
                                        </button>
                                    )}
                                    {currentSlideIndex < quickPost.postagem.length - 1 && (
                                        <button onClick={() => carouselRef.current?.scrollBy({ left: carouselRef.current.offsetWidth, behavior: 'smooth' })} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 20 }}>
                                            <ChevronRight size={20} color="black" />
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#718096' }}>
                                    <Calendar size={14} />
                                    <span style={{ fontSize: '12px', fontWeight: 700 }}>
                                        {quickPost.dataPostagem?.toLocaleDateString('pt-BR')}
                                    </span>
                                </div>
                                <button onClick={() => setQuickPost(null)} style={{
                                    width: '28px', height: '28px', border: 'none', background: 'transparent',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#718096',
                                }}>
                                    <X size={16} />
                                </button>
                            </div>
                            <p style={{
                                fontSize: '14px', whiteSpace: 'pre-wrap', maxHeight: '150px',
                                overflowY: 'auto', margin: 0, lineHeight: 1.6, color: '#1a202c'
                            }}>
                                {quickPost.legenda || 'Sem legenda definida.'}
                            </p>

                            {/* APPROVAL UI */}
                            {!isRevising ? (
                                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                    <button
                                        onClick={() => {
                                            if (onApprove) onApprove(quickPost.id, 'Aprovado');
                                            setQuickPost(null);
                                        }}
                                        style={{ flex: 1, padding: '10px', background: '#48bb78', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#38a169'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = '#48bb78'}
                                    >
                                        Aprovar
                                    </button>
                                    <button
                                        onClick={() => setIsRevising(true)}
                                        style={{ flex: 1, padding: '10px', background: '#ecc94b', color: '#744210', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#d69e2e'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = '#ecc94b'}
                                    >
                                        Revisar
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                                    <textarea
                                        value={revisionText}
                                        onChange={(e) => setRevisionText(e.target.value)}
                                        placeholder="O que gostaria de modificar?"
                                        style={{
                                            width: '100%', minHeight: '100px', padding: '12px',
                                            border: '1px solid #e2e8f0', borderRadius: '8px',
                                            resize: 'vertical', fontFamily: 'inherit', fontSize: '13px',
                                            outline: 'none', background: 'white', color: '#1a202c'
                                        }}
                                    />
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => setIsRevising(false)}
                                            style={{ flex: 1, padding: '8px', background: '#edf2f7', color: '#4a5568', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (onRevision) onRevision(quickPost.id, ['Feedback Geral'], revisionText);
                                                setQuickPost(null);
                                            }}
                                            style={{ flex: 2, padding: '8px', background: '#3182ce', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                                        >
                                            Enviar Feedback
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
