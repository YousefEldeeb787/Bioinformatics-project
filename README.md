# Bioinformatics-project
# Project Data Overview

This directory contains the data files used and generated during the bioinformatics project. 

## Data Files

### Input Data
These are the initial datasets used to start the analysis:

*   `test_sample.fna`: The initial genome contigs in FASTA format.
*   `VF_positive_subset_final_2.faa`: A FASTA file containing protein sequences known to be Virulence Factors (VF), used for training the ML model.
*   `VF_negative_subset_final.faa`: A FASTA file containing protein sequences known *not* to be Virulence Factors, used for training the ML model.

### Generated Data
These files are produced during the analysis pipeline:

*   `predicted_orfs.faa`: A FASTA file containing all Predicted Open Reading Frames (ORFs) extracted from `test_sample.fna`.
*   `ORF_ML_predictions.csv`: A CSV file containing the Machine Learning predictions (including probability and binary classification) for each predicted ORF.
*   `pfam_hits.tbl`: The tabular output from `hmmscan` against the Pfam-A database, listing identified protein domains in the predicted ORFs.

### External Database Files (Large Files)
These files are external databases downloaded and used during the analysis. Due to their size, they are typically managed with Git Large File Storage (Git LFS) or stored externally, with links provided in `data_links.txt`.

*   `vfdb_proteins.faa`: The Virulence Factor Database (VFDB) protein sequences, used for BLAST comparison.
*   `Pfam-A.hmm`: The Pfam-A HMM (Hidden Markov Model) database, used for domain prediction with HMMER.

## Managing Large Files with Git LFS

For `vfdb_proteins.faa` and `Pfam-A.hmm`, it is highly recommended to use [Git Large File Storage (Git LFS)](https://git-lfs.com/) if you intend to include them in your repository directly. This is because standard Git repositories are not optimized for very large binary files, and GitHub has file size limits.

To use Git LFS:
1.  Install Git LFS: `git lfs install`
2.  Track the large files: `git lfs track "*.faa"` and `git lfs track "*.hmm"` (or specifically track the files by name).
3.  Add, commit, and push as usual. Git LFS will handle the storage of the large files.

Alternatively, these large database files can be downloaded dynamically during project setup, or links to their download locations can be provided in `data_links.txt`.
