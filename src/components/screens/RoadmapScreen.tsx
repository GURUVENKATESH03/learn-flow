import React, { useState } from 'react';
import { Roadmap, RoadmapMilestone } from '../../types';
import {
  Compass,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Award,
  Edit3,
  Trash2,
  Save,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ConfirmModal } from '../modals/ConfirmModal';

interface RoadmapScreenProps {
  roadmap: Roadmap | null;
  onUpdateRoadmap: (updated: Roadmap) => void;
  onDeleteRoadmap?: () => void;
  onShowToast?: (message: string, type: 'success' | 'error' | 'info', title?: string) => void;
}

// Client-side curriculum synthesis fallback ensures roadmaps generate as per the exact title even on static hosts (e.g., Vercel) or when offline
const generateFallbackCurriculum = (
  topic: string,
  weeksStr: string
): { title: string; milestones: RoadmapMilestone[] } => {
  const totalWeeks = parseInt(weeksStr, 10) || 8;
  const w1 = Math.max(1, Math.round(totalWeeks * 0.25));
  const w2 = Math.max(2, Math.round(totalWeeks * 0.5));
  const w3 = Math.max(3, Math.round(totalWeeks * 0.75));
  const lower = topic.toLowerCase().trim();
  const cleanTitle = topic.trim();

  if (lower.includes('spring') || lower.includes('java')) {
    return {
      title: `${cleanTitle} Architecture Track`,
      milestones: [
        {
          phase: 'Phase 1',
          title: 'Spring Boot 3 Core & RESTful APIs',
          status: 'In Progress',
          progress: 0,
          weeks: `Weeks 1-${w1}`,
          tasks: [
            'IoC container, Dependency Injection & Spring component life cycle',
            'Building REST API controllers, RequestBody validation & Global Exceptions',
            'Spring Data JPA repository patterns with PostgreSQL and H2 test profiles',
          ],
        },
        {
          phase: 'Phase 2',
          title: 'Security, JWT & Distributed Caching',
          status: 'Upcoming',
          progress: 0,
          weeks: `Weeks ${w1 + 1}-${w2}`,
          tasks: [
            'Spring Security 6 FilterChain & stateless JWT token validation',
            'Redis caching integration with @Cacheable & custom TTL serializers',
            'Unit and integration testing using MockMvc and Testcontainers',
          ],
        },
        {
          phase: 'Phase 3',
          title: 'Microservices & Event Streaming with Kafka',
          status: 'Upcoming',
          progress: 0,
          weeks: `Weeks ${w2 + 1}-${w3}`,
          tasks: [
            'Event-driven services with Apache Kafka producers and consumer groups',
            'Resilience4j circuit breakers, retry mechanisms & distributed rate limiting',
            'Spring Cloud Gateway, OpenTelemetry metrics and distributed tracing',
          ],
        },
        {
          phase: 'Phase 4',
          title: 'Cloud Native & Production Observability',
          status: 'Upcoming',
          progress: 0,
          weeks: `Weeks ${w3 + 1}-${totalWeeks}`,
          tasks: [
            'GraalVM Native Image compilation & multi-stage Docker containerization',
            'Kubernetes pod manifests, liveness / readiness probes & ConfigMaps',
            'Prometheus Actuator metrics, p99 latency alarms & Grafana dashboards',
          ],
        },
      ],
    };
  }

  if (lower.includes('kafka') || lower.includes('event')) {
    return {
      title: `${cleanTitle} Streaming Track`,
      milestones: [
        {
          phase: 'Phase 1',
          title: 'Broker Architecture & Partitions',
          status: 'In Progress',
          progress: 0,
          weeks: `Weeks 1-${w1}`,
          tasks: [
            'Commit log storage, partition allocation, leadership & replica synchronization',
            'Producer batching, compression (snappy/zstd) and idempotence configurations',
            'Consumer Group offset commit strategies, lag monitoring and rebalances',
          ],
        },
        {
          phase: 'Phase 2',
          title: 'Schema Registry & Delivery Guarantees',
          status: 'Upcoming',
          progress: 0,
          weeks: `Weeks ${w1 + 1}-${w2}`,
          tasks: [
            'Confluent Schema Registry with Avro / Protobuf schema evolution',
            'Exactly-Once Semantics (EOS) using Kafka transactions across topics',
            'Dead letter queue (DLQ) topology and error recovery patterns',
          ],
        },
        {
          phase: 'Phase 3',
          title: 'Kafka Streams & Stateful Processing',
          status: 'Upcoming',
          progress: 0,
          weeks: `Weeks ${w2 + 1}-${w3}`,
          tasks: [
            'KStream / KTable abstractions, windowed joins & changelog state stores',
            'RocksDB local storage tuning and interactive state query endpoints',
            'Real-time stream aggregations, session windows & tumbling analytics',
          ],
        },
        {
          phase: 'Phase 4',
          title: 'Cluster Operations & Resiliency',
          status: 'Upcoming',
          progress: 0,
          weeks: `Weeks ${w3 + 1}-${totalWeeks}`,
          tasks: [
            'KRaft metadata mode deployment with multi-broker high availability',
            'Prometheus JMX metrics, Burrow lag detection and alerting',
            'MirrorMaker 2 cross-datacenter disaster recovery replication',
          ],
        },
      ],
    };
  }

  if (lower.includes('docker') || lower.includes('k8s') || lower.includes('kubernetes')) {
    return {
      title: `${cleanTitle} Platform Engineering Track`,
      milestones: [
        {
          phase: 'Phase 1',
          title: 'Containerization & Image Optimization',
          status: 'In Progress',
          progress: 0,
          weeks: `Weeks 1-${w1}`,
          tasks: [
            'Multi-stage Dockerfile architecture with rootless distroless base images',
            'Docker Compose local multi-container network orchestration',
            'Container image vulnerability scanning with Trivy and Grype',
          ],
        },
        {
          phase: 'Phase 2',
          title: 'Kubernetes Workloads & Networking',
          status: 'Upcoming',
          progress: 0,
          weeks: `Weeks ${w1 + 1}-${w2}`,
          tasks: [
            'Deployments, ReplicaSets, StatefulSets, Pods & Secrets management',
            'ClusterIP, NodePort, Ingress controllers & cert-manager TLS certificates',
            'PersistentVolumeClaims (PVC), storage classes and dynamic provisioning',
          ],
        },
        {
          phase: 'Phase 3',
          title: 'Helm Charts & GitOps Continuous Delivery',
          status: 'Upcoming',
          progress: 0,
          weeks: `Weeks ${w2 + 1}-${w3}`,
          tasks: [
            'Authoring modular Helm 3 charts with parameterized values.yaml schemas',
            'Automated GitOps synchronization pipelines using ArgoCD / Flux',
            'Canary traffic routing, blue-green deployments and automated rollbacks',
          ],
        },
        {
          phase: 'Phase 4',
          title: 'Observability & Cluster Hardening',
          status: 'Upcoming',
          progress: 0,
          weeks: `Weeks ${w3 + 1}-${totalWeeks}`,
          tasks: [
            'Prometheus Operator, ServiceMonitors and cluster Grafana dashboards',
            'Centralized log aggregation with Vector / FluentBit and Loki',
            'RBAC security hardening, NetworkPolicies and PodSecurityStandards',
          ],
        },
      ],
    };
  }

  // Universal dynamic fallback customized to the exact title
  return {
    title: `${cleanTitle} Professional Track`,
    milestones: [
      {
        phase: 'Phase 1',
        title: `${cleanTitle} Foundations & Core Tooling`,
        status: 'In Progress',
        progress: 0,
        weeks: `Weeks 1-${w1}`,
        tasks: [
          `Setup development environment & essential toolchains for ${cleanTitle}`,
          `Master core architecture, syntax fundamentals & paradigm concepts of ${cleanTitle}`,
          `Build initial "Hello World" proof-of-concept prototype in ${cleanTitle}`,
        ],
      },
      {
        phase: 'Phase 2',
        title: `${cleanTitle} Architecture Patterns & State Flow`,
        status: 'Upcoming',
        progress: 0,
        weeks: `Weeks ${w1 + 1}-${w2}`,
        tasks: [
          `Implement domain models, separation of concerns & state sync for ${cleanTitle}`,
          `Integrate unit test suites & automated integration contracts in ${cleanTitle}`,
          `Resilient error boundaries and data validation pipelines in ${cleanTitle}`,
        ],
      },
      {
        phase: 'Phase 3',
        title: `${cleanTitle} Scalability & Distributed Integration`,
        status: 'Upcoming',
        progress: 0,
        weeks: `Weeks ${w2 + 1}-${w3}`,
        tasks: [
          `High-throughput caching layer & query performance tuning for ${cleanTitle}`,
          `Asynchronous event streaming & message queue decoupling in ${cleanTitle}`,
          `Security hardening, authentication tokens, and access roles for ${cleanTitle}`,
        ],
      },
      {
        phase: 'Phase 4',
        title: `${cleanTitle} Production Cloud Deployment & Telemetry`,
        status: 'Upcoming',
        progress: 0,
        weeks: `Weeks ${w3 + 1}-${totalWeeks}`,
        tasks: [
          `Docker containerization & multi-stage deployment build pipeline for ${cleanTitle}`,
          `Real-time observability, health telemetry & structured logging in ${cleanTitle}`,
          `Perform load testing benchmarks and deploy ${cleanTitle} to live cloud cluster`,
        ],
      },
    ],
  };
};

