import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart } from 'lucide-react';
import { CustomerSearch } from '../components/pos/CustomerSearch';
import { BarcodeScanner } from '../components/pos/BarcodeScanner';
import { CartItem } from '../components/pos/CartItem';
import { CartNotes } from '../components/pos/CartNotes';
import { DiscountSection } from '../components/pos/DiscountSection';
import { PaymentMethods, type PaymentMethod } from '../components/pos/PaymentMethods';
import { BranchPOSSelector } from '../components/pos/BranchPOSSelector';
import { useLanguageStore } from '../store/useLanguageStore';
import { useAuthStore } from '../store/useAuthStore';
import { useBusinessStore } from '../store/useBusinessStore';
import { getBranchesByBusinessCode } from '../services/businessService';
import { posTranslations } from '../translations/pos';
import { getAvailableProducts } from '../services/posService';
import type { CartItem as CartItemType, Customer, Discount } from '../types/pos';
import type { Product } from '../types/product';

export function POSPage() {
  const { language } = useLanguageStore();
  const { user } = useAuthStore();
  const { branches, setBranches } = useBusinessStore();
  const t = posTranslations[language];
  
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartNotes, setCartNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const loadBranches = async () => {
      if (user?.businessCode) {
        try {
          const branchData = await getBranchesByBusinessCode(user.businessCode);
          setBranches(branchData);
          setIsInitialLoad(false);
        } catch (error) {
          console.error('Error loading branches:', error);
          setError(t.errorLoadingBranches);
          setIsInitialLoad(false);
        }
      }
    };
    
    loadBranches();
  }, [user?.businessCode, setBranches]);

  useEffect(() => {
    // Only load products after initial branch load and when we have a selected branch
    if (!isInitialLoad && user?.businessCode && selectedBranchId) {
      loadProducts();
    }
  }, [user?.businessCode, selectedBranchId, isInitialLoad]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const selectedBranch = branches.find(b => b.branch_id === selectedBranchId);
      if (!selectedBranch) {
        throw new Error(t.invalidBranch);
      }

      const data = await getAvailableProducts(
        user!.businessCode,
        selectedBranchId === 'all' ? undefined : selectedBranch.branch_name
      );
      setProducts(data);
    } catch (err) {
      console.error('Error loading products:', err);
      setError(t.errorLoadingProducts);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScan = (barcode: string) => {
    const product = products.find(p => p.barcode === barcode);
    if (product) {
      addToCart({
        id: product.product_id.toString(),
        barcode: product.barcode || '',
        nameAr: product.product_name,
        type: product.type,
        price: product.price,
        quantity: 1,
        category: '',
        expiryDate: product.expiry_date || undefined
      });
    }
  };

  const addToCart = (product: CartItemType) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const updateCartItemQuantity = (id: string, quantity: number) => {
    setCart(prevCart =>
      quantity === 0
        ? prevCart.filter(item => item.id !== id)
        : prevCart.map(item =>
            item.id === id ? { ...item, quantity } : item
          )
    );
  };

  const updateCartItemNotes = (id: string, notes: string) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === id ? { ...item, notes } : item
      )
    );
  };

  const removeFromCart = (id: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const handleAddNewCustomer = (customerData: Omit<Customer, 'id'>) => {
    const newCustomer: Customer = {
      id: nextCustomerId.toString(),
      ...customerData
    };
    setNextCustomerId(prev => prev + 1);
    setSelectedCustomer(newCustomer);
  };

  const handleApplyDiscount = (discount: Discount) => {
    // Implement discount logic
    console.log('Applying discount:', discount);
  };

  const handleApplyCoupon = (code: string) => {
    // Implement coupon logic
    console.log('Applying coupon:', code);
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <div className="h-full flex" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Products Section */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white p-4 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-full">
              <BarcodeScanner onScan={handleScan} />
              <div className="mt-4">
                <BranchPOSSelector onBranchChange={setSelectedBranchId} />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchProduct}
                className="w-full pr-10 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {isLoading ? (
              <div className="col-span-full flex items-center justify-center py-8">
                <p className="text-gray-500">{t.loading}</p>
              </div>
            ) : error ? (
              <div className="col-span-full flex items-center justify-center py-8 text-center">
                <p className="text-red-500">{error}</p>
                <button
                  onClick={loadProducts}
                  className="mt-2 text-indigo-600 hover:text-indigo-800"
                >
                  {t.retry}
                </button>
              </div>
            ) : products
              .filter(product => 
                product.product_name.includes(searchQuery) ||
                (product.barcode && product.barcode.includes(searchQuery))
              )
              .map((product) => (
                <div
                  key={product.product_id}
                  onClick={() => addToCart({
                    id: product.product_id.toString(),
                    barcode: product.barcode || '',
                    nameAr: product.product_name,
                    type: product.type,
                    price: product.price,
                    quantity: 1,
                    category: '',
                    expiryDate: product.expiry_date || undefined
                  })}
                  className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="aspect-square bg-gray-100 rounded-md mb-3">
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.product_name}
                        className="w-full h-full object-cover rounded-md"
                      />
                    )}
                  </div>
                  <h3 className="font-medium">{product.product_name}</h3>
                  <p className="text-sm text-gray-500">
                    {product.type === 'food' ? t.food : t.product}
                    {product.business_name_of_product && (
                      <span className="mr-1 text-xs text-indigo-600">
                        ({product.business_name_of_product})
                      </span>
                    )}
                  </p>
                  {product.type === 'food' && product.expiry_date && (
                    <p className="text-xs text-gray-500 mt-1">
                      {t.expiryDate}: {new Date(product.expiry_date).toLocaleDateString()}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    {t.inStock}: {product.quantity}
                  </p>
                  {product.business_code_if_vendor && (
                    <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                      {t.vendorProduct}
                    </div>
                  )}
                  <p className="text-indigo-600 font-bold mt-1">
                    {product.price.toFixed(2)} {t.currency}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2 space-x-reverse">
            <div className="flex items-center flex-1">
              <ShoppingCart className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-semibold mr-2">{t.cart}</h2>
            </div>
            {selectedCustomer && (
              <div className="text-sm text-gray-600">
                {selectedCustomer.name}
              </div>
            )}
          </div>
        </div>

        <CustomerSearch
          onCustomerSelect={setSelectedCustomer}
          onAddNewCustomer={handleAddNewCustomer}
        />

        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <p className="text-gray-500 text-center py-8">{t.noItems}</p>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateCartItemQuantity}
                  onUpdateNotes={updateCartItemNotes}
                  onRemove={removeFromCart}
                />
              ))}
            </div>
          )}
        </div>

        <DiscountSection
          onApplyDiscount={handleApplyDiscount}
          onApplyCoupon={handleApplyCoupon}
        />
        
        <PaymentMethods
          selectedMethod={paymentMethod}
          onMethodChange={setPaymentMethod}
        />
        
        <CartNotes
          notes={cartNotes}
          onNotesChange={setCartNotes}
        />

        <div className="border-t p-4 space-y-4">
          <div className="flex justify-between text-lg font-semibold">
            <span>{t.total}:</span>
            <span>{calculateTotal().toFixed(2)} {t.currency}</span>
          </div>
          <button
            disabled={cart.length === 0}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {t.checkout}
          </button>
        </div>
      </div>
    </div>
  );
}

// Mock data - replace with actual API calls
const mockProducts: CartItemType[] = [
  {
    id: '1',
    barcode: '123456789',
    nameAr: 'تفاح أحمر',
    type: 'food',
    price: 2.99,
    quantity: 100,
    category: 'فواكه',
    expiryDate: '2024-03-20',
    preparationDate: '2024-03-01'
  },
  {
    id: '2',
    barcode: '987654321',
    nameAr: 'عصير برتقال',
    type: 'food',
    price: 1.99,
    quantity: 50,
    category: 'مشروبات',
    expiryDate: '2024-03-15',
    preparationDate: '2024-03-01'
  },
  {
    id: '3',
    barcode: '456789123',
    nameAr: 'منظف متعدد الأغراض',
    type: 'non-food',
    price: 4.99,
    quantity: 30,
    category: 'منظفات'
  }
];