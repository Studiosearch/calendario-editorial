import { useState, useEffect } from 'react';
import { MONDAY_BOARDS, fetchMondayGraphQL } from '../api/mondayApi';

export function useConfig() {
    const envToken = import.meta.env.VITE_MONDAY_API_TOKEN || '';

    const [config, setConfig] = useState(() => {
        const pathSlug = window.location.pathname.replace(/^\/+/, '').toLowerCase();
        let urlBoardId = null;
        
        if (pathSlug) {
            const boardInfo = MONDAY_BOARDS.find(b => b.slug === pathSlug);
            if (boardInfo) urlBoardId = boardInfo.id;
        }
        
        if (!urlBoardId) {
            const params = new URLSearchParams(window.location.search);
            urlBoardId = params.get('client');
        }

        if (urlBoardId && envToken) {
            return { apiToken: envToken, boardId: urlBoardId };
        }

        const saved = localStorage.getItem('calendario-editorial-config');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                return {
                    apiToken: envToken || parsed.apiToken,
                    boardId: parsed.boardId || MONDAY_BOARDS[0].id
                };
            } catch (e) {
                console.error('Failed to parse config');
            }
        }
        return { apiToken: envToken, boardId: MONDAY_BOARDS[0].id };
    });

    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        localStorage.setItem('calendario-editorial-config', JSON.stringify(config));
    }, [config]);

    const validateToken = async (token) => {
        setIsValidating(true);
        setError(null);
        try {
            // Faz uma query simples para testar o token
            await fetchMondayGraphQL('query { me { id name } }', {}, token);
            setConfig((prev) => ({ ...prev, apiToken: token }));
            return true;
        } catch (err) {
            setError('Token inválido ou erro de conexão. Verifique a chave.');
            return false;
        } finally {
            setIsValidating(false);
        }
    };

    const changeBoard = (boardId) => {
        setConfig((prev) => ({ ...prev, boardId }));
    };

    const clearConfig = () => {
        setConfig({ apiToken: '', boardId: MONDAY_BOARDS[0].id });
        localStorage.removeItem('calendario-editorial-config');
    };

    return {
        apiToken: config.apiToken,
        boardId: config.boardId,
        isConfigured: !!config.apiToken,
        isValidating,
        error,
        validateToken,
        changeBoard,
        clearConfig,
    };
}
