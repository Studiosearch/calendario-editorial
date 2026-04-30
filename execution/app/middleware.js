export const config = {
  matcher: '/:path*',
};

// Mapa de clientes para substituir dinamicamente as tags OG
const CLIENTS = {
  'clinicaintegrare': 'Clínica Integrare',
  'ecoafonoaudiologia': 'Ecoa Fonoaudiologia',
  'singrafs': 'Singrafs',
  'solucioneservices': 'Solucione Services'
};

export default async function middleware(request) {
  const url = new URL(request.url);
  const path = url.pathname.substring(1); // remove a barra inicial
  
  // Ignora arquivos estáticos e assets
  if (path.includes('.') || path.startsWith('assets/') || path.startsWith('src/')) {
    return;
  }

  const clientName = CLIENTS[path];

  // Se a rota for o slug de um cliente conhecido, injetamos as tags no HTML
  if (clientName) {
    // Busca o index.html original
    const indexUrl = new URL('/index.html', request.url);
    const response = await fetch(indexUrl);
    
    if (response.ok) {
        let html = await response.text();
        const title = `Calendário Editorial - ${clientName}`;

        // Substitui a tag title
        html = html.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);
        
        // Substitui as tags OG
        html = html.replace(
            /content="Calendário Editorial \| Studio Search"/gi, 
            `content="${title}"`
        );

        return new Response(html, {
            headers: {
                'content-type': 'text/html;charset=UTF-8',
            },
        });
    }
  }

  // Caso contrário, segue o fluxo normal da Vercel
  return;
}
