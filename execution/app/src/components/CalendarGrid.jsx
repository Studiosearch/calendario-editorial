import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, LayoutGrid, Plus } from 'lucide-react';
import PostCard from './PostCard';

const DAYS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    useEffect(() => {
        const handler = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);
    return isMobile;
}

export default function CalendarGrid({ posts, onPostClick, onProfileClick, onCreateClick }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const isMobile = useIsMobile();

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const startDay = startOfMonth.getDay();

    const getPostsForDay = (day) =>
        posts.filter(
            (p) =>
                p.dataPostagem instanceof Date &&
                p.dataPostagem.getDate() === day &&
                p.dataPostagem.getMonth() === currentDate.getMonth() &&
                p.dataPostagem.getFullYear() === currentDate.getFullYear()
        );

    const gridDays = Array.from({ length: 42 }).map((_, i) => i - startDay + 1);
    const allDays = gridDays.filter((d) => d > 0 && d <= daysInMonth);
    const visibleDays = isMobile ? allDays : gridDays;

    const today = new Date();

    return (
        <div style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            border: '1px solid #e2e8f0',
        }}>
            {/* Header */}
            <div style={{
                padding: '20px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #edf2f7',
                background: '#fafbfc',
                flexWrap: 'wrap',
                gap: '12px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '16px' }}>
                    <h2 style={{
                        fontSize: isMobile ? '1rem' : '1.5rem',
                        fontWeight: 700,
                        margin: 0,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                    }}>
                        {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                    </h2>
                    <button
                        onClick={onProfileClick}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '6px 14px', borderRadius: '999px',
                            border: '1px solid #3182ce', background: 'transparent',
                            color: '#3182ce', fontSize: '13px', fontWeight: 600,
                            cursor: 'pointer', transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#3182ce'; e.currentTarget.style.color = 'white'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#3182ce'; }}
                    >
                        <LayoutGrid size={14} />
                        {!isMobile && 'Perfil'}
                    </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <select
                        value={currentDate.getMonth()}
                        onChange={(e) => setCurrentDate(new Date(currentDate.getFullYear(), parseInt(e.target.value), 1))}
                        style={{
                            padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: '6px',
                            background: 'white', fontSize: '13px', fontWeight: 600, color: '#4a5568',
                            cursor: 'pointer', outline: 'none'
                        }}
                    >
                        {Array.from({ length: 12 }).map((_, i) => (
                            <option key={i} value={i}>
                                {new Date(2000, i, 1).toLocaleString('pt-BR', { month: 'short' }).toUpperCase()}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={() => setCurrentDate(new Date())}
                        style={{
                            padding: '6px 12px', border: 'none', background: 'transparent',
                            fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: '#4a5568',
                            borderRadius: '6px',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#edf2f7'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        Hoje
                    </button>
                    <button
                        onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                        style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            border: 'none', background: '#edf2f7', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#edf2f7'}
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                        style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            border: 'none', background: '#edf2f7', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#edf2f7'}
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* Days Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(7, 1fr)',
                background: '#e2e8f0',
                gap: '1px',
            }}>
                {/* Day headers */}
                {!isMobile && DAYS.map((day) => (
                    <div key={day} style={{
                        background: '#f7fafc', padding: '10px 0',
                        textAlign: 'center', fontSize: '11px', fontWeight: 700,
                        color: '#a0aec0', letterSpacing: '0.5px',
                    }}>
                        {day}
                    </div>
                ))}

                {/* Day cells */}
                {visibleDays.map((day, i) => {
                    const isCurrentMonth = day > 0 && day <= daysInMonth;
                    const isToday = isCurrentMonth && day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
                    const dayPosts = isCurrentMonth ? getPostsForDay(day) : [];

                    return (
                        <div
                            key={i}
                            style={{
                                background: isCurrentMonth ? 'white' : '#f7fafc',
                                minHeight: isMobile ? '200px' : '140px',
                                padding: '8px',
                                position: 'relative',
                            }}
                        >
                            {isCurrentMonth && (
                                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <div style={{
                                        display: 'flex', justifyContent: 'space-between',
                                        alignItems: 'center', marginBottom: '4px',
                                    }}>
                                        <span style={{
                                            fontSize: '12px', fontWeight: 700,
                                            color: isToday ? '#3182ce' : '#a0aec0',
                                            background: isToday ? '#ebf8ff' : 'none',
                                            borderRadius: isToday ? '50%' : 0,
                                            width: isToday ? '24px' : 'auto',
                                            height: isToday ? '24px' : 'auto',
                                            display: isToday ? 'flex' : 'inline',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                            {day} {isMobile && DAYS[(startDay + day - 1) % 7]}
                                        </span>
                                        <button
                                            onClick={() => onCreateClick(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                                            style={{
                                                width: '20px', height: '20px', borderRadius: '4px',
                                                border: 'none', background: 'transparent', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: '#3182ce', transition: 'all 0.2s',
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#ebf8ff'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto', maxHeight: '300px' }}>
                                        {dayPosts.map((p) => (
                                            <PostCard key={p.id} item={p} onClick={() => onPostClick(p)} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
