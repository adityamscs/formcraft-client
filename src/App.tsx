import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FormBuilder from './components/FormBuilder';
import FormPreview from './components/FormPreview';
import FormList from './components/FormList';
import Navbar from './components/Navbar';

function App() {

  return (
    <Router>
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto px-6 py-12">
          <Routes>
            <Route path="/" element={<FormList />} />
            <Route path="/builder" element={<FormBuilder />} />
            <Route path="/builder/:id" element={<FormBuilder />} />
            <Route path="/preview/:shareLink" element={<FormPreview />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
