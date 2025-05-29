'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { sub } from 'date-fns';

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
    features: [ ' بحث عن راتب موظف  ', 'بحث عن ترقية', '' ],
  },
  {
    name: 'الخطة الاحترافية',
    price: '20000 د.ع / شهر',
    features: ['إدارة الرواتب', ' طباعة التقارير', 'إدارة الترقيات'],
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
    subscription_start: '',
    subscription_end: '',
    auto_renew: false,
    stripe_subscription_id: '',
    subscription_expires_at: '',
    stripe_customer_id: '',
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

  // Fetch offices for the parent dropdown
  useEffect(() => {
    const fetchOffices = async () => {
      const { data } = await supabase.from('offices').select('id, name');
      if (data) setOffices(data);
    };
    fetchOffices();
  }, [supabase]);

  // Fetch parent office name whenever parent_id changes
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
      setParentName(
        data
          ? `✅ الدائرة الأم: ${data.name}`
          : '❌ لم يتم العثور على دائرة بهذا المعرف'
      );
    };
    fetchParentName();
  }, [form.parent_id, supabase]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  function handlePaymentChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
  
    if (name === 'cardNumber') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 16);
      const formatted = digitsOnly.match(/.{1,4}/g)?.join('-') || '';
      setPaymentForm((prev) => ({ ...prev, cardNumber: formatted }));
    } else if (name === 'expiryDate') {
      const cleaned = value.replace(/[^\d]/g, '').slice(0, 4);
      let formatted = cleaned;
  
      if (cleaned.length >= 3) {
        formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
      }
  
      setPaymentForm((prev) => ({ ...prev, expiryDate: formatted }));
  
      // Validate month part
      const monthPart = parseInt(cleaned.slice(0, 2), 10);
      if (monthPart > 12) {
        setErrors((prev) => ({ ...prev, expiryDate: 'الشهر يجب أن يكون من 01 إلى 12' }));
      } else {
        setErrors((prev) => ({ ...prev, expiryDate: undefined }));
      }
    } else {
      setPaymentForm((prev) => ({ ...prev, [name]: value }));
    }
  }
  

  // When user selects a plan
  const handleSubscribe = (planName: string) => {
    if (planName === 'الخطة الأساسية') {
      // Basic plan just redirects to sign-up page
      window.location.href = '/sign-up';
    } else {
      // For paid plans, open modal for office + payment info
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
        subscription_start: '',
        subscription_end: '',
        auto_renew: false,
        stripe_subscription_id: '',
        subscription_expires_at: '',
        stripe_customer_id: '',
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

  // Form submission handler

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

    // Insert office data first
    const { data: insertedOffice, error: insertError } = await supabase
      .from('offices')
      .insert({
        name: form.name.trim(),
        address: form.address.trim() || null,
        email: form.email.trim() || null,
        phone_number: form.phone_number.trim() || null,
        parent_id: form.parent_id || null,
        subscription_start: new Date().toISOString(),
        subscription_end: null,
        auto_renew: form.auto_renew,
        stripe_subscription_id: form.stripe_subscription_id || null,
        subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),

      })
      .select()
      .single();

    if (insertError) {
      setStatus('❌ حدث خطأ أثناء إضافة الدائرة: ' + insertError.message);
      setIsSubmitting(false);
      return;
    }

    // Simulate payment processing (replace with real payment integration)
    await new Promise((res) => setTimeout(res, 1500));

    setStatus('');
    setSuccessMessage(
      '✅ تمت عملية الدفع بنجاح! تم إرسال رسالة تأكيد إلى بريدك الإلكتروني.'
    );

    setTimeout(() => {
      setShowRegistrationModal(false);
      setForm({
        name: '',
        address: '',
        email: '',
        phone_number: '',
        parent_id: '',
        subscription_start: '',
        subscription_end: '',
        auto_renew: false,
        stripe_customer_id: '',
        stripe_subscription_id: '',
        subscription_expires_at: '',
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-16 px-4 text-right" dir="rtl">
      <h2 className="text-4xl font-bold text-center text-blue-800 mb-12">اختر خطتك</h2>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {plans.map((plan, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.03 }}
            className={`relative rounded-xl p-6 border shadow-sm bg-white transition-all duration-300 hover:bg-blue-50 ${
              plan.popular ? 'border-blue-600' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs px-3 py-1 rounded-bl-xl">
                الأكثر شيوعًا
              </div>
            )}
            <h3 className="text-2xl font-bold text-blue-800 mb-4">{plan.name}</h3>
            <p className="text-xl text-gray-700 mb-4">{plan.price}</p>
            <ul className="space-y-2 text-gray-600">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle className="text-green-500 w-5 h-5" />
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscribe(plan.name)}
              className="mt-6 w-full py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              aria-label={`اشترك في ${plan.name}`}
            >
              اشترك الآن
            </button>
          </motion.div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto mt-20">
        <h3 className="text-3xl font-bold text-blue-800 mb-6">الأسئلة الشائعة</h3>
        <div className="space-y-4">
          {[
            ['هل يمكنني ترقية خطتي لاحقًا؟', 'نعم، يمكنك الترقية أو التغيير في أي وقت.'],
            ['هل هناك فترة تجريبية؟', 'الخطة الأساسية مجانية ويمكنك تجربتها دون التزام.'],
            ['ما هي طرق الدفع المتاحة؟', 'ندعم الدفع عبر البطاقات الإلكترونية والمصارف المحلية.'],
          ].map(([q, a], i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg shadow p-4 border"
              tabIndex={0}
            >
              <h4 className="font-bold text-blue-700 mb-2">{q}</h4>
              <p className="text-gray-700">{a}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Registration Modal */}
            <AnimatePresence>
              {showRegistrationModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                  aria-modal="true"
                  role="dialog"
                  aria-labelledby="modal-title"
                  aria-describedby="modal-description"
                  style={{ overflowY: 'auto' }} // Allow scrolling if modal is tall
                  dir="rtl"
                >
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-8 relative text-right"
                    style={{ maxHeight: '90vh', overflowY: 'auto' }} // Scroll if content overflows
                    dir="rtl"
                  >
                    <h3
                      id="modal-title"
                      className="text-2xl font-bold mb-6 text-blue-700"
                    >
                      الاشتراك في: {selectedPlan}
                    </h3>

                    {/*Registration Form Model*/}

                  <div className="max-w-8xl mx-auto px-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="flex flex-col md:flex-row gap-8">
                          {/* Right Side - Office Info */}
                          <div className="md:w-1/2 space-y-4" dir="rtl">
                            <h4 className="text-xl font-semibold text-blue-700 mb-2">معلومات الدائرة</h4>

                            <div>
                              <label htmlFor="name" className="block font-semibold mb-1">
                                اسم الدائرة <span className="text-red-600">*</span>
                              </label>
                              <input
                                id="name"
                                name="name"
                                type="text"
                                className="w-full border rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={form.name}
                                onChange={handleChange}
                                autoComplete="organization"
                                required
                              />
                            </div>

                            <div>
                              <label htmlFor="address" className="block font-semibold mb-1">
                                عنوان الدائرة <span className="text-red-600">*</span>
                              </label>
                              <input
                                id="address"
                                name="address"
                                type="text"
                                className="w-full border rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={form.address}
                                onChange={handleChange}
                                autoComplete="street-address"
                              />
                            </div>

                            <div>
                              <label htmlFor="email" className="block font-semibold mb-1">
                                البريد الإلكتروني <span className="text-red-600">*</span>
                              </label>
                              <input
                                id="email"
                                name="email"
                                type="email"
                                dir="ltr"
                                className="w-full border rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={form.email}
                                onChange={handleChange}
                                autoComplete="email"
                                required
                              />
                            </div>

                            <div>
                              <label htmlFor="phone_number" className="block font-semibold mb-1">
                                رقم الهاتف <span className="text-red-600">*</span>
                              </label>
                              <input
                                id="phone_number"
                                name="phone_number"
                                type="tel"
                                dir="ltr"
                                className="w-full border rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={form.phone_number}
                                maxLength={11}
                                onChange={handleChange}
                                autoComplete="tel"
                                required
                              />
                            </div>

                            <div>
                              <label htmlFor="parent_id" className="block font-semibold mb-1">
                                الدائرة الأم (اختياري)
                              </label>
                              <select
                                id="parent_id"
                                name="parent_id"
                                className="w-full border rounded px-3 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={form.parent_id}
                                onChange={handleChange}
                              >
                                <option value="">-- اختر دائرة أم --</option>
                                {offices.map((office) => (
                                  <option key={office.id} value={office.id}>
                                    {office.name}
                                  </option>
                                ))}
                              </select>
                              {parentName && (
                                <p
                                  className={`mt-1 text-sm ${
                                    parentName.startsWith('✅')
                                      ? 'text-green-600'
                                      : parentName.startsWith('❌')
                                      ? 'text-red-600'
                                      : ''
                                  }`}
                                  aria-live="polite"
                                >
                                  {parentName}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Left Side - Payment Info */}
                          <div className="md:w-1/2 space-y-4" dir="rtl">
                            <h4 className="text-xl font-semibold text-blue-700 mb-2">
                              معلومات الدفع
                            </h4>

                            <div>
                              <label htmlFor="cardHolder" className="block font-semibold mb-1">
                                اسم حامل البطاقة <span className="text-red-600">*</span>
                              </label>
                              <input
                                id="cardHolder"
                                name="cardHolder"
                                type="text"
                                dir="ltr"
                                className="w-full border rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={paymentForm.cardHolder}
                                onChange={handlePaymentChange}
                                required
                                autoComplete="cc-name"
                              />
                            </div>

                            <div>
                              <label className="block mb-1 font-medium">رقم البطاقة (16 رقم)</label>
                              <input
                                type="text"
                                name="cardNumber"
                                inputMode="numeric"
                                value={paymentForm.cardNumber}
                                onChange={handlePaymentChange}
                                placeholder="1234-5678-9012-3456"
                                maxLength={19}
                                className={`w-full border px-4 py-1 rounded ${
                                  errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                                }`}
                              />
                              {errors.cardNumber && (
                                <p className="text-red-600 text-sm mt-1">{errors.cardNumber}</p>
                              )}
                            </div>

                            <div>
                              <label className="block mb-1 font-medium">تاريخ الانتهاء (MM/YY)</label>
                              <input
                                type="text"
                                name="expiryDate"
                                inputMode="numeric"
                                value={paymentForm.expiryDate}
                                onChange={handlePaymentChange}
                                placeholder="MM/YY"
                                maxLength={5}
                                className={`w-full border px-4 py-1 rounded ${
                                  errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                                }`}
                              />
                              {errors.expiryDate && (
                                <p className="text-red-600 text-sm mt-1">{errors.expiryDate}</p>
                              )}
                            </div>

                            <div>
                              <label className="block mb-1 font-medium">رمز CVV (3 أرقام)</label>
                              <input
                                type="text"
                                name="cvv"
                                inputMode="numeric"
                                value={paymentForm.cvv}
                                onChange={handlePaymentChange}
                                placeholder="CVV"
                                maxLength={3}
                                className={`w-full border px-4 py-1 rounded ${
                                  errors.cvv ? 'border-red-500' : 'border-gray-300'
                                }`}
                              />
                              {errors.cvv && (
                                <p className="text-red-600 text-sm mt-1">{errors.cvv}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        {/* Submit Buttons */}
                        <div className="mt-8 flex justify-between items-center">
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="py-1 px-5 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
                          >
                            {isSubmitting ? 'جاري الاشتراك...' : 'اشترك الآن'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowRegistrationModal(false)}
                          className="py-1 px-5 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
                          >
                            إلغاء
                          </button>
                        </div>
                        {/* Status and success messages */}
                        {status && (
                          <p
                            className="text-red-600 mt-3 font-semibold"
                            role="alert"
                            aria-live="assertive"
                          >
                            {status}
                          </p>
                        )}
                        {successMessage && (
                          <p
                            className="text-green-600 mt-3 font-semibold"
                            role="alert"
                            aria-live="polite"
                          >
                            {successMessage}
                          </p>
                        )}
                      </form>
                    </div>
                    {/* Notes section at bottom */}
                    <div
                      className="mt-8 p-4 border-t border-gray-300 text-sm text-gray-700 bg-blue-50 rounded"
                      dir="rtl"
                      aria-label="ملاحظات"
                    >
                      <h5 className="font-bold mb-2 text-blue-700">ملاحظة:</h5>
                      <ul className="list-disc list-inside space-y-1">
                        <li>يرجى التأكد من صحة بيانات الدائرة ومعلومات الدفع.</li>
                        <li>جميع المدفوعات تتم عبر بوابة آمنة ومشفرة.</li>
                        <li>
                          في حال وجود أي مشكلة أو استفسار، يرجى التواصل مع الدعم الفني عبر البريد الإلكتروني.
                        </li>
                      </ul>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>;
    </div>
  );
}
