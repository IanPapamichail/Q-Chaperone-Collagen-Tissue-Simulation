// app.js - Main logic for Quantum-Inspired Collagen Lattice Simulation

// ==========================================
// 1. Three.js Hero Canvas Background
// ==========================================
const initThreeJS = () => {
  const container = document.getElementById('three-canvas');
  if (!container) return;

  const scene = new THREE.Scene();
  // Light background
  scene.background = new THREE.Color(0xf0f8ff);
  scene.fog = new THREE.FogExp2(0xf0f8ff, 0.04);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 30;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Create Lattice Structure
  const particles = new THREE.BufferGeometry();
  const particleCount = 1200;
  
  const posArray = new Float32Array(particleCount * 3);
  const colorArray = new Float32Array(particleCount * 3);

  const color1 = new THREE.Color(0x4f46e5); // Accent blue
  const color2 = new THREE.Color(0x7c3aed); // Accent violet

  for(let i = 0; i < particleCount * 3; i+=3) {
    // Cylinder-like distribution for collagen fibrils
    const radius = 10 + Math.random() * 5;
    const theta = Math.random() * Math.PI * 2;
    const y = (Math.random() - 0.5) * 60;
    
    posArray[i] = Math.cos(theta) * radius;
    posArray[i+1] = y;
    posArray[i+2] = Math.sin(theta) * radius;

    const mixedColor = color1.clone().lerp(color2, Math.random());
    colorArray[i] = mixedColor.r;
    colorArray[i+1] = mixedColor.g;
    colorArray[i+2] = mixedColor.b;
  }

  particles.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  particles.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

  const material = new THREE.PointsMaterial({
    size: 0.15,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  });

  const particleMesh = new THREE.Points(particles, material);
  
  // Rotate group slightly to be diagonal
  particleMesh.rotation.z = Math.PI / 4;
  scene.add(particleMesh);

  // Lines connecting close particles (edges)
  const lineMaterial = new THREE.LineBasicMaterial({ 
    color: 0x4f46e5, 
    transparent: true, 
    opacity: 0.1 
  });
  
  // Mouse Interaction
  let mouseX = 0;
  let mouseY = 0;
  
  document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
  });

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    particleMesh.rotation.y = elapsedTime * 0.01;
    particleMesh.rotation.z = (Math.PI / 4) + elapsedTime * 0.005;
    
    // Parallax effect with mouse
    camera.position.x += (mouseX * 5 - camera.position.x) * 0.02;
    camera.position.y += (mouseY * 5 - camera.position.y) * 0.02;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
};

