import './App.css';
import SevenFloorBuilding from './Components/3D_scene';
import { BrowserRouter, Route, Routes } from 'react-router-dom';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/3D-Modeling-Building/" element={<SevenFloorBuilding />} />
      </Routes>

    </BrowserRouter>
  );
}

export default App;
