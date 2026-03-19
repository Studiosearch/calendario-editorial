import React from 'react';
import { Save, Trash2 } from 'lucide-react';

export default function PostDetailFooter({ onSave, isSaving, onDelete }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            {onDelete ? (
                <button
                    onClick={onDelete}
                    disabled={isSaving}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '10px 16px', border: '1px solid #feb2b2',
                        background: '#fff5f5', color: '#c53030', fontWeight: 600, fontSize: '14px',
                        borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', opacity: isSaving ? 0.5 : 1,
                    }}
                    onMouseEnter={(e) => { if (!isSaving) e.currentTarget.style.background = '#fed7d7'; }}
                    onMouseLeave={(e) => { if (!isSaving) e.currentTarget.style.background = '#fff5f5'; }}
                >
                    <Trash2 size={18} /> Excluir
                </button>
            ) : <div />}

            <button
                onClick={onSave}
                disabled={isSaving}
                style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '10px 32px', border: 'none',
                    background: 'linear-gradient(135deg, #3182ce 0%, #2b6cb0 100%)',
                    color: 'white', fontWeight: 600, fontSize: '14px',
                    borderRadius: '12px', cursor: 'pointer',
                    boxShadow: '0 4px 6px rgba(49, 130, 206, 0.3)',
                    transition: 'all 0.2s', opacity: isSaving ? 0.7 : 1,
                }}
                onMouseEnter={(e) => { if (!isSaving) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
                <Save size={18} />
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
        </div>
    );
}
