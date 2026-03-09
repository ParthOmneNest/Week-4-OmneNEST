import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { OtpForm } from './OtpForm';

export const AuthContainer = ({ onLoginSuccess }: { onLoginSuccess: () => void }) => {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('AMITH1'); // Store it here to pass to OTP

  if (step === 1) {
    return <LoginForm 
              username={username} 
              setUsername={setUsername} 
              onNext={() => setStep(2)} 
           />;
  }

  return <OtpForm 
            username={username} 
            onSuccess={onLoginSuccess} 
            onBack={() => setStep(1)} 
         />;
};
