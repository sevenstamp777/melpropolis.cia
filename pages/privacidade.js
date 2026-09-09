import Layout from '../components/layout';
import SEO from '../components/SEO';
import Link from 'next/link';

const sections = [
  {
    title: '1. Controlador dos dados',
    body: (
      <>
        <p className="text-[var(--muted)] text-[15px] leading-7">
          O controlador das informações coletadas neste site é:
        </p>
        <div className="mt-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 text-[15px] leading-7">
          <strong className="text-[var(--fg)]">Erick Garcia</strong> (pessoa física)
          <br />
          Mel, Própolis &amp; Cia
          <br />
          E-mail:{' '}
          <a href="mailto:contato@melpropolis.com.br" className="text-[var(--accent-light)] hover:text-[var(--accent)] transition-colors">
            contato@melpropolis.com.br
          </a>
        </div>
      </>
    ),
  },
  {
    title: '2. Dados coletados',
    body: (
      <>
        <p className="text-[var(--muted)] text-[15px] leading-7">
          Ao interagir com o site — por exemplo, ao preencher o quiz de recomendação,
          enviar uma mensagem pela página de contato ou solicitar um orçamento — podemos
          coletar os seguintes dados pessoais:
        </p>
        <ul className="mt-4 list-disc list-inside text-[var(--muted)] text-[15px] leading-7 space-y-1">
          <li>
            <strong className="text-[var(--fg)]">Dados informados por você</strong>: nome,
            endereço de e-mail e número de WhatsApp, quando fornecidos em formulários de
            captura, quiz ou contato;
          </li>
          <li>
            <strong className="text-[var(--fg)]">Dados de navegação</strong>: endereço IP,
            tipo de navegador e páginas visitadas, coletados de forma automática pela
            plataforma de hospedagem.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: '3. Finalidade e base legal do tratamento',
    body: (
      <>
        <p className="text-[var(--muted)] text-[15px] leading-7">
          Os dados informados são utilizados exclusivamente para:
        </p>
        <ul className="mt-4 list-disc list-inside text-[var(--muted)] text-[15px] leading-7 space-y-1">
          <li>Responder às suas solicitações de contato e orçamento;</li>
          <li>Enviar a recomendação personalizada de produto resultante do quiz;</li>
          <li>Enviar comunicações relacionadas aos nossos produtos, mediante seu consentimento;</li>
          <li>Melhorar a experiência e o conteúdo do site.</li>
        </ul>
        <p className="mt-4 text-[var(--muted)] text-[15px] leading-7">
          A base legal para esse tratamento é o <strong className="text-[var(--fg)]">consentimento</strong>{' '}
          (art. 7º, inciso I, da LGPD), concedido por você no momento do cadastro. Você pode
          revogar seu consentimento a qualquer momento.
        </p>
      </>
    ),
  },
  {
    title: '4. Compartilhamento com terceiros',
    body: (
      <>
        <p className="text-[var(--muted)] text-[15px] leading-7">
          Para viabilizar o funcionamento do site e o atendimento, seus dados podem ser
          processados por ferramentas de terceiros que atuam como{' '}
          <strong className="text-[var(--fg)]">operadoras</strong> (processadoras), conforme a
          LGPD. A utilização de cada uma depende do serviço que você usa:
        </p>
        <ul className="mt-4 list-disc list-inside text-[var(--muted)] text-[15px] leading-7 space-y-1">
          <li>
            <strong className="text-[var(--fg)]">Google (Forms e Fonts)</strong> — o formulário
            de captura e contato é processado pelo Google Forms; as fontes do site são servidas
            pelo Google Fonts.
          </li>
          <li>
            <strong className="text-[var(--fg)]">WhatsApp (Meta)</strong> — canal de atendimento
            e fechamento de pedidos.
          </li>
          <li>
            <strong className="text-[var(--fg)]">SendPulse</strong> — plataforma de e-mail
            marketing e envio de comunicações aos assinantes.
          </li>
          <li>
            <strong className="text-[var(--fg)]">Vercel</strong> — empresa de hospedagem do site,
            que processa dados de acesso necessários à prestação do serviço.
          </li>
        </ul>
        <p className="mt-4 text-[var(--muted)] text-[15px] leading-7">
          Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros para fins de
          publicidade não relacionada aos nossos serviços. Não transferimos seus dados para fora do
          Brasil, salvo quando exigido pelo funcionamento das ferramentas acima, sempre com as
          garantias exigidas pela LGPD.
        </p>
      </>
    ),
  },
  {
    title: '5. Cookies e tecnologias de rastreamento',
    body: (
      <p className="text-[var(--muted)] text-[15px] leading-7">
        O site pode utilizar cookies e tecnologias semelhantes por meio de serviços de terceiros
        (como Google Fonts) para o funcionamento correto das páginas e para melhorar a experiência
        do visitante. Você pode gerenciar ou desativar os cookies nas configurações do seu
        navegador. A desativação pode afetar o funcionamento de alguns recursos.
      </p>
    ),
  },
  {
    title: '6. Direitos do titular (LGPD, art. 18)',
    body: (
      <>
        <p className="text-[var(--muted)] text-[15px] leading-7">
          Nos termos da LGPD, você tem direito a:
        </p>
        <ul className="mt-4 list-disc list-inside text-[var(--muted)] text-[15px] leading-7 space-y-1">
          <li>Confirmar a existência de tratamento de seus dados;</li>
          <li>Acessar seus dados pessoais;</li>
          <li>Corrigir dados incompletos, inexatos ou desatualizados;</li>
          <li>Solicitar anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos;</li>
          <li>Solicitar a portabilidade dos dados a outro fornecedor;</li>
          <li>Revogar o consentimento a qualquer momento;</li>
          <li>Solicitar informação sobre o compartilhamento de dados com terceiros.</li>
        </ul>
        <p className="mt-4 text-[var(--muted)] text-[15px] leading-7">
          Para exercer qualquer um desses direitos, basta entrar em contato pelo e-mail{' '}
          <a href="mailto:contato@melpropolis.com.br" className="text-[var(--accent-light)] hover:text-[var(--accent)] transition-colors">
            contato@melpropolis.com.br
          </a>
          . Atenderemos sua solicitação no prazo legal.
        </p>
      </>
    ),
  },
  {
    title: '7. Armazenamento e segurança',
    body: (
      <p className="text-[var(--muted)] text-[15px] leading-7">
        Seus dados são armazenados em servidores seguros das ferramentas mencionadas na seção 4,
        com medidas técnicas e organizacionais adequadas para proteger as informações contra acessos
        não autorizados, perda ou alteração. Os dados cadastrais serão mantidos enquanto existir a
        relação com o titular ou até que ele solicite a eliminação, observado o disposto na
        legislação aplicável.
      </p>
    ),
  },
  {
    title: '8. Menores de idade',
    body: (
      <p className="text-[var(--muted)] text-[15px] leading-7">
        Nossos produtos e o site são destinados a maiores de 18 anos. Não coletamos intencionalmente
        dados de menores de idade. Se você é responsável por um menor e acredita que seus dados foram
        fornecidos, entre em contato conosco para que possamos removê-los.
      </p>
    ),
  },
  {
    title: '9. Alterações nesta política',
    body: (
      <p className="text-[var(--muted)] text-[15px] leading-7">
        Esta Política de Privacidade pode ser atualizada periodicamente para refletir mudanças nas
        práticas do site ou na legislação. A versão mais recente estará sempre disponível nesta
        página, com a data de atualização indicada no topo.
      </p>
    ),
  },
  {
    title: '10. Contato',
    body: (
      <p className="text-[var(--muted)] text-[15px] leading-7">
        Se você tiver dúvidas sobre esta Política de Privacidade ou sobre o tratamento dos seus dados
        pessoais, entre em contato pelo e-mail{' '}
        <a href="mailto:contato@melpropolis.com.br" className="text-[var(--accent-light)] hover:text-[var(--accent)] transition-colors">
          contato@melpropolis.com.br
        </a>{' '}
        ou pelo WhatsApp{' '}
        <a href="https://wa.me/5518997130824" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-light)] hover:text-[var(--accent)] transition-colors">
          (18) 99713-0824
        </a>
        .
      </p>
    ),
  },
];

