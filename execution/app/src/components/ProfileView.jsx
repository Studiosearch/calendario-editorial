import React, { useState } from 'react';
import { Calendar, X } from 'lucide-react';
import FilePreview from './FilePreview';

export default function ProfileView({ posts, metadata, open, onClose }) {
    const [quickPost, setQuickPost] = useState(null);

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
                        <div style={{ aspectRatio: '1080 / 1350', background: '#000' }}>
                            {quickPost.postagem?.[0] ? (
                                <FilePreview file={quickPost.postagem[0]} height="100%" objectFit="contain" />
                            ) : (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span style={{ color: 'white' }}>Sem imagem</span>
                                </div>
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
                                overflowY: 'auto', margin: 0, lineHeight: 1.6,
                            }}>
                                {quickPost.legenda || 'Sem legenda definida.'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
