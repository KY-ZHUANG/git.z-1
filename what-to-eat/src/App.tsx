import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BottomTab } from './components/layout/BottomTab';
import RecipePage from './pages/RecipePage';
import RecipeDetail from './components/recipe/RecipeDetail';
import RecommendationPage from './pages/RecommendationPage';
import HealthPage from './pages/HealthPage';
import AddRecipeForm from './components/recipe/AddRecipeForm';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<RecipePage />} />
          <Route path="/recipe/:id" element={<RecipeDetail />} />
          <Route path="/recipe/add" element={<AddRecipeForm />} />
          <Route path="/recommend" element={<RecommendationPage />} />
          <Route path="/health" element={<HealthPage />} />
        </Routes>
        <BottomTab />
      </div>
    </BrowserRouter>
  );
}

export default App;
