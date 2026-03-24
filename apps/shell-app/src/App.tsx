import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ApolloProvider } from "@apollo/client";
import { client } from "./apollo/client";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

const ProjectsApp = () => <h2>Projects MFE</h2>;
const AIReviewApp = () => <h2>AI Review MFE</h2>;

function App() {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route
                path="/projects"
                element={
                  <ProtectedRoute>
                    <ProjectsApp />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/ai-review"
                element={
                  <ProtectedRoute>
                    <AIReviewApp />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AuthProvider>
    </ApolloProvider>
  );
}

export default App;
