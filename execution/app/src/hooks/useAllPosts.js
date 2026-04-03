import { useState, useEffect, useCallback } from 'react';
import { STATUS_COLORS } from '../constants';
import { fetchMondayGraphQL, parseColumnValue, uploadFileToMonday, deleteMondayItem, MONDAY_BOARDS } from '../api/mondayApi';

// Mapeamento local para identificar colunas por nome ou tipo.
const identifyColumns = (boardColumns) => {
    const colMap = {};
    for (const c of boardColumns) {
        const title = (c.title || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const type = c.type;

        if (type === 'date' && (title.includes('postagem') || title.includes('publicacao'))) {
            colMap.date = c.id;
        } else if (!colMap.date && (title.includes('data') || type === 'date')) {
            colMap.date = c.id;
        } else if (title === 'status' || title.includes('status do post') || title.includes('aprovacao')) colMap.status = c.id;
        else if (title.includes('legenda') || title.includes('copy') || title.includes('texto final')) colMap.legenda = c.id;
        else if (title.includes('roteiro') || title.includes('script') || title.includes('video')) colMap.roteiro = c.id;
        else if (title.includes('plataforma') || title.includes('rede') || title.includes('midia')) colMap.plataformas = c.id;
        else if (title.includes('tipo') || title.includes('formato') || title.includes('linha editorial')) colMap.tipoDePost = c.id;
        else if (title.includes('desenvolvimento') || title.includes('etapa') || title.includes('fase') || title.includes('status da arte')) colMap.desenvolvimento = c.id;
        else if (title.includes('revisao') || title.includes('alteracao') || title.includes('feedback')) colMap.revisao = c.id;
        else if (title.includes('arquivo') || title.includes('arte') || title.includes('postagem') || type === 'file') colMap.postagem = c.id;
    }
    if (!colMap.status) colMap.status = boardColumns.find(c => c.type === 'status')?.id;
    return colMap;
};

function mapBoardItems(board, boardMeta, cols) {
    return board.items_page.items.map(item => {
        const post = {
            id: item.id,
            name: item.name,
            boardId: boardMeta.id,
            clientName: boardMeta.name,
            _raw: item.column_values,
            legenda: '',
            roteiro: '',
            status: '',
            statusColor: '#cbd5e0',
            plataformas: [],
            tipoDePost: '',
            desenvolvimento: '',
            postagem: [],
            dataPostagem: null,
        };

        item.column_values.forEach(cv => {
            const val = parseColumnValue(cv, item.assets);
            if (!val) return;

            if (cv.id === cols.date) {
                if (typeof val === 'string') {
                    const parts = val.split('-');
                    if (parts.length === 3) {
                        post.dataPostagem = new Date(parts[0], parts[1] - 1, parts[2]);
                    }
                }
            } else if (cv.id === cols.status) {
                post.status = val;
                post.statusColor = STATUS_COLORS[val] || '#cbd5e0';
            } else if (cv.id === cols.legenda) {
                post.legenda = val;
            } else if (cv.id === cols.roteiro) {
                post.roteiro = val;
            } else if (cv.id === cols.tipoDePost) {
                post.tipoDePost = val;
            } else if (cv.id === cols.desenvolvimento) {
                post.desenvolvimento = val;
            } else if (cv.id === cols.plataformas) {
                if (Array.isArray(val)) {
                    post.plataformas = val.map(v => v.name || v);
                } else if (typeof val === 'string') {
                    post.plataformas = val.split(',').map(s => s.trim());
                }
            } else if (cv.id === cols.postagem) {
                if (Array.isArray(val)) {
                    post.postagem = val;
                    try {
                        const cached = localStorage.getItem(`post_img_order_${item.id}`);
                        if (cached) {
                            const orderIds = JSON.parse(cached);
                            post.postagem.sort((a, b) => {
                                let idxA = orderIds.indexOf(a.id);
                                let idxB = orderIds.indexOf(b.id);
                                if (idxA === -1) idxA = 999;
                                if (idxB === -1) idxB = 999;
                                return idxA - idxB;
                            });
                        }
                    } catch (e) { }
                }
            }
        });

        return post;
    });
}

// Busca um único board e retorna { posts, colMap }
async function fetchOneBoard(boardMeta, apiToken) {
    const query = `
      query ($boardId: [ID!]) {
        boards(ids: $boardId) {
          name
          columns { id title type }
          items_page(limit: 100) {
            items {
              id
              name
              assets { id name public_url file_extension }
              column_values { id value text type }
            }
          }
        }
      }
    `;
    const data = await fetchMondayGraphQL(query, { boardId: [boardMeta.id] }, apiToken);
    const board = data.boards[0];
    if (!board) return { posts: [], colMap: {} };

    const cols = identifyColumns(board.columns);
    const posts = mapBoardItems(board, boardMeta, cols);
    return { posts, colMap: cols, rawColumns: board.columns };
}

export function useAllPosts(apiToken) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // colMaps: { [boardId]: colMap }
    const [colMaps, setColMaps] = useState({});
    // metadata: { boardName: 'Todos os Clientes' }
    const [metadata, setMetadata] = useState({ boardName: 'Todos os Clientes' });

    const fetchAll = useCallback(async (isBackground = false) => {
        if (!apiToken) {
            setPosts([]);
            return;
        }
        if (!isBackground) setLoading(true);
        setError(null);
        try {
            const results = await Promise.all(
                MONDAY_BOARDS.map(b => fetchOneBoard(b, apiToken).catch(err => {
                    console.error(`Erro ao buscar board ${b.name}:`, err);
                    return { posts: [], colMap: {} };
                }))
            );

            const allPosts = results.flatMap(r => r.posts);
            const newColMaps = {};
            MONDAY_BOARDS.forEach((b, i) => {
                newColMaps[b.id] = results[i].colMap;
            });

            setPosts(allPosts);
            if (!isBackground) {
                setColMaps(newColMaps);
                // Opcional: log para debug de boards específicos
                const counts = results.map((r, i) => `${MONDAY_BOARDS[i].name}: ${r.posts.length}`);
                console.log("Posts carregados por board:", counts.join(' | '));
            }
        } catch (err) {
            console.error('Erro geral ao buscar todos os boards:', err);
            if (!isBackground) setError('Erro ao carregar dados do Monday.com: ' + err.message);
        } finally {
            if (!isBackground) setLoading(false);
        }
    }, [apiToken]);

    useEffect(() => {
        fetchAll();
        const timerId = setInterval(() => fetchAll(true), 20000);
        return () => clearInterval(timerId);
    }, [fetchAll]);

    // updatePost: precisa saber o boardId do post
    const updatePost = useCallback(async (id, updates) => {
        setPosts(prev => prev.map(p => {
            if (p.id !== id) return p;
            const up = { ...p, ...updates };
            if (updates.status) up.statusColor = STATUS_COLORS[updates.status] || '#cbd5e0';
            return up;
        }));

        const post = posts.find(p => p.id === id);
        const targetBoardId = post?.boardId;
        const colMap = targetBoardId ? (colMaps[targetBoardId] || {}) : {};

        try {
            const columnValues = {};
            if (updates.status !== undefined && colMap.status) columnValues[colMap.status] = { label: updates.status };
            if (updates.legenda !== undefined && colMap.legenda) columnValues[colMap.legenda] = updates.legenda;
            if (updates.roteiro !== undefined && colMap.roteiro) columnValues[colMap.roteiro] = updates.roteiro;
            if (updates.tipoDePost !== undefined && colMap.tipoDePost) columnValues[colMap.tipoDePost] = { label: updates.tipoDePost };
            if (updates.desenvolvimento !== undefined && colMap.desenvolvimento) columnValues[colMap.desenvolvimento] = { label: updates.desenvolvimento };
            if (updates.alteracoesSolicitadas !== undefined) {
                if (colMap.revisao) columnValues[colMap.revisao] = updates.alteracoesSolicitadas;
                else if (colMap.roteiro) columnValues[colMap.roteiro] = updates.alteracoesSolicitadas;
            }
            if (updates.dataPostagem !== undefined && colMap.date) {
                if (!updates.dataPostagem) {
                    columnValues[colMap.date] = null;
                } else {
                    const d = updates.dataPostagem;
                    if (d instanceof Date) {
                        const y = d.getFullYear();
                        const m = String(d.getMonth() + 1).padStart(2, '0');
                        const day = String(d.getDate()).padStart(2, '0');
                        columnValues[colMap.date] = `${y}-${m}-${day}`;
                    } else if (typeof d === 'string') {
                        const dt = new Date(d);
                        if (!isNaN(dt.getTime())) {
                            const y = dt.getFullYear();
                            const m = String(dt.getMonth() + 1).padStart(2, '0');
                            const day = String(dt.getDate()).padStart(2, '0');
                            columnValues[colMap.date] = `${y}-${m}-${day}`;
                        }
                    }
                }
            }
            if (updates.plataformas !== undefined && colMap.plataformas) {
                columnValues[colMap.plataformas] = { labels: updates.plataformas };
            }

            if (Object.keys(columnValues).length > 0) {
                const query = `
                  mutation ($boardId: ID!, $itemId: ID!, $columnValues: JSON!) {
                    change_multiple_column_values(board_id: $boardId, item_id: $itemId, column_values: $columnValues) { id }
                  }
                `;
                await fetchMondayGraphQL(query, {
                    boardId: targetBoardId,
                    itemId: id,
                    columnValues: JSON.stringify(columnValues)
                }, apiToken);
            }
        } catch (err) {
            console.error('Update failed on server', err);
            alert('ERRO DO MONDAY.COM: ' + err.message);
            setError('Erro ao salvar no Monday.com. ' + err.message);
        }
    }, [apiToken, colMaps, posts]);

    const uploadPostFile = useCallback(async (id, fileUrl, fileObj) => {
        const post = posts.find(p => p.id === id);
        const colMap = post?.boardId ? (colMaps[post.boardId] || {}) : {};

        if (!colMap.postagem) {
            setError('Coluna de arquivos não encontrada no Monday.com. Verifique o quadro.');
            return;
        }

        const tempLocalAsset = { name: fileObj?.name || 'Local File', url: fileUrl, isLocal: true };
        setPosts(prev => prev.map(p => {
            if (p.id !== id) return p;
            return { ...p, postagem: [...(p.postagem || []), tempLocalAsset] };
        }));

        try {
            if (fileObj) {
                await uploadFileToMonday(id, colMap.postagem, fileObj, apiToken);
            }
        } catch (err) {
            console.error('File upload failed', err);
            setError('Erro ao enviar arquivo para o Monday.com.');
            setPosts(prev => prev.map(p => {
                if (p.id !== id) return p;
                return { ...p, postagem: (p.postagem || []).filter(f => f.name !== tempLocalAsset.name) };
            }));
        }
    }, [apiToken, colMaps, posts]);

    const deletePostFile = useCallback((id) => {
        updatePost(id, { postagem: [] });
    }, [updatePost]);

    const reorderPostFiles = useCallback((id, newOrderArray) => {
        setPosts(prev => prev.map(p => {
            if (p.id !== id) return p;
            return { ...p, postagem: newOrderArray };
        }));
        try {
            const orderIds = newOrderArray.map(f => f.id);
            localStorage.setItem(`post_img_order_${id}`, JSON.stringify(orderIds));
        } catch (e) { }
    }, []);

    const deletePost = useCallback(async (id) => {
        const postToRemove = posts.find(p => p.id === id);
        setPosts(prev => prev.filter(p => p.id !== id));
        try {
            await deleteMondayItem(id, apiToken);
        } catch (err) {
            console.error('Delete failed', err);
            setError('Erro ao excluir post no Monday.com.');
            if (postToRemove) {
                setPosts(prev => [...prev, postToRemove]);
            }
        }
    }, [apiToken, posts]);

    const requestPostRevision = useCallback((id, categories, text) => {
        const obs = (categories.length === 1 && categories[0] === 'Feedback Geral')
            ? text
            : `Revisão (${categories.join(', ')}): ${text}`;
        updatePost(id, { status: 'Revisão', alteracoesSolicitadas: obs });
    }, [updatePost]);

    // createPost: cria no primeiro board por padrão (ou board ativo se necessário)
    const createPost = useCallback(async (name, initialDate, targetBoardId) => {
        const boardMeta = MONDAY_BOARDS.find(b => b.id === targetBoardId) || MONDAY_BOARDS[0];
        const colMap = colMaps[boardMeta.id] || {};

        const tempId = `temp-${Date.now()}`;
        const newPost = {
            id: tempId,
            name,
            boardId: boardMeta.id,
            clientName: boardMeta.name,
            legenda: '', roteiro: '', status: 'Não iniciado',
            statusColor: STATUS_COLORS['Não iniciado'] || '#cbd5e0',
            plataformas: [], tipoDePost: '', desenvolvimento: '',
            postagem: [], dataPostagem: initialDate,
        };
        setPosts(prev => [...prev, newPost]);

        try {
            const qGroup = `query { boards(ids: [${boardMeta.id}]) { groups { id } } }`;
            const gData = await fetchMondayGraphQL(qGroup, {}, apiToken);
            const groupId = gData?.boards[0]?.groups[0]?.id || 'topics';

            const createMut = `mutation { create_item(board_id: ${boardMeta.id}, group_id: "${groupId}", item_name: "${name.replace(/"/g, '')}") { id } }`;
            const createRes = await fetchMondayGraphQL(createMut, {}, apiToken);
            const serverId = createRes?.create_item?.id;
            if (!serverId) throw new Error('Monday não retornou ID. Tente novamente.');

            setPosts(prev => prev.map(p => p.id === tempId ? { ...p, id: serverId } : p));

            const updates = { status: 'Não iniciado' };
            if (initialDate) updates.dataPostagem = initialDate;
            await updatePost(serverId, updates);
        } catch (err) {
            console.error('Create failed', err);
            alert('Erro ao criar tema no Monday: ' + err.message);
            setError('Erro ao criar post no Monday.com.');
            setPosts(prev => prev.filter(p => p.id !== tempId));
        }
    }, [apiToken, colMaps, updatePost]);

    return {
        posts,
        metadata,
        loading,
        error,
        updatePost,
        uploadPostFile,
        deletePostFile,
        reorderPostFiles,
        createPost,
        deletePost,
        requestPostRevision,
        colMap: {}, // compatibilidade — não usado diretamente no modo multi-board
    };
}
