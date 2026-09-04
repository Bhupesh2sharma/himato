import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';

interface Activity { time?: string; title?: string; description?: string; location?: string; }
interface DayPlan {
    day: number; title?: string; activities?: Activity[];
    overnightStay?: string; altitude?: string;
}
export interface ItineraryPdfData {
    days: DayPlan[];
    businessName?: string;
    agentName?: string;
    contactNumber?: string;
    brandColor?: string;
    brandLogo?: string;
    welcomeNote?: string;
    tripSummary?: string;
    bestTime?: string;
    permits?: string[];
    packingList?: string[];
    notes?: string;
    pricing?: { total?: string; perGuest?: string; includes?: string };
}

const makeStyles = (accent: string) =>
    StyleSheet.create({
        page: { backgroundColor: '#ffffff', color: '#0e1116', fontFamily: 'Helvetica', fontSize: 10, paddingBottom: 54 },
        header: { backgroundColor: accent, color: '#ffffff', paddingHorizontal: 34, paddingVertical: 28 },
        brandRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
        brandLogo: { height: 22, marginRight: 8 },
        brandName: { color: '#ffffff', fontSize: 12, fontFamily: 'Helvetica-Bold', letterSpacing: 1 },
        eyebrow: { color: '#ffffff', opacity: 0.75, fontSize: 8, letterSpacing: 2, marginBottom: 6, textTransform: 'uppercase' },
        title: { color: '#ffffff', fontSize: 24, fontFamily: 'Helvetica-Bold' },
        metaRow: { flexDirection: 'row', marginTop: 10 },
        metaItem: { color: '#ffffff', opacity: 0.9, fontSize: 9, marginRight: 16 },
        body: { paddingHorizontal: 34, paddingTop: 22 },
        summary: { fontSize: 11, lineHeight: 1.5, color: '#333', marginBottom: 18, fontFamily: 'Helvetica-Oblique' },
        card: { backgroundColor: '#faf7f0', borderRadius: 6, padding: 14, marginBottom: 12, borderLeftWidth: 3, borderLeftColor: accent },
        cardLabel: { fontSize: 8, letterSpacing: 1.5, color: '#6b7280', textTransform: 'uppercase', marginBottom: 6, fontFamily: 'Helvetica-Bold' },
        cardText: { fontSize: 10, lineHeight: 1.5, color: '#0e1116' },
        chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
        chip: { fontSize: 8.5, color: '#0e1116', backgroundColor: '#f0ebdf', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, marginRight: 5, marginBottom: 5 },
        daySection: { marginBottom: 18 },
        dayHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
        dayNum: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: accent, marginRight: 8 },
        dayTitle: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#0e1116', flex: 1 },
        dayMeta: { fontSize: 8.5, color: '#6b7280', marginBottom: 8 },
        activity: { marginBottom: 9, paddingLeft: 12, borderLeftWidth: 1, borderLeftColor: '#e3ddd0' },
        actTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
        actTitle: { fontSize: 10.5, fontFamily: 'Helvetica-Bold', color: '#0e1116', flex: 1, paddingRight: 8 },
        actTime: { fontSize: 8.5, color: accent, fontFamily: 'Helvetica-Bold' },
        actDesc: { fontSize: 9.5, color: '#4b5563', lineHeight: 1.45, marginBottom: 2 },
        actLoc: { fontSize: 8.5, color: '#6b7280' },
        sectionTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#0e1116', marginBottom: 8, marginTop: 4 },
        priceRow: { flexDirection: 'row', marginBottom: 8 },
        priceBox: { backgroundColor: '#faf7f0', borderRadius: 6, padding: 10, marginRight: 8, minWidth: 120 },
        footer: { position: 'absolute', bottom: 22, left: 34, right: 34, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#e3ddd0', paddingTop: 8 },
        footerText: { fontSize: 8, color: '#9ca3af' },
    });

