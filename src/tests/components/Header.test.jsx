import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Header from '../../components/Header';

describe('Header Component', () => {
    it('renders the title correctly', () => {
        render(<Header />);
        expect(screen.getByText('LINK SAVER v1')).toBeInTheDocument();
    });
});
