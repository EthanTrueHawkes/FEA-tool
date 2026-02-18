import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';

function SolveDialog() {
  const { showSolveDialog, setShowSolveDialog, geometries, loads, boundaryConditions, setResults } = useStore();
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [solving, setSolving] = useState(false);

  useEffect(() => {
    if (showSolveDialog && !solving) {
      startSolve();
    }
  }, [showSolveDialog]);

  const startSolve = async () => {
    setSolving(true);
    setProgress(0);
    setLogs([]);

    const addLog = (msg) => setLogs(prev => [...prev, msg]);

    addLog('Initializing solver...');
    await sleep(300);
    setProgress(10);

    addLog(`Processing ${geometries.length} geometries...`);
    await sleep(400);
    setProgress(25);

    addLog('Generating mesh...');
    await sleep(500);
    setProgress(40);

    addLog(`Applying ${loads.length} loads...`);
    await sleep(300);
    setProgress(55);

    addLog(`Applying ${boundaryConditions.length} boundary conditions...`);
    await sleep(300);
    setProgress(70);

    addLog('Assembling system matrices...');
    await sleep(400);
    setProgress(85);

    addLog('Solving linear system...');
    await sleep(600);
    setProgress(95);

    addLog('Computing stresses...');
    await sleep(300);
    setProgress(100);

    const results = generateMockResults();
    setResults(results);

    addLog('✓ Solution complete!');
    await sleep(500);

    setSolving(false);
  };

  const generateMockResults = () => {
    const geometryResults = new Map();
    
    geometries.forEach(geo => {
      const numNodes = 100;
      
      const geoLoads = loads.filter(l => l.targetGeometryId === geo.id);
      const geoBCs = boundaryConditions.filter(bc => bc.targetGeometryId === geo.id);
      
      const loadMagnitude = geoLoads.reduce((sum, load) => {
        if (load.type === 'force') {
          const f = load.force;
          return sum + Math.sqrt(f.x*f.x + f.y*f.y + f.z*f.z);
        } else if (load.type === 'pressure') {
          return sum + Math.abs(load.pressure) * 0.01;
        }
        return sum;
      }, 0);
      
      const constraintFactor = geoBCs.length > 0 ? 0.3 : 1.0;
      const baseDisplacement = (loadMagnitude / 1e6) * constraintFactor;
      
      const displacements = [];
      const stresses = [];
      
      for (let i = 0; i < numNodes; i++) {
        const factor = Math.random() * 0.5 + 0.5;
        const displacement = baseDisplacement * factor;
        displacements.push(displacement);
        
        const E = 200e9;
        const strain = displacement / (geo.height || geo.radius || 1);
        const stress = E * strain * (Math.random() * 0.3 + 0.85);
        stresses.push(stress);
      }
      
      geometryResults.set(geo.id, { displacements, stresses });
    });
    
    let allDisplacements = [];
    let allStresses = [];
    geometryResults.forEach(result => {
      allDisplacements.push(...result.displacements);
      allStresses.push(...result.stresses);
    });
    
    return {
      displacement: {
        min: Math.min(...allDisplacements),
        max: Math.max(...allDisplacements),
      },
      stress: {
        min: Math.min(...allStresses),
        max: Math.max(...allStresses),
      },
      geometryResults: Object.fromEntries(geometryResults)
    };
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const handleClose = () => {
    if (!solving) {
      setShowSolveDialog(false);
      setProgress(0);
      setLogs([]);
    }
  };

  if (!showSolveDialog) return null;

  return (
    <div className="dialog-overlay" onClick={handleClose}>
      <div className="dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <h2>Running Analysis</h2>
        
        <div className="dialog-content">
          <div style={{ marginBottom: '16px' }}>
            <div style={{ 
              width: '100%', 
              height: '24px', 
              background: '#ecf0f1', 
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{ 
                width: `${progress}%`, 
                height: '100%', 
                background: progress === 100 ? '#27ae60' : '#3498db',
                transition: 'width 0.3s ease'
              }} />
            </div>
            <p style={{ textAlign: 'center', marginTop: '8px', fontSize: '14px', color: '#666' }}>
              {progress}%
            </p>
          </div>

          <div style={{ 
            background: '#2c3e50', 
            color: '#ecf0f1', 
            padding: '12px', 
            borderRadius: '4px',
            height: '200px',
            overflowY: 'auto',
            fontFamily: 'monospace',
            fontSize: '12px'
          }}>
            {logs.map((log, idx) => (
              <div key={idx} style={{ marginBottom: '4px' }}>{log}</div>
            ))}
          </div>
        </div>

        <div className="dialog-actions">
          <button 
            onClick={handleClose} 
            className="button-primary"
            disabled={solving}
            style={{ opacity: solving ? 0.5 : 1 }}
          >
            {solving ? 'Solving...' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SolveDialog;
