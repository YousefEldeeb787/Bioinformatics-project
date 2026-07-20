Below is the condensed and updated README, incorporating a placeholder for your model weights.

***

# Advanced Virulence Factor Discovery Pipeline

## Project Overview

This project implements a state-of-the-art computational framework for identifying and validating Virulence Factors (VFs) in bacterial genomes. Evolving from a baseline heuristic pipeline, the current architecture integrates Protein Language Models, Attention Mechanisms, and Genomic Context Encoders to resolve the methodological limitations outlined in the initial project scope.

## Core Architecture

1. **Gene Encoder (Transformer + Attention Pooling):** Utilizes the ESM-2 pre-trained model with a custom Attention Pooling layer and Contrastive Loss to capture complex structural patterns and evolutionarily conserved residues without manual alignment.
2. **Genomic Context Encoder:** A Transformer-based module that analyzes 10kb genomic windows to learn spatial relationships between neighboring genes (e.g., secretion machinery proximity).
3. **Homology & Domain Validation:** Integrates BLASTp (VFDB) and HMMer (Pfam) to establish external biological ground truth and identify functional domains.
4. **XGBoost Meta-Model:** Replaces arbitrary fixed-scoring matrices with a dynamically weighted classifier that fuses deep learning embeddings, homology E-values, and genomic context features.

## Resolution of Documented Issues

| Original Issue / Enhancement | Methodological Resolution |
| :--- | :--- |
| **Problem 2: Simplistic SignalP** | Replaced 40% accurate hydrophobicity counting with Transformer Attention Pooling, which natively learns complex N-terminal signal peptide grammars. |
| **Problem 3: Arbitrary Scoring Weights** | Deprecated fixed weights. The XGBoost Meta-Model dynamically calculates statistically justified feature importance. |
| **Enhancement 3: Genomic Context** | Implemented the `GenomicWindowEncoder` to automate context scoring and detect virulence gene clusters. |
| **Enhancement 5: Pathogenicity Islands** | Integrated GC Content Deviation and Pfam-based Mobile Element Marker detection to identify horizontally transferred DNA. |
| **Enhancement 6: PSSM Conservation** | Attention weights act as a dynamic, alignment-free Position-Specific Scoring Matrix, highlighting critical active sites. |

## Current Pipeline Status

* **Completed:** Deep learning foundation (Stage 1 & 2 training), genome processing (Prodigal ORF prediction), feature extraction (Transformer embeddings, BLAST, HMMer), and intermediate visualizations.
* **Next Steps:** Constructing the final feature matrix, training the XGBoost Meta-Model, executing final inference, and generating Pathogenicity Island (PAI) candidate reports.

## Model & Checkpoints

The trained model weights, including the Gene Encoder and Genomic Window Encoder, are saved in the checkpoint file.

**[Download Trained Model Weights (`vf_pipeline_checkpoint.pth`)](<INSERT_YOUR_MODEL_LINK_HERE>)**

## Prerequisites

* **Platform:** Google Colab (GPU recommended).
* **Key Libraries:** `PyTorch`, `Transformers`, `Biopython`, `XGBoost`, `Scikit-learn`.
* **External Tools:** `Prodigal`, `NCBI BLAST+`, `HMMER`.
