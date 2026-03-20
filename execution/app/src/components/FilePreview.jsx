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
        return (
            <div style={containerStyle}>
                <video
                    src={url}
                    style={{ width: '100%', height: '100%', objectFit }}
                    muted
                    autoPlay={!disableViewer}
                    loop
                    playsInline
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
                draggable={false}
            />
        </div>
    );
}
