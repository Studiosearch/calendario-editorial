import React from 'react';

export default function PageHeader({ title, subtitle }) {
    return (
        <div>
            <h1 style={{
                fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
                fontWeight: 800,
                margin: 0,
                lineHeight: 1.2,
                background: 'linear-gradient(135deg, #1a365d 0%, #2b6cb0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
            }}>
                {title}
            </h1>
            {subtitle && (
                <p style={{
                    fontSize: '0.875rem',
                    color: '#718096',
                    margin: '4px 0 0',
                    fontWeight: 500,
                }}>
                    {subtitle}
                </p>
            )}
        </div>
    );
}