export function ItineraryPdf({ data }: { data: ItineraryPdfData }) {
    const accent = data.brandColor || '#2f4a3a';
    const s = makeStyles(accent);
    const branded = Boolean(data.businessName || data.agentName);
    const includes = (data.pricing?.includes ?? '').split(/[,|\n]+/).map((x) => x.trim()).filter(Boolean);

    return (
        <Document title={`${data.days.length}-Day Sikkim Itinerary`} author={data.businessName || 'Himato'}>
            <Page size="A4" style={s.page}>
                {/* Header */}
                <View style={s.header}>
                    <View style={s.brandRow}>
                        {branded && data.brandLogo ? (
                            <Image style={s.brandLogo} src={data.brandLogo} />
                        ) : null}
                        <Text style={s.brandName}>{branded ? (data.businessName || data.agentName) : 'HIMATO'}</Text>
                    </View>
                    <Text style={s.eyebrow}>Your Sikkim Itinerary</Text>
                    <Text style={s.title}>{data.days.length}-Day Sikkim Journey</Text>
                    <View style={s.metaRow}>
                        <Text style={s.metaItem}>{data.days.length} days</Text>
                        <Text style={s.metaItem}>Sikkim, India</Text>
                        {data.pricing?.total ? <Text style={s.metaItem}>{data.pricing.total}</Text> : null}
                    </View>
                </View>

                <View style={s.body}>
                    {data.tripSummary ? <Text style={s.summary}>{data.tripSummary}</Text> : null}

                    {data.welcomeNote ? (
                        <View style={s.card}>
                            <Text style={s.cardLabel}>Message from {data.agentName || data.businessName || 'your planner'}</Text>
                            <Text style={s.cardText}>"{data.welcomeNote}"</Text>
                        </View>
                    ) : null}

                    {data.bestTime ? (
                        <View style={s.card}>
                            <Text style={s.cardLabel}>Best time to visit</Text>
                            <Text style={s.cardText}>{data.bestTime}</Text>
                        </View>
                    ) : null}

                    {data.permits && data.permits.length > 0 ? (
                        <View style={s.card}>
                            <Text style={s.cardLabel}>Permits you'll need</Text>
                            {data.permits.map((p, i) => <Text key={i} style={s.cardText}>• {p}</Text>)}
                        </View>
                    ) : null}

                    {data.packingList && data.packingList.length > 0 ? (
                        <View style={s.card}>
                            <Text style={s.cardLabel}>What to pack</Text>
                            <View style={s.chipRow}>
                                {data.packingList.map((p, i) => <Text key={i} style={s.chip}>{p}</Text>)}
                            </View>
                        </View>
                    ) : null}

                    {/* Days */}
                    <Text style={s.sectionTitle}>Day by day</Text>
                    {data.days.map((day, di) => (
                        <View key={di} style={s.daySection} wrap={false}>
                            <View style={s.dayHead}>
                                <Text style={s.dayNum}>Day {day.day}</Text>
                                <Text style={s.dayTitle}>{day.title || ''}</Text>
                            </View>
                            {(day.overnightStay || day.altitude) ? (
                                <Text style={s.dayMeta}>
                                    {day.overnightStay ? `Overnight in ${day.overnightStay}` : ''}
                                    {day.overnightStay && day.altitude ? '  •  ' : ''}
                                    {day.altitude || ''}
                                </Text>
                            ) : null}
                            {(day.activities || []).map((a, ai) => (
                                <View key={ai} style={s.activity}>
                                    <View style={s.actTop}>
                                        <Text style={s.actTitle}>{a.title}</Text>
                                        {a.time ? <Text style={s.actTime}>{a.time}</Text> : null}
                                    </View>
                                    {a.description ? <Text style={s.actDesc}>{a.description}</Text> : null}
                                    {a.location ? <Text style={s.actLoc}>{a.location}</Text> : null}
                                </View>
                            ))}
                        </View>
                    ))}

                    {/* Pricing */}
                    {branded && (data.pricing?.total || data.pricing?.perGuest || includes.length > 0) ? (
                        <View wrap={false}>
                            <Text style={s.sectionTitle}>Pricing & inclusions</Text>
                            <View style={s.priceRow}>
                                {data.pricing?.total ? (
                                    <View style={s.priceBox}>
                                        <Text style={s.cardLabel}>Total</Text>
                                        <Text style={{ fontSize: 14, fontFamily: 'Helvetica-Bold' }}>{data.pricing.total}</Text>
                                    </View>
                                ) : null}
                                {data.pricing?.perGuest ? (
                                    <View style={s.priceBox}>
                                        <Text style={s.cardLabel}>Per guest</Text>
                                        <Text style={{ fontSize: 14, fontFamily: 'Helvetica-Bold' }}>{data.pricing.perGuest}</Text>
                                    </View>
                                ) : null}
                            </View>
                            {includes.length > 0 ? (
                                <View style={s.chipRow}>{includes.map((x, i) => <Text key={i} style={s.chip}>{x}</Text>)}</View>
                            ) : null}
                        </View>
                    ) : null}

                    {/* Notes */}
                    {data.notes ? (
                        <View wrap={false}>
                            <Text style={s.sectionTitle}>Terms & notes</Text>
                            <Text style={s.cardText}>{data.notes}</Text>
                        </View>
                    ) : null}
                </View>

                {/* Footer */}
                <View style={s.footer} fixed>
                    <Text style={s.footerText}>
                        {branded && data.contactNumber ? `${data.businessName || data.agentName} • ${data.contactNumber}` : 'Planned with Himato • himato.in'}
                    </Text>
                    <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
                </View>
            </Page>
        </Document>
    );
}
