import React from 'react';
import { Calendar, FileText, Share2, User, Layers, Type } from 'lucide-react';
import { PLATFORM_OPTIONS, DESENVOLVIMENTO_OPTIONS, TIPO_DE_POST_OPTIONS, STATUS_COLORS } from '../constants';

export default function PostDetailPlanning({
    item, roteiro, onRoteiroChange,
    desenvolvimento, onDesenvolvimentoChange,
    tipoDePost, onTipoDePostChange,
    plataformas, onPlataformasChange
}) {
    const handleToggle = (value) => {
        const next = plataformas.includes(value)
            ? plataformas.filter((p) => p !== value)
            : [...plataformas, value];
        onPlataformasChange(next);
    };

    const selectStyle = {
        width: '100%', padding: '8px 12px',
        border: '1px solid #e2e8f0', borderRadius: '6px',
        background: 'white', fontSize: '13px', fontFamily: 'inherit', color: '#1a202c',
        cursor: 'pointer', outline: 'none',
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Data */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#718096', marginBottom: '8px' }}>
                    <Calendar size={16} />
                    <span style={{ fontSize: '11px', fontWeight: 700 }}>DATA POSTAGEM</span>
                </div>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#2d3748', paddingLeft: '4px' }}>
                    {item.dataPostagem?.toLocaleDateString('pt-BR', { dateStyle: 'full' }) || 'Não definida'}
                </span>
            </div>

            {/* Desenvolvimento + Tipo */}
            <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#718096', marginBottom: '8px' }}>
                        <Layers size={14} />
                        <span style={{ fontSize: '11px', fontWeight: 700 }}>DESENVOLVIMENTO</span>
                    </div>
                    <select
                        value={desenvolvimento || ''}
                        onChange={(e) => onDesenvolvimentoChange(e.target.value)}
                        style={selectStyle}
                    >
                        {DESENVOLVIMENTO_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#718096', marginBottom: '8px' }}>
                        <Type size={14} />
                        <span style={{ fontSize: '11px', fontWeight: 700 }}>TIPO DE POST</span>
                    </div>
                    <select
                        value={tipoDePost || ''}
                        onChange={(e) => onTipoDePostChange(e.target.value)}
                        style={selectStyle}
                    >
                        {TIPO_DE_POST_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Roteiro */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#718096', marginBottom: '8px' }}>
                    <FileText size={16} />
                    <span style={{ fontSize: '11px', fontWeight: 700 }}>ROTEIRO</span>
                </div>
                <textarea
                    value={roteiro}
                    onChange={(e) => onRoteiroChange(e.target.value)}
                    placeholder="Instruções para o design..."
                    style={{
                        width: '100%', minHeight: '100px', padding: '12px',
                        border: '1px solid #e2e8f0', borderRadius: '12px',
                        background: '#f7fafc', fontSize: '13px', fontFamily: 'inherit', color: '#1a202c',
                        resize: 'vertical', outline: 'none',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#B5A8FF'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
            </div>

            {/* Plataformas */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#718096', marginBottom: '8px' }}>
                    <Share2 size={16} />
                    <span style={{ fontSize: '11px', fontWeight: 700 }}>PLATAFORMAS</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', padding: '4px' }}>
                    {PLATFORM_OPTIONS.map((p) => (
                        <label key={p.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                            <input
                                type="checkbox"
                                checked={plataformas.includes(p.value)}
                                onChange={() => handleToggle(p.value)}
                                style={{ accentColor: '#B5A8FF' }}
                            />
                            <span style={{ color: '#1a202c' }}>{p.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Responsável */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#718096', marginBottom: '8px' }}>
                    <User size={16} />
                    <span style={{ fontSize: '11px', fontWeight: 700 }}>RESPONSÁVEL</span>
                </div>
                <span style={{ fontSize: '13px', color: '#a0aec0' }}>Sem responsável</span>
            </div>
        </div>
    );
}
