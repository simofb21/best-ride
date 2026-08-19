<template>
  <CollapsiblePanel
    :title="$t('aiAnalysis.title')"
    icon="mdi-robot-outline"
    full-width
  >
    <div class="analysis-content" :aria-busy="isWaiting">
      <div v-if="isWaiting" class="analysis-state" role="status">
        <v-progress-circular
          color="primary"
          indeterminate
          size="30"
          width="3"
        />
        <div>
          <strong>{{ $t("aiAnalysis.generating") }}</strong>
          <p>{{ $t("aiAnalysis.generatingHint") }}</p>
        </div>
      </div>

      <div v-else-if="requestState === 'error'" class="analysis-state error-state">
        <v-icon icon="mdi-alert-circle-outline" size="30" />
        <div>
          <strong>{{ $t("aiAnalysis.unavailable") }}</strong>
          <p>{{ $t("aiAnalysis.error") }}</p>
          <button class="retry-button" type="button" @click="retry">
            <v-icon icon="mdi-refresh" size="17" />
            {{ $t("aiAnalysis.retry") }}
          </button>
        </div>
      </div>

      <article v-else-if="report && localizedReport" class="report">
        <header class="report-header">
          <div>
            <p class="report-kicker">{{ $t("aiAnalysis.reportLabel") }}</p>
            <h3>{{ localizedReport.title }}</h3>
          </div>
          <div class="report-badges">
            <span class="badge workout-badge">
              {{ $t(`aiAnalysis.workoutTypes.${report.workoutType}`) }}
            </span>
            <span class="badge" :class="`load-${report.loadLevel}`">
              {{ $t(`aiAnalysis.loadLevels.${report.loadLevel}`) }}
            </span>
          </div>
        </header>

        <p class="summary">{{ localizedReport.summary }}</p>

        <section class="assessment-block">
          <h4>{{ $t("aiAnalysis.loadAssessment") }}</h4>
          <p>{{ localizedReport.loadAssessment }}</p>
        </section>

        <div class="insights-grid">
          <section v-if="localizedReport.strengths.length" class="insight-card">
            <h4>
              <v-icon icon="mdi-check-circle-outline" size="18" />
              {{ $t("aiAnalysis.strengths") }}
            </h4>
            <ul>
              <li v-for="item in localizedReport.strengths" :key="item">
                {{ item }}
              </li>
            </ul>
          </section>

          <section
            v-if="localizedReport.cautions.length"
            class="insight-card caution-card"
          >
            <h4>
              <v-icon icon="mdi-alert-outline" size="18" />
              {{ $t("aiAnalysis.cautions") }}
            </h4>
            <ul>
              <li v-for="item in localizedReport.cautions" :key="item">
                {{ item }}
              </li>
            </ul>
          </section>
        </div>

        <section class="next-session">
          <div class="recovery-time">
            <v-icon icon="mdi-timer-sand" size="22" />
            <span>{{ $t("aiAnalysis.recovery") }}</span>
            <strong>
              {{
                $t("aiAnalysis.recoveryHours", {
                  hours: report.recoveryHours,
                })
              }}
            </strong>
          </div>
          <div>
            <h4>{{ $t("aiAnalysis.nextSession") }}</h4>
            <p>{{ localizedReport.nextSession }}</p>
          </div>
        </section>

        <p class="disclaimer">
          <v-icon icon="mdi-information-outline" size="16" />
          {{ $t("aiAnalysis.disclaimer") }}
        </p>
      </article>

      <div v-else class="analysis-state request-state">
        <v-icon icon="mdi-creation-outline" size="30" />
        <div>
          <strong>{{ $t("aiAnalysis.requestTitle") }}</strong>
          <p>{{ $t("aiAnalysis.requestHint") }}</p>
          <button
            class="request-button"
            type="button"
            :disabled="isWaiting"
            @click="requestAnalysis"
          >
            <v-icon icon="mdi-robot-outline" size="17" />
            {{ $t("aiAnalysis.generate") }}
          </button>
        </div>
      </div>
    </div>
  </CollapsiblePanel>
</template>

<script setup lang="ts">
import CollapsiblePanel from "~/components/ui/CollapsiblePanel.vue";

interface LocalizedTrainingReport {
  title: string;
  summary: string;
  loadAssessment: string;
  strengths: string[];
  cautions: string[];
  nextSession: string;
}

interface TrainingAnalysisReport {
  schemaVersion: 1;
  workoutType:
    | "recovery"
    | "endurance"
    | "tempo"
    | "threshold"
    | "vo2max"
    | "anaerobic"
    | "sprint"
    | "mixed"
    | "unknown";
  loadLevel: "low" | "moderate" | "high" | "very_high";
  recoveryHours: number;
  it: LocalizedTrainingReport;
  en: LocalizedTrainingReport;
}

