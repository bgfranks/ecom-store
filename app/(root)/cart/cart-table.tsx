'use client';
import { Cart, CartItem } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTransition } from 'react';
import { addItemToCart, RemoveItemFromCart } from '@/lib/actions/cart.actions';
import { ArrowRight, Loader, Minus, Plus } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ErrorToast from '@/components/ui/error-toast';

const CartTable = ({ cart }: { cart?: Cart }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRemoveFromCart = async (item: CartItem) => {
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

  const handleAddItemToCart = async (item: CartItem) => {
    startTransition(async () => {
      const res = await addItemToCart(item);

      if (!res.success) {
        toast(<ErrorToast res={res} />, { unstyled: true });
        return;
      }

      toast.success(res.message);
    });
  };

  return (
    <>
      <h1 className='py-4 h2-bold'>Shopping Cart</h1>
      {!cart || cart.items.length === 0 ? (
        <div>
          Cart is empty. <Link href='/'>Go Shopping</Link>
        </div>
      ) : (
        <div className='grid md:grid-cols-4 md:gap-5'>
          <div className='overflow-x-auto md:col-span-3'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className='text-center'>Quantity</TableHead>
                  <TableHead className='text-right'>Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.items.map((item) => (
                  <TableRow key={item.slug}>
                    <TableCell>
                      <Link
                        href={`/product/${item.slug}`}
                        className='flex items-center'
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={50}
                          height={50}
                        />
                        <span className='px-2'>{item.name}</span>
                      </Link>
                    </TableCell>
                    <TableCell className='flex-center gap-2 pt-4'>
                      <Button
                        disabled={isPending}
                        variant='outline'
                        type='button'
                        onClick={() => handleRemoveFromCart(item)}
                      >
                        {isPending ? (
                          <Loader className='h-2 w-2 animate-spin' />
                        ) : (
                          <Minus className='w-2 h-2' />
                        )}
                      </Button>
                      <span>{item.qty}</span>
                      <Button
                        disabled={isPending}
                        variant='outline'
                        type='button'
                        onClick={() => handleAddItemToCart(item)}
                      >
                        {isPending ? (
                          <Loader className='h-4 w-4 animate-spin' />
                        ) : (
                          <Plus className='w-4 h-4' />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className='text-right'>
                      {formatCurrency(Number(item.price) * item.qty)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Card className='max-h-[160px]'>
            <CardContent className='p-4 gap-4'>
              <div className='pb-3 text-xl'>
                Subtotal ({cart.items.reduce((a, c) => a + c.qty, 0)}):{' '}
                <span className='font-bold'>
                  {formatCurrency(cart.itemsPrice)}
                </span>
              </div>
              <Button
                className='w-full'
                disabled={isPending}
                onClick={() =>
                  startTransition(() => router.push('/shipping-address'))
                }
              >
                Go to Checkout
                {isPending ? (
                  <Loader className='w-4 h-4 animate-spin' />
                ) : (
                  <ArrowRight className='w-4 h-4' />
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default CartTable;
