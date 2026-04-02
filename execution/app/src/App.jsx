import React, { useState, useMemo, useEffect } from 'react';
import { Filter, Send, Users, LogOut } from 'lucide-react';
import PageHeader from '@components/PageHeader';
import { useAllPosts } from '@hooks/useAllPosts';
import { useConfig } from '@hooks/useConfig';
import { MONDAY_BOARDS } from './api/mondayApi';
import { STATUS_OPTIONS } from './constants';
import CalendarGrid from '@components/CalendarGrid';
import PostDetail from '@components/PostDetail';
import ProfileView from '@components/ProfileView';
import ApprovalPage from '@components/ApprovalPage';
import CreatePostModal from '@components/CreatePostModal';
import SetupScreen from '@components/SetupScreen';
import LoginPage from '@components/LoginPage';

const ALL_STATUS_OPTIONS = [
    { label: 'Todos os Status', value: 'all' },
    ...STATUS_OPTIONS,
];

export default function App() {
    const [
        isAuthenticated, setIsAuthenticated
    ] = useState(() => sessionStorage.getItem('ss_auth') === 'ok');

    const {
        apiToken, boardId, isConfigured, validateToken, changeBoard, clearConfig
    } = useConfig();

    const {
        posts, metadata, loading, error,
        updatePost, uploadPostFile, deletePostFile, reorderPostFiles, createPost, deletePost, requestPostRevision,
    } = useAllPosts(apiToken);

    const [selectedPost, setSelectedPost] = useState(null);
    const [profileOpen, setProfileOpen] = useState(false);
    const [view, setView] = useState('calendar');
    const [isInternalPreview, setIsInternalPreview] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [clientFilter, setClientFilter] = useState('all');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createDate, setCreateDate] = useState(null);

    // Guard: show login if not authenticated AND this is the root/main URL (not an approval slug)
    const isApprovalSlug = (() => {
        const slug = window.location.pathname.replace(/^\//, '');
        return slug && slug !== 'index.html';
    })();

    useEffect(() => {
        const handleHash = () => {
            if (window.location.hash === '#approval') setView('approval');
            else { setView('calendar'); setIsInternalPreview(false); }
        };
        handleHash();
        window.addEventListener('hashchange', handleHash);
        return () => window.removeEventListener('hashchange', handleHash);
    }, []);

    const filteredPosts = useMemo(() => {
        let result = posts;
        if (statusFilter !== 'all') result = result.filter(p => p.status === statusFilter);
        if (clientFilter !== 'all') result = result.filter(p => p.boardId === clientFilter);
        return result;
    }, [posts, statusFilter, clientFilter]);

    // Login guard — placed after all hooks to respect React's rules
    if (!isAuthenticated && !isApprovalSlug) {
        return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
    }

    const handleForwardToClient = () => {
        // Encaminha o board filtrado ou o primeiro disponível
        const targetBoardId = clientFilter !== 'all' ? clientFilter : (boardId || MONDAY_BOARDS[0]?.id);
        const currentBoard = MONDAY_BOARDS.find(b => b.id === targetBoardId);
        const slug = currentBoard ? currentBoard.slug : '';
        const shareUrl = `${window.location.origin}/${slug}#approval`;

        const newWindow = window.open(shareUrl, '_blank');
        if (!newWindow) {
            alert('⚠️ Seu navegador bloqueou a abertura da nova aba. O link é: ' + shareUrl);
        }

        navigator.clipboard.writeText(shareUrl).then(() => {
            alert('✅ O Link ' + shareUrl + ' foi copiado pro seu Mouse! Você já pode colar (Ctrl+V) no WhatsApp do cliente.');
        }).catch(() => {
            console.log('Link:', shareUrl);
        });
    };

    const handleBackToCalendar = () => {
        window.location.hash = '';
        setView('calendar');
        setIsInternalPreview(false);
    };

    const handleSetupConnect = async (token, newBoardId) => {
        const isValid = await validateToken(token);
        if (isValid) {
            changeBoard(newBoardId);
        }
        return isValid;
    };

    // Setup view
    if (!isConfigured) {
        return <SetupScreen onConnect={handleSetupConnect} />;
    }

    // Loading state
    if (loading) {
        return (
            <div style={{
                height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
            }}>
                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
                }}>
                    <div style={{
                        width: '48px', height: '48px', border: '4px solid #e2e8f0',
                        borderTopColor: '#3182ce', borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                    }} />
                    <span style={{ color: '#718096', fontWeight: 500 }}>Carregando...</span>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    // Approval view
    if (view === 'approval') {
        return (
            <ApprovalPage
                posts={filteredPosts}
                metadata={metadata}
                onApprove={(id, s) => updatePost(id, { status: s })}
                onRevision={requestPostRevision}
                onBack={isInternalPreview ? handleBackToCalendar : null}
            />
        );
    }

    // Main calendar view
    return (
        <div className="animate-scale-fade-in" style={{ background: '#f7fafc', minHeight: '100vh', paddingBottom: '40px' }}>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div style={{ maxWidth: '100%', margin: '0 auto', paddingTop: '24px', paddingLeft: '16px', paddingRight: '16px' }}>
                {/* Error */}
                {error && (
                    <div style={{
                        padding: '12px 16px', marginBottom: '16px', borderRadius: '8px',
                        background: '#fff5f5', border: '1px solid #fc8181', color: '#c53030',
                        fontWeight: 500, fontSize: '14px',
                    }}>
                        {error}
                    </div>
                )}

                {/* Top bar */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginBottom: '24px', flexWrap: 'wrap', gap: '12px',
                }}>
                    <PageHeader
                        title="Calendário Editorial"
                        subtitle={`Gerenciando posts em ${metadata.boardName}`}
                    />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        {/* Client Filter */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            background: 'white', padding: '4px 14px', borderRadius: '999px',
                            border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        }}>
                            <Users size={16} color="#a0aec0" />
                            <select
                                value={clientFilter}
                                onChange={(e) => setClientFilter(e.target.value)}
                                style={{
                                    border: 'none', background: 'transparent',
                                    fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                                    outline: 'none', padding: '6px 0', color: '#4a5568',
                                    maxWidth: '180px', textOverflow: 'ellipsis',
                                }}
                            >
                                <option value="all">Todos os Clientes</option>
                                {MONDAY_BOARDS.map((board) => (
                                    <option key={board.id} value={board.id}>{board.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Logout */}
                        <button
                            onClick={clearConfig}
                            title="Desconectar do Monday.com"
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: '36px', height: '36px', border: '1px solid #e2e8f0', borderRadius: '50%',
                                background: 'white', color: '#e53e3e', cursor: 'pointer',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#fff5f5'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                        >
                            <LogOut size={16} />
                        </button>

                        {/* Forward button */}
                        <button
                            onClick={handleForwardToClient}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '10px 20px', border: 'none', borderRadius: '12px',
                                background: 'linear-gradient(135deg, #3182ce 0%, #2b6cb0 100%)',
                                color: 'white', fontWeight: 600, fontSize: '14px',
                                cursor: 'pointer', boxShadow: '0 4px 6px rgba(49,130,206,0.3)',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <Send size={18} /> Encaminhar para Aprovação
                        </button>

                        {/* Status filter */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            background: 'white', padding: '4px 14px', borderRadius: '999px',
                            border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        }}>
                            <Filter size={16} color="#a0aec0" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                style={{
                                    border: 'none', background: 'transparent',
                                    fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                                    outline: 'none', padding: '6px 0', color: '#4a5568',
                                    minWidth: '130px',
                                }}
                            >
                                {ALL_STATUS_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Calendar */}
                <CalendarGrid
                    posts={filteredPosts}
                    onPostClick={setSelectedPost}
                    onProfileClick={() => setProfileOpen(true)}
                    onCreateClick={(d) => { setCreateDate(d); setIsCreateOpen(true); }}
                />


                {/* Modals */}
                <PostDetail
                    item={selectedPost}
                    open={!!selectedPost}
                    onClose={() => setSelectedPost(null)}
                    onUpdate={updatePost}
                    onUpload={uploadPostFile}
                    onDeleteFile={deletePostFile}
                    onReorder={reorderPostFiles}
                    onDelete={deletePost}
                />
                <ProfileView
                    posts={filteredPosts}
                    metadata={metadata}
                    open={profileOpen}
                    onClose={() => setProfileOpen(false)}
                    onApprove={(id, s) => updatePost(id, { status: s })}
                    onRevision={requestPostRevision}
                />
                <CreatePostModal
                    open={isCreateOpen}
                    date={createDate}
                    onClose={() => setIsCreateOpen(false)}
                    onSubmit={(name, date) => createPost(name, date, clientFilter !== 'all' ? clientFilter : MONDAY_BOARDS[0]?.id)}
                />
            </div>
        </div>
    );
}
