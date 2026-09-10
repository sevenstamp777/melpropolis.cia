import Layout from '../components/layout';
import SEO from '../components/SEO';
import SendPulseForm from '../components/SendPulseForm';

export default function ContatoPage() {
  return (
    <Layout>
      <SEO
        title="Contato"
        description="Tire dúvidas sobre nossos produtos de mel, própolis e geleia real. Atendimento pelo WhatsApp (18) 99713-0824, e-mail e formulário. Respondemos em até 24h."
        path="/contato"
      />
      <main className="min-h-screen bg-[var(--bg)]">
        {/* Hero Section */}
        <section className="py-20 border-b border-[var(--border)]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <span className="inline-block px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent-light)] text-xs font-medium border border-[var(--accent)]/20 mb-6">
              💬 Fale Conosco
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-[var(--fg)] mb-6">
              Estamos aqui para ajudar
            </h1>
            <p className="text-[var(--muted)] text-lg max-w-2xl mx-auto">
              Tem dúvidas sobre nossos produtos, pedidos ou parcerias? 
              Entre em contato e nossa equipe retornará o mais breve possível.
            </p>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {[
                {
                  icon: '📱',
                  title: 'WhatsApp',
                  desc: 'Atendimento rápido e direto',
                  value: '(18) 99713-0824',
                  action: 'https://wa.me/5518997130824',
                },
                {
                  icon: '📧',
                  title: 'E-mail',
                  desc: 'Respostas em até 24h',
                  value: 'contato@melpropolis.com.br',
                  action: 'mailto:contato@melpropolis.com.br',
                },
                {
                  icon: '📍',
                  title: 'Localização',
                  desc: 'São Paulo, SP - Brasil',
                  value: 'Atendemos todo o Brasil',
                  action: '#',
                },
              ].map((method, idx) => (
                <div
                  key={idx}
                  className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 text-center"
                >
                  <div className="text-3xl mb-4">{method.icon}</div>
                  <h3 className="font-display font-semibold text-lg text-[var(--fg)] mb-2">
                    {method.title}
                  </h3>
                  <p className="text-[var(--muted)] text-sm mb-3">
                    {method.desc}
                  </p>
                  <a
                    href={method.action}
                    className={method.action === '#' 
                      ? 'text-[var(--muted)] text-sm'
                      : 'text-[var(--accent-light)] hover:text-[var(--accent)] text-sm font-medium transition-colors'
                    }
                    target={method.action.startsWith('http') ? '_blank' : '_self'}
                    rel={method.action.startsWith('http') ? 'noopener noreferrer' : ''}
                  >
                    {method.value}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-20 border-t border-[var(--border)] bg-[var(--bg-subtle)]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl font-bold text-[var(--fg)] mb-4">
                Envie uma mensagem
              </h2>
              <p className="text-[var(--muted)]">
                Preencha o formulário abaixo e entraremos em contato em breve
              </p>
            </div>

            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8">
              <div className="text-center mb-8">
                <div className="text-5xl mb-4">🐝</div>
                <h3 className="font-display text-2xl font-bold text-[var(--accent-light)] mb-2">
                  Mande sua mensagem
                </h3>
                <p className="text-[var(--muted)]">
                  Preencha os dados abaixo e retornaremos o mais breve possível.
                </p>
              </div>
              <SendPulseForm variant="contato" />
            </div>
          </div>
        </section>

        {/* FAQ Quick Links */}
        <section className="py-20 border-t border-[var(--border)]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="font-display text-3xl font-bold text-[var(--fg)] mb-6">
              Perguntas Frequentes
            </h2>
            <div className="space-y-4">
              {[
                {
                  q: 'Qual a diferença entre própolis e mel?',
                  a: 'Própolis é uma resina coletada pelas abelhas para proteger a colmeia. O mel é um alimento produzido a partir do néctar das flores.',
                },
                {
                  q: 'Os produtos são 100% naturais?',
                  a: 'Sim, todos os nossos produtos são 100% naturais, sem aditivos químicos ou conservantes.',
                },
                {
                  q: 'Vocês entregam em todo o Brasil?',
                  a: 'Sim, atendemos todo o território nacional com envios seguros e rastreados.',
                },
              ].map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 text-left"
                >
                  <h3 className="font-semibold text-[var(--fg)] mb-2">{faq.q}</h3>
                  <p className="text-[var(--muted)] text-sm">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}