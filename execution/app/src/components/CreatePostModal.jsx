import React, { useState } from 'react';
import { Calendar, Plus, X } from 'lucide-react';

export default function CreatePostModal({ open, date, onClose, onSubmit }) {
    const [name, setName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        setIsSubmitting(true);
        await onSubmit(name, date);
        setIsSubmitting(false);
        setName('');
        onClose();
    };

    if (!open || !date) return null;

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <div onClick={onClose} style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
            }} />

            <div style={{
                position: 'relative', zIndex: 1,
                width: '90%', maxWidth: '440px', padding: '28px',
                background: 'white', borderRadius: '16px',
                boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
                border: '1px solid #e2e8f0',
                animation: 'scale-fade-in 0.3s ease-out',
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div>
                        <h3 style={{ margin: '0 0 8px', fontSize: '1.25rem', fontWeight: 700 }}>
                            Novo Planejamento
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#718096' }}>
                            <Calendar size={14} />
                            <span style={{ fontSize: '14px' }}>
                                {date.toLocaleDateString('pt-BR', { dateStyle: 'long' })}
                            </span>
                        </div>
                    </div>
                    <button onClick={onClose} style={{
                        width: '30px', height: '30px', border: 'none', background: 'transparent',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: '6px', color: '#718096',
                    }}>
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>
                        Título da Postagem
                    </label>
                    <input
                        type="text"
                        placeholder="Ex: 5 Dicas de Social Media"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoFocus
                        style={{
                            width: '100%', padding: '12px 16px',
                            border: '1px solid #e2e8f0', borderRadius: '12px',
                            fontSize: '15px', fontFamily: 'inherit',
                            background: '#f7fafc', outline: 'none',
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#3182ce'}
                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                    />
                    <p style={{ fontSize: '12px', color: '#a0aec0', margin: '8px 0 0' }}>
                        Este item será criado automaticamente no seu calendário.
                    </p>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
                        <button type="button" onClick={onClose} style={{
                            flex: 1, padding: '10px', border: 'none', background: 'transparent',
                            fontSize: '14px', fontWeight: 600, cursor: 'pointer', borderRadius: '12px',
                            color: '#4a5568',
                        }}>
                            Cancelar
                        </button>
                        <button type="submit" disabled={isSubmitting} style={{
                            flex: 2, padding: '10px', border: 'none',
                            background: 'linear-gradient(135deg, #3182ce 0%, #2b6cb0 100%)',
                            color: 'white', fontSize: '14px', fontWeight: 600,
                            cursor: 'pointer', borderRadius: '12px',
                            boxShadow: '0 4px 6px rgba(49,130,206,0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            opacity: isSubmitting ? 0.7 : 1,
                        }}>
                            <Plus size={18} />
                            {isSubmitting ? 'Criando...' : 'Criar Post'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
