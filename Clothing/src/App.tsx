import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { StoreProvider } from './lib/store'
import { RootLayout } from './layout/RootLayout'
import { HomePage } from './pages/HomePage'

/* Route-level code splitting keeps the first paint of the homepage light. */
const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'shop',
        lazy: async () => ({ Component: (await import('./pages/ShopPage')).ShopPage }),
      },
      {
        path: 'product/:slug',
        lazy: async () => ({ Component: (await import('./pages/ProductPage')).ProductPage }),
      },
      {
        path: 'lookbook',
        lazy: async () => ({ Component: (await import('./pages/LookbookPage')).LookbookPage }),
      },
      {
        path: 'our-story',
        lazy: async () => ({ Component: (await import('./pages/StoryPage')).StoryPage }),
      },
      {
        path: 'cart',
        lazy: async () => ({ Component: (await import('./pages/CartPage')).CartPage }),
      },
      {
        path: 'policies/:slug',
        lazy: async () => ({ Component: (await import('./pages/PolicyPage')).PolicyPage }),
      },
      {
        path: '*',
        lazy: async () => ({ Component: (await import('./pages/NotFoundPage')).NotFoundPage }),
      },
    ],
  },
])

export default function App() {
  return (
    <StoreProvider>
      <RouterProvider router={router} />
    </StoreProvider>
  )
}
