import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ColorWorldSplit from '../ColorWorldSplit';

describe('ColorWorldSplit', () => {
  it('renders main menu by default', () => {
    render(<ColorWorldSplit />);

    // Check for main menu elements
    expect(screen.getByText('Choose Image')).toBeInTheDocument();
    expect(screen.getByText('Try Demo')).toBeInTheDocument();
    expect(screen.getByText('Color World Split')).toBeInTheDocument();
  });

  it('displays upload content', () => {
    render(<ColorWorldSplit />);

    // Check for upload content
    expect(
      screen.getByText(
        'Upload a vibrant landscape image to experience the colorblind simulation'
      )
    ).toBeInTheDocument();
  });

  it('has proper button elements', () => {
    render(<ColorWorldSplit />);

    // Check for proper button elements
    expect(
      screen.getByRole('button', { name: 'Try Demo' })
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Choose Image')).toBeInTheDocument();
  });
});
