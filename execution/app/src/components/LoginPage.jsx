import { Lock, User, Eye, EyeOff } from 'lucide-react';
import GlobalHeader from './GlobalHeader';

const CREDENTIALS = [
    { user: 'egle', pass: '270517' },
];

export default function LoginPage({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setTimeout(() => {
            const match = CREDENTIALS.find(
                c => c.user === username.trim().toLowerCase() && c.pass === password
            );
            if (match) {
                sessionStorage.setItem('ss_auth', 'ok');
                onLogin();
            } else {
                setError('Usuário ou senha inválidos.');
            }
            setLoading(false);
        }, 600);
    };

    return (
        <div style={{
            minHeight: '100vh', background: '#E4E1E6',
            display: 'flex', flexDirection: 'column',
            fontFamily: "'Poppins', sans-serif"
        }}>
            <GlobalHeader />
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                <div style={{
                    width: '100%', maxWidth: '400px',
                    background: 'white',
                    borderRadius: '24px', padding: '48px 40px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 25px 50px rgba(0,0,0,0.1)',
                }}>
                    {/* Brand */}
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <h1 style={{
                            margin: '0 0 6px', fontSize: '1.6rem', fontWeight: 800,
                            color: '#203a43', letterSpacing: '-0.02em',
                            fontFamily: "'Gastromond', 'Playfair Display', serif"
                        }}>
                            Acesso Restrito
                        </h1>
                        <p style={{ margin: 0, color: '#718096', fontSize: '14px' }}>
                            Calendário Editorial
                        </p>
                    </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Username */}
                    <div>
                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                            Usuário
                        </label>
                        <div style={{ position: 'relative' }}>
                            <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
                            <input
                                type="text"
                                id="login-user"
                                autoComplete="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Digite seu usuário"
                                style={{
                                    width: '100%', padding: '12px 16px 12px 42px',
                                    background: 'rgba(255,255,255,0.08)',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                    borderRadius: '12px', color: 'white', fontSize: '14px',
                                    outline: 'none', boxSizing: 'border-box',
                                    transition: 'border-color 0.2s',
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'rgba(49,151,149,0.8)'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                            Senha
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
                            <input
                                type={showPass ? 'text' : 'password'}
                                id="login-pass"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Digite sua senha"
                                style={{
                                    width: '100%', padding: '12px 42px 12px 42px',
                                    background: 'rgba(255,255,255,0.08)',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                    borderRadius: '12px', color: 'white', fontSize: '14px',
                                    outline: 'none', boxSizing: 'border-box',
                                    transition: 'border-color 0.2s',
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'rgba(49,151,149,0.8)'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(v => !v)}
                                style={{
                                    position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: 'rgba(255,255,255,0.4)', padding: 0, display: 'flex',
                                }}
                            >
                                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={{
                            padding: '10px 14px', borderRadius: '10px',
                            background: 'rgba(245,101,101,0.15)', border: '1px solid rgba(245,101,101,0.3)',
                            color: '#fc8181', fontSize: '13px', textAlign: 'center'
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%', padding: '14px',
                            background: loading ? 'rgba(181,168,255,0.5)' : '#B5A8FF',
                            border: 'none', borderRadius: '12px', color: 'white',
                            fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                            boxShadow: '0 4px 16px rgba(181,168,255,0.4)',
                            transition: 'all 0.2s', marginTop: '8px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                        }}
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>

                    <p style={{ margin: '28px 0 0', textAlign: 'center', color: '#a0aec0', fontSize: '12px' }}>
                        Studio Search © {new Date().getFullYear()}
                    </p>
                </div>
            </div>
        </div>
    );
}
