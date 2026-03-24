import { Container, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <Container className="text-center mt-5">
      <h1 className="mb-3">Welcome to DevPilot</h1>
      <p className="mb-4">
        An AI-augmented developer collaboration platform.
      </p>

      <div className="d-flex justify-content-center gap-3">
        <Button as={Link} to="/login" variant="primary">
          Login
        </Button>

        <Button as={Link} to="/register" variant="outline-primary">
          Register
        </Button>
      </div>
    </Container>
  );
};

export default Home;