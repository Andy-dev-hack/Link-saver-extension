import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LeadList from './LeadList';
import * as validation from '@/validators';

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Edit2: () => <span data-testid="edit-icon">Edit</span>,
  Trash2: () => <span data-testid="trash-icon">Trash</span>,
  Check: () => <span data-testid="check-icon">Save</span>,
  X: () => <span data-testid="x-icon">Cancel</span>,
  Globe: () => <span data-testid="globe-icon">Globe</span>,
}));

// Mock Context
const mockDeleteLead = vi.fn();
const mockEditLead = vi.fn();

vi.mock('@/context/LeadsContext', () => ({
  useLeadsContext: () => ({
    deleteLead: mockDeleteLead,
    editLead: mockEditLead,
  }),
}));

// Mock Helpers
vi.mock('@/utils', () => ({
  getFaviconUrl: (url) => `https://icon.com/${url}`,
}));

describe('LeadList Component', () => {
  const mockLeads = [
    { id: '1', name: 'Google', url: 'https://google.com' },
    { id: '2', name: 'GitHub', url: 'https://github.com' },
  ];
  const folderId = 'folder-123';

  beforeEach(() => {
    vi.clearAllMocks();
    // Valid name mock
    vi.spyOn(validation, 'isValidName').mockReturnValue(true);
  });

  it('preserves click-to-open behavior', () => {
    render(<LeadList leads={mockLeads} folderId={folderId} isExpanded={true} />);

    const link = screen.getByText('Google');
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', 'https://google.com');
  });

  it('renders correctly with favicons', () => {
    render(<LeadList leads={mockLeads} folderId={folderId} isExpanded={true} />);

    expect(screen.getByText('Google')).toBeInTheDocument();
    expect(screen.getByText('GitHub')).toBeInTheDocument();

    // Images with empty alt are 'presentation' role, so query by tag or testid
    // Here we can simply query by the attribute or add a testid in the component.
    // Let's rely on the fact that we mocked getFaviconUrl.
    const googleFavicon = document.querySelector('img[src="https://icon.com/https://google.com"]');
    const githubFavicon = document.querySelector('img[src="https://icon.com/https://github.com"]');

    expect(googleFavicon).toBeInTheDocument();
    expect(githubFavicon).toBeInTheDocument();
  });

  it('enters edit mode when pencil is clicked', () => {
    render(<LeadList leads={mockLeads} folderId={folderId} isExpanded={true} />);

    const editBtns = screen.getAllByTestId('edit-icon');
    fireEvent.click(editBtns[0]); // Edit Google

    // Input should appear
    const input = screen.getByDisplayValue('Google');
    expect(input).toBeInTheDocument();

    // Save/Cancel buttons should appear
    expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    expect(screen.getByTestId('x-icon')).toBeInTheDocument();
  });

  it('saves changes when check mark is clicked', () => {
    render(<LeadList leads={mockLeads} folderId={folderId} isExpanded={true} />);

    // Start editing
    const editBtns = screen.getAllByTestId('edit-icon');
    fireEvent.click(editBtns[0]);

    // Change value
    const input = screen.getByDisplayValue('Google');
    fireEvent.change(input, { target: { value: 'Google Updated' } });

    // Save
    const saveBtn = screen.getByTestId('check-icon');
    fireEvent.click(saveBtn);

    expect(mockEditLead).toHaveBeenCalledWith(folderId, 0, 'Google Updated');
    // Should exit edit mode
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('cancels changes when X is clicked', () => {
    render(<LeadList leads={mockLeads} folderId={folderId} isExpanded={true} />);

    // Start editing
    const editBtns = screen.getAllByTestId('edit-icon');
    fireEvent.click(editBtns[0]);

    // Change value
    const input = screen.getByDisplayValue('Google');
    fireEvent.change(input, { target: { value: 'Google Cancelled' } });

    // Cancel
    const cancelBtn = screen.getByTestId('x-icon');
    fireEvent.click(cancelBtn);

    expect(mockEditLead).not.toHaveBeenCalled();
    // Should revert to text
    expect(screen.getByText('Google')).toBeInTheDocument();
  });

  it('calls deleteLead when trash is clicked', () => {
    // Mock window.confirm
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<LeadList leads={mockLeads} folderId={folderId} isExpanded={true} />);

    const trashBtns = screen.getAllByTestId('trash-icon');
    fireEvent.click(trashBtns[0]);

    expect(mockDeleteLead).toHaveBeenCalledWith(folderId, 0);
  });
});
