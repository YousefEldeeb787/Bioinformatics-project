# VF Discovery Pipeline — Drive Contents & Onboarding Report

*For anyone picking this project up fresh. Read this before touching any file.*

#### the Links: https://drive.google.com/drive/folders/1tpo-2HEaxEHNxwhErnWmaRIeCaoE4FHS?usp=sharing

## What This Project Is

A pipeline that scores bacterial genes for likely virulence-factor (VF) status, using a
fine-tuned ESM-2 protein language model (Stage 1) feeding into an XGBoost meta-model
(Stage 2) that fuses the embedding with BLAST/CDD homology evidence. It replaces an
earlier version of the project that used hand-tuned rule-based scoring.

The project has gone through **two major eras**, and the Drive folder contains files from
both. Knowing which era a file belongs to is the single most important thing for avoiding
confusion.

---

## Era 1: Custom ORF Scanner (superseded, kept for comparison)

The original gene-finding step was a hand-written 6-frame `M...*` scanner, not a real gene
predictor. It produced 34,074 fragmented, sometimes-overlapping pseudo-genes with no
coordinate metadata. This was later found to systematically fragment real genes (one EF-Tu
gene was split into 4+ separate scored fragments).

**Files belonging to this era** (still on Drive, useful only for before/after comparison —
do not use these as the basis for new work):
- `predicted_orfs.faa` — the 34,074 fragmented sequences
- `orfs_vs_vfdb_full.tsv`, `pfam_hits.tbl` — BLAST/CDD results for that gene set
- `checkpoints/orf_embeddings.pkl` — Stage 1 embeddings for that gene set
- `final_vf_predictions_v2.csv` — final scored predictions on that gene set

## Era 2: Prodigal Gene Calling (current, use this)

The scanner was replaced with `Prodigal`, a real bacterial gene predictor, producing 9,861
true genes with real genomic coordinates (contig/start/end/strand). This is the gene set
all current and future work should build on.

**Files belonging to this era:**
- `checkpoints/predicted_orfs_new.faa` / `.gff` — Prodigal's gene calls + coordinates
- `checkpoints/new_orfs_vs_vfdb.tsv` — BLAST results (includes `stitle`, the functional
  description field — needed for the housekeeping-gene and PAI analyses)
- `checkpoints/new_cdd_hits.tblout` — CDD domain results
- `checkpoints/new_orf_embeddings.pkl` — Stage 1 embeddings for the Prodigal gene set
- `final_vf_predictions_prodigal.csv` — final scored predictions (**this is the
  current source of truth**)

**Important quirk to know about immediately:** Prodigal's own gene IDs in the `.gff`/`.faa`
files did not match the coordinate-derived IDs used downstream, so a positional ID-remap
step (`id_remap`, built from matching FASTA row order to sorted GFF row order) is required
before joining BLAST/CDD results to anything else. Forgetting this remap has caused several
silent bugs already (evidence tiers reading as 100% "no evidence" when real evidence
existed, PAI mobile-element detection reading as zero when it shouldn't). If you write new
analysis code, always route BLAST/CDD lookups through `id_remap` first.

---

## Models (in `checkpoints/`)

| File | What it is | Status |
|---|---|---|
| `vf_pipeline_checkpoint.pth` | Stage 1 — fine-tuned ESM-2 + attention pooling + classifier head | Trained, do not retrain |
| `meta_model.json` | Stage 2, **primary/current model** | This is Model 3 — use this by default |
| `meta_model_v3_with_blast.json` | Identical copy of Model 3 | Redundant with above, kept for clarity |
| `meta_model_v2_cdd_only.json` | Stage 2, archived earlier version (no BLAST feature) | Kept only for the Model 2 vs. Model 3 ablation comparison — don't use for new predictions |

**Model 2 vs. Model 3, in one sentence:** Model 3 adds a de-leaked BLAST bitscore feature
on top of Model 2's embedding + CDD-count features, and measurably outperforms it
(Test AUC 0.9672 → 0.9744). The "de-leaked" part matters — training positives are
themselves VFDB records, so a naive BLAST feature would leak; this was caught and fixed by
excluding true self-hits (matched on VFDB accession number, not full ID string, since VFDB
lists some proteins under two different accession prefixes for the same entry).

---

## Training-Side Files (shared across all models, don't touch)

- `VF_positive_subset_final_2.faa` / `VF_negative_subset_final.faa` — the 22,207-sequence
  labeled training set
- `checkpoints/train_dl_embeddings.pkl` — Stage 1 embeddings for training sequences
- `checkpoints/train_pfam_counts.pkl` — CDD domain counts for training sequences
- `checkpoints/train_vs_vfdb.tsv` — training sequences BLASTed against VFDB (this is what
  the de-leaked BLAST feature is built from — needed if you ever retrain a meta-model)
- `checkpoints/train_cdd_hits.tblout` — raw hmmsearch output backing the CDD counts

None of Stage 1 or the training features need to be regenerated for any work on the
existing genome. They'd only need rebuilding if the training data itself changed.

---

## Other Reference Files

- `test_sample.fna` — the target genome (6,315 contigs, metagenome-style assembly)
- `virulence_factors_CDD.hmm` / the repaired version generated on-the-fly each session —
  a truncated HMM database (13,907 headers, 13,906 terminators); the repair (truncate to
  last complete `\n//\n` record) has to be re-applied each fresh Colab session since
  `/content/` doesn't persist
- `vfdb_proteins.faa` — raw VFDB protein FASTA, used to rebuild the local BLAST database
  (`makeblastdb`) each fresh session, since `/content/vfdb/` also doesn't persist

---

## What's Already Been Found (don't re-discover these)

1. **Fragmentation was real and measurable.** No-evidence high-confidence rate: 20.06% of
   genes (custom scanner) → 11.95% (Prodigal). A real improvement, not fully solved —
   1,106 distinct genomic loci still score high-confidence with no supporting evidence.

2. **Housekeeping-gene contamination is a real, quantified limitation — the most
   important finding of the project so far.** Some VFDB entries are conserved
   housekeeping proteins (EF-Tu, ABC transporters, chaperonins, ATP synthase, elongation
   factors), not virulence-specific. Model 3 mostly discounts these correctly, but not
   reliably — **chaperonins/heat-shock proteins are the worst case: the typical hit to
   this family already scores above the high-confidence threshold (median 0.856).** ABC
   transporters are the best-behaved (median 0.023). Full breakdown and methodology is in
   the README.

3. **The multi-genome validation attempt failed** (BLAST database missing in that
   session, Pfam features hardcoded to zero) — the numbers from that run should be
   ignored; it needs to be rerun properly before any generalization claims can be made.

4. Several specific technical bugs were found and fixed — full list in the README's
   "Known Issues, Fixed" section (BLAST self-hit leakage, 13-column TSV parsing,
   `hmmscan` vs `hmmsearch` column swap, truncated HMM file, ID-remap mismatches).



---

## How to Get Working Immediately

Use the consolidated loader notebook cell set (already written — ask for it if you don't
have it) which checks `final_vf_predictions_prodigal.csv` first and, if present, loads
everything needed for further analysis without re-running any BLAST, HMMER, embedding
generation, or model training. Regenerating any of these from scratch takes real
time/compute and should only be done if you're intentionally changing the underlying
genome, gene-calling method, or training data.

**Read the full README** (`README.md`, alongside this file) for complete technical detail
on every model, result, and limitation summarized above.
