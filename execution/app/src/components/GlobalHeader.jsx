import React from 'react';
import logo from '../assets/logo.png';

export default function GlobalHeader() {
    return (
        <header style={{
            background: '#202325',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
            height: '64px',
            zIndex: 1100,
            position: 'relative',
        }}>
            {/* Logo Left */}
            <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                <img 
                    src={logo} 
                    alt="Studio Search Logo" 
                    style={{ 
                        height: '40px', 
                        width: 'auto',
                        display: 'block'
                    }} 
                />
            </div>

            {/* Text Right */}
            <div style={{ 
                fontFamily: "'Poppins', sans-serif", 
                color: '#E4E1E6', 
                fontSize: '1.25rem', 
                fontWeight: 800,
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
            }}>
                Studio Search
            </div>
        </header>
    );
}
