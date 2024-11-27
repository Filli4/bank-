import { render, screen } from '@testing-library/react';

import Accounts from './../accounts/page';
describe('Accounts', () => {
    it('renders a "Logout" button when the user is logged in', () => {
      // Render the Home component
      render(<Accounts />);
  
      // Check if the "Log In" button is rendered
      const logoutBtn = screen.getByText('Logout');
      expect(logoutBtn).toBeInTheDocument();
    });
  });