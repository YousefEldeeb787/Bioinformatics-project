# Virulence Factor Discovery Pipeline

A deep learning–driven pipeline for identifying bacterial virulence factors (VFs) from
genomic data, replacing traditional fixed-weight scoring heuristics with a learned,
multi-signal classification system.

This project reworks a classic bioinformatics VF-screening pipeline — originally based on
hand-tuned rules (hydrophobicity thresholds, fixed scoring weights) — into a system where
every stage is learned from data: a fine-tuned protein language model for sequence
representation, and a meta-model that learns how to weigh homology and embedding evidence
together, rather than combining them with arbitrary fixed weights.

## Pipeline Overview

```
Raw genome (.fna)
      │
      ▼
Prodigal gene calling  →  9,861 predicted genes, with true genomic coordinates
      │
      ▼
┌─────────────────────────────────────────────┐
│  STAGE 1 — Gene-Level Classifier             │
│  ESM-2 (fine-tuned) + Attention Pooling      │
│  → per-protein embedding + VF probability    │
└─────────────────────────────────────────────┘
      │
      ├──────────────► BLAST vs VFDB (homology evidence)
      ├──────────────► HMMer vs CDD (domain evidence)
      │
      ▼
┌─────────────────────────────────────────────┐
│  STAGE 2 — Meta-Model (Model 3)              │
│  XGBoost: DL embedding + CDD count           │
│  + de-leaked BLAST bitscore                  │
│  → final, learned VF probability per gene    │
└─────────────────────────────────────────────┘
      │
      ▼
Ranked, evidence-annotated, coordinate-aware VF predictions (CSV)
      │
      ▼
Classical PAI scan (GC-content deviation + mobile-element keyword search)
```

## How It Works, In Plain Terms

**The goal:** given a bacterial genome, find which of its genes are likely to be
virulence factors — proteins that help the bacterium cause disease (toxins, invasion
machinery, immune evasion tools, etc.) — without relying only on matching against known
sequences, which misses anything novel or divergent.

**Step 1 — Find the genes.** The genome is scanned with `Prodigal`, a real bacterial gene
predictor, producing 9,861 protein-coding genes with true start/end/strand coordinates.
*(An earlier version of this pipeline used a custom 6-frame ORF scanner instead — see
"Known Issues, Fixed" below for why this was replaced.)*

**Step 2 — Score each gene with a fine-tuned language model (Stage 1).** Each protein
sequence is fed through ESM-2, a protein language model pretrained on large-scale protein
sequence data, then fine-tuned to distinguish virulence factors from non-virulence
proteins. The model blends information from all of ESM-2's internal layers and learns
which amino acid positions in each protein matter most (via attention pooling), producing
a 480-number embedding per gene plus an initial VF probability.

**Step 3 — Cross-check against known virulence factors.** Every gene is independently
compared against VFDB (`BLAST`, curated virulence factor sequences) and CDD (`HMMER`,
protein domain families). This evidence doesn't feed directly into Stage 1 — it's used
both as a Stage 2 input feature and as an independent sanity check on the final
predictions.

**Step 4 — Fuse the evidence with a second learned model (Stage 2 / Model 3).** An
XGBoost model learns how to combine the language-model embedding, CDD domain count, and
BLAST bitscore into a single final probability — rather than combining them with
hand-picked weights.

**Step 5 — Scan for pathogenicity islands.** Using the real gene coordinates, the genome
is scanned in 10kb windows for two classical signals of horizontally-acquired
pathogenicity islands: local GC-content deviation from the genome average, and nearby
mobile-element genes (transposases, integrases) identified via BLAST subject
descriptions.

**Step 6 — Rank and report.** All genes are scored, sorted by probability, and saved to a
single CSV with evidence tier, coordinates, and PAI signals attached, so predictions can
be manually reviewed rather than treated as a black box.

## Models

### Stage 1 — Gene-Level Transformer Classifier

| | |
|---|---|
| **Base model** | ESM-2 (`facebook/esm2_t12_35M_UR50D`), 35M parameters |
| **Fine-tuning** | Last 2 transformer layers unfrozen; rest frozen |
| **Representation** | Learned weighted combination across all hidden layers (not just the final layer) |
| **Pooling** | Custom attention pooling — learns which amino acid positions matter most per protein, acting as an alignment-free, data-driven PSSM |
| **Training objective** | Binary cross-entropy (VF-positive vs. VF-negative) + supervised contrastive loss, which structures the embedding space so same-class proteins cluster together |
| **Training data** | 22,207 labeled protein sequences (11,584 positive / 10,623 negative) |
| **Validation AUC** | **0.9569** |
| **Validation F1** | 0.906 |

