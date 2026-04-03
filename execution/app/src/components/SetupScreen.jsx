import { ShieldCheck, Calendar, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { MONDAY_BOARDS } from '../api/mondayApi';
import GlobalHeader from './GlobalHeader';

export default function SetupScreen({ onConnect }) {
    const [token, setToken] = useState('');
    const [boardId, setBoardId] = useState(MONDAY_BOARDS[0].id);
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token.trim()) return;

        setIsValidating(true);
        setError(null);
        try {
            const success = await onConnect(token.trim(), boardId);
            if (!success) {
                setError('Token inválido ou sem permissão. Verifique sua chave API.');
            }
        } catch (err) {
            setError(err.message || 'Erro ao conectar. Tente novamente.');
        } finally {
            setIsValidating(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', flexDirection: 'column',
            background: '#E4E1E6',
            fontFamily: "'Poppins', sans-serif"
        }}>
            <GlobalHeader />
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                <div style={{
                    background: 'white', padding: '40px', borderRadius: '16px',
                    maxWidth: '500px', width: '100%',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)',
                    border: '1px solid #e2e8f0', animation: 'scale-fade-in 0.4s ease-out'
                }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '64px', height: '64px', background: '#f5f3ff',
                        borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 20px', color: '#B5A8FF',
                        boxShadow: '0 4px 14px rgba(181,168,255,0.15)',
                    }}>
                        <ShieldCheck size={32} />
                    </div>
                    <h1 style={{
                        margin: '0 0 12px',
                        fontSize: '1.75rem',
                        fontWeight: 800,
                        color: '#202325',
                        fontFamily: "'Gastromond', 'Playfair Display', serif"
                    }}>
                        Calendário Editorial
                    </h1>
                    <p style={{ margin: 0, color: '#718096', fontSize: '15px', lineHeight: 1.5 }}>
                        Conecte sua conta do Monday.com para sincronizar seus quadros editoriais automaticamente.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {error && (
                        <div style={{
                            padding: '12px 16px', background: '#fff5f5', border: '1px solid #fc8181',
                            borderRadius: '8px', color: '#c53030', fontSize: '14px', fontWeight: 500,
                            display: 'flex', alignItems: 'flex-start', gap: '10px'
                        }}>
                            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span>{error}</span>
                        </div>
                    )}

                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, margin: '0 0 8px', color: '#4a5568' }}>
                            Token de API Pessoal (v2)
                        </label>
                        <input
                            type="password"
                            placeholder="eyJhbGciOiJIUzI1NiIsInR5c..."
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            style={{
                                width: '100%', padding: '12px 16px', fontSize: '15px',
                                border: '1px solid #cbd5e0', borderRadius: '8px',
                                fontFamily: 'monospace', background: '#f7fafc', outline: 'none',
                            }}
                            onFocus={(e) => { e.target.style.borderColor = '#B5A8FF'; e.target.style.background = '#fff'; }}
                            onBlur={(e) => { e.target.style.borderColor = '#cbd5e0'; e.target.style.background = '#f7fafc'; }}
                        />
                        <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#a0aec0' }}>
                            Encontre seu token em Perfil &gt; Developers &gt; Developer Center &gt; API token
                        </p>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, margin: '0 0 8px', color: '#4a5568' }}>
                            Quadro de Destino
                        </label>
                        <div style={{ position: 'relative' }}>
                            <select
                                value={boardId}
                                onChange={(e) => setBoardId(e.target.value)}
                                style={{
                                    width: '100%', padding: '12px 16px', fontSize: '15px', fontWeight: 500,
                                    border: '1px solid #cbd5e0', borderRadius: '8px', cursor: 'pointer',
                                    appearance: 'none', background: '#fff', color: '#2d3748', outline: 'none',
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#B5A8FF'}
                                onBlur={(e) => e.target.style.borderColor = '#cbd5e0'}
                            >
                                {MONDAY_BOARDS.map((board) => (
                                    <option key={board.id} value={board.id}>
                                        {board.name}
                                    </option>
                                ))}
                            </select>
                            <div style={{
                                position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
                                pointerEvents: 'none', color: '#a0aec0'
                            }}>
                                ▼
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!token.trim() || isValidating}
                        style={{
                            marginTop: '12px', padding: '14px', border: 'none', borderRadius: '8px',
                            background: '#B5A8FF',
                            color: 'white', fontSize: '16px', fontWeight: 700, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                            boxShadow: '0 4px 14px rgba(181,168,255,0.3)', transition: 'all 0.2s',
                            opacity: (!token.trim() || isValidating) ? 0.7 : 1,
                        }}
                    >
                        {isValidating ? (
                            <>
                                <Loader2 size={20} className="animate-spin" /> Conectando...
                            </>
                        ) : (
                            <>
                                <ShieldCheck size={20} /> Conectar ao Monday
                            </>
                        )}
                    </button>
                </form>

                <style>{`
                  .animate-spin { animation: spin 1s linear infinite; }
                  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                `}</style>

                <p style={{ marginTop: '24px', textAlign: 'center', color: '#a0aec0', fontSize: '11px' }}>
                    Studio Search © {new Date().getFullYear()}
                </p>
            </div>
        </div>
    </div>
);
}
