'use server';

import { CartItem } from '@/types';
import { cookies } from 'next/headers';
import { convertToPlainObj, formatError, round2 } from '../utils';
import { auth } from '@/auth';
import { prisma } from '@/db/prisma';
import { cartItemSchema, insertCartSchema } from '../validators';
import { revalidatePath } from 'next/cache';

// calcuate cart prices
const calcPrice = (items: CartItem[]) => {
  const itemsPrice = round2(
    items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0)
  );
  const shippingPrice = round2(itemsPrice > 100 ? 0 : 10);
  const taxPrice = round2(0.15 * itemsPrice);
  const totalPrice = round2(itemsPrice + taxPrice + shippingPrice);

  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
  };
};

export async function addItemToCart(data: CartItem) {
  try {
    // check for sessionCartId cookie
    const sessionCartId = (await cookies()).get('sessionCartId')?.value;

    if (!sessionCartId) throw new Error('Cart session not found');

    // get session and user id
    const session = await auth();
    const userId = session?.user?.id ? (session.user.id as string) : undefined;

    // get cart
    const cart = await getMyCart();

    // parse and vaildate item
    const item = cartItemSchema.parse(data);

    // find product in db
    const product = await prisma.product.findFirst({
      where: { id: item.productId },
    });

    if (!product) throw new Error('Product not found');

    if (!cart) {
      // create a new cart
      const newCart = insertCartSchema.parse({
        userId: userId,
        items: [item],
        sessionCartId: sessionCartId,
        ...calcPrice([item]),
      });

      // add to db
      await prisma.cart.create({
        data: newCart,
      });

      // revalidate product page
      revalidatePath(`/product/${product.slug}`);

      return {
        success: true,
        message: `${product.name} added to cart`,
      };
    } else {
      // check if item is already in the cart
      const existItem = (cart.items as CartItem[]).find(
        (x) => x.productId === item.productId
      );

      if (existItem) {
        // check the stock
        if (product.stock < existItem.qty + 1) {
          throw new Error('Not enough stock');
        }
        // increate the qty
        (cart.items as CartItem[]).find(
          (x) => x.productId === product.id
        )!.qty = existItem.qty + 1;
      } else {
        // if item doesn't exist
        // check stock
        if (product.stock < 1) throw new Error('Not enough stock');

        // add item to the cart items
        cart.items.push(item);
      }

      // save cart to db
      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          items: cart.items,
          ...calcPrice(cart.items as CartItem[]),
        },
      });

      revalidatePath(`/product/${product.slug}`);

      return {
        success: true,
        message: `${product.name} ${
          existItem ? 'updated in' : 'added to'
        } cart`,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function getMyCart() {
  // check for sessionCartId cookie
  const sessionCartId = (await cookies()).get('sessionCartId')?.value;

  if (!sessionCartId) throw new Error('Cart session not found');

  // get session and user id
  const session = await auth();
  const userId = session?.user?.id ? (session.user.id as string) : undefined;

  // get user cart from db
  const cart = await prisma.cart.findFirst({
    where: userId ? { userId: userId } : { sessionCartId: sessionCartId },
  });

  if (!cart) return undefined;

  // convert decimals and return
  return convertToPlainObj({
    ...cart,
    items: cart.items as CartItem[],
    itemsPrice: cart.itemsPrice.toString(),
    totalPrice: cart.totalPrice.toString(),
    shippingPrice: cart.shippingPrice.toString(),
    taxPrice: cart.taxPrice.toString(),
  });
}

// remove items from the cart
export async function RemoveItemFromCart(productId: string) {
  try {
    // check for sessionCartId cookie
    const sessionCartId = (await cookies()).get('sessionCartId')?.value;

    if (!sessionCartId) throw new Error('Cart session not found');

    // get the product
    const product = await prisma.product.findFirst({
      where: { id: productId },
    });

    if (!product) throw new Error('Product not found');

    // get user cart
    const cart = await getMyCart();

    if (!cart) throw new Error('Cart not found');

    // check if the cart has item
    const itemExist = (cart.items as CartItem[]).find(
      (x) => x.productId === product.id
    );

    if (!itemExist) throw new Error('Item not found in cart');

    // check if 1 qty in cart
    if (itemExist.qty === 1) {
      // remove from cart
      cart.items = (cart.items as CartItem[]).filter(
        (x) => x.productId !== itemExist.productId
      );
    } else {
      // decrease the qty
      (cart.items as CartItem[]).find((x) => x.productId === productId)!.qty =
        itemExist.qty - 1;
    }

    // update cart in db
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: cart.items,
        ...calcPrice(cart.items as CartItem[]),
      },
    });

    revalidatePath(`/product/${product.slug}`);

    return {
      success: true,
      message: `${product.name} removed from cart`,
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
