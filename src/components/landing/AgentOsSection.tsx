import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { ArrowRight, FileText, Inbox, Users, Car, Wallet, FileCheck, Bell } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AGENT_APP_URL } from '../../utils/externalApps';
import { optimizedSrc } from '../../data/optimizedImages';

// Each module of the agent workspace, with a small example of its screen and the
// latest activity it would show. Everything listed here exists in the agent app.
interface Module {
    key: string;
    icon: LucideIcon;
    name: string;
    line: string;
    preview: ReactNode;
    activity: { text: ReactNode; when: string };
}

// Chip colours tuned for the frosted-glass preview
const statusCls: Record<string, string> = {
    accepted: 'bg-[#a8d5b5]/15 text-[#bfe3c9]',
    viewed: 'bg-[#a9c4ea]/15 text-[#c2d6f2]',
    changes: 'bg-[#f2c48d]/15 text-[#f2c48d]',
    new: 'bg-[#f2c48d]/15 text-[#f2c48d]',
    contacted: 'bg-white/10 text-white/70',
};
const Status = ({ kind, children }: { kind: string; children: ReactNode }) => (
    <span className={`shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full ${statusCls[kind]}`}>{children}</span>
);

// Leading visual for a row: a destination photo, or an initials avatar for people
const Thumb = ({ src }: { src: string }) => (
    <img src={optimizedSrc(src)} alt="" loading="lazy" decoding="async" className="w-11 h-11 rounded-lg object-cover shrink-0 border border-white/10" />
);
const AVATAR_TONES = ['#3d6ea8', '#4a7a5e', '#b7672f', '#7c6f9f'];
const Avatar = ({ name, tone = 0 }: { name: string; tone?: number }) => (
    <span className="w-11 h-11 rounded-full shrink-0 flex items-center justify-center text-sm font-semibold text-white" style={{ background: AVATAR_TONES[tone % AVATAR_TONES.length] }}>
        {name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
    </span>
);

const Row = ({ lead, title, sub, right }: { lead?: ReactNode; title: ReactNode; sub: ReactNode; right?: ReactNode }) => (
    <li className="flex items-center gap-3 py-2.5">
        {lead}
        <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">{title}</p>
            <p className="text-xs text-white/55 truncate mt-0.5">{sub}</p>
        </div>
        {right}
    </li>
);

// A small summary strip under each screen
const Strip = ({ items }: { items: [string, string, string?][] }) => (
    <div className="mt-3 grid grid-cols-3 gap-2">
        {items.map(([label, value, cls]) => (
            <div key={label} className="rounded-lg bg-white/[0.06] border border-white/10 px-2.5 py-2">
                <p className="text-[10px] uppercase tracking-wide text-white/45">{label}</p>
                <p className={`text-sm font-semibold tabular-nums ${cls || 'text-white'}`}>{value}</p>
            </div>
        ))}
    </div>
);

const MODULES: Module[] = [
    {
        key: 'proposals',
        icon: FileText,
        name: 'Proposals',
        line: 'Build an itinerary in a minute, send it under your agency name, and see when the client opens or accepts it.',
        preview: (
            <>
                <ul className="divide-y divide-white/[0.12]">
                    <Row lead={<Thumb src="/Pelling_Sky_walk.jpg" />} title="Sharma family · Gangtok & Pelling" sub="5 days · sent yesterday" right={<Status kind="viewed">Viewed</Status>} />
                    <Row lead={<Thumb src="/yumgthang.jpeg" />} title="Honeymoon · North Sikkim" sub="4 days · himato.in/peak-tours-x4kf2" right={<Status kind="accepted">Accepted</Status>} />
                    <Row lead={<Thumb src="/zuluk.jpg" />} title="College group · Zuluk Silk Route" sub="3 days · “Can we add Nathang?”" right={<Status kind="changes">Changes asked</Status>} />
                </ul>
                <Strip items={[['Sent this week', '6'], ['Opened', '5'], ['Accepted', '2', 'text-[#bfe3c9]']]} />
            </>
        ),
        activity: { text: <><b className="font-medium text-white">Karan</b> accepted the North Sikkim honeymoon plan</>, when: '2 min ago' },
    },
    {
        key: 'leads',
        icon: Inbox,
        name: 'Leads',
        line: 'Travellers who plan on Himato can send their trip to you. It lands here with dates, group size and their phone number.',
        preview: (
            <>
                <ul className="divide-y divide-white/[0.12]">
                    <Row lead={<Avatar name="Riya M" tone={0} />} title="Riya M. · North Sikkim, 4 days" sub="2 adults, 2 parents · April" right={<Status kind="new">New</Status>} />
                    <Row lead={<Avatar name="Ankit S" tone={2} />} title="Ankit S. · Gangtok & Tsomgo" sub="Family of 4 · next weekend" right={<Status kind="new">New</Status>} />
                    <Row lead={<Avatar name="Dawa L" tone={1} />} title="Dawa L. · Yuksom trek base" sub="Solo · May" right={<Status kind="contacted">Contacted</Status>} />
                </ul>
                <Strip items={[['New today', '2', 'text-[#f2c48d]'], ['This month', '18'], ['Replied', '16']]} />
            </>
        ),
        activity: { text: <><b className="font-medium text-white">Riya M.</b> sent you a North Sikkim trip for 4</>, when: 'Just now' },
    },
    {
        key: 'clients',
        icon: Users,
        name: 'Clients',
        line: 'Every customer in one list: where they come from, their trip dates, and the ID copies you need for permits.',
        preview: (
            <>
                <ul className="divide-y divide-white/[0.12]">
                    <Row lead={<Thumb src="/gangtok-bnnr.jpg" />} title="Mehta family" sub="Kolkata → Gangtok · 12–17 Mar" right={<span className="inline-flex items-center gap-1 text-xs text-white/70"><FileCheck className="w-3.5 h-3.5 text-[#bfe3c9]" />3 IDs</span>} />
                    <Row lead={<Thumb src="/tangu.jpeg" />} title="Arjun & Neha" sub="Bengaluru → Lachung · 2–6 Apr" right={<span className="inline-flex items-center gap-1 text-xs text-white/70"><FileCheck className="w-3.5 h-3.5 text-[#bfe3c9]" />2 IDs</span>} />
                    <Row lead={<Thumb src="/Pelling_Sky_walk.jpg" />} title="Thapa group" sub="Siliguri → Pelling · 20–23 Apr" right={<span className="text-xs text-[#f2c48d]">IDs missing</span>} />
                </ul>
                <Strip items={[['Travelling now', '4'], ['This season', '62'], ['IDs missing', '1', 'text-[#f2c48d]']]} />
            </>
        ),
        activity: { text: <><b className="font-medium text-white">Thapa group</b> still needs to send 2 ID copies</>, when: 'Today' },
    },
    {
        key: 'drivers',
        icon: Car,
        name: 'Drivers',
        line: 'Your drivers and their vehicles, with licence and permit papers stored, so you know who is free for the next trip.',
        preview: (
            <>
                <ul className="divide-y divide-white/[0.12]">
                    <Row lead={<Avatar name="Pemba Bhutia" tone={3} />} title="Pemba Bhutia · Innova Crysta" sub="On a trip until 14 Mar" right={<span className="inline-flex items-center gap-1.5 text-xs text-white/60"><span className="w-1.5 h-1.5 rounded-full bg-[#f2c48d]" />Busy</span>} />
                    <Row lead={<Avatar name="Karma Tshering" tone={1} />} title="Karma Tshering · Bolero" sub="Papers verified" right={<span className="inline-flex items-center gap-1.5 text-xs text-[#bfe3c9]"><span className="w-1.5 h-1.5 rounded-full bg-[#7fc795]" />Free</span>} />
                    <Row lead={<Avatar name="Suraj Rai" tone={0} />} title="Suraj Rai · Xylo" sub="Permit expires in 6 days" right={<span className="inline-flex items-center gap-1.5 text-xs text-[#bfe3c9]"><span className="w-1.5 h-1.5 rounded-full bg-[#7fc795]" />Free</span>} />
                </ul>
                <Strip items={[['Drivers', '8'], ['Free today', '3', 'text-[#bfe3c9]'], ['Papers due', '1', 'text-[#f2c48d]']]} />
            </>
        ),
        activity: { text: <><b className="font-medium text-white">Suraj's</b> North Sikkim permit expires on 16 Mar</>, when: 'Reminder' },
    },
    {
        key: 'finances',
        icon: Wallet,
        name: 'Finances',
        line: 'Bookings, advances and balances in one ledger, so you always know who has paid and what is still due.',
        preview: (
            <>
                <Strip items={[['Received', '₹1,84,000', 'text-[#bfe3c9]'], ['Pending', '₹62,500', 'text-[#f2c48d]'], ['Bookings', '14']]} />
                {/* Bookings per month */}
                <div className="mt-3 rounded-lg bg-white/[0.04] border border-white/10 px-3 pt-3 pb-2">
                    <div className="flex items-end gap-2 h-14">
                        {[6, 9, 7, 12, 10, 14].map((v, i) => (
                            <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-[#e6d29f]/35 to-[#e6d29f]/80" style={{ height: `${(v / 14) * 100}%` }} />
                        ))}
                    </div>
                    <div className="flex gap-2 mt-1.5 text-[10px] text-white/45">
                        {['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'].map((m) => <span key={m} className="flex-1 text-center">{m}</span>)}
                    </div>
                </div>
                <ul className="divide-y divide-white/[0.12] mt-1">
                    <Row title="Mehta family · advance" sub="UPI · 10 Mar" right={<span className="text-sm font-medium tabular-nums text-[#bfe3c9]">+₹20,000</span>} />
                    <Row title="Hotel in Lachung · 2 rooms" sub="Paid to vendor · 9 Mar" right={<span className="text-sm font-medium tabular-nums text-white/85">−₹9,600</span>} />
                </ul>
            </>
        ),
        activity: { text: <><b className="font-medium text-white">Mehta family</b> paid a ₹20,000 advance by UPI</>, when: '10 Mar' },
    },
];

const AUTO_ADVANCE_MS = 5000;

/** Landing-page pitch for travel agents: the agent workspace as one place to run the agency. */
export function AgentOsSection() {
    const [active, setActive] = useState(0);
    const [touched, setTouched] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { amount: 0.4 });

    useEffect(() => {
        if (touched || !inView) return;
        const t = setTimeout(() => setActive((i) => (i + 1) % MODULES.length), AUTO_ADVANCE_MS);
        return () => clearTimeout(t);
    }, [active, touched, inView]);

    const select = (i: number) => {
        setActive(i);
        setTouched(true);
    };
    const mod = MODULES[active];

    return (
        <section className="relative overflow-hidden py-28 md:py-32">
            {/* Zuluk's zigzag Silk Route roads — the roads agencies run their trips on */}
            <div className="absolute inset-0 z-0" aria-hidden="true">
                <img src={optimizedSrc('/zuluk.jpg')} alt="" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover object-[center_55%]" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(100deg, #0e1116 0%, rgba(14,17,22,0.9) 36%, rgba(14,17,22,0.5) 64%, rgba(14,17,22,0.3) 100%)' }} />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, #0e1116 0%, rgba(14,17,22,0) 22%, rgba(14,17,22,0) 72%, #0e1116 100%)' }} />
                <div className="absolute inset-0 lg:hidden bg-[rgba(14,17,22,0.5)]" />
            </div>

            <div ref={ref} className="relative z-10 container mx-auto px-4 max-w-6xl">
                <div className="max-w-2xl mb-10 md:mb-12">
                    <p className="text-sm font-medium text-white/50 mb-3">For travel agents</p>
                    <h2 className="text-3xl md:text-[2.75rem] font-bold text-white leading-[1.1] mb-4">
                        Run your whole agency from one place.
                    </h2>
                    <p className="text-white/60 leading-relaxed">
                        Himato for Agents is the back office for Sikkim tour operators. Proposals, leads, clients,
                        drivers and payments live together, instead of across WhatsApp, Excel sheets and notebooks.
                    </p>
                </div>

                <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-6 lg:gap-10 items-stretch">
                    {/* Module list */}
                    <div role="tablist" aria-label="Agent workspace" className="space-y-1.5">
                        {MODULES.map((m, i) => {
                            const isActive = i === active;
                            return (
                                <button
                                    key={m.key}
                                    role="tab"
                                    aria-selected={isActive}
                                    onClick={() => select(i)}
                                    className={`w-full text-left flex gap-4 rounded-2xl px-4 py-3.5 border transition-colors ${isActive
                                        ? 'bg-white/[0.08] border-white/20 backdrop-blur-md [box-shadow:inset_0_1px_0_rgba(255,255,255,0.12)]'
                                        : 'border-transparent hover:bg-white/[0.04]'}`}
                                >
                                    <span className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${isActive ? 'bg-white/90 text-ai-accent' : 'bg-white/[0.06] text-white/60'}`}>
                                        <m.icon className="w-4 h-4" />
                                    </span>
                                    <span className="min-w-0">
                                        <span className={`block font-semibold ${isActive ? 'text-white' : 'text-white/75'}`}>{m.name}</span>
                                        {/* Description only for the open module, so the list stays short */}
                                        <AnimatePresence initial={false}>
                                            {isActive && (
                                                <motion.span
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.25 }}
                                                    className="block overflow-hidden text-sm text-white/55 leading-relaxed"
                                                >
                                                    <span className="block pt-1">{m.line}</span>
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* App window preview */}
                    <div className="relative min-w-0">
                        <div className="h-full flex flex-col rounded-2xl text-white overflow-hidden border border-white/20 bg-white/[0.08] backdrop-blur-md [box-shadow:inset_0_1px_0_rgba(255,255,255,0.15),0_30px_60px_-30px_rgba(0,0,0,0.7)]">
                            {/* Top bar */}
                            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/15">
                                <div className="flex items-center gap-2 min-w-0">
                                    <img src="/logo-mark.webp" alt="" className="h-7 w-auto -my-1 brightness-0 invert opacity-90" />
                                    <span className="text-sm font-semibold truncate">Peak Tours</span>
                                    <span className="text-white/30">/</span>
                                    <span className="text-sm text-white/60 truncate">{mod.name}</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="relative w-7 h-7 rounded-full flex items-center justify-center text-white/70">
                                        <Bell className="w-4 h-4" />
                                        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#f2c48d]" />
                                    </span>
                                    <span className="w-7 h-7 rounded-full bg-white/15 border border-white/20 text-[11px] font-semibold flex items-center justify-center">PT</span>
                                </div>
                            </div>

                            <div className="flex flex-1 min-h-[300px]">
                                {/* Side menu, synced with the list on the left */}
                                <nav className="hidden sm:flex flex-col gap-1 p-2 border-r border-white/10" aria-label="Workspace sections">
                                    {MODULES.map((m, i) => (
                                        <button
                                            key={m.key}
                                            onClick={() => select(i)}
                                            aria-label={m.name}
                                            title={m.name}
                                            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${i === active ? 'bg-white/90 text-ai-accent' : 'text-white/55 hover:bg-white/10 hover:text-white'}`}
                                        >
                                            <m.icon className="w-4 h-4" />
                                        </button>
                                    ))}
                                </nav>

                                {/* Screen */}
                                <div className="flex-1 min-w-0 px-4 py-3">
                                    <AnimatePresence mode="wait" initial={false}>
                                        <motion.div
                                            key={mod.key}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            {mod.preview}
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Latest activity, like an app's status line */}
                            <div className="flex items-center gap-2.5 px-4 py-2.5 border-t border-white/15 text-xs text-white/65" aria-live="polite">
                                <span className="relative flex w-2 h-2 shrink-0">
                                    <span className="absolute inset-0 rounded-full bg-[#7fc795] opacity-60 animate-ping" />
                                    <span className="relative w-2 h-2 rounded-full bg-[#7fc795]" />
                                </span>
                                <AnimatePresence mode="wait" initial={false}>
                                    <motion.p
                                        key={mod.key}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex-1 min-w-0 flex items-center justify-between gap-3"
                                    >
                                        <span className="truncate">{mod.activity.text}</span>
                                        <span className="shrink-0 text-white/40">{mod.activity.when}</span>
                                    </motion.p>
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-10 flex flex-col sm:flex-row sm:items-center gap-4">
                    <a
                        href={`${AGENT_APP_URL}/register`}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-colors"
                        style={{ background: '#f6f1e7', color: '#0e1116' }}
                    >
                        Open Himato for Agents <ArrowRight className="w-4 h-4" />
                    </a>
                    <p className="text-sm text-white/50">Sign up with Google or your email. Setting up takes a few minutes.</p>
                </div>
            </div>
        </section>
    );
}