interface AnalysisResponse {
  status: "not_requested" | "ready" | "generating" | "failed";
  analysis?: TrainingAnalysisReport;
}

const props = withDefaults(
  defineProps<{
    activityId?: number | null;
    initialAnalysis?: unknown;
    initialStatus?: string | null;
  }>(),
  {
    activityId: null,
    initialAnalysis: null,
    initialStatus: null,
  },
);

const { locale, t } = useI18n();
const appToast = useAppToast();
const report = ref<TrainingAnalysisReport | null>(
  normalizeReport(props.initialAnalysis),
);
const requestState = ref<"idle" | "loading" | "generating" | "error">(
  report.value
    ? "idle"
    : props.initialStatus === "generating"
      ? "generating"
      : props.initialStatus === "failed"
        ? "error"
        : "idle",
);
const pollCount = ref(0);
let pollTimer: ReturnType<typeof setTimeout> | null = null;
let requestInFlight = false;
let isUnmounted = false;
let completionNotified = false;
let cautionsNotified = false;
// The server considers a generation stale after 60 seconds. Keep observing a
// little longer so the UI does not report an error before that boundary.
const MAX_STATUS_POLLS = 27;
const STATUS_POLL_INTERVAL_MS = 2_500;

const localizedReport = computed(() => {
  if (!report.value) return null;
  return locale.value.toLowerCase().startsWith("it")
    ? report.value.it
    : report.value.en;
});

const isWaiting = computed(
  () => requestState.value === "loading" || requestState.value === "generating",
);

onMounted(() => {
  if (!report.value && props.initialStatus === "generating") {
    scheduleStatusPoll(0);
  }
});

onBeforeUnmount(() => {
  isUnmounted = true;
  if (pollTimer) clearTimeout(pollTimer);
});

function isLocalizedReport(value: unknown): value is LocalizedTrainingReport {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.title === "string" &&
    typeof item.summary === "string" &&
    typeof item.loadAssessment === "string" &&
    Array.isArray(item.strengths) &&
    item.strengths.every((entry) => typeof entry === "string") &&
    Array.isArray(item.cautions) &&
    item.cautions.every((entry) => typeof entry === "string") &&
    typeof item.nextSession === "string"
  );
}

function normalizeReport(value: unknown): TrainingAnalysisReport | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  const workoutTypes = [
    "recovery",
    "endurance",
    "tempo",
    "threshold",
    "vo2max",
    "anaerobic",
    "sprint",
    "mixed",
    "unknown",
  ];
  const loadLevels = ["low", "moderate", "high", "very_high"];

  if (
    item.schemaVersion !== 1 ||
    !workoutTypes.includes(String(item.workoutType)) ||
    !loadLevels.includes(String(item.loadLevel)) ||
    typeof item.recoveryHours !== "number" ||
    !Number.isInteger(item.recoveryHours) ||
    item.recoveryHours < 0 ||
    item.recoveryHours > 120 ||
    !isLocalizedReport(item.it) ||
    !isLocalizedReport(item.en)
  ) {
    return null;
  }

  return value as TrainingAnalysisReport;
}

async function requestAnalysis() {
  if (requestInFlight || isWaiting.value) return;

  if (pollTimer) {
    clearTimeout(pollTimer);
    pollTimer = null;
  }

  requestInFlight = true;
  pollCount.value = 0;
  requestState.value = "loading";
  appToast.dismiss("activity-ai-analysis-failed");

  try {
    const response = await $fetch<AnalysisResponse>(
      "/api/activities/ai-analysis",
      {
        method: "POST",
        body:
          props.activityId == null ? {} : { activityId: props.activityId },
      },
    );
    handleAnalysisResponse(response);
  } catch {
    showAnalysisError();
  } finally {
    requestInFlight = false;
  }
}

async function pollAnalysisStatus() {
  if (requestInFlight) return;
  requestInFlight = true;

  try {
    const response = await $fetch<AnalysisResponse>(
      "/api/activities/ai-analysis",
      {
        query:
          props.activityId == null
            ? undefined
            : { activityId: props.activityId },
      },
    );
    handleAnalysisResponse(response);
  } catch {
    showAnalysisError();
  } finally {
    requestInFlight = false;
  }
}