export default function PrivacidadePage() {
  return (
    <Layout>
      <SEO
        title="Política de Privacidade"
        description="Política de Privacidade da Mel, Própolis & Cia. Saiba como coletamos, usamos e protegemos seus dados pessoais em conformidade com a LGPD."
        path="/privacidade"
      />
      <main className="min-h-screen bg-[var(--bg)]">
        <section className="py-20 border-b border-[var(--border)]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <Link href="/" className="text-[var(--muted)] hover:text-[var(--accent-light)] text-sm transition-colors">
              ← Voltar ao site
            </Link>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-[var(--fg)] mt-6 mb-4">
              Política de Privacidade
            </h1>
            <p className="text-[var(--muted)] text-sm mb-6">Última atualização: 08 de setembro de 2026</p>
            <p className="text-[var(--muted)] text-[15px] leading-7">
              Esta Política de Privacidade descreve como a <strong className="text-[var(--fg)]">Mel,
              Própolis &amp; Cia</strong> (Erick Garcia) coleta, utiliza, armazena e protege os dados
              pessoais de quem acessa o site <strong className="text-[var(--fg)]">melpropolis.com.br</strong>{' '}
              e utiliza nossos produtos e serviços, em conformidade com a Lei Geral de Proteção de
              Dados Pessoais (LGPD — Lei nº 13.709/2018).
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
            {sections.map((s) => (
              <div key={s.title}>
                <h2 className="font-display text-2xl font-bold text-[var(--fg)] mb-4">{s.title}</h2>
                {s.body}
              </div>
            ))}
          </div>
        </section>
      </main>
    </Layout>
  );
}