export const MONDAY_BOARDS = [
    { id: '18022978435', name: 'Clinica Integrare' },
    { id: '18191149018', name: 'Ecoa Fonaudiologia' },
    { id: '18368989071', name: 'Singrafs' },
    { id: '10063228355', name: 'Solucione Services' },
];

export async function fetchMondayGraphQL(query, variables, token) {
    if (!token) throw new Error('Token da API do Monday.com não fornecido.');

    const res = await fetch('https://api.monday.com/v2', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: token,
            'API-Version': '2024-01',
        },
        body: JSON.stringify({ query, variables }),
    });

    const data = await res.json();
    if (data.errors) {
        throw new Error(data.errors[0]?.message || 'Erro na API do Monday.com');
    }

    return data.data;
}

export async function uploadFileToMonday(itemId, columnId, file, token) {
    if (!token) throw new Error('Token da API do Monday.com não fornecido.');

    const formData = new FormData();
    // A mutação precisa estar alinhada com as variáveis que o Monday espera
    const query = `mutation ($file: File!, $itemId: ID!, $columnId: String!) {
        add_file_to_column (file: $file, item_id: $itemId, column_id: $columnId) {
          id
        }
      }`;

    formData.append('query', query);

    // As variáveis precisam ser strings ou inteiros dependendo do tipo da API
    // Para GraphQL multipart request specs:
    formData.append('variables', JSON.stringify({ itemId: Number(itemId), columnId }));
    // Mapeamento do arquivo
    formData.append('map', JSON.stringify({ "image": "variables.file" }));
    // O arquivo em si
    formData.append('image', file);

    const res = await fetch('https://api.monday.com/v2/file', {
        method: 'POST',
        headers: {
            Authorization: token,
            'API-Version': '2024-01',
        },
        body: formData,
    });

    const data = await res.json();
    if (data.errors) {
        console.error("Monday Upload Error:", data.errors);
        throw new Error(data.errors[0]?.message || 'Erro no upload de arquivo para o Monday.com');
    }

    return data.data;
}

export async function deleteMondayItem(itemId, token) {
    const query = `
      mutation ($itemId: ID!) {
        delete_item (item_id: $itemId) {
          id
        }
      }
    `;
    return fetchMondayGraphQL(query, { itemId: Number(itemId) }, token);
}

// Extrai o valor do texto simples da coluna, lidando com diferentes tipos no Monday
export function parseColumnValue(column, itemAssets = []) {
    if (!column) return '';
    if (!column.value && column.text) return column.text || '';

    try {
        const val = column.value && typeof column.value === 'string' ? JSON.parse(column.value) : column.value;
        if (!val) return column.text || '';
        if (typeof val === 'string') return val;
        if (val.text) return val.text;
        if (column.type === 'color' && val.index !== undefined) {
            return column.text || '';
        }
        if (val.date) return val.date;
        if (column.type === 'file' && val.files) {
            return val.files.map(f => {
                // Busca na lista de assets o public_url correspondente ao id ou assetId
                const assetIdStr = (f.assetId || f.id || '').toString();
                const assetInfo = itemAssets.find(a => a.id === assetIdStr);
                const ext = assetInfo?.file_extension?.toLowerCase();
                const isVideo = ext && ['mp4', 'mov', 'webm', 'avi', 'mkv', 'gif'].includes(ext);
                return {
                    id: assetIdStr,
                    name: f.name,
                    url: assetInfo?.public_url || '',
                    type: ext ? (isVideo ? `video/${ext}` : `image/${ext}`) : 'image/jpeg'
                };
            });
        }
        if (val.labels) return val.labels; // Dropdowns multi-select
        return column.text || '';
    } catch (e) {
        return column.text || column.value || '';
    }
}