function handleAnalysisResponse(response: AnalysisResponse) {
  if (isUnmounted) return;
  const analysis = normalizeReport(response.analysis);

  if (response.status === "ready" && analysis) {
    report.value = analysis;
    requestState.value = "idle";
    pollCount.value = 0;
    if (!completionNotified) {
      appToast.success(t("notifications.aiAnalysisReady"), {
        toastId: "activity-ai-analysis-ready",
      });
      completionNotified = true;
    }

    const localizedAnalysis = locale.value.toLowerCase().startsWith("it")
      ? analysis.it
      : analysis.en;
    if (localizedAnalysis.cautions.length && !cautionsNotified) {
      appToast.warning(t("notifications.aiCautions"), {
        toastId: "activity-ai-analysis-cautions",
      });
      cautionsNotified = true;
    }
    return;
  }

  if (response.status === "generating") {
    requestState.value = "generating";
    scheduleStatusPoll();
    return;
  }

  if (response.status === "not_requested") {
    requestState.value = "idle";
    pollCount.value = 0;
    return;
  }

  showAnalysisError();
}

function scheduleStatusPoll(delay = STATUS_POLL_INTERVAL_MS) {
  if (isUnmounted) return;
  if (pollTimer) clearTimeout(pollTimer);
  if (pollCount.value >= MAX_STATUS_POLLS) {
    showAnalysisError();
    return;
  }

  pollCount.value += 1;
  pollTimer = setTimeout(() => {
    pollTimer = null;
    void pollAnalysisStatus();
  }, delay);
}

function showAnalysisError() {
  if (pollTimer) {
    clearTimeout(pollTimer);
    pollTimer = null;
  }
  if (isUnmounted) return;
  requestState.value = "error";
  appToast.error(null, t("notifications.aiAnalysisFailed"), {
    toastId: "activity-ai-analysis-failed",
  });
}

function retry() {
  void requestAnalysis();
}
</script>

<style scoped>
.analysis-content {
  min-height: 112px;
}

.analysis-state {
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 112px;
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 12px;
  color: var(--text);
  background: var(--bg);
}

.analysis-state strong,
.analysis-state p {
  display: block;
}

.analysis-state p {
  margin: 4px 0 0;
  color: var(--text-muted);
  font-size: 13px;
}

.error-state > .v-icon {
  color: #ef4444;
}

.retry-button,
.request-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  background: var(--surface);
  font-weight: 700;
  cursor: pointer;
}

.request-state > .v-icon {
  color: var(--accent-strong);
}

.request-button {
  color: #fff;
  border-color: var(--accent);
  background: var(--accent);
}

.request-button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.report-header,
.report-badges,
.next-session,
.recovery-time,
.disclaimer {
  display: flex;
}

.report-header {
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.report-kicker {
  margin: 0 0 4px;
  color: var(--accent-strong);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.report h3 {
  margin: 0;
  color: var(--text);
  font-size: clamp(19px, 2.4vw, 25px);
  line-height: 1.25;
}

.report h4 {
  margin: 0 0 8px;
  color: var(--text);
  font-size: 14px;
}

.report-badges {
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.badge {
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: 999px;
  color: var(--text);
  background: var(--bg);
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
}

.workout-badge,
.load-low {
  color: var(--accent-strong);
  border-color: var(--accent);
  background: var(--accent-soft, rgba(34, 197, 94, 0.1));
}

.load-moderate {
  color: #a16207;
  border-color: rgba(234, 179, 8, 0.4);
  background: rgba(234, 179, 8, 0.1);
}

.load-high,
.load-very_high {
  color: #dc2626;
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.09);
}

.summary {
  margin: 20px 0;
  color: var(--text);
  font-size: 15px;
  line-height: 1.7;
}

.assessment-block,
.insight-card,
.next-session {
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg);
}

.assessment-block {
  padding: 16px;
}

.assessment-block p,
.next-session p {
  margin: 0;
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.65;
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.insight-card {
  padding: 16px;
}

.insight-card h4 {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--accent-strong);
}

.caution-card h4 {
  color: #d97706;
}

.insight-card ul {
  margin: 0;
  padding-left: 18px;
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.6;
}

.insight-card li + li {
  margin-top: 6px;
}

.next-session {
  align-items: center;
  gap: 22px;
  margin-top: 12px;
  padding: 16px;
}

.recovery-time {
  align-items: center;
  flex: 0 0 auto;
  gap: 8px;
  min-width: 180px;
  color: var(--accent-strong);
}

.recovery-time span {
  color: var(--text-muted);
  font-size: 12px;
}

.recovery-time strong {
  color: var(--text);
  font-family: var(--mono, monospace);
  font-size: 15px;
}

.disclaimer {
  align-items: flex-start;
  gap: 6px;
  margin: 14px 0 0;
  color: var(--text-muted);
  font-size: 11px;
  line-height: 1.5;
}

.disclaimer .v-icon {
  margin-top: 1px;
  flex: 0 0 auto;
}

@media (max-width: 700px) {
  .report-header,
  .next-session {
    align-items: stretch;
    flex-direction: column;
  }

  .report-badges {
    justify-content: flex-start;
  }

  .insights-grid {
    grid-template-columns: 1fr;
  }

  .recovery-time {
    min-width: 0;
  }
}
</style>