// ==========================================
// 2. D3.js Grid/Lattice Simulation
// ==========================================
const initSimulation = () => {
  const container = document.getElementById('d3-canvas');
  if (!container) return;

  const width = container.clientWidth;
  const height = container.clientHeight;

  // Setup SVG
  const svg = d3.select('#d3-canvas')
    .append('svg')
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('viewBox', [0, 0, width, height]);

  // Generate Hexagonal / Grid Lattice
  let nodes = [];
  let links = [];
  const rows = 8;
  const cols = 15;
  const xOffset = 60;
  const yOffset = 60;
  const startX = (width - (cols-1)*xOffset) / 2;
  const startY = (height - (rows-1)*yOffset) / 2;

  // Initialize nodes
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      nodes.push({
        id: r * cols + c,
        x: startX + c * xOffset + (r % 2 === 0 ? 0 : xOffset/2),
        y: startY + r * yOffset,
        health: 1.0,      // 1.0 = healthy, 0.0 = damaged
        status: 'intact', // intact, damaged, repairing, repaired
        type: 'tropocollagen'
      });
    }
  }

  // Initialize links (Hexagonal tight packing)
  nodes.forEach(n1 => {
    nodes.forEach(n2 => {
      if (n1.id >= n2.id) return;
      const dx = n1.x - n2.x;
      const dy = n1.y - n2.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      // Connect to neighbors within a certain radius
      if (dist < xOffset * 1.5) {
        links.push({
          source: n1.id,
          target: n2.id,
          intact: true
        });
      }
    });
  });

  // Tooltip
  const tooltip = d3.select("body").append("div")
    .attr("class", "d3-tooltip");

  // Force simulation to hold them generally in place but allow some organic jiggle
  const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id).distance(xOffset).strength(0.8))
    .force("charge", d3.forceManyBody().strength(-200))
    .force("x", d3.forceX(d => d.x).strength(0.2))
    .force("y", d3.forceY(d => d.y).strength(0.2))
    .on("tick", ticked);

  // Render elements
  let linkElements = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(links)
    .enter().append("line")
    .attr("stroke", d => d.intact ? "rgba(255, 255, 255, 0.15)" : "rgba(239, 68, 68, 0.1)")
    .attr("stroke-width", 2);

  let nodeElements = svg.append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(nodes)
    .enter().append("circle")
    .attr("r", 8)
    .attr("fill", "#10b981")
    .attr("stroke", "#050507")
    .attr("stroke-width", 2)
    .style("cursor", "pointer")
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));

  nodeElements
    .on("mouseover", (event, d) => {
      tooltip.transition().duration(200).style("opacity", 1);
      tooltip.html(`ID: ${d.id}<br/>Health: ${(d.health*100).toFixed(0)}%<br/>Status: ${d.status}`)
        .style("left", (event.pageX + 15) + "px")
        .style("top", (event.pageY - 28) + "px");
      
      d3.select(event.currentTarget).attr("r", 12).attr("stroke", "#f59e0b");
    })
    .on("mouseout", (event, d) => {
      tooltip.transition().duration(500).style("opacity", 0);
      d3.select(event.currentTarget).attr("r", 8).attr("stroke", "#050507");
    })
    .on("click", (event, d) => {
      // Manual perturbation
      applyDamage(d.id, 0.5); // Spread damage locally
    });

  function ticked() {
    linkElements
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);
    nodeElements
      .attr("cx", d => d.x)
      .attr("cy", d => d.y);
  }

  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  // Visual Update Loop
  const updateVisuals = () => {
    nodeElements
      .transition().duration(300)
      .attr("fill", d => {
        if (d.status === 'damaged') return "#ef4444";
        if (d.status === 'repairing') return "#f59e0b";
        if (d.status === 'repaired') return "#4f46e5";
        return "#10b981"; // intact
      });

    linkElements
      .transition().duration(300)
      .attr("stroke", d => d.intact ? "rgba(255,255,255,0.15)" : "rgba(239, 68, 68, 0.2)")
      .attr("stroke-dasharray", d => d.intact ? "none" : "5,5");

    updateMetrics();
  };

  const logStep = (msg, color = 'var(--text-main)') => {
    const logPanel = document.getElementById('process-log');
    if (!logPanel) return;
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.style.color = color;
    entry.innerText = msg;
    logPanel.prepend(entry);
    
    if (logPanel.children.length > 50) {
      logPanel.removeChild(logPanel.lastChild);
    }
  };

  // Logic: Damage
  const applyDamage = (centerId, probability) => {
    const centerNode = nodes.find(n => n.id === centerId);
    if (!centerNode) return;
    
    document.getElementById('sim-status').innerText = 'PERTURBATION ACTIVE';
    document.getElementById('sim-status').style.color = '#ef4444';

    logStep(`[!] Mechanical Stress Simulation Initiated at node ${centerId}`, '#ef4444');

    // BFS limit depth to mimic localized shockwave
    let queue = [centerNode];
    let visited = new Set([centerId]);
    let depth = 0;
    const maxDepth = 3;

    const expandDamage = () => {
      if (queue.length === 0 || depth > maxDepth) {
        document.getElementById('sim-status').innerText = 'IDLE';
        document.getElementById('sim-status').style.color = 'var(--text-main)';
        logStep(`[✓] Shockwave dissipated. Perturbation complete.`, 'var(--text-muted)');
        return;
      }
      
      let nextQueue = [];
      let damageCount = 0;

      queue.forEach(n => {
        if (Math.random() < probability) {
          n.health = Math.max(0, n.health - (0.5 - depth*0.1));
          if (n.health < 0.5) {
             n.status = 'damaged';
             damageCount++;
          }
          
          links.forEach(l => {
            if ((l.source.id === n.id || l.target.id === n.id) && Math.random() < probability * 1.5) {
              l.intact = false;
            }
          });
        }

        // Find neighbors
        links.forEach(l => {
          let neighbor = null;
          if (l.source.id === n.id) neighbor = l.target;
          else if (l.target.id === n.id) neighbor = l.source;

          if (neighbor && !visited.has(neighbor.id)) {
            visited.add(neighbor.id);
            nextQueue.push(neighbor);
          }
        });
      });

      if(damageCount > 0) logStep(`Propagating wave depth ${depth}: ${damageCount} tropocollagen node(s) destabilized.`);

      queue = nextQueue;
      depth++;
      updateVisuals();
      
      setTimeout(expandDamage, 200);
    };

    expandDamage();
  };

  // Logic: Quantum Repair
  const simulateQAOA = (pDepth) => {
    document.getElementById('sim-status').innerText = `QAOA REPAIR (p=${pDepth})`;
    document.getElementById('sim-status').style.color = '#007fff';
    logStep(`Initializing QAOA Ansatz with depth p=${pDepth}`, '#007fff');
    logStep(`Mapping damaged cross-links to cost Hamiltonian...`, '#007fff');

    // Find all damaged disconnected subgraphs
    let damagedNodes = nodes.filter(n => n.status === 'damaged');
    
    let step = 0;
    const repairStep = () => {
      if (step >= pDepth || damagedNodes.length === 0) {
        document.getElementById('sim-status').innerText = 'IDLE';
        document.getElementById('sim-status').style.color = 'var(--text-main)';
        logStep(`[✓] QAOA routine finished. Coherence maximized.`, '#10b981');
        return;
      }

      logStep(`Applying quantum layer ${step + 1}: minimizing free energy of severed bonds...`);

      // Simulate one layer of QAOA ansatz: repair likely paths
      damagedNodes.forEach(n => {
        n.status = 'repairing';
        n.health = Math.min(1.0, n.health + 0.3);
      });
      updateVisuals();

      setTimeout(() => {
        let repairedThisStep = 0;
        damagedNodes.forEach(n => {
          if (n.health >= 0.8) {
            n.status = 'repaired';
            repairedThisStep++;
            // Restore links
            links.forEach(l => {
              if (l.source.id === n.id || l.target.id === n.id) {
                l.intact = true;
              }
            });
          }
        });
        if(repairedThisStep > 0) logStep(`Restored ${repairedThisStep} tropocollagen bonds via energy optimization.`);

        damagedNodes = nodes.filter(n => n.status === 'damaged' || n.status === 'repairing');
        step++;
        updateVisuals();
        
        if(damagedNodes.length > 0) setTimeout(repairStep, 600);
        else {
           document.getElementById('sim-status').innerText = 'IDLE';
           document.getElementById('sim-status').style.color = 'var(--text-main)';
           logStep(`[✓] Repair complete. All nodes restored.`, '#10b981');
        }
      }, 600);
    };

    repairStep();
  };

  // UI Event Listeners
  const probSlider = document.getElementById('prob-slider');
  const depthSlider = document.getElementById('depth-slider');

  probSlider.addEventListener('input', e => { document.getElementById('prob-val').innerText = e.target.value; });
  depthSlider.addEventListener('input', e => { document.getElementById('depth-val').innerText = e.target.value; });

  document.getElementById('btn-perturb').addEventListener('click', () => {
    // Pick random node
    const randomId = nodes[Math.floor(Math.random() * nodes.length)].id;
    applyDamage(randomId, parseFloat(probSlider.value));
  });

  document.getElementById('btn-repair').addEventListener('click', () => {
    simulateQAOA(parseInt(depthSlider.value));
  });

  document.getElementById('btn-reset').addEventListener('click', () => {
    logStep(`Resetting lattice to stable ground state...`, 'var(--health-repair)');
    nodes.forEach(n => {
      n.health = 1.0;
      n.status = 'intact';
    });
    links.forEach(l => l.intact = true);
    updateVisuals();
    setTimeout(() => logStep('Lattice reconstructed successfully.', '#10b981'), 300);
  });

  // Init metrics
  updateVisuals();

  // Export functions to window for other components if needed
  window.simNodes = nodes;
  window.simLinks = links;
};

