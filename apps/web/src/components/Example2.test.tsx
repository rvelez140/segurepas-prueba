import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '../contexts/ThemeContext';
import { BrowserRouter } from 'react-router-dom';

// Mock component for testing
const TestComponent = () => {
  return (
    <div>
      <h1>SecurePass Test</h1>
      <p>Sistema de Control de Acceso</p>
    </div>
  );
};

describe('ThemeContext Integration', () => {
  it('should render with ThemeProvider', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByText('SecurePass Test')).toBeInTheDocument();
    expect(screen.getByText('Sistema de Control de Acceso')).toBeInTheDocument();
  });
});

describe('Router Integration', () => {
  it('should render with Router', () => {
    render(
      <BrowserRouter>
        <TestComponent />
      </BrowserRouter>
    );

    expect(screen.getByText('SecurePass Test')).toBeInTheDocument();
  });
});

describe('Basic Component Rendering', () => {
  it('should render headings correctly', () => {
    render(<TestComponent />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('SecurePass Test');
  });

  it('should render paragraphs correctly', () => {
    render(<TestComponent />);

    const paragraph = screen.getByText(/Sistema de Control de Acceso/i);
    expect(paragraph).toBeInTheDocument();
  });
});
