import React from 'react';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary Caught:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '24px', background: '#fff5f5', color: '#c53030', border: '2px solid #fc8181', margin: '24px', borderRadius: '8px', fontFamily: 'sans-serif' }}>
                    <h2 style={{ marginTop: 0 }}>💥 Ops! A tela quebrou (React Error)</h2>
                    <p style={{ fontWeight: 'bold' }}>Descrição do Erro: {this.state.error?.toString()}</p>
                    <p>Por favor, copie o erro abaixo e mande para mim!</p>
                    <details style={{ whiteSpace: 'pre-wrap', marginTop: '15px', padding: '10px', background: '#fff', border: '1px solid #fed7d7', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px' }}>
                        <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Ver detalhes técnicos da falha</summary>
                        {this.state.errorInfo?.componentStack}
                    </details>
                </div>
            );
        }
        return this.props.children;
    }
}
