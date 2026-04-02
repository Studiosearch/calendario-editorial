import React from 'react';

export default function PageHeader({ title, subtitle }) {
    return (
        <div>
            <h1 style={{
                fontFamily: "'Gastromond', 'Playfair Display', serif",
                fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
                fontWeight: 800,
                margin: 0,
                lineHeight: 1.2,
                color: '#202325',
            }}>
                {title}
            </h1>
            {subtitle && (
                <p style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '0.875rem',
                    color: '#4a5568',
                    margin: '4px 0 0',
                    fontWeight: 500,
                }}>
                    {subtitle}
                </p>
            )}
        </div>
    );
}
