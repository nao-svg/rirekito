"use client";

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { formatPeriod, type CareerJob, type CareerSheet } from "@/data/career";
import { PDF_FONT_FAMILY, injectBreakPoints } from "@/lib/pdf-fonts";

const BORDER = "1px solid #000";

const s = StyleSheet.create({
  page: {
    fontFamily: PDF_FONT_FAMILY,
    fontSize: 10,
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 40,
    backgroundColor: "#ffffff",
    color: "#000",
    lineHeight: 1.6,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 8,
    textAlign: "center",
    marginBottom: 8,
  },
  meta: {
    alignItems: "flex-end",
    marginBottom: 16,
  },
  metaText: {
    fontSize: 10,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    borderBottom: BORDER,
    paddingBottom: 2,
    marginBottom: 6,
  },
  // SawarabiMincho に「■」の字形が無いため、四角を図形で描く
  sectionMark: {
    width: 8,
    height: 8,
    backgroundColor: "#000",
    marginRight: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
  },
  body: {
    fontSize: 10,
    lineHeight: 1.7,
  },
  job: {
    border: BORDER,
    marginBottom: 8,
  },
  jobHeader: {
    backgroundColor: "#f5f5f5",
    borderBottom: BORDER,
    paddingHorizontal: 6,
    paddingVertical: 4,
    fontSize: 10,
  },
  jobRow: {
    flexDirection: "row",
  },
  jobRowBorder: {
    flexDirection: "row",
    borderBottom: BORDER,
  },
  jobLabel: {
    width: 80,
    borderRight: BORDER,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 6,
    paddingVertical: 4,
    fontSize: 9,
  },
  jobValue: {
    flex: 1,
    paddingHorizontal: 6,
    paddingVertical: 4,
    fontSize: 10,
    lineHeight: 1.7,
  },
});

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={s.sectionHeader}>
      <View style={s.sectionMark} />
      <Text style={s.sectionTitle}>{title}</Text>
    </View>
  );
}

function jobPeriod(job: CareerJob): string {
  return job.start ? formatPeriod(job.start, job.end) : "";
}

function dutiesText(job: CareerJob): string {
  const list = job.duties.join("、");
  const note = job.dutiesNote.trim();
  if (list && note) return `${list}。${note}`;
  return list || note;
}

function JobBlock({ job }: { job: CareerJob }) {
  const duties = dutiesText(job);
  const achievement = job.achievement.trim();
  const header = [jobPeriod(job), `${job.workplaceType}（${job.employment}）`]
    .filter(Boolean)
    .join("　");
  const rows: { label: string; value: string }[] = [];
  if (duties) rows.push({ label: "業務内容", value: duties });
  if (achievement) rows.push({ label: "頑張ったこと", value: achievement });

  return (
    <View style={s.job} wrap={false}>
      <Text style={[s.jobHeader, rows.length === 0 ? { borderBottom: 0 } : {}]}>{header}</Text>
      {rows.map((r, i) => (
        <View key={r.label} style={i < rows.length - 1 ? s.jobRowBorder : s.jobRow}>
          <Text style={s.jobLabel}>{r.label}</Text>
          <Text style={s.jobValue}>{injectBreakPoints(r.value)}</Text>
        </View>
      ))}
    </View>
  );
}

export function CareerSheetDocument({
  name,
  careerSheet,
  selfPR,
}: {
  name: string;
  careerSheet: CareerSheet;
  selfPR: string;
}) {
  const today = new Date();
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日現在`;
  const summary = careerSheet.summary.trim();
  const pr = selfPR.trim();

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <Text style={s.title}>職務経歴書</Text>
        <View style={s.meta}>
          <Text style={s.metaText}>{dateStr}</Text>
          <Text style={s.metaText}>氏名　{name}</Text>
        </View>

        {summary !== "" && (
          <View style={s.section}>
            <SectionHeader title="職務要約" />
            <Text style={s.body}>{injectBreakPoints(summary)}</Text>
          </View>
        )}

        <View style={s.section}>
          <SectionHeader title="職務経歴" />
          {careerSheet.jobs.map((job, i) => (
            <JobBlock key={i} job={job} />
          ))}
        </View>

        {careerSheet.skills.length > 0 && (
          <View style={s.section} wrap={false}>
            <SectionHeader title="活かせる経験・スキル" />
            <Text style={s.body}>{careerSheet.skills.map((sk) => `・${sk}`).join("\n")}</Text>
          </View>
        )}

        {pr !== "" && (
          <View style={s.section}>
            <SectionHeader title="自己PR" />
            <Text style={s.body}>{injectBreakPoints(pr)}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}
