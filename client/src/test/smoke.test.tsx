import React from 'react';
import { render, screen } from '@testing-library/react';

describe('smoke test', () => {
  it('renders basic hello element', () => {
    render(<div>Hello</div>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});

