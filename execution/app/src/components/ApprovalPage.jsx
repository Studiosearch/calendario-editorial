import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';
import ApprovalGridView from './ApprovalGridView';
import ApprovalDetailView from './ApprovalDetailView';

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
            .filter(p => p.status === 'Em Aprovação Cliente' || p.status === 'Revisado Ag. aprovação')
            .sort((a, b) => {
                if (!a.dataPostagem) return 1;
                if (!b.dataPostagem) return -1;
                return a.dataPostagem - b.dataPostagem;
            });
    };

    // Ao carregar, verifica se tem pendências para mostrar o Welcome
    useEffect(() => {
        const pending = getPendingPosts();
        if (pending.length > 0) {
            setShowWelcome(true);
            setWizardPosts(pending);
        }
    }, [posts.length]);

    // Restaurar scroll ao fechar o post
    useEffect(() => {
        if (!previewPost && wizardIndex === -1 && lastScrollY > 0) {
            setTimeout(() => {
                window.scrollTo({ top: lastScrollY, behavior: 'instant' });
            }, 50);
        }
    }, [previewPost, wizardIndex, lastScrollY]);

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

    // --- RENDERS CONDICIONAIS APÓS OS HOOKS ---

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
        </>
    );
}
