import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Compass, Briefcase, Check, Mail, Phone, AtSign } from 'lucide-react';
import { ABOUT } from '../seo/about';
import { AGENT_APP_URL } from '../utils/externalApps';

/** /about — who builds Himato and what it does for travellers and agents. */
export function AboutPage() {
    return (
        <main className="min-h-screen bg-ai-dark text-ai-text pt-24 pb-16 px-4 sm:px-6" role="main">
            <div className="max-w-4xl mx-auto">
                <Link to="/" className="inline-flex items-center gap-2 text-ai-muted hover:text-ai-text transition-colors mb-8 text-sm">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>

                <header className="mb-10">
                    <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-ai-accent mb-3">By Waglogy</p>
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5">{ABOUT.title}</h1>
                    <p className="text-lg text-ai-muted leading-relaxed max-w-3xl">{ABOUT.intro}</p>
                </header>

                {/* Problems, both sides */}
                <section className="mb-10" aria-labelledby="problems">
                    <h2 id="problems" className="text-2xl font-semibold mb-4">{ABOUT.problems.heading}</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {[ABOUT.problems.travellers, ABOUT.problems.agents].map((side) => (
                            <div key={side.heading} className="bg-white rounded-2xl border border-black/10 p-6">
                                <h3 className="font-semibold mb-3">{side.heading}</h3>
                                <ul className="space-y-2.5">
                                    {side.points.map((p) => (
                                        <li key={p} className="flex gap-2.5 text-sm text-ai-muted leading-relaxed">
                                            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-ai-warm shrink-0" aria-hidden="true" />
                                            {p}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Solutions, both sides */}
                <div className="grid md:grid-cols-2 gap-4 mb-10">
                    <SolutionCard icon={Compass} heading={ABOUT.travellers.heading} points={ABOUT.travellers.points}
                        cta={<Link to="/chat" className="inline-flex items-center gap-2 px-5 h-11 rounded-xl bg-ai-accent text-white text-sm font-semibold hover:bg-ai-secondary transition-colors">Plan your trip free <ArrowRight className="w-4 h-4" /></Link>} />
                    <SolutionCard icon={Briefcase} heading={ABOUT.agents.heading} points={ABOUT.agents.points}
                        cta={<a href={AGENT_APP_URL} className="inline-flex items-center gap-2 px-5 h-11 rounded-xl border border-black/15 bg-white text-ai-text text-sm font-semibold hover:border-ai-accent transition-colors">For travel agents <ArrowRight className="w-4 h-4" /></a>} />
                </div>

                {/* How guides are written */}
                <section className="bg-white rounded-2xl border border-black/10 p-6 mb-10" aria-labelledby="guides">
                    <h2 id="guides" className="text-2xl font-semibold mb-4">{ABOUT.guides.heading}</h2>
                    <ul className="space-y-2.5">
                        {ABOUT.guides.points.map((p) => (
                            <li key={p} className="flex gap-2.5 text-ai-muted leading-relaxed">
                                <Check className="w-4 h-4 text-ai-accent shrink-0 mt-1" />
                                {p}
                            </li>
                        ))}
                    </ul>
                    <Link to="/guides" className="inline-block mt-4 text-sm font-semibold text-ai-accent hover:underline">Browse the Sikkim guides</Link>
                </section>

                {/* Company */}
                <section aria-labelledby="company">
                    <h2 id="company" className="text-2xl font-semibold mb-3">{ABOUT.company.heading}</h2>
                    <p className="text-ai-muted mb-4">
                        {ABOUT.company.body}{' '}
                        Learn more about Waglogy at{' '}
                        <a href={ABOUT.company.waglogy.website} target="_blank" rel="noopener" className="font-medium text-ai-text hover:text-ai-accent">waglogy.com</a>
                        {' · '}<a href={ABOUT.company.waglogy.linkedin} target="_blank" rel="noopener" className="font-medium text-ai-text hover:text-ai-accent">LinkedIn</a>
                        {' · '}<a href={ABOUT.company.waglogy.instagram} target="_blank" rel="noopener" className="font-medium text-ai-text hover:text-ai-accent">Instagram</a>.
                    </p>
                    <ul className="flex flex-col sm:flex-row sm:flex-wrap gap-3 text-sm">
                        <li><a href={`mailto:${ABOUT.company.email}`} className="inline-flex items-center gap-2 hover:text-ai-accent"><Mail className="w-4 h-4 text-ai-accent" />{ABOUT.company.email}</a></li>
                        <li><a href={`tel:${ABOUT.company.phone.replace(/\s/g, '')}`} className="inline-flex items-center gap-2 hover:text-ai-accent"><Phone className="w-4 h-4 text-ai-accent" />{ABOUT.company.phone}</a></li>
                        <li><a href={ABOUT.company.instagram} target="_blank" rel="noopener noreferrer me" className="inline-flex items-center gap-2 hover:text-ai-accent"><AtSign className="w-4 h-4 text-ai-accent" />Instagram @himato_ai</a></li>
                    </ul>
                </section>
            </div>
        </main>
    );
}

function SolutionCard({ icon: Icon, heading, points, cta }: {
    icon: React.ComponentType<{ className?: string }>;
    heading: string;
    points: readonly { title: string; body: string }[];
    cta: React.ReactNode;
}) {
    return (
        <section className="bg-white rounded-2xl border border-black/10 p-6 flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-ai-accent/10 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-ai-accent" />
            </div>
            <h2 className="text-xl font-semibold mb-4">{heading}</h2>
            <ul className="space-y-4 mb-6 flex-1">
                {points.map((p) => (
                    <li key={p.title}>
                        <p className="font-medium">{p.title}</p>
                        <p className="text-sm text-ai-muted leading-relaxed mt-0.5">{p.body}</p>
                    </li>
                ))}
            </ul>
            <div>{cta}</div>
        </section>
    );
}
