import React, { useState, useEffect, useCallback } from 'react';
import { STATUS_COLORS } from '../constants';
import { fetchMondayGraphQL, parseColumnValue, uploadFileToMonday, deleteMondayItem } from '../api/mondayApi';

// Mapeamento local para identificar colunas por nome ou tipo.
const identifyColumns = (boardColumns) => {
    const colMap = {};
    for (const c of boardColumns) {
        // Normaliza título tirando acentos e passando pra minúscula
        const title = (c.title || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const type = c.type;

        // Priority checks
        if (type === 'date' && (title.includes('postagem') || title.includes('publicacao'))) {
            colMap.date = c.id;
        } else if (!colMap.date && (title.includes('data') || type === 'date')) {
            colMap.date = c.id;
        }

        else if (title === 'status' || title.includes('status do post') || title.includes('aprovacao')) colMap.status = c.id;
        else if (title.includes('legenda') || title.includes('copy') || title.includes('texto final')) colMap.legenda = c.id;
        else if (title.includes('roteiro') || title.includes('script') || title.includes('video')) colMap.roteiro = c.id;
        else if (title.includes('plataforma') || title.includes('rede') || title.includes('midia')) colMap.plataformas = c.id;
        else if (title.includes('tipo') || title.includes('formato') || title.includes('linha editorial')) colMap.tipoDePost = c.id;
        else if (title.includes('desenvolvimento') || title.includes('etapa') || title.includes('fase') || title.includes('status da arte')) colMap.desenvolvimento = c.id;
        else if (title.includes('revisao') || title.includes('alteracao') || title.includes('feedback')) colMap.revisao = c.id;
        else if (title.includes('arquivo') || title.includes('arte') || title.includes('postagem') || type === 'file') colMap.postagem = c.id;
    }

    // Fallback: se nenhum status principal bateu no título, pega a primeira coluna tipo status
    if (!colMap.status) colMap.status = boardColumns.find(c => c.type === 'status')?.id;

    return colMap;
};

export function usePosts(apiToken, boardId) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [metadata, setMetadata] = useState({ boardName: 'Carregando...' });
    const [colMap, setColMap] = useState({});
    const [rawColumns, setRawColumns] = useState([]);

    // Fetch initial data via API
    useEffect(() => {
        if (!apiToken || !boardId) {
            setPosts([]);
            setLoading(false);
            return;
        }

        const fetchBoardData = async (isBackground = false) => {
            if (!isBackground) setLoading(true);
            setError(null);
            try {
                const query = `
                  query ($boardId: [ID!]) {
                    boards(ids: $boardId) {
                      name
                      columns { id title type }
                      items_page(limit: 100) {
                        items {
                          id
                          name
                          assets {
                             id
                             name
                             public_url
                             file_extension
                          }
                          column_values {
                            id
                            value
                            text
                            type
                          }
                        }
                      }
                    }
                  }
                `;

                const data = await fetchMondayGraphQL(query, { boardId: [boardId] }, apiToken);
                const board = data.boards[0];
                if (!board) throw new Error('Quadro não encontrado.');

                if (!isBackground) setMetadata({ boardName: board.name });

                const cols = identifyColumns(board.columns);
                if (!isBackground) {
                    setColMap(cols);
                    setRawColumns(board.columns);
                }

                if (!isBackground) {
                    // DEBUG LOG: Se precisar checar no console os IDs das colunas
                    console.log(`📌 Colunas lidas do quadro ${board.name}:`, board.columns);
                    console.log(`📌 Mapeamento das colunas (app -> monday):`, cols);
                }

                const mappedPosts = board.items_page.items.map(item => {
                    const post = {
                        id: item.id,
                        name: item.name,
                        _raw: item.column_values,
                        legenda: '',
                        roteiro: '',
                        status: '',
                        statusColor: '#cbd5e0',
                        plataformas: [],
                        tipoDePost: '',
                        desenvolvimento: '',
                        postagem: [],
                        dataPostagem: null
                    };

                    item.column_values.forEach(cv => {
                        const val = parseColumnValue(cv, item.assets);
                        if (!val) return;

                        if (cv.id === cols.date) {
                            if (typeof val === 'string') {
                                // YYYY-MM-DD local
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
                            // Arrays from tags/dropdowns
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

                setPosts(mappedPosts);
            } catch (err) {
                console.error("DEBUG MONDAY FETCH ERROR:", err);
                if (!isBackground) setError('Erro ao carregar os dados do Monday.com: ' + err.message);
            } finally {
                if (!isBackground) setLoading(false);
            }
        };

        fetchBoardData();

        // Polling a cada 20 segundos
        const timerId = setInterval(() => {
            fetchBoardData(true);
        }, 20000);

        return () => clearInterval(timerId);
    }, [apiToken, boardId]);

    const updatePost = useCallback(async (id, updates) => {
        // Optimistic UI update
        setPosts(prev => prev.map(p => {
            if (p.id !== id) return p;
            const up = { ...p, ...updates };
            if (updates.status) up.statusColor = STATUS_COLORS[updates.status] || '#cbd5e0';
            return up;
        }));

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
                    // Certifica-se de que é um objeto Date
                    if (d instanceof Date) {
                        const y = d.getFullYear();
                        const m = String(d.getMonth() + 1).padStart(2, '0');
                        const day = String(d.getDate()).padStart(2, '0');
                        columnValues[colMap.date] = `${y}-${m}-${day}`;
                    } else if (typeof d === 'string') {
                        // Se por algum motivo já for string, tenta extrair a data
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
                // Label updates require IDs or exact strings, the simple API uses JSON strings
                columnValues[colMap.plataformas] = { labels: updates.plataformas };
            }

            if (Object.keys(columnValues).length > 0) {
                const query = `
                  mutation ($boardId: ID!, $itemId: ID!, $columnValues: JSON!) {
                    change_multiple_column_values(board_id: $boardId, item_id: $itemId, column_values: $columnValues) {
                      id
                    }
                  }
                `;
                await fetchMondayGraphQL(query, {
                    boardId,
                    itemId: id,
                    columnValues: JSON.stringify(columnValues)
                }, apiToken);
            }
        } catch (err) {
            console.error('Update failed on server', err);
            alert('ERRO DO MONDAY.COM: ' + err.message);
            setError('Erro ao salvar no Monday.com. As alterações foram feitas apenas localmente. ' + err.message);
        }
    }, [apiToken, boardId, colMap]);

    const createPost = useCallback(async (name, initialDate) => {
        // Optimistic local update
        const tempId = `temp-${Date.now()}`;
        const newPost = {
            id: tempId,
            name,
            legenda: '',
            roteiro: '',
            status: 'Não iniciado',
            statusColor: STATUS_COLORS['Não iniciado'] || '#cbd5e0',
            plataformas: [],
            tipoDePost: '',
            desenvolvimento: '',
            postagem: [],
            dataPostagem: initialDate
        };

        setPosts(prev => [...prev, newPost]);

        try {
            const columnValues = {};
            if (colMap.status) columnValues[colMap.status] = { label: 'Não iniciado' };
            if (initialDate && colMap.date) {
                const y = initialDate.getFullYear();
                const m = String(initialDate.getMonth() + 1).padStart(2, '0');
                const day = String(initialDate.getDate()).padStart(2, '0');
                columnValues[colMap.date] = `${y}-${m}-${day}`;
            }

            // A mutation de create exige primeiro criar, as colunas vão junto.
            // Precisamos do ID do primeiro grupo do board.
            const queryGroup = `query { boards(ids: [${boardId}]) { groups { id } } }`;
            const groupData = await fetchMondayGraphQL(queryGroup, {}, apiToken);
            const groupId = groupData?.boards[0]?.groups[0]?.id || 'topics';

            const columnValuesJson = JSON.stringify(columnValues);
            console.log('🚀 create_item payload:', { boardId, groupId, name, columnValuesJson });

            const mut = `
              mutation {
                  create_item (
                      board_id: ${boardId},
                      group_id: "${groupId}",
                      item_name: "${name.replace(/"/g, '')}",
                      column_values: ${JSON.stringify(columnValuesJson)}
                  ) {
                      id
                  }
              }
            `;

            const res = await fetchMondayGraphQL(mut, {}, apiToken);
            const serverId = res.create_item.id;
            setPosts(prev => prev.map(p => p.id === tempId ? { ...p, id: serverId } : p));
            console.log('✅ Item criado no Monday com ID:', serverId);
        } catch (err) {
            console.error('Create failed', err);
            alert('Erro ao criar tema no Monday: ' + err.message);
            setError('Erro ao criar post no Monday.com. Atualize a página e tente novamente.');
            // fallback: remove optimistic post se falhar
            setPosts(prev => prev.filter(p => p.id !== tempId));
        }
    }, [apiToken, boardId, colMap]);

    const uploadPostFile = useCallback(async (id, fileUrl, fileObj) => {
        if (!colMap.postagem) {
            console.error("Coluna de postagem não mapeada.");
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
                // O poling a cada 20s vai eventualmente baixar o asset real
            }
        } catch (err) {
            console.error('File upload failed', err);
            setError('Erro ao enviar arquivo para o Monday.com.');
            // Revert on failure
            setPosts(prev => prev.map(p => {
                if (p.id !== id) return p;
                return { ...p, postagem: (p.postagem || []).filter(f => f.name !== tempLocalAsset.name) };
            }));
        }
    }, [apiToken, colMap, setPosts]);

    const deletePostFile = useCallback((id) => {
        updatePost(id, { postagem: [] }); // Simplificado para deletar tudo (monday mutation tem outro workflow)
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
        // Optimistic UI update
        const postToRemove = posts.find(p => p.id === id);
        setPosts(prev => prev.filter(p => p.id !== id));

        try {
            await deleteMondayItem(id, apiToken);
        } catch (err) {
            console.error('Delete failed', err);
            setError('Erro ao excluir post no Monday.com.');
            // Revert
            if (postToRemove) {
                setPosts(prev => [...prev, postToRemove]);
            }
        }
    }, [apiToken, posts]);

    const requestPostRevision = useCallback((id, categories, text) => {
        const obs = (categories.length === 1 && categories[0] === 'Feedback Geral')
            ? text
            : `Revisão (${categories.join(', ')}): ${text}`;
        updatePost(id, {
            status: 'Revisão',
            alteracoesSolicitadas: obs // Salva numa coluna extra se existir, ou no roteiro se quiser mapear
        });
    }, [updatePost]);

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
        colMap,
    };
}
