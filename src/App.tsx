import { Route, Routes } from 'react-router-dom'
import { Footer } from './components/Footer'
import { Navbar } from './components/Navbar'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ToastViewport } from './components/ToastViewport'
import { ArticlePage } from './pages/ArticlePage'
import { CategoriesAdminPage } from './pages/CategoriesAdminPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { MyArticlesPage } from './pages/MyArticlesPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { RegisterPage } from './pages/RegisterPage'
import { TagsAdminPage } from './pages/TagsAdminPage'
import { WriteArticlePage } from './pages/WriteArticlePage'

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/article/:id" element={<ArticlePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/categories" element={<CategoriesAdminPage />} />
        <Route path="/tags" element={<TagsAdminPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/write" element={<WriteArticlePage />} />
          <Route path="/my-articles" element={<MyArticlesPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
      <ToastViewport />
    </div>
  )
}

export default App