**What it replaces:** a simple hydrophobicity-fraction counter (~40% accuracy) used in the
original pipeline for a first-pass virulence signal.

### Stage 2 — Meta-Model: Model 2 vs. Model 3

Two versions of the Stage 2 meta-model were trained and compared:

| | Model 2 | Model 3 (current default) |
|---|---|---|
| **Features** | 480-dim DL embedding + CDD domain count | 480-dim DL embedding + CDD domain count + **de-leaked BLAST bitscore** |
| **Test AUC** | 0.9672 | **0.9744** |
| **5-fold CV AUC** | 0.9809 (± 0.0023) | **0.9849 (± 0.0019)** |
| **Train/test AUC gap** | 0.0323 | **0.0253** (smaller — less overfitting, not more) |

**Why BLAST wasn't simply added as a raw feature:** the VF-positive training sequences
are themselves literal VFDB records (IDs like `VFG037246(gb|YP_001847231)`). BLASTing
them directly against VFDB produces near-perfect self-hits (~100% identity, e-value ≈ 0),
which would leak the label into the feature. This was caught and fixed by matching each
training sequence against its own VFDB accession (extracted by regex on the `VFG######`
number, since VFDB lists the same protein under both `YP_` and `WP_`-prefixed accessions)
and excluding true self-hits before computing the bitscore feature. 2,809 of 3,171
near-100%-identity hits were confirmed self-hits and removed.

**Validation that Model 3 uses BLAST evidence correctly, not naively:** if Model 3 had
simply learned "BLAST hit exists → increase score," it would inflate every strong BLAST
hit uniformly. Instead, applying Model 3 to the genome showed the overall BLAST-confirmed
population shift upward (median probability 0.128 → 0.259) while known non-specific
entries (see "Housekeeping-Family Contamination" below) largely stayed low — evidence
the model is using BLAST strength *conditionally* on what the embedding already believes,
which is the intended behavior of a learned fusion model.

**What it replaces:** an arbitrary fixed-weight scoring matrix (`ML score × 2 + BLAST hit
× 4 + ...`) with weights that were never statistically validated.

## Results

Applied to a real test genome, gene-called with Prodigal (9,861 genes):

| Metric | Old custom ORF scanner (34,074 ORFs) | Prodigal gene calling (9,861 genes) |
|---|---|---|
| High-confidence predictions (proba > 0.8) | 7,383 | 2,083 |
| No-evidence, high-confidence predictions | 6,835 (20.06% of all genes) | 1,178 (**11.95%** of all genes) |
| Distinct candidate loci (adjacency-clustered) | 1,792 (ID-adjacency proxy — no real coordinates) | 1,106 (**true coordinate clustering**) |

**Switching to real gene calling reduced the no-evidence high-confidence rate by
~8 percentage points (40% relative reduction)** — meaningful progress, but the problem is
reduced, not eliminated: 1,106 distinct genomic loci still score high-confidence with no
independent supporting evidence.

**Evidence-tier breakdown (Prodigal gene set, 9,861 genes):**

| Tier | Count |
|---|---|
| No evidence | 5,823 |
| Corroborated (BLAST or CDD) | 2,972 |
| Strongly corroborated (both) | 1,066 |

## Housekeeping-Family Contamination in BLAST Evidence

Manual inspection of strong BLAST hits that still scored near-zero surfaced two VFDB
entries — Elongation Factor Tu (`VFG046465`) and an ABC transporter
(`VFG013248`) — matched by highly conserved, non-virulence-specific bacterial proteins.
This was investigated systematically across all BLAST hits, classified by keyword search
against VFDB subject descriptions into four conserved housekeeping-protein families:

| Family | Genes hit | Median Model 3 score | High-confidence (>0.8) | ...of which full-length (>80% coverage) |
|---|---|---|---|---|
| **Chaperonin / heat shock (GroEL-type)** | 14 | **0.856** | 8 (57%) | 7 |
| Elongation factor | 28 | 0.068 | 5 (18%) | 4 |
| ATP synthase | 8 | 0.054 | 1 (13%) | 1 |
| ABC transporter (general) | 101 | 0.023 | 6 (6%) | 2 |

