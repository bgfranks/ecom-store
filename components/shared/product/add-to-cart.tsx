'use client';
import { useRouter } from 'next/navigation';
import { Cart, CartItem } from '@/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Plus, Minus, Loader } from 'lucide-react';
import { addItemToCart, RemoveItemFromCart } from '@/lib/actions/cart.actions';
import { useTransition } from 'react';
import ErrorToast from '@/components/ui/error-toast';

const AddToCart = ({ item, cart }: { item: CartItem; cart?: Cart }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleAddToCart = async () => {
    startTransition(async () => {
      const res = await addItemToCart(item);

      if (!res.success) {
        toast(<ErrorToast res={res} />, {
          unstyled: true,
        });
        return;
      }

      toast.success(res.message, {
        action: (
          <Button className='bg-primary' onClick={() => router.push('/cart')}>
            Go to Cart
          </Button>
        ),
      });
    });
  };

  // check if item is in cart
  const itemExist =
    cart && cart.items.find((x) => x.productId === item.productId);

  const handleRemoveFromCart = async () => {
    startTransition(async () => {
      const res = await RemoveItemFromCart(item.productId);

      if (!res.success) {
        toast(<ErrorToast res={res} />, {
          unstyled: true,
        });
        return;
      }

      toast.success(res.message);
    });
  };
  return itemExist ? (
    <div>
      <Button type='button' variant='outline' onClick={handleRemoveFromCart}>
        {isPending ? (
          <Loader className='w-4 h-4 animate-spin' />
        ) : (
          <Minus className='h-4 w-4' />
        )}
      </Button>
      <span className='px-2'>{itemExist.qty}</span>
      <Button type='button' variant='outline' onClick={handleAddToCart}>
        {isPending ? (
          <Loader className='w-4 h-4 animate-spin' />
        ) : (
          <Plus className='h-4 w-4' />
        )}
      </Button>
    </div>
  ) : (
    <Button className='w-full' type='button' onClick={handleAddToCart}>
      {isPending ? (
        <Loader className='w-4 h-4 animate-spin' />
      ) : (
        <Plus className='w-4 h-4' />
      )}{' '}
      Add to Cart
    </Button>
  );
};

export default AddToCart;
