'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { addMonths } from 'date-fns';
import { CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Office = {
  id: string;
  name: string;
};

interface PaymentFormErrors {
  cardHolder?: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
}

const plans = [
  {
    name: 'الخطة الأساسية',
    price: 'مجانية',
    features: ['بحث عن راتب موظف', 'بحث عن ترقية', ''],
  },
  {
    name: 'الخطة الاحترافية',
    price: '20000 د.ع / شهر',
    features: ['إدارة الرواتب', 'طباعة التقارير', 'إدارة الترقيات'],
    popular: true,
  },
  {
    name: 'الخطة المؤسسية',
    price: '30000 د.ع / شهر',
    features: ['كل الميزات الاحترافية', 'دعم فني', 'إدارة متعددة المستخدمين'],
  },
];

export default function PricingPlanPage() {
  const supabase = createClient();

  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [form, setForm] = useState({
    name: '',
    address: '',
    email: '',
    phone_number: '',
    parent_id: '',
  });
  const [paymentForm, setPaymentForm] = useState({
    cardHolder: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });
  const [offices, setOffices] = useState<Office[]>([]);
  const [parentName, setParentName] = useState('');
  const [status, setStatus] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<PaymentFormErrors>({});

  // Fetch offices
  useEffect(() => {
    const fetchOffices = async () => {
      const { data } = await supabase.from('offices').select('id, name');
      if (data) setOffices(data);
    };
    fetchOffices();
  }, [supabase]);

  // Parent name
  useEffect(() => {
    const fetchParentName = async () => {
      if (!form.parent_id) {
        setParentName('');
        return;
      }
      const { data } = await supabase
        .from('offices')
        .select('name')
        .eq('id', form.parent_id)
        .single();
      setParentName(data ? `✅ الدائرة الأم: ${data.name}` : '❌ لم يتم العثور على دائرة بهذا المعرف');
    };
    fetchParentName();
  }, [form.parent_id, supabase]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'cardNumber') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 16);
      const formatted = digitsOnly.match(/.{1,4}/g)?.join('-') || '';
      setPaymentForm((prev) => ({ ...prev, cardNumber: formatted }));

      if (formatted.length === 19) {
        if (!validateLuhn(digitsOnly)) {
          setErrors((prev) => ({ ...prev, cardNumber: 'رقم البطاقة غير صالح (فشل فحص Luhn)' }));
        } else {
          setErrors((prev) => ({ ...prev, cardNumber: undefined }));
        }
      } else {
        setErrors((prev) => ({
          ...prev,
          cardNumber: 'رقم البطاقة يجب أن يتكون من 16 رقمًا بالتنسيق 1234-5678-9012-3456',
        }));
      }
    } else if (name === 'expiryDate') {
      const cleaned = value.replace(/[^\d]/g, '').slice(0, 4);
      let formatted = cleaned;
      if (cleaned.length >= 3) {
        formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
      }
      setPaymentForm((prev) => ({ ...prev, expiryDate: formatted }));

      const monthPart = parseInt(cleaned.slice(0, 2), 10);
      const yearPart = parseInt(cleaned.slice(2), 10);
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear() % 100;

      if (monthPart < 1 || monthPart > 12) {
        setErrors((prev) => ({ ...prev, expiryDate: 'الشهر يجب أن يكون من 01 إلى 12' }));
      } else if (
        cleaned.length === 4 &&
        (yearPart < currentYear || (yearPart === currentYear && monthPart < currentMonth))
      ) {
        setErrors((prev) => ({ ...prev, expiryDate: 'تاريخ الانتهاء لا يمكن أن يكون في الماضي' }));
      } else {
        setErrors((prev) => ({ ...prev, expiryDate: undefined }));
      }
    } else if (name === 'cvv') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 3);
      setPaymentForm((prev) => ({ ...prev, cvv: digitsOnly }));
      setErrors((prev) => ({
        ...prev,
        cvv: digitsOnly.length !== 3 ? 'الرمز السري (CVV) يجب أن يكون مكونًا من 3 أرقام' : undefined,
      }));
    } else {
      setPaymentForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  function validateLuhn(cardNumber: string): boolean {
    const digits = cardNumber.replace(/\D/g, '');
    let sum = 0;
    let shouldDouble = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits.charAt(i), 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
  }

  const handleSubscribe = (planName: string) => {
    if (planName === 'الخطة الأساسية') {
      window.location.href = '/sign-up';
    } else {
      setSelectedPlan(planName);
      setShowRegistrationModal(true);
      setStatus('');
      setSuccessMessage('');
      setForm({
        name: '',
        address: '',
        email: '',
        phone_number: '',
        parent_id: '',
      });
      setPaymentForm({
        cardHolder: '',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
      });
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setStatus('يرجى إدخال اسم الدائرة');
      return;
    }

    if (
      !paymentForm.cardHolder.trim() ||
      !paymentForm.cardNumber.trim() ||
      !paymentForm.expiryDate.trim() ||
      !paymentForm.cvv.trim()
    ) {
      setStatus('يرجى إدخال جميع معلومات الدفع');
      return;
    }

    setStatus('جاري معالجة الاشتراك...');
    setIsSubmitting(true);

    const { data: insertedOffice, error: insertError } = await supabase
      .from('offices')
      .insert({
        name: form.name.trim(),
        address: form.address.trim() || null,
        email: form.email.trim() || null,
        phone_number: form.phone_number.trim() || null,
        parent_id: form.parent_id || null,
      })
      .select()
      .single();

    if (insertError) {
      setStatus('❌ حدث خطأ أثناء إضافة الدائرة: ' + insertError.message);
      setIsSubmitting(false);
      return;
    }

    // Simulate payment
    await new Promise((res) => setTimeout(res, 1500));

    // Insert subscription info into office_activities
    const { error: activityError } = await supabase.from('office_activities').insert({
      office_id: insertedOffice.id,
      subscription_plan: selectedPlan,
      subscription_start: new Date(),
      subscription_end: addMonths(new Date(), 1),
    });

    if (activityError) {
      setStatus('❌ تم تسجيل الدائرة ولكن فشل تسجيل الاشتراك: ' + activityError.message);
      setIsSubmitting(false);
      return;
    }

    setStatus('');
    setSuccessMessage('✅ تمت عملية الدفع بنجاح! تم إرسال رسالة تأكيد إلى بريدك الإلكتروني.');

    setTimeout(() => {
      setShowRegistrationModal(false);
      setForm({
        name: '',
        address: '',
        email: '',
        phone_number: '',
        parent_id: '',
      });
      setPaymentForm({
        cardHolder: '',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
      });
      setStatus('');
      setSuccessMessage('');
      setIsSubmitting(false);
    }, 2500);
  };

  // ... UI rendering goes here ...
  return (
    <div className="rtl text-right p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">اختر خطة الاشتراك</h1>
  
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`border rounded-2xl p-6 shadow-md flex flex-col justify-between ${
              plan.popular ? 'border-blue-500 bg-blue-50' : 'bg-white'
            }`}
          >
            {plan.popular && (
              <div className="text-sm text-white bg-blue-500 w-fit px-3 py-1 rounded-full mb-2">
                الأكثر شيوعاً
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold mb-2">{plan.name}</h2>
              <p className="text-lg font-bold mb-4">{plan.price}</p>
              <ul className="mb-6 space-y-2">
                {plan.features.map((feature, idx) =>
                  feature ? (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>{feature}</span>
                    </li>
                  ) : null
                )}
              </ul>
            </div>
            <button
              className="mt-auto bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              onClick={() => handleSubscribe(plan.name)}
            >
              اشترك الآن
            </button>
          </div>
        ))}
      </div>
  
      {/* Registration Modal */}
      <AnimatePresence>
        {showRegistrationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white p-6 rounded-2xl max-w-xl w-full"
            >
              <h2 className="text-xl font-bold mb-4">تسجيل معلومات الدائرة</h2>
              <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6 text-right">
  {/* Right Side: Office Info */}
  <div>
    <h3 className="text-lg font-semibold mb-4">معلومات الدائرة</h3>
    <input
      type="text"
      name="name"
      placeholder="اسم الدائرة"
      value={form.name}
      onChange={handleChange}
      className="w-full border rounded px-3 py-2 mb-3"
    />
    <input
      type="text"
      name="address"
      placeholder="العنوان "
      value={form.address}
      onChange={handleChange}
      className="w-full border rounded px-3 py-2 mb-3"
    />
    <input
      type="email"
      name="email"
      placeholder="البريد الإلكتروني "
      value={form.email}
      onChange={handleChange}
      className="w-full border rounded px-3 py-2 mb-3"
    />
<input
  type="text"
  name="phone_number"
  placeholder="رقم الهاتف"
  value={form.phone_number}
  onChange={(e) => {
    // سماح فقط بالأرقام، وتقييد الطول بـ 11 رقم
    const value = e.target.value.replace(/\D/g, '').slice(0, 11)
    handleChange({ target: { name: 'phone_number', value } })
  }}
  className="w-full border rounded px-3 py-2 mb-3"
/>

    <select
      name="parent_id"
      value={form.parent_id}
      onChange={handleChange}
      className="w-full border rounded px-3 py-2 mb-3"
    >
      <option value="">اختر الدائرة الأم (اختياري)</option>
      {offices.map((office) => (
        <option key={office.id} value={office.id}>
          {office.name}
        </option>
      ))}
    </select>
    {parentName && (
      <p className="text-sm text-gray-600">{parentName}</p>
    )}
  </div>

  {/* Left Side: Payment Info */}
  <div>
    <h3 className="text-lg font-semibold mb-4">معلومات البطاقة</h3>
    <input
      type="text"
      name="cardHolder"
      placeholder="اسم حامل البطاقة"
      value={paymentForm.cardHolder}
      onChange={handlePaymentChange}
      className="w-full border rounded px-3 py-2 mb-3"
    />
    <input
      type="text"
      name="cardNumber"
      placeholder="رقم البطاقة (1234-5678-9012-3456)"
      value={paymentForm.cardNumber}
      onChange={handlePaymentChange}
      className="w-full border rounded px-3 py-2 mb-1"
    />
    {errors.cardNumber && (
      <p className="text-sm text-red-600">{errors.cardNumber}</p>
    )}
    <div className="flex gap-4 mt-3">
      <input
        type="text"
        name="expiryDate"
        placeholder="MM/YY"
        value={paymentForm.expiryDate}
        onChange={handlePaymentChange}
        className="w-1/2 border rounded px-3 py-2"
      />
      <input
        type="text"
        name="cvv"
        placeholder="CVV"
        value={paymentForm.cvv}
        onChange={handlePaymentChange}
        className="w-1/2 border rounded px-3 py-2"
      />
    </div>
    {errors.expiryDate && (
      <p className="text-sm text-red-600 mt-1">{errors.expiryDate}</p>
    )}
    {errors.cvv && (
      <p className="text-sm text-red-600 mt-1">{errors.cvv}</p>
    )}

    {status && <p className="text-yellow-700 mt-3">{status}</p>}
    {successMessage && (
      <p className="text-green-700 mt-3">{successMessage}</p>
    )}
  </div>

  {/* Submit Buttons - Full width below both columns */}
  <div className="col-span-2 flex justify-between mt-6">
    <button
      type="button"
      className="px-4 py-2 bg-gray-400 text-white rounded"
      onClick={() => setShowRegistrationModal(false)}
      disabled={isSubmitting}
    >
      إلغاء
    </button>
    <button
      type="submit"
      className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      disabled={isSubmitting}
    >
      {isSubmitting ? 'جارٍ المعالجة...' : 'إكمال الاشتراك'}
    </button>
  </div>
</form>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}  