**Chaperonins are the most severe case**: the typical (median) chaperonin/heat-shock hit
already scores above the high-confidence threshold, and most of those are full-length
matches, not short conserved-motif fragments. This is a real, systematic blind spot —
not an edge case. The other three families show a "mostly low, occasionally high" pattern
similar to what was first observed for EF-Tu specifically (median low, but full-length
matches sometimes score confidently high) — ABC transporters are the best-behaved of the
four.

Overall, housekeeping-family matches account for a modest share of currently
evidence-backed high-confidence predictions in this genome (**20 / 905, 2.2%**) — but
this genome-specific percentage understates the risk, since it depends on how many
housekeeping-family genes happen to have strong VFDB hits in a given genome; the
per-family contamination rate (especially for chaperonins) is the more transferable
number.

**This finding evolved through several rounds of testing, not a single check:** an
initial adversarial test on 5 fragmented ORFs (from the old custom ORF scanner) suggested
the model reliably discounts housekeeping genes. Re-testing the same VFDB entries on
101 properly-called genes (after switching to Prodigal) overturned that conclusion —
several full-length EF-Tu and ABC-transporter genes scored above 0.9. The broader
4-family scan above was run specifically to determine whether this was a two-gene
anomaly or a general pattern; it confirmed the latter, with severity varying sharply by
family.

## Pathogenicity Island (PAI) Scanning

Using true Prodigal coordinates, the genome was scanned in 10kb windows for two classical
PAI signals:
- **Local GC-content deviation** from the genome-wide average (threshold: >5% absolute
  deviation)
- **Nearby mobile-element genes** — BLAST subject descriptions searched for
  `transposase`, `integrase`, `recombinase`, `IS element`, `resolvase`

This scan is a straightforward, un-trained heuristic (not a machine-learned component),
included as a complementary, classical cross-check alongside the model's predictions.

*Note: an earlier design considered passing windowed gene embeddings through a
`GenomicWindowEncoder` transformer module. That module is defined in the architecture but
was never trained — it was excluded from this analysis rather than run and misreported,
since its outputs would be indistinguishable from random noise.*

## What's Genuinely New Here

1. **Alignment-free, learned PSSM.** The attention pooling layer's weights show which
   amino acid positions the model considers important for virulence, without requiring a
   multiple sequence alignment.
2. **Learned score fusion instead of fixed weights**, now incorporating de-leaked
   homology evidence (Model 3) as well as domain-count evidence.
3. **Multi-layer transformer representation** — though in practice the learned
   layer-weights come out nearly uniform (~0.075–0.08 each across all 13 hidden-state
   layers), meaning the model does not show a strong preference for any particular depth.
4. **Contrastive embedding structuring** — the training objective pulls virulence
   factors together and pushes non-virulence proteins apart in embedding space,
   independently useful for clustering/similarity search beyond this one classifier.

## Limitations (Honest Scope)

