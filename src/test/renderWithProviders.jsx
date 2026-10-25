import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { FavoritesProvider } from '../context/FavoritesContext.jsx';
import Layout from '../components/Layout.jsx';
import HomePage from '../pages/HomePage.jsx';
import RecipePage from '../pages/RecipePage.jsx';
import FavoritesPage from '../pages/FavoritesPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import ErrorTestPage from '../pages/ErrorTestPage.jsx';

// Monta l'app vera (rotte, layout, Context) partendo da un indirizzo
export function renderApp(url = '/') {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <FavoritesProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="ricetta/:id" element={<RecipePage />} />
            <Route path="preferiti" element={<FavoritesPage />} />
            <Route path="prova-errore" element={<ErrorTestPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </FavoritesProvider>
    </MemoryRouter>
  );
}

export function renderWithProviders(ui) {
  return render(
    <MemoryRouter>
      <FavoritesProvider>{ui}</FavoritesProvider>
    </MemoryRouter>
  );
}
