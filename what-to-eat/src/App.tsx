import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BottomTab } from './components/layout/BottomTab';
import RecipePage from './pages/RecipePage';
import RecipeDetail from './components/recipe/RecipeDetail';
import RecommendationPage from './pages/RecommendationPage';
import HealthPage from './pages/HealthPage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<RecipePage />} />
          <Route path="/recipe/:id" element={<RecipeDetail />} />
          <Route path="/recommend" element={<RecommendationPage />} />
          <Route path="/health" element={<HealthPage />} />
        </Routes>
        <BottomTab />
      </div>
    </BrowserRouter>
  );
}

export default App;
