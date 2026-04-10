import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';
import ApprovalGridView from './ApprovalGridView';
import ApprovalDetailView from './ApprovalDetailView';

export default function ApprovalPage({ posts, metadata, onBack, onApprove, onRevision }) {
    const [previewPost, setPreviewPost] = useState(null);
    const [showWelcome, setShowWelcome] = useState(false);
    const [wizardPosts, setWizardPosts] = useState([]);
    const [wizardIndex, setWizardIndex] = useState(-1); // -1 means wizard not active

    // Identificar posts pendentes (Em Aprovação Cliente ou Revisado Ag. aprovação)
    // Ordenados por data
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
    }, [posts.length]); // Re-calcula se a lista de posts mudar

    const startWizard = () => {
        setShowWelcome(false);
        setWizardIndex(0);
    };

    const handleNextInWizard = () => {
        // Após aprovar/revisar, o re-fetch do usePosts vai atualizar a lista.
        // Mas para não esperar o re-fetch (que leva 1min agora), podemos
        // apenas avançar para o próximo da lista atual que ainda é pendente.
        
        // Na verdade, o ideal é avançar para o próximo índice.
        if (wizardIndex < wizardPosts.length - 1) {
            setWizardIndex(prev => prev + 1);
        } else {
            // Fim do wizard
            setWizardIndex(-1);
            setWizardPosts([]);
        }
    };

    // Se estiver no modo Wizard
    if (wizardIndex >= 0 && wizardPosts[wizardIndex]) {
        const currentPost = wizardPosts[wizardIndex];
        return (
            <div style={{ position: 'relative', height: '100vh', width: '100vw', overflow: 'hidden' }}>
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
                    padding: '8px 16px', background: 'rgba(181, 168, 255, 0.95)',
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '12px', backdropFilter: 'blur(8px)', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}>
                    <span style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase' }}>
                        Modo de Aprovação ({wizardIndex + 1} de {wizardPosts.length})
                    </span>
                </div>
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
                onPostClick={setPreviewPost}
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

            <style>{`
                @keyframes modalIn {
                    from { opacity: 0; transform: scale(0.95) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </>
    );
}
