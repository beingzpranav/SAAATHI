import React from 'react';
import { Compass, Users, ShieldCheck, ArrowRight } from 'lucide-react';
import { env } from '../config/env.js';

export const App: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#FFFDF9',
        color: '#3A2E2A',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <header
        style={{
          borderBottom: '1px solid #EADDCF',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass size={28} color="#C4562B" aria-hidden="true" />
          <span style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '0.5px' }}>SAATHI</span>
        </div>
        <div
          style={{
            fontSize: '13px',
            color: '#6E5D57',
            padding: '4px 10px',
            backgroundColor: '#F3EAE1',
            borderRadius: '6px',
          }}
        >
          API: {env.VITE_API_URL}
        </div>
      </header>

      <main
        style={{
          flex: 1,
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          padding: '48px 24px',
          boxSizing: 'border-box',
        }}
      >
        <section style={{ maxWidth: '720px', marginBottom: '48px' }}>
          <h1
            style={{
              fontSize: '36px',
              fontWeight: 700,
              lineHeight: 1.25,
              color: '#3A2E2A',
              marginBottom: '16px',
            }}
          >
            Help your whole family choose a trade you can trust.
          </h1>
          <p
            style={{
              fontSize: '18px',
              lineHeight: 1.6,
              color: '#5C4E49',
              marginBottom: '24px',
            }}
          >
            Private chats for student and parent, local pay and placement figures, and a live
            counsellor if doubts remain.
          </p>

          <button
            type="button"
            style={{
              backgroundColor: '#C4562B',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>Start family intake</span>
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #EADDCF',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 2px 4px rgba(58, 46, 42, 0.04)',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: '#FDF4E5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <Users size={22} color="#EFA531" aria-hidden="true" />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
              Dual-Window Privacy
            </h2>
            <p style={{ fontSize: '15px', color: '#6E5D57', lineHeight: 1.5, margin: 0 }}>
              Learners and parents answer voluntary questions in private rooms with PIN security.
            </p>
          </div>

          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #EADDCF',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 2px 4px rgba(58, 46, 42, 0.04)',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: '#EBF4F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <ShieldCheck size={22} color="#2F7D5C" aria-hidden="true" />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
              Verified Outcome Data
            </h2>
            <p style={{ fontSize: '15px', color: '#6E5D57', lineHeight: 1.5, margin: 0 }}>
              Ground truth figures from local ITIs and vocational centers with confidence levels.
            </p>
          </div>

          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #EADDCF',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 2px 4px rgba(58, 46, 42, 0.04)',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: '#F9EBE6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <Compass size={22} color="#C4562B" aria-hidden="true" />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
              Family Decision Card
            </h2>
            <p style={{ fontSize: '15px', color: '#6E5D57', lineHeight: 1.5, margin: 0 }}>
              A printable one-page summary documenting agreed trades, next steps, and contacts.
            </p>
          </div>
        </section>
      </main>

      <footer
        style={{
          borderTop: '1px solid #EADDCF',
          padding: '24px',
          textAlign: 'center',
          fontSize: '14px',
          color: '#8A7A73',
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
        }}
      >
        SAATHI Vocational Counselling Platform - Smart India Hackathon 2026
      </footer>
    </div>
  );
};
