const process = require('process');

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
    const token = "YOUR_TOKEN_HERE"; // Switch to using it from env in real run
    // Actually I'll use process.env via run_command if I can, but I'll just put the logic here.
}
