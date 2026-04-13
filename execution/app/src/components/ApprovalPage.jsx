import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, X, ChevronLeft, ChevronRight, ClipboardList, ShieldCheck } from 'lucide-react';
import ApprovalGridView from './ApprovalGridView';
import ApprovalDetailView from './ApprovalDetailView';
import FilePreview from './FilePreview';

const normalizeStatus = (s) => (s || '').trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

function ComparisonContent({ post }) {
    const [view, setView] = useState('new'); // 'old' or 'new'
    
    const oldFiles = post.postagem || [];
    const newFiles = post.revisaoFiles || [];
    const currentFiles = view === 'new' ? newFiles : oldFiles;
    const statusUpper = normalizeStatus(post.status);

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Toggle Switch */}
            <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
                <div style={{ 
                    background: 'rgba(255,255,255,0.1)', padding: '4px', borderRadius: '12px', 
                    display: 'flex', width: '100%', maxWidth: '300px', border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <button 
                        onClick={() => setView('old')}
                        style={{
                            flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                            background: view === 'old' ? '#B5A8FF' : 'transparent',
                            color: 'white', fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        Original (Antes)
                    </button>
                    <button 
                        onClick={() => setView('new')}
                        style={{
                            flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                            background: view === 'new' ? '#B5A8FF' : 'transparent',
                            color: 'white', fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        Revisada (Depois)
                    </button>
                </div>
            </div>

            {/* Media View */}
            <div style={{ flex: 1, background: '#000', position: 'relative', display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '100%', aspectRatio: '1080 / 1350', overflow: 'hidden' }}>
                    {currentFiles.length > 0 ? (
                        <div style={{ display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory', height: '100%' }}>
                            {currentFiles.map((file, idx) => (
                                <div key={idx} style={{ minWidth: '100%', height: '100%', scrollSnapAlign: 'start' }}>
                                    <FilePreview file={file} height="100%" objectFit="contain" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#718096' }}>
                            Sem arquivos nesta versão
                        </div>
                    )}
                </div>
                
                {/* Overlay Infos */}
                <div style={{ 
                    position: 'absolute', bottom: '20px', left: '20px', right: '20px',
                    padding: '12px', borderRadius: '12px', background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#B5A8FF', fontWeight: 800 }}>
                            {view === 'new' ? 'VERSÃO FINAL REVISADA' : 'VERSÃO ORIGINAL ENVIADA'}
                        </span>
                        <span style={{ fontSize: '11px', color: '#cbd5e0' }}>
                            {currentFiles.length} item(s)
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ApprovalPage({ posts, metadata, onBack, onApprove, onRevision }) {
    const [previewPost, setPreviewPost] = useState(null);
    const [showWelcome, setShowWelcome] = useState(false);
    const [wizardPosts, setWizardPosts] = useState([]);
    const [wizardIndex, setWizardIndex] = useState(-1); // -1 means wizard not active
    const [lastScrollY, setLastScrollY] = useState(0);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Identificar posts pendentes
    const getPendingPosts = () => {
        return posts
            .filter(p => {
                const s = normalizeStatus(p.status);
                // Busca por qualquer variação de "EM APROVAÇÃO" ou "REVISADO" ou "REVISÃO" ou "AGUARDANDO"
                return s.startsWith('EM APROVACAO') || s === 'REVISADO AG. APROVACAO' || s === 'REVISAO' || s.startsWith('AGUARDANDO');
            })
            .sort((a, b) => {
                if (!a.dataPostagem) return 1;
                if (!b.dataPostagem) return -1;
                return a.dataPostagem - b.dataPostagem;
            });
    };

    const [comparePost, setComparePost] = useState(null);

    // Ao carregar, verifica se tem pendências para mostrar o Welcome
    useEffect(() => {
        if (posts.length > 0) {
            const pending = getPendingPosts();
            if (pending.length > 0) {
                // Só mostra o welcome se o wizard não estiver ativo e não estivermos vendo um post já
                if (wizardIndex === -1 && !previewPost && !showSuccessModal) {
                    setShowWelcome(true);
                    setWizardPosts(pending);
                }
            }
        }
    }, [posts]); // Re-calcula se a lista de posts mudar (raso)

    // Restaurar scroll ao fechar o post
    useEffect(() => {
        // Se voltamos para o grid e temos um scroll salvo
        if (!previewPost && wizardIndex === -1 && !comparePost && lastScrollY > 0) {
            // Tentativa imediata e uma com múltiplos delays para garantir o render do grid
            const restore = () => {
                window.scrollTo({ top: lastScrollY, behavior: 'instant' });
            };
            
            restore();
            setTimeout(restore, 50);
            setTimeout(restore, 150);
            setTimeout(restore, 300);
            setTimeout(restore, 600);
        }
    }, [previewPost, wizardIndex, comparePost]);

    const startWizard = () => {
        setShowWelcome(false);
        setWizardIndex(0);
    };

    const handleNextInWizard = () => {
        if (wizardIndex < wizardPosts.length - 1) {
            setWizardIndex(prev => prev + 1);
        } else {
            // Fim do wizard - Mostrar sucesso!
            setWizardIndex(-1);
            setWizardPosts([]);
            setShowSuccessModal(true);
        }
    };

    const handleOpenPost = (post) => {
        setLastScrollY(window.scrollY);
        setPreviewPost(post);
    };

    // Ouvir evento de comparação
    useEffect(() => {
        const handleOpenCompare = (e) => {
            setLastScrollY(window.scrollY);
            setComparePost(e.detail);
        };
        window.addEventListener('open-compare', handleOpenCompare);
        return () => window.removeEventListener('open-compare', handleOpenCompare);
    }, []);

    // --- RENDERS CONDICIONAIS APÓS OS HOOKS ---

    // Modal de Comparação
    if (comparePost) {
        return (
            <div style={{
                position: 'fixed', inset: 0, zIndex: 7000,
                background: '#1a202c', color: 'white', display: 'flex', flexDirection: 'column'
            }}>
                <div style={{
                    padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                    <button onClick={() => setComparePost(null)} style={{
                        background: 'transparent', border: 'none', color: 'white', cursor: 'pointer'
                    }}>
                        <ChevronLeft size={24} />
                    </button>
                    <div style={{ textAlign: 'center' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 800 }}>Comparar Criativos</h3>
                        <p style={{ fontSize: '11px', color: '#a0aec0' }}>{comparePost.name}</p>
                    </div>
                    <div style={{ width: '24px' }} />
                </div>

                <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                    <ComparisonContent post={comparePost} />
                </div>

                <div style={{ padding: '24px', background: 'rgba(0,0,0,0.5)', textAlign: 'center' }}>
                    <button 
                        onClick={() => setComparePost(null)}
                        style={{
                            width: '100%', maxWidth: '300px', padding: '16px', borderRadius: '12px',
                            border: 'none', background: '#B5A8FF', color: 'white', fontWeight: 800,
                            cursor: 'pointer'
                        }}
                    >
                        Fechar Comparação
                    </button>
                </div>
            </div>
        );
    }
    // Se estiver no modo Wizard
    if (wizardIndex >= 0 && wizardPosts[wizardIndex]) {
        const currentPost = wizardPosts[wizardIndex];
        return (
            <div style={{ background: '#f7fafc', minHeight: '100vh' }}>
                {/* Barra de Progresso Fixed */}
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
                    padding: '10px 16px', background: 'rgba(181, 168, 255, 0.98)',
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    backdropFilter: 'blur(10px)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    borderBottom: '1px solid rgba(255,255,255,0.2)'
                }}>
                    <div style={{ width: '32px' }} />
                    <span style={{ fontSize: '13px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Modo de Aprovação ({wizardIndex + 1} / {wizardPosts.length})
                    </span>
                    <button 
                        onClick={() => { setWizardIndex(-1); setWizardPosts([]); }}
                        style={{
                            width: '32px', height: '32px', borderRadius: '50%', border: 'none',
                            background: 'rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        <X size={18} />
                    </button>
                </div>

                <div style={{ paddingTop: '45px' }}>
                    <ApprovalDetailView
                        post={currentPost}
                        metadata={metadata}
                        onClose={() => { setWizardIndex(-1); setWizardPosts([]); }}
                        onApprove={async (id, status) => {
                            await onApprove(id, status);
                            handleNextInWizard();
                        }}
                        onRevision={async (id, cats, text) => {
                            await onRevision(id, cats, text);
                            handleNextInWizard();
                        }}
                    />
                </div>
            </div>
        );
    }

    if (previewPost) {
        return (
            <ApprovalDetailView
                post={previewPost}
                metadata={metadata}
                onClose={() => setPreviewPost(null)}
                onApprove={onApprove}
                onRevision={onRevision}
            />
        );
    }

    return (
        <>
            <ApprovalGridView
                posts={posts}
                metadata={metadata}
                onPostClick={handleOpenPost}
                onBack={onBack}
                onApprove={onApprove}
                onRevision={onRevision}
            />

            {/* Modal de Boas-vindas */}
            {showWelcome && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 5000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '20px', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)'
                }}>
                    <div style={{
                        width: '100%', maxWidth: '400px', background: 'white',
                        borderRadius: '24px', padding: '32px', textAlign: 'center',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        animation: 'modalIn 0.3s ease-out'
                    }}>
                        <div style={{
                            width: '64px', height: '64px', borderRadius: '20px',
                            background: '#fff7ed', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', margin: '0 auto 20px', color: '#f97316'
                        }}>
                            <AlertCircle size={32} />
                        </div>
                        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1a202c', marginBottom: '12px' }}>
                            Atenção!
                        </h2>
                        <p style={{ color: '#4a5568', fontSize: '16px', lineHeight: 1.5, marginBottom: '24px' }}>
                            Ficou faltando aprovar conteúdos pendentes. Deseja revisá-los agora?
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <button
                                onClick={startWizard}
                                style={{
                                    padding: '16px', borderRadius: '14px', border: 'none',
                                    background: 'linear-gradient(135deg, #B5A8FF 0%, #9f91f5 100%)',
                                    color: 'white', fontSize: '16px', fontWeight: 700, cursor: 'pointer',
                                    boxShadow: '0 4px 6px rgba(181,168,255,0.3)'
                                }}
                            >
                                Aprovar agora
                            </button>
                            <button
                                onClick={() => setShowWelcome(false)}
                                style={{
                                    padding: '14px', borderRadius: '14px', border: 'none',
                                    background: 'transparent', color: '#718096',
                                    fontSize: '15px', fontWeight: 600, cursor: 'pointer'
                                }}
                            >
                                Sair
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Sucesso Final */}
            {showSuccessModal && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 6000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '20px', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)'
                }}>
                    <div id="confetti-container" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }} />
                    
                    <div style={{
                        width: '100%', maxWidth: '550px', 
                        background: 'white', borderRadius: '32px', padding: '48px', 
                        textAlign: 'center', boxShadow: '0 30px 60px -12px rgba(181, 168, 255, 0.4)',
                        position: 'relative', zIndex: 1,
                        animation: 'modalIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}>
                        <div style={{
                            width: '90px', height: '90px', borderRadius: '30px',
                            background: 'linear-gradient(135deg, #B5A8FF 0%, #9f91f5 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 32px', color: 'white',
                            boxShadow: '0 15px 30px rgba(181, 168, 255, 0.4)'
                        }}>
                            <CheckCircle size={48} />
                        </div>
                        
                        <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#1a202c', marginBottom: '20px', lineHeight: 1.2 }}>
                            Obrigada!
                        </h2>
                        
                        <div style={{ marginBottom: '40px' }}>
                            <p style={{ 
                                color: '#2d3748', fontSize: '18px', fontWeight: 700, 
                                marginBottom: '16px', lineHeight: 1.4 
                            }}>
                                Material aprovado com sucesso.
                            </p>
                            <p style={{ 
                                color: '#718096', fontSize: '16px', lineHeight: 1.6, 
                                fontStyle: 'italic', padding: '0 20px'
                            }}>
                                "Mais do que liberar 'posts', você acabou de dar o go em uma nova percepção de valor para o seu negócio"
                            </p>
                        </div>

                        <button
                            onClick={() => setShowSuccessModal(false)}
                            style={{
                                width: '100%', padding: '18px', borderRadius: '16px', border: 'none',
                                background: '#B5A8FF', color: 'white', fontSize: '17px', 
                                fontWeight: 800, cursor: 'pointer', transition: 'all 0.3s',
                                boxShadow: '0 8px 20px rgba(181, 168, 255, 0.3)'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.background = '#9f91f5';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.background = '#B5A8FF';
                            }}
                        >
                            Ver Calendário Completo
                        </button>
                    </div>

                    {/* Script leve para confetes */}
                    <script dangerouslySetInnerHTML={{ __html: `
                        (function() {
                            const container = document.getElementById('confetti-container');
                            const colors = ['#B5A8FF', '#9f91f5', '#FFD700', '#FF69B4', '#00CED1'];
                            for (let i = 0; i < 100; i++) {
                                const confetti = document.createElement('div');
                                confetti.style.position = 'absolute';
                                confetti.style.width = Math.random() * 10 + 5 + 'px';
                                confetti.style.height = Math.random() * 10 + 5 + 'px';
                                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                                confetti.style.left = Math.random() * 100 + 'vw';
                                confetti.style.top = -20 + 'px';
                                confetti.style.borderRadius = '2px';
                                confetti.style.opacity = Math.random();
                                confetti.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
                                container.appendChild(confetti);
                                
                                const duration = Math.random() * 3 + 2;
                                confetti.animate([
                                    { transform: 'translateY(0) rotate(0deg)', opacity: confetti.style.opacity },
                                    { transform: 'translateY(110vh) rotate(' + Math.random() * 720 + 'deg)', opacity: 0 }
                                ], {
                                    duration: duration * 1000,
                                    easing: 'cubic-bezier(0, 0, 0.2, 1)',
                                    fill: 'forwards'
                                });
                            }
                        })();
                    `}} />
                </div>
            )}

            <style>{`
                @keyframes modalIn {
                    from { opacity: 0; transform: scale(0.8) translateY(40px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
            <div style={{
                position: 'fixed', bottom: '10px', right: '10px', 
                fontSize: '12px', color: '#fff', fontWeight: 900, 
                pointerEvents: 'none', zIndex: 9999, background: '#B5A8FF',
                padding: '4px 10px', borderRadius: '8px', 
                boxShadow: '0 4px 12px rgba(181,168,255,0.4)',
                border: '2px solid white',
                textTransform: 'uppercase', letterSpacing: '0.5px'
            }}>
                Versão: v1.4 (DEPLOY_TEST_2)
            </div>
        </>
    );
}

