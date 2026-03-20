

const MONDAY_BOARDS = [
    { id: '18022978435', name: 'Clinica Integrare' },
    { id: '18191149018', name: 'Ecoa Fonaudiologia' },
    { id: '18368989071', name: 'Singrafs' },
    { id: '10063228355', name: 'Solucione Services' },
];

async function fetchMondayGraphQL(query, variables, token) {
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
    return data;
}

async function run() {
    const token = process.env.VITE_MONDAY_API_TOKEN;
    if (!token) {
        console.error("Token não encontrado no .env!");
        return;
    }

    const query = `
      query {
        boards(ids: ["10063228355"]) {
          name
          columns { id title type }
        }
      }
    `;

    try {
        console.log("Fetching Solucione Services...");
        const data = await fetchMondayGraphQL(query, {}, token);
        console.log(JSON.stringify(data.data.boards[0].columns, null, 2));
    } catch (err) {
        console.error(err);
    }
}

run();
