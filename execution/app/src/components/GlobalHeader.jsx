import React from 'react';

export default function GlobalHeader() {
    return (
        <header style={{
            background: '#202325',
            padding: '0 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
            height: '64px',
            zIndex: 1100,
            position: 'sticky',
            top: 0
        }}>
            {/* Left Brand */}
            <div style={{ 
                fontFamily: "'Poppins', sans-serif", 
                color: '#E4E1E6', 
                fontSize: '0.875rem', 
                fontWeight: 700,
                letterSpacing: '0.25em',
                textTransform: 'uppercase'
            }}>
                Studio Search
            </div>

            {/* Right Brand */}
            <div style={{ 
                fontFamily: "'Poppins', sans-serif", 
                color: '#E4E1E6', 
                fontSize: '0.875rem', 
                fontWeight: 700,
                letterSpacing: '0.25em',
                textTransform: 'uppercase'
            }}>
                Studio Search
            </div>
        </header>
    );
}