// ==========================================
// 3. Chart.js Analytics & Metrics
// ==========================================
let coherenceChart, distrChart;
let timeData = [], coherenceData = [];

const initCharts = () => {
  const ctxCoherence = document.getElementById('coherenceChart');
  const ctxDistr = document.getElementById('distributionChart');

  if (!ctxCoherence || !ctxDistr) return;

  // Chart defaults for dark theme
  Chart.defaults.color = '#475569';
  Chart.defaults.font.family = "'IBM Plex Mono', monospace";
  
  coherenceChart = new Chart(ctxCoherence, {
    type: 'line',
    data: {
      labels: Array(20).fill(''),
      datasets: [{
        label: 'System Coherence',
        data: Array(20).fill(1.0),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { min: 0, max: 1.1, grid: { color: 'rgba(255,255,255,0.05)' } },
        x: { grid: { display: false } }
      },
      animation: { duration: 0 }
    }
  });

  distrChart = new Chart(ctxDistr, {
    type: 'bar',
    data: {
      labels: ['Intact', 'Repaired', 'Repairing', 'Damaged'],
      datasets: [{
        data: [120, 0, 0, 0],
        backgroundColor: [
          '#10b981',
          '#4f46e5',
          '#f59e0b',
          '#ef4444'
        ],
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
        x: { grid: { display: false } }
      }
    }
  });
};

const updateMetrics = () => {
  if (!window.simNodes || !window.simLinks) return;
  const nodes = window.simNodes;
  const links = window.simLinks;

  const total = nodes.length;
  let intactEdges = links.filter(l => l.intact).length;
  let damagedNodes = nodes.filter(n => n.status === 'damaged').length;
  let repairedNodes = nodes.filter(n => n.status === 'repaired').length;
  let repairingNodes = nodes.filter(n => n.status === 'repairing').length;
  let intactNodes = nodes.filter(n => n.status === 'intact').length;

  const damageRatio = (damagedNodes / total) * 100;
  
  // Coherence proxy: (intact nodes + repaired*0.9) * (intact edges/total edges)
  const maxEdges = links.length;
  const coherence = maxEdges > 0 ? ((intactNodes + repairedNodes * 0.9) / total) * (intactEdges / maxEdges) : 1;

  document.getElementById('metric-nodes').innerText = total;
  document.getElementById('metric-edges').innerText = intactEdges;
  
  const drEl = document.getElementById('metric-damage');
  drEl.innerText = damageRatio.toFixed(1) + '%';
  drEl.style.color = damageRatio > 20 ? '#ef4444' : (damageRatio > 0 ? '#f59e0b' : '#e8e8f0');

  const cohEl = document.getElementById('metric-coherence');
  cohEl.innerText = coherence.toFixed(2);
  cohEl.style.color = coherence > 0.8 ? '#10b981' : (coherence > 0.4 ? '#f59e0b' : '#ef4444');

  // Update Charts
  if (coherenceChart && distrChart) {
    const data = coherenceChart.data.datasets[0].data;
    data.shift();
    data.push(coherence);
    
    // Update color based on value
    if(coherence < 0.4) coherenceChart.data.datasets[0].borderColor = '#ef4444';
    else if(coherence < 0.8) coherenceChart.data.datasets[0].borderColor = '#f59e0b';
    else coherenceChart.data.datasets[0].borderColor = '#10b981';

    coherenceChart.update();

    distrChart.data.datasets[0].data = [intactNodes, repairedNodes, repairingNodes, damagedNodes];
    distrChart.update();
  }
};


// ==========================================
// Initialization
// ==========================================
window.onload = () => {
  initThreeJS();
  initCharts();
  initSimulation(); // Note: initSimulation populates window.simNodes which updateMetrics needs
};
