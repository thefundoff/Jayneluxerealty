import { useRouter, Router } from './lib/router';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Properties } from './pages/Properties';
import { PropertyDetails } from './pages/PropertyDetails';
import { Contact } from './pages/Contact';
import { Admin } from './pages/Admin';
import { About } from './pages/About';
import { Careers } from './pages/Careers';

function App() {
  const { currentRoute, params, navigate } = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation currentRoute={currentRoute} />
      <div className="flex-grow">
        <Router route={currentRoute}>
          {{
            home: <Home />,
            properties: <Properties onPropertyClick={(id) => navigate(`/property/${id}`)} />,
            property: params.propertyId ? (
              <PropertyDetails
                propertyId={params.propertyId}
                onBack={() => navigate('/')}
              />
            ) : (
              <Properties onPropertyClick={(id) => navigate(`/property/${id}`)} />
            ),
            contact: <Contact />,
            admin: <Admin />,
            about: <About />,
            careers: <Careers />,
          }}
        </Router>
      </div>
      {currentRoute !== 'admin' && <Footer />}
    </div>
  );
}

export default App;
