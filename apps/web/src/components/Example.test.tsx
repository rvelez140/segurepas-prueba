import { render, screen } from '@testing-library/react';
import React from 'react';

// Componente de ejemplo para testing
const ExampleComponent: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div>
      <h1>{title}</h1>
      <p>Este es un componente de ejemplo para demostrar la configuración de testing</p>
    </div>
  );
};

describe('Example Component', () => {
  it('should render the title', () => {
    render(<ExampleComponent title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('should render the description text', () => {
    render(<ExampleComponent title="Test Title" />);
    expect(
      screen.getByText(
        'Este es un componente de ejemplo para demostrar la configuración de testing'
      )
    ).toBeInTheDocument();
  });

  it('should have a heading element', () => {
    render(<ExampleComponent title="Test Title" />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
  });
});

describe('Example Snapshot Test', () => {
  it('should match snapshot', () => {
    const { container } = render(<ExampleComponent title="Snapshot Test" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
