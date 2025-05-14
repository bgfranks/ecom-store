'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signUpDefaultValues } from '@/lib/constants';
import { signUpUser } from '@/lib/actions/user.actions';
import { useSearchParams } from 'next/navigation';

const CredentialsSignUpForm = () => {
  const [data, action] = useActionState(signUpUser, {
    success: false,
    message: '',
  });

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const SignUpButton = () => {
    const { pending } = useFormStatus();

    return (
      <Button disabled={pending} className='w-full' variant='default'>
        {pending ? 'Creating account...' : 'Sign Up'}
      </Button>
    );
  };

  return (
    <form action={action}>
      <input type='hidden' name='callbackUrl' value={callbackUrl} />
      <div className='space-y-6'>
        <div>
          <Label htmlFor='name' className='pb-1'>
            Name
          </Label>
          <Input
            id='name'
            name='name'
            type='name'
            required
            autoComplete='name'
            placeholder={signUpDefaultValues.name}
          />
        </div>
        <div>
          <Label htmlFor='email' className='pb-1'>
            Email
          </Label>
          <Input
            id='email'
            name='email'
            type='email'
            required
            autoComplete='email'
            placeholder={signUpDefaultValues.email}
          />
        </div>
        <div>
          <Label htmlFor='password' className='pb-1'>
            Password
          </Label>
          <Input
            id='password'
            name='password'
            type='password'
            required
            autoComplete='password'
            placeholder={signUpDefaultValues.password}
          />
        </div>
        <div>
          <Label htmlFor='confirmPassword' className='pb-1'>
            Confirm Password
          </Label>
          <Input
            id='confirmPassword'
            name='confirmPassword'
            type='password'
            required
            autoComplete='confirmPassword'
            placeholder={signUpDefaultValues.password}
          />
        </div>
        <div>
          <SignUpButton />
        </div>
        {data && !data.success && (
          <div className='text-center text-destructive'>{data.message}</div>
        )}
        <div className='text-sm text-center text-muted-foreground'>
          Already have an account?{' '}
          <Link href='/sign-in' target='_self' className='link'>
            Sign In
          </Link>
        </div>
      </div>
    </form>
  );
};

export default CredentialsSignUpForm;
