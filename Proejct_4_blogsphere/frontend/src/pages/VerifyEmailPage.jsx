import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { authService } from '../services/authService';
import AuthLayout from '../layouts/AuthLayout';
import Spinner from '../components/ui/Spinner';
import { getErrorMessage } from '../utils/formatters';

const VerifyEmailPage = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        await authService.verifyEmail(token);
        setStatus('success');
      } catch (err) {
        setStatus('error');
        setMessage(getErrorMessage(err));
      }
    };
    verify();
  }, [token]);

  return (
    <AuthLayout title="Email verification">
      <div className="flex flex-col items-center text-center py-4">
        {status === 'verifying' && (
          <>
            <Spinner size={32} />
            <p className="mt-4 text-sm text-ink-400">Verifying your email...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <FiCheckCircle size={40} className="text-signal" />
            <p className="mt-4 text-sm text-ink-500">Your email has been verified successfully.</p>
            <Link to="/login" className="btn-primary mt-6 w-full">Continue to login</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <FiXCircle size={40} className="text-rose" />
            <p className="mt-4 text-sm text-ink-500">{message}</p>
            <Link to="/" className="btn-secondary mt-6 w-full">Back to home</Link>
          </>
        )}
      </div>
    </AuthLayout>
  );
};

export default VerifyEmailPage;
