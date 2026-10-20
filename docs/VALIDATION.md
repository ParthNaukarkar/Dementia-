# Validation & Clinical Methodology Notice

## Important Clinical & Regulatory Notice

**NeuroSaathi is an experimental cognitive screening support and memory-assistance research platform, NOT a certified diagnostic medical device.** It does not provide medical diagnoses, treatment decisions, or definitive staging of neurodegenerative disorders. Any clinical classification, latent ability estimate ($\theta$), or risk categorization produced by the algorithmic screening models must be interpreted solely as screening support and longitudinal monitoring signals under the supervision of qualified healthcare professionals.

---

## 1. Machine Learning Model Training & Data Provenance

The cognitive classification model (`src/engine/trained-cognitive-model.json`) utilized by the `CognitiveClassifier` was trained using the scripts located in `scripts/train_cognitive_model.py` and `scripts/train_with_real_oasis.py`.

### Nature of Training Data:
1. **Real-World Covariates Only**: The real-world clinical data utilized comes from the Washington University Alzheimer’s Disease Research Center (ADRC) Open Access Series of Imaging Studies (OASIS-2) longitudinal dataset (`scripts/data/oasis_longitudinal_demographics.csv`). These real clinical records supply only:
   - Clinical Dementia Rating (CDR) scores (0.0 = Normal, 0.5 = Very Mild / MCI, 1.0 = Mild Dementia, 2.0 = Moderate Dementia)
   - Mini-Mental State Examination (MMSE) scores (15 to 30)
   - Demographic and biological covariates (Age, Education, Socioeconomic Status, Normalized Whole Brain Volume [nwbv], Estimated Total Intracranial Volume [eTIV], Atlas Scaling Factor [ASF]).
2. **Synthetic Gameplay Features**: **The real-world OASIS-2 cohort participants did not play these digital cognitive games.** The gameplay telemetry features (accuracy percentages, response latencies, perseverative repetitions, motor tremor debouncing counts, and assistance requests) were **synthetically generated** via parametric simulation functions linking clinical severity (CDR and MMSE deficits) to simulated task performance.
3. **Training Methodology**: The lightweight random forest classifier (50 estimators, max depth 6) was trained on these synthetic feature vectors mapped to the real OASIS-2 demographic strata.

---

## 2. Benchmark Scripts & Correlation Invariants

The evaluation scripts in `/scripts` (including `adaptive_flow_real_world_data_gameplay_benchmark.ts`, `what_changed_real_world_data_gameplay_benchmark.ts`, `deep_all_five_games_audit.ts`, etc.) evaluate the system by replaying synthetic patient agents through the game engines and adaptive flow orchestrator.

- **Simulation Consistency Checks**: The high correlations observed in benchmark runs (e.g., $r(\theta, \text{MMSE}) > 0.70$, $r(\theta, \text{CDR}) < -0.70$, $r(\text{Autonomy}, \text{CDR}) < -0.65$) demonstrate **mathematical and algorithmic consistency** within the synthetic simulation model.
- **Not Independent Clinical Validation**: These benchmark results reflect verification that the software engines, item response theory (2PL IRT) updates, and rule sets adhere to the parametric assumptions encoded in the simulation testbed. They do **not** constitute empirical clinical validation on living human patients.

---

## 3. Scope of Algorithmic Features

| Component | Nature of Implementation | Clinical Status |
| :--- | :--- | :--- |
| **Bayesian 2PL IRT Engine** | Deterministic closed-form Maximum A Posteriori (MAP) ability estimation | Algorithmic psychometrics; calibrated to theoretical difficulty tiers |
| **LinUCB Bandit Scaffolding** | Disjoint contextual linear bandit with Upper Confidence Bound (UCB) | Reinforcement learning heuristic for real-time task assistance |
| **Kinematic Tremor Filter** | Discrete Fourier Transform (DFT) spectral energy band isolation (4–6 Hz & 8–12 Hz) | Digital signal processing heuristic for tremor debouncing; sub-clinical screening signal |
| **Circadian Time Manager** | Rule-based schedule monitoring (Sundowning protection 16:30–20:30) | Behavioral routine scheduling support |
| **LLM Clinical Reporting** | De-identified generative prompt synthesis via optional user-provided cloud API keys | Generative draft generation; requires explicit clinician review and verification |

---

## 4. Next Step: Pilot Data Collection with Clinician Oversight

To advance NeuroSaathi from an engineering research prototype toward clinical efficacy:

1. **Institutional Review Board (IRB) / Ethics Committee Protocol**: Design and submit an observational pilot study protocol conforming to Indian Council of Medical Research (ICMR) ethical guidelines for biomedical research involving human participants.
2. **Pilot Cohort Collection with Clinician Oversight**: Conduct controlled, supervised pilot testing with older adults (including healthy controls, individuals with subjective cognitive decline, and mild cognitive impairment) in clinical or memory-clinic settings across the North Eastern Region of India.
3. **Ground-Truth Telemetry Replacement**: Replace synthetic gameplay telemetry models with empirical distributions collected directly from patient touch, deliberation latency, and error patterns.
4. **Independent Diagnostic Sensitivity & Specificity**: Benchmark algorithmic outputs against formal neuropsychological batteries (e.g., clinician-administered MoCA-B, HMSE, ACE-III) administered by certified neuropsychologists.
