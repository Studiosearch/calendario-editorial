import React from 'react';
import FilePreview from './FilePreview';

export default function PostCard({ item, onClick }) {
    const statusColor = item.statusColor || '#c4c4c4';
    const postFile = item.postagem?.[0];

    return (
        <div
            onClick={onClick}
            style={{
                cursor: 'pointer',
                background: 'white',
                borderRadius: '8px',
                borderLeft: `4px solid ${statusColor}`,
                boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                overflow: 'hidden',
                position: 'relative',
                transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.06)';
                e.currentTarget.style.transform = 'translateY(0)';
            }}
        >
            {postFile && (
                <div style={{ height: '60px', overflow: 'hidden', position: 'relative' }}>
                    <FilePreview file={postFile} height="60px" disableViewer />
                    {item.clientName && (
                        <span style={{
                            position: 'absolute',
                            bottom: '4px',
                            right: '4px',
                            background: 'rgba(0,0,0,0.58)',
                            backdropFilter: 'blur(4px)',
                            color: 'white',
                            fontSize: '8px',
                            fontWeight: 700,
                            letterSpacing: '0.3px',
                            padding: '2px 5px',
                            borderRadius: '4px',
                            maxWidth: '90px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            lineHeight: 1.4,
                            pointerEvents: 'none',
                        }}>
                            {item.clientName}
                        </span>
                    )}
                </div>
            )}

            <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {!postFile && item.clientName && (
                    <span style={{
                        fontSize: '8px',
                        fontWeight: 800,
                        color: '#4a5568',
                        background: '#edf2f7',
                        padding: '1px 5px',
                        borderRadius: '4px',
                        alignSelf: 'flex-start',
                        marginBottom: '2px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px',
                    }}>
                        {item.clientName}
                    </span>
                )}
                <span style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    color: '#a0aec0',
                    textTransform: 'uppercase',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}>
                    {item.plataformas?.join(', ') || 'Sem Plataforma'}
                </span>
                <span style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    lineHeight: 1.3,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                }}>
                    {item.name}
                </span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <span style={{
                        fontSize: '9px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: `${statusColor}22`,
                        color: statusColor,
                        fontWeight: 600,
                    }}>
                        {item.status}
                    </span>
                    <span style={{ fontSize: '9px', color: '#a0aec0' }}>{item.tipoDePost}</span>
                </div>
            </div>
        </div>
    );
}
