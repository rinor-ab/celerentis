import { render, screen } from '@testing-library/react';
import { StatusPill } from '@/components/ui/status-pill';

describe('StatusPill', () => {
  it('renders success status correctly', () => {
    render(<StatusPill status="success" />);
    
    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveClass('bg-success');
  });

  it('renders error status correctly', () => {
    render(<StatusPill status="error" />);
    
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveClass('bg-error');
  });

  it('renders processing status correctly', () => {
    render(<StatusPill status="processing" />);
    
    expect(screen.getByText('Processing')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveClass('bg-brand');
  });

  it('applies custom className', () => {
    render(<StatusPill status="success" className="custom-class" />);
    
    expect(screen.getByRole('status')).toHaveClass('custom-class');
  });
});
