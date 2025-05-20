import { XCircle } from 'lucide-react';

type Response =
  | {
      success: boolean;
      message: string;
    }
  | {
      success: boolean;
      message: Promise<unknown>;
    };

const ErrorToast = ({ res }: { res: Response }) => {
  return (
    <div className='flex gap-4 items-center bg-destructive text-white py-3 px-4 rounded-lg shadow-xl'>
      <div className=''>
        <XCircle className='w-5 h-5' />
      </div>
      <div className='flex flex-col items-start'>
        <span className='text-sm'>{res.message.toString()}</span>
        <span className='text-xs text-gray-200 text-center'>
          Please try again later
        </span>
      </div>
    </div>
  );
};

export default ErrorToast;