export const RoadmapScreen: React.FC<RoadmapScreenProps> = ({
  roadmap,
  onUpdateRoadmap,
  onDeleteRoadmap,
  onShowToast,
}) => {
  const [expandedMilestone, setExpandedMilestone] = useState<number | null>(1);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editRoleTrack, setEditRoleTrack] = useState('');
  const [targetTopic, setTargetTopic] = useState('');
  const [timeframe, setTimeframe] = useState('8 weeks');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    const topic = targetTopic.trim();
    if (!topic) {
      onShowToast?.('Please enter a learning topic or track name.', 'error', 'Missing Topic');
      return;
    }

    setIsGenerating(true);
    try {
      let curriculumData: { title: string; milestones: RoadmapMilestone[] } | null = null;

      try {
        const res = await fetch('/api/ai/generate-roadmap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic, timeframe }),
        });

        if (res.ok) {
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const data = await res.json();
            if (data && Array.isArray(data.milestones) && data.milestones.length > 0) {
              curriculumData = data;
            }
          }
        }
      } catch (networkErr) {
        console.warn('Backend API route offline or static host, using client-side synthesis:', networkErr);
      }

      // Guarantee that generation succeeds even on static hosting (e.g. Vercel)
      if (!curriculumData || !curriculumData.milestones || curriculumData.milestones.length === 0) {
        curriculumData = generateFallbackCurriculum(topic, timeframe);
      }

      const totalWeeks = parseInt(timeframe, 10) || 8;
      // Newly created roadmap always begins fresh with 0% progress and 0% per milestone
      const freshMilestones: RoadmapMilestone[] = (curriculumData.milestones || []).map((m, idx) => ({
        ...m,
        progress: 0,
        status: idx === 0 ? ('In Progress' as const) : ('Upcoming' as const),
      }));

      const newRoadmap: Roadmap = {
        id: `rm-${Date.now()}`,
        title: curriculumData.title || `${topic} Mastery Track`,
        roleTrack: topic,
        currentWeek: 1,
        totalWeeks,
        overallProgress: 0,
        milestones: freshMilestones,
      };

      onUpdateRoadmap(newRoadmap);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
      onShowToast?.(`Generated "${newRoadmap.title}" starting fresh at 0% progress!`, 'success', 'Roadmap Created');
      setShowGenerateModal(false);
      setTargetTopic('');
    } catch (err: any) {
      console.error('Roadmap generation failed:', err);
      onShowToast?.('Failed to create roadmap. Please try again.', 'error', 'Error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full space-y-4 pb-6 animate-in fade-in duration-200">
      {/* Title & AI Generator Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Active Roadmap</h1>
          <p className="text-xs text-slate-500">Personalized milestone progression</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowGenerateModal(true)}
            className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-indigo-500/20"
          >
            <Sparkles className="w-4 h-4" /> AI Generator
          </button>
        </div>
      </div>

      {!roadmap || !roadmap.milestones || roadmap.milestones.length === 0 ? (
        <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-dashed border-slate-200 dark:border-slate-700 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Compass className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No Active Learning Roadmap
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-1 leading-relaxed">
              Tell Gemini what career path or technology you want to learn. We will build a structured 4-phase curriculum for you.
            </p>
          </div>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition inline-flex items-center gap-2 shadow-md shadow-indigo-500/20"
          >
            <Sparkles className="w-4 h-4" /> Generate Learning Roadmap
          </button>
        </div>
      ) : (
        <>
          {/* Main Roadmap Banner */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-indigo-50/90 via-purple-50/50 to-slate-50 dark:from-slate-800/80 dark:via-indigo-950/30 dark:to-slate-900 border border-indigo-100/80 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {roadmap.roleTrack}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Week {roadmap.currentWeek} of {roadmap.totalWeeks}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEditTitle(roadmap.title);
                    setEditRoleTrack(roadmap.roleTrack);
                    setShowEditModal(true);
                  }}
                  className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold transition flex items-center gap-1"
                  title="Edit Roadmap Title & Track"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
                {onDeleteRoadmap && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-2 py-1 rounded-lg border border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                    title="Delete Roadmap"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                )}
              </div>
            </div>

            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              {roadmap.title}
            </h2>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-400 text-[11px]">Track Completion</span>
                <span className="text-indigo-600 dark:text-indigo-400">{roadmap.overallProgress}%</span>
              </div>
              <div className="w-full bg-slate-200/80 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${roadmap.overallProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Milestones Flow (Horizontal timeline indicators) */}
          <div className="grid grid-cols-4 gap-1 p-2 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-800">
            {roadmap.milestones.map((m, idx) => (
              <div key={idx} className="text-center p-1">
                <div
                  className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center text-[10px] font-bold mb-1 ${
                    m.status === 'Completed'
                      ? 'bg-emerald-500 text-white'
                      : m.status === 'In Progress'
                      ? 'bg-indigo-600 text-white ring-2 ring-indigo-200 dark:ring-indigo-800'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                  }`}
                >
                  {idx + 1}
                </div>
                <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate">
                  {m.title}
                </p>
                <span
                  className={`text-[9px] font-semibold ${
                    m.status === 'Completed'
                      ? 'text-emerald-500'
                      : m.status === 'In Progress'
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-400'
                  }`}
                >
                  {m.status}
                </span>
              </div>
            ))}
          </div>

          {/* Milestones Details List */}
          <div className="space-y-2.5">
        {roadmap.milestones.map((milestone, idx) => {
          const isExpanded = expandedMilestone === idx;

          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all overflow-hidden ${
                milestone.status === 'In Progress'
                  ? 'bg-white dark:bg-slate-800/90 border-indigo-200 dark:border-indigo-800/80 shadow-xs ring-1 ring-indigo-500/20'
                  : 'bg-white dark:bg-slate-800/60 border-slate-100 dark:border-slate-800'
              }`}
            >
              {/* Header */}
              <button
                onClick={() => setExpandedMilestone(isExpanded ? null : idx)}
                className="w-full p-4 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      milestone.status === 'Completed'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600'
                        : milestone.status === 'In Progress'
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                    }`}
                  >
                    {milestone.status === 'Completed' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <span className="text-xs font-bold">{idx + 1}</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {milestone.phase} • {milestone.weeks}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {milestone.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      milestone.status === 'Completed'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                        : milestone.status === 'In Progress'
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                    }`}
                  >
                    {milestone.status}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Expanded Subtasks */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-700/60 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Syllabus Checkpoints
                  </span>
                  <div className="space-y-1.5">
                    {milestone.tasks.map((task, tIdx) => (
                      <div
                        key={tIdx}
                        className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300"
                      >
                        {milestone.status === 'Completed' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />
                        )}
                        <span>{task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  )}

      {/* AI Roadmap Generator Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Generate AI Roadmap
                </h3>
                <p className="text-xs text-slate-500">Gemini tailored 4-phase curriculum</p>
              </div>
            </div>

            <form onSubmit={handleGenerateRoadmap} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Topic / Career Path
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Systems & Kafka"
                  value={targetTopic}
                  onChange={(e) => setTargetTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Duration
                </label>
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="4 weeks">4 Weeks (Intensive)</option>
                  <option value="8 weeks">8 Weeks (Standard)</option>
                  <option value="12 weeks">12 Weeks (Comprehensive)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  disabled={isGenerating}
                  className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isGenerating ? (
                    'Generating...'
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" /> Generate
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Roadmap Modal */}
      {showEditModal && roadmap && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Edit Active Roadmap</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const updated: Roadmap = {
                  ...roadmap,
                  title: editTitle.trim() || roadmap.title,
                  roleTrack: editRoleTrack.trim() || roadmap.roleTrack,
                };
                onUpdateRoadmap(updated);
                setShowEditModal(false);
                onShowToast?.(`Roadmap updated successfully!`, 'success', 'Saved');
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Roadmap Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="e.g., Spring Boot & Microservices Track"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Track / Specialty Focus
                </label>
                <input
                  type="text"
                  value={editRoleTrack}
                  onChange={(e) => setEditRoleTrack(e.target.value)}
                  placeholder="e.g., Backend Engineering"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Native-styled in-app Delete Confirmation Modal */}
      {roadmap && (
        <ConfirmModal
          isOpen={showDeleteConfirm}
          title="Delete Learning Roadmap"
          message={`Are you sure you want to delete "${roadmap.title}"? You can generate a new personalized learning roadmap anytime.`}
          confirmLabel="Delete Roadmap"
          cancelLabel="Cancel"
          variant="danger"
          onConfirm={() => {
            setShowDeleteConfirm(false);
            onDeleteRoadmap?.();
          }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
};
