import ColorWorldSplit from './components/ColorWorldSplit';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <div className='App'>
        <ColorWorldSplit />
      </div>
    </ErrorBoundary>
  );
}

export default App;
