/**
 * VIGIL — AGENTIC INSTITUTION INTELLIGENCE & COORDINATION PLATFORM
 * Interactive Demonstration Engine & Visualizer
 * SIH 2026 | PS 26264 | Team Clutch Crew (197488)
 */

document.addEventListener('DOMContentLoaded', () => {

  // =========================================================================
  // 1. Theme Management (Dark / Light)
  // =========================================================================
  const themeToggle = document.getElementById('theme-toggle');
  const htmlRoot = document.documentElement;

  const savedTheme = localStorage.getItem('vigil_theme') || 'dark';
  htmlRoot.setAttribute('data-theme', savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = htmlRoot.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      htmlRoot.setAttribute('data-theme', next);
      localStorage.setItem('vigil_theme', next);
      showToast(`Switched to ${next.toUpperCase()} theme`);
    });
  }

  // =========================================================================
  // 2. Toast Notification Helper
  // =========================================================================
  function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <span style="color: var(--accent-astra); font-weight: bold;">◆</span>
      <span>${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  // =========================================================================
  // 3. Dynamic Hero Canvas (VIGIL Institution Intelligence Network)
  //    Particle Meanings:
  //    - Blue: Institution profiles (#2563eb)
  //    - Teal: Verified relationships (#14b8a6)
  //    - Amber: Potential complaint overlaps (#f59e0b)
  // =========================================================================
  const canvas = document.getElementById('hero-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = canvas.width = canvas.parentElement.clientWidth;
    let height = canvas.height = canvas.parentElement.clientHeight;

    window.addEventListener('resize', () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    });

    let particleCount = 85;
    let particles = [];
    let canvasMode = 'dense'; // 'dense' = full institution graph, 'neural' = active-signal view
    let mouse = { x: width / 2, y: height / 2, active: false };

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    });

    canvas.addEventListener('mouseleave', () => {
      mouse.active = false;
    });

    function initParticles() {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        const rand = Math.random();
        // Blue: Institution profiles (50%), Teal: Verified relationships (25%), Amber: Potential overlaps (25%)
        const color = rand < 0.5 ? '#2563eb' : (rand < 0.75 ? '#14b8a6' : '#f59e0b');
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.75,
          vy: (Math.random() - 0.5) * 0.75,
          radius: Math.random() * 2.2 + 1.2,
          color: color,
          pulse: Math.random() * Math.PI,
          pulseSpeed: 0.02 + Math.random() * 0.03
        });
      }
    }

    initParticles();

    function draw() {
      ctx.clearRect(0, 0, width, height);

      const grad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width * 0.6);
      grad.addColorStop(0, 'rgba(37, 99, 235, 0.08)');
      grad.addColorStop(1, 'rgba(8, 8, 10, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Connect institution nodes (edges = shared complaints / overlap links)
      const maxDist = canvasMode === 'dense' ? 125 : 175;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * (canvasMode === 'neural' ? 0.35 : 0.18);
            ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        if (mouse.active) {
          const mdx = mouse.x - p.x;
          const mdy = mouse.y - p.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 140) {
            p.x += mdx * 0.02;
            p.y += mdy * 0.02;
          }
        }

        p.pulse += p.pulseSpeed;
        const radius = p.radius + Math.sin(p.pulse) * 0.5;

        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, radius), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = canvasMode === 'neural' ? 12 : 5;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      requestAnimationFrame(draw);
    }

    draw();

    const densityBtn = document.getElementById('canvas-density-btn');
    const energyBtn = document.getElementById('canvas-energy-btn');

    if (densityBtn && energyBtn) {
      densityBtn.addEventListener('click', () => {
        canvasMode = 'dense';
        particleCount = 95;
        densityBtn.classList.add('active');
        energyBtn.classList.remove('active');
        initParticles();
      });

      energyBtn.addEventListener('click', () => {
        canvasMode = 'neural';
        particleCount = 55;
        energyBtn.classList.add('active');
        densityBtn.classList.remove('active');
        initParticles();
      });
    }
  }

  // =========================================================================
  // 4. Interactive Agentic Sandbox Simulation (Section 10)
  //    (Frontend demonstration of VIGIL's 4 core agent pipelines)
  // =========================================================================
  const scenarios = {
    dna: {
      title: "Task: Institution DNA Matching — Duplicate Case Across RB & PGRC",
      steps: [
        {
          badge: "STAGE 1: EXACT MATCH LOOKUP",
          title: "AICTE Permanent ID Index Lookup",
          detail: "Checks incoming complaint metadata against the canonical AICTE Permanent ID index for an exact identifier match.",
          logs: [
            { type: "info", text: "[INTAKE-AGENT] Ingested complaint RB-2026-00142 — raw institution: 'Sri Venkateswara Coll. of Engg'" },
            { type: "tool", text: "[STAGE 1: EXACT] lookup_aicte_id(id=NULL) -> 0 matches found (No permanent ID provided in intake form)" },
            { type: "thought", text: "[ORCHESTRATOR] Exact match unavailable. Escalating to Stage 2: Fuzzy & Phonetic Matching." }
          ]
        },
        {
          badge: "STAGE 2: FUZZY + PHONETIC MATCH",
          title: "RapidFuzz Token Scoring + Double Metaphone",
          detail: "Strips legal noise tokens ('coll', 'engg', 'pvt') and performs token-sort scoring and Double Metaphone phonetic matching.",
          logs: [
            { type: "tool", text: "[STAGE 2: FUZZY] normalize_tokens('Sri Venkateswara Coll. of Engg') -> 'sri venkateswara engg'" },
            { type: "info", text: "[FUZZY] token_sort_ratio=88.2, partial_ratio=91.4 vs candidate 'Sri Venkateswara College of Engineering'" },
            { type: "info", text: "[PHONETIC] Double Metaphone: SRFNKTSFR == SRFNKTSFR (Exact Phonetic Alignment)" },
            { type: "success", text: "[SCORE] Composite Stage 2 score = 90.5/100 -> Candidate passes generation threshold (>75)" }
          ]
        },
        {
          badge: "STAGE 3: SEMANTIC VECTOR MATCH",
          title: "Sentence-Transformers 384-dim + pgvector",
          detail: "Encodes combined institution name and address via all-MiniLM-L6-v2 and queries PostgreSQL IVFFlat index.",
          logs: [
            { type: "tool", text: "[STAGE 3: VECTOR] embedding = encode_minilm('Sri Venkateswara Coll. of Engg, Chennai, Tamil Nadu')" },
            { type: "command", text: "$ SELECT id, 1 - (embedding <=> $query) AS score FROM institutions ORDER BY embedding <=> $query LIMIT 3;" },
            { type: "success", text: "[pgvector] Top match score = 0.84 (> 0.80 threshold) — Record: inst-aicte-1-9820341" },
            { type: "thought", text: "[ORCHESTRATOR] Combined confidence (0.84 - 0.90) is in ambiguous boundary zone (0.70-0.92). Invoking Stage 4 LLM Judge." }
          ]
        },
        {
          badge: "STAGE 4: LLM JUDGE ARBITRATION",
          title: "Groq Llama LLM Judge Structured Verdict",
          detail: "Arbitrates candidate ambiguity using structured JSON reasoning and verifies against human review thresholds.",
          logs: [
            { type: "tool", text: "[STAGE 4: LLM JUDGE] invoke_judge(incoming_record, candidate_record, model='llama-3.1-70b')" },
            { type: "info", text: "[LLM REASONING] 'Coll. of Engg' is an abbreviation of 'College of Engineering'; both share Chennai region and address overlap." },
            { type: "success", text: "[VERDICT] { is_same_institution: true, confidence: 0.93 } -> AUTO-LINK VERIFIED (Confidence > 0.92)" },
            { type: "success", text: "[AUDIT] SHA-256 hash committed to immutable audit trail. RB-2026-00142 canonicalized to inst-aicte-1-9820341." }
          ]
        }
      ],
      telemetry: { compute: "384-dim embedding", tools: "4 matching stages", verify: "Auto-Linked (0.93)", time: "640 ms" },
      diffText: `-- VIGIL Match Provenance & Audit Log Entry
INSERT INTO institution_match_log (
  complaint_id,
  matched_institution_id,
  match_method,
  confidence_score,
  llm_reasoning,
  human_verified,
  sha256_hash
) VALUES (
  'RB-2026-00142',
  'inst-aicte-1-9820341',
  'HYBRID_STAGE4_LLM_JUDGE',
  0.93,
  'SVCE abbreviation + Chennai region + address overlap confirm identity with PGRC-2026-00089.',
  false,
  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
);`
    },

    overlap: {
      title: "Task: Cross-Bureau Overlap Detection — RB & PGRC War Room Formation",
      steps: [
        {
          badge: "STEP 1: TEMPORAL GRAPH TRAVERSAL",
          title: "Property Graph Node & Edge Lookup",
          detail: "Institution nodes are queried across Regulation Bureau (RB) and Public Grievance Redressal Cell (PGRC) active records.",
          logs: [
            { type: "info", text: "[GRAPH-ENGINE] Querying temporal property graph for institution node inst-aicte-1-9820341" },
            { type: "tool", text: "[GRAPH] traverse_edges(institution_id, window_days=30, status=['UNDER_PROCESS', 'PENDING'])" },
            { type: "thought", text: "[EVALUATION] Edge RB-2026-00142 (Regulatory/Malpractice) and PGRC-2026-00089 (Fee Refund) co-occur within 9 days." }
          ]
        },
        {
          badge: "STEP 2: OVERLAP SIGNAL DETECTION",
          title: "Jurisdictional Precedence Heuristics",
          detail: "Flags active cases across independent bureaus against the same institution and computes overlap confidence.",
          logs: [
            { type: "info", text: "[OVERLAP-DETECTOR] Comparing Bureau RB (Status: UNDER_PROCESS) vs Bureau PGRC (Status: PENDING)" },
            { type: "success", text: "[FLAGGED] Cross-Bureau Overlap Detected! Confidence: 0.97 (Same institution, active investigation window)" }
          ]
        },
        {
          badge: "STEP 3: WAR ROOM PROPOSAL",
          title: "Shared Coordination Workspace Generation",
          detail: "Auto-generates a War Room linking case files, cross-bureau histories, and proposes a lead bureau.",
          logs: [
            { type: "tool", text: "[TOOL] create_war_room(institution_id, cases=['RB-2026-00142', 'PGRC-2026-00089'])" },
            { type: "thought", text: "[RECOMMENDATION] RB complaint involves regulatory mandate — propose RB as lead coordinator, PGRC as contributor." },
            { type: "success", text: "[WAR ROOM] Proposed WR-2026-0337. Status: AWAITING_HUMAN_CONFIRMATION (Decision-support only)." }
          ]
        },
        {
          badge: "STEP 4: REAL-TIME NOTIFICATION",
          title: "Socket.io Alert to Bureau Nodal Officers",
          detail: "Dispatches coordination notifications to designated officers across both bureaus.",
          logs: [
            { type: "tool", text: "[NOTIFY] socket_emit('overlap_detected', payload={war_room_id: 'WR-2026-0337', bureaus: ['RB', 'PGRC']})" },
            { type: "success", text: "[DISPATCH] Real-time coordination alert delivered to RB & PGRC dashboards (Latency: 120ms)" },
            { type: "info", text: "[SAFEGUARD] Final decision to merge or coordinate cases remains 100% with AICTE officials." }
          ]
        }
      ],
      telemetry: { compute: "30-day temporal window", tools: "Graph traversal", verify: "War Room Proposed", time: "410 ms" },
      diffText: `{
  "institution_id": "inst-aicte-1-9820341",
  "overlap_detected": true,
  "cases": ["RB-2026-00142", "PGRC-2026-00089"],
  "days_apart": 9,
  "overlap_confidence": 0.97,
  "recommended_lead_bureau": "Regulation Bureau (RB)",
  "war_room_id": "WR-2026-0337",
  "status": "AWAITING_HUMAN_CONFIRMATION",
  "human_approval_required": true
}`
    },

    risk: {
      title: "Task: Institution Risk DNA — Predictive Outbreak Forecast",
      steps: [
        {
          badge: "STEP 1: FEATURE AGGREGATION",
          title: "Multi-Signal Feature Vector Assembly",
          detail: "Aggregates 60-day complaint frequency, severity, sentiment trends, overlap count, and resolution delays.",
          logs: [
            { type: "info", text: "[RISK-DNA] Assembling feature vector for institution inst-aicte-1-9820341 (60-day observation window)" },
            { type: "tool", text: "[FEATURES] frequency=4/60d, severity_avg=0.78, sentiment=-0.62, overlaps=1, resolution_delay=14d (SLA benchmark: 7d)" }
          ]
        },
        {
          badge: "STEP 2: RISK SCORE COMPUTATION",
          title: "Weighted Risk DNA Model Calculation",
          detail: "Combines normalized multi-source signals into an advisory institutional risk score (0–100).",
          logs: [
            { type: "tool", text: "[MODEL] compute_weighted_risk(features) -> score: 81.0" },
            { type: "success", text: "[CLASSIFICATION] Risk Band: RED (Threshold > 75). Advisory indicator only." }
          ]
        },
        {
          badge: "STEP 3: PROPHET TIME-SERIES FORECAST",
          title: "30-Day Complaint Volume Projection",
          detail: "Runs Prophet time-series model to forecast trend and distinguish systemic spikes from transient anomalies.",
          logs: [
            { type: "command", text: "$ python forecast_prophet.py --inst inst-aicte-1-9820341 --horizon 30" },
            { type: "info", text: "[FORECAST] Projected incoming complaints: +50% acceleration over trailing 30-day baseline." }
          ]
        },
        {
          badge: "STEP 4: PREEMPTIVE BRIEFING",
          title: "Officer Briefing Report Generation",
          detail: "Generates an advisory Preemptive Intervention Report routed to the supervisory review queue.",
          logs: [
            { type: "tool", text: "[REPORT] generate_advisory_briefing(template='preemptive_intervention', report_id='PIR-2026-0094')" },
            { type: "success", text: "[BRIEFING] Report PIR-2026-0094 queued for Regulation Bureau supervisory review." },
            { type: "info", text: "[GOVERNANCE] Scores are advisory decision-support and do not imply confirmed regulatory violations." }
          ]
        }
      ],
      telemetry: { compute: "5 feature signals", tools: "Prophet forecast", verify: "RED Band (81/100)", time: "1,150 ms" },
      diffText: `{
  "institution_id": "inst-aicte-1-9820341",
  "risk_score": 81.0,
  "risk_band": "RED",
  "is_advisory": true,
  "signals": {
    "complaint_frequency_60d": 4,
    "avg_severity": 0.78,
    "sentiment_trend": -0.62,
    "cross_bureau_overlaps": 1,
    "avg_resolution_delay_days": 14
  },
  "prophet_30d_forecast": "+50% projected inflow",
  "report_id": "PIR-2026-0094"
}`
    },

    copilot: {
      title: "Task: AI Complaint Co-Pilot — Natural Language Query",
      steps: [
        {
          badge: "STEP 1: INTENT & ENTITY PARSING",
          title: "LangChain Agent Intent Extraction",
          detail: "Parses the officer's natural-language query into structured filters and jurisdictional constraints.",
          logs: [
            { type: "info", text: "[CO-PILOT] Officer query: 'Show RED-risk institutions in Tamil Nadu with unresolved PGRC cases older than 15 days'" },
            { type: "tool", text: "[INTENT] parse_intent(query) -> {region: 'Tamil Nadu', risk: 'RED', bureau: 'PGRC', age_gt_days: 15}" }
          ]
        },
        {
          badge: "STEP 2: AUTHORIZED RAG RETRIEVAL",
          title: "Vector Store Context & Graph Retrieval",
          detail: "Retrieves matching canonical institution profiles and complaints within the officer's authorized role scope.",
          logs: [
            { type: "tool", text: "[RAG] vector_retrieve(filters, role='AICTE_OFFICER', top_k=15)" },
            { type: "info", text: "[RETRIEVAL] 7 matching institution records retrieved with full metadata provenance." }
          ]
        },
        {
          badge: "STEP 3: PARAMETERIZED QUERY EXECUTION",
          title: "PostgreSQL & Property Graph Query",
          detail: "Executes parameterized SQL and graph query against pgvector and property graph nodes.",
          logs: [
            { type: "command", text: "$ SELECT * FROM institutions i JOIN complaints c ON ... WHERE i.risk_band='RED' AND c.bureau='PGRC';" },
            { type: "success", text: "[QUERY] 7 records matched in 38ms with verified index scans." }
          ]
        },
        {
          badge: "STEP 4: RESPONSE & MEMO DRAFTING",
          title: "Grounded Answer + Draft Coordination Memo",
          detail: "Synthesizes an officer response and prepares an optional draft coordination memo requiring officer review.",
          logs: [
            { type: "success", text: "[CO-PILOT] 'Found 7 RED-risk institutions in Tamil Nadu with PGRC cases open >15 days. Top: SVCE Chennai (risk 81)...'" },
            { type: "tool", text: "[MEMO] Draft coordination memo prepared. Status: PENDING_HUMAN_APPROVAL." },
            { type: "info", text: "[SAFEGUARD] AI-drafted memos require officer sign-off before official dispatch." }
          ]
        }
      ],
      telemetry: { compute: "RAG retrieval k=15", tools: "SQL + Vector RAG", verify: "7 Records Located", time: "530 ms" },
      diffText: `COORDINATION MEMO — DRAFT (Pending Officer Sign-off)
To: Regional Coordinator, AICTE Southern Regional Office (Chennai)
From: Regulation Bureau / PGRC Coordination Desk
Subject: RED-Risk Institutions with Open Cases Pending >15 Days

VIGIL decision-support has identified 7 institutions in Tamil Nadu
categorized in the RED risk band with active grievances open >15 days.
Top priority: SVCE Chennai (Risk Score: 81, active overlapping cases).

Recommended Action: Expedited joint review and status synchronization.
Note: This memo is AI-synthesized and requires authorized officer signature.`
    }
  };

  let currentScenarioKey = 'dna';
  let isSimulating = false;
  let simulationTimer = null;
  let currentStepIndex = 0;

  const scenarioTabs = document.querySelectorAll('.scenario-tab');
  const taskTitle = document.getElementById('sandbox-task-title');
  const stepsList = document.getElementById('steps-list');
  const terminalOutput = document.getElementById('terminal-output');
  const playBtn = document.getElementById('sandbox-play-btn');
  const playText = document.getElementById('sandbox-play-text');
  const resetBtn = document.getElementById('sandbox-reset-btn');
  const statusBadge = document.getElementById('sandbox-status-text');
  const stepCounter = document.getElementById('step-counter');

  const telemCompute = document.getElementById('telem-compute');
  const telemTools = document.getElementById('telem-tools');
  const telemVerify = document.getElementById('telem-verify');
  const telemTime = document.getElementById('telem-time');

  function renderScenario(key) {
    const sc = scenarios[key];
    if (!sc) return;

    currentScenarioKey = key;
    currentStepIndex = 0;
    if (taskTitle) taskTitle.textContent = sc.title;
    if (stepCounter) stepCounter.textContent = `0 / ${sc.steps.length} Steps`;
    if (statusBadge) statusBadge.textContent = "Illustrative workflow simulation";

    if (telemCompute) telemCompute.textContent = sc.telemetry.compute;
    if (telemTools) telemTools.textContent = sc.telemetry.tools;
    if (telemVerify) telemVerify.textContent = "Awaiting execution";
    if (telemTime) telemTime.textContent = "0 ms";

    if (stepsList) {
      stepsList.innerHTML = '';
      sc.steps.forEach((step, idx) => {
        const card = document.createElement('div');
        card.className = 'step-card';
        card.id = `step-card-${idx}`;
        card.innerHTML = `
          <div class="step-card-header">
            <span class="step-badge">${step.badge}</span>
            <span class="step-status">Pending</span>
          </div>
          <div class="step-card-title">${step.title}</div>
          <div class="step-card-detail">${step.detail}</div>
        `;
        stepsList.appendChild(card);
      });
    }

    if (terminalOutput) {
      terminalOutput.innerHTML = `
        <div class="log-line log-info">[VIGIL-SIMULATION] Decision-support agent pipeline initialized.</div>
        <div class="log-line log-info">Mock Environment: AICTE Synthetic Dataset (PS 26264 Sandbox)</div>
        <div class="log-line log-thought">Press "Simulate Execution" to walk through the multi-agent pipeline step-by-step.</div>
      `;
    }
  }

  renderScenario('dna');

  scenarioTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      scenarioTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const key = tab.getAttribute('data-scenario');
      stopSimulation();
      renderScenario(key);
    });
  });

  const termTabConsole = document.getElementById('term-tab-console');
  const termTabDiff = document.getElementById('term-tab-diff');
  const termTabGui = document.getElementById('term-tab-gui');

  let activeTermView = 'console';

  function updateTermView() {
    [termTabConsole, termTabDiff, termTabGui].forEach(t => t && t.classList.remove('active'));
    if (activeTermView === 'console') {
      if (termTabConsole) termTabConsole.classList.add('active');
      executeCurrentStepLogs();
    } else if (activeTermView === 'diff') {
      if (termTabDiff) termTabDiff.classList.add('active');
      if (terminalOutput) {
        terminalOutput.innerHTML = `<pre style="color: #86efac; font-size: 0.8rem; font-family: 'JetBrains Mono', monospace; overflow-x: auto; white-space: pre-wrap;">${scenarios[currentScenarioKey].diffText}</pre>`;
      }
    } else if (activeTermView === 'gui') {
      if (termTabGui) termTabGui.classList.add('active');
      if (terminalOutput) {
        terminalOutput.innerHTML = `
          <div style="background: #111116; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 24px; text-align: center;">
            <div style="font-size: 0.8rem; color: #60a5fa; margin-bottom: 8px; font-weight: 600;">VIGIL TEMPORAL GRAPH PREVIEW</div>
            <div style="border: 1px dashed rgba(255,255,255,0.18); border-radius: 6px; padding: 32px 20px; background: rgba(0,0,0,0.3);">
              <div style="color: #f5f5f7; font-weight: 600; margin-bottom: 8px;">${scenarios[currentScenarioKey].title}</div>
              <div style="display: inline-block; padding: 4px 14px; background: rgba(20, 184, 166, 0.15); border: 1px solid rgba(20, 184, 166, 0.3); border-radius: 9999px; color: #14b8a6; font-size: 0.82rem; font-weight: 550;">
                Verification Status: Decision-Support Queue Updated
              </div>
            </div>
          </div>
        `;
      }
    }
  }

  if (termTabConsole && termTabDiff && termTabGui) {
    termTabConsole.addEventListener('click', () => { activeTermView = 'console'; updateTermView(); });
    termTabDiff.addEventListener('click', () => { activeTermView = 'diff'; updateTermView(); });
    termTabGui.addEventListener('click', () => { activeTermView = 'gui'; updateTermView(); });
  }

  function executeCurrentStepLogs() {
    const sc = scenarios[currentScenarioKey];
    if (!terminalOutput) return;
    terminalOutput.innerHTML = '';
    for (let s = 0; s < currentStepIndex; s++) {
      sc.steps[s].logs.forEach(log => {
        const div = document.createElement('div');
        div.className = `log-line log-${log.type}`;
        div.textContent = log.text;
        terminalOutput.appendChild(div);
      });
    }
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  }

  function runNextStep() {
    const sc = scenarios[currentScenarioKey];
    if (currentStepIndex >= sc.steps.length) {
      stopSimulation();
      if (statusBadge) statusBadge.textContent = "Simulation Verified";
      if (telemVerify) telemVerify.textContent = sc.telemetry.verify;
      showToast("Workflow Simulation Completed Successfully!");
      return;
    }

    const card = document.getElementById(`step-card-${currentStepIndex}`);
    if (card) {
      card.classList.add('active');
      const statusSpan = card.querySelector('.step-status');
      if (statusSpan) statusSpan.textContent = "Executing...";
    }

    const currentStep = sc.steps[currentStepIndex];
    if (statusBadge) statusBadge.textContent = `Executing: ${currentStep.title}`;
    if (stepCounter) stepCounter.textContent = `${currentStepIndex + 1} / ${sc.steps.length} Steps`;

    if (activeTermView === 'console' && terminalOutput) {
      currentStep.logs.forEach(log => {
        const div = document.createElement('div');
        div.className = `log-line log-${log.type}`;
        div.textContent = log.text;
        terminalOutput.appendChild(div);
      });
      terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }

    setTimeout(() => {
      if (card) {
        card.classList.remove('active');
        card.classList.add('completed');
        const statusSpan = card.querySelector('.step-status');
        if (statusSpan) statusSpan.textContent = "✓ Complete";
      }
      currentStepIndex++;
      if (telemTime) telemTime.textContent = `${currentStepIndex * 380} ms`;
    }, 900);
  }

  function startSimulation() {
    isSimulating = true;
    if (playText) playText.textContent = "Pause Execution";
    if (statusBadge) statusBadge.textContent = "Workflow Simulation Running";

    simulationTimer = setInterval(() => {
      runNextStep();
    }, 1400);
  }

  function stopSimulation() {
    isSimulating = false;
    if (simulationTimer) clearInterval(simulationTimer);
    if (playText) playText.textContent = "Simulate Execution";
  }

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (isSimulating) {
        stopSimulation();
      } else {
        startSimulation();
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      stopSimulation();
      renderScenario(currentScenarioKey);
    });
  }

  // =========================================================================
  // 5. Reasoning & Explainable Decision Trace (Section 11)
  //    (Auditable decision summaries showing input signals, applied methods,
  //     supporting evidence, confidence, recommendation, and human review gate)
  // =========================================================================
  const reasoningPrompts = {
    'institution-match': {
      question: `"RB complaint #RB-2026-00142 names 'SVCE' and PGRC complaint #PGRC-2026-00089 names 'Sri Venkateswara College of Engineering, Chennai' — with no shared AICTE Permanent ID. Determine whether these refer to the same institution and justify the confidence score."`,
      thoughts: [
        {
          title: "Input Signals & Normalization",
          body: "Input Records: Raw complaint strings from RB and PGRC intake forms. Token normalization strips institutional noise tokens ('college', 'of', 'engineering', 'pvt', 'ltd'). Acronym expansion correlates 'SVCE' with canonical state directory candidates."
        },
        {
          title: "Applied Matching Methods",
          body: "Stage 2: RapidFuzz partial_ratio = 91.4; Double Metaphone phonetic code: SRFNKTSFR == SRFNKTSFR. Stage 3: Sentence-Transformers (all-MiniLM-L6-v2) generates 384-dim embeddings; pgvector cosine similarity = 0.84 against Chennai institution cluster."
        },
        {
          title: "Supporting Evidence & Confidence Evaluation",
          body: "Stage 4 LLM Judge evaluates combined metadata. SVCE is the universally recognized acronym for Sri Venkateswara College of Engineering in Chennai. Both complaints share the Chennai regional jurisdiction and near-identical campus pincode. Combined Confidence Score: 0.93."
        }
      ],
      response: `### Auditable Decision Summary: Institution Identity Match

**1. Input Signals:**
- Complaint A (RB): "Sri Venkateswara Coll. of Engg" (Pincode: 602117)
- Complaint B (PGRC): "SVCE Chennai" (Pincode: 602117)
- Missing Signal: AICTE Permanent ID was omitted on both intake forms.

**2. Applied Matching Methods:**
- RapidFuzz token_sort_ratio: 88.2 | partial_ratio: 91.4
- Double Metaphone Phonetic Alignment: SRFNKTSFR (Exact Match)
- pgvector 384-dim Embedding Cosine Similarity: 0.84
- Groq Llama LLM Judge: Identity confirmation with acronym expansion.

**3. Confidence & Recommendation:**
- **Confidence Score: 0.93** (Exceeds auto-link threshold of 0.92)
- **Recommended Action:** Link both complaints to canonical institution record \`inst-aicte-1-9820341\`.

**4. Human-in-the-Loop Requirement:**
- Logged with SHA-256 hash in the audit trail. AICTE officials may audit, override, or decouple the linkage at any time.`
    },

    'overlap-routing': {
      question: `"RB has an active malpractice complaint and PGRC has a fee-refund grievance against the same institution, filed 9 days apart. Should these be merged into a single War Room, and which bureau should lead coordination?"`,
      thoughts: [
        {
          title: "Input Signals & Temporal Graph Inspection",
          body: "Both complaints connect as timestamped edges to institution node inst-aicte-1-9820341. Edge RB-2026-00142 opened Day 0 (Status: UNDER_PROCESS, Category: Malpractice). Edge PGRC-2026-00089 opened Day 9 (Status: PENDING, Category: Fee Refund)."
        },
        {
          title: "Applied Coordination & Precedence Heuristics",
          body: "30-day temporal overlap window heuristic is satisfied (Δ = 9 days). Encoded jurisdictional priors indicate regulatory malpractice investigations by RB take procedural precedence over individual grievance redressal by PGRC."
        },
        {
          title: "Supporting Evidence & Safeguard Check",
          body: "Simultaneous independent inquiries risk contradictory findings or redundant documentation requests sent to the institution. Overlap Confidence: 0.97. Recommended lead bureau: Regulation Bureau (RB)."
        }
      ],
      response: `### Auditable Decision Summary: Cross-Bureau Overlap Coordination

**1. Input Signals:**
- Institution: Sri Venkateswara College of Engineering (inst-aicte-1-9820341)
- Active Case 1: RB-2026-00142 (Regulatory Malpractice, Day 0)
- Active Case 2: PGRC-2026-00089 (Fee Refund Grievance, Day 9)
- Overlap Horizon: 9 days (Well within 30-day threshold).

**2. Applied Heuristics:**
- Temporal Graph Edge Traversal: Both edges independently active.
- Jurisdictional Precedence: Regulatory mandate supersedes individual grievance timeline.

**3. Confidence & Recommendation:**
- **Overlap Confidence: 0.97**
- **Recommended Action:** Form Coordination War Room \`WR-2026-0337\` with Regulation Bureau (RB) as lead coordinator and PGRC as contributing cell.

**4. Human-in-the-Loop Requirement:**
- **Mandatory Officer Confirmation:** AI recommends coordination and prepares the workspace; authorized AICTE officials must formally sign off before binding actions are executed.`
    },

    'risk-assessment': {
      question: `"Institution X has logged 4 complaints in 60 days with increasing severity. Compute its Risk DNA score and determine whether a Preemptive Intervention Report should be generated."`,
      thoughts: [
        {
          title: "Input Signals & Multi-Source Feature Normalization",
          body: "Five normalized signals: Complaint Frequency (4/60d), LLM-Classified Severity (0.78, High), Sentiment Trend (-0.62, negative), Cross-Bureau Overlap Density (1 active overlap), and SLA Resolution Delay (14 days vs 7-day benchmark)."
        },
        {
          title: "Applied Scoring Model & Trend Verification",
          body: "Weighted Risk DNA Model computes score: 81.0/100, placing the institution in the RED band (>75). Prophet time-series model projects a +50% continuation in complaint volume over the next 30 days, confirming the pattern is not a transient blip."
        },
        {
          title: "Supporting Evidence & Advisory Boundary",
          body: "Repeated malpractice and fee grievances within 60 days correlate with systemic operational stress. Decision: Auto-generate Preemptive Intervention Report PIR-2026-0094 for Regulation Bureau supervisory queue."
        }
      ],
      response: `### Auditable Decision Summary: Institutional Risk DNA & Forecast

**1. Input Signals:**
- Complaint Volume: 4 complaints within 60-day trailing window
- Severity: 0.78 (High severity classification)
- Sentiment Velocity: -0.62 (Worsening negative sentiment)
- Bureau Overlaps: 1 cross-bureau overlap active
- Average Resolution Delay: 14 days (2× SLA target)

**2. Applied Scoring & Forecasting:**
- Weighted Model: Composite score = 81.0 / 100 -> **Risk Band: RED**
- Prophet Time-Series Forecast: +50% projected complaint inflow (30-day horizon)

**3. Recommended Next Action:**
- Auto-generate Preemptive Intervention Report \`PIR-2026-0094\` and route to the Regulation Bureau supervisory review queue.

**4. Human-in-the-Loop Requirement:**
- **Advisory Decision Support:** Risk scores and outbreak forecasts do not imply confirmed regulatory violations or punitive determinations. All actions require independent human investigation.`
    }
  };

  const promptBtns = document.querySelectorAll('.pill-btn');
  const activePromptText = document.getElementById('active-prompt-text');
  const thinkingContainer = document.getElementById('thinking-container');
  const thinkingHeaderToggle = document.getElementById('thinking-header-toggle');
  const thinkingBodyContent = document.getElementById('thinking-body-content');
  const outputTextArea = document.getElementById('output-text-area');
  const toggleThinking = document.getElementById('toggle-thinking');
  const copyResponseBtn = document.getElementById('copy-response-btn');

  function renderReasoningPrompt(key) {
    const data = reasoningPrompts[key];
    if (!data) return;

    if (activePromptText) activePromptText.textContent = data.question;

    if (thinkingBodyContent) {
      thinkingBodyContent.innerHTML = '';
      data.thoughts.forEach(th => {
        const step = document.createElement('div');
        step.className = 'thought-step';
        step.innerHTML = `
          <div class="thought-step-title">${th.title}</div>
          <div>${th.body}</div>
        `;
        thinkingBodyContent.appendChild(step);
      });
    }

    if (outputTextArea) {
      outputTextArea.innerHTML = data.response
        .replace(/\n/g, '<br/>')
        .replace(/```([a-z]*)([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
    }
  }

  renderReasoningPrompt('institution-match');

  promptBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      promptBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const key = btn.getAttribute('data-prompt');
      renderReasoningPrompt(key);
    });
  });

  if (thinkingHeaderToggle && thinkingContainer) {
    thinkingHeaderToggle.addEventListener('click', () => {
      thinkingContainer.classList.toggle('collapsed');
    });
  }

  if (toggleThinking && thinkingContainer) {
    toggleThinking.addEventListener('change', (e) => {
      if (e.target.checked) {
        thinkingContainer.style.display = 'block';
      } else {
        thinkingContainer.style.display = 'none';
      }
    });
  }

  if (copyResponseBtn && outputTextArea) {
    copyResponseBtn.addEventListener('click', () => {
      const text = outputTextArea.innerText;
      navigator.clipboard.writeText(text).then(() => {
        showToast("Decision summary copied to clipboard!");
      });
    });
  }

  // =========================================================================
  // 6. Evaluation Methodology & Targets (Section 12)
  //    (Strictly adheres to project targets without invented baseline numbers)
  // =========================================================================
  const benchmarks = [
    {
      name: "Institution Matching Accuracy",
      category: "matching",
      desc: "Target accuracy for resolving multi-bureau complaints with non-standard institution names, abbreviations, and missing IDs.",
      targetVal: 92.4,
      targetLabel: "Target: ≥ 92.0%",
      status: "TARGET SPECIFICATION (PENDING EMPIRICAL VALIDATION)"
    },
    {
      name: "Overlap Detection Precision",
      category: "overlap",
      desc: "Target precision for identifying co-occurring cases across RB, PGRC, and other cells regarding the same institution.",
      targetVal: 88.6,
      targetLabel: "Target: ≥ 88.0%",
      status: "TARGET SPECIFICATION (PENDING EMPIRICAL VALIDATION)"
    },
    {
      name: "False Positive Rate",
      category: "matching",
      desc: "Upper-bound target for incorrect institution linkages, minimized through low-confidence human review gates (<0.85).",
      targetVal: 8.5,
      targetLabel: "Target: < 10.0%",
      status: "TARGET SPECIFICATION (PENDING EMPIRICAL VALIDATION)"
    },
    {
      name: "Manual Review Workload Reduction",
      category: "workflow",
      desc: "Target reduction in officer time required for manual cross-referencing and duplicate investigation verification.",
      targetVal: 63.5,
      targetLabel: "Target: ≥ 60.0%",
      status: "TARGET SPECIFICATION (PENDING EMPIRICAL VALIDATION)"
    },
    {
      name: "SLA Alert Timeliness",
      category: "workflow",
      desc: "Notification latency from overlap identification or SLA breach condition to nodal officer dashboard delivery.",
      targetVal: 95.0,
      targetLabel: "Target: < 30 seconds",
      status: "TARGET SPECIFICATION (PENDING EMPIRICAL VALIDATION)"
    },
    {
      name: "Risk Score Predictive Validity",
      category: "risk",
      desc: "Target correlation between computed Risk DNA scores and subsequent confirmed institutional regulatory escalations.",
      targetVal: 85.0,
      targetLabel: "Target: ≥ 85.0%",
      status: "TARGET SPECIFICATION (PENDING EMPIRICAL VALIDATION)"
    }
  ];

  const bmGrid = document.getElementById('benchmark-grid');
  const bmFilterBtns = document.querySelectorAll('.bm-filter-btn');

  function renderBenchmarks(filter) {
    if (!bmGrid) return;
    bmGrid.innerHTML = '';

    const filtered = filter === 'all'
      ? benchmarks
      : benchmarks.filter(b => b.category === filter);

    filtered.forEach(bm => {
      const card = document.createElement('div');
      card.className = 'benchmark-card';

      card.innerHTML = `
        <div class="bm-header">
          <div class="bm-name">${bm.name}</div>
          <span class="bm-category">${bm.category.toUpperCase()}</span>
        </div>
        <p class="bm-desc">${bm.desc}</p>
        <div class="bm-bars">
          <div class="bar-row">
            <span class="bar-label winner">Project Target Specification</span>
            <div class="bar-track">
              <div class="bar-fill astra-fill" style="width: ${bm.targetVal}%;"></div>
            </div>
            <span class="bar-value winner-val">${bm.targetLabel}</span>
          </div>
          <div class="bar-row">
            <span class="bar-label" style="color: var(--text-muted); font-size: 0.72rem;">Empirical Status</span>
            <div class="bar-track">
              <div class="bar-fill" style="width: 0%; background: var(--text-muted);"></div>
            </div>
            <span class="bar-value" style="color: var(--accent-sol); font-size: 0.72rem;">PENDING VALIDATION</span>
          </div>
        </div>
      `;
      bmGrid.appendChild(card);
    });
  }

  renderBenchmarks('all');

  bmFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      bmFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderBenchmarks(btn.getAttribute('data-category'));
    });
  });

  // =========================================================================
  // 7. Operational Workload Estimator (Section 14)
  //    (Estimates matching verification cases, workflow stages, and LLM requests)
  // =========================================================================
  const tokenSlider = document.getElementById('token-slider');
  const outputSlider = document.getElementById('output-slider');
  const tokenDisplay = document.getElementById('token-display');
  const outputDisplay = document.getElementById('output-display');
  const modelSelect = document.getElementById('model-select');

  const calcCostResult = document.getElementById('calc-cost-result');
  const calcThroughputResult = document.getElementById('calc-throughput-result');
  const calcLatencyResult = document.getElementById('calc-latency-result');

  function updateCalculator() {
    if (!tokenSlider || !outputSlider || !modelSelect) return;
    const complaints = parseInt(tokenSlider.value, 10);
    const ambiguousPct = parseInt(outputSlider.value, 10);
    const workflow = modelSelect.value || 'full';

    if (tokenDisplay) tokenDisplay.textContent = `${complaints.toLocaleString()} Cases / mo`;
    if (outputDisplay) outputDisplay.textContent = `${ambiguousPct}%`;

    // Calculate cases requiring matching verification
    const verificationCases = Math.round(complaints * (ambiguousPct / 100));

    let workflowStages = "4 Stages (Full)";
    let llmRequests = Math.round(verificationCases * 0.28); // ~28% fall in ambiguous 0.70-0.92 zone

    if (workflow === 'vector') {
      workflowStages = "3 Stages (Vector-Augmented)";
      llmRequests = 0;
    } else if (workflow === 'heuristic') {
      workflowStages = "2 Stages (Heuristic-Only)";
      llmRequests = 0;
    }

    if (calcCostResult) calcCostResult.textContent = `~${verificationCases.toLocaleString()} cases`;
    if (calcThroughputResult) calcThroughputResult.textContent = workflowStages;
    if (calcLatencyResult) calcLatencyResult.textContent = workflow === 'full' ? `~${llmRequests} requests` : "0 (Bypassed)";
  }

  if (tokenSlider && outputSlider && modelSelect) {
    tokenSlider.addEventListener('input', updateCalculator);
    outputSlider.addEventListener('input', updateCalculator);
    modelSelect.addEventListener('change', updateCalculator);
    updateCalculator();
  }

  // =========================================================================
  // 8. Developer API Playground (Section 15)
  //    (Proposed API contract for VIGIL institution resolution endpoint)
  // =========================================================================
  let currentLang = 'python';
  let currentEffort = 'high';       // matching_depth: low | medium | high | deep_tree
  let currentJudge = 'enabled';     // llm_judge: enabled | disabled

  const langTabs = document.querySelectorAll('.lang-tab');
  const effortPills = document.querySelectorAll('#effort-options .param-pill');
  const computerPills = document.querySelectorAll('#computer-options .param-pill');
  const apiCodeContent = document.getElementById('api-code-content');
  const copyCodeBtn = document.getElementById('copy-code-btn');

  function generateApiCode() {
    if (!apiCodeContent) return;

    const judgeBool = currentJudge === 'enabled';

    if (currentLang === 'python') {
      apiCodeContent.textContent = `# Proposed API contract — VIGIL Decision Support Service
import os
import requests

VIGIL_BASE_URL = os.getenv("VIGIL_BACKEND_URL", "http://localhost:8000/api/v1")

response = requests.post(
    f"{VIGIL_BASE_URL}/institutions/resolve",
    headers={"Authorization": f"Bearer {os.getenv('VIGIL_API_TOKEN')}"},
    json={
        "institution_name_raw": "ABC Institute of Technology",
        "region": "Maharashtra",
        "matching_depth": "${currentEffort}",
        "llm_judge": ${judgeBool ? 'True' : 'False'}
    }
)

result = response.json()
print("Matched Institution ID:", result.get("institution_id"))
print("Confidence Score:", result.get("confidence_score"))
print("Match Provenance:", result.get("match_method"))`;
    } else if (currentLang === 'node') {
      apiCodeContent.textContent = `// Proposed API contract — VIGIL Decision Support Service
const VIGIL_BASE_URL = process.env.VIGIL_BACKEND_URL || "http://localhost:8000/api/v1";

const response = await fetch(\`\${VIGIL_BASE_URL}/institutions/resolve\`, {
  method: "POST",
  headers: {
    "Authorization": \`Bearer \${process.env.VIGIL_API_TOKEN}\`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    institution_name_raw: "ABC Institute of Technology",
    region: "Maharashtra",
    matching_depth: "${currentEffort}",
    llm_judge: ${judgeBool}
  })
});

const result = await response.json();
console.log("Matched Institution ID:", result.institution_id);
console.log("Confidence Score:", result.confidence_score);`;
    } else if (currentLang === 'curl') {
      apiCodeContent.textContent = `# Proposed API contract — VIGIL Decision Support Service
curl -X POST \${VIGIL_BACKEND_URL:-"http://localhost:8000/api/v1"}/institutions/resolve \\
  -H "Authorization: Bearer $VIGIL_API_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "institution_name_raw": "ABC Institute of Technology",
    "region": "Maharashtra",
    "matching_depth": "${currentEffort}",
    "llm_judge": ${judgeBool}
  }'`;
    } else if (currentLang === 'rust') {
      apiCodeContent.textContent = `// Proposed API contract — VIGIL Decision Support Service (TypeScript)
import axios from "axios";

interface ResolutionRequest {
  institution_name_raw: string;
  region: string;
  matching_depth: string;
  llm_judge: boolean;
}

interface ResolutionResponse {
  institution_id: string;
  confidence_score: number;
  match_method: string;
  human_verification_required: boolean;
}

const client = axios.create({
  baseURL: process.env.VIGIL_BACKEND_URL || "http://localhost:8000/api/v1",
  headers: { Authorization: \`Bearer \${process.env.VIGIL_API_TOKEN}\` }
});

const { data } = await client.post<ResolutionResponse>("/institutions/resolve", {
  institution_name_raw: "ABC Institute of Technology",
  region: "Maharashtra",
  matching_depth: "${currentEffort}",
  llm_judge: ${judgeBool}
});

console.log(\`Matched: \${data.institution_id} (Score: \${data.confidence_score})\`);`;
    }
  }

  generateApiCode();

  langTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      langTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentLang = tab.getAttribute('data-lang');
      generateApiCode();
    });
  });

  effortPills.forEach(pill => {
    pill.addEventListener('click', () => {
      effortPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentEffort = pill.getAttribute('data-effort');
      generateApiCode();
    });
  });

  computerPills.forEach(pill => {
    pill.addEventListener('click', () => {
      computerPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentJudge = pill.getAttribute('data-computer');
      generateApiCode();
    });
  });

  if (copyCodeBtn && apiCodeContent) {
    copyCodeBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(apiCodeContent.textContent).then(() => {
        showToast("Code snippet copied to clipboard!");
      });
    });
  }

  // =========================================================================
  // 9. Governance & System Architecture Modal (Section 16)
  // =========================================================================
  const modal = document.getElementById('system-card-modal');
  const modalClose = document.getElementById('modal-close');
  const modalCancel = document.getElementById('modal-cancel-btn');
  const modalDl = document.getElementById('modal-dl-btn');
  const btnViewCard = document.getElementById('btn-view-system-card');
  const btnViewLedger = document.getElementById('btn-view-eval-ledger');
  const calloutBtn = document.getElementById('callout-card-btn');
  const heroCardLink = document.getElementById('hero-system-card-link');
  const footerDocLink = document.getElementById('footer-doc-link');

  function openModal(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  [btnViewCard, btnViewLedger, calloutBtn, heroCardLink, footerDocLink].forEach(btn => {
    if (btn) btn.addEventListener('click', openModal);
  });

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalCancel) modalCancel.addEventListener('click', closeModal);
  if (modalDl) {
    modalDl.addEventListener('click', () => {
      showToast("Downloading VIGIL System Card & Specification (PDF)...");
      setTimeout(closeModal, 800);
    });
  }

  window.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
      closeModal();
    }
  });

  // =========================================================================
  // 10. Navigation Active Scroll Spy & Mobile Menu
  // =========================================================================
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-item');
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('mobile-open');
    });

    navItems.forEach(item => {
      item.addEventListener('click', () => {
        navMenu.classList.remove('mobile-open');
      });
    });
  }

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPos = window.scrollY + 100;

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = sec.getAttribute('id');
      }
    });

    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('href') === `#${currentId}`) {
        item.classList.add('active');
      }
    });
  });

  // =========================================================================
  // 11. Live UTC Terminal Clock
  // =========================================================================
  const termClock = document.getElementById('term-clock');
  if (termClock) {
    function updateClock() {
      const now = new Date();
      termClock.textContent = now.toTimeString().split(' ')[0] + ' UTC';
    }
    updateClock();
    setInterval(updateClock, 1000);
  }

  console.log("VIGIL Agentic Institution Intelligence Platform initialized successfully.");
});
