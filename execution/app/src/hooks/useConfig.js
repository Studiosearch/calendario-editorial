import { useState, useEffect } from 'react';
import { MONDAY_BOARDS, fetchMondayGraphQL } from '../api/mondayApi';

export function useConfig() {
    const [config, setConfig] = useState(() => {
        const saved = localStorage.getItem('calendario-editorial-config');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Failed to parse config');
            }
        }
        return { apiToken: '', boardId: MONDAY_BOARDS[0].id };
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
