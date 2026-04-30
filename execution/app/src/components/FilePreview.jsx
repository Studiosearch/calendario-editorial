import React from 'react';

export default function FilePreview({ file, height = '100%', objectFit = 'cover', disableViewer = false }) {
    if (!file) return null;

    const url = file.url || '';
    const isVideo = file.type?.startsWith('video/') || url.match(/\.(mp4|webm|mov)$/i) || file.name?.match(/\.(mp4|mov|webm)$/i);

    const containerStyle = {
        width: '100%',
        height,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1a202c', // Dark background for media
        color: '#a0aec0',
        flexDirection: 'column',
        fontSize: '12px'
    };

    if (!url) {
        return (
            <div style={containerStyle}>
                <div style={{ padding: '20px', textAlign: 'center' }}>
                    📄<br />
                    {file.name || 'Arquivo sem visualização'}
                </div>
            </div>
        );
    }

    if (isVideo) {
        const videoUrl = url.includes('#t=') ? url : url + '#t=0.001';
        return (
            <div style={containerStyle}>
                <video
                    src={videoUrl}
                    style={{ width: '100%', height: '100%', objectFit }}
                    muted
                    autoPlay={!disableViewer}
                    loop
                    playsInline
                    preload="metadata"
                    controls={!disableViewer}
                />
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <img
                src={url}
                alt={file.name || 'Preview'}
                style={{ width: '100%', height: '100%', objectFit }}
                loading="lazy"
                decoding="async"
                draggable={false}
            />
        </div>
    );
}
