# Q-Chaperon  
### *Interactive Web Platform for Structural Optimization using QAOA Principles*

![status](https://img.shields.io/badge/status-active-success)
![type](https://img.shields.io/badge/type-research-blue)
![domain](https://img.shields.io/badge/domain-quantum%20%7C%20biophysics-purple)
![stack](https://img.shields.io/badge/stack-Three.js%20%7C%20D3.js%20%7C%20Chart.js-black)
![math](https://img.shields.io/badge/math-KaTeX-green)
![frontend](https://img.shields.io/badge/frontend-HTML%20%7C%20CSS%20%7C%20JS-orange)
![design](https://img.shields.io/badge/design-Web3.0%20Minimal-blueviolet)
![license](https://img.shields.io/badge/license-MIT-lightgrey)

---

## Overview

This project is an **interactive simulation website** that explores how **collagen structures can be modeled, perturbed, and repaired** using a **quantum-inspired optimization framework**.

It acts as a **visual + computational companion** to the research concept:

> **A Quantum-Inspired Graph Optimization Framework for Collagen Repair and Structural Longevity**

Instead of treating collagen as static, this system models it as a **dynamic lattice network**, where:

- Local damage propagates across the structure  
- Structural coherence emerges from interactions  
- Repair becomes an **optimization problem**

---

## 🧠 Core Concept

We model collagen as a **graph system**:

- Nodes → structural units  
- Edges → mechanical coupling  
- Damage → perturbations  
- Repair → optimization  

The repair problem is formulated as:

\[
\max \left( \sum_i (\alpha s_i + \beta d_i)x_i + \sum_{(i,j)} \gamma w_{ij} x_i x_j - \lambda \sum_i c_i x_i \right)
\]

and explored using **QAOA-inspired logic**.

---

##  Features

###  Interactive Lattice Simulation
- Dynamic network using **D3.js**
- Real-time node states:
  - intact  
  - damaged  
  - repairing  
  - repaired  

---

###  Perturbation Engine
- Simulates **damage propagation**
- Local disturbances spread across the network
- Models biological stress behavior

---

###  Quantum-Inspired Repair (QAOA Logic)
- Parameterized repair process  
- Energy-based optimization concept  
- Inspired by quantum circuit behavior  

---

###  Real-Time Metrics Dashboard
- Structural coherence score  
- Damage ratio  
- Edge integrity  

---

###  3D Visual System
- Built with **Three.js**
- Collagen-inspired particle field
- Interactive camera movement

---

###  Mathematical Layer
- Equations rendered via **KaTeX**
- Clean, publication-style formatting

---

##  Simulation Logic

### Damage Model
- Probabilistic propagation  
- Depth-based spreading  
- Node and edge degradation  

### Repair Model
- Iterative optimization steps  
- Structural recovery behavior  
- Coupling-aware repair  

### Coherence Metric

\[
C = \frac{1}{N} \sum (1 - D_i) \cdot \frac{\deg(i)}{\text{max\_deg}}
\]

Captures:
- structural integrity  
- connectivity  
- system stability  

---

##  Tech Stack

- HTML5  
- CSS3  
- JavaScript  
- Three.js  
- D3.js  
- Chart.js  
- KaTeX  

---

##  Usage

Run locally:

```bash
git clone https://github.com/IanPapamichail/quantum-collagen-lattice-simulation.git
cd quantum-collagen-lattice-simulation
open index.html