- **Housekeeping-family contamination (see above).** The single most significant,
  quantified limitation: conserved protein families (especially chaperonins) can score
  confidently high without being genuine virulence factors. Not resolved by improved
  gene calling. A recommended next step is an explicit down-weighting or exclusion
  filter for known-problematic VFDB families, or a "taxonomic breadth" feature
  (how widely a matched VFDB entry's family is distributed across bacterial genera).
- **No-evidence, high-confidence predictions remain substantial (1,106 distinct loci)
  even after switching to real gene calling.** Whether these represent genuinely novel
  virulence factors or embedding-space overconfidence on background-like sequences is
  still unresolved. A UMAP projection shows these predictions clustering near VF-positive
  training data rather than scattered randomly — suggestive of a real learned signal, but
  not confirmatory.
- **`GenomicWindowEncoder` remains untrained and unused.** Implemented in the
  architecture for future gene-neighborhood modeling, but never trained on labeled
  window-level data; running it would produce meaningless output.
- **PAI mobile-element detection depends on VFDB's own annotation text** and returned
  zero hits in this genome — plausible given VFDB's bias toward toxins/adhesins/secretion
  systems, but not independently confirmed against a dedicated mobile-element database.
- **No held-out genome with independently curated annotations.** Validation metrics
  (AUC, F1, CV) are computed on the labeled training set; genome-level results are
  reported on a single test genome. A multi-genome validation attempt was made but
  produced unreliable results due to a missing BLAST database in that session — this
  remains open future work.
- **No baseline comparison against published VF-prediction tools** (e.g. VirulentPred,
  PathoFact) on the final ESM-2/XGBoost pipeline.

## Known Issues, Fixed During Development

- **Original ORF calling used a custom 6-frame `M...*` scanner, not a real gene
  predictor**, producing 34,074 fragmented, sometimes-overlapping "genes" with no
  coordinate metadata. One consequence: a single EF-Tu gene was split across 4 separate
  fragment IDs, each independently scored. Replaced with Prodigal, which produces 9,861
  true, non-fragmented genes with real coordinates.
- **BLAST self-hit leakage in Model 3's training feature**, caused by training-positive
  sequences being literal VFDB records under two different accession prefixes (`YP_` /
  `WP_`) for the same `VFG######` entry — a naive full-ID match failed to catch this.
  Fixed by matching on the VFG accession number alone.
- **BLAST TSV parsing required a 13th placeholder column** beyond the standard 12-column
  `outfmt 6`, or every column silently shifts by one.
- **HMMER `hmmsearch` output has swapped query/target roles vs. `hmmscan`** — using the
  `hmmscan` column mapping on `hmmsearch` output silently produces wrong gene/domain
  associations.
- **CDD HMM database file was truncated** (13,907 headers vs. 13,906 terminators);
  repaired by truncating to the last complete `\n//\n` record before `hmmpress`.
- Multiple silent ID-mismatch bugs during the Prodigal migration (Prodigal's native gene
  IDs vs. the coordinate-derived remapped IDs used downstream) caused evidence-tier and
  PAI features to silently zero out; fixed by consistently mapping between the two ID
  schemes before any lookup.

## Repository Structure

```
├── vf_pipeline_final.py             # Full pipeline (Colab-cell format)
├── checkpoints/
│   ├── vf_pipeline_checkpoint.pth   # Trained Stage 1 model weights
│   ├── meta_model.json              # Trained Stage 2 model — Model 3 (current default)
│   ├── meta_model_v2_cdd_only.json  # Archived Model 2 (no BLAST feature), for comparison
│   ├── meta_model_v3_with_blast.json# Explicit Model 3 copy
│   ├── orf_embeddings.pkl           # Precomputed genome ORF embeddings (old ORF set)
│   ├── new_orf_embeddings.pkl       # Precomputed embeddings for Prodigal-called genes
│   ├── train_dl_embeddings.pkl      # Precomputed training-set embeddings
│   ├── train_pfam_counts.pkl        # Precomputed training-set CDD domain counts
│   ├── train_cdd_hits.tblout        # Raw hmmsearch output backing the counts above
│   ├── train_vs_vfdb.tsv            # Training-set BLAST vs VFDB (for de-leaked feature)
│   ├── predicted_orfs_new.faa/.gff  # Prodigal gene calls + coordinates
│   ├── new_orfs_vs_vfdb.tsv         # Genome BLAST results (Prodigal gene set)
│   └── new_cdd_hits.tblout          # Genome CDD domain results (Prodigal gene set)
├── data/
│   ├── VF_positive_subset_final_2.faa
│   ├── VF_negative_subset_final.faa
│   └── test_sample.fna              # Target genome
├── final_vf_predictions_v2.csv      # Predictions on the original (custom-scanner) ORF set
└── final_vf_predictions_prodigal.csv# Predictions on the Prodigal gene set (recommended)
```

## Requirements

```
biopython
transformers
torch
scikit-learn
xgboost
matplotlib
pandas
numpy
scipy
umap-learn      # optional — embedding-space diagnostic plots
```

External tools: `prodigal`, `ncbi-blast+`, `hmmer`.

## Usage

Run the pipeline cell-by-cell in Google Colab. It loads all precomputed checkpoints from
Drive and performs inference only by default — no retraining or re-embedding unless the
underlying gene set changes (e.g. a new genome, or switching ORF-calling methods), in
which case Stage 1 embeddings must be regenerated for the new gene set (Stage 1 itself is
not retrained — only applied).
