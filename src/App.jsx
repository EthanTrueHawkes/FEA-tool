import { useStore } from './store/useStore';
import ModelTree from './components/ModelTree';
import Viewport from './components/Viewport';
import PropertiesPanel from './components/PropertiesPanel';
import ResultsPanel from './components/ResultsPanel';
import Ribbon from './components/Ribbon';
import GeometryDialog from './components/GeometryDialog';
import LoadDialog from './components/LoadDialog';
import BCDialog from './components/BCDialog';
import SolveDialog from './components/SolveDialog';
import './App.css';

function App() {
  const { resetProject, saveProject, loadProject, results, clearResults } = useStore();

  const handleNew = () => {
    if (confirm('Clear current project?')) {
      resetProject();
    }
  };

  const handleSave = () => {
    saveProject();
    alert('Project saved to browser storage!');
  };

  const handleLoad = () => {
    const loaded = loadProject();
    if (loaded) {
      alert('Project loaded!');
    } else {
      alert('No saved project found.');
    }
  };

  const handleClearResults = () => {
    if (confirm('Clear analysis results?')) {
      clearResults();
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>FEA Prototype</h1>
        <div className="header-actions">
          <button onClick={handleNew}>New</button>
          <button onClick={handleSave}>Save</button>
          <button onClick={handleLoad}>Load</button>
          {results && <button onClick={handleClearResults}>Clear Results</button>}
        </div>
      </header>
      
      <Ribbon />
      
      <div className="main-layout">
        <aside className="left-panel">
          <ModelTree />
        </aside>
        
        <main className="center-panel">
          <Viewport />
        </main>
        
        <aside className="right-panel">
          {results ? <ResultsPanel /> : <PropertiesPanel />}
        </aside>
      </div>

      <GeometryDialog />
      <LoadDialog />
      <BCDialog />
      <SolveDialog />
    </div>
  );
}

export default App;
