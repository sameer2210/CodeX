import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import { ThemeProvider } from '../../context/ThemeContext';
import { loginUser } from '../../store/slices/authSlice';
import Login from '../../views/auth/Login';

// Mock the loginUser async thunk
vi.mock('../../store/slices/authSlice', async () => {
  const actual = await vi.importActual('../../store/slices/authSlice');
  return {
    ...actual,
    loginUser: vi.fn(),
  };
});

// Mock hooks
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => vi.fn(),
    };
});


const mockStore = configureStore([]);

describe('Login Component', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      auth: {
        isLoading: false,
        error: null,
        isAuthenticated: false,
      },
    });

    // Reset mocks
    vi.clearAllMocks();

    // Setup loginUser mock implementation
    loginUser.mockImplementation(() => ({
        type: 'auth/loginUser',
        payload: null
    }));
    // We need to mock the dispatch return value for the component's logic
    store.dispatch = vi.fn().mockResolvedValue({ type: 'auth/loginUser/fulfilled', payload: {} });
  });

  const renderComponent = () =>
    render(
      <Provider store={store}>
        <ThemeProvider>
          <MemoryRouter>
            <Login />
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    );

  it('renders login form elements', () => {
    renderComponent();

    expect(screen.getByText(/CODEX \/ SYSTEMS/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/ENTER YOUR NAME/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/eg. ALPHA \/ OMEGA/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/SECURE ACCESS KEY/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Confirm Access/i })).toBeInTheDocument();
  });

  it('updates input fields', () => {
    renderComponent();

    const usernameInput = screen.getByPlaceholderText(/ENTER YOUR NAME/i);
    const teamNameInput = screen.getByPlaceholderText(/eg. ALPHA \/ OMEGA/i);
    const passwordInput = screen.getByPlaceholderText(/SECURE ACCESS KEY/i);

    fireEvent.change(usernameInput, { target: { value: 'TestUser' } });
    fireEvent.change(teamNameInput, { target: { value: 'TestTeam' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(usernameInput.value).toBe('TestUser');
    expect(teamNameInput.value).toBe('TestTeam');
    expect(passwordInput.value).toBe('password123');
  });

  it('shows error when submitting empty form', async () => {
    renderComponent();

    const submitButton = screen.getByRole('button', { name: /Confirm Access/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
        expect(screen.getByText(/Please complete all required fields/i)).toBeInTheDocument();
    });
  });
});